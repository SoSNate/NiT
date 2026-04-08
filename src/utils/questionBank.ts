import type { QuizQuestion } from '../types'

// Physics 2
import { quiz as coulombQ, practice as coulombP } from '../modules/physics2/CoulombsLaw'
import { quiz as gaussQ, practice as gaussP } from '../modules/physics2/GaussLaw'
import { quiz as efieldQ, practice as efieldP } from '../modules/physics2/ElectricField'
import { quiz as potentialQ, practice as potentialP } from '../modules/physics2/ElectricPotential'
import { quiz as capacitorsQ, practice as capacitorsP } from '../modules/physics2/Capacitors'
import { quiz as dcQ, practice as dcP } from '../modules/physics2/DCCircuits'
import { quiz as bfieldQ, practice as bfieldP } from '../modules/physics2/MagneticField'
import { quiz as inductionQ, practice as inductionP } from '../modules/physics2/Induction'
import { quiz as rlcQ, practice as rlcP } from '../modules/physics2/RLCCircuits'
import { quiz as emwavesQ, practice as emwavesP } from '../modules/physics2/EMWaves'
import { quiz as opticsQ, practice as opticsP } from '../modules/physics2/Optics'
import { quiz as labQ, practice as labP } from '../modules/physics2/PhysicsLab'
// Diffeq
import { quiz as separableQ, practice as separableP } from '../modules/diffeq/Separable'
import { quiz as homogQ, practice as homogP } from '../modules/diffeq/Homogeneous'
import { quiz as linearQ, practice as linearP } from '../modules/diffeq/Linear'
import { quiz as bernoulliQ, practice as bernoulliP } from '../modules/diffeq/Bernoulli'
import { quiz as exactQ, practice as exactP } from '../modules/diffeq/Exact'
import { quiz as appQ, practice as appP } from '../modules/diffeq/Applications'
// Calculus 2
import { quiz as limitsQ, practice as limitsP } from '../modules/calculus2/Limits'
import { quiz as partialsQ, practice as partialsP } from '../modules/calculus2/PartialDerivatives'
import { quiz as optimQ, practice as optimP } from '../modules/calculus2/Optimization'
import { quiz as doubleQ, practice as doubleP } from '../modules/calculus2/DoubleIntegrals'
import { quiz as lineQ, practice as lineP } from '../modules/calculus2/LineIntegrals'
import { quiz as surfaceQ, practice as surfaceP } from '../modules/calculus2/SurfaceIntegrals'
import { quiz as taylorQ, practice as taylorP } from '../modules/calculus2/TaylorSeries'
import { quiz as parametricQ, practice as parametricP } from '../modules/calculus2/ParametricCurves'
// Series
import { quiz as convergenceQ, practice as convergenceP } from '../modules/series/SeriesConvergence'
import { quiz as powerQ, practice as powerP } from '../modules/series/PowerSeries'
import { quiz as fourierSeriesQ, practice as fourierSeriesP } from '../modules/series/FourierSeries'
import { quiz as fourierTransformQ, practice as fourierTransformP } from '../modules/series/FourierTransform'
import { quiz as laplaceQ, practice as laplaceP } from '../modules/series/LaplaceTransform'
import { quiz as zQ, practice as zP } from '../modules/series/ZTransform'

// ── Legacy session helpers (used by GenericLearningModule) ────────────────────

interface WithDifficulty extends QuizQuestion {
  difficulty?: 'easy' | 'medium' | 'hard'
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function getRandomSession(
  questions: WithDifficulty[],
  moduleId: string,
  count = 5
): WithDifficulty[] {
  const key = `nit-session-${moduleId}`
  const cached = sessionStorage.getItem(key)
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as WithDifficulty[]
      if (parsed.length > 0) return parsed
    } catch { /* fall through */ }
  }
  const easy     = shuffle(questions.filter(q => q.difficulty === 'easy'))
  const medium   = shuffle(questions.filter(q => q.difficulty === 'medium'))
  const hard     = shuffle(questions.filter(q => q.difficulty === 'hard'))
  const untagged = shuffle(questions.filter(q => !q.difficulty))
  const guaranteed: WithDifficulty[] = []
  if (easy.length)   guaranteed.push(easy.shift()!)
  if (medium.length) guaranteed.push(medium.shift()!)
  if (hard.length)   guaranteed.push(hard.shift()!)
  const remaining = shuffle([...easy, ...medium, ...hard, ...untagged])
  const extra = remaining.slice(0, Math.max(0, count - guaranteed.length))
  const session = shuffle([...guaranteed, ...extra])
  sessionStorage.setItem(key, JSON.stringify(session))
  return session
}

export function clearSession(moduleId: string) {
  sessionStorage.removeItem(`nit-session-${moduleId}`)
}

// ── BankQuestion — centralized bank for PracticeMode / ExamMode ───────────────

export interface BankQuestion extends QuizQuestion {
  courseId: 'physics2' | 'diffeq' | 'calculus2' | 'series'
  topicId: string
  topicLabel: string
  type: 'quiz' | 'practice'
  difficulty: 'easy' | 'medium' | 'hard'
}

function deriveD(type: 'quiz' | 'practice', index: number): 'easy' | 'medium' | 'hard' {
  if (type === 'quiz') return 'medium'
  if (index <= 1) return 'easy'
  if (index <= 3) return 'medium'
  return 'hard'
}

function tag(
  qs: QuizQuestion[],
  type: 'quiz' | 'practice',
  courseId: BankQuestion['courseId'],
  topicId: string,
  topicLabel: string,
): BankQuestion[] {
  return qs.map((q, i) => ({ ...q, courseId, topicId, topicLabel, type, difficulty: deriveD(type, i) }))
}

export const QUESTION_BANK: BankQuestion[] = [
  ...tag(coulombQ, 'quiz', 'physics2', 'coulomb', '\u05d7\u05d5\u05e7 \u05e7\u05d5\u05dc\u05d5\u05df'),
  ...tag(coulombP, 'practice', 'physics2', 'coulomb', '\u05d7\u05d5\u05e7 \u05e7\u05d5\u05dc\u05d5\u05df'),
  ...tag(gaussQ, 'quiz', 'physics2', 'gauss', '\u05d7\u05d5\u05e7 \u05d2\u05d0\u05d5\u05e1'),
  ...tag(gaussP, 'practice', 'physics2', 'gauss', '\u05d7\u05d5\u05e7 \u05d2\u05d0\u05d5\u05e1'),
  ...tag(efieldQ, 'quiz', 'physics2', 'efield', '\u05e9\u05d3\u05d4 \u05d7\u05e9\u05de\u05dc\u05d9'),
  ...tag(efieldP, 'practice', 'physics2', 'efield', '\u05e9\u05d3\u05d4 \u05d7\u05e9\u05de\u05dc\u05d9'),
  ...tag(potentialQ, 'quiz', 'physics2', 'potential', '\u05e4\u05d5\u05d8\u05e0\u05e6\u05d9\u05d0\u05dc \u05d7\u05e9\u05de\u05dc\u05d9'),
  ...tag(potentialP, 'practice', 'physics2', 'potential', '\u05e4\u05d5\u05d8\u05e0\u05e6\u05d9\u05d0\u05dc \u05d7\u05e9\u05de\u05dc\u05d9'),
  ...tag(capacitorsQ, 'quiz', 'physics2', 'capacitors', '\u05e7\u05d1\u05dc\u05d9\u05dd'),
  ...tag(capacitorsP, 'practice', 'physics2', 'capacitors', '\u05e7\u05d1\u05dc\u05d9\u05dd'),
  ...tag(dcQ, 'quiz', 'physics2', 'dc', '\u05de\u05e2\u05d2\u05dc\u05d9 DC'),
  ...tag(dcP, 'practice', 'physics2', 'dc', '\u05de\u05e2\u05d2\u05dc\u05d9 DC'),
  ...tag(bfieldQ, 'quiz', 'physics2', 'bfield', '\u05e9\u05d3\u05d4 \u05de\u05d2\u05e0\u05d8\u05d9'),
  ...tag(bfieldP, 'practice', 'physics2', 'bfield', '\u05e9\u05d3\u05d4 \u05de\u05d2\u05e0\u05d8\u05d9'),
  ...tag(inductionQ, 'quiz', 'physics2', 'induction', '\u05d0\u05d9\u05e0\u05d3\u05d5\u05e7\u05e6\u05d9\u05d4'),
  ...tag(inductionP, 'practice', 'physics2', 'induction', '\u05d0\u05d9\u05e0\u05d3\u05d5\u05e7\u05e6\u05d9\u05d4'),
  ...tag(rlcQ, 'quiz', 'physics2', 'rlc', '\u05de\u05e2\u05d2\u05dc\u05d9 RLC'),
  ...tag(rlcP, 'practice', 'physics2', 'rlc', '\u05de\u05e2\u05d2\u05dc\u05d9 RLC'),
  ...tag(emwavesQ, 'quiz', 'physics2', 'emwaves', '\u05d2\u05dc\u05d9\u05dd EM'),
  ...tag(emwavesP, 'practice', 'physics2', 'emwaves', '\u05d2\u05dc\u05d9\u05dd EM'),
  ...tag(opticsQ, 'quiz', 'physics2', 'optics', '\u05d0\u05d5\u05e4\u05d8\u05d9\u05e7\u05d4'),
  ...tag(opticsP, 'practice', 'physics2', 'optics', '\u05d0\u05d5\u05e4\u05d8\u05d9\u05e7\u05d4'),
  ...tag(labQ, 'quiz', 'physics2', 'lab', '\u05de\u05e2\u05d1\u05d3\u05d4 \u05d1\u05e4\u05d9\u05d6\u05d9\u05e7\u05d4'),
  ...tag(labP, 'practice', 'physics2', 'lab', '\u05de\u05e2\u05d1\u05d3\u05d4 \u05d1\u05e4\u05d9\u05d6\u05d9\u05e7\u05d4'),
  ...tag(separableQ, 'quiz', 'diffeq', 'separable', '\u05d4\u05e4\u05e8\u05d3\u05ea \u05de\u05e9\u05ea\u05e0\u05d9\u05dd'),
  ...tag(separableP, 'practice', 'diffeq', 'separable', '\u05d4\u05e4\u05e8\u05d3\u05ea \u05de\u05e9\u05ea\u05e0\u05d9\u05dd'),
  ...tag(homogQ, 'quiz', 'diffeq', 'homogeneous', '\u05d4\u05d5\u05de\u05d5\u05d2\u05e0\u05d9\u05ea'),
  ...tag(homogP, 'practice', 'diffeq', 'homogeneous', '\u05d4\u05d5\u05de\u05d5\u05d2\u05e0\u05d9\u05ea'),
  ...tag(linearQ, 'quiz', 'diffeq', 'linear', '\u05dc\u05d9\u05e0\u05d0\u05e8\u05d9\u05ea \u05de\u05de"\u05e8'),
  ...tag(linearP, 'practice', 'diffeq', 'linear', '\u05dc\u05d9\u05e0\u05d0\u05e8\u05d9\u05ea \u05de\u05de"\u05e8'),
  ...tag(bernoulliQ, 'quiz', 'diffeq', 'bernoulli', '\u05d1\u05e8\u05e0\u05d5\u05dc\u05d9'),
  ...tag(bernoulliP, 'practice', 'diffeq', 'bernoulli', '\u05d1\u05e8\u05e0\u05d5\u05dc\u05d9'),
  ...tag(exactQ, 'quiz', 'diffeq', 'exact', '\u05de\u05d3\u05d5\u05d9\u05e7\u05d5\u05ea'),
  ...tag(exactP, 'practice', 'diffeq', 'exact', '\u05de\u05d3\u05d5\u05d9\u05e7\u05d5\u05ea'),
  ...tag(appQ, 'quiz', 'diffeq', 'applications', '\u05d9\u05d9\u05e9\u05d5\u05de\u05d9\u05dd'),
  ...tag(appP, 'practice', 'diffeq', 'applications', '\u05d9\u05d9\u05e9\u05d5\u05de\u05d9\u05dd'),
  ...tag(limitsQ, 'quiz', 'calculus2', 'limits', '\u05d2\u05d1\u05d5\u05dc\u05d5\u05ea \u05d5\u05e8\u05e6\u05d9\u05e4\u05d5\u05ea'),
  ...tag(limitsP, 'practice', 'calculus2', 'limits', '\u05d2\u05d1\u05d5\u05dc\u05d5\u05ea \u05d5\u05e8\u05e6\u05d9\u05e4\u05d5\u05ea'),
  ...tag(partialsQ, 'quiz', 'calculus2', 'partials', '\u05e0\u05d2\u05d6\u05e8\u05d5\u05ea \u05d7\u05dc\u05e7\u05d9\u05d5\u05ea'),
  ...tag(partialsP, 'practice', 'calculus2', 'partials', '\u05e0\u05d2\u05d6\u05e8\u05d5\u05ea \u05d7\u05dc\u05e7\u05d9\u05d5\u05ea'),
  ...tag(optimQ, 'quiz', 'calculus2', 'optimization', '\u05d0\u05e7\u05e1\u05d8\u05e8\u05de\u05d5\u05dd'),
  ...tag(optimP, 'practice', 'calculus2', 'optimization', '\u05d0\u05e7\u05e1\u05d8\u05e8\u05de\u05d5\u05dd'),
  ...tag(doubleQ, 'quiz', 'calculus2', 'double', '\u05d0\u05d9\u05e0\u05d8\u05d2\u05e8\u05dc \u05db\u05e4\u05d5\u05dc'),
  ...tag(doubleP, 'practice', 'calculus2', 'double', '\u05d0\u05d9\u05e0\u05d8\u05d2\u05e8\u05dc \u05db\u05e4\u05d5\u05dc'),
  ...tag(lineQ, 'quiz', 'calculus2', 'line', '\u05d0\u05d9\u05e0\u05d8\u05d2\u05e8\u05dc \u05e7\u05d5\u05d5\u05d9'),
  ...tag(lineP, 'practice', 'calculus2', 'line', '\u05d0\u05d9\u05e0\u05d8\u05d2\u05e8\u05dc \u05e7\u05d5\u05d5\u05d9'),
  ...tag(surfaceQ, 'quiz', 'calculus2', 'surface', '\u05d0\u05d9\u05e0\u05d8\u05d2\u05e8\u05dc \u05e9\u05d8\u05d7'),
  ...tag(surfaceP, 'practice', 'calculus2', 'surface', '\u05d0\u05d9\u05e0\u05d8\u05d2\u05e8\u05dc \u05e9\u05d8\u05d7'),
  ...tag(taylorQ, 'quiz', 'calculus2', 'taylor', '\u05d8\u05d5\u05e8\u05d9 \u05d8\u05d9\u05d9\u05dc\u05d5\u05e8'),
  ...tag(taylorP, 'practice', 'calculus2', 'taylor', '\u05d8\u05d5\u05e8\u05d9 \u05d8\u05d9\u05d9\u05dc\u05d5\u05e8'),
  ...tag(parametricQ, 'quiz', 'calculus2', 'parametric', '\u05e2\u05e7\u05d5\u05de\u05d5\u05ea \u05e4\u05e8\u05de\u05d8\u05e8\u05d9\u05d5\u05ea'),
  ...tag(parametricP, 'practice', 'calculus2', 'parametric', '\u05e2\u05e7\u05d5\u05de\u05d5\u05ea \u05e4\u05e8\u05de\u05d8\u05e8\u05d9\u05d5\u05ea'),
  ...tag(convergenceQ, 'quiz', 'series', 'convergence', '\u05d4\u05ea\u05db\u05e0\u05e1\u05d5\u05ea \u05d8\u05d5\u05e8\u05d9\u05dd'),
  ...tag(convergenceP, 'practice', 'series', 'convergence', '\u05d4\u05ea\u05db\u05e0\u05e1\u05d5\u05ea \u05d8\u05d5\u05e8\u05d9\u05dd'),
  ...tag(powerQ, 'quiz', 'series', 'power', '\u05d8\u05d5\u05e8\u05d9 \u05d7\u05d6\u05e7\u05d5\u05ea \u05d5\u05d8\u05d9\u05d9\u05dc\u05d5\u05e8'),
  ...tag(powerP, 'practice', 'series', 'power', '\u05d8\u05d5\u05e8\u05d9 \u05d7\u05d6\u05e7\u05d5\u05ea \u05d5\u05d8\u05d9\u05d9\u05dc\u05d5\u05e8'),
  ...tag(fourierSeriesQ, 'quiz', 'series', 'fourier-series', '\u05d8\u05d5\u05e8\u05d9 \u05e4\u05d5\u05e8\u05d9\u05d9\u05d4'),
  ...tag(fourierSeriesP, 'practice', 'series', 'fourier-series', '\u05d8\u05d5\u05e8\u05d9 \u05e4\u05d5\u05e8\u05d9\u05d9\u05d4'),
  ...tag(fourierTransformQ, 'quiz', 'series', 'fourier-transform', '\u05d4\u05ea\u05de\u05e8\u05ea \u05e4\u05d5\u05e8\u05d9\u05d9\u05d4'),
  ...tag(fourierTransformP, 'practice', 'series', 'fourier-transform', '\u05d4\u05ea\u05de\u05e8\u05ea \u05e4\u05d5\u05e8\u05d9\u05d9\u05d4'),
  ...tag(laplaceQ, 'quiz', 'series', 'laplace', '\u05d4\u05ea\u05de\u05e8\u05ea \u05dc\u05e4\u05dc\u05e1'),
  ...tag(laplaceP, 'practice', 'series', 'laplace', '\u05d4\u05ea\u05de\u05e8\u05ea \u05dc\u05e4\u05dc\u05e1'),
  ...tag(zQ, 'quiz', 'series', 'z-transform', '\u05d4\u05ea\u05de\u05e8\u05ea Z'),
  ...tag(zP, 'practice', 'series', 'z-transform', '\u05d4\u05ea\u05de\u05e8\u05ea Z'),
]

export type CourseId = BankQuestion['courseId']
export type Difficulty = BankQuestion['difficulty']

export const COURSE_LABELS: Record<CourseId, string> = {
  physics2: '\u05e4\u05d9\u05d6\u05d9\u05e7\u05d4 2',
  diffeq: '\u05de\u05e9\u05d5\u05d0\u05d5\u05ea \u05d3\u05d9\u05e4\u05e8\u05e0\u05e6\u05d9\u05d0\u05dc\u05d9\u05d5\u05ea',
  calculus2: '\u05d0\u05d9\u05e0\u05e4\u05d9 2',
  series: '\u05d8\u05d5\u05e8\u05d9\u05dd \u05d5\u05d4\u05ea\u05de\u05e8\u05d5\u05ea',
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '\u05e7\u05dc',
  medium: '\u05d1\u05d9\u05e0\u05d5\u05e0\u05d9',
  hard: '\u05e7\u05e9\u05d4',
}

export function getTopics(courseId: CourseId): { id: string; label: string }[] {
  const seen = new Map<string, string>()
  for (const q of QUESTION_BANK) {
    if (q.courseId === courseId && !seen.has(q.topicId)) seen.set(q.topicId, q.topicLabel)
  }
  return Array.from(seen.entries()).map(([id, label]) => ({ id, label }))
}

export interface QueryFilter {
  courseId: CourseId
  topicId?: string
  difficulty?: Difficulty
}

export function queryQuestions(filter: QueryFilter): BankQuestion[] {
  const filtered = QUESTION_BANK.filter(q => {
    if (q.courseId !== filter.courseId) return false
    if (filter.topicId && q.topicId !== filter.topicId) return false
    if (filter.difficulty && q.difficulty !== filter.difficulty) return false
    return true
  })
  return shuffle(filtered)
}

export function pickExamQuestions(courseId: CourseId, n: number): BankQuestion[] {
  return queryQuestions({ courseId }).slice(0, n)
}
