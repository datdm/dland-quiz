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
    const ok = await showDialog({
      type: 'danger', title: 'Xoá Đề Thi',
      message: `Xoá đề thi:\n"${title}"?\n\nHành động này không thể hoàn tác.`,
      confirmLabel: 'Xoá', cancelLabel: 'Huỷ',
    });
    if (!ok) return;
    deleteExam(id); setExams(getExams());
    if (preview?.id === id) setPreview(null);
  };

  const fmtTime = (s: number) => { const h=Math.floor(s/3600),m=Math.floor((s%3600)/60); return h>0?`${h}h ${m}m`:`${m} phút`; };
  const allResults = getResults();

  if (!ready) return <MainLayout user={null} onLogout={() => {}}><div className="flex-1 flex items-center justify-center"><LoadingSpinner size={40} text="Đang tải..." /></div></MainLayout>;
  if (!user) return <AuthForm onSuccess={u => setUser(u)} />;
  if (user.role !== 'admin') return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="mystical-card p-10 text-center">
          <Shield size={44} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-red-400 font-bold text-xl mb-2 font-cinzel">Không có quyền truy cập</h2>
          <p className="text-purple-400 text-sm font-noto">Khu vực chỉ dành cho Quản trị viên.</p>
        </div>
      </div>
    </MainLayout>
  );

  const TABS: { id: Tab; label: string; icon: typeof FileText }[] = [
    { id:'exams', label:'📚 Đề Thi', icon:FileText },
    { id:'users', label:'👥 Users', icon:Users },
    { id:'data',  label:'💾 Backup', icon:Database },
  ];

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      {dialogEl}
      <header className="app-header sticky top-0 z-30 px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="md:hidden w-8" />
          <Shield size={16} className="text-amber-500" />
          <span className="text-amber-400 font-semibold text-sm font-cinzel">Quản Trị Hệ Thống</span>
        </div>
        <button onClick={handleLogout} className="text-purple-400 hover:text-red-400 transition text-sm flex items-center gap-1 font-noto">
          <LogOut size={14} /> Đăng xuất
        </button>
      </header>

      {/* Stats */}
      <div className="px-4 md:px-6 py-4 grid grid-cols-3 gap-3">
        {[
          { label:'Đề thi', value:exams.length, icon:FileText, color:'text-amber-400' },
          { label:'Users', value:users.length, icon:Users, color:'text-teal-400' },
          { label:'Lần thi', value:allResults.length, icon:BookOpen, color:'text-green-400' },
        ].map(s => (
          <div key={s.label} className="mystical-card p-3 md:p-4 text-center">
            <s.icon size={18} className={`mx-auto mb-1 ${s.color}`} />
            <div className={`text-xl md:text-2xl font-bold font-cinzel ${s.color}`}>{s.value}</div>
            <p className="text-purple-500 text-xs font-noto">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="px-4 md:px-6 mb-4">
        <div className="flex gap-1 p-1 rounded-lg w-fit" style={{background:'rgba(10,15,31,0.6)'}}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 md:px-4 py-2 rounded-md text-xs md:text-sm font-semibold transition-all font-cinzel ${tab===t.id?'bg-amber-500 text-slate-900':'text-purple-400 hover:text-amber-400'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-6 pb-8">
        {/* ── Exams Tab ── */}
        {tab === 'exams' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <AdminUpload onUploaded={refresh} />
            <div>
              <div className="mystical-card p-5">
                <h3 className="text-amber-400 font-bold text-lg mb-4 gold-glow font-cinzel">📚 Đề Thi ({exams.length})</h3>
                {exams.length === 0 ? (
                  <div className="text-center py-8"><BookOpen size={32} className="mx-auto text-purple-700 mb-2" /><p className="text-purple-500 text-sm font-noto">Chưa có đề thi.</p></div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {exams.map(exam => (
                      <div key={exam.id} className={`p-3 rounded-lg border transition-all ${preview?.id===exam.id?'border-amber-500/60 bg-amber-900/10':'border-purple-800/30 hover:border-purple-600/40 bg-slate-900/30'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-purple-100 text-sm font-medium truncate font-noto">{exam.data.meta.title}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-purple-500 flex-wrap font-noto">
                              <span className="text-teal-400/80">{exam.data.meta.subject}</span>
                              <span>{exam.data.meta.level}</span>
                              <span className="flex items-center gap-0.5"><BookOpen size={10} /> {exam.data.meta.totalQuestions} câu</span>
                              <span className="flex items-center gap-0.5"><Clock size={10} /> {fmtTime(exam.data.meta.timeLimit)}</span>
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button onClick={() => setPreview(preview?.id===exam.id?null:exam)} className="p-2 rounded text-purple-400 hover:text-amber-400 transition" style={{minHeight:'44px'}}><Eye size={13} /></button>
                            <button onClick={() => handleDelete(exam.id, exam.data.meta.title)} className="p-2 rounded text-purple-400 hover:text-red-400 transition" style={{minHeight:'44px'}}><Trash2 size={13} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {preview && (
                <div className="mystical-card p-5 mt-4">
                  <h4 className="text-amber-400 font-semibold mb-3 font-cinzel">🔍 {preview.data.meta.title}</h4>
                  <div className="space-y-1 text-sm text-purple-300 mb-3 font-noto">
                    <p><span className="text-teal-400/70">Môn:</span> {preview.data.meta.subject} — {preview.data.meta.exam}</p>
                    <p><span className="text-teal-400/70">Cấp độ:</span> {preview.data.meta.level}</p>
                    <p><span className="text-teal-400/70">Tổng câu:</span> {preview.data.meta.totalQuestions}</p>
                    <p><span className="text-teal-400/70">Thời gian:</span> {fmtTime(preview.data.meta.timeLimit)}</p>
                  </div>
                  <hr className="divider-teal mb-3" />
                  {preview.data.meta.sections.map(s => (
                    <div key={s.name} className="flex items-center justify-between text-xs text-purple-400 py-1 border-b border-purple-900/20 font-noto">
                      <span>{s.mondai && <span className="text-purple-600 mr-1">{s.mondai}</span>}{s.name}</span>
                      <span className="px-2 py-0.5 rounded" style={{background:'rgba(245,158,11,0.1)',color:'#fbbf24'}}>
                        {(s.questionIds?.length||0)+(s.passageIds?.reduce((a,pid)=>{const pg=preview.data.passages?.find(p=>p.id===pid);return a+(pg?.questions.length||0);},0)||0)} câu
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Users Tab ── */}
        {tab === 'users' && (
          <div className="mystical-card p-5">
            <h3 className="text-amber-400 font-bold text-lg mb-4 font-cinzel">👥 Người Dùng ({users.length})</h3>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {users.map(u => { const ur = allResults.filter(r => r.userId === u.id); return (
                <div key={u.id} className="p-3 rounded-lg border border-purple-800/30 bg-slate-900/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold font-cinzel"
                        style={{background:u.role==='admin'?'rgba(245,158,11,0.2)':'rgba(20,184,166,0.15)',color:u.role==='admin'?'#f59e0b':'#14b8a6',border:`1px solid ${u.role==='admin'?'rgba(245,158,11,0.4)':'rgba(20,184,166,0.3)'}`}}>
                        {u.displayName.slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-purple-100 text-sm font-medium font-noto">{u.displayName}</p>
                        <p className="text-purple-500 text-xs font-noto">@{u.username} · {u.role==='admin'?'⚔ Admin':'剣士 User'}</p>
                      </div>
                    </div>
                    <span className="text-xs text-purple-500 font-noto">{ur.length} lần thi</span>
                  </div>
                </div>
              ); })}
            </div>
          </div>
        )}

        {/* ── Data/Backup Tab ── */}
        {tab === 'data' && <DataManager onRestored={refresh} />}
      </div>
    </MainLayout>
  );
}
