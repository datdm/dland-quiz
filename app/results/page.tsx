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

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg-grad)'}}>
      <div className="w-10 h-10 rounded-full border-2 border-t-transparent spin"
        style={{borderColor:'var(--gold)',borderTopColor:'transparent'}}/>
    </div>
  );

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <header className="app-header sticky top-0 z-30 px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold">
          <div className="md:hidden w-8"/>
          <Trophy size={18} style={{color:'var(--gold)'}}/>
          <span className="gold-glow font-cinzel" style={{color:'var(--gold)'}}>
            Lịch Sử{user.role==='admin'?' (Tất cả)':`— ${user.displayName}`}
          </span>
        </div>
        <span className="text-sm font-noto" style={{color:'var(--text-dim)'}}>{loading?'…':`${results.length} lần thi`}</span>
      </header>

      <div className="px-4 md:px-6 py-6">
        {loading ? <LoadingSpinner size={36} text="Đang tải lịch sử..." /> : results.length === 0 ? (
          <div className="mystical-card p-14 text-center">
            <Trophy size={40} className="mx-auto mb-3" style={{color:'var(--text-dim)'}}/>
            <p className="font-noto" style={{color:'var(--text-muted)'}}>Chưa có kết quả nào.</p>
            <Link href="/" className="text-sm mt-3 inline-block font-noto" style={{color:'var(--teal)'}}>← Về trang chủ làm bài</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {results.map(r => {
              const pct=Math.round((r.correctCount/r.totalQuestions)*100), passed=pct>=60;
              return (
                <Link key={r.id} href={`/result/${r.id}`}>
                  <div className="mystical-card p-4 flex items-center justify-between transition-all cursor-pointer mb-1"
                    style={{'--hover-border':'var(--teal)'} as React.CSSProperties}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm font-noto truncate" style={{color:'var(--text-primary)'}}>{r.examTitle}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs flex-wrap font-noto" style={{color:'var(--text-dim)'}}>
                        <span style={{color:'var(--teal)'}}>{r.subject}</span>
                        <span className="flex items-center gap-1"><Clock size={10}/> {fmtTime(r.timeTaken)}</span>
                        <span>{fmtDate(r.finishedAt)}</span>
                        {user.role==='admin'&&<span style={{color:'var(--teal)',opacity:0.6}}>uid:{r.userId.slice(0,8)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      <div className="text-right">
                        <div className={`text-lg font-bold font-cinzel`} style={{color:passed?'var(--gold)':'#ef4444'}}>{pct}%</div>
                        <div className="text-xs font-noto" style={{color:'var(--text-dim)'}}>{r.correctCount}/{r.totalQuestions}</div>
                      </div>
                      <ChevronRight size={16} style={{color:'var(--text-dim)'}}/>
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
