import React, { useState } from 'react'
import { ArrowRight, Zap, Magnet, Activity, Cpu, Radio, Eye, Atom, FlaskConical } from 'lucide-react'
import CoulombsLaw from './CoulombsLaw'
import GaussLaw from './GaussLaw'
import ElectricField from './ElectricField'
import MagneticField from './MagneticField'
import Induction from './Induction'
import RLCCircuits from './RLCCircuits'
import EMWaves from './EMWaves'
import Optics from './Optics'
import PhysicsLab from './PhysicsLab'

type ModuleId = 'coulomb' | 'gauss' | 'efield' | 'bfield' | 'induction' | 'rlc' | 'emwaves' | 'optics' | 'lab' | null

interface ModuleCard {
  id: ModuleId
  title: string
  subtitle: string
  icon: React.ReactNode
  color: string
  border: string
  examFreq: string
}

const MODULES: ModuleCard[] = [
  {
    id: 'coulomb',
    title: 'חוק קולון',
    subtitle: 'כוחות בין מטענים — גודל, כיוון, וקטורים',
    icon: <Atom size={22} />,
    color: 'from-orange-500/15 to-red-500/5',
    border: 'border-orange-500/25',
    examFreq: 'בסיס הכל',
  },
  {
    id: 'gauss',
    title: 'חוק גאוס',
    subtitle: 'סימטריה — כדורית, גלילית, מישורית',
    icon: <Zap size={22} />,
    color: 'from-yellow-500/15 to-amber-500/5',
    border: 'border-yellow-500/25',
    examFreq: 'כל מבחן',
  },
  {
    id: 'efield',
    title: 'שדה חשמלי',
    subtitle: 'הפצות רציפות — מוט, דיסק, דיפול',
    icon: <Zap size={22} />,
    color: 'from-amber-500/15 to-orange-500/5',
    border: 'border-amber-500/25',
    examFreq: 'כמעט כל מבחן',
  },
  {
    id: 'bfield',
    title: 'שדה מגנטי',
    subtitle: 'חוק אמפר — חוטים, סולנואידים',
    icon: <Magnet size={22} />,
    color: 'from-purple-500/15 to-violet-500/5',
    border: 'border-purple-500/25',
    examFreq: 'כל מבחן',
  },
  {
    id: 'induction',
    title: 'אינדוקציה',
    subtitle: 'חוק פאראדיי-לנץ — EMF ושטף',
    icon: <Activity size={22} />,
    color: 'from-red-500/15 to-rose-500/5',
    border: 'border-red-500/25',
    examFreq: 'כל מבחן',
  },
  {
    id: 'rlc',
    title: 'מעגלי RLC',
    subtitle: 'תנודות LC, תהודה, עכבה',
    icon: <Cpu size={22} />,
    color: 'from-green-500/15 to-emerald-500/5',
    border: 'border-green-500/25',
    examFreq: 'כמעט כל מבחן',
  },
  {
    id: 'emwaves',
    title: 'גלים EM',
    subtitle: 'מקסוול, פוינטינג, מהירות האור',
    icon: <Radio size={22} />,
    color: 'from-blue-500/15 to-cyan-500/5',
    border: 'border-blue-500/25',
    examFreq: 'כל מבחן',
  },
  {
    id: 'optics',
    title: 'אופטיקה',
    subtitle: 'אינטרפרנציה, עקיפה, Young',
    icon: <Eye size={22} />,
    color: 'from-pink-500/15 to-fuchsia-500/5',
    border: 'border-pink-500/25',
    examFreq: 'כמעט כל מבחן',
  },
  {
    id: 'lab',
    title: 'מעבדה בפיזיקה',
    subtitle: 'הידרוסטטיקה — לחץ, ארכימדס, כלים שלובים',
    icon: <FlaskConical size={22} />,
    color: 'from-teal-500/15 to-cyan-500/5',
    border: 'border-teal-500/25',
    examFreq: 'ניסוי מעבדה',
  },
]

interface Props {
  onBack: () => void
}

export default function Physics2Hub({ onBack }: Props) {
  const [activeModule, setActiveModule] = useState<ModuleId>(null)

  const backToHub = () => setActiveModule(null)

  if (activeModule === 'coulomb') return <CoulombsLaw onBack={backToHub} />
  if (activeModule === 'gauss') return <GaussLaw onBack={backToHub} />
  if (activeModule === 'efield') return <ElectricField onBack={backToHub} />
  if (activeModule === 'bfield') return <MagneticField onBack={backToHub} />
  if (activeModule === 'induction') return <Induction onBack={backToHub} />
  if (activeModule === 'rlc') return <RLCCircuits onBack={backToHub} />
  if (activeModule === 'emwaves') return <EMWaves onBack={backToHub} />
  if (activeModule === 'optics') return <Optics onBack={backToHub} />
  if (activeModule === 'lab') return <PhysicsLab onBack={backToHub} />

  return (
    <div className="min-h-screen p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-6 text-sm transition-colors"
        >
          <ArrowRight size={16} />
          חזרה לדף הראשי
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Zap size={20} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">פיזיקה 2</h1>
              <p className="text-slate-400 text-sm">חשמל, מגנטיות, גלים ואופטיקה — HIT</p>
            </div>
          </div>

          {/* Progress summary */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-4 mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">9 מודולים · מהבסיס עד המבחן</span>
              <span className="text-emerald-400 font-semibold">בחר מודול להתחיל</span>
            </div>
          </div>
        </div>

        {/* Module grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map(mod => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={`
                text-right p-5 rounded-2xl border backdrop-blur-xl transition-all duration-200
                bg-gradient-to-br ${mod.color} ${mod.border}
                hover:scale-[1.03] hover:shadow-xl hover:shadow-black/30
                active:scale-[0.97] cursor-pointer
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-white/60">{mod.icon}</div>
                <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                  {mod.examFreq}
                </span>
              </div>
              <h3 className="text-lg font-black text-white mb-1">{mod.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{mod.subtitle}</p>
            </button>
          ))}
        </div>

        {/* Formula sheet quick access */}
        <div className="mt-8 bg-teal-950/30 border border-teal-800/30 rounded-2xl p-4">
          <p className="text-teal-400 text-sm font-semibold mb-2">📌 נוסחאות מהירות — פיזיקה 2</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs font-mono text-slate-400" dir="ltr">
            <span>∮E·dA = Q/ε₀</span>
            <span>∮B·dl = μ₀I</span>
            <span>ε = -dΦ/dt</span>
            <span>ω₀ = 1/√(LC)</span>
            <span>c = E₀/B₀</span>
            <span>Δy = λD/d</span>
          </div>
        </div>
      </div>
    </div>
  )
}
