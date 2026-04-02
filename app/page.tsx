'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Clock, BookOpen, ChevronRight, Scroll, BookMarked, Filter } from 'lucide-react';
import { StoredExam, AppUser } from '@/lib/types';
import { getExams } from '@/lib/storage';
import { getCurrentUser, initAuth } from '@/lib/auth';
import { ALL_SUBJECT_NAMES, getSubjectConfig, LEVEL_COLORS } from '@/constants/subjects';
import MainLayout from '@/components/MainLayout';
import AuthForm from '@/components/AuthForm';
import LoadingSpinner from '@/components/LoadingSpinner';

function HomeContent() {
  const searchParams = useSearchParams();
  const paramSubject = searchParams.get('subject') || 'Tất cả';
  const paramLevel   = searchParams.get('level')   || '';
  const [user, setUser]       = useState<AppUser | null>(null);
  const [exams, setExams]     = useState<StoredExam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuth();
    setUser(getCurrentUser());
    setTimeout(() => { setExams(getExams()); setLoading(false); }, 250);
  }, []);

  const handleLogout = useCallback(() => setUser(null), []);
  const handleLogin  = useCallback((u: AppUser) => setUser(u), []);

  if (!user) return <AuthForm onSuccess={handleLogin} />;

  const subjectConfig = getSubjectConfig(paramSubject);
  const filtered = exams.filter(e => {
    const ms = paramSubject === 'Tất cả' || (paramSubject === 'Khác'
      ? !['JLPT','TOEIC','English','Math'].includes(e.data.meta.subject)
      : e.data.meta.subject === paramSubject);
    const ml = !paramLevel || e.data.meta.level === paramLevel;
    return ms && ml;
  });

  const fmtTime = (s: number) => { const h=Math.floor(s/3600),m=Math.floor((s%3600)/60); return h>0?`${h}h ${m}m`:`${m} phút`; };

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <header className="app-header sticky top-0 z-30 px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="md:hidden w-8" />
          <Scroll size={16} style={{color:'var(--gold)'}}/>
          <h1 className="font-semibold tracking-wide font-cinzel" style={{color:'var(--gold)'}}>Danh Sách Đề Thi</h1>
        </div>
        <span className="text-sm font-noto" style={{color:'var(--text-dim)'}}>{loading ? '…' : `${filtered.length} đề`}</span>
      </header>

      <div className="px-4 md:px-6 pt-4 pb-1">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <Filter size={13} style={{color:'var(--text-dim)'}} className="flex-shrink-0"/>
          {ALL_SUBJECT_NAMES.map(s=>(
            <Link key={s} href={s==='Tất cả'?'/':'/?subject='+encodeURIComponent(s)}>
              <button className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all border font-noto"
                style={paramSubject===s
                  ? {background:'var(--gold)',color:'#030308',border:'1px solid var(--gold)'}
                  : {color:'var(--text-muted)',border:'1px solid var(--border-card)'}}>
                {s}
              </button>
            </Link>
          ))}
        </div>
        {subjectConfig && (
          <div className="flex items-center gap-2 flex-wrap pb-2">
            <span className="text-xs font-noto" style={{color:'var(--text-dim)'}}>Level:</span>
            <Link href={`/?subject=${encodeURIComponent(paramSubject)}`}>
              <button className="px-2.5 py-1 rounded-full text-xs border font-noto transition-all"
                style={!paramLevel?{background:'var(--teal)',color:'#fff',border:'1px solid var(--teal)'}:{color:'var(--text-dim)',border:'1px solid var(--border-card)'}}>
                Tất cả
              </button>
            </Link>
            {subjectConfig.levels.map(lv=>(
              <Link key={lv} href={`/?subject=${encodeURIComponent(paramSubject)}&level=${encodeURIComponent(lv)}`}>
                <button className="px-2.5 py-1 rounded-full text-xs border font-noto transition-all"
                  style={paramLevel===lv
                    ? {background:'var(--gold)',color:'#030308',border:'1px solid var(--gold)'}
                    : {color:'var(--text-dim)',border:'1px solid var(--border-card)'}}>
                  {lv}
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>

      <main className="flex-1 px-4 md:px-6 py-3 pb-16">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_,i)=>(
              <div key={i} className="mystical-card p-5 flex items-center gap-4">
                <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0"/>
                <div className="flex-1 space-y-2"><div className="skeleton h-4 w-3/4"/><div className="skeleton h-3 w-1/2"/></div>
                <div className="skeleton h-10 w-28 rounded-lg"/>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mystical-card p-14 text-center">
            <BookOpen size={44} className="mx-auto mb-4" style={{color:'var(--text-dim)'}}/>
            <p className="mb-2 font-noto" style={{color:'var(--text-muted)'}}>Chưa có đề thi nào{paramSubject!=='Tất cả'?` cho ${paramSubject}${paramLevel?` ${paramLevel}`:''}`:''  }.</p>
            {user.role==='admin'&&<Link href="/admin"><button className="btn-gold px-6 py-2 mt-4">⚙ Upload đề thi</button></Link>}
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map(exam=>(
              <div key={exam.id} className="mystical-card corner-decor p-4 md:p-5 flex items-center justify-between group hover:border-teal-500/30 transition-all">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold font-cinzel"
                    style={{background:`color-mix(in srgb, var(--gold) 15%, transparent)`,border:'1px solid var(--border-card)',color:'var(--gold)'}}>
                    {exam.data.meta.subject.slice(0,4)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold font-noto truncate" style={{color:'var(--text-primary)'}}>{exam.data.meta.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded border flex-shrink-0 ${LEVEL_COLORS[exam.data.meta.level]||''}`} style={!LEVEL_COLORS[exam.data.meta.level]?{color:'var(--text-muted)',border:'1px solid var(--border-card)'}:{}}>{exam.data.meta.level}</span>
                      {exam.data.passages&&exam.data.passages.length>0&&(
                        <span className="text-xs px-2 py-0.5 rounded border flex items-center gap-1 flex-shrink-0 bg-teal-900/30 text-teal-300 border-teal-700/40"><BookMarked size={10}/> 読解</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-noto" style={{color:'var(--text-dim)'}}>
                      <span className="flex items-center gap-1"><BookOpen size={11}/> {exam.data.meta.totalQuestions} câu</span>
                      <span className="flex items-center gap-1"><Clock size={11}/> {fmtTime(exam.data.meta.timeLimit)}</span>
                      <span className="hidden sm:block">{exam.data.meta.exam}</span>
                    </div>
                  </div>
                </div>
                <Link href={`/quiz/${exam.id}`} className="flex-shrink-0 ml-2">
                  <button className="btn-gold flex items-center gap-1.5 text-sm py-2 px-3 md:px-4">
                    Bắt đầu <ChevronRight size={15}/>
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </MainLayout>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg-grad)'}}><div className="w-12 h-12 rounded-full border-2 border-t-transparent spin" style={{borderColor:'var(--gold)',borderTopColor:'transparent'}}/></div>}>
      <HomeContent />
    </Suspense>
  );
}
