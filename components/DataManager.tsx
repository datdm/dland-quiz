'use client';
import { useState, useRef } from 'react';
import { Download, Upload, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { BackupData, AppUser, QuizResult, StoredExam } from '@/lib/types';
import { getExams, getResults, saveExam, saveResult } from '@/lib/storage';
import { getUsers } from '@/lib/auth';

interface Props { onRestored?: () => void; }

export default function DataManager({ onRestored }: Props) {
  const [importStatus, setImportStatus] = useState<'idle'|'success'|'error'>('idle');
  const [importMsg, setImportMsg]       = useState('');
  const [drag, setDrag]                 = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Export ──────────────────────────────────────────────────
  const handleExport = () => {
    const backup: BackupData = {
      version:    '1.0',
      exportedAt: new Date().toISOString(),
      users:      getUsers(),
      results:    getResults(),
      exams:      getExams(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `quiz-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Import ──────────────────────────────────────────────────
  const processImport = (file: File) => {
    if (!file.name.endsWith('.json')) {
      setImportStatus('error'); setImportMsg('Chỉ hỗ trợ file .json'); return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const backup: BackupData = JSON.parse(e.target?.result as string);
        if (!backup.version || !backup.users) throw new Error('File backup không hợp lệ.');

        // Merge users (by username, skip duplicates)
        const existingUsers: AppUser[] = JSON.parse(localStorage.getItem('qp_users') || '[]');
        const existingUsernames = new Set(existingUsers.map(u => u.username));
        let newUsers = 0;
        backup.users.forEach(u => {
          if (!existingUsernames.has(u.username)) {
            existingUsers.push(u); newUsers++;
          }
        });
        localStorage.setItem('qp_users', JSON.stringify(existingUsers));

        // Merge results (by id)
        const existingResults: QuizResult[] = JSON.parse(localStorage.getItem('qp_results') || '[]');
        const existingResultIds = new Set(existingResults.map(r => r.id));
        let newResults = 0;
        backup.results.forEach(r => {
          if (!existingResultIds.has(r.id)) {
            existingResults.push(r); newResults++;
          }
        });
        localStorage.setItem('qp_results', JSON.stringify(existingResults));

        // Merge exams (by id)
        const existingExams: StoredExam[] = JSON.parse(localStorage.getItem('qp_exams') || '[]');
        const existingExamIds = new Set(existingExams.map(ex => ex.id));
        let newExams = 0;
        backup.exams.forEach(ex => {
          if (!existingExamIds.has(ex.id)) {
            existingExams.push(ex); newExams++;
          }
        });
        localStorage.setItem('qp_exams', JSON.stringify(existingExams));

        setImportStatus('success');
        setImportMsg(`✓ Đã khôi phục: ${newUsers} users mới, ${newResults} kết quả mới, ${newExams} đề thi mới.`);
        onRestored?.();
      } catch (err: unknown) {
        setImportStatus('error');
        setImportMsg(err instanceof Error ? err.message : 'Lỗi đọc file backup.');
      }
    };
    reader.readAsText(file);
  };

  const stats = {
    users:   typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('qp_users')||'[]') as AppUser[]).length : 0,
    results: typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('qp_results')||'[]') as QuizResult[]).length : 0,
    exams:   typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('qp_exams')||'[]') as StoredExam[]).length : 0,
  };

  return (
    <div className="space-y-5">
      {/* Current data stats */}
      <div className="mystical-card p-5">
        <h3 className="text-amber-400 font-bold text-lg mb-4 gold-glow font-cinzel flex items-center gap-2">
          <Database size={18}/> Dữ Liệu Hiện Tại
        </h3>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label:'Users', val:stats.users, color:'text-amber-400' },
            { label:'Kết quả', val:stats.results, color:'text-teal-400' },
            { label:'Đề thi', val:stats.exams, color:'text-purple-300' },
          ].map(s=>(
            <div key={s.label} className="text-center p-3 rounded-lg" style={{background:'rgba(59,42,109,0.2)',border:'1px solid rgba(245,158,11,0.15)'}}>
              <div className={`text-2xl font-bold font-cinzel ${s.color}`}>{s.val}</div>
              <p className="text-xs text-purple-500 font-noto">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="text-purple-500 text-xs font-noto mb-4">
          💡 Dữ liệu được lưu trong localStorage của trình duyệt. 
          Export để backup trước khi deploy hoặc xóa cache.
        </p>
        {/* Export button */}
        <button className="btn-gold w-full flex items-center justify-center gap-2 font-cinzel" onClick={handleExport}>
          <Download size={16}/> Export Backup (.json)
        </button>
      </div>

      {/* Import */}
      <div className="mystical-card p-5">
        <h3 className="text-amber-400 font-bold text-lg mb-4 font-cinzel flex items-center gap-2">
          <Upload size={18}/> Khôi Phục Dữ Liệu
        </h3>
        <p className="text-purple-400 text-xs font-noto mb-4">
          Upload file backup JSON để khôi phục users, kết quả, đề thi. 
          Dữ liệu mới sẽ được merge (không ghi đè dữ liệu hiện có).
        </p>
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${drag?'border-teal-500 bg-teal-900/20':'border-purple-800/40 hover:border-teal-600/50 hover:bg-teal-900/10'}`}
          onDragOver={e=>{e.preventDefault();setDrag(true);}}
          onDragLeave={()=>setDrag(false)}
          onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)processImport(f);}}
          onClick={()=>fileRef.current?.click()}>
          <Upload size={28} className="mx-auto mb-2 text-teal-500"/>
          <p className="text-purple-300 text-sm font-noto">Kéo thả hoặc click để chọn file backup</p>
          <p className="text-purple-600 text-xs mt-1 font-noto">quiz-backup-YYYY-MM-DD.json</p>
          <input ref={fileRef} type="file" accept=".json" className="hidden"
            onChange={e=>{const f=e.target.files?.[0];if(f)processImport(f);}}/>
        </div>
        {importStatus!=='idle'&&(
          <div className={`mt-4 flex items-center gap-2 p-3 rounded-lg text-sm font-noto ${importStatus==='success'?'bg-teal-900/30 border border-teal-600/40 text-teal-300':'bg-red-900/30 border border-red-600/40 text-red-300'}`}>
            {importStatus==='success'?<CheckCircle size={16}/>:<AlertCircle size={16}/>}
            {importMsg}
          </div>
        )}
      </div>
    </div>
  );
}
