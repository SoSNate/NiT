import React from 'react'
import { motion } from 'framer-motion'

// ─── GlassCard ──────────────────────────────────────────────
export const GlassCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={`relative overflow-hidden rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-2xl ${className}`}
  >
    {children}
  </div>
)

// ─── StyledSlider ────────────────────────────────────────────
export const StyledSlider = ({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (v: number) => void
}) => (
  <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
    <div className="flex justify-between items-center text-sm">
      <label className="text-slate-400 font-medium">{label}</label>
      <span className="text-cyan-400 font-mono font-bold bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
        {value} {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
    />
  </div>
)

// ─── SimReadout ──────────────────────────────────────────────
export const SimReadout = ({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit: string
}) => (
  <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10">
    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">
      {label}
    </div>
    <div className="text-3xl font-mono font-black text-cyan-400">
      {value}{' '}
      <span className="text-sm font-normal text-slate-500">{unit}</span>
    </div>
  </div>
)

// ─── ToggleGroup ─────────────────────────────────────────────
export const ToggleGroup = ({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) => (
  <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5">
    {options.map(opt => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
          value === opt.value
            ? 'bg-cyan-500 text-slate-950 shadow-lg'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
)

// ─── SVG Grid Background ─────────────────────────────────────
export const SvgGrid = () => (
  <>
    <defs>
      <pattern id="sim-grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path
          d="M 40 0 L 0 0 0 40"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          strokeOpacity="0.05"
        />
      </pattern>
    </defs>
    <rect width="400" height="400" fill="url(#sim-grid)" />
  </>
)

// ─── InsightCard ─────────────────────────────────────────────
export const InsightCard = ({ text }: { text: string }) => (
  <GlassCard className="p-5 border-cyan-500/20 bg-cyan-500/5">
    <div className="flex items-start gap-3">
      <span className="text-cyan-400 text-lg mt-0.5">💡</span>
      <p className="text-xs text-slate-400 leading-relaxed">{text}</p>
    </div>
  </GlassCard>
)

// ─── Animated SVG wrapper ─────────────────────────────────────
export { motion }
