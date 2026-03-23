import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const SEEN_KEY = 'onboarding_seen'

const SLIDES = [
  {
    icon: '🎯',
    color: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-500/20',
    accent: 'text-emerald-400',
    title: 'פלטפורמת הלמידה שלך ל-HIT',
    body: 'המערכת בנויה בשבילך ספציפית — שאלות ממבחנים אמיתיים 2019–2025, סימולטורים אינטרקטיביים, ופידבק מיידי. לא ספר לימוד — מגרש אימונים.',
    extra: (
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {['פיזיקה 2', 'מד"ר', 'אינפי 2', 'טורים והתמרות'].map(c => (
          <span key={c} className="bg-white/10 text-slate-300 text-xs px-3 py-1.5 rounded-full border border-white/10">
            {c}
          </span>
        ))}
      </div>
    ),
  },
  {
    icon: '📚',
    color: 'from-blue-500/20 to-indigo-500/10',
    border: 'border-blue-500/20',
    accent: 'text-blue-400',
    title: '5 שלבים לכל נושא',
    body: 'כל מודול עובר אותו מסלול — מזיהוי הבעיה עד מבחן בסגנון HIT. הסימולטור זזה בזמן אמת — תשנה ערכים ותראה מה קורה.',
    extra: (
      <div className="flex items-center gap-1 justify-center mt-4 flex-wrap">
        {[
          { label: 'זיהוי', color: 'bg-slate-500/30 text-slate-300' },
          { label: 'עיקרון', color: 'bg-blue-500/30 text-blue-300' },
          { label: 'דוגמה', color: 'bg-purple-500/30 text-purple-300' },
          { label: 'סימולטור', color: 'bg-amber-500/30 text-amber-300' },
          { label: 'מבחן', color: 'bg-emerald-500/30 text-emerald-300' },
        ].map((s, i, arr) => (
          <React.Fragment key={s.label}>
            <span className={`text-xs px-2.5 py-1 rounded-lg font-bold ${s.color}`}>{s.label}</span>
            {i < arr.length - 1 && <span className="text-slate-600 text-xs">→</span>}
          </React.Fragment>
        ))}
      </div>
    ),
  },
  {
    icon: '🏆',
    color: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-500/20',
    accent: 'text-amber-400',
    title: 'שלב המבחן מחולק לשניים',
    body: 'קודם אימון — שאלות בסגנון מבחן עם פידבק מיידי ואפשרות לנסות שוב. אחר כך סימולציה — שאלות HIT אמיתיות שנשמרות לפרופיל המוכנות שלך.',
    extra: (
      <div className="flex gap-3 justify-center mt-4">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 text-center">
          <p className="text-amber-400 font-bold text-xs">🎯 אימון</p>
          <p className="text-slate-400 text-[11px] mt-0.5">מיוצר · אפשר לנסות שוב</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 text-center">
          <p className="text-emerald-400 font-bold text-xs">📝 סימולציה</p>
          <p className="text-slate-400 text-[11px] mt-0.5">HIT אמיתי · נשמר</p>
        </div>
      </div>
    ),
  },
]

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [slide, setSlide] = useState(0)
  const s = SLIDES[slide]
  const isLast = slide === SLIDES.length - 1

  const finish = () => {
    try { localStorage.setItem(SEEN_KEY, '1') } catch {}
    onDone()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5" dir="rtl">
      <div className="w-full max-w-md">

        {/* Skip */}
        <div className="flex justify-end mb-4">
          <button
            onClick={finish}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            <X size={14} />
            דלג
          </button>
        </div>

        {/* Card */}
        <div className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-[2rem] p-8 text-center transition-all`}>
          <div className="text-6xl mb-4">{s.icon}</div>
          <h2 className="text-2xl font-black text-white mb-3">{s.title}</h2>
          <p className="text-slate-300 text-sm leading-relaxed">{s.body}</p>
          {s.extra}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`rounded-full transition-all ${
                i === slide ? 'w-6 h-2 bg-emerald-400' : 'w-2 h-2 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Nav buttons */}
        <div className="flex gap-3 mt-5">
          {slide > 0 && (
            <button
              onClick={() => setSlide(s => s - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 text-sm font-medium transition-all"
            >
              <ChevronRight size={16} />
              חזור
            </button>
          )}
          <button
            onClick={isLast ? finish : () => setSlide(s => s + 1)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm transition-all active:scale-95"
          >
            {isLast ? 'בואו נתחיל! 🚀' : 'הבא'}
            {!isLast && <ChevronLeft size={16} />}
          </button>
        </div>

      </div>
    </div>
  )
}
