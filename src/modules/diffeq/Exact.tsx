import React, { useState } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import type { QuizQuestion, GuideSection } from '../../types'

function Sim({ currentStep }: { currentStep: number }) {
  const [C, setC] = useState(1)
  const W = 240, H = 180, ox = W / 2, oy = H / 2

  // F(x,y) = x² + y² = C  (level curves of a potential function)
  const contours = [-2, -1, 0, 1, 2, 3, 4].map(c => {
    const r = Math.sqrt(Math.abs(c))
    return { r, positive: c >= 0, val: c }
  })

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} width="240" height="180">
        {/* Axes */}
        <line x1="10" y1={oy} x2={W - 10} y2={oy} stroke="#334155" strokeWidth="1.5" />
        <line x1={ox} y1="10" x2={ox} y2={H - 10} stroke="#334155" strokeWidth="1.5" />
        <text x={W - 8} y={oy + 10} fill="#475569" fontSize="9">x</text>
        <text x={ox + 3} y="14" fill="#475569" fontSize="9">y</text>

        {/* Level curves F(x,y) = C */}
        {[1, 2, 3, 4, 5].map(r => (
          <circle key={r} cx={ox} cy={oy} r={r * 18}
            fill="none"
            stroke={r * r === C * 1 ? '#10b981' : '#334155'}
            strokeWidth={r * r === C ? 2.5 : 1}
            opacity={0.6 + (r === C ? 0.4 : 0)} />
        ))}

        <text x={ox + 5} y={oy - C * 18 - 4} fill="#10b981" fontSize="9">
          F(x,y) = {C}
        </text>

        {currentStep >= 2 && (
          <text x="10" y="175" fill="#64748b" fontSize="8">קווי פוטנציאל: F(x,y) = x² + y²</text>
        )}
      </svg>

      <div className="w-full space-y-2 px-3">
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-0.5">
            <span>C (ערך קבוע)</span>
            <span className="text-emerald-400 font-bold">{C}</span>
          </div>
          <input type="range" min="1" max="6" step="1" value={C}
            onChange={e => setC(+e.target.value)}
            className="w-full accent-emerald-500 h-1.5 rounded-full" />
        </div>
        <div className="bg-white/10 rounded-xl p-2 text-center text-xs">
          <span className="font-mono text-slate-300" dir="ltr">Mdx + Ndy = 0  where  ∂M/∂y = ∂N/∂x</span>
        </div>
      </div>
    </div>
  )
}

const step1 = (
  <PatternStep
    scenario={<>
      <span className="font-mono text-emerald-300" dir="ltr">(y²cos(xy) + y)dx + xy·cos(xy)dy = 0</span>
      {' '}— כיצד לזהות שהמשוואה מדויקת?
    </>}
    options={[
      { label: 'בדוק: ∂M/∂y = ∂N/∂x', correct: true, desc: 'תנאי הדיוק' },
      { label: 'גורם אינטגרציה תמיד קיים', correct: false },
      { label: 'M ו-N תלויים רק ב-x', correct: false },
      { label: 'ניתן להפריד x ו-y', correct: false },
    ]}
    correctFeedback="בדיוק! תנאי הדיוק: ∂M/∂y = ∂N/∂x. אם מתקיים — קיים פונקציית פוטנציאל F(x,y) כך ש-dF=0."
  />
)

const step2 = (
  <PrincipleStep
    heading="מדויקת — שלושה שלבים:"
    items={[
      {
        title: 'בדוק דיוק: ∂M/∂y = ∂N/∂x',
        content: <><Formula c="M = ∂F/∂x  ,  N = ∂F/∂y" color="text-teal-300" />
          <span className="text-slate-400 text-xs">אם שווה → מדויקת. אם לא → חפש גורם אינטגרציה.</span></>,
        accent: 'text-teal-400',
      },
      {
        title: 'מצא F — אנגדל את M לפי x',
        content: <><Formula c="F(x,y) = ∫M dx + φ(y)" color="text-teal-300" />
          <span className="text-slate-400 text-xs">φ(y) פונקציה לא ידועה של y בלבד.</span></>,
        accent: 'text-teal-400',
      },
      {
        title: 'מצא φ(y): גזור F לפי y, השווה ל-N',
        content: <><span className="text-slate-300 text-sm">∂F/∂y = N → מצא φ'(y) → אנגדל → פתרון: F(x,y) = C</span>
          <Note color="emerald" children={<>✓ פתרון שלם: F(x,y) = C (קו פוטנציאל)</>} /></>,
        accent: 'text-teal-400',
      },
    ]}
    btnColor="teal"
  />
)

const step3 = (
  <WorkedExample
    examLabel="מבחן HIT — 2025 (שאלה 1)"
    problem={<>
      פתור: <span className="font-mono text-blue-300" dir="ltr">(y²cos(xy) + y)dx + xy·cos(xy)dy = 0</span>
      <br />עם תנאי <span className="font-mono text-blue-300">y(π) = -1</span>.
    </>}
    hint="M = y²cos(xy)+y, N = xy·cos(xy). בדוק ∂M/∂y = ∂N/∂x לפני הכל!"
    solution={[
      { label: 'בדוק דיוק:', content: <pre className="font-mono text-xs text-emerald-400">∂M/∂y = 2y·cos(xy) - xy²sin(xy) + 1{'\n'}∂N/∂x = y·cos(xy) - xy²sin(xy){'\n'}⚠️ לא שווים! → לא מדויקת. נחפש גורם אינטגרציה μ(x).</pre> },
      { label: 'גורם אינטגרציה μ(x):', content: <pre className="font-mono text-xs text-emerald-400">(∂M/∂y - ∂N/∂x)/N = (y-0)/(xy·cos(xy)) ... בדוק{'\n'}ניסוי μ=y → ∂(μM)/∂y = ∂(μN)/∂x? כן!{'\n'}μ = x → בדוק: עובד!</pre> },
      { label: 'פתרון F(x,y)=C:', content: <Formula c="F = sin(xy) + xy = C" /> },
    ]}
  />
)

const quiz: QuizQuestion[] = [
  {
    question: "(2xy + 3)dx + (x² + 4y)dy = 0 — האם מדויקת?",
    options: ['כן, ∂M/∂y = ∂N/∂x = 2x', 'לא, ∂M/∂y ≠ ∂N/∂x', 'כן, אבל רק לאחר כפל ב-x', 'לא ניתן לבדוק'],
    correct: 0,
    explanation: "∂M/∂y = 2x, ∂N/∂x = 2x. שווים! → מדויקת. F = x²y + 3x + 2y² = C.",
  },
  {
    question: "עבור Mdx+Ndy=0 מדויקת, מהו הפתרון הכללי?",
    options: ['F(x,y) = C כך ש-∂F/∂x=M, ∂F/∂y=N', 'y = ∫M dx + C', 'M·N = C', 'M + N = C'],
    correct: 0,
    explanation: "הפתרון הוא קוי הפוטנציאל F(x,y)=C של שדה הוקטורים (M,N).",
  },
  {
    question: "אחרי ∫M dx = F₀(x,y), מה עושים כדי למצוא φ(y)?",
    options: ['גוזרים F₀ לפי y ומשווים ל-N', 'אנגדלים N לפי y', 'גוזרים F₀ לפי x ומשווים ל-M', 'מציבים תנאי ראשוני'],
    correct: 0,
    explanation: "∂F/∂y = ∂F₀/∂y + φ'(y) = N. מכאן מוצאים φ'(y) ואנגדלים.",
  },
]

const greenNote = [
  'בדוק: ∂M/∂y = ∂N/∂x (תנאי דיוק). אם לא שווה — חפש גורם אינטגרציה',
  'מצא F: אנגדל M לפי x → F = ∫M dx + φ(y)',
  'מצא φ: גזור F לפי y, השווה ל-N → פתח φ\'(y) → אנגדל',
  'פתרון: F(x,y) = C; הצב תנאי ראשוני למציאת C',
]

const guides: GuideSection[] = [
  {
    title: 'שיטה',
    content: <div className="space-y-2 text-sm text-slate-300">
      <Note color="teal" children={<span className="font-mono text-xs" dir="ltr">∂M/∂y = ∂N/∂x → exact!</span>} />
      <p className="text-xs text-slate-400 mt-2">גורם אינטגרציה נפוץ:</p>
      <ul className="text-xs space-y-0.5 font-mono" dir="ltr">
        <li>μ(x): (My-Nx)/N = f(x) only</li>
        <li>μ(y): (Nx-My)/M = g(y) only</li>
        <li>μ = xᵃyᵇ: try common powers</li>
      </ul>
    </div>,
  },
]

const intro = <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
  <p>
    משוואה מדויקת = <span className="text-teal-400 font-semibold">dF = 0</span> מוסווה.
    כלומר קיימת פונקציה F(x,y) כך שהמשוואה היא בעצם dF = 0, ולכן הפתרון הוא F(x,y) = C.
  </p>
  <Formula c="M dx + N dy = 0   כאשר   ∂M/∂y = ∂N/∂x" color="text-teal-300" />
  <p>
    מופיעה <span className="text-yellow-400 font-semibold">בכל מבחן</span> — לרוב עם גורם אינטגרציה שצריך למצוא.
    הדוגמה מ-2025 הייתה עם cos(xy) — נראית מפחידה, אבל השיטה זהה.
  </p>
</div>

const theory: TheoryCard = {
  summary: 'משוואה מדויקת M dx + N dy = 0 היא בעצם dF = 0 מוסווה — קיימת פונקציה F(x,y) שהפתרון שלה הוא F = C. הבדיקה: ∂M/∂y = ∂N/∂x. אם לא מתקיים — מחפשים גורם אינטגרציה μ שיהפוך אותה למדויקת.',
  formulas: [
    { label: 'תנאי דיוק', tex: '\\frac{\\partial M}{\\partial y} = \\frac{\\partial N}{\\partial x}' },
    { label: 'מציאת F', tex: 'F = \\int M\\,dx + g(y),\\quad g\'(y) = N - \\frac{\\partial}{\\partial y}\\!\\int\\! M\\,dx' },
  ],
  when: 'כשהמשוואה בצורה M dx + N dy = 0 — בדוק תמיד ∂M/∂y מול ∂N/∂x לפני שבוחרים שיטה',
}

const practice: QuizQuestion[] = [
  {
    question: 'M = 2xy, N = x². האם המשוואה מדויקת?',
    options: ["כן — ∂M/∂y = 2x = ∂N/∂x", "לא — ∂M/∂y ≠ ∂N/∂x", "רק אם x>0", "צריך גורם אינטגרציה"],
    correct: 0,
    explanation: "∂M/∂y = 2x, ∂N/∂x = 2x — שווים → המשוואה מדויקת",
  },
  {
    question: 'מצאנו F. מה הפתרון הכללי?',
    options: ["F = 0", "F(x,y) = C", "dF/dx = 0", "F = e^C"],
    correct: 1,
    explanation: "הפתרון הוא F(x,y) = C (קבוע שרירותי)",
  },
  {
    question: 'כשהמשוואה לא מדויקת, מחפשים:',
    options: ["הפרדת משתנים", "גורם אינטגרציה μ", "הצבת v = y/x", "לפלס"],
    correct: 1,
    explanation: "גורם אינטגרציה μ(x) או μ(y) שהופך את המשוואה למדויקת",
  },
  {
    question: 'גורם אינטגרציה μ(x) קיים כש:',
    options: [
      "(My - Nx)/N תלוי רק ב-x",
      "(My - Nx)/M תלוי רק ב-y",
      "∂M/∂y = 0",
      "N = M",
    ],
    correct: 0,
    explanation: "אם (My−Nx)/N = h(x) בלבד → μ = e^(∫h dx)",
  },
]

export default function Exact({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="diffeq-exact"
    title="משוואות מדויקות"
    subtitle="Mdx + Ndy = 0 — תנאי דיוק ופונקציית פוטנציאל"
    intro={intro} theory={theory} step1={step1} step2={step2} step3={step3}
    SimulatorComponent={Sim} quizQuestions={quiz} practiceQuestions={practice}
    greenNote={greenNote} guides={guides}
    onBack={onBack}
  />
}
