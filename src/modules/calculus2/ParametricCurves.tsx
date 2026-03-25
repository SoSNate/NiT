/**
 * ParametricCurves.tsx — עקומות פרמטריות וקוטביות
 * Source: Calc 2 HIT — מבוא אינפי 2.pdf, List_1-3.pdf
 * Built: 2026-03-25
 */
import React, { useState, useMemo } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import { GlassCard, StyledSlider, SimReadout, ToggleGroup } from '../../components/SimulatorShell'
import type { QuizQuestion, GuideSection } from '../../types'

// ── SIMULATOR ─────────────────────────────────────────────────────────────────
function Sim({ currentStep: _cs }: { currentStep: number }) {
  const [mode, setMode] = useState<'ellipse' | 'lemniscate' | 'spiral'>('ellipse')
  const [a, setA] = useState(2)
  const [b, setB] = useState(1)
  const [tEnd, setTEnd] = useState(Math.PI * 2)

  const W = 380, H = 220, cx = W / 2, cy = H / 2
  const scale = 50

  const path = useMemo(() => {
    const N = 200
    const pts: string[] = []
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * tEnd
      let x = 0, y = 0
      if (mode === 'ellipse') {
        x = a * Math.cos(t)
        y = b * Math.sin(t)
      } else if (mode === 'lemniscate') {
        const r2 = a * a * Math.cos(2 * t)
        if (r2 < 0) continue
        const r = Math.sqrt(r2)
        x = r * Math.cos(t)
        y = r * Math.sin(t)
      } else {
        const r = a * t / (2 * Math.PI)
        x = r * Math.cos(t)
        y = r * Math.sin(t)
      }
      const sx = cx + x * scale
      const sy = cy - y * scale
      pts.push(i === 0 || pts.length === 0 ? `M${sx},${sy}` : `L${sx},${sy}`)
    }
    return pts.join(' ')
  }, [mode, a, b, tEnd])

  // Perimeter of ellipse (approximate)
  const perimeter = mode === 'ellipse'
    ? Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)))
    : 0

  return (
    <div className="w-full space-y-4" dir="ltr">
      <GlassCard className="overflow-hidden bg-slate-950">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
          <defs>
            <pattern id="par-grid" width="50" height="50" patternUnits="userSpaceOnUse" x={cx % 50} y={cy % 50}>
              <path d="M50 0L0 0 0 50" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.05" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#par-grid)" />
          {/* Axes */}
          <line x1={20} y1={cy} x2={W-20} y2={cy} stroke="#475569" strokeWidth="1" />
          <line x1={cx} y1={10} x2={cx} y2={H-10} stroke="#475569" strokeWidth="1" />
          {/* Curve */}
          <path d={path} fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
          {/* Mode label */}
          <text x={W/2} y={H-8} textAnchor="middle" fill="#64748b" fontSize="9">
            {mode === 'ellipse' ? `x=a·cos(t), y=b·sin(t)` :
             mode === 'lemniscate' ? `r²=a²·cos(2θ)` : `r=a·t/(2π)`}
          </text>
        </svg>
      </GlassCard>

      {mode === 'ellipse' && (
        <SimReadout label="היקף אליפסה (קירוב)" value={perimeter.toFixed(2)} unit="יח'" />
      )}

      <ToggleGroup
        value={mode}
        onChange={v => setMode(v as typeof mode)}
        options={[
          { value: 'ellipse',    label: 'אליפסה' },
          { value: 'lemniscate', label: 'למניסקטה' },
          { value: 'spiral',     label: 'ספירלה' },
        ]}
      />
      <StyledSlider label="a" value={a} min={0.5} max={4} step={0.5} unit="" onChange={setA} />
      {mode === 'ellipse' && (
        <StyledSlider label="b" value={b} min={0.5} max={4} step={0.5} unit="" onChange={setB} />
      )}
      <StyledSlider label="t_end" value={tEnd} min={Math.PI} max={4 * Math.PI} step={Math.PI / 2} unit="π×" onChange={setTEnd} />
    </div>
  )
}

// ── STEP 1 — זיהוי ────────────────────────────────────────────────────────────
const step1 = <PatternStep
  scenario="עקומה פרמטרית: x=t², y=2t. מצא dy/dx ואת המשוואה של המשיק ב-t=1."
  prompt="כיצד מחשבים dy/dx לפרמטרי?"
  options={[
    { label: 'dy/dx = dy/dt (ישירות)', desc: 'שגוי — מחלקים', correct: false },
    { label: 'dy/dx = (dy/dt) / (dx/dt)', desc: 'נכון! שרשרת: dy/dx = ẏ/ẋ', correct: true },
    { label: 'dy/dx = (dx/dt) / (dy/dt)', desc: 'הפוך — זה dx/dy', correct: false },
    { label: 'אי אפשר — צריך y=f(x)', desc: 'לא נכון — ניתן חישוב עקיף', correct: false },
  ]}
  correctFeedback="dy/dx = (dy/dt)/(dx/dt) = 2/(2t) = 1/t. ב-t=1: שיפוע=1. נקודה: (1,2). משיק: y-2 = 1·(x-1) → y=x+1."
/>

// ── STEP 2 — עיקרון ───────────────────────────────────────────────────────────
const step2 = <PrincipleStep
  heading="עקומות פרמטריות וקוטביות:"
  items={[
    {
      title: 'נגזרת ראשונה ושנייה',
      content: <div className="space-y-1">
        <Formula c="dy/dx = (dy/dt) / (dx/dt)" color="text-yellow-300" />
        <Formula c="d²y/dx² = [d(dy/dx)/dt] / (dx/dt)" color="text-blue-300" />
        <p className="text-slate-400 text-xs">d²y/dx² — שיפוע הנגזרת הראשונה (קעירות)</p>
      </div>,
    },
    {
      title: 'אורך קשת',
      content: <div className="space-y-1">
        <Formula c="L = ∫√[(dx/dt)² + (dy/dt)²] dt" color="text-emerald-300" />
        <p className="text-slate-400 text-xs">בקוטביים: L = ∫√[r² + (dr/dθ)²] dθ</p>
      </div>,
      accent: 'text-emerald-400',
    },
    {
      title: 'שטח בקוטביים',
      content: <div className="space-y-1">
        <Formula c="A = ½ ∫[α,β] r(θ)² dθ" color="text-purple-300" />
        <p className="text-slate-400 text-xs">סכום סקטורים מעגליים אינפיניטסימליים</p>
        <Note color="yellow" children={<>בין שתי עקומות: A = ½∫(r_outer² - r_inner²)dθ</>} />
      </div>,
      accent: 'text-purple-400',
    },
    {
      title: 'המרה בין קואורדינטות',
      content: <div className="space-y-1 text-xs">
        <div className="grid grid-cols-2 gap-1">
          <div className="bg-white/5 rounded p-1.5" dir="ltr">x = r·cos(θ)</div>
          <div className="bg-white/5 rounded p-1.5" dir="ltr">y = r·sin(θ)</div>
          <div className="bg-white/5 rounded p-1.5" dir="ltr">r² = x² + y²</div>
          <div className="bg-white/5 rounded p-1.5" dir="ltr">θ = arctan(y/x)</div>
        </div>
      </div>,
      accent: 'text-cyan-400',
    },
  ]}
/>

// ── STEP 3 — דוגמה ────────────────────────────────────────────────────────────
const step3 = <WorkedExample
  examLabel="מבחן HIT 2023 — שטח בקוטביים"
  problem={<p>חשב את השטח הכלוא בתוך עלה הוורד <span dir="ltr">r = 2·sin(3θ)</span>.</p>}
  hint="3 עלים סימטריים — חשב עלה אחד (0 ≤ θ ≤ π/3) והכפל ב-3."
  solution={[
    {
      label: 'שלב 1: גבולות אינטגרל לעלה בודד',
      content: <div className="space-y-1">
        <p className="text-slate-300 text-sm">r=0 כאשר sin(3θ)=0 → 3θ=0 או π → θ=0 עד π/3</p>
      </div>,
    },
    {
      label: 'שלב 2: שטח עלה אחד',
      content: <div className="space-y-1">
        <Formula c="A₁ = ½∫₀^{π/3} (2sin3θ)² dθ = 2∫₀^{π/3} sin²(3θ) dθ" color="text-blue-300" />
        <p className="text-slate-400 text-xs" dir="ltr">{"= 2·∫₀^{π/3} (1-cos6θ)/2 dθ = [θ - sin(6θ)/6]₀^{π/3}"}</p>
        <Formula c="= π/3 - 0 = π/3" color="text-emerald-300" />
      </div>,
    },
    {
      label: 'שלב 3: שטח כולל',
      content: <div className="space-y-1">
        <Formula c="A = 3 · A₁ = 3 · π/3 = π" color="text-yellow-300" />
        <Note color="blue" children={<>שטח עלה הוורד r=a·sin(nθ): A = nπa²/4 (n עלים)</>} />
      </div>,
    },
  ]}
/>

// ── QUIZ ──────────────────────────────────────────────────────────────────────
const quiz: QuizQuestion[] = [
  {
    question: 'x = cos(t), y = sin(t). מהו dy/dx ב-t = π/4?',
    options: ['-1', '1', '-tan(t)', 'cos(t)'],
    correct: 0,
    explanation: 'dy/dx = (dy/dt)/(dx/dt) = cos(t)/(-sin(t)) = -cot(t). ב-π/4: -1.',
  },
  {
    question: 'שטח בקוטביים r = 3 (עיגול). A = ?',
    options: ['3π', '9π', '6π', 'π/3'],
    correct: 1,
    explanation: 'A = ½∫₀^{2π} 9 dθ = ½·9·2π = 9π = πr². כמצופה.',
  },
  {
    question: 'אורך קשת של x=t, y=t² מ-t=0 עד t=1. L = ?',
    options: ['1', '∫₀¹ √(1+4t²) dt', '∫₀¹ (1+4t) dt', '∫₀¹ 2t dt'],
    correct: 1,
    explanation: 'L = ∫√[(dx/dt)² + (dy/dt)²] dt = ∫₀¹ √(1 + (2t)²) dt = ∫₀¹ √(1+4t²) dt.',
  },
]

// ── PRACTICE ──────────────────────────────────────────────────────────────────
const practice: QuizQuestion[] = [
  {
    question: 'x=t+1, y=t². מה שיפוע המשיק ב-t=2?',
    options: ['4', '2', '1', '8'],
    correct: 0,
    explanation: 'dy/dx = 2t/1 = 2t. ב-t=2: שיפוע = 4.',
  },
  {
    question: 'מה הצורה הקרטזית של r = 2cos(θ)?',
    options: ['x² + y² = 2x', 'x² + y² = 4', 'y = 2x', 'x + y = 2'],
    correct: 0,
    explanation: 'r = 2cos(θ) → r² = 2r·cos(θ) → x²+y² = 2x. עיגול עם מרכז (1,0).',
  },
  {
    question: 'עלה הוורד r = sin(2θ). כמה עלים?',
    options: ['1', '2', '4', '8'],
    correct: 2,
    explanation: 'r = sin(nθ): אם n זוגי — 2n עלים? לא — n=2 → 4 עלים.',
  },
  {
    question: 'x = e^t, y = t. dy/dx = ?',
    options: ['e^t', 'e^{-t}', 't', '1/e^t'],
    correct: 3,
    explanation: 'dy/dx = (dy/dt)/(dx/dt) = 1/e^t = e^{-t}.',
  },
  {
    question: 'שטח r = 1 + cos(θ) (cardioid)?',
    options: ['π', '3π/2', '2π', '3π'],
    correct: 1,
    explanation: 'A = ½∫₀^{2π}(1+cosθ)² dθ = ½∫(1+2cosθ+cos²θ) dθ = ½[2π+0+π] = 3π/2.',
  },
]

// ── GREEN NOTE ────────────────────────────────────────────────────────────────
const greenNote = [
  'dy/dx = ẏ/ẋ — שרשרת. d²y/dx² = (d(ẏ/ẋ)/dt) / ẋ',
  'שטח קוטבי: A = ½∫r² dθ — זכור את ה-½!',
  'אורך קשת: L = ∫√(ẋ² + ẏ²) dt',
  'בדוק סימטריה לפני האינטגרל — חוסך חישוב',
]

// ── GUIDES ────────────────────────────────────────────────────────────────────
const guides: GuideSection[] = [
  {
    title: 'מתי להשתמש',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p className="text-yellow-400 font-bold text-xs">אבחון</p>
      <p className="text-xs">1. עקומה עם פרמטר t → dy/dx = ẏ/ẋ</p>
      <p className="text-xs">2. קוטביים + שטח → A = ½∫r²dθ</p>
      <p className="text-xs">3. קוטביים + אורך → L = ∫√(r²+(dr/dθ)²) dθ</p>
      <Note color="blue" children={<>חפש סימטריה — חשב רבע/חצי ×2/4</>} />
    </div>,
  },
  {
    title: 'שגיאות נפוצות',
    content: <div className="space-y-2 text-sm">
      <p className="text-red-400 text-xs font-bold">שגיאה #1 — שכחת ½ בשטח</p>
      <p className="text-slate-300 text-xs">A = ½∫r²dθ. תמיד! (לא ∫r²dθ)</p>
      <p className="text-red-400 text-xs font-bold mt-2">שגיאה #2 — גבולות בעלי וורד</p>
      <p className="text-slate-300 text-xs">לעלה אחד — חשב גבולות מ-r=0 ל-r=0. אל תשים 0 עד 2π אוטומטית.</p>
    </div>,
  },
]

// ── INTRO + BRIDGE ────────────────────────────────────────────────────────────
const intro = <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
  <p>
    לפעמים עקומה לא ניתן לכתוב כ-y=f(x). שימוש ב<span className="text-yellow-400 font-semibold">פרמטר t</span> מאפשר לתאר כל עקומה: x(t), y(t).
  </p>
  <Formula c="dy/dx = (dy/dt) / (dx/dt)" color="text-yellow-300" />
  <p className="text-slate-400 text-xs">קואורדינטות קוטביות — עוד כלי לסימטריה מעגלית.</p>
</div>

const bridge = <div className="space-y-2 text-sm text-slate-300">
  <p>אורך קשת מאינפי 1: <span className="text-emerald-400">L = ∫√(1+f'²) dx</span></p>
  <p>בפרמטרי: <span className="text-emerald-400">L = ∫√(ẋ²+ẏ²) dt</span></p>
  <p className="text-slate-400 text-xs">אותה רעיון — רק עם פרמטרים</p>
</div>

const theory: TheoryCard = {
  summary: 'עקומות פרמטריות x(t),y(t) מאפשרות תיאור של צורות מורכבות. נגזרות, אורך קשת ושטח מחושבים בנוסחאות ייחודיות. קוטליות r(θ) שימושיות לצורות עם סימטריה מעגלית.',
  formulas: [
    { label: 'נגזרת', tex: '\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt}' },
    { label: 'אורך קשת', tex: 'L = \\int_a^b \\sqrt{\\dot{x}^2 + \\dot{y}^2}\\, dt' },
    { label: 'שטח קוטבי', tex: 'A = \\frac{1}{2}\\int_\\alpha^\\beta r(\\theta)^2\\, d\\theta' },
  ],
  when: 'עקומה עם פרמטר → dy/dx = ẏ/ẋ. שטח/אורך בקוטליות → נוסחאות מיוחדות. בדוק סימטריה!',
}

export default function ParametricCurves({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="calc2-parametric"
    title="עקומות פרמטריות וקוטביות"
    subtitle="פרמטרי, קוטלי, אורך קשת, שטח"
    intro={intro}
    bridge={bridge}
    theory={theory}
    step1={step1}
    step2={step2}
    step3={step3}
    SimulatorComponent={Sim}
    quizQuestions={quiz}
    practiceQuestions={practice}
    greenNote={greenNote}
    guides={guides}
    onBack={onBack}
  />
}
