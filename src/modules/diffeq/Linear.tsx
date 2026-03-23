import React, { useState } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import type { QuizQuestion, GuideSection } from '../../types'

function Sim({ currentStep }: { currentStep: number }) {
  const [P, setP] = useState(1)   // coefficient of y
  const [Q, setQ] = useState(2)   // right side constant
  const [C, setC] = useState(0)   // integration constant

  // y' + Py = Q  →  y = Q/P + C·e^(-Px)
  const W = 240, H = 180, ox = 30, oy = H / 2

  const equilibrium = P !== 0 ? Q / P : 0

  const pts = (c: number) => Array.from({ length: 80 }, (_, i) => {
    const x = (i / 79) * 5
    const y = equilibrium + c * Math.exp(-P * x)
    const px = ox + x * 35
    const py = oy - Math.max(-4, Math.min(4, y)) * 30
    return `${px},${py}`
  }).join(' ')

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} width="240" height="180">
        <line x1={ox} y1="10" x2={ox} y2={H - 10} stroke="#334155" strokeWidth="1.5" />
        <line x1={ox} y1={oy} x2={W - 10} y2={oy} stroke="#334155" strokeWidth="1.5" />

        {/* Equilibrium line */}
        {P !== 0 && <line x1={ox} y1={oy - equilibrium * 30} x2={W - 10} y2={oy - equilibrium * 30}
          stroke="#fbbf24" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />}

        {/* Family of solutions */}
        {[-2, -1, 0, 1, 2].map(c => (
          <polyline key={c} points={pts(c)} fill="none"
            stroke={c === C ? '#10b981' : '#334155'} strokeWidth={c === C ? 2.5 : 1} />
        ))}

        <text x={ox + 5} y={oy - equilibrium * 30 - 4} fill="#fbbf24" fontSize="8">
          y = {P !== 0 ? (Q / P).toFixed(1) : '∞'} (שיווי משקל)
        </text>
      </svg>

      <div className="w-full space-y-2 px-3">
        {[
          { label: 'P (מקדם y)', val: P, set: setP, min: -3, max: 3, step: 0.5, color: 'red' },
          { label: 'Q (אגף ימין)', val: Q, set: setQ, min: -4, max: 4, step: 0.5, color: 'blue' },
          { label: 'C (קבוע)', val: C, set: setC, min: -2, max: 2, step: 0.5, color: 'green' },
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
        <div className="bg-white/10 rounded-xl p-2 text-center text-xs font-mono text-slate-300" dir="ltr">
          y = {P !== 0 ? (Q / P).toFixed(1) : '?'} + {C}·e^(-{P}x)
        </div>
      </div>
    </div>
  )
}

const step1 = (
  <PatternStep
    scenario={<><span className="font-mono text-emerald-300" dir="ltr">y' + (2/x)y = x²</span> — איזה סוג?</>}
    options={[
      { label: 'לינארית ממעלה ראשונה', correct: true, desc: "y' + P(x)y = Q(x)" },
      { label: 'הפרדת משתנים', correct: false, desc: 'dy/dx = f(x)·g(y)' },
      { label: 'הומוגנית', correct: false, desc: 'F(y/x)' },
      { label: 'ברנולי', correct: false, desc: "y' + Py = Qyⁿ, n≠0,1" },
    ]}
    correctFeedback="נכון! הצורה y' + P(x)y = Q(x) היא הגדרת המשוואה הלינארית. P(x)=2/x, Q(x)=x²."
  />
)

const step2 = (
  <PrincipleStep
    heading="משוואה לינארית — שיטת גורם האינטגרציה:"
    items={[
      {
        title: 'חשב גורם אינטגרציה μ(x)',
        content: <><Formula c="μ(x) = e^(∫P(x)dx)" />
          <span className="text-slate-400 text-xs">אל תוסיף C בשלב זה!</span></>,
        accent: 'text-blue-400',
      },
      {
        title: 'הכפל את שני האגפים ב-μ',
        content: <><Formula c="(μy)' = μ·Q(x)" />
          <span className="text-slate-400 text-xs">האגף השמאלי מתכווץ תמיד לנגזרת מכפלה.</span></>,
        accent: 'text-blue-400',
      },
      {
        title: 'אנגדל ובטא y',
        content: <><Formula c="μy = ∫μ·Q(x)dx + C  →  y = (∫μQ dx + C) / μ" /></>,
        accent: 'text-blue-400',
      },
    ]}
    btnColor="blue"
  />
)

const step3 = (
  <WorkedExample
    examLabel="מבחן HIT — 2025"
    problem={<>פתור: <span className="font-mono text-blue-300" dir="ltr">y' - y = eˣ</span>, תנאי ראשוני <span className="font-mono text-blue-300">y(0) = 1</span>.</>}
    hint="P(x) = -1, Q(x) = eˣ. חשב μ = e^(∫-1 dx)."
    solution={[
      { label: 'גורם אינטגרציה:', content: <pre className="font-mono text-xs text-emerald-400">μ = e^(-x)</pre> },
      { label: 'הכפל:', content: <pre className="font-mono text-xs text-emerald-400">(e^(-x)·y)' = e^(-x)·eˣ = 1</pre> },
      { label: 'אנגדל:', content: <pre className="font-mono text-xs text-emerald-400">e^(-x)·y = x + C  →  y = (x+C)eˣ</pre> },
      { label: 'תנאי y(0)=1:', content: <pre className="font-mono text-xs text-emerald-400">1 = (0+C)·1  →  C=1  →  y = (x+1)eˣ</pre> },
    ]}
  />
)

const quiz: QuizQuestion[] = [
  {
    question: "y' + 3y = 6. מה גורם האינטגרציה?",
    options: ['e^(3x)', 'e^(-3x)', 'e^(x/3)', '3x'],
    correct: 0,
    explanation: "P(x) = 3, לכן μ = e^(∫3dx) = e^(3x).",
  },
  {
    question: "y' - 2y = 0, y(0) = 4. מה y(1)?",
    options: ['4e²', '4e', '2e²', '4/e²'],
    correct: 0,
    explanation: "הפרדת משתנים (Q=0): y = Ce^(2x). y(0)=4 → C=4. y(1)=4e².",
  },
  {
    question: "y' + y/x = x. מה הפתרון הכללי?",
    options: ['y = x²/3 + C/x', 'y = x² + C', 'y = Cx²', 'y = x/3 + C'],
    correct: 0,
    explanation: "P=1/x, μ=e^(∫1/x dx)=x. (xy)'=x². אנגדל: xy=x³/3+C. y=x²/3+C/x.",
  },
]

const greenNote = [
  'כתוב בצורה: y\' + P(x)y = Q(x)',
  'גורם אינטגרציה: μ = e^(∫P dx) — ללא C',
  'הכפל: (μy)\' = μ·Q → אנגדל: μy = ∫μQ dx + C',
  'בטא: y = (∫μQ dx + C) / μ; הצב תנאי ראשוני',
]

const guides: GuideSection[] = [
  {
    title: 'שיטה',
    content: <div className="space-y-2 text-sm">
      <Note color="blue" children={<span className="font-mono text-xs" dir="ltr">μ = e^(∫P dx), then (μy)' = μQ</span>} />
      <p className="text-slate-400 text-xs">גורמי אינטגרציה נפוצים:</p>
      <ul className="font-mono text-xs text-slate-300 space-y-0.5" dir="ltr">
        <li>P = a (קבוע) → μ = e^(ax)</li>
        <li>P = a/x → μ = x^a</li>
        <li>P = 2x → μ = e^(x²)</li>
      </ul>
    </div>,
  },
]

const intro = <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
  <p>
    משוואה שy מופיעה בה בחזקה ראשונה בלבד —{' '}
    <span className="text-blue-400 font-mono">y' + P(x)y = Q(x)</span>.
    הטריק: כפל ב"גורם אינטגרציה" μ שהופך את האגף השמאלי לנגזרת מכפלה.
  </p>
  <Formula c="μ = e^(∫P dx)   →   (μy)' = μQ" color="text-blue-300" />
  <p>מופיע <span className="text-yellow-400 font-semibold">בכל מבחן</span> — לפעמים עם תנאי ראשוני, לפעמים עם Q שמסובך קצת.</p>
</div>

const theory: TheoryCard = {
  summary: 'מד"ר לינארית ממעלה ראשונה היא מהצורה y\' + P(x)·y = Q(x). הטריק: מוצאים "גורם אינטגרציה" μ — פונקציה שכשכופלים בה את שני האגפים, האגף השמאלי הופך לנגזרת של מכפלה: (μy)\'. אחרי זה — אינטגרציה פשוטה.',
  formulas: [
    { label: 'גורם אינטגרציה', tex: '\\mu(x) = e^{\\int P(x)\\,dx}' },
    { label: 'פתרון', tex: 'y = \\frac{1}{\\mu}\\int \\mu Q\\,dx + \\frac{C}{\\mu}' },
  ],
  when: 'כשy מופיעה בחזקה ראשונה בלבד — אין y², אין 1/y, אין y·y\'',
}

const practice: QuizQuestion[] = [
  {
    question: 'מהו גורם האינטגרציה למשוואה y\' + 3y = 0?',
    options: ["e^(3x)", "e^(-3x)", "3x", "e^(x/3)"],
    correct: 0,
    explanation: "P(x) = 3, לכן μ = e^(∫3 dx) = e^(3x)",
  },
  {
    question: 'אחרי כפל ב-μ, מה מקבלים בצד שמאל?',
    options: ["μ·y' + μ·P·y = (μy)'", "μ·y = ∫Q dx", "P·y + Q = 0", "μ·y'' = μQ"],
    correct: 0,
    explanation: "(μy)' = μy' + μPy — זה בדיוק מה שמקבלים לפי כלל הגזירה",
  },
  {
    question: 'פתרו: y\' + y = e^x. מה y(x)?',
    options: ["(e^(2x) + C)/2·e^(-x)", "e^x + Ce^(-x)", "x·e^x + C", "e^x/2 + Ce^(-x)"],
    correct: 3,
    explanation: "μ=e^x, (e^x·y)'=e^(2x), e^x·y=e^(2x)/2+C, y=e^x/2+Ce^(-x)",
  },
  {
    question: 'P(x) = 2/x — מהו μ?',
    options: ["e^(2/x)", "x²", "2·ln(x)", "e^(2x)"],
    correct: 1,
    explanation: "∫(2/x)dx = 2ln|x|, e^(2ln|x|) = x²",
  },
]

export default function Linear({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="diffeq-linear"
    title={"מד\"ר לינארית ממעלה ראשונה"}
    subtitle="y' + P(x)y = Q(x) — גורם אינטגרציה"
    intro={intro} theory={theory} step1={step1} step2={step2} step3={step3}
    SimulatorComponent={Sim} quizQuestions={quiz} practiceQuestions={practice}
    greenNote={greenNote} guides={guides}
    onBack={onBack}
  />
}
