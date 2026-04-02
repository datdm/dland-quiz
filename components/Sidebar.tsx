'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sword, Home, Trophy, Shield, Menu, X, BookOpen, LogOut, User, ChevronDown } from 'lucide-react';
import { AppUser } from '@/lib/types';
import { logoutUser } from '@/lib/auth';
import { SUBJECTS_CONFIG } from '@/constants/subjects';

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
      <div className="px-4 py-5 flex items-center gap-3 flex-shrink-0" style={{borderBottom:'1px solid rgba(245,158,11,0.18)'}}>
        <Sword size={20} className="text-amber-500 flex-shrink-0"/>
        <div>
          <p className="text-amber-400 font-bold tracking-widest text-base gold-glow font-cinzel">武林考験</p>
          <p className="text-teal-400/60 text-xs font-noto">Dland Quiz Platform</p>
        </div>
      </div>
      {/* User */}
      {user&&(
        <div className="px-4 py-3 flex-shrink-0" style={{borderBottom:'1px solid rgba(20,184,166,0.15)'}}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{background:user.role==='admin'?'rgba(245,158,11,0.2)':'rgba(20,184,166,0.2)',border:`1px solid ${user.role==='admin'?'rgba(245,158,11,0.5)':'rgba(20,184,166,0.4)'}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
              {user.role==='admin'?<Shield size={13} className="text-amber-400"/>:<User size={13} className="text-teal-300"/>}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-purple-100 truncate font-noto">{user.displayName}</p>
              <p className="text-xs text-purple-600">{user.role==='admin'?'⚔ Admin':'剣士 User'}</p>
            </div>
          </div>
        </div>
      )}
      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <p className="text-purple-800 text-xs px-2 mb-2 tracking-widest font-cinzel">― MENU ―</p>
        {navItems.map(item=>{
          const Icon=item.icon; const isActive=pathname===item.href||(item.href!=='/'&&pathname.startsWith(item.href));
          return (<Link key={item.href} href={item.href} onClick={()=>setOpen(false)}>
            <div className={`sidebar-item ${isActive?'active':''}`}>
              <Icon size={16}/><span className="font-noto">{item.label}</span>
              {isActive&&<span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400"/>}
            </div>
          </Link>);
        })}
        <hr className="divider-teal my-2"/>
        <p className="text-purple-800 text-xs px-2 mb-1 tracking-widest font-cinzel">― MÔN THI ―</p>
        {SUBJECTS_CONFIG.map(subj=>(
          <div key={subj.name}>
            <button
              className="sidebar-item w-full"
              onClick={()=>setExpandedSubject(expandedSubject===subj.name?null:subj.name)}>
              <span className="text-base">{subj.icon}</span>
              <span className="font-noto text-sm flex-1 text-left">{subj.name}</span>
              <ChevronDown size={13} className={`transition-transform ${expandedSubject===subj.name?'rotate-180':''}`}/>
            </button>
            {expandedSubject===subj.name&&(
              <div className="ml-4 mt-1 space-y-0.5">
                <Link href={`/?subject=${encodeURIComponent(subj.name)}`} onClick={()=>setOpen(false)}>
                  <div className="sidebar-item py-1.5 text-purple-500 hover:text-amber-400">
                    <BookOpen size={11}/><span className="text-xs font-noto">Tất cả {subj.name}</span>
                  </div>
                </Link>
                {subj.levels.map(lv=>(
                  <Link key={lv} href={`/?subject=${encodeURIComponent(subj.name)}&level=${encodeURIComponent(lv)}`} onClick={()=>setOpen(false)}>
                    <div className="sidebar-item py-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:'rgba(245,158,11,0.4)'}}/>
                      <span className="text-xs font-noto">{lv}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      {/* Logout */}
      <div className="px-3 py-3 flex-shrink-0" style={{borderTop:'1px solid rgba(245,158,11,0.1)'}}>
        {user?(
          <button onClick={handleLogout} className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <LogOut size={15}/><span className="font-noto">Đăng xuất</span>
          </button>
        ):(
          <Link href="/"><div className="sidebar-item"><User size={15}/><span className="font-noto">Đăng nhập</span></div></Link>
        )}
        <p className="text-purple-900 text-xs text-center mt-2 font-cinzel">v1.0 · Dland Quiz</p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 sticky top-0 h-screen"
        style={{background:'rgba(3,3,8,0.95)',borderRight:'1px solid rgba(59,42,109,0.5)'}}>
        {content}
      </aside>
      <button className="md:hidden fixed top-3 left-3 z-50 p-2.5 rounded-lg"
        style={{background:'rgba(3,3,8,0.92)',border:'1px solid rgba(245,158,11,0.35)'}}
        onClick={()=>setOpen(v=>!v)}>
        {open?<X size={18} className="text-amber-400"/>:<Menu size={18} className="text-amber-400"/>}
      </button>
      {open&&(
        <div className="md:hidden fixed inset-0 z-40 flex">
          <aside className="w-64 h-full flex flex-col"
            style={{background:'rgba(3,3,8,0.98)',borderRight:'1px solid rgba(59,42,109,0.5)'}}>
            {content}
          </aside>
          <div className="flex-1" onClick={()=>setOpen(false)} style={{background:'rgba(0,0,0,0.4)'}}/>
        </div>
      )}
    </>
  );
}
