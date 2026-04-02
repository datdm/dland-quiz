'use client';
import { useState, useEffect } from 'react';
import { Shield, Trash2, Eye, LogOut, BookOpen, Clock, Users, FileText, Database } from 'lucide-react';
import { StoredExam, AppUser } from '@/lib/types';
import { getExams, deleteExam, getResults } from '@/lib/storage';
import { getCurrentUser, initAuth, logoutUser, getUsers } from '@/lib/auth';
import AdminUpload from '@/components/AdminUpload';
import MainLayout from '@/components/MainLayout';
import AuthForm from '@/components/AuthForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import Dialog, { useDialog } from '@/components/Dialog';
import DataManager from '@/components/DataManager';

type Tab = 'exams' | 'users' | 'data';

export default function AdminPage() {
  const [user, setUser]       = useState<AppUser | null>(null);
  const [exams, setExams]     = useState<StoredExam[]>([]);
  const [users, setUsers]     = useState<AppUser[]>([]);
  const [preview, setPreview] = useState<StoredExam | null>(null);
  const [tab, setTab]         = useState<Tab>('exams');
  const [ready, setReady]     = useState(false);
  const { showDialog, dialogEl } = useDialog();

  useEffect(() => {
    initAuth();
    const u = getCurrentUser(); setUser(u);
    if (u?.role === 'admin') { setExams(getExams()); setUsers(getUsers()); }
    setReady(true);
  }, []);

  const handleLogout = () => { logoutUser(); setUser(null); };
  const refresh = () => { setExams(getExams()); setUsers(getUsers()); };

  const handleDelete = async (id: string, title: string) => {
    const ok = await showDialog({ type:'danger', title:'Xoá Đề Thi', message:`Xoá:\n"${title}"?\n\nKhông thể hoàn tác.`, confirmLabel:'Xoá', cancelLabel:'Huỷ' });
    if (!ok) return;
    deleteExam(id); setExams(getExams());
    if (preview?.id === id) setPreview(null);
  };

  const fmtTime = (s: number) => { const h=Math.floor(s/3600),m=Math.floor((s%3600)/60); return h>0?`${h}h ${m}m`:`${m} phút`; };
  const allResults = getResults();

  if (!ready) return <MainLayout user={null} onLogout={()=>{}}><div className="flex-1 flex items-center justify-center"><LoadingSpinner size={40} text="Đang tải..." /></div></MainLayout>;
  if (!user) return <AuthForm onSuccess={u => setUser(u)} />;
  if (user.role !== 'admin') return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="mystical-card p-10 text-center">
          <Shield size={44} className="mx-auto text-red-500 mb-4" />
          <h2 className="font-bold text-xl mb-2 font-cinzel text-red-400">Không có quyền</h2>
          <p className="text-sm font-noto" style={{color:'var(--text-muted)'}}>Dành cho Admin.</p>
        </div>
      </div>
    </MainLayout>
  );

  const TABS: { id: Tab; label: string }[] = [
    { id:'exams', label:'\uD83D\uDCDA Đề Thi' },
    { id:'users', label:'\uD83D\uDC65 Users' },
    { id:'data',  label:'\uD83D\uDCBE Backup' },
  ];

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      {dialogEl}
      <header className="app-header sticky top-0 z-30 px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><div className="md:hidden w-8" /><Shield size={16} style={{color:'var(--gold)'}}/><span className="font-semibold text-sm font-cinzel" style={{color:'var(--gold)'}}>Quản Trị</span></div>
        <button onClick={handleLogout} className="text-sm flex items-center gap-1 font-noto" style={{color:'var(--text-muted)'}}><LogOut size={14} /> Đăng xuất</button>
      </header>
      <div className="px-4 md:px-6 py-4 grid grid-cols-3 gap-3">
        {[{label:'Đề thi',value:exams.length,icon:FileText,color:'var(--gold)'},{label:'Users',value:users.length,icon:Users,color:'var(--teal)'},{label:'Lần thi',value:allResults.length,icon:BookOpen,color:'#22c55e'}].map(s => (
          <div key={s.label} className="mystical-card p-3 text-center">
            <s.icon size={18} className="mx-auto mb-1" style={{color:s.color}}/>
            <div className="text-2xl font-bold font-cinzel" style={{color:s.color}}>{s.value}</div>
            <p className="text-xs font-noto" style={{color:'var(--text-dim)'}}>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="px-4 md:px-6 mb-4">
        <div className="flex gap-1 p-1 rounded-lg w-fit" style={{background:'var(--bg-option)'}}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-3 md:px-4 py-2 rounded-md text-xs md:text-sm font-semibold transition-all font-cinzel"
              style={tab===t.id?{background:'var(--gold)',color:'#030308'}:{color:'var(--text-muted)'}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 md:px-6 pb-8">
        {tab === 'exams' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <AdminUpload onUploaded={refresh} />
            <div>
              <div className="mystical-card p-5">
                <h3 className="font-bold text-lg mb-4 gold-glow font-cinzel" style={{color:'var(--gold)'}}>Đề Thi ({exams.length})</h3>
                {exams.length === 0 ? (<p className="text-center py-8 font-noto" style={{color:'var(--text-dim)'}}>Chưa có đề thi.</p>) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {exams.map(exam => (
                      <div key={exam.id} className="p-3 rounded-lg border transition-all" style={{border:`1px solid ${preview?.id===exam.id?'var(--gold)':'var(--border-card)'}`,background:'var(--bg-option)'}}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate font-noto" style={{color:'var(--text-primary)'}}>{exam.data.meta.title}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs font-noto flex-wrap" style={{color:'var(--text-dim)'}}>
                              <span style={{color:'var(--teal)'}}>{exam.data.meta.subject}</span>
                              <span>{exam.data.meta.level}</span>
                              <span>{exam.data.meta.totalQuestions} câu</span>
                              <span>{fmtTime(exam.data.meta.timeLimit)}</span>
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button onClick={() => setPreview(preview?.id===exam.id?null:exam)} className="p-2 rounded transition" style={{minHeight:'44px',color:'var(--text-muted)'}}><Eye size={13}/></button>
                            <button onClick={() => handleDelete(exam.id, exam.data.meta.title)} className="p-2 rounded transition text-red-400" style={{minHeight:'44px'}}><Trash2 size={13}/></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {preview && (
                <div className="mystical-card p-5 mt-4">
                  <h4 className="font-semibold mb-3 font-cinzel" style={{color:'var(--gold)'}}>🔍 {preview.data.meta.title}</h4>
                  <div className="space-y-1 text-sm mb-3 font-noto" style={{color:'var(--text-secondary)'}}>
                    <p><span style={{color:'var(--teal)'}}>Môn:</span> {preview.data.meta.subject} — {preview.data.meta.exam}</p>
                    <p><span style={{color:'var(--teal)'}}>Level:</span> {preview.data.meta.level}</p>
                    <p><span style={{color:'var(--teal)'}}>Câu:</span> {preview.data.meta.totalQuestions}</p>
                    <p><span style={{color:'var(--teal)'}}>TG:</span> {fmtTime(preview.data.meta.timeLimit)}</p>
                  </div>
                  <hr className="divider-teal mb-3"/>
                  {preview.data.meta.sections.map(s => (
                    <div key={s.name} className="flex items-center justify-between text-xs py-1 border-b font-noto" style={{color:'var(--text-dim)',borderColor:'var(--border-card)'}}>
                      <span>{s.mondai&&<span className="mr-1" style={{color:'var(--text-dim)'}}>{s.mondai}</span>}{s.name}</span>
                      <span className="px-2 py-0.5 rounded" style={{background:`color-mix(in srgb, var(--gold) 10%, transparent)`,color:'var(--gold)'}}>
                        {(s.questionIds?.length||0)+(s.passageIds?.reduce((a,pid)=>{const pg=preview.data.passages?.find(p=>p.id===pid);return a+(pg?.questions.length||0);},0)||0)} câu
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {tab === 'users' && (
          <div className="mystical-card p-5">
            <h3 className="font-bold text-lg mb-4 font-cinzel" style={{color:'var(--gold)'}}>Users ({users.length})</h3>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {users.map(u => { const ur=allResults.filter(r=>r.userId===u.id); return (
                <div key={u.id} className="p-3 rounded-lg border" style={{border:'1px solid var(--border-card)',background:'var(--bg-option)'}}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold font-cinzel"
                        style={{background:`color-mix(in srgb, var(--gold) 20%, transparent)`,color:'var(--gold)',border:'1px solid var(--border-card)'}}>
                        {u.displayName.slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium font-noto" style={{color:'var(--text-primary)'}}>{u.displayName}</p>
                        <p className="text-xs font-noto" style={{color:'var(--text-dim)'}}>@{u.username} · {u.role==='admin'?'⚔ Admin':'剣士 User'}</p>
                      </div>
                    </div>
                    <span className="text-xs font-noto" style={{color:'var(--text-dim)'}}>{ur.length} lần thi</span>
                  </div>
                </div>
              ); })}
            </div>
          </div>
        )}
        {tab === 'data' && <DataManager onRestored={refresh} />}
      </div>
    </MainLayout>
  );
}
