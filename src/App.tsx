import React, { useState } from 'react'
import { Zap, BookOpen, Activity, BarChart2, ChevronLeft, LineChart, Target, Award } from 'lucide-react'
import Physics2Hub from './modules/physics2/index'
import DiffeqHub from './modules/diffeq/index'
import Calculus2Hub from './modules/calculus2/index'
import SeriesHub from './modules/series/index'
import LearningDashboard from './components/LearningDashboard'
import Onboarding from './components/Onboarding'
import LearningJournal, { JournalProvider } from './components/LearningJournal'
import PracticeMode from './components/PracticeMode'
import ExamMode from './components/ExamMode'

type Course = 'home' | 'physics2' | 'diffeq' | 'calculus2' | 'series' | 'dashboard' | 'practice' | 'exam'

interface CourseCard {
  id: Course
  title: string
  subtitle: string
  icon: React.ReactNode
  modules: number
  color: string
  borderColor: string
  available: boolean
  examDate?: string
}

const COURSES: CourseCard[] = [
  {
    id: 'physics2',
    title: 'פיזיקה 2',
    subtitle: 'חשמל, מגנטיות, גלים ואופטיקה',
    icon: <Zap size={28} />,
    modules: 6,
    color: 'from-blue-500/20 to-cyan-500/10',
    borderColor: 'border-blue-500/30',
    available: true,
    examDate: 'סמסטר ב 2026',
  },
  {
    id: 'diffeq',
    title: 'משוואות דיפרנציאליות',
    subtitle: 'מד"ר מסדר ראשון ושני, לפלס, מערכות',
    icon: <Activity size={28} />,
    modules: 6,
    color: 'from-emerald-500/20 to-teal-500/10',
    borderColor: 'border-emerald-500/30',
    available: true,
  },
  {
    id: 'calculus2',
    title: 'אינפי 2',
    subtitle: 'פונקציות רבות משתנים, אינטגרלים, שדות',
    icon: <BarChart2 size={28} />,
    modules: 6,
    color: 'from-purple-500/20 to-violet-500/10',
    borderColor: 'border-purple-500/30',
    available: true,
  },
  {
    id: 'series',
    title: 'טורים והתמרות',
    subtitle: 'טיילור, פורייה, לפלס, Z',
    icon: <BookOpen size={28} />,
    modules: 6,
    color: 'from-orange-500/20 to-amber-500/10',
    borderColor: 'border-orange-500/30',
    available: true,
  },
]

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('onboarding_seen')
  )
  const [activeCourse, setActiveCourse] = useState<Course>('home')

  if (showOnboarding) return <Onboarding onDone={() => setShowOnboarding(false)} />

  if (activeCourse === 'physics2') return <JournalProvider><Physics2Hub onBack={() => setActiveCourse('home')} /><LearningJournal /></JournalProvider>
  if (activeCourse === 'diffeq') return <JournalProvider><DiffeqHub onBack={() => setActiveCourse('home')} /><LearningJournal /></JournalProvider>
  if (activeCourse === 'calculus2') return <JournalProvider><Calculus2Hub onBack={() => setActiveCourse('home')} /><LearningJournal /></JournalProvider>
  if (activeCourse === 'series') return <JournalProvider><SeriesHub onBack={() => setActiveCourse('home')} /><LearningJournal /></JournalProvider>
  if (activeCourse === 'dashboard') return <LearningDashboard onBack={() => setActiveCourse('home')} />
  if (activeCourse === 'practice') return <PracticeMode onBack={() => setActiveCourse('home')} />
  if (activeCourse === 'exam') return <ExamMode onBack={() => setActiveCourse('home')} />

  return (
    <div className="min-h-screen p-6" dir="rtl">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-block bg-emerald-500/10 text-emerald-400 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-emerald-500/20">
            HIT — Holon Institute of Technology
          </div>
          <h1 className="text-5xl font-black text-white mb-3">
            פלטפורמת למידה
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            למידה חזותית ואינטרקטיבית לכל הקורסים של הסמסטר — שאלות בסגנון מבחנים אמיתיים מ-HIT
          </p>
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {COURSES.map(course => (
            <button
              key={course.id}
              onClick={() => course.available && setActiveCourse(course.id)}
              className={`
                relative text-right p-6 rounded-[1.5rem] border backdrop-blur-xl transition-all duration-200
                bg-gradient-to-br ${course.color} ${course.borderColor}
                ${course.available
                  ? 'hover:scale-[1.02] hover:shadow-xl hover:shadow-black/30 cursor-pointer active:scale-[0.98]'
                  : 'opacity-50 cursor-not-allowed'
                }
              `}
            >
              {/* Available badge */}
              {course.available && (
                <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  פעיל ✓
                </div>
              )}
              {!course.available && (
                <div className="absolute top-4 left-4 bg-white/10 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  בקרוב
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="text-white/60 mt-1">{course.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-white mb-1">{course.title}</h3>
                  <p className="text-slate-400 text-sm mb-3">{course.subtitle}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{course.modules} מודולים</span>
                    {course.examDate && (
                      <>
                        <span>·</span>
                        <span>{course.examDate}</span>
                      </>
                    )}
                  </div>
                </div>
                {course.available && (
                  <ChevronLeft size={20} className="text-emerald-400 mt-1 shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Practice + Exam row */}
        <div className="grid grid-cols-2 gap-4 mt-5">
          <button
            onClick={() => setActiveCourse('practice')}
            className="text-right p-5 rounded-[1.5rem] border backdrop-blur-xl transition-all duration-200
              bg-gradient-to-br from-emerald-500/15 to-teal-500/5 border-emerald-500/25
              hover:scale-[1.02] hover:shadow-xl hover:shadow-black/30 cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="text-emerald-400"><Target size={22} /></div>
              <div className="flex-1">
                <h3 className="text-base font-black text-white mb-0.5">תרגול</h3>
                <p className="text-slate-400 text-xs">שאלות לפי נושא ורמה</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => setActiveCourse('exam')}
            className="text-right p-5 rounded-[1.5rem] border backdrop-blur-xl transition-all duration-200
              bg-gradient-to-br from-blue-500/15 to-indigo-500/5 border-blue-500/25
              hover:scale-[1.02] hover:shadow-xl hover:shadow-black/30 cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="text-blue-400"><Award size={22} /></div>
              <div className="flex-1">
                <h3 className="text-base font-black text-white mb-0.5">סימולציית מבחן</h3>
                <p className="text-slate-400 text-xs">טיימר · ניתוח שגיאות</p>
              </div>
            </div>
          </button>
        </div>

        {/* Dashboard card */}
        <button
          onClick={() => setActiveCourse('dashboard')}
          className="
            mt-4 w-full text-right p-5 rounded-[1.5rem] border backdrop-blur-xl transition-all duration-200
            bg-gradient-to-br from-slate-500/10 to-slate-600/5 border-slate-500/20
            hover:scale-[1.01] hover:shadow-xl hover:shadow-black/30 cursor-pointer active:scale-[0.98]
          "
        >
          <div className="flex items-center gap-4">
            <div className="text-slate-400"><LineChart size={24} /></div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-white mb-0.5">לוח למידה אישי</h3>
              <p className="text-slate-400 text-sm">מעקב ביצועים · יומן קשיים ותובנות · שיתוף עם Claude</p>
            </div>
            <ChevronLeft size={18} className="text-slate-500 shrink-0" />
          </div>
        </button>

        {/* Footer */}
        <div className="text-center mt-10 text-slate-600 text-xs">
          <p>שאלות ממבחנים אמיתיים 2019–2025 · מעדכן בזמן אמת</p>
        </div>
      </div>
    </div>
  )
}
