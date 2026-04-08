import React, { useState } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import type { QuizQuestion, GuideSection } from '../../types'

function Sim({ currentStep }: { currentStep: number }) {
  const [rMin, setRMin] = useState(1)
  const [rMax, setRMax] = useState(2)
  const [mode, setMode] = useState<'rect' | 'polar'>('polar')

  const W = 240, H = 180, cx = W / 2, cy = H / 2

  // Draw polar region rMin ≤ r ≤ rMax
  const outerPts = Array.from({ length: 61 }, (_, i) => {
    const theta = (i / 60) * 2 * Math.PI
    return `${cx + rMax * Math.cos(theta) * 45},${cy - rMax * Math.sin(theta) * 45}`
  }).join(' ')

  const innerPts = Array.from({ length: 61 }, (_, i) => {
    const theta = (i / 60) * 2 * Math.PI
    return `${cx + rMin * Math.cos(theta) * 45},${cy - rMin * Math.sin(theta) * 45}`
  }).join(' ')

  // Rectangular region
  const rx1 = cx - 60, rx2 = cx + 60, ry1 = cy - 50, ry2 = cy + 50

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="flex gap-2">
        {(['polar', 'rect'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${mode === m ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-400'}`}>
            {m === 'polar' ? 'קוטבי' : 'מלבני'}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="240" height="180">
        <line x1="10" y1={cy} x2={W - 10} y2={cy} stroke="#334155" strokeWidth="1.5" />
        <line x1={cx} y1="10" x2={cx} y2={H - 10} stroke="#334155" strokeWidth="1.5" />
        <text x={W - 8} y={cy + 10} fill="#475569" fontSize="9">x</text>
        <text x={cx + 3} y="14" fill="#475569" fontSize="9">y</text>

        {mode === 'polar' ? (<>
          <polygon points={outerPts} fill="#3b82f6" fillOpacity="0.25" stroke="#3b82f6" strokeWidth="1.5" />
          <polygon points={innerPts} fill="#0f172a" stroke="#60a5fa" strokeWidth="1.5" />
          <text x={cx + rMin * 45 / 2} y={cy - 8} fill="#60a5fa" fontSize="8">r={rMin}</text>
          <text x={cx + rMax * 45 / 2} y={cy - 8} fill="#93c5fd" fontSize="8">r={rMax}</text>
        </>) : (<>
          <rect x={rx1} y={ry1} width={rx2 - rx1} height={ry2 - ry1}
            fill="#8b5cf6" fillOpacity="0.25" stroke="#8b5cf6" strokeWidth="1.5" />
          <text x={cx - 30} y={cy - 55} fill="#a78bfa" fontSize="8">y=b</text>
          <text x={cx + 65} y={cy + 12} fill="#a78bfa" fontSize="8">x=a</text>
        </>)}
      </svg>

      {mode === 'polar' && (
        <div className="w-full space-y-2 px-3">
          {[
            { label: 'r מינימום', val: rMin, set: setRMin, min: 0.5, max: 2, step: 0.5 },
            { label: 'r מקסימום', val: rMax, set: setRMax, min: 1, max: 3, step: 0.5 },
          ].map(c => (
            <div key={c.label}>
              <div className="flex justify-between text-xs text-slate-400 mb-0.5">
                <span>{c.label}</span>
                <span className="text-blue-400 font-bold">{c.val}</span>
              </div>
              <input type="range" min={c.min} max={c.max} step={c.step} value={c.val}
                onChange={e => c.set(+e.target.value)}
                className="w-full accent-blue-500 h-1.5 rounded-full" />
            </div>
          ))}
          <div className="bg-white/10 rounded-xl p-2 text-center text-xs font-mono text-slate-300" dir="ltr">
            {'∬_D dA = ∫₀²π ∫_{rMin}^{rMax} r·dr·dθ = π(rMax²-rMin²)'}
          </div>
        </div>
      )}
    </div>
  )
}

const step1 = (
  <PatternStep
    scenario={<>
      <span className="font-mono text-emerald-300" dir="ltr">∬_D arctan(y/x) dA</span>
      {' '}כאשר <span className="font-mono text-emerald-300" dir="ltr">D: 1 ≤ x²+y² ≤ 4, x≥0, y≥0</span>.
      <br />כיצד תגש לאינטגרל?
    </>}
    options={[
      { label: 'עבור לקוטביות: x=rcosθ, y=rsinθ — האזור פשוט שם', correct: true },
      { label: 'אינטגרל מלבני רגיל — אין צורך בהחלפה', correct: false, desc: 'האזור עגול — קוטביות הרבה יותר פשוט' },
      { label: 'הפרד ל-∫∫ arctan(y/x) dx dy', correct: false, desc: 'arctan(y/x)=θ בקוטביות — זה הרבה יותר קל' },
      { label: 'השתמש בגרין', correct: false, desc: 'גרין הוא לאינטגרל קווי, לא כפול' },
    ]}
    correctFeedback="נכון! D הוא טבעת (annulus) ב-x,y≥0 → ρ∈[1,2], θ∈[0,π/2]. arctan(y/x)=θ. האינטגרל הופך ל-∫₀^{π/2}θ dθ · ∫₁² r dr."
  />
)

const step2 = (
  <PrincipleStep
    heading="אינטגרל כפול — שיטות:"
    items={[
      {
        title: 'פובייני — שינוי סדר אינטגרציה',
        content: <>
          <Formula c="∬_D f dA = ∫_a^b [∫_{g₁(x)}^{g₂(x)} f(x,y) dy] dx" color="text-blue-300" />
          <span className="text-slate-400 text-xs">שנה סדר כשהגבולות קשים — צייר את D !</span>
        </>,
        accent: 'text-blue-400',
      },
      {
        title: 'קואורדינטות קוטביות',
        content: <>
          <Formula c="x=r·cosθ, y=r·sinθ,  dA = r·dr·dθ" color="text-purple-300" />
          <div className="text-xs text-slate-300 space-y-0.5 mt-1">
            <p>מעגל/טבעת/חרוט → קוטביות תמיד!</p>
            <p className="text-yellow-400">⚠ אל תשכח את r (יעקוביאן)!</p>
          </div>
        </>,
        accent: 'text-purple-400',
      },
      {
        title: 'החלפת משתנים כללית',
        content: <>
          <Formula c="∬_D f dA = ∬_G f(x(u,v), y(u,v)) |J| du dv" color="text-orange-300" />
          <span className="text-slate-400 text-xs">J = ∂(x,y)/∂(u,v) — דטרמיננטת יעקובי</span>
        </>,
        accent: 'text-orange-400',
      },
    ]}
  />
)

const step3 = (
  <WorkedExample
    examLabel="מבחן HIT — 2024 (שאלה 2)"
    problem={<>
      חשב: <span className="font-mono text-blue-300" dir="ltr">∬_D arctan(y/x) dA</span>
      <br />כאשר <span className="font-mono text-blue-300" dir="ltr">D: 1 ≤ x²+y² ≤ 4, x≥0, y≥0</span>
    </>}
    hint="עבור לקוטביות. D: r∈[1,2], θ∈[0,π/2]. arctan(y/x) = arctan(sinθ/cosθ) = θ."
    solution={[
      { label: 'קוטביות:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">x=rcosθ, y=rsinθ, dA = r dr dθ{'\n'}D: r∈[1,2], θ∈[0,π/2]{'\n'}arctan(y/x) = arctan(tanθ) = θ</pre> },
      { label: 'האינטגרל:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">{'∫₀^{π/2} θ dθ · ∫₁² r dr\n= [θ²/2]₀^{π/2} · [r²/2]₁²\n= π²/8 · (4-1)/2 = 3π²/16'}</pre> },
    ]}
  />
)

export const quiz: QuizQuestion[] = [
  {
    question: '∬_D (x²+y²) dA, D: x²+y²≤4. מה התשובה?',
    options: ['8π', '4π', '16π', '2π'],
    correct: 0,
    explanation: 'קוטביות: ∫₀²π ∫₀² r²·r dr dθ = 2π · [r⁴/4]₀² = 2π·4 = 8π',
  },
  {
    question: 'מה יעקוביאן המעבר לקוטביות?',
    options: ['r', '1', 'r²', '1/r'],
    correct: 0,
    explanation: 'dA = r dr dθ. היעקוביאן הוא r — חייב להכפיל בו!',
  },
  {
    question: 'שינוי סדר ∫₀¹ ∫_x¹ f(x,y) dy dx שווה:',
    options: ['∫₀¹ ∫₀ʸ f dx dy', '∫₀¹ ∫₀¹ f dx dy', '∫₀¹ ∫_y¹ f dx dy', '∫₀¹ ∫₀ˣ f dx dy'],
    correct: 0,
    explanation: 'האזור: 0≤x≤y≤1. שינוי סדר: y∈[0,1], x∈[0,y]. תמיד צייר את D!',
  },
]

const greenNote = [
  'קוטבי: x=rcosθ, y=rsinθ. dA = r·dr·dθ (אל תשכח את r!)',
  'מעגל/טבעת/אזור עם x²+y² → קוטביות תמיד',
  'שינוי סדר: צייר את D, מצא גבולות חדשים מהתמונה',
  'החלפת משתנים: |J| = |∂(x,y)/∂(u,v)| — חשב דטרמיננטה',
]

const guides: GuideSection[] = [
  {
    title: 'נוסחאות',
    content: <div className="space-y-2 text-sm" dir="ltr">
      <p className="text-blue-400 font-bold text-xs">Polar Coordinates</p>
      <p className="font-mono text-xs text-slate-300">x = r·cosθ, y = r·sinθ</p>
      <p className="font-mono text-xs text-slate-300">dA = r·dr·dθ</p>
      <p className="font-mono text-xs text-slate-300">x²+y² = r²</p>
      <p className="text-purple-400 font-bold text-xs mt-2">Change of Order</p>
      <p className="font-mono text-xs text-slate-300">{'∫_a^b ∫_{g₁}^{g₂} f dy dx → ∫_c^d ∫_{h₁}^{h₂} f dx dy'}</p>
      <p className="text-orange-400 font-bold text-xs mt-2">Jacobian</p>
      <p className="font-mono text-xs text-slate-300">J = |∂x/∂u · ∂y/∂v - ∂x/∂v · ∂y/∂u|</p>
    </div>,
  },
  {
    title: '🎯 במבחן HIT',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p>כשהתחום הוא עיגול/חלק ממנו — עבור לקוטביות. חשב נפח, שטח, מסה, מרכז כובד</p>
      <p className="text-yellow-400 text-xs font-bold">מתי לעבור לקוטביות:</p>
      <p className="text-xs">x²+y² מופיע בביטוי → קוטביות</p>
      <p className="text-xs">התחום הוא עיגול, טבעת, חרוט, כדור → קוטביות</p>
      <p className="text-yellow-400 text-xs font-bold mt-2">שינוי סדר אינטגרציה:</p>
      <p className="text-xs">1. ציר את התחום D מהגבולות המקוריים</p>
      <p className="text-xs">2. הפוך — כתוב גבולות חדשים מהתמונה</p>
      <p className="text-xs">3. שינוי סדר מועיל כשהאינטגרל הפנימי קשה לחישוב</p>
    </div>,
  },
]

const intro = <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
  <p>
    אינטגרל כפול = <span className="text-blue-400 font-semibold">שטח תחת משטח</span>.
    עבור אזורים עגולים, מעגלים, טבעות — <span className="text-purple-400 font-semibold">תמיד קוטביות</span>.
  </p>
  <Formula c="∬_D f dA = ∫∫ f(r·cosθ, r·sinθ)·r dr dθ" color="text-blue-300" />
  <p>
    ב<span className="text-yellow-400 font-semibold">כל מבחן</span>: שינוי סדר אינטגרציה, קוטביות, לפעמים החלפת משתנים.
  </p>
</div>

const theory: TheoryCard = {
  summary: 'אינטגרל כפול מחשב שטח/נפח מתחת למשטח. עפ"י פובייני — אנגדלים פעמיים: קודם לפי y (עם x קבוע), אחר כך לפי x. לאזורים עגולים, טבעות, כדורים — מעבר לקואורדינטות קוטביות חוסך זמן רב. בקוטביות — לא לשכוח את גורם r!',
  formulas: [
    { label: 'פובייני', tex: '\\iint_D f\\,dA = \\int_a^b\\!\\int_{g_1(x)}^{g_2(x)} f(x,y)\\,dy\\,dx', verbal: 'פובייני אומר שאפשר לפרק לאינטגרל חד-ממדי פנימי ואז חיצוני. סדר האינטגרציה לפעמים חשוב' },
    { label: 'קוטביות', tex: 'x=r\\cos\\theta,\\;y=r\\sin\\theta,\\quad dA = r\\,dr\\,d\\theta', verbal: 'כשהתחום עגול — קוטביות הרבה יותר נוחה. אל תשכח את r ביעקוביאן!' },
  ],
  when: 'אזורים עגולים/טבעתיים → קוטביות. אזורים מלבניים → פובייני ישיר. קשה לאנגדל? → החלף סדר',
}

export const practice: QuizQuestion[] = [
  {
    question: '∬_D dA כש-D: x²+y²≤4. מה הערך?',
    options: ["π", "2π", "4π", "8π"],
    correct: 2,
    explanation: "שטח עיגול ברדיוס 2: πr² = π·4 = 4π. בקוטביות: ∫₀²π∫₀² r dr dθ = 4π",
  },
  {
    question: 'למה בקוטביות מוסיפים r ב-dA = r dr dθ?',
    options: [
      "כי r²+θ² = 1",
      "היעקוביאן של ההמרה הוא r",
      "כי הרדיוס תמיד חיובי",
      "זו קונוונציה בלבד",
    ],
    correct: 1,
    explanation: "היעקוביאן |∂(x,y)/∂(r,θ)| = r — זו הסיבה המתמטית לגורם r",
  },
  {
    question: '∫₀¹∫ₓ¹ f dy dx — אחרי שינוי סדר?',
    options: [
      "∫₀¹∫₀ʸ f dx dy",
      "∫₀¹∫₀ˣ f dy dx",
      "∫₀¹∫ₓ¹ f dx dy",
      "∫₀¹∫₀¹ f dx dy",
    ],
    correct: 0,
    explanation: "D: 0≤x≤1, x≤y≤1. כך גם: 0≤y≤1, 0≤x≤y → ∫₀¹∫₀ʸ f dx dy",
  },
]

export default function DoubleIntegrals({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="calc2-double"
    title="אינטגרל כפול"
    subtitle="פובייני, קוטביות, שינוי סדר, יעקוביאן"
    intro={intro} theory={theory} step1={step1} step2={step2} step3={step3}
    SimulatorComponent={Sim} quizQuestions={quiz} practiceQuestions={practice}
    greenNote={greenNote} guides={guides}
    onBack={onBack}
  />
}
