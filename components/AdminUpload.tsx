'use client';
import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import { QuizData, StoredExam } from '@/lib/types';
import { saveExam, generateId } from '@/lib/storage';
interface Props { onUploaded: ()=>void; }
export default function AdminUpload({ onUploaded }: Props) {
  const [status,setStatus] = useState<'idle'|'success'|'error'>('idle');
  const [msg,setMsg]       = useState('');
  const [drag,setDrag]     = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const process=(file:File)=>{
    if(!file.name.endsWith('.json')){setStatus('error');setMsg('Chỉ hỗ trợ file .json');return;}
    const reader=new FileReader();
    reader.onload=e=>{
      try{
        const data:QuizData=JSON.parse(e.target?.result as string);
        if(!data.meta) throw new Error('Thiếu trường meta.');
        if(!data.questions) data.questions=[];
        const exam:StoredExam={id:generateId(),uploadedAt:new Date().toISOString(),data};
        saveExam(exam); setStatus('success');
        setMsg(`✓ ${data.meta.title} — ${data.meta.totalQuestions} câu · ${data.meta.subject} ${data.meta.level}`);
        onUploaded();
      }catch(err:unknown){setStatus('error');setMsg(err instanceof Error?err.message:'Lỗi parse JSON.');}
    };
    reader.readAsText(file);
  };
  return (
    <div className="mystical-card p-6">
      <h3 className="text-amber-400 font-bold text-lg mb-4 gold-glow font-cinzel">⬆ Upload Đề Thi (JSON)</h3>
      <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${drag?'border-teal-500 bg-teal-900/20':'border-purple-800/40 hover:border-teal-600/50 hover:bg-teal-900/10'}`}
        onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)process(f);}}
        onClick={()=>ref.current?.click()}>
        <UploadCloud size={32} className="mx-auto mb-3 text-teal-500"/>
        <p className="text-purple-300 text-sm font-noto">Kéo thả hoặc click để chọn file JSON</p>
        <p className="text-purple-600 text-xs mt-1 font-noto">JLPT · TOEIC · English · Math · ...</p>
        <input ref={ref} type="file" accept=".json" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)process(f);}}/>
      </div>
      {status!=='idle'&&(
        <div className={`mt-4 flex items-center gap-2 p-3 rounded-lg text-sm font-noto ${status==='success'?'bg-teal-900/30 border border-teal-600/40 text-teal-300':'bg-red-900/30 border border-red-600/40 text-red-300'}`}>
          {status==='success'?<CheckCircle size={16}/>:<AlertCircle size={16}/>}{msg}
        </div>
      )}
    </div>
  );
}
