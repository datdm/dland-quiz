import { StoredExam, QuizProgress, QuizResult } from './types';
const K={EXAMS:'qp_exams',RESULTS:'qp_results',PFX:'qp_prog_'};
export function getExams():StoredExam[] { if(typeof window==='undefined')return[]; try{return JSON.parse(localStorage.getItem(K.EXAMS)||'[]');}catch{return[];} }
export function getExamById(id:string){return getExams().find(e=>e.id===id);}
export function saveExam(exam:StoredExam){const a=getExams();a.push(exam);localStorage.setItem(K.EXAMS,JSON.stringify(a));}
export function deleteExam(id:string){localStorage.setItem(K.EXAMS,JSON.stringify(getExams().filter(e=>e.id!==id)));}
export function getProgress(examId:string,userId:string):QuizProgress|null {
  if(typeof window==='undefined')return null;
  try{const r=sessionStorage.getItem(K.PFX+examId+'_'+userId);return r?JSON.parse(r):null;}catch{return null;}
}
export function saveProgress(p:QuizProgress){sessionStorage.setItem(K.PFX+p.examId+'_'+p.userId,JSON.stringify(p));}
export function clearProgress(examId:string,userId:string){sessionStorage.removeItem(K.PFX+examId+'_'+userId);}
export function getResults():QuizResult[]{if(typeof window==='undefined')return[];try{return JSON.parse(localStorage.getItem(K.RESULTS)||'[]');}catch{return[];}}
export function getResultsByUser(userId:string){return getResults().filter(r=>r.userId===userId);}
export function saveResult(result:QuizResult){const a=getResults();a.unshift(result);localStorage.setItem(K.RESULTS,JSON.stringify(a));}
export function generateId(){return Date.now().toString(36)+Math.random().toString(36).slice(2);}
