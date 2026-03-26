import React, { useState } from 'react'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note, FormulaBlock } from '../../components/StepHelpers'
import type { QuizQuestion, GuideSection } from '../../types'

function Sim({ currentStep }: { currentStep: number }) {
  const [N, setN] = useState(3)
  const [funcType, setFuncType] = useState<'square' | 'sawtooth' | 'triangle'>('square')

  const W = 240, H = 160, ox = 20, oy = H / 2
  const L = 2 * Math.PI

  const evalFourier = (x: number): number => {
    let sum = 0
    for (let k = 1; k <= N; k++) {
      if (funcType === 'square') {
        if (k % 2 === 1) sum += (4 / (k * Math.PI)) * Math.sin(k * x)
      } else if (funcType === 'sawtooth') {
        sum += (2 / (k * Math.PI)) * Math.pow(-1, k + 1) * Math.sin(k * x)
      } else {
        if (k % 2 === 1) sum += (8 / (k * k * Math.PI * Math.PI)) * Math.pow(-1, (k - 1) / 2) * Math.sin(k * x)
      }
    }
    return sum
  }

  const evalExact = (x: number): number => {
    const xMod = ((x % L) + L) % L
    if (funcType === 'square') return xMod < Math.PI ? 1 : -1
    if (funcType === 'sawtooth') return (xMod / Math.PI) - 1
    return xMod < Math.PI ? (2 * xMod / Math.PI - 1) : (3 - 2 * xMod / Math.PI)
  }

  const xRange = [-6, 6]
  const makePoints = (fn: (x: number) => number) =>
    Array.from({ length: 120 }, (_, i) => {
      const x = xRange[0] + (i / 119) * (xRange[1] - xRange[0])
      const y = fn(x)
      return `${ox + (x - xRange[0]) / (xRange[1] - xRange[0]) * (W - ox - 10)},${oy - y * 50}`
    }).join(' ')

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="flex gap-2 flex-wrap justify-center">
        {([
          ['square', 'ריבועית'],
          ['sawtooth', 'מסור'],
          ['triangle', 'משולשת'],
        ] as const).map(([k, label]) => (
          <button key={k} onClick={() => setFuncType(k as any)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${funcType === k ? 'bg-pink-500 text-white' : 'bg-white/10 text-slate-400'}`}>
            {label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="240" height="160">
        <line x1={ox} y1={oy} x2={W - 8} y2={oy} stroke="#334155" strokeWidth="1.5" />
        <polyline points={makePoints(evalExact)} fill="none" stroke="#334155" strokeWidth="1.5" />
        <polyline points={makePoints(evalFourier)} fill="none" stroke="#ec4899" strokeWidth="2" />
        <text x={W - 70} y="16" fill="#334155" fontSize="8">מקורי</text>
        <text x={W - 70} y="26" fill="#ec4899" fontSize="8">פורייה ({N} הרמוניות)</text>
      </svg>

      <div className="w-full px-3">
        <div className="flex justify-between text-xs text-slate-400 mb-0.5">
          <span>מספר הרמוניות N</span>
          <span className="text-pink-400 font-bold">{N}</span>
        </div>
        <input type="range" min={1} max={15} step={1} value={N}
          onChange={e => setN(+e.target.value)}
          className="w-full accent-pink-500 h-1.5 rounded-full" />
      </div>
    </div>
  )
}

const step1 = (
  <PatternStep
    scenario={<>
      <span className="font-mono text-emerald-300" dir="ltr">f(x) = x, -π &lt; x &lt; π</span>
      {' '}— חשב טור פורייה. מה aₙ?
    </>}
    options={[
      { label: 'aₙ = 0 כי f פונקציה אי-זוגית', correct: true },
      { label: 'aₙ = 1/nπ · ∫ x·cos(nx) dx', correct: false, desc: 'נכון אלגברית, אבל הדרך הקצרה: f אי-זוגית → aₙ=0' },
      { label: 'aₙ = 2/π', correct: false },
      { label: 'aₙ = 1/n', correct: false },
    ]}
    correctFeedback="נכון! f(x)=x אי-זוגית. cos(nx) זוגית. מכפלה = אי-זוגית. ∫ מ-π עד π = 0. חוסך המון חישוב!"
  />
)

const step2 = (
  <PrincipleStep
    heading="טורי פורייה — שיטה:"
    items={[
      {
        title: 'מקדמי פורייה (תקופה 2π)',
        content: <div className="space-y-2">
          <FormulaBlock
            formula="a₀ = (1/π)∫_{-π}^π f(x) dx"
            verbal="המקדם הקבוע — ממוצע הפונקציה על תקופה מלאה. אם f סימטרית סביב ציר x (כמו sin) — a₀=0."
            color="text-pink-300"
          />
          <FormulaBlock
            formula="aₙ = (1/π)∫_{-π}^π f(x)·cos(nx) dx"
            verbal="כמה 'דומה' f לגל cos בתדר n. אם f אי-זוגית — aₙ=0 לכל n (מכפלת זוגית×אי-זוגית אינטגרלה אפס)."
            color="text-pink-300"
          />
          <FormulaBlock
            formula="bₙ = (1/π)∫_{-π}^π f(x)·sin(nx) dx"
            verbal="כמה 'דומה' f לגל sin בתדר n. אם f זוגית — bₙ=0 לכל n."
            color="text-pink-300"
          />
        </div>,
        accent: 'text-pink-400',
      },
      {
        title: 'קיצורים — זוגיות/אי-זוגיות',
        content: <>
          <div className="text-xs text-slate-300 space-y-0.5">
            <p><span className="text-pink-400">f זוגית</span>: bₙ=0, aₙ = (2/π)∫₀^π f·cos(nx)dx</p>
            <p><span className="text-blue-400">f אי-זוגית</span>: aₙ=0, bₙ = (2/π)∫₀^π f·sin(nx)dx</p>
          </div>
          <Note color="yellow" children={<>תמיד בדוק זוגיות קודם — חוסך חצי עבודה!</>} />
        </>,
        accent: 'text-pink-400',
      },
      {
        title: 'משפט פרסוול',
        content: <div className="space-y-2">
          <FormulaBlock
            formula="(1/π)∫f² dx = a₀²/2 + Σ(aₙ²+bₙ²)"
            verbal="'אנרגיית' הפונקציה שווה לסכום אנרגיות כל הרמוניות. משמש להוכיח Σ1/n²=π²/6: חשב טור ל-f=x, הצב x=π, קבל סכום."
            color="text-orange-300"
          />
        </div>,
        accent: 'text-orange-400',
      },
    ]}
  />
)

const step3 = (
  <WorkedExample
    examLabel="מבחן HIT — 2024 (פורייה)"
    problem={<>
      <span className="font-mono text-blue-300" dir="ltr">f(x) = |x|, -π &lt; x &lt; π</span>
      <br />חשב טור פורייה ומצא Σ1/(2n-1)².
    </>}
    hint="f(x)=|x| זוגית → bₙ=0. חשב a₀, aₙ. פרסוול → Σ1/n²."
    solution={[
      { label: 'a₀:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">{'a₀ = (1/π)∫_{-π}^π |x| dx = (2/π)∫₀^π x dx = π'}</pre> },
      { label: 'aₙ (n≥1):', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">{'aₙ = (2/π)∫₀^π x·cos(nx) dx\n= (2/π)[x·sin(nx)/n + cos(nx)/n²]₀^π\n= (2/πn²)(cosπn - 1)\nn זוגי → 0; n אי-זוגי → -4/(πn²)'}</pre> },
      { label: 'טור:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">{'f = π/2 - (4/π)[cos(x)/1² + cos(3x)/3² + ...]\nפרסוול: Σ1/(2k-1)² = π²/8'}</pre> },
    ]}
  />
)

const quiz: QuizQuestion[] = [
  {
    question: 'f(x)=x² בתקופה 2π. מה bₙ?',
    options: ['bₙ=0 (f זוגית)', 'bₙ=2/nπ', 'bₙ=(-1)ⁿ·2/n', 'bₙ=4/n²π'],
    correct: 0,
    explanation: 'x² זוגית → בטור הפורייה רק cos. bₙ = 0 תמיד לפונקציה זוגית.',
  },
  {
    question: 'פרסוול: f(x)=1, [-π,π]. מה הסכום?',
    options: ['1 = a₀²/2', 'π = Σ|aₙ|', '2π = ∫f²', '1/π·∫f²dx = 1'],
    correct: 3,
    explanation: '(1/π)∫_{-π}^π 1² dx = 2π/π = 2. אבל a₀=(1/π)·2π=2, a₀²/2=2. אז 2 = 2 ✓.',
  },
  {
    question: 'בנקודת אי-רציפות x₀, טור פורייה שווה:',
    options: ['[f(x₀⁺)+f(x₀⁻)]/2', 'f(x₀⁺)', 'f(x₀⁻)', '0'],
    correct: 0,
    explanation: 'משפט דיריכלה: בנקודת קפיצה, הטור מתכנס לממוצע הגבולות מימין ומשמאל.',
  },
]

const greenNote = [
  'זוגית → bₙ=0, אי-זוגית → aₙ=0. תמיד בדוק קודם!',
  'a₀=(1/π)∫f dx, aₙ=(1/π)∫f·cos(nx)dx, bₙ=(1/π)∫f·sin(nx)dx',
  'פרסוול: (1/π)∫f² = a₀²/2 + Σ(aₙ²+bₙ²) → Σ1/n² ועוד',
  'נקודת קפיצה: טור → [f(x⁺)+f(x⁻)]/2',
]

const guides: GuideSection[] = [
  {
    title: 'נוסחאות',
    content: <div className="space-y-2 text-sm" dir="ltr">
      <p className="text-pink-400 font-bold text-xs">Fourier Coefficients (period 2π)</p>
      <p className="font-mono text-xs text-slate-300">{'a₀ = (1/π)∫_{-π}^π f dx'}</p>
      <p className="font-mono text-xs text-slate-300">aₙ = (1/π)∫f·cos(nx)dx</p>
      <p className="font-mono text-xs text-slate-300">bₙ = (1/π)∫f·sin(nx)dx</p>
      <p className="text-orange-400 font-bold text-xs mt-2">Parseval</p>
      <p className="font-mono text-xs text-slate-300">(1/π)∫f² = a₀²/2 + Σ(aₙ²+bₙ²)</p>
      <p className="text-blue-400 font-bold text-xs mt-2">Common Results</p>
      <p className="font-mono text-xs text-slate-300">Σ1/n² = π²/6</p>
      <p className="font-mono text-xs text-slate-300">Σ1/(2n-1)² = π²/8</p>
    </div>,
  },
  {
    title: 'סימטריה',
    content: <div className="space-y-2 text-xs text-slate-300">
      <div className="bg-white/5 rounded-xl p-3 space-y-1">
        <p className="text-pink-400 font-bold">פונקציה זוגית f(-x)=f(x)</p>
        <p className="font-mono text-slate-200" dir="ltr">bₙ = 0  (אין sin)</p>
        <p className="font-mono text-slate-200" dir="ltr">aₙ = (2/π)∫₀^π f·cos(nx)dx</p>
        <p className="text-slate-400">חוסכים חישוב — רק cos נשאר.</p>
      </div>
      <div className="bg-white/5 rounded-xl p-3 space-y-1">
        <p className="text-orange-400 font-bold">פונקציה אי-זוגית f(-x)=-f(x)</p>
        <p className="font-mono text-slate-200" dir="ltr">aₙ = 0  (אין cos, גם a₀=0)</p>
        <p className="font-mono text-slate-200" dir="ltr">bₙ = (2/π)∫₀^π f·sin(nx)dx</p>
        <p className="text-slate-400">רק sin נשאר.</p>
      </div>
      <Note color="emerald" children={<>בדוק סימטריה לפני שמחשב — חוסך חצי מהחישוב.</>} />
    </div>,
  },
  {
    title: 'פרסוול',
    content: <div className="space-y-2 text-xs text-slate-300">
      <div className="bg-white/5 rounded-xl p-3 space-y-1">
        <p className="text-orange-400 font-bold">משפט פרסוול</p>
        <p className="font-mono text-slate-200" dir="ltr">{'(1/π)∫_{-π}^π f² dx = a₀²/2 + Σ(aₙ²+bₙ²)'}</p>
        <p className="text-slate-400">משמש להוכיח Σ1/n² = π²/6 מטור פורייה של f(x)=x.</p>
      </div>
      <p className="text-emerald-400 font-bold">תוצאות קלאסיות:</p>
      <ul className="font-mono text-slate-300 space-y-0.5 text-[11px]" dir="ltr">
        <li>Σ 1/n² = π²/6</li>
        <li>Σ 1/(2n-1)² = π²/8</li>
        <li>Σ (-1)^(n+1)/n = ln(2)</li>
      </ul>
      <Note color="blue" children={<>בדרך כלל: חשב טור → הצב x מיוחד → קבל ערך של Σ1/nᵖ.</>} />
    </div>,
  },
  {
    title: 'במבחן HIT',
    content: <div className="space-y-2 text-xs text-slate-300">
      <p className="text-emerald-400 font-bold">שאלה טיפוסית:</p>
      <p>מצא טור פורייה של f(x) = |x| ב-[-π,π]. הוכח Σ1/(2n-1)²=π²/8.</p>
      <div className="bg-white/5 rounded-xl p-2 text-xs space-y-1">
        <p>1. זוגית → bₙ=0, aₙ=(2/π)∫₀^π x cos(nx)dx</p>
        <p>2. אינטגרציה בחלקים → aₙ = 2((-1)ⁿ-1)/(πn²)</p>
        <p>3. n אי-זוגי: aₙ=-4/(πn²), n זוגי: aₙ=0</p>
        <p>4. הצב x=0: 0 = π/2 - (4/π)Σ1/(2k-1)² → Σ=π²/8</p>
      </div>
      <Note color="yellow" children={<>תמיד: 1. בדוק סימטריה 2. חשב aₙ/bₙ 3. הצב x מיוחד לקבל Σ.</>} />
    </div>,
  },
]

const intro = <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
  <p>
    כל פונקציה תקופתית = סכום של <span className="text-pink-400 font-semibold">גלי סינוס וקוסינוס</span>.
    זה בסיס לעיבוד אות, תמונות, MP3.
  </p>
  <Formula c="f(x) = a₀/2 + Σ [aₙcos(nx) + bₙsin(nx)]" color="text-pink-300" />
  <p>
    הטריק הגדול: <span className="text-white font-semibold">בדוק זוגיות</span> — חוסך חצי חישוב.
    <span className="text-yellow-400 font-semibold"> כל מבחן</span>: חשב טור + פרסוול.
  </p>
</div>

const theory: TheoryCard = {
  summary: 'כל פונקציה תקופתית f(x) ניתן לפרק לסכום אינסופי של גלי סינוס וקוסינוס. המקדמים aₙ ו-bₙ מחושבים עם אינטגרלים. טריק חשוב: פונקציה זוגית f(-x)=f(x) → רק cos (bₙ=0). פונקציה אי-זוגית f(-x)=-f(x) → רק sin (aₙ=0). פרסוול: סכום |מקדמים|² = אנרגיה.',
  formulas: [
    { label: 'מקדם cos', tex: 'a_n = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\cos(nx)\\,dx', verbal: 'כמה הפונקציה "דומה" לגל cos בתדר n. אם f זוגית — רק cos נשאר (bₙ=0). אם f אי-זוגית — rq cos נאפס (aₙ=0). שורה תחתונה: בדוק זוגיות לפני שמחשב!' },
    { label: 'פרסוול', tex: '\\frac{1}{\\pi}\\int_{-\\pi}^{\\pi}|f|^2\\,dx = \\frac{a_0^2}{2}+\\sum_{n=1}^\\infty(a_n^2+b_n^2)', verbal: '"אנרגיית" הפונקציה = סכום "אנרגיות" כל ההרמוניות. שימוש: חשב טור ל-f=x → אנגדל ← Σ1/n²=π²/6. חשב ל-f=|x| → Σ1/(2n-1)²=π²/8.' },
  ],
  when: 'בדוק זוגיות לפני שמחשב! חצי מהמקדמים נאפסים → זמן עבודה חצי. פרסוול → סכומי טורים מיוחדים',
}

const practice: QuizQuestion[] = [
  {
    question: 'f(x) = x² בתקופה [-π,π]. האם זוגית?',
    options: [
      "כן — f(-x) = (-x)² = x² = f(x)",
      "לא — f(-x) = -x²",
      "לא ניתן לדעת",
      "זוגית חלקית",
    ],
    correct: 0,
    explanation: "f(-x) = (-x)² = x² = f(x) → זוגית → bₙ = 0, רק מקדמי cos",
  },
  {
    question: 'f(x) = x בתקופה [-π,π]. מה המקדמים?',
    options: [
      "רק aₙ (פונקציה זוגית)",
      "רק bₙ (פונקציה אי-זוגית)",
      "גם aₙ וגם bₙ",
      "a₀ בלבד",
    ],
    correct: 1,
    explanation: "f(-x) = -x = -f(x) → אי-זוגית → aₙ = 0 לכל n. רק bₙ.",
  },
  {
    question: 'לאיזו מטרה משתמשים בנוסחת פרסוול?',
    options: [
      "לחישוב המקדמים בצורה מהירה",
      "לחישוב סכומי טורים כמו Σ1/n²",
      "לבדיקת זוגיות",
      "לפישוט האינטגרל",
    ],
    correct: 1,
    explanation: "פרסוול מקשר אנרגיית f לאנרגיית המקדמים → מאפשר חישוב Σ1/n² = π²/6 וכדומה",
  },
]

export default function FourierSeries({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="series-fourier"
    title="טורי פורייה"
    subtitle="מקדמי פורייה, זוגיות, פרסוול"
    intro={intro} theory={theory} step1={step1} step2={step2} step3={step3}
    SimulatorComponent={Sim} quizQuestions={quiz} practiceQuestions={practice}
    greenNote={greenNote} guides={guides}
    onBack={onBack}
  />
}
