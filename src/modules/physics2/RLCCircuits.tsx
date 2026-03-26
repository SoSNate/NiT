/**
 * RLCCircuits.tsx — upgraded to PatternStep/PrincipleStep/WorkedExample
 * Source: physics2_lesson 3 2026.pdf (LC oscillations, RLC AC, resonance)
 * Built: 2026-03-26
 */
import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import { GlassCard, StyledSlider, SimReadout, ToggleGroup } from '../../components/SimulatorShell'
import type { QuizQuestion, GuideSection } from '../../types'

// ── SIMULATOR ────────────────────────────────────────────────────────────────
function Sim({ currentStep: _cs }: { currentStep: number }) {
  const [R,   setR]   = useState(10)    // Ω
  const [L,   setL]   = useState(100)   // mH
  const [C,   setC]   = useState(100)   // μF
  const [V0,  setV0]  = useState(10)    // V
  const [mode, setMode] = useState<'series' | 'lc'>('series')

  const Lh  = L * 1e-3
  const Cf  = C * 1e-6
  const w0  = 1 / Math.sqrt(Lh * Cf)
  const f0  = w0 / (2 * Math.PI)
  const XL  = w0 * Lh
  const XC  = 1 / (w0 * Cf)
  const Z   = mode === 'lc' ? 0 : Math.sqrt(R * R + (XL - XC) ** 2)
  const Imax = mode === 'lc' ? V0 / R : V0 / Math.max(Z, 0.01)
  const UL  = 0.5 * Lh * Imax * Imax
  const UC  = 0.5 * Cf * V0 * V0

  // freq sweep for impedance curve
  const freqData = useMemo(() => Array.from({ length: 80 }, (_, i) => {
    const w   = (0.2 + (i / 79) * 3) * w0
    const xl  = w * Lh
    const xc  = 1 / (w * Cf)
    const z   = Math.sqrt(R * R + (xl - xc) ** 2)
    return { x: i / 79, z }
  }), [Lh, Cf, R, w0])
  const maxZ = Math.max(...freqData.map(d => d.z))
  const W = 300, H = 80

  return (
    <div className="w-full space-y-4" dir="ltr">
      <GlassCard className="overflow-hidden bg-slate-950">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 100 }}>
          <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="#334155" strokeWidth="1" />
          {/* Z(ω) curve */}
          <polyline
            points={freqData.map(d => `${d.x * W},${H - (d.z / maxZ) * (H - 8)}`).join(' ')}
            fill="none" stroke="#a78bfa" strokeWidth="2"
          />
          {/* resonance marker */}
          <line x1={W * 0.33} y1="0" x2={W * 0.33} y2={H}
            stroke="#fbbf24" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
          <text x={W * 0.33 + 3} y="12" fill="#fbbf24" fontSize="8">{"ω₀"}</text>
          <text x="6" y="14" fill="#a78bfa" fontSize="9" fontFamily="monospace">{"Z(ω)"}</text>
          <text x={W - 4} y="14" textAnchor="end" fill="#94a3b8" fontSize="8">
            {`f₀=${f0.toFixed(1)}Hz`}
          </text>
        </svg>
      </GlassCard>

      <div className="grid grid-cols-2 gap-2">
        <SimReadout label="f₀ תהודה" value={f0.toFixed(1)}    unit="Hz" />
        <SimReadout label="Z עכבה"   value={Z.toFixed(1)}      unit="Ω"  />
        <SimReadout label="I_max"    value={Imax.toFixed(3)}   unit="A"  />
        <SimReadout label="U_L"      value={UL.toFixed(4)}     unit="J"  />
      </div>

      <ToggleGroup
        value={mode}
        onChange={v => setMode(v as typeof mode)}
        options={[
          { value: 'series', label: 'RLC טורי' },
          { value: 'lc',     label: 'LC בלבד' },
        ]}
      />
      <StyledSlider label="R" value={R}  min={1}   max={100}  step={1}   unit="Ω"  onChange={setR} />
      <StyledSlider label="L" value={L}  min={10}  max={500}  step={10}  unit="mH" onChange={setL} />
      <StyledSlider label="C" value={C}  min={10}  max={1000} step={10}  unit="μF" onChange={setC} />
      <StyledSlider label="V₀" value={V0} min={1}  max={50}   step={1}   unit="V"  onChange={setV0} />
    </div>
  )
}

// ── STEP 1 — זיהוי ──────────────────────────────────────────────────────────
const step1 = <PatternStep
  scenario={<p>מעגל LC: קבל טעון C=100 μF, L=0.1 H. מחברים ומחכים. מה קורה לאנרגיה?</p>}
  prompt="מה מאפיין מעגל LC?"
  options={[
    { label: 'תנודות — אנרגיה עוברת U_C ↔ U_L', desc: 'נכון! בתדר ω₀ = 1/√(LC) האנרגיה מתנדנדת', correct: true },
    { label: 'הקבל מתפרק מיד', desc: 'נכון רק עם R — ב-LC טהור אין דעיכה', correct: false },
    { label: 'אין זרם — המעגל סגור', desc: 'המעגל סגור → זרם זורם! LC = מתנד', correct: false },
    { label: 'אנרגיה נאבדת בגליל', desc: 'ב-L אידיאלי אין אובדן אנרגיה', correct: false },
  ]}
  correctFeedback="נכון! LC = מטוטלת חשמלית. ω₀ = 1/√(LC). עם R — יש דעיכה (RLC מרוסן)."
/>

// ── STEP 2 — עיקרון ──────────────────────────────────────────────────────────
const step2 = <PrincipleStep
  heading="מעגלי LC ו-RLC — 4 עקרונות:"
  items={[
    {
      title: 'תדר תהודה',
      content: <div className="space-y-2">
        <Formula c="ω₀ = 1/√(LC)" color="text-yellow-300" />
        <Formula c="f₀ = ω₀ / (2π)" color="text-yellow-300" />
        <p className="text-slate-400 text-xs">בתהודה: X_L = X_C → Z מינימלי, זרם מקסימלי</p>
      </div>,
    },
    {
      title: 'עכבה RLC טורי',
      content: <div className="space-y-1">
        <Formula c="X_L = ωL,  X_C = 1/(ωC)" color="text-blue-300" />
        <Formula c="Z = √(R² + (X_L - X_C)²)" color="text-blue-300" />
        <Formula c="I_max = V₀/Z" color="text-emerald-300" />
      </div>,
      accent: 'text-blue-400',
    },
    {
      title: 'אנרגיה ב-LC',
      content: <div className="space-y-1">
        <Formula c="U_C = Q²/(2C) = ½CV²" color="text-green-300" />
        <Formula c="U_L = ½LI²" color="text-purple-300" />
        <Formula c="U_total = U_C + U_L = const" color="text-emerald-300" />
        <Note color="yellow" children={<>ב-LC טהור — אנרגיה נשמרת. ב-RLC — מתפזרת על R.</>} />
      </div>,
      accent: 'text-green-400',
    },
    {
      title: 'RL עם DC — טעינה',
      content: <div className="space-y-1">
        <Formula c="I(t) = I_max·(1 - e^(-t/τ)),  τ = L/R" color="text-orange-300" />
        <p className="text-slate-400 text-xs">I_max = V/R. אחרי 5τ — הגליל "טעון".</p>
      </div>,
    },
  ]}
/>

// ── STEP 3 — דוגמה ───────────────────────────────────────────────────────────
const step3 = <WorkedExample
  examLabel="מבחן HIT 2021 — מעגל RL (אנרגיה + שדה)"
  problem={<p>
    מעגל RL: L=0.5 H, R=10 Ω, V=50 V.
    (א) אנרגיה בגליל בזרם מרבי?
    (ב) שדה B בסולנואיד n=1000/m?
    (ג) לאחר ניתוק — כמה חום?
  </p>}
  hint="I_max = V/R. U_L = ½LI². B = μ₀nI. חום = כל אנרגיית הגליל."
  solution={[
    {
      label: 'שלב א — זרם מרבי ואנרגיה',
      thought: 'בזרם קבוע (DC) — הגליל כמו חוט → I_max = V/R',
      content: <div className="space-y-1">
        <Formula c="I_max = V/R = 50/10 = 5 A" color="text-yellow-300" />
        <Formula c="U_L = ½·0.5·5² = ½·0.5·25 = 6.25 J" color="text-emerald-300" />
      </div>,
    },
    {
      label: 'שלב ב — שדה מגנטי',
      thought: 'סולנואיד: B = μ₀·n·I',
      content: <div className="space-y-1">
        <Formula c="B = 4π×10⁻⁷ × 1000 × 5 ≈ 6.28×10⁻³ T" color="text-blue-300" />
        <p className="text-slate-400 text-xs">≈ 6.28 mT</p>
      </div>,
    },
    {
      label: 'שלב ג — חום לאחר ניתוק',
      thought: 'כל אנרגיית השדה המגנטי מתפזרת על R',
      content: <div className="space-y-1">
        <Formula c="Q_heat = U_L = 6.25 J" color="text-orange-300" />
        <Note color="green" children={<>שימור אנרגיה: U_L → חום ב-R. אין אנרגיה אחרת.</>} />
      </div>,
    },
  ]}
/>

// ── QUIZ ─────────────────────────────────────────────────────────────────────
const quiz: QuizQuestion[] = [
  {
    question: 'מעגל LC עם L=0.4H, C=100μF. מה תדר התהודה?',
    options: ['≈ 25 Hz', '≈ 2.5 Hz', '≈ 79.6 Hz', '≈ 50 Hz'],
    correct: 0,
    explanation: 'ω₀=1/√(0.4×10⁻⁴)≈158 rad/s → f₀=ω₀/(2π)≈25.1 Hz.',
  },
  {
    question: 'מעגל RLC בתהודה. מה מאפיין את הזרם?',
    options: ['זרם מינימלי', 'זרם מרבי (Z=R)', 'זרם אפס', 'זרם קבוע'],
    correct: 1,
    explanation: 'בתהודה X_L=X_C → Z=R (מינימום) → I=V₀/R (מקסימום).',
  },
  {
    question: 'גליל L=2H, I=3A. מה אנרגיה מאוחסנת?',
    options: ['3 J', '6 J', '9 J', '18 J'],
    correct: 2,
    explanation: 'U_L = ½·L·I² = ½·2·9 = 9 J.',
  },
]

// ── PRACTICE ─────────────────────────────────────────────────────────────────
const practice: QuizQuestion[] = [
  {
    question: 'מעגל RC: R=1 kΩ, C=100 μF. מה קבוע זמן τ?',
    options: ['τ = 0.1 s', 'τ = 10 s', 'τ = 1 ms', 'τ = 100 s'],
    correct: 0,
    explanation: 'τ = RC = 1000×100×10⁻⁶ = 0.1 s.',
  },
  {
    question: 'מעגל RLC: R=10Ω, L=0.1H, C=100μF, f=50Hz. מה X_L?',
    options: ['31.4 Ω', '10 Ω', '100 Ω', '3.14 Ω'],
    correct: 0,
    explanation: 'X_L = ωL = 2π×50×0.1 = 31.4 Ω.',
  },
  {
    question: 'מה תדר תהודה של LC עם L=50mH, C=20μF?',
    options: ['≈ 159 Hz', '≈ 100 Hz', '≈ 1000 Hz', '≈ 50 Hz'],
    correct: 0,
    explanation: 'ω₀ = 1/√(0.05×20×10⁻⁶) = 1000 rad/s → f₀≈159 Hz.',
  },
  {
    question: 'RLC בתהודה, I_max=2A, R=5Ω. כוח ממוצע?',
    options: ['10 W', '5 W', '20 W', '0'],
    correct: 0,
    explanation: 'P = ½I_max²R = ½×4×5 = 10 W. L ו-C לא צורכים עם ממוצע.',
  },
]

// ── GREEN NOTE ────────────────────────────────────────────────────────────────
const greenNote = [
  'LC: ω₀ = 1/√(LC), U_C ↔ U_L שמורה',
  'RLC AC: X_L=ωL, X_C=1/(ωC), Z=√(R²+(X_L-X_C)²)',
  'תהודה: X_L=X_C → Z_min=R → I_max=V₀/R',
  'RL DC: I(t)=I_max(1-e^{-t/τ}), τ=L/R',
]

// ── GUIDES ────────────────────────────────────────────────────────────────────
const guides: GuideSection[] = [
  {
    title: 'מתי להשתמש',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p className="text-yellow-400 font-bold text-xs">4 סוגי שאלות</p>
      <p className="text-xs">1. תדר תהודה → ω₀=1/√(LC)</p>
      <p className="text-xs">2. עכבה ב-f נתון → X_L, X_C, Z</p>
      <p className="text-xs">3. אנרגיה בגליל/קבל → ½LI², ½CV²</p>
      <p className="text-xs">4. RL עם DC → τ=L/R, I=I_max(1-e^(-t/τ))</p>
    </div>,
  },
  {
    title: 'שגיאות נפוצות',
    content: <div className="space-y-2 text-sm">
      <p className="text-red-400 text-xs font-bold">שגיאה #1 — יחידות C</p>
      <p className="text-slate-300 text-xs">C ב-μF → חלק ב-10⁶ לפני חישוב ω₀!</p>
      <p className="text-red-400 text-xs font-bold mt-2">שגיאה #2 — בתהודה Z≠0</p>
      <p className="text-slate-300 text-xs">Z_min = R (לא אפס). רק X_L-X_C=0.</p>
      <p className="text-red-400 text-xs font-bold mt-2">שגיאה #3 — כוח על L,C</p>
      <p className="text-slate-300 text-xs">כוח ממוצע על L ו-C = 0. רק R צורך כוח.</p>
    </div>,
  },
]

// ── INTRO + BRIDGE ────────────────────────────────────────────────────────────
const intro = <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
  <p>מעגל LC הוא כמו מטוטלת: אנרגיה חשמלית (קבל) ↔ אנרגיה מגנטית (גליל). זה הבסיס לרדיו, טלוויזיה וכל שידור אלחוטי.</p>
  <Formula c="ω₀ = 1/√(LC)" color="text-yellow-300" />
  <p className="text-slate-400 text-xs">בתדר תהודה — הסליל והקבל מבטלים זה את זה. נשאר רק R.</p>
</div>

const bridge = <div className="space-y-2 text-sm text-slate-300">
  <p>זוכר <span className="text-green-400 font-semibold">אנרגיה בקבל</span> מנושא הקבלים?</p>
  <Formula c="U_C = ½CV²" color="text-green-300" />
  <p>הגליל מוסיף: U_L = ½LI². השניים מחליפים אנרגיה בתדר ω₀.</p>
</div>

const theory: TheoryCard = {
  summary: 'מעגל RLC מכיל R, L, C. בתדר תהודה ω₀=1/√(LC) העכבה מינימלית והזרם מקסימלי. L ו-C מחליפים אנרגיה; R מפזר אותה.',
  formulas: [
    { label: 'תדר תהודה', tex: '\\omega_0 = \\dfrac{1}{\\sqrt{LC}}' },
    { label: 'עכבה כוללת', tex: 'Z = \\sqrt{R^2 + (X_L - X_C)^2}' },
    { label: 'עכבת L ו-C', tex: 'X_L = \\omega L \\,,\\quad X_C = \\dfrac{1}{\\omega C}' },
  ],
  when: 'בתהודה: X_L=X_C, Z=R, I=V₀/R מקסימלי. מחוץ לתהודה: L שולט בתדרים גבוהים, C בנמוכים.',
}

export default function RLCCircuits({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="physics2-rlc"
    title="מעגלי LC ו-RLC"
    subtitle="תנודות, תהודה ועכבה"
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
