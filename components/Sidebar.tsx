'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sword, Home, Trophy, Shield, Menu, X, BookOpen, LogOut, User, ChevronDown } from 'lucide-react';
import { AppUser } from '@/lib/types';
import { logoutUser } from '@/lib/auth';
import { SUBJECTS_CONFIG } from '@/constants/subjects';
import ThemeToggle from './ThemeToggle';
interface Props { user: AppUser|null; onLogout: ()=>void; }
export default function Sidebar({ user, onLogout }: Props) {
  const pathname = usePathname();
  const [open,setOpen] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState<string|null>(null);
  const navItems = [
    { href:'/', label:'Trang Chủ', icon:Home },
    { href:'/results', label:'Lịch Sử', icon:Trophy },
    ...(user?.role==='admin'?[{href:'/admin',label:'Quản Trị',icon:Shield}]:[]),
  ];
  const handleLogout = () => { logoutUser(); onLogout(); setOpen(false); };
  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-3 flex-shrink-0 divider-gold" style={{borderBottom:'1px solid var(--border-card)'}}>
        <Sword size={20} style={{color:'var(--gold)'}} className="flex-shrink-0"/>
        <div>
          <p className="text-amber-400 font-bold tracking-widest text-base gold-glow font-cinzel">武林考験</p>
          <p className="text-teal-400/60 text-xs font-noto">Dland Quiz Platform</p>
        </div>
      </div>
      {/* User */}
      {user&&(
        <div className="px-4 py-3 flex-shrink-0" style={{borderBottom:'1px solid color-mix(in srgb, var(--teal) 15%, transparent)'}}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{background:`color-mix(in srgb, var(--gold) 20%, transparent)`,border:`1px solid color-mix(in srgb, var(--gold) 40%, transparent)`,display:'flex',alignItems:'center',justifyContent:'center'}}>
              {user.role==='admin'?<Shield size={13} style={{color:'var(--gold)'}}/>:<User size={13} style={{color:'var(--teal)'}}/>}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate font-noto" style={{color:'var(--text-primary)'}}>{user.displayName}</p>
              <p className="text-xs font-noto" style={{color:'var(--text-dim)'}}>{user.role==='admin'?'⚔ Admin':'剣士 User'}</p>
            </div>
          </div>
        </div>
      )}
      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <p className="text-xs px-2 mb-2 tracking-widest font-cinzel" style={{color:'var(--text-dim)'}}>― MENU ―</p>
        {navItems.map(item=>{
          const Icon=item.icon; const isActive=pathname===item.href||(item.href!=='/'&&pathname.startsWith(item.href));
          return (<Link key={item.href} href={item.href} onClick={()=>setOpen(false)}>
            <div className={`sidebar-item ${isActive?'active':''}`}>
              <Icon size={16}/><span className="font-noto">{item.label}</span>
              {isActive&&<span className="ml-auto w-1.5 h-1.5 rounded-full" style={{background:'var(--gold)'}}/>}
            </div>
          </Link>);
        })}
        <hr className="divider-teal my-2"/>
        <p className="text-xs px-2 mb-1 tracking-widest font-cinzel" style={{color:'var(--text-dim)'}}>― MÔN THI ―</p>
        {SUBJECTS_CONFIG.map(subj=>(
          <div key={subj.name}>
            <button className="sidebar-item w-full" onClick={()=>setExpandedSubject(expandedSubject===subj.name?null:subj.name)}>
              <span className="text-base">{subj.icon}</span>
              <span className="font-noto text-sm flex-1 text-left">{subj.name}</span>
              <ChevronDown size={13} className={`transition-transform ${expandedSubject===subj.name?'rotate-180':''}`} style={{color:'var(--text-dim)'}}/>
            </button>
            {expandedSubject===subj.name&&(
              <div className="ml-4 mt-1 space-y-0.5">
                <Link href={`/?subject=${encodeURIComponent(subj.name)}`} onClick={()=>setOpen(false)}>
                  <div className="sidebar-item py-1.5"><BookOpen size={11}/><span className="text-xs font-noto">Tất cả {subj.name}</span></div>
                </Link>
                {subj.levels.map(lv=>(
                  <Link key={lv} href={`/?subject=${encodeURIComponent(subj.name)}&level=${encodeURIComponent(lv)}`} onClick={()=>setOpen(false)}>
                    <div className="sidebar-item py-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:'color-mix(in srgb, var(--gold) 40%, transparent)'}}/>
                      <span className="text-xs font-noto">{lv}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      {/* Bottom: Theme toggle + Logout */}
      <div className="px-3 py-3 flex-shrink-0 space-y-2" style={{borderTop:'1px solid var(--border-card)'}}>
        <ThemeToggle className="w-full justify-center" />
        {user?(
          <button onClick={handleLogout} className="sidebar-item w-full text-red-400 hover:text-red-300">
            <LogOut size={15}/><span className="font-noto">Đăng xuất</span>
          </button>
        ):(
          <Link href="/"><div className="sidebar-item"><User size={15}/><span className="font-noto">Đăng nhập</span></div></Link>
        )}
        <p className="text-xs text-center font-cinzel" style={{color:'var(--text-dim)'}}>v5.0 · 剣を磨け</p>
      </div>
    </div>
  );
  return (
    <>
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 sticky top-0 h-screen"
        style={{background:'var(--bg-sidebar)',borderRight:'1px solid var(--border-sidebar)'}}>
        {content}
      </aside>
      <button className="md:hidden fixed top-3 left-3 z-50 p-2.5 rounded-lg"
        style={{background:'var(--bg-header)',border:'1px solid var(--border-card)'}}
        onClick={()=>setOpen(v=>!v)}>
        {open?<X size={18} style={{color:'var(--gold)'}}/>:<Menu size={18} style={{color:'var(--gold)'}}/>}
      </button>
      {open&&(
        <div className="md:hidden fixed inset-0 z-40 flex">
          <aside className="w-64 h-full flex flex-col" style={{background:'var(--bg-sidebar)',borderRight:'1px solid var(--border-sidebar)'}}>
            {content}
          </aside>
          <div className="flex-1" onClick={()=>setOpen(false)} style={{background:'rgba(0,0,0,0.5)'}}/>
        </div>
      )}
    </>
  );
}
