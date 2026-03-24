import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import { GlassCard, StyledSlider, SimReadout } from '../../components/SimulatorShell'
import type { QuizQuestion, GuideSection } from '../../types'

// ── SIMULATOR — upgraded with framer-motion ───────────────────────────────────
function Sim({ currentStep: _cs }: { currentStep: number }) {
  const [q1, setQ1] = useState(2)   // μC
  const [q2, setQ2] = useState(3)   // μC
  const [r, setR]   = useState(1.0) // m

  const k = 9e9
  const F = useMemo(
    () => k * (Math.abs(q1) * 1e-6) * (Math.abs(q2) * 1e-6) / (r * r),
    [q1, q2, r]
  )
  const attract = (q1 > 0) !== (q2 > 0)

  const cx1 = 80, cx2 = 320, cy = 120
  const color1 = q1 >= 0 ? '#f87171' : '#60a5fa'
  const color2 = q2 >= 0 ? '#f87171' : '#60a5fa'
  const arrowLen = Math.min(55, F * 0.003 + 8)

  return (
    <div className="w-full space-y-4" dir="ltr">
      <GlassCard className="bg-slate-950 overflow-hidden">
        <svg viewBox="0 0 400 220" className="w-full" style={{ maxHeight: 200 }}>
          <defs>
            <pattern id="coulomb-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.04" />
            </pattern>
            <marker id="carr1" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill={color1} />
            </marker>
            <marker id="carr2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill={color2} />
            </marker>
          </defs>
          <rect width="400" height="220" fill="url(#coulomb-grid)" />

          {/* Charge q1 */}
          <motion.circle cx={cx1} cy={cy} r={22} fill={color1} fillOpacity={0.2}
            stroke={color1} strokeWidth={2}
            animate={{ r: 18 + Math.abs(q1) * 1.5 }}
            transition={{ type: 'spring', stiffness: 200 }}
          />
          <text x={cx1} y={cy + 5} textAnchor="middle" fill={color1} fontSize="12" fontWeight="bold">
            {q1 > 0 ? '+' : ''}{q1}μ
          </text>

          {/* Charge q2 */}
          <motion.circle cx={cx2} cy={cy} r={22} fill={color2} fillOpacity={0.2}
            stroke={color2} strokeWidth={2}
            animate={{ r: 18 + Math.abs(q2) * 1.5 }}
            transition={{ type: 'spring', stiffness: 200 }}
          />
          <text x={cx2} y={cy + 5} textAnchor="middle" fill={color2} fontSize="12" fontWeight="bold">
            {q2 > 0 ? '+' : ''}{q2}μ
          </text>

          {/* Distance line */}
          <line x1={cx1 + 25} y1={cy + 35} x2={cx2 - 25} y2={cy + 35}
            stroke="#334155" strokeWidth={1} strokeDasharray="4 3" />
          <text x={200} y={cy + 50} textAnchor="middle" fill="#64748b" fontSize="9">r = {r} m</text>

          {/* Force arrows */}
          {attract ? (
            <>
              <motion.line
                x1={cx1 + 25} y1={cy}
                animate={{ x2: cx1 + 25 + arrowLen }}
                transition={{ type: 'spring', stiffness: 150 }}
                stroke={color1} strokeWidth={2.5} markerEnd="url(#carr1)" />
              <motion.line
                x1={cx2 - 25} y1={cy}
                animate={{ x2: cx2 - 25 - arrowLen }}
                transition={{ type: 'spring', stiffness: 150 }}
                stroke={color2} strokeWidth={2.5} markerEnd="url(#carr2)" />
              <text x={200} y={cy - 30} textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold">← נמשכים →</text>
            </>
          ) : (
            <>
              <motion.line
                x1={cx1 + 25} y1={cy}
                animate={{ x2: cx1 + 25 - arrowLen }}
                transition={{ type: 'spring', stiffness: 150 }}
                stroke={color1} strokeWidth={2.5} markerEnd="url(#carr1)" />
              <motion.line
                x1={cx2 - 25} y1={cy}
                animate={{ x2: cx2 - 25 + arrowLen }}
                transition={{ type: 'spring', stiffness: 150 }}
                stroke={color2} strokeWidth={2.5} markerEnd="url(#carr2)" />
              <text x={200} y={cy - 30} textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="bold">← דוחים →</text>
            </>
          )}
        </svg>
      </GlassCard>

      <SimReadout label="כוח קולון F" value={F.toFixed(3)} unit="N" />

      <StyledSlider label="q₁" value={q1} min={-5} max={5} step={1} unit="μC" onChange={setQ1} />
      <StyledSlider label="q₂" value={q2} min={-5} max={5} step={1} unit="μC" onChange={setQ2} />
      <StyledSlider label="מרחק r" value={r} min={0.2} max={3} step={0.1} unit="m" onChange={setR} />
    </div>
  )
}

// ── STEPS ─────────────────────────────────────────────────────────────────────
const step1 = <PatternStep
  scenario="יש שני מטענים חשמליים. אתה רוצה לחשב את הכוח ביניהם."
  prompt="מה המידע שאתה חייב לדעת?"
  options={[
    { label: 'גודל המטענים בלבד', correct: false, desc: 'בלי מרחק — אי אפשר לדעת כמה חזק הכוח' },
    { label: 'מרחק בלבד', correct: false, desc: 'בלי גודל המטענים — אי אפשר' },
    { label: 'גודל שני המטענים + המרחק', correct: true, desc: 'F = kq₁q₂/r² — שלושה גורמים' },
    { label: 'מסה וכיוון המטענים', correct: false, desc: 'מסה לא נכנסת לקולון' },
  ]}
  correctFeedback="בדיוק. F = k|q₁||q₂|/r² — צריך q₁, q₂, ו-r."
/>

const step2 = <PrincipleStep
  heading="חוק קולון — שלב אחר שלב:"
  items={[
    {
      title: 'הנוסחה הבסיסית',
      content: <div className="space-y-2">
        <Formula c="F = k · |q₁| · |q₂| / r²" color="text-yellow-300" />
        <p className="text-slate-400 text-xs" dir="ltr">k = 9×10⁹ N·m²/C²</p>
      </div>,
    },
    {
      title: 'מה k עושה?',
      content: <p className="text-slate-300 text-sm">קבוע שמגדיר "עוצמת" הכוח החשמלי בטבע. גדול מאוד — הכוח החשמלי חזק מאוד.</p>,
    },
    {
      title: 'כיוון הכוח',
      content: <div className="space-y-1">
        <p className="text-slate-300 text-sm">הנוסחה נותנת <span className="text-yellow-400 font-semibold">גודל</span> בלבד.</p>
        <p className="text-emerald-300 text-sm font-semibold">שווים → דוחים (מתרחקים)</p>
        <p className="text-red-300 text-sm font-semibold">הפוכים → נמשכים (מתקרבים)</p>
      </div>,
      accent: 'text-emerald-400',
    },
    {
      title: 'חוק ניוטון השלישי',
      content: <p className="text-slate-300 text-sm">הכוח שq₁ מפעיל על q₂ שווה בגודל לכוח שq₂ מפעיל על q₁ — רק בכיוון הפוך.</p>,
      accent: 'text-blue-400',
    },
  ]}
/>

const step3 = <WorkedExample
  examLabel="דוגמה מרכזית — שלושה מטענים בשורה"
  problem={<p>שלושה מטענים על ציר: +Q, ואז -Q, ואז +Q. המרחק בין כל סמוכים הוא d. מצא את הכוח הכולל על המטען האמצעי (-Q).</p>}
  hint="פרק לשני כוחות נפרדים — אחד מכל מטען קצה."
  solution={[
    {
      label: 'שרטט ותייג',
      content: <div className="font-mono text-xs text-slate-300 leading-relaxed" dir="ltr">
        <p>+Q ——d—— (−Q) ——d—— +Q</p>
        <p className="text-slate-500 mt-1">A           B           C</p>
      </div>,
    },
    {
      label: 'כוח מ-A על B',
      content: <div className="space-y-1">
        <p className="text-slate-300 text-sm">A חיובי, B שלילי → <span className="text-emerald-400">נמשכים</span> → כוח על B שמאלה</p>
        <Formula c="F_AB = kQ²/d²  (←)" color="text-emerald-300" />
      </div>,
    },
    {
      label: 'כוח מ-C על B',
      content: <div className="space-y-1">
        <p className="text-slate-300 text-sm">C חיובי, B שלילי → <span className="text-emerald-400">נמשכים</span> → כוח על B ימינה</p>
        <Formula c="F_CB = kQ²/d²  (→)" color="text-emerald-300" />
      </div>,
    },
    {
      label: 'כוח שקול',
      content: <div className="space-y-1">
        <p className="text-slate-300 text-sm">שני כוחות שווים, כיוונים הפוכים:</p>
        <Formula c="F_net = F_AB − F_CB = 0" color="text-yellow-300" />
        <Note color="blue" children={<>B נמצא בשיווי משקל בדיוק כי המרחקים שווים והמטענים שווים.</>} />
      </div>,
    },
  ]}
/>

// ── QUIZ ──────────────────────────────────────────────────────────────────────
const quiz: QuizQuestion[] = [
  {
    question: 'שני כדורים טעונים במרחק r זה מזה. אם מכפילים את שני המטענים ומחלקים את המרחק בשלוש — פי כמה משתנה הכוח?',
    options: ['פי 36', 'פי 18', 'פי 9', 'פי 4'],
    correct: 0,
    explanation: 'F חדש = k(2q₁)(2q₂)/(r/3)² = 4q₁q₂·9/r² = 36F. מטענים ×4, מרחק ×9 ← 4×9=36.',
  },
  {
    question: 'מטען +Q ומטען +4Q מרחק d. איפה על הציר המחבר ניתן להניח מטען שלישי ויישאר בשיווי משקל?',
    options: [
      'במרחק d/3 מ-+Q',
      'במרחק d/2 מ-+Q',
      'במרחק 2d/3 מ-+Q',
      'לא ניתן',
    ],
    correct: 0,
    explanation: 'שיווי משקל: kQq/x² = k4Qq/(d-x)². פתרון: (d-x)² = 4x² → d-x = 2x → x = d/3.',
  },
  {
    question: 'חלקיק עם מטען q ומסה m נמצא בשדה חשמלי אחיד E. מהי התאוצה שלו?',
    options: ['a = qE/m', 'a = mE/q', 'a = qm/E', 'a = E/q'],
    correct: 0,
    explanation: 'F = qE, F = ma → a = qE/m. בדיוק כמו חוק ניוטון השני.',
  },
]

// ── PRACTICE (שלוש רמות) ─────────────────────────────────────────────────────
const practice: QuizQuestion[] = [
  // 🟢 רמה 1 — הבנה בסיסית
  {
    question: 'שני מטענים +q ו-+q במרחק r. מה קורה לכוח ביניהם אם מחצינים את המרחק?',
    options: ['גדל פי 2', 'גדל פי 4', 'קטן פי 4', 'לא משתנה'],
    correct: 1,
    explanation: 'F ∝ 1/r². מחצינים r → r/2 → F ∝ 1/(r/2)² = 4/r². הכוח גדל פי 4.',
  },
  {
    question: 'מה הסימן של הכוח: מטען +Q ומטען -Q — האם נמשכים או דוחים?',
    options: ['דוחים — שניהם חיוביים', 'נמשכים — הסימנים הפוכים', 'אפס — מבטלים זה את זה', 'תלוי במרחק'],
    correct: 1,
    explanation: 'כלל יסוד: הפוכים נמשכים, שווים דוחים.',
  },
  // 🟡 רמה 2 — פרמטרי
  {
    question: 'שני מטענים Q₁ = 2Q ו-Q₂ = 3Q במרחק d. מה הכוח ביניהם?',
    options: ['F = 6kQ²/d²', 'F = 5kQ²/d²', 'F = kQ²/d²', 'F = 6kQ/d'],
    correct: 0,
    explanation: 'F = k·Q₁·Q₂/d² = k·2Q·3Q/d² = 6kQ²/d²',
  },
  {
    question: 'הכוח בין שני מטענים הוא F. אם מכפילים מטען אחד פי 3 — מה הכוח החדש?',
    options: ['F/3', 'F', '3F', '9F'],
    correct: 2,
    explanation: 'F ∝ q₁·q₂. הכפלת q₁ פי 3 → F גדל פי 3.',
  },
  // 🔴 רמה 3 — ווקטורים + מכניקה
  {
    question: 'חלקיק (מסה m, מטען q) נכנס לשדה אחיד E במהירות אפס. מה מהירותו אחרי זמן t?',
    options: ['v = qEt/m', 'v = qE/m', 'v = mEt/q', 'v = qt/mE'],
    correct: 0,
    explanation: 'a = qE/m (כוח קולון). v = at = (qE/m)·t',
  },
]

// ── GREENNOTE ──────────────────────────────────────────────────────────────────
const greenNote = [
  'כתוב: F = k|q₁||q₂|/r² — גודל בלבד',
  'קבע כיוון: שווים = דוחים | הפוכים = נמשכים',
  'כמה מטענים? חשב כל כוח בנפרד, חבר כוקטורים',
  'מכניקה? F = ma → a = qE/m → v = at',
]

// ── GUIDES ────────────────────────────────────────────────────────────────────
const guides: GuideSection[] = [
  {
    title: 'מתי משתמשים',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p className="text-yellow-400 font-bold text-xs">זיהוי שאלת קולון</p>
      <p className="text-xs">יש מטענים נקודתיים במרחק נתון → קולון</p>
      <Note color="yellow" children={<>שדה חשמלי = כוח לחלק למטען בוחן: E = F/q</>} />
    </div>,
  },
  {
    title: 'שגיאות נפוצות',
    content: <div className="space-y-2 text-sm">
      <p className="text-red-400 text-xs font-bold">שגיאה #1 — r בריבוע</p>
      <p className="text-slate-300 text-xs">תמיד r², לא r. r² לא r.</p>
      <p className="text-red-400 text-xs font-bold mt-2">שגיאה #2 — כפל כוחות</p>
      <p className="text-slate-300 text-xs">ניוטון 3: שני מטענים = שני כוחות שווים, לא כוח כפול.</p>
      <p className="text-red-400 text-xs font-bold mt-2">שגיאה #3 — שכחת כיוון</p>
      <p className="text-slate-300 text-xs">תמיד ציין כיוון (שמאל/ימין, +x/-x) — לא רק גודל.</p>
    </div>,
  },
]

// ── INTRO ──────────────────────────────────────────────────────────────────────
const intro = <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
  <p>
    הכל מתחיל כאן. <span className="text-yellow-400 font-semibold">חוק קולון</span> הוא הבסיס של
    כל הפיזיקה החשמלית — ממנו בונים שדה חשמלי, גאוס, ואחר כך כל השאר.
  </p>
  <Formula c="F = k|q₁||q₂|/r²    k = 9×10⁹" color="text-yellow-300" />
  <p>שלושה שלבי פתרון לכל שאלה: גודל → כיוון → סכימה וקטורית.</p>
</div>

const bridge = <div className="space-y-2">
  <p>זוכר <span className="text-emerald-400 font-semibold">חוק ניוטון שני</span> F = ma מפיזיקה 1?</p>
  <p>כאן F מגיעה מהמטענים — לא מכוח חיצוני. שאר המכניקה זהה בדיוק.</p>
</div>

const theory: TheoryCard = {
  summary: 'שני מטענים מפעילים כוח אחד על השני. הכוח גדל ככל שהמטענים גדולים יותר, וקטן בריבוע המרחק. שווים → דוחים. הפוכים → נמשכים. חוק ניוטון השלישי: הכוח הדדי ושווה בגודל.',
  formulas: [
    { label: 'חוק קולון', tex: 'F = k\\dfrac{|q_1||q_2|}{r^2},\\quad k = 9\\times 10^9\\,\\frac{\\text{N}\\cdot\\text{m}^2}{\\text{C}^2}' },
    { label: 'כוח→תאוצה', tex: 'a = \\frac{qE}{m} \\;\\Rightarrow\\; v = at = \\frac{qE}{m}\\cdot t' },
  ],
  when: 'מטענים נקודתיים עם מרחק ידוע → קולון ישר. כמה מטענים → חשב כל כוח בנפרד וחבר כוקטורים',
}

export default function CoulombsLaw({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="physics2-coulomb"
    title="חוק קולון"
    subtitle="כוחות בין מטענים — גודל, כיוון, סכימה וקטורית"
    intro={intro} bridge={bridge} theory={theory}
    step1={step1} step2={step2} step3={step3}
    SimulatorComponent={Sim}
    quizQuestions={quiz}
    practiceQuestions={practice}
    greenNote={greenNote}
    guides={guides}
    onBack={onBack}
  />
}
