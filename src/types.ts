import React from 'react'

// ── Shared types for all modules ──────────────────────────────────────────────

export interface QuizQuestion {
  question: string
  options: string[]
  correct: number      // 0-indexed
  explanation: string
}

export interface GuideSection {
  title: string
  content: React.ReactNode
}

export interface ModuleProps {
  onBack: () => void
}

// ── Module registry ───────────────────────────────────────────────────────────

export interface ModuleMeta {
  id: string
  title: string
  subtitle: string
  icon: string         // emoji
  examFreq: string     // "כל מבחן" | "כמעט כל מבחן" | ...
  color: string        // tailwind gradient class
  border: string       // tailwind border class
  Component: React.FC<ModuleProps>
  level?: 'foundation' | 'core' | 'advanced'  // difficulty level
}

export interface CourseMeta {
  id: string
  title: string
  subtitle: string
  icon: string         // emoji
  color: string
  borderColor: string
  available: boolean
  examDate?: string
  modules: ModuleMeta[]
}

// ── Learning Profile types ─────────────────────────────────────────────────

export interface QuizResult {
  score: number           // correct answers, 0–3
  total: number           // always 3 in current structure
  timestamp: string       // ISO 8601
  wrongIndexes: number[]  // 0-indexed question positions that were wrong
}

export type JournalEntryType = 'question' | 'insight' | 'struggle'

export interface JournalEntry {
  id: string
  date: string            // ISO 8601
  text: string
  moduleId?: string       // undefined = global entry from dashboard
  type: JournalEntryType
}

export type QuizResultMap = Record<string, QuizResult>
