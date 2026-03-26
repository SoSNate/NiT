import React, { useState } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, FormulaBlock, Note } from '../../components/StepHelpers'
import type { QuizQuestion, GuideSection } from '../../types'

function Sim({ currentStep }: { currentStep: number }) {
  const [terms, setTerms] = useState(4)
  const [funcType, setFuncType] = useState<'sin' | 'ex' | 'ln'>('sin')

  const W = 240, H = 170, ox = W / 2, oy = H / 2

  const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1)

  const evalTaylor = (x: number): number => {
    let sum = 0
    for (let k = 0; k < terms; k++) {
      if (funcType === 'sin') sum += (Math.pow(-1, k) * Math.pow(x, 2 * k + 1)) / factorial(2 * k + 1)
      else if (funcType === 'ex') sum += Math.pow(x, k) / factorial(k)
      else if (funcType === 'ln') {
        if (k === 0) continue
        sum += (Math.pow(-1, k + 1) * Math.pow(x, k)) / k
      }
    }
    return sum
  }

  const evalExact = (x: number): number => {
    if (funcType === 'sin') return Math.sin(x)
    if (funcType === 'ex') return Math.exp(x)
    if (funcType === 'ln') return x > -1 ? Math.log(1 + x) : 0
    return 0
  }

  const range = funcType === 'ex' ? [-1.5, 1.5] : [-3.5, 3.5]
  const scale = funcType === 'ex' ? 50 : 25

  const makePoints = (fn: (x: number) => number) =>
    Array.from({ length: 80 }, (_, i) => {
      const x = range[0] + (i / 79) * (range[1] - range[0])
      const y = fn(x)
      return `${ox + x * scale},${oy - Math.max(-4, Math.min(4, y)) * 30}`
    }).join(' ')

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="flex gap-2 flex-wrap justify-center">
        {([['sin', 'sin(x)'], ['ex', 'eˣ'], ['ln', 'ln(1+x)']] as const).map(([k, label]) => (
          <button key={k} onClick={() => setFuncType(k as any)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${funcType === k ? 'bg-yellow-500 text-black' : 'bg-white/10 text-slate-400'}`}>
            <span dir="ltr">{label}</span>
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="240" height="170">
        <line x1="10" y1={oy} x2={W - 10} y2={oy} stroke="#334155" strokeWidth="1.5" />
        <line x1={ox} y1="10" x2={ox} y2={H - 10} stroke="#334155" strokeWidth="1.5" />
        <polyline points={makePoints(evalExact)} fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="5,3" />
        <polyline points={makePoints(evalTaylor)} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
        <text x="12" y="18" fill="#64748b" fontSize="8">פונקציה מקורית</text>
        <text x="12" y="28" fill="#f59e0b" fontSize="8">קירוב טיילור ({terms} איברים)</text>
      </svg>

      <div className="w-full px-3">
        <div className="flex justify-between text-xs text-slate-400 mb-0.5">
          <span>מספר איברים</span>
          <span className="text-yellow-400 font-bold">{terms}</span>
        </div>
        <input type="range" min={1} max={8} step={1} value={terms}
          onChange={e => setTerms(+e.target.value)}
          className="w-full accent-yellow-500 h-1.5 rounded-full" />
      </div>
    </div>
  )
}

const step1 = (
  <PatternStep
    scenario={<>
      <span className="font-mono text-emerald-300" dir="ltr">{'Σ_{n=0}^∞ (2x)ⁿ/n!'}</span>
      {' '}— מה הפונקציה? מה תחום ההתכנסות?
    </>}
    options={[
      { label: 'e^{2x}, תחום: (-∞,∞)', correct: true },
      { label: 'e^x/2, תחום: (-1,1)', correct: false },
      { label: 'ln(1+2x), תחום: (-1/2,1/2]', correct: false, desc: 'זה הטיילור של ln(1+x) עם x→2x' },
      { label: 'sin(2x), תחום: (-∞,∞)', correct: false },
    ]}
    correctFeedback="נכון! eˣ = Σxⁿ/n!. עם x→2x: e^{2x} = Σ(2x)ⁿ/n!. eˣ מתכנס לכל x → ℝ."
  />
)

const step2 = (
  <PrincipleStep
    heading="טורי חזקות וטיילור:"
    items={[
      {
        title: 'רדיוס התכנסות',
        content: <>
          <Formula c="R = 1 / lim|aₙ/aₙ₊₁|  (מבחן יחס הפוך)" color="text-yellow-300" />
          <span className="text-slate-400 text-xs">בדוק קצוות ±R בנפרד (לייבניץ / p-טור)</span>
        </>,
        accent: 'text-yellow-400',
      },
      {
        title: 'מקלורן חשובים (בעל פה!)',
        content: <div dir="ltr" className="font-mono text-xs space-y-0.5">
          <p className="text-blue-300">eˣ = Σ xⁿ/n! , R=∞</p>
          <p className="text-blue-300">{'sin(x) = Σ (-1)ⁿx^{2n+1}/(2n+1)! , R=∞'}</p>
          <p className="text-blue-300">{'cos(x) = Σ (-1)ⁿx^{2n}/(2n)! , R=∞'}</p>
          <p className="text-blue-300">{'ln(1+x) = Σ (-1)^{n+1}xⁿ/n , R=1'}</p>
          <p className="text-blue-300">1/(1-x) = Σ xⁿ , |x|&lt;1</p>
        </div>,
        accent: 'text-blue-400',
      },
      {
        title: 'טיילור סביב x=a',
        content: <>
          <FormulaBlock
            formula="f(x) = Σ f⁽ⁿ⁾(a)/n! · (x-a)ⁿ"
            verbal="הרעיון: לקרב פונקציה מסובכת ע״י פולינום שמסכים איתה בכל הנגזרות בנקודה a. f⁽ⁿ⁾(a)/n! הוא ה'משקל' של (x-a)ⁿ — כמה כל חזקה תורמת. ה-n! במכנה מגיע מהנגזרות החוזרות: (xⁿ)⁽ⁿ⁾=n!. מקלורן = a=0."
            color="text-emerald-300"
          />
          <span className="text-slate-400 text-xs">מקלורן = טיילור סביב a=0</span>
        </>,
        accent: 'text-emerald-400',
      },
    ]}
  />
)

const step3 = (
  <WorkedExample
    examLabel="מבחן HIT — 2024 (טור חזקות)"
    problem={<>
      מצא רדיוס התכנסות ותחום:{' '}
      <span className="font-mono text-blue-300" dir="ltr">{'Σ_{n=1}^∞ n²(x-2)ⁿ/3ⁿ'}</span>
    </>}
    hint="זהה aₙ = n²/3ⁿ. מבחן יחס: R = 3. בדוק x=5 ו-x=-1."
    solution={[
      { label: 'מבחן יחס:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">{'|a_{n+1}|/|aₙ| = (n+1)²/(3ⁿ⁺¹) · 3ⁿ/n²\n= (n+1)²/n² · 1/3 → 1/3\nR = 1/(1/3) = 3'}</pre> },
      { label: 'תחום:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">{'|x-2| < 3 → -1 < x < 5\nx=5: Σn² → ∞ (מתבדר)\nx=-1: Σ(-1)ⁿn² → מתבדר\nתחום: (-1, 5)'}</pre> },
    ]}
  />
)

const quiz: QuizQuestion[] = [
  {
    question: 'רדיוס התכנסות של Σ xⁿ/n:',
    options: ['R=1', 'R=∞', 'R=e', 'R=0'],
    correct: 0,
    explanation: 'lim|aₙ/aₙ₊₁| = lim (n+1)/n = 1 → R=1. בקצוות: x=1 → Σ1/n מתבדר; x=-1 → לייבניץ, מתכנס. תחום: [-1,1).',
  },
  {
    question: 'sin(x) = Σ_{n=0}^∞ (-1)ⁿx^?/(?)!',
    options: ['x^{2n+1}/(2n+1)!', 'x^{2n}/(2n)!', 'x^n/n!', '(-1)^n x^n/n!'],
    correct: 0,
    explanation: 'sin(x) = x - x³/3! + x⁵/5! - ... = Σ (-1)ⁿ x^{2n+1}/(2n+1)!',
  },
  {
    question: 'eˣ מוכפל ב-x². מה הטור?',
    options: ['Σ x^{n+2}/n!', 'Σ xⁿ·x²/n!', 'שתי התשובות שקולות', 'לא ניתן לפשט'],
    correct: 2,
    explanation: 'x²·eˣ = x²·Σxⁿ/n! = Σx^{n+2}/n!. ניתן גם לכתוב Σxⁿ·x²/n! — אותו דבר.',
  },
]

const greenNote = [
  'eˣ=Σxⁿ/n!, sin=Σ(-1)ⁿx^{2n+1}/(2n+1)!, cos=Σ(-1)ⁿx^{2n}/(2n)! — בעל פה!',
  'ln(1+x)=Σ(-1)^{n+1}xⁿ/n, R=1. 1/(1-x)=Σxⁿ, |x|<1',
  'R = lim|aₙ/aₙ₊₁|. בדוק קצוות ±R בנפרד!',
  'החלפה: אם יודע Σaₙxⁿ, הצב x→ax, x→-x, גזור, אינטגרל',
]

const guides: GuideSection[] = [
  {
    title: 'מקלורן',
    content: <div className="space-y-1 text-sm" dir="ltr">
      {[
        ['eˣ', 'Σ xⁿ/n!', '∞'],
        ['sin(x)', 'Σ (-1)ⁿx^{2n+1}/(2n+1)!', '∞'],
        ['cos(x)', 'Σ (-1)ⁿx^{2n}/(2n)!', '∞'],
        ['ln(1+x)', 'Σ (-1)^{n+1}xⁿ/n', '1'],
        ['1/(1-x)', 'Σ xⁿ', '1'],
        ['arctan(x)', 'Σ (-1)ⁿx^{2n+1}/(2n+1)', '1'],
      ].map(([f, series, R]) => (
        <div key={f} className="bg-white/5 rounded p-1.5 flex justify-between items-center">
          <span className="text-yellow-400 font-mono text-xs">{f}</span>
          <span className="text-slate-300 font-mono text-xs">{series}</span>
          <span className="text-blue-400 text-xs">R={R}</span>
        </div>
      ))}
    </div>,
  },
  {
    title: 'רדיוס התכנסות',
    content: <div className="space-y-2 text-xs text-slate-300">
      <div className="bg-white/5 rounded-xl p-3 space-y-1">
        <p className="text-emerald-400 font-bold">נוסחת הרדיוס</p>
        <p className="font-mono text-slate-200" dir="ltr">R = lim|aₙ/aₙ₊₁| = 1/limsup ⁿ√|aₙ|</p>
        <p className="text-slate-400">R=∞: מתכנס לכל x. R=0: רק x=a. 0{'<'}R{'<'}∞: בדוק קצוות.</p>
      </div>
      <div className="bg-white/5 rounded-xl p-2 text-xs space-y-1">
        <p className="text-yellow-400 font-bold">קצוות ±R — בדוק בנפרד!</p>
        <p className="text-slate-300">הצב x=a+R ו-x=a-R. בדוק התכנסות עם לייבניץ/p-טור.</p>
      </div>
      <Note color="blue" children={<>המבחן שואל: "מצא את תחום ההתכנסות" — כולל הכרעה על הקצוות.</>} />
    </div>,
  },
  {
    title: 'שיטות',
    content: <div className="space-y-2 text-xs text-slate-300">
      <p className="text-emerald-400 font-bold">מניפולציות שימושיות:</p>
      <div className="bg-white/5 rounded-xl p-2 space-y-1 font-mono text-slate-300 text-[11px]" dir="ltr">
        <p>eˣ → e^(x²): הצב x→x²</p>
        <p>1/(1-x) → 1/(1+x²): הצב x→-x²</p>
        <p>גזירה: (1/(1-x))' = 1/(1-x)² → Σ n·xⁿ⁻¹</p>
        <p>אינטגרל: ∫1/(1-x)dx = -ln(1-x) → Σxⁿ/n</p>
      </div>
      <Note color="yellow" children={<>טיילור ב-x=a: f(x) = Σ f⁽ⁿ⁾(a)/n! · (x-a)ⁿ. מקלורן = a=0.</>} />
    </div>,
  },
  {
    title: 'שגיאת לגראנג',
    content: <div className="space-y-2 text-xs text-slate-300">
      <div className="bg-white/5 rounded-xl p-3 space-y-1">
        <p className="text-purple-400 font-bold">שאריות לגראנג</p>
        <p className="font-mono text-slate-200" dir="ltr">|Rₙ| ≤ M·|x-a|^(n+1) / (n+1)!</p>
        <p className="text-slate-400">M = מקסימום |f⁽ⁿ⁺¹⁾| בקטע [a,x]. שואלים: כמה איברים צריך ל-|error| {'<'} 0.001?</p>
      </div>
      <p className="text-emerald-400 font-bold">דוגמה:</p>
      <p className="text-slate-300">eˣ ≈ 1+x+x²/2 סביב x=0. R₂ ≤ e·|x|³/6. לx=0.1: R₂ ≤ e·0.001/6 {'<'} 0.0005.</p>
    </div>,
  },
  {
    title: 'במבחן HIT',
    content: <div className="space-y-2 text-xs text-slate-300">
      <p className="text-emerald-400 font-bold">שאלה טיפוסית:</p>
      <p className="font-mono text-slate-200">קרב sin(x) ב-3 איברים. מה שגיאה ב-x=π/6?</p>
      <div className="bg-white/5 rounded-xl p-2 space-y-1">
        <p>sin(x) ≈ x - x³/6 + x⁵/120 (3 איברים)</p>
        <p>|R₃| ≤ |x|⁷/5040 ב-x=π/6 ≈ 0.524</p>
        <p>|R₃| ≤ 0.524⁷/5040 ≈ 1.6×10⁻⁶ — דיוק מצוין</p>
      </div>
      <Note color="emerald" children={<>בלי לחשב sin(π/6) — פשוט מעריכים את השארית עם לגראנג.</>} />
    </div>,
  },
]

const intro = <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
  <p>
    טור חזקות הוא <span className="text-yellow-400 font-semibold">פולינום אינסופי</span>.
    5 טורים עליך לדעת בעל פה — הם מופיעים בכל מבחן.
  </p>
  <Formula c="eˣ = 1 + x + x²/2! + x³/3! + ..." color="text-yellow-300" />
  <p>
    רדיוס התכנסות R — המרחק ממרכז עד שהטור "מתפרק".
    תמיד בדוק <span className="text-white font-semibold">קצוות</span> בנפרד.
  </p>
</div>

const theory: TheoryCard = {
  summary: 'טור חזקות Σcₙ(x-a)ⁿ הוא פולינום אינסופי סביב נקודה a. יש לו רדיוס התכנסות R — בתוך |x-a|<R הטור מתכנס, מחוצה לו מתבדר. 5 טורי מקלורן חובה: eˣ, sin(x), cos(x), 1/(1-x), ln(1+x). כדי למצוא R — מבחן יחס על המקדמים.',
  formulas: [
    { label: 'eˣ', tex: 'e^x = \\sum_{n=0}^\\infty \\frac{x^n}{n!},\\quad R=\\infty', verbal: 'הטור הכי חשוב — מתכנס לכל x. הn! גדל מהר מאוד, לכן האיברים הולכים לאפס מהר. הצבה: e^(x²) = Σx²ⁿ/n!, e^(-x) = Σ(-1)ⁿxⁿ/n!' },
    { label: 'רדיוס התכנסות', tex: 'R = \\lim_{n\\to\\infty}\\left|\\frac{c_n}{c_{n+1}}\\right|', verbal: '|x-a|<R → הטור מתכנס. |x-a|>R → מתבדר. בקצוות ±R — בדוק בנפרד (לפעמים מתכנס, לפעמים לא). R=∞ = מתכנס לכל x.' },
  ],
  when: 'מקלורן = טיילור סביב 0. לפתח פונקציה = זהה את הטור הבסיסי + החלפת משתנה',
}

const practice: QuizQuestion[] = [
  {
    question: 'מהי הצורה הנכונה של sin(x) כטור מקלורן?',
    options: [
      "Σ x^n/n!",
      "Σ (-1)ⁿ x^(2n+1)/(2n+1)!",
      "Σ (-1)ⁿ x^(2n)/(2n)!",
      "1 - x²/2 + x⁴/24...",
    ],
    correct: 1,
    explanation: "sin(x) = x - x³/3! + x⁵/5! - ... = Σ(-1)ⁿ·x^(2n+1)/(2n+1)!",
  },
  {
    question: 'מהו R של 1/(1-x) = Σxⁿ?',
    options: ["0", "1", "∞", "e"],
    correct: 1,
    explanation: "הטור 1/(1-x) = Σxⁿ מתכנס עבור |x|<1, R=1",
  },
  {
    question: 'מה הטור של e^(-x²)?',
    options: [
      "Σ (-1)ⁿ x^(2n)/n!",
      "Σ x^(2n)/n!",
      "Σ (-1)ⁿ x^n/n!",
      "Σ x^n/(2n)!",
    ],
    correct: 0,
    explanation: "מחליפים x ב-(-x²) בטור של eˣ: e^(-x²) = Σ(-x²)ⁿ/n! = Σ(-1)ⁿx^(2n)/n!",
  },
]

export default function PowerSeries({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="series-power"
    title="טורי חזקות וטיילור"
    subtitle="מקלורן, רדיוס התכנסות, החלפות"
    intro={intro} theory={theory} step1={step1} step2={step2} step3={step3}
    SimulatorComponent={Sim} quizQuestions={quiz} practiceQuestions={practice}
    greenNote={greenNote} guides={guides}
    onBack={onBack}
  />
}
