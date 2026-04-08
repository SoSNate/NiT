import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, Clock, CheckCircle, XCircle, Award } from 'lucide-react'
import {
  COURSE_LABELS, DIFFICULTY_LABELS, pickExamQuestions,
  type CourseId, type BankQuestion,
} from '../utils/questionBank'

interface Props { onBack: () => void }

type Phase = 'setup' | 'exam' | 'results'

interface Answer {
  chosen: number | null
}

const QUESTION_COUNTS = [10, 15, 20, 30]
const TIME_OPTIONS = [
  { label: '30 דקות', seconds: 1800 },
  { label: '60 דקות', seconds: 3600 },
  { label: '90 דקות', seconds: 5400 },
  { label: 'ללא הגבלה', seconds: 0 },
]

function fmtTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function ExamMode({ onBack }: Props) {
  const [phase, setPhase]           = useState<Phase>('setup')
  const [courseId, setCourseId]     = useState<CourseId>('physics2')
  const [nQuestions, setNQuestions] = useState(15)
  const [timeLimit, setTimeLimit]   = useState(3600)
  const [questions, setQuestions]   = useState<BankQuestion[]>([])
  const [answers, setAnswers]       = useState<Answer[]>([])
  const [current, setCurrent]       = useState(0)
  const [timeLeft, setTimeLeft]     = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (phase === 'exam' && timeLimit > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current!); finishExam(); return 0 }
          return t - 1
        })
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  function startExam() {
    const qs = pickExamQuestions(courseId, nQuestions)
    setQuestions(qs)
    setAnswers(qs.map(() => ({ chosen: null })))
    setCurrent(0)
    setTimeLeft(timeLimit)
    setPhase('exam')
  }

  function choose(i: number) {
    if (answers[current]?.chosen !== null) return
    setAnswers(prev => prev.map((a, idx) => idx === current ? { chosen: i } : a))
  }

  function finishExam() {
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('results')
  }

  // ── Setup screen ─────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="min-h-screen p-6" dir="rtl">
        <div className="max-w-xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
            <ChevronLeft size={18} />
            חזרה לבית
          </button>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 text-sm font-bold px-4 py-2 rounded-full border border-blue-500/20 mb-4">
              <Award size={16} />
              סימולציית מבחן
            </div>
            <h1 className="text-3xl font-black text-white mb-2">הגדר את המבחן</h1>
            <p className="text-slate-400">שאלות אקראיות מכל הנושאים, ניתוח שגיאות בסוף</p>
          </div>

          <div className="space-y-6 bg-white/5 border border-white/10 rounded-2xl p-6">
            <div>
              <p className="text-white font-bold mb-3">קורס</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(COURSE_LABELS) as CourseId[]).map(id => (
                  <button key={id} onClick={() => setCourseId(id)}
                    className={`p-3 rounded-xl text-sm font-medium border transition-all text-right ${
                      courseId === id
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-200'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                    }`}>
                    {COURSE_LABELS[id]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-white font-bold mb-3">מספר שאלות</p>
              <div className="flex gap-2">
                {QUESTION_COUNTS.map(n => (
                  <button key={n} onClick={() => setNQuestions(n)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                      nQuestions === n
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-200'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                    }`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-white font-bold mb-3">זמן</p>
              <div className="grid grid-cols-2 gap-2">
                {TIME_OPTIONS.map(opt => (
                  <button key={opt.seconds} onClick={() => setTimeLimit(opt.seconds)}
                    className={`py-2 rounded-xl text-sm font-medium border transition-all ${
                      timeLimit === opt.seconds
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-200'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={startExam}
              className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-200 py-3.5 rounded-xl font-bold text-base transition-all">
              התחל מבחן ▶
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Exam screen ──────────────────────────────────────────────────────────
  if (phase === 'exam') {
    const q = questions[current]
    const answered = answers[current]?.chosen !== null
    const allAnswered = answers.every(a => a.chosen !== null)

    return (
      <div className="min-h-screen p-4 md:p-6" dir="rtl">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>{current + 1} / {questions.length}</span>
              <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all" style={{ width: `${((current+1)/questions.length)*100}%` }} />
              </div>
            </div>
            {timeLimit > 0 && (
              <div className={`flex items-center gap-1.5 text-sm font-mono font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-slate-300'}`}>
                <Clock size={14} />
                {fmtTime(timeLeft)}
              </div>
            )}
            <button onClick={finishExam} className="text-slate-500 hover:text-white text-xs transition-colors">
              סיים מבחן
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-slate-400 text-xs mb-2">{q.topicLabel}</p>
              <p className="text-white text-base leading-relaxed font-medium">{q.question}</p>
            </div>

            <div className="space-y-2">
              {q.options.map((opt, i) => {
                const chosen = answers[current]?.chosen
                let cls = 'w-full text-right p-3.5 rounded-xl text-sm border transition-all '
                if (chosen === null) cls += 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white cursor-pointer'
                else if (chosen === i) cls += 'bg-blue-500/20 border-blue-500/40 text-blue-200'
                else cls += 'bg-white/3 border-transparent text-slate-600'
                return (
                  <button key={i} disabled={chosen !== null} onClick={() => choose(i)} className={cls}>
                    <span className="text-slate-400 text-xs ml-2">{String.fromCharCode(65+i)}.</span>{opt}
                  </button>
                )
              })}
            </div>

            {answered && (
              <p className="text-slate-500 text-xs text-center">במבחן — תשובות מוצגות בסוף</p>
            )}

            <div className="flex gap-3 pt-2">
              {current > 0 && (
                <button onClick={() => setCurrent(c => c - 1)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm transition-all">
                  ◀ הקודם
                </button>
              )}
              {current < questions.length - 1 ? (
                <button onClick={() => setCurrent(c => c + 1)} className="flex-1 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 text-sm font-medium transition-all">
                  הבא ▶
                </button>
              ) : (
                <button onClick={finishExam}
                  disabled={!allAnswered}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                    allAnswered
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/30'
                      : 'bg-white/5 border-white/10 text-slate-600 cursor-not-allowed'
                  }`}>
                  {allAnswered ? 'הגש מבחן ✓' : `טרם ענית על ${answers.filter(a => a.chosen === null).length} שאלות`}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1 pt-1">
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    i === current ? 'bg-blue-500 text-white' :
                    answers[i]?.chosen !== null ? 'bg-white/15 text-white' :
                    'bg-white/5 text-slate-500'
                  }`}>
                  {i+1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Results screen ───────────────────────────────────────────────────────
  const score    = answers.filter((a, i) => a.chosen === questions[i]?.correct).length
  const pct      = Math.round((score / questions.length) * 100)
  const wrong    = questions.filter((q, i) => answers[i]?.chosen !== q.correct)
  const byTopic  = wrong.reduce<Record<string, number>>((acc, q) => {
    acc[q.topicLabel] = (acc[q.topicLabel] ?? 0) + 1
    return acc
  }, {})
  const weakTopics = Object.entries(byTopic).sort((a,b) => b[1]-a[1]).slice(0,3)

  return (
    <div className="min-h-screen p-4 md:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 pt-4">
          <div className={`text-6xl font-black mb-2 ${pct >= 60 ? 'text-emerald-400' : 'text-red-400'}`}>
            {pct}%
          </div>
          <p className="text-white text-xl font-bold mb-1">{score} / {questions.length} נכון</p>
          <p className="text-slate-400 text-sm">{COURSE_LABELS[courseId]}</p>
        </div>

        {weakTopics.length > 0 && (
          <div className="bg-amber-900/20 border border-amber-500/20 rounded-2xl p-4 mb-6">
            <p className="text-amber-300 font-bold mb-2 text-sm">כדאי לחזור על:</p>
            <div className="flex flex-wrap gap-2">
              {weakTopics.map(([topic, count]) => (
                <span key={topic} className="bg-amber-500/15 text-amber-200 text-xs px-3 py-1 rounded-full">
                  {topic} ({count} שגיאות)
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 mb-8">
          {questions.map((q, i) => {
            const chosen = answers[i]?.chosen
            const isRight = chosen === q.correct
            return (
              <div key={i} className={`rounded-2xl p-4 border ${isRight ? 'bg-emerald-900/15 border-emerald-500/20' : 'bg-red-900/15 border-red-500/20'}`}>
                <div className="flex items-start gap-3">
                  {isRight
                    ? <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    : <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm leading-relaxed mb-2">{q.question}</p>
                    {!isRight && (
                      <>
                        {chosen !== null && (
                          <p className="text-red-300 text-xs mb-1">✗ בחרת: {q.options[chosen]}</p>
                        )}
                        <p className="text-emerald-300 text-xs mb-2">✓ נכון: {q.options[q.correct]}</p>
                        <p className="text-slate-400 text-xs leading-relaxed">{q.explanation}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex gap-3">
          <button onClick={() => setPhase('setup')} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 hover:text-white text-sm font-medium transition-all">
            מבחן חדש
          </button>
          <button onClick={onBack} className="flex-1 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium transition-all">
            חזרה לבית
          </button>
        </div>
      </div>
    </div>
  )
}
