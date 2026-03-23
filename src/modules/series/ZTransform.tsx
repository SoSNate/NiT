import React, { useState } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import type { QuizQuestion, GuideSection } from '../../types'

function Sim({ currentStep }: { currentStep: number }) {
  const [a, setA] = useState(0.5)
  const [N, setN] = useState(8)

  const W = 240, H = 160, ox = 20, oy = H - 20

  // x[n] = aⁿ·u[n]
  const terms = Array.from({ length: N }, (_, k) => ({
    n: k,
    val: Math.pow(a, k),
  }))

  const partialSum = terms.reduce((s, t) => s + t.val, 0)
  const infSum = Math.abs(a) < 1 ? 1 / (1 - a) : Infinity

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} width="240" height="160">
        <line x1={ox} y1="10" x2={ox} y2={oy + 3} stroke="#334155" strokeWidth="1.5" />
        <line x1={ox} y1={oy} x2={W - 8} y2={oy} stroke="#334155" strokeWidth="1.5" />
        <text x={W - 12} y={oy + 10} fill="#475569" fontSize="9">n</text>
        <text x={ox + 2} y="16" fill="#475569" fontSize="9">x[n]=aⁿ</text>

        {terms.map(({ n, val }) => {
          const px = ox + 10 + n * ((W - ox - 20) / (N - 0.5))
          const py = oy - val * (H - 40)
          return (
            <g key={n}>
              <line x1={px} y1={oy} x2={px} y2={py} stroke="#f59e0b" strokeWidth="2" />
              <circle cx={px} cy={py} r="3" fill="#f59e0b" />
              <text x={px - 2} y={oy + 10} fill="#475569" fontSize="7">{n}</text>
            </g>
          )
        })}
      </svg>

      <div className="w-full space-y-2 px-3">
        {[
          { label: 'a (בסיס)', val: a, set: setA, min: -0.9, max: 0.9, step: 0.1, color: 'yellow' },
          { label: 'N (איברים)', val: N, set: setN, min: 2, max: 15, step: 1, color: 'blue' },
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
        <div className="bg-white/10 rounded-xl p-2 text-xs" dir="ltr">
          <p className="font-mono text-slate-300">Z{'{aⁿu[n]}'} = z/(z-a), |z|&gt;|a|={Math.abs(a)}</p>
          <p className="font-mono text-yellow-400">סכום חלקי: {partialSum.toFixed(3)} | ∞: {isFinite(infSum) ? infSum.toFixed(3) : '∞'}</p>
        </div>
      </div>
    </div>
  )
}

const step1 = (
  <PatternStep
    scenario={<>
      פתור משוואת הפרש:{' '}
      <span className="font-mono text-emerald-300" dir="ltr">y[n] - (1/2)y[n-1] = δ[n], y[-1]=0</span>
      <br />כיצד?
    </>}
    options={[
      { label: 'Z-טרנספורם: Y - (1/2)z⁻¹Y = 1. פתור ל-Y(z)', correct: true },
      { label: 'לפלס (t רציף)', correct: false, desc: 'לפלס לאותות רציפים — Z לדיסקרטיים' },
      { label: 'פתור ישירות בצעד אחרי צעד', correct: false, desc: 'נכון אבל לא יעיל עבור פתרון סגור' },
      { label: 'פורייה דיסקרטי', correct: false },
    ]}
    correctFeedback="נכון! Z{y[n-1]}=z⁻¹Y(z). משוואה: Y(1-z⁻¹/2)=1 → Y=z/(z-1/2). Z⁻¹: y[n]=(1/2)ⁿu[n]."
  />
)

const step2 = (
  <PrincipleStep
    heading="התמרת Z — כלים:"
    items={[
      {
        title: 'טבלת Z חשובים',
        content: <div dir="ltr" className="font-mono text-xs space-y-0.5">
          <p className="text-orange-300">Z{'{δ[n]}'} = 1</p>
          <p className="text-orange-300">Z{'{u[n]}'} = z/(z-1)</p>
          <p className="text-orange-300">Z{'{aⁿu[n]}'} = z/(z-a), |z|&gt;|a|</p>
          <p className="text-orange-300">Z{'{n·aⁿu[n]}'} = az/(z-a)²</p>
          <p className="text-orange-300">Z{'{x[n-k]}'} = z^{'{-k}'}·X(z)</p>
        </div>,
        accent: 'text-orange-400',
      },
      {
        title: 'משוואת הפרש',
        content: <>
          <Formula c="Z{y[n-1]} = z⁻¹·Y(z)  (היסט)" color="text-blue-300" />
          <span className="text-slate-400 text-xs">שלבים: הפעל Z → פתור Y(z) → Z⁻¹</span>
        </>,
        accent: 'text-blue-400',
      },
      {
        title: 'Z⁻¹ — שברים חלקיים',
        content: <>
          <Formula c="Y(z)/z = A/(z-a) + B/(z-b)  →  Y = Az/(z-a) + Bz/(z-b)" color="text-emerald-300" />
          <span className="text-slate-400 text-xs">חלק Y(z) ב-z, פרק לשברים, הכפל חזרה ב-z</span>
        </>,
        accent: 'text-emerald-400',
      },
    ]}
  />
)

const step3 = (
  <WorkedExample
    examLabel="מבחן HIT — 2024 (Z-טרנספורם)"
    problem={<>
      פתור:{' '}
      <span className="font-mono text-blue-300" dir="ltr">y[n] - (3/4)y[n-1] + (1/8)y[n-2] = u[n]</span>
      <br /><span dir="ltr">y[-1]=y[-2]=0</span>
    </>}
    hint="Z{y[n-k]}=z^{-k}Y. פתור Y(z), פרק Y(z)/z לשברים, הכפל ב-z, Z⁻¹."
    solution={[
      { label: 'הפעל Z:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">Y - (3/4)z⁻¹Y + (1/8)z⁻²Y = z/(z-1){'\n'}Y(1 - 3/4z⁻¹ + 1/8z⁻²) = z/(z-1){'\n'}Y·(z²-3z/4+1/8)/z² = z/(z-1)</pre> },
      { label: 'Y(z):', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">Y = z³/[(z-1)(z-1/2)(z-1/4)]</pre> },
      { label: 'שברים + Z⁻¹:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">Y/z = A/(z-1)+B/(z-1/2)+C/(z-1/4){'\n'}A=8, B=-8, C=1{'\n'}y[n] = [8·1ⁿ - 8·(1/2)ⁿ + (1/4)ⁿ]u[n]</pre> },
    ]}
  />
)

const quiz: QuizQuestion[] = [
  {
    question: 'Z{(1/3)ⁿu[n]} = ?',
    options: ['z/(z-1/3)', '1/(z-1/3)', 'z/(z+1/3)', '3z/(3z-1)'],
    correct: 0,
    explanation: 'Z{aⁿu[n]} = z/(z-a). כאן a=1/3 → z/(z-1/3).',
  },
  {
    question: 'Z{x[n-2]} = ?',
    options: ['z⁻²·X(z)', 'z²·X(z)', 'X(z-2)', 'X(z)/z²'],
    correct: 0,
    explanation: 'היסט בזמן: Z{x[n-k]} = z^{-k}·X(z). כאן k=2.',
  },
  {
    question: 'Y(z) = z/(z-0.5)(z-0.25). מהו y[n]?',
    options: ['[2·(0.5)ⁿ - (0.25)ⁿ]u[n]', '(0.5)ⁿu[n]', '(0.75)ⁿu[n]', 'תלוי בתנאי התחלה'],
    correct: 0,
    explanation: 'Y/z = A/(z-0.5)+B/(z-0.25). A=2, B=-1. y[n]=[2·(0.5)ⁿ-(0.25)ⁿ]u[n].',
  },
]

const greenNote = [
  'Z{aⁿu[n]}=z/(z-a). Z{δ[n]}=1. Z{u[n]}=z/(z-1)',
  'Z{x[n-k]}=z^{-k}·X(z) — היסט',
  'שלבים: Z → פתור Y(z) → חלק ב-z → שברים חלקיים → כפל ב-z → Z⁻¹',
  'אזור התכנסות (ROC): |z|>|a| לרצפים יאגים. חשוב ליציבות!',
]

const guides: GuideSection[] = [
  {
    title: 'טבלת Z',
    content: <div className="space-y-1 text-sm" dir="ltr">
      {[
        ['δ[n]', '1'],
        ['u[n]', 'z/(z-1)'],
        ['aⁿu[n]', 'z/(z-a)'],
        ['n·aⁿu[n]', 'az/(z-a)²'],
        ['x[n-k]', 'z^{-k}X(z)'],
        ['a·x[n]', 'a·X(z)'],
      ].map(([f, F]) => (
        <div key={f} className="bg-white/5 rounded p-1 flex justify-between">
          <span className="text-orange-300 font-mono text-xs">{f}</span>
          <span className="text-slate-300 font-mono text-xs">{F}</span>
        </div>
      ))}
    </div>,
  },
  { title: 'מהרצאה', content: <div className="text-slate-400 text-sm p-3 border border-dashed border-slate-700 rounded-xl text-center"><p>📖 סיכום ההרצאה יתווסף כאן</p></div> },
]

const intro = <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
  <p>
    התמרת Z היא <span className="text-orange-400 font-semibold">לפלס של עולם דיסקרטי</span>.
    פותרת משוואות הפרש כמו שלפלס פותרת מד"ר.
  </p>
  <Formula c="X(z) = Σ_{n=0}^∞ x[n]·z⁻ⁿ" color="text-orange-300" />
  <p>
    ב<span className="text-yellow-400 font-semibold">כל מבחן</span>: פתרון משוואת הפרש עם Z + שברים חלקיים + Z⁻¹.
  </p>
</div>

const theory: TheoryCard = {
  summary: 'התמרת Z היא הגרסה הדיסקרטית של לפלס. X(z) = Σx[n]z^(-n). Z{x[n-k]} = z^(-k)X(z) — היסט בזמן = כפל ב-z^(-k). פותרים משוואת הפרש כמו מד"ר: Z את הכל → שברים חלקיים → Z⁻¹. ROC = אזור התכנסות, חשוב לקאוזאליות.',
  formulas: [
    { label: 'Z{aⁿu[n]}', tex: 'Z\\{a^n u[n]\\} = \\frac{z}{z-a},\\quad |z|>|a|' },
    { label: 'היסט', tex: 'Z\\{x[n-k]\\} = z^{-k}X(z)' },
  ],
  when: 'מערכת דיסקרטית (סמפלינג) → Z. פתרון: כתוב H(z) → שברים חלקיים → Z⁻¹ עם טבלה',
}

const practice: QuizQuestion[] = [
  {
    question: 'Z{u[n]} = ? (u[n] = סיגנל מדרגה דיסקרטי)',
    options: ["1/(z-1)", "z/(z-1)", "1", "z/(z+1)"],
    correct: 1,
    explanation: "u[n] = 1 לכל n≥0. Z{u[n]} = Σz^(-n) = z/(z-1) עבור |z|>1",
  },
  {
    question: 'Z{x[n-2]} = ?',
    options: ["z²X(z)", "z^(-2)X(z)", "X(z)/z²", "X(z+2)"],
    correct: 1,
    explanation: "היסט: Z{x[n-k]} = z^(-k)·X(z). k=2 → z^(-2)X(z)",
  },
  {
    question: 'X(z) = z/(z-0.5). מה x[n]?',
    options: ["0.5ⁿ·u[n]", "(-0.5)ⁿ·u[n]", "2ⁿ·u[n]", "0.5^(-n)·u[n]"],
    correct: 0,
    explanation: "מהטבלה: Z{aⁿu[n]} = z/(z-a). כאן a=0.5, לכן x[n] = (0.5)ⁿu[n]",
  },
]

export default function ZTransform({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="series-z"
    title="התמרת Z"
    subtitle="משוואות הפרש, ROC, שברים חלקיים"
    intro={intro} theory={theory} step1={step1} step2={step2} step3={step3}
    SimulatorComponent={Sim} quizQuestions={quiz} practiceQuestions={practice}
    greenNote={greenNote} guides={guides}
    onBack={onBack}
  />
}
