import { useState, useRef, useCallback } from 'react'

// TypeScript doesn't include SpeechRecognition in its default lib — cast via any
/* eslint-disable @typescript-eslint/no-explicit-any */
type SpeechRecognitionInstance = any
type SpeechRecognitionResultEvent = any

interface UseSpeechRecognitionResult {
  isListening: boolean
  isSupported: boolean
  start: (onTranscript: (text: string) => void) => void
  stop: () => void
}

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance>(null)
  // tracks whether the user intentionally stopped — prevents auto-restart after manual stop
  const shouldListenRef = useRef(false)
  // stable ref to current onTranscript callback so auto-restart uses latest version
  const onTranscriptRef = useRef<((text: string) => void) | null>(null)

  const getAPI = (): (new () => SpeechRecognitionInstance) | undefined => {
    if (typeof window === 'undefined') return undefined
    return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
  }

  const isSupported = !!getAPI()

  const createAndStart = useCallback(() => {
    const API = getAPI()
    if (!API) return

    // Always destroy previous instance before creating a new one
    if (recognitionRef.current) {
      recognitionRef.current.onend = null
      recognitionRef.current.onerror = null
      recognitionRef.current.onresult = null
      try { recognitionRef.current.stop() } catch (_) { /* ignore */ }
      recognitionRef.current = null
    }

    const recognition: SpeechRecognitionInstance = new API()
    recognition.lang = 'he-IL'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      // Only use FINAL results — interim results are cumulative and cause tripling
      // when appended repeatedly to the same textarea
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          onTranscriptRef.current?.(event.results[i][0].transcript as string)
        }
      }
    }

    recognition.onend = () => {
      // Auto-restart if the browser stopped us (e.g. silence timeout) but user didn't press stop
      if (shouldListenRef.current) {
        try { recognition.start() } catch (_) { /* ignore race condition */ }
      } else {
        setIsListening(false)
      }
    }

    recognition.onerror = (event: any) => {
      // 'no-speech' is a normal silence timeout — restart
      if (shouldListenRef.current && event.error === 'no-speech') return
      shouldListenRef.current = false
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [])

  const start = useCallback((onTranscript: (text: string) => void) => {
    onTranscriptRef.current = onTranscript
    shouldListenRef.current = true
    createAndStart()
  }, [createAndStart])

  const stop = useCallback(() => {
    shouldListenRef.current = false
    onTranscriptRef.current = null
    if (recognitionRef.current) {
      recognitionRef.current.onend = null
      recognitionRef.current.onerror = null
      try { recognitionRef.current.stop() } catch (_) { /* ignore */ }
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  return { isListening, isSupported, start, stop }
}
