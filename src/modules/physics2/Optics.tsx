import React, { useState } from 'react'
import GenericLearningModule, { QuizQuestion, GuideSection, TheoryCard } from '../../components/GenericLearningModule'
import { BlockMath, InlineMath } from '../../components/Math'

function OpticsSim({ currentStep }: { currentStep: number }) {
  const [d, setD] = useState(20)       // μm, slit separation
  const [lambda, setLambda] = useState(550) // nm, wavelength
  const [D, setD2] = useState(1)       // m, screen distance

  const lambdaM = lambda * 1e-9
  const dM = d * 1e-6
  const deltaY = (lambdaM * D) / dM * 100 // cm, fringe spacing

  // Color from wavelength
  const getColor = (nm: number) => {
    if (nm < 430) return '#8b5cf6'
    if (nm < 480) return '#3b82f6'
    if (nm < 510) return '#06b6d4'
    if (nm < 570) return '#22c55e'
    if (nm < 600) return '#eab308'
    if (nm < 640) return '#f97316'
    return '#ef4444'
  }
  const color = getColor(lambda)

  const W = 220
  const maxOrder = 4
  const fringes: { x: number; bright: boolean }[] = []
  for (let m = -maxOrder; m <= maxOrder; m++) {
    const yPos = (m * lambdaM * D) / dM
    const xScreen = W / 2 + yPos * 800 // scale
    if (xScreen > 0 && xScreen < W) {
      fringes.push({ x: xScreen, bright: true })
    }
    // Dark fringes
    const yDark = ((m + 0.5) * lambdaM * D) / dM
    const xDark = W / 2 + yDark * 800
    if (xDark > 0 && xDark < W) {
      fringes.push({ x: xDark, bright: false })
    }
  }

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Double slit diagram */}
      <svg viewBox={`0 0 ${W} 130`} width="220" height="130">
        {/* Light source */}
        <circle cx="20" cy="65" r="8" fill={color} opacity="0.9" />
        <text x="20" y="90" textAnchor="middle" fill={color} fontSize="8">{lambda}nm</text>

        {/* Incoming rays */}
        {[-15, -5, 5, 15].map((dy, i) => (
          <line key={i} x1="28" y1={65 + dy} x2="75" y2={65 + dy}
            stroke={color} strokeWidth="0.8" opacity="0.5" />
        ))}

        {/* Double slit barrier */}
        <rect x="80" y="0" width="6" height="55" fill="#334155" />
        <rect x="80" y="75" width="6" height="55" fill="#334155" />
        {/* Slit gap label */}
        <line x1="88" y1="55" x2="88" y2="75" stroke="#64748b" strokeWidth="0.5" strokeDasharray="2,1" />
        <text x="95" y="66" fill="#64748b" fontSize="7">d={d}μm</text>

        {/* Diffracted rays */}
        {[55, 65, 75].map((y1, i) =>
          [20, 65, 110].map((y2, j) => (
            <line key={`${i}-${j}`} x1="86" y1={y1} x2="155" y2={y2}
              stroke={color} strokeWidth="0.5" opacity="0.2" />
          ))
        )}

        {/* Screen */}
        <line x1="160" y1="0" x2="160" y2="130" stroke="#475569" strokeWidth="2" />

        {/* Interference pattern on screen */}
        {Array.from({ length: 130 }, (_, py) => {
          const y = (py - 65) / 800
          const path_diff = dM * y / D
          const phase = (2 * Math.PI * path_diff) / lambdaM
          const intensity = Math.cos(phase / 2) ** 2
          return (
            <rect key={py} x="162" y={py} width="12" height="1"
              fill={color} opacity={intensity * 0.9} />
          )
        })}

        <text x="168" y="8" fill="#64748b" fontSize="7">מסך</text>
      </svg>

      {/* Fringe spacing display */}
      <div className="bg-white/10 rounded-xl p-2 text-center w-full mx-3">
        <p className="text-xs text-slate-400" dir="ltr">Δy = λD/d</p>
        <p className="font-bold" style={{ color }}>{deltaY.toFixed(2)} cm</p>
        <p className="text-xs text-slate-500">מרחק בין פסים</p>
      </div>

      {/* Controls */}
      <div className="w-full space-y-2 px-3">
        {[
          { label: 'מרחק סדקים d (μm)', val: d, set: setD, min: 5, max: 100, step: 5, color: 'white' },
          { label: 'אורך גל λ (nm)', val: lambda, set: setLambda, min: 400, max: 700, step: 10, color },
          { label: 'מרחק מסך D (m)', val: D, set: setD2, min: 0.5, max: 3, step: 0.1, color: 'gray' },
        ].map((c, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs text-slate-400 mb-0.5">
              <span>{c.label}</span>
              <span className="font-bold" style={{ color: c.color === 'white' ? '#e2e8f0' : c.color === 'gray' ? '#94a3b8' : c.color }}>
                {c.val}
              </span>
            </div>
            <input type="range" min={c.min} max={c.max} step={c.step} value={c.val}
              onChange={e => c.set(+e.target.value)}
              className="w-full h-1.5 rounded-full" />
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
        ניסוי Young: שני סדקים רחוקים{' '}
        <span className="font-mono text-purple-300">d = 0.2 mm</span> זה מזה.
        מסך במרחק <span className="font-mono text-purple-300">D = 2 m</span>.
        מרחק בין פסים בהירים — <span className="font-mono text-purple-300">Δy = 5 mm</span>.
        מצא את אורך הגל.
      </div>
      <p className="text-slate-400 text-sm">תנאי לפס בהיר (חיזוק)?</p>
      {[
        { l: 'd·sin(θ) = mλ', c: true },
        { l: 'd·sin(θ) = (m+½)λ', c: false },
        { l: 'Δy = mD/d', c: false },
        { l: 'd·cos(θ) = mλ', c: false },
      ].map((opt, i) => (
        <button key={i} disabled={selected !== null} onClick={() => setSelected(i)}
          className={`w-full text-right p-3 rounded-xl text-sm transition-all border ${
            selected === null ? 'bg-white/10 hover:bg-white/20 text-white border-white/10'
            : opt.c ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            : selected === i ? 'bg-red-500/20 text-red-300 border-red-500/40'
            : 'bg-white/5 text-slate-600 border-transparent'}`}>
          <span className="font-mono">{opt.l}</span>
        </button>
      ))}
      {selected !== null && (
        <div className={`rounded-xl p-3 text-sm ${selected === 0 ? 'bg-emerald-900/30 text-emerald-300' : 'bg-amber-900/30 text-amber-300'}`}>
          {selected === 0
            ? '✓ נכון! d·sin(θ)=mλ היא תנאי לחיזוק. לזוויות קטנות: sin(θ)≈tan(θ)=y/D → Δy=λD/d.'
            : selected === 1
            ? 'זה תנאי לכיחוד (פס כהה), לא חיזוק!'
            : 'לא מדויק — הנוסחה לא נכונה ממש.'}
        </div>
      )}
    </div>
  )
}

function Step2() {
  const [revealed, setRevealed] = useState(0)
  const steps = [
    { title: 'תנאי חיזוק וכיחוד', content: <span>
      <span className="text-yellow-300 font-semibold">חיזוק (פס בהיר):</span>
      <BlockMath tex="d\sin\theta = m\lambda,\quad m=0,\pm1,\pm2,\ldots" />
      <span className="text-red-300 font-semibold">כיחוד (פס כהה):</span>
      <BlockMath tex="d\sin\theta = \left(m+\tfrac{1}{2}\right)\lambda" />
    </span> },
    { title: 'מרחק בין פסים', content: <span>
      לזוויות קטנות (<InlineMath tex="\sin\theta \approx \tan\theta = y/D" />):
      <BlockMath tex="\Delta y = \dfrac{\lambda D}{d}" />
      <span className="text-xs text-slate-400">כשλ גדל או D גדל — הפסים מתרחקים. כשd גדל — הפסים מתקרבים.</span>
    </span> },
    { title: 'שני אורכי גל', content: <span>
      שני צבעים עוברים → שתי מערכות פסים מוטלות.
      הפסים חופפים כש:
      <BlockMath tex="m_1\lambda_1 = m_2\lambda_2" />
      <span className="text-xs text-slate-400">מבחן HIT 2023: λ₁=600nm, λ₂=500nm → פס 5 של 500nm חופף עם פס 4 של 600nm!</span>
    </span> },
  ]
  return (
    <div className="space-y-4">
      <p className="text-white font-bold">אינטרפרנציה — ניסוי Young:</p>
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
        <p className="text-blue-300 text-xs font-bold mb-2">📄 מבחן HIT — 2023 (אינטרפרנציה כפולה)</p>
        <p className="text-white text-sm leading-relaxed">
          שני אורכי גל עוברים דרך אותם שני סדקים:{' '}
          <span className="font-mono text-blue-300">λ₁ = 600 nm</span> (אדום),{' '}
          <span className="font-mono text-blue-300">λ₂ = 500 nm</span> (ירוק).
          מרחק בין הסדקים <span className="font-mono text-blue-300">d = 20 μm</span>,
          מסך ב-<span className="font-mono text-blue-300">D = 2 m</span>.
          <br /><br />
          <strong>(א)</strong> מה מרחק הפסים עבור כל צבע?<br />
          <strong>(ב)</strong> באיזה סדר m₁, m₂ הפסים חופפים לראשונה?
        </p>
      </div>
      <button onClick={() => setShowSol(v => !v)}
        className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-2.5 rounded-xl text-sm font-medium transition-all">
        {showSol ? '▲ הסתר פתרון' : '▼ הצג פתרון'}
      </button>
      {showSol && (
        <div className="space-y-2 text-sm">
          {[
            { q: 'א — מרחק פסים:', a: 'Δy₁ = λ₁D/d = 600e-9×2/(20e-6) = 0.06 m = 6 cm\nΔy₂ = λ₂D/d = 500e-9×2/(20e-6) = 0.05 m = 5 cm' },
            { q: 'ב — חפיפה ראשונה:', a: 'm₁·λ₁ = m₂·λ₂\nm₁·600 = m₂·500\nm₁/m₂ = 5/6\n→ m₁=5, m₂=6 (הפס ה-5 של אדום = פס ה-6 של ירוק)\nמיקום: y = 5×6cm = 30 cm מהמרכז' },
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
    question: 'ניסוי יאנג: d = 0.2 mm, L = 1.5 m, λ = 600 nm. מה מרחק הפסים Δy?',
    options: ['Δy = 4.5 mm', 'Δy = 2.25 mm', 'Δy = 0.9 mm', 'Δy = 9 mm'],
    correct: 0,
    explanation: 'Δy = λL/d = 600×10⁻⁹ × 1.5 / (0.2×10⁻³) = 4.5×10⁻³ m = 4.5 mm.',
  },
  {
    question: 'סרט דק (עובי t = 400 nm, n = 1.5) — עבור איזה λ (באוויר) תתרחש הגברה?',
    options: ['λ = 600 nm', 'λ = 400 nm', 'λ = 1200 nm', 'λ = 300 nm'],
    correct: 0,
    explanation: '2nt = mλ. עבור m=2: λ = 2×1.5×400/2 = 600 nm (אור כתום-אדום).',
  },
  {
    question: 'רשת עקיפה: d = 2 μm, λ = 500 nm. מה זווית הסדר הראשון?',
    options: ['θ ≈ 14.5°', 'θ ≈ 30°', 'θ ≈ 7°', 'θ ≈ 45°'],
    correct: 0,
    explanation: 'sinθ = mλ/d = 1×500×10⁻⁹/(2×10⁻⁶) = 0.25. θ = arcsin(0.25) ≈ 14.5°.',
  },
  {
    question: 'עקיפה ממסך בעל פתח יחיד: רוחב a = 0.1 mm, λ = 500 nm, L = 2 m. רוחב מינימום ראשון?',
    options: ['y = 10 mm', 'y = 5 mm', 'y = 20 mm', 'y = 2.5 mm'],
    correct: 0,
    explanation: 'sinθ = λ/a → θ ≈ λ/a = 0.005 rad. y = Lθ = 2×0.005 = 0.01 m = 10 mm.',
  },
]

const quiz: QuizQuestion[] = [
  {
    question: 'ניסוי Young: d=0.1mm, λ=500nm, D=1m. מה מרחק הפסים?',
    options: ['0.5 mm', '5 mm', '0.05 mm', '50 mm'],
    correct: 1,
    explanation: 'Δy = λD/d = 500×10⁻⁹ × 1 / (0.1×10⁻³) = 5×10⁻³ m = 5 mm',
  },
  {
    question: 'מה תנאי הכיחוד (פס כהה) בניסוי Young?',
    options: ['d·sinθ = mλ', 'd·sinθ = (m+½)λ', 'Δy = λD/d', 'd·cosθ = mλ'],
    correct: 1,
    explanation: 'כיחוד = הפרש מסילות חצי אורך גל → d·sinθ = (m+½)λ',
  },
  {
    question: 'מה קורה לפסי ה-Young אם מכפילים את מרחק המסך D פי 2?',
    options: ['הפסים מתקרבים פי 2', 'הפסים מתרחקים פי 2', 'אין שינוי', 'הפסים נעלמים'],
    correct: 1,
    explanation: 'Δy = λD/d — Δy פרופורציונלי ל-D. כפילים D → כפולים Δy.',
  },
]

const greenNote = [
  'חיזוק (פס בהיר): d·sinθ = mλ (m=0,±1,...). לזוויות קטנות: Δy = λD/d',
  'כיחוד (פס כהה): d·sinθ = (m+½)λ',
  'שני צבעים חופפים כש: m₁λ₁ = m₂λ₂ — חפש יחס שלם פשוט',
  'עקיפה מסדק יחיד: מינימום ב- a·sinθ = mλ (a = רוחב הסדק)',
]

const guides: GuideSection[] = [
  {
    title: 'נוסחאות',
    content: (
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-purple-400 font-bold mb-1">Young כפול-סדק</p>
          <ul className="space-y-0.5 text-slate-300 font-mono text-xs" dir="ltr">
            <li>חיזוק: d·sinθ = mλ</li>
            <li>כיחוד: d·sinθ = (m+½)λ</li>
            <li>Δy = λD/d</li>
          </ul>
        </div>
        <div>
          <p className="text-purple-400 font-bold mb-1">עקיפה מסדק יחיד</p>
          <ul className="space-y-0.5 text-slate-300 font-mono text-xs" dir="ltr">
            <li>מינימום: a·sinθ = mλ (m≠0)</li>
            <li>רוחב מרכזי: 2λD/a</li>
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
          <p className="text-yellow-400 font-bold text-xs mb-1">⚠️ טעות נפוצה</p>
          <p>לא לבלבל בין אינטרפרנציה (שני מקורות) לעקיפה (סדק יחיד)!</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          <p className="text-emerald-400 font-bold text-xs mb-1">✓ שני צבעים</p>
          <p>חפיפה: m₁λ₁=m₂λ₂ → m₁/m₂ = λ₂/λ₁ → מצא יחס שלם קטן ביותר.</p>
        </div>
      </div>
    ),
  },
]

const intro = (
  <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
    <p>
      Young הוכיח ב-1801 ש<span className="text-purple-400 font-semibold">אור הוא גל</span> —
      על ידי כך שהראה שני קרני אור יכולות לבטל זו את זו (כיחוד) או לחזק (חיזוק).
    </p>
    <div className="bg-white/5 rounded-xl p-4 border-r-2 border-purple-500">
      <BlockMath tex="\Delta y = \dfrac{\lambda D}{d}" />
      <p className="text-center text-xs text-slate-500 mt-1">מרחק בין פסים = אורך גל × מרחק מסך ÷ מרחק סדקים</p>
    </div>
    <p>
      מבחן HIT 2023 שאל על <span className="text-yellow-400 font-semibold">שני צבעים</span> דרך אותם סדקים — טריק: מתי הפסים חופפים?
    </p>
  </div>
)

const theory: TheoryCard = {
  summary: 'אור הוא גל — ולכן גלים ממקורות שונים יכולים לחזק או לבטל זה את זה. הגברה קורה כשהגלים "בפאזה" (הפרש מסלולים = mλ). ביטול — כשהם "הפוכים" (הפרש = (m+½)λ).',
  formulas: [
    { label: 'ניסוי יאנג — מרחק פרינג\'ה', tex: '\\Delta y = \\dfrac{\\lambda L}{d}' },
    { label: 'מקסימום בגריד עקיפה', tex: 'd \\sin\\theta = m\\lambda' },
    { label: 'הגברה בסרט דק', tex: '2nt = m\\lambda \\quad (m = 1,2,3,\\ldots)' },
  ],
  when: 'שני סדקים (יאנג): השתמש ב-Δy. גריד עקיפה: השתמש ב-d·sinθ = mλ. סרט דק: עקוב אחרי ההפרש במסלול בתוך הסרט.',
}

export default function Optics({ onBack }: { onBack: () => void }) {
  return (
    <GenericLearningModule
      moduleId="physics2-optics"
      title="אינטרפרנציה ועקיפה"
      subtitle="ניסוי Young — שני סדקים, שני צבעים"
      intro={intro}
      step1={<Step1 />}
      step2={<Step2 />}
      step3={<Step3 />}
      SimulatorComponent={OpticsSim}
      theory={theory}
      practiceQuestions={practice}
      quizQuestions={quiz}
      greenNote={greenNote}
      guides={guides}
      onBack={onBack}
    />
  )
}
