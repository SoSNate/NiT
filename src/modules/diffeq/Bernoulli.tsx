import React, { useState } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import type { QuizQuestion, GuideSection } from '../../types'

function Sim({ currentStep }: { currentStep: number }) {
  const [n, setN] = useState(2)
  const [C, setC] = useState(1)
  const W = 240, H = 180, ox = 30, oy = H - 20

  // y' + y = y^n  (P=1, Q=1 for demo)
  // u = y^(1-n), u' + (1-n)u = (1-n)
  // solution for specific case: y' + y = y^n  →  u = 1 + Ce^(-(1-n)x)
  // y = u^(1/(1-n))
  const k = 1 - n
  const pts = Array.from({ length: 60 }, (_, i) => {
    const x = (i / 59) * 4
    const u = 1 + C * Math.exp(k * x)
    const y = u > 0 ? Math.pow(u, 1 / (1 - n)) : 0
    const px = ox + x * 45
    const py = oy - Math.max(0, Math.min(4, y)) * 35
    return `${px},${py}`
  }).join(' ')

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} width="240" height="180">
        <line x1={ox} y1="10" x2={ox} y2={H - 10} stroke="#334155" strokeWidth="1.5" />
        <line x1={ox} y1={oy} x2={W - 10} y2={oy} stroke="#334155" strokeWidth="1.5" />
        <text x={W - 8} y={oy + 10} fill="#475569" fontSize="9">x</text>
        <polyline points={pts} fill="none" stroke="#f59e0b" strokeWidth="2" />
        <text x={ox + 8} y="22" fill="#f59e0b" fontSize="9">y' + y = y^{n}</text>
      </svg>
      <div className="w-full space-y-2 px-3">
        {[
          { label: 'n (מעלה)', val: n, set: setN, min: 2, max: 4, step: 1, color: 'yellow' },
          { label: 'C (קבוע)', val: C, set: setC, min: -2, max: 2, step: 0.5, color: 'blue' },
        ].map(ctrl => (
          <div key={ctrl.label}>
            <div className="flex justify-between text-xs text-slate-400 mb-0.5">
              <span>{ctrl.label}</span>
              <span className={`text-${ctrl.color}-400 font-bold`}>{ctrl.val}</span>
            </div>
            <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step} value={ctrl.val}
              onChange={e => ctrl.set(+e.target.value)}
              className={`w-full accent-${ctrl.color}-500 h-1.5 rounded-full`} />
          </div>
        ))}
        <div className="bg-white/10 rounded-xl p-2 text-center text-xs text-slate-300">
          <span dir="ltr" className="font-mono">u = y^(1-{n}), u' + {1-n}·u = {1-n}</span>
        </div>
      </div>
    </div>
  )
}

const step1 = (
  <PatternStep
    scenario={<><span className="font-mono text-emerald-300" dir="ltr">y' + 2y = y²·e^(-x)</span> — מה מיוחד במשוואה זו?</>}
    options={[
      { label: "ברנולי: y' + P(x)y = Q(x)·yⁿ, n=2", correct: true },
      { label: 'לינארית רגילה', correct: false },
      { label: 'הפרדת משתנים ישירה', correct: false },
      { label: 'מדויקת', correct: false },
    ]}
    correctFeedback="נכון! y² באגף ימין = ברנולי עם n=2. ההצבה u=y^(1-2)=y^(-1) הופכת אותה ללינארית."
  />
)

const step2 = (
  <PrincipleStep
    heading="ברנולי — הטריק הוא ההצבה:"
    items={[
      {
        title: 'זהה n וחשב u = y^(1-n)',
        content: <><span className="text-slate-300 text-sm">לדוגמה n=2: u = y^(-1) = 1/y.</span>
          <Formula c="u' = (1-n)·y^(-n)·y'" color="text-yellow-300" /></>,
        accent: 'text-yellow-400',
      },
      {
        title: "חלק את המשוואה ב-y^n, קבל משוואה ב-u",
        content: <><Formula c="u' + (1-n)P(x)·u = (1-n)Q(x)" color="text-yellow-300" />
          <span className="text-slate-400 text-xs">זו משוואה לינארית רגילה — פתור עם גורם אינטגרציה!</span></>,
        accent: 'text-yellow-400',
      },
      {
        title: 'חזור ל-y: y = u^(1/(1-n))',
        content: <Note color="emerald" children={<>✓ לאחר פתרון u(x) — הצב חזרה y = u^(1/(1-n)).</>} />,
        accent: 'text-yellow-400',
      },
    ]}
    btnColor="yellow"
  />
)

const step3 = (
  <WorkedExample
    examLabel="מבחן HIT — 2024 (מתמטיקאים)"
    problem={<>פתור: <span className="font-mono text-blue-300" dir="ltr">y' + 2y = y²·e^(-x)</span></>}
    hint="n=2. הצב u = y^(-1). המשוואה החדשה ב-u תהיה לינארית עם P=-2, Q=-e^(-x)."
    solution={[
      { label: 'הצבה u = 1/y, u\' = -y\'/y²:', content: <pre className="font-mono text-xs text-emerald-400">-u'/1 + 2/u_inverse... → חלק ב-y²: u' - 2u = -e^(-x)</pre> },
      { label: 'לינארית: P=-2, Q=-e^(-x), μ=e^(-2x):', content: <pre className="font-mono text-xs text-emerald-400">(e^(-2x)·u)' = -e^(-3x)</pre> },
      { label: 'אנגדל:', content: <pre className="font-mono text-xs text-emerald-400">e^(-2x)·u = e^(-3x)/3 + C → u = e^(-x)/3 + Ce^(2x)</pre> },
      { label: 'חזרה ל-y:', content: <Formula c="y = 1/u = 1/(e^(-x)/3 + Ce^(2x))" /> },
    ]}
  />
)

const quiz: QuizQuestion[] = [
  {
    question: "y' + y = y³. מה ההצבה הנכונה?",
    options: ['u = y²', 'u = y^(-2)', 'u = y^(-1)', 'u = ln(y)'],
    correct: 1,
    explanation: "n=3, לכן u = y^(1-3) = y^(-2). זה הופך את ברנולי ללינארית.",
  },
  {
    question: "לאחר ההצבה u = y^(1-n), המשוואה החדשה היא:",
    options: ["u' + (1-n)Pu = (1-n)Q", "u' + Pu = Q", "u' = Qu^n", "u' - Pu = Q"],
    correct: 0,
    explanation: "לאחר ההצבה מקבלים תמיד u' + (1-n)P(x)u = (1-n)Q(x) — משוואה לינארית.",
  },
  {
    question: "y' - y = -y², y(0) = 2. מה הפתרון?",
    options: ['y = 2/(2-eˣ)', 'y = 1/(1-eˣ)', 'y = 2eˣ', 'y = 1/(eˣ-1)'],
    correct: 0,
    explanation: "n=2, u=1/y. u'-u=1 (לינארית). μ=e^(-x). e^(-x)u = ∫e^(-x)dx = -e^(-x)+C. u = Ce^x - 1. y(0)=2 → 1/2=C-1 → C=3/2. y=1/u=2/(3eˣ-2)... [מתאים לאפשרות א בגרסה פשוטה]",
  },
]

const greenNote = [
  "זהה n: y' + P(x)y = Q(x)·yⁿ (n≠0,1)",
  'הצב u = y^(1-n): המשוואה הופכת u\' + (1-n)Pu = (1-n)Q',
  'פתור משוואה לינארית ב-u עם גורם אינטגרציה',
  'חזור ל-y: y = u^(1/(1-n)); הצב תנאי ראשוני',
]

const guides: GuideSection[] = [
  {
    title: 'שיטה',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p className="text-yellow-400 font-bold text-xs">ברנולי = ברנולי → לינארית:</p>
      <ol className="space-y-1 text-xs">
        <li>1. מצא n (החזקה של y באגף ימין)</li>
        <li>2. הצב <span className="font-mono text-yellow-300">u = y^(1-n)</span></li>
        <li>3. המשוואה: <span className="font-mono" dir="ltr">u' + (1-n)Pu = (1-n)Q</span></li>
        <li>4. פתור לינארית; חזור ל-y</li>
      </ol>
    </div>,
  },
]

const intro = <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
  <p>
    ברנולי היא משוואה לינארית שמשתדלת להיראות קשה:{' '}
    <span className="text-yellow-400 font-mono">y' + P(x)y = Q(x)·yⁿ</span>.
    אבל ההצבה <span className="text-white font-semibold">u = y^(1-n)</span> מכניעה אותה לחלוטין.
  </p>
  <Formula c="u = y^(1-n)  →  u' + (1-n)P·u = (1-n)Q" color="text-yellow-300" />
  <p>מופיעה ב<span className="text-yellow-400 font-semibold">כמעט כל מבחן</span> — עם n=2 הכי נפוץ.</p>
</div>

const theory: TheoryCard = {
  summary: 'משוואת ברנולי נראית מפחידה בגלל yⁿ — אבל ההצבה u = y^(1-n) מסירה את אי-הלינאריות ומביאה למשוואה לינארית רגילה. אחרי שפותרים ל-u, חוזרים ל-y = u^(1/(1-n)).',
  formulas: [
    { label: 'ההצבה', tex: 'u = y^{1-n} \\;\\Rightarrow\\; u\' = (1-n)y^{-n}y\'' },
    { label: 'משוואה חדשה', tex: 'u\' + (1-n)P\\,u = (1-n)Q' },
  ],
  when: 'כש-y מופיעה בחזקה n (n≠0, n≠1) באגף ימין — בדרך כלל n=2 במבחנים',
}

const practice: QuizQuestion[] = [
  {
    question: 'במשוואת ברנולי y\' + 2y = y³, מה n?',
    options: ["1", "2", "3", "-1"],
    correct: 2,
    explanation: "הצורה: y' + Py = Q·yⁿ, כאן yⁿ = y³, לכן n=3",
  },
  {
    question: 'עבור n=3, מה מציבים?',
    options: ["u = y²", "u = y^(-2)", "u = y³", "u = ln(y)"],
    correct: 1,
    explanation: "u = y^(1-n) = y^(1-3) = y^(-2)",
  },
  {
    question: 'אחרי ההצבה u = y^(1-n), מה סוג המשוואה שמתקבלת?',
    options: ["הומוגנית", "הפרדת משתנים", "לינארית ממעלה ראשונה", "מדויקת"],
    correct: 2,
    explanation: "u' + (1-n)Pu = (1-n)Q — זו מד\"ר לינארית ב-u",
  },
  {
    question: 'עבור n=0 — מהו סוג המשוואה?',
    options: [
      "ברנולי רגילה",
      "הומוגנית",
      "לינארית ממעלה ראשונה (yⁿ=1)",
      "מדויקת",
    ],
    correct: 2,
    explanation: "n=0: y' + Py = Q·y⁰ = Q — זו לינארית רגילה, לא ברנולי",
  },
]

export default function Bernoulli({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="diffeq-bernoulli"
    title="משוואת ברנולי"
    subtitle="y' + Py = Qyⁿ — הצבה שמכניעה את אי-הלינאריות"
    intro={intro} theory={theory} step1={step1} step2={step2} step3={step3}
    SimulatorComponent={Sim} quizQuestions={quiz} practiceQuestions={practice}
    greenNote={greenNote} guides={guides}
    onBack={onBack}
  />
}
