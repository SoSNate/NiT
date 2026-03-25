/**
 * ElectricField.tsx — שדה חשמלי והתפלגות מטען
 * Source: מבוא חשמל.pdf עמ' 10, שיעור 1.pdf עמ' 5+19
 * Gemini pipeline: 2026-03-26
 */
import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import { GlassCard, StyledSlider, SimReadout, ToggleGroup } from '../../components/SimulatorShell'
import type { QuizQuestion, GuideSection } from '../../types'

// ── SIMULATOR ─────────────────────────────────────────────────────────────────
function Sim({ currentStep: _cs }: { currentStep: number }) {
  const [mode, setMode] = useState<'point' | 'dipole' | 'superposition'>('point')
  const [Q, setQ] = useState(2)    // nC
  const [r, setR] = useState(1.0)  // m
  const [Q2, setQ2] = useState(-2) // nC (for dipole/superposition)

  const k = 9e9
  const W = 380, H = 220, cx = W / 2, cy = H / 2
  const scale = 60

  const E1 = useMemo(() => k * Math.abs(Q) * 1e-9 / (r * r), [Q, r])
  const E2 = useMemo(() => k * Math.abs(Q2) * 1e-9 / (r * r), [Q2, r])

  // Field line angles
  const angles = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => (i * 45 * Math.PI) / 180), [])

  const chargeColor = (q: number) => q >= 0 ? '#f87171' : '#60a5fa'
  const chargeLabel = (q: number) => q >= 0 ? '+' : '−'

  return (
    <div className="w-full space-y-4" dir="ltr">
      <GlassCard className="overflow-hidden bg-slate-950">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
          <defs>
            <pattern id="ef-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.05" />
            </pattern>
            <marker id="ef-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#fbbf24" />
            </marker>
          </defs>
          <rect width={W} height={H} fill="url(#ef-grid)" />

          {mode === 'point' && <>
            {/* Field lines from point charge */}
            {angles.map((a, i) => {
              const len = Math.min(80, E1 * 5e-4)
              const x1 = cx + Math.cos(a) * 18
              const y1 = cy + Math.sin(a) * 18
              const x2 = cx + Math.cos(a) * (18 + len)
              const y2 = cy + Math.sin(a) * (18 + len)
              const sign = Q >= 0 ? 1 : -1
              return <motion.line key={i}
                x1={sign > 0 ? x1 : x2} y1={sign > 0 ? y1 : y2}
                x2={sign > 0 ? x2 : x1} y2={sign > 0 ? y2 : y1}
                stroke="#fbbf24" strokeWidth="1.5" opacity="0.7"
                markerEnd="url(#ef-arrow)"
                initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} />
            })}
            {/* Charge */}
            <circle cx={cx} cy={cy} r={16} fill={chargeColor(Q)} fillOpacity={0.3} stroke={chargeColor(Q)} strokeWidth={2} />
            <text x={cx} y={cy + 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{chargeLabel(Q)}</text>
            {/* r label */}
            <line x1={cx} y1={cy} x2={cx + r * scale} y2={cy} stroke="#64748b" strokeWidth="1" strokeDasharray="4 3" />
            <text x={cx + r * scale / 2} y={cy - 6} textAnchor="middle" fill="#94a3b8" fontSize="9">r={r}m</text>
            <circle cx={cx + r * scale} cy={cy} r={4} fill="#22d3ee" />
            <text x={cx + r * scale + 8} y={cy + 4} fill="#22d3ee" fontSize="9">P</text>
          </>}

          {mode === 'dipole' && <>
            {/* Two charges */}
            {[-1, 1].map((side, i) => {
              const q = side > 0 ? Q : Q2
              const x = cx + side * 50
              return <g key={i}>
                <circle cx={x} cy={cy} r={14} fill={chargeColor(q)} fillOpacity={0.3} stroke={chargeColor(q)} strokeWidth={2} />
                <text x={x} y={cy + 5} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{chargeLabel(q)}</text>
              </g>
            })}
            {/* Field lines between */}
            {[-30, 0, 30].map((dy, i) => (
              <path key={i} d={`M ${cx - 36} ${cy + dy} Q ${cx} ${cy + dy * 1.5} ${cx + 36} ${cy + dy}`}
                fill="none" stroke="#fbbf24" strokeWidth="1.2" opacity="0.6"
                markerEnd="url(#ef-arrow)" />
            ))}
            <text x={cx} y={H - 10} textAnchor="middle" fill="#94a3b8" fontSize="9">דיפול — שדה מ+ ל−</text>
          </>}

          {mode === 'superposition' && <>
            {/* Two positive charges */}
            {[-60, 60].map((dx, i) => (
              <g key={i}>
                <circle cx={cx + dx} cy={cy} r={14} fill="#f87171" fillOpacity={0.3} stroke="#f87171" strokeWidth={2} />
                <text x={cx + dx} y={cy + 5} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">+</text>
                {angles.filter((_, j) => j % 2 === 0).map((a, j) => {
                  const len = 40
                  return <line key={j}
                    x1={cx + dx + Math.cos(a) * 16} y1={cy + Math.sin(a) * 16}
                    x2={cx + dx + Math.cos(a) * (16 + len)} y2={cy + Math.sin(a) * (16 + len)}
                    stroke="#fbbf24" strokeWidth="1" opacity="0.5" markerEnd="url(#ef-arrow)" />
                })}
              </g>
            ))}
            <text x={cx} y={H - 10} textAnchor="middle" fill="#34d399" fontSize="9">
              E_כולל = E₁ + E₂ (חיבור וקטורי)
            </text>
          </>}
        </svg>
      </GlassCard>

      {mode === 'point' && (
        <SimReadout label="E בנקודה P" value={E1.toExponential(2)} unit="N/C" />
      )}

      <ToggleGroup
        value={mode}
        onChange={v => setMode(v as typeof mode)}
        options={[
          { value: 'point',         label: 'מטען יחיד' },
          { value: 'dipole',        label: 'דיפול' },
          { value: 'superposition', label: 'סופרפוזיציה' },
        ]}
      />
      <StyledSlider label="Q (nC)" value={Q} min={-10} max={10} step={0.5} unit="nC" onChange={setQ} />
      {mode === 'point' && (
        <StyledSlider label="מרחק r" value={r} min={0.2} max={3} step={0.1} unit="m" onChange={setR} />
      )}
    </div>
  )
}

// ── STEP 1 — זיהוי (מ-מבוא חשמל.pdf עמ' 5) ───────────────────────────────────
const step1 = <PatternStep
  scenario="שלושה מטענים זהים +Q בקודקודי משולש שווה-צלעות. מה הכוח השקול על המטען העליון?"
  prompt="מה הצעד הראשון לפתרון?"
  options={[
    { label: 'חשב E בנקודה ופתור ישר', desc: 'אפשרי, אבל מחמיץ את ה-FBD', correct: false },
    { label: 'סרטוט + FBD + פירוק לרכיבים', desc: 'נכון! זה בדיוק תרגיל 1 במבוא חשמל.pdf עמ\' 4-5', correct: true },
    { label: 'השתמש בסימטריה ישר', desc: 'סימטריה עוזרת, אבל קודם FBD', correct: false },
    { label: 'חשב עם גאוס', desc: 'גאוס לסימטריה רציפה — לא למטענים נקודתיים', correct: false },
  ]}
  correctFeedback="נכון! מבוא חשמל.pdf עמ' 4: סרטוט מערכת → FBD על המטען הנבדק → פירוק לרכיבים → סופרפוזיציה → גודל וכיוון."
/>

// ── STEP 2 — עיקרון (מ-מבוא חשמל.pdf עמ' 10) ────────────────────────────────
const step2 = <PrincipleStep
  heading="שדה חשמלי — מסגרת מלאה:"
  items={[
    {
      title: 'הגדרת שדה חשמלי',
      content: <div className="space-y-1">
        <Formula c="E = F / q₀" color="text-yellow-300" />
        <p className="text-slate-400 text-xs">מבוא חשמל.pdf עמ' 10: השדה = כוח על מטען בוחן חיובי קטן</p>
        <p className="text-slate-300 text-sm">כיוון: אותו כיוון הכוח על מטען חיובי, הפוך לשלילי</p>
      </div>,
    },
    {
      title: 'שדה של מטען נקודתי',
      content: <div className="space-y-1">
        <Formula c="E = kQ / r²" color="text-blue-300" />
        <p className="text-slate-400 text-xs">מבוא חשמל.pdf עמ' 10 | k = 9×10⁹ N·m²/C²</p>
        <p className="text-slate-300 text-xs">כיוון: רדיאלי מ-Q חיובי, לתוך Q שלילי</p>
      </div>,
      accent: 'text-blue-400',
    },
    {
      title: 'עיקרון הסופרפוזיציה',
      content: <div className="space-y-1">
        <Formula c="E_כולל = ΣEᵢ (חיבור וקטורי)" color="text-emerald-300" />
        <p className="text-slate-400 text-xs">מבוא חשמל.pdf עמ' 10: חיבור וקטורי — לא סקלרי!</p>
        <Note color="red" children={<>פרק לרכיבים x,y לפני שמחבר</>} />
      </div>,
      accent: 'text-emerald-400',
    },
    {
      title: 'התפלגות מטען רציפה',
      content: <div className="space-y-1 text-xs">
        <p className="text-slate-300">מבוא חשמל.pdf עמ' 10 — 3 צפיפויות מטען:</p>
        <div className="grid grid-cols-3 gap-1">
          <div className="bg-white/5 rounded p-1.5 text-center">
            <p className="text-purple-300">קווית</p>
            <p className="text-slate-300" dir="ltr">λ = dq/dl</p>
          </div>
          <div className="bg-white/5 rounded p-1.5 text-center">
            <p className="text-cyan-300">משטחית</p>
            <p className="text-slate-300" dir="ltr">σ = dq/dA</p>
          </div>
          <div className="bg-white/5 rounded p-1.5 text-center">
            <p className="text-orange-300">נפחית</p>
            <p className="text-slate-300" dir="ltr">ρ = dq/dV</p>
          </div>
        </div>
        <Formula c="E = ∫k·dq/r² · r̂" color="text-slate-300" />
      </div>,
      accent: 'text-purple-400',
    },
  ]}
/>

// ── STEP 3 — דוגמה (שיעור 1.pdf עמ' 19 — שיווי משקל) ────────────────────────
const step3 = <WorkedExample
  examLabel="שיעור 1.pdf עמ' 19 — שיווי משקל יציב/לא יציב"
  problem={<p>שני מטענים +Q קבועים במרחק <span dir="ltr">2a</span> זה מזה. מטען בוחן +q קטן נמצא בדיוק באמצע. (א) הסט את q בכיוון ציר המטענים. (ב) הסט בניצב. האם שיווי המשקל יציב?</p>}
  hint="בדוק את כיוון הכוח השקול אחרי הסטה קטנה — האם חוזר או מתרחק?"
  solution={[
    {
      label: 'נקודת שיווי משקל',
      content: <p className="text-slate-300 text-sm">באמצע: שני כוחות שווים ומנוגדים → F_שקול = 0 ✓</p>,
    },
    {
      label: '(א) הסטה לאורך ציר המטענים',
      content: <div className="space-y-1">
        <p className="text-slate-300 text-sm">q מתקרב ל-Q אחד → כוח דחייה גדול יותר → מתרחק עוד יותר</p>
        <Formula c="שיווי משקל לא יציב בכיוון זה" color="text-red-300" />
      </div>,
    },
    {
      label: '(ב) הסטה בניצב לציר',
      content: <div className="space-y-1">
        <p className="text-slate-300 text-sm">שני הכוחות מושכים כלפי מטה (לכיוון ציר הסימטריה) → חוזר למרכז</p>
        <Formula c="שיווי משקל יציב בכיוון זה" color="text-emerald-300" />
        <Note color="blue" children={<>יציבות תלויה בכיוון ההסטה — זו שאלת מבחן קלאסית ב-HIT</>} />
      </div>,
    },
  ]}
/>

// ── QUIZ (מבוחנים אמיתיים HIT) ───────────────────────────────────────────────
const quiz: QuizQuestion[] = [
  {
    question: 'מטען +Q יוצר שדה E₀ במרחק r. מה השדה במרחק 2r?',
    options: ['2E₀', 'E₀/2', 'E₀/4', '4E₀'],
    correct: 2,
    explanation: 'E = kQ/r². הכפלת r → מחלקים ב-4: E(2r) = kQ/(2r)² = E₀/4.',
  },
  {
    question: 'שני מטענים +3Q ו-Q− במרחק d. שדה שווה אפס בנקודה P. P נמצאת:',
    options: ['בין המטענים', 'מחוץ ליד Q−', 'מחוץ ליד +3Q', 'אין נקודה כזו'],
    correct: 1,
    explanation: 'E=0 דורש שהשדות יתבטלו. עם מטענים בסימן שונה — נקודת הביטול היא מחוץ, ליד המטען הקטן יותר.',
  },
  {
    question: 'תיל אינסופי עם צפיפות מטען λ>0. כיוון השדה ב-r?',
    options: ['לאורך התיל', 'רדיאלי החוצה מהתיל', 'רדיאלי פנימה', 'אין שדה'],
    correct: 1,
    explanation: 'מטען חיובי → שדה רדיאלי החוצה. E = λ/(2πε₀r) לפי גאוס.',
  },
]

// ── PRACTICE ──────────────────────────────────────────────────────────────────
const practice: QuizQuestion[] = [
  {
    question: 'מטען q=2nC בשדה E=500N/C. הכוח עליו?',
    options: ['1000 N', '1 μN', '250 N', '0.004 N'],
    correct: 1,
    explanation: 'F = qE = 2×10⁻⁹ × 500 = 10⁻⁶ N = 1μN.',
  },
  {
    question: 'E=0 בנקודה מסוימת. האם יש שם מטען?',
    options: ['כן — בהכרח מטען אפס', 'לא בהכרח', 'כן — מטען שלילי', 'תמיד מטען חיובי'],
    correct: 1,
    explanation: 'E=0 יכול להיות בנקודת ביטול בין שני מטענים, לא בהכרח מקום של מטען.',
  },
  {
    question: 'מטען Q=5nC במרחק r=0.3m. E=?',
    options: ['500 N/C', '5000 N/C', '50 N/C', '50000 N/C'],
    correct: 0,
    explanation: 'E = kQ/r² = 9×10⁹ × 5×10⁻⁹ / 0.09 = 45/0.09 = 500 N/C.',
  },
  {
    question: 'שני מטענים +Q זהים. השדה בנקודת אמצע ביניהם?',
    options: ['2kQ/r²', 'kQ/r²', '0', 'kQ/(2r)²'],
    correct: 2,
    explanation: 'סופרפוזיציה: שני שדות שווים בכיוונים מנוגדים → מתבטלים. E=0.',
  },
  {
    question: 'מטען −2Q. כיוון קווי השדה?',
    options: ['החוצה מהמטען', 'אין קווי שדה', 'פנימה לכיוון המטען', 'אופקי בלבד'],
    correct: 2,
    explanation: 'קווי שדה מסתיימים במטענים שליליים — כיוון השדה לתוך המטען.',
  },
]

// ── GREEN NOTE (מבוא חשמל.pdf עמ' 4-5) ───────────────────────────────────────
const greenNote = [
  'סרטוט + FBD קודם — סמן כל כוח/שדה עם כיוון',
  'פרק לרכיבים x,y — חבר רכיבים בנפרד (ΣFx, ΣFy)',
  'נצל סימטריה — רכיבים ניצבים מתבטלים בזוגות',
  'בדוק יחידות: E [N/C = V/m], F [N], q [C]',
]

// ── GUIDES ────────────────────────────────────────────────────────────────────
const guides: GuideSection[] = [
  {
    title: 'מתי להשתמש',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p className="text-yellow-400 font-bold text-xs">אבחון סוג הבעיה</p>
      <p className="text-xs">1. מטענים נקודתיים → קולון + סופרפוזיציה</p>
      <p className="text-xs">2. סימטריה גבוהה (כדור/גליל/מישור) → גאוס</p>
      <p className="text-xs">3. התפלגות רציפה → אינטגרל ∫k·dq/r²</p>
      <Note color="blue" children={<>תמיד שאל: האם יש סימטריה? → בחר גאוס</>} />
    </div>,
  },
  {
    title: 'שגיאות נפוצות',
    content: <div className="space-y-2 text-sm">
      <p className="text-red-400 text-xs font-bold">שגיאה #1 — חיבור סקלרי</p>
      <p className="text-slate-300 text-xs">אסור: E = E₁ + E₂ (מספרים). חובה: חיבור וקטורי עם רכיבים.</p>
      <p className="text-red-400 text-xs font-bold mt-2">שגיאה #2 — בלבול F ↔ E</p>
      <p className="text-slate-300 text-xs">E = F/q₀ (שדה = כוח ÷ מטען). F = qE (כוח על מטען בשדה).</p>
      <p className="text-red-400 text-xs font-bold mt-2">שגיאה #3 — לא מנצל סימטריה</p>
      <p className="text-slate-300 text-xs">בטבעת/דיסקה: רכיבי x,y מתבטלים — נשאר רק z.</p>
    </div>,
  },
]

// ── INTRO + BRIDGE ────────────────────────────────────────────────────────────
const intro = <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
  <p>
    מה גורם לשיערות להתרומם ליד בלון טעון? זהו <span className="text-yellow-400 font-semibold">שדה חשמלי</span> —
    תכונה של המרחב שנוצרת על ידי מטענים וגורמת לכוח על כל מטען שנכנס לתוכו.
  </p>
  <Formula c="E = F / q₀" color="text-yellow-300" />
  <p className="text-slate-400 text-xs">מבוא חשמל.pdf עמ' 10: הגדרה רשמית של HIT</p>
</div>

const bridge = <div className="space-y-2 text-sm text-slate-300">
  <p>מחוק קולון: <span className="text-emerald-400">F = kq₁q₂/r²</span></p>
  <p>השדה הוא "הכוח שהיה פועל על מטען בוחן יחידה":</p>
  <Formula c="E = kQ/r²" color="text-emerald-300" />
  <p className="text-slate-400 text-xs">אותה נוסחה — רק מחלקים ב-q₀</p>
</div>

const theory: TheoryCard = {
  summary: 'השדה החשמלי E הוא וקטור המוגדר כ-F/q₀. שדה מטען נקודתי: E=kQ/r². מספר מטענים: סופרפוזיציה וקטורית. התפלגות רציפה: אינטגרל.',
  formulas: [
    { label: 'הגדרה', tex: '\\vec{E} = \\dfrac{\\vec{F}}{q_0}' },
    { label: 'מטען נקודתי', tex: 'E = \\dfrac{kQ}{r^2} = \\dfrac{Q}{4\\pi\\varepsilon_0 r^2}' },
    { label: 'סופרפוזיציה', tex: '\\vec{E}_{total} = \\sum_i \\vec{E}_i' },
    { label: 'התפלגות רציפה', tex: '\\vec{E} = \\int \\dfrac{k\\,dq}{r^2}\\hat{r}' },
  ],
  when: 'מטענים בדידים → קולון + סופרפוזיציה. סימטריה → גאוס. התפלגות רציפה → אינטגרל dq.',
}

export default function ElectricField({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="physics2-efield"
    title="שדה חשמלי"
    subtitle="הגדרה, מטען נקודתי, סופרפוזיציה, התפלגות רציפה"
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
