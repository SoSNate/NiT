import { useState, useEffect } from 'react'

export function useNotes(moduleId: string) {
  const key = `notes_${moduleId}`
  const [note, setNoteState] = useState<string>(() => {
    try { return localStorage.getItem(key) ?? '' }
    catch { return '' }
  })

  const setNote = (val: string) => {
    setNoteState(val)
    try { localStorage.setItem(key, val) } catch {}
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved !== null) setNoteState(saved)
    } catch {}
  }, [key])

  return { note, setNote }
}

export function useProgress(moduleId: string) {
  const key = `progress_${moduleId}`
  const [step, setStepState] = useState<number>(() => {
    try { return parseInt(localStorage.getItem(key) ?? '0') || 0 }
    catch { return 0 }
  })

  const setStep = (val: number) => {
    setStepState(val)
    try { localStorage.setItem(key, String(val)) } catch {}
  }

  const reset = () => setStep(0)

  return { step, setStep, reset }
}
