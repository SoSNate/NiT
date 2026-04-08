import React, { useState, useMemo } from 'react'
import { ChevronLeft, RefreshCw, Target } from 'lucide-react'
import {
  QUESTION_BANK, COURSE_LABELS, DIFFICULTY_LABELS, getTopics, queryQuestions,
  type CourseId, type Difficulty, type BankQuestion,
} from '../utils/questionBank'

interface Props { onBack: () => void }

export default function PracticeMode({ onBack }: Props) {
  const [courseId, setCourseId] = useState<CourseId | null>(null)
  const [topicId, setTopicId]   = useState<string>('')
  const [difficulty, setDiff]   = useState<Difficulty | ''>('')
  const [queue, setQueue]       = useState<BankQuestion[]>([])
  const [idx, setIdx]           = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [correct, setCorrect]   = useState(0)
  const [total, setTotal]       = useState(0)

  const topics = useMemo(() => courseId ? getTopics(courseId) : [], [courseId])

  function startPractice(cid: CourseId) {
    setCourseId(cid)
    setTopicId('')
    setDiff('')
    const qs = queryQuestions({ courseId: cid })
    setQueue(qs)
    setIdx(0)
    setSelected(null)
    setCorrect(0)
    setTotal(0)
  }

  function applyFilter(cid?: CourseId, tid?: string, dif?: Difficulty | '') {
    const c = cid ?? courseId
    if (!c) return
    const qs = queryQuestions({
      courseId: c,
      topicId: (tid ?? topicId) || undefined,
      difficulty: ((dif ?? difficulty) as Difficulty) || undefined,
    })
    setQueue(qs)
    setIdx(0)
    setSelected(null)
  }

  function answer(i: number) {
    if (selected !== null || !queue[idx]) return
    setSelected(i)
    setTotal(t => t + 1)
    if (i === queue[idx].correct) setCorrect(c => c + 1)
  }

  function next() {
    if (idx >= queue.length - 1) { applyFilter(); return }
    setIdx(i => i + 1)
    setSelected(null)
  }

  const q = queue[idx]

  if (!courseId) {
    return (
      <div className="min-h-screen p-6" dir="rtl">
        <div className="max-w-2xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
            <ChevronLeft size={18} />
            חזרה לבית
          </button>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-sm font-bold px-4 py-2 rounded-full border border-emerald-500/20 mb-4">
              <Target size={16} />
              מצב תרגול
            </div>
            <h1 className="text-3xl font-black text-white mb-2">בחר קורס לתרגול</h1>
            <p className="text-slate-400">שאלות אקראיות מהמאגר — תשובה מיידית עם הסבר</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.keys(COURSE_LABELS) as CourseId[]).map(id => {
              const count = QUESTION_BANK.filter(q => q.courseId === id).length
              return (
                <button key={id} onClick={() => startPractice(id)}
                  className="text-right p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all">
                  <p className="text-white font-bold text-lg mb-1">{COURSE_LABELS[id]}</p>
                  <p className="text-slate-500 text-sm">{count} שאלות</p>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
            <ChevronLeft size={16} />
            חזרה
          </button>
          <div className="text-center">
            <p className="text-white font-bold">{COURSE_LABELS[courseId]}</p>
            <p className="text-emerald-400 text-xs font-mono">{correct}/{total} נכון</p>
          </div>
          <button onClick={() => setCourseId(null)} className="text-slate-500 hover:text-white text-xs transition-colors">
            החלף קורס
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <select value={topicId} onChange={e => { setTopicId(e.target.value); applyFilter(undefined, e.target.value) }}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white flex-1 min-w-0">
            <option value="">כל הנושאים</option>
            {topics.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <select value={difficulty} onChange={e => { setDiff(e.target.value as Difficulty | ''); applyFilter(undefined, undefined, e.target.value as Difficulty | '') }}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white w-28">
            <option value="">כל הרמות</option>
            {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map(d => (
              <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
            ))}
          </select>
          <button onClick={() => applyFilter()} className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-slate-400 hover:text-white transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>

        {!q ? (
          <div className="text-center text-slate-400 py-20">אין שאלות בפילטר הזה</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{q.topicLabel}</span>
              <span className={`px-2 py-0.5 rounded-full font-bold ${
                q.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-400' :
                q.difficulty === 'medium' ? 'bg-yellow-500/15 text-yellow-400' :
                'bg-red-500/15 text-red-400'
              }`}>{DIFFICULTY_LABELS[q.difficulty]}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-white text-base leading-relaxed font-medium">{q.question}</p>
            </div>
            <div className="space-y-2">
              {q.options.map((opt, i) => {
                const isRight = i === q.correct
                let cls = 'w-full text-right p-3.5 rounded-xl text-sm border transition-all '
                if (selected === null) cls += 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white cursor-pointer'
                else if (isRight)      cls += 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                else if (selected===i) cls += 'bg-red-500/20 border-red-500/40 text-red-200'
                else                   cls += 'bg-white/3 border-transparent text-slate-600'
                return (
                  <button key={i} disabled={selected !== null} onClick={() => answer(i)} className={cls}>
                    <span className="text-slate-400 text-xs ml-2">{String.fromCharCode(65+i)}.</span>{opt}
                  </button>
                )
              })}
            </div>
            {selected !== null && (
              <div className={`rounded-xl p-4 text-sm leading-relaxed ${
                selected===q.correct
                  ? 'bg-emerald-900/30 border border-emerald-500/20 text-emerald-200'
                  : 'bg-amber-900/20 border border-amber-500/20 text-amber-200'
              }`}>
                <p className="font-bold mb-1">{selected===q.correct ? '✓ נכון!' : '✗ לא בדיוק'}</p>
                <p>{q.explanation}</p>
              </div>
            )}
            {selected !== null && (
              <button onClick={next} className="w-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 py-3 rounded-xl text-sm font-bold transition-all">
                {idx < queue.length-1 ? 'שאלה הבאה ▶' : 'ערבב מחדש ↺'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
