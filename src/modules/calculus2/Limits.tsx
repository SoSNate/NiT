import React, { useState } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, FormulaBlock, Note } from '../../components/StepHelpers'
import type { QuizQuestion, GuideSection } from '../../types'

function Sim({ currentStep }: { currentStep: number }) {
  const [path, setPath] = useState<'y=x' | 'y=x2' | 'y=0'>('y=x')

  // f(x,y) = x²y / (x⁴ + y²) — classic limit-doesn't-exist example
  const evaluate = (x: number, y: number) => {
    const denom = x * x * x * x + y * y
    if (Math.abs(denom) < 1e-10) return 0
    return (x * x * y) / denom
  }

  const pathPts: { x: number; y: number; f: number }[] = Array.from({ length: 40 }, (_, i) => {
    const t = -2 + (i / 39) * 4
    let x = t, y = t
    if (path === 'y=x2') y = t * t
    if (path === 'y=0') y = 0
    return { x, y, f: evaluate(x, y) }
  })

  const W = 240, H = 150, ox = W / 2, oy = H / 2

  // Plot f value along path
  const fPts = pathPts.map((p, i) => {
    const px = ox + p.x * 45
    const py = oy - Math.max(-2, Math.min(2, p.f)) * 50
    return `${px},${py}`
  }).join(' ')

  const limitVal = path === 'y=x' ? '1/2' : path === 'y=x2' ? '1/2' : '0'

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} width="240" height="150">
        <line x1="10" y1={oy} x2={W - 10} y2={oy} stroke="#334155" strokeWidth="1.5" />
        <line x1={ox} y1="10" x2={ox} y2={H - 10} stroke="#334155" strokeWidth="1.5" />
        <text x={W - 8} y={oy + 10} fill="#475569" fontSize="9">x</text>
        <text x={ox + 3} y="14" fill="#475569" fontSize="9">f</text>
        <polyline points={fPts} fill="none" stroke="#10b981" strokeWidth="2.5" />
        <circle cx={ox} cy={oy - evaluate(0.01, path === 'y=x' ? 0.01 : path === 'y=x2' ? 0.0001 : 0) * 50} r="4"
          fill="#f59e0b" />
        <text x={W / 2} y={H - 4} textAnchor="middle" fill="#64748b" fontSize="8">
          גבול לאורך מסלול: {limitVal}
        </text>
      </svg>

      <div className="w-full space-y-2 px-3">
        <p className="text-slate-400 text-xs text-center">בחר מסלול לגבול:</p>
        <div className="grid grid-cols-3 gap-2">
          {(['y=x', 'y=x2', 'y=0'] as const).map(p => (
            <button key={p} onClick={() => setPath(p)}
              className={`py-2 rounded-xl text-xs font-medium transition-all ${path === p ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}>
              <span className="font-mono" dir="ltr">{p}</span>
            </button>
          ))}
        </div>
        <div className="bg-white/10 rounded-xl p-2 text-center text-xs">
          <span className="font-mono text-slate-300" dir="ltr">f(x,y) = x²y/(x⁴+y²)</span>
          <br />
          <span className="text-emerald-400">גבול לאורך {path} = {limitVal}</span>
        </div>
      </div>
    </div>
  )
}

const step1 = (
  <PatternStep
    scenario={<>
      <span className="font-mono text-emerald-300" dir="ltr">lim(x,y)→(0,0) (x²-y²)/(x²+y²)</span>
      {' '}— כיצד בוחנים קיום הגבול?
    </>}
    options={[
      { label: 'בדוק לאורך מסלולים שונים — אם שונים, הגבול לא קיים', correct: true },
      { label: 'חשב ישירות בהצבת (0,0)', correct: false, desc: 'מתקבל 0/0 — לא ניתן' },
      { label: 'השתמש בחוק לופיטל', correct: false, desc: 'לא קיים בכמה משתנים' },
      { label: 'בדוק רק לאורך הצירים', correct: false, desc: 'לא מספיק — צריך כל מסלול' },
    ]}
    correctFeedback="נכון! אם לאורך שני מסלולים מקבלים ערכים שונים — הגבול לא קיים. אם לאורך כל מסלול מקבלים אותו ערך — ייתכן שקיים (אז מוכיחים עם ε-δ או squeezing)."
  />
)

const step2 = (
  <PrincipleStep
    heading="גבולות בשני משתנים — כלים:"
    items={[
      {
        title: 'מסלולים — להפריך קיום',
        content: <>
          <FormulaBlock
            formula="y = mx: f(x,mx) = g(m)"
            verbal="בוחרים מסלולים שונים ל-(0,0) ובודקים אם הגבול שווה. אם y=0 נותן ערך אחד וy=x נותן ערך שונה — הגבול לא קיים. זה הכלי להפרכה: מספיק מסלול אחד שסותר. אבל אם כל הישרים נותנים 0 — לא הוכחנו כלום! צריך גם y=x²."
            color="text-red-300"
          />
        </>,
        accent: 'text-red-400',
      },
      {
        title: 'קואורדינטות קוטביות — להוכיח קיום',
        content: <>
          <FormulaBlock
            formula="x = r·cosθ, y = r·sinθ → f כ-r→0"
            verbal="x=r cosθ, y=r sinθ — r הוא המרחק מ-(0,0), θ הוא הכיוון. כשr→0 מתקרבים לראשית מכל הכיוון. אם אחרי ההצבה נשאר רק r^k·(פונקציה חסומה של θ) — הגבול 0. אם נשאר θ בלי r — הגבול לא קיים."
            color="text-blue-300"
          />
          <span className="text-slate-400 text-xs">אם התוצאה לא תלויה ב-θ → גבול קיים!</span>
        </>,
        accent: 'text-blue-400',
      },
      {
        title: 'Squeeze Theorem',
        content: <><span className="text-slate-300 text-sm">אם |f| ≤ g → 0 כ-(x,y)→(0,0), אז f→0 גם.</span>
          <Note color="emerald" children={<>לרוב: |f(x,y)| ≤ r = √(x²+y²) → 0</>} /></>,
        accent: 'text-emerald-400',
      },
    ]}
  />
)

const step3 = (
  <WorkedExample
    examLabel="מבחן HIT — 2024 (שאלה 1א)"
    problem={<>
      <span className="font-mono text-blue-300" dir="ltr">f(x,y) = (x³+y³)/(x²+y²)</span> עבור (x,y)≠(0,0), f(0,0)=0.
      <br /><br />
      <strong>(א)</strong> האם f רציפה ב-(0,0)?<br />
      <strong>(ב)</strong> מצא נגזרות חלקיות ב-(0,0).<br />
      <strong>(ג)</strong> האם f דיפרנציאבילית ב-(0,0)?
    </>}
    hint="(א) בדוק אם הגבול = 0 = f(0,0). השתמש בקואורדינטות קוטביות."
    solution={[
      {
        label: '(א) רציפות:',
        thought: 'הציבתי (0,0) — קיבלתי 0/0. זה אומר שהגבול לא טריוויאלי. אני עובר לקוטביות כדי "לתפוס" את שני המשתנים יחד כ-r.',
        content: <pre className="font-mono text-xs text-emerald-400">{'|(x³+y³)/(x²+y²)| ≤ (|x|³+|y|³)/(x²+y²)\n≤ (r³cos³θ + r³sin³θ)/r² = r(cos³θ+sin³θ) → 0\n∴ גבול = 0 = f(0,0) → רציפה ✓'}</pre>,
      },
      {
        label: '(ב) נגזרות חלקיות:',
        thought: 'ב-(0,0) לא אפשר לגזור ישירות (אין נוסחה) — חייב ללכת על הגדרה: lim[h→0] f(h,0)/h.',
        content: <pre className="font-mono text-xs text-emerald-400">{'f_x(0,0) = lim[h→0] f(h,0)/h = lim h³/h²/h = 1\nf_y(0,0) = 1 (סימטריה)'}</pre>,
      },
      {
        label: '(ג) דיפרנציאביליות:',
        thought: 'יש נגזרות חלקיות, אבל דיפרנציאביליות דורשת משהו חזק יותר — הלינאריזציה חייבת לעבוד בכל כיוון. בודק לאורך y=x.',
        content: <pre className="font-mono text-xs text-emerald-400">{'לאורך y=x: [f(t,t) - f(0,0) - 1·t - 1·t] / √2t\n= [2t³/2t² - 2t] / √2t → לא → ∴ לא דיפרנציאבילית!'}</pre>,
      },
    ]}
  />
)

const quiz: QuizQuestion[] = [
  {
    question: "lim(x,y)→(0,0) (x²-y²)/(x²+y²) — מה הגבול?",
    options: ['0', '1', '-1', 'הגבול לא קיים'],
    correct: 3,
    explanation: "לאורך y=0: גבול=1. לאורך x=0: גבול=-1. ∵ שונים → הגבול לא קיים.",
  },
  {
    question: "כיצד מוכיחים שגבול קיים ושווה 0?",
    options: ['מסלולים → 0', 'Squeeze: |f| ≤ r → 0', 'הצבה ישירה', 'כלל לופיטל'],
    correct: 1,
    explanation: "Squeeze theorem: אם |f| ≤ g → 0, אז f → 0. לרוב: |f| ≤ r = √(x²+y²).",
  },
  {
    question: "lim(x,y)→(0,0) 5x²y/(x²+y²) — מה הגבול?",
    options: ['0', '5', '∞', 'לא קיים'],
    correct: 0,
    explanation: "|5x²y/(x²+y²)| ≤ 5|y| ≤ 5r → 0. גבול = 0.",
  },
]

const greenNote = [
  'להפריך: נסה y=mx, y=x², y=0. אם מקבל ערכים שונים → גבול לא קיים',
  'קוטביות: x=rcosθ, y=rsinθ. אם התוצאה → 0 ללא תלות ב-θ → גבול=0',
  'Squeeze: |f(x,y)| ≤ C·r^k (k>0) → גבול = 0',
  'רציפות: f רציפה ב-(a,b) ⟺ lim(x,y)→(a,b) f = f(a,b)',
]

const guides: GuideSection[] = [
  {
    title: 'שיטות',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p className="text-emerald-400 font-bold text-xs">להפריך — מסלולים:</p>
      <ul className="text-xs space-y-0.5 font-mono" dir="ltr">
        <li>y = 0 (ציר x)</li>
        <li>x = 0 (ציר y)</li>
        <li>y = mx</li>
        <li>y = x², y = x³</li>
      </ul>
      <p className="text-emerald-400 font-bold text-xs mt-2">להוכיח — קוטביות:</p>
      <p className="font-mono text-xs" dir="ltr">x=r·cosθ, y=r·sinθ, r→0</p>
    </div>,
  },
  {
    title: 'נוסחאות',
    content: <div className="space-y-3 text-xs">
      <div className="bg-white/5 rounded-xl p-3 space-y-1">
        <p className="text-emerald-400 font-bold">מבחן המסלול</p>
        <p className="font-mono text-slate-200" dir="ltr">{'lim f along y=mx vs y=x²'}</p>
        <p className="text-slate-400">אם שני מסלולים נותנים תוצאות שונות — הגבול לא קיים.</p>
      </div>
      <div className="bg-white/5 rounded-xl p-3 space-y-1">
        <p className="text-blue-400 font-bold">קואורדינטות קוטביות</p>
        <p className="font-mono text-slate-200" dir="ltr">x=r cosθ, y=r sinθ, r=√(x²+y²)</p>
        <p className="text-slate-400">אם התוצאה תלויה רק ב-r (לא ב-θ) — הגבול קיים כש-r→0.</p>
      </div>
      <div className="bg-white/5 rounded-xl p-3 space-y-1">
        <p className="text-yellow-400 font-bold">משפט הסנדוויץ</p>
        <p className="font-mono text-slate-200" dir="ltr">|f(x,y)| ≤ C·r^k, k{'>'} 0 → lim=0</p>
        <p className="text-slate-400">אם ניתן לכבול מעל ב-rᵏ שהולך ל-0 — הגבול הוא 0.</p>
      </div>
    </div>,
  },
  {
    title: 'מלכודות',
    content: <div className="space-y-2 text-xs text-slate-300">
      <p className="text-yellow-400 font-bold">לא מספיק לבדוק y=mx בלבד!</p>
      <div className="bg-white/5 rounded-xl p-2 space-y-1">
        <p className="font-mono text-slate-200" dir="ltr">f = x²y/(x⁴+y²)</p>
        <p>מסלול y=mx → 0 לכל m. אבל y=x²: → 1/2. גבול לא קיים!</p>
      </div>
      <Note color="red" children={<>תמיד נסה גם y=x² ו-y=x³ — לא רק y=mx.</>} />
      <p className="text-emerald-400 font-bold mt-2">גבולות נפוצים:</p>
      <ul className="space-y-0.5 font-mono text-slate-300 text-[11px]" dir="ltr">
        <li>xy/(x²+y²) → לא קיים</li>
        <li>x²y/(x²+y²) → 0</li>
        <li>xy/√(x²+y²) → 0</li>
      </ul>
    </div>,
  },
  {
    title: 'במבחן HIT',
    content: <div className="space-y-2 text-xs text-slate-300">
      <p className="text-emerald-400 font-bold">דוגמה מהמבחן:</p>
      <p className="font-mono text-slate-200" dir="ltr">{'lim_{(x,y)→(0,0)} (x³+y³)/(x²+y²)'}</p>
      <div className="bg-white/5 rounded-xl p-2 text-xs space-y-1">
        <p>1. קוטביות: (r³(cos³θ+sin³θ))/r² = r·(cos³θ+sin³θ)</p>
        <p>2. |cos³θ+sin³θ| ≤ 2</p>
        <p>3. |·| ≤ 2r → 0 כש-r→0. גבול = 0.</p>
      </div>
      <Note color="emerald" children={<>נסה קוטביות קודם. אם r^k מבטל — 0. אם נשאר θ בלי r — לא קיים.</>} />
    </div>,
  },
]

const intro = <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
  <p>
    בפונקציה של שני משתנים, הגישה לנקודה יכולה להיות מ<span className="text-blue-400 font-semibold">אינסוף כיוונים</span>.
    לכן בדיקת גבול קשה יותר — אבל יש כלים.
  </p>
  <Formula c="(x,y) → (0,0) לאורך y=mx → שונה לכל m? → ∄ גבול" color="text-red-300" />
  <p>
    ב<span className="text-yellow-400 font-semibold">כל מבחן אינפי 2</span> יש שאלה על רציפות ודיפרנציאביליות ב-(0,0).
    הנוסחה הקלאסית: f(x,y)=(x³+y³)/(x²+y²) — הייתה ב-2024!
  </p>
</div>

const bridge = <div className="space-y-2">
  <p>באינפי 1 בדקנו <span className="text-emerald-400 font-semibold">lim[x→a] f(x)</span> — גישה מצד אחד (שמאל/ימין).</p>
  <p>כאן f תלויה ב-<span className="text-yellow-400 font-semibold">x וב-y</span> — וניתן להתקרב ל-(0,0) מ<span className="text-yellow-400 font-semibold">אינסוף כיוונים</span>: ישר, עקום, סליל...</p>
  <p className="text-slate-400 text-xs">← זה מה שהופך את הבעיה לקשה יותר, ולכן יש לנו כלים מיוחדים: מסלולים + קוטביות.</p>
</div>

const theory: TheoryCard = {
  summary: 'בפונקציה f(x,y), גבול ב-(0,0) קיים רק אם מקבלים אותו ערך מכל כיוון. אם בדרך אחת (למשל y=0) מקבלים תשובה אחרת מאשר בדרך שנייה (y=x) — הגבול לא קיים. לרציפות: הגבול חייב לשוות לערך הפונקציה בנקודה.',
  formulas: [
    { label: 'קואורדינטות קוטביות', tex: 'x = r\\cos\\theta,\\; y = r\\sin\\theta \\;\\Rightarrow\\; r\\to 0', verbal: 'r = מרחק מהראשית, θ = זווית. כשr→0 מתקרבים מכל כיוון. אם אחרי ההצבה נשאר r^k·(חסום) → גבול 0. אם נשאר θ בלבד (ללא r) → גבול לא קיים.' },
    { label: 'Squeeze', tex: '|f(x,y)| \\le g(r) \\to 0 \\;\\Rightarrow\\; f\\to 0', verbal: 'אם ניתן לכבול את |f| מעל ע"י פונקציה שהולכת ל-0 — גם f→0. בקוטביות: |f| ≤ C·r^k, k>0 → 0. שגיאה נפוצה: לשכוח שצריך C·r^k ולא רק C.' },
  ],
  when: 'כשמציבים (0,0) ומקבלים 0/0 — בדוק מסלולים שונים. אם שונים → ∄ גבול. אם כולם 0 → הוכח עם קוטביות/Squeeze',
}

const practice: QuizQuestion[] = [
  {
    question: 'f(x,y) = xy/(x²+y²). מה הגבול ב-(0,0) לאורך y=0?',
    options: ["0", "1/2", "1", "∞"],
    correct: 0,
    explanation: "y=0: f(x,0) = x·0/(x²+0) = 0. לאורך y=0 הגבול הוא 0.",
  },
  {
    question: 'f(x,y) = xy/(x²+y²). מה הגבול ב-(0,0) לאורך y=x?',
    options: ["0", "1/2", "1", "לא קיים"],
    correct: 1,
    explanation: "y=x: f(x,x) = x²/(2x²) = 1/2. שונה מ-0 → הגבול לא קיים!",
  },
  {
    question: 'f(x,y) = (x²y)/(x⁴+y²). לאורך y=x²?',
    options: ["0", "1/2", "2", "הגבול לא קיים"],
    correct: 1,
    explanation: "y=x²: x²·x²/(x⁴+x⁴) = x⁴/(2x⁴) = 1/2 ≠ 0 → הגבול לא קיים",
  },
  {
    question: 'מתי משתמשים בקוטביות?',
    options: [
      "כשהגבול לאורך כל מסלול שונה",
      "כשרוצים להוכיח שגבול = 0 — ובכולם מקבלים 0",
      "תמיד לפני בדיקת מסלולים",
      "רק לפונקציות עם cos/sin",
    ],
    correct: 1,
    explanation: "קוטביות שימושית להוכחת גבול=0: x=rcosθ, y=rsinθ, ואם התוצאה→0 כש-r→0 ללא תלות ב-θ",
  },
]

export default function Limits({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="calc2-limits"
    title="גבולות ורציפות"
    subtitle="פונקציות רבות משתנים — מסלולים, קוטביות, Squeeze"
    intro={intro} bridge={bridge} theory={theory} step1={step1} step2={step2} step3={step3}
    SimulatorComponent={Sim} quizQuestions={quiz} practiceQuestions={practice}
    greenNote={greenNote} guides={guides}
    onBack={onBack}
  />
}
