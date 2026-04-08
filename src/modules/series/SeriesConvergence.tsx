import React, { useState } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, FormulaBlock, Note } from '../../components/StepHelpers'
import type { QuizQuestion, GuideSection } from '../../types'

function Sim({ currentStep }: { currentStep: number }) {
  const [seriesType, setSeriesType] = useState<'ratio' | 'geometric' | 'leibniz'>('ratio')
  const [n, setN] = useState(5)

  const W = 240, H = 160, ox = 30, oy = H - 20

  // Partial sums
  const terms = Array.from({ length: n }, (_, k) => {
    if (seriesType === 'geometric') return Math.pow(0.5, k + 1)
    if (seriesType === 'ratio') return Math.pow(k + 1, 2) / Math.pow(2, k + 1)
    return Math.pow(-1, k) / (k + 1)  // leibniz
  })

  const partialSums = terms.reduce<number[]>((acc, t, i) => {
    acc.push((acc[i - 1] ?? 0) + t)
    return acc
  }, [])

  const maxS = Math.max(...partialSums.map(Math.abs), 1)

  const pts = partialSums.map((s, i) => {
    const px = ox + (i / (n - 1)) * (W - ox - 15)
    const py = oy - (s / maxS) * (H - 35)
    return `${px},${py}`
  }).join(' ')

  const limitVal = seriesType === 'geometric' ? '1 (הנד"ח=1/2<1)' : seriesType === 'ratio' ? 'מתכנס (יחס→1/2)' : 'מתכנס (לייבניץ)'
  const color = '#10b981'

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="flex gap-2 flex-wrap justify-center">
        {([
          ['ratio', 'מבחן יחס'],
          ['geometric', 'הנדסי'],
          ['leibniz', 'לייבניץ'],
        ] as const).map(([k, label]) => (
          <button key={k} onClick={() => setSeriesType(k as any)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${seriesType === k ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'}`}>
            {label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="240" height="160">
        <line x1={ox} y1="10" x2={ox} y2={oy + 3} stroke="#334155" strokeWidth="1.5" />
        <line x1={ox} y1={oy} x2={W - 10} y2={oy} stroke="#334155" strokeWidth="1.5" />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" />
        {partialSums.map((s, i) => (
          <circle key={i} cx={ox + (i / Math.max(n - 1, 1)) * (W - ox - 15)}
            cy={oy - (s / maxS) * (H - 35)} r="3" fill={color} />
        ))}
        <text x={ox + 4} y="18" fill="#64748b" fontSize="8">S_n (סכום חלקי)</text>
      </svg>

      <div className="w-full px-3">
        <div className="flex justify-between text-xs text-slate-400 mb-0.5">
          <span>n (מספר איברים)</span>
          <span className="text-emerald-400 font-bold">{n}</span>
        </div>
        <input type="range" min={2} max={15} step={1} value={n}
          onChange={e => setN(+e.target.value)}
          className="w-full accent-emerald-500 h-1.5 rounded-full" />
        <div className="bg-white/10 rounded-xl p-2 text-center text-xs mt-2 text-slate-300">
          {limitVal}
        </div>
      </div>
    </div>
  )
}

const step1 = (
  <PatternStep
    scenario={<>
      <span className="font-mono text-emerald-300" dir="ltr">Σ n²/2ⁿ</span>
      {' '}— האם הטור מתכנס? כיצד תבדוק?
    </>}
    options={[
      { label: 'מבחן יחס: lim |a_{n+1}/a_n| < 1 → מתכנס', correct: true },
      { label: 'מבחן שורש: lim ⁿ√|aₙ| < 1 → מתכנס', correct: false, desc: 'נכון גם, אבל יחס קל יותר כאן' },
      { label: 'השווה לטור הרמוני', correct: false, desc: 'הרמוני שולי — לא רלוונטי לכאן' },
      { label: 'מבחן האיבר הכללי: lim aₙ ≠ 0 → מתבדר', correct: false, desc: 'תנאי הכרחי, לא מספיק' },
    ]}
    correctFeedback="נכון! a_{n+1}/a_n = (n+1)²/(2ⁿ⁺¹) · 2ⁿ/n² = (n+1)²/(2n²) → 1/2 < 1. הטור מתכנס!"
  />
)

const step2 = (
  <PrincipleStep
    heading="מבחני התכנסות:"
    items={[
      {
        title: 'מבחן יחס (ד\'אלמבר)',
        content: <>
          <FormulaBlock
            formula="L = lim |a_{n+1}/aₙ|"
            verbal="שואלים: כמה גדול האיבר הבא ביחס לקודם? L<1 → כל איבר קטן מהקודם בגורם קבוע, הסכום מתכנס. L>1 → האיברים גדלים, מתבדר. L=1 → המבחן עיוור — נסה p-טור או השוואה. הכי שימושי כשיש n! או rⁿ."
            color="text-emerald-300"
          />
          <span className="text-slate-400 text-xs">מצוין כשיש עצרת (!), חזקות, מיסוף</span>
        </>,
        accent: 'text-emerald-400',
      },
      {
        title: 'מבחן שורש (קושי)',
        content: <>
          <FormulaBlock
            formula="L = lim ⁿ√|aₙ|"
            verbal="לוקחים שורש n-י של האיבר — הגבול הוא 'מהירות' הדעיכה. L<1 → מתכנס. הכי יעיל כשהאיבר הוא (משהו)ⁿ כי אז ⁿ√(xⁿ)=x ומקבלים תשובה ישירות."
            color="text-blue-300"
          />
          <span className="text-slate-400 text-xs">מצוין כשיש aₙ = f(n)ⁿ</span>
        </>,
        accent: 'text-blue-400',
      },
      {
        title: 'לייבניץ (טורים מתחלפים)',
        content: <>
          <FormulaBlock
            formula="Σ(-1)ⁿbₙ מתכנס אם bₙ↓0"
            verbal="בטור מתחלף (+ - + - ...) אם האיברים (בלי סימן) יורדים מונוטונית לאפס — הטור מתכנס. הסכומים החלקיים מתנדנדים סביב הגבול כמו מטוטלת שמאטה. תנאי ההכרחי: bₙ→0."
            color="text-purple-300"
          />
          <Note color="yellow" children={<>אחרי לייבניץ: בדוק התכנסות מוחלטת/תנאית</>} />
        </>,
        accent: 'text-purple-400',
      },
    ]}
  />
)

const step3 = (
  <WorkedExample
    examLabel="מבחן HIT — 2024 (טורים)"
    problem={<>
      בדוק התכנסות:{' '}
      <span className="font-mono text-blue-300" dir="ltr">{'Σ_{n=1}^∞ (-1)ⁿ · n/(n²+1)'}</span>
    </>}
    hint="1) בדוק aₙ = n/(n²+1) → 0 ומונוטוני. 2) בדוק התכנסות מוחלטת עם מבחן השוואה."
    solution={[
      { label: 'לייבניץ:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">{'bₙ = n/(n²+1) ↓ 0 (בדוק: bₙ > bₙ₊₁, lim=0)\n→ הטור מתכנס (לייבניץ) ✓'}</pre> },
      { label: 'התכנסות מוחלטת:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">Σ |aₙ| = Σ n/(n²+1) ~ Σ 1/n (הרמוני){'\n'}→ מתבדר → התכנסות תנאית בלבד</pre> },
    ]}
  />
)

export const quiz: QuizQuestion[] = [
  {
    question: 'Σ n!/nⁿ — מבחן יחס נותן:',
    options: ['L = 1/e < 1 → מתכנס', 'L = 1 → לא ניתן לסיווג', 'L = e > 1 → מתבדר', 'L = 0'],
    correct: 0,
    explanation: 'a_{n+1}/aₙ = (n+1)!/(n+1)^{n+1} · nⁿ/n! = nⁿ/(n+1)ⁿ = (n/(n+1))ⁿ = (1-1/(n+1))ⁿ → 1/e < 1.',
  },
  {
    question: 'טור הרמוני Σ1/n:',
    options: ['מתבדר', 'מתכנס לln(2)', 'מתכנס לπ²/6', 'מתכנס ל-1'],
    correct: 0,
    explanation: 'Σ1/n מתבדר! (מבחן אינטגרל: ∫1/x dx = ln(x) → ∞). אבל Σ1/n² = π²/6 כן מתכנס.',
  },
  {
    question: 'Σ(-1)ⁿ/√n מתכנס:',
    options: ['התכנסות תנאית', 'התכנסות מוחלטת', 'מתבדר', 'לא ניתן לקבוע'],
    correct: 0,
    explanation: 'לייבניץ: 1/√n↓0 → מתכנס. אבל Σ1/√n ~ Σ1/n^{1/2} מתבדר (p=1/2≤1) → תנאי.',
  },
]

const greenNote = [
  'יחס: L=lim|a_{n+1}/aₙ|. L<1→מתכנס, L>1→מתבדר, L=1→לא יודעים',
  'שורש: L=lim ⁿ√|aₙ|. L<1→מתכנס. טוב לביטויים aₙ=f(n)ⁿ',
  'לייבניץ: Σ(-1)ⁿbₙ מתכנס אם bₙ↓0. אחר כך בדוק מוחלטת vs תנאית',
  'p-טור: Σ1/nᵖ — מתכנס ⟺ p>1. הרמוני Σ1/n מתבדר!',
]

const guides: GuideSection[] = [
  {
    title: 'מבחנים',
    content: <div className="space-y-2 text-sm" dir="ltr">
      {[
        ['Ratio (d\'Alembert)', 'L = lim|a_{n+1}/aₙ|', 'L<1: conv, L>1: div'],
        ['Root (Cauchy)', 'L = lim ⁿ√|aₙ|', 'L<1: conv, L>1: div'],
        ['Leibniz', 'Σ(-1)ⁿbₙ, bₙ↓0', 'converges'],
        ['p-Series', 'Σ 1/nᵖ', 'p>1: conv, p≤1: div'],
        ['Comparison', 'aₙ ≤ bₙ, Σbₙ conv', '→ Σaₙ conv'],
      ].map(([name, test, result]) => (
        <div key={name} className="bg-white/5 rounded-xl p-1.5 space-y-0.5">
          <p className="text-emerald-400 text-xs font-bold">{name}</p>
          <p className="font-mono text-xs text-slate-300">{test}</p>
          <p className="font-mono text-xs text-blue-400">{result}</p>
        </div>
      ))}
    </div>,
  },
  {
    title: 'מוחלטת vs תנאית',
    content: <div className="space-y-2 text-xs text-slate-300">
      <div className="bg-white/5 rounded-xl p-3 space-y-1">
        <p className="text-emerald-400 font-bold">התכנסות מוחלטת</p>
        <p className="font-mono text-slate-200" dir="ltr">Σ|aₙ| מתכנס → Σaₙ מתכנס מוחלטת</p>
        <p className="text-slate-400">החזקה / יחס על הערך המוחלט. מוחלטת ⟹ תנאית (לא להפך!).</p>
      </div>
      <div className="bg-white/5 rounded-xl p-3 space-y-1">
        <p className="text-yellow-400 font-bold">התכנסות תנאית</p>
        <p className="font-mono text-slate-200" dir="ltr">Σaₙ מתכנס, אבל Σ|aₙ| מתבדר</p>
        <p className="text-slate-400">הדוגמה הקלאסית: Σ(-1)ⁿ/n — לייבניץ ✓, הרמוני מתבדר.</p>
      </div>
      <Note color="blue" children={<>בדיקה: קודם מוחלטת (יחס/חזקה). אם מתכנסת — סיימנו. אם לא — נסה לייבניץ.</>} />
    </div>,
  },
  {
    title: 'השוואה & גבול',
    content: <div className="space-y-2 text-xs text-slate-300">
      <div className="bg-white/5 rounded-xl p-3 space-y-1">
        <p className="text-blue-400 font-bold">השוואה ישירה</p>
        <p className="font-mono text-slate-200" dir="ltr">{'0 ≤ aₙ ≤ bₙ'}</p>
        <p className="text-slate-400">Σbₙ מתכנס → Σaₙ מתכנס. Σaₙ מתבדר → Σbₙ מתבדר.</p>
      </div>
      <div className="bg-white/5 rounded-xl p-3 space-y-1">
        <p className="text-purple-400 font-bold">השוואה בגבול (הכי שימושית!)</p>
        <p className="font-mono text-slate-200" dir="ltr">L = lim(aₙ/bₙ), 0 {'<'} L {'<'} ∞</p>
        <p className="text-slate-400">Σaₙ ו-Σbₙ מתנהגות אותו דבר. בחר bₙ = p-טור מוכר.</p>
      </div>
      <Note color="emerald" children={<>טיפ: אם aₙ ≈ 1/n^p לn גדול — בחר bₙ = 1/n^p ועשה השוואת גבול.</>} />
    </div>,
  },
  {
    title: 'במבחן HIT',
    content: <div className="space-y-2 text-xs text-slate-300">
      <p className="text-yellow-400 font-bold">אלגוריתם להכרעה:</p>
      <ol className="space-y-1">
        <li><span className="text-emerald-400 font-bold">1.</span> בדוק תנאי הכרחי: aₙ→0? אם לא — מתבדר.</li>
        <li><span className="text-emerald-400 font-bold">2.</span> יש (-1)ⁿ? → נסה לייבניץ (bₙ↓0).</li>
        <li><span className="text-emerald-400 font-bold">3.</span> יש n! או rⁿ? → יחס (d'Alembert).</li>
        <li><span className="text-emerald-400 font-bold">4.</span> יש aₙ^n? → שורש (קושי).</li>
        <li><span className="text-emerald-400 font-bold">5.</span> נראה כמו 1/nᵖ? → השוואת גבול.</li>
      </ol>
      <Note color="yellow" children={<>טלסקופי: Σ(1/n - 1/(n+1)) = 1. הסכום = a₁ כשהיתר מבטלים.</>} />
    </div>,
  },
]

const intro = <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
  <p>
    האם הסכום האינסופי <span className="text-emerald-400 font-mono">Σaₙ</span> מתכנס? זה השאלה.
    כל מבחן: <span className="text-white font-semibold">מבחן יחס</span> קודם, אז לייבניץ.
  </p>
  <Formula c="L = lim|a_{n+1}/aₙ| < 1  →  מתכנס" color="text-emerald-300" />
  <p>
    שלוש רמות: מתבדר → מתכנס תנאית → מתכנס <span className="text-yellow-400 font-semibold">מוחלטת</span>.
  </p>
</div>

const theory: TheoryCard = {
  summary: 'טור Σaₙ מתכנס אם הסכום האינסופי מגיע לערך סופי. יש מספר מבחנים לבדיקה: מבחן יחס (הכי שימושי), מבחן שורש, מבחן לייבניץ (לטורים מתחלפים), ו-p-טור (Σ1/nᵖ מתכנס רק אם p>1). חשוב: אם L=1 במבחן יחס — המבחן לא חד-משמעי, נסה אחר.',
  formulas: [
    { label: 'מבחן יחס', tex: 'L = \\lim_{n\\to\\infty}\\left|\\frac{a_{n+1}}{a_n}\\right|\\;:\\; L<1\\Rightarrow\\text{מתכנס},\\; L>1\\Rightarrow\\text{מתבדר}', verbal: 'שואלים: כמה גדול האיבר הבא ביחס לקודם? L<1 → כל איבר קטן מהקודם בגורם קבוע → הסכום מתכנס. L=1 → המבחן עיוור, נסה אחר. הכי שימושי כשיש n! או rⁿ.' },
    { label: 'p-טור', tex: '\\sum_{n=1}^\\infty \\frac{1}{n^p}\\;:\\; \\text{מתכנס אמ"מ } p>1', verbal: 'הטור הארכימדי הכי חשוב. p=1 = סדרה הרמונית (מתבדרת!). p=2 → מתכנס ל-π²/6. שימוש: כשrigh-hand=1/nᵖ — ידוע ישירות. גם בהשוואה: "מתנהג כמו 1/nᵖ".' },
  ],
  when: 'התחל תמיד עם מבחן יחס. L=1? → נסה Raabe, השוואה, או p-טור. טור מתחלף? → לייבניץ',
}

export const practice: QuizQuestion[] = [
  {
    question: 'Σ(1/n!). מבחן יחס: L = ?',
    options: ["1", "0", "∞", "1/2"],
    correct: 1,
    explanation: "|a_{n+1}/aₙ| = n!/(n+1)! = 1/(n+1) → 0 < 1 → מתכנס",
  },
  {
    question: 'Σ(1/n). מבחן יחס: L = ?',
    options: ["0", "1", "∞", "1/2"],
    correct: 1,
    explanation: "L = n/(n+1) → 1. המבחן לא חד-משמעי! (זה p-טור עם p=1 — מתבדר)",
  },
  {
    question: 'Σ((-1)ⁿ/n). מה מסקנת לייבניץ?',
    options: [
      "מתבדר — יש מינוסים",
      "מתכנס תנאית — 1/n יורד ל-0",
      "מתכנס מוחלטת",
      "לא ניתן לדעת",
    ],
    correct: 1,
    explanation: "לייבניץ: aₙ=1/n יורד מונוטונית ל-0 → מתכנס. אבל Σ1/n מתבדר → מתכנס תנאית",
  },
  {
    question: 'Σ(1/n²). מה הסיווג?',
    options: ["מתבדר", "מתכנס תנאית", "מתכנס מוחלטת (p=2>1)", "לא ידוע"],
    correct: 2,
    explanation: "p-טור עם p=2>1 → מתכנס. כל האיברים חיוביים → מתכנס מוחלטת",
  },
]

export default function SeriesConvergence({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="series-convergence"
    title="התכנסות טורים"
    subtitle="מבחן יחס, שורש, לייבניץ, p-טור"
    intro={intro} theory={theory} step1={step1} step2={step2} step3={step3}
    SimulatorComponent={Sim} quizQuestions={quiz} practiceQuestions={practice}
    greenNote={greenNote} guides={guides}
    onBack={onBack}
  />
}
