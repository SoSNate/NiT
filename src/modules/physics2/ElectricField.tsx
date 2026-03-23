import React, { useState } from 'react'
import GenericLearningModule, { QuizQuestion, GuideSection, TheoryCard } from '../../components/GenericLearningModule'
import { BlockMath, InlineMath, LiveMath } from '../../components/Math'

// ── SIMULATOR ────────────────────────────────────────────────────────────────
function ElectricFieldSim({ currentStep }: { currentStep: number }) {
  const [charge, setCharge] = useState(5)   // μC
  const [radius, setRadius] = useState(2.5) // m (distance from center)
  const [showGauss, setShowGauss] = useState(false)

  const k = 9e9
  const E = (k * charge * 1e-6) / (radius * radius)
  const Ekilo = E / 1000

  const sphereR = 28
  const gaussR = Math.min(120, radius * 24)

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <svg viewBox="-140 -140 280 280" width="260" height="260">
        <defs>
          <marker id="arr-e" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#fbbf24" />
          </marker>
          <radialGradient id="sphereGrad" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.5" />
          </radialGradient>
        </defs>

        {/* Field lines */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
          const rad = (deg * Math.PI) / 180
          const x1 = Math.cos(rad) * (sphereR + 4)
          const y1 = Math.sin(rad) * (sphereR + 4)
          const x2 = Math.cos(rad) * 128
          const y2 = Math.sin(rad) * 128
          return (
            <line
              key={deg}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#fbbf24" strokeWidth="1.5" opacity="0.6"
              markerEnd="url(#arr-e)"
            />
          )
        })}

        {/* Gaussian surface */}
        {(showGauss || currentStep === 2) && (
          <>
            <circle cx="0" cy="0" r={gaussR}
              fill="none" stroke="#60a5fa" strokeWidth="1.5"
              strokeDasharray="6,3" opacity="0.8" />
            <text x={gaussR + 4} y="4" fill="#60a5fa" fontSize="9">
              משטח גאוס
            </text>
          </>
        )}

        {/* Sphere */}
        <circle cx="0" cy="0" r={sphereR} fill="url(#sphereGrad)" stroke="#34d399" strokeWidth="1.5" />
        <text x="0" y="-8" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">+Q</text>
        <text x="0" y="8" textAnchor="middle" fill="#a7f3d0" fontSize="9">{charge} μC</text>

        {/* Radius arrow */}
        <line x1="0" y1="0" x2={gaussR} y2="0" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,2" />
        <text x={gaussR / 2} y="-6" textAnchor="middle" fill="#94a3b8" fontSize="9">r = {radius} m</text>
      </svg>

      {/* Controls */}
      <div className="w-full space-y-3 px-3">
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>מטען Q</span>
            <span className="text-emerald-400 font-bold">{charge} μC</span>
          </div>
          <input type="range" min="1" max="10" value={charge}
            onChange={e => setCharge(+e.target.value)}
            className="w-full accent-emerald-500 h-2 rounded-full" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>מרחק r</span>
            <span className="text-blue-400 font-bold">{radius} m</span>
          </div>
          <input type="range" min="1" max="5" step="0.1" value={radius}
            onChange={e => setRadius(+e.target.value)}
            className="w-full accent-blue-500 h-2 rounded-full" />
        </div>

        <button onClick={() => setShowGauss(v => !v)}
          className={`w-full py-1.5 rounded-lg text-xs font-medium transition-all ${showGauss ? 'bg-blue-500/30 text-blue-300' : 'bg-white/10 text-slate-400'}`}>
          {showGauss ? '✓' : '○'} הצג משטח גאוס
        </button>

        <div className="bg-white/10 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-400 font-mono" dir="ltr">E = kQ/r² = {Ekilo.toFixed(1)} kN/C</p>
          <p className="text-emerald-400 font-black text-xl mt-1">{Ekilo.toFixed(1)} kN/C</p>
          <p className="text-slate-500 text-xs">כיוון: רדיאלי מהמרכז</p>
        </div>
      </div>
    </div>
  )
}

// ── STEP 1 — Pattern Recognition ─────────────────────────────────────────────
function Step1() {
  const [selected, setSelected] = useState<number | null>(null)
  const options = [
    { label: 'חוק גאוס', desc: 'לחלוקות מטען סימטריות', correct: true },
    { label: 'חוק קולון', desc: 'כוח בין שתי נקודות מטען', correct: false },
    { label: 'חוק ביו-סאבר', desc: 'שדה מגנטי מזרם', correct: false },
    { label: 'חוק פאראדיי', desc: 'EMF מאינדוקציה', correct: false },
  ]

  return (
    <div className="space-y-4">
      <p className="text-white font-bold text-base">שאלה לזיהוי הנושא:</p>
      <div className="bg-white/5 rounded-xl p-4 text-slate-300 text-sm leading-relaxed">
        בעיה: כדור מוליך בעל מטען <span className="text-emerald-400 font-mono">Q = +5 μC</span> ורדיוס{' '}
        <span className="text-emerald-400 font-mono">R = 0.1 m</span>. מצא את עוצמת השדה החשמלי
        בנקודה שנמצאת <span className="text-emerald-400 font-mono">r = 2 m</span> מהמרכז.
      </div>
      <p className="text-slate-400 text-sm">איזה חוק/עיקרון תבחר לפתרון?</p>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <button
            key={i}
            disabled={selected !== null}
            onClick={() => setSelected(i)}
            className={`w-full text-right p-3 rounded-xl text-sm transition-all border ${
              selected === null
                ? 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                : opt.correct
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : selected === i
                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                : 'bg-white/5 text-slate-600 border-transparent'
            }`}
          >
            <span className="font-semibold">{opt.label}</span>
            <span className="text-slate-500 mr-2">— {opt.desc}</span>
          </button>
        ))}
      </div>
      {selected !== null && (
        <div className={`rounded-xl p-3 text-sm ${options[selected].correct ? 'bg-emerald-900/30 text-emerald-300' : 'bg-amber-900/30 text-amber-300'}`}>
          {options[selected].correct
            ? '✓ מעולה! חוק גאוס הוא הכלי הנכון לסימטריה כדורית — הוא הופך חישוב קשה לפשוט מאוד.'
            : `✗ לא בדיוק. ${options[selected].label} לא מתאים כאן כי הבעיה כוללת חלוקת מטען ולא נקודות מטען בודדות. חוק גאוס הוא הבחירה הנכונה.`}
        </div>
      )}
    </div>
  )
}

// ── STEP 2 — Principle ────────────────────────────────────────────────────────
function Step2() {
  const [revealed, setRevealed] = useState(0)
  const steps = [
    {
      title: 'חוק גאוס',
      content: (
        <span>
          השטף החשמלי דרך משטח סגור שווה למטען הכלוא חלקי{' '}
          <InlineMath tex="\varepsilon_0" />:
          <BlockMath tex="\oint \vec{E} \cdot d\vec{A} = \dfrac{Q_{\text{enc}}}{\varepsilon_0}" />
        </span>
      ),
    },
    {
      title: 'בחירת משטח גאוס',
      content: (
        <span>
          לסימטריה כדורית בוחרים{' '}
          <span className="text-blue-300 font-semibold">כדור קונצנטרי</span> ברדיוס{' '}
          <span className="font-mono text-blue-300">r</span>. על פני הכדור,{' '}
          <span className="font-mono">E</span> קבוע ומקביל ל-<span className="font-mono">dA</span>,
          לכן:
          <BlockMath tex="E \cdot 4\pi r^2 = \dfrac{Q}{\varepsilon_0}" />
        </span>
      ),
    },
    {
      title: 'פתרון סופי',
      content: (
        <span>
          מחלקים את שני האגפים ב-<InlineMath tex="4\pi r^2" />:
          <BlockMath tex="E = \dfrac{Q}{4\pi\varepsilon_0 r^2} = \dfrac{kQ}{r^2}" />
          <span className="block mt-2 text-slate-300">
            כאשר <span className="font-mono text-yellow-300" dir="ltr">k = 9×10⁹ N·m²/C²</span>.
            אם המרכז הוא מוליך, השדה פנימה = 0, בחוץ — כאילו כל המטען בנקודה אחת.
          </span>
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <p className="text-white font-bold">חוק גאוס — שלב אחר שלב:</p>
      {steps.slice(0, revealed + 1).map((s, i) => (
        <div key={i} className="bg-white/5 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
          <p className="text-emerald-400 font-bold text-xs mb-2">שלב {i + 1}: {s.title}</p>
          {s.content}
        </div>
      ))}
      {revealed < steps.length - 1 && (
        <button
          onClick={() => setRevealed(r => r + 1)}
          className="w-full border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 py-2.5 rounded-xl text-sm font-medium transition-all"
        >
          גלה שלב {revealed + 2} ▾
        </button>
      )}
    </div>
  )
}

// ── STEP 3 — Worked Example (HIT 2021) ────────────────────────────────────────
function Step3() {
  const [showSol, setShowSol] = useState(false)

  return (
    <div className="space-y-4">
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
        <p className="text-blue-300 text-xs font-bold mb-2">📄 מבחן HIT — יולי 2021</p>
        <p className="text-white text-sm leading-relaxed">
          שלושה כדורים קונצנטריים. הכדור הפנימי (רדיוס <span className="font-mono text-blue-300">a</span>)
          נושא מטען <span className="font-mono text-blue-300">+Q</span>.
          הכדור האמצעי (מוליך, עובי זניח, רדיוס <span className="font-mono text-blue-300">b</span>)
          טעון <span className="font-mono text-blue-300">-Q</span>.
          הכדור החיצוני (רדיוס <span className="font-mono text-blue-300">c</span>) מבודד, ללא מטען.
          <br /><br />
          <strong>מצא את E בארבעה אזורים:</strong>{' '}
          <span className="font-mono">r &lt; a</span>,{' '}
          <span className="font-mono">a &lt; r &lt; b</span>,{' '}
          <span className="font-mono">b &lt; r &lt; c</span>,{' '}
          <span className="font-mono">r &gt; c</span>.
        </p>
      </div>

      <p className="text-slate-400 text-sm">
        💭 נסה לפתור לבד — מה <span className="text-white">Q_enc</span> בכל אזור?
      </p>

      <button
        onClick={() => setShowSol(v => !v)}
        className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-2.5 rounded-xl text-sm font-medium transition-all"
      >
        {showSol ? '▲ הסתר פתרון' : '▼ הצג פתרון מפורט'}
      </button>

      {showSol && (
        <div className="space-y-3 text-sm">
          {[
            { region: 'r < a (פנים הכדור הפנימי)', Qenc: '0', E: 'E = 0', note: 'בפנים מוליך אין שדה', color: 'emerald' },
            { region: 'a < r < b (בין הכדורים)', Qenc: '+Q', E: 'E = kQ/r²', note: 'כלפי חוץ (רדיאלי)', color: 'yellow' },
            { region: 'b < r < c (בתוך מוליך האמצעי)', Qenc: 'Q + (-Q) = 0', E: 'E = 0', note: 'מוליך ← שדה = 0', color: 'emerald' },
            { region: 'r > c (מחוץ לכל)', Qenc: '+Q + (-Q) = 0', E: 'E = 0', note: 'המטענות מבטלים זה את זה', color: 'emerald' },
          ].map((row, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3">
              <p className="text-slate-400 text-xs mb-1 font-mono">{row.region}</p>
              <p className="text-slate-300">
                <span className="text-slate-500 text-xs">Q_enc = </span>
                <span className="font-mono text-blue-300">{row.Qenc}</span>
                <span className="mx-2 text-slate-600">→</span>
                <span className={`font-mono font-bold text-${row.color}-400`}>{row.E}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">💡 {row.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── PRACTICE QUESTIONS (generated) ───────────────────────────────────────────
const practice: QuizQuestion[] = [
  {
    question: 'כדור מוליך בעל מטען Q = +8 μC ורדיוס R = 0.2 m. מה עוצמת השדה בנקודה r = 0.5 m מהמרכז?',
    options: ['E = kQ/R² ≈ 1.8 MN/C', 'E = kQ/r² ≈ 288 kN/C', 'E = 0', 'E = kQ/(r-R)² ≈ 720 kN/C'],
    correct: 1,
    explanation: 'r > R → מחוץ לכדור. E = kQ/r² = 9×10⁹ × 8×10⁻⁶ / 0.25 ≈ 288,000 N/C. R לא משחק תפקיד.',
  },
  {
    question: 'מה השטף החשמלי דרך משטח גאוס גלילי (גובה L, רדיוס r) סביב חוט ישר אינסופי עם צפיפות מטען λ?',
    options: ['Φ = λL/ε₀', 'Φ = λ/(ε₀L)', 'Φ = λ/(2πrε₀)', 'Φ = 2πrλL/ε₀'],
    correct: 0,
    explanation: 'Q_enc = λL (אורך L של חוט). חוק גאוס: Φ = Q_enc/ε₀ = λL/ε₀. רדיוס לא משנה את השטף!',
  },
  {
    question: 'מישור אינסופי עם צפיפות שטח מטען σ. מה השדה החשמלי מעל המישור?',
    options: ['E = σ/ε₀', 'E = σ/(2ε₀)', 'E = σ/(4πε₀)', 'E = 2σ/ε₀'],
    correct: 1,
    explanation: 'קופסת גאוס דרך המישור: 2E·A = σA/ε₀ → E = σ/(2ε₀). גורם 2 כי השדה יוצא משני הצדדים.',
  },
  {
    question: 'מוליך כדורי ריק עם מטען +Q על פניו. מה E בתוך החלל הריק (r < R)?',
    options: ['E = kQ/r²', 'E = kQ/R²', 'E = 0', 'E = kQr/R³'],
    correct: 2,
    explanation: 'Q_enc = 0 (אין מטען בתוך חלל ריק). חוק גאוס: E·4πr² = 0 → E = 0. תמיד!',
  },
  {
    question: 'שני כדורים קונצנטריים: פנימי (r=a) מטען +2Q, חיצוני מוליך (r=b) מטען -Q. מה E עבור r > b?',
    options: ['E = k·3Q/r²', 'E = k·2Q/r²', 'E = kQ/r²', 'E = 0'],
    correct: 2,
    explanation: 'Q_enc = +2Q + (-Q) = +Q. E = kQ/r².',
  },
]

// ── QUIZ QUESTIONS (real HIT exams) ──────────────────────────────────────────
const quiz: QuizQuestion[] = [
  {
    question: 'כדור מוליך בעל מטען Q ורדיוס R. מה עוצמת השדה החשמלי בנקודה פנימית (r < R)?',
    options: ['E = kQ/r²', 'E = kQ/R²', 'E = 0', 'E = kQ/(R-r)²'],
    correct: 2,
    explanation: 'בפנים מוליך בשיווי משקל אין שדה חשמלי. כל מטען פנוי נמצא על פני השטח.',
  },
  {
    question: 'מה השטף החשמלי דרך כדור גאוס ברדיוס r > R סביב מטען Q?',
    options: ['Φ = Q·ε₀', 'Φ = Q/ε₀', 'Φ = 4πr²E', 'Φ = kQ/r'],
    correct: 1,
    explanation: 'חוק גאוס: Φ = Q_enc/ε₀. השטף תלוי רק במטען הכלוא, לא בצורת המשטח.',
  },
  {
    question: 'שני כדורים קונצנטריים: פנימי +3Q, חיצוני (מוליך) ללא מטען. מה E מחוץ לכדור החיצוני?',
    options: ['E = 3kQ/r²', 'E = kQ/r²', 'E = 0', 'תלוי בחומר'],
    correct: 0,
    explanation: 'Q_enc = +3Q (המוליך מתגרד — מטען שרידי = 0 ← Q_enc כולל = 3Q). E = k·3Q/r².',
  },
]

// ── GREEN NOTE ────────────────────────────────────────────────────────────────
const greenNote = [
  'בחר משטח גאוס עם הסימטריה של הבעיה (כדור → כדור גאוס, חוט → גליל, מישור → קופסה)',
  'חשב Q_enc — מה המטען הכלוא בתוך המשטח?',
  'פתח את חוק גאוס: E · 4πr² = Q_enc/ε₀ → E = kQ/r²',
  'בדוק גבולות: בפנים מוליך E=0, בחוץ — כאילו כל המטען במרכז',
]

// ── GUIDES ────────────────────────────────────────────────────────────────────
const guides: GuideSection[] = [
  {
    title: 'נוסחאות',
    content: (
      <div className="space-y-4 text-sm">
        <div>
          <p className="text-emerald-400 font-bold mb-2">חוק גאוס</p>
          <BlockMath tex="\oint \vec{E} \cdot d\vec{A} = \dfrac{Q_{\text{enc}}}{\varepsilon_0}" />
        </div>
        <div>
          <p className="text-emerald-400 font-bold mb-2">משטחי גאוס נפוצים</p>
          <ul className="space-y-1 text-slate-300">
            <li><span className="text-yellow-400">כדור:</span> E · 4πr² = Q/ε₀</li>
            <li><span className="text-yellow-400">גליל (חוט):</span> E · 2πrL = Q/ε₀</li>
            <li><span className="text-yellow-400">מישור:</span> 2E · A = σA/ε₀</li>
          </ul>
        </div>
        <div>
          <p className="text-emerald-400 font-bold mb-2">קבועים</p>
          <ul className="space-y-1 text-slate-300 font-mono text-xs" dir="ltr">
            <li>k = 9×10⁹ N·m²/C²</li>
            <li>ε₀ = 8.85×10⁻¹² C²/(N·m²)</li>
            <li>k = 1/(4πε₀)</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: 'טיפים למבחן',
    content: (
      <div className="space-y-3 text-sm text-slate-300">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
          <p className="text-yellow-400 font-bold text-xs mb-1">⚠️ שגיאה נפוצה</p>
          <p>בפנים מוליך E=0 תמיד — גם אם יש מטען על פני השטח!</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          <p className="text-emerald-400 font-bold text-xs mb-1">✓ טריק מבחן</p>
          <p>לפני הכל — שאל: מה Q_enc? אם 0, אז E=0 ללא חישוב.</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
          <p className="text-blue-400 font-bold text-xs mb-1">🎯 בדוק יחידות</p>
          <p>E [N/C = V/m] · Area [m²] = Flux [N·m²/C]</p>
        </div>
      </div>
    ),
  },
]

// ── INTRO ─────────────────────────────────────────────────────────────────────
const intro = (
  <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
    <p>
      דמיין שאתה עומד ליד כדור ענק טעון. אתה מרגיש כוח דוחף אותך — זה{' '}
      <span className="text-emerald-400 font-semibold">השדה החשמלי</span>.
    </p>
    <p>
      אבל חישוב השדה מעל מיליארדי חלקיקים טעונים ישירות דרך חוק קולון זה בלוגן.
      פיזיקאי בשם גאוס מצא דרך הרבה יותר חכמה:
    </p>
    <div className="bg-white/5 rounded-xl p-4 border-r-2 border-emerald-500">
      <BlockMath tex="\oint \vec{E} \cdot d\vec{A} = \dfrac{Q_{\text{enc}}}{\varepsilon_0}" />
      <p className="text-center text-xs text-slate-500 mt-2">
        "השטף" (כמות השדה שעוברת דרך משטח) = מטען פנימי ÷ קבוע
      </p>
    </div>
    <p>
      במבחן HIT — חוק גאוס מופיע <span className="text-yellow-400 font-semibold">בכל מבחן</span>,
      לרוב עם כדורים קונצנטריים. נלמד את השיטה פעם אחת ותוכל לפתור כל בעיה כזו.
    </p>
  </div>
)

// ── THEORY ────────────────────────────────────────────────────────────────────
const theory: TheoryCard = {
  summary: 'חוק גאוס מקשר בין השטף החשמלי דרך משטח סגור לבין המטען הכלוא בתוכו. הוא שקול לחוק קולון אך עוצמתי הרבה יותר לבעיות עם סימטריה.',
  formulas: [
    { label: 'חוק גאוס', tex: '\\oint \\vec{E} \\cdot d\\vec{A} = \\dfrac{Q_{\\text{enc}}}{\\varepsilon_0}' },
    { label: 'שדה של מטען נקודתי (או כדור מחוץ)', tex: 'E = \\dfrac{kQ}{r^2} = \\dfrac{Q}{4\\pi\\varepsilon_0 r^2}' },
  ],
  when: 'השתמש בחוק גאוס כשיש סימטריה: כדורית (כדורים), גלילית (חוטים ישרים), מישורית (לוחות אינסופיים).',
}

// ── EXPORT ────────────────────────────────────────────────────────────────────
export default function ElectricField({ onBack }: { onBack: () => void }) {
  return (
    <GenericLearningModule
      moduleId="physics2-efield"
      title="שדה חשמלי וחוק גאוס"
      subtitle="כדורים, גלילים, ומישורים — שיטה אחת לכולם"
      intro={intro}
      step1={<Step1 />}
      step2={<Step2 />}
      step3={<Step3 />}
      SimulatorComponent={ElectricFieldSim}
      theory={theory}
      practiceQuestions={practice}
      quizQuestions={quiz}
      greenNote={greenNote}
      guides={guides}
      onBack={onBack}
    />
  )
}
