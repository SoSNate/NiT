import React, { useState } from 'react'
import GenericLearningModule, { QuizQuestion, GuideSection, TheoryCard } from '../../components/GenericLearningModule'
import { BlockMath } from '../../components/Math'

function RLCSim({ currentStep }: { currentStep: number }) {
  const [R, setR] = useState(10)     // Ω
  const [L, setL] = useState(0.1)    // H
  const [C, setC] = useState(100)    // μF
  const [V0, setV0] = useState(10)   // V

  const Cv = C * 1e-6
  const omega0 = 1 / Math.sqrt(L * Cv)
  const f0 = omega0 / (2 * Math.PI)
  const XL = omega0 * L
  const XC = 1 / (omega0 * Cv)
  const Z = Math.sqrt(R * R + (XL - XC) ** 2)
  const Imax = V0 / Z
  const tau = 2 * L / R

  // Energy stored initially in L
  const UL = 0.5 * L * Imax * Imax
  const UC = 0.5 * Cv * V0 * V0

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Circuit diagram */}
      <svg viewBox="-130 -90 260 180" width="240" height="160">
        {/* Top wire */}
        <line x1="-120" y1="-60" x2="120" y2="-60" stroke="#64748b" strokeWidth="2" />
        {/* Bottom wire */}
        <line x1="-120" y1="60" x2="120" y2="60" stroke="#64748b" strokeWidth="2" />
        {/* Left: voltage source */}
        <line x1="-120" y1="-60" x2="-120" y2="60" stroke="#64748b" strokeWidth="2" />
        <circle cx="-120" cy="0" r="18" fill="none" stroke="#fbbf24" strokeWidth="2" />
        <text x="-120" y="5" textAnchor="middle" fill="#fbbf24" fontSize="11">V₀</text>
        {/* Resistor */}
        <rect x="-70" y="-72" width="40" height="24" fill="#1e3a5f" stroke="#f87171" strokeWidth="1.5" rx="3" />
        <text x="-50" y="-57" textAnchor="middle" fill="#f87171" fontSize="9">R={R}Ω</text>
        {/* Inductor (coil) */}
        <path d="M10,-60 Q20,-75 30,-60 Q40,-75 50,-60 Q60,-75 70,-60"
          fill="none" stroke="#a78bfa" strokeWidth="2" />
        <text x="40" y="-77" textAnchor="middle" fill="#a78bfa" fontSize="9">L={L}H</text>
        {/* Capacitor */}
        <line x1="-20" y1="40" x2="10" y2="40" stroke="#34d399" strokeWidth="2" />
        <line x1="-20" y1="60" x2="10" y2="60" stroke="#64748b" strokeWidth="2" />
        <rect x="-20" y="44" width="30" height="4" fill="#34d399" />
        <rect x="-20" y="52" width="30" height="4" fill="#34d399" />
        <text x="-5" y="82" textAnchor="middle" fill="#34d399" fontSize="9">C={C}μF</text>

        {/* Resonance freq */}
        <text x="0" y="-10" textAnchor="middle" fill="#64748b" fontSize="8">
          f₀ = {f0.toFixed(1)} Hz
        </text>
      </svg>

      {/* Metrics */}
      <div className="w-full grid grid-cols-2 gap-2 px-2 text-xs">
        <div className="bg-white/10 rounded-xl p-2 text-center">
          <p className="text-slate-400">תדר תהודה f₀</p>
          <p className="text-yellow-400 font-bold">{f0.toFixed(1)} Hz</p>
        </div>
        <div className="bg-white/10 rounded-xl p-2 text-center">
          <p className="text-slate-400">עכבה Z</p>
          <p className="text-blue-400 font-bold">{Z.toFixed(1)} Ω</p>
        </div>
        <div className="bg-white/10 rounded-xl p-2 text-center">
          <p className="text-slate-400">זרם I_max</p>
          <p className="text-emerald-400 font-bold">{Imax.toFixed(2)} A</p>
        </div>
        <div className="bg-white/10 rounded-xl p-2 text-center">
          <p className="text-slate-400">קבוע זמן τ</p>
          <p className="text-red-400 font-bold">{tau.toFixed(3)} s</p>
        </div>
      </div>

      {/* Sliders */}
      <div className="w-full space-y-2 px-3">
        {[
          { label: 'R (Ω)', val: R, set: setR, min: 1, max: 100, step: 1, color: 'red' },
          { label: 'L (H)', val: L, set: setL, min: 0.01, max: 1, step: 0.01, color: 'purple' },
          { label: 'C (μF)', val: C, set: setC, min: 10, max: 1000, step: 10, color: 'green' },
        ].map(c => (
          <div key={c.label}>
            <div className="flex justify-between text-xs text-slate-400 mb-0.5">
              <span>{c.label}</span>
              <span className={`text-${c.color}-400 font-bold`}>{c.val}</span>
            </div>
            <input type="range" min={c.min} max={c.max} step={c.step} value={c.val}
              onChange={e => c.set(+e.target.value)}
              className={`w-full accent-${c.color}-500 h-1.5 rounded-full`} />
          </div>
        ))}
      </div>
    </div>
  )
}

function Step1() {
  const [selected, setSelected] = useState<number | null>(null)
  return (
    <div className="space-y-4">
      <div className="bg-white/5 rounded-xl p-4 text-slate-300 text-sm">
        מעגל LC: קבל טעון <span className="font-mono text-green-300">Q₀ = 10 μC</span>,{' '}
        <span className="font-mono text-green-300">C = 100 μF</span>,{' '}
        <span className="font-mono text-green-300">L = 0.1 H</span>.
        מה קורה לאנרגיה כשמחברים את הקבל לגליל?
      </div>
      <p className="text-slate-400 text-sm">מה מאפיין מעגל LC?</p>
      {[
        { l: 'תנודות LC — אנרגיה עוברת בין L ל-C', c: true },
        { l: 'הקבל מתפרק מיד דרך הגליל', c: false },
        { l: 'אין זרם — המעגל סגור', c: false },
        { l: 'הגליל מאפס את מטען הקבל', c: false },
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
        <div className={`rounded-xl p-3 text-sm ${selected === 0 ? 'bg-emerald-900/30 text-emerald-300' : 'bg-amber-900/30 text-amber-300'}`}>
          {selected === 0
            ? '✓ מעולה! מעגל LC = מתנד — אנרגיה מחשמלית (בקבל) לאנרגיה מגנטית (בגליל) וחזרה, בתדר ω₀=1/√(LC).'
            : 'לא. ב-LC (ללא התנגדות) האנרגיה לא מתפוגגת — היא מתנדנדת בין שני האלמנטים.'}
        </div>
      )}
    </div>
  )
}

function Step2() {
  const [revealed, setRevealed] = useState(0)
  const steps = [
    { title: 'אנרגיה במעגל LC', content: <span>
      <span className="text-green-300 font-semibold">בקבל:</span>{' '}
      <BlockMath tex="U_C = \dfrac{Q^2}{2C} = \dfrac{1}{2}CV^2" />
      <span className="text-purple-300 font-semibold">בגליל:</span>{' '}
      <BlockMath tex="U_L = \dfrac{1}{2}LI^2" />
      סה"כ שמור:
      <BlockMath tex="U_{\text{total}} = \dfrac{1}{2}CV^2 + \dfrac{1}{2}LI^2 = \text{const}" />
    </span> },
    { title: 'תדר תהודה', content: <span>
      ממשוואת תנועה LC:
      <BlockMath tex="\omega_0 = \dfrac{1}{\sqrt{LC}}, \quad f_0 = \dfrac{\omega_0}{2\pi}" />
    </span> },
    { title: 'מעגל RLC — עכבה', content: <span>
      <BlockMath tex="X_L = \omega L, \quad X_C = \dfrac{1}{\omega C}" />
      <BlockMath tex="Z = \sqrt{R^2 + (X_L - X_C)^2}" />
      <BlockMath tex="I_{\max} = \dfrac{V_0}{Z}" />
    </span> },
  ]
  return (
    <div className="space-y-4">
      <p className="text-white font-bold">מעגלי LC ו-RLC:</p>
      {steps.slice(0, revealed + 1).map((s, i) => (
        <div key={i} className="bg-white/5 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
          <p className="text-yellow-400 font-bold text-xs mb-2">שלב {i + 1}: {s.title}</p>
          {s.content}
        </div>
      ))}
      {revealed < steps.length - 1 && (
        <button onClick={() => setRevealed(r => r + 1)}
          className="w-full border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 py-2.5 rounded-xl text-sm font-medium transition-all">
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
        <p className="text-blue-300 text-xs font-bold mb-2">📄 מבחן HIT — 2021 (RL)</p>
        <p className="text-white text-sm leading-relaxed">
          מעגל RL: <span className="font-mono text-blue-300">L = 0.5 H</span>,{' '}
          <span className="font-mono text-blue-300">R = 10 Ω</span>,{' '}
          <span className="font-mono text-blue-300">V = 50 V</span>.
          <br /><br />
          <strong>(א)</strong> כמה אנרגיה מאוחסנת בגליל בזרם מרבי?<br />
          <strong>(ב)</strong> מה השדה המגנטי בתוך סולנואיד <span className="font-mono">n = 1000/m</span> כשהזרם מרבי?<br />
          <strong>(ג)</strong> לאחר ניתוק הסוללה — כמה חום מתפזר בנגד?
        </p>
      </div>
      <button onClick={() => setShowSol(v => !v)}
        className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-2.5 rounded-xl text-sm font-medium transition-all">
        {showSol ? '▲ הסתר פתרון' : '▼ הצג פתרון'}
      </button>
      {showSol && (
        <div className="space-y-2 text-sm">
          {[
            { q: 'א — אנרגיה בגליל:', a: 'I_max = V/R = 50/10 = 5 A\nU_L = ½·L·I² = ½·0.5·25 = 6.25 J' },
            { q: 'ב — שדה מגנטי:', a: 'B = μ₀·n·I = 4π×10⁻⁷ × 1000 × 5 ≈ 6.28×10⁻³ T' },
            { q: 'ג — חום:', a: 'כל האנרגיה מהגליל מתפזרת בנגד:\nQ = U_L = 6.25 J' },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 text-slate-300">
              <p className="text-yellow-400 font-bold text-xs mb-1">{item.q}</p>
              <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap">{item.a}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const practice: QuizQuestion[] = [
  {
    question: 'מעגל RC: R = 1 kΩ, C = 100 μF. מה קבוע הזמן τ?',
    options: ['τ = 0.1 s', 'τ = 10 s', 'τ = 1 ms', 'τ = 100 s'],
    correct: 0,
    explanation: 'τ = RC = 1000 × 100×10⁻⁶ = 0.1 s. אחרי זמן τ המתח יורד ל-37% מהמקסימום.',
  },
  {
    question: 'מעגל RLC טורי: R=10 Ω, L=0.1 H, C=100 μF, V=100 V, f=50 Hz. מה Z?',
    options: ['Z ≈ 22 Ω', 'Z = 10 Ω', 'Z ≈ 42 Ω', 'Z ≈ 19.7 Ω'],
    correct: 3,
    explanation: 'ω=314. X_L=31.4 Ω, X_C=31.8 Ω. Z=√(10²+(31.4-31.8)²)≈√(100+0.16)≈10.01 Ω. קרוב לתהודה!',
  },
  {
    question: 'מה תדר התהודה של מעגל LC עם L = 50 mH ו-C = 20 μF?',
    options: ['f₀ ≈ 159 Hz', 'f₀ ≈ 100 Hz', 'f₀ ≈ 1000 Hz', 'f₀ ≈ 50 Hz'],
    correct: 0,
    explanation: 'ω₀ = 1/√(LC) = 1/√(0.05×20×10⁻⁶) = 1000 rad/s. f₀ = 1000/(2π) ≈ 159 Hz.',
  },
  {
    question: 'במעגל RLC בתהודה, מה הכוח הממוצע שמתפזר בנגד R (I_max = 2 A, R = 5 Ω)?',
    options: ['P = 10 W', 'P = 5 W', 'P = 20 W', 'P = 0'],
    correct: 0,
    explanation: 'P = ½I_max²R = ½×4×5 = 10 W. בתהודה כל הכוח מתפזר על R (L ו-C מבטלים זה את זה).',
  },
]

const quiz: QuizQuestion[] = [
  {
    question: 'מעגל LC עם L=0.4H, C=100μF. מה תדר התהודה?',
    options: ['≈ 25 Hz', '≈ 2.5 Hz', '≈ 79.6 Hz', '≈ 50 Hz'],
    correct: 0,
    explanation: 'ω₀=1/√(LC)=1/√(0.4×10⁻⁴)=158 rad/s → f₀=ω₀/2π≈25.1 Hz',
  },
  {
    question: 'מעגל RLC בתהודה (ω=ω₀). מה מאפיין את הזרם?',
    options: ['זרם מינימלי', 'זרם מרבי (Z=R)', 'זרם אפס', 'זרם קבוע'],
    correct: 1,
    explanation: 'בתהודה: X_L=X_C → Z=√(R²+0)=R (מינימום) → זרם מרבי I_max=V₀/R',
  },
  {
    question: 'גליל L=2H נושא זרם I=3A. מה האנרגיה המאוחסנת?',
    options: ['3 J', '6 J', '9 J', '18 J'],
    correct: 2,
    explanation: 'U_L = ½·L·I² = ½·2·9 = 9 J',
  },
]

const greenNote = [
  'LC: ω₀ = 1/√(LC), אנרגיה מתנדנדת U_C ↔ U_L ← שמורה',
  'RLC AC: X_L=ωL, X_C=1/(ωC), Z=√(R²+(X_L-X_C)²), I=V₀/Z',
  'תהודה: X_L=X_C → Z_min=R → I_max=V₀/R',
  'RL עם DC: I(t)=I_max(1-e^(-Rt/L)), τ=L/R',
]

const guides: GuideSection[] = [
  {
    title: 'נוסחאות',
    content: (
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-yellow-400 font-bold mb-1">מעגל LC</p>
          <ul className="space-y-0.5 text-slate-300 font-mono text-xs" dir="ltr">
            <li>ω₀ = 1/√(LC)</li>
            <li>f₀ = ω₀/(2π)</li>
            <li>U = ½CV² + ½LI²</li>
          </ul>
        </div>
        <div>
          <p className="text-yellow-400 font-bold mb-1">מעגל RLC (AC)</p>
          <ul className="space-y-0.5 text-slate-300 font-mono text-xs" dir="ltr">
            <li>X_L = ωL</li>
            <li>X_C = 1/(ωC)</li>
            <li>Z = √(R² + (X_L-X_C)²)</li>
            <li>I_max = V₀/Z</li>
          </ul>
        </div>
        <div>
          <p className="text-yellow-400 font-bold mb-1">אנרגיה</p>
          <ul className="space-y-0.5 text-slate-300 font-mono text-xs" dir="ltr">
            <li>U_L = ½LI²</li>
            <li>U_C = ½CV² = Q²/(2C)</li>
          </ul>
        </div>
      </div>
    ),
  },
]

const intro = (
  <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
    <p>
      מעגל LC הוא כמו מטוטלת: אנרגיה מחשמלית (בקבל) ↔ אנרגיה מגנטית (בגליל).
      ה"תנודה" הזו יוצרת <span className="text-yellow-400 font-semibold">גלים רדיו</span> — כך עובד הטלפון שלך.
    </p>
    <div className="bg-white/5 rounded-xl p-4 border-r-2 border-yellow-500">
      <p className="font-mono text-yellow-300 text-base text-center" dir="ltr">ω₀ = 1/√(LC)</p>
      <p className="text-center text-xs text-slate-500 mt-1">תדר תהודה = כשה-LC מסתנכרן</p>
    </div>
    <p>
      מבחן HIT שאל על RL עם אנרגיה ושדה מגנטי (2021), ועל LC עם קצירה וזרם (2021C).
      נלמד את שניהם.
    </p>
  </div>
)

const theory: TheoryCard = {
  summary: 'מעגל RLC מכיל נגד (R), סליל (L) וקבל (C). כשמחברים מקור AC — כל רכיב מתנגד אחרת לתדר. בתדר תהודה הסליל והקבל מבטלים זה את זה, ונשאר רק R.',
  formulas: [
    { label: 'עכבה כוללת במעגל טורי', tex: 'Z = \\sqrt{R^2 + (X_L - X_C)^2}' },
    { label: 'עכבת סליל ועכבת קבל', tex: 'X_L = \\omega L \\quad,\\quad X_C = \\dfrac{1}{\\omega C}' },
    { label: 'תדר תהודה', tex: '\\omega_0 = \\dfrac{1}{\\sqrt{LC}}' },
  ],
  when: 'בתהודה (ω₀): Z מינימלי, זרם מקסימלי, כל הכוח על R. מחוץ לתהודה: הסליל שולט בתדרים גבוהים, הקבל בנמוכים.',
}

export default function RLCCircuits({ onBack }: { onBack: () => void }) {
  return (
    <GenericLearningModule
      moduleId="physics2-rlc"
      title="מעגלי LC ו-RLC"
      subtitle="תנודות, תהודה, ועכבה"
      intro={intro}
      step1={<Step1 />}
      step2={<Step2 />}
      step3={<Step3 />}
      SimulatorComponent={RLCSim}
      theory={theory}
      practiceQuestions={practice}
      quizQuestions={quiz}
      greenNote={greenNote}
      guides={guides}
      onBack={onBack}
    />
  )
}
