import React, { useState, useEffect, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Types ────────────────────────────────────────────────────────────────────
interface JournalEntry {
  id: string
  timestamp: string        // e.g. "14:32"
  date: string             // e.g. "2026-03-24"
  moduleId: string
  text: string
}

interface JournalContextType {
  activeModuleId: string
  setActiveModuleId: (id: string) => void
}

// ── Context ──────────────────────────────────────────────────────────────────
const JournalContext = createContext<JournalContextType>({
  activeModuleId: 'general',
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

// ── Storage helpers ───────────────────────────────────────────────────────────
const STORAGE_KEY = 'nit-journal-v1'

function loadEntries(): JournalEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveEntries(entries: JournalEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

// ── Export to MD ──────────────────────────────────────────────────────────────
function exportToMarkdown(entries: JournalEntry[]) {
  if (entries.length === 0) return

  const today = new Date().toISOString().slice(0, 10)
  const grouped = entries.reduce<Record<string, JournalEntry[]>>((acc, e) => {
    const key = e.date
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  let md = `# NiT Learning Journal\n_exported: ${today}_\n\n`
  for (const [date, dayEntries] of Object.entries(grouped).sort().reverse()) {
    md += `## ${date}\n\n`
    for (const entry of dayEntries) {
      md += `### [${entry.timestamp}] ${entry.moduleId}\n${entry.text}\n\n`
    }
  }

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `NiT-journal-${today}.md`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LearningJournal() {
  const { activeModuleId } = useJournal()
  const [open, setOpen]     = useState(false)
  const [text, setText]     = useState('')
  const [entries, setEntries] = useState<JournalEntry[]>(loadEntries)

  useEffect(() => {
    if (!open) setText('')
  }, [open])

  function saveEntry() {
    if (!text.trim()) return
    const now = new Date()
    const entry: JournalEntry = {
      id:        now.getTime().toString(),
      timestamp: now.toTimeString().slice(0, 5),
      date:      now.toISOString().slice(0, 10),
      moduleId:  activeModuleId,
      text:      text.trim(),
    }
    const next = [entry, ...entries]
    setEntries(next)
    saveEntries(next)
    setText('')
  }

  function deleteEntry(id: string) {
    const next = entries.filter(e => e.id !== id)
    setEntries(next)
    saveEntries(next)
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-2xl bg-slate-800 border border-white/10 shadow-2xl flex items-center justify-center text-xl hover:bg-slate-700 transition-colors"
        title="יומן למידה"
        dir="rtl"
      >
        📓
        {entries.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-[9px] font-bold text-slate-950 flex items-center justify-center">
            {entries.length > 9 ? '9+' : entries.length}
          </span>
        )}
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: -360, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -360, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="fixed left-0 top-0 bottom-0 w-80 z-50 bg-slate-900 border-r border-white/10 flex flex-col shadow-2xl"
              dir="rtl"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-white font-bold text-sm">📓 יומן למידה</h2>
                  <p className="text-slate-500 text-xs mt-0.5">
                    מודול: <span className="text-cyan-400">{activeModuleId}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => exportToMarkdown(entries)}
                    disabled={entries.length === 0}
                    className="px-2 py-1 text-xs rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-30 transition-colors"
                  >
                    ייצא MD
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-slate-500 hover:text-white transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Input area */}
              <div className="p-4 border-b border-white/10">
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="מה קשה, לא מובן, או שיש באג?..."
                  rows={4}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                <button
                  onClick={saveEntry}
                  disabled={!text.trim()}
                  className="mt-2 w-full py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-sm font-semibold hover:bg-cyan-500/25 disabled:opacity-30 transition-colors"
                >
                  שמור הערה
                </button>
              </div>

              {/* Entries list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {entries.length === 0 && (
                  <p className="text-slate-600 text-xs text-center mt-8">אין הערות עדיין</p>
                )}
                {entries.map(entry => (
                  <div key={entry.id}
                    className="bg-slate-800/50 rounded-xl p-3 border border-white/5 group relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-cyan-400 font-mono">{entry.moduleId}</span>
                      <span className="text-[10px] text-slate-600">{entry.date} {entry.timestamp}</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">{entry.text}</p>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 text-xs transition-all"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {entries.length > 0 && (
                <div className="p-3 border-t border-white/10">
                  <button
                    onClick={() => { setEntries([]); saveEntries([]) }}
                    className="text-xs text-slate-600 hover:text-red-400 transition-colors w-full text-center"
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
