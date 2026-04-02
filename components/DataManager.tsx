'use client';
import { useState, useRef } from 'react';
import { Download, Upload, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { BackupData, AppUser, QuizResult, StoredExam } from '@/lib/types';
import { getExams, getResults } from '@/lib/storage';
import { getUsers } from '@/lib/auth';
interface Props { onRestored?: () => void; }
export default function DataManager({ onRestored }: Props) {
  const [importStatus, setImportStatus] = useState<'idle'|'success'|'error'>('idle');
  const [importMsg, setImportMsg]       = useState('');
  const [drag, setDrag]                 = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const handleExport = () => {
    const backup: BackupData = { version:'1.0', exportedAt:new Date().toISOString(), users:getUsers(), results:getResults(), exams:getExams() };
    const blob = new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href=url; a.download=`quiz-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const processImport = (file: File) => {
    if(!file.name.endsWith('.json')){setImportStatus('error');setImportMsg('Chỉ hỗ trợ .json');return;}
    const reader=new FileReader();
    reader.onload=e=>{
      try{
        const backup:BackupData=JSON.parse(e.target?.result as string);
        if(!backup.version||!backup.users) throw new Error('File không hợp lệ.');
        const eu:AppUser[]=JSON.parse(localStorage.getItem('qp_users')||'[]');
        const eun=new Set(eu.map(u=>u.username)); let nu=0;
        backup.users.forEach(u=>{if(!eun.has(u.username)){eu.push(u);nu++;}});
        localStorage.setItem('qp_users',JSON.stringify(eu));
        const er:QuizResult[]=JSON.parse(localStorage.getItem('qp_results')||'[]');
        const eri=new Set(er.map(r=>r.id)); let nr=0;
        backup.results.forEach(r=>{if(!eri.has(r.id)){er.push(r);nr++;}});
        localStorage.setItem('qp_results',JSON.stringify(er));
        const ee:StoredExam[]=JSON.parse(localStorage.getItem('qp_exams')||'[]');
        const eei=new Set(ee.map(x=>x.id)); let ne=0;
        backup.exams.forEach(x=>{if(!eei.has(x.id)){ee.push(x);ne++;}});
        localStorage.setItem('qp_exams',JSON.stringify(ee));
        setImportStatus('success');
        setImportMsg(`✓ Khôi phục: ${nu} users, ${nr} kết quả, ${ne} đề thi mới.`);
        onRestored?.();
      }catch(err:unknown){setImportStatus('error');setImportMsg(err instanceof Error?err.message:'Lỗi đọc backup.');}
    };
    reader.readAsText(file);
  };
  return (
    <div className="space-y-5">
      <div className="mystical-card p-5">
        <h3 className="font-bold text-lg mb-4 gold-glow font-cinzel flex items-center gap-2" style={{color:'var(--gold)'}}><Database size={18}/> Dữ Liệu Hiện Tại</h3>
        <p className="text-xs font-noto mb-4" style={{color:'var(--text-dim)'}}>💡 Dữ liệu trong localStorage. Export trước khi deploy/xóa cache.</p>
        <button className="btn-gold w-full flex items-center justify-center gap-2 font-cinzel" onClick={handleExport}><Download size={16}/> Export Backup (.json)</button>
      </div>
      <div className="mystical-card p-5">
        <h3 className="font-bold text-lg mb-4 font-cinzel flex items-center gap-2" style={{color:'var(--gold)'}}><Upload size={18}/> Khôi Phục Dữ Liệu</h3>
        <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${drag?'border-teal-500':''}`}
          style={drag?{}:{borderColor:'color-mix(in srgb, var(--teal) 30%, transparent)'}}
          onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
          onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)processImport(f);}}
          onClick={()=>fileRef.current?.click()}>
          <Upload size={28} className="mx-auto mb-2" style={{color:'var(--teal)'}}/>
          <p className="text-sm font-noto" style={{color:'var(--text-secondary)'}}>Kéo thả file backup JSON</p>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)processImport(f);}}/>
        </div>
        {importStatus!=='idle'&&(
          <div className={`mt-4 flex items-center gap-2 p-3 rounded-lg text-sm font-noto ${importStatus==='success'?'bg-teal-900/30 border border-teal-600/40 text-teal-300':'bg-red-900/30 border border-red-600/40 text-red-300'}`}>
            {importStatus==='success'?<CheckCircle size={16}/>:<AlertCircle size={16}/>}{importMsg}
          </div>
        )}
      </div>
    </div>
  );
}
