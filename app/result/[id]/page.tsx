'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, RotateCcw, Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';
import { QuizResult, StoredExam, AppUser } from '@/lib/types';
import { getResults, getExamById } from '@/lib/storage';
import { getCurrentUser, initAuth, logoutUser } from '@/lib/auth';
import QuestionCard from '@/components/QuestionCard';
import PassageCard from '@/components/PassageCard';
import MainLayout from '@/components/MainLayout';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const [result, setResult]         = useState<QuizResult | null>(null);
  const [exam, setExam]             = useState<StoredExam | null>(null);
  const [user, setUser]             = useState<AppUser | null>(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    initAuth();
    const u = getCurrentUser(); if (!u) { router.push('/'); return; } setUser(u);
    const r = getResults().find(x => x.id === id);
    if (!r || (u.role !== 'admin' && r.userId !== u.id)) { router.push('/'); return; }
    setResult(r);
    const e = getExamById(r.examId); if (e) setExam(e);
  }, [id, router]);

  const handleLogout = () => { logoutUser(); router.push('/'); };

  if (!result || !user) return (
    <MainLayout user={null} onLogout={() => {}}>
      <div className="flex-1 flex items-center justify-center"><LoadingSpinner size={40} text="Đang tải..." /></div>
    </MainLayout>
  );

  const pct    = Math.round((result.correctCount / result.totalQuestions) * 100);
  const passed = pct >= 60;
  const color  = passed ? '#f59e0b' : '#ef4444';
  const shadow = passed ? 'rgba(245,158,11,0.7)' : 'rgba(239,68,68,0.7)';
  const circum = 2 * Math.PI * 50;
  const fmtTime = (s: number) => {
    const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;
    return h>0?`${h}h ${m}m ${sec}s`:m>0?`${m}m ${sec}s`:`${sec}s`;
  };
  const passageStartIdx: Record<string, number> = {};
  if (exam) { let idx = exam.data.questions.length + 1; (exam.data.passages||[]).forEach(pg=>{passageStartIdx[pg.id]=idx;idx+=pg.questions.length;}); }

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <header className="app-header sticky top-0 z-30 px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <div className="md:hidden w-8" /><Trophy size={18} /><span className="gold-glow font-cinzel">Kết Quả</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/"><button className="text-purple-400 hover:text-amber-400 transition text-sm flex items-center gap-1 font-noto" style={{minHeight:'44px'}}><Home size={14}/> Trang chủ</button></Link>
          {exam && <Link href={`/quiz/${result.examId}`}><button className="text-purple-400 hover:text-teal-400 transition text-sm flex items-center gap-1 font-noto" style={{minHeight:'44px'}}><RotateCcw size={14}/> Làm lại</button></Link>}
        </div>
      </header>

      <div className="px-4 md:px-6 py-6">
        <div className="mystical-card corner-decor p-6 md:p-8 mb-6 text-center">
          <p className="text-purple-400 text-sm mb-1 font-noto">{result.examTitle}</p>
          <p className="text-teal-400/60 text-xs mb-4 font-noto">{result.subject}</p>
          <div className="relative w-36 h-36 mx-auto mb-4">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(59,42,109,0.3)" strokeWidth="10" />
              <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="10"
                strokeDasharray={`${circum}`} strokeDashoffset={`${circum*(1-pct/100)}`} strokeLinecap="round"
                style={{filter:`drop-shadow(0 0 8px ${shadow})`,transition:'stroke-dashoffset 1s ease'}} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold font-cinzel" style={{color,textShadow:`0 0 14px ${shadow}`}}>{pct}%</span>
            </div>
          </div>
          <div className="text-2xl font-bold mb-2 font-cinzel">
            <span className="text-amber-400">{result.correctCount}</span>
            <span className="text-purple-500"> / {result.totalQuestions}</span>
            <span className="text-purple-400 text-sm font-normal ml-2 font-noto">câu đúng</span>
          </div>
          <span className={`inline-block px-5 py-1.5 rounded-full text-sm font-bold font-cinzel ${passed?'bg-amber-900/40 text-amber-300 border border-amber-700/50':'bg-red-900/40 text-red-300 border border-red-700/50'}`}>
            {passed ? '⚔ Thông qua' : '✗ Chưa đạt'}
          </span>
          <div className="flex items-center justify-center gap-1 mt-3 text-purple-500 text-sm font-noto">
            <Clock size={13}/><span>Thời gian: {fmtTime(result.timeTaken)}</span>
          </div>
        </div>

        <div className="mystical-card p-5 mb-6">
          <h3 className="text-amber-400 font-semibold mb-4 font-cinzel">📊 Kết Quả Theo Phần</h3>
          <div className="space-y-3">
            {result.sectionResults.map(sr => {
              const sp = sr.total>0?Math.round((sr.correct/sr.total)*100):0;
              return (
                <div key={sr.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-purple-300 font-noto">{sr.name}</span>
                    <span className="text-amber-400 font-bold font-cinzel">{sr.correct}/{sr.total}<span className="text-purple-500 font-normal ml-1 font-noto">({sp}%)</span></span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{background:'rgba(59,42,109,0.3)'}}>
                    <div className="h-full rounded-full transition-all" style={{width:`${sp}%`,background:sp>=60?'linear-gradient(90deg,#92400e,#f59e0b)':'linear-gradient(90deg,#7f1d1d,#ef4444)'}} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {exam && (
          <div>
            <button className="btn-gold w-full mb-4 flex items-center justify-center gap-2 font-cinzel"
              onClick={() => setShowReview(v => !v)}>
              {showReview ? '▲ Ẩn xem lại' : '▼ Xem lại đáp án'}
            </button>
            {showReview && (
              <div>
                {exam.data.questions.map((q, idx) => {
                  const ua = result.answers[q.id] || [];
                  const ok = ua.length===q.answers.length&&ua.every(a=>q.answers.includes(a));
                  return (
                    <div key={q.id} className="relative">
                      <div className="absolute -left-1 top-6 z-10">{ok?<CheckCircle size={16} className="text-green-400"/>:<XCircle size={16} className="text-red-400"/>}</div>
                      <div className="ml-5"><QuestionCard question={q} index={idx+1} selected={ua} onChange={()=>{}} showResult={true}/></div>
                    </div>
                  );
                })}
                {(exam.data.passages||[]).map(pg=>(
                  <PassageCard key={pg.id} passage={pg} startIndex={passageStartIdx[pg.id]} answers={result.answers} onChange={()=>{}} showResult={true}/>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
