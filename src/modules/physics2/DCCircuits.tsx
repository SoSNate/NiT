/**
 * DCCircuits.tsx — מעגלי DC: חוק אוהם, קירשהוף, RC
 * Source: Physics 2 HIT — שיעור 1.pdf, מבוא חשמל.pdf
 * Built: 2026-03-25
 */
import React, { useState, useMemo } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import { GlassCard, StyledSlider, SimReadout, ToggleGroup } from '../../components/SimulatorShell'
import type { QuizQuestion, GuideSection } from '../../types'

// ── SIMULATOR — מעגל RC ───────────────────────────────────────────────────────
function Sim({ currentStep: _cs }: { currentStep: number }) {
  const [mode, setMode] = useState<'ohm' | 'kirchhoff' | 'rc'>('ohm')
  const [R, setR] = useState(100)   // Ω
  const [V, setV] = useState(10)    // Volt
  const [C, setC] = useState(100)   // μF
  const [t, setT] = useState(0.01)  // sec

  const { I, P, Vc, Ic, tau } = useMemo(() => {
    const I = V / R
    const P = V * I
    const Cc = C * 1e-6
    const tau = R * Cc
    const Vc = V * (1 - Math.exp(-t / tau))
    const Ic = (V / R) * Math.exp(-t / tau)
    return { I, P, Vc, Ic, tau: tau * 1000 }
  }, [R, V, C, t])

  const cx = 200, cy = 160

  return (
    <div className="w-full space-y-4" dir="ltr">
      <GlassCard className="overflow-hidden bg-slate-950">
        <svg viewBox="0 0 400 280" className="w-full" style={{ maxHeight: 220 }}>
          <defs>
            <pattern id="dc-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.04" />
            </pattern>
          </defs>
          <rect width="400" height="280" fill="url(#dc-grid)" />

          {mode === 'ohm' && <>
            {/* Battery */}
            <line x1={60} y1={80} x2={60} y2={220} stroke="#60a5fa" strokeWidth="2" />
            <line x1={60} y1={80} x2={340} y2={80} stroke="#60a5fa" strokeWidth="2" />
            <line x1={340} y1={80} x2={340} y2={140} stroke="#60a5fa" strokeWidth="2" />
            <line x1={340} y1={180} x2={340} y2={220} stroke="#60a5fa" strokeWidth="2" />
            <line x1={60} y1={220} x2={340} y2={220} stroke="#60a5fa" strokeWidth="2" />
            {/* Resistor box */}
            <rect x={310} y={140} width={60} height={40} rx={4}
              fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
            <text x={340} y={165} textAnchor="middle" fill="#f59e0b" fontSize="10">R={R}Ω</text>
            {/* Battery symbol */}
            <line x1={45} y1={140} x2={75} y2={140} stroke="#34d399" strokeWidth="3" />
            <line x1={52} y1={150} x2={68} y2={150} stroke="#34d399" strokeWidth="1.5" />
            <text x={60} y={170} textAnchor="middle" fill="#34d399" fontSize="9">V={V}V</text>
            {/* Current arrow */}
            <text x={200} y={70} textAnchor="middle" fill="#22d3ee" fontSize="11">I = {I.toFixed(3)} A →</text>
            <text x={200} y={250} textAnchor="middle" fill="#a78bfa" fontSize="11">P = {P.toFixed(2)} W</text>
          </>}

          {mode === 'kirchhoff' && <>
            <text x={200} y={60} textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">חוקי קירשהוף</text>
            <text x={200} y={90} textAnchor="middle" fill="#94a3b8" fontSize="10">KCL: Σ I_נכנס = Σ I_יוצא</text>
            <text x={200} y={110} textAnchor="middle" fill="#94a3b8" fontSize="10">KVL: Σ V_לולאה = 0</text>
            {/* Node */}
            <circle cx={200} cy={155} r={6} fill="#fbbf24" />
            {[[-60,0],[60,0],[0,-50],[0,50]].map(([dx,dy],i) => (
              <g key={i}>
                <line x1={200} y1={155} x2={200+dx} y2={155+dy}
                  stroke="#60a5fa" strokeWidth="2" />
                <text x={200+dx*1.3} y={155+dy*1.3+4} textAnchor="middle" fill="#22d3ee" fontSize="9">
                  I{i+1}
                </text>
              </g>
            ))}
            <text x={200} y={240} textAnchor="middle" fill="#34d399" fontSize="10">I₁+I₂ = I₃+I₄ בצומת</text>
          </>}

          {mode === 'rc' && <>
            <text x={200} y={50} textAnchor="middle" fill="#fbbf24" fontSize="11">מעגל RC — טעינה</text>
            <text x={200} y={72} textAnchor="middle" fill="#94a3b8" fontSize="9">τ = RC = {tau.toFixed(1)} ms</text>
            {/* RC graph */}
            {Array.from({length: 40}, (_, i) => {
              const tVal = i / 39
              const tSec = tVal * 5 * R * C * 1e-6
              const Vval = V * (1 - Math.exp(-tSec / (R * C * 1e-6)))
              return { x: 60 + tVal * 280, y: 230 - (Vval / V) * 140 }
            }).map((pt, i, arr) => i === 0 ? null : (
              <line key={i}
                x1={arr[i-1].x} y1={arr[i-1].y}
                x2={pt.x} y2={pt.y}
                stroke="#22d3ee" strokeWidth="1.5" />
            ))}
            <line x1={60} y1={90} x2={340} y2={90} stroke="#64748b" strokeWidth="1" strokeDasharray="4 3" />
            <text x={350} y={94} fill="#64748b" fontSize="8">V</text>
            <line x1={60} y1={230} x2={340} y2={230} stroke="#475569" strokeWidth="1" />
            <text x={350} y={234} fill="#475569" fontSize="8">0</text>
            <text x={200} y={255} textAnchor="middle" fill="#94a3b8" fontSize="9">זמן →</text>
          </>}
        </svg>
      </GlassCard>

      {mode === 'ohm' && (
        <div className="grid grid-cols-2 gap-2">
          <SimReadout label="זרם I" value={I.toFixed(3)} unit="A" />
          <SimReadout label="הספק P" value={P.toFixed(2)} unit="W" />
        </div>
      )}
      {mode === 'rc' && (
        <div className="grid grid-cols-2 gap-2">
          <SimReadout label="V_C(t)" value={Vc.toFixed(2)} unit="V" />
          <SimReadout label="τ=RC" value={tau.toFixed(1)} unit="ms" />
        </div>
      )}

      <ToggleGroup
        value={mode}
        onChange={v => setMode(v as typeof mode)}
        options={[
          { value: 'ohm',        label: 'אוהם' },
          { value: 'kirchhoff',  label: 'קירשהוף' },
          { value: 'rc',         label: 'RC' },
        ]}
      />
      <StyledSlider label="V" value={V} min={1} max={50} step={1} unit="V" onChange={setV} />
      <StyledSlider label="R" value={R} min={10} max={1000} step={10} unit="Ω" onChange={setR} />
      {mode === 'rc' && (
        <StyledSlider label="C" value={C} min={10} max={1000} step={10} unit="μF" onChange={setC} />
      )}
    </div>
  )
}

// ── STEP 1 — זיהוי ────────────────────────────────────────────────────────────
const step1 = <PatternStep
  scenario="מעגל עם 3 נגדים: R₁=2Ω בטור, R₂=6Ω ו-R₃=3Ω במקביל. מחובר ל-V=12V. מצא I הכולל."
  prompt="מה הצעד הראשון?"
  options={[
    { label: 'חשב זרם בכל נגד בנפרד', desc: 'קודם צריך Req', correct: false },
    { label: 'מצא Req — מקביל ואז טורי', desc: 'נכון — פשט קודם', correct: true },
    { label: 'כתוב משוואות KVL מיד', desc: 'אפשרי אבל מסורבל — פישוט קודם', correct: false },
    { label: 'השתמש בחוק גאוס', desc: 'גאוס הוא לשדות חשמליים, לא מעגלים', correct: false },
  ]}
  correctFeedback="נכון. פשט R במקביל קודם: R₂₃ = (6·3)/(6+3) = 2Ω. ואז Req = R₁ + R₂₃ = 4Ω. I = V/Req = 3A."
/>

// ── STEP 2 — עיקרון ───────────────────────────────────────────────────────────
const step2 = <PrincipleStep
  heading="מעגלי DC — עקרונות מפתח:"
  items={[
    {
      title: 'חוק אוהם ונגדים',
      content: <div className="space-y-1">
        <Formula c="V = IR, P = IV = I²R = V²/R" color="text-yellow-300" />
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="bg-blue-900/30 rounded p-1.5 text-center text-blue-300">טורי: Req = ΣRᵢ</div>
          <div className="bg-emerald-900/30 rounded p-1.5 text-center text-emerald-300">מקבילי: 1/Req = Σ1/Rᵢ</div>
        </div>
      </div>,
    },
    {
      title: 'חוקי קירשהוף',
      content: <div className="space-y-1">
        <p className="text-blue-300 text-sm font-semibold">KCL — בצומת:</p>
        <Formula c="Σ I_נכנס = Σ I_יוצא" color="text-blue-300" />
        <p className="text-emerald-300 text-sm font-semibold">KVL — בלולאה:</p>
        <Formula c="Σ V = 0 (על הלולאה)" color="text-emerald-300" />
        <Note color="yellow" children={<>סכום נפילות מתח בלולאה = סכום מקורות מתח</>} />
      </div>,
      accent: 'text-blue-400',
    },
    {
      title: 'מעגל RC',
      content: <div className="space-y-1">
        <Formula c="τ = RC (קבוע זמן)" color="text-cyan-300" />
        <Formula c="V_C(t) = V(1 - e^{-t/τ})" color="text-cyan-300" />
        <p className="text-slate-400 text-xs">ב-t=τ: V_C = 0.63V. ב-t=5τ: V_C ≈ V (טעון לחלוטין)</p>
      </div>,
      accent: 'text-cyan-400',
    },
    {
      title: 'הספק ואנרגיה',
      content: <div className="space-y-1">
        <Formula c="P = IV = I²R = V²/R" color="text-orange-300" />
        <Formula c="W = Pt = I²Rt" color="text-orange-300" />
      </div>,
      accent: 'text-orange-400',
    },
  ]}
/>

// ── STEP 3 — דוגמה ────────────────────────────────────────────────────────────
const step3 = <WorkedExample
  examLabel="מבחן HIT 2022 — מעגל עם KVL"
  problem={<p>מעגל: מקור מתח ε=20V, r_פנימי=1Ω. נגדים R₁=3Ω, R₂=6Ω בטורי לאחד מהם ו-R₃=4Ω. מצא את הזרם בכל ענף.</p>}
  hint="השתמש ב-KVL על כל לולאה + KCL בצומת."
  solution={[
    {
      label: 'שלב 1: זיהוי המבנה',
      content: <p className="text-slate-300 text-sm">r + R₁ בטורי, ואז R₂ ∥ R₃. סה"כ: Req = 1+3+(6∥4) = 4+2.4 = 6.4Ω</p>,
    },
    {
      label: 'שלב 2: זרם ראשי',
      content: <div className="space-y-1">
        <Formula c="I_total = ε / Req = 20 / 6.4 = 3.125 A" color="text-yellow-300" />
      </div>,
    },
    {
      label: 'שלב 3: חלוקת זרם',
      content: <div className="space-y-1">
        <p className="text-slate-300 text-sm">V_על המקביל = 3.125 · 2.4 = 7.5V</p>
        <Formula c="I₂ = 7.5/6 = 1.25 A" color="text-blue-300" />
        <Formula c="I₃ = 7.5/4 = 1.875 A" color="text-emerald-300" />
        <Note color="blue" children={<>בדוק KCL: 1.25 + 1.875 = 3.125 ✓</>} />
      </div>,
    },
  ]}
/>

// ── QUIZ ──────────────────────────────────────────────────────────────────────
export const quiz: QuizQuestion[] = [
  {
    question: 'נגד 10Ω עם זרם 2A. ההספק המפוזר?',
    options: ['20 W', '40 W', '5 W', '0.2 W'],
    correct: 1,
    explanation: 'P = I²R = 4 · 10 = 40W.',
  },
  {
    question: 'KCL בצומת: כניסה 5A ו-3A, יציאה 4A. מה הזרם היוצא השני?',
    options: ['2 A', '4 A', '8 A', '12 A'],
    correct: 1,
    explanation: 'Σנכנס = Σיוצא → 5+3 = 4+I₂ → I₂ = 4A.',
  },
  {
    question: 'מעגל RC: R=1kΩ, C=100μF. מה τ?',
    options: ['0.1 s', '1 s', '10 s', '100 ms'],
    correct: 3,
    explanation: 'τ = RC = 1000 · 100×10⁻⁶ = 0.1s = 100ms.',
  },
]

// ── PRACTICE ──────────────────────────────────────────────────────────────────
export const practice: QuizQuestion[] = [
  {
    question: 'V=6V, R=2Ω. זרם?',
    options: ['12 A', '3 A', '0.33 A', '8 A'],
    correct: 1,
    explanation: 'I = V/R = 6/2 = 3A.',
  },
  {
    question: 'שני נגדים 4Ω ו-12Ω במקביל. Req?',
    options: ['16 Ω', '3 Ω', '8 Ω', '1.5 Ω'],
    correct: 1,
    explanation: '1/Req = 1/4 + 1/12 = 3/12 + 1/12 = 4/12 → Req = 3Ω.',
  },
  {
    question: 'לולאה: ε=10V, R₁=2Ω, R₂=3Ω בטורי. המתח על R₂?',
    options: ['6 V', '4 V', '10 V', '3 V'],
    correct: 0,
    explanation: 'I = 10/5 = 2A. V_R₂ = 2·3 = 6V.',
  },
  {
    question: 'RC: V₀=12V, τ=2s. מה V_C אחרי t=2s?',
    options: ['4.4 V', '7.6 V', '12 V', '0 V'],
    correct: 1,
    explanation: 'V_C(τ) = 12(1-e⁻¹) = 12·0.632 ≈ 7.6V.',
  },
  {
    question: 'נגד עם P=50W ו-V=10V. R?',
    options: ['2 Ω', '5 Ω', '0.5 Ω', '500 Ω'],
    correct: 0,
    explanation: 'P = V²/R → R = V²/P = 100/50 = 2Ω.',
  },
]

// ── GREEN NOTE ────────────────────────────────────────────────────────────────
const greenNote = [
  'זהה: טורי (I שווה) vs מקבילי (V שווה)',
  'KCL בצומת, KVL בלולאה — שני כלי הניתוח',
  'RC: ב-t=τ הקבל טעון 63%, ב-5τ — 99.3%',
  'P = I²R = V²/R = IV — כל 3 נכונות',
]

// ── GUIDES ────────────────────────────────────────────────────────────────────
const guides: GuideSection[] = [
  {
    title: 'מתי להשתמש',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p className="text-yellow-400 font-bold text-xs">אסטרטגיה</p>
      <p className="text-xs">1. מעגל פשוט? → פשט ל-Req → I = V/Req</p>
      <p className="text-xs">2. מעגל מסועף? → KCL בצמתים + KVL בלולאות</p>
      <p className="text-xs">{"3. RC? → τ=RC → V_C(t) = V(1-e^{-t/τ})"}</p>
      <Note color="blue" children={<>תמיד בדוק עם KCL: Σזרמים בצומת = 0</>} />
    </div>,
  },
  {
    title: 'שגיאות נפוצות',
    content: <div className="space-y-2 text-sm">
      <p className="text-red-400 text-xs font-bold">שגיאה #1 — KVL עם סימן</p>
      <p className="text-slate-300 text-xs">בלולאה: נפילה על R היא IR-, עלייה על ε היא +ε. כיוון הלולאה חשוב!</p>
      <p className="text-red-400 text-xs font-bold mt-2">שגיאה #2 — טורי vs מקבילי</p>
      <p className="text-slate-300 text-xs">טורי: Req = ΣR. מקבילי: Req = (R₁·R₂)/(R₁+R₂) לשניים.</p>
    </div>,
  },
  {
    title: '📋 נוסחאות',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p className="text-yellow-400 font-bold text-xs">נוסחאות מרכזיות</p>
      <Formula c="V = IR" color="text-yellow-300" />
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className="bg-blue-900/30 rounded p-1.5 text-center">
          <p className="text-blue-300 font-bold">טורי</p>
          <p className="text-slate-300" dir="ltr">R_eq = ΣRᵢ</p>
          <p className="text-slate-400">I שווה</p>
        </div>
        <div className="bg-emerald-900/30 rounded p-1.5 text-center">
          <p className="text-emerald-300 font-bold">מקבילי</p>
          <p className="text-slate-300" dir="ltr">1/R_eq = Σ1/Rᵢ</p>
          <p className="text-slate-400">V שווה</p>
        </div>
      </div>
      <Formula c="KCL: ΣI = 0" color="text-blue-300" />
      <Formula c="KVL: ΣV = 0" color="text-emerald-300" />
    </div>,
  },
  {
    title: '🎯 במבחן HIT',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p className="text-yellow-400 font-bold text-xs">שאלות RC נפוצות</p>
      <p className="text-xs">שאלות RC נפוצות מאוד: V(t)=V₀(1-e^(-t/RC)) בטעינה. τ=RC הוא קבוע הזמן. אחרי t=5τ הקבל טעון 99%</p>
      <Note color="blue" children={<>τ=RC: ב-t=τ טעון 63%, ב-t=2τ טעון 86%, ב-t=5τ טעון 99%</>} />
      <p className="text-slate-400 text-xs">בפריקה: V(t) = V₀·e^(-t/RC) — יורד מ-V₀ לאפס</p>
    </div>,
  },
]

// ── INTRO + BRIDGE ────────────────────────────────────────────────────────────
const intro = <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
  <p>
    מעגלי DC הם הבסיס של כל מערכת אלקטרונית.
    <span className="text-yellow-400 font-semibold"> חוק אוהם + חוקי קירשהוף</span> = כל מה שצריך.
  </p>
  <Formula c="V = IR" color="text-yellow-300" />
  <p className="text-slate-400 text-xs">פשוט, אך מאחוריו מוסתרת כל הפיזיקה של זרמים.</p>
</div>

const bridge = <div className="space-y-2 text-sm text-slate-300">
  <p>קבלים (פרק קודם) + נגדים = מעגל RC.</p>
  <p>הזרם טוען את הקבל עם <span className="text-emerald-400">קבוע זמן τ = RC</span></p>
  <Formula c="τ = RC" color="text-emerald-300" />
</div>

const theory: TheoryCard = {
  summary: 'מעגלי DC ניתחים באמצעות חוק אוהם לנגד בודד וחוקי קירשהוף KCL/KVL למעגלים מסועבים. מעגלי RC מציגים התנהגות זמן עם קבוע τ=RC.',
  formulas: [
    { label: 'אוהם', tex: 'V = IR', verbal: 'המתח הוא "לחץ" שדוחף זרם דרך התנגדות. כמו לחץ מים בצינור' },
    { label: 'הספק', tex: 'P = IV = I^2R = V^2/R', verbal: 'הספק = כמה אנרגיה מפוזרת בשנייה. שלוש צורות — בחר לפי מה ידוע' },
    { label: 'KCL', tex: '\\sum I_{\\text{נכנס}} = \\sum I_{\\text{יוצא}}', verbal: 'חוק קירשהוף לזרמים: בכל צומת — סכום הזרמים הנכנסים = היוצאים. מטען לא נעלם' },
    { label: 'RC טעינה', tex: 'V_C(t) = V\\left(1 - e^{-t/RC}\\right)', verbal: 'מתח הקבל עולה בהדרגה. ב-t=τ=RC הוא עלה ל-63% מהמתח הסופי. ב-5τ — כמעט מלא' },
  ],
  when: 'מעגל פשוט → Req → I=V/Req. מסועף → KCL+KVL. RC → V_C(t) עם τ=RC.',
}

export default function DCCircuits({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="physics2-dc"
    title="מעגלי DC"
    subtitle="אוהם, קירשהוף, RC — ניתוח מעגלים"
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
