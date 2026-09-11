import React, { useMemo, useEffect, useState } from "react"
import { Link, Deferred, router } from '@inertiajs/react'
import { ArrowLeft, ArrowRight, BookOpen, Trophy, Shield, CheckCircle, Lock, Flame, ChevronRight, ClipboardCheck } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { playSound } from '@/lib/audio'
import DashboardLayout from "@/Layouts/DashboardLayout"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ModuleData {
  id: number
  title: string
  description: string
  dayNumber: number
  isCompleted: boolean
  isLocked: boolean
  progress: number
  gameLabel?: string
  gameIcon?: string
  recommendedAction?: string | null
}

interface CourseHubProps {
  initialModules?: ModuleData[]
}

// Static metadata per module (game names, icons, badges) since these are hardcoded per module
const MODULE_META: Record<number, { title: string; gameIcon: string; gameLabel: string; bgImage: string; description: string; badge: { name: string; image: string } }> = {
  1: { 
    title: "Fire is a Tool, Not a Toy",
    gameIcon: "🎮", 
    gameLabel: "Element Mixer Lab", 
    bgImage: "/images/kids/module1.webp", 
    description: "Learn what fire needs to burn with the Fire Triangle. Understand why matches and lighters are tools for grown-ups only.",
    badge: { name: "Fire Triangle", image: "/badges/fire_hall.webp?v=2" } 
  },
  2: { 
    title: "The School Drill",
    gameIcon: "🎵", 
    gameLabel: "Rhythm Marshal Game", 
    bgImage: "/images/kids/module2.webp", 
    description: "Master the fire drill! Learn to recognize alarms, find the Red Box, and lead your classmates to safety.",
    badge: { name: "Safety Leader", image: "/badges/shield_hall.webp?v=2" } 
  },
  3: { 
    title: "The Escape Plan",
    gameIcon: "🌫️", 
    gameLabel: "Smoke Labyrinth Game", 
    bgImage: "/images/kids/module3.webp", 
    description: "Create your family escape plan with two ways out. Learn to check doors and find your meeting spot.",
    badge: { name: "Plan Master", image: "/badges/plan_hall.webp?v=2" } 
  },
  4: { 
    title: "Get Low and Go!",
    gameIcon: "☁️", 
    gameLabel: "Smoke Physics", 
    bgImage: "/images/kids/module4.webp", 
    description: "Discover why smoke is dangerous and learn the life-saving crawling technique to escape safely.",
    badge: { name: "Low & Go!", image: "/badges/low_hall.webp?v=2" } 
  },
  5: { 
    title: "The Ultimate Defense",
    gameIcon: "🌟", 
    gameLabel: "Hero Certificate", 
    bgImage: "/images/kids/module5.webp", 
    description: "Master Stop, Drop & Roll! Take the final exam and earn your official Fire Safety Hero Certificate!",
    badge: { name: "Home Guard", image: "/badges/home_hall.webp?v=2" } 
  },
}

// Themes for completed modules to prevent visual overload of a single color
const MODULE_THEMES: Record<number, { borderClass: string; shadowClass: string; buttonClass: string; badgeClass: string; badgeBorderClass: string }> = {
  1: {
    borderClass: "border-amber-500",
    shadowClass: "shadow-[0_8px_0_rgba(245,158,11,0.15)] dark:shadow-[0_8px_0_rgba(120,53,15,0.4)]",
    buttonClass: "bg-amber-500 hover:bg-amber-400 border-amber-700 text-white",
    badgeClass: "bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/30 dark:border-amber-900/30 dark:text-amber-400",
    badgeBorderClass: "bg-amber-50 border-amber-400 dark:bg-amber-950/30 dark:border-amber-500"
  },
  2: {
    borderClass: "border-blue-500",
    shadowClass: "shadow-[0_8px_0_rgba(59,130,246,0.15)] dark:shadow-[0_8px_0_rgba(30,58,138,0.4)]",
    buttonClass: "bg-blue-500 hover:bg-blue-400 border-blue-700 text-white",
    badgeClass: "bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-950/30 dark:border-blue-900/30 dark:text-blue-400",
    badgeBorderClass: "bg-blue-50 border-blue-400 dark:bg-blue-950/30 dark:border-blue-500"
  },
  3: {
    borderClass: "border-indigo-500",
    shadowClass: "shadow-[0_8px_0_rgba(99,102,241,0.15)] dark:shadow-[0_8px_0_rgba(49,16,143,0.4)]",
    buttonClass: "bg-indigo-500 hover:bg-indigo-400 border-indigo-700 text-white",
    badgeClass: "bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:border-indigo-900/30 dark:text-indigo-400",
    badgeBorderClass: "bg-indigo-50 border-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-500"
  },
  4: {
    borderClass: "border-teal-500",
    shadowClass: "shadow-[0_8px_0_rgba(20,184,166,0.15)] dark:shadow-[0_8px_0_rgba(17,94,89,0.4)]",
    buttonClass: "bg-teal-500 hover:bg-teal-400 border-teal-700 text-white",
    badgeClass: "bg-teal-50 border-teal-100 text-teal-600 dark:bg-teal-950/30 dark:border-teal-900/30 dark:text-teal-400",
    badgeBorderClass: "bg-teal-50 border-teal-400 dark:bg-teal-950/30 dark:border-teal-500"
  },
  5: {
    borderClass: "border-rose-500",
    shadowClass: "shadow-[0_8px_0_rgba(244,63,94,0.15)] dark:shadow-[0_8px_0_rgba(159,18,57,0.4)]",
    buttonClass: "bg-rose-500 hover:bg-rose-400 border-rose-700 text-white",
    badgeClass: "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/30 dark:text-rose-400",
    badgeBorderClass: "bg-rose-50 border-rose-400 dark:bg-rose-950/30 dark:border-rose-500"
  }
}

// Static fallback if API hasn't seeded yet
const STATIC_MODULES: ModuleData[] = [
  { id: 1, title: "Fire is a Tool, Not a Toy",  description: "Learn what fire needs to burn with the Fire Triangle. Understand why matches and lighters are tools for grown-ups only.", dayNumber: 1, isCompleted: false, isLocked: false, progress: 0 },
  { id: 2, title: "The School Drill",            description: "Master the fire drill! Learn to recognize alarms, find the Red Box, and lead your classmates to safety.",              dayNumber: 2, isCompleted: false, isLocked: true,  progress: 0 },
  { id: 3, title: "The Escape Plan",             description: "Create your family escape plan with two ways out. Learn to check doors and find your meeting spot.",                  dayNumber: 3, isCompleted: false, isLocked: true,  progress: 0 },
  { id: 4, title: "Get Low and Go!",             description: "Discover why smoke is dangerous and learn the life-saving crawling technique to escape safely.",                      dayNumber: 4, isCompleted: false, isLocked: true,  progress: 0 },
  { id: 5, title: "The Ultimate Defense",        description: "Master Stop, Drop & Roll! Take the final exam and earn your official Fire Safety Hero Certificate!",                  dayNumber: 5, isCompleted: false, isLocked: true,  progress: 0 },
]

// ─────────────────────────────────────────────
// CourseHub Page
// ─────────────────────────────────────────────
const CourseHubPage = ({ initialModules }: CourseHubProps) => {
  const { user } = useAuth()
  const [showCertModal, setShowCertModal] = useState(false)
  const [activeMorphModuleId, setActiveMorphModuleId] = useState<number | null>(null)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('show_cert_modal') === 'true') {
        setShowCertModal(true)
        window.history.replaceState({}, '', '/kids/safescape')
      }
    }
  }, [])
  
  const modules = initialModules || STATIC_MODULES

  // Synthesize a happy completion sound on new module mastery
  useEffect(() => {
    if (!user?.id) return
    const key = `safescape_completed_count_${user.id}`
    const saved = localStorage.getItem(key)
    const currentCompleted = modules.filter(m => m.isCompleted).length
    
    if (saved !== null) {
      const savedCount = parseInt(saved, 10)
      if (currentCompleted > savedCount) {
        // Prevent AudioContext warning if user hasn't interacted yet (like on a hard refresh)
        if (typeof navigator !== 'undefined' && 'userActivation' in navigator && !navigator.userActivation.hasBeenActive) {
          // Skipping completion chime (no user interaction yet)
        } else {
          // Play synthesized happy chime
          try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
            if (AudioContextClass) {
              const ctx = new AudioContextClass()
              const now = ctx.currentTime
              const notes = [261.63, 329.63, 392.00, 523.25] // C4, E4, G4, C5 arpeggio
              notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.type = "sine"
                osc.frequency.setValueAtTime(freq, now + idx * 0.1)
                gain.gain.setValueAtTime(0.15, now + idx * 0.1)
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4)
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.start(now + idx * 0.1)
                osc.stop(now + idx * 0.1 + 0.4)
              })
            }
          } catch (e) {
            console.warn("Chime failed to synthesize:", e)
          }
        }
      }
    }
    localStorage.setItem(key, currentCompleted.toString())
  }, [modules, user?.id])

  // Track and restore scroll position on CourseHub
  useEffect(() => {
    let hasUserInteracted = false

    const markUserInteracted = () => {
      hasUserInteracted = true
    }

    const handleScroll = () => {
      sessionStorage.setItem('safescape_course_hub_scroll', window.scrollY.toString())
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('wheel', markUserInteracted, { passive: true })
    window.addEventListener('touchstart', markUserInteracted, { passive: true })
    window.addEventListener('pointerdown', markUserInteracted, { passive: true })
    window.addEventListener('keydown', markUserInteracted, { passive: true })

    const savedScroll = sessionStorage.getItem('safescape_course_hub_scroll')
    if (savedScroll) {
      const targetY = parseInt(savedScroll, 10)
      if (!isNaN(targetY) && targetY > 0) {
        const restore = () => {
          if (!hasUserInteracted) {
            window.scrollTo({ top: targetY, behavior: 'instant' as ScrollBehavior })
          }
        }

        restore()
        requestAnimationFrame(restore)
      }
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('wheel', markUserInteracted)
      window.removeEventListener('touchstart', markUserInteracted)
      window.removeEventListener('pointerdown', markUserInteracted)
      window.removeEventListener('keydown', markUserInteracted)
    }
  }, [])
  
  const completedCount = useMemo(() => modules.filter(m => m.isCompleted).length, [modules])
  const overallProgress = useMemo(() => {
    if (modules.length === 0) return 0
    return Math.round((completedCount / modules.length) * 100)
  }, [modules, completedCount])

  const handleModuleClick = (e: React.MouseEvent, module: any) => {
    if (module.isLocked) {
      e.preventDefault()
      toast.error("Module Locked", {
        description: "You must complete the previous modules to unlock this one!",
      })
      return
    }

    const moduleRoute = `/kids/safescape/${module.dayNumber}`
    playSound('/sounds/click.mp3', 'general')

    if (window.scrollY > 0) {
      sessionStorage.setItem('safescape_course_hub_scroll', window.scrollY.toString())
    }

    if (!document.startViewTransition) {
      router.visit(moduleRoute)
      return
    }

    e.preventDefault()
    setActiveMorphModuleId(module.dayNumber)
    requestAnimationFrame(() => {
      document.startViewTransition(() => {
        return new Promise<void>((resolve) => {
          router.visit(moduleRoute, {
            onFinish: () => {
              resolve()
            },
          })
        })
      })
    })
  }

  // ─────────────────────────────────────────────
  return (
    <div className="-mt-[104px] sm:-mt-[120px] pt-[104px] sm:pt-[120px] min-h-[calc(100vh+104px)] sm:min-h-[calc(100vh+120px)] bg-slate-50 dark:bg-slate-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] font-sans flex flex-col">
      {/* ── Post-Test Available Banner (Hanging Wooden Sign) ── */}
      {completedCount === 5 && (user?.postTestScore === null || user?.postTestScore === undefined) && (
        <div className="relative z-10 max-w-[95vw] lg:max-w-6xl mx-auto mt-6 sm:mt-14 mb-8 sm:mb-12 animate-swing-drop">
          
          {/* Ropes */}
          <div className="absolute -top-16 sm:-top-28 left-8 sm:left-16 w-4 sm:w-8 flex flex-col items-center z-[-1]">
            <div className="w-3 sm:w-5 h-20 sm:h-32 bg-[#d2b48c] dark:bg-[#a67c52] rounded-full border-x-2 sm:border-x-[3px] border-[#8b5a2b] dark:border-[#4a2e15] shadow-[0_4px_8px_rgba(0,0,0,0.3)] flex flex-col justify-evenly overflow-hidden relative">
               {[...Array(12)].map((_, i) => (
                 <div key={`rope-l-av-${i}`} className="w-[150%] h-1 sm:h-1.5 bg-[#8b5a2b]/50 dark:bg-[#4a2e15]/50 -rotate-[25deg] transform -translate-x-1"></div>
               ))}
            </div>
          </div>
          
          <div className="absolute -top-16 sm:-top-28 right-8 sm:right-16 w-4 sm:w-8 flex flex-col items-center z-[-1]">
            <div className="w-3 sm:w-5 h-20 sm:h-32 bg-[#d2b48c] dark:bg-[#a67c52] rounded-full border-x-2 sm:border-x-[3px] border-[#8b5a2b] dark:border-[#4a2e15] shadow-[0_4px_8px_rgba(0,0,0,0.3)] flex flex-col justify-evenly overflow-hidden relative">
               {[...Array(12)].map((_, i) => (
                 <div key={`rope-r-av-${i}`} className="w-[150%] h-1 sm:h-1.5 bg-[#8b5a2b]/50 dark:bg-[#4a2e15]/50 -rotate-[25deg] transform -translate-x-1"></div>
               ))}
            </div>
          </div>

          {/* Wooden Sign Body */}
          <div className="bg-[#8b5a2b] px-5 sm:px-8 py-5 sm:py-7 relative overflow-hidden rounded-xl sm:rounded-2xl border-[3px] sm:border-[4px] border-[#4a2e15] shadow-[0_8px_0_#4a2e15] w-full z-10 transform origin-top hover:rotate-1 transition-transform duration-300"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 5, 50 10 T 100 10' stroke='rgba(74, 46, 21, 0.4)' fill='none' stroke-width='2'/%3E%3Cpath d='M0 20 Q 25 15, 50 20 T 100 20' stroke='rgba(74, 46, 21, 0.3)' fill='none' stroke-width='1'/%3E%3C/svg%3E")`,
              backgroundSize: '100px 20px'
            }}
          >
            {/* Nails */}
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-300 border border-slate-500 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.5)]"></div>
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-300 border border-slate-500 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.5)]"></div>
            <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-300 border border-slate-500 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.5)]"></div>
            <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-300 border border-slate-500 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.5)]"></div>

            <div className="w-full relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 flex-1 w-full text-center sm:text-left">
                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-[#4a2e15]/40 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border-2 border-[#4a2e15]/50 shadow-inner">
                  <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-amber-300" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-base sm:text-2xl font-black text-amber-50 tracking-tight uppercase leading-tight drop-shadow-md">
                    All Modules Complete!
                  </h3>
                  <p className="text-amber-100 text-xs sm:text-sm font-bold mt-1 drop-shadow-sm leading-relaxed max-w-xl mx-auto sm:mx-0">
                    You've finished all 5 fire safety modules. Take the final Post-Test to earn your certificate!
                  </p>
                </div>
              </div>
              <Link
                href="/assessment/post-test"
                className="w-full sm:w-auto bg-amber-100 hover:bg-white text-[#4a2e15] font-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl border-2 border-[#4a2e15] border-b-[4px] active:border-b-2 active:translate-y-[2px] shadow-lg transition-all flex items-center justify-center gap-2 text-xs sm:text-base shrink-0 uppercase tracking-widest"
              >
                <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                Take Post-Test
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Post-Test Completed Banner (Hanging Wooden Sign) ── */}
      {completedCount === 5 && user?.postTestScore !== null && user?.postTestScore !== undefined && (
        <div className="relative z-10 max-w-[95vw] lg:max-w-6xl mx-auto mt-6 sm:mt-14 mb-8 sm:mb-12 animate-swing-drop">
          
          {/* Ropes */}
          <div className="absolute -top-16 sm:-top-28 left-8 sm:left-16 w-4 sm:w-8 flex flex-col items-center z-[-1]">
            <div className="w-3 sm:w-5 h-20 sm:h-32 bg-[#d2b48c] dark:bg-[#a67c52] rounded-full border-x-2 sm:border-x-[3px] border-[#8b5a2b] dark:border-[#4a2e15] shadow-[0_4px_8px_rgba(0,0,0,0.3)] flex flex-col justify-evenly overflow-hidden relative">
               {[...Array(12)].map((_, i) => (
                 <div key={`rope-l-co-${i}`} className="w-[150%] h-1 sm:h-1.5 bg-[#8b5a2b]/50 dark:bg-[#4a2e15]/50 -rotate-[25deg] transform -translate-x-1"></div>
               ))}
            </div>
          </div>
          
          <div className="absolute -top-16 sm:-top-28 right-8 sm:right-16 w-4 sm:w-8 flex flex-col items-center z-[-1]">
            <div className="w-3 sm:w-5 h-20 sm:h-32 bg-[#d2b48c] dark:bg-[#a67c52] rounded-full border-x-2 sm:border-x-[3px] border-[#8b5a2b] dark:border-[#4a2e15] shadow-[0_4px_8px_rgba(0,0,0,0.3)] flex flex-col justify-evenly overflow-hidden relative">
               {[...Array(12)].map((_, i) => (
                 <div key={`rope-r-co-${i}`} className="w-[150%] h-1 sm:h-1.5 bg-[#8b5a2b]/50 dark:bg-[#4a2e15]/50 -rotate-[25deg] transform -translate-x-1"></div>
               ))}
            </div>
          </div>

          {/* Wooden Sign Body */}
          <div className="bg-[#8b5a2b] px-5 sm:px-8 py-5 sm:py-7 relative overflow-hidden rounded-xl sm:rounded-2xl border-[3px] sm:border-[4px] border-[#4a2e15] shadow-[0_8px_0_#4a2e15] w-full z-10 transform origin-top hover:rotate-1 transition-transform duration-300"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 5, 50 10 T 100 10' stroke='rgba(74, 46, 21, 0.4)' fill='none' stroke-width='2'/%3E%3Cpath d='M0 20 Q 25 15, 50 20 T 100 20' stroke='rgba(74, 46, 21, 0.3)' fill='none' stroke-width='1'/%3E%3C/svg%3E")`,
              backgroundSize: '100px 20px'
            }}
          >
            {/* Nails */}
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-300 border border-slate-500 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.5)]"></div>
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-300 border border-slate-500 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.5)]"></div>
            <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-300 border border-slate-500 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.5)]"></div>
            <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-300 border border-slate-500 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.5)]"></div>

            <div className="w-full relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 flex-1 w-full text-center sm:text-left">
                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-[#4a2e15]/40 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border-2 border-[#4a2e15]/50 shadow-inner">
                  <CheckCircle className="h-6 w-6 sm:h-10 sm:w-10 text-amber-300" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-base sm:text-2xl font-black text-amber-50 tracking-tight uppercase leading-tight drop-shadow-md">
                    Course Completed!
                  </h3>
                  <p className="text-amber-100 text-xs sm:text-sm font-bold mt-1 drop-shadow-sm leading-relaxed max-w-xl mx-auto sm:mx-0">
                    You've successfully finished your fire safety training!
                  </p>
                </div>
              </div>
              <Link
                href="/kids/certificate"
                className="w-full sm:w-auto bg-amber-100 hover:bg-white text-[#4a2e15] font-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl border-2 border-[#4a2e15] border-b-[4px] active:border-b-2 active:translate-y-[2px] shadow-lg transition-all flex items-center justify-center gap-2 text-xs sm:text-base shrink-0 uppercase tracking-widest"
              >
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                View Certificate
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Bright Module Content Area ── */}
      <div className="relative flex-1 bg-transparent pt-2 sm:pt-4 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Floating Themed Elements for Empty Space */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          .floating-icon { animation: float 8s ease-in-out infinite; }
          
          @keyframes swing-drop {
            0% { transform: translateY(-60px) rotate(-8deg); opacity: 0; }
            40% { transform: translateY(0px) rotate(5deg); opacity: 1; }
            60% { transform: translateY(0px) rotate(-3deg); }
            80% { transform: translateY(0px) rotate(1.5deg); }
            100% { transform: translateY(0px) rotate(0deg); opacity: 1; }
          }
          .animate-swing-drop {
            transform-origin: 50% -80px;
            animation: swing-drop 1.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
        `}} />
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-10 z-0">
          <div className="absolute top-[5%] left-[5%] text-6xl floating-icon" style={{ animationDelay: '0s' }}>🚒</div>
          <div className="absolute top-[15%] right-[8%] text-5xl floating-icon" style={{ animationDelay: '1s', transform: 'scale(-1, 1)' }}>🧯</div>
          <div className="absolute top-[40%] left-[2%] text-7xl floating-icon" style={{ animationDelay: '2s' }}>👨‍🚒</div>
          <div className="absolute top-[50%] right-[4%] text-6xl floating-icon" style={{ animationDelay: '3s' }}>🚨</div>
          <div className="absolute bottom-[20%] left-[8%] text-6xl floating-icon" style={{ animationDelay: '1.5s' }}>🔥</div>
          <div className="absolute bottom-[10%] right-[10%] text-7xl floating-icon" style={{ animationDelay: '2.5s' }}>💧</div>
          <div className="absolute top-[80%] left-[45%] text-5xl floating-icon" style={{ animationDelay: '4s' }}>🛡️</div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">

          {/* ── SafeScape Internal Header ── */}
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3 mb-6 sm:mb-8 gap-4">
            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              <Link
                href="/kids"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl text-slate-700 dark:text-slate-200 font-bold hover:text-blue-600 dark:hover:text-blue-400 border-2 border-slate-200 dark:border-slate-700 shadow-xs transition-all text-xs sm:text-sm whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center">
                  <Shield className="h-5 w-5 text-[#ff4b3e]" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-800 dark:text-white font-black text-sm sm:text-base leading-none">SafeScape</span>
                  <span className="text-slate-400 dark:text-slate-500 font-bold text-xs sm:text-sm">| Course Hub</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Unified Section Header ── */}
          <div className="mb-6 sm:mb-8 text-center flex flex-col items-center space-y-2">
            {completedCount === 5 ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-full border border-emerald-200 dark:border-emerald-800/80 shadow-2xs">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> All Missions Mastered
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white flex items-center justify-center gap-2.5 tracking-tight">
                  <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500" /> Your Training Modules
                </h2>
                <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                  Review your completed lessons below or retake any mission to practice your skills!
                </p>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-full border border-orange-200 dark:border-orange-800/80 shadow-2xs">
                  Fire Safety Training Course
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white flex items-center justify-center gap-2.5 tracking-tight">
                  <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500" /> Your Training Modules
                </h2>
                <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                  Complete all 5 training missions to learn how to outsmart fire and earn your Hero Certificate!
                </p>
              </>
            )}
          </div>

          <Deferred data="initialModules" fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[800px]">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-[1.5rem] border-[3px] border-slate-100 dark:border-slate-700 h-[380px] p-5 sm:p-6 flex flex-col animate-pulse">
                  <div className="flex justify-between mb-3 h-6">
                    <div className="w-24 h-4 bg-slate-100 dark:bg-slate-700 rounded-full" />
                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full" />
                  </div>
                  <div className="w-12 h-6 bg-slate-100 dark:bg-slate-700 rounded mb-2" />
                  <div className="w-3/4 h-8 bg-slate-100 dark:bg-slate-700 rounded mb-3" />
                  <div className="w-full h-12 bg-slate-100 dark:bg-slate-700 rounded mb-6" />
                  <div className="flex gap-2 mb-6">
                    <div className="w-20 h-6 bg-slate-100 dark:bg-slate-700 rounded-lg" />
                    <div className="w-24 h-6 bg-slate-100 dark:bg-slate-700 rounded-lg" />
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
                    <div className="w-16 h-8 bg-slate-100 dark:bg-slate-700 rounded" />
                    <div className="w-24 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          }>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[800px]">
              {modules.map((module) => {
                const meta = MODULE_META[module.dayNumber]
                const numLabel = String(module.dayNumber).padStart(2, "0")
                const moduleRoute = `/kids/safescape/${module.dayNumber}`
                
                const theme = MODULE_THEMES[module.dayNumber] || {
                  borderClass: "border-slate-200 dark:border-slate-800",
                  shadowClass: "shadow-[0_8px_0_#e2e8f0] dark:shadow-[0_8px_0_#0f172a]",
                  buttonClass: "bg-blue-600 hover:bg-blue-500 border-blue-800 text-white",
                  badgeClass: "bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-950/30 dark:border-blue-900/30 dark:text-blue-400",
                  badgeBorderClass: "bg-blue-50 border-blue-400 dark:bg-blue-950/30 dark:border-blue-500"
                }

                return (
                  <div
                    key={module.id}
                    style={{
                      viewTransitionName: activeMorphModuleId === module.dayNumber ? 'mission-prep-modal-morph' : 'none'
                    }}
                    className={cn(
                      "relative overflow-hidden rounded-[2rem] flex flex-col transition-all duration-300 bg-white dark:bg-slate-900 group h-full will-change-transform border-[3px]",
                      module.isLocked
                        ? "border-slate-200 dark:border-slate-800 opacity-80 bg-slate-50/50 dark:bg-slate-950/50 shadow-none"
                        : `${theme.borderClass} ${theme.shadowClass} hover:-translate-y-2 hover:shadow-xl`
                    )}
                  >
                    {/* Background Shadow Number */}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-4 text-[320px] font-black text-slate-900 dark:text-white opacity-[0.08] dark:opacity-[0.10] pointer-events-none select-none z-0 leading-none tracking-tighter transition-transform duration-500 group-hover:scale-105">
                      {module.dayNumber}
                    </div>

                    {/* Content Container */}
                    <div className="relative z-10 p-6 sm:p-7 flex flex-col flex-1 h-full">
                      {/* Top Row: Module # and Status */}
                      <div className="flex items-start sm:items-center justify-between mb-6 gap-2">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                           <div className={cn(
                             "h-10 w-10 rounded-2xl flex items-center justify-center font-black text-lg border-2 shadow-sm shrink-0",
                             module.isLocked 
                               ? "bg-slate-50 border-slate-100 text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-600"
                               : theme.badgeClass
                           )}>
                             {module.dayNumber}
                           </div>
                           {module.recommendedAction && !module.isLocked && module.recommendedAction !== 'Mastered' && (
                             <div className={cn(
                               "px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm",
                               module.recommendedAction === 'Priority Review' ? 'bg-red-600 border-red-700 text-white shadow-red-200 dark:shadow-none' : 
                               module.recommendedAction === 'Needs Practice' ? 'bg-orange-500 border-orange-600 text-white shadow-orange-200 dark:shadow-none' : 
                               'bg-emerald-600 border-emerald-700 text-white shadow-emerald-200 dark:shadow-none'
                             )}>
                               {module.recommendedAction}
                             </div>
                           )}
                        </div>

                        {module.isCompleted && (
                          <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center shadow-md border-2 border-white dark:border-slate-800 animate-in zoom-in duration-500 shrink-0">
                            <CheckCircle className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h4 
                        style={{
                          viewTransitionName: activeMorphModuleId === module.dayNumber ? 'mission-prep-title-morph' : 'none'
                        }}
                        className={cn(
                          "text-xl sm:text-2xl font-black mb-3 leading-tight transition-colors duration-300",
                          module.isLocked ? "text-slate-400 dark:text-slate-600" : "text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400"
                        )}
                      >
                        {meta?.title || module.title}
                      </h4>

                      {/* Description */}
                      <p className={cn(
                        "text-sm sm:text-base leading-relaxed font-bold mb-6",
                        module.isLocked ? "text-slate-300 dark:text-slate-700" : "text-slate-500 dark:text-slate-400"
                      )}>
                        {meta?.description || module.description}
                      </p>

                      <div className="flex-1" />

                      {/* Bottom Section: Badge & CTA */}
                      <div className="space-y-4">
                        {/* Visual Progress Bar */}
                        {!module.isLocked && (
                          <div className="mb-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase mb-1.5 text-slate-500 dark:text-slate-400">
                              <span>{module.isCompleted ? "Progress" : "Training Progress"}</span>
                              <span className={cn(module.isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400")}>
                                {module.isCompleted ? "100%" : `${module.progress}%`}
                              </span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700">
                              <div 
                                className={cn("h-full rounded-full transition-all duration-1000 bg-gradient-to-r", 
                                  module.isCompleted ? "from-emerald-400 to-emerald-500" : "from-blue-400 to-blue-500"
                                )} 
                                style={{ width: `${module.isCompleted ? 100 : module.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* CTA Button & Badge */}
                        <div className="pt-2 flex items-center justify-between gap-3">
                          {meta && (
                            <div className="relative group/badge flex-shrink-0">
                              <div 
                                style={{
                                  viewTransitionName: activeMorphModuleId === module.dayNumber ? 'mission-prep-shield-morph' : 'none'
                                }}
                                className={cn(
                                  "flex items-center justify-center shrink-0 w-[52px] h-[52px] rounded-2xl border-[3px] shadow-sm transition-transform group-hover/badge:scale-110 cursor-help",
                                  module.isCompleted 
                                    ? theme.badgeBorderClass 
                                    : "bg-slate-50 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800"
                                )}
                              >
                                <img 
                                  src={meta.badge.image} 
                                  className={cn("h-7 w-7 object-contain", !module.isCompleted && "filter grayscale opacity-45")} 
                                  alt={`${meta.badge.name} Badge`} 
                                />
                              </div>
                              {/* Custom Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] pointer-events-none opacity-0 group-hover/badge:opacity-100 transition-opacity duration-200 z-[100]">
                                <div className="bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl text-center leading-tight">
                                  {meta.badge.name} Badge
                                </div>
                                <div className="w-2 h-2 bg-slate-800 rotate-45 mx-auto -mt-1 shadow-xl"></div>
                              </div>
                            </div>
                          )}
                          <div className="flex-1">
                            {module.isCompleted ? (
                              <Link
                                href={moduleRoute}
                                onClick={(e) => handleModuleClick(e, module)}
                                className={cn(
                                  "w-full flex items-center justify-center gap-2 font-black py-3.5 rounded-2xl text-sm border-b-[4px] active:border-b-0 active:translate-y-[4px] shadow-lg transition-all uppercase tracking-wide cursor-pointer",
                                  theme.buttonClass
                                )}
                              >
                                Review Lessons
                              </Link>
                            ) : module.isLocked ? (
                              <button 
                                onClick={() => {
                                  toast.error("Module Locked", {
                                    description: "You must complete the previous modules to unlock this one!",
                                  })
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 font-bold py-3.5 rounded-2xl text-sm border-2 border-slate-200 dark:border-slate-800 cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Lock className="h-4 w-4" /> Module Locked
                              </button>
                            ) : (
                              <Link
                                href={moduleRoute}
                                onClick={(e) => handleModuleClick(e, module)}
                                className={cn(
                                  "w-full flex items-center justify-center gap-2 font-black py-4 rounded-2xl text-base border-b-[6px] active:border-b-0 active:translate-y-[6px] shadow-xl transition-all uppercase tracking-widest cursor-pointer",
                                  theme.buttonClass
                                )}
                              >
                                {module.progress > 0 ? "Continue Mission" : "Start Learning"}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* ── Certificate Card ── */}
              <div
                className={cn(
                  "relative rounded-[2rem] flex flex-col transition-all duration-500 overflow-hidden bg-white dark:bg-slate-900 h-full border-[3px] group will-change-transform",
                  completedCount === 5
                    ? "border-yellow-400 shadow-xl shadow-yellow-100/40 dark:shadow-yellow-950/20 hover:-translate-y-2 hover:shadow-2xl"
                    : "border-slate-200 dark:border-slate-800 opacity-80"
                )}
              >
                {/* Background Shadow Trophy */}
                <div className="absolute top-1/2 -translate-y-1/2 -left-12 pointer-events-none select-none z-0 transition-transform duration-500 group-hover:scale-105">
                  <Trophy className="w-[320px] h-[320px] text-slate-900 dark:text-white opacity-[0.08] dark:opacity-[0.10]" strokeWidth={1} />
                </div>

                {/* Header Graphic Area - Solid Accent */}
                <div className={cn(
                  "h-32 sm:h-36 p-6 flex flex-col justify-end border-b-[3px] relative overflow-hidden",
                  completedCount === 5 ? "bg-yellow-400 border-yellow-300 dark:bg-yellow-500 dark:border-yellow-600" : "bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800"
                )}>
                  <div className="relative z-10">
                    <Trophy className={cn("h-10 w-10 mb-2", completedCount === 5 ? "text-yellow-950 dark:text-yellow-950" : "text-slate-300 dark:text-slate-600")} />
                    <h4 className={cn("text-2xl sm:text-3xl font-black", completedCount === 5 ? "text-yellow-950" : "text-slate-400 dark:text-slate-600")}>
                      Your Certificate
                    </h4>
                  </div>
                </div>

                <div className="p-7 flex flex-col flex-1 relative z-10">
                  <p className={cn("text-sm sm:text-base leading-relaxed mb-6 flex-1 font-bold", completedCount === 5 ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500")}>
                    {completedCount === 5 
                      ? "Congratulations! You've successfully mastered all 5 fire safety modules. Claim your official hero certificate now!" 
                      : "Master all 5 training modules to unlock your official Fire Safety Hero Certificate and show off your skills."}
                  </p>
                  
                  {/* CTA Button */}
                  <div className="mt-auto pt-6 border-t-2 border-dashed border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {completedCount === 5 ? (
                      <Link
                        href="/kids/certificate"
                        className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-amber-950 font-black py-4 rounded-2xl text-base border-b-[6px] border-yellow-600 active:border-b-0 active:translate-y-[6px] shadow-lg transition-all uppercase tracking-widest"
                      >
                        <Trophy className="h-5 w-5 text-amber-900" />
                        View My Certificate
                      </Link>
                    ) : (
                      <div className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 font-bold py-3.5 rounded-2xl text-sm border-2 border-slate-200 dark:border-slate-800">
                        <Lock className="h-4 w-4" /> Unlock Certificate
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </Deferred>

          {/* ── Motivational Footer (Refined Celebration Banner) ── */}
          <div className={cn(
            "mt-16 sm:mt-20 rounded-[2rem] p-6 sm:p-10 text-center relative overflow-hidden transition-all duration-300",
            completedCount === 5
              ? "bg-white dark:bg-slate-900 border-[3px] sm:border-[4px] border-amber-300 dark:border-amber-500/40 shadow-[0_8px_0_#fcd34d] dark:shadow-[0_8px_0_#78350f]"
              : completedCount > 0
              ? "bg-white dark:bg-slate-900 border-[3px] sm:border-[4px] border-orange-300 dark:border-orange-500/40 shadow-[0_8px_0_#fed7aa] dark:shadow-[0_8px_0_#7c2d12]"
              : "bg-white dark:bg-slate-900 border-[3px] sm:border-[4px] border-slate-200 dark:border-slate-800 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a]"
          )}>
            <div className="relative z-10 flex flex-col items-center">
              {/* Milestone Icon */}
              <div className={cn(
                "h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center mb-4 border-[3px] shadow-sm transition-transform duration-300 hover:scale-105",
                completedCount === 5
                  ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/50 text-amber-500"
                  : completedCount > 0
                  ? "bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-500/50 text-orange-500"
                  : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-500/40 text-red-500"
              )}>
                {completedCount === 5 ? (
                  <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-amber-500 drop-shadow-sm" strokeWidth={2.5} />
                ) : completedCount > 0 ? (
                  <Flame className="h-8 w-8 sm:h-10 sm:w-10 text-orange-500 drop-shadow-sm" strokeWidth={2.5} />
                ) : (
                  <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-red-500 drop-shadow-sm" strokeWidth={2.5} />
                )}
              </div>

              {/* Progress Chip */}
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider mb-2 border",
                completedCount === 5
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
                  : completedCount > 0
                  ? "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/60"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              )}>
                {completedCount === 5
                  ? "⭐ 5 of 5 Missions Mastered"
                  : completedCount > 0
                  ? `🚀 ${completedCount} of 5 Missions Completed`
                  : "🌟 0 of 5 Missions Started"}
              </span>

              {/* Dynamic Title & Description */}
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-1.5 tracking-tight">
                {completedCount === 5
                  ? "Fire Safety Hero Status Achieved!"
                  : completedCount > 0
                  ? "Keep Up the Great Work!"
                  : "Start Your Fire Safety Adventure!"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm sm:text-base max-w-xl">
                {completedCount === 5
                  ? "You've successfully finished all 5 safety missions! Keep practicing your skills and staying fire safe."
                  : completedCount > 0
                  ? "Every lesson you complete brings you one step closer to earning your official Fire Safety Hero Certificate!"
                  : "Complete all 5 interactive missions and fun mini-games to earn your official Fire Safety Hero Certificate!"}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Certificate Unlocked Modal ── */}
      {showCertModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] max-w-sm w-full p-8 flex flex-col items-center text-center shadow-2xl border-[4px] border-yellow-400 animate-in zoom-in-95 duration-500">
            <div className="h-24 w-24 bg-yellow-50 dark:bg-yellow-900/20 rounded-full border-[4px] border-yellow-200 flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
              <Trophy className="h-12 w-12 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight">Course Completed!</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold mb-8">
              Congratulations! You have mastered all 5 modules. You can now view your official Fire Safety Hero Certificate!
            </p>
            <div className="flex flex-col gap-3 w-full">
              <Link 
                href="/kids/certificate" 
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-black px-6 py-4 rounded-[1.25rem] border-b-[5px] border-yellow-700 active:border-b-[1px] active:mt-[4px] transition-all uppercase tracking-widest text-sm flex justify-center items-center gap-2"
              >
                View Certificate
              </Link>
              <button 
                onClick={() => setShowCertModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold px-6 py-3 rounded-[1rem] transition-colors uppercase tracking-widest text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

CourseHubPage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default CourseHubPage
