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
      style={{border:`1px solid ${low?'rgba(239,68,68,0.55)':'color-mix(in srgb, var(--teal) 45%, transparent)'}`,background:'var(--bg-header)'}}>
      <Clock size={15} style={{color:low?'#f87171':'var(--teal)'}}/>
      <span className="font-mono text-base font-bold tracking-widest"
        style={{color:low?'#f87171':'var(--teal)',textShadow:low?'0 0 10px rgba(239,68,68,0.7)':'0 0 10px color-mix(in srgb, var(--teal) 80%, transparent)'}}>
        {h>0?`${p(h)}:`:''}{p(m)}:{p(s)}
      </span>
    </div>
  );
}
