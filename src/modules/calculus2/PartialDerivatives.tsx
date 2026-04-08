import React, { useState } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import type { QuizQuestion, GuideSection } from '../../types'

function Sim({ currentStep }: { currentStep: number }) {
  const [x0, setX0] = useState(1)
  const [y0, setY0] = useState(1)

  // f(x,y) = x² + xy + y²
  const f = (x: number, y: number) => x * x + x * y + y * y
  const fx = (x: number, y: number) => 2 * x + y
  const fy = (x: number, y: number) => x + 2 * y

  const fVal = f(x0, y0)
  const fxVal = fx(x0, y0)
  const fyVal = fy(x0, y0)

  const W = 240, H = 160, ox = 60, oy = H / 2

  // Cross-section along x (y=y0 fixed)
  const xPts = Array.from({ length: 50 }, (_, i) => {
    const x = -2 + (i / 49) * 5
    const y = f(x, y0)
    return `${ox + (x + 2) * 30},${oy - Math.min(6, Math.max(-2, y - fVal)) * 18}`
  }).join(' ')

  // Tangent line along x
  const tang = Array.from({ length: 2 }, (_, i) => {
    const dx = -1 + i * 2
    const x = x0 + dx
    const y = fVal + fxVal * dx
    return `${ox + (x + 2) * 30},${oy - Math.max(-2, Math.min(6, y - fVal)) * 18}`
  }).join(' ')

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} width="240" height="160">
        <line x1={ox} y1="10" x2={W - 10} y2="10" stroke="transparent" />
        <line x1={ox} y1={oy} x2={W - 10} y2={oy} stroke="#334155" strokeWidth="1.5" />
        <text x={W - 8} y={oy + 10} fill="#475569" fontSize="9">x (y={y0} קבוע)</text>

        <polyline points={xPts} fill="none" stroke="#a78bfa" strokeWidth="2" />
        <polyline points={tang} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3" />

        <circle cx={ox + (x0 + 2) * 30} cy={oy} r="4" fill="#10b981" />

        <text x="5" y="20" fill="#a78bfa" fontSize="8">f(x,{y0})</text>
        <text x="5" y="32" fill="#f59e0b" fontSize="8">שיפוע = f_x = {fxVal}</text>
      </svg>

      <div className="w-full space-y-2 px-3">
        {[
          { label: 'x₀', val: x0, set: setX0, min: -2, max: 2, step: 0.5, color: 'green' },
          { label: 'y₀', val: y0, set: setY0, min: -2, max: 2, step: 0.5, color: 'purple' },
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
        <div className="bg-white/10 rounded-xl p-2 text-xs space-y-0.5" dir="ltr">
          <p className="text-slate-300 font-mono">f = x²+xy+y² = {fVal}</p>
          <p className="text-purple-400 font-mono">f_x = 2x+y = {fxVal}</p>
          <p className="text-green-400 font-mono">f_y = x+2y = {fyVal}</p>
        </div>
      </div>
    </div>
  )
}

const step1 = (
  <PatternStep
    scenario={<><span className="font-mono text-emerald-300" dir="ltr">f(x,y) = x³ + x²y - y³</span> — מהי ∂f/∂x?</>}
    options={[
      { label: '3x² + 2xy', correct: true, desc: 'גוזרים לפי x, y קבוע' },
      { label: '3x² + 2xy - 3y²', correct: false, desc: 'גזרנו גם לפי y' },
      { label: 'x² + x - y²', correct: false },
      { label: '3x² - 3y²', correct: false },
    ]}
    correctFeedback="נכון! ∂f/∂x = 3x² + 2xy. מתייחסים ל-y כקבוע ומגזרים לפי x בלבד."
  />
)

const step2 = (
  <PrincipleStep
    heading="נגזרות חלקיות ודיפרנציאביליות:"
    items={[
      {
        title: 'נגזרת חלקית — הגדרה',
        content: <>
          <div dir="ltr" className="font-mono text-xs text-purple-300 space-y-0.5">
            <p>∂f/∂x = lim[h→0] (f(x+h,y) - f(x,y))/h</p>
            <p>∂f/∂y = lim[h→0] (f(x,y+h) - f(x,y))/h</p>
          </div>
          <span className="text-slate-400 text-xs">← גוזרים לפי משתנה אחד, השאר קבועים</span>
        </>,
        accent: 'text-purple-400',
      },
      {
        title: 'מישור משיק לגרף ב-(x₀,y₀)',
        content: <>
          <Formula c="z - z₀ = f_x(x₀,y₀)(x-x₀) + f_y(x₀,y₀)(y-y₀)" color="text-blue-300" />
          <span className="text-slate-400 text-xs">האנלוג של משיק בכמה משתנים</span>
        </>,
        accent: 'text-blue-400',
      },
      {
        title: 'דיפרנציאביליות — תנאי',
        content: <>
          <span className="text-slate-300 text-sm">f דיפרנציאבילית ב-(a,b) אם:</span>
          <div dir="ltr" className="font-mono text-xs text-emerald-300 mt-1">
            lim(h,k)→(0,0) [f(a+h,b+k) - f(a,b) - f_x·h - f_y·k] / √(h²+k²) = 0
          </div>
          <Note color="emerald" children={<>✓ f_x, f_y רציפות ב-(a,b) → f דיפרנציאבילית שם</>} />
        </>,
        accent: 'text-emerald-400',
      },
    ]}
  />
)

const step3 = (
  <WorkedExample
    examLabel="מבחן HIT — 2024 (שאלה 1ג)"
    problem={<>
      <span className="font-mono text-blue-300" dir="ltr">f(x,y) = (x³+y³)/(x²+y²), f(0,0)=0</span>
      <br /><br />האם f דיפרנציאבילית ב-(0,0)?
    </>}
    hint="חשב f_x(0,0) ו-f_y(0,0) מהגדרה, ואז בדוק את הגבול הדיפרנציאל."
    solution={[
      { label: 'f_x(0,0) מהגדרה:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">f_x(0,0) = lim[h→0] f(h,0)/h = lim h³/h²/h = 1</pre> },
      { label: 'f_y(0,0) = 1 (סימטריה)', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">f_y(0,0) = 1</pre> },
      { label: 'בדיקת דיפרנציאביליות לאורך y=x:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">[f(t,t) - 0 - 1·t - 1·t] / (t√2){'\n'}= [2t³/2t² - 2t] / (t√2) = [-t] / (t√2) → -1/√2 ≠ 0{'\n'}∴ לא דיפרנציאבילית!</pre> },
    ]}
  />
)

export const quiz: QuizQuestion[] = [
  {
    question: 'f(x,y) = x²sin(y). מהי ∂f/∂y?',
    options: ['x²cos(y)', '2x·sin(y)', '2x·sin(y) + x²cos(y)', 'cos(y)'],
    correct: 0,
    explanation: '∂f/∂y: x² קבוע, גוזרים sin(y) → cos(y). תוצאה: x²cos(y).',
  },
  {
    question: 'מהי משוואת מישור המשיק ל-f(x,y)=x²+y² ב-(1,1,2)?',
    options: ['z = 2x + 2y - 2', 'z = 2x + 2y', 'z = x + y', 'z - 2 = 2(x-1) + 2(y-1)'],
    correct: 3,
    explanation: 'f_x=2x=2 ב-(1,1), f_y=2y=2. מישור: z-2 = 2(x-1)+2(y-1). (שווה לאפשרות א אחרי פישוט)',
  },
  {
    question: 'f_x, f_y רציפות בסביבת (a,b). מה אפשר להסיק?',
    options: ['f רציפה בלבד', 'f דיפרנציאבילית', 'הגבול בנקודה קיים', 'f שווה לאפס'],
    correct: 1,
    explanation: 'תנאי מספיק: אם f_x, f_y רציפות → f דיפרנציאבילית. (גם רציפה, אבל דיפרנציאביליות חזקה יותר)',
  },
]

const greenNote = [
  '∂f/∂x: גזור לפי x, התייחס ל-y כקבוע. ∂f/∂y: גזור לפי y, x קבוע',
  'מישור משיק: z-z₀ = f_x(x₀,y₀)(x-x₀) + f_y(x₀,y₀)(y-y₀)',
  'דיפרנציאביליות ב-(0,0): חשב f_x,f_y מהגדרה; בדוק גבול השגיאה',
  'אם f_x, f_y רציפות → f דיפרנציאבילית. הופך לא מתקיים!',
]

const guides: GuideSection[] = [
  {
    title: 'נוסחאות',
    content: <div className="space-y-2 text-sm" dir="ltr">
      <div>
        <p className="text-purple-400 font-bold text-xs mb-1">Partial Derivatives</p>
        <p className="font-mono text-xs text-slate-300">∂(xⁿ)/∂x = nxⁿ⁻¹ (y const)</p>
        <p className="font-mono text-xs text-slate-300">∂(sin(xy))/∂x = y·cos(xy)</p>
        <p className="font-mono text-xs text-slate-300">∂(eˣʸ)/∂y = x·eˣʸ</p>
      </div>
      <div>
        <p className="text-blue-400 font-bold text-xs mb-1">Tangent Plane at (x₀,y₀,z₀)</p>
        <p className="font-mono text-xs text-slate-300">z-z₀ = f_x(x-x₀) + f_y(y-y₀)</p>
      </div>
      <div>
        <p className="text-emerald-400 font-bold text-xs mb-1">Differentiability check at (0,0)</p>
        <p className="font-mono text-xs text-slate-300">1. Compute f_x(0,0), f_y(0,0) by definition</p>
        <p className="font-mono text-xs text-slate-300">2. Check: [f(h,k)-f(0,0)-f_x·h-f_y·k]/r → 0?</p>
      </div>
    </div>,
  },
  {
    title: '🎯 במבחן HIT',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p>נגזרת מכוונת: Dᵤf = ∇f·û. חשוב: û חייב להיות מנורמל (אורך 1)</p>
      <p>∇f = (∂f/∂x, ∂f/∂y) — הגרדיאנט הוא וקטור שמצביע לכיוון העלייה התלולה ביותר. גודלו = שיעור השינוי המקסימלי</p>
      <p>כלל השרשרת: כשיש הרכבת פונקציות: df/dt = (∂f/∂x)(dx/dt) + (∂f/∂y)(dy/dt)</p>
      <p className="text-yellow-400 text-xs font-bold">שלבים לבדיקת דיפרנציאביליות ב-(0,0):</p>
      <p className="text-xs">1. חשב f_x(0,0) ו-f_y(0,0) מהגדרה</p>
      <p className="text-xs">2. בדוק אם הגבול [f(h,k)-f(0,0)-f_x·h-f_y·k]/r → 0</p>
      <p className="text-xs">3. אם לא → f אינה דיפרנציאבילית</p>
    </div>,
  },
]

const intro = <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
  <p>
    פונקציה של שני משתנים היא <span className="text-purple-400 font-semibold">משטח</span> בחלל.
    הנגזרת החלקית מודדת את <span className="text-white font-semibold">שיפוע</span> המשטח בכיוון ציר אחד.
  </p>
  <div dir="ltr" className="bg-white/5 rounded-xl p-3 border-r-2 border-purple-500">
    <p className="font-mono text-purple-300">∂f/∂x = שיפוע בכיוון x (y קבוע)</p>
    <p className="font-mono text-purple-300 mt-1">∂f/∂y = שיפוע בכיוון y (x קבוע)</p>
  </div>
  <p>
    שאלה <span className="text-yellow-400 font-semibold">בכל מבחן</span>: בדוק רציפות, נגזרות, דיפרנציאביליות ב-(0,0).
    הנוסחה (x³+y³)/(x²+y²) הייתה ב-2024 ממש.
  </p>
</div>

const theory: TheoryCard = {
  summary: 'נגזרת חלקית ∂f/∂x מודדת כמה f משתנה כש-x זז — בעוד y קבוע. גוזרים ל-x כאילו y מספר רגיל. דיפרנציאביליות היא תנאי חזק יותר מרציפות: f דיפרנציאבילית ב-(0,0) אם המישור המשיק "מתאים טוב" לגרף — בודקים עם הגדרה או ע"י רציפות הנגזרות.',
  formulas: [
    { label: 'נגזרת חלקית', tex: '\\frac{\\partial f}{\\partial x} = \\lim_{h\\to 0}\\frac{f(x+h,y)-f(x,y)}{h}', verbal: 'נגזרת חלקית לפי x — גוזרים לפי x כאילו y קבוע. מודדת כמה f משתנה כשרק x זז' },
    { label: 'בדיקת דיפרנציאביליות', tex: '\\lim_{(h,k)\\to(0,0)}\\frac{f(h,k)-f(0,0)-f_x(0,0)h-f_y(0,0)k}{\\sqrt{h^2+k^2}}=0', verbal: 'המישור הנוגע לגרף f(x,y) בנקודה (a,b). נבנה מהנגזרות החלקיות' },
  ],
  when: 'שאלה קלאסית: f(x,y)=(x³+y³)/(x²+y²). חשב f_x(0,0) ו-f_y(0,0) מההגדרה, בדוק דיפרנציאביליות',
}

export const practice: QuizQuestion[] = [
  {
    question: 'f(x,y) = x²y + sin(y). מהי ∂f/∂x?',
    options: ["2xy + cos(y)", "2xy", "x² + cos(y)", "x²y·cos(y)"],
    correct: 1,
    explanation: "גוזרים לפי x, y נחשב קבוע: ∂f/∂x = 2xy. הביטוי sin(y) נגזר לאפס.",
  },
  {
    question: 'f(x,y) = x²y + sin(y). מהי ∂f/∂y?',
    options: ["2xy", "x² + cos(y)", "x²y", "2y + cos(y)"],
    correct: 1,
    explanation: "גוזרים לפי y, x קבוע: ∂f/∂y = x² + cos(y)",
  },
  {
    question: 'f(0,0) = 0, f_x(0,0) = 0, f_y(0,0) = 0. האם f בהכרח דיפרנציאבילית ב-(0,0)?',
    options: [
      "כן — הנגזרות קיימות",
      "לא — צריך לבדוק גם את הגבול של שארית/r",
      "כן, אם f רציפה",
      "לא ניתן לדעת ללא מידע נוסף",
    ],
    correct: 1,
    explanation: "רק קיום הנגזרות לא מספיק! יש לבדוק lim (f-0-0h-0k)/√(h²+k²) → 0",
  },
]

export default function PartialDerivatives({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="calc2-partials"
    title="נגזרות חלקיות ודיפרנציאביליות"
    subtitle="∂f/∂x, ∂f/∂y — מישור משיק ובדיקת דיפרנציאביליות"
    intro={intro} theory={theory} step1={step1} step2={step2} step3={step3}
    SimulatorComponent={Sim} quizQuestions={quiz} practiceQuestions={practice}
    greenNote={greenNote} guides={guides}
    onBack={onBack}
  />
}
