'use client';
import { Section, PassageGroup } from '@/lib/types';
import { BookOpen } from 'lucide-react';
interface Props { sections:Section[]; passages?:PassageGroup[]; answers:Record<number,number[]>; currentQuestionId:number|null; onNavigate:(qid:number)=>void; onNavigatePassage?:(pid:string)=>void; }
export default function SectionNav({ sections, passages=[], answers, currentQuestionId, onNavigate, onNavigatePassage }: Props) {
  return (
    <div className="overflow-y-auto flex-1 space-y-4 pr-1">
      {sections.map(section=>(
        <div key={section.name}>
          <p className="text-xs text-amber-400/80 font-semibold mb-2 tracking-wide font-cinzel">
            {section.mondai&&<span className="text-purple-500 mr-1">{section.mondai}</span>}{section.name}
          </p>
          {(section.questionIds||[]).length>0&&(
            <div className="flex flex-wrap gap-1.5 mb-2">
              {section.questionIds.map(qid=>{
                const a=answers[qid]?.length>0,c=currentQuestionId===qid;
                return <button key={qid} className={`nav-badge ${c?'current':a?'answered':''}`} onClick={()=>onNavigate(qid)}>{qid}</button>;
              })}
            </div>
          )}
          {(section.passageIds||[]).map(pid=>{
            const pg=passages.find(p=>p.id===pid); if(!pg) return null;
            return (
              <div key={pid} className="ml-1 mb-2">
                <button className="flex items-center gap-1 text-xs text-teal-400/80 hover:text-teal-300 mb-1.5 transition font-noto"
                  onClick={()=>onNavigatePassage?.(pid)}>
                  <BookOpen size={10}/><span>{pg.mondai||''} {pg.passageTitle||pid}</span>
                </button>
                <div className="flex flex-wrap gap-1 ml-2">
                  {pg.questions.map(q=>{
                    const a=answers[q.id]?.length>0,c=currentQuestionId===q.id;
                    return <button key={q.id} className={`nav-badge ${c?'current':a?'answered':''}`}
                      style={{width:28,height:28,fontSize:'0.65rem'}} onClick={()=>onNavigate(q.id)}>{q.id}</button>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
