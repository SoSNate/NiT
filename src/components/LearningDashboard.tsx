import React, { useState, useEffect } from 'react'
import { ArrowRight, ClipboardCopy, Check, ChevronDown, ChevronUp, Mic, MicOff, X, Download } from 'lucide-react'
import { useLearningData } from '../hooks/useLearningData'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import ReadinessGauge from './ReadinessGauge'
import type { QuizResultMap, JournalEntry, JournalEntryType } from '../types'

interface Props { onBack: () => void }

// ── Course/module registry for the dashboard ───────────────────────────────
const COURSES = [
  {
    name: 'פיזיקה 2', emoji: '⚡',
    color: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/20',
    ids: ['physics2-efield', 'physics2-bfield', 'physics2-induction', 'physics2-rlc', 'physics2-emwaves', 'physics2-optics'],
    labels: ['שדה חשמלי', 'שדה מגנטי', 'אינדוקציה', 'RLC', 'גלי EM', 'אופטיקה'],
  },
  {
    name: 'מד"ר', emoji: '∂',
    color: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/20',
    ids: ['diffeq-separable', 'diffeq-homogeneous', 'diffeq-linear', 'diffeq-bernoulli', 'diffeq-exact', 'diffeq-applications'],
    labels: ['מופרדות', 'הומוגניות', 'לינארית', 'ברנולי', 'מדויקת', 'יישומים'],
  },
  {
    name: 'אינפי 2', emoji: '∫',
    color: 'from-purple-500/20 to-violet-500/10', border: 'border-purple-500/20',
    ids: ['calc2-limits', 'calc2-partials', 'calc2-optimization', 'calc2-double', 'calc2-line', 'calc2-surface'],
    labels: ['גבולות', 'נגזרות חלקיות', 'אקסטרמום', 'אינטגרל כפול', 'אינטגרל קווי', 'אינטגרלי שטח'],
  },
  {
    name: 'טורים והתמרות', emoji: '∑',
    color: 'from-orange-500/20 to-amber-500/10', border: 'border-orange-500/20',
    ids: ['series-convergence', 'series-power', 'series-fourier', 'series-fourier-transform', 'series-laplace', 'series-z'],
    labels: ['התכנסות', 'טורי חזקות', 'פורייה', 'התמרת פורייה', 'לפלס', 'התמרת Z'],
  },
]

const TYPE_LABELS: Record<JournalEntryType, string> = {
  question: 'שאלה', insight: 'תובנה', struggle: 'קושי',
}
const TYPE_COLORS: Record<JournalEntryType, string> = {
  question: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  insight: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  struggle: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ScoreChip({ score, total }: { score?: number; total?: number }) {
  if (score === undefined) {
    return <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-600">—</span>
  }
  const pct = (score / (total ?? 3)) * 100
  const cls = pct === 100
    ? 'bg-emerald-500/20 text-emerald-300'
    : pct >= 67
    ? 'bg-yellow-500/20 text-yellow-300'
    : 'bg-red-500/20 text-red-300'
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${cls}`} dir="ltr">
      {score}/{total}
    </span>
  )
}

function CourseQuizCard({ course, quizResults, readinessPct }: {
  course: typeof COURSES[0]; quizResults: QuizResultMap; readinessPct: number
}) {
  const done = course.ids.filter(id => quizResults[id]).length

  return (
    <div className={`bg-gradient-to-br ${course.color} border ${course.border} rounded-2xl p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{course.emoji}</span>
          <div>
            <p className="text-white font-bold text-sm">{course.name}</p>
            <p className="text-slate-500 text-xs">{done}/{course.ids.length} חידונים</p>
          </div>
        </div>
        <ReadinessGauge pct={readinessPct} size={58} label="מוכנות" />
      </div>

      {/* Module chips */}
      <div className="grid grid-cols-3 gap-1.5">
        {course.ids.map((id, i) => {
          const r = quizResults[id]
          return (
            <div key={id} className="flex flex-col items-start gap-0.5">
              <span className="text-slate-500 text-[9px] truncate w-full">{course.labels[i]}</span>
              <ScoreChip score={r?.score} total={r?.total} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WeakStrongPanel({ quizResults }: { quizResults: QuizResultMap }) {
  const weak: string[] = []
  const strong: string[] = []

  for (const course of COURSES) {
    for (let i = 0; i < course.ids.length; i++) {
      const r = quizResults[course.ids[i]]
      if (!r) continue
      if (r.score <= 1) weak.push(course.labels[i])
      else if (r.score === r.total) strong.push(course.labels[i])
    }
  }

  if (weak.length === 0 && strong.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-4">
      {weak.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <p className="text-red-400 font-bold text-sm mb-2">⚠ חלש — לחזור</p>
          <ul className="space-y-1">
            {weak.map(w => <li key={w} className="text-red-300 text-xs">{w}</li>)}
          </ul>
        </div>
      )}
      {strong.length > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
          <p className="text-emerald-400 font-bold text-sm mb-2">✓ חזק — מוכן</p>
          <ul className="space-y-1">
            {strong.map(s => <li key={s} className="text-emerald-300 text-xs">{s}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

function JournalCard({ entry, onDelete }: { entry: JournalEntry; onDelete: () => void }) {
  const date = new Date(entry.date).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  return (
    <div className={`border rounded-xl p-3 ${TYPE_COLORS[entry.type]}`}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase opacity-70">{TYPE_LABELS[entry.type]}</span>
          {entry.moduleId && (
            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono">{entry.moduleId}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] opacity-50">{date}</span>
          <button
            onClick={onDelete}
            className="opacity-30 hover:opacity-70 text-[10px] transition-opacity"
            title="מחק"
          >✕</button>
        </div>
      </div>
      <p className="text-sm leading-relaxed">{entry.text}</p>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────

export default function LearningDashboard({ onBack }: Props) {
  const { getAllQuizResults, addJournalEntry, getJournalEntries, exportToClipboard, calcCourseReadiness } = useLearningData()
  const { isListening, isSupported, interim, start: startSpeech, stop: stopSpeech } = useSpeechRecognition()

  const [quizResults, setQuizResults] = useState<QuizResultMap>({})
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [notesByModule, setNotesByModule] = useState<Record<string, string>>({})

  const [journalText, setJournalText] = useState('')
  const [journalType, setJournalType] = useState<JournalEntryType>('question')
  const [filterType, setFilterType] = useState<JournalEntryType | 'all'>('all')

  const [copied, setCopied] = useState(false)
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({})

  // Load all data on mount
  useEffect(() => {
    setQuizResults(getAllQuizResults())
    setJournalEntries(getJournalEntries())

    const notes: Record<string, string> = {}
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k?.startsWith('notes_')) {
          const val = localStorage.getItem(k) ?? ''
          if (val.trim()) notes[k.slice(6)] = val.trim()
        }
      }
    } catch {}
    setNotesByModule(notes)
  }, [getAllQuizResults, getJournalEntries])

  const handleExport = async () => {
    const ok = await exportToClipboard()
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const handleDownload = () => {
    // Collect all notes from localStorage
    const lines: string[] = []
    lines.push(`# הערות ויומן למידה — נתנאל`)
    lines.push(`תאריך: ${new Date().toLocaleString('he-IL')}`)
    lines.push('')

    // Module notes
    const hasNotes = Object.keys(notesByModule).length > 0
    if (hasNotes) {
      lines.push('## הערות לפי מודול')
      for (const [id, text] of Object.entries(notesByModule)) {
        lines.push(`### ${id}`)
        lines.push(text)
        lines.push('')
      }
    }

    // Journal entries
    if (journalEntries.length > 0) {
      lines.push('## יומן למידה')
      const TYPE_HE: Record<JournalEntryType, string> = { question: 'שאלה', insight: 'תובנה', struggle: 'קושי' }
      for (const e of journalEntries) {
        const date = new Date(e.date).toLocaleString('he-IL')
        lines.push(`[${TYPE_HE[e.type]}${e.moduleId ? ` — ${e.moduleId}` : ''}] ${date}`)
        lines.push(e.text)
        lines.push('')
      }
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `למידה_${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAddJournal = () => {
    if (!journalText.trim()) return
    const entry = addJournalEntry(journalText, journalType)
    if (entry) {
      setJournalEntries(prev => [entry, ...prev])
      setJournalText('')
    }
  }

  const handleDeleteEntry = (id: string) => {
    const updated = journalEntries.filter(e => e.id !== id)
    setJournalEntries(updated)
    try { localStorage.setItem('journal', JSON.stringify(updated)) } catch {}
  }

  const filtered = filterType === 'all'
    ? journalEntries
    : journalEntries.filter(e => e.type === filterType)

  const FILTER_OPTIONS: Array<{ val: JournalEntryType | 'all'; label: string }> = [
    { val: 'all', label: 'הכל' },
    { val: 'question', label: 'שאלות' },
    { val: 'insight', label: 'תובנות' },
    { val: 'struggle', label: 'קשיים' },
  ]

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      <div className="max-w-5xl mx-auto flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
          >
            <ArrowRight size={16} />
            חזרה
          </button>
          <h1 className="text-2xl font-black text-white">📊 לוח למידה אישי</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              title="הורד הערות ויומן כקובץ טקסט"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all bg-slate-700/50 text-slate-300 border border-slate-600/30 hover:bg-slate-700"
            >
              <Download size={14} />
              שמור קובץ
            </button>
            <button
              onClick={handleExport}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
              }`}
            >
              {copied ? <Check size={14} /> : <ClipboardCopy size={14} />}
              {copied ? 'הועתק!' : 'שתף עם Claude'}
            </button>
          </div>
        </div>

        {/* Overall readiness */}
        {(() => {
          const overallPct = Math.round(
            COURSES.reduce((acc, c) => acc + calcCourseReadiness(c.ids), 0) / COURSES.length
          )
          return (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-5">
              <ReadinessGauge pct={overallPct} size={80} />
              <div>
                <p className="text-white font-black text-lg">מוכנות כוללת לבחינה</p>
                <p className="text-slate-400 text-sm">
                  {overallPct >= 80 ? '🏆 מוכן מצוין — אפשר להתמודד עם הבחינה!' :
                   overallPct >= 50 ? '💪 בדרך הנכונה — המשך לתרגל' :
                   '📖 עוד עבודה לפנינו — התחל מהמודולים החלשים'}
                </p>
                <p className="text-teal-400 text-xs mt-1">שלב חידון = 60% | שלבי למידה = 40%</p>
              </div>
            </div>
          )
        })()}

        {/* Course quiz grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COURSES.map(c => (
            <CourseQuizCard
              key={c.name}
              course={c}
              quizResults={quizResults}
              readinessPct={calcCourseReadiness(c.ids)}
            />
          ))}
        </div>

        {/* Weak/Strong panel */}
        <WeakStrongPanel quizResults={quizResults} />

        {/* Journal form */}
        <div className="bg-teal-950/40 border border-teal-800/30 rounded-2xl p-5">
          <p className="text-teal-400 font-bold mb-3">✏️ הוסף ליומן</p>

          {/* Type pills */}
          <div className="flex gap-2 mb-3">
            {(['question', 'insight', 'struggle'] as JournalEntryType[]).map(t => (
              <button
                key={t}
                onClick={() => setJournalType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  journalType === t
                    ? TYPE_COLORS[t] + ' border'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          <div className="relative mb-3">
            <textarea
              value={journalText}
              onChange={e => setJournalText(e.target.value)}
              placeholder={isListening ? '' : 'שאלה שנתקעת בה, תובנה, משהו שקשה... או לחץ על המיקרופון ודבר'}
              className="w-full bg-transparent text-teal-200 placeholder-teal-800 text-sm resize-none outline-none min-h-[80px] pl-16"
              dir="rtl"
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleAddJournal() }}
            />
            {interim && (
              <p className="text-teal-700 text-sm italic absolute top-0 right-0 left-16 pointer-events-none px-0 pt-0 leading-relaxed" dir="rtl">
                {journalText && !journalText.endsWith(' ') ? ' ' : ''}{interim}
              </p>
            )}
            {/* כפתורי מיקרופון + מחיקה */}
            <div className="absolute left-1 top-1 flex items-center gap-0.5">
              {journalText && (
                <button
                  onClick={() => setJournalText('')}
                  title="מחק טקסט"
                  className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <X size={13} />
                </button>
              )}
              {isSupported && (
                <button
                  onClick={() => {
                    if (isListening) {
                      stopSpeech()
                    } else {
                      startSpeech(text => setJournalText(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + text))
                    }
                  }}
                  title={isListening ? 'הפסק הקלטה' : 'הקלט קול — עברית'}
                  className={`p-1.5 rounded-lg transition-all ${
                    isListening
                      ? 'bg-red-500/30 text-red-400 animate-pulse'
                      : 'bg-teal-800/30 text-teal-600 hover:text-teal-400'
                  }`}
                >
                  {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleAddJournal}
            disabled={!journalText.trim()}
            className="bg-teal-500 hover:bg-teal-600 disabled:opacity-30 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
          >
            + הוסף רשומה
          </button>
        </div>

        {/* Journal list */}
        {journalEntries.length > 0 && (
          <div>
            {/* Filter pills */}
            <div className="flex gap-2 mb-3">
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setFilterType(opt.val)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    filterType === opt.val
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                  <span className="mr-1 text-slate-500">
                    ({opt.val === 'all'
                      ? journalEntries.length
                      : journalEntries.filter(e => e.type === opt.val).length})
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              {filtered.map(entry => (
                <JournalCard
                  key={entry.id}
                  entry={entry}
                  onDelete={() => handleDeleteEntry(entry.id)}
                />
              ))}
              {filtered.length === 0 && (
                <p className="text-slate-600 text-sm text-center py-4">אין רשומות בקטגוריה זו</p>
              )}
            </div>
          </div>
        )}

        {/* Module notes collapsible */}
        {Object.keys(notesByModule).length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-slate-400 font-bold mb-3 text-sm">📝 הערות לפי מודול</p>
            <div className="flex flex-col gap-2">
              {Object.entries(notesByModule).map(([modId, note]) => (
                <div key={modId} className="border border-white/5 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedNotes(prev => ({ ...prev, [modId]: !prev[modId] }))}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 transition-all text-right"
                  >
                    <span className="text-slate-300 text-sm font-mono">{modId}</span>
                    {expandedNotes[modId]
                      ? <ChevronUp size={14} className="text-slate-500" />
                      : <ChevronDown size={14} className="text-slate-500" />}
                  </button>
                  {expandedNotes[modId] && (
                    <div className="px-4 py-3 bg-black/20">
                      <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{note}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {Object.keys(quizResults).length === 0 && journalEntries.length === 0 && Object.keys(notesByModule).length === 0 && (
          <div className="text-center py-12 text-slate-600">
            <p className="text-4xl mb-3">📚</p>
            <p className="font-bold text-slate-500">אין נתונים עדיין</p>
            <p className="text-sm mt-1">כנס למודול, ענה על חידון, ורשום הערות — הנתונים יופיעו כאן</p>
          </div>
        )}

      </div>
    </div>
  )
}
