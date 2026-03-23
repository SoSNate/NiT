import React, { useState } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import type { QuizQuestion, GuideSection } from '../../types'

function Sim({ currentStep }: { currentStep: number }) {
  const [funcType, setFuncType] = useState<'exp' | 'step' | 'sin'>('exp')
  const [a, setA] = useState(1)

  const W = 240, H = 160, ox = 20, oy = H - 25

  const evalF = (t: number): number => {
    if (funcType === 'exp') return t >= 0 ? Math.exp(-a * t) : 0
    if (funcType === 'step') return t >= a ? 1 : 0
    return t >= 0 ? Math.sin(a * t) : 0
  }

  const pts = Array.from({ length: 80 }, (_, i) => {
    const t = (i / 79) * 8
    const y = evalF(t)
    return `${ox + t * (W - ox - 10) / 8},${oy - y * (H - 50)}`
  }).join(' ')

  const laplaceDesc = funcType === 'exp'
    ? `L{e^{-${a}t}} = 1/(s+${a})`
    : funcType === 'step'
    ? `L{u(t-${a})} = e^{-${a}s}/s`
    : `L{sin(${a}t)} = ${a}/(s²+${a * a})`

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="flex gap-2 flex-wrap justify-center">
        {([
          ['exp', 'e^{-at}'],
          ['step', 'u(t-a)'],
          ['sin', 'sin(at)'],
        ] as const).map(([k, label]) => (
          <button key={k} onClick={() => setFuncType(k as any)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${funcType === k ? 'bg-violet-500 text-white' : 'bg-white/10 text-slate-400'}`}>
            <span dir="ltr">{label}</span>
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="240" height="160">
        <line x1={ox} y1="10" x2={ox} y2={oy + 3} stroke="#334155" strokeWidth="1.5" />
        <line x1={ox} y1={oy} x2={W - 8} y2={oy} stroke="#334155" strokeWidth="1.5" />
        <text x={W - 12} y={oy + 10} fill="#475569" fontSize="9">t</text>
        <text x={ox + 2} y="18" fill="#475569" fontSize="9">f(t)</text>
        <polyline points={pts} fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
      </svg>

      <div className="w-full px-3">
        <div className="flex justify-between text-xs text-slate-400 mb-0.5">
          <span>פרמטר a</span>
          <span className="text-violet-400 font-bold">{a}</span>
        </div>
        <input type="range" min={0.5} max={3} step={0.5} value={a}
          onChange={e => setA(+e.target.value)}
          className="w-full accent-violet-500 h-1.5 rounded-full" />
        <div className="bg-white/10 rounded-xl p-2 text-center text-xs mt-2 font-mono text-violet-300" dir="ltr">
          {laplaceDesc}
        </div>
      </div>
    </div>
  )
}

const step1 = (
  <PatternStep
    scenario={<>
      פתור:{' '}
      <span className="font-mono text-emerald-300" dir="ltr">y'' - 3y' + 2y = eᵗ, y(0)=0, y'(0)=1</span>
      <br />כיצד תגש?
    </>}
    options={[
      { label: 'לפלס: L{y\'\'} = s²Y-sy(0)-y\'(0). פתור ל-Y(s)', correct: true },
      { label: 'פתור כ-NH עם פוליגמה', correct: false, desc: 'אפשרי, אבל לפלס הרבה יותר קל עם תנאי התחלה' },
      { label: 'פרד ל-h + p', correct: false, desc: 'שיטה ישנה — לפלס ממיר הכל לאלגברה' },
      { label: 'מצא ע"ע ו-ו"ע', correct: false },
    ]}
    correctFeedback={"נכון! לפלס ממיר מד\"ר לאלגברה. L{y''} = s²Y-s·0-1 = s²Y-1. פתור Y(s), חזור עם L⁻¹."}
  />
)

const step2 = (
  <PrincipleStep
    heading="התמרת לפלס — כלים:"
    items={[
      {
        title: 'טבלת לפלס חשובים',
        content: <div dir="ltr" className="font-mono text-xs space-y-0.5">
          <p className="text-violet-300">L{'{1}'} = 1/s</p>
          <p className="text-violet-300">L{'{eᵃᵗ}'} = 1/(s-a)</p>
          <p className="text-violet-300">L{'{sin(at)}'} = a/(s²+a²)</p>
          <p className="text-violet-300">L{'{cos(at)}'} = s/(s²+a²)</p>
          <p className="text-violet-300">L{'{tⁿ}'} = n!/s^{'{n+1}'}</p>
          <p className="text-violet-300">L{'{u(t-a)·f(t-a)}'} = e^{'{-as}'}·F(s)</p>
          <p className="text-violet-300">L{'{δ(t-a)}'} = e^{'{-as}'}</p>
        </div>,
        accent: 'text-violet-400',
      },
      {
        title: 'נגזרות ב-t-מרחב',
        content: <>
          <Formula c="L{y'} = sY - y(0),  L{y''} = s²Y - sy(0) - y'(0)" color="text-blue-300" />
          <span className="text-slate-400 text-xs">תנאי התחלה נכנסים אוטומטית!</span>
        </>,
        accent: 'text-blue-400',
      },
      {
        title: 'פירוק לשברים חלקיים',
        content: <>
          <Formula c="Y(s) = A/(s-a) + B/(s-b) → L⁻¹ = Aeᵃᵗ + Beᵇᵗ" color="text-emerald-300" />
          <span className="text-slate-400 text-xs">שיטה: כפל משני צידי בגורם, הצב שורש</span>
        </>,
        accent: 'text-emerald-400',
      },
    ]}
  />
)

const step3 = (
  <WorkedExample
    examLabel="מבחן HIT — 2024 (לפלס)"
    problem={<>
      פתור עם לפלס:{' '}
      <span className="font-mono text-blue-300" dir="ltr">y'' - 3y' + 2y = eᵗ·u(t), y(0)=0, y'(0)=1</span>
    </>}
    hint="L{y''}-3L{y'}+2L{y} = 1/(s-1). הצב תנאי התחלה, פתור ל-Y, פרק לשברים."
    solution={[
      { label: 'הפעל לפלס:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">(s²Y-1) - 3sY + 2Y = 1/(s-1){'\n'}Y(s²-3s+2) = 1 + 1/(s-1){'\n'}Y·(s-1)(s-2) = 1 + 1/(s-1)</pre> },
      { label: 'Y(s):', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">Y = (s-1+1)/[(s-1)²(s-2)]{'\n'}= s/[(s-1)²(s-2)]</pre> },
      { label: 'שברים חלקיים + L⁻¹:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">Y = A/(s-1) + B/(s-1)² + C/(s-2){'\n'}A=2, B=-1, C=-2{'\n'}y(t) = 2eᵗ - teᵗ - 2e²ᵗ</pre> },
    ]}
  />
)

const quiz: QuizQuestion[] = [
  {
    question: 'L{e²ᵗsin(3t)} = ?',
    options: ['3/((s-2)²+9)', '3/(s²+9)', '(s-2)/((s-2)²+9)', '3/(s²-4s+13)'],
    correct: 0,
    explanation: 'היסט ב-s: L{eᵃᵗf(t)} = F(s-a). L{sin(3t)}=3/(s²+9). עם a=2: 3/((s-2)²+9).',
  },
  {
    question: 'L{u(t-3)·(t-3)²} = ?',
    options: ['2e^{-3s}/s³', 'e^{-3s}·2/s³', 'שתי האפשרויות שוות', '6/s³'],
    correct: 2,
    explanation: 'L{u(t-a)f(t-a)} = e^{-as}F(s). כאן f(t)=t², F(s)=2/s³. → 2e^{-3s}/s³.',
  },
  {
    question: 'L{δ(t-2)} = ?',
    options: ['e^{-2s}', '1/s · e^{-2s}', '2/s', 'e^{-2s}/s'],
    correct: 0,
    explanation: 'L{δ(t-a)} = e^{-as}. דלתא = דחיפה רגעית. כאן a=2 → e^{-2s}.',
  },
]

const greenNote = [
  'L{eᵃᵗ}=1/(s-a), L{sin(at)}=a/(s²+a²), L{cos}=s/(s²+a²), L{tⁿ}=n!/s^{n+1}',
  'L{y\'}=sY-y(0), L{y\'\'}=s²Y-sy(0)-y\'(0) — תנאי התחלה אוטומטיים',
  'היסט: L{eᵃᵗf(t)}=F(s-a). פרסוול-לפלס: L{u(t-a)f(t-a)}=e^{-as}F(s)',
  'L{δ(t-a)}=e^{-as}. פרק לשברים חלקיים → L⁻¹ לכל גורם',
]

const guides: GuideSection[] = [
  {
    title: 'טבלת לפלס',
    content: <div className="space-y-1 text-sm" dir="ltr">
      {[
        ['1', '1/s'],
        ['eᵃᵗ', '1/(s-a)'],
        ['tⁿ', 'n!/s^{n+1}'],
        ['sin(at)', 'a/(s²+a²)'],
        ['cos(at)', 's/(s²+a²)'],
        ['u(t-a)f(t-a)', 'e^{-as}F(s)'],
        ['δ(t-a)', 'e^{-as}'],
        ['eᵃᵗf(t)', 'F(s-a)'],
        ["y'", 'sY-y(0)'],
        ["y''", 's²Y-sy(0)-y\'(0)'],
      ].map(([f, F]) => (
        <div key={f} className="bg-white/5 rounded p-1 flex justify-between">
          <span className="text-violet-300 font-mono text-xs">{f}</span>
          <span className="text-slate-300 font-mono text-xs">{F}</span>
        </div>
      ))}
    </div>,
  },
  { title: 'מהרצאה', content: <div className="text-slate-400 text-sm p-3 border border-dashed border-slate-700 rounded-xl text-center"><p>📖 סיכום ההרצאה יתווסף כאן</p></div> },
]

const intro = <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
  <p>
    לפלס מממיר <span className="text-violet-400 font-semibold">מד"ר לאלגברה</span>.
    במקום לפתור משוואה דיפרנציאלית — פותרים משוואה רגילה ב-s.
  </p>
  <Formula c="L{y''} - 3L{y'} + 2L{y} = L{eᵗ}  →  פתור Y(s)  →  L⁻¹" color="text-violet-300" />
  <p>
    ב<span className="text-yellow-400 font-semibold">כל מבחן</span>: פתרון מד"ר עם לפלס + u(t) + δ(t).
    תנאי התחלה נכנסים <span className="text-white font-semibold">אוטומטית</span>!
  </p>
</div>

const theory: TheoryCard = {
  summary: 'לפלס הופך מד"ר לאלגברה: L{y\'} = sY-y(0), L{y\'\'} = s²Y-sy(0)-y\'(0). פותרים ל-Y(s) עם שברים חלקיים, ואחר כך L⁻¹ חזרה. u(t-a) = פונקציית היסט, δ(t) = אימפולס. L{u(t-a)·f(t-a)} = e^(-as)·F(s).',
  formulas: [
    { label: 'L{y\'}', tex: '\\mathcal{L}\\{y\'\\} = sY(s) - y(0)' },
    { label: 'היסט', tex: '\\mathcal{L}\\{u(t-a)f(t-a)\\} = e^{-as}F(s)' },
  ],
  when: 'קבל מד"ר עם תנאי התחלה → לפלס את הכל → פתור ל-Y → שברים חלקיים → L⁻¹',
}

const practice: QuizQuestion[] = [
  {
    question: 'L{e^(at)} = ?',
    options: ["1/(s-a)", "1/(s+a)", "a/(s²+a²)", "s/(s²+a²)"],
    correct: 0,
    explanation: "L{e^(at)} = ∫₀^∞ e^(at)e^(-st)dt = 1/(s-a) (עבור s>a)",
  },
  {
    question: 'L{y\'} = sY(s) - y(0). אם y\'(0)=2, y(0)=1 — מה L{y\'\'}?',
    options: [
      "s²Y - s - 2",
      "s²Y - s",
      "sY - 1",
      "s²Y - 2s - 1",
    ],
    correct: 0,
    explanation: "L{y''} = s²Y(s) - sy(0) - y'(0) = s²Y - s·1 - 2 = s²Y - s - 2",
  },
  {
    question: 'מה L{δ(t)}?',
    options: ["1/s", "1", "s", "e^(-s)"],
    correct: 1,
    explanation: "L{δ(t)} = 1. האימפולס ב-t=0 נותן 1 בתחום s.",
  },
  {
    question: 'שברים חלקיים: Y(s) = 1/((s-1)(s-2)). כתוב כ-A/(s-1) + B/(s-2). מה A?',
    options: ["-1", "1", "2", "-2"],
    correct: 0,
    explanation: "A = lim(s→1)(s-1)Y = 1/(1-2) = -1",
  },
]

export default function LaplaceTransform({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="series-laplace"
    title="התמרת לפלס"
    subtitle={"פתרון מד\"ר, u(t), δ(t), שברים חלקיים"}
    intro={intro} theory={theory} step1={step1} step2={step2} step3={step3}
    SimulatorComponent={Sim} quizQuestions={quiz} practiceQuestions={practice}
    greenNote={greenNote} guides={guides}
    onBack={onBack}
  />
}
