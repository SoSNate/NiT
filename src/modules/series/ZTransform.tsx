import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import { GlassCard, StyledSlider, SimReadout } from '../../components/SimulatorShell'
import type { QuizQuestion, GuideSection } from '../../types'

function Sim({ currentStep: _cs }: { currentStep: number }) {
  const [a, setA]   = useState(0.7)
  const [n0, setN0] = useState(0)
  const N = 13

  const stems = useMemo(() =>
    Array.from({ length: N }, (_, n) => ({
      n,
      value: n >= n0 ? Math.pow(a, n - n0) : 0,
    })),
    [a, n0]
  )

  const maxVal = Math.max(...stems.map(s => s.value), 0.01)
  const svgW = 400, svgH = 200
  const padL = 28, padR = 12, padT = 18, padB = 32
  const innerW = svgW - padL - padR
  const innerH = svgH - padT - padB
  const colW = innerW / N

  return (
    <div className="w-full space-y-4" dir="ltr">
      <GlassCard className="bg-slate-950 overflow-hidden">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
          <line x1={padL} y1={padT + innerH} x2={svgW - padR} y2={padT + innerH} stroke="#334155" strokeWidth="1.5" />
          <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="#334155" strokeWidth="1.5" />
          {stems.map(({ n, value }) => {
            const x = padL + n * colW + colW / 2
            const barH = (value / maxVal) * (innerH - 6)
            const y = padT + innerH - barH
            const active = value > 0
            return (
              <g key={n}>
                <motion.line x1={x} y1={padT + innerH} x2={x}
                  animate={{ y2: y }}
                  transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                  stroke={active ? '#f59e0b' : '#1e293b'} strokeWidth="2.5" />
                <motion.circle cx={x}
                  animate={{ cy: y }}
                  transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                  r={4} fill={active ? '#f59e0b' : '#1e293b'} />
                <text x={x} y={padT + innerH + 14} textAnchor="middle" fill="#475569" fontSize="8">{n}</text>
              </g>
            )
          })}
          <text x={svgW - padR - 6} y={padT + innerH - 4} fill="#475569" fontSize="9">n</text>
          <text x={padL + 3} y={padT + 10} fill="#475569" fontSize="9">x[n]</text>
        </svg>
      </GlassCard>

      <SimReadout
        label="X(z)"
        value={n0 === 0 ? `z/(z−${a})` : `z·z⁻${n0}/(z−${a})`}
        unit={`ROC: |z|>${a}`}
      />

      <StyledSlider label="בסיס a" value={a} min={0.1} max={1.8} step={0.05} unit="" onChange={setA} />
      <StyledSlider label="הזזה n₀" value={n0} min={0} max={5} step={1} unit="דגימות" onChange={setN0} />
      <div className="text-xs text-center text-slate-500">
        {a < 1 ? '|a| < 1 → דועך (יציב)' : a === 1 ? '|a| = 1 → קבוע' : '|a| > 1 → גדל (לא יציב)'}
      </div>
    </div>
  )
}

const step1 = (
  <PatternStep
    scenario={<>
      פתור משוואת הפרש:{' '}
      <span className="font-mono text-emerald-300" dir="ltr">y[n] - (1/2)y[n-1] = δ[n], y[-1]=0</span>
      <br />כיצד?
    </>}
    options={[
      { label: 'Z-טרנספורם: Y - (1/2)z⁻¹Y = 1. פתור ל-Y(z)', correct: true },
      { label: 'לפלס (t רציף)', correct: false, desc: 'לפלס לאותות רציפים — Z לדיסקרטיים' },
      { label: 'פתור ישירות בצעד אחרי צעד', correct: false, desc: 'נכון אבל לא יעיל עבור פתרון סגור' },
      { label: 'פורייה דיסקרטי', correct: false },
    ]}
    correctFeedback="נכון! Z{y[n-1]}=z⁻¹Y(z). משוואה: Y(1-z⁻¹/2)=1 → Y=z/(z-1/2). Z⁻¹: y[n]=(1/2)ⁿu[n]."
  />
)

const step2 = (
  <PrincipleStep
    heading="התמרת Z — כלים:"
    items={[
      {
        title: 'טבלת Z חשובים',
        content: <div dir="ltr" className="font-mono text-xs space-y-0.5">
          <p className="text-orange-300">Z{'{δ[n]}'} = 1</p>
          <p className="text-orange-300">Z{'{u[n]}'} = z/(z-1)</p>
          <p className="text-orange-300">Z{'{aⁿu[n]}'} = z/(z-a), |z|&gt;|a|</p>
          <p className="text-orange-300">Z{'{n·aⁿu[n]}'} = az/(z-a)²</p>
          <p className="text-orange-300">Z{'{x[n-k]}'} = z^{'{-k}'}·X(z)</p>
        </div>,
        accent: 'text-orange-400',
      },
      {
        title: 'משוואת הפרש',
        content: <>
          <Formula c="Z{y[n-1]} = z⁻¹·Y(z)  (היסט)" color="text-blue-300" />
          <span className="text-slate-400 text-xs">שלבים: הפעל Z → פתור Y(z) → Z⁻¹</span>
        </>,
        accent: 'text-blue-400',
      },
      {
        title: 'Z⁻¹ — שברים חלקיים',
        content: <>
          <Formula c="Y(z)/z = A/(z-a) + B/(z-b)  →  Y = Az/(z-a) + Bz/(z-b)" color="text-emerald-300" />
          <span className="text-slate-400 text-xs">חלק Y(z) ב-z, פרק לשברים, הכפל חזרה ב-z</span>
        </>,
        accent: 'text-emerald-400',
      },
    ]}
  />
)

const step3 = (
  <WorkedExample
    examLabel="מבחן HIT — 2024 (Z-טרנספורם)"
    problem={<>
      פתור:{' '}
      <span className="font-mono text-blue-300" dir="ltr">y[n] - (3/4)y[n-1] + (1/8)y[n-2] = u[n]</span>
      <br /><span dir="ltr">y[-1]=y[-2]=0</span>
    </>}
    hint="Z{y[n-k]}=z^{-k}Y. פתור Y(z), פרק Y(z)/z לשברים, הכפל ב-z, Z⁻¹."
    solution={[
      { label: 'הפעל Z:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">Y - (3/4)z⁻¹Y + (1/8)z⁻²Y = z/(z-1){'\n'}Y(1 - 3/4z⁻¹ + 1/8z⁻²) = z/(z-1){'\n'}Y·(z²-3z/4+1/8)/z² = z/(z-1)</pre> },
      { label: 'Y(z):', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">Y = z³/[(z-1)(z-1/2)(z-1/4)]</pre> },
      { label: 'שברים + Z⁻¹:', content: <pre className="font-mono text-xs text-emerald-400" dir="ltr">Y/z = A/(z-1)+B/(z-1/2)+C/(z-1/4){'\n'}A=8, B=-8, C=1{'\n'}y[n] = [8·1ⁿ - 8·(1/2)ⁿ + (1/4)ⁿ]u[n]</pre> },
    ]}
  />
)

const quiz: QuizQuestion[] = [
  {
    question: 'Z{(1/3)ⁿu[n]} = ?',
    options: ['z/(z-1/3)', '1/(z-1/3)', 'z/(z+1/3)', '3z/(3z-1)'],
    correct: 0,
    explanation: 'Z{aⁿu[n]} = z/(z-a). כאן a=1/3 → z/(z-1/3).',
  },
  {
    question: 'Z{x[n-2]} = ?',
    options: ['z⁻²·X(z)', 'z²·X(z)', 'X(z-2)', 'X(z)/z²'],
    correct: 0,
    explanation: 'היסט בזמן: Z{x[n-k]} = z^{-k}·X(z). כאן k=2.',
  },
  {
    question: 'Y(z) = z/(z-0.5)(z-0.25). מהו y[n]?',
    options: ['[2·(0.5)ⁿ - (0.25)ⁿ]u[n]', '(0.5)ⁿu[n]', '(0.75)ⁿu[n]', 'תלוי בתנאי התחלה'],
    correct: 0,
    explanation: 'Y/z = A/(z-0.5)+B/(z-0.25). A=2, B=-1. y[n]=[2·(0.5)ⁿ-(0.25)ⁿ]u[n].',
  },
]

const greenNote = [
  'Z{aⁿu[n]}=z/(z-a). Z{δ[n]}=1. Z{u[n]}=z/(z-1)',
  'Z{x[n-k]}=z^{-k}·X(z) — היסט',
  'שלבים: Z → פתור Y(z) → חלק ב-z → שברים חלקיים → כפל ב-z → Z⁻¹',
  'אזור התכנסות (ROC): |z|>|a| לרצפים יאגים. חשוב ליציבות!',
]

const guides: GuideSection[] = [
  {
    title: 'טבלת Z',
    content: <div className="space-y-1 text-sm" dir="ltr">
      {[
        ['δ[n]', '1'],
        ['u[n]', 'z/(z-1)'],
        ['aⁿu[n]', 'z/(z-a)'],
        ['n·aⁿu[n]', 'az/(z-a)²'],
        ['x[n-k]', 'z^{-k}X(z)'],
        ['a·x[n]', 'a·X(z)'],
      ].map(([f, F]) => (
        <div key={f} className="bg-white/5 rounded p-1 flex justify-between">
          <span className="text-orange-300 font-mono text-xs">{f}</span>
          <span className="text-slate-300 font-mono text-xs">{F}</span>
        </div>
      ))}
    </div>,
  },
  { title: 'מהרצאה', content: <div className="text-slate-400 text-sm p-3 border border-dashed border-slate-700 rounded-xl text-center"><p>📖 סיכום ההרצאה יתווסף כאן</p></div> },
]

const intro = <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
  <p>
    התמרת Z היא <span className="text-orange-400 font-semibold">לפלס של עולם דיסקרטי</span>.
    פותרת משוואות הפרש כמו שלפלס פותרת מד"ר.
  </p>
  <Formula c="X(z) = Σ_{n=0}^∞ x[n]·z⁻ⁿ" color="text-orange-300" />
  <p>
    ב<span className="text-yellow-400 font-semibold">כל מבחן</span>: פתרון משוואת הפרש עם Z + שברים חלקיים + Z⁻¹.
  </p>
</div>

const theory: TheoryCard = {
  summary: 'התמרת Z היא הגרסה הדיסקרטית של לפלס. X(z) = Σx[n]z^(-n). Z{x[n-k]} = z^(-k)X(z) — היסט בזמן = כפל ב-z^(-k). פותרים משוואת הפרש כמו מד"ר: Z את הכל → שברים חלקיים → Z⁻¹. ROC = אזור התכנסות, חשוב לקאוזאליות.',
  formulas: [
    { label: 'Z{aⁿu[n]}', tex: 'Z\\{a^n u[n]\\} = \\frac{z}{z-a},\\quad |z|>|a|' },
    { label: 'היסט', tex: 'Z\\{x[n-k]\\} = z^{-k}X(z)' },
  ],
  when: 'מערכת דיסקרטית (סמפלינג) → Z. פתרון: כתוב H(z) → שברים חלקיים → Z⁻¹ עם טבלה',
}

const practice: QuizQuestion[] = [
  {
    question: 'Z{u[n]} = ? (u[n] = סיגנל מדרגה דיסקרטי)',
    options: ["1/(z-1)", "z/(z-1)", "1", "z/(z+1)"],
    correct: 1,
    explanation: "u[n] = 1 לכל n≥0. Z{u[n]} = Σz^(-n) = z/(z-1) עבור |z|>1",
  },
  {
    question: 'Z{x[n-2]} = ?',
    options: ["z²X(z)", "z^(-2)X(z)", "X(z)/z²", "X(z+2)"],
    correct: 1,
    explanation: "היסט: Z{x[n-k]} = z^(-k)·X(z). k=2 → z^(-2)X(z)",
  },
  {
    question: 'X(z) = z/(z-0.5). מה x[n]?',
    options: ["0.5ⁿ·u[n]", "(-0.5)ⁿ·u[n]", "2ⁿ·u[n]", "0.5^(-n)·u[n]"],
    correct: 0,
    explanation: "מהטבלה: Z{aⁿu[n]} = z/(z-a). כאן a=0.5, לכן x[n] = (0.5)ⁿu[n]",
  },
]

export default function ZTransform({ onBack }: { onBack: () => void }) {
  return <GenericLearningModule
    moduleId="series-z"
    title="התמרת Z"
    subtitle="משוואות הפרש, ROC, שברים חלקיים"
    intro={intro} theory={theory} step1={step1} step2={step2} step3={step3}
    SimulatorComponent={Sim} quizQuestions={quiz} practiceQuestions={practice}
    greenNote={greenNote} guides={guides}
    onBack={onBack}
  />
}
