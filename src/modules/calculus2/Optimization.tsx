import React, { useState } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import type { QuizQuestion, GuideSection } from '../../types'

function Sim({ currentStep }: { currentStep: number }) {
  const [a, setA] = useState(1)
  const [b, setB] = useState(1)

  // f(x,y) = a*x² + b*y²  — paraboloid with critical point at (0,0)
  const W = 220, H = 160
  const cx = W / 2, cy = H / 2

  // Contour lines
  const contours = [0.5, 1, 2, 3, 4].map(level => {
    const pts = Array.from({ length: 60 }, (_, i) => {
      const theta = (i / 59) * 2 * Math.PI
      const rx = Math.sqrt(level / Math.abs(a || 0.01))
      const ry = Math.sqrt(level / Math.abs(b || 0.01))
      return `${cx + rx * Math.cos(theta) * 30},${cy - ry * Math.sin(theta) * 30}`
    }).join(' ')
    return { pts, level }
  })

  const D = 4 * a * b  // discriminant (simplified, fxx*fyy - fxy²)
  const type = D > 0 && a > 0 ? 'מינימום' : D > 0 && a < 0 ? 'מקסימום' : D < 0 ? 'אוכף' : 'בלתי ניתן לסיווג'

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} width="220" height="160">
        <line x1="10" y1={cy} x2={W - 10} y2={cy} stroke="#334155" strokeWidth="1.5" />
        <line x1={cx} y1="10" x2={cx} y2={H - 10} stroke="#334155" strokeWidth="1.5" />
        <text x={W - 8} y={cy + 10} fill="#475569" fontSize="9">x</text>
        <text x={cx + 3} y="14" fill="#475569" fontSize="9">y</text>

        {contours.map((c, i) => (
          <polyline key={i} points={c.pts} fill="none"
            stroke={`hsl(${160 - i * 20}, 70%, ${40 + i * 8}%)`} strokeWidth="1.2" opacity="0.8" />
        ))}

        {/* Critical point */}
        <circle cx={cx} cy={cy} r="5" fill={type === 'מינימום' ? '#10b981' : type === 'מקסימום' ? '#ef4444' : '#f59e0b'} />
        <text x={cx + 8} y={cy - 8} fill="#cbd5e1" fontSize="9">{type}</text>
      </svg>

      <div className="w-full space-y-2 px-3">
        {[
          { label: 'a (מקדם x²)', val: a, set: setA, min: -3, max: 3, step: 0.5, color: 'blue' },
          { label: 'b (מקדם y²)', val: b, set: setB, min: -3, max: 3, step: 0.5, color: 'purple' },
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
        <div className="bg-white/10 rounded-xl p-2 text-center text-xs" dir="ltr">
          <p className="font-mono text-slate-300">f = {a}x² + {b}y²</p>
          <p className="font-mono">D = f_xx·f_yy - f_xy² = {4 * a * b}</p>
          <p className={`font-bold mt-1 ${type === 'מינימום' ? 'text-emerald-400' : type === 'מקסימום' ? 'text-red-400' : 'text-yellow-400'}`}>
            {type}
          </p>
        </div>
      </div>
    </div>
  )
}

const step1 = (
  <PatternStep
    scenario={<>
      <span className="font-mono text-emerald-300" dir="ltr">f(x,y) = x⁴ + y⁴ - 2x² - 32y + 10</span>
      <br />מצא ובדוק נקודות קריטיות.
    </>}
    options={[
      { label: 'שווה אפס את ∂f/∂x ו-∂f/∂y — מצא נק\' קריטיות', correct: true },
      { label: 'שווה אפס רק ∂f/∂x', correct: false },
      { label: 'השתמש בלגרנג\'', correct: false, desc: 'ללא אילוץ — לא לגרנג\'' },
      { label: 'חפש בגבולות', correct: false, desc: 'רק לאחר בדיקה פנימית' },
    ]}
    correctFeedback="נכון! אקסטרמום מקומי: f_x=0 וגם f_y=0. הצב ופתור את המערכת. סווג עם D = f_xx·f_yy - f_xy²."
  />
)

const step2 = (
  <PrincipleStep
    heading="אקסטרמום מקומי — שיטה:"
    items={[
      {
        title: 'מצא נקודות קריטיות',
        content: <>
          <div dir="ltr" className="font-mono text-xs text-yellow-300 space-y-0.5">
            <p>f_x(x,y) = 0</p>
            <p>f_y(x,y) = 0</p>
          </div>
          <span className="text-slate-400 text-xs">פתור את מערכת המשוואות ← נקודות קריטיות</span>
        </>,
        accent: 'text-yellow-400',
      },
      {
        title: 'סווג עם D (מבחן נגזרת שנייה)',
        content: <>
          <Formula c="D = f_xx · f_yy - (f_xy)²" color="text-yellow-300" />
          <div className="text-xs text-slate-300 space-y-0.5 mt-1">
            <p><span className="text-emerald-400">D &gt; 0, f_xx &gt; 0</span> → מינימום</p>
            <p><span className="text-red-400">D &gt; 0, f_xx &lt; 0</span> → מקסימום</p>
            <p><span className="text-yellow-400">D &lt; 0</span> → נקודת אוכף</p>
            <p><span className="text-slate-500">D = 0</span> → לא ניתן לסיווג</p>
          </div>
        </>,
        accent: 'text-yellow-400',
      },
      {
        title: 'לגרנג\' — אקסטרמום תחת אילוץ g(x,y)=0',
        content: <>
          <Formula c="∇f = λ·∇g  →  f_x = λg_x, f_y = λg_y" color="text-orange-300" />
          <span className="text-slate-400 text-xs">פתור מערכת עם 3 משוואות: f_x=λg_x, f_y=λg_y, g=0</span>
        </>,
        accent: 'text-orange-400',
      },
    ]}
  />
)

const step3 = (
  <WorkedExample
    examLabel="מבחן HIT — 2024 (שאלה 4א)"
    problem={<>
      מצא נקודות קריטיות ובדוק:{' '}
      <span className="font-mono text-blue-300" dir="ltr">f(x,y) = x⁴ + y⁴ - 2x² - 32y + 10</span>
    </>}
    hint="f_x = 4x³ - 4x = 0 → x(x²-1)=0 → x=0,±1. f_y = 4y³ - 32 = 0 → y=2."
    solution={[
      { label: 'f_x = 4x³ - 4x = 4x(x²-1) = 0:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">x = 0, x = 1, x = -1</pre> },
      { label: 'f_y = 4y³ - 32 = 0:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">y = ∛8 = 2</pre> },
      { label: 'נק\' קריטיות: (0,2), (1,2), (-1,2). מצא D:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">{'f_xx = 12x²-4, f_yy = 12y²=48, f_xy=0\nD = (12x²-4)·48\n(0,2): D = (-4)·48 < 0 → אוכף\n(±1,2): D = (8)·48 > 0, f_xx>0 → מינימום'}</pre> },
    ]}
  />
)

const quiz: QuizQuestion[] = [
  {
    question: 'f(x,y) = x² + y² - 2x - 4y. מהי הנקודה הקריטית?',
    options: ['(1,2)', '(2,4)', '(-1,-2)', '(0,0)'],
    correct: 0,
    explanation: 'f_x = 2x-2 = 0 → x=1. f_y = 2y-4 = 0 → y=2. נקודה קריטית: (1,2).',
  },
  {
    question: 'ב-(x₀,y₀): f_xx=3, f_yy=5, f_xy=1. מה D?',
    options: ['D=14', 'D=16', 'D=15', 'D=8'],
    correct: 0,
    explanation: 'D = f_xx·f_yy - (f_xy)² = 3·5 - 1² = 15-1 = 14 > 0 ← מינימום (f_xx>0)',
  },
  {
    question: 'לגרנג\': מצא אקסטרמום של f=xy תחת x²+y²=2.',
    options: ['(1,1) מקסימום, (-1,-1) מקסימום', 'f_max = 1 ב-(1,1) ו-(-1,-1)', 'f_min = -1 ב-(1,-1)', 'תשובות ב ו-ג נכונות'],
    correct: 3,
    explanation: '∇f=λ∇g: (y,x)=λ(2x,2y). y=2λx, x=2λy → y²=4λ²y² → λ=±1/2. נקודות: (±1,±1). f=±1.',
  },
]

const greenNote = [
  'נקודות קריטיות: f_x = 0 וגם f_y = 0 — פתור מערכת',
  'D = f_xx·f_yy - (f_xy)². D>0,f_xx>0→מינימום; D>0,f_xx<0→מקסימום; D<0→אוכף',
  'לגרנג\': f_x=λg_x, f_y=λg_y, g(x,y)=0 — שלוש משוואות, שלושה נעלמים (x,y,λ)',
  'אקסטרמום גלובלי: בדוק נקודות קריטיות פנימיות + גבולות המחוז',
]

const guides: GuideSection[] = [
  {
    title: 'D טבלה',
    content: <div className="space-y-2 text-sm" dir="ltr">
      <p className="text-yellow-400 font-bold text-xs">Second Derivative Test</p>
      <p className="font-mono text-xs text-slate-300">D = f_xx·f_yy - (f_xy)²</p>
      <div className="space-y-1 text-xs mt-2">
        {[
          ['D > 0, f_xx > 0', 'Local Min', 'emerald'],
          ['D > 0, f_xx < 0', 'Local Max', 'red'],
          ['D < 0', 'Saddle Point', 'yellow'],
          ['D = 0', 'Inconclusive', 'slate'],
        ].map(([cond, res, color]) => (
          <div key={cond} className={`flex justify-between bg-white/5 rounded p-1.5`}>
            <span className="font-mono text-slate-400">{cond}</span>
            <span className={`text-${color}-400 font-bold`}>{res}</span>
          </div>
        ))}
      </div>
    </div>,
  },
  { title: 'מהרצאה', content: <div className="text-slate-400 text-sm p-3 border border-dashed border-slate-700 rounded-xl text-center"><p>📖 סיכום ההרצאה יתווסף כאן</p></div> },
]

const intro = <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
  <p>
    איפה פונקציה מגיעה למינימום? שם שיפוע = 0 בכל כיוון.
    כלומר <span className="text-yellow-400 font-mono">∂f/∂x = 0</span> וגם <span className="text-yellow-400 font-mono">∂f/∂y = 0</span> — נקודה קריטית.
  </p>
  <Formula c="D = f_xx·f_yy - (f_xy)²  →  D>0,f_xx>0 = מינימום" color="text-yellow-300" />
  <p>
    תחת אילוץ? <span className="text-orange-400 font-semibold">לגרנג\'</span> — ∇f = λ∇g.
    ב<span className="text-yellow-400 font-semibold">כל מבחן</span> — לפעמים שניהם.
  </p>
</div>

const theory: TheoryCard = {
  summary: 'למצוא מינימום/מקסימום של f(x,y): קודם מציאים נקודות קריטיות (∂f/∂x=0 וגם ∂f/∂y=0), אחר כך בודקים את D לסיווג. תחת אילוץ g(x,y)=0 — משתמשים בלגרנג\': ∇f = λ∇g.',
  formulas: [
    { label: 'מבחן D', tex: 'D = f_{xx}f_{yy} - f_{xy}^2\\;:\\; D>0,f_{xx}>0\\Rightarrow\\min' },
    { label: 'לגרנג\'', tex: '\\nabla f = \\lambda\\nabla g \\;\\Rightarrow\\; (f_x,f_y) = \\lambda(g_x,g_y)' },
  ],
  when: 'בלי אילוץ → נקודות קריטיות + מבחן D. עם אילוץ g=0 → לגרנג\'',
}

const practice: QuizQuestion[] = [
  {
    question: 'f_xx=4, f_yy=3, f_xy=1. מה D?',
    options: ["11", "12", "13", "7"],
    correct: 0,
    explanation: "D = f_xx·f_yy - (f_xy)² = 4·3 - 1² = 12 - 1 = 11",
  },
  {
    question: 'D=11>0, f_xx=4>0 — מה הנקודה?',
    options: ["מקסימום", "מינימום", "אוכף", "לא ניתן לסיווג"],
    correct: 1,
    explanation: "D>0 ו-f_xx>0 → מינימום מקומי",
  },
  {
    question: 'D < 0 — מה הנקודה?',
    options: ["מינימום", "מקסימום", "נקודת אוכף", "נקודה שטוחה"],
    correct: 2,
    explanation: "D<0 → נקודת אוכף (לא קיצון)",
  },
  {
    question: 'בשיטת לגרנג\': מה מחפשים כשיש אילוץ g(x,y)=0?',
    options: [
      "∇f = 0 ו-∇g = 0 בנפרד",
      "נקודות שבהן ∇f מקביל ל-∇g",
      "מינימום של f - λg",
      "D של f+g",
    ],
    correct: 1,
    explanation: "∇f = λ∇g אומר שהגרדיאנטים מקבילים — שם נמצאים הקיצונות על האילוץ",
  },
]

export default function Optimization({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="calc2-optimization"
    title="אקסטרמום"
    subtitle="נקודות קריטיות, מבחן D, לגרנג'"
    intro={intro} theory={theory} step1={step1} step2={step2} step3={step3}
    SimulatorComponent={Sim} quizQuestions={quiz} practiceQuestions={practice}
    greenNote={greenNote} guides={guides}
    onBack={onBack}
  />
}
