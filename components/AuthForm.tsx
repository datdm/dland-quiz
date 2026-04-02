'use client';
import { useState } from 'react';
import { User, Lock, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { loginUser, registerUser } from '@/lib/auth';
import { AppUser } from '@/lib/types';
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
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{background:'radial-gradient(ellipse at 25% 25%, #3b2a6d 0%, #123c3b 40%, #0a0f1f 75%, #030308 100%)'}}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-3">
            <span className="text-amber-600/40 text-3xl">⚔</span>
            <h1 className="text-4xl font-bold text-amber-400 gold-glow font-cinzel">武林考験</h1>
            <span className="text-amber-600/40 text-3xl">⚔</span>
          </div>
          <p className="text-teal-400/70 text-sm font-noto">Dland Quiz Platform — Luyện võ ngôn ngữ</p>
          <div className="divider-teal max-w-xs mx-auto mt-3" />
        </div>
        <div className="mystical-card corner-decor p-7">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-lg" style={{background:'rgba(10,15,31,0.7)'}}>
            {(['login','register'] as const).map(m=>(
              <button key={m} onClick={()=>{setMode(m);setError('');}}
                className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all font-cinzel ${mode===m?'bg-amber-500 text-slate-900':'text-purple-400 hover:text-amber-400'}`}>
                {m==='login'?'🗡 Đăng nhập':'⚔ Đăng ký'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {mode==='register'&&(
              <div>
                <label className="block text-xs text-teal-400/80 mb-1.5 font-noto">Tên hiển thị</label>
                <div className="input-wrapper">
                  <span className="input-icon"><User size={15}/></span>
                  <input className="mystical-input" placeholder="武林侠客..." value={displayName}
                    onChange={e=>setDisplayName(e.target.value)}/>
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs text-teal-400/80 mb-1.5 font-noto">Tên đăng nhập</label>
              <div className="input-wrapper">
                <span className="input-icon"><User size={15}/></span>
                <input className="mystical-input" placeholder="username..." value={username}
                  onChange={e=>setUsername(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&submit()}
                  autoCapitalize="none"/>
              </div>
            </div>
            <div>
              <label className="block text-xs text-teal-400/80 mb-1.5 font-noto">Mật khẩu</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock size={15}/></span>
                <input className="mystical-input" style={{paddingRight:'40px'}}
                  type={showPwd?'text':'password'} placeholder="••••••••"
                  value={password} onChange={e=>setPassword(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&submit()}/>
                <button type="button"
                  onClick={()=>setShowPwd(v=>!v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 hover:text-amber-400 transition"
                  style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)'}}>
                  {showPwd?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
            </div>

            {error&&(
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/30 border border-red-700/40 text-red-300 text-xs font-noto">
                ⚠ {error}
              </div>
            )}

            <button className="btn-gold w-full flex items-center justify-center gap-2 mt-2"
              onClick={submit} disabled={loading}>
              {loading
                ? <span className="w-4 h-4 rounded-full border-2 border-slate-900 border-t-transparent spin"/>
                : mode==='login'?<LogIn size={16}/>:<UserPlus size={16}/>
              }
              {mode==='login'?'Đăng nhập':'Đăng ký'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
