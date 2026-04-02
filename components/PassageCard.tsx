'use client';
import { PassageGroup } from '@/lib/types';
import QuestionCard from './QuestionCard';
import { BookOpen } from 'lucide-react';
interface Props { passage:PassageGroup; startIndex:number; answers:Record<number,number[]>; onChange:(qid:number,sel:number[])=>void; showResult?:boolean; }
export default function PassageCard({ passage, startIndex, answers, onChange, showResult=false }: Props) {
  return (
    <div id={`passage-${passage.id}`} className="mb-6 scroll-mt-24">
      <div className="flex items-center gap-2 mb-3 px-1">
        <BookOpen size={15} className="text-teal-400"/>
        <span className="text-teal-400 font-semibold text-sm font-cinzel">{passage.mondai||''} {passage.passageTitle||'文章'}</span>
        <span className="text-purple-600 text-xs font-noto">({passage.questions.length} câu)</span>
      </div>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-2/5 flex-shrink-0">
          <div className="sticky top-20">
            <div className="passage-box">
              <div className="flex items-center gap-1 mb-3 pb-2" style={{borderBottom:'1px solid rgba(20,184,166,0.2)'}}>
                <BookOpen size={12} className="text-teal-500"/>
                <span className="text-teal-400 text-xs font-semibold font-cinzel">読解文章</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-loose text-purple-100 font-noto">{passage.passageText}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {passage.questions.map((q,idx)=>(
            <QuestionCard key={q.id} question={q} index={startIndex+idx} selected={answers[q.id]||[]} onChange={onChange} showResult={showResult}/>
          ))}
        </div>
      </div>
    </div>
  );
}
