import { useCallback } from 'react'
import type { QuizResult, QuizResultMap, JournalEntry, JournalEntryType } from '../types'

// ── localStorage key helpers ───────────────────────────────────────────────
const quizKey = (moduleId: string) => `quiz_${moduleId}`
const JOURNAL_KEY = 'journal'

// ── Raw read helpers (safe outside React lifecycle) ────────────────────────
function readQuizResult(moduleId: string): QuizResult | null {
  try {
    const raw = localStorage.getItem(quizKey(moduleId))
    if (!raw) return null
    return JSON.parse(raw) as QuizResult
  } catch {
    return null
  }
}

function readAllQuizResults(): QuizResultMap {
  const result: QuizResultMap = {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith('quiz_')) {
        const moduleId = k.slice(5)
        const val = readQuizResult(moduleId)
        if (val) result[moduleId] = val
      }
    }
  } catch {}
  return result
}

function readJournalEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(JOURNAL_KEY)
    if (!raw) return []
    return JSON.parse(raw) as JournalEntry[]
  } catch {
    return []
  }
}

// ── Course module ID map (used for export grouping) ────────────────────────
const COURSE_MODULES: Record<string, string[]> = {
  'פיזיקה 2':        ['physics2-efield', 'physics2-bfield', 'physics2-induction', 'physics2-rlc', 'physics2-emwaves', 'physics2-optics'],
  'מד"ר':            ['diffeq-separable', 'diffeq-homogeneous', 'diffeq-linear', 'diffeq-bernoulli', 'diffeq-exact', 'diffeq-applications'],
  'אינפי 2':         ['calc2-limits', 'calc2-partials', 'calc2-optimization', 'calc2-double', 'calc2-line', 'calc2-surface'],
  'טורים והתמרות':   ['series-convergence', 'series-power', 'series-fourier', 'series-fourier-transform', 'series-laplace', 'series-z'],
}

// ── Main hook ──────────────────────────────────────────────────────────────
export function useLearningData() {

  // ── Quiz ────────────────────────────────────────────────────────────────

  const saveQuizResult = useCallback(
    (moduleId: string, score: number, total: number, wrongIndexes: number[]) => {
      const result: QuizResult = { score, total, timestamp: new Date().toISOString(), wrongIndexes }
      try { localStorage.setItem(quizKey(moduleId), JSON.stringify(result)) } catch {}
    },
    []
  )

  const getAllQuizResults = useCallback((): QuizResultMap => readAllQuizResults(), [])

  // ── Journal ─────────────────────────────────────────────────────────────

  const addJournalEntry = useCallback(
    (text: string, type: JournalEntryType, moduleId?: string): JournalEntry | undefined => {
      if (!text.trim()) return undefined
      const entries = readJournalEntries()
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        text: text.trim(),
        moduleId,
        type,
      }
      entries.unshift(newEntry) // newest first
      try { localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries)) } catch {}
      return newEntry
    },
    []
  )

  const getJournalEntries = useCallback((): JournalEntry[] => readJournalEntries(), [])

  // ── Export ──────────────────────────────────────────────────────────────

  const exportToClipboard = useCallback(async (): Promise<boolean> => {
    const quizResults = readAllQuizResults()
    const journal = readJournalEntries()

    const notesByModule: Record<string, string> = {}
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k?.startsWith('notes_')) {
          const val = localStorage.getItem(k) ?? ''
          if (val.trim()) notesByModule[k.slice(6)] = val.trim()
        }
      }
    } catch {}

    const lines: string[] = []
    lines.push('# דוח למידה — נתנאל, HIT')
    lines.push(`תאריך ייצוא: ${new Date().toLocaleString('he-IL')}`)
    lines.push('')

    // Quiz section
    lines.push('## ביצועי חידון לפי מודול')
    const hasQuiz = Object.keys(quizResults).length > 0
    if (!hasQuiz) {
      lines.push('(אין תוצאות חידון עדיין)')
    } else {
      for (const [courseName, ids] of Object.entries(COURSE_MODULES)) {
        const done = ids.filter(id => quizResults[id])
        if (done.length === 0) continue
        lines.push(`### ${courseName}`)
        for (const id of ids) {
          const r = quizResults[id]
          if (!r) continue
          const pct = Math.round((r.score / r.total) * 100)
          const status = r.score <= 1 ? '⚠ חלש' : r.score === r.total ? '✓ חזק' : '~ בסדר'
          const date = new Date(r.timestamp).toLocaleDateString('he-IL')
          lines.push(`- ${id}: ${r.score}/${r.total} (${pct}%) ${status} — ${date}`)
          if (r.wrongIndexes.length > 0) {
            lines.push(`  שאלות שגויות: ${r.wrongIndexes.map(i => i + 1).join(', ')}`)
          }
        }
      }
    }
    lines.push('')

    // Journal section
    lines.push('## יומן למידה')
    if (journal.length === 0) {
      lines.push('(אין רשומות יומן עדיין)')
    } else {
      const TYPE_LABELS: Record<JournalEntryType, string> = {
        question: 'שאלה',
        insight: 'תובנה',
        struggle: 'קושי',
      }
      for (const entry of journal) {
        const date = new Date(entry.date).toLocaleString('he-IL')
        const ctx = entry.moduleId ? ` [${entry.moduleId}]` : ''
        lines.push(`### ${TYPE_LABELS[entry.type]}${ctx} — ${date}`)
        lines.push(entry.text)
        lines.push('')
      }
    }

    // Notes section
    lines.push('## הערות לפי מודול')
    const hasNotes = Object.keys(notesByModule).length > 0
    if (!hasNotes) {
      lines.push('(אין הערות עדיין)')
    } else {
      for (const [modId, note] of Object.entries(notesByModule)) {
        lines.push(`### ${modId}`)
        lines.push(note)
        lines.push('')
      }
    }

    const text = lines.join('\n')
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }, [])

  // ── Readiness Score ─────────────────────────────────────────────────────
  // stageScore = (maxReached / 4) × 40  →  max 40
  // quizScore  = (score / total) × 60   →  max 60
  const calcReadiness = useCallback((moduleId: string): number => {
    let stageScore = 0
    try {
      const saved = localStorage.getItem(`progress_${moduleId}`)
      const maxReached = saved ? parseInt(saved) || 0 : 0
      stageScore = Math.round((Math.min(maxReached, 4) / 4) * 40)
    } catch {}

    let quizScore = 0
    const qr = readQuizResult(moduleId)
    if (qr) quizScore = Math.round((qr.score / qr.total) * 60)

    return stageScore + quizScore
  }, [])

  const calcCourseReadiness = useCallback((moduleIds: string[]): number => {
    if (moduleIds.length === 0) return 0
    const sum = moduleIds.reduce((acc, id) => acc + calcReadiness(id), 0)
    return Math.round(sum / moduleIds.length)
  }, [calcReadiness])

  return { saveQuizResult, getAllQuizResults, addJournalEntry, getJournalEntries, exportToClipboard, calcReadiness, calcCourseReadiness }
}
