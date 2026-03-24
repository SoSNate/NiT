import type { QuizQuestion } from '../types'

/**
 * Fisher-Yates shuffle — non-mutating
 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface WithDifficulty extends QuizQuestion {
  difficulty?: 'easy' | 'medium' | 'hard'
}

/**
 * Returns a randomized session of `count` questions.
 * Guarantees at least 1 easy + 1 medium + 1 hard if available.
 * Falls back gracefully when there aren't enough of a given difficulty.
 *
 * Result is also stored in sessionStorage keyed by moduleId so it
 * doesn't change during the same browser session.
 */
export function getRandomSession(
  questions: WithDifficulty[],
  moduleId: string,
  count: number = 5
): WithDifficulty[] {
  const key = `nit-session-${moduleId}`

  // Return cached session if available
  const cached = sessionStorage.getItem(key)
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as WithDifficulty[]
      // Make sure cached questions still exist in the current bank
      if (parsed.length > 0) return parsed
    } catch {
      // fall through to regenerate
    }
  }

  const easy   = shuffle(questions.filter(q => q.difficulty === 'easy'))
  const medium = shuffle(questions.filter(q => q.difficulty === 'medium'))
  const hard   = shuffle(questions.filter(q => q.difficulty === 'hard'))
  const untagged = shuffle(questions.filter(q => !q.difficulty))

  // Guarantee distribution: 1 easy, 1 medium, 1 hard (if available)
  const guaranteed: WithDifficulty[] = []
  if (easy.length > 0)   guaranteed.push(easy.shift()!)
  if (medium.length > 0) guaranteed.push(medium.shift()!)
  if (hard.length > 0)   guaranteed.push(hard.shift()!)

  // Fill remaining slots from the rest, shuffled
  const remaining = shuffle([...easy, ...medium, ...hard, ...untagged])
  const extra = remaining.slice(0, Math.max(0, count - guaranteed.length))

  const session = shuffle([...guaranteed, ...extra])

  sessionStorage.setItem(key, JSON.stringify(session))
  return session
}

/**
 * Clear the cached session for a module (call when user clicks "shuffle again")
 */
export function clearSession(moduleId: string) {
  sessionStorage.removeItem(`nit-session-${moduleId}`)
}
