import React, { useState } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import type { QuizQuestion, GuideSection } from '../../types'

function Sim({ currentStep }: { currentStep: number }) {
  const [pathType, setPathType] = useState<'line' | 'circle' | 'parabola'>('circle')

  const W = 240, H = 180, cx = W / 2, cy = H / 2

  // Draw path
  const pathPts = (() => {
    if (pathType === 'circle') {
      return Array.from({ length: 61 }, (_, i) => {
        const t = (i / 60) * 2 * Math.PI
        return `${cx + 55 * Math.cos(t)},${cy - 55 * Math.sin(t)}`
      }).join(' ')
    }
    if (pathType === 'line') {
      return `${cx - 70},${cy + 50} ${cx + 70},${cy - 50}`
    }
    // parabola y=x²
    return Array.from({ length: 41 }, (_, i) => {
      const x = -2 + (i / 40) * 4
      const y = x * x - 2
      return `${cx + x * 30},${cy - y * 20}`
    }).join(' ')
  })()

  // Arrow at midpoint
  const arrowPts = pathType === 'circle'
    ? [{ x: cx + 55, y: cy }, { x: cx + 50, y: cy - 12 }]
    : [{ x: cx, y: cy }, { x: cx + 10, y: cy - 8 }]

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="flex gap-2 flex-wrap justify-center">
        {(['circle', 'line', 'parabola'] as const).map(p => (
          <button key={p} onClick={() => setPathType(p)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${pathType === p ? 'bg-teal-500 text-white' : 'bg-white/10 text-slate-400'}`}>
            {p === 'circle' ? 'מעגל' : p === 'line' ? 'קטע ישר' : 'פרבולה'}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="240" height="180">
        <line x1="10" y1={cy} x2={W - 10} y2={cy} stroke="#334155" strokeWidth="1.5" />
        <line x1={cx} y1="10" x2={cx} y2={H - 10} stroke="#334155" strokeWidth="1.5" />

        <polyline points={pathPts} fill="none" stroke="#14b8a6" strokeWidth="2.5" />

        {/* Arrow indicator */}
        <polygon
          points={`${arrowPts[1].x},${arrowPts[1].y} ${arrowPts[1].x - 8},${arrowPts[1].y + 5} ${arrowPts[1].x - 5},${arrowPts[1].y - 5}`}
          fill="#14b8a6"
        />

        {/* Field vectors */}
        {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([fx, fy], i) => (
          <line key={i}
            x1={cx + fx * 40} y1={cy - fy * 30}
            x2={cx + fx * 40 + 12} y2={cy - fy * 30 - 8}
            stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#arrow)" />
        ))}

        <text x={cx + 60} y={cy - 55} fill="#14b8a6" fontSize="9">L</text>
        <text x={W - 40} y="20" fill="#f59e0b" fontSize="8">F⃗ שדה</text>
      </svg>

      <div className="bg-white/10 rounded-xl p-2 text-center text-xs" dir="ltr">
        <p className="font-mono text-slate-300">∫_L P dx + Q dy</p>
        <p className="text-teal-400 text-xs mt-1">
          {pathType === 'circle' ? 'ניתן להשתמש בגרין!' : pathType === 'line' ? 'פרמטריזציה: (1-t)A + tB' : 'פרמטריזציה: x=t, y=t²'}
        </p>
      </div>
    </div>
  )
}

const step1 = (
  <PatternStep
    scenario={<>
      <span className="font-mono text-emerald-300" dir="ltr">∫_L (y+eˣ²)dx + (2x+yeʸ²)dy</span>
      <br />L: מ-(0,0) ל-(1,1) לאורך y=x². כיצד תחשב?
    </>}
    options={[
      { label: 'בדוק שימור שדה (∂P/∂y = ∂Q/∂x) → השתמש בפוטנציאל', correct: true },
      { label: 'פרמטריזציה y=x² והכנס', correct: false, desc: 'יעבוד, אבל אם השדה שמור — הרבה יותר קל' },
      { label: 'גרין (השתמש בשטח)', correct: false, desc: 'גרין לקו סגור, לא קטע פתוח' },
      { label: 'חשב ישירות עם ds', correct: false },
    ]}
    correctFeedback="נכון! בדוק: ∂P/∂y = 1 = ∂Q/∂x = 2? לא. אבל השדה (y+eˣ²,2x+yeʸ²): ∂P/∂y=1, ∂Q/∂x=2. לא שמור — אז פרמטריזציה."
  />
)

const step2 = (
  <PrincipleStep
    heading="אינטגרל קווי — כלים:"
    items={[
      {
        title: 'שדה שמור (conservative)',
        content: <>
          <Formula c="∂P/∂y = ∂Q/∂x  →  ∃ φ: ∫_L = φ(B) - φ(A)" color="text-teal-300" />
          <span className="text-slate-400 text-xs">מצא פוטנציאל φ: φ_x=P, φ_y=Q. תלוי רק בנקודות קצה!</span>
        </>,
        accent: 'text-teal-400',
      },
      {
        title: 'פרמטריזציה',
        content: <>
          <div dir="ltr" className="font-mono text-xs text-blue-300 space-y-0.5">
            <p>x=x(t), y=y(t), t∈[a,b]</p>
            <p>∫_L P dx + Q dy = ∫_a^b [P·x' + Q·y'] dt</p>
          </div>
        </>,
        accent: 'text-blue-400',
      },
      {
        title: 'משפט גרין (קו סגור)',
        content: <>
          <Formula c="∮_L P dx + Q dy = ∬_D (∂Q/∂x - ∂P/∂y) dA" color="text-purple-300" />
          <span className="text-slate-400 text-xs">L חייב להיות סגור ומכוון נגד כיוון השעון!</span>
        </>,
        accent: 'text-purple-400',
      },
    ]}
  />
)

const step3 = (
  <WorkedExample
    examLabel="מבחן HIT — 2024 (שאלה 3)"
    problem={<>
      חשב <span className="font-mono text-blue-300" dir="ltr">∫_L (y+eˣ²)dx + (2x+yeʸ²)dy</span>
      <br />L: y=x² מ-(0,0) ל-(1,1).
    </>}
    hint="∂P/∂y=1 ≠ ∂Q/∂x=2 → לא שמור. פרמטריזציה: x=t, y=t², t∈[0,1]."
    solution={[
      { label: 'פרמטריזציה:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">x=t, y=t², dx=dt, dy=2t dt</pre> },
      { label: 'הצב:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">∫₀¹ [(t²+eᵗ²)·1 + (2t+t²eᵗ⁴)·2t] dt{'\n'}= ∫₀¹ [t²+eᵗ²+4t²+2t³eᵗ⁴] dt</pre> },
      { label: 'חשב:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">[t³/3]₀¹ + [eᵗ²/2]₀¹ + [4t³/3]₀¹ + [eᵗ⁴/2]₀¹{'\n'}= 1/3 + (e-1)/2 + 4/3 + (e-1)/2{'\n'}= 5/3 + (e-1)</pre> },
    ]}
  />
)

const quiz: QuizQuestion[] = [
  {
    question: 'P=y, Q=x. האם השדה שמור?',
    options: ['כן, ∂P/∂y=1=∂Q/∂x', 'לא, ∂P/∂y≠∂Q/∂x', 'רק על עקומות סגורות', 'תלוי בנתיב'],
    correct: 0,
    explanation: '∂P/∂y = 1 = ∂Q/∂x = 1. כן שמור! פוטנציאל: φ=xy. האינטגרל תלוי רק בנקודות קצה.',
  },
  {
    question: 'גרין: ∮_L y dx - x dy, L: מעגל x²+y²=1 (נגד כיוון השעון). מה התשובה?',
    options: ['-2π', '2π', '0', 'π'],
    correct: 0,
    explanation: '∂Q/∂x - ∂P/∂y = -1-1 = -2. ∬_D (-2) dA = -2·π·1² = -2π.',
  },
  {
    question: 'שדה שמור F=∇φ. ∫_A^B F·dr = ?',
    options: ['φ(B) - φ(A)', '∬_D F dA', '0 תמיד', 'תלוי בנתיב'],
    correct: 0,
    explanation: 'שדה שמור: אינטגרל = הפרש הפוטנציאל. לא תלוי בנתיב — רק בנקודות קצה!',
  },
]

const greenNote = [
  'שדה שמור: ∂P/∂y = ∂Q/∂x → מצא φ, חשב φ(B)-φ(A)',
  'פרמטריזציה: x=x(t), y=y(t) → ∫[P·x\'+Q·y\'] dt',
  'גרין: ∮_L = ∬_D (Q_x - P_y) dA — רק לקו סגור, נגד השעון',
  'תמיד בדוק שימור קודם — חוסך חישוב!',
]

const guides: GuideSection[] = [
  {
    title: 'נוסחאות',
    content: <div className="space-y-2 text-sm" dir="ltr">
      <p className="text-teal-400 font-bold text-xs">Conservative Field Test</p>
      <p className="font-mono text-xs text-slate-300">∂P/∂y = ∂Q/∂x → conservative</p>
      <p className="font-mono text-xs text-slate-300">Find φ: φ_x=P, φ_y=Q</p>
      <p className="text-blue-400 font-bold text-xs mt-2">Parametrization</p>
      <p className="font-mono text-xs text-slate-300">∫_L Pdx+Qdy = ∫_a^b [Px'+Qy'] dt</p>
      <p className="text-purple-400 font-bold text-xs mt-2">Green's Theorem</p>
      <p className="font-mono text-xs text-slate-300">∮_L Pdx+Qdy = ∬_D(∂Q/∂x-∂P/∂y)dA</p>
    </div>,
  },
  { title: 'מהרצאה', content: <div className="text-slate-400 text-sm p-3 border border-dashed border-slate-700 rounded-xl text-center"><p>📖 סיכום ההרצאה יתווסף כאן</p></div> },
]

const intro = <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
  <p>
    אינטגרל קווי = <span className="text-teal-400 font-semibold">עבודה של שדה</span> לאורך נתיב.
    הטריק הגדול: אם השדה <span className="text-white font-semibold">שמור</span> — לא צריך לחשב את הנתיב כלל!
  </p>
  <Formula c="∂P/∂y = ∂Q/∂x  →  ∫_L = φ(B) - φ(A)" color="text-teal-300" />
  <p>
    ב<span className="text-yellow-400 font-semibold">כל מבחן</span>: בדיקת שימור + גרין לקו סגור.
  </p>
</div>

const theory: TheoryCard = {
  summary: 'אינטגרל קווי ∫_L P dx + Q dy מחשב "עבודה" של שדה לאורך עקומה. אם ∂P/∂y = ∂Q/∂x — השדה שמור ויש פוטנציאל φ, ואז ∫_L = φ(B) - φ(A) — לא צריך לחשב את הנתיב! לקו סגור — משפט גרין הופך לאינטגרל כפול.',
  formulas: [
    { label: 'שימור', tex: '\\frac{\\partial P}{\\partial y} = \\frac{\\partial Q}{\\partial x} \\;\\Rightarrow\\; \\int_L = \\varphi(B)-\\varphi(A)' },
    { label: 'גרין', tex: '\\oint_L P\\,dx+Q\\,dy = \\iint_D\\!\\left(\\frac{\\partial Q}{\\partial x}-\\frac{\\partial P}{\\partial y}\\right)dA' },
  ],
  when: 'בדוק ∂P/∂y מול ∂Q/∂x תמיד! שווים → שמור → פוטנציאל. קו סגור → גרין.',
}

const practice: QuizQuestion[] = [
  {
    question: 'P = 2xy, Q = x². האם השדה שמור?',
    options: [
      "כן — ∂P/∂y = 2x = ∂Q/∂x",
      "לא — ∂P/∂y ≠ ∂Q/∂x",
      "רק אם הנתיב ישר",
      "לא ניתן לדעת",
    ],
    correct: 0,
    explanation: "∂P/∂y = 2x, ∂Q/∂x = 2x — שווים → שדה שמור. יש φ כך ש-∇φ = (P,Q)",
  },
  {
    question: 'עבור שדה שמור, ∫_L מנקודה A=(0,0) ל-B=(1,1)?',
    options: [
      "תלוי בנתיב",
      "φ(1,1) - φ(0,0)",
      "∬_D (∂Q/∂x - ∂P/∂y) dA",
      "0 תמיד",
    ],
    correct: 1,
    explanation: "שמור → תלוי רק בקצוות: ∫_L = φ(B) - φ(A)",
  },
  {
    question: 'לקו סגור C ושדה שמור, ∮_C P dx + Q dy = ?',
    options: ["∬_D 1 dA", "φ(A) - φ(A) = 0", "2·Area(D)", "∬_D (Qx - Py) dA"],
    correct: 1,
    explanation: "שמור → פוטנציאל → קו סגור: φ(A) - φ(A) = 0",
  },
]

export default function LineIntegrals({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="calc2-line"
    title="אינטגרל קווי"
    subtitle="שדה שמור, פוטנציאל, גרין"
    intro={intro} theory={theory} step1={step1} step2={step2} step3={step3}
    SimulatorComponent={Sim} quizQuestions={quiz} practiceQuestions={practice}
    greenNote={greenNote} guides={guides}
    onBack={onBack}
  />
}
