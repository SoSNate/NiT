/**
 * CourseHub — Generic hub component reused by every course.
 * Pass in CourseMeta and it renders the module grid, back button,
 * quick-formula strip, and handles routing to individual modules.
 *
 * To add a new module to any course:
 *   1. Create the module file under src/modules/<course>/
 *   2. Add a ModuleMeta entry to the course's registry array
 *   3. Done — CourseHub renders it automatically.
 */
import React, { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { CourseMeta, ModuleMeta, ModuleProps } from '../types'

interface CourseHubProps {
  course: CourseMeta
  quickFormulas?: { ltr: boolean; text: string }[]  // optional bottom formula strip
  onBack: () => void
}

export default function CourseHub({ course, quickFormulas, onBack }: CourseHubProps) {
  const [activeModule, setActiveModule] = useState<ModuleMeta | null>(null)

  if (activeModule) {
    const Comp: React.FC<ModuleProps> = activeModule.Component
    return <Comp onBack={() => setActiveModule(null)} />
  }

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
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
              {course.icon}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">{course.title}</h1>
              <p className="text-slate-400 text-sm">{course.subtitle}</p>
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl border border-white/10 p-4 mt-4 flex items-center justify-between text-sm">
            <span className="text-slate-400">{course.modules.length} מודולים · שאלות ממבחנים HIT</span>
            <span className="text-emerald-400 font-semibold">בחר מודול להתחיל ↓</span>
          </div>
        </div>

        {/* Module grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {course.modules.map(mod => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod)}
              className={`
                text-right p-5 rounded-2xl border backdrop-blur-xl transition-all duration-200
                bg-gradient-to-br ${mod.color} ${mod.border}
                hover:scale-[1.03] hover:shadow-xl hover:shadow-black/30
                active:scale-[0.97] cursor-pointer
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{mod.icon}</span>
                <div className="flex flex-col items-end gap-1">
                  {mod.level && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      mod.level === 'foundation' ? 'bg-emerald-500/20 text-emerald-400' :
                      mod.level === 'core'       ? 'bg-yellow-500/20 text-yellow-400' :
                                                   'bg-red-500/20 text-red-400'
                    }`}>
                      {mod.level === 'foundation' ? '🟢 בסיס' : mod.level === 'core' ? '🟡 עיקרי' : '🔴 מתקדם'}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                    {mod.examFreq}
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-black text-white mb-1">{mod.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{mod.subtitle}</p>
            </button>
          ))}
        </div>

        {/* Quick formulas strip */}
        {quickFormulas && quickFormulas.length > 0 && (
          <div className="mt-8 bg-teal-950/30 border border-teal-800/30 rounded-2xl p-4">
            <p className="text-teal-400 text-sm font-semibold mb-2">📌 נוסחאות מהירות — {course.title}</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs font-mono text-slate-400">
              {quickFormulas.map((f, i) => (
                <span key={i} dir={f.ltr ? 'ltr' : 'rtl'}>{f.text}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
