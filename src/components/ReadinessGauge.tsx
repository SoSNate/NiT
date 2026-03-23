import React from 'react'

interface Props {
  pct: number        // 0–100
  size?: number      // px, default 72
  label?: string     // text below %
}

export default function ReadinessGauge({ pct, size = 72, label }: Props) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const fill = circ * (1 - pct / 100)

  const color =
    pct >= 80 ? '#34d399'  // emerald
    : pct >= 50 ? '#fbbf24' // amber
    : '#f87171'             // red

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6}
        />
        {/* Fill */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={fill}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
        />
        {/* Center text — un-rotate */}
        <text
          x={size / 2} y={size / 2 + 1}
          textAnchor="middle" dominantBaseline="middle"
          fill={color}
          fontSize={size < 60 ? 11 : 14}
          fontWeight="bold"
          style={{ transform: `rotate(90deg)`, transformOrigin: `${size / 2}px ${size / 2}px` }}
        >
          {pct}%
        </text>
      </svg>
      {label && <p className="text-[10px] text-slate-500 text-center leading-tight">{label}</p>}
    </div>
  )
}
