/**
 * GaussLaw.tsx — built from MODULE_SPEC: אפיון למידה - פיזיקה 2.txt
 * Source: Gemini pipeline → C:\Users\12nat\Desktop\איפון למידה\
 * Built: 2026-03-24
 */
import React, { useState } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import type { QuizQuestion, GuideSection } from '../../types'

// ── SIMULATOR — בוחר סימטריה ומציג E(r) ────────────────────────────────────
function Sim({ currentStep }: { currentStep: number }) {
  const [sym, setSym] = useState<'sphere' | 'cylinder' | 'plane'>('sphere')
  const [R, setR]     = useState(0.3)   // m — רדיוס הגוף
  const [r, setR2]    = useState(0.6)   // m — מרחק נקודת המדידה
  const [Q, setQ]     = useState(1e-6)  // C

  const eps0 = 8.85e-12
  const k    = 9e9
  const lambda = Q / 1   // C/m (מניחים L=1m)
  const sigma  = Q / (4 * Math.PI * R * R) // C/m²

  let E = 0
  let label = ''
  const inside = r < R

  if (sym === 'sphere') {
    E = inside ? 0 : k * Q / (r * r)
    label = inside ? 'E = 0 (בתוך מוליך)' : `E = kQ/r² = ${E.toExponential(2)} N/C`
  } else if (sym === 'cylinder') {
    E = inside ? 0 : lambda / (2 * Math.PI * eps0 * r)
    label = inside ? 'E = 0 (בתוך)' : `E = λ/(2πε₀r) = ${E.toExponential(2)} N/C`
  } else {
    E = sigma / (2 * eps0)
    label = `E = σ/(2ε₀) = ${E.toExponential(2)} N/C (לא תלוי r)`
  }

  const W = 260, H = 170, cx = W / 2, cy = H / 2
  const bodyR = 38
  const pointX = Math.min(cx + (r / 1.2) * (W / 2 - 20 - bodyR), W - 20)
  const eLen = Math.min(35, E * 1e-3 * 10) + 8

  const symColor = sym === 'sphere' ? '#60a5fa' : sym === 'cylinder' ? '#a78bfa' : '#34d399'

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* SVG */}
      <svg viewBox={`0 0 ${W} ${H}`} width="260" height="170">
        {/* Gauss surface hint */}
        <circle cx={cx} cy={cy} r={bodyR + 22} fill="none" stroke="#fbbf24" strokeWidth={1}
          strokeDasharray="5 4" opacity={0.4} />
        <text x={cx + bodyR + 26} y={cy - 14} fill="#fbbf24" fontSize="7" opacity={0.7}>משטח גאוס</text>

        {/* Body */}
        {sym === 'plane' ? (
          <rect x={cx - 6} y={10} width={12} height={H - 20} fill={symColor} fillOpacity={0.25}
            stroke={symColor} strokeWidth={1.5} rx={3} />
        ) : (
          <circle cx={cx} cy={cy} r={bodyR} fill={symColor} fillOpacity={0.2}
            stroke={symColor} strokeWidth={2} />
        )}

        {/* Measurement point */}
        <circle cx={pointX} cy={cy} r={5} fill="#f87171" />
        <text x={pointX + 7} y={cy + 4} fill="#f87171" fontSize="8">P</text>

        {/* E arrow */}
        {E > 0 && (
          <line x1={pointX} y1={cy} x2={pointX + eLen} y2={cy}
            stroke="#fbbf24" strokeWidth={2.5} markerEnd="url(#earr)" />
        )}

        <defs>
          <marker id="earr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#fbbf24" />
          </marker>
        </defs>

        {/* E label */}
        <text x={W / 2} y={H - 8} textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold">
          {label}
        </text>
      </svg>

      {/* Controls */}
      <div className="w-full space-y-2 px-3">
        {/* Symmetry selector */}
        <div className="flex gap-1.5 text-xs">
          {(['sphere', 'cylinder', 'plane'] as const).map(s => (
            <button key={s} onClick={() => setSym(s)}
              className={`flex-1 py-1 rounded-lg font-bold transition-all ${
                sym === s ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'
              }`}>
              {s === 'sphere' ? 'כדור' : s === 'cylinder' ? 'גליל' : 'מישור'}
            </button>
          ))}
        </div>

        {sym !== 'plane' && (
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-0.5">
              <span>r (מרחק נקודה)</span>
              <span className={r < R ? 'text-blue-400 font-bold' : 'text-yellow-400 font-bold'}>
                {r.toFixed(2)} m {r < R ? '← בפנים' : '← בחוץ'}
              </span>
            </div>
            <input type="range" min={0.05} max={1.2} step={0.05} value={r}
              onChange={e => setR2(+e.target.value)}
              className="w-full h-1.5 rounded-full accent-yellow-400" />
          </div>
        )}
      </div>
    </div>
  )
}

// ── STEP 1 — זיהוי (מ-spec STEP1_PATTERN) ───────────────────────────────────
const step1 = <PatternStep
  scenario="כדור מוליך ברדיוס R. מכניסים מטען נקודתי +Q למרכזו. רוצים לחשב את E בשלושה אזורים: r<R, r=R, r>R."
  prompt="מה נכון לגבי השדה החשמלי?"
  options={[
    {
      label: 'אפשר להשתמש בגאוס רק מחוץ לכדור',
      desc: 'גאוס עובד בכל אזור — אם יש סימטריה',
      correct: false,
    },
    {
      label: 'השדה בכל מקום = שדה מטען נקודתי Q',
      desc: 'נכון רק מחוץ (r>R). בתוך מוליך — E=0 חובה',
      correct: false,
    },
    {
      label: 'בתוך המוליך E=0, ומחוץ E מתנהג כמו מטען נקודתי Q',
      desc: 'בשיווי משקל אלקטרוסטטי, שדה בתוך מוליך תמיד אפס',
      correct: true,
    },
    {
      label: 'E בתוך לא אפס — מתקזז עם המטען המושרה',
      desc: 'השדה בתוך מוליך בשיווי משקל הוא תמיד אפס, תמיד',
      correct: false,
    },
  ]}
  correctFeedback="נכון. במוליך בשיווי משקל: E=0 בפנים. בחוץ: כאילו כל Q ריכוז במרכז."
/>

// ── STEP 2 — עיקרון (מ-spec CONCEPTUAL_CORE) ────────────────────────────────
const step2 = <PrincipleStep
  heading="חוק גאוס — שלב אחר שלב:"
  items={[
    {
      title: 'הרעיון: שטף = מטען בפנים',
      content: <div className="space-y-2">
        <p className="text-slate-300 text-sm">במקום לחשב אינטגרל וקטורי מורכב, שואלים: <span className="text-yellow-400 font-semibold">כמה מטען כלוא?</span></p>
        <Formula c="ε₀ · ∮ E·dA = q_in" color="text-yellow-300" />
        <p className="text-slate-400 text-xs" dir="ltr">ε₀ = 8.85×10⁻¹² C²/(N·m²)</p>
      </div>,
    },
    {
      title: 'תנאי הכרחי: סימטריה',
      content: <div className="space-y-1">
        <p className="text-slate-300 text-sm">גאוס עובד רק כשהשדה <span className="text-emerald-400 font-semibold">אחיד וניצב</span> למשטח:</p>
        <div className="grid grid-cols-3 gap-1 text-xs text-center mt-1">
          <div className="bg-blue-900/30 rounded p-1.5 text-blue-300">כדורית<br/>→ כדור גאוסי</div>
          <div className="bg-purple-900/30 rounded p-1.5 text-purple-300">גלילית<br/>→ גליל גאוסי</div>
          <div className="bg-emerald-900/30 rounded p-1.5 text-emerald-300">מישורית<br/>→ קופסה</div>
        </div>
      </div>,
      accent: 'text-emerald-400',
    },
    {
      title: 'Φ לעומת E — הבחנה קריטית',
      content: <div className="space-y-1">
        <p className="text-emerald-300 text-sm font-semibold">Φ = תלוי <u>רק</u> במטען בפנים</p>
        <p className="text-red-300 text-sm font-semibold">E = מושפע מ<u>כל</u> המטענים (גם מחוץ)</p>
        <Note color="yellow" children={<>כשיש סימטריה — E אחיד על המשטח ואפשר להוציאו מהאינטגרל</>} />
      </div>,
      accent: 'text-yellow-400',
    },
    {
      title: 'שלושת נוסחאות הגאוס המרכזיות',
      content: <div className="space-y-1 text-xs">
        <div className="bg-white/5 rounded p-2"><span className="text-blue-300">כדור: </span><span className="text-slate-300" dir="ltr">E = kQ/r²</span></div>
        <div className="bg-white/5 rounded p-2"><span className="text-purple-300">תיל: </span><span className="text-slate-300" dir="ltr">E = λ/(2πε₀r)</span></div>
        <div className="bg-white/5 rounded p-2"><span className="text-emerald-300">מישור: </span><span className="text-slate-300" dir="ltr">E = σ/(2ε₀)</span></div>
      </div>,
      accent: 'text-blue-400',
    },
  ]}
/>

// ── STEP 3 — דוגמה (מ-spec EXEMPLARY_CASES, תרגיל 1א') ──────────────────────
const step3 = <WorkedExample
  examLabel="תרגיל 1א' — פיזיקה 2 HIT"
  problem={<p>קובייה עם צלע <span dir="ltr">a = 5 cm</span> נמצאת בשדה אחיד <span dir="ltr">E = C·î</span>. חשב את השטף הכולל ואת המטען הכלוא.</p>}
  hint="סכם שטפים על כל 6 הפאות — שים לב לכיוון הנורמל."
  solution={[
    {
      label: 'זיהוי: אילו פאות רלוונטיות?',
      content: <div className="space-y-1">
        <p className="text-slate-300 text-sm">השדה בכיוון î. רק הפאות <span className="text-yellow-400">ניצבות לציר X</span> תורמות שטף.</p>
        <p className="text-slate-400 text-xs">4 פאות בצד (⊥ לשדה) → שטף = 0</p>
      </div>,
    },
    {
      label: 'שטף דרך הפאה הימנית (נורמל +î)',
      content: <div className="space-y-1">
        <Formula c="Φ_right = E·A = Ca²" color="text-emerald-300" />
      </div>,
    },
    {
      label: 'שטף דרך הפאה השמאלית (נורמל -î)',
      content: <div className="space-y-1">
        <Formula c="Φ_left = E·(-A) = -Ca²" color="text-red-300" />
      </div>,
    },
    {
      label: 'סכום ומסקנה',
      content: <div className="space-y-1">
        <Formula c="Φ_total = Ca² - Ca² = 0" color="text-yellow-300" />
        <Formula c="q_in = ε₀ · Φ = 0" color="text-yellow-300" />
        <Note color="blue" children={<>שדה אחיד לא יכול ליצור מטען — הגיוני פיזיקלית.</>} />
      </div>,
    },
  ]}
/>

// ── QUIZ (3 שאלות רמת HIT) ───────────────────────────────────────────────────
const quiz: QuizQuestion[] = [
  {
    question: 'כדור מוליך בעל מטען Q. מה השדה החשמלי בנקודה על פני הכדור (r = R)?',
    options: ['E = 0', 'E = kQ/R²', 'E = kQ/(2R²)', 'E = 2kQ/R²'],
    correct: 1,
    explanation: 'בנקודה בדיוק על פני המוליך (מחוץ), q_in = Q ולכן E = kQ/R².',
  },
  {
    question: 'מה השטף החשמלי דרך משטח גאוסי שמכיל מטענים +3Q ו-Q?',
    options: ['Φ = 4Q/ε₀', 'Φ = 2Q/ε₀', 'Φ = 3Q/ε₀', 'Φ = Q/ε₀'],
    correct: 1,
    explanation: 'q_in = 3Q + (-Q) = 2Q. לפי גאוס: Φ = q_in/ε₀ = 2Q/ε₀.',
  },
  {
    question: 'תיל אינסופי עם צפיפות λ. ב-r = 2r₀ השדה הוא E₀. מה E ב-r₀?',
    options: ['E₀/2', 'E₀', '2E₀', '4E₀'],
    correct: 2,
    explanation: 'E ∝ 1/r לתיל. חצי מרחק → כפול שדה: E(r₀) = 2E₀.',
  },
]

// ── PRACTICE (5 שאלות, 3 רמות — מ-spec PRACTICE_QUESTIONS) ──────────────────
const practice: QuizQuestion[] = [
  // easy
  {
    question: 'משטח סגור ריק (ללא מטען). מה השטף הכולל דרכו?',
    options: ['תלוי בגודל המשטח', 'אפס', 'תלוי בשדה החיצוני', 'לא ניתן לדעת'],
    correct: 1,
    explanation: 'גאוס: Φ = q_in/ε₀. אם q_in = 0 → Φ = 0, בלי קשר לשדה חיצוני.',
  },
  {
    question: 'תיל אינסופי עם מטען λ. ב-r₀ השדה הוא E₀. ב-2r₀ השדה הוא?',
    options: ['2E₀', 'E₀/2', 'E₀/4', 'E₀'],
    correct: 1,
    explanation: 'E ∝ 1/r לתיל. כפילת r → חצי E: E(2r₀) = E₀/2.',
  },
  // medium
  {
    question: 'לוח אינסופי עם צפיפות σ. משטח גאוסי גלילי חוצה את הלוח. מה השטף?',
    options: ['σh/ε₀', 'σ(πR²)/ε₀', 'σ(πR²)h/ε₀', '0'],
    correct: 1,
    explanation: 'q_in = σ·A = σ·πR². לפי גאוס: Φ = q_in/ε₀ = σπR²/ε₀.',
  },
  {
    question: 'כדור מוליך נושא מטען Q. מכניסים מטען q פנימה. השדה מחוץ (r > R)?',
    options: ['kQ/r²', 'k(Q+q)/r²', 'kq/r²', '0'],
    correct: 1,
    explanation: 'המטען q גורם ל-(-q) על דופן פנימית ו-(+q) על חיצונית. סה"כ חיצוני: Q+q. E = k(Q+q)/r².',
  },
  // hard
  {
    question: 'כדור מבודד ברדיוס a עם צפיפות נפחית אחידה ρ. השדה בתוך הכדור (r < a)?',
    options: ['ρr/(3ε₀)', 'ρa/(3ε₀)', 'ρr²/(3ε₀a)', 'ρa²/(3ε₀r)'],
    correct: 0,
    explanation: 'q_in(r) = ρ·(4/3)πr³. משטח גאוסי כדורי: E·4πr² = q_in/ε₀ → E = ρr/(3ε₀). עולה עם r עד r=a.',
  },
]

// ── GREEN NOTE ────────────────────────────────────────────────────────────────
const greenNote = [
  'צייר משטח גאוס לפי הסימטריה: כדורי / גלילי / קופסה',
  'חשב q_in בלבד — מטענים מחוץ לא נכנסים לנוסחה',
  'סימטריה? → E אחיד → הוצא מהאינטגרל → E = q_in/(ε₀·A)',
  'בדוק: r→∞ צריך E→0, בתוך מוליך E=0 תמיד',
]

// ── GUIDES ────────────────────────────────────────────────────────────────────
const guides: GuideSection[] = [
  {
    title: 'מתי להשתמש',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p className="text-yellow-400 font-bold text-xs">3 שאלות לאבחון</p>
      <p className="text-xs">1. יש סימטריה (כדורית/גלילית/מישורית)? → גאוס</p>
      <p className="text-xs">2. אין סימטריה? → אינטגרל ישיר עם קולון</p>
      <p className="text-xs">3. רוצים שטף בלבד? → גאוס תמיד, ללא סימטריה</p>
      <Note color="blue" children={<>גאוס תמיד נכון — אבל שימושי רק עם סימטריה</>} />
    </div>,
  },
  {
    title: 'שגיאות נפוצות',
    content: <div className="space-y-2 text-sm">
      <p className="text-red-400 text-xs font-bold">שגיאה #1 — Φ לעומת E</p>
      <p className="text-slate-300 text-xs">Φ = q_in/ε₀ תמיד. E = Φ/A רק כשהשדה אחיד על המשטח.</p>
      <p className="text-red-400 text-xs font-bold mt-2">שגיאה #2 — מטענים מחוץ</p>
      <p className="text-slate-300 text-xs">מטענים מחוץ למשטח לא משנים את הشطف — אבל משנים את E!</p>
      <p className="text-red-400 text-xs font-bold mt-2">שגיאה #3 — בתוך מוליך</p>
      <p className="text-slate-300 text-xs">E=0 בתוך מוליך בשיווי משקל — תמיד, ללא יוצא מן הכלל.</p>
    </div>,
  },
]

// ── INTRO + BRIDGE ────────────────────────────────────────────────────────────
const intro = <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
  <p>
    חוק קולון נותן כוח בין שני מטענים. אבל מה אם יש <span className="text-yellow-400 font-semibold">מיליון מטענים?</span>
    אינטגרל וקטורי ענק. חוק גאוס חותך את זה לשורה אחת.
  </p>
  <Formula c="ε₀ · ∮ E·dA = q_in" color="text-yellow-300" />
  <p className="text-slate-400 text-xs">רק אם יש סימטריה — אבל אז זה קסם.</p>
</div>

const bridge = <div className="space-y-2 text-sm text-slate-300">
  <p>זוכר <span className="text-emerald-400 font-semibold">שדה של מטען נקודתי</span> מחוק קולון?</p>
  <Formula c="E = kQ/r²" color="text-emerald-300" />
  <p>גאוס יגזור את אותה נוסחה — ב-3 שורות, בלי אינטגרלים.</p>
</div>

const theory: TheoryCard = {
  summary: 'חוק גאוס קושר בין השטף החשמלי דרך משטח סגור לבין המטען הכלוא בתוכו. עם סימטריה נכונה — הכוח לחישוב שדות חשמליים מורכבים הופך לאלגברה פשוטה.',
  formulas: [
    { label: 'חוק גאוס', tex: '\\varepsilon_0 \\oint \\vec{E} \\cdot d\\vec{A} = q_{\\text{in}}' },
    { label: 'תיל אינסופי (λ)', tex: 'E(r) = \\dfrac{\\lambda}{2\\pi\\varepsilon_0 r}' },
    { label: 'מישור אינסופי (σ)', tex: 'E = \\dfrac{\\sigma}{2\\varepsilon_0}' },
  ],
  when: 'יש סימטריה כדורית/גלילית/מישורית → בחר משטח גאוסי → חשב q_in → הוצא E',
}

export default function GaussLaw({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="physics2-gauss"
    title="חוק גאוס"
    subtitle="סימטריה אלקטרוסטטית — כדור, גליל, מישור"
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
