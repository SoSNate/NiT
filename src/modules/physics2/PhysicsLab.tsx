/**
 * PhysicsLab.tsx — built from MODULE_SPEC: אפיון למידה - מעבדה בפיזיקה.txt
 * Source: Gemini pipeline → C:\Users\12nat\Desktop\איפון למידה\
 * Built: 2026-03-24
 * נושא: הידרוסטטיקה — מדידת צפיפות מים (ניסוי 1)
 */
import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import { GlassCard, StyledSlider, SimReadout, ToggleGroup } from '../../components/SimulatorShell'
import type { QuizQuestion, GuideSection } from '../../types'

// ── SIMULATOR — מדידה גלילית + גרף ρ ────────────────────────────────────────
function Sim({ currentStep: _cs }: { currentStep: number }) {
  const [ballCount, setBallCount] = useState(1)

  // כל כדור: מסה 50g, נפח 30cm³
  const ballMass   = 50   // g per ball
  const ballVolume = 30   // cm³ per ball
  const cylRadius  = 3.0  // cm (רדיוס משורה)
  const cylArea    = Math.PI * cylRadius * cylRadius // cm²
  const rho0       = 1.00 // g/cm³ (צפיפות מים אמיתית)

  const deltaH = useMemo(
    () => (ballCount * ballVolume) / cylArea,
    [ballCount]
  )

  // מחושב מהגרף: ρ = Δm/(A·Δh)
  const totalMass = ballCount * ballMass
  const rhoMeasured = useMemo(
    () => totalMass / (cylArea * deltaH),
    [totalMass, deltaH]
  )

  const svgW = 400, svgH = 240
  // --- Cylinder drawing ---
  const cylX = 60, cylY = 30, cylW = 80, cylH = 180
  const waterLevel0 = cylY + cylH - 20
  const waterRise   = Math.min(deltaH * 6, 120)
  const waterTop    = waterLevel0 - waterRise

  // --- Scatter plot ---
  const plotX = 200, plotY = 30, plotW = 180, plotH = 160
  const maxM = 5 * ballMass, maxH = (5 * ballVolume) / cylArea
  const dataPoints = Array.from({ length: ballCount }, (_, i) => ({
    m: (i + 1) * ballMass,
    h: ((i + 1) * ballVolume) / cylArea,
  }))

  return (
    <div className="w-full space-y-4" dir="ltr">
      <GlassCard className="bg-slate-950 overflow-hidden">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
          {/* ── Cylinder ── */}
          {/* Body */}
          <rect x={cylX} y={cylY} width={cylW} height={cylH}
            fill="none" stroke="#475569" strokeWidth="2" rx="4" />
          {/* Water fill */}
          <motion.rect
            x={cylX + 2} y={waterLevel0}
            width={cylW - 4}
            animate={{ y: waterTop, height: waterRise + 20 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            fill="#38bdf8" fillOpacity="0.25" />
          {/* Water surface line */}
          <motion.line
            x1={cylX + 2} x2={cylX + cylW - 2}
            animate={{ y1: waterTop, y2: waterTop }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            stroke="#38bdf8" strokeWidth="2" />
          {/* Balls inside */}
          {Array.from({ length: ballCount }).map((_, i) => {
            const bY = waterLevel0 - 8 - i * 16
            return (
              <motion.circle key={i}
                cx={cylX + cylW / 2}
                animate={{ cy: Math.max(bY, waterTop + 8) }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: i * 0.05 }}
                r={7} fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
            )
          })}
          {/* Height annotation */}
          <line x1={cylX + cylW + 4} y1={waterLevel0}
                x2={cylX + cylW + 4} y2={waterTop}
                stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x={cylX + cylW + 8} y={(waterLevel0 + waterTop) / 2 + 4}
            fill="#fbbf24" fontSize="8">Δh={deltaH.toFixed(1)}cm</text>
          <text x={cylX + cylW / 2} y={cylY + cylH + 14}
            textAnchor="middle" fill="#64748b" fontSize="9">משורה</text>

          {/* ── Scatter Plot ── */}
          <line x1={plotX} y1={plotY + plotH} x2={plotX + plotW} y2={plotY + plotH}
            stroke="#334155" strokeWidth="1.5" />
          <line x1={plotX} y1={plotY} x2={plotX} y2={plotY + plotH}
            stroke="#334155" strokeWidth="1.5" />
          <text x={plotX + plotW / 2} y={plotY + plotH + 16}
            textAnchor="middle" fill="#475569" fontSize="8">Δm (g)</text>
          <text x={plotX - 14} y={plotY + plotH / 2}
            textAnchor="middle" fill="#475569" fontSize="8"
            transform={`rotate(-90, ${plotX - 14}, ${plotY + plotH / 2})`}>Δh (cm)</text>

          {/* Trend line */}
          {ballCount >= 2 && (
            <line
              x1={plotX} y1={plotY + plotH}
              x2={plotX + (maxM / maxM) * plotW}
              y2={plotY + plotH - (maxH / maxH) * plotH}
              stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
          )}

          {/* Data points */}
          {dataPoints.map(({ m, h }, i) => {
            const px = plotX + (m / maxM) * plotW
            const py = plotY + plotH - (h / maxH) * plotH
            return (
              <motion.circle key={i} cx={px}
                animate={{ cy: py }}
                transition={{ type: 'spring', stiffness: 200 }}
                r={4} fill="#22d3ee" />
            )
          })}

          <text x={plotX + plotW / 2} y={plotY - 6}
            textAnchor="middle" fill="#94a3b8" fontSize="8">גרף ניסוי</text>
        </svg>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        <SimReadout label="Δh" value={deltaH.toFixed(2)} unit="cm" />
        <SimReadout label="ρ מחושב" value={rhoMeasured.toFixed(3)} unit="g/cm³" />
      </div>

      <StyledSlider
        label="מספר כדורים"
        value={ballCount}
        min={1} max={5} step={1}
        unit="כדורים"
        onChange={v => setBallCount(v)}
      />

      <div className="text-xs text-center text-slate-500">
        ρ אמיתי = 1.00 g/cm³ | שגיאה יחסית: {Math.abs(rhoMeasured - rho0).toFixed(3)} g/cm³
      </div>
    </div>
  )
}

// ── STEP 1 ───────────────────────────────────────────────────────────────────
const step1 = <PatternStep
  scenario="בניסוי מדידת צפיפות מים: משקיעים כדורים בהדרגה במשורה ומודדים Δh כפונקציה של Δm. קיבלת גרף Δh מול Δm עם שיפוע a. שטח חתך המשורה הוא A. מה הנוסחה לצפיפות?"
  prompt="בחר את הנוסחה הנכונה"
  options={[
    { label: 'ρ₀ = A/(π·a)', desc: 'שגוי — ממד לא נכון', correct: false },
    { label: 'ρ₀ = m̄/(h̄·A)', desc: 'שגוי — יש להשתמש בשיפוע ולא בממוצע', correct: false },
    { label: 'ρ₀ = g/a', desc: 'שגוי — g כאן אינו רלוונטי ישירות', correct: false },
    { label: 'ρ₀ = 1/(A·a)', desc: 'נכון: a = Δh/Δm, V = A·Δh, ρ = Δm/V = 1/(A·a)', correct: true },
  ]}
  correctFeedback="נכון! V_כדור = A·Δh. m = ρ₀·V → ρ₀ = Δm/(A·Δh) = 1/(A·a). השיפוע a = Δh/Δm."
/>

// ── STEP 2 ───────────────────────────────────────────────────────────────────
const step2 = <PrincipleStep
  heading="עקרונות הידרוסטטיקה:"
  items={[
    {
      title: 'לחץ הידרוסטטי',
      content: <div className="space-y-2">
        <p className="text-slate-300 text-sm">לחץ תלוי בעומק, לא בצורת הכלי:</p>
        <Formula c="P = P₀ + ρgh" color="text-yellow-300" />
        <p className="text-slate-400 text-xs">ρ = צפיפות הנוזל, h = עומק, g = 9.81 m/s²</p>
      </div>,
    },
    {
      title: 'חוק ארכימדס',
      content: <div className="space-y-2">
        <p className="text-slate-300 text-sm">גוף השקוע בנוזל חווה כוח עילוי:</p>
        <Formula c="F_b = ρ_נוזל · V_גוף · g" color="text-cyan-300" />
        <Note color="blue" children={<>הכוח שווה למשקל הנוזל שהוא מעקר</>} />
      </div>,
      accent: 'text-cyan-400',
    },
    {
      title: 'כלים שלובים',
      content: <div className="space-y-2">
        <p className="text-slate-300 text-sm">שני נוזלים שונים בכלים מחוברים:</p>
        <Formula c="ρ₁/ρ₂ = h₂/h₁" color="text-emerald-300" />
        <p className="text-slate-400 text-xs">הנוזל הכבד יותר עומד נמוך יותר</p>
      </div>,
      accent: 'text-emerald-400',
    },
    {
      title: 'מדידת צפיפות — גרף',
      content: <div className="space-y-1 text-xs text-slate-300">
        <p>1. מודדים Δh לכל תוספת Δm</p>
        <p>2. שיפוע הגרף: <span className="text-yellow-300 font-mono">a = Δh/Δm</span></p>
        <p>3. מהשיפוע: <span className="text-yellow-300 font-mono">ρ₀ = 1/(A·a)</span></p>
      </div>,
      accent: 'text-yellow-400',
    },
  ]}
/>

// ── STEP 3 ───────────────────────────────────────────────────────────────────
const step3 = <WorkedExample
  examLabel="ניסוי 1 — חישוב צפיפות מים מגרף"
  problem={<p>5 כדורים (כ"א 50g, 30cm³) הושקעו במשורה עם A = 28.3cm². חשב את צפיפות המים מנתוני הניסוי.</p>}
  hint="שיפוע הגרף a = Δh/Δm. ρ = 1/(A·a)."
  solution={[
    {
      label: 'נתוני הניסוי',
      content: <div className="text-xs font-mono text-slate-300 space-y-1" dir="ltr">
        <p>ΔV_כל כדור = 30 cm³</p>
        <p>A = 28.3 cm²</p>
        <p>Δh לכדור = 30/28.3 = 1.06 cm</p>
        <p>Δm לכדור = 50 g</p>
      </div>,
    },
    {
      label: 'חישוב שיפוע הגרף',
      content: <div className="space-y-1">
        <Formula c="a = Δh/Δm = 1.06/50 = 0.0212 cm/g" color="text-emerald-300" />
      </div>,
    },
    {
      label: 'חישוב צפיפות',
      content: <div className="space-y-1">
        <Formula c="ρ₀ = 1/(A·a) = 1/(28.3 × 0.0212)" color="text-yellow-300" />
        <Formula c="ρ₀ = 1/0.60 ≈ 1.00 g/cm³ ✓" color="text-yellow-300" />
        <Note color="blue" children={<>תואם לצפיפות ידועה של מים. הניסוי תקין!</>} />
      </div>,
    },
  ]}
/>

// ── QUIZ ─────────────────────────────────────────────────────────────────────
const quiz: QuizQuestion[] = [
  {
    question: 'גוף שצפיפותו פחות מצפיפות הנוזל — מה קורה כשמשחררים אותו?',
    options: ['שוקע לתחתית', 'צף', 'נשאר תלוי באמצע', 'תלוי בלחץ החיצוני'],
    correct: 1,
    explanation: 'כוח עילוי > משקל גוף → הגוף צף. תנאי: ρ_גוף < ρ_נוזל.',
  },
  {
    question: 'מנומטר מודד h = 20cm בנוזל עם ρ = 900 kg/m³. מה הלחץ?',
    options: ['P = 1765 Pa', 'P = 900 Pa', 'P = 20000 Pa', 'P = 176.5 Pa'],
    correct: 0,
    explanation: 'P = ρgh = 900 × 9.81 × 0.20 = 1765 Pa.',
  },
  {
    question: 'שני נוזלים: ρ₁ = 800 kg/m³, h₁ = 15cm. מה h₂ אם ρ₂ = 1000 kg/m³?',
    options: ['h₂ = 12 cm', 'h₂ = 15 cm', 'h₂ = 18.75 cm', 'h₂ = 10 cm'],
    correct: 0,
    explanation: 'ρ₁h₁ = ρ₂h₂ → h₂ = (800×15)/1000 = 12 cm.',
  },
]

// ── PRACTICE ─────────────────────────────────────────────────────────────────
const practice: QuizQuestion[] = [
  {
    question: 'גוף נמצא בשיווי משקל בנוזל (לא שוקע, לא צף). מה יחס ρ_גוף לρ_נוזל?',
    options: ['ρ_גוף = ρ_נוזל', 'ρ_גוף < ρ_נוזל', 'ρ_גוף > ρ_נוזל', 'לא ניתן לדעת'],
    correct: 0,
    explanation: 'שיווי משקל → כוח עילוי = משקל → ρ_נוזל·V·g = ρ_גוף·V·g → ρ_גוף = ρ_נוזל.',
  },
  {
    question: 'לחץ בעומק h = 5m במים (ρ=1000 kg/m³, P_atm=101325 Pa)?',
    options: ['P = 101325 Pa', 'P = 49050 Pa', 'P = 150375 Pa', 'P = 1000 Pa'],
    correct: 2,
    explanation: 'P = P₀ + ρgh = 101325 + 1000×9.81×5 = 101325 + 49050 = 150375 Pa.',
  },
  {
    question: 'בניסוי המעבדה, השיפוע a = 0.025 cm/g, A = 30 cm². מה ρ?',
    options: ['1.00 g/cm³', '1.33 g/cm³', '0.75 g/cm³', '0.83 g/cm³'],
    correct: 1,
    explanation: 'ρ = 1/(A·a) = 1/(30×0.025) = 1/0.75 = 1.33 g/cm³.',
  },
  {
    question: 'כוח עילוי על קוביה 10cm כל צלע השקועה במים?',
    options: ['F = 9.81 N', 'F = 98.1 N', 'F = 1 N', 'F = 0.981 N'],
    correct: 0,
    explanation: 'V = 0.001 m³. F_b = ρ_מים·V·g = 1000×0.001×9.81 = 9.81 N.',
  },
  {
    question: 'בניסוי כלים שלובים: h₁=20cm, h₂=16cm. מה ρ₁/ρ₂?',
    options: ['0.8', '1.25', '1.0', '0.64'],
    correct: 1,
    explanation: 'ρ₁h₁ = ρ₂h₂ → ρ₁/ρ₂ = h₂/h₁ = 16/20 = 0.8. אוהה — ρ₂/ρ₁ = 0.8 → ρ₁/ρ₂ = 1.25.',
  },
]

// ── GREEN NOTE ────────────────────────────────────────────────────────────────
const greenNote = [
  'ρ = m/V — תמיד. ביחידות: g/cm³ = kg/L = 1000 kg/m³',
  'כוח עילוי = משקל הנוזל המעוקר: F_b = ρ_נוזל·V·g',
  'גרף Δh מול Δm: שיפוע a → ρ = 1/(A·a)',
  'כלים שלובים: ρ₁h₁ = ρ₂h₂ (לחץ שווה באותו גובה)',
]

// ── GUIDES ────────────────────────────────────────────────────────────────────
const guides: GuideSection[] = [
  {
    title: 'ניסויי מעבדה',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p className="text-xs font-bold text-yellow-400">ניסוי 1: צפיפות מים מגרף</p>
      <p className="text-xs">משקיע כדורים → מודד Δh → מחשב שיפוע a → ρ = 1/(A·a)</p>
      <p className="text-xs font-bold text-cyan-400 mt-2">ניסוי 2: כלים שלובים</p>
      <p className="text-xs">שני נוזלים → מודד גבהים → ρ₁h₁ = ρ₂h₂</p>
    </div>,
  },
  {
    title: 'שגיאות נפוצות',
    content: <div className="space-y-2 text-sm">
      <p className="text-red-400 text-xs font-bold">שגיאה #1 — בלבול ρ ו-P</p>
      <p className="text-slate-300 text-xs">ρ = צפיפות (g/cm³). P = לחץ (Pa). שונים לגמרי!</p>
      <p className="text-red-400 text-xs font-bold mt-2">שגיאה #2 — שכחת P_atm</p>
      <p className="text-slate-300 text-xs">לחץ מוחלט = P_atm + ρgh. לחץ יחסי = ρgh.</p>
    </div>,
  },
]

// ── INTRO + THEORY ────────────────────────────────────────────────────────────
const intro = <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
  <p>
    הידרוסטטיקה: <span className="text-yellow-400 font-semibold">נוזלים במנוחה</span> — כוחות לחץ, עילוי, וכלים שלובים.
    בסיס לכל מדידת צפיפות חומרים במעבדה.
  </p>
  <Formula c="P = P₀ + ρgh    |    F_b = ρ_נוזל·V·g" color="text-yellow-300" />
</div>

const bridge = <div className="space-y-2 text-sm text-slate-300">
  <p>זוכר <span className="text-emerald-400 font-semibold">F = ma</span> מפיזיקה 1? כאן F_b מחליפה את כוח החיצוני.</p>
  <p className="text-slate-400 text-xs">כוח עילוי = כוח כלפי מעלה על גוף השקוע בנוזל.</p>
</div>

const theory: TheoryCard = {
  summary: 'לחץ הידרוסטטי P = P₀ + ρgh תלוי בעומק בלבד, לא בצורת הכלי. כוח ארכימדס F_b = ρ_נוזל·V·g הוא הכוח שמפעיל הנוזל כלפי מעלה על גוף שקוע. יחס הצפיפויות בכלים שלובים: ρ₁h₁ = ρ₂h₂.',
  formulas: [
    { label: 'לחץ הידרוסטטי', tex: 'P = P_0 + \\rho g h' },
    { label: 'כוח עילוי (ארכימדס)', tex: 'F_b = \\rho_{\\text{נוזל}} V_{\\text{גוף}} g' },
    { label: 'כלים שלובים', tex: '\\dfrac{\\rho_1}{\\rho_2} = \\dfrac{h_2}{h_1}' },
  ],
  when: 'גוף בנוזל → כוח ארכימדס | מנומטר → P = ρgh | כלים שלובים → ρ₁h₁ = ρ₂h₂',
}

export default function PhysicsLab({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="physics2-lab"
    title="מעבדה בפיזיקה"
    subtitle="הידרוסטטיקה — לחץ, ארכימדס, כלים שלובים"
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
