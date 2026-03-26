import React, {
  useState, useEffect, useRef,
  createContext, useContext, useCallback,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, Save, Copy, Check, Share2,
  Pencil, Trash2, X, ChevronDown, Download,
} from 'lucide-react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'

// ── Types ─────────────────────────────────────────────────────────────────────

interface JournalEntry {
  id:        string
  timestamp: string   // "14:32"
  date:      string   // "2026-03-24"
  moduleId:  string   // context label — e.g. "gauss" | "general"
  text:      string
  source:    'typed' | 'voice' | 'mixed'
}

interface JournalContextType {
  activeModuleId:    string
  setActiveModuleId: (id: string) => void
}

// ── Context ───────────────────────────────────────────────────────────────────

const JournalContext = createContext<JournalContextType>({
  activeModuleId:    'general',
  setActiveModuleId: () => {},
})

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [activeModuleId, setActiveModuleId] = useState('general')
  return (
    <JournalContext.Provider value={{ activeModuleId, setActiveModuleId }}>
      {children}
    </JournalContext.Provider>
  )
}

export function useJournal() {
  return useContext(JournalContext)
}

// ── Storage ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'nit-journal-v2'

function loadEntries(): JournalEntry[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}
function persist(entries: JournalEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

// ── Context label display ─────────────────────────────────────────────────────

const MODULE_LABELS: Record<string, string> = {
  general:      'כללי',
  coulomb:      'חוק קולון',
  gauss:        'חוק גאוס',
  efield:       'שדה חשמלי',
  potential:    'פוטנציאל',
  bfield:       'שדה מגנטי',
  induction:    'אינדוקציה',
  rlc:          'מעגלי RLC',
  emwaves:      'גלים EM',
  optics:       'אופטיקה',
  capacitors:   'קבלים',
  dc:           'מעגלי DC',
  lab:          'מעבדה',
  separable:    'הפרדת משתנים',
  homogeneous:  'הומוגנית',
  linear:       'לינארית',
  bernoulli:    'ברנולי',
  exact:        'מדויקות',
  applications: 'יישומים',
  limits:       'גבולות',
  partials:     'נגזרות חלקיות',
  optimization: 'אקסטרמום',
  double:       'אינטגרל כפול',
  line:         'אינטגרל קווי',
  surface:      'אינטגרל שטח',
  taylor:       'טיילור',
  parametric:   'פרמטרי',
  convergence:  'התכנסות',
  power:        'טורי חזקות',
  'fourier-series':    'פורייה',
  'fourier-transform': 'התמרת פורייה',
  laplace:      'לפלס',
  'z-transform':'התמרת Z',
}

function moduleLabel(id: string) {
  return MODULE_LABELS[id] ?? id
}

function moduleColor(id: string): string {
  if (id === 'general') return 'text-slate-400'
  if (['coulomb','gauss','efield','potential','bfield','induction','rlc','emwaves','optics','capacitors','dc','lab'].includes(id))
    return 'text-blue-400'
  if (['separable','homogeneous','linear','bernoulli','exact','applications'].includes(id))
    return 'text-emerald-400'
  if (['limits','partials','optimization','double','line','surface','taylor','parametric'].includes(id))
    return 'text-purple-400'
  return 'text-yellow-400'
}

// ── Export ────────────────────────────────────────────────────────────────────

function exportMD(entries: JournalEntry[]) {
  if (!entries.length) return
  const today = new Date().toISOString().slice(0, 10)
  const grouped = entries.reduce<Record<string, JournalEntry[]>>((acc, e) => {
    ;(acc[e.date] ??= []).push(e)
    return acc
  }, {})
  let md = `# NiT Learning Journal\n_exported: ${today}_\n\n`
  for (const [date, dayEntries] of Object.entries(grouped).sort().reverse()) {
    md += `## ${date}\n\n`
    for (const e of dayEntries)
      md += `### [${e.timestamp}] ${moduleLabel(e.moduleId)}\n${e.text}\n\n`
  }
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: `NiT-journal-${today}.md` })
  a.click()
  URL.revokeObjectURL(url)
}

// ── EntryCard ─────────────────────────────────────────────────────────────────

function EntryCard({
  entry, onDelete, onEdit,
}: {
  entry:    JournalEntry
  onDelete: (id: string) => void
  onEdit:   (id: string, text: string) => void
}) {
  const [editing, setEditing]     = useState(false)
  const [draft, setDraft]         = useState(entry.text)
  const [copied, setCopied]       = useState(false)
  const [shared, setShared]       = useState(false)

  function commitEdit() {
    if (draft.trim()) { onEdit(entry.id, draft.trim()); setEditing(false) }
  }

  async function copyEntry() {
    await navigator.clipboard.writeText(entry.text)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  async function shareEntry() {
    const shareText = `[${moduleLabel(entry.moduleId)} · ${entry.date} ${entry.timestamp}]\n${entry.text}`
    if (navigator.share) {
      await navigator.share({ text: shareText }).catch(() => null)
    } else {
      await navigator.clipboard.writeText(shareText)
      setShared(true); setTimeout(() => setShared(false), 1500)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-slate-800/60 rounded-2xl border border-white/8 overflow-hidden"
    >
      {/* Context strip */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-bold ${moduleColor(entry.moduleId)}`}>
            {moduleLabel(entry.moduleId)}
          </span>
          {entry.source === 'voice' && (
            <span className="text-[9px] text-slate-600 bg-white/5 px-1.5 py-0.5 rounded-full">🎙 קול</span>
          )}
          {entry.source === 'mixed' && (
            <span className="text-[9px] text-slate-600 bg-white/5 px-1.5 py-0.5 rounded-full">✏️🎙 מעורב</span>
          )}
        </div>
        <span className="text-[10px] text-slate-600 font-mono">{entry.date} {entry.timestamp}</span>
      </div>

      {/* Body */}
      <div className="px-3 pb-2">
        {editing ? (
          <textarea
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) commitEdit()
              if (e.key === 'Escape') { setEditing(false); setDraft(entry.text) }
            }}
            rows={3}
            className="w-full bg-slate-900/60 rounded-xl p-2 text-sm text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500/50 border border-white/10"
          />
        ) : (
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{entry.text}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 px-3 pb-2.5">
        {editing ? (
          <>
            <button
              onClick={commitEdit}
              className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-lg transition-colors"
            >
              <Save size={11} /> שמור
            </button>
            <button
              onClick={() => { setEditing(false); setDraft(entry.text) }}
              className="text-[11px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded-lg transition-colors"
            >
              ביטול
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              title="עריכה"
              className="p-1.5 rounded-lg text-slate-600 hover:text-cyan-400 hover:bg-white/5 transition-colors"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={copyEntry}
              title="העתק"
              className="p-1.5 rounded-lg text-slate-600 hover:text-cyan-400 hover:bg-white/5 transition-colors"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
            <button
              onClick={shareEntry}
              title="שתף"
              className="p-1.5 rounded-lg text-slate-600 hover:text-cyan-400 hover:bg-white/5 transition-colors"
            >
              {shared ? <Check size={12} className="text-emerald-400" /> : <Share2 size={12} />}
            </button>
            <button
              onClick={() => onDelete(entry.id)}
              title="מחק"
              className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-white/5 transition-colors mr-auto"
            >
              <Trash2 size={12} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function LearningJournal() {
  const { activeModuleId } = useJournal()

  const [open, setOpen]           = useState(false)
  const [text, setText]           = useState('')
  const [entries, setEntries]     = useState<JournalEntry[]>(loadEntries)
  const [filterModule, setFilter] = useState<'all' | string>('all')
  const [showFilter, setShowFilter] = useState(false)

  // Track whether any voice was used in the current draft
  const voiceUsedRef = useRef(false)
  const textRef      = useRef(text)
  useEffect(() => { textRef.current = text }, [text])

  const {
    isListening, isSupported, interim,
    start: startSpeech, stop: stopSpeech,
  } = useSpeechRecognition()

  // Auto-filter to current module when navigating
  useEffect(() => {
    if (activeModuleId !== 'general') setFilter(activeModuleId)
  }, [activeModuleId])

  // Stop mic when drawer closes
  useEffect(() => {
    if (!open && isListening) stopSpeech()
    if (!open) { setText(''); voiceUsedRef.current = false }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ──────────────────────────────────────────────────────────────

  function saveEntry() {
    const finalText = (text + (interim ? ' ' + interim : '')).trim()
    if (!finalText) return
    if (isListening) stopSpeech()

    const now = new Date()
    const source: JournalEntry['source'] =
      voiceUsedRef.current && text.trim() ? 'mixed'
      : voiceUsedRef.current ? 'voice'
      : 'typed'

    const entry: JournalEntry = {
      id:        now.getTime().toString(),
      timestamp: now.toTimeString().slice(0, 5),
      date:      now.toISOString().slice(0, 10),
      moduleId:  activeModuleId,
      text:      finalText,
      source,
    }
    const next = [entry, ...entries]
    setEntries(next); persist(next)
    setText(''); voiceUsedRef.current = false
  }

  function deleteEntry(id: string) {
    const next = entries.filter(e => e.id !== id)
    setEntries(next); persist(next)
  }

  function editEntry(id: string, newText: string) {
    const next = entries.map(e => e.id === id ? { ...e, text: newText } : e)
    setEntries(next); persist(next)
  }

  // ── Mic ──────────────────────────────────────────────────────────────────

  const toggleMic = useCallback(() => {
    if (isListening) {
      // Commit any interim text before stopping
      if (interim.trim()) {
        const c = textRef.current
        setText(c + (c && !c.endsWith(' ') ? ' ' : '') + interim.trim())
      }
      stopSpeech()
    } else {
      voiceUsedRef.current = true
      startSpeech(transcript => {
        const c = textRef.current
        setText(c + (c && !c.endsWith(' ') ? ' ' : '') + transcript)
      })
    }
  }, [isListening, interim, stopSpeech, startSpeech])

  // ── Derived ───────────────────────────────────────────────────────────────

  const displayed = filterModule === 'all'
    ? entries
    : entries.filter(e => e.moduleId === filterModule)

  const moduleIds = Array.from(new Set(entries.map(e => e.moduleId))).filter(Boolean)

  // Live display: committed text + greyed interim
  const livePreview = text + (interim ? (text && !text.endsWith(' ') ? ' ' : '') + interim : '')

  return (
    <>
      {/* ── Floating bubble ─────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`
          fixed bottom-6 left-6 z-50 w-13 h-13 min-w-[52px] min-h-[52px]
          rounded-2xl shadow-2xl flex items-center justify-center
          transition-all duration-200
          ${open
            ? 'bg-cyan-500 text-white scale-95'
            : 'bg-slate-800 border border-white/10 text-xl hover:bg-slate-700 hover:scale-105'
          }
        `}
        title="יומן למידה (הערות קוליות)"
        dir="rtl"
        style={{ width: 52, height: 52 }}
      >
        {open ? <X size={20} /> : <>
          <span className="text-lg select-none">📓</span>
          {entries.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-cyan-500 text-[9px] font-bold text-slate-950 flex items-center justify-center px-1">
              {entries.length > 99 ? '99+' : entries.length}
            </span>
          )}
        </>}
      </button>

      {/* ── Drawer ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px]"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: -380, opacity: 0 }}
              animate={{ x: 0,    opacity: 1 }}
              exit={{ x: -380,    opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed left-0 top-0 bottom-0 w-[340px] z-50 bg-slate-900 border-r border-white/10 flex flex-col shadow-2xl"
              dir="rtl"
            >

              {/* ── Header ─────────────────────────────────────────────── */}
              <div className="px-4 pt-4 pb-3 border-b border-white/8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-white font-bold text-sm flex items-center gap-2">
                      📓 יומן למידה
                      {isListening && (
                        <span className="flex items-center gap-1 text-red-400 text-[10px] font-normal animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                          מקשיב...
                        </span>
                      )}
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      הקשר נוכחי:{' '}
                      <span className={`font-semibold ${moduleColor(activeModuleId)}`}>
                        {moduleLabel(activeModuleId)}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => exportMD(entries)}
                      disabled={!entries.length}
                      title="ייצוא Markdown"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-white/5 disabled:opacity-30 transition-colors"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => setOpen(false)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Input area ─────────────────────────────────────────── */}
              <div className="p-3 border-b border-white/8 space-y-2">

                {/* Textarea with live preview */}
                <div className="relative">
                  {/* Invisible mirror for height — shows committed + interim */}
                  <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none px-3 pt-2.5 pb-8 text-sm leading-relaxed rounded-2xl whitespace-pre-wrap break-words min-h-[80px] invisible"
                  >
                    {livePreview || ' '}
                  </div>

                  <textarea
                    value={text}
                    onChange={e => { setText(e.target.value); voiceUsedRef.current = voiceUsedRef.current }  }
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) saveEntry()
                    }}
                    placeholder={isListening ? '' : 'מה קשה, תובנה, שאלה...'}
                    rows={3}
                    className="w-full bg-slate-800/70 border border-white/10 rounded-2xl px-3 pt-2.5 pb-8 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-cyan-500/50 transition-colors leading-relaxed"
                  />

                  {/* Live interim overlay — shown below committed text */}
                  {interim && (
                    <div className="absolute bottom-8 right-0 left-0 px-3 pointer-events-none">
                      <span className="text-sm text-slate-500 italic leading-relaxed">
                        {text && !text.endsWith(' ') ? ' ' : ''}{interim}
                      </span>
                    </div>
                  )}

                  {/* Bottom bar inside textarea */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    {/* Mic */}
                    {isSupported && (
                      <button
                        onClick={toggleMic}
                        title={isListening ? 'סגור מיקרופון' : 'פתח מיקרופון — תמלול חי'}
                        className={`
                          flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all
                          ${isListening
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-white/5 text-slate-500 hover:text-cyan-400 hover:bg-white/10 border border-transparent'
                          }
                        `}
                      >
                        {isListening
                          ? <><MicOff size={12} /> עצור</>
                          : <><Mic size={12} /> הקלט</>
                        }
                      </button>
                    )}

                    {/* Char count / hint */}
                    <span className="text-[10px] text-slate-600 select-none">
                      {text.trim() || interim.trim() ? `⌘↵ שמור` : ''}
                    </span>
                  </div>
                </div>

                {/* Save button */}
                <button
                  onClick={saveEntry}
                  disabled={!text.trim() && !interim.trim()}
                  className="w-full py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 text-sm font-semibold hover:bg-cyan-500/25 disabled:opacity-30 transition-colors"
                >
                  שמור הערה
                </button>
              </div>

              {/* ── Filter bar ─────────────────────────────────────────── */}
              {moduleIds.length > 1 && (
                <div className="border-b border-white/8">
                  <button
                    onClick={() => setShowFilter(f => !f)}
                    className="w-full flex items-center justify-between px-4 py-2 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <span>
                      סינון:{' '}
                      <span className={`font-bold ${filterModule === 'all' ? 'text-slate-400' : moduleColor(filterModule)}`}>
                        {filterModule === 'all' ? 'הכל' : moduleLabel(filterModule)}
                      </span>
                      {' '}({displayed.length})
                    </span>
                    <ChevronDown size={13} className={`transition-transform ${showFilter ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showFilter && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
                          <button
                            onClick={() => { setFilter('all'); setShowFilter(false) }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              filterModule === 'all'
                                ? 'bg-slate-600 text-white'
                                : 'bg-white/5 text-slate-500 hover:bg-white/10'
                            }`}
                          >
                            הכל ({entries.length})
                          </button>
                          {moduleIds.map(id => (
                            <button
                              key={id}
                              onClick={() => { setFilter(id); setShowFilter(false) }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                filterModule === id
                                  ? 'bg-cyan-500 text-white'
                                  : 'bg-white/5 text-slate-500 hover:bg-white/10'
                              }`}
                            >
                              {moduleLabel(id)} ({entries.filter(e => e.moduleId === id).length})
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ── Entries list ───────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                {displayed.length === 0 && (
                  <p className="text-slate-600 text-xs text-center mt-10 select-none">
                    {filterModule === 'all' ? 'אין הערות עדיין' : `אין הערות על ${moduleLabel(filterModule)}`}
                  </p>
                )}
                <AnimatePresence initial={false}>
                  {displayed.map(entry => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      onDelete={deleteEntry}
                      onEdit={editEntry}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* ── Footer ─────────────────────────────────────────────── */}
              {entries.length > 0 && (
                <div className="px-4 py-3 border-t border-white/8 flex items-center justify-between">
                  <span className="text-[11px] text-slate-600">{entries.length} הערות</span>
                  <button
                    onClick={() => { setEntries([]); persist([]) }}
                    className="text-[11px] text-slate-600 hover:text-red-400 transition-colors"
                  >
                    נקה הכל
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
