import React, { useState, useEffect, useRef } from 'react'
import GenericLearningModule, { QuizQuestion, GuideSection, TheoryCard } from '../../components/GenericLearningModule'
import { BlockMath } from '../../components/Math'

function InductionSim({ currentStep }: { currentStep: number }) {
  const [B0, setB0] = useState(1)      // Tesla amplitude
  const [freq, setFreq] = useState(1)  // Hz
  const [area, setArea] = useState(0.5) // m²
  const [t, setT] = useState(0)
  const rafRef = useRef<number>()
  const lastRef = useRef<number>(0)

  useEffect(() => {
    const tick = (now: number) => {
      const dt = (now - lastRef.current) / 1000
      lastRef.current = now
      setT(prev => prev + dt)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const omega = 2 * Math.PI * freq
  const B = B0 * Math.cos(omega * t)
  const Phi = B * area
  const EMF = B0 * omega * area * Math.sin(omega * t)

  // Graph points for EMF wave
  const W = 220, H = 80
  const points = Array.from({ length: 60 }, (_, i) => {
    const x = (i / 59) * W
    const tb = (i / 59) * 2 / freq
    const y = H / 2 - (B0 * Math.cos(omega * (t - 2 / freq + tb)) * (H / 2 - 4))
    return `${x},${y}`
  }).join(' ')

  const emfPoints = Array.from({ length: 60 }, (_, i) => {
    const x = (i / 59) * W
    const tb = (i / 59) * 2 / freq
    const y = H / 2 - (B0 * omega * area * Math.sin(omega * (t - 2 / freq + tb)) * ((H / 2 - 4) / (B0 * omega * area + 0.001)))
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Coil diagram */}
      <svg viewBox="-120 -80 240 160" width="240" height="160">
        <defs>
          <marker id="arr-ind" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#f87171" />
          </marker>
        </defs>
        {/* B field arrows */}
        {[-60, -20, 20, 60].map(x => (
          <line key={x} x1={x} y1={-60} x2={x} y2={60}
            stroke={B > 0 ? '#60a5fa' : '#f87171'} strokeWidth="1.5"
            opacity={Math.abs(B) / B0}
            markerEnd="url(#arr-ind)" />
        ))}
        {/* Coil rectangle */}
        <rect x="-50" y="-40" width="100" height="80"
          fill="none" stroke="#34d399" strokeWidth="2.5" rx="4" />
        <text x="0" y="0" textAnchor="middle" fill="#34d399" fontSize="10">סליל A = {area} m²</text>
        {/* EMF indicator */}
        <text x="0" y="65" textAnchor="middle" fill="#fbbf24" fontSize="9">
          ε = {EMF.toFixed(2)} V
        </text>
      </svg>

      {/* Wave graph */}
      <div className="w-full px-2">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="70">
          <line x1="0" y1={H/2} x2={W} y2={H/2} stroke="#334155" strokeWidth="1" />
          <polyline points={points} fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.7" />
          <polyline points={emfPoints} fill="none" stroke="#fbbf24" strokeWidth="1.5" />
          <text x="3" y="12" fill="#60a5fa" fontSize="7">B(t)</text>
          <text x="3" y="22" fill="#fbbf24" fontSize="7">ε(t)</text>
        </svg>
      </div>

      {/* Controls */}
      <div className="w-full space-y-2 px-3">
        {[
          { label: 'B₀', value: B0, setter: setB0, min: 0.1, max: 3, step: 0.1, color: 'blue' },
          { label: 'תדר f', value: freq, setter: setFreq, min: 0.2, max: 3, step: 0.1, color: 'yellow' },
          { label: 'שטח A', value: area, setter: setArea, min: 0.1, max: 2, step: 0.1, color: 'green' },
        ].map(ctrl => (
          <div key={ctrl.label}>
            <div className="flex justify-between text-xs text-slate-400 mb-0.5">
              <span>{ctrl.label}</span>
              <span className={`text-${ctrl.color}-400 font-bold`}>{ctrl.value.toFixed(1)}</span>
            </div>
            <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step} value={ctrl.value}
              onChange={e => ctrl.setter(+e.target.value)}
              className={`w-full accent-${ctrl.color}-500 h-1.5 rounded-full`} />
          </div>
        ))}
        <div className="bg-white/10 rounded-xl p-2 text-center">
          <p className="text-xs font-mono text-slate-400" dir="ltr">|ε_max| = B₀·ω·A = {(B0 * omega * area).toFixed(2)} V</p>
        </div>
      </div>
    </div>
  )
}

function Step1() {
  const [selected, setSelected] = useState<number | null>(null)
  return (
    <div className="space-y-4">
      <div className="bg-white/5 rounded-xl p-4 text-slate-300 text-sm">
        סליל עם <span className="font-mono text-red-300">N = 200</span> לולאות ושטח{' '}
        <span className="font-mono text-red-300">A = 0.01 m²</span> נמצא בשדה מגנטי{' '}
        <span className="font-mono text-red-300" dir="ltr">B(t) = 0.5·cos(100t) T</span>.
        מצא את הכוח האלקטרומוטיבי המושרה.
      </div>
      <p className="text-slate-400 text-sm">איזה חוק ייתן לנו את ה-EMF?</p>
      {[
        { l: 'חוק פאראדיי-לנץ', c: true },
        { l: 'חוק אמפר', c: false },
        { l: 'חוק גאוס', c: false },
        { l: 'חוק ביו-סאבר', c: false },
      ].map((opt, i) => (
        <button key={i} disabled={selected !== null} onClick={() => setSelected(i)}
          className={`w-full text-right p-3 rounded-xl text-sm transition-all border ${
            selected === null ? 'bg-white/10 hover:bg-white/20 text-white border-white/10'
            : opt.c ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            : selected === i ? 'bg-red-500/20 text-red-300 border-red-500/40'
            : 'bg-white/5 text-slate-600 border-transparent'}`}>
          {opt.l}
        </button>
      ))}
      {selected !== null && (
        <div className={`rounded-xl p-3 text-sm ${[0].includes(selected) ? 'bg-emerald-900/30 text-emerald-300' : 'bg-amber-900/30 text-amber-300'}`}>
          {selected === 0
            ? '✓ חוק פאראדיי! EMF = -dΦ/dt. השינוי בשטף מגנטי יוצר כוח אלקטרומוטיבי. סימן המינוס = חוק לנץ (ה-EMF מתנגד לשינוי).'
            : 'לא. חוקים אלו קשורים לחישוב B עצמו, לא ל-EMF שנוצר משינוי ב-B.'}
        </div>
      )}
    </div>
  )
}

function Step2() {
  const [revealed, setRevealed] = useState(0)
  const steps = [
    { title: 'שטף מגנטי', content: <span>שטף = B כפול שטח כפול cos(θ):
      <BlockMath tex="\Phi = B \cdot A \cdot \cos\theta" />
      לסליל N לולאות: <BlockMath tex="\Phi_{\text{total}} = N \cdot B \cdot A \cdot \cos\theta" />
    </span> },
    { title: 'חוק פאראדיי', content: <span>ה-EMF המושרה = שיעור השינוי של השטף:
      <BlockMath tex="\varepsilon = -\dfrac{d\Phi}{dt}" />
      לסליל מסתובב: <BlockMath tex="\varepsilon = N \cdot B \cdot A \cdot \omega \cdot \sin(\omega t)" />
    </span> },
    { title: 'חוק לנץ', content: <span>
      הסימן מינוס = <span className="text-yellow-300 font-semibold">חוק לנץ</span>: הזרם המושרה יוצר שדה שמתנגד לשינוי השטף.
      <span className="block mt-2 text-slate-400 text-xs">מעשית: אם B גדל, הזרם זורם כך שה-B שלו מנוגד לב החיצוני.</span>
    </span> },
  ]
  return (
    <div className="space-y-4">
      <p className="text-white font-bold">חוק פאראדיי-לנץ:</p>
      {steps.slice(0, revealed + 1).map((s, i) => (
        <div key={i} className="bg-white/5 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
          <p className="text-red-400 font-bold text-xs mb-2">שלב {i + 1}: {s.title}</p>
          {s.content}
        </div>
      ))}
      {revealed < steps.length - 1 && (
        <button onClick={() => setRevealed(r => r + 1)}
          className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 py-2.5 rounded-xl text-sm font-medium transition-all">
          גלה שלב {revealed + 2} ▾
        </button>
      )}
    </div>
  )
}

function Step3() {
  const [showSol, setShowSol] = useState(false)
  return (
    <div className="space-y-4">
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
        <p className="text-blue-300 text-xs font-bold mb-2">📄 מבחן HIT — 2023</p>
        <p className="text-white text-sm leading-relaxed">
          שדה מגנטי אחיד <span className="font-mono text-blue-300" dir="ltr">B(t) = B₀·sin(ωt)</span>{' '}
          (כאשר <span className="font-mono">B₀ = 0.2 T</span>, <span className="font-mono">ω = 100 rad/s</span>)
          חודר דרך לולאה עם שטח <span className="font-mono">A = 0.05 m²</span>.
          <br /><br />
          <strong>(א)</strong> מצא ε(t).<br />
          <strong>(ב)</strong> מה ε_max?<br />
          <strong>(ג)</strong> אם התנגדות הלולאה R = 2 Ω, מה הזרם המרבי?
        </p>
      </div>
      <button onClick={() => setShowSol(v => !v)}
        className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-2.5 rounded-xl text-sm font-medium transition-all">
        {showSol ? '▲ הסתר פתרון' : '▼ הצג פתרון'}
      </button>
      {showSol && (
        <div className="space-y-2 text-sm">
          <div className="bg-white/5 rounded-xl p-3 text-slate-300">
            <p className="text-yellow-400 font-bold text-xs mb-1">א — ε(t):</p>
            <p className="font-mono text-xs" dir="ltr">Φ = B·A = B₀·sin(ωt)·A</p>
            <p className="font-mono text-xs" dir="ltr">ε = -dΦ/dt = -B₀·A·ω·cos(ωt)</p>
            <p className="font-mono text-xs text-emerald-400" dir="ltr">ε(t) = -1·cos(100t) V</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-slate-300">
            <p className="text-yellow-400 font-bold text-xs mb-1">ב — ε_max:</p>
            <p className="font-mono text-xs text-emerald-400" dir="ltr">|ε_max| = B₀·A·ω = 0.2×0.05×100 = 1 V</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-slate-300">
            <p className="text-yellow-400 font-bold text-xs mb-1">ג — I_max:</p>
            <p className="font-mono text-xs text-emerald-400" dir="ltr">I_max = ε_max/R = 1/2 = 0.5 A</p>
          </div>
        </div>
      )}
    </div>
  )
}

const practice: QuizQuestion[] = [
  {
    question: 'לולאה מלבנית (0.3×0.4 m) בשדה B = 0.8 T. B יורד לאפס ב-0.2 שניות. מה |ε|?',
    options: ['ε = 0.48 V', 'ε = 0.096 V', 'ε = 0.24 V', 'ε = 2.4 V'],
    correct: 0,
    explanation: 'Φ₀ = B·A = 0.8×0.12 = 0.096 Wb. ε = ΔΦ/Δt = 0.096/0.2 = 0.48 V.',
  },
  {
    question: 'סליל N=500, A=0.02 m². B(t)=0.4sin(60t) T. מה ε_max?',
    options: ['ε_max = 240 V', 'ε_max = 4 V', 'ε_max = 24 V', 'ε_max = 120 V'],
    correct: 0,
    explanation: 'ε_max = N·B₀·A·ω = 500 × 0.4 × 0.02 × 60 = 240 V.',
  },
  {
    question: 'חוט באורך L = 0.5 m נע במהירות v = 4 m/s בניצב לשדה B = 0.3 T. מה ε?',
    options: ['ε = 0.6 V', 'ε = 1.2 V', 'ε = 0.075 V', 'ε = 6 V'],
    correct: 0,
    explanation: 'ε = BLv = 0.3 × 0.5 × 4 = 0.6 V.',
  },
  {
    question: 'לפי חוק לנץ: מגנט מתקרב לסליל עם קוטב צפון כלפי פניו. מה כיוון הזרם המושרה בסליל?',
    options: ['נגד השעון (מנגד לקוטב הצפון)', 'עם השעון (מושך את המגנט)', 'אין זרם — המגנט לא זזה מספיק מהר', 'תלוי בחומר הסליל'],
    correct: 0,
    explanation: 'הזרם יוצר שדה שמתנגד לכניסת המגנט — כלומר קוטב צפון כנגדו → זרם נגד השעון.',
  },
]

const quiz: QuizQuestion[] = [
  {
    question: 'שטף מגנטי דרך לולאה עולה מ-0 ל-0.5 Wb ב-0.1 שניות. מה ה-EMF?',
    options: ['0.5 V', '5 V', '50 V', '0.05 V'],
    correct: 1,
    explanation: 'ε = -ΔΦ/Δt = -0.5/0.1 = -5 V. הגודל: 5 V.',
  },
  {
    question: 'לפי חוק לנץ, מה כיוון הזרם המושרה כאשר השדה החיצוני B גדל?',
    options: ['בכיוון שמגביר את B', 'בכיוון שמנגד את עליית B', 'כיוון שרירותי', 'אין זרם מושרה'],
    correct: 1,
    explanation: 'חוק לנץ: הזרם המושרה מנסה לשמור על השטף הקיים — מתנגד לשינוי.',
  },
  {
    question: 'סליל N=100 לולאות, A=0.01 m², ב-B(t)=2cos(50t). מה ε_max?',
    options: ['100 V', '200 V', '10 V', '1000 V'],
    correct: 0,
    explanation: 'ε_max = N·B₀·A·ω = 100×2×0.01×50 = 100 V',
  },
]

const greenNote = [
  'חשב שטף: Φ = N·B·A·cos(θ) — שים לב לזווית בין B לנורמל לסליל',
  'גזור: ε = -dΦ/dt (מינוס = חוק לנץ)',
  'ε_max = N·B₀·A·ω — כשB = B₀cos(ωt), ε_max = N·B₀·A·ω',
  'זרם: I = ε/R. כוח: F = BIL על חוט בשדה',
]

const guides: GuideSection[] = [
  {
    title: 'נוסחאות',
    content: (
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-red-400 font-bold mb-1">חוק פאראדיי</p>
          <BlockMath tex="\varepsilon = -\dfrac{d\Phi}{dt} = -N \dfrac{d(B \cdot A \cdot \cos\theta)}{dt}" />
        </div>
        <div>
          <p className="text-red-400 font-bold mb-1">מצבים נפוצים</p>
          <ul className="space-y-1 text-slate-300 text-xs">
            <li><span className="text-yellow-400">B משתנה, A קבוע:</span> <span dir="ltr" className="font-mono">ε = -N·A·dB/dt</span></li>
            <li><span className="text-yellow-400">סליל מסתובב:</span> <span dir="ltr" className="font-mono">ε = N·B·A·ω·sin(ωt)</span></li>
            <li><span className="text-yellow-400">חוט נע:</span> <span dir="ltr" className="font-mono">ε = B·L·v</span></li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: 'טיפים',
    content: (
      <div className="space-y-2 text-sm text-slate-300">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
          <p className="text-yellow-400 font-bold text-xs mb-1">⚠️ שגיאה נפוצה</p>
          <p>שכחת את N! לסליל עם N לולאות: Φ_total = N·Φ_one</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          <p className="text-emerald-400 font-bold text-xs mb-1">✓ חוק לנץ בקצרה</p>
          <p>B עולה → זרם מנגד. B יורד → זרם תומך. כמו ברכים גמישות.</p>
        </div>
      </div>
    ),
  },
]

const intro = (
  <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
    <p>
      מה קורה כשמקרבים מגנט לסליל? זרם זורם — גם בלי סוללה!
      פאראדיי גילה ב-1831: <span className="text-red-400 font-semibold">שינוי בשטף מגנטי יוצר EMF</span>.
    </p>
    <div className="bg-white/5 rounded-xl p-4 border-r-2 border-red-500">
      <BlockMath tex="\varepsilon = -\dfrac{d\Phi}{dt}" />
      <p className="text-center text-xs text-slate-500 mt-1">שינוי בשטף = כוח אלקטרומוטיבי</p>
    </div>
    <p>
      הסימן מינוס = <span className="text-yellow-400 font-semibold">חוק לנץ</span>: הטבע "מתנגד" לשינויים.
      זה למה מנועים ומחוללים עובדים — ולמה במבחן תמיד שואלים על זה.
    </p>
  </div>
)

const theory: TheoryCard = {
  summary: 'כשהשטף המגנטי דרך סליל משתנה — נוצר מתח חשמלי (EMF). זה העיקרון מאחורי מחוללי חשמל ומנועים. חוק לנץ אומר שה-EMF תמיד מתנגד לשינוי שיצר אותו.',
  formulas: [
    { label: 'חוק פאראדיי', tex: '\\varepsilon = -\\dfrac{d\\Phi}{dt} = -N\\dfrac{d(BA\\cos\\theta)}{dt}' },
    { label: 'EMF מקסימלי לסליל מסתובב', tex: '\\varepsilon_{\\max} = N \\cdot B \\cdot A \\cdot \\omega' },
    { label: 'EMF של חוט נע', tex: '\\varepsilon = B \\cdot L \\cdot v' },
  ],
  when: 'בכל שאלה שב-B או A משתנים בזמן — גזור את השטף. הסימן מינוס = חוק לנץ: הזרם המושרה מתנגד לשינוי.',
}

export default function Induction({ onBack }: { onBack: () => void }) {
  return (
    <GenericLearningModule
      moduleId="physics2-induction"
      title="אינדוקציה אלקטרומגנטית"
      subtitle="חוק פאראדיי-לנץ — EMF משינוי שטף"
      intro={intro}
      step1={<Step1 />}
      step2={<Step2 />}
      step3={<Step3 />}
      SimulatorComponent={InductionSim}
      theory={theory}
      practiceQuestions={practice}
      quizQuestions={quiz}
      greenNote={greenNote}
      guides={guides}
      onBack={onBack}
    />
  )
}
