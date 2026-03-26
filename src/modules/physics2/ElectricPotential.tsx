/**
 * ElectricPotential.tsx — built from Gemini CONTENT response
 * Source: שיעור 2.pdf + מבוא חשמל.pdf — פוטנציאל חשמלי
 * Built: 2026-03-26
 */
import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, FormulaBlock, Note } from '../../components/StepHelpers'
import { GlassCard, StyledSlider, SimReadout, ToggleGroup } from '../../components/SimulatorShell'
import type { QuizQuestion, GuideSection } from '../../types'

// ── SIMULATOR ────────────────────────────────────────────────────────────────
function Sim({ currentStep: _cs }: { currentStep: number }) {
  const [Q1, setQ1] = useState(2)    // μC
  const [Q2, setQ2] = useState(-1)   // μC
  const [xP, setXP] = useState(0.5)  // m — position of point P along x-axis
  const [mode, setMode] = useState<'potential' | 'energy'>('potential')

  const k = 9e9
  const q1 = Q1 * 1e-6
  const q2 = Q2 * 1e-6
  const d  = 0.6  // fixed distance between charges (m)

  // Q1 at x=0, Q2 at x=d. Point P at x=xP (on x-axis)
  const r1 = Math.abs(xP)
  const r2 = Math.abs(xP - d)
  const V1 = r1 > 0.01 ? k * q1 / r1 : 0
  const V2 = r2 > 0.01 ? k * q2 / r2 : 0
  const VP = V1 + V2

  // System energy
  const U12 = k * q1 * q2 / d

  // Equipotential visualization (V along x-axis)
  const W = 300, H = 100
  const vPoints = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => {
      const x = (i / 119) * 1.4 - 0.1
      const r1x = Math.abs(x)
      const r2x = Math.abs(x - d)
      if (r1x < 0.03 || r2x < 0.03) return null
      const v  = k * q1 / r1x + k * q2 / r2x
      const vClamped = Math.max(-150000, Math.min(150000, v))
      const px = (i / 119) * W
      const py = H / 2 - (vClamped / 150000) * (H / 2 - 8)
      return `${px},${py}`
    }).filter(Boolean).join(' ')
  }, [q1, q2, d])

  const pxPos = ((xP + 0.1) / 1.4) * W

  return (
    <div className="w-full space-y-4" dir="ltr">
      <GlassCard className="overflow-hidden bg-slate-950">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 110 }}>
          {/* Axis */}
          <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="#334155" strokeWidth="1" />
          <line x1="0" y1="0"    x2="0" y2={H}    stroke="#334155" strokeWidth="0.5" />

          {/* V(x) curve */}
          {vPoints && <polyline points={vPoints} fill="none" stroke="#60a5fa" strokeWidth="2" />}

          {/* Charges */}
          <circle cx={(0.1 / 1.4) * W} cy={H / 2} r="6"
            fill={q1 > 0 ? '#f87171' : '#60a5fa'} opacity="0.9" />
          <text x={(0.1 / 1.4) * W} y={H / 2 + 18} textAnchor="middle"
            fill={q1 > 0 ? '#f87171' : '#60a5fa'} fontSize="8">Q₁</text>

          <circle cx={((0.1 + d) / 1.4) * W} cy={H / 2} r="6"
            fill={q2 > 0 ? '#f87171' : '#60a5fa'} opacity="0.9" />
          <text x={((0.1 + d) / 1.4) * W} y={H / 2 + 18} textAnchor="middle"
            fill={q2 > 0 ? '#f87171' : '#60a5fa'} fontSize="8">Q₂</text>

          {/* Point P marker */}
          <motion.line x1={pxPos} y1="0" x2={pxPos} y2={H}
            stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 3"
            animate={{ x1: pxPos, x2: pxPos }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          />
          <text x={pxPos + 3} y="10" fill="#fbbf24" fontSize="8">P</text>

          <text x="4" y="12" fill="#60a5fa" fontSize="8" fontFamily="monospace">V(x)</text>
          <text x={W - 4} y="12" textAnchor="end" fill="#94a3b8" fontSize="7">kV</text>
        </svg>
      </GlassCard>

      <div className="grid grid-cols-2 gap-2">
        <SimReadout label="V_P" value={(VP / 1000).toFixed(1)} unit="kV" />
        <SimReadout label="U₁₂" value={(U12).toFixed(3)} unit="J" />
      </div>

      <ToggleGroup
        value={mode}
        onChange={v => setMode(v as typeof mode)}
        options={[
          { value: 'potential', label: 'פוטנציאל V' },
          { value: 'energy',    label: 'אנרגיה U' },
        ]}
      />
      <StyledSlider label="Q₁" value={Q1}  min={-5}  max={5}  step={0.5} unit="μC" onChange={setQ1} />
      <StyledSlider label="Q₂" value={Q2}  min={-5}  max={5}  step={0.5} unit="μC" onChange={setQ2} />
      <StyledSlider label="נקודה P (x)" value={xP} min={-0.05} max={0.65} step={0.01} unit="m" onChange={setXP} />

      <AnimatePresence mode="wait">
        <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="text-center text-xs text-slate-400 mt-1">
          {mode === 'potential'
            ? `V_P = ${(V1 / 1000).toFixed(1)} + ${(V2 / 1000).toFixed(1)} = ${(VP / 1000).toFixed(1)} kV`
            : `U₁₂ = kQ₁Q₂/d = ${U12.toFixed(3)} J`}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── STEP 1 — זיהוי ──────────────────────────────────────────────────────────
const step1 = <PatternStep
  scenario="שני מטענים Q₁=+2μC ו-Q₂=-3μC. רוצים פוטנציאל בנקודה P ואנרגיה של המערכת."
  prompt="מה ההבדל בין חישוב פוטנציאל לחישוב שדה?"
  options={[
    { label: 'פוטנציאל = סקלר → סכום אלגברי פשוט', desc: 'נכון! V_total = V₁ + V₂. אין וקטורים, אין רכיבים.', correct: true },
    { label: 'פוטנציאל = וקטור → חיבור בהלכה וקטורית', desc: 'שגוי. פוטנציאל הוא סקלר — רק מספרים עם סימן.', correct: false },
    { label: 'כמו שדה: E=kQ/r², V=kQ/r²', desc: 'V=kQ/r (ולא r²). ההבדל קריטי!', correct: false },
    { label: 'פוטנציאל לא תלוי בסימן המטען', desc: 'שגוי. Q⁻ נותן V שלילי, Q⁺ נותן V חיובי.', correct: false },
  ]}
  correctFeedback="נכון! V סקלרי → V_total = Σ kQᵢ/rᵢ. פשוט יותר מחישוב E — אין וקטורים!"
/>

// ── STEP 2 — עיקרון ──────────────────────────────────────────────────────────
const step2 = <PrincipleStep
  heading="פוטנציאל חשמלי — 4 עקרונות:"
  items={[
    {
      title: 'הגדרה וקשר ל-E',
      content: <div className="space-y-2">
        <FormulaBlock
          formula="V = U/q₀  [וולט = J/C]"
          verbal="פוטנציאל = אנרגיה פוטנציאלית לכל יחידת מטען. כמו גובה — גוף גבוה יותר = אנרגיה פוטנציאלית יותר. מטען חיובי נדחף ממקום V גבוה לנמוך (כמו כדור מגבעה). שלילי — הפוך. יחידות: 1 וולט = 1 J/C."
          color="text-yellow-300"
          units="V = J/C"
        />
        <FormulaBlock
          formula="E = -dV/dr"
          verbal="E הוא שיפוע V — כמה מהר V משתנה. בממד אחד: E = -dV/dx. המינוס: השדה מצביע מ-V גבוה לנמוך (כיוון 'ירידה'). בתלת-ממד: E = -∇V (גרדיאנט שלילי)."
          color="text-blue-300"
          units="N/C = V/m"
        />
        <FormulaBlock
          formula="ΔV = -∫E·dr"
          verbal="ΔV בין שתי נקודות = מינוס עבודת השדה על מטען יחידה. כשE נתון ורוצים V — מאנגדלים לאורך נתיב (כל נתיב! V תלוי מיקום בלבד). כשV נתון ורוצים E — גוזרים."
          color="text-blue-300"
        />
        <Note color="yellow" children={<>שדה גבוה = שיפוע חד של V. E חיובי = V יורד לכיוון E.</>} />
      </div>,
    },
    {
      title: 'פוטנציאל של מטען נקודתי',
      content: <div className="space-y-1">
        <Formula c="V = kQ/r" color="text-emerald-300" />
        <p className="text-slate-400 text-xs">Q⁺ → V חיובי. Q⁻ → V שלילי. V→0 כש-r→∞.</p>
        <div className="grid grid-cols-2 gap-1 text-xs text-center mt-1">
          <div className="bg-red-900/20 rounded p-1 text-red-300">E = kQ/r²</div>
          <div className="bg-emerald-900/20 rounded p-1 text-emerald-300">V = kQ/r</div>
        </div>
      </div>,
      accent: 'text-emerald-400',
    },
    {
      title: 'סופרפוזיציה (סכום סקלרי)',
      content: <div className="space-y-1">
        <Formula c="V_total = Σ kQᵢ/rᵢ" color="text-purple-300" />
        <Note color="blue" children={<>לא צריך לפרק לרכיבים — זו היתרון הגדול על E</>} />
      </div>,
      accent: 'text-purple-400',
    },
    {
      title: 'אנרגיה פוטנציאלית',
      content: <div className="space-y-1">
        <Formula c="U = qV  →  W = qΔV" color="text-orange-300" />
        <Formula c="U₁₂ = kQ₁Q₂/r₁₂  (זוג מטענים)" color="text-orange-300" />
        <p className="text-slate-400 text-xs">{"מערכת N מטענים: U_total = Σ_{i<j} kQᵢQⱼ/rᵢⱼ"}</p>
      </div>,
    },
  ]}
/>

// ── STEP 3 — דוגמה (EXAM מגמיני — שיעור 2.pdf) ────────────────────────────
const step3 = <WorkedExample
  examLabel="שיעור 2.pdf — שלושה מטענים: V_P ואנרגיית מערכת"
  problem={<p>
    Q₁=+2μC ב-(0,0), Q₂=-3μC ב-(0.3,0), Q₃=+4μC ב-(0,0.4).
    (א) פוטנציאל בנקודה P=(0.3,0.4)?
    (ב) אנרגיה פוטנציאלית של המערכת?
  </p>}
  hint="פוטנציאל = סכום סקלרי kQ/r. אנרגיה = Σ כל זוגות kQ₁Q₂/r."
  solution={[
    {
      label: 'שלב א — מרחקים מכל מטען ל-P',
      thought: 'r₁ = √(0.3²+0.4²), r₂ = |0.4|, r₃ = |0.3|',
      content: <div className="space-y-1 text-xs" dir="ltr">
        <p className="text-slate-300">{"r₁ = √(0.09+0.16) = √0.25 = 0.5 m"}</p>
        <p className="text-slate-300">{"r₂ = 0.4 m  (P ישירות מעל Q₂)"}</p>
        <p className="text-slate-300">{"r₃ = 0.3 m  (P ישירות מימין Q₃)"}</p>
      </div>,
    },
    {
      label: 'שלב ב — פוטנציאל מכל מטען',
      thought: 'V = kQ/r לכל מטען, אז סכום',
      content: <div className="space-y-1 text-xs" dir="ltr">
        <p className="text-yellow-300">{"V₁ = 9×10⁹ × 2×10⁻⁶ / 0.5 = +36 kV"}</p>
        <p className="text-red-300">{"V₂ = 9×10⁹ × (-3×10⁻⁶) / 0.4 = -67.5 kV"}</p>
        <p className="text-yellow-300">{"V₃ = 9×10⁹ × 4×10⁻⁶ / 0.3 = +120 kV"}</p>
        <Formula c="V_P = 36 - 67.5 + 120 = 88.5 kV" color="text-emerald-300" />
      </div>,
    },
    {
      label: 'שלב ג — אנרגיה: 3 זוגות',
      thought: 'r₁₂=0.3m, r₁₃=0.4m, r₂₃=√(0.3²+0.4²)=0.5m',
      content: <div className="space-y-1 text-xs" dir="ltr">
        <p className="text-slate-300">{"U₁₂ = k×(+2)×(-3)×10⁻¹² / 0.3 = -0.18 J"}</p>
        <p className="text-slate-300">{"U₁₃ = k×(+2)×(+4)×10⁻¹² / 0.4 = +0.18 J"}</p>
        <p className="text-slate-300">{"U₂₃ = k×(-3)×(+4)×10⁻¹² / 0.5 = -0.216 J"}</p>
        <Formula c="U_total = -0.18 + 0.18 - 0.216 = -0.216 J" color="text-emerald-300" />
        <Note color="blue" children={<>U שלילי = המערכת יציבה — צריך אנרגיה כדי להפריד</>} />
      </div>,
    },
  ]}
/>

// ── QUIZ ─────────────────────────────────────────────────────────────────────
const quiz: QuizQuestion[] = [
  {
    question: 'פוטנציאל של מטען Q=-2μC ב-r=0.5m?',
    options: ['-36 kV', '+36 kV', '-72 kV', '0'],
    correct: 0,
    explanation: 'V = kQ/r = 9×10⁹ × (-2×10⁻⁶) / 0.5 = -36,000 V = -36 kV.',
  },
  {
    question: 'מה ההבדל בין E לבין V מבחינת חישוב סופרפוזיציה?',
    options: ['E וקטור → חיבור רכיבים; V סקלר → סכום אלגברי', 'שניהם סקלרים', 'שניהם וקטורים', 'V וקטור, E סקלר'],
    correct: 0,
    explanation: 'E = וקטור → חייבים לפרק לx,y ולחבר. V = סקלר → V = Σ kQᵢ/rᵢ ישירות.',
  },
  {
    question: 'שני מטענים +Q ו-+Q במרחק d. אנרגיה פוטנציאלית?',
    options: ['U = kQ²/d > 0', 'U = -kQ²/d < 0', 'U = 0', 'U = 2kQ²/d'],
    correct: 0,
    explanation: 'U = kQ₁Q₂/r = kQ²/d > 0. מטענים בסימן זהה → דוחים → צריך עבודה להקרבה → U > 0.',
  },
]

// ── PRACTICE ─────────────────────────────────────────────────────────────────
const practice: QuizQuestion[] = [
  {
    question: 'מהו הפוטנציאל באמצע הדרך בין Q=+4μC ל-Q=-4μC (מרחק 0.6m)?',
    options: ['0 V', '240 kV', '-240 kV', '120 kV'],
    correct: 0,
    explanation: 'V_mid = kQ/0.3 + k(-Q)/0.3 = 0. מטענים שווים ומנוגדים — V=0 בנקודת האמצע.',
  },
  {
    question: 'מטען q=+2μC עובר מנקודה A (V=100V) לנקודה B (V=40V). כמה עבודה עשה השדה?',
    options: ['W = 1.2×10⁻⁴ J', 'W = -1.2×10⁻⁴ J', 'W = 2.8×10⁻⁴ J', 'W = 0'],
    correct: 0,
    explanation: 'W_field = q·(VA-VB) = 2×10⁻⁶ × (100-40) = 1.2×10⁻⁴ J > 0. השדה עשה עבודה חיובית.',
  },
  {
    question: 'E=500 V/m אחיד בכיוון x. ΔV בין שתי נקודות מרוחקות 0.2m בכיוון x?',
    options: ['ΔV = -100 V', 'ΔV = +100 V', 'ΔV = 0', 'ΔV = -2500 V'],
    correct: 0,
    explanation: 'ΔV = -E·Δx = -500×0.2 = -100 V. V יורד בכיוון E.',
  },
  {
    question: 'שני מטענים +Q₁=1μC ב-x=0 ו-Q₂=2μC ב-x=1m. איפה V=0 (מלבד אינסוף)?',
    options: ['לא קיים (שניהם חיוביים)', 'x = 0.5m', 'x = 0.33m', 'x = -1m'],
    correct: 0,
    explanation: 'שני מטענים חיוביים → V > 0 בכל נקודה סופית. V=0 רק באינסוף.',
  },
]

// ── GREEN NOTE ────────────────────────────────────────────────────────────────
const greenNote = [
  'V = kQ/r (סקלר!). E = kQ/r² (וקטור)',
  'סופרפוזיציה V: סכום אלגברי Σ kQᵢ/rᵢ — ללא וקטורים',
  'E = -dV/dr: שדה הוא שיפוע שלילי של פוטנציאל',
  'אנרגיה: U = qV. זוג: U₁₂ = kQ₁Q₂/r₁₂',
]

// ── GUIDES ────────────────────────────────────────────────────────────────────
const guides: GuideSection[] = [
  {
    title: 'מתי להשתמש',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p className="text-yellow-400 font-bold text-xs">שאלה מנחה</p>
      <p className="text-xs">רוצים כוח/שדה? → E = kQ/r² (וקטור)</p>
      <p className="text-xs">רוצים פוטנציאל/אנרגיה? → V = kQ/r (סקלר)</p>
      <p className="text-xs">יש E, רוצים V? → ΔV = -∫E·dr</p>
      <p className="text-xs">יש V, רוצים E? → E = -dV/dr</p>
      <Note color="blue" children={<>V קל יותר לחשב — תמיד העדף אותו כשאפשר</>} />
    </div>,
  },
  {
    title: 'שגיאות נפוצות',
    content: <div className="space-y-2 text-sm">
      <p className="text-red-400 text-xs font-bold">שגיאה #1 — V כמו E</p>
      <p className="text-slate-300 text-xs">V = kQ/r (לא r²!). בלבול זה הטעות הנפוצה ביותר.</p>
      <p className="text-red-400 text-xs font-bold mt-2">שגיאה #2 — שכחת סימן</p>
      <p className="text-slate-300 text-xs">Q שלילי → V שלילי. U יכולה להיות שלילית (מערכת כבולה).</p>
      <p className="text-red-400 text-xs font-bold mt-2">שגיאה #3 — וקטור V</p>
      <p className="text-slate-300 text-xs">V סקלר → אסור לפרק לרכיבים. רק סכום/הפרש מספרים.</p>
    </div>,
  },
]

// ── INTRO + BRIDGE ────────────────────────────────────────────────────────────
const intro = <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
  <p>חישוב שדה חשמלי דורש <span className="text-red-400 font-semibold">אינטגרל וקטורי</span> — מסובך. פוטנציאל חשמלי הוא <span className="text-emerald-400 font-semibold">סקלר</span> — פשוט יותר.</p>
  <Formula c="V = kQ/r  [V = וולט = J/C]" color="text-yellow-300" />
  <p className="text-slate-400 text-xs">ברגע שיש V — אפשר לחשב כוח, עבודה ואנרגיה בקלות.</p>
</div>

const bridge = <div className="space-y-2 text-sm text-slate-300">
  <p>זוכר <span className="text-orange-400 font-semibold">שדה חשמלי</span> E = kQ/r²?</p>
  <p>פוטנציאל הוא "אינטגרל" שלו:</p>
  <Formula c="V = kQ/r  =  -∫E·dr" color="text-orange-300" />
  <p className="text-slate-400 text-xs">כמו גובה בגרביטציה — E = כוח, V = גובה פוטנציאלי.</p>
</div>

const theory: TheoryCard = {
  summary: 'פוטנציאל חשמלי V הוא אנרגיה פוטנציאלית ליחידת מטען. הוא סקלר — קל לחשב. E = -∇V. סופרפוזיציה: V_total = Σ kQᵢ/rᵢ.',
  formulas: [
    { label: 'פוטנציאל מטען נקודתי', tex: 'V = \\dfrac{kQ}{r}' },
    { label: 'קשר E↔V', tex: 'E = -\\dfrac{dV}{dr} \\,,\\quad \\Delta V = -\\int \\vec{E} \\cdot d\\vec{r}' },
    { label: 'אנרגיה פוטנציאלית', tex: 'U = qV \\,,\\quad U_{12} = \\dfrac{kQ_1 Q_2}{r_{12}}' },
  ],
  when: 'V = סקלר → סופרפוזיציה קלה. E = וקטור → צריך רכיבים. כשיש מספר מטענים — חשב V קודם, אחר כך E אם צריך.',
}

export default function ElectricPotential({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="physics2-potential"
    title="פוטנציאל חשמלי"
    subtitle="V=kQ/r, סופרפוזיציה סקלרית, אנרגיה"
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
