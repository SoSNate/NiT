import React, { useState } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, M, Note } from '../../components/StepHelpers'
import type { QuizQuestion, GuideSection } from '../../types'

// ── SIMULATOR ────────────────────────────────────────────────────────────────
function Sim({ currentStep }: { currentStep: number }) {
  const [k, setK] = useState(1)
  const [x0, setX0] = useState(1) // initial condition y(0) = x0

  const W = 240, H = 180, cx = 30, cy = H / 2
  const scaleX = 35, scaleY = 30

  // dy/dx = ky  →  y = x0 * e^(k*x)
  const pts = Array.from({ length: 60 }, (_, i) => {
    const x = (i / 59) * 5
    const y = x0 * Math.exp(k * x)
    const px = cx + x * scaleX
    const py = cy - Math.min(y, 5) * scaleY
    return `${px},${py}`
  }).join(' ')

  // Slope field
  const field: React.ReactNode[] = []
  for (let xi = 0; xi <= 5; xi++) {
    for (let yi = -2; yi <= 2; yi++) {
      const slope = k * yi
      const len = 10
      const angle = Math.atan(slope)
      const px = cx + xi * scaleX
      const py = cy - yi * scaleY
      const dx = (len / 2) * Math.cos(angle)
      const dy = (len / 2) * Math.sin(angle)
      field.push(
        <line key={`${xi}-${yi}`}
          x1={px - dx} y1={py + dy} x2={px + dx} y2={py - dy}
          stroke="#475569" strokeWidth="1" opacity="0.7" />
      )
    }
  }

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} width="240" height="180">
        {/* Axes */}
        <line x1={cx} y1="10" x2={cx} y2={H - 10} stroke="#334155" strokeWidth="1.5" />
        <line x1={cx} y1={cy} x2={W - 10} y2={cy} stroke="#334155" strokeWidth="1.5" />
        <text x={W - 8} y={cy + 4} fill="#475569" fontSize="9">x</text>
        <text x={cx + 3} y="14" fill="#475569" fontSize="9">y</text>

        {/* Slope field */}
        {currentStep >= 2 && field}

        {/* Solution curve */}
        <polyline points={pts} fill="none" stroke="#10b981" strokeWidth="2" />

        {/* Labels */}
        <text x={cx + 8} y={cy - x0 * scaleY - 6} fill="#10b981" fontSize="9">
          y = {x0}·e^({k}x)
        </text>
      </svg>

      <div className="w-full space-y-2 px-3">
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-0.5">
            <span>k (קצב)</span>
            <span className="text-emerald-400 font-bold">{k}</span>
          </div>
          <input type="range" min="-2" max="2" step="0.1" value={k}
            onChange={e => setK(+e.target.value)}
            className="w-full accent-emerald-500 h-1.5 rounded-full" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-0.5">
            <span>y(0) = C</span>
            <span className="text-blue-400 font-bold">{x0}</span>
          </div>
          <input type="range" min="-3" max="3" step="0.5" value={x0}
            onChange={e => setX0(+e.target.value)}
            className="w-full accent-blue-500 h-1.5 rounded-full" />
        </div>
        <div className="bg-white/10 rounded-xl p-2 text-center text-xs">
          <span className="font-mono text-slate-300" dir="ltr">dy/dx = {k}y → y = {x0}·e^({k}x)</span>
        </div>
      </div>
    </div>
  )
}

// ── CONTENT ───────────────────────────────────────────────────────────────────
const step1 = (
  <PatternStep
    scenario={<>
      <span className="font-mono text-emerald-300" dir="ltr">dy/dx = xy²</span>
      {' '}— ממה לשים לב כדי לזהות שזו משוואה בת-הפרדת משתנים?
    </>}
    options={[
      { label: 'ניתן לכתוב dy/dx = f(x)·g(y)', correct: true, desc: 'x ו-y ניתנים להפרדה' },
      { label: 'המשוואה לינארית ב-y', correct: false, desc: 'y מופיע בחזקה ראשונה בלבד' },
      { label: 'קיים גורם אינטגרציה', correct: false, desc: 'שיטה למשוואות לא-מדויקות' },
      { label: 'ניתן להציב v = y/x', correct: false, desc: 'שיטת הומוגנית' },
    ]}
    correctFeedback="מדויק! dy/dx = xy² = x · y² — x וy נפרדים. זה הסימן לשיטת הפרדת משתנים."
  />
)

const step2 = (
  <PrincipleStep
    heading="הפרדת משתנים — האלגוריתם:"
    items={[
      {
        title: 'הפרד — כל y לצד אחד, כל x לצד שני',
        content: <><Formula c="dy/g(y) = f(x)dx" />
          <span className="text-slate-400 text-xs">לדוגמה: dy/y² = x·dx</span></>,
        accent: 'text-yellow-400',
      },
      {
        title: 'אינטגרל משני הצדדים',
        content: <><Formula c="∫ dy/g(y) = ∫ f(x)dx + C" />
          <span className="text-slate-400 text-xs">C — קבוע אינטגרציה (שים אחד בלבד!)</span></>,
        accent: 'text-yellow-400',
      },
      {
        title: 'בטא את y במפורש אם אפשר',
        content: <>
          <span className="text-slate-300">לעיתים נשאר עם פתרון מרומז F(y) = G(x)+C — זה בסדר גמור.</span>
          <Note color="amber" children={<span>⚠️ תנאי ראשוני: אם נתון y(x₀)=y₀, הצב לאחר האינטגרל כדי למצוא C.</span>} />
        </>,
        accent: 'text-yellow-400',
      },
    ]}
  />
)

const step3 = (
  <WorkedExample
    examLabel="מבחן HIT — 2022"
    problem={<>
      פתור: <span className="font-mono text-blue-300" dir="ltr">dy/dx = -2xy</span>, עם תנאי ראשוני <span className="font-mono text-blue-300">y(0) = 3</span>.
    </>}
    hint="הפרד: y לצד y, x לצד x. שים לב ל-e!"
    solution={[
      {
        label: 'הפרד משתנים:',
        thought: 'ראיתי dy/dx = -2xy — יש x בצד אחד ו-y בצד שני. זה אומר שאפשר להכפיל ולחלק כדי לשים כל משתנה בצד שלו.',
        content: <pre className="font-mono text-xs text-emerald-400 whitespace-pre">dy/y = -2x dx</pre>,
      },
      {
        label: 'אינטגרל:',
        thought: 'עכשיו יש לי dy/y בצד שמאל — ∫dy/y זה ln|y|. בצד ימין יש ∫-2x dx = -x². אני יודע את זה מאינפי 1.',
        content: <pre className="font-mono text-xs text-emerald-400 whitespace-pre">ln|y| = -x² + C₁  →  y = Ce^(-x²)</pre>,
      },
      {
        label: 'תנאי ראשוני y(0)=3:',
        thought: 'יש לי C לא ידוע. הנתון y(0)=3 נותן לי משוואה עם C — אציב ואפתור.',
        content: <pre className="font-mono text-xs text-emerald-400 whitespace-pre">3 = C·e⁰ = C  →  C = 3</pre>,
      },
      { label: 'פתרון סופי:', content: <Formula c="y = 3e^(-x²)" /> },
    ]}
  />
)

const quiz: QuizQuestion[] = [
  {
    question: 'איזו מהמשוואות הבאות ניתנת להפרדת משתנים?',
    options: ['dy/dx = x + y', "dy/dx = x·sin(y)", 'dy/dx = xy + 1', "y' + 2y = eˣ"],
    correct: 1,
    explanation: "dy/dx = x·sin(y) = f(x)·g(y) — ניתן להפרדה. האחרות: x+y לא מוכפלות; xy+1 לא מוכפלות; y'+2y=eˣ היא לינארית.",
  },
  {
    question: "פתור dy/dx = y²·eˣ. מהי הצורה הכללית?",
    options: ['-1/y = eˣ + C', 'y = eˣ + C', 'ln(y) = eˣ + C', 'y² = eˣ + C'],
    correct: 0,
    explanation: "∫dy/y² = ∫eˣdx → -1/y = eˣ + C. כלומר y = -1/(eˣ+C).",
  },
  {
    question: "y' = 2y, y(0) = 5. מהי y(1)?",
    options: ['5e', '5e²', '10e', '5·2'],
    correct: 1,
    explanation: "הפרד: dy/y = 2dx → ln|y| = 2x+C → y = Ae^(2x). y(0)=5 → A=5. y(1)=5e².",
  },
]

const greenNote = [
  'זהה: dy/dx = f(x)·g(y) — x ו-y ניתנים להפרדה',
  'הפרד: dy/g(y) = f(x)dx',
  'אינטגרל: ∫dy/g(y) = ∫f(x)dx + C — קבוע אחד בלבד!',
  'תנאי ראשוני: הצב y(x₀)=y₀ אחרי האינטגרל למציאת C',
]

const guides: GuideSection[] = [
  {
    title: 'אלגוריתם',
    content: <div className="space-y-2 text-sm">
      <p className="text-emerald-400 font-bold">4 צעדים:</p>
      <ol className="space-y-1 text-slate-300">
        <li><span className="text-emerald-400 font-bold">1.</span> כתוב dy/dx = f(x)·g(y)</li>
        <li><span className="text-emerald-400 font-bold">2.</span> הפרד: dy/g(y) = f(x)dx</li>
        <li><span className="text-emerald-400 font-bold">3.</span> אינטגרל + C</li>
        <li><span className="text-emerald-400 font-bold">4.</span> בטא y; הצב תנאי ראשוני</li>
      </ol>
    </div>,
  },
  {
    title: 'אינטגרלים נפוצים',
    content: <div className="space-y-1 text-xs font-mono text-slate-300" dir="ltr">
      <p>∫dy/y = ln|y|</p>
      <p>∫dy/y² = -1/y</p>
      <p>∫dy/(1+y²) = arctan(y)</p>
      <p>∫eˣdx = eˣ</p>
      <p>∫xⁿdx = xⁿ⁺¹/(n+1)</p>
      <p>∫cos(x)dx = sin(x)</p>
    </div>,
  },
  {
    title: 'טיפים',
    content: <div className="space-y-2 text-sm text-slate-300">
      <Note color="yellow" children={<>⚠️ קבוע אחד בלבד! אל תוסיף C משני הצדדים.</>} />
      <Note color="emerald" children={<>✓ פתרון מרומז F(y)=G(x)+C — תקין לחלוטין.</>} />
      <Note color="blue" children={<>🎯 בדוק: גזור את התשובה ובדוק שמקיים את המשוואה המקורית.</>} />
    </div>,
  },
]

const intro = <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
  <p>
    המשוואה הכי "נורמלית" שיש. אם אתה רואה שניתן לכתוב{' '}
    <span className="text-emerald-400 font-mono">dy/dx = f(x)·g(y)</span>{' '}
    — כל מה שצריך זה להעביר צדדים ולאנגדל.
  </p>
  <Formula c="dy/g(y) = f(x)dx  →  ∫...=∫...+C" />
  <p>
    זה מופיע כשאלת בסיס ב<span className="text-yellow-400 font-semibold">כל מבחן מד"ר</span>.
    עם תנאי ראשוני — מוצא C. בלי — פתרון כללי.
  </p>
</div>

const bridge = <div className="space-y-2">
  <p>זוכר מאינפי 1? <span className="text-emerald-400 font-semibold">∫f(x)dx = F(x) + C</span> — אינטגרציה רגילה.</p>
  <p>כאן עושים בדיוק אותו הדבר, רק שיש <span className="text-yellow-400 font-semibold">שני אינטגרלים</span> — אחד לx ואחד ל-y. כל צד מטופל בנפרד.</p>
  <p className="text-slate-400 text-xs">dy/y = -2x dx &nbsp;→&nbsp; ∫dy/y = ∫-2x dx &nbsp;→&nbsp; ln|y| = -x² + C</p>
</div>

const theory: TheoryCard = {
  summary: 'כשאפשר לכתוב dy/dx = f(x)·g(y), מעבירים את כל ה-y לצד שמאל ואת כל ה-x לצד ימין — ואז מאנגדלים כל צד בנפרד. זה נקרא "הפרדת משתנים" כי כל משתנה נמצא בצד שלו.',
  formulas: [
    { label: 'הפרדה', tex: '\\frac{dy}{g(y)} = f(x)\\,dx' },
    { label: 'אינטגרציה', tex: '\\int \\frac{dy}{g(y)} = \\int f(x)\\,dx + C' },
  ],
  when: 'כשניתן לבודד y מצד אחד ו-x מצד שני — לרוב כשיש מכפלה f(x)·g(y)',
}

const practice: QuizQuestion[] = [
  {
    question: 'איזו משוואה ניתן לפתור בהפרדת משתנים?',
    options: ["dy/dx = x·y", "dy/dx = x + y", "dy/dx = y + x²", "dy/dx = y/x + x"],
    correct: 0,
    explanation: "dy/dx = x·y = f(x)·g(y) — ניתן להפרדה. השאר אינם מכפלה נקייה.",
  },
  {
    question: 'בפתרון dy/dx = 3x²y, איזה אינטגרל פותחים בצד של y?',
    options: ["∫y dy", "∫dy/y", "∫3y dy", "∫y² dy"],
    correct: 1,
    explanation: "מעבירים: dy/y = 3x²dx → אינטגרל ∫dy/y = ln|y|",
  },
  {
    question: 'פתרו: dy/dx = 2x, y(0)=3. מהו y(1)?',
    options: ["4", "5", "6", "7"],
    correct: 1,
    explanation: "∫dy = ∫2x dx → y = x²+C. y(0)=3 → C=3. y(1)=1+3=4. (תשובה: 4)",
  },
  {
    question: 'מהי הצורה הכללית של פתרון dy/dx = ky?',
    options: ["y = kx + C", "y = Ce^(kx)", "y = k·ln(x) + C", "y = x^k"],
    correct: 1,
    explanation: "הפרדה: dy/y = k dx → ln|y| = kx+C₀ → y = Ce^(kx)",
  },
]

export default function Separable({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="diffeq-separable"
    title="הפרדת משתנים"
    subtitle="dy/dx = f(x)·g(y) — הפרד, אנגדל, פתור"
    intro={intro} bridge={bridge} theory={theory} step1={step1} step2={step2} step3={step3}
    SimulatorComponent={Sim} quizQuestions={quiz} practiceQuestions={practice}
    greenNote={greenNote} guides={guides}
    onBack={onBack}
  />
}
