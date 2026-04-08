import React, { useState } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import type { QuizQuestion, GuideSection } from '../../types'

function Sim({ currentStep }: { currentStep: number }) {
  const [surfType, setSurfType] = useState<'sphere' | 'cone' | 'plane'>('sphere')
  const [r, setR] = useState(2)

  const W = 240, H = 180, cx = W / 2, cy = H / 2

  // Draw 3D-ish surface
  const drawSphere = () => {
    const pts = Array.from({ length: 61 }, (_, i) => {
      const t = (i / 60) * 2 * Math.PI
      return `${cx + r * 40 * Math.cos(t)},${cy - r * 25 * Math.sin(t)}`
    }).join(' ')
    return <ellipse cx={cx} cy={cy} rx={r * 40} ry={r * 25} fill="#3b82f620" stroke="#3b82f6" strokeWidth="1.5" />
  }

  const drawCone = () => {
    const h = r * 35
    return <polygon points={`${cx},${cy - h} ${cx - r * 35},${cy + h / 2} ${cx + r * 35},${cy + h / 2}`}
      fill="#8b5cf620" stroke="#8b5cf6" strokeWidth="1.5" />
  }

  const drawPlane = () => (
    <polygon points={`${cx - 70},${cy - 20} ${cx + 70},${cy - 40} ${cx + 70},${cy + 40} ${cx - 70},${cy + 20}`}
      fill="#10b98120" stroke="#10b981" strokeWidth="1.5" />
  )

  // Normal vector
  const color = surfType === 'sphere' ? '#3b82f6' : surfType === 'cone' ? '#8b5cf6' : '#10b981'

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="flex gap-2 flex-wrap justify-center">
        {(['sphere', 'cone', 'plane'] as const).map(s => (
          <button key={s} onClick={() => setSurfType(s)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${surfType === s ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'}`}>
            {s === 'sphere' ? 'כדור' : s === 'cone' ? 'חרוט' : 'מישור'}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="240" height="180">
        <line x1="10" y1={cy + 20} x2={W - 10} y2={cy + 20} stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
        {surfType === 'sphere' && drawSphere()}
        {surfType === 'cone' && drawCone()}
        {surfType === 'plane' && drawPlane()}

        {/* Normal vector */}
        <line x1={cx} y1={cy} x2={cx} y2={cy - 45} stroke={color} strokeWidth="2" />
        <polygon points={`${cx},${cy - 52} ${cx - 5},${cy - 42} ${cx + 5},${cy - 42}`} fill={color} />
        <text x={cx + 6} y={cy - 48} fill={color} fontSize="9">n̂</text>

        <text x={W / 2} y={H - 4} textAnchor="middle" fill="#64748b" fontSize="8">
          {surfType === 'sphere' ? `כדור r=${r}` : surfType === 'cone' ? 'חרוט z=√(x²+y²)' : 'מישור'}
        </text>
      </svg>

      {surfType === 'sphere' && (
        <div className="w-full px-3">
          <div className="flex justify-between text-xs text-slate-400 mb-0.5">
            <span>רדיוס R</span>
            <span className="text-blue-400 font-bold">{r}</span>
          </div>
          <input type="range" min={1} max={3} step={0.5} value={r}
            onChange={e => setR(+e.target.value)}
            className="w-full accent-blue-500 h-1.5 rounded-full" />
          <div className="bg-white/10 rounded-xl p-2 text-center text-xs mt-2 font-mono text-slate-300" dir="ltr">
            ∬ F·dS = ∬ F·n̂ dA,  |S| = 4π{r}²
          </div>
        </div>
      )}
    </div>
  )
}

const step1 = (
  <PatternStep
    scenario={<>
      <span className="font-mono text-emerald-300" dir="ltr">F = (x²,y²,z²)</span>
      {' '}— חשב שטף דרך מעטפת החרוט{' '}
      <span className="font-mono text-emerald-300" dir="ltr">z=√(x²+y²), 0≤z≤1</span> + הבסיס.
      <br />כיצד תגש?
    </>}
    options={[
      { label: 'גאוס: ∯_S F·dS = ∭_V div(F) dV', correct: true },
      { label: 'חשב ישירות על כל משטח', correct: false, desc: 'אפשרי, אבל גאוס הרבה יותר מהיר' },
      { label: 'סטוקס: ∯ = ∮', correct: false, desc: 'סטוקס מחבר שטח לקו, לא שטח לנפח' },
      { label: 'פרמטריזציה בקוטביות', correct: false, desc: 'נכון עבור אינטגרל שטח ישיר, אבל גאוס קל יותר' },
    ]}
    correctFeedback="נכון! div(F) = 2x+2y+2z. גאוס: ∭_V 2(x+y+z) dV. V: חרוט 0≤z≤1. עובד עם קוטביות גלילית."
  />
)

const step2 = (
  <PrincipleStep
    heading="אינטגרל שטח ומשפטים — כלים:"
    items={[
      {
        title: 'גאוס (Divergence Theorem)',
        content: <>
          <Formula c="∯_S F·dS = ∭_V div(F) dV" color="text-blue-300" />
          <div className="text-xs text-slate-300 space-y-0.5 mt-1">
            <p>div(F) = ∂P/∂x + ∂Q/∂y + ∂R/∂z</p>
            <p className="text-yellow-400">S = מעטפת סגורה של V</p>
          </div>
        </>,
        accent: 'text-blue-400',
      },
      {
        title: 'סטוקס (Stokes)',
        content: <>
          <Formula c="∬_S (∇×F)·dS = ∮_∂S F·dr" color="text-purple-300" />
          <span className="text-slate-400 text-xs">מחבר שטח לגבולו (עקומה). כיוון: חוק יד ימין.</span>
        </>,
        accent: 'text-purple-400',
      },
      {
        title: 'אינטגרל שטח ישיר',
        content: <>
          <Formula c="∬_S F·dS = ∬_D F·(r_u × r_v) du dv" color="text-teal-300" />
          <span className="text-slate-400 text-xs">r_u × r_v = וקטור נורמלי (יעקוביאן)</span>
        </>,
        accent: 'text-teal-400',
      },
    ]}
  />
)

const step3 = (
  <WorkedExample
    examLabel="מבחן HIT — 2023 (גאוס)"
    problem={<>
      <span className="font-mono text-blue-300" dir="ltr">F=(x²,y²,z²)</span>.
      חשב שטף דרך מעטפת חרוט{' '}
      <span className="font-mono text-blue-300" dir="ltr">z=√(x²+y²)</span> ובסיס z=1.
    </>}
    hint="גאוס: div(F)=2x+2y+2z. V: חרוט מ-0 ל-1. עבור לגלילי: x=rcosθ, y=rsinθ, 0≤r≤z≤1."
    solution={[
      { label: 'div(F):', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">div(F) = 2x+2y+2z</pre> },
      { label: 'גלילי + גאוס:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">∭_V 2(x+y+z) dV{'\n'}∫₀²π ∫₀¹ ∫_r¹ 2(rcosθ+rsinθ+z)·r dz dr dθ{'\n'}∫₀²π (cosθ+sinθ)dθ = 0 → נשאר 2z</pre> },
      { label: 'חשב:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">∫₀²π ∫₀¹ ∫_r¹ 2z·r dz dr dθ{'\n'}= 2π ∫₀¹ r·(1-r²) dr = 2π·[1/2-1/4] = π/2</pre> },
    ]}
  />
)

export const quiz: QuizQuestion[] = [
  {
    question: 'div(F) = 0 בכל V. מה ∯_S F·dS?',
    options: ['0', '∯ = ∭ div F dV = 0', 'תלוי בצורת S', 'תשובות א ו-ב נכונות'],
    correct: 3,
    explanation: 'גאוס: ∯ = ∭ div(F) dV = ∭ 0 dV = 0. שתי הנוסחאות נכונות.',
  },
  {
    question: 'F=∇φ (שמור). מה ∯_S F·dS על כדור?',
    options: ['0', '4πR²', 'φ(B)-φ(A)', 'תלוי ב-φ'],
    correct: 0,
    explanation: 'div(∇φ) = Δφ. אם φ הרמונית (Δφ=0) → ∯=0. בכלל: F שמור → curl(F)=0 → גאוס 0.',
  },
  {
    question: 'S: חצי כדור x²+y²+z²=R², z≥0. F=(0,0,z). חשב ∬_S F·n̂ dS.',
    options: ['πR²/2', 'πR³/2', '2πR³/3', 'πR²'],
    correct: 2,
    explanation: 'גאוס על כדור שלם + דיסקה: div(F)=1. ∭=Vol(חצי כדור)=2πR³/3. הורד תרומת הדיסקה (=0 כי F·n̂=z=0).',
  },
]

const greenNote = [
  'גאוס: ∯_S F·dS = ∭_V div(F) dV — לנפח סגור',
  'div(F) = ∂P/∂x + ∂Q/∂y + ∂R/∂z',
  'סטוקס: ∬_S curl(F)·dS = ∮_∂S F·dr',
  'כדור/חרוט/גליל → גאוס + קוטביות גלילית/כדורית',
]

const guides: GuideSection[] = [
  {
    title: '📋 משפטים',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p className="text-blue-400 font-bold text-xs">גאוס (Divergence Theorem):</p>
      <p className="text-xs font-mono" dir="ltr">∯_S F·dS = ∭_V div(F) dV</p>
      <p className="text-xs">div(F) = ∂P/∂x + ∂Q/∂y + ∂R/∂z</p>
      <p className="text-xs">שטף דרך משטח סגור = אינטגרל של div(F) על הנפח</p>
      <p className="text-purple-400 font-bold text-xs mt-2">סטוקס (Stokes):</p>
      <p className="text-xs font-mono" dir="ltr">∬_S curl(F)·dS = ∮_∂S F·dr</p>
      <p className="text-xs">curl(F) = ∇×F — מודד כמה השדה "מסתחרר"</p>
      <p className="text-teal-400 font-bold text-xs mt-2">ישיר (z=g(x,y)):</p>
      <p className="text-xs font-mono" dir="ltr">∬_S F·dS = ∬_D (-Pg_x - Qg_y + R) dA</p>
    </div>,
  },
  {
    title: '🎯 במבחן HIT',
    content: <div className="space-y-2 text-sm text-slate-300">
      <p>גאוס: כשיש נפח סגור וקל לחשב div. סטוקס: כשיש לולאה וקל לחשב curl. בחר את הקל יותר</p>
      <p className="text-yellow-400 text-xs font-bold">אבחון מהיר:</p>
      <p className="text-xs">משטח סגור (כדור, חרוט+בסיס) → גאוס</p>
      <p className="text-xs">אינטגרל קווי ↔ אינטגרל שטח של רוטור → סטוקס</p>
      <p className="text-xs">div(F)=0 → שטף דרך מעטפת סגורה = 0</p>
      <p className="text-xs">גאוס + קוטביות גלילית: x=rcosθ, y=rsinθ, z=z</p>
    </div>,
  },
]

const intro = <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
  <p>
    שטף דרך משטח = כמות ה<span className="text-blue-400 font-semibold">נוזל</span> (שדה) שעוברת דרך הפאה.
    הכלי הגדול: <span className="text-white font-semibold">גאוס</span> — הופך אינטגרל שטח לאינטגרל נפח.
  </p>
  <Formula c="∯_S F·dS = ∭_V div(F) dV" color="text-blue-300" />
  <p>
    ב<span className="text-yellow-400 font-semibold">כל מבחן</span>: גאוס + קוטביות גלילית/כדורית, או סטוקס.
  </p>
</div>

const theory: TheoryCard = {
  summary: 'שטף = כמה "נוזל" עובר דרך משטח. לחישוב שטף ישיר — מפרמטרים את המשטח. אבל הכלי החזק הוא גאוס (Divergence Theorem): הופך שטף דרך מעטפת סגורה לאינטגרל נפחי — לרוב הרבה יותר קל. סטוקס: מחבר שטף של רוטור לאינטגרל קווי על הגבול.',
  formulas: [
    { label: 'גאוס', tex: '\\oiint_S \\mathbf{F}\\cdot d\\mathbf{S} = \\iiint_V \\nabla\\cdot\\mathbf{F}\\,dV', verbal: 'משפט הסטייה — שטף דרך משטח סגור = אינטגרל של div(F) על הנפח. כמו גאוס בפיזיקה' },
    { label: 'סטוקס', tex: '\\iint_S (\\nabla\\times\\mathbf{F})\\cdot d\\mathbf{S} = \\oint_{\\partial S} \\mathbf{F}\\cdot d\\mathbf{r}', verbal: 'מחבר אינטגרל קווי עם אינטגרל שטח. curl מודד כמה השדה "מסתחרר"' },
  ],
  when: 'משטח סגור → גאוס. השטח לא סגור ויש רוטור → סטוקס. אחרת → ישיר עם פרמטריזציה.',
}

export const practice: QuizQuestion[] = [
  {
    question: 'F = (x,y,z). מהו div(F)?',
    options: ["0", "1", "3", "x+y+z"],
    correct: 2,
    explanation: "div(F) = ∂x/∂x + ∂y/∂y + ∂z/∂z = 1+1+1 = 3",
  },
  {
    question: 'גאוס: ∯_S F·dS = ∭_V 3 dV כש-V הוא כדור ברדיוס R. מה הערך?',
    options: ["3πR²", "4πR³", "4πR³/3", "3·(4πR³/3) = 4πR³"],
    correct: 3,
    explanation: "∭_V 3 dV = 3·Vol(V) = 3·(4πR³/3) = 4πR³",
  },
  {
    question: 'מתי עדיף להשתמש בסטוקס?',
    options: [
      "כשיש משטח סגור",
      "כש-div(F) = 0",
      "כשיש שטף של רוטור על משטח פתוח",
      "כשהשדה שמור",
    ],
    correct: 2,
    explanation: "סטוקס: ∬_S (∇×F)·dS = ∮_∂S F·dr. שימושי כשהאינטגרל הקווי על הגבול קל יותר",
  },
]

export default function SurfaceIntegrals({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="calc2-surface"
    title="אינטגרל שטח ושטף"
    subtitle="גאוס, סטוקס, Divergence Theorem"
    intro={intro} theory={theory} step1={step1} step2={step2} step3={step3}
    SimulatorComponent={Sim} quizQuestions={quiz} practiceQuestions={practice}
    greenNote={greenNote} guides={guides}
    onBack={onBack}
  />
}
