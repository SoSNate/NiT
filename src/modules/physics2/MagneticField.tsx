/**
 * MagneticField.tsx — upgraded to PatternStep/GlassCard format
 * Content: Ampere's Law, Biot-Savart, solenoid, two parallel wires
 * Gemini update pending: שיעור 2.pdf
 */
import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GenericLearningModule, { TheoryCard } from '../../components/GenericLearningModule'
import { PatternStep, PrincipleStep, WorkedExample, Formula, Note } from '../../components/StepHelpers'
import { GlassCard, StyledSlider, SimReadout, ToggleGroup } from '../../components/SimulatorShell'
import type { QuizQuestion, GuideSection } from '../../types'

// ── SIMULATOR ────────────────────────────────────────────────────────────────
type Mode = 'wire' | 'solenoid' | 'two-wires'

function Sim({ currentStep: _cs }: { currentStep: number }) {
  const [mode, setMode] = useState<Mode>('wire')
  const [I, setI]       = useState(10)   // A
  const [r, setR]       = useState(0.05) // m
  const [n, setN]       = useState(1000) // turns/m
  const [I2, setI2]     = useState(5)    // A  — second wire
  const [d, setD]       = useState(0.2)  // m  — distance between wires

  const mu0 = 4 * Math.PI * 1e-7

  const result = useMemo(() => {
    if (mode === 'wire') {
      const B = (mu0 * I) / (2 * Math.PI * r)
      return { label: 'B = μ₀I / (2πr)', value: B, unit: 'T', extra: `= ${(B * 1e6).toFixed(2)} μT` }
    }
    if (mode === 'solenoid') {
      const B = mu0 * n * I
      return { label: 'B = μ₀nI', value: B, unit: 'T', extra: `= ${(B * 1e3).toFixed(3)} mT` }
    }
    // two-wires
    const FperL = (mu0 * I * I2) / (2 * Math.PI * d)
    return { label: 'F/L = μ₀I₁I₂ / (2πd)', value: FperL, unit: 'N/m', extra: `= ${(FperL * 1e5).toFixed(2)}×10⁻⁵ N/m` }
  }, [mode, I, r, n, I2, d])

  const cx = 200, cy = 200

  // Field loop ellipses for wire mode
  const loops = [55, 90, 120, 148]

  return (
    <div className="w-full space-y-4" dir="ltr">
      <ToggleGroup
        value={mode}
        onChange={v => setMode(v as Mode)}
        options={[
          { value: 'wire',      label: 'חוט ישר' },
          { value: 'solenoid',  label: 'סולנואיד' },
          { value: 'two-wires', label: 'שני חוטים' },
        ]}
      />

      <GlassCard className="overflow-hidden bg-slate-950">
        <svg viewBox="0 0 400 400" className="w-full" style={{ maxHeight: 260 }}>
          <defs>
            <marker id="b-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#a78bfa" />
            </marker>
            <pattern id="b-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.04" />
            </pattern>
          </defs>
          <rect width="400" height="400" fill="url(#b-grid)" />

          <AnimatePresence mode="wait">
            {mode === 'wire' && (
              <motion.g key="wire" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Field loops */}
                {loops.map((rv, i) => (
                  <ellipse key={i} cx={cx} cy={cy} rx={rv} ry={rv * 0.38}
                    fill="none" stroke="#a78bfa" strokeWidth="1.5"
                    strokeOpacity={0.85 - i * 0.17} markerEnd="url(#b-arr)" />
                ))}
                {/* Wire cross-section */}
                <circle cx={cx} cy={cy} r={12} fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
                <text x={cx} y={cy + 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">·</text>
                <text x={cx} y={cy + 24} textAnchor="middle" fill="#fbbf24" fontSize="10">{I} A</text>
                {/* Radius arrow */}
                <line x1={cx} y1={cy} x2={cx + r * 900} y2={cy}
                  stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,2" />
                <text x={cx + r * 450} y={cy - 8} textAnchor="middle" fill="#94a3b8" fontSize="9">
                  r = {r} m
                </text>
                <text x={cx} y={32} textAnchor="middle" fill="#64748b" fontSize="9">
                  חוק אמפר — מסלול מעגלי
                </text>
              </motion.g>
            )}

            {mode === 'solenoid' && (
              <motion.g key="solenoid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Solenoid coils */}
                {Array.from({ length: 8 }, (_, i) => {
                  const x = 60 + i * 37
                  return (
                    <g key={i}>
                      <ellipse cx={x} cy={cy} rx={8} ry={35}
                        fill="none" stroke="#a78bfa" strokeWidth="2.5" opacity="0.8" />
                    </g>
                  )
                })}
                {/* Uniform B inside */}
                {[155, 175, 195, 215, 235].map((yw, i) => (
                  <line key={i} x1={68} y1={yw} x2={332} y2={yw}
                    stroke="#60a5fa" strokeWidth="1.2" strokeOpacity="0.7"
                    markerEnd="url(#b-arr)" />
                ))}
                <text x={cx} y={32} textAnchor="middle" fill="#64748b" fontSize="9">
                  B = μ₀nI — אחיד בתוך הסולנואיד
                </text>
                <text x={cx} y={380} textAnchor="middle" fill="#94a3b8" fontSize="9">
                  n = {n} סלילים/מ׳,  I = {I} A
                </text>
              </motion.g>
            )}

            {mode === 'two-wires' && (
              <motion.g key="two-wires" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Wire 1 — left */}
                <circle cx={140} cy={cy} r={14} fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
                <text x={140} y={cy + 5} textAnchor="middle" fill="white" fontSize="14">·</text>
                <text x={140} y={cy + 26} textAnchor="middle" fill="#fbbf24" fontSize="10">{I} A ↑</text>
                {/* Wire 2 — right */}
                <circle cx={260} cy={cy} r={14} fill="#f87171" stroke="#ef4444" strokeWidth="2" />
                <text x={260} y={cy + 5} textAnchor="middle" fill="white" fontSize="12">×</text>
                <text x={260} y={cy + 26} textAnchor="middle" fill="#f87171" fontSize="10">{I2} A ↓</text>
                {/* Force arrows */}
                <line x1={145} y1={cy - 30} x2={175} y2={cy - 30}
                  stroke="#34d399" strokeWidth="2" markerEnd="url(#b-arr)" />
                <line x1={255} y1={cy - 30} x2={225} y2={cy - 30}
                  stroke="#34d399" strokeWidth="2" markerEnd="url(#b-arr)" />
                {/* Distance label */}
                <line x1={140} y1={cy + 50} x2={260} y2={cy + 50}
                  stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,2" />
                <text x={cx} y={cy + 64} textAnchor="middle" fill="#94a3b8" fontSize="9">
                  d = {d} m
                </text>
                <text x={cx} y={32} textAnchor="middle" fill="#64748b" fontSize="9">
                  זרמים הפוכים — כוח דוחה
                </text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </GlassCard>

      {/* Controls */}
      <GlassCard className="space-y-3 p-4">
        <StyledSlider label="זרם I₁" value={I} min={1} max={30} step={1}
          onChange={setI} unit="A" />
        {mode === 'wire' && (
          <StyledSlider label="מרחק r" value={r} min={0.01} max={0.3} step={0.01}
            onChange={setR} unit="m" />
        )}
        {mode === 'solenoid' && (
          <StyledSlider label="n (סלילים/מ׳)" value={n} min={100} max={5000} step={100}
            onChange={setN} unit="סל'/מ׳" />
        )}
        {mode === 'two-wires' && (
          <>
            <StyledSlider label="זרם I₂" value={I2} min={1} max={30} step={1}
              onChange={setI2} unit="A" />
            <StyledSlider label="מרחק d" value={d} min={0.05} max={1} step={0.05}
              onChange={setD} unit="m" />
          </>
        )}
      </GlassCard>

      <SimReadout
        label={result.label}
        value={result.extra}
        unit={result.unit}
      />
    </div>
  )
}

// ── STEP 1 — PatternStep (identify the law) ───────────────────────────────────
function Step1() {
  return (
    <PatternStep
      scenario={
        <span>
          חוט ישר אינסופי עם זרם{' '}
          <span className="font-mono text-yellow-300">I = 10 A</span>.
          מצא B במרחק <span className="font-mono text-yellow-300">r = 5 cm</span> מהחוט.
          איזה חוק מתאים לסימטריה גלילית?
        </span>
      }
      prompt="בחר את הגישה הנכונה:"
      options={[
        { label: 'חוק אמפר', desc: '∮B·dl = μ₀I_enc', correct: true },
        { label: 'חוק ביו-סאבר', desc: 'אינטגרל על כל אלמנט זרם', correct: false },
        { label: 'חוק גאוס', desc: 'שטף חשמלי דרך משטח סגור', correct: false },
        { label: 'כוח לורנץ', desc: 'כוח על חלקיק בשדה', correct: false },
      ]}
      correctFeedback="נכון! סימטריה גלילית → מסלול מעגלי → B·2πr = μ₀I → B = μ₀I/(2πr) = 4×10⁻⁵ T. ביו-סאבר מחשב גם, אבל אמפר מהיר פי 10 עם סימטריה."
      wrongFeedback={label => `${label} לא מתאים כאן. לסימטריה גלילית — חוק אמפר הוא הכלי הנכון.`}
    />
  )
}

// ── STEP 2 — PrincipleStep (core formulas) ────────────────────────────────────
function Step2() {
  return (
    <PrincipleStep
      heading="חוק אמפר ונוסחאות מפתח — שלב אחר שלב:"
      items={[
        {
          title: 'חוק אמפר',
          accent: 'text-purple-400',
          content: (
            <div className="space-y-2">
              <p className="font-mono text-sm" dir="ltr">∮ B·dl = μ₀ · I_enc</p>
              <p>האינטגרל הקווי של B סביב מסלול סגור = μ₀ × הזרם הכלוא. יעיל כשיש סימטריה ש-B קבוע על המסלול.</p>
            </div>
          ),
        },
        {
          title: 'חוט ישר אינסופי',
          accent: 'text-yellow-400',
          content: (
            <div className="space-y-2">
              <p className="font-mono text-sm" dir="ltr">B = μ₀I / (2πr)</p>
              <p>שדה יורד כ-1/r. כיוון: כלל יד ימין — אגודל = זרם → אצבעות = B מעגלי.</p>
            </div>
          ),
        },
        {
          title: 'סולנואיד',
          accent: 'text-blue-400',
          content: (
            <div className="space-y-2">
              <p className="font-mono text-sm" dir="ltr">B = μ₀ · n · I</p>
              <p>שדה אחיד בתוך הסולנואיד. n = לולאות ליחידת אורך. מחוץ: B ≈ 0.</p>
            </div>
          ),
        },
        {
          title: 'כוח בין שני חוטים',
          accent: 'text-teal-400',
          content: (
            <div className="space-y-2">
              <p className="font-mono text-sm" dir="ltr">F/L = μ₀I₁I₂ / (2πd)</p>
              <p>זרמים זהה כיוון → <span className="text-emerald-400">משיכה</span>. הפוך כיוון → <span className="text-red-400">דחייה</span>.</p>
            </div>
          ),
        },
      ]}
      btnColor="purple"
    />
  )
}

// ── STEP 3 — WorkedExample (exam question) ────────────────────────────────────
function Step3() {
  return (
    <WorkedExample
      examLabel="מבחן HIT — שני חוטים מקבילים"
      problem={
        <div className="space-y-1">
          <p>שני חוטים מקבילים, מרחק <span className="font-mono text-blue-300">d = 0.2 m</span>.</p>
          <p>חוט 1: <span className="font-mono text-blue-300">I₁ = 10 A</span> ימינה.</p>
          <p>חוט 2: <span className="font-mono text-blue-300">I₂ = 5 A</span> שמאלה.</p>
          <p className="mt-2"><strong>(א)</strong> מצא B בנקודה P — בדיוק באמצע בין החוטים.</p>
          <p><strong>(ב)</strong> כוח ליחידת אורך בין החוטים — גודל וכיוון.</p>
        </div>
      }
      hint="זרמים הפוכים → בנקודת האמצע שני השדות מכוונים באותו כיוון (מתחברים!)"
      solution={[
        {
          label: 'שלב א — B מחוט 1 בנקודה P (r = 0.1 m)',
          thought: 'P נמצא 0.1 m מכל חוט. מחשב B₁ מחוט 1.',
          content: (
            <p className="font-mono text-xs" dir="ltr">
              B₁ = μ₀I₁/(2πr) = 4π×10⁻⁷ × 10 / (2π × 0.1) = <span className="text-emerald-400">2×10⁻⁵ T ↓</span>
            </p>
          ),
        },
        {
          label: 'שלב ב — B מחוט 2 בנקודה P (r = 0.1 m)',
          thought: 'זרם שמאלה → כלל יד ימין → B בנקודה P גם כלפי מטה!',
          content: (
            <p className="font-mono text-xs" dir="ltr">
              B₂ = μ₀I₂/(2πr) = 4π×10⁻⁷ × 5 / (2π × 0.1) = <span className="text-emerald-400">1×10⁻⁵ T ↓</span>
            </p>
          ),
        },
        {
          label: 'שלב ג — סופרפוזיציה',
          thought: 'שני השדות מכוונים מטה — סכומם פשוט.',
          content: (
            <p className="font-mono text-xs text-emerald-400" dir="ltr">
              B_total = 2×10⁻⁵ + 1×10⁻⁵ = 3×10⁻⁵ T (כלפי מטה)
            </p>
          ),
        },
        {
          label: 'שלב ד — כוח ליחידת אורך',
          thought: 'זרמים הפוכים → כוח דוחה.',
          content: (
            <div className="space-y-1">
              <p className="font-mono text-xs" dir="ltr">
                F/L = μ₀I₁I₂/(2πd) = 4π×10⁻⁷ × 10 × 5 / (2π × 0.2) = <span className="text-emerald-400">5×10⁻⁵ N/m</span>
              </p>
              <p className="text-xs text-red-300">זרמים הפוכים → כוח דוחה</p>
            </div>
          ),
        },
      ]}
    />
  )
}

// ── QUIZ & PRACTICE ───────────────────────────────────────────────────────────
const quiz: QuizQuestion[] = [
  {
    question: 'חוט ישר אינסופי עם זרם I. מה B במרחק r מהחוט?',
    options: ['B = μ₀I/(4πr²)', 'B = μ₀I/(2πr)', 'B = μ₀Ir/(2π)', 'B = μ₀I/(4πr)'],
    correct: 1,
    explanation: 'חוק אמפר עם מסלול מעגלי: B·2πr = μ₀I → B = μ₀I/(2πr)',
  },
  {
    question: 'שני חוטים מקבילים עם זרמים באותו כיוון — מה הכוח ביניהם?',
    options: ['דוחה', 'מושך', 'אפס', 'תלוי במרחק בלבד'],
    correct: 1,
    explanation: 'זרמים מקבילים באותו כיוון — הכוח מושך! זרמים הפוכים — הכוח דוחה.',
  },
  {
    question: 'בתוך סולנואיד (n = 2000 סל׳/מ׳, I = 3 A) — מה B?',
    options: ['B = 7.54 mT', 'B = 3.77 mT', 'B = 1.26 mT', 'B = 12.6 mT'],
    correct: 0,
    explanation: 'B = μ₀nI = 4π×10⁻⁷ × 2000 × 3 ≈ 7.54×10⁻³ T = 7.54 mT',
  },
]

const practice: QuizQuestion[] = [
  {
    question: 'חוט עם I = 20 A. מה B במרחק r = 0.1 m?',
    options: ['4×10⁻⁵ T', '4×10⁻⁴ T', '2×10⁻⁵ T', '8×10⁻⁵ T'],
    correct: 0,
    explanation: 'B = μ₀×20/(2π×0.1) = 4×10⁻⁵ T',
  },
  {
    question: 'סולנואיד n = 1000 סל׳/מ׳, I = 2 A. מה B בתוכו?',
    options: ['2.51 mT', '1.26 mT', '0.63 mT', '5.02 mT'],
    correct: 0,
    explanation: 'B = μ₀nI = 4π×10⁻⁷×1000×2 ≈ 2.51 mT',
  },
  {
    question: 'שני חוטים d = 0.4 m, I₁ = 6 A, I₂ = 4 A, זרמים זהים. F/L?',
    options: ['1.2×10⁻⁵ N/m, משיכה', '1.2×10⁻⁵ N/m, דחייה', '2.4×10⁻⁵ N/m, משיכה', '6×10⁻⁶ N/m'],
    correct: 0,
    explanation: 'F/L = μ₀×6×4/(2π×0.4) = 1.2×10⁻⁵ N/m. זרמים זהים → משיכה.',
  },
  {
    question: 'בתוך גליל מוליך (R = 0.05 m, I אחיד = 10 A). מה B ב-r = 0.02 m?',
    options: ['B = μ₀Ir/(2πR²)', 'B = μ₀I/(2πr)', 'B = 0', 'B = μ₀I/(2πR)'],
    correct: 0,
    explanation: 'I_enc = I(r/R)². מחוק אמפר: B = μ₀Ir/(2πR²). B גדל לינארית בתוך הגליל.',
  },
  {
    question: 'טורואיד עם N = 500 לולאות, R = 0.1 m, I = 4 A. מה B בתוכו?',
    options: ['B = μ₀NI/(2πR)', 'B = μ₀NI/(4πR)', 'B = μ₀nI', 'B = 0'],
    correct: 0,
    explanation: 'B = μ₀NI/(2πR) = 4π×10⁻⁷×500×4/(2π×0.1) = 4×10⁻³ T = 4 mT',
  },
]

// ── GREEN NOTE ─────────────────────────────────────────────────────────────────
const greenNote = [
  'בחר מסלול אמפר עם סימטריה של הבעיה: חוט ישר → מעגל; סולנואיד → מלבן',
  'חשב I_enc — הזרם הכלוא בתוך המסלול',
  'פתח ∮B·dl = μ₀I_enc. לחוט: B·2πr = μ₀I → B = μ₀I/(2πr)',
  'כיוון B: כלל יד ימין. כוח בין חוטים: זרמים מקבילים = משיכה, הפוכים = דחייה',
]

// ── GUIDES ─────────────────────────────────────────────────────────────────────
const guides: GuideSection[] = [
  {
    title: 'נוסחאות',
    content: (
      <div className="space-y-3 text-sm">
        <Formula c="∮ B·dl = μ₀ · I_enc" />
        <p className="text-slate-400 text-xs -mt-1">חוק אמפר</p>
        <Formula c="B = μ₀I / (2πr)" />
        <p className="text-slate-400 text-xs -mt-1">חוט ישר</p>
        <Formula c="B = μ₀ · n · I" />
        <p className="text-slate-400 text-xs -mt-1">סולנואיד</p>
        <Formula c="B = μ₀NI / (2πr)" />
        <p className="text-slate-400 text-xs -mt-1">טורואיד</p>
        <Formula c="F/L = μ₀I₁I₂ / (2πd)" />
        <p className="text-slate-400 text-xs -mt-1">כוח בין חוטים</p>
        <Note>μ₀ = 4π×10⁻⁷ T·m/A</Note>
      </div>
    ),
  },
  {
    title: 'טיפים',
    content: (
      <div className="space-y-3 text-sm text-slate-300">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
          <p className="text-yellow-400 font-bold text-xs mb-1">⚠️ טעות נפוצה</p>
          <p>בגליל מוליך: בתוך הגליל (r &lt; R) — B = μ₀Ir/(2πR²), לא μ₀I/(2πr)!</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          <p className="text-emerald-400 font-bold text-xs mb-1">✓ סימטריה = הצלה</p>
          <p>לפני אינטגרל — תמיד בדוק סימטריה. 90% מהזמן רכיבים מתבטלים.</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
          <p className="text-blue-400 font-bold text-xs mb-1">🔵 מתי ביו-סאבר?</p>
          <p>כשאין סימטריה — חוט סופי, קשת, נקודה לא על ציר. dB = (μ₀/4π)·I·dl×r̂/r²</p>
        </div>
      </div>
    ),
  },
]

// ── INTRO ──────────────────────────────────────────────────────────────────────
const intro = (
  <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
    <p>
      זרם חשמלי יוצר סביבו <span className="text-purple-400 font-semibold">שדה מגנטי</span>.
      גילוי אורסטד (1820): חוט עם זרם ממגנט מחט מצפן — שינוי תפיסת הפיזיקה.
    </p>
    <p>
      <span className="text-purple-400 font-semibold">חוק אמפר</span> הוא הגרסה המגנטית של חוק גאוס —
      במקום משטח סגור, בוחרים <span className="text-white font-semibold">מסלול סגור</span>:
    </p>
    <div className="bg-white/5 rounded-xl p-4 border-r-2 border-purple-500 font-mono text-sm" dir="ltr">
      ∮ B·dl = μ₀ · I_enc
    </div>
    <p>
      במבחן HIT — חוק אמפר מופיע תמיד: חוטים ישרים, סולנואידים, טורואידים.
      שאלות שני חוטים — <span className="text-yellow-400">בכל מבחן</span>.
    </p>
  </div>
)

// ── THEORY ─────────────────────────────────────────────────────────────────────
const theory: TheoryCard = {
  summary:
    'זרם יוצר שדה מגנטי בצורת עיגולים (כלל יד ימין). חוק אמפר: ∮B·dl = μ₀I_enc — לחוט ישר: B = μ₀I/(2πr). ' +
    'לסולנואיד: B = μ₀nI בתוכו, 0 מחוץ. זרמים זהה כיוון — נמשכים; הפוך — דוחים.',
  formulas: [
    { label: 'חוק אמפר',        tex: '\\oint \\vec{B}\\cdot d\\vec{l} = \\mu_0 I_{\\text{enc}}' },
    { label: 'חוט ישר',          tex: 'B = \\dfrac{\\mu_0 I}{2\\pi r}' },
    { label: 'סולנואיד',         tex: 'B = \\mu_0 n I' },
    { label: 'כוח בין חוטים',    tex: '\\dfrac{F}{L} = \\dfrac{\\mu_0 I_1 I_2}{2\\pi d}' },
  ],
  when:
    'חוק אמפר מהיר לסימטריה גלילית/משטחית. ' +
    'ביו-סאבר — כשאין סימטריה (חוט סופי, קשת, אלמנט זרם בודד).',
}

// ── EXPORT ─────────────────────────────────────────────────────────────────────
export default function MagneticField({ onBack }: { onBack: () => void }) {
  return (
    <GenericLearningModule
      moduleId="physics2-bfield"
      title="שדה מגנטי וחוק אמפר"
      subtitle="חוטים, סולנואידים, וכוח בין מוליכים"
      intro={intro}
      step1={<Step1 />}
      step2={<Step2 />}
      step3={<Step3 />}
      SimulatorComponent={Sim}
      theory={theory}
      practiceQuestions={practice}
      quizQuestions={quiz}
      greenNote={greenNote}
      guides={guides}
      onBack={onBack}
    />
  )
}
