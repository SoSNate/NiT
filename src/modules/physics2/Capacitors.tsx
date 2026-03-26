/**
 * Capacitors.tsx — קבלים ואנרגיה חשמלית
 * Source: Physics 2 HIT — שיעור 1.pdf, מבוא חשמל.pdf
 * Built: 2026-03-25
 */
import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import { GlassCard, StyledSlider, SimReadout, ToggleGroup } from '../../components/SimulatorShell'
import type { QuizQuestion, GuideSection } from '../../types'

// ── SIMULATOR ─────────────────────────────────────────────────────────────────
function Sim({ currentStep: _cs }: { currentStep: number }) {
  const [mode, setMode] = useState<'single' | 'series' | 'parallel'>('single')
  const [C1, setC1] = useState(4)   // μF
  const [C2, setC2] = useState(2)   // μF
  const [V, setV]   = useState(12)  // Volt

  const eps0 = 8.85e-12

  const { Ceq, Q, U } = useMemo(() => {
    let Ceq: number
    if (mode === 'single')   Ceq = C1 * 1e-6
    else if (mode === 'series')   Ceq = (C1 * C2) / (C1 + C2) * 1e-6
    else                          Ceq = (C1 + C2) * 1e-6
    const Q = Ceq * V
    const U = 0.5 * Ceq * V * V
    return { Ceq: Ceq * 1e6, Q: Q * 1e6, U: U * 1e3 }
  }, [mode, C1, C2, V])

  const plateColor = '#60a5fa'
  const cx = 200, cy = 200
  const gap = mode === 'single' ? 40 : 30
  const plateW = 100, plateH = 6

  return (
    <div className="w-full space-y-4" dir="ltr">
      <GlassCard className="overflow-hidden bg-slate-950">
        <svg viewBox="0 0 400 300" className="w-full" style={{ maxHeight: 240 }}>
          <defs>
            <pattern id="cap-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.04" />
            </pattern>
          </defs>
          <rect width="400" height="300" fill="url(#cap-grid)" />

          {mode === 'single' && <>
            {/* top plate */}
            <motion.rect x={cx - plateW/2} y={cy - gap - plateH} width={plateW} height={plateH}
              fill={plateColor} fillOpacity={0.8} rx={2}
              animate={{ y: cy - gap - plateH }} />
            {/* bottom plate */}
            <motion.rect x={cx - plateW/2} y={cy + gap} width={plateW} height={plateH}
              fill={plateColor} fillOpacity={0.8} rx={2} />
            {/* + charges on top */}
            {[0,1,2,3,4].map(i => (
              <text key={i} x={cx - 40 + i * 20} y={cy - gap - plateH/2 + 4}
                textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold">+</text>
            ))}
            {/* - charges on bottom */}
            {[0,1,2,3,4].map(i => (
              <text key={i} x={cx - 40 + i * 20} y={cy + gap + plateH/2 + 4}
                textAnchor="middle" fill="#f87171" fontSize="12" fontWeight="bold">−</text>
            ))}
            {/* E field arrows */}
            {[0,1,2].map(i => (
              <g key={i}>
                <line x1={cx - 20 + i * 20} y1={cy - gap + 6} x2={cx - 20 + i * 20} y2={cy + gap - 6}
                  stroke="#22d3ee" strokeWidth="1.5" markerEnd="url(#arrow)" />
              </g>
            ))}
            <defs>
              <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#22d3ee" />
              </marker>
            </defs>
            <text x={cx + 60} y={cy + 4} fill="#22d3ee" fontSize="10">E</text>
            {/* d label */}
            <line x1={cx + 70} y1={cy - gap} x2={cx + 70} y2={cy + gap} stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
            <text x={cx + 80} y={cy + 4} fill="#94a3b8" fontSize="9">d</text>
          </>}

          {mode === 'series' && <>
            <text x={cx} y={80} textAnchor="middle" fill="#94a3b8" fontSize="11">C₁ ───── C₂</text>
            <text x={cx} y={100} textAnchor="middle" fill="#fbbf24" fontSize="10">1/C_eq = 1/C₁ + 1/C₂</text>
            <rect x={cx - 80} y={120} width={60} height={30} rx={4}
              fill="none" stroke={plateColor} strokeWidth="2" />
            <text x={cx - 50} y={140} textAnchor="middle" fill="white" fontSize="11">C₁={C1}μF</text>
            <rect x={cx + 20} y={120} width={60} height={30} rx={4}
              fill="none" stroke={plateColor} strokeWidth="2" />
            <text x={cx + 50} y={140} textAnchor="middle" fill="white" fontSize="11">C₂={C2}μF</text>
            <text x={cx} y={200} textAnchor="middle" fill="#34d399" fontSize="12">C_eq = {Ceq.toFixed(2)} μF</text>
          </>}

          {mode === 'parallel' && <>
            <text x={cx} y={80} textAnchor="middle" fill="#94a3b8" fontSize="11">C₁ ═══ C₂</text>
            <text x={cx} y={100} textAnchor="middle" fill="#fbbf24" fontSize="10">C_eq = C₁ + C₂</text>
            <rect x={cx - 80} y={120} width={60} height={30} rx={4}
              fill="none" stroke={plateColor} strokeWidth="2" />
            <text x={cx - 50} y={140} textAnchor="middle" fill="white" fontSize="11">C₁={C1}μF</text>
            <rect x={cx + 20} y={120} width={60} height={30} rx={4}
              fill="none" stroke={plateColor} strokeWidth="2" />
            <text x={cx + 50} y={140} textAnchor="middle" fill="white" fontSize="11">C₂={C2}μF</text>
            <text x={cx} y={200} textAnchor="middle" fill="#34d399" fontSize="12">C_eq = {Ceq.toFixed(2)} μF</text>
          </>}
        </svg>
      </GlassCard>

      <div className="grid grid-cols-3 gap-2">
        <SimReadout label="C_eq" value={Ceq.toFixed(2)} unit="μF" />
        <SimReadout label="Q" value={Q.toFixed(1)} unit="μC" />
        <SimReadout label="U" value={U.toFixed(2)} unit="mJ" />
      </div>

      <ToggleGroup
        value={mode}
        onChange={v => setMode(v as typeof mode)}
        options={[
          { value: 'single',   label: 'בודד' },
          { value: 'series',   label: 'טורי' },
          { value: 'parallel', label: 'מקבילי' },
        ]}
      />
      <StyledSlider label="C₁" value={C1} min={1} max={20} step={1} unit="μF" onChange={setC1} />
      {mode !== 'single' && (
        <StyledSlider label="C₂" value={C2} min={1} max={20} step={1} unit="μF" onChange={setC2} />
      )}
      <StyledSlider label="מתח V" value={V} min={1} max={50} step={1} unit="V" onChange={setV} />
    </div>
  )
}

// ── STEP 1 — זיהוי ────────────────────────────────────────────────────────────
const step1 = <PatternStep
  scenario="קבל מישורי עם שטח A, מרחק בין לוחות d, מחובר למתח V. נדרש: מצא קיבול, מטען, שדה, אנרגיה."
  prompt="מה הקיבול של קבל מישורי?"
  options={[
    { label: 'C = ε₀A/d', desc: 'נכון — גדל עם שטח, קטן עם מרחק', correct: true },
    { label: 'C = ε₀d/A', desc: 'הפוך — מרחק גדול → קיבול קטן', correct: false },
    { label: 'C = Q·V', desc: 'זה הגדרה הפוכה — C = Q/V', correct: false },
    { label: 'C = σ/ε₀', desc: 'זה E (שדה), לא קיבול', correct: false },
  ]}
  correctFeedback="נכון. C = ε₀A/d. עם דיאלקטריק: C = κε₀A/d."
/>

// ── STEP 2 — עיקרון ───────────────────────────────────────────────────────────
const step2 = <PrincipleStep
  heading="קבלים — המסלול המלא:"
  items={[
    {
      title: 'הגדרה ונוסחאות יסוד',
      content: <div className="space-y-1">
        <Formula c="C = Q/V" color="text-yellow-300" />
        <Formula c="C_מישורי = ε₀A/d" color="text-blue-300" />
        <p className="text-slate-400 text-xs">עם דיאלקטריק: C = κε₀A/d, כאשר κ ≥ 1</p>
      </div>,
    },
    {
      title: 'חיבור קבלים',
      content: <div className="space-y-1">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-blue-900/30 rounded p-2 text-center">
            <p className="text-blue-300 font-bold">טורי</p>
            <p className="text-slate-300" dir="ltr">1/C_eq = Σ 1/Cᵢ</p>
            <p className="text-slate-400">Q זהה, V מתחלק</p>
          </div>
          <div className="bg-emerald-900/30 rounded p-2 text-center">
            <p className="text-emerald-300 font-bold">מקבילי</p>
            <p className="text-slate-300" dir="ltr">C_eq = ΣCᵢ</p>
            <p className="text-slate-400">V זהה, Q מתחלק</p>
          </div>
        </div>
      </div>,
      accent: 'text-blue-400',
    },
    {
      title: 'אנרגיה אגורה',
      content: <div className="space-y-1">
        <Formula c="U = ½CV² = Q²/2C = ½QV" color="text-emerald-300" />
        <Note color="yellow" children={<>כל 3 הצורות נכונות — בחר לפי מה ידוע</>} />
      </div>,
      accent: 'text-emerald-400',
    },
    {
      title: 'שדה חשמלי בתוך קבל',
      content: <div className="space-y-1">
        <Formula c="E = V/d = σ/ε₀" color="text-cyan-300" />
        <p className="text-slate-400 text-xs">השדה אחיד בין הלוחות (לאורך כל d)</p>
      </div>,
      accent: 'text-cyan-400',
    },
  ]}
/>

// ── STEP 3 — דוגמה ────────────────────────────────────────────────────────────
const step3 = <WorkedExample
  examLabel="שיעור 2, עמ' 18 — פרופ' פרוכטמן HIT — קבל מישורי"
  problem={
    <div className="space-y-1 text-sm">
      <p>קבל מישורי: שני לוחות נושאים צפיפות מטען משטחית <span className="font-mono text-blue-300">±σ</span>.</p>
      <p><strong>(א)</strong> מהו השדה החשמלי בין הלוחות ומחוצה להם?</p>
      <p><strong>(ב)</strong> קבל: A = 0.01 m², d = 1 mm, V = 100V. מצא C, Q, E, U.</p>
      <p className="text-slate-400 text-xs mt-1">מקור: שיעור 2.pdf עמ' 18 — "השדה החשמלי מחוץ ללוחות הוא אפס"</p>
    </div>
  }
  hint="השתמש בסופרפוזיציה של שני מישורים אינסופיים: בין הלוחות מתחברים, מחוץ מתבטלים."
  solution={[
    {
      label: 'שלב א — שדה בין הלוחות ומחוץ',
      thought: 'כל לוח יוצר E = σ/2ε₀ בשני הכיוונים. סופרפוזיציה: בין הלוחות מתחברים.',
      content: <div className="space-y-1 text-sm">
        <p className="font-mono text-xs" dir="ltr">E_between = σ/ε₀ (פנימה, אחיד)</p>
        <p className="font-mono text-xs text-emerald-400" dir="ltr">E_outside = 0 (מתבטל)</p>
        <Note color="blue" children={<>"השדה החשמלי מחוץ ללוחות הוא אפס" — שיעור 2.pdf עמ' 18</>} />
      </div>,
    },
    {
      label: 'שלב ב — חישוב C, Q, E, U',
      thought: 'C = ε₀A/d, Q = CV, E = V/d, U = ½CV²',
      content: <div className="space-y-1 text-xs font-mono" dir="ltr">
        <p>C = ε₀A/d = 8.85×10⁻¹² × 0.01 / 0.001 = <span className="text-emerald-400">88.5 pF</span></p>
        <p>Q = CV = 88.5×10⁻¹² × 100 = <span className="text-emerald-400">8.85 nC</span></p>
        <p>E = V/d = 100 / 0.001 = <span className="text-emerald-400">10⁵ V/m</span></p>
        <p>U = ½CV² = ½ × 88.5×10⁻¹² × 10⁴ = <span className="text-emerald-400">442.5 pJ</span></p>
      </div>,
    },
    {
      label: 'בדיקה — E = σ/ε₀',
      thought: 'אפשר לבדוק: σ = Q/A → E = σ/ε₀',
      content: <div className="space-y-1 text-xs font-mono" dir="ltr">
        <p>σ = Q/A = 8.85×10⁻⁹ / 0.01 = 885 nC/m²</p>
        <p>E = σ/ε₀ = 885×10⁻⁹ / 8.85×10⁻¹² = <span className="text-emerald-400">10⁵ V/m ✓</span></p>
      </div>,
    },
  ]}
/>

// ── QUIZ ──────────────────────────────────────────────────────────────────────
const quiz: QuizQuestion[] = [
  {
    question: 'קבל מישורי עם מרחק d מחובר למתח V. מכפילים את d פי 2 (המתח קבוע). מה קורה לאנרגיה?',
    options: ['מוכפלת פי 2', 'מוכפלת פי 4', 'מחצית', 'לא משתנה'],
    correct: 2,
    explanation: 'C = ε₀A/d → מכפילים d → C קטן בחצי. U = ½CV², V קבוע → U = ½(C/2)V² = U_orig/2.',
  },
  {
    question: 'שני קבלים C₁=4μF וC₂=4μF בטור. מה Ceq?',
    options: ['8 μF', '4 μF', '2 μF', '1 μF'],
    correct: 2,
    explanation: '1/Ceq = 1/4 + 1/4 = 2/4 → Ceq = 2μF. קבלים זהים בטור: Ceq = C/n.',
  },
  {
    question: 'קבל עם דיאלקטריק κ=3, שטח A, מרחק d. מה C?',
    options: ['ε₀A/d', '3ε₀A/d', 'ε₀A/(3d)', '3ε₀/(Ad)'],
    correct: 1,
    explanation: 'עם דיאלקטריק: C = κε₀A/d = 3ε₀A/d.',
  },
]

// ── PRACTICE ──────────────────────────────────────────────────────────────────
const practice: QuizQuestion[] = [
  {
    question: 'קבל 10μF מחובר ל-V=5V. כמה מטען אגור?',
    options: ['2 μC', '50 μC', '0.5 μC', '15 μC'],
    correct: 1,
    explanation: 'Q = CV = 10×10⁻⁶ · 5 = 50μC.',
  },
  {
    question: 'מה האנרגיה ב-C=2μF, V=10V?',
    options: ['100 μJ', '200 μJ', '20 μJ', '10 mJ'],
    correct: 0,
    explanation: 'U = ½CV² = ½ · 2×10⁻⁶ · 100 = 100μJ.',
  },
  {
    question: 'שלושה קבלים 6μF כל אחד במקביל. Ceq?',
    options: ['2 μF', '6 μF', '18 μF', '3 μF'],
    correct: 2,
    explanation: 'מקביל: Ceq = C₁ + C₂ + C₃ = 6+6+6 = 18μF.',
  },
  {
    question: 'קבל טעון Q=40μC, C=8μF. מה המתח?',
    options: ['320 V', '5 V', '0.2 V', '48 V'],
    correct: 1,
    explanation: 'V = Q/C = 40×10⁻⁶ / 8×10⁻⁶ = 5V.',
  },
  {
    question: 'קבל מישורי: A=0.01m², d=1mm. מה C (ε₀=8.85×10⁻¹²)?',
    options: ['88.5 pF', '8.85 pF', '885 pF', '0.885 nF'],
    correct: 0,
    explanation: 'C = ε₀A/d = 8.85×10⁻¹² · 0.01 / 0.001 = 88.5×10⁻¹² = 88.5pF.',
  },
]

// ── GREEN NOTE ────────────────────────────────────────────────────────────────
const greenNote = [
  'זהה חיבור: טורי (Q שווה) vs מקבילי (V שווה)',
  'C = Q/V, U = ½CV² — שתי נוסחאות מרכזיות',
  'עם דיאלקטריק: C גדל פי κ → יותר מטען באותו מתח',
  'בדוק יחידות: [C] = F = C/V, [U] = J',
]

// ── GUIDES ────────────────────────────────────────────────────────────────────
const guides: GuideSection[] = [
  {
    title: 'מתי להשתמש',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p className="text-yellow-400 font-bold text-xs">אבחון מהיר</p>
      <p className="text-xs">1. קבל אחד? → C = ε₀A/d (או κε₀A/d)</p>
      <p className="text-xs">2. מספר קבלים? → זהה טורי/מקבילי → Ceq</p>
      <p className="text-xs">3. שואלים על אנרגיה? → U = ½CV²</p>
      <Note color="blue" children={<>בטורי — זכור: 1/Ceq = Σ1/Cᵢ (לא Σ1/Cᵢ⁻¹)</>} />
    </div>,
  },
  {
    title: 'שגיאות נפוצות',
    content: <div className="space-y-2 text-sm">
      <p className="text-red-400 text-xs font-bold">שגיאה #1 — הוספת קבלים בטורי</p>
      <p className="text-slate-300 text-xs">אל תסכום C בטורי! סכום את 1/C ואז הפוך.</p>
      <p className="text-red-400 text-xs font-bold mt-2">שגיאה #2 — בלבול בין Q וV בטורי</p>
      <p className="text-slate-300 text-xs">טורי: Q שווה לכולם. מקבילי: V שווה לכולם.</p>
      <p className="text-red-400 text-xs font-bold mt-2">שגיאה #3 — שכחת ½ באנרגיה</p>
      <p className="text-slate-300 text-xs">U = ½CV², לא CV²! הגורם ½ תמיד שם.</p>
    </div>,
  },
]

// ── INTRO + BRIDGE ────────────────────────────────────────────────────────────
const intro = <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
  <p>
    קבל הוא רכיב שמאחסן <span className="text-yellow-400 font-semibold">אנרגיה חשמלית</span> בין שני לוחות.
    הבסיס של כל מעגל — ממצלמות ועד מחשבים.
  </p>
  <Formula c="C = Q/V" color="text-yellow-300" />
  <p className="text-slate-400 text-xs">יחידות: [C] = פארד (F) = קולון/וולט</p>
</div>

const bridge = <div className="space-y-2 text-sm text-slate-300">
  <p>מחוק גאוס + סופרפוזיציה: השדה בין לוחות = <span className="text-emerald-400">E = σ/ε₀</span></p>
  <p>מחוץ ללוחות: <span className="text-red-400">E = 0</span> (שיעור 2.pdf עמ' 18)</p>
  <p>מתח: V = E·d → קיבול: C = Q/V = ε₀A/d</p>
  <Formula c="C = ε₀A/d" color="text-emerald-300" />
</div>

const theory: TheoryCard = {
  summary: 'קבל מאחסן מטען ואנרגיה. קיבולו תלוי בגיאומטריה. חיבורים טוריים ומקבילים שולטים על Ceq.',
  formulas: [
    { label: 'קיבול מישורי', tex: 'C = \\dfrac{\\varepsilon_0 A}{d}' },
    { label: 'אנרגיה', tex: 'U = \\dfrac{1}{2}CV^2 = \\dfrac{Q^2}{2C}' },
    { label: 'טורי', tex: '\\dfrac{1}{C_{eq}} = \\sum \\dfrac{1}{C_i}' },
    { label: 'מקבילי', tex: 'C_{eq} = \\sum C_i' },
  ],
  when: 'שאלות על מטען, מתח, אנרגיה בקבל — בדוק אם בודד / טורי / מקבילי → Ceq → Q = CeqV → U = ½CeqV²',
}

export default function Capacitors({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="physics2-capacitors"
    title="קבלים"
    subtitle="קיבול, מטען, אנרגיה — חיבורים טוריים ומקבילים"
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
