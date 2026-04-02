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
    setTimeout(() => document.getElementById(`question-${qid}`)?.scrollIntoView({ behavior:'smooth', block:'start' }), 80);
  };
  const navP = (pid: string) => {
    setDrawerOpen(false);
    setTimeout(() => document.getElementById(`passage-${pid}`)?.scrollIntoView({ behavior:'smooth', block:'start' }), 80);
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
        type:'confirm', title:'Nộp Bài',
        message:`Bạn đã trả lời ${answered}/${allQIds.length} câu.\nBạn có chắc muốn nộp bài không?`,
        confirmLabel:'Nộp bài', cancelLabel:'Tiếp tục làm',
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
    <div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg-grad)'}}>
      <LoadingSpinner size={40} text="Đang tải đề thi..." />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{background:'var(--bg-grad)'}}>
      {dialogEl}
      {/* Header */}
      <header className="app-header sticky top-0 z-50 px-3 md:px-4 py-2 flex items-center justify-between gap-2">
        <Link href="/">
          <button className="flex items-center gap-1 text-sm font-noto transition" style={{color:'var(--text-muted)',minHeight:'44px'}}>
            <ArrowLeft size={14} /> <span className="hidden sm:inline">Quay lại</span>
          </button>
        </Link>
        <div className="flex-1 flex justify-center px-2">
          <span className="px-3 py-1 rounded-full text-xs md:text-sm font-semibold font-cinzel truncate max-w-xs"
            style={{ background:`color-mix(in srgb, var(--gold) 14%, transparent)`, border:'1px solid var(--border-card)', color:'var(--gold)' }}>
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
        {/* Questions */}
        <main className="flex-1 px-3 md:px-5 py-4 overflow-y-auto" style={{ height:'calc(100vh - 52px)' }}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-semibold text-sm font-noto" style={{color:'var(--gold)'}}>{exam.data.meta.title}</h1>
            <span className="text-xs font-noto" style={{color:'var(--text-dim)'}}>{answeredCount}/{totalCount} đã trả lời</span>
          </div>
          {exam.data.questions.map((q, idx) => (
            <QuestionCard key={q.id} question={q} index={idx+1} selected={answers[q.id]||[]} onChange={handleAnswerChange} />
          ))}
          {(exam.data.passages || []).map(pg => (
            <PassageCard key={pg.id} passage={pg} startIndex={passageStartIdx[pg.id]} answers={answers} onChange={handleAnswerChange} />
          ))}
          <div className="h-24 md:h-8" />
        </main>

        {/* RIGHT SIDEBAR — w-72 desktop */}
        <aside className="hidden md:flex w-72 flex-shrink-0 flex-col p-4 gap-3 overflow-y-auto"
          style={{ height:'calc(100vh - 52px)', borderLeft:'1px solid var(--border-card)', background:'var(--bg-sidebar)' }}>
          <div className="mystical-card p-4 text-center flex-shrink-0">
            <div className="text-3xl font-bold gold-glow font-cinzel" style={{color:'var(--gold)'}}>
              {answeredCount}<span className="text-lg" style={{color:'var(--text-dim)'}}>/{totalCount}</span>
            </div>
            <p className="text-xs mt-1 font-noto" style={{color:'var(--text-dim)'}}>Đã trả lời</p>
            <div className="mt-3 h-2 rounded-full overflow-hidden w-full" style={{ background:`color-mix(in srgb, var(--gold) 15%, transparent)` }}>
              <div className="h-full rounded-full transition-all"
                style={{ width:`${totalCount > 0 ? (answeredCount/totalCount)*100 : 0}%`,
                  background:'linear-gradient(90deg, var(--gold-dark), var(--gold))' }} />
            </div>
            <p className="text-xs mt-1 font-noto" style={{color:'var(--text-dim)'}}>
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
            background:`linear-gradient(135deg, color-mix(in srgb, var(--gold-dark) 80%, #000), var(--gold))`,
            border:'1px solid var(--gold)', color:'#030308',
            padding:'10px 16px', minHeight:'44px',
            boxShadow:'0 0 20px color-mix(in srgb, var(--gold) 40%, transparent)',
          }}
          onClick={() => setDrawerOpen(true)}>
          <ListOrdered size={16} />{answeredCount}/{totalCount}<ChevronUp size={14} />
        </button>
      </div>

      {/* Mobile Bottom Drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0" style={{background:'rgba(0,0,0,0.6)'}} onClick={() => setDrawerOpen(false)} />
          <div className="relative drawer-enter rounded-t-2xl flex flex-col"
            style={{ background:'var(--bg-sidebar)', border:'1px solid var(--border-card)', borderBottom:'none', maxHeight:'72vh' }}>
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{background:'var(--border-card)'}} />
            </div>
            <div className="flex items-center justify-between px-5 py-3" style={{borderBottom:'1px solid var(--border-card)'}}>
              <div className="flex items-center gap-2">
                <ListOrdered size={16} style={{color:'var(--gold)'}} />
                <span className="font-bold text-sm font-cinzel" style={{color:'var(--gold)'}}>Câu hỏi</span>
                <span className="text-xs font-noto" style={{color:'var(--text-dim)'}}>{answeredCount}/{totalCount}</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{color:'var(--text-muted)'}}><X size={18} /></button>
            </div>
            <div className="px-5 py-2">
              <div className="h-1.5 rounded-full overflow-hidden" style={{background:`color-mix(in srgb, var(--gold) 15%, transparent)`}}>
                <div className="h-full rounded-full transition-all"
                  style={{width:`${totalCount>0?(answeredCount/totalCount)*100:0}%`, background:'var(--gold)'}} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-3">
              <SectionNav sections={exam.data.meta.sections} passages={exam.data.passages || []}
                answers={answers} currentQuestionId={currentQId} onNavigate={navQ} onNavigatePassage={navP} />
            </div>
            <div className="px-5 pb-6 pt-2" style={{borderTop:'1px solid var(--border-card)'}}>
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
