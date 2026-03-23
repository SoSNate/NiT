/**
 * StepHelpers — reusable UI primitives for module steps.
 * Import these in any module to reduce boilerplate.
 */
import React, { useState } from 'react'
import { BlockMath, InlineMath } from './Math'

// ── Pattern Recognition Step ──────────────────────────────────────────────────
interface PatternOption {
  label: string
  desc?: string
  correct: boolean
}

interface PatternStepProps {
  scenario: React.ReactNode
  prompt?: string
  options: PatternOption[]
  correctFeedback: string
  wrongFeedback?: (label: string) => string
}

export function PatternStep({
  scenario,
  prompt = 'בחר את הגישה הנכונה:',
  options,
  correctFeedback,
  wrongFeedback,
}: PatternStepProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const isCorrect = selected !== null && options[selected].correct

  return (
    <div className="space-y-4">
      <div className="bg-white/5 rounded-xl p-4 text-slate-300 text-sm leading-relaxed">
        {scenario}
      </div>
      <p className="text-slate-400 text-sm">{prompt}</p>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <button
            key={i}
            disabled={selected !== null}
            onClick={() => setSelected(i)}
            className={`w-full text-right p-3 rounded-xl text-sm transition-all border ${
              selected === null
                ? 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                : opt.correct
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : selected === i
                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                : 'bg-white/5 text-slate-600 border-transparent'
            }`}
          >
            <span className="font-semibold">{opt.label}</span>
            {opt.desc && <span className="text-slate-500 mr-2 text-xs">— {opt.desc}</span>}
          </button>
        ))}
      </div>
      {selected !== null && (
        <div className={`rounded-xl p-3 text-sm leading-relaxed ${
          isCorrect ? 'bg-emerald-900/30 text-emerald-300' : 'bg-amber-900/30 text-amber-300'
        }`}>
          {isCorrect
            ? `✓ ${correctFeedback}`
            : wrongFeedback
            ? wrongFeedback(options[selected].label)
            : `✗ לא בדיוק — ${options.find(o => o.correct)?.label} היא הגישה הנכונה כאן.`}
        </div>
      )}
    </div>
  )
}

// ── Progressive Disclosure Step ───────────────────────────────────────────────
interface DisclosureItem {
  title: string
  content: React.ReactNode
  accent?: string   // tailwind text color, e.g. 'text-emerald-400'
}

interface PrincipleStepProps {
  heading?: string
  items: DisclosureItem[]
  btnColor?: string  // e.g. 'emerald'
}

export function PrincipleStep({ heading = 'שלב אחר שלב:', items, btnColor = 'emerald' }: PrincipleStepProps) {
  const [revealed, setRevealed] = useState(0)
  return (
    <div className="space-y-4">
      {heading && <p className="text-white font-bold">{heading}</p>}
      {items.slice(0, revealed + 1).map((item, i) => (
        <div key={i} className="bg-white/5 rounded-xl p-4 text-sm text-slate-300 leading-relaxed step-enter">
          <p className={`font-bold text-xs mb-2 ${item.accent ?? 'text-emerald-400'}`}>
            שלב {i + 1}: {item.title}
          </p>
          {item.content}
        </div>
      ))}
      {revealed < items.length - 1 && (
        <button
          onClick={() => setRevealed(r => r + 1)}
          className={`w-full border border-${btnColor}-500/30 text-${btnColor}-400 hover:bg-${btnColor}-500/10 py-2.5 rounded-xl text-sm font-medium transition-all`}
        >
          גלה שלב {revealed + 2} ▾
        </button>
      )}
    </div>
  )
}

// ── Worked Example Step ───────────────────────────────────────────────────────
interface WorkedExampleProps {
  examLabel: string    // e.g. "מבחן HIT — 2023"
  problem: React.ReactNode
  hint?: string
  solution: {
    label: string
    content: React.ReactNode
    thought?: string   // "הלך מחשבה" — מה עבר בראש לפני השלב הזה
  }[]
}

export function WorkedExample({ examLabel, problem, hint, solution }: WorkedExampleProps) {
  const [showSol, setShowSol] = useState(false)
  return (
    <div className="space-y-4">
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
        <p className="text-blue-300 text-xs font-bold mb-2">📄 {examLabel}</p>
        <div className="text-white text-sm leading-relaxed">{problem}</div>
      </div>
      {hint && <p className="text-slate-400 text-sm">💭 {hint}</p>}
      <button
        onClick={() => setShowSol(v => !v)}
        className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-2.5 rounded-xl text-sm font-medium transition-all"
      >
        {showSol ? '▲ הסתר פתרון' : '▼ הצג פתרון מפורט'}
      </button>
      {showSol && (
        <div className="space-y-2 text-sm">
          {solution.map((step, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 text-slate-300">
              {/* הלך מחשבה — מה עבר בראש לפני השלב */}
              {step.thought && (
                <div className="flex items-start gap-2 mb-2 bg-indigo-900/30 border border-indigo-700/30 rounded-lg px-3 py-2">
                  <span className="text-indigo-400 text-xs shrink-0 mt-0.5">💭</span>
                  <p className="text-indigo-200 text-xs leading-relaxed italic">{step.thought}</p>
                </div>
              )}
              <p className="text-yellow-400 font-bold text-xs mb-1">{step.label}</p>
              {step.content}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Math helpers ──────────────────────────────────────────────────────────────

/**
 * Inline math — KaTeX rendering.
 * Pass LaTeX string: <M tex="\frac{dy}{dx}" />
 * Legacy plain-text fallback: <M c="dy/dx" />
 */
export function M({ tex, c }: { tex?: string; c?: string }) {
  const src = tex ?? c ?? ''
  // If it looks like LaTeX (has backslash or braces), use KaTeX
  if (tex || src.includes('\\') || src.includes('{')) {
    return <InlineMath tex={src} className="text-emerald-300" />
  }
  // Fallback: plain monospace (backward compat)
  return <span className="font-mono text-emerald-300 text-sm" dir="ltr">{src}</span>
}

/**
 * Block math formula — KaTeX rendering.
 * Pass LaTeX string: <Formula tex="\oint \vec{E} \cdot d\vec{A} = \frac{Q_{enc}}{\varepsilon_0}" />
 * Legacy plain-text fallback: <Formula c="..." />
 */
export function Formula({ tex, c, color = 'text-emerald-300' }: { tex?: string; c?: string; color?: string }) {
  const src = tex ?? c ?? ''
  if (tex || src.includes('\\') || src.includes('{')) {
    return <BlockMath tex={src} className={color} />
  }
  return (
    <div className={`font-mono ${color} text-base text-center my-2 py-2 bg-white/5 rounded-xl`} dir="ltr">
      {src}
    </div>
  )
}

/** Highlighted note box */
export const Note = ({ children, color = 'amber' }: { children: React.ReactNode; color?: string }) => (
  <div className={`bg-${color}-900/20 border border-${color}-500/30 rounded-xl p-3 text-sm text-${color}-200`}>
    {children}
  </div>
)
