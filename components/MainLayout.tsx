'use client';
import Sidebar from './Sidebar';
import { AppUser } from '@/lib/types';
interface Props { children: React.ReactNode; user: AppUser|null; onLogout: ()=>void; }
export default function MainLayout({ children, user, onLogout }: Props) {
  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} onLogout={onLogout}/>
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}
