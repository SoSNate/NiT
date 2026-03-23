import React, { useState } from 'react'
import GenericLearningModule, { QuizQuestion, GuideSection, TheoryCard } from '../../components/GenericLearningModule'
import { BlockMath, InlineMath } from '../../components/Math'

// ── SIMULATOR ────────────────────────────────────────────────────────────────
function MagneticFieldSim({ currentStep }: { currentStep: number }) {
  const [current, setCurrent] = useState(5) // A
  const [radius, setRadius] = useState(2)   // m

  const mu0 = 4 * Math.PI * 1e-7
  const B = (mu0 * current) / (2 * Math.PI * radius)
  const BuT = B * 1e6 // μT

  const wireX = 0
  const loops = [60, 90, 115, 135]

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <svg viewBox="-140 -140 280 280" width="260" height="260">
        <defs>
          <marker id="arr-b" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#a78bfa" />
          </marker>
        </defs>

        {/* Magnetic field loops */}
        {loops.map((r, i) => (
          <ellipse key={i} cx={wireX} cy="0" rx={r} ry={r * 0.35}
            fill="none" stroke="#a78bfa" strokeWidth="1.5" opacity={0.8 - i * 0.15}
            markerEnd="url(#arr-b)"
          />
        ))}

        {/* Wire (current direction into page → dot) */}
        <circle cx="0" cy="0" r="10" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
        <text x="0" y="5" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">·</text>
        <text x="0" y="22" textAnchor="middle" fill="#fbbf24" fontSize="9">{current} A</text>

        {/* Radius measurement */}
        <line x1="0" y1="0" x2={radius * 45} y2="0" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,2" />
        <text x={radius * 22} y="-8" textAnchor="middle" fill="#94a3b8" fontSize="9">r = {radius} m</text>

        {/* Label */}
        <text x="0" y="-120" textAnchor="middle" fill="#64748b" fontSize="9">
          {currentStep === 2 ? '∮B·dl = μ₀I' : 'שדה מגנטי סביב חוט ישר'}
        </text>
      </svg>

      <div className="w-full space-y-3 px-3">
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>זרם I</span>
            <span className="text-yellow-400 font-bold">{current} A</span>
          </div>
          <input type="range" min="1" max="20" value={current}
            onChange={e => setCurrent(+e.target.value)}
            className="w-full accent-yellow-500 h-2 rounded-full" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>מרחק r</span>
            <span className="text-purple-400 font-bold">{radius} m</span>
          </div>
          <input type="range" min="0.5" max="4" step="0.1" value={radius}
            onChange={e => setRadius(+e.target.value)}
            className="w-full accent-purple-500 h-2 rounded-full" />
        </div>

        <div className="bg-white/10 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-400 font-mono" dir="ltr">B = μ₀I/(2πr)</p>
          <p className="text-purple-400 font-black text-xl mt-1">{BuT.toFixed(2)} μT</p>
          <p className="text-slate-500 text-xs">כלל יד ימין: אגודל = זרם, אצבעות = B</p>
        </div>
      </div>
    </div>
  )
}

function Step1() {
  const [selected, setSelected] = useState<number | null>(null)
  const options = [
    { label: 'חוק אמפר', desc: '∮B·dl = μ₀I_enc', correct: true },
    { label: 'חוק ביו-סאבר', desc: 'אינטגרל על כל אלמנט זרם', correct: false },
    { label: 'חוק גאוס', desc: 'שטף חשמלי דרך משטח סגור', correct: false },
    { label: 'כוח לורנץ', desc: 'כוח על חלקיק בשדה', correct: false },
  ]

  return (
    <div className="space-y-4">
      <p className="text-white font-bold">שאלה לזיהוי:</p>
      <div className="bg-white/5 rounded-xl p-4 text-slate-300 text-sm">
        חוט ישר אינסופי נושא זרם <span className="font-mono text-yellow-300">I = 10 A</span>.
        מצא את עוצמת השדה המגנטי במרחק <span className="font-mono text-yellow-300">r = 0.05 m</span> מהחוט.
      </div>
      <p className="text-slate-400 text-sm">איזה חוק מתאים לסימטריה גלילית?</p>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <button key={i} disabled={selected !== null} onClick={() => setSelected(i)}
            className={`w-full text-right p-3 rounded-xl text-sm transition-all border ${
              selected === null ? 'bg-white/10 hover:bg-white/20 text-white border-white/10'
              : opt.correct ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : selected === i ? 'bg-red-500/20 text-red-300 border-red-500/40'
              : 'bg-white/5 text-slate-600 border-transparent'}`}>
            <span className="font-semibold">{opt.label}</span>
            <span className="text-slate-500 mr-2">— {opt.desc}</span>
          </button>
        ))}
      </div>
      {selected !== null && (
        <div className={`rounded-xl p-3 text-sm ${options[selected].correct ? 'bg-emerald-900/30 text-emerald-300' : 'bg-amber-900/30 text-amber-300'}`}>
          {options[selected].correct
            ? '✓ נכון! חוק אמפר עובד בדיוק כמו גאוס אבל למגנטיות — בחר "מסלול אמפר" עם הסימטריה של הבעיה.'
            : 'ביו-סאבר מחשב גם כן, אבל הוא אינטגרל קשה. חוק אמפר הרבה יותר מהיר לסימטריה גלילית.'}
        </div>
      )}
    </div>
  )
}

function Step2() {
  const [revealed, setRevealed] = useState(0)
  const steps = [
    {
      title: 'חוק אמפר',
      content: <span>האינטגרל הקווי של B סביב מסלול סגור = μ₀ כפול הזרם הכלוא:
        <BlockMath tex="\oint \vec{B} \cdot d\vec{l} = \mu_0 \cdot I_{\text{enc}}" />
      </span>,
    },
    {
      title: 'בחירת מסלול אמפר',
      content: <span>לחוט ישר, B מעגלי ← בחרנו <span className="text-purple-300 font-semibold">מעגל ברדיוס r</span>. על המסלול B קבוע ומקביל ל-dl:
        <BlockMath tex="B \cdot 2\pi r = \mu_0 \cdot I" />
      </span>,
    },
    {
      title: 'פתרון',
      content: <span>
        <BlockMath tex="B = \dfrac{\mu_0 I}{2\pi r}" />
        <span className="text-slate-300">כלל יד ימין: אגודל בכיוון הזרם, אצבעות כורכות בכיוון B.</span>
      </span>,
    },
  ]

  return (
    <div className="space-y-4">
      <p className="text-white font-bold">חוק אמפר — שלב אחר שלב:</p>
      {steps.slice(0, revealed + 1).map((s, i) => (
        <div key={i} className="bg-white/5 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
          <p className="text-purple-400 font-bold text-xs mb-2">שלב {i + 1}: {s.title}</p>
          {s.content}
        </div>
      ))}
      {revealed < steps.length - 1 && (
        <button onClick={() => setRevealed(r => r + 1)}
          className="w-full border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 py-2.5 rounded-xl text-sm font-medium transition-all">
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
        <p className="text-blue-300 text-xs font-bold mb-2">📄 מבחן HIT — 2021 (עדכון)</p>
        <p className="text-white text-sm leading-relaxed">
          שני חוטים מקבילים, מרוחקים <span className="font-mono text-blue-300">d = 0.2 m</span>.
          חוט 1: <span className="font-mono text-blue-300">I₁ = 10 A</span> שמאלה.
          חוט 2: <span className="font-mono text-blue-300">I₂ = 5 A</span> ימינה.
          <br /><br />
          <strong>(א)</strong> מצא B בנקודה P בדיוק באמצע בין החוטים.<br />
          <strong>(ב)</strong> כוח פר מטר בין החוטים?
        </p>
      </div>
      <p className="text-slate-400 text-sm">💭 זכור: כוח בין חוטים — נושאי זרם זהה נמשכים, הפוך — דוחים!</p>
      <button onClick={() => setShowSol(v => !v)}
        className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-2.5 rounded-xl text-sm font-medium transition-all">
        {showSol ? '▲ הסתר פתרון' : '▼ הצג פתרון'}
      </button>
      {showSol && (
        <div className="space-y-2 text-sm">
          <div className="bg-white/5 rounded-xl p-3 text-slate-300">
            <p className="text-yellow-400 font-bold text-xs mb-1">חלק א — B בנקודה P (r = 0.1 m מכל חוט):</p>
            <p className="font-mono text-xs" dir="ltr">B₁ = μ₀·10/(2π·0.1) = 2×10⁻⁵ T (כלפי מטה)</p>
            <p className="font-mono text-xs" dir="ltr">B₂ = μ₀·5/(2π·0.1) = 1×10⁻⁵ T (כלפי מטה)</p>
            <p className="font-mono text-xs text-emerald-400 mt-1" dir="ltr">B_total = 3×10⁻⁵ T</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-slate-300">
            <p className="text-yellow-400 font-bold text-xs mb-1">חלק ב — כוח פר מטר:</p>
            <p className="font-mono text-xs" dir="ltr">F/L = μ₀·I₁·I₂/(2πd) = 5×10⁻⁵ N/m</p>
            <p className="text-xs text-slate-400 mt-1">זרמים הפוכים → כוח דוחה</p>
          </div>
        </div>
      )}
    </div>
  )
}

const practice: QuizQuestion[] = [
  {
    question: 'חוט ישר עם זרם I = 20 A. מה עוצמת B במרחק r = 0.1 m?',
    options: ['B = 4×10⁻⁵ T', 'B = 4×10⁻⁴ T', 'B = 2×10⁻⁵ T', 'B = 8×10⁻⁵ T'],
    correct: 0,
    explanation: 'B = μ₀I/(2πr) = 4π×10⁻⁷ × 20 / (2π × 0.1) = 4×10⁻⁵ T.',
  },
  {
    question: 'סולנואיד עם n = 1000 לולאות/מטר וזרם I = 2 A. מה B בתוכו?',
    options: ['B = 2.51 mT', 'B = 1.26 mT', 'B = 0.63 mT', 'B = 5.02 mT'],
    correct: 0,
    explanation: 'B = μ₀nI = 4π×10⁻⁷ × 1000 × 2 ≈ 2.51×10⁻³ T = 2.51 mT.',
  },
  {
    question: 'שני חוטים מקבילים, מרחק 0.4 m. זרמים: I₁ = 6 A ו-I₂ = 4 A, באותו כיוון. כוח פר מטר?',
    options: ['F/L = 1.2×10⁻⁵ N/m, משיכה', 'F/L = 1.2×10⁻⁵ N/m, דחייה', 'F/L = 2.4×10⁻⁵ N/m, משיכה', 'F/L = 6×10⁻⁶ N/m, דחייה'],
    correct: 0,
    explanation: 'F/L = μ₀I₁I₂/(2πd) = 4π×10⁻⁷×6×4/(2π×0.4) = 1.2×10⁻⁵ N/m. זרמים זהים → משיכה.',
  },
  {
    question: 'בתוך גליל מוליך (רדיוס R = 0.05 m, זרם אחיד I = 10 A). מה B בנקודה r = 0.02 m?',
    options: ['B = μ₀I/(2πR)', 'B = μ₀Ir/(2πR²)', 'B = μ₀I/(2πr)', 'B = 0'],
    correct: 1,
    explanation: 'I_enc = I(r/R)². אמפר: B·2πr = μ₀Ir²/R² → B = μ₀Ir/(2πR²). גדל לינארית עם r.',
  },
]

const quiz: QuizQuestion[] = [
  {
    question: 'חוט ישר אינסופי עם זרם I. מה B במרחק r מהחוט?',
    options: ['B = μ₀I/(4πr²)', 'B = μ₀I/(2πr)', 'B = μ₀Ir/(2π)', 'B = μ₀I/(4πr)'],
    correct: 1,
    explanation: 'חוק אמפר עם מסלול מעגלי: B·2πr = μ₀I → B = μ₀I/(2πr)',
  },
  {
    question: 'שני חוטים מקבילים עם זרמים באותו כיוון — מה הכוח ביניהם?',
    options: ['דוחה', 'מושך', 'אפס', 'תלוי במרחק בלבד'],
    correct: 1,
    explanation: 'זרמים מקבילים באותו כיוון — הכוח מושך! זרמים הפוכים — הכוח דוחה.',
  },
  {
    question: 'בתוך גליל מוליך גדול (r < R) הנושא זרם אחיד I, מה B(r)?',
    options: ['B = μ₀I/(2πr)', 'B = μ₀Ir/(2πR²)', 'B = 0', 'B = μ₀I/(2πR)'],
    correct: 1,
    explanation: 'I_enc = I·(r/R)². מחוק אמפר: B·2πr = μ₀I·r²/R² → B = μ₀Ir/(2πR²). B גדל לינארית!',
  },
]

const greenNote = [
  'בחר מסלול אמפר עם סימטריה הבעיה (חוט → מעגל, סולנואיד → מלבן)',
  'חשב I_enc — מה הזרם שעובר דרך המסלול?',
  'פתח ∮B·dl = μ₀I_enc → לחוט: B·2πr = μ₀I → B = μ₀I/(2πr)',
  'כיוון B: כלל יד ימין. כוח בין חוטים: זרמים מקבילים = משיכה',
]

const guides: GuideSection[] = [
  {
    title: 'נוסחאות',
    content: (
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-purple-400 font-bold mb-1">חוק אמפר</p>
          <BlockMath tex="\oint \vec{B} \cdot d\vec{l} = \mu_0 \cdot I_{\text{enc}}" />
        </div>
        <div>
          <p className="text-purple-400 font-bold mb-1">מצבים נפוצים</p>
          <ul className="space-y-1 text-slate-300">
            <li><span className="text-yellow-400">חוט ישר:</span> <span dir="ltr" className="font-mono text-xs">B = μ₀I/(2πr)</span></li>
            <li><span className="text-yellow-400">סולנואיד:</span> <span dir="ltr" className="font-mono text-xs">B = μ₀nI</span></li>
            <li><span className="text-yellow-400">טורואיד:</span> <span dir="ltr" className="font-mono text-xs">B = μ₀NI/(2πr)</span></li>
          </ul>
        </div>
        <div>
          <p className="text-purple-400 font-bold mb-1">כוח בין חוטים</p>
          <p className="font-mono bg-white/5 p-2 rounded text-slate-200 text-xs" dir="ltr">F/L = μ₀I₁I₂/(2πd)</p>
        </div>
        <div>
          <p className="text-purple-400 font-bold mb-1">קבועים</p>
          <p className="font-mono text-xs text-slate-300" dir="ltr">μ₀ = 4π×10⁻⁷ T·m/A</p>
        </div>
      </div>
    ),
  },
  {
    title: 'טיפים',
    content: (
      <div className="space-y-3 text-sm text-slate-300">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
          <p className="text-yellow-400 font-bold text-xs mb-1">⚠️ טעות נפוצה</p>
          <p>חוק אמפר vs. ביו-סאבר: לסימטריה — אמפר מהיר. לחישוב מדויק ללא סימטריה — ביו-סאבר.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          <p className="text-emerald-400 font-bold text-xs mb-1">✓ כלל יד ימין</p>
          <p>אגודל בכיוון הזרם → אצבעות כורכות בכיוון B המעגלי.</p>
        </div>
      </div>
    ),
  },
]

const intro = (
  <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
    <p>
      זרם חשמלי יוצר סביבו <span className="text-purple-400 font-semibold">שדה מגנטי</span>.
      הוכחה? חוט עם זרם ממגנט מחט מצפן — גילוי של אורסטד ב-1820 ששינה את הפיזיקה.
    </p>
    <p>
      <span className="text-purple-400 font-semibold">חוק אמפר</span> הוא הגרסה המגנטית של חוק גאוס —
      במקום משטח סגור, אנחנו בוחרים <span className="text-white font-semibold">מסלול סגור</span>
      ומחשבים אינטגרל קווי:
    </p>
    <div className="bg-white/5 rounded-xl p-4 border-r-2 border-purple-500">
      <BlockMath tex="\oint \vec{B} \cdot d\vec{l} = \mu_0 \cdot I_{\text{enc}}" />
    </div>
    <p>
      במבחן HIT — חוק אמפר מופיע תמיד עם חוטים ישרים, סולנואידים, או טורואידים.
      שאלות שני חוטים — <span className="text-yellow-400">בכל מבחן</span>.
    </p>
  </div>
)

const theory: TheoryCard = {
  summary: 'זרם חשמלי יוצר שדה מגנטי סביבו בצורת עיגולים. חוק אמפר אומר: אם תסגור מסלול סגור סביב חוטים, סכום B על אורך המסלול שווה למטען הזרמי הכלוא כפול μ₀.',
  formulas: [
    { label: 'חוק אמפר', tex: '\\oint \\vec{B} \\cdot d\\vec{l} = \\mu_0 I_{\\text{enc}}' },
    { label: 'שדה של חוט ישר אינסופי', tex: 'B = \\dfrac{\\mu_0 I}{2\\pi r}' },
    { label: 'כוח בין שני חוטים מקבילים', tex: '\\dfrac{F}{L} = \\dfrac{\\mu_0 I_1 I_2}{2\\pi d}' },
  ],
  when: 'חוק אמפר מהיר לסימטריה גלילית (חוט ישר, סולנואיד, טורואיד). זרמים מקבילים באותו כיוון — נמשכים. הפוך — דוחים.',
}

export default function MagneticField({ onBack }: { onBack: () => void }) {
  return (
    <GenericLearningModule
      moduleId="physics2-bfield"
      title="שדה מגנטי וחוק אמפר"
      subtitle="חוטים, סולנואידים, וכוח בין מוליכים"
      intro={intro}
      step1={<Step1 />}
      step2={<Step2 />}
      step3={<Step3 />}
      SimulatorComponent={MagneticFieldSim}
      theory={theory}
      practiceQuestions={practice}
      quizQuestions={quiz}
      greenNote={greenNote}
      guides={guides}
      onBack={onBack}
    />
  )
}
