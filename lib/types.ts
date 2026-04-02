export interface Section { name:string; mondai?:string; questionIds:number[]; passageIds?:string[]; }
export interface QuizMeta { title:string; subject:string; level:string; exam:string; version:string; totalQuestions:number; timeLimit:number; sections:Section[]; }
export interface Question { id:number; question:string; type:'single'|'multiple'; options:string[]; answers:number[]; explanation?:string; }
export interface SubQuestion { id:number; question:string; type:'single'|'multiple'; options:string[]; answers:number[]; explanation?:string; }
export interface PassageGroup { kind:'passage'; id:string; mondai?:string; passageTitle?:string; passageText:string; questions:SubQuestion[]; }
export interface QuizData { meta:QuizMeta; questions:Question[]; passages?:PassageGroup[]; }
export interface StoredExam { id:string; uploadedAt:string; data:QuizData; }
export interface QuizProgress { examId:string; userId:string; answers:Record<number,number[]>; startedAt:number; timeRemaining:number; }
export interface QuizResult { id:string; examId:string; userId:string; examTitle:string; subject:string; finishedAt:string; totalQuestions:number; correctCount:number; sectionResults:SectionResult[]; answers:Record<number,number[]>; timeTaken:number; }
export interface SectionResult { name:string; correct:number; total:number; }
export type UserRole = 'user'|'admin';
export interface AppUser { id:string; username:string; password:string; displayName:string; role:UserRole; createdAt:string; }
export interface BackupData { version:string; exportedAt:string; users:AppUser[]; results:QuizResult[]; exams:StoredExam[]; }
