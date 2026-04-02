'use client';
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
interface Props { initialSeconds:number; onTimeUp:()=>void; onTick:(r:number)=>void; }
export default function QuizTimer({ initialSeconds, onTimeUp, onTick }: Props) {
  const [seconds,setSeconds] = useState(initialSeconds);
  useEffect(()=>{setSeconds(initialSeconds);},[initialSeconds]);
  useEffect(()=>{
    const iv=setInterval(()=>{
      setSeconds(prev=>{
        if(prev<=1){clearInterval(iv);onTimeUp();return 0;}
        const next=prev-1; onTick(next); return next;
      });
    },1000);
    return ()=>clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  const h=Math.floor(seconds/3600),m=Math.floor((seconds%3600)/60),s=seconds%60;
  const p=(n:number)=>String(n).padStart(2,'0');
  const low=seconds<300;
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
      style={{border:`1px solid ${low?'rgba(239,68,68,0.55)':'rgba(20,184,166,0.45)'}`,background:'rgba(3,3,8,0.8)'}}>
      <Clock size={15} className={low?'text-red-400':'text-teal-400'}/>
      <span className="font-mono text-base font-bold tracking-widest"
        style={{color:low?'#f87171':'#14b8a6',textShadow:low?'0 0 10px rgba(239,68,68,0.7)':'0 0 10px rgba(20,184,166,0.8)'}}>
        {h>0?`${p(h)}:`:''}{p(m)}:{p(s)}
      </span>
    </div>
  );
}
