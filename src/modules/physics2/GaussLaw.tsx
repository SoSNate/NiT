/**
 * GaussLaw.tsx — built from MODULE_SPEC: אפיון למידה - פיזיקה 2.txt
 * Source: Gemini pipeline → C:\Users\12nat\Desktop\איפון למידה\
 * Built: 2026-03-24
 */
import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import { GlassCard, StyledSlider, SimReadout, ToggleGroup } from '../../components/SimulatorShell'
import type { QuizQuestion, GuideSection } from '../../types'

// ── SIMULATOR — upgraded with framer-motion + GlassCard ──────────────────────
function Sim({ currentStep: _cs }: { currentStep: number }) {
  const [sym, setSym] = useState<'sphere' | 'cylinder' | 'plane'>('sphere')
  const [r, setR]     = useState(0.6)   // m — distance
  const [Q, setQ]     = useState(2)     // nC

  const R = 0.3 // fixed body radius
  const eps0 = 8.85e-12
  const k    = 9e9
  const Qc   = Q * 1e-9
  const lambda = Qc / 1

  const { E, eLabel } = useMemo(() => {
    const inside = r < R
    if (sym === 'sphere') {
      const val = inside ? 0 : k * Qc / (r * r)
      return { E: val, eLabel: inside ? 'E = 0 (בתוך)' : val.toExponential(2) + ' N/C' }
    }
    if (sym === 'cylinder') {
      const val = inside ? 0 : lambda / (2 * Math.PI * eps0 * r)
      return { E: val, eLabel: inside ? 'E = 0 (בתוך)' : val.toExponential(2) + ' N/C' }
    }
    const sigma = Qc / (4 * Math.PI * R * R)
    const val   = sigma / (2 * eps0)
    return { E: val, eLabel: val.toExponential(2) + ' N/C (לא תלוי r)' }
  }, [sym, r, Q])

  const cx = 200, cy = 200
  const bodyR = 38
  const gRadius = Math.max(bodyR + 5, r * 100)
  const clampedGR = Math.min(gRadius, 160)
  const symColor = sym === 'sphere' ? '#60a5fa' : sym === 'cylinder' ? '#a78bfa' : '#34d399'

  const fieldLines = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => {
      const angle = (i * 30 * Math.PI) / 180
      const len = 60 + Math.min(E * 5e-3, 50)
      return {
        x1: cx + Math.cos(angle) * (bodyR + 4),
        y1: cy + Math.sin(angle) * (bodyR + 4),
        x2: cx + Math.cos(angle) * (bodyR + 4 + len),
        y2: cy + Math.sin(angle) * (bodyR + 4 + len),
      }
    }), [E])

  return (
    <div className="w-full space-y-4" dir="ltr">
      <GlassCard className="overflow-hidden bg-slate-950">
        <svg viewBox="0 0 400 400" className="w-full" style={{ maxHeight: 280 }}>
          <defs>
            <radialGradient id="gauss-charge-grad">
              <stop offset="0%" stopColor={symColor} />
              <stop offset="100%" stopColor={symColor} stopOpacity="0.4" />
            </radialGradient>
            <pattern id="gauss-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.04" />
            </pattern>
          </defs>
          <rect width="400" height="400" fill="url(#gauss-grid)" />

          {/* Field lines */}
          <AnimatePresence>
            {E > 0 && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {fieldLines.map((l, i) => (
                  <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                    stroke="rgba(34,211,238,0.35)" strokeWidth="1.5" strokeDasharray="4 4" />
                ))}
              </motion.g>
            )}
          </AnimatePresence>

          {/* Gauss surface */}
          <motion.circle
            cx={cx} cy={cy}
            fill="rgba(34,211,238,0.04)"
            stroke="#22d3ee" strokeWidth="2" strokeDasharray="8 4"
            animate={{ r: clampedGR }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          />

          {/* Body */}
          {sym === 'plane' ? (
            <rect x={cx - 8} y={cy - 80} width={16} height={160}
              fill={symColor} fillOpacity={0.2} stroke={symColor} strokeWidth={2} rx={4} />
          ) : (
            <circle cx={cx} cy={cy} r={bodyR}
              fill={`url(#gauss-charge-grad)`} fillOpacity={0.25}
              stroke={symColor} strokeWidth={2} />
          )}
          <text x={cx} y={cy + 5} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">+Q</text>

          {/* Labels */}
          <text x={cx + clampedGR + 6} y={cy - 8} fill="#22d3ee" fontSize="9" fontFamily="monospace">
            r = {r.toFixed(2)}m
          </text>
          <text x={cx} y={cy + clampedGR + 16} textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold">
            {eLabel}
          </text>
        </svg>
      </GlassCard>

      {/* Readout */}
      <SimReadout label="עוצמת שדה E" value={E > 0 ? E.toExponential(2) : '0'} unit="N/C" />

      {/* Controls */}
      <ToggleGroup
        value={sym}
        onChange={v => setSym(v as typeof sym)}
        options={[
          { value: 'sphere',   label: 'כדורי' },
          { value: 'cylinder', label: 'גלילי' },
          { value: 'plane',    label: 'לוח' },
        ]}
      />
      <StyledSlider label="מטען Q" value={Q} min={0.1} max={10} step={0.1} unit="nC" onChange={setQ} />
      {sym !== 'plane' && (
        <StyledSlider label="מרחק r" value={r} min={0.1} max={1.5} step={0.05} unit="m" onChange={setR} />
      )}
      <div className="text-xs text-center text-slate-500 mt-1">
        {r < R && sym !== 'plane' ? '📍 נקודה בתוך הגוף — E = 0' : '📍 נקודה מחוץ לגוף'}
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
