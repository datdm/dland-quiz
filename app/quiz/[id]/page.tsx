'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, ListOrdered, X, ChevronUp } from 'lucide-react';
import { StoredExam, QuizResult, SectionResult } from '@/lib/types';
import { getExamById, getProgress, saveProgress, clearProgress, saveResult, generateId } from '@/lib/storage';
import { getCurrentUser, initAuth } from '@/lib/auth';
import QuizTimer from '@/components/QuizTimer';
import QuestionCard from '@/components/QuestionCard';
import PassageCard from '@/components/PassageCard';
import SectionNav from '@/components/SectionNav';
import LoadingSpinner from '@/components/LoadingSpinner';
import Dialog, { useDialog } from '@/components/Dialog';

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const [exam, setExam]                   = useState<StoredExam | null>(null);
  const [answers, setAnswers]             = useState<Record<number, number[]>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentQId, setCurrentQId]       = useState<number | null>(null);
  const [submitted, setSubmitted]         = useState(false);
  const [drawerOpen, setDrawerOpen]       = useState(false);
  const { showDialog, dialogEl }          = useDialog();
  const answersRef = useRef(answers); answersRef.current = answers;
  const timeRef    = useRef(timeRemaining); timeRef.current = timeRemaining;

  useEffect(() => {
    initAuth();
    const user = getCurrentUser(); if (!user) { router.push('/'); return; }
    const e = getExamById(id); if (!e) { router.push('/'); return; }
    setExam(e);
    const saved = getProgress(id, user.id);
    if (saved) { setAnswers(saved.answers); setTimeRemaining(saved.timeRemaining); }
    else setTimeRemaining(e.data.meta.timeLimit);
  }, [id, router]);

  useEffect(() => {
    if (!exam) return;
    const user = getCurrentUser(); if (!user) return;
    const iv = setInterval(() => {
      saveProgress({ examId:id, userId:user.id, answers:answersRef.current, startedAt:Date.now(), timeRemaining:timeRef.current });
    }, 30000);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, id]);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (!submitted) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [submitted]);

  useEffect(() => {
    if (!exam) return;
    const obs: IntersectionObserver[] = [];
    const track = (qid: number) => {
      const el = document.getElementById(`question-${qid}`); if (!el) return;
      const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setCurrentQId(qid); }, { threshold: 0.3 });
      o.observe(el); obs.push(o);
    };
    exam.data.questions.forEach(q => track(q.id));
    (exam.data.passages || []).forEach(pg => pg.questions.forEach(q => track(q.id)));
    return () => obs.forEach(o => o.disconnect());
  }, [exam]);

  const handleAnswerChange = useCallback((qid: number, sel: number[]) => {
    setAnswers(prev => ({ ...prev, [qid]: sel }));
  }, []);

  const navQ = (qid: number) => {
    setDrawerOpen(false);
    setTimeout(() => document.getElementById(`question-${qid}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };
  const navP = (pid: string) => {
    setDrawerOpen(false);
    setTimeout(() => document.getElementById(`passage-${pid}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const handleSubmit = useCallback(async (force = false) => {
    if (!exam) return;
    const user = getCurrentUser(); if (!user) return;
    const allQIds = [
      ...exam.data.questions.map(q => q.id),
      ...(exam.data.passages || []).flatMap(pg => pg.questions.map(q => q.id)),
    ];
    const answered = allQIds.filter(qid => answersRef.current[qid]?.length > 0).length;
    if (!force) {
      const ok = await showDialog({
        type: 'confirm', title: 'Nộp Bài',
        message: `Bạn đã trả lời ${answered}/${allQIds.length} câu.\nBạn có chắc muốn nộp bài không?`,
        confirmLabel: 'Nộp bài', cancelLabel: 'Tiếp tục làm',
      });
      if (!ok) return;
    }
    setSubmitted(true); clearProgress(id, user.id);
    const timeTaken = exam.data.meta.timeLimit - timeRef.current;
    const sectionResults: SectionResult[] = exam.data.meta.sections.map(section => {
      let correct = 0, total = 0;
      (section.questionIds || []).forEach(qid => {
        const q = exam.data.questions.find(x => x.id === qid); if (!q) return; total++;
        const ans = answersRef.current[qid] || [];
        if (ans.length === q.answers.length && ans.every(a => q.answers.includes(a))) correct++;
      });
      (section.passageIds || []).forEach(pid => {
        const pg = (exam.data.passages || []).find(p => p.id === pid); if (!pg) return;
        pg.questions.forEach(q => {
          total++;
          const ans = answersRef.current[q.id] || [];
          if (ans.length === q.answers.length && ans.every(a => q.answers.includes(a))) correct++;
        });
      });
      return { name: section.name, correct, total };
    });
    const correctCount = sectionResults.reduce((s, r) => s + r.correct, 0);
    const result: QuizResult = {
      id: generateId(), examId: id, userId: user.id,
      examTitle: exam.data.meta.title, subject: exam.data.meta.subject,
      finishedAt: new Date().toISOString(), totalQuestions: exam.data.meta.totalQuestions,
      correctCount, sectionResults, answers: answersRef.current, timeTaken,
    };
    saveResult(result); router.push(`/result/${result.id}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, id, router, showDialog]);

  const allQIds = exam ? [
    ...exam.data.questions.map(q => q.id),
    ...(exam.data.passages || []).flatMap(pg => pg.questions.map(q => q.id)),
  ] : [];
  const answeredCount = allQIds.filter(qid => answers[qid]?.length > 0).length;
  const totalCount    = exam?.data.meta.totalQuestions || 0;
  const passageStartIdx: Record<string, number> = {};
  if (exam) {
    let idx = exam.data.questions.length + 1;
    (exam.data.passages || []).forEach(pg => { passageStartIdx[pg.id] = idx; idx += pg.questions.length; });
  }

  if (!exam) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size={40} text="Đang tải đề thi..." />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {dialogEl}
      {/* Header */}
      <header className="app-header sticky top-0 z-50 px-3 md:px-4 py-2 flex items-center justify-between gap-2">
        <Link href="/">
          <button className="text-purple-400 hover:text-amber-400 transition flex items-center gap-1 text-sm font-noto" style={{minHeight:'44px'}}>
            <ArrowLeft size={14} /> <span className="hidden sm:inline">Quay lại</span>
          </button>
        </Link>
        <div className="flex-1 flex justify-center px-2">
          <span className="px-3 py-1 rounded-full text-xs md:text-sm font-semibold text-amber-300 font-cinzel truncate max-w-xs"
            style={{ background:'rgba(59,42,109,0.4)', border:'1px solid rgba(245,158,11,0.3)' }}>
            {exam.data.meta.subject} · {exam.data.meta.exam} · {exam.data.meta.level}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <QuizTimer initialSeconds={timeRemaining} onTimeUp={() => handleSubmit(true)} onTick={s => { timeRef.current = s; setTimeRemaining(s); }} />
          <button className="btn-gold flex items-center gap-1 text-sm py-2 px-3" style={{minHeight:'44px'}} onClick={() => handleSubmit(false)}>
            <Send size={13} /> <span className="hidden sm:inline font-cinzel">Nộp bài</span>
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Questions - full width on mobile */}
        <main className="flex-1 px-3 md:px-5 py-4 overflow-y-auto" style={{ height:'calc(100vh - 52px)' }}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-amber-400 font-semibold text-sm font-noto">{exam.data.meta.title}</h1>
            <span className="text-xs text-purple-500 font-noto">{answeredCount}/{totalCount} đã trả lời</span>
          </div>
          {exam.data.questions.map((q, idx) => (
            <QuestionCard key={q.id} question={q} index={idx+1} selected={answers[q.id]||[]} onChange={handleAnswerChange} />
          ))}
          {(exam.data.passages || []).map(pg => (
            <PassageCard key={pg.id} passage={pg} startIndex={passageStartIdx[pg.id]} answers={answers} onChange={handleAnswerChange} />
          ))}
          <div className="h-24 md:h-8" />
        </main>

        {/* RIGHT SIDEBAR - w-72 on desktop */}
        <aside className="hidden md:flex w-72 flex-shrink-0 flex-col p-4 gap-3 overflow-y-auto"
          style={{ height:'calc(100vh - 52px)', borderLeft:'1px solid rgba(59,42,109,0.4)', background:'rgba(3,3,8,0.7)' }}>
          {/* Progress card - full width */}
          <div className="mystical-card p-4 text-center flex-shrink-0">
            <div className="text-3xl font-bold text-amber-400 gold-glow font-cinzel">
              {answeredCount}<span className="text-lg text-purple-500">/{totalCount}</span>
            </div>
            <p className="text-xs text-purple-500 mt-1 font-noto">Đã trả lời</p>
            <div className="mt-3 h-2 rounded-full overflow-hidden w-full" style={{ background:'rgba(59,42,109,0.3)' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width:`${totalCount > 0 ? (answeredCount/totalCount)*100 : 0}%`,
                  background:'linear-gradient(90deg,#92400e,#f59e0b)' }} />
            </div>
            <p className="text-xs text-purple-600 mt-1 font-noto">
              {totalCount > 0 ? Math.round((answeredCount/totalCount)*100) : 0}% hoàn thành
            </p>
          </div>

          <hr className="divider-gold flex-shrink-0" />

          <SectionNav sections={exam.data.meta.sections} passages={exam.data.passages || []}
            answers={answers} currentQuestionId={currentQId}
            onNavigate={navQ} onNavigatePassage={navP} />

          <button className="btn-gold w-full text-sm flex items-center justify-center gap-2 flex-shrink-0 mt-auto font-cinzel"
            onClick={() => handleSubmit(false)}>
            <Send size={13} /> Nộp bài
          </button>
        </aside>
      </div>

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-5 right-4 z-40">
        <button
          className="flex items-center gap-2 rounded-full text-sm font-bold shadow-lg font-cinzel"
          style={{
            background:'linear-gradient(135deg,#3b2a6d,#123c3b)',
            border:'1px solid rgba(245,158,11,0.5)',
            color:'#fbbf24', padding:'10px 16px',
            boxShadow:'0 0 20px rgba(59,42,109,0.6)', minHeight:'44px',
          }}
          onClick={() => setDrawerOpen(true)}>
          <ListOrdered size={16} />{answeredCount}/{totalCount}<ChevronUp size={14} />
        </button>
      </div>

      {/* Mobile Bottom Drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0" style={{background:'rgba(3,3,8,0.7)'}} onClick={() => setDrawerOpen(false)} />
          <div className="relative drawer-enter rounded-t-2xl flex flex-col"
            style={{background:'radial-gradient(ellipse at 50% 100%, #3b2a6d 0%, #0a0f1f 60%, #030308 100%)',
              border:'1px solid rgba(245,158,11,0.3)',borderBottom:'none',maxHeight:'70vh'}}>
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{background:'rgba(245,158,11,0.3)'}} />
            </div>
            <div className="flex items-center justify-between px-5 py-3" style={{borderBottom:'1px solid rgba(59,42,109,0.4)'}}>
              <div className="flex items-center gap-2">
                <ListOrdered size={16} className="text-amber-400" />
                <span className="text-amber-400 font-bold text-sm font-cinzel">Câu hỏi</span>
                <span className="text-xs text-purple-500 font-noto">{answeredCount}/{totalCount}</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="text-purple-400 hover:text-amber-400 p-1"><X size={18} /></button>
            </div>
            <div className="px-5 py-2">
              <div className="h-1.5 rounded-full overflow-hidden" style={{background:'rgba(59,42,109,0.3)'}}>
                <div className="h-full rounded-full transition-all"
                  style={{width:`${totalCount>0?(answeredCount/totalCount)*100:0}%`,background:'linear-gradient(90deg,#92400e,#f59e0b)'}} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-3">
              <SectionNav sections={exam.data.meta.sections} passages={exam.data.passages || []}
                answers={answers} currentQuestionId={currentQId} onNavigate={navQ} onNavigatePassage={navP} />
            </div>
            <div className="px-5 pb-6 pt-2" style={{borderTop:'1px solid rgba(59,42,109,0.3)'}}>
              <button className="btn-gold w-full flex items-center justify-center gap-2 font-cinzel"
                onClick={() => { setDrawerOpen(false); handleSubmit(false); }}>
                <Send size={14} /> Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
