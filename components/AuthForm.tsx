'use client';
import { useState } from 'react';
import { User, Lock, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { loginUser, registerUser } from '@/lib/auth';
import { AppUser } from '@/lib/types';
import ThemeToggle from './ThemeToggle';
interface Props { onSuccess: (user: AppUser) => void; }
export default function AuthForm({ onSuccess }: Props) {
  const [mode,setMode]               = useState<'login'|'register'>('login');
  const [username,setUsername]       = useState('');
  const [password,setPassword]       = useState('');
  const [displayName,setDisplayName] = useState('');
  const [error,setError]             = useState('');
  const [showPwd,setShowPwd]         = useState(false);
  const [loading,setLoading]         = useState(false);
  const submit = async () => {
    setError(''); setLoading(true);
    await new Promise(r=>setTimeout(r,280));
    if(mode==='login') {
      const u=loginUser(username.trim(),password);
      if(!u){setError('Tên đăng nhập hoặc mật khẩu không đúng.');setLoading(false);return;}
      onSuccess(u);
    } else {
      const r=registerUser(username.trim(),password,displayName.trim());
      if(typeof r==='string'){setError(r);setLoading(false);return;}
      onSuccess(r);
    }
    setLoading(false);
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background:'var(--bg-grad)'}}>
      {/* Theme toggle top-right */}
      <div className="fixed top-4 right-4 z-50"><ThemeToggle /></div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-3">
            <span style={{color:'var(--gold)',opacity:0.4}} className="text-3xl">⚔</span>
            <h1 className="text-4xl font-bold gold-glow font-cinzel" style={{color:'var(--gold)'}}>Dland Quiz</h1>
            <span style={{color:'var(--gold)',opacity:0.4}} className="text-3xl">⚔</span>
          </div>
          <p className="text-sm font-noto" style={{color:'var(--teal)'}}>武林考験 — Luyện võ ngôn ngữ</p>
          <div className="divider-teal max-w-xs mx-auto mt-3" />
        </div>
        <div className="mystical-card corner-decor p-7">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-lg" style={{background:'var(--bg-option)'}}>
            {(['login','register'] as const).map(m=>(
              <button key={m} onClick={()=>{setMode(m);setError('');}}
                className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all font-cinzel ${mode===m?'text-slate-900':'hover:opacity-80'}`}
                style={mode===m?{background:'var(--gold)'}:{color:'var(--text-muted)'}}>
                {m==='login'?'🗡 Đăng nhập':'⚔ Đăng ký'}
              </button>
            ))}
          </div>
          <div className="space-y-4">
            {mode==='register'&&(
              <div>
                <label className="block text-xs mb-1.5 font-noto" style={{color:'var(--teal)'}}>Tên hiển thị</label>
                <div className="input-wrapper">
                  <span className="input-icon"><User size={15}/></span>
                  <input className="mystical-input" placeholder="武林侠客..." value={displayName} onChange={e=>setDisplayName(e.target.value)}/>
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs mb-1.5 font-noto" style={{color:'var(--teal)'}}>Tên đăng nhập</label>
              <div className="input-wrapper">
                <span className="input-icon"><User size={15}/></span>
                <input className="mystical-input" placeholder="username..." value={username}
                  onChange={e=>setUsername(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} autoCapitalize="none"/>
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1.5 font-noto" style={{color:'var(--teal)'}}>Mật khẩu</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock size={15}/></span>
                <input className="mystical-input" style={{paddingRight:'40px'}}
                  type={showPwd?'text':'password'} placeholder="••••••••"
                  value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/>
                <button type="button" onClick={()=>setShowPwd(v=>!v)}
                  style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}>
                  {showPwd?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
            </div>
            {error&&<div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/30 border border-red-700/40 text-red-300 text-xs font-noto">⚠ {error}</div>}
            <button className="btn-gold w-full flex items-center justify-center gap-2 mt-2" onClick={submit} disabled={loading}>
              {loading?<span className="w-4 h-4 rounded-full border-2 border-slate-900 border-t-transparent spin"/>:mode==='login'?<LogIn size={16}/>:<UserPlus size={16}/>}
              {mode==='login'?'Đăng nhập':'Đăng ký'}
            </button>
            {mode==='login'&&<p className="text-center text-xs mt-2 font-noto" style={{color:'var(--text-dim)'}}>Admin: <span style={{color:'var(--gold)'}}>admin / admin123</span></p>}
          </div>
        </div>
      </div>
    </div>
  );
}
