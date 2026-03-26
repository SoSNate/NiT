import React, { useState, useEffect } from 'react'
import { ArrowRight, BookOpen, X, CheckCircle, XCircle, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { BlockMath } from './Math'
import { useNotes, useProgress } from '../hooks/useNotes'
import { useLearningData } from '../hooks/useLearningData'
import { useJournal } from './LearningJournal'

export interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation: string
}

export interface GuideSection {
  title: string
  content: React.ReactNode
}

export interface TheoryCard {
  summary: string
  formulas: { label: string; tex: string; verbal?: string }[]
  when: string
}

export interface GenericLearningModuleProps {
  moduleId: string
  title: string
  subtitle: string
  intro: React.ReactNode        // הקדמה קצרה — shown before step 1
  theory?: TheoryCard           // מבוא עיוני — הגדרה, נוסחאות, מתי משתמשים
  bridge?: React.ReactNode      // גשר מהסמסטר הקודם — מה כבר יודעים
  step1: React.ReactNode        // זיהוי הסוג
  step2: React.ReactNode        // עיקרון / חוק
  step3: React.ReactNode        // דוגמה מודרכת
  SimulatorComponent: React.FC<{ currentStep: number }>
  practiceQuestions?: QuizQuestion[] // שאלות אימון מיוצרות (קדם סימולציה)
  quizQuestions: QuizQuestion[] // שאלות מבחנים אמיתיים (סימולציה)
  greenNote: string[]           // 4 צעדים לפתרון
  guides: GuideSection[]        // מדריכים נשלפים
  onBack: () => void
}

const STEP_LABELS = ['זיהוי', 'עיקרון', 'דוגמה', 'סימולטור', 'מבחן']

function TheoryFormula({ label, tex, verbal }: { label: string; tex: string; verbal?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white/5 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-2 pt-1.5 pb-0.5">
        <p className="text-slate-500 text-[10px]">{label}</p>
        {verbal && (
          <button
            onClick={() => setOpen(v => !v)}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 px-1.5 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
          >
            {open ? 'הסתר ▲' : 'הסבר ▼'}
          </button>
        )}
      </div>
      <BlockMath tex={tex} />
      {open && verbal && (
        <p className="text-slate-300 text-xs leading-relaxed px-3 pb-3 border-t border-white/5 pt-2">
          {verbal}
        </p>
      )}
    </div>
  )
}

export default function GenericLearningModule({
  moduleId,
  title,
  subtitle,
  intro,
  theory,
  bridge,
  step1,
  step2,
  step3,
  SimulatorComponent,
  practiceQuestions,
  quizQuestions,
  greenNote,
  guides,
  onBack,
}: GenericLearningModuleProps) {
  const { step: savedMax, setStep: setSavedMax } = useProgress(moduleId)
  const [phase, setPhase] = useState<'intro' | 'learn'>('intro')
  const [currentStep, setCurrentStep] = useState(1)
  const [maxReached, setMaxReached] = useState(() => Math.max(1, savedMax))
  // Practice phase (generated questions)
  const [quizPhase, setQuizPhase] = useState<'practice' | 'exam'>(
    practiceQuestions && practiceQuestions.length > 0 ? 'practice' : 'exam'
  )
  const [practiceAnswers, setPracticeAnswers] = useState<(number | null)[]>(
    Array(practiceQuestions?.length ?? 0).fill(null)
  )
  const [practiceRetries, setPracticeRetries] = useState(0)
  // Exam phase (real HIT questions)
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(
    Array(quizQuestions.length).fill(null)
  )
  const [showGreenNote, setShowGreenNote] = useState(false)
  const [showGuides, setShowGuides] = useState(false)
  const [activeGuide, setActiveGuide] = useState(0)
  const [copied, setCopied] = useState(false)
  const { note, setNote } = useNotes(moduleId)
  const { saveQuizResult } = useLearningData()
  const { setActiveModuleId } = useJournal()
  const [quizSaved, setQuizSaved] = useState(false)

  // Tell the journal which module is currently open
  useEffect(() => { setActiveModuleId(moduleId) }, [moduleId, setActiveModuleId])

  const goStep = (s: number) => {
    if (s > maxReached) {
      setMaxReached(s)
      setSavedMax(s)
    }
    setCurrentStep(s)
  }
  const next = () => goStep(Math.min(5, currentStep + 1))

  const quizDone = quizAnswers.every(a => a !== null)
  const score = quizAnswers.reduce<number>(
    (acc, ans, i) => (ans === quizQuestions[i].correct ? acc + 1 : acc),
    0
  )

  // Save quiz result exactly once when all questions are answered
  useEffect(() => {
    if (quizDone && !quizSaved) {
      const wrongIndexes = quizAnswers.reduce<number[]>((acc, ans, i) => {
        if (ans !== quizQuestions[i].correct) acc.push(i)
        return acc
      }, [])
      saveQuizResult(moduleId, score, quizQuestions.length, wrongIndexes)
      setQuizSaved(true)
    }
  }, [quizDone, quizSaved, quizAnswers, quizQuestions, score, moduleId, saveQuizResult])

  const copyGreenNote = () => {
    const text = greenNote.map((s, i) => `${i + 1}. ${s}`).join('\n')
    navigator.clipboard.writeText(`${title} — Green Note\n\n${text}`).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── INTRO SCREEN ──────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-2xl">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-6 text-sm transition-colors"
          >
            <ArrowRight size={16} />
            חזרה לקורס
          </button>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-[2rem] backdrop-blur-xl p-5 sm:p-8">
            {/* Badge */}
            <div className="inline-block bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              הקדמה
            </div>

            <h1 className="text-3xl font-black text-white mb-1">{title}</h1>
            <p className="text-slate-400 mb-6">{subtitle}</p>

            {/* Intro content */}
            <div className="text-slate-200 text-base leading-relaxed space-y-4 mb-8">
              {intro}
            </div>

            {/* What you'll learn */}
            <div className="bg-slate-700/30 rounded-xl p-4 mb-6">
              <p className="text-emerald-400 font-semibold text-sm mb-2">מה נלמד היום:</p>
              <ol className="text-slate-300 text-sm space-y-1">
                {STEP_LABELS.map((label, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    {label}
                  </li>
                ))}
              </ol>
            </div>

            {/* Theory card — מבוא עיוני */}
            {theory && (
              <div className="bg-indigo-900/25 border border-indigo-600/30 rounded-xl p-5 mb-4 space-y-4">
                <p className="text-indigo-300 text-sm font-bold">📖 מבוא עיוני</p>
                <p className="text-slate-200 text-base leading-relaxed">{theory.summary}</p>
                {theory.formulas.length > 0 && (
                  <div className="space-y-2">
                    {theory.formulas.map((f, i) => (
                      <TheoryFormula key={i} label={f.label} tex={f.tex} verbal={f.verbal} />
                    ))}
                  </div>
                )}
                <div className="flex items-start gap-2 bg-white/5 rounded-lg px-3 py-2">
                  <span className="text-yellow-400 text-xs shrink-0 mt-0.5">⚡</span>
                  <p className="text-yellow-100 text-sm leading-relaxed">{theory.when}</p>
                </div>
              </div>
            )}

            {/* Bridge — גשר מהסמסטר הקודם */}
            {bridge && (
              <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4 mb-4">
                <p className="text-amber-400 text-xs font-bold mb-2">🔗 גשר מהסמסטר הקודם</p>
                <div className="text-slate-300 text-sm leading-relaxed">{bridge}</div>
              </div>
            )}

            <button
              onClick={() => setPhase('learn')}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl text-lg font-bold transition-all active:scale-95"
            >
              בואו נתחיל ←
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── LEARN SCREEN ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Pullout Guides Drawer */}
      {showGuides && (
        <div className="fixed inset-0 z-50 flex" dir="rtl">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowGuides(false)}
          />
          <div className="w-full max-w-md bg-[#0f1c2e] border-r border-slate-700/50 h-full overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-white font-bold text-lg">📚 מדריכים נשלפים</h3>
              <button
                onClick={() => setShowGuides(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Guide tabs */}
            <div className="flex gap-2 p-4 flex-wrap">
              {guides.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActiveGuide(i)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeGuide === i
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {g.title}
                </button>
              ))}
            </div>

            {/* Guide content */}
            <div className="flex-1 p-5 text-slate-300 leading-relaxed">
              {guides[activeGuide]?.content}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-5 w-full max-w-7xl mx-auto">

        {/* ── LEFT: Simulator — shows below steps on mobile ──────────────── */}
        <div className="w-full lg:w-[45%] bg-slate-800/50 rounded-[2rem] border border-slate-700/50 backdrop-blur-xl flex flex-col min-h-[380px] lg:min-h-[600px] overflow-hidden order-2 lg:order-1">
          {/* Sim header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <span className="text-xs text-slate-500 font-medium">סימולטור אינטרקטיבי</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <SimulatorComponent currentStep={currentStep} />
          </div>
        </div>

        {/* ── RIGHT: Steps + Notes — shows first on mobile ──────────────── */}
        <div className="w-full lg:w-[55%] flex flex-col gap-4 order-1 lg:order-2">

          {/* Header row */}
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 backdrop-blur-xl px-5 py-4 flex items-center justify-between">
            <div>
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs mb-1.5 transition-colors"
              >
                <ArrowRight size={14} />
                חזרה
              </button>
              <h2 className="text-xl font-bold text-white leading-tight">{title}</h2>
              <p className="text-slate-400 text-sm">{subtitle}</p>
            </div>

            {/* Guides button */}
            <button
              onClick={() => setShowGuides(true)}
              className="flex flex-col items-center gap-1 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-400 px-3 py-2 rounded-xl transition-all text-xs font-medium"
            >
              <BookOpen size={18} />
              מדריך
            </button>
          </div>

          {/* Step pills */}
          <div className="flex gap-1.5">
            {STEP_LABELS.map((label, i) => {
              const sNum = i + 1
              const isActive = sNum === currentStep
              const isDone = sNum < currentStep
              const isLocked = sNum > maxReached || (sNum === 5 && maxReached < 4)
              return (
                <button
                  key={i}
                  disabled={isLocked}
                  onClick={() => !isLocked && goStep(sNum)}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[44px] ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 cursor-pointer'
                      : 'bg-white/5 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {sNum}. {label}
                </button>
              )
            })}
          </div>

          {/* Step content card */}
          <div className="flex-1 bg-slate-800/50 rounded-[2rem] border border-slate-700/50 backdrop-blur-xl p-5 sm:p-6 flex flex-col gap-4 step-enter min-h-[320px]">

            {currentStep === 1 && <div className="flex-1">{step1}</div>}
            {currentStep === 2 && <div className="flex-1">{step2}</div>}
            {currentStep === 3 && <div className="flex-1">{step3}</div>}

            {currentStep === 4 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
                <div className="text-4xl mb-2">🔬</div>
                <p className="text-emerald-400 font-bold text-lg">סימולטור פעיל</p>
                <p className="text-slate-400 text-sm max-w-xs">
                  הזז את הסליידרים בצד שמאל וראה כיצד המערכת הפיזיקלית מגיבה בזמן אמת.
                </p>
                <div className="bg-white/5 rounded-xl p-3 text-xs text-slate-500 max-w-xs">
                  💡 שאל את עצמך: מה קורה כשאני מכפיל את הפרמטר פי 2?
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="flex-1 flex flex-col gap-4">

                {/* ── Phase toggle tabs ── */}
                {practiceQuestions && practiceQuestions.length > 0 && (
                  <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                    <button
                      onClick={() => setQuizPhase('practice')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        quizPhase === 'practice'
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/30'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      🎯 אימון ({practiceQuestions.length} שאלות)
                    </button>
                    <button
                      onClick={() => setQuizPhase('exam')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        quizPhase === 'exam'
                          ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      📝 סימולציית מבחן ({quizQuestions.length} שאלות)
                    </button>
                  </div>
                )}

                {/* ── PRACTICE PHASE ── */}
                {quizPhase === 'practice' && practiceQuestions && (
                  <>
                    <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl px-4 py-2.5 text-xs text-amber-300 leading-relaxed">
                      <span className="font-bold">אימון:</span> שאלות בסגנון מבחן — מיוצרות לתרגול. פידבק מיידי, אפשר לנסות שוב.
                    </div>

                    {practiceQuestions.map((q, qi) => (
                      <div key={`p-${qi}-${practiceRetries}`} className="bg-slate-700/30 rounded-xl p-4 space-y-3 border border-slate-600/30">
                        <p className="text-slate-100 text-base font-medium leading-relaxed">{q.question}</p>
                        <div className="flex flex-col gap-2">
                          {q.options.map((opt, oi) => {
                            const answered = practiceAnswers[qi] !== null
                            const selected = practiceAnswers[qi] === oi
                            const isCorrect = oi === q.correct
                            return (
                              <button
                                key={oi}
                                disabled={answered}
                                onClick={() => {
                                  const next = [...practiceAnswers]
                                  next[qi] = oi
                                  setPracticeAnswers(next)
                                }}
                                className={`text-right px-4 py-3 rounded-xl text-sm leading-snug transition-all flex items-center gap-2 min-h-[52px] ${
                                  !answered
                                    ? 'bg-slate-700/60 hover:bg-slate-600/60 text-slate-100 border border-slate-600/40'
                                    : isCorrect
                                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                                    : selected
                                    ? 'bg-red-500/20 text-red-200 border border-red-500/40'
                                    : 'bg-slate-800/30 text-slate-600 border border-transparent'
                                }`}
                              >
                                {answered && isCorrect && <CheckCircle size={14} className="text-emerald-400 shrink-0" />}
                                {answered && selected && !isCorrect && <XCircle size={14} className="text-red-400 shrink-0" />}
                                <span>{opt}</span>
                              </button>
                            )
                          })}
                        </div>
                        {practiceAnswers[qi] !== null && (
                          <p className="text-sm text-slate-300 pt-2 border-t border-slate-700/40 leading-relaxed">
                            💬 {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}

                    {practiceAnswers.every(a => a !== null) && (
                      <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4 space-y-3">
                        <div className="text-center">
                          <p className="text-amber-400 font-black text-xl">
                            {practiceAnswers.filter((a, i) => a === practiceQuestions![i].correct).length}/{practiceQuestions.length}
                          </p>
                          <p className="text-slate-400 text-xs mt-1">ציון אימון — לא נשמר</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setPracticeAnswers(Array(practiceQuestions!.length).fill(null))
                              setPracticeRetries(r => r + 1)
                            }}
                            className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 py-2 rounded-xl text-xs font-bold transition-all"
                          >
                            🔄 נסה שוב
                          </button>
                          <button
                            onClick={() => setQuizPhase('exam')}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold transition-all"
                          >
                            המשך לסימולציה ←
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ── EXAM PHASE ── */}
                {quizPhase === 'exam' && (
                  <>
                    {!practiceQuestions?.length ? null : (
                      <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl px-4 py-2.5 text-xs text-emerald-300">
                        <span className="font-bold">סימולציית מבחן:</span> שאלות מבחני HIT אמיתיים — הציון נשמר לפרופיל המוכנות שלך.
                      </div>
                    )}

                    {quizQuestions.map((q, qi) => (
                      <div key={qi} className="bg-slate-700/30 rounded-xl p-4 space-y-3 border border-slate-600/30">
                        <p className="text-slate-100 text-base font-medium leading-relaxed">{q.question}</p>
                        <div className="flex flex-col gap-2">
                          {q.options.map((opt, oi) => {
                            const answered = quizAnswers[qi] !== null
                            const selected = quizAnswers[qi] === oi
                            const isCorrect = oi === q.correct
                            return (
                              <button
                                key={oi}
                                disabled={answered}
                                onClick={() => {
                                  const next = [...quizAnswers]
                                  next[qi] = oi
                                  setQuizAnswers(next)
                                }}
                                className={`text-right px-4 py-3 rounded-xl text-sm leading-snug transition-all flex items-center gap-2 min-h-[52px] ${
                                  !answered
                                    ? 'bg-slate-700/60 hover:bg-slate-600/60 text-slate-100 border border-slate-600/40'
                                    : isCorrect
                                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                                    : selected
                                    ? 'bg-red-500/20 text-red-200 border border-red-500/40'
                                    : 'bg-slate-800/30 text-slate-600 border border-transparent'
                                }`}
                              >
                                {answered && isCorrect && <CheckCircle size={14} className="text-emerald-400 shrink-0" />}
                                {answered && selected && !isCorrect && <XCircle size={14} className="text-red-400 shrink-0" />}
                                <span>{opt}</span>
                              </button>
                            )
                          })}
                        </div>
                        {quizAnswers[qi] !== null && (
                          <p className="text-sm text-slate-300 pt-2 border-t border-slate-700/40 leading-relaxed">
                            💬 {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}

                    {quizDone && (
                      <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 space-y-3">
                        <div className="text-center">
                          <p className="text-emerald-400 font-black text-2xl">{score}/{quizQuestions.length}</p>
                          <p className="text-slate-400 text-sm">
                            {score === quizQuestions.length
                              ? '🏆 מושלם! אתה מוכן למבחן!'
                              : score >= quizQuestions.length - 1
                              ? '💪 כמעט! חזור על הטעויות.'
                              : '📖 כדאי לחזור על החומר.'}
                          </p>
                        </div>

                        <button
                          onClick={() => setShowGreenNote(v => !v)}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold transition-all"
                        >
                          📝 Green Note — פתק הרמאות
                        </button>

                        {showGreenNote && (
                          <div className="bg-emerald-950/50 border border-emerald-700/30 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-emerald-400 font-bold text-sm">4 צעדים לפתרון:</p>
                              <button onClick={copyGreenNote} className="text-emerald-600 hover:text-emerald-400 transition-colors">
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                              </button>
                            </div>
                            <ol className="space-y-2">
                              {greenNote.map((step, i) => (
                                <li key={i} className="flex gap-2 text-sm text-emerald-200">
                                  <span className="text-emerald-500 font-black shrink-0">{i + 1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Next button */}
            {currentStep < 5 && (
              <button
                onClick={next}
                className="mt-auto bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-6 py-3 rounded-xl min-h-[44px] font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                המשך לשלב הבא
                <ChevronLeft size={18} />
              </button>
            )}
          </div>

          {/* Journal hint */}
          <div className="bg-teal-950/30 border border-teal-800/20 rounded-2xl px-4 py-3 flex items-center gap-3">
            <span className="text-xl select-none">📓</span>
            <div>
              <p className="text-teal-400 text-xs font-semibold">הערות ותמלול קולי</p>
              <p className="text-teal-700 text-[11px] mt-0.5">
                לחץ על הבועה בפינה השמאלית-תחתונה — תמלול חי, עריכה, שיתוף
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
