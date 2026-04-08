import React, { useState } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import type { QuizQuestion, GuideSection } from '../../types'

function Sim({ currentStep }: { currentStep: number }) {
  const [a, setA] = useState(1)
  const [funcType, setFuncType] = useState<'rect' | 'gauss' | 'exp'>('rect')

  const W = 240, H = 160, ox = W / 2, oy = H / 2

  // f(t) and its Fourier transform F(ω)
  const evalF = (t: number): number => {
    if (funcType === 'rect') return Math.abs(t) <= a ? 1 : 0
    if (funcType === 'gauss') return Math.exp(-a * t * t)
    return Math.exp(-a * Math.abs(t))
  }

  const evalFhat = (w: number): number => {
    if (funcType === 'rect') return Math.abs(w) < 1e-8 ? 2 * a : 2 * Math.sin(a * w) / w
    if (funcType === 'gauss') return Math.sqrt(Math.PI / a) * Math.exp(-w * w / (4 * a))
    return 2 * a / (a * a + w * w)
  }

  const range = [-4, 4]
  const makePoints = (fn: (x: number) => number) =>
    Array.from({ length: 100 }, (_, i) => {
      const x = range[0] + (i / 99) * (range[1] - range[0])
      const y = fn(x)
      return `${ox + x * 25},${oy - Math.max(-2, Math.min(3, y)) * 35}`
    }).join(' ')

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="flex gap-2 flex-wrap justify-center">
        {([
          ['rect', 'מלבן'],
          ['gauss', 'גאוסיאן'],
          ['exp', 'e^{-a|t|}'],
        ] as const).map(([k, label]) => (
          <button key={k} onClick={() => setFuncType(k as any)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${funcType === k ? 'bg-cyan-500 text-white' : 'bg-white/10 text-slate-400'}`}>
            {label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="240" height="160">
        <line x1="10" y1={oy} x2={W - 10} y2={oy} stroke="#334155" strokeWidth="1.5" />
        <line x1={ox} y1="10" x2={ox} y2={H - 10} stroke="#334155" strokeWidth="1.5" />
        <polyline points={makePoints(evalF)} fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="5,3" />
        <polyline points={makePoints(evalFhat)} fill="none" stroke="#06b6d4" strokeWidth="2.5" />
        <text x="12" y="16" fill="#64748b" fontSize="8">f(t)</text>
        <text x="12" y="26" fill="#06b6d4" fontSize="8">F̂(ω) (טרנספורם)</text>
      </svg>

      <div className="w-full px-3">
        <div className="flex justify-between text-xs text-slate-400 mb-0.5">
          <span>פרמטר a</span>
          <span className="text-cyan-400 font-bold">{a}</span>
        </div>
        <input type="range" min={0.5} max={3} step={0.5} value={a}
          onChange={e => setA(+e.target.value)}
          className="w-full accent-cyan-500 h-1.5 rounded-full" />
        <div className="bg-white/10 rounded-xl p-2 text-center text-xs mt-2 text-slate-300" dir="ltr">
          {funcType === 'rect' ? `F(ω) = 2sin(aω)/ω` : funcType === 'gauss' ? 'F(ω) = √(π/a)·e^{-ω²/4a}' : `F(ω) = 2a/(a²+ω²)`}
        </div>
      </div>
    </div>
  )
}

const step1 = (
  <PatternStep
    scenario={<>
      <span className="font-mono text-emerald-300" dir="ltr">{'f(t) = e^{-|t|}'}</span>
      {' '}— מצא את התמרת פורייה F(ω).
    </>}
    options={[
      { label: 'פצל לאינטגרל מ-(-∞,0) ומ-(0,∞) כי יש |t|', correct: true },
      { label: 'השתמש בטבלה ישירות', correct: false, desc: 'בסדר, אם זוכר — אבל דע לגזור' },
      { label: 'f זוגית → F(ω) = 2∫₀^∞ f·cos(ωt) dt', correct: false, desc: 'נכון גם! f=e^{-|t|} זוגית → קוסינוס-טרנספורם' },
      { label: 'השתמש בלפלס', correct: false },
    ]}
    correctFeedback="נכון! F(ω) = ∫₋∞^∞ e^{-|t|}e^{-iωt}dt. פצל: ∫₋∞^0 e^t·e^{-iωt}dt + ∫₀^∞ e^{-t}·e^{-iωt}dt = 1/(1-iω) + 1/(1+iω) = 2/(1+ω²)."
  />
)

const step2 = (
  <PrincipleStep
    heading="התמרת פורייה — כלים:"
    items={[
      {
        title: 'הגדרה',
        content: <>
          <Formula c="F(ω) = ∫_{-∞}^{∞} f(t)·e^{-iωt} dt" color="text-cyan-300" />
          <Formula c="f(t) = (1/2π)∫_{-∞}^{∞} F(ω)·e^{iωt} dω" color="text-cyan-300" />
        </>,
        accent: 'text-cyan-400',
      },
      {
        title: 'תכונות חשובות',
        content: <div className="text-xs text-slate-300 space-y-0.5" dir="ltr">
          <p><span className="text-cyan-400">f(-t):</span> F(-ω) (היפוך)</p>
          <p><span className="text-cyan-400">f(t-a):</span> e^{'{-iωa}'}·F(ω) (היסט)</p>
          <p><span className="text-cyan-400">f'(t):</span> iω·F(ω) (גזירה)</p>
          <p><span className="text-cyan-400">eᵃᵗf(t):</span> F(ω-ia) (מডולציה)</p>
          <p><span className="text-cyan-400">f*g:</span> F·G (קונבולוציה)</p>
        </div>,
        accent: 'text-cyan-400',
      },
      {
        title: 'פרסוול',
        content: <>
          <Formula c="∫|f(t)|² dt = (1/2π)∫|F(ω)|² dω" color="text-orange-300" />
          <span className="text-slate-400 text-xs">שימושי לחישוב אינטגרלים קשים</span>
        </>,
        accent: 'text-orange-400',
      },
    ]}
  />
)

const step3 = (
  <WorkedExample
    examLabel="מבחן HIT — 2024 (פורייה)"
    problem={<>
      מצא <span className="font-mono text-blue-300" dir="ltr">F{'{e^{-2|t|}}'}</span>.
      <br />השתמש בפרסוול כדי לחשב <span className="font-mono text-blue-300" dir="ltr">{'∫_{-∞}^∞ dω/(4+ω²)²'}</span>.
    </>}
    hint={"F{e^{-a|t|}} = 2a/(a²+ω²). פרסוול: ∫|f|²dt = (1/2π)∫|F|²dω."}
    solution={[
      { label: 'F(ω):', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">F(ω) = 2·2/(4+ω²) = 4/(4+ω²)</pre> },
      { label: 'פרסוול (a=2):', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">{'∫|f|²dt = ∫e^{-4|t|}dt = 2∫₀^∞e^{-4t}dt = 1/2\n(1/2π)∫|F|²dω = (1/2π)∫16/(4+ω²)²dω'}</pre> },
      { label: 'תוצאה:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">1/2 = (16/2π)∫dω/(4+ω²)²{'\n'}∫dω/(4+ω²)² = π/16</pre> },
    ]}
  />
)

export const quiz: QuizQuestion[] = [
  {
    question: 'F{f\'(t)} = ?',
    options: ['iω·F(ω)', 'F(ω)/iω', 'F\'(ω)', 'ω·F(ω)'],
    correct: 0,
    explanation: 'גזירה בזמן: F{f\'(t)} = iω·F(ω). זה ממיר נגזרת לכפל — בסיס לפתרון מד"ר.',
  },
  {
    question: 'f(t-3) מה הטרנספורם?',
    options: ['e^{-3iω}·F(ω)', 'F(ω-3)', 'F(ω+3)', 'e^{3iω}·F(ω)'],
    correct: 0,
    explanation: 'היסט בזמן: F{f(t-a)} = e^{-iaω}·F(ω). כאן a=3 → e^{-3iω}·F(ω).',
  },
  {
    question: 'F{e^{-t}·u(t)} = ?',
    options: ['1/(1+iω)', '1/(1-iω)', '1/(iω)', '2/(1+ω²)'],
    correct: 0,
    explanation: '∫₀^∞ e^{-t}·e^{-iωt}dt = ∫₀^∞ e^{-(1+iω)t}dt = 1/(1+iω).',
  },
]

const greenNote = [
  'F(ω) = ∫f(t)e^{-iωt}dt. f זוגית → F ממשי. f אי-זוגית → F דמיוני.',
  'גזירה: F{f\'}=iωF. היסט: F{f(t-a)}=e^{-iaω}F(ω). מודולציה: F{eᵃᵗf}=F(ω-ia)',
  'F{e^{-a|t|}}=2a/(a²+ω²). F{rect}=2sin(aω)/ω. F{gauss}=gauss',
  'פרסוול: ∫|f|²dt = (1/2π)∫|F|²dω — לחישוב אינטגרלים',
]

const guides: GuideSection[] = [
  {
    title: '📋 נוסחאות',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p className="text-cyan-400 font-bold text-xs">הגדרה והיפוך:</p>
      <p className="font-mono text-xs">F(ω) = ∫f(t)e^(-iωt)dt</p>
      <p className="font-mono text-xs">f(t) = (1/2π)∫F(ω)e^(iωt)dω</p>
      <p className="text-cyan-400 font-bold text-xs mt-1">זוגות נפוצים:</p>
      {[
        ['e^(-a|t|)', '2a/(a²+ω²)'],
        ['rect(t/2a)', '2sin(aω)/ω'],
        ['e^(-at)u(t)', '1/(a+iω)'],
        ['δ(t)', '1'],
      ].map(([f, F]) => (
        <div key={f} className="flex justify-between bg-white/5 rounded p-1">
          <span className="font-mono text-xs text-slate-400">{f}</span>
          <span className="font-mono text-xs text-cyan-400">{F}</span>
        </div>
      ))}
    </div>,
  },
  {
    title: '🎯 במבחן HIT',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p>שאלות פרסוול: מחשבים F(ω), ואז משווים ∫|f|²dt = (1/2π)∫|F|²dω כדי לפתור אינטגרל קשה</p>
      <p>זכור תכונות: היסט f(t-a)→e^(-iωa)F(ω), גזירה f′(t)→iωF(ω)</p>
      <p>f זוגית → F ממשי. f אי-זוגית → F דמיוני טהור</p>
    </div>,
  },
]

const intro = <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
  <p>
    התמרת פורייה = <span className="text-cyan-400 font-semibold">ניתוח ספקטרלי</span>.
    כל אות ניתן לפירוק לתדרים. זה בסיס לעיבוד אותות, MP3, JPEG.
  </p>
  <Formula c="F(ω) = ∫_{-∞}^{∞} f(t)·e^{-iωt} dt" color="text-cyan-300" />
  <p>
    ב<span className="text-yellow-400 font-semibold">כל מבחן</span>: חישוב טרנספורם + תכונות (היסט, גזירה) + פרסוול.
  </p>
</div>

const theory: TheoryCard = {
  summary: 'התמרת פורייה F(ω) = ∫f(t)e^(-iωt)dt מפרקת אות כללי (לאו דווקא תקופתי) לתדרים. בניגוד לטורי פורייה — כאן f לא חייבת להיות תקופתית. תכונות: היסט בזמן → כפל ב-e^(-iωa), גזירה → כפל ב-iω. פרסוול: אנרגיה בזמן = אנרגיה בתדר.',
  formulas: [
    { label: 'הגדרה', tex: 'F(\\omega) = \\int_{-\\infty}^{\\infty} f(t)\\,e^{-i\\omega t}\\,dt', verbal: 'ההתמרה מפרקת פונקציה לתדרים. F(ω) אומר כמה מכל תדר ω יש בפונקציה' },
    { label: 'גזירה', tex: '\\mathcal{F}\\{f\'(t)\\} = i\\omega \\cdot F(\\omega)', verbal: 'ההתמרה ההפוכה — f(t) = (1/2π)∫F(ω)e^(iωt)dω — מחזירה מתחום התדר לתחום הזמן. אנרגיית האות שמורה: ∫|f|²dt = (1/2π)∫|F|²dω (פרסוול) — שימושי לחשב אינטגרלים קשים' },
  ],
  when: 'חשב ∫ ישיר. זיהה תכונות (היסט, גזירה, קיפול) לחסוך חישוב. פרסוול לשאלות אנרגיה.',
}

export const practice: QuizQuestion[] = [
  {
    question: 'F{f\'(t)} = ?',
    options: ["F(ω)/iω", "iω·F(ω)", "ω·F(ω)", "-iω·F(ω)"],
    correct: 1,
    explanation: "תכונת גזירה: F{f'} = iω·F(ω). כפל ב-iω בתחום תדר.",
  },
  {
    question: 'f(t) = f(t-a). מה F_new(ω)?',
    options: [
      "F(ω+a)",
      "F(ω)·e^(iωa)",
      "F(ω)·e^(-iωa)",
      "F(ω)/a",
    ],
    correct: 2,
    explanation: "היסט בזמן: F{f(t-a)} = e^(-iωa)·F(ω)",
  },
  {
    question: 'מה קשר בין אנרגיית האות לאנרגיית הספקטרום?',
    options: [
      "∫|f|² dt = (1/2π)∫|F|² dω (פרסוול)",
      "∫|f|² dt = ∫|F|² dω",
      "שאין קשר",
      "∫f dt = ∫F dω",
    ],
    correct: 0,
    explanation: "פרסוול: ∫|f(t)|² dt = (1/2π)∫|F(ω)|² dω",
  },
]

export default function FourierTransform({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="series-fourier-transform"
    title="התמרת פורייה"
    subtitle="F(ω), תכונות, פרסוול"
    intro={intro} theory={theory} step1={step1} step2={step2} step3={step3}
    SimulatorComponent={Sim} quizQuestions={quiz} practiceQuestions={practice}
    greenNote={greenNote} guides={guides}
    onBack={onBack}
  />
}
