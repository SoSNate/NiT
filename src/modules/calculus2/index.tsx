import CourseHub from '../../components/CourseHub'
import { CourseMeta } from '../../types'
import Limits from './Limits'
import PartialDerivatives from './PartialDerivatives'
import Optimization from './Optimization'
import DoubleIntegrals from './DoubleIntegrals'
import LineIntegrals from './LineIntegrals'
import SurfaceIntegrals from './SurfaceIntegrals'

// ── Course registry ─────────────────────────────────────────────────────────
// To add a new module: import it and add an entry to course.modules below.

const course: CourseMeta = {
  id: 'calculus2',
  title: 'חשבון אינפיניטסימלי 2',
  subtitle: 'אינפי 2 — HIT',
  icon: '∫',
  color: 'from-blue-500/20 to-cyan-500/10',
  borderColor: 'border-blue-500/30',
  available: true,
  modules: [
    {
      id: 'limits',
      title: 'גבולות ורציפות',
      subtitle: 'מסלולים, קוטביות, Squeeze',
      icon: '→',
      examFreq: 'כל מבחן',
      color: 'from-red-500/15 to-rose-500/5',
      border: 'border-red-500/25',
      Component: Limits,
    },
    {
      id: 'partials',
      title: 'נגזרות חלקיות',
      subtitle: '∂f/∂x, מישור משיק, דיפרנציאביליות',
      icon: '∂',
      examFreq: 'כל מבחן',
      color: 'from-purple-500/15 to-violet-500/5',
      border: 'border-purple-500/25',
      Component: PartialDerivatives,
    },
    {
      id: 'optimization',
      title: 'אקסטרמום',
      subtitle: 'נקודות קריטיות, מבחן D, לגרנג\'',
      icon: '⛰',
      examFreq: 'כל מבחן',
      color: 'from-yellow-500/15 to-amber-500/5',
      border: 'border-yellow-500/25',
      Component: Optimization,
    },
    {
      id: 'double',
      title: 'אינטגרל כפול',
      subtitle: 'פובייני, קוטביות, יעקוביאן',
      icon: '∬',
      examFreq: 'כל מבחן',
      color: 'from-blue-500/15 to-cyan-500/5',
      border: 'border-blue-500/25',
      Component: DoubleIntegrals,
    },
    {
      id: 'line',
      title: 'אינטגרל קווי',
      subtitle: 'שדה שמור, פוטנציאל, גרין',
      icon: '∮',
      examFreq: 'כל מבחן',
      color: 'from-teal-500/15 to-cyan-500/5',
      border: 'border-teal-500/25',
      Component: LineIntegrals,
    },
    {
      id: 'surface',
      title: 'אינטגרל שטח',
      subtitle: 'גאוס, סטוקס, שטף',
      icon: '⊂',
      examFreq: 'כל מבחן',
      color: 'from-indigo-500/15 to-blue-500/5',
      border: 'border-indigo-500/25',
      Component: SurfaceIntegrals,
    },
  ],
}

const quickFormulas = [
  { ltr: true, text: 'Polar: dA = r·dr·dθ' },
  { ltr: true, text: 'Green: ∮ Pdx+Qdy = ∬(Q_x-P_y)dA' },
  { ltr: true, text: 'Gauss: ∯ F·dS = ∭ div(F) dV' },
  { ltr: true, text: 'Conservative: ∂P/∂y = ∂Q/∂x' },
  { ltr: true, text: 'Critical: f_x=0, f_y=0; D=f_xx·f_yy-(f_xy)²' },
  { ltr: true, text: 'Lagrange: ∇f = λ∇g' },
]

export default function Calculus2Hub({ onBack }: { onBack: () => void }) {
  return <CourseHub course={course} quickFormulas={quickFormulas} onBack={onBack} />
}
