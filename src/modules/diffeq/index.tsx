import CourseHub from '../../components/CourseHub'
import { CourseMeta } from '../../types'
import Separable from './Separable'
import Homogeneous from './Homogeneous'
import Linear from './Linear'
import Bernoulli from './Bernoulli'
import Exact from './Exact'
import Applications from './Applications'

// ── Course registry ─────────────────────────────────────────────────────────
// To add a new module: import it and add an entry to course.modules below.
// CourseHub renders everything automatically.

const course: CourseMeta = {
  id: 'diffeq',
  title: 'משוואות דיפרנציאליות',
  subtitle: 'מד"ר סדר ראשון — HIT',
  icon: '📈',
  color: 'from-emerald-500/20 to-teal-500/10',
  borderColor: 'border-emerald-500/30',
  available: true,
  modules: [
    {
      id: 'separable',
      title: 'הפרדת משתנים',
      subtitle: 'dy/dx = f(x)·g(y)',
      icon: '÷',
      examFreq: 'כל מבחן',
      color: 'from-emerald-500/15 to-green-500/5',
      border: 'border-emerald-500/25',
      Component: Separable,
    },
    {
      id: 'homogeneous',
      title: 'הומוגנית',
      subtitle: 'dy/dx = F(y/x) — הצבת v=y/x',
      icon: '🔄',
      examFreq: 'נפוץ',
      color: 'from-purple-500/15 to-violet-500/5',
      border: 'border-purple-500/25',
      Component: Homogeneous,
    },
    {
      id: 'linear',
      title: 'לינארית ממ"ר',
      subtitle: "y' + P(x)y = Q(x)",
      icon: '📐',
      examFreq: 'כל מבחן',
      color: 'from-blue-500/15 to-cyan-500/5',
      border: 'border-blue-500/25',
      Component: Linear,
    },
    {
      id: 'bernoulli',
      title: 'ברנולי',
      subtitle: "y' + Py = Qyⁿ — הצבת u=y^(1-n)",
      icon: '🧪',
      examFreq: 'כמעט כל מבחן',
      color: 'from-yellow-500/15 to-amber-500/5',
      border: 'border-yellow-500/25',
      Component: Bernoulli,
    },
    {
      id: 'exact',
      title: 'מדויקות',
      subtitle: 'Mdx + Ndy = 0, ∂M/∂y = ∂N/∂x',
      icon: '🎯',
      examFreq: 'כל מבחן',
      color: 'from-teal-500/15 to-cyan-500/5',
      border: 'border-teal-500/25',
      Component: Exact,
    },
    {
      id: 'applications',
      title: 'יישומים',
      subtitle: 'קירור ניוטון, גידול, ריקבון',
      icon: '☕',
      examFreq: 'נפוץ',
      color: 'from-orange-500/15 to-red-500/5',
      border: 'border-orange-500/25',
      Component: Applications,
    },
  ],
}

const quickFormulas = [
  { ltr: true, text: 'Separable: dy/g(y) = f(x)dx' },
  { ltr: true, text: 'Linear: μ = e^(∫P dx)' },
  { ltr: true, text: 'Bernoulli: u = y^(1-n)' },
  { ltr: true, text: 'Exact: ∂M/∂y = ∂N/∂x' },
  { ltr: true, text: 'Newton: T = T_env + (T₀-Tₑ)e^(-kt)' },
  { ltr: true, text: 'Homogeneous: v = y/x' },
]

export default function DiffeqHub({ onBack }: { onBack: () => void }) {
  return <CourseHub course={course} quickFormulas={quickFormulas} onBack={onBack} />
}
