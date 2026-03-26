import { useState, useRef, useCallback } from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any */
type SpeechRecognitionInstance = any
type SpeechRecognitionResultEvent = any

interface UseSpeechRecognitionResult {
  isListening: boolean
  isSupported: boolean
  /** Interim (live) transcript — updates in real-time as the user speaks */
  interim: string
  /** Start listening. onFinal fires whenever a sentence is committed (final result). */
  start: (onFinal: (text: string) => void) => void
  stop: () => void
}

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const [isListening, setIsListening]   = useState(false)
  const [interim, setInterim]           = useState('')
  const recognitionRef                  = useRef<SpeechRecognitionInstance>(null)
  const shouldListenRef                 = useRef(false)
  const onFinalRef                      = useRef<((text: string) => void) | null>(null)
  const createAndStartRef               = useRef<() => void>(() => {})

  const getAPI = (): (new () => SpeechRecognitionInstance) | undefined => {
    if (typeof window === 'undefined') return undefined
    return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
  }

  const isSupported = !!getAPI()

  const createAndStart = useCallback(() => {
    const API = getAPI()
    if (!API) return

    // Destroy previous instance cleanly
    if (recognitionRef.current) {
      recognitionRef.current.onend    = null
      recognitionRef.current.onerror  = null
      recognitionRef.current.onresult = null
      try { recognitionRef.current.stop() } catch (_) { /* ignore */ }
      recognitionRef.current = null
    }

    const recognition: SpeechRecognitionInstance = new API()
    recognition.lang            = 'he-IL'
    recognition.continuous      = true
    recognition.interimResults  = true   // ← ON: we need live updates

    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      let interimText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          // Committed sentence → fire callback + clear interim
          const committed = result[0].transcript as string
          onFinalRef.current?.(committed)
          setInterim('')
        } else {
          // Live in-progress text — accumulate for display only
          interimText += result[0].transcript as string
        }
      }

      if (interimText) setInterim(interimText)
    }

    recognition.onend = () => {
      setInterim('')
      if (shouldListenRef.current) {
        // Browser stopped due to silence — restart with fresh instance
        createAndStartRef.current()
      } else {
        setIsListening(false)
      }
    }

    recognition.onerror = (event: any) => {
      setInterim('')
      if (shouldListenRef.current && event.error === 'no-speech') {
        createAndStartRef.current()
        return
      }
      shouldListenRef.current = false
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [])

  createAndStartRef.current = createAndStart

  const start = useCallback((onFinal: (text: string) => void) => {
    onFinalRef.current    = onFinal
    shouldListenRef.current = true
    createAndStart()
  }, [createAndStart])

  const stop = useCallback(() => {
    shouldListenRef.current = false
    onFinalRef.current      = null
    setInterim('')
    if (recognitionRef.current) {
      recognitionRef.current.onend   = null
      recognitionRef.current.onerror = null
      try { recognitionRef.current.stop() } catch (_) { /* ignore */ }
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  return { isListening, isSupported, interim, start, stop }
}
