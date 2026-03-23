import React, { useState } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import type { QuizQuestion, GuideSection } from '../../types'

function Sim({ currentStep }: { currentStep: number }) {
  const [C, setC] = useState(1)
  const W = 240, H = 180, ox = 30, oy = H / 2

  // dy/dx = y/x  →  v = y/x  →  y = Cx (straight lines through origin)
  const lines = [-2, -1, 0, 0.5, 1, 2, 3].map(c => ({
    y1: oy - (-2) * 35 * c,
    y2: oy - 4 * 35 * c,
    c,
    active: Math.abs(c - C) < 0.1,
  }))

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} width="240" height="180">
        <line x1={ox} y1="10" x2={ox} y2={H - 10} stroke="#334155" strokeWidth="1.5" />
        <line x1={ox} y1={oy} x2={W - 10} y2={oy} stroke="#334155" strokeWidth="1.5" />

        {lines.map((l, i) => (
          <line key={i}
            x1={ox} y1={l.y1} x2={W - 20} y2={l.y2}
            stroke={l.active ? '#a78bfa' : '#334155'}
            strokeWidth={l.active ? 2.5 : 1} />
        ))}

        <text x={ox + 5} y={oy - C * 35 * 3 - 4} fill="#a78bfa" fontSize="9">
          y = {C}·x
        </text>
        <text x={W / 2} y={H - 4} textAnchor="middle" fill="#64748b" fontSize="8">
          dy/dx = y/x → v = y/x → y = Cx
        </text>
      </svg>
      <div className="w-full space-y-2 px-3">
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-0.5">
            <span>C (קבוע)</span>
            <span className="text-purple-400 font-bold">{C}</span>
          </div>
          <input type="range" min="-2" max="3" step="0.5" value={C}
            onChange={e => setC(+e.target.value)}
            className="w-full accent-purple-500 h-1.5 rounded-full" />
        </div>
      </div>
    </div>
  )
}

const step1 = (
  <PatternStep
    scenario={<><span className="font-mono text-emerald-300" dir="ltr">dy/dx = (x² + y²)/(2xy)</span> — כיצד לזהות הומוגנית?</>}
    options={[
      { label: 'ניתן לכתוב dy/dx = F(y/x)', correct: true, desc: 'כל אבר מדרגה זהה' },
      { label: 'M ו-N קבועים', correct: false },
      { label: "dy/dx תלוי רק ב-y'", correct: false },
      { label: 'M תלוי רק ב-x', correct: false },
    ]}
    correctFeedback="מצוין! (x²+y²)/(2xy) = (1 + (y/x)²)/(2(y/x)) = F(y/x). ← הכל בפונקציה של y/x."
  />
)

const step2 = (
  <PrincipleStep
    heading="הומוגנית — הצבת v = y/x:"
    items={[
      {
        title: 'הצב v = y/x → y = vx, y\' = v + xv\'',
        content: <><Formula c="dy/dx = F(y/x) → v + xv' = F(v)" color="text-purple-300" /></>,
        accent: 'text-purple-400',
      },
      {
        title: 'סדר מחדש — הפרדת משתנים!',
        content: <><Formula c="xv' = F(v) - v  →  dv/(F(v)-v) = dx/x" color="text-purple-300" />
          <Note color="purple" children={<>כעת הפרד ואנגדל משני הצדדים.</>} /></>,
        accent: 'text-purple-400',
      },
      {
        title: 'חזור ל-y: v = y/x',
        content: <span className="text-slate-300 text-sm">אחרי פתרון v(x) — הצב חזרה y = v·x.</span>,
        accent: 'text-purple-400',
      },
    ]}
    btnColor="purple"
  />
)

const step3 = (
  <WorkedExample
    examLabel="מבחן HIT — 2022"
    problem={<>פתור: <span className="font-mono text-blue-300" dir="ltr">dy/dx = (x + y)/x</span>, עם <span className="font-mono text-blue-300">y(1) = 2</span>.</>}
    hint="כתוב כ-(x+y)/x = 1 + y/x = F(y/x). הצב v=y/x."
    solution={[
      { label: 'הצב v=y/x, y\'=v+xv\':', content: <pre className="font-mono text-xs text-emerald-400">v + xv' = 1 + v → xv' = 1 → v' = 1/x</pre> },
      { label: 'אנגדל:', content: <pre className="font-mono text-xs text-emerald-400">v = ln|x| + C → y/x = ln|x| + C</pre> },
      { label: 'חזור ל-y:', content: <pre className="font-mono text-xs text-emerald-400">y = x·ln|x| + Cx</pre> },
      { label: 'תנאי y(1)=2:', content: <pre className="font-mono text-xs text-emerald-400">2 = 1·0 + C·1 → C=2 → y = x·ln(x) + 2x</pre> },
    ]}
  />
)

const quiz: QuizQuestion[] = [
  {
    question: "dy/dx = (x² + xy + y²)/x². האם הומוגנית?",
    options: ['כן — ניתן לכתוב כ-F(y/x)', 'לא — תלויה ב-x² בנפרד', 'כן — לינארית', 'לא — ברנולי'],
    correct: 0,
    explanation: "(x²+xy+y²)/x² = 1 + y/x + (y/x)² = F(y/x). כן, הומוגנית.",
  },
  {
    question: "לאחר הצבת v=y/x, מה y'?",
    options: ['v + xv\'', 'v\'', 'xv\'', 'v/x'],
    correct: 0,
    explanation: "y = vx → y' = v'x + v·1 = v + xv' (כלל המכפלה).",
  },
  {
    question: "dy/dx = y/x. מהו הפתרון הכללי?",
    options: ['y = Cx', 'y = C/x', 'y = Ce^x', 'y = x² + C'],
    correct: 0,
    explanation: "הפרד: dy/y = dx/x → ln|y| = ln|x| + C₁ → y = Cx.",
  },
]

const greenNote = [
  'זהה: dy/dx = F(y/x) — כל האברים מאותה מעלה',
  'הצב v = y/x, y = vx, y\' = v + xv\'',
  'קבל: xv\' = F(v) - v → הפרד ואנגדל',
  'חזור: y = v·x; הצב תנאי ראשוני',
]

const guides: GuideSection[] = [
  {
    title: 'זיהוי',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p className="text-purple-400 font-bold text-xs">כיצד לבדוק הומוגנית?</p>
      <p className="text-xs">החלף x→tx, y→ty. אם f(tx,ty) = f(x,y) → הומוגנית ממעלה 0.</p>
      <Note color="purple" children={<>לדוגמה: (tx+ty)/(tx) = (x+y)/x ✓</>} />
    </div>,
  },
]

const intro = <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
  <p>
    משוואה הומוגנית = dy/dx תלוי רק ביחס <span className="text-purple-400 font-mono">y/x</span>.
    הטריק: הצב <span className="text-white font-semibold">v = y/x</span> → הפרדת משתנים רגילה.
  </p>
  <Formula c="v = y/x  →  y = vx  →  y' = v + xv'" color="text-purple-300" />
</div>

const theory: TheoryCard = {
  summary: 'משוואה הומוגנית היא כזו שבה dy/dx תלויה רק ביחס y/x — לא ב-x וב-y בנפרד. הטריק: מציבים v = y/x, כלומר y = vx, ואז מגיעים למשוואה עם הפרדת משתנים רגילה.',
  formulas: [
    { label: 'הצבה', tex: 'v = \\frac{y}{x} \\;\\Rightarrow\\; y = vx,\\quad y\' = v + xv\'' },
    { label: 'תוצאה', tex: 'x\\,v\' = F(v) - v \\quad\\Rightarrow\\quad \\text{הפרדת משתנים}' },
  ],
  when: 'כשמחליפים x→tx, y→ty המשוואה לא משתנה — סימן שהיא הומוגנית ממעלה 0',
}

const practice: QuizQuestion[] = [
  {
    question: 'איזה בדיקה מאשרת שמשוואה הומוגנית?',
    options: [
      "∂M/∂y = ∂N/∂x",
      "החלפת x→tx, y→ty לא משנה את הביטוי",
      "קיים גורם אינטגרציה μ(x)",
      "y מופיעה בחזקה ראשונה בלבד",
    ],
    correct: 1,
    explanation: "הומוגנית ממעלה 0: f(tx,ty) = f(x,y). זו הבדיקה הסטנדרטית.",
  },
  {
    question: 'בפתרון הומוגנית, מה מציבים תחילה?',
    options: ["u = x+y", "v = y/x", "u = y−x", "v = x·y"],
    correct: 1,
    explanation: "v = y/x → y = vx → y' = v + xv'. ההצבה הסטנדרטית.",
  },
  {
    question: 'אחרי הצבת v = y/x, מה קורה למשוואה?',
    options: [
      "הופכת ללינארית ישירות",
      "מתקבלת הפרדת משתנים ב-v ו-x",
      "נהיית מדויקת",
      "לא ניתן לפתור ידנית",
    ],
    correct: 1,
    explanation: "ההצבה מביאה ל-xv' = F(v) − v, שהיא הפרדת משתנים.",
  },
]

export default function Homogeneous({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="diffeq-homogeneous"
    title="משוואות הומוגניות"
    subtitle="dy/dx = F(y/x) — הצבת v = y/x"
    intro={intro} theory={theory} step1={step1} step2={step2} step3={step3}
    SimulatorComponent={Sim} quizQuestions={quiz} practiceQuestions={practice}
    greenNote={greenNote} guides={guides}
    onBack={onBack}
  />
}
