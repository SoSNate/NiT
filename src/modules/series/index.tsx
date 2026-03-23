import CourseHub from '../../components/CourseHub'
import { CourseMeta } from '../../types'
import SeriesConvergence from './SeriesConvergence'
import PowerSeries from './PowerSeries'
import FourierSeries from './FourierSeries'
import FourierTransform from './FourierTransform'
import LaplaceTransform from './LaplaceTransform'
import ZTransform from './ZTransform'

// ── Course registry ─────────────────────────────────────────────────────────
// To add a new module: import it and add an entry to course.modules below.

const course: CourseMeta = {
  id: 'series',
  title: 'טורים והתמרות',
  subtitle: 'אנליזה פורמלית — HIT',
  icon: '∑',
  color: 'from-purple-500/20 to-pink-500/10',
  borderColor: 'border-purple-500/30',
  available: true,
  modules: [
    {
      id: 'convergence',
      title: 'התכנסות טורים',
      subtitle: 'יחס, שורש, לייבניץ, p-טור',
      icon: '∑',
      examFreq: 'כל מבחן',
      color: 'from-emerald-500/15 to-green-500/5',
      border: 'border-emerald-500/25',
      Component: SeriesConvergence,
    },
    {
      id: 'power',
      title: 'טורי חזקות וטיילור',
      subtitle: 'מקלורן, רדיוס התכנסות',
      icon: 'xⁿ',
      examFreq: 'כל מבחן',
      color: 'from-yellow-500/15 to-amber-500/5',
      border: 'border-yellow-500/25',
      Component: PowerSeries,
    },
    {
      id: 'fourier-series',
      title: 'טורי פורייה',
      subtitle: 'מקדמים, זוגיות, פרסוול',
      icon: '~',
      examFreq: 'כל מבחן',
      color: 'from-pink-500/15 to-rose-500/5',
      border: 'border-pink-500/25',
      Component: FourierSeries,
    },
    {
      id: 'fourier-transform',
      title: 'התמרת פורייה',
      subtitle: 'F(ω), תכונות, פרסוול',
      icon: 'F̂',
      examFreq: 'כל מבחן',
      color: 'from-cyan-500/15 to-sky-500/5',
      border: 'border-cyan-500/25',
      Component: FourierTransform,
    },
    {
      id: 'laplace',
      title: 'התמרת לפלס',
      subtitle: 'פתרון מד"ר, u(t), δ(t)',
      icon: 'L',
      examFreq: 'כל מבחן',
      color: 'from-violet-500/15 to-purple-500/5',
      border: 'border-violet-500/25',
      Component: LaplaceTransform,
    },
    {
      id: 'z-transform',
      title: 'התמרת Z',
      subtitle: 'משוואות הפרש, ROC',
      icon: 'Z',
      examFreq: 'כל מבחן',
      color: 'from-orange-500/15 to-amber-500/5',
      border: 'border-orange-500/25',
      Component: ZTransform,
    },
  ],
}

const quickFormulas = [
  { ltr: true, text: 'Ratio: L=lim|a_{n+1}/aₙ|' },
  { ltr: true, text: 'eˣ = Σxⁿ/n!, sin = Σ(-1)ⁿx^{2n+1}/(2n+1)!' },
  { ltr: true, text: 'Fourier: aₙ=(1/π)∫f·cos(nx)dx' },
  { ltr: true, text: 'Laplace: L{y\'}=sY-y(0)' },
  { ltr: true, text: 'Z{aⁿu[n]} = z/(z-a)' },
  { ltr: true, text: 'Parseval: ∫|f|²=(1/2π)∫|F|²' },
]

export default function SeriesHub({ onBack }: { onBack: () => void }) {
  return <CourseHub course={course} quickFormulas={quickFormulas} onBack={onBack} />
}
