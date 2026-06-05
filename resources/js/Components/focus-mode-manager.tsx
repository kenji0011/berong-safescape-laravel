import React, { useState, useEffect, useRef } from "react"
import { usePage } from "@inertiajs/react"
import { Shield, Volume2, VolumeX, Sun, Moon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useSettings } from "@/lib/settings-context"

export function FocusModeManager() {
  const { url } = usePage()
  const { isDarkMode, toggleDarkMode } = useSettings()

  // Focus state variables
  const [showModeSelectionModal, setShowModeSelectionModal] = useState(false)
  const [hasSelectedMode, setHasSelectedMode] = useState(false)
  const [selectedMode, setSelectedMode] = useState<"standard" | "focus" | null>(null)
  const [moduleFocusMode, setModuleFocusMode] = useState(false)
  const [ambientSoundPlaying, setAmbientSoundPlaying] = useState(false)
  const [showDNDNotification, setShowDNDNotification] = useState(false)

  // Sync moduleFocusMode class on html tag
  useEffect(() => {
    const root = document.documentElement
    if (moduleFocusMode) {
      root.classList.add("module-focus-mode")
    } else {
      root.classList.remove("module-focus-mode")
    }
    return () => {
      root.classList.remove("module-focus-mode")
    }
  }, [moduleFocusMode])

  const audioContextRef = useRef<AudioContext | null>(null)
  const brownNoiseRef = useRef<AudioBufferSourceNode | null>(null)

  const isModulePage = /^\/kids\/safescape\/\d+$/.test(url)

  // 1. Manage navigation reset & initial prompt
  useEffect(() => {
    if (isModulePage) {
      // If they just entered a module page and haven't selected a mode yet
      const saved = sessionStorage.getItem("safescape_selected_mode")
      if (saved) {
        setHasSelectedMode(true)
        setSelectedMode(saved as any)
        setModuleFocusMode(saved === "focus")
        setShowModeSelectionModal(false)
        
        if (saved === "focus") {
          // Attempt fullscreen play
          const timer = setTimeout(() => {
            enterFullscreen()
          }, 1000)
          return () => clearTimeout(timer)
        }
      } else {
        if (!hasSelectedMode) {
          setShowModeSelectionModal(true)
        }
      }
    } else {
      // Navigated OUT of modules
      setHasSelectedMode(false)
      setSelectedMode(null)
      setShowModeSelectionModal(false)
      setModuleFocusMode(false)
      sessionStorage.removeItem("safescape_selected_mode")
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      }
      // Stop sound
      if (brownNoiseRef.current) {
        try { brownNoiseRef.current.stop() } catch {}
        brownNoiseRef.current.disconnect()
        brownNoiseRef.current = null
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close() } catch {}
        audioContextRef.current = null
      }
      setAmbientSoundPlaying(false)
    }
  }, [url, isModulePage])



  // 3. Audio cleanup on unmount
  useEffect(() => {
    return () => {
      if (brownNoiseRef.current) {
        try { brownNoiseRef.current.stop() } catch {}
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close() } catch {}
      }
    }
  }, [])

  // Fullscreen support
  const enterFullscreen = () => {
    const docEl = document.documentElement
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen().catch(() => {})
    }
  }

  const exitFullscreen = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {})
    }
  }

  // Ambient brown noise generator
  const startAmbientSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return
      
      const audioCtx = new AudioContextClass()
      audioContextRef.current = audioCtx
      
      const bufferSize = 2 * audioCtx.sampleRate
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      
      let lastOut = 0.0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        output[i] = (lastOut + (0.02 * white)) / 1.02
        lastOut = output[i]
        output[i] *= 3.5
      }
      
      const source = audioCtx.createBufferSource()
      source.buffer = noiseBuffer
      source.loop = true
      
      const filter = audioCtx.createBiquadFilter()
      filter.type = "lowpass"
      filter.frequency.value = 550
      
      const gainNode = audioCtx.createGain()
      gainNode.gain.value = 0.15
      
      source.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      
      source.start(0)
      brownNoiseRef.current = source
      setAmbientSoundPlaying(true)
    } catch (e) {
      console.error("Ambient noise failed:", e)
    }
  }

  const stopAmbientSound = () => {
    if (brownNoiseRef.current) {
      try { brownNoiseRef.current.stop() } catch {}
      brownNoiseRef.current.disconnect()
      brownNoiseRef.current = null
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close() } catch {}
      audioContextRef.current = null
    }
    setAmbientSoundPlaying(false)
  }

  const toggleAmbientSound = () => {
    if (ambientSoundPlaying) {
      stopAmbientSound()
    } else {
      startAmbientSound()
    }
  }

  const selectStandardMode = () => {
    setModuleFocusMode(false)
    setHasSelectedMode(true)
    setShowModeSelectionModal(false)
    sessionStorage.setItem("safescape_selected_mode", "standard")
    exitFullscreen()
    stopAmbientSound()
  }

  const selectFocusMode = () => {
    setModuleFocusMode(true)
    setHasSelectedMode(true)
    setShowModeSelectionModal(false)
    sessionStorage.setItem("safescape_selected_mode", "focus")
    enterFullscreen()
    setShowDNDNotification(true)
    setTimeout(() => {
      setShowDNDNotification(false)
    }, 8000)
  }

  const handleProceed = () => {
    if (selectedMode === "standard") {
      selectStandardMode()
    } else if (selectedMode === "focus") {
      selectFocusMode()
    }
  }

  return (
    <>


      {/* Mode Selection Modal */}
      {showModeSelectionModal && (
        <div className="fixed inset-0 z-[250] bg-slate-950/80 backdrop-blur-md overflow-y-auto flex items-start justify-center p-4 py-8 sm:py-12 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border-[3px] sm:border-[4px] border-blue-200 dark:border-slate-800 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-10 max-w-3xl w-full text-center shadow-2xl animate-in zoom-in-95 duration-300 my-auto">
            <div className="inline-flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-2xl border-2 border-blue-200 dark:border-blue-800 mb-4 sm:mb-6">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-[#ff4b3e]" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white mb-2 leading-none uppercase tracking-tight">
              Prepare Your Mission
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-base mb-6 sm:mb-8 max-w-md mx-auto">
              Choose how you would like to complete your fire safety training module today.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Standard Mode Card */}
              <button
                onClick={() => setSelectedMode("standard")}
                className={cn(
                  "group text-left p-4 sm:p-6 rounded-[1.5rem] sm:rounded-3xl border-3 transition-all duration-300 flex flex-col justify-start min-h-[160px] sm:h-auto h-full relative overflow-hidden",
                  selectedMode === "standard"
                    ? "border-blue-500 dark:border-blue-400 bg-blue-50/10 dark:bg-blue-950/20 ring-4 ring-blue-500/20 shadow-md"
                    : "border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950/40 opacity-75 hover:opacity-100"
                )}
              >
                <div>
                  <div className="mb-2 sm:mb-3 flex items-center justify-between flex-wrap gap-2">
                    <img src="/standard.png" alt="Standard Mode" className="h-8 w-8 sm:h-10 sm:w-10 object-contain rounded-xl" />
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded-full px-2 py-0.5 text-[8px] sm:text-[9px] font-black tracking-widest uppercase">
                      Classic Layout
                    </span>
                  </div>
                  <h3 className={cn(
                    "text-base sm:text-lg font-black transition-colors",
                    selectedMode === "standard" ? "text-blue-500 dark:text-blue-400" : "text-slate-800 dark:text-white"
                  )}>
                    Standard Mode
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mt-1 sm:mt-1.5">
                    Enjoy the classic experience with complete layouts, animations, visual cues, and dashboard panels.
                  </p>
                </div>
              </button>
              
              {/* Focus Mode Card */}
              <button
                onClick={() => setSelectedMode("focus")}
                className={cn(
                  "group text-left p-4 sm:p-6 rounded-[1.5rem] sm:rounded-3xl border-3 transition-all duration-300 flex flex-col justify-start min-h-[160px] sm:h-auto h-full relative overflow-hidden",
                  selectedMode === "focus"
                    ? "border-[#ff4b3e] bg-orange-50/10 dark:bg-orange-950/20 ring-4 ring-[#ff4b3e]/20 shadow-md"
                    : "border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950/40 opacity-75 hover:opacity-100"
                )}
              >
                <div>
                  <div className="mb-2 sm:mb-3 flex items-center justify-between flex-wrap gap-2">
                    <img src="/focus.png" alt="Focus Mode" className="h-8 w-8 sm:h-10 sm:w-10 object-contain rounded-xl" />
                    <span className="bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-full px-2 py-0.5 text-[8px] sm:text-[9px] font-black tracking-widest uppercase">
                      Highly Recommended
                    </span>
                  </div>
                  <h3 className={cn(
                    "text-base sm:text-lg font-black transition-colors",
                    selectedMode === "focus" ? "text-[#ff4b3e]" : "text-slate-800 dark:text-white"
                  )}>
                    Focus Mode
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mt-1 sm:mt-1.5">
                    Concentration-friendly immersion. Hides distractions, turns on Fullscreen, blocks notifications, and includes soft ambient sounds!
                  </p>
                </div>
              </button>
            </div>

            {/* Proceed Action Button */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                disabled={!selectedMode}
                onClick={handleProceed}
                className={cn(
                  "w-full py-3.5 sm:py-4 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2",
                  selectedMode
                    ? "bg-[#ff4b3e] hover:bg-[#e03a2f] text-white shadow-lg shadow-red-500/25 cursor-pointer hover:shadow-xl hover:-translate-y-0.5"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                )}
              >
                {selectedMode === "focus" ? "Start Focus Mission" : "Start Standard Mission"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Focus Control Panel */}
      {moduleFocusMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[40] flex items-center gap-4 sm:gap-6 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-[0_15px_35px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] px-5 sm:px-8 py-3.5 sm:py-4 rounded-2xl sm:rounded-3xl max-w-[95vw] text-slate-800 dark:text-white animate-in slide-in-from-bottom-6 duration-300 transition-all duration-300">
          <div className="flex items-center gap-1.5 sm:gap-2 pr-4 sm:pr-5 border-r border-slate-200 dark:border-slate-800">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Focus Mode</span>
          </div>
          
          {/* Sound Toggle */}
          <button
            onClick={toggleAmbientSound}
            title="Toggle Brown Noise Ambient Sound"
            className={cn(
              "p-1.5 sm:p-2 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-black uppercase tracking-wider",
              ambientSoundPlaying 
                ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-white/5" 
                : "text-slate-600 dark:text-slate-300"
            )}
          >
            {ambientSoundPlaying ? <Volume2 className="h-3.5 sm:h-4 w-3.5 sm:w-4" /> : <VolumeX className="h-3.5 sm:h-4 w-3.5 sm:w-4" />}
            <span className="hidden sm:inline">Ambient Audio</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title="Toggle Theme"
            className={cn(
              "p-1.5 sm:p-2 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-black uppercase tracking-wider",
              isDarkMode
                ? "text-purple-400 bg-white/5"
                : "text-slate-600"
            )}
          >
            {isDarkMode ? <Sun className="h-3.5 sm:h-4 w-3.5 sm:w-4" /> : <Moon className="h-3.5 sm:h-4 w-3.5 sm:w-4" />}
            <span className="hidden sm:inline">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>

          {/* Exit Focus Mode */}
          <button
            onClick={selectStandardMode}
            className="bg-red-500 hover:bg-red-600 text-white text-[10px] sm:text-xs font-black px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl shadow-md transition-all active:scale-[0.96] uppercase tracking-wider shrink-0"
          >
            Exit
          </button>
        </div>
      )}

      {/* Slide-in DND Notification */}
      <AnimatePresence>
        {showDNDNotification && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:top-8 sm:right-8 z-[250] w-[90vw] max-w-[340px] sm:w-[420px] sm:max-w-none bg-white/95 dark:bg-slate-950/95 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-800 dark:text-white"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white rounded-xl border border-emerald-200 dark:border-slate-800 flex items-center justify-center shrink-0">
                <img src="/berong_pr.png" alt="Berong" className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 leading-tight">Focus Protocol Active</h4>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-300 font-bold leading-normal mt-0.5">Do Not Disturb mode initialized.</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3.5">
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>🔇 All Notification previews</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black">MUTED</span>
              </div>
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>🖥️ Layout Immersion</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black">FULLSCREEN</span>
              </div>
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>🧭 Dashboard Widgets</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black">HIDDEN</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
