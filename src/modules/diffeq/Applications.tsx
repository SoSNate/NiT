import React, { useState } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import type { QuizQuestion, GuideSection } from '../../types'

function Sim({ currentStep }: { currentStep: number }) {
  const [T0, setT0] = useState(90)   // initial temp
  const [Tenv, setTenv] = useState(20) // environment temp
  const [k, setK] = useState(0.3)   // cooling constant

  const W = 240, H = 180, ox = 30, oy = H - 20

  const pts = Array.from({ length: 60 }, (_, i) => {
    const t = (i / 59) * 10
    const T = Tenv + (T0 - Tenv) * Math.exp(-k * t)
    const px = ox + t * 19
    const py = oy - ((T - 10) / 90) * 140
    return `${px},${py}`
  }).join(' ')

  const envY = oy - ((Tenv - 10) / 90) * 140

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} width="240" height="180">
        <line x1={ox} y1="10" x2={ox} y2={oy + 5} stroke="#334155" strokeWidth="1.5" />
        <line x1={ox} y1={oy} x2={W - 10} y2={oy} stroke="#334155" strokeWidth="1.5" />
        <text x={W - 8} y={oy + 12} fill="#475569" fontSize="8">t</text>
        <text x={ox + 2} y="14" fill="#475569" fontSize="8">T</text>

        {/* Environment temp line */}
        <line x1={ox} y1={envY} x2={W - 10} y2={envY}
          stroke="#60a5fa" strokeWidth="1" strokeDasharray="4,3" opacity="0.7" />
        <text x={ox + 4} y={envY - 4} fill="#60a5fa" fontSize="8">T_env={Tenv}°</text>

        {/* Cooling curve */}
        <polyline points={pts} fill="none" stroke="#f97316" strokeWidth="2.5" />

        {/* Labels */}
        <circle cx={ox} cy={oy - ((T0 - 10) / 90) * 140} r="3" fill="#f97316" />
        <text x={ox + 4} y={oy - ((T0 - 10) / 90) * 140 - 4} fill="#f97316" fontSize="8">T(0)={T0}°</text>
      </svg>

      <div className="w-full space-y-2 px-3">
        {[
          { label: 'T₀ (טמפרטורה התחלתית)', val: T0, set: setT0, min: 30, max: 100, step: 5, color: 'orange' },
          { label: 'T_env (סביבה)', val: Tenv, set: setTenv, min: 0, max: 40, step: 5, color: 'blue' },
          { label: 'k (קצב קירור)', val: k, set: setK, min: 0.05, max: 1, step: 0.05, color: 'red' },
        ].map(ctrl => (
          <div key={ctrl.label}>
            <div className="flex justify-between text-xs text-slate-400 mb-0.5">
              <span>{ctrl.label}</span>
              <span className={`text-${ctrl.color}-400 font-bold`}>{ctrl.val}</span>
            </div>
            <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step} value={ctrl.val}
              onChange={e => ctrl.set(+e.target.value)}
              className={`w-full accent-${ctrl.color}-500 h-1.5 rounded-full`} />
          </div>
        ))}
        <div className="bg-white/10 rounded-xl p-2 text-center text-xs font-mono text-slate-300" dir="ltr">
          T(t) = {Tenv} + {T0 - Tenv}·e^(-{k}t)
        </div>
      </div>
    </div>
  )
}

const step1 = (
  <PatternStep
    scenario={<>
      כוס קפה ב-<span className="font-mono text-emerald-300">90°C</span> מתקררת בחדר{' '}
      <span className="font-mono text-emerald-300">20°C</span>. אחרי 5 דקות הקפה{' '}
      <span className="font-mono text-emerald-300">65°C</span>. מתי יגיע ל-<span className="font-mono text-emerald-300">40°C</span>?
    </>}
    options={[
      { label: 'חוק קירור ניוטון: dT/dt = -k(T - T_env)', correct: true },
      { label: 'הפרדת משתנים ישירה ב-T', correct: false },
      { label: 'מד"ר לינארית עם P=0', correct: false },
      { label: 'אין נוסחה — צריך ניסוי', correct: false },
    ]}
    correctFeedback="נכון! dT/dt = -k(T-T_env) — הטמפרטורה יורדת ביחס להפרש מהסביבה. זו הפרדת משתנים."
  />
)

const step2 = (
  <PrincipleStep
    heading="בעיות יישום — מודל כללי:"
    items={[
      {
        title: 'זהה את כמות המשתנה וקצב השינוי',
        content: <><span className="text-slate-300 text-sm">ניוטון: T משתנה, קצב יחסי להפרש: dT/dt = -k(T-T_env)</span>
          <br /><span className="text-slate-300 text-sm">גידול/ריקבון: dP/dt = kP</span>
          <br /><span className="text-slate-300 text-sm">תערובת: dQ/dt = קצב כניסה - קצב יציאה</span></>,
        accent: 'text-orange-400',
      },
      {
        title: 'פתור עם הפרדת משתנים (לרוב)',
        content: <><Formula c="dT/(T - T_env) = -k dt  →  ln|T-T_env| = -kt + C" color="text-orange-300" />
          <Formula c="T(t) = T_env + (T₀ - T_env)·e^(-kt)" color="text-orange-300" /></>,
        accent: 'text-orange-400',
      },
      {
        title: 'הצב תנאי נוסף למציאת k',
        content: <><span className="text-slate-300 text-sm">ברוב שאלות המבחן: נותנים T(t₁)=T₁ → מחלצים k, ואז מוצאים t כשT(t)=T₂.</span></>,
        accent: 'text-orange-400',
      },
    ]}
    btnColor="orange"
  />
)

const step3 = (
  <WorkedExample
    examLabel="בעיית קירור קלאסית (HIT-style)"
    problem={<>
      גוף ב-<span className="font-mono text-blue-300">80°C</span> מתקרר בחדר{' '}
      <span className="font-mono text-blue-300">25°C</span>.
      אחרי <span className="font-mono text-blue-300">10</span> דקות — <span className="font-mono text-blue-300">60°C</span>.
      <br />מתי יגיע ל-<span className="font-mono text-blue-300">35°C</span>?
    </>}
    hint="הצב T(10)=60 למציאת k, ואז T(t)=35 למציאת t."
    solution={[
      { label: 'נוסחה כללית:', content: <pre className="font-mono text-xs text-emerald-400">T(t) = 25 + (80-25)·e^(-kt) = 25 + 55e^(-kt)</pre> },
      { label: 'מצא k מ-T(10)=60:', content: <pre className="font-mono text-xs text-emerald-400">60 = 25 + 55e^(-10k){'\n'}35 = 55e^(-10k){'\n'}k = -ln(35/55)/10 = 0.045</pre> },
      { label: 'מצא t כש-T(t)=35:', content: <pre className="font-mono text-xs text-emerald-400">35 = 25 + 55e^(-0.045t){'\n'}10 = 55e^(-0.045t){'\n'}t = -ln(10/55)/0.045 ≈ 37.7 דקות</pre> },
    ]}
  />
)

export const quiz: QuizQuestion[] = [
  {
    question: "גוף מתקרר: T₀=100°, T_env=0°. אחרי 5 דק\' T=50°. מה k?",
    options: ['k = ln(2)/5', 'k = 1/5', 'k = 2/5', 'k = ln(2)'],
    correct: 0,
    explanation: "50 = 100e^(-5k) → e^(-5k) = 0.5 → -5k = ln(0.5) → k = ln(2)/5 ≈ 0.139",
  },
  {
    question: "אוכלוסייה גדלה לפי dP/dt = 0.02P, P(0)=1000. מה P(50)?",
    options: ['1000e', '1000e²', '2000', '1000·50·0.02'],
    correct: 0,
    explanation: "P = P₀·e^(kt) = 1000·e^(0.02·50) = 1000·e¹ = 1000e ≈ 2718",
  },
  {
    question: "ריקבון רדיואקטיבי: N(t) = N₀e^(-λt). מה זמן מחצית החיים?",
    options: ['t½ = ln(2)/λ', 't½ = 1/λ', 't½ = λ/ln(2)', 't½ = ln(λ)'],
    correct: 0,
    explanation: "N(t½) = N₀/2 → e^(-λt½) = 0.5 → t½ = ln(2)/λ",
  },
]

const greenNote = [
  'ניוטון: dT/dt = -k(T-T_env) → T = T_env + (T₀-T_env)·e^(-kt)',
  'גידול/ריקבון: dN/dt = ±kN → N = N₀e^(±kt)',
  'תערובת: dQ/dt = (ריכוז_כניסה × קצב_כניסה) - (Q/V × קצב_יציאה)',
  'תמיד: (1) פתור כללית (2) הצב T(0) → C (3) הצב T(t₁) → k (4) פתור לt',
]

const guides: GuideSection[] = [
  {
    title: '📋 מודלים נפוצים',
    content: <div className="space-y-2 text-sm text-slate-300">
      {[
        { name: 'ניוטון', eq: 'T\' = -k(T-Tₑ)', sol: 'T = Tₑ + (T₀-Tₑ)e^(-kt)' },
        { name: 'גידול', eq: 'P\' = kP', sol: 'P = P₀e^(kt)' },
        { name: 'ריקבון', eq: 'N\' = -λN', sol: 'N = N₀e^(-λt)' },
        { name: 'תערובת', eq: "Q' = r_in·c_in - r_out·Q/V", sol: 'פתור לינארית' },
      ].map(m => (
        <div key={m.name} className="bg-white/5 rounded-xl p-2">
          <p className="text-orange-400 text-xs font-bold">{m.name}</p>
          <p className="font-mono text-xs" dir="ltr">{m.eq}</p>
          <p className="font-mono text-xs text-emerald-400" dir="ltr">{m.sol}</p>
        </div>
      ))}
    </div>,
  },
  {
    title: '🎯 במבחן HIT',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p>שאלות קירור: תמיד מציבים תנאי התחלה כדי למצוא k.</p>
      <p>שלב 1: כתוב T(t) = T_env + (T₀ - T_env)e^(kt)</p>
      <p>שלב 2: הצב נקודה ידועה T(t₁) = T₁</p>
      <p>שלב 3: מצא k ואז חשב את הזמן המבוקש</p>
    </div>,
  },
]

const intro = <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
  <p>
    מד"ר לא חיה רק בספרים — היא מגדירה כיצד הטבע משתנה בזמן.
    קפה מתקרר, אוכלוסיות גדלות, חומרים רדיואקטיביים מתפרקים — כולם אותה משוואה.
  </p>
  <Formula c="dT/dt = -k(T - T_env)" color="text-orange-300" />
  <p>
    השאלה תמיד: (1) כתוב את המשוואה המתאימה, (2) פתור, (3) מצא קבועים מהנתונים.
  </p>
</div>

const theory: TheoryCard = {
  summary: 'מד"ר לא חיה רק בנייר — היא מגדירה כיצד הטבע משתנה בזמן. שלוש משוואות מרכזיות: (1) קירור ניוטון — dT/dt = -k(T-Tₑ), (2) גידול/ריקבון — dN/dt = ±kN, (3) תערובות — שיעור כניסה פחות שיעור יציאה. כולן הפרדת משתנים או לינארית.',
  formulas: [
    { label: 'קירור ניוטון', tex: '\\frac{dT}{dt} = -k(T - T_{\\text{env}}) \\;\\Rightarrow\\; T = T_{\\text{env}} + Ce^{-kt}', verbal: 'חוק קירור ניוטון — קצב שינוי הטמפרטורה פרופורציונלי להפרש מהסביבה. k<0 לקירור, k>0 לחימום. הפתרון: הטמפרטורה מתקרבת לסביבה אקספוננציאלית. כשt→∞: T→T_env' },
    { label: 'גידול/ריקבון', tex: '\\frac{dN}{dt} = \\pm kN \\;\\Rightarrow\\; N = N_0 e^{\\pm kt}', verbal: 'גידול/ריקבון אקספוננציאלי — k>0 גידול, k<0 ריקבון. זמן מחצית חיים: t₁/₂ = ln(2)/|k| — הזמן שלוקח לחצי מהחומר להתפרק, לא תלוי בכמות ההתחלתית' },
  ],
  when: 'כשהשאלה מתארת תהליך שמשתנה בקצב פרופורציונלי לגודל הנוכחי — כתוב מד"ר, פתור, הצב תנאים',
}

export const practice: QuizQuestion[] = [
  {
    question: 'קפה ב-90°C מתקרר בחדר 20°C. איזו מד"ר מתארת זאת?',
    options: [
      "dT/dt = -k(T-20)",
      "dT/dt = -k·T",
      "dT/dt = k(90-T)",
      "dT/dt = -k(T+20)",
    ],
    correct: 0,
    explanation: "חוק קירור ניוטון: dT/dt = -k(T - T_env) = -k(T - 20)",
  },
  {
    question: 'חומר רדיואקטיבי מאבד 10% מהמסה בשנה. מה N(t)?',
    options: ["N₀·e^(-0.1t)", "N₀·e^(-kt) כש-k=-ln(0.9)", "N₀·(0.9)^t", "כל התשובות ב ו-ג נכונות"],
    correct: 3,
    explanation: "N(1)=0.9N₀ → e^(-k)=0.9 → k=-ln(0.9). N=(0.9)^t = e^(t·ln(0.9)) — שתיהן אותו הדבר",
  },
  {
    question: 'בשאלת תערובת: מיכל עם 100L מים ו-5kg מלח. מכניסים 2L/דקה של 0.1kg/L. מוציאים 2L/דקה. כתבו dS/dt.',
    options: [
      "dS/dt = 0.2 - 2S/100",
      "dS/dt = 0.1 - S/50",
      "dS/dt = 2 - 0.1S",
      "dS/dt = 0.2 - S/50",
    ],
    correct: 0,
    explanation: "כניסה: 2L/דק × 0.1kg/L = 0.2kg/דק. יציאה: ריכוז S/100 × 2L/דק = S/50. dS/dt = 0.2 - S/50",
  },
]

export default function Applications({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="diffeq-applications"
    title={"יישומי מד\"ר"}
    subtitle="קירור ניוטון, גידול, ריקבון, תערובות"
    intro={intro} theory={theory} step1={step1} step2={step2} step3={step3}
    SimulatorComponent={Sim} quizQuestions={quiz} practiceQuestions={practice}
    greenNote={greenNote} guides={guides}
    onBack={onBack}
  />
}
