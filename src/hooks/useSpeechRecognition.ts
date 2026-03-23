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

  const getAPI = (): (new () => SpeechRecognitionInstance) | undefined => {
    if (typeof window === 'undefined') return undefined
    return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
  }

  const isSupported = !!getAPI()

  const start = useCallback((onTranscript: (text: string) => void) => {
    const API = getAPI()
    if (!API) return

    const recognition: SpeechRecognitionInstance = new API()
    recognition.lang = 'he-IL'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      // Only use FINAL results — interim results are cumulative and cause tripling
      // when appended repeatedly to the same textarea
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          onTranscript(event.results[i][0].transcript as string)
        }
      }
    }

    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, []) // getAPI is stable (pure function)

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return { isListening, isSupported, start, stop }
}
