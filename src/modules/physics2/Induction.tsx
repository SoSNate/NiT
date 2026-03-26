/**
 * Induction.tsx — upgraded to PatternStep/PrincipleStep/WorkedExample
 * Source: physics2_lesson 3 2026.pdf (Faraday, Lenz, EMF)
 * Built: 2026-03-26
 */
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import { GlassCard, StyledSlider, SimReadout, ToggleGroup } from '../../components/SimulatorShell'
import type { QuizQuestion, GuideSection } from '../../types'

// ── SIMULATOR ────────────────────────────────────────────────────────────────
function Sim({ currentStep: _cs }: { currentStep: number }) {
  const [B0, setB0]   = useState(1)
  const [freq, setFreq] = useState(1)
  const [area, setArea] = useState(0.5)
  const [mode, setMode] = useState<'rotate' | 'change'>('change')
  const [t, setT] = useState(0)
  const rafRef  = useRef<number>()
  const lastRef = useRef<number>(0)

  useEffect(() => {
    const tick = (now: number) => {
      const dt = (now - lastRef.current) / 1000
      lastRef.current = now
      setT(prev => prev + dt * 0.7)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const omega = 2 * Math.PI * freq
  const B     = B0 * Math.cos(omega * t)
  const Phi   = mode === 'change' ? B * area : B0 * area * Math.cos(omega * t)
  const EMF   = mode === 'change'
    ? B0 * omega * area * Math.sin(omega * t)
    : B0 * omega * area * Math.sin(omega * t)

  const W = 300, H = 70
  const bPoints = useMemo(() => Array.from({ length: 60 }, (_, i) => {
    const tb = (i / 59) * 2 / freq
    const y  = H / 2 - B0 * Math.cos(omega * (t - 2 / freq + tb)) * (H / 2 - 6)
    return `${(i / 59) * W},${y}`
  }).join(' '), [t, B0, freq, omega])

  const emfPoints = useMemo(() => Array.from({ length: 60 }, (_, i) => {
    const tb   = (i / 59) * 2 / freq
    const peak = B0 * omega * area + 0.001
    const y    = H / 2 - B0 * omega * area * Math.sin(omega * (t - 2 / freq + tb)) * ((H / 2 - 6) / peak)
    return `${(i / 59) * W},${y}`
  }).join(' '), [t, B0, freq, area, omega])

  const lenzDir = EMF > 0 ? 'נגד השעון' : 'עם השעון'

  return (
    <div className="w-full space-y-4" dir="ltr">
      <GlassCard className="overflow-hidden bg-slate-950">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 90 }}>
          <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="#334155" strokeWidth="1" />
          <polyline points={bPoints}   fill="none" stroke="#60a5fa" strokeWidth="2" opacity="0.8" />
          <polyline points={emfPoints} fill="none" stroke="#fbbf24" strokeWidth="2" />
          <text x="6" y="14" fill="#60a5fa" fontSize="9" fontFamily="monospace">B(t)</text>
          <text x="6" y="26" fill="#fbbf24" fontSize="9" fontFamily="monospace">{"ε(t)"}</text>
          <text x={W - 4} y="14" textAnchor="end" fill="#94a3b8" fontSize="8">
            {`ε = ${EMF.toFixed(2)} V`}
          </text>
        </svg>
      </GlassCard>

      <div className="grid grid-cols-2 gap-2">
        <SimReadout label="שטף Φ"  value={Phi.toFixed(3)}  unit="Wb" />
        <SimReadout label="EMF ε"  value={EMF.toFixed(2)}  unit="V"  />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={lenzDir} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="text-center text-xs text-purple-300 font-semibold">
          חוק לנץ: זרם זורם {lenzDir}
        </motion.div>
      </AnimatePresence>

      <ToggleGroup
        value={mode}
        onChange={v => setMode(v as typeof mode)}
        options={[
          { value: 'change', label: 'B משתנה' },
          { value: 'rotate', label: 'סליל מסתובב' },
        ]}
      />
      <StyledSlider label="B₀"  value={B0}   min={0.1} max={3}   step={0.1} unit="T"   onChange={setB0} />
      <StyledSlider label="תדר" value={freq} min={0.2} max={3}   step={0.1} unit="Hz"  onChange={setFreq} />
      <StyledSlider label="שטח A" value={area} min={0.1} max={2} step={0.1} unit="m²" onChange={setArea} />
    </div>
  )
}

// ── STEP 1 — זיהוי ──────────────────────────────────────────────────────────
const step1 = <PatternStep
  scenario="סליל N=200 לולאות, A=0.01 m², בשדה B(t)=0.5·cos(100t) T. רוצים את EMF(t)."
  prompt="מה הצעד הראשון?"
  options={[
    { label: 'חשב שטף: Φ = N·B·A, גזור לפי t', desc: 'נכון. Φ_total = N·B·A·cos(θ) → גזירה נותנת EMF', correct: true },
    { label: 'שתי: ε = B·L·v (חוט נע)', desc: 'זה עבור חוט נע, לא סליל בשדה משתנה', correct: false },
    { label: 'השתמש בחוק אמפר', desc: 'אמפר נותן B מזרם, לא EMF משינוי שטף', correct: false },
    { label: 'ε = V = IR', desc: 'אוהם נותן מתח על נגד, לא EMF משרה', correct: false },
  ]}
  correctFeedback="נכון! Φ_total = N·B·A·cos(θ). אחרי גזירה: ε = -N·A·dB/dt = N·B₀·A·ω·sin(ωt)."
/>

// ── STEP 2 — עיקרון ──────────────────────────────────────────────────────────
const step2 = <PrincipleStep
  heading="חוק פאראדיי-לנץ — 4 מצבים:"
  items={[
    {
      title: 'המשוואה הבסיסית',
      content: <div className="space-y-2">
        <Formula c="ε = -dΦ/dt = -N·d(B·A·cosθ)/dt" color="text-red-300" />
        <p className="text-slate-400 text-xs">המינוס = חוק לנץ: ה-EMF מתנגד לשינוי השטף</p>
      </div>,
    },
    {
      title: 'B משתנה, A קבוע',
      content: <div className="space-y-1">
        <Formula c="ε = -N·A·dB/dt" color="text-yellow-300" />
        <p className="text-slate-400 text-xs" dir="ltr">{"B(t) = B₀cos(ωt) → ε = N·B₀·A·ω·sin(ωt)"}</p>
        <Formula c="ε_max = N·B₀·A·ω" color="text-emerald-300" />
      </div>,
      accent: 'text-yellow-400',
    },
    {
      title: 'חוט נע בשדה קבוע',
      content: <div className="space-y-1">
        <Formula c="ε = B·L·v" color="text-blue-300" />
        <Note color="blue" children={<>חוט אורך L נע במהירות v ⊥ ל-B</>} />
      </div>,
      accent: 'text-blue-400',
    },
    {
      title: 'חוק לנץ — הכיוון',
      content: <div className="space-y-1">
        <p className="text-slate-300 text-sm">B עולה → זרם מנגד. B יורד → זרם תומך.</p>
        <Note color="yellow" children={<>שימוש: קבע כיוון זרם בלי לחשב סימן</>} />
      </div>,
    },
  ]}
/>

// ── STEP 3 — דוגמה ───────────────────────────────────────────────────────────
const step3 = <WorkedExample
  examLabel="מבחן HIT — אינדוקציה (N, B(t), R)"
  problem={<p>
    שדה <span dir="ltr">B(t) = 0.2·sin(100t) T</span> חודר דרך סליל N=1,{' '}
    A=0.05 m², R=2 Ω.
    חשב: (א) ε(t), (ב) ε_max, (ג) I_max.
  </p>}
  hint="Φ = B·A, גזור, ε_max = B₀·A·ω, I = ε/R."
  solution={[
    {
      label: 'שלב א — שטף וגזירה',
      thought: 'Φ = B·A = B₀·sin(ωt)·A',
      content: <div className="space-y-1">
        <Formula c="ε = -dΦ/dt = -B₀·A·ω·cos(ωt)" color="text-yellow-300" />
        <p className="text-slate-400 text-xs" dir="ltr">{"ε(t) = -0.2 × 0.05 × 100 · cos(100t) = -cos(100t) V"}</p>
      </div>,
    },
    {
      label: 'שלב ב — ε_max',
      thought: 'הערך המקסימלי של |cos| = 1',
      content: <div className="space-y-1">
        <Formula c="ε_max = B₀·A·ω = 0.2 × 0.05 × 100 = 1 V" color="text-emerald-300" />
      </div>,
    },
    {
      label: 'שלב ג — I_max',
      content: <div className="space-y-1">
        <Formula c="I_max = ε_max / R = 1 / 2 = 0.5 A" color="text-emerald-300" />
        <Note color="green" children={<>בדיקה: יחידות V/Ω = A ✓</>} />
      </div>,
    },
  ]}
/>

// ── QUIZ ─────────────────────────────────────────────────────────────────────
const quiz: QuizQuestion[] = [
  {
    question: 'שטף מגנטי עולה מ-0 ל-0.5 Wb ב-0.1 שניות. מה |ε|?',
    options: ['0.5 V', '5 V', '50 V', '0.05 V'],
    correct: 1,
    explanation: 'ε = ΔΦ/Δt = 0.5/0.1 = 5 V.',
  },
  {
    question: 'סליל N=100, A=0.01 m², B(t)=2cos(50t). מה ε_max?',
    options: ['100 V', '200 V', '10 V', '1000 V'],
    correct: 0,
    explanation: 'ε_max = N·B₀·A·ω = 100×2×0.01×50 = 100 V.',
  },
  {
    question: 'לפי חוק לנץ, B גדל לכיוון +z. כיוון הזרם המושרה?',
    options: ['יוצר שדה ב-+z', 'יוצר שדה ב--z (מנגד)', 'לא קיים זרם', 'תלוי בחומר'],
    correct: 1,
    explanation: 'חוק לנץ: הזרם מנסה לבטל את השינוי — יוצר שדה נגדי ב--z.',
  },
]

// ── PRACTICE ─────────────────────────────────────────────────────────────────
const practice: QuizQuestion[] = [
  {
    question: 'לולאה 0.3×0.4 m, B=0.8 T יורד לאפס ב-0.2 s. מה |ε|?',
    options: ['0.48 V', '0.096 V', '0.24 V', '2.4 V'],
    correct: 0,
    explanation: 'Φ₀ = 0.8×0.12 = 0.096 Wb. ε = 0.096/0.2 = 0.48 V.',
  },
  {
    question: 'סליל N=500, A=0.02 m², B(t)=0.4sin(60t). מה ε_max?',
    options: ['240 V', '4 V', '24 V', '120 V'],
    correct: 0,
    explanation: 'ε_max = 500×0.4×0.02×60 = 240 V.',
  },
  {
    question: 'חוט L=0.5 m נע v=4 m/s ⊥ B=0.3 T. מה ε?',
    options: ['0.6 V', '1.2 V', '0.075 V', '6 V'],
    correct: 0,
    explanation: 'ε = BLv = 0.3×0.5×4 = 0.6 V.',
  },
  {
    question: 'מגנט מתקרב לסליל קוטב צפון לפנים. כיוון זרם?',
    options: ['נגד השעון (דוחה)', 'עם השעון (מושך)', 'אין זרם', 'תלוי במהירות'],
    correct: 0,
    explanation: 'חוק לנץ: הסליל יוצר קוטב צפון לנגד → זרם נגד השעון.',
  },
]

// ── GREEN NOTE ────────────────────────────────────────────────────────────────
const greenNote = [
  'חשב שטף: Φ = N·B·A·cos(θ) — שים לב לזווית',
  'גזור: ε = -dΦ/dt (מינוס = חוק לנץ)',
  'ε_max = N·B₀·A·ω כש-B = B₀cos(ωt)',
  'חוט נע: ε = BLv. זרם: I = ε/R',
]

// ── GUIDES ────────────────────────────────────────────────────────────────────
const guides: GuideSection[] = [
  {
    title: 'מתי להשתמש',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p className="text-yellow-400 font-bold text-xs">3 מצבים — 3 נוסחאות</p>
      <p className="text-xs">1. B משתנה + סליל → ε = -N·A·dB/dt</p>
      <p className="text-xs">2. סליל מסתובב → ε_max = N·B·A·ω</p>
      <p className="text-xs">3. חוט נע → ε = BLv</p>
      <Note color="blue" children={<>תמיד בדוק: מה משתנה — B? A? θ?</>} />
    </div>,
  },
  {
    title: 'נוסחאות',
    content: <div className="space-y-3 text-xs">
      <div className="bg-white/5 rounded-xl p-3 space-y-1">
        <p className="text-emerald-400 font-bold">חוק פאראדיי</p>
        <p className="font-mono text-slate-200 text-sm" dir="ltr">ε = -N · dΦ/dt</p>
        <p className="text-slate-400">השינוי בשטף יוצר כ"א. מינוס = חוק לנץ: הכ"א מתנגד לשינוי.</p>
      </div>
      <div className="bg-white/5 rounded-xl p-3 space-y-1">
        <p className="text-blue-400 font-bold">שטף מגנטי</p>
        <p className="font-mono text-slate-200 text-sm" dir="ltr">Φ = B · A · cos(θ)</p>
        <p className="text-slate-400">θ בין B לנורמל לסליל. B∥סליל → θ=0° → Φ_max. B⊥ → Φ=0 → ε_max.</p>
      </div>
      <div className="bg-white/5 rounded-xl p-3 space-y-1">
        <p className="text-yellow-400 font-bold">גנרטור (B=B₀cosωt)</p>
        <p className="font-mono text-slate-200 text-sm" dir="ltr">ε(t) = N·B₀·A·ω·sin(ωt)</p>
        <p className="font-mono text-slate-200 text-sm" dir="ltr">ε_max = N·B₀·A·ω</p>
      </div>
      <div className="bg-white/5 rounded-xl p-3 space-y-1">
        <p className="text-purple-400 font-bold">חוט נע במגנט</p>
        <p className="font-mono text-slate-200 text-sm" dir="ltr">ε = B·L·v</p>
        <p className="text-slate-400">L = אורך החוט, v = מהירות אנכית לB ולL. זרם: I = ε/R.</p>
      </div>
    </div>,
  },
  {
    title: 'שגיאות נפוצות',
    content: <div className="space-y-2 text-sm">
      <p className="text-red-400 text-xs font-bold">שגיאה #1 — שכחת N</p>
      <p className="text-slate-300 text-xs">לסליל N לולאות: Φ_total = N·Φ_one. ε_max גדל פי N!</p>
      <p className="text-red-400 text-xs font-bold mt-2">שגיאה #2 — בלבול בסימן</p>
      <p className="text-slate-300 text-xs">המינוס בפאראדיי = כיוון לנץ. לגודל: |ε| = |dΦ/dt|.</p>
      <p className="text-red-400 text-xs font-bold mt-2">שגיאה #3 — זווית θ</p>
      <p className="text-slate-300 text-xs">Φ = B·A·cos(θ). כשB ⊥ לסליל — θ=90° → Φ=0 → ε_max!</p>
    </div>,
  },
  {
    title: 'במבחן HIT',
    content: <div className="space-y-2 text-xs text-slate-300">
      <p className="text-emerald-400 font-bold">תבנית שאלה מהמבחן 2023:</p>
      <p>מסגרת מלבנית בשדה B(t)=B₀sin(ωt). מצא ε(t) וI_max.</p>
      <div className="bg-white/5 rounded-xl p-2 text-xs space-y-1">
        <p>1. Φ = N·B₀sin(ωt)·A</p>
        <p>2. ε = -dΦ/dt = -N·B₀·A·ω·cos(ωt)</p>
        <p>3. ε_max = N·B₀·A·ω</p>
        <p>4. I_max = ε_max/R</p>
      </div>
      <Note color="yellow" children={<>כתוב ביטוי פרמטרי (N,B₀,A,ω) לפני שמציב מספרים.</>} />
    </div>,
  },
]

// ── INTRO + BRIDGE ────────────────────────────────────────────────────────────
const intro = <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
  <p>פאראדיי גילה ב-1831: <span className="text-red-400 font-semibold">שינוי בשטף מגנטי יוצר מתח חשמלי</span> — גם בלי סוללה. זה העיקרון מאחורי כל מחולל חשמל.</p>
  <Formula c="ε = -dΦ/dt" color="text-red-300" />
  <p className="text-slate-400 text-xs">הסימן מינוס = חוק לנץ: הטבע "מתנגד" לשינויים.</p>
</div>

const bridge = <div className="space-y-2 text-sm text-slate-300">
  <p>זוכר <span className="text-purple-400 font-semibold">שטף מגנטי</span>?</p>
  <Formula c="Φ = B·A·cos(θ)" color="text-purple-300" />
  <p>פאראדיי אמר: שנה את Φ בזמן — תקבל מתח. פשוט כמו לגזור.</p>
</div>

const theory: TheoryCard = {
  summary: 'שינוי שטף מגנטי דרך סליל יוצר EMF (מתח מושרה). חוק לנץ קובע שה-EMF מתנגד לשינוי שיצר אותו.',
  formulas: [
    { label: 'חוק פאראדיי', tex: '\\varepsilon = -\\dfrac{d\\Phi}{dt} = -N\\dfrac{d(BA\\cos\\theta)}{dt}', verbal: 'שינוי בשטף המגנטי דרך סליל יוצר מתח מושרה. המינוס = חוק לנץ: הזרם המושרה תמיד מתנגד לשינוי שגרם לו. N = מספר לולאות. גוזרים את Φ=BA cosθ לפי t.' },
    { label: 'EMF מקסימלי', tex: '\\varepsilon_{\\max} = N \\cdot B_0 \\cdot A \\cdot \\omega', verbal: 'לסליל המסתובב בשדה B₀ בתדירות ω. ε_max גדל פי N עם כל לולאה נוספת. ε(t) = ε_max·sin(ωt) — גל סינוסואידלי בדיוק כמו בגנרטור.' },
    { label: 'חוט נע', tex: '\\varepsilon = B \\cdot L \\cdot v', verbal: 'חוט באורך L הנע במהירות v בניצב לשדה B יוצר מתח. ניתן להבין מקולון: המטענים בחוט חווים כוח F=qvB שמפריד אותם → מתח. זרם: I = ε/R.' },
  ],
  when: 'B או A משתנים בזמן → גזור את Φ. הסימן מינוס = לנץ. ε_max = N·B₀·A·ω לסליל מסתובב.',
}

export default function Induction({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="physics2-induction"
    title="אינדוקציה אלקטרומגנטית"
    subtitle="חוק פאראדיי-לנץ — EMF משינוי שטף"
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
