'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Clock, ChevronRight } from 'lucide-react';
import { QuizResult, AppUser } from '@/lib/types';
import { getResults, getResultsByUser } from '@/lib/storage';
import { getCurrentUser, initAuth, logoutUser } from '@/lib/auth';
import MainLayout from '@/components/MainLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { LEVEL_COLORS } from '@/constants/subjects';

export default function ResultsPage() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [user, setUser]       = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    initAuth();
    const u = getCurrentUser(); if (!u) { router.push('/'); return; } setUser(u);
    const r = u.role==='admin' ? getResults() : getResultsByUser(u.id);
    setTimeout(() => { setResults(r); setLoading(false); }, 200);
  }, [router]);

  const handleLogout = () => { logoutUser(); router.push('/'); };
  const fmtDate = (iso: string) => new Date(iso).toLocaleString('vi-VN', { dateStyle:'short', timeStyle:'short' });
  const fmtTime = (s: number) => { const m=Math.floor(s/60),sec=s%60; return `${m}m ${sec}s`; };

  if (!user) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 rounded-full border-2 border-amber-500 border-t-transparent spin"/></div>;

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <header className="app-header sticky top-0 z-30 px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <div className="md:hidden w-8"/><Trophy size={18}/>
          <span className="gold-glow font-cinzel">Lịch Sử{user.role==='admin'?' (Tất cả)':`— ${user.displayName}`}</span>
        </div>
        <span className="text-purple-600 text-sm font-noto">{loading?'…':`${results.length} lần thi`}</span>
      </header>

      <div className="px-4 md:px-6 py-6">
        {loading ? <LoadingSpinner size={36} text="Đang tải lịch sử..." /> : results.length === 0 ? (
          <div className="mystical-card p-14 text-center">
            <Trophy size={40} className="mx-auto text-purple-700 mb-3"/>
            <p className="text-purple-400 font-noto">Chưa có kết quả nào.</p>
            <Link href="/" className="text-teal-400 hover:underline text-sm mt-3 inline-block font-noto">← Về trang chủ làm bài</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {results.map(r => {
              const pct=Math.round((r.correctCount/r.totalQuestions)*100),passed=pct>=60;
              return (
                <Link key={r.id} href={`/result/${r.id}`}>
                  <div className="mystical-card p-4 flex items-center justify-between hover:border-teal-500/30 transition-all cursor-pointer mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-purple-100 font-medium text-sm font-noto truncate">{r.examTitle}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-purple-500 flex-wrap font-noto">
                        <span className={`px-1.5 py-0.5 rounded text-xs border ${LEVEL_COLORS[r.subject]||'text-purple-400 border-purple-700/40'}`}>{r.subject}</span>
                        <span className="flex items-center gap-1"><Clock size={10}/> {fmtTime(r.timeTaken)}</span>
                        <span>{fmtDate(r.finishedAt)}</span>
                        {user.role==='admin'&&<span className="text-sky-600">uid:{r.userId.slice(0,8)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      <div className="text-right">
                        <div className={`text-lg font-bold font-cinzel ${passed?'text-amber-400':'text-red-400'}`}>{pct}%</div>
                        <div className="text-xs text-purple-500 font-noto">{r.correctCount}/{r.totalQuestions}</div>
                      </div>
                      <ChevronRight size={16} className="text-purple-600"/>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
