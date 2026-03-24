import React, { useState, useEffect, useRef } from 'react'
import GenericLearningModule, { QuizQuestion, GuideSection, TheoryCard } from '../../components/GenericLearningModule'
import { BlockMath, InlineMath } from '../../components/Math'
import { GlassCard, StyledSlider, SimReadout } from '../../components/SimulatorShell'

// ── Isometric 3D helper ───────────────────────────────────────────────────────
// Projects (x_along_z, y_E, y_B) into 2D canvas with pseudo-3D perspective.
// z-axis goes right, E-field (y) goes up, B-field (x) goes bottom-right.
const ISO_ANGLE = Math.PI / 6  // 30°
const cx0 = 200, cy0 = 130   // SVG origin
function isoE(zPos: number, eVal: number) {
  return { x: cx0 + zPos, y: cy0 - eVal }                              // E: up/down
}
function isoB(zPos: number, bVal: number) {
  return {                                                               // B: diagonal
    x: cx0 + zPos + bVal * Math.cos(ISO_ANGLE),
    y: cy0 + bVal * Math.sin(ISO_ANGLE),
  }
}

function EMWavesSim({ currentStep: _cs }: { currentStep: number }) {
  const [t, setT]     = useState(0)
  const [E0, setE0]   = useState(1.2)
  const [freq, setFreq] = useState(1)
  const rafRef  = useRef<number>()
  const lastRef = useRef<number>(0)

  useEffect(() => {
    const tick = (now: number) => {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05)
      lastRef.current = now
      setT(prev => prev + dt)
      rafRef.current = requestAnimationFrame(tick)
    }
    lastRef.current = performance.now()
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const omega  = 2 * Math.PI * freq
  const kWave  = 2 * Math.PI * freq           // visual k (same scale)
  const B0_vis = E0 * 0.4                     // visual only — keeps E/B ratio clear

  const N     = 50
  const zSpan = 180                           // px span of z-axis
  const eAmp  = E0 * 42
  const bAmp  = B0_vis * 42

  const ePoints = Array.from({ length: N }, (_, i) => {
    const zFrac = i / (N - 1)
    const zPx   = -90 + zFrac * zSpan
    const val   = eAmp * Math.sin(kWave * zFrac * 2 * Math.PI - omega * t)
    const p = isoE(zPx, val)
    return `${p.x},${p.y}`
  }).join(' ')

  const bPoints = Array.from({ length: N }, (_, i) => {
    const zFrac = i / (N - 1)
    const zPx   = -90 + zFrac * zSpan
    const val   = bAmp * Math.sin(kWave * zFrac * 2 * Math.PI - omega * t)
    const p = isoB(zPx, val)
    return `${p.x},${p.y}`
  }).join(' ')

  // z-axis start/end in SVG coords
  const zStart = isoE(-90, 0)
  const zEnd   = isoE(90 + 8, 0)

  // E axis arrow
  const eAxisTop = isoE(0, 55)
  const eAxisBot = isoE(0, -12)

  // B axis arrow
  const bAxisFar = isoB(0, 52)
  const bAxisNear = isoB(0, -12)

  return (
    <div className="w-full space-y-4" dir="ltr">
      <GlassCard className="bg-slate-950 overflow-hidden">
        <svg viewBox="0 0 400 240" className="w-full" style={{ maxHeight: 220 }}>
          <defs>
            <marker id="em-arr-z" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#475569" />
            </marker>
            <marker id="em-arr-e" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#60a5fa" />
            </marker>
            <marker id="em-arr-b" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#f87171" />
            </marker>
          </defs>

          {/* Z axis */}
          <line x1={zStart.x} y1={zStart.y} x2={zEnd.x} y2={zEnd.y}
            stroke="#475569" strokeWidth="1.5" markerEnd="url(#em-arr-z)" />
          <text x={zEnd.x + 4} y={zEnd.y + 4} fill="#64748b" fontSize="9">z</text>

          {/* E axis (up) */}
          <line x1={eAxisBot.x} y1={eAxisBot.y} x2={eAxisTop.x} y2={eAxisTop.y}
            stroke="#60a5fa" strokeWidth="1" strokeOpacity="0.3" markerEnd="url(#em-arr-e)" />
          <text x={eAxisTop.x + 3} y={eAxisTop.y - 2} fill="#60a5fa" fontSize="9">E</text>

          {/* B axis (diagonal) */}
          <line x1={bAxisNear.x} y1={bAxisNear.y} x2={bAxisFar.x} y2={bAxisFar.y}
            stroke="#f87171" strokeWidth="1" strokeOpacity="0.3" markerEnd="url(#em-arr-b)" />
          <text x={bAxisFar.x + 3} y={bAxisFar.y + 6} fill="#f87171" fontSize="9">B</text>

          {/* E wave (blue) */}
          <polyline fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeOpacity="0.9"
            points={ePoints} />

          {/* B wave (red dashed) */}
          <polyline fill="none" stroke="#f87171" strokeWidth="2" strokeDasharray="5,3"
            strokeOpacity="0.8" points={bPoints} />

          {/* Legend */}
          <rect x="10" y="8" width="8" height="3" fill="#60a5fa" />
          <text x="22" y="14" fill="#60a5fa" fontSize="8">E — שדה חשמלי (ŷ)</text>
          <line x1="10" y1="22" x2="18" y2="22" stroke="#f87171" strokeWidth="2" strokeDasharray="3,2" />
          <text x="22" y="25" fill="#f87171" fontSize="8">B — שדה מגנטי (x̂)</text>
          <text x="200" y="230" textAnchor="middle" fill="#475569" fontSize="8">התקדמות: +ẑ</text>
        </svg>
      </GlassCard>

      <SimReadout label="c = E₀/B₀" value="3×10⁸" unit="m/s" />
      <StyledSlider label="E₀ (שדה חשמלי)" value={E0} min={0.3} max={2} step={0.1} unit="" onChange={setE0} />
      <StyledSlider label="תדר (יחסי)" value={freq} min={0.3} max={3} step={0.1} unit="" onChange={setFreq} />
      <div className="text-xs text-center text-slate-500">
        B₀ = E₀/c — B תמיד קטן פי {(3e8).toExponential(0)} מ-E
      </div>
    </div>
  )
}

function Step1() {
  const [selected, setSelected] = useState<number | null>(null)
  return (
    <div className="space-y-4">
      <div className="bg-white/5 rounded-xl p-4 text-slate-300 text-sm">
        גל EM נע בכיוון <span className="font-mono text-blue-300">+z</span>. שדה מגנטי:{' '}
        <span className="font-mono text-blue-300" dir="ltr">B⃗ = B₀cos(kz-ωt)x̂</span>.
        מה כיוון השדה החשמלי?
      </div>
      <p className="text-slate-400 text-sm">זכור: E, B, וכיוון ההתקדמות — מאונכים זה לזה!</p>
      {[
        { l: '+ŷ (כלפי מעלה)', c: true },
        { l: '+x̂ (כמו B)', c: false },
        { l: '+ẑ (כיוון ההתקדמות)', c: false },
        { l: '-ŷ (כלפי מטה)', c: false },
      ].map((opt, i) => (
        <button key={i} disabled={selected !== null} onClick={() => setSelected(i)}
          className={`w-full text-right p-3 rounded-xl text-sm transition-all border ${
            selected === null ? 'bg-white/10 hover:bg-white/20 text-white border-white/10'
            : opt.c ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            : selected === i ? 'bg-red-500/20 text-red-300 border-red-500/40'
            : 'bg-white/5 text-slate-600 border-transparent'}`}>
          {opt.l}
        </button>
      ))}
      {selected !== null && (
        <div className={`rounded-xl p-3 text-sm ${selected === 0 ? 'bg-emerald-900/30 text-emerald-300' : 'bg-amber-900/30 text-amber-300'}`}>
          {selected === 0
            ? '✓ נכון! כלל: ẑ (התקדמות) = E⃗ × B⃗. אם B בכיוון x̂ והגל בכיוון ẑ, אז E בכיוון ŷ.'
            : 'לא. E,B,k מאונכים זה לזה. משתמשים בכלל ידי ימין: k̂ = Ê × B̂.'}
        </div>
      )}
    </div>
  )
}

function Step2() {
  const [revealed, setRevealed] = useState(0)
  const steps = [
    { title: 'מבנה הגל', content: <span>
      גל EM = שדות E ו-B מתנדנדים בניצב זה לזה ולכיוון ההתקדמות:
      <BlockMath tex="\vec{E} = E_0\cos(kz-\omega t)\,\hat{y}" />
      <BlockMath tex="\vec{B} = B_0\cos(kz-\omega t)\,\hat{x}" />
      כאשר <InlineMath tex="c = E_0/B_0 = 3\times10^8\,\text{m/s}" />
    </span> },
    { title: 'וקטור פוינטינג', content: <span>
      עוצמת הגל (הספק ליחידת שטח):
      <BlockMath tex="\vec{S} = \dfrac{1}{\mu_0}\,\vec{E}\times\vec{B}\quad [\text{W/m}^2]" />
      ממוצע: <BlockMath tex="\langle S \rangle = \dfrac{E_0^2}{2\mu_0 c} = \dfrac{c\varepsilon_0 E_0^2}{2}" />
    </span> },
    { title: 'יחסים חשובים', content: <span>
      <BlockMath tex="c = \dfrac{E_0}{B_0} = \dfrac{1}{\sqrt{\mu_0\varepsilon_0}}" />
      <BlockMath tex="\lambda = \dfrac{c}{f} = \dfrac{2\pi}{k},\quad \omega = 2\pi f = ck" />
      <p className="text-slate-400 text-xs mt-2">כיוון התקדמות: <InlineMath tex="\hat{k} = \hat{E}\times\hat{B}" /> (יד ימין)</p>
    </span> },
  ]
  return (
    <div className="space-y-4">
      <p className="text-white font-bold">גלים אלקטרומגנטיים:</p>
      {steps.slice(0, revealed + 1).map((s, i) => (
        <div key={i} className="bg-white/5 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
          <p className="text-blue-400 font-bold text-xs mb-2">שלב {i + 1}: {s.title}</p>
          {s.content}
        </div>
      ))}
      {revealed < steps.length - 1 && (
        <button onClick={() => setRevealed(r => r + 1)}
          className="w-full border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 py-2.5 rounded-xl text-sm font-medium transition-all">
          גלה שלב {revealed + 2} ▾
        </button>
      )}
    </div>
  )
}

function Step3() {
  const [showSol, setShowSol] = useState(false)
  return (
    <div className="space-y-4">
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
        <p className="text-blue-300 text-xs font-bold mb-2">📄 מבחן HIT — 2021 (גל EM)</p>
        <p className="text-white text-sm leading-relaxed">
          שדה מגנטי של גל EM:{' '}
          <span className="font-mono text-blue-300" dir="ltr">B⃗ = 3×10⁻⁸ cos(ωt - kz) x̂ T</span>
          <br /><br />
          <strong>(א)</strong> מצא E₀ ואת כיוון E⃗.<br />
          <strong>(ב)</strong> חשב את וקטור פוינטינג S⃗.<br />
          <strong>(ג)</strong> כמה שטף אנרגיה עובר דרך חלון <span className="font-mono">A = 0.02 m²</span>?
        </p>
      </div>
      <button onClick={() => setShowSol(v => !v)}
        className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-2.5 rounded-xl text-sm font-medium transition-all">
        {showSol ? '▲ הסתר פתרון' : '▼ הצג פתרון'}
      </button>
      {showSol && (
        <div className="space-y-2 text-sm">
          {[
            { q: 'א — E₀ וכיוון:', a: 'E₀ = c·B₀ = 3×10⁸ × 3×10⁻⁸ = 9 V/m\nכיוון: ẑ × x̂ = ŷ, כלומר E⃗ = 9cos(ωt-kz)ŷ' },
            { q: 'ב — פוינטינג:', a: 'S⃗ = E⃗×B⃗/μ₀\nE×B = 9×3×10⁻⁸ cos²(ωt-kz) ŷ×x̂ = -27×10⁻⁸cos² ẑ\n⟨S⟩ = 27×10⁻⁸/(2μ₀) ≈ 107 mW/m²' },
            { q: 'ג — שטף:', a: 'P = ⟨S⟩ · A = 0.107 × 0.02 ≈ 2.15×10⁻³ W ≈ 2.15 mW' },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 text-slate-300">
              <p className="text-yellow-400 font-bold text-xs mb-1">{item.q}</p>
              <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap">{item.a}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const practice: QuizQuestion[] = [
  {
    question: 'גל EM בוואקום: E_max = 300 V/m. מה B_max?',
    options: ['B_max = 1 μT', 'B_max = 1 mT', 'B_max = 100 nT', 'B_max = 300 T'],
    correct: 0,
    explanation: 'B_max = E_max/c = 300/(3×10⁸) = 10⁻⁶ T = 1 μT.',
  },
  {
    question: 'גל EM עם עוצמה I = 500 W/m². מה אמפליטודת שדה E?',
    options: ['E₀ ≈ 614 V/m', 'E₀ ≈ 307 V/m', 'E₀ ≈ 1000 V/m', 'E₀ = 500 V/m'],
    correct: 0,
    explanation: 'I = E₀²/(2μ₀c). E₀ = √(2μ₀cI) ≈ 614 V/m.',
  },
  {
    question: 'מה כיוון וקטור פוינטינג S = E × B ביחס לשדות?',
    options: ['מאונך ל-E ול-B, בכיוון התפשטות הגל', 'מקביל ל-E', 'מקביל ל-B', 'מנוגד לכיוון התפשטות'],
    correct: 0,
    explanation: 'S = (1/μ₀)E×B. מכפלה וקטורית — S ⊥ E וגם ⊥ B, ומצביע בכיוון התפשטות הגל.',
  },
  {
    question: 'גל EM בתדר f = 100 MHz. מה אורך הגל?',
    options: ['λ = 3 m', 'λ = 30 cm', 'λ = 3 cm', 'λ = 0.3 m'],
    correct: 0,
    explanation: 'λ = c/f = 3×10⁸/(10⁸) = 3 m. זה טווח גלי FM רדיו.',
  },
]

const quiz: QuizQuestion[] = [
  {
    question: 'גל EM עם E₀=300 V/m. מה B₀?',
    options: ['10⁻⁶ T', '10⁻⁵ T', '10⁻⁴ T', '10⁻³ T'],
    correct: 0,
    explanation: 'B₀ = E₀/c = 300/(3×10⁸) = 10⁻⁶ T = 1 μT',
  },
  {
    question: 'גל EM עם B⃗ = B₀cos(kz-ωt)ŷ. מה כיוון ההתקדמות?',
    options: ['+x', '+y', '+z', '-z'],
    correct: 2,
    explanation: 'הגל תלוי ב-(kz-ωt) → מתקדם בכיוון +z.',
  },
  {
    question: 'מה ממוצע וקטור פוינטינג (עוצמת גל) אם E₀=100 V/m?',
    options: ['≈ 0.13 W/m²', '≈ 13.3 W/m²', '≈ 133 W/m²', '≈ 1.33 W/m²'],
    correct: 1,
    explanation: '⟨S⟩ = E₀²/(2μ₀c) = 10⁴/(2×4π×10⁻⁷×3×10⁸) ≈ 13.3 W/m²',
  },
]

const greenNote = [
  'E, B, וכיוון ההתקדמות — שלושתם מאונכים זה לזה: k̂ = Ê × B̂',
  'E₀ = c·B₀, c = 3×10⁸ m/s, λ = c/f',
  'פוינטינג: S⃗ = E⃗×B⃗/μ₀. ממוצע: ⟨S⟩ = E₀²/(2μ₀c)',
  'שטף אנרגיה דרך שטח: P = ⟨S⟩·A',
]

const guides: GuideSection[] = [
  {
    title: 'נוסחאות',
    content: (
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-blue-400 font-bold mb-1">יחסים בסיסיים</p>
          <ul className="space-y-0.5 text-slate-300 font-mono text-xs" dir="ltr">
            <li>c = E₀/B₀ = 3×10⁸ m/s</li>
            <li>c = λf = ω/k</li>
            <li>c = 1/√(μ₀ε₀)</li>
          </ul>
        </div>
        <div>
          <p className="text-blue-400 font-bold mb-1">פוינטינג</p>
          <ul className="space-y-0.5 text-slate-300 font-mono text-xs" dir="ltr">
            <li>S⃗ = (E⃗×B⃗)/μ₀ [W/m²]</li>
            <li>⟨S⟩ = E₀²/(2μ₀c)</li>
            <li>P = ⟨S⟩·A</li>
          </ul>
        </div>
      </div>
    ),
  },
]

const intro = (
  <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
    <p>
      מקסוול הוכיח ב-1865 שמשוואותיו מנבאות גלים שנעים במהירות האור —
      והסיק: <span className="text-blue-400 font-semibold">אור הוא גל אלקטרומגנטי</span>.
    </p>
    <div className="bg-white/5 rounded-xl p-4 border-r-2 border-blue-500">
      <BlockMath tex="c = \dfrac{E_0}{B_0} = 3\times10^8\,\text{m/s}" />
      <p className="text-center text-xs text-slate-500 mt-1">E, B, וכיוון ההתקדמות — תמיד מאונכים</p>
    </div>
    <p>
      במבחן HIT: נותנים B(t,z) ← מחשבים E, פוינטינג, ושטף.
      כלל ידי ימין = כלי מספר 1.
    </p>
  </div>
)

const theory: TheoryCard = {
  summary: 'גל אלקטרומגנטי הוא תנודה משותפת של שדה חשמלי ומגנטי שמתפשטת במרחב. E ו-B תמיד מאונכים זה לזה ולכיוון התפשטות הגל. בוואקום — תמיד במהירות c.',
  formulas: [
    { label: 'יחס שדות ומהירות אור', tex: 'c = \\dfrac{E}{B} = \\dfrac{1}{\\sqrt{\\mu_0 \\varepsilon_0}}' },
    { label: 'עוצמת גל (וקטור פוינטינג)', tex: 'I = \\langle S \\rangle = \\dfrac{E_0^2}{2\\mu_0 c} = \\dfrac{c\\varepsilon_0 E_0^2}{2}' },
  ],
  when: 'בשאלות על גלי EM: מצא E₀ → B₀ = E₀/c → I = E₀²/(2μ₀c). כיוון: כלל יד ימין — E×B = כיוון התפשטות.',
}

export default function EMWaves({ onBack }: { onBack: () => void }) {
  return (
    <GenericLearningModule
      moduleId="physics2-emwaves"
      title="גלים אלקטרומגנטיים"
      subtitle="מקסוול, וקטור פוינטינג, ומהירות האור"
      intro={intro}
      step1={<Step1 />}
      step2={<Step2 />}
      step3={<Step3 />}
      SimulatorComponent={EMWavesSim}
      theory={theory}
      practiceQuestions={practice}
      quizQuestions={quiz}
      greenNote={greenNote}
      guides={guides}
      onBack={onBack}
    />
  )
}
