'use client';
import { Question, SubQuestion } from '@/lib/types';
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
      <div className="flex items-start gap-3 mb-4">
        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold flex-shrink-0 font-cinzel"
          style={{background:'rgba(59,42,109,0.5)',border:'1px solid rgba(245,158,11,0.4)',color:'#fbbf24'}}>問 {index}</span>
        <p className="text-sm leading-relaxed text-purple-100 font-noto"
          dangerouslySetInnerHTML={{__html:question.question.replace(/[①②③④⑤⑥⑦⑧⑨]/g,m=>`<span style="color:#fbbf24;font-weight:700">${m}</span>`)}}/>
      </div>
      <div className="grid gap-2 mb-3">
        {question.options.map((opt,idx)=>{
          const sel=selected.includes(idx),ok=showResult&&question.answers.includes(idx),bad=showResult&&sel&&!question.answers.includes(idx);
          return (
            <label key={idx} className={`option-label ${!showResult&&sel?'selected':''}`}
              style={showResult?ok?{borderColor:'#22c55e',background:'rgba(18,60,59,0.4)'}:bad?{borderColor:'#ef4444',background:'rgba(127,29,29,0.3)'}:{}:{}}
              onClick={()=>pick(idx)}>
              <span className="text-amber-400 font-bold w-5 text-center font-noto">{PFX[idx]}</span>
              <span className="text-sm text-purple-100 font-noto">{opt}</span>
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
              <span className="text-amber-400 text-sm font-noto">{idx+1}</span>
            </label>
          ))}
        </div>
      )}
      {showResult&&question.explanation&&(
        <div className="mt-3 p-3 rounded-lg text-xs text-purple-300 font-noto"
          style={{background:'rgba(18,60,59,0.25)',border:'1px solid rgba(20,184,166,0.3)'}}>
          <span className="text-teal-400 font-bold mr-1">解説:</span>{question.explanation}
        </div>
      )}
    </div>
  );
}
