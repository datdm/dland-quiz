'use client';
import { Question, SubQuestion } from '@/lib/types';
import AudioPlayer from './AudioPlayer';
interface Props { question:Question|SubQuestion; index:number; selected:number[]; onChange:(qid:number,sel:number[])=>void; showResult?:boolean; }
const PFX=['①','②','③','④'];
export default function QuestionCard({ question, index, selected, onChange, showResult=false }: Props) {
  const pick=(idx:number)=>{
    if(showResult) return;
    if(question.type==='single') onChange(question.id,[idx]);
    else { const n=selected.includes(idx)?selected.filter(i=>i!==idx):[...selected,idx]; onChange(question.id,n); }
  };
  return (
    <div id={`question-${question.id}`} className="mystical-card corner-decor p-5 mb-4 scroll-mt-24">
      <div className="flex items-start gap-3 mb-3">
        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold flex-shrink-0 font-cinzel"
          style={{background:`color-mix(in srgb, var(--gold) 18%, transparent)`,border:`1px solid color-mix(in srgb, var(--gold) 40%, transparent)`,color:'var(--gold)'}}>
          問 {index}
        </span>
        <p className="text-sm leading-relaxed font-noto" style={{color:'var(--text-primary)'}}
          dangerouslySetInnerHTML={{__html:question.question.replace(/[①②③④⑤⑥⑦⑧⑨]/g,m=>`<span style="color:var(--gold);font-weight:700">${m}</span>`)}}/>
      </div>
      {/* Audio player */}
      {question.audioUrl && <AudioPlayer audioUrl={question.audioUrl} label="▶ 音声を再生 (Click to play)" />}
      {/* Options */}
      <div className="grid gap-2 mb-3">
        {question.options.map((opt,idx)=>{
          const sel=selected.includes(idx),ok=showResult&&question.answers.includes(idx),bad=showResult&&sel&&!question.answers.includes(idx);
          return (
            <label key={idx} className={`option-label ${!showResult&&sel?'selected':''}`}
              style={showResult?ok?{borderColor:'#22c55e',background:'rgba(34,197,94,0.12)'}:bad?{borderColor:'#ef4444',background:'rgba(239,68,68,0.1)'}:{}:{}}
              onClick={()=>pick(idx)}>
              <span className="font-bold w-5 text-center font-noto" style={{color:'var(--gold)'}}>{PFX[idx]}</span>
              <span className="text-sm font-noto" style={{color:'var(--text-primary)'}}>{opt}</span>
            </label>
          );
        })}
      </div>
      {!showResult&&(
        <div className="flex gap-6 mt-1 pl-1">
          {question.options.map((_,idx)=>(
            <label key={idx} className="flex items-center gap-1.5 cursor-pointer" style={{minHeight:'44px'}}>
              <input type={question.type==='single'?'radio':'checkbox'} name={`q_${question.id}`}
                checked={selected.includes(idx)} onChange={()=>pick(idx)} className="accent-amber-500 w-4 h-4"/>
              <span className="text-sm font-noto" style={{color:'var(--gold)'}}>{idx+1}</span>
            </label>
          ))}
        </div>
      )}
      {showResult&&question.explanation&&(
        <div className="mt-3 p-3 rounded-lg text-xs font-noto"
          style={{background:`color-mix(in srgb, var(--teal) 10%, transparent)`,border:`1px solid color-mix(in srgb, var(--teal) 30%, transparent)`,color:'var(--text-secondary)'}}>
          <span className="font-bold mr-1" style={{color:'var(--teal)'}}>解説:</span>{question.explanation}
        </div>
      )}
    </div>
  );
}
