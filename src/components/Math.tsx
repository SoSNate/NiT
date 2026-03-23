/**
 * Math.tsx — KaTeX-based math rendering components
 * Replaces the plain-text Formula and M components.
 *
 * Usage:
 *   <BlockMath tex="\oint \vec{E} \cdot d\vec{A} = \frac{Q_{enc}}{\varepsilon_0}" />
 *   <InlineMath tex="\frac{dy}{dx}" />
 */
import React, { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface MathProps {
  tex: string
  className?: string
}

function renderKaTeX(tex: string, display: boolean): string {
  try {
    return katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      strict: false,
      trust: false,
      output: 'html',
      // RTL-safe: KaTeX renders LTR internally
      fleqn: false,
    })
  } catch {
    // Fallback: show raw tex with error styling
    return `<span style="color:#f87171;font-family:monospace">${tex}</span>`
  }
}

/** Block-level math — vertically centred, large, high-contrast */
export function BlockMath({ tex, className = '' }: MathProps) {
  const html = useMemo(() => renderKaTeX(tex, true), [tex])
  return (
    <div
      className={`my-3 py-3 px-4 bg-white/5 rounded-xl overflow-x-auto text-center math-block ${className}`}
      dir="ltr"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/** Inline math — sits inside a sentence */
export function InlineMath({ tex, className = '' }: MathProps) {
  const html = useMemo(() => renderKaTeX(tex, false), [tex])
  return (
    <span
      className={`inline math-inline ${className}`}
      dir="ltr"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/**
 * LiveMath — same as BlockMath but skips memoisation.
 * Use inside simulators where `tex` changes with every slider tick.
 */
export function LiveMath({ tex, className = '' }: MathProps) {
  const html = renderKaTeX(tex, true)
  return (
    <div
      className={`my-1 py-2 px-3 bg-white/5 rounded-xl overflow-x-auto text-center math-block ${className}`}
      dir="ltr"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
