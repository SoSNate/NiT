/**
 * TaylorSeries.tsx — טורי טיילור ומקלורן
 * Source: Calc 2 HIT — השבוע 1.pdf, מבוא אינפי 2.pdf
 * Built: 2026-03-25
 */
import React, { useState, useMemo } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import { GlassCard, StyledSlider, SimReadout, ToggleGroup } from '../../components/SimulatorShell'
import type { QuizQuestion, GuideSection } from '../../types'

// ── SIMULATOR — קירוב טיילור ─────────────────────────────────────────────────
function factorial(n: number): number {
  if (n <= 1) return 1
  return n * factorial(n - 1)
}

function Sim({ currentStep: _cs }: { currentStep: number }) {
  const [fn, setFn] = useState<'sin' | 'cos' | 'exp'>('sin')
  const [N, setN] = useState(3)    // order
  const [x0, setX0] = useState(0) // expansion point

  // Compute Taylor coefficients around x0
  const coeffs = useMemo(() => {
    const c: number[] = []
    for (let n = 0; n <= N; n++) {
      let val = 0
      if (fn === 'sin') {
        const r = n % 4
        if (r === 0) val = Math.sin(x0)
        else if (r === 1) val = Math.cos(x0)
        else if (r === 2) val = -Math.sin(x0)
        else val = -Math.cos(x0)
      } else if (fn === 'cos') {
        const r = n % 4
        if (r === 0) val = Math.cos(x0)
        else if (r === 1) val = -Math.sin(x0)
        else if (r === 2) val = -Math.cos(x0)
        else val = Math.sin(x0)
      } else {
        val = Math.exp(x0)
      }
      c.push(val / factorial(n))
    }
    return c
  }, [fn, N, x0])

  const approx = (x: number) => coeffs.reduce((s, c, n) => s + c * Math.pow(x - x0, n), 0)
  const exact   = (x: number) => fn === 'sin' ? Math.sin(x) : fn === 'cos' ? Math.cos(x) : Math.exp(x)

  // SVG path points
  const W = 380, H = 220, cx = W / 2, cy = H / 2
  const xScale = 40, yScale = 50

  const toSvg = (x: number, y: number) => ({ sx: cx + x * xScale, sy: cy - y * yScale })

  const exactPath = useMemo(() => {
    const pts = Array.from({ length: 80 }, (_, i) => {
      const x = (i - 40) / 10
      const y = exact(x)
      if (Math.abs(y) > 4) return null
      const { sx, sy } = toSvg(x, y)
      return `${sx},${sy}`
    }).filter(Boolean)
    return `M ${pts.join(' L ')}`
  }, [fn])

  const approxPath = useMemo(() => {
    const pts = Array.from({ length: 80 }, (_, i) => {
      const x = (i - 40) / 10
      const y = approx(x)
      if (Math.abs(y) > 4) return null
      const { sx, sy } = toSvg(x, y)
      return `${sx},${sy}`
    }).filter(Boolean)
    return `M ${pts.join(' L ')}`
  }, [coeffs])

  const errAt1 = Math.abs(exact(1) - approx(1))

  return (
    <div className="w-full space-y-4" dir="ltr">
      <GlassCard className="overflow-hidden bg-slate-950">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
          <defs>
            <pattern id="tay-grid" width="40" height="50" patternUnits="userSpaceOnUse" x={cx % 40} y={cy % 50}>
              <path d={`M40 0L0 0 0 50`} fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.05" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#tay-grid)" />
          {/* Axes */}
          <line x1={20} y1={cy} x2={W-20} y2={cy} stroke="#475569" strokeWidth="1" />
          <line x1={cx} y1={10} x2={cx} y2={H-10} stroke="#475569" strokeWidth="1" />
          {/* Exact */}
          <path d={exactPath} fill="none" stroke="#22d3ee" strokeWidth="2" strokeOpacity="0.8" />
          {/* Approximation */}
          <path d={approxPath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 3" />
          {/* Legend */}
          <line x1={20} y1={16} x2={40} y2={16} stroke="#22d3ee" strokeWidth="2" />
          <text x={44} y={20} fill="#22d3ee" fontSize="9">{fn}(x)</text>
          <line x1={100} y1={16} x2={120} y2={16} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
          <text x={124} y={20} fill="#f59e0b" fontSize="9">T{N}(x)</text>
        </svg>
      </GlassCard>

      <SimReadout label={`שגיאה ב-x=1 (T${N})`} value={errAt1.toExponential(2)} unit="" />

      <ToggleGroup
        value={fn}
        onChange={v => setFn(v as typeof fn)}
        options={[
          { value: 'sin', label: 'sin(x)' },
          { value: 'cos', label: 'cos(x)' },
          { value: 'exp', label: 'eˣ' },
        ]}
      />
      <StyledSlider label="סדר N" value={N} min={1} max={8} step={1} unit="" onChange={setN} />
      <StyledSlider label="נקודת פיתוח x₀" value={x0} min={-2} max={2} step={0.5} unit="" onChange={setX0} />
    </div>
  )
}

// ── STEP 1 — זיהוי ────────────────────────────────────────────────────────────
const step1 = <PatternStep
  scenario="רוצים לחשב sin(0.1) בדיוק רב. מה הגישה הנכונה?"
  prompt="מה הפיתוח המתאים?"
  options={[
    { label: 'sin(x) ≈ x לסדר ראשון (x קטן)', desc: 'נכון — אבל דיוק מוגבל', correct: false },
    { label: 'sin(x) = x - x³/3! + x⁵/5! - ... (מקלורן)', desc: 'נכון! הוסף איברים עד דיוק הרצוי', correct: true },
    { label: 'השתמש בטבלת ערכים', desc: 'אפשרי, אבל לא אנליטי', correct: false },
    { label: 'sin(x) = cos(π/2 - x) → חשב cos', desc: 'נכון מתמטית אבל לא עוזר', correct: false },
  ]}
  correctFeedback="מקלורן של sin: sin(x) = x - x³/6 + x⁵/120 - ... עבור x=0.1: ≈ 0.1 - 0.000167 ≈ 0.09983. מדויק!"
/>

// ── STEP 2 — עיקרון ───────────────────────────────────────────────────────────
const step2 = <PrincipleStep
  heading="טורי טיילור — מסגרת מלאה:"
  items={[
    {
      title: 'הגדרה: טיילור סביב x₀',
      content: <div className="space-y-1">
        <Formula c="f(x) = Σ f⁽ⁿ⁾(x₀)/n! · (x-x₀)ⁿ" color="text-yellow-300" />
        <p className="text-slate-400 text-xs">מקלורן = טיילור סביב x₀=0</p>
      </div>,
    },
    {
      title: 'טורים מרכזיים (שינון!)',
      content: <div className="space-y-1 text-xs">
        <div className="bg-white/5 rounded p-2" dir="ltr">
          <span className="text-blue-300">eˣ = </span>
          <span className="text-slate-300">1 + x + x²/2! + x³/3! + ...</span>
        </div>
        <div className="bg-white/5 rounded p-2" dir="ltr">
          <span className="text-emerald-300">sin x = </span>
          <span className="text-slate-300">x - x³/3! + x⁵/5! - ...</span>
        </div>
        <div className="bg-white/5 rounded p-2" dir="ltr">
          <span className="text-purple-300">cos x = </span>
          <span className="text-slate-300">1 - x²/2! + x⁴/4! - ...</span>
        </div>
        <div className="bg-white/5 rounded p-2" dir="ltr">
          <span className="text-orange-300">ln(1+x) = </span>
          <span className="text-slate-300">x - x²/2 + x³/3 - ... (|x|≤1)</span>
        </div>
        <div className="bg-white/5 rounded p-2" dir="ltr">
          <span className="text-pink-300">1/(1-x) = </span>
          <span className="text-slate-300">1 + x + x² + x³ + ... (|x|&lt;1)</span>
        </div>
      </div>,
      accent: 'text-yellow-400',
    },
    {
      title: 'שארית לגרנז\'',
      content: <div className="space-y-1">
        <Formula c="|R_n(x)| ≤ M·|x-x₀|^(n+1) / (n+1)!" color="text-red-300" />
        <p className="text-slate-400 text-xs">M = מקסימום |f⁽ⁿ⁺¹⁾| בקטע. מגדיר את השגיאה המקסימלית.</p>
      </div>,
      accent: 'text-red-400',
    },
    {
      title: 'רדיוס התכנסות',
      content: <div className="space-y-1">
        <Formula c="R = lim |aₙ/aₙ₊₁| (מבחן מנה)" color="text-cyan-300" />
        <p className="text-slate-400 text-xs">eˣ, sin, cos: R=∞. ln(1+x): R=1. 1/(1-x): R=1.</p>
        <Note color="blue" children={<>בגבולות — בדוק כל קצה בנפרד</>} />
      </div>,
      accent: 'text-cyan-400',
    },
  ]}
/>

// ── STEP 3 — דוגמה ────────────────────────────────────────────────────────────
const step3 = <WorkedExample
  examLabel="מבחן HIT 2024 — טורי מקלורן וגבולות"
  problem={<p>חשב: <span dir="ltr">lim(x→0) [sin(x) - x + x³/6] / x⁵</span></p>}
  hint="פתח sin(x) לטיילור עד סדר 5 ופשט."
  solution={[
    {
      label: 'שלב 1: פיתוח sin(x)',
      content: <div className="space-y-1">
        <Formula c="sin(x) = x - x³/3! + x⁵/5! - ..." color="text-blue-300" />
        <p className="text-slate-400 text-xs" dir="ltr">sin(x) = x - x³/6 + x⁵/120 - ...</p>
      </div>,
    },
    {
      label: 'שלב 2: המונה',
      content: <div className="space-y-1">
        <p className="text-slate-300 text-sm" dir="ltr">sin(x) - x + x³/6 = [x - x³/6 + x⁵/120 - ...] - x + x³/6</p>
        <Formula c="= x⁵/120 - ..." color="text-emerald-300" />
      </div>,
    },
    {
      label: 'שלב 3: גבול',
      content: <div className="space-y-1">
        <Formula c="lim x→0 [x⁵/120] / x⁵ = 1/120" color="text-yellow-300" />
        <Note color="green" children={<>כשמחלקים באותו חזקה — נשאר המקדם בלבד</>} />
      </div>,
    },
  ]}
/>

// ── QUIZ ──────────────────────────────────────────────────────────────────────
export const quiz: QuizQuestion[] = [
  {
    question: 'מה האיבר הראשון שאינו אפס בפיתוח מקלורן של sin(x)?',
    options: ['1', 'x', 'x²/2!', '-x³/3!'],
    correct: 1,
    explanation: 'sin(x) = x - x³/3! + ... האיבר הראשון הוא x (סדר 1).',
  },
  {
    question: 'מה רדיוס ההתכנסות של טור ln(1+x)?',
    options: ['R = ∞', 'R = 0', 'R = 1', 'R = e'],
    correct: 2,
    explanation: 'ln(1+x) מתכנס ל-|x| < 1. בגבול: x=1 מתכנס (טור הרמוני אלטרנטיבי), x=-1 מתבדר.',
  },
  {
    question: 'פיתוח eˣ עד סדר 2: e^{0.1} ≈ ?',
    options: ['1.10', '1.105', '1.11', '1.01'],
    correct: 1,
    explanation: 'eˣ ≈ 1 + x + x²/2 = 1 + 0.1 + 0.01/2 = 1 + 0.1 + 0.005 = 1.105.',
  },
]

// ── PRACTICE ──────────────────────────────────────────────────────────────────
export const practice: QuizQuestion[] = [
  {
    question: 'מה cos(x) סביב x=0 עד סדר 2?',
    options: ['1 - x + x²', '1 - x²/2', '1 + x²/2', 'x - x²/2'],
    correct: 1,
    explanation: 'cos(x) = 1 - x²/2! + x⁴/4! - ... עד סדר 2: 1 - x²/2.',
  },
  {
    question: 'lim(x→0) (eˣ - 1)/x = ?',
    options: ['0', '1', '∞', 'e'],
    correct: 1,
    explanation: 'eˣ = 1 + x + ... → (eˣ-1)/x = (x + x²/2 + ...)/x = 1 + x/2 + ... → 1.',
  },
  {
    question: 'מה סדר הפיתוח המינימלי של eˣ לחישוב e^{0.5} בדיוק 0.001?',
    options: ['N=2', 'N=3', 'N=4', 'N=5'],
    correct: 2,
    explanation: 'שארית: 0.5^5/5! = 0.00026 < 0.001. אז N=4 מספיק (בדוק: 0.5^5/5! = 0.00026).',
  },
  {
    question: 'מה הטור של 1/(1+x) סביב 0?',
    options: ['1+x+x²+...', '1-x+x²-x³+...', '1+x²+x⁴+...', 'x-x²+x³-...'],
    correct: 1,
    explanation: '1/(1-u) = Σuⁿ. עם u=-x: 1/(1+x) = Σ(-x)ⁿ = 1 - x + x² - x³ + ...',
  },
  {
    question: 'השגיאה בקירוב sin(0.1) ≈ 0.1 היא לכל היותר?',
    options: ['0.001', '0.000167', '0.01', '0.00001'],
    correct: 1,
    explanation: '|R₁| ≤ |x|³/3! = (0.1)³/6 = 0.001/6 ≈ 0.000167.',
  },
]

// ── GREEN NOTE ────────────────────────────────────────────────────────────────
const greenNote = [
  'שנן: eˣ, sin, cos, ln(1+x), 1/(1-x) — בסיס לכל שאלה',
  'גבול עם 0/0? → פתח טיילור של המונה והמכנה',
  'שארית לגרנז\' — בדוק דיוק בחישובים מספריים',
  'רדיוס התכנסות: מבחן מנה | aₙ₊₁/aₙ | → R',
]

// ── GUIDES ────────────────────────────────────────────────────────────────────
const guides: GuideSection[] = [
  {
    title: '📋 נוסחאות',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p className="text-yellow-400 font-bold text-xs">טורי מקלורן סטנדרטיים (שנן!):</p>
      <p className="text-xs font-mono" dir="ltr">eˣ = 1 + x + x²/2! + x³/3! + ...  (R=∞)</p>
      <p className="text-xs font-mono" dir="ltr">sin x = x - x³/3! + x⁵/5! - ...  (R=∞)</p>
      <p className="text-xs font-mono" dir="ltr">cos x = 1 - x²/2! + x⁴/4! - ...  (R=∞)</p>
      <p className="text-xs font-mono" dir="ltr">ln(1+x) = x - x²/2 + x³/3 - ...  (|x|≤1)</p>
      <p className="text-xs font-mono" dir="ltr">1/(1-x) = 1 + x + x² + ...  (|x|&lt;1)</p>
      <p className="text-blue-400 font-bold text-xs mt-2">שארית לגרנז':</p>
      <p className="text-xs font-mono" dir="ltr">|Rₙ(x)| ≤ M·|x-x₀|^(n+1) / (n+1)!</p>
      <p className="text-xs">M = מקסימום |f⁽ⁿ⁺¹⁾| בקטע</p>
    </div>,
  },
  {
    title: '🎯 במבחן HIT',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p>גבול 0/0 → פתח טיילור של המונה והמכנה עד שמשהו נשאר</p>
      <p className="text-yellow-400 font-bold text-xs">שלבים לחישוב גבול עם טיילור:</p>
      <p className="text-xs">1. זהה את הפונקציות במונה/מכנה</p>
      <p className="text-xs">2. פתח כל אחת לטיילור (סביב 0) עד הסדר הנדרש</p>
      <p className="text-xs">3. פשט — בטל את האיברים הזהים</p>
      <p className="text-xs">4. קח את הגבול — בדרך כלל נשאר מקדם בלבד</p>
      <p className="text-red-400 text-xs font-bold mt-2">שגיאות נפוצות:</p>
      <p className="text-xs">cos(x) = 1 - x²/2! (לא +). ln(1+x) ולא ln(x)</p>
    </div>,
  },
]

// ── INTRO + BRIDGE ────────────────────────────────────────────────────────────
const intro = <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
  <p>
    איך מחשב מחשב sin(0.1)? אין נוסחה סגורה — אבל יש <span className="text-yellow-400 font-semibold">טור אינסופי</span>.
    טיילור מאפשר לקרב <em>כל</em> פונקציה חלקה בפולינומים.
  </p>
  <Formula c="f(x) = Σ f⁽ⁿ⁾(x₀)/n! · (x-x₀)ⁿ" color="text-yellow-300" />
  <p className="text-slate-400 text-xs">ככל שמוסיפים איברים — הדיוק גדל.</p>
</div>

const bridge = <div className="space-y-2 text-sm text-slate-300">
  <p>מטורי חזקה (הפרק הקודם) — טיילור הוא <span className="text-emerald-400">אותו טור</span>, עם מקדמים מחושבים מנגזרות.</p>
  <Formula c="aₙ = f⁽ⁿ⁾(x₀) / n!" color="text-emerald-300" />
</div>

const theory: TheoryCard = {
  summary: 'טור טיילור מייצג פונקציה כסכום אינסופי של חזקות (x-x₀)ⁿ. מקלורן הוא המקרה x₀=0. הטורים הסטנדרטיים (eˣ, sin, cos, ln) הם כלי מפתח לגבולות, קירובים ואינטגרלים.',
  formulas: [
    { label: 'טיילור', tex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(x_0)}{n!}(x-x_0)^n', verbal: 'כל פונקציה חלקה אפשר לקרב ע"י פולינום. n! במכנה מבטל את הנגזרות החוזרות' },
    { label: 'eˣ', tex: 'e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!}' },
    { label: 'sin x', tex: '\\sin x = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n+1}}{(2n+1)!}' },
    { label: 'שארית', tex: '|R_n| \\leq \\frac{M|x-x_0|^{n+1}}{(n+1)!}', verbal: 'מגבילה את השגיאה של קירוב. כך אנחנו יודעים כמה הפולינום מדויק' },
  ],
  when: 'גבול 0/0 → פתח טיילור. חישוב מספרי → הוסף איברים עד הדיוק הנדרש. ∫f(x)dx בלי נוסחה → אינטגרל הטור.',
}

export default function TaylorSeries({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="calc2-taylor"
    title="טורי טיילור"
    subtitle="מקלורן, שארית לגרנז', גבולות וקירובים"
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
