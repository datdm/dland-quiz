import { AppUser } from './types';
const K = { USERS:'qp_users', CU:'qp_current_user' };
function gid() { return Date.now().toString(36)+Math.random().toString(36).slice(2); }
export function initAuth():void {
  if(typeof window==='undefined') return;
  const users=getUsers();
  if(!users.find(u=>u.username==='admin')) {
    users.push({id:'admin_default',username:'admin',password:'admin123',displayName:'Administrator',role:'admin',createdAt:new Date().toISOString()});
    localStorage.setItem(K.USERS,JSON.stringify(users));
  }
}
export function getUsers():AppUser[] {
  if(typeof window==='undefined') return [];
  try{return JSON.parse(localStorage.getItem(K.USERS)||'[]');}catch{return [];}
}
export function getCurrentUser():AppUser|null {
  if(typeof window==='undefined') return null;
  const uid=localStorage.getItem(K.CU); if(!uid) return null;
  return getUsers().find(u=>u.id===uid)||null;
}
export function loginUser(username:string,password:string):AppUser|null {
  const u=getUsers().find(u=>u.username===username&&u.password===password);
  if(!u) return null; localStorage.setItem(K.CU,u.id); return u;
}
export function registerUser(username:string,password:string,displayName:string):AppUser|string {
  const users=getUsers();
  if(users.find(u=>u.username===username)) return 'Tên đăng nhập đã tồn tại.';
  if(username.length<3) return 'Tên đăng nhập tối thiểu 3 ký tự.';
  if(password.length<4) return 'Mật khẩu tối thiểu 4 ký tự.';
  const u:AppUser={id:gid(),username,password,displayName:displayName||username,role:'user',createdAt:new Date().toISOString()};
  users.push(u); localStorage.setItem(K.USERS,JSON.stringify(users)); localStorage.setItem(K.CU,u.id); return u;
}
export function logoutUser():void { localStorage.removeItem(K.CU); }
