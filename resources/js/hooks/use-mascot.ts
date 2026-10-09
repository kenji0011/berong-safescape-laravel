import { useState, useEffect, useCallback, useRef } from 'react'

export type MascotMood = 
  | 'idle' 
  | 'happy' 
  | 'celebrate' 
  | 'thinking' 
  | 'sleeping' 
  | 'alert' 
  | 'wave' 
  | 'sad'

export interface MascotState {
  mood: MascotMood
  speechText: string | null
  isSleeping: boolean
  isThinking: boolean
  isHovered: boolean
  cursorVector: { x: number; y: number } // Normalized -1 to 1 vector from mascot to cursor
}

// Global state store for singleton synchronization
type Listener = () => void
let currentMood: MascotMood = 'idle'
let currentSpeech: string | null = null
let currentIsSleeping = false
let currentIsThinking = false
let currentIsHovered = false
let currentCursorVector = { x: 0, y: 0 }
let moodTimeout: ReturnType<typeof setTimeout> | null = null
let speechTimeout: ReturnType<typeof setTimeout> | null = null
let idleTimer: ReturnType<typeof setTimeout> | null = null

const listeners = new Set<Listener>()

function notifyListeners() {
  listeners.forEach(listener => listener())
}

export function setMascotMood(mood: MascotMood, duration = 3500) {
  if (moodTimeout) clearTimeout(moodTimeout)
  currentMood = mood
  if (mood === 'sleeping') {
    currentIsSleeping = true
  } else {
    currentIsSleeping = false
  }
  notifyListeners()

  if (duration > 0 && mood !== 'idle') {
    moodTimeout = setTimeout(() => {
      currentMood = 'idle'
      currentIsSleeping = false
      notifyListeners()
    }, duration)
  }
}

export function setMascotSpeech(text: string | null, duration = 4000) {
  if (speechTimeout) clearTimeout(speechTimeout)
  currentSpeech = text
  notifyListeners()

  if (text && duration > 0) {
    speechTimeout = setTimeout(() => {
      currentSpeech = null
      notifyListeners()
    }, duration)
  }
}

export function triggerMascotCelebrate(message?: string, duration = 4000) {
  setMascotMood('celebrate', duration)
  if (message) {
    setMascotSpeech(message, duration)
  }
}

export function triggerMascotSay(message: string, duration = 4000) {
  setMascotSpeech(message, duration)
}

export function triggerMascotThinking(active: boolean, thoughtMessage?: string) {
  currentIsThinking = active
  if (active) {
    setMascotMood('thinking', 0)
    if (thoughtMessage) setMascotSpeech(thoughtMessage, 0)
  } else {
    setMascotMood('idle', 0)
    setMascotSpeech(null, 0)
  }
  notifyListeners()
}

export function triggerMascotWakeUp() {
  if (currentIsSleeping) {
    currentIsSleeping = false
    currentMood = 'wave'
    notifyListeners()
    setTimeout(() => {
      currentMood = 'idle'
      notifyListeners()
    }, 2000)
  }
}

/**
 * Custom hook to control and subscribe to the Berong interactive mascot.
 */
export function useMascot() {
  const [, setTick] = useState(0)

  useEffect(() => {
    const handleChange = () => setTick(t => t + 1)
    listeners.add(handleChange)
    return () => {
      listeners.delete(handleChange)
    }
  }, [])

  // Listen to global DOM CustomEvents
  useEffect(() => {
    const handleCelebrateEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string; duration?: number }>
      triggerMascotCelebrate(customEvent.detail?.message, customEvent.detail?.duration)
    }

    const handleSayEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; duration?: number }>
      if (customEvent.detail?.message) {
        triggerMascotSay(customEvent.detail.message, customEvent.detail?.duration)
      }
    }

    const handleMoodEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ mood: MascotMood; duration?: number }>
      if (customEvent.detail?.mood) {
        setMascotMood(customEvent.detail.mood, customEvent.detail?.duration)
      }
    }

    window.addEventListener('safescape:mascot-celebrate', handleCelebrateEvent)
    window.addEventListener('safescape:mascot-say', handleSayEvent)
    window.addEventListener('safescape:mascot-mood', handleMoodEvent)

    return () => {
      window.removeEventListener('safescape:mascot-celebrate', handleCelebrateEvent)
      window.removeEventListener('safescape:mascot-say', handleSayEvent)
      window.removeEventListener('safescape:mascot-mood', handleMoodEvent)
    }
  }, [])

  // Inactivity / Idle Timer: enters sleeping state after 35s of inactivity
  useEffect(() => {
    const resetIdleTimer = () => {
      if (currentIsSleeping) {
        triggerMascotWakeUp()
      }

      if (idleTimer) clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        // Only sleep if in idle mood and not hovered or thinking
        if (currentMood === 'idle' && !currentIsHovered && !currentIsThinking) {
          currentIsSleeping = true
          currentMood = 'sleeping'
          notifyListeners()
        }
      }, 35000) // 35 seconds of inactivity
    }

    window.addEventListener('mousemove', resetIdleTimer, { passive: true })
    window.addEventListener('keydown', resetIdleTimer, { passive: true })
    window.addEventListener('touchstart', resetIdleTimer, { passive: true })
    window.addEventListener('scroll', resetIdleTimer, { passive: true })

    resetIdleTimer()

    return () => {
      if (idleTimer) clearTimeout(idleTimer)
      window.removeEventListener('mousemove', resetIdleTimer)
      window.removeEventListener('keydown', resetIdleTimer)
      window.removeEventListener('touchstart', resetIdleTimer)
      window.removeEventListener('scroll', resetIdleTimer)
    }
  }, [])

  const celebrate = useCallback((message?: string, duration?: number) => {
    triggerMascotCelebrate(message, duration)
  }, [])

  const say = useCallback((message: string, duration?: number) => {
    triggerMascotSay(message, duration)
  }, [])

  const react = useCallback((mood: MascotMood, duration?: number) => {
    setMascotMood(mood, duration)
  }, [])

  const thinking = useCallback((active: boolean, message?: string) => {
    triggerMascotThinking(active, message)
  }, [])

  const wakeUp = useCallback(() => {
    triggerMascotWakeUp()
  }, [])

  const setHovered = useCallback((hovered: boolean) => {
    currentIsHovered = hovered
    notifyListeners()
  }, [])

  const updateCursorVector = useCallback((vector: { x: number; y: number }) => {
    currentCursorVector = vector
    notifyListeners()
  }, [])

  return {
    mood: currentMood,
    speechText: currentSpeech,
    isSleeping: currentIsSleeping,
    isThinking: currentIsThinking,
    isHovered: currentIsHovered,
    cursorVector: currentCursorVector,
    celebrate,
    say,
    react,
    thinking,
    wakeUp,
    setHovered,
    updateCursorVector,
  }
}
