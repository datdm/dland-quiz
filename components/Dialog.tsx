'use client';
import { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
export type DialogType = 'confirm'|'alert'|'success'|'danger';
export interface DialogProps {
  open: boolean; type?: DialogType; title: string; message: string;
  confirmLabel?: string; cancelLabel?: string;
  onConfirm: () => void; onCancel?: () => void;
}
const ICONS = {
  confirm: <Info size={22} className="text-teal-400" />,
  alert:   <AlertTriangle size={22} className="text-amber-400" />,
  success: <CheckCircle size={22} className="text-green-400" />,
  danger:  <AlertTriangle size={22} className="text-red-400" />,
};
const CBTN: Record<string,string> = {
  confirm:'bg-teal-700 hover:bg-teal-600 text-white',
  alert:'btn-gold', success:'bg-green-700 hover:bg-green-600 text-white',
  danger:'bg-red-700 hover:bg-red-600 text-white',
};
export default function Dialog({ open, type='confirm', title, message, confirmLabel='Xác nhận', cancelLabel='Huỷ', onConfirm, onCancel }: DialogProps) {
  useEffect(() => {
    const h = (e:KeyboardEvent) => { if(e.key==='Escape'&&open) onCancel?.(); };
    document.addEventListener('keydown',h); return ()=>document.removeEventListener('keydown',h);
  },[open,onCancel]);
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background:'rgba(3,3,8,0.88)', backdropFilter:'blur(6px)' }}
      onClick={e => { if(e.target===e.currentTarget) onCancel?.(); }}>
      <div className="mystical-card corner-decor dialog-enter w-full max-w-sm p-6"
        style={{ border:'1px solid rgba(245,158,11,0.4)', boxShadow:'0 0 50px rgba(59,42,109,0.6)' }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">{ICONS[type]}<h3 className="text-amber-400 font-bold text-base gold-glow font-cinzel">{title}</h3></div>
          {onCancel && <button onClick={onCancel} className="text-purple-500 hover:text-amber-400 transition ml-2"><X size={18}/></button>}
        </div>
        <hr className="divider-gold mb-4"/>
        <p className="text-purple-200 text-sm leading-relaxed mb-6 whitespace-pre-line font-noto">{message}</p>
        <div className="flex gap-3 justify-end">
          {onCancel && (
            <button onClick={onCancel} className="px-4 py-2.5 rounded-lg text-sm text-purple-300 hover:text-amber-400 transition font-noto"
              style={{ border:'1px solid rgba(109,40,217,0.4)', background:'rgba(10,15,31,0.6)' }}>
              {cancelLabel}
            </button>
          )}
          <button onClick={onConfirm} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition ${CBTN[type]}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
interface DS { open:boolean; type:DialogType; title:string; message:string; confirmLabel?:string; cancelLabel?:string; resolve?:(v:boolean)=>void; }
export function useDialog() {
  const [state, setState] = useState<DS>({ open:false, type:'confirm', title:'', message:'' });
  const showDialog = useCallback((opts:Omit<DS,'open'|'resolve'>):Promise<boolean> => {
    return new Promise(resolve => { setState({ ...opts, open:true, resolve }); });
  },[]);
  const onConfirm = useCallback(()=>{ state.resolve?.(true); setState(s=>({...s,open:false})); },[state]);
  const onCancel  = useCallback(()=>{ state.resolve?.(false); setState(s=>({...s,open:false})); },[state]);
  const dialogEl = (
    <Dialog open={state.open} type={state.type} title={state.title} message={state.message}
      confirmLabel={state.confirmLabel} cancelLabel={state.cancelLabel}
      onConfirm={onConfirm}
      onCancel={state.type!=='alert'&&state.type!=='success'?onCancel:undefined} />
  );
  return { showDialog, dialogEl };
}
