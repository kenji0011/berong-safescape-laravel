import React, { useMemo, useEffect } from "react"
import { Link, Deferred } from '@inertiajs/react'
import { ArrowLeft, ArrowRight, BookOpen, Trophy, Shield, CheckCircle, Lock, Flame, ChevronRight, ClipboardCheck } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
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
    bgImage: "/images/kids/module1.png", 
    description: "Learn what fire needs to burn with the Fire Triangle. Understand why matches and lighters are tools for grown-ups only.",
    badge: { name: "Fire Triangle", image: "/fire_hall.png" } 
  },
  2: { 
    title: "The School Drill",
    gameIcon: "🎵", 
    gameLabel: "Rhythm Marshal Game", 
    bgImage: "/images/kids/module2.png", 
    description: "Master the fire drill! Learn to recognize alarms, find the Red Box, and lead your classmates to safety.",
    badge: { name: "Safety Leader", image: "/shield_hall.png" } 
  },
  3: { 
    title: "The Escape Plan",
    gameIcon: "🌫️", 
    gameLabel: "Smoke Labyrinth Game", 
    bgImage: "/images/kids/module3.png", 
    description: "Create your family escape plan with two ways out. Learn to check doors and find your meeting spot.",
    badge: { name: "Plan Master", image: "/plan_hall.png" } 
  },
  4: { 
    title: "Get Low and Go!",
    gameIcon: "☁️", 
    gameLabel: "Smoke Physics", 
    bgImage: "/images/kids/module4.png", 
    description: "Discover why smoke is dangerous and learn the life-saving crawling technique to escape safely.",
    badge: { name: "Low & Go!", image: "/low_hall.png" } 
  },
  5: { 
    title: "The Ultimate Defense",
    gameIcon: "🌟", 
    gameLabel: "Hero Certificate", 
    bgImage: "/images/kids/module5.png", 
    description: "Master Stop, Drop & Roll! Take the final exam and earn your official Fire Safety Hero Certificate!",
    badge: { name: "Home Guard", image: "/home_hall.png" } 
  },
}

// Themes for completed modules to prevent visual overload of a single color
const MODULE_THEMES: Record<number, { borderClass: string; shadowClass: string; buttonClass: string; badgeClass: string }> = {
  1: {
    borderClass: "border-amber-500",
    shadowClass: "shadow-[0_8px_0_rgba(245,158,11,0.15)] dark:shadow-[0_8px_0_rgba(120,53,15,0.4)]",
    buttonClass: "bg-amber-500 hover:bg-amber-400 border-amber-700 text-white",
    badgeClass: "bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/30 dark:border-amber-900/30 dark:text-amber-400"
  },
  2: {
    borderClass: "border-blue-500",
    shadowClass: "shadow-[0_8px_0_rgba(59,130,246,0.15)] dark:shadow-[0_8px_0_rgba(30,58,138,0.4)]",
    buttonClass: "bg-blue-500 hover:bg-blue-400 border-blue-700 text-white",
    badgeClass: "bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-950/30 dark:border-blue-900/30 dark:text-blue-400"
  },
  3: {
    borderClass: "border-indigo-500",
    shadowClass: "shadow-[0_8px_0_rgba(99,102,241,0.15)] dark:shadow-[0_8px_0_rgba(49,16,143,0.4)]",
    buttonClass: "bg-indigo-500 hover:bg-indigo-400 border-indigo-700 text-white",
    badgeClass: "bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:border-indigo-900/30 dark:text-indigo-400"
  },
  4: {
    borderClass: "border-teal-500",
    shadowClass: "shadow-[0_8px_0_rgba(20,184,166,0.15)] dark:shadow-[0_8px_0_rgba(17,94,89,0.4)]",
    buttonClass: "bg-teal-500 hover:bg-teal-400 border-teal-700 text-white",
    badgeClass: "bg-teal-50 border-teal-100 text-teal-600 dark:bg-teal-950/30 dark:border-teal-900/30 dark:text-teal-400"
  },
  5: {
    borderClass: "border-rose-500",
    shadowClass: "shadow-[0_8px_0_rgba(244,63,94,0.15)] dark:shadow-[0_8px_0_rgba(159,18,57,0.4)]",
    buttonClass: "bg-rose-500 hover:bg-rose-400 border-rose-700 text-white",
    badgeClass: "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/30 dark:text-rose-400"
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
    localStorage.setItem(key, currentCompleted.toString())
  }, [modules, user?.id])
  
  const completedCount = useMemo(() => modules.filter(m => m.isCompleted).length, [modules])
  const overallProgress = useMemo(() => {
    if (modules.length === 0) return 0
    return Math.round((completedCount / modules.length) * 100)
  }, [modules, completedCount])

  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col">
      {/* ── Post-Test Available Banner ── */}
      {completedCount === 5 && (user?.postTestScore === null || user?.postTestScore === undefined) && (
        <div className="bg-emerald-600 px-4 sm:px-6 py-6 sm:py-8 relative overflow-hidden animate-in slide-in-from-top fade-in duration-500">
          <div className="max-w-6xl mx-auto relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-4 flex-1">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border-2 border-white/30">
                <Trophy className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-200" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">All Modules Complete!</h3>
                <p className="text-white/80 text-xs sm:text-sm font-bold mt-0.5">You've finished all 5 fire safety modules. Take the final Post-Test to earn your certificate!</p>
              </div>
            </div>
            <Link
              href="/assessment/post-test"
              className="w-full sm:w-auto bg-white hover:bg-yellow-50 text-green-700 font-black px-6 py-3.5 rounded-full border-2 border-white border-b-[4px] border-b-green-200 active:border-b-2 active:translate-y-[2px] shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base shrink-0 uppercase tracking-wider"
            >
              <ClipboardCheck className="h-5 w-5" />
              Take Post-Test
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Post-Test Completed Banner ── */}
      {completedCount === 5 && user?.postTestScore !== null && user?.postTestScore !== undefined && (
        <div className="bg-orange-600 px-4 sm:px-6 py-3 sm:py-6 relative overflow-hidden animate-in slide-in-from-top fade-in duration-500">
          <div className="max-w-6xl mx-auto relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-8">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full">
              <div className="h-10 w-10 sm:h-16 sm:w-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border-2 border-white/30">
                <CheckCircle className="h-5 w-5 sm:h-10 sm:w-10 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-xl font-black text-white tracking-tight uppercase leading-tight">Course Completed!</h3>
                <p className="text-white/90 text-[10px] sm:text-sm font-bold mt-0.5 line-clamp-1 sm:line-clamp-none">You've successfully finished your fire safety training!</p>
              </div>
            </div>
            <Link
              href="/kids/certificate"
              className="w-auto sm:w-auto bg-white hover:bg-orange-50 text-orange-700 font-black px-5 sm:px-6 py-2 sm:py-3.5 rounded-full border-2 border-white border-b-[4px] border-b-orange-200 active:border-b-2 active:translate-y-[2px] shadow-lg transition-all flex items-center justify-center gap-2 text-[10px] sm:text-base shrink-0 uppercase tracking-wider"
            >
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
              View Certificate
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Bright Module Content Area ── */}
      <div className="relative flex-1 bg-white dark:bg-slate-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-t border-border overflow-hidden">
        
        {/* Floating Themed Elements for Empty Space */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          .floating-icon { animation: float 8s ease-in-out infinite; }
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
          <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-blue-200 dark:border-slate-800 pb-4 mb-8 sm:mb-12 gap-4">
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <Link
                href="/kids"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl text-slate-700 dark:text-slate-200 font-bold hover:text-blue-600 dark:hover:text-blue-400 border-2 border-slate-200 dark:border-slate-700 shadow-sm transition-all text-sm whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden xs:inline sm:inline">Back <span className="hidden sm:inline">to Dashboard</span></span>
              </Link>
              
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#ff4b3e]" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                  <span className="text-slate-800 dark:text-white font-black text-base sm:text-lg leading-none">SafeScape</span>
                  <span className="text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-lg sm:opacity-100 opacity-80 sm:before:content-['|'] sm:before:mr-1"> Course Hub</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Hero Section ── */}
          {completedCount === 5 ? (
            <div className="flex flex-col items-center text-center mb-6 sm:mb-8 space-y-2 relative">
              <div className="absolute top-0 right-0 lg:-right-12 text-3xl sm:text-5xl opacity-10 transform rotate-12 pointer-events-none">✨</div>
              <div className="absolute bottom-4 left-0 lg:-left-12 text-3xl sm:text-5xl opacity-10 transform -rotate-12 pointer-events-none">🔥</div>
              
              <span className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-widest rounded-full border border-emerald-200 dark:border-emerald-900/30 shadow-sm">
                TRAINING COMPLETED
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-primary leading-tight drop-shadow-sm px-2">
                You are a Fire Safety Hero!
              </h1>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center mb-6 sm:mb-8 space-y-3 sm:space-y-4 relative">
              <div className="absolute top-0 right-0 lg:-right-12 text-4xl sm:text-6xl opacity-20 transform rotate-12 pointer-events-none">✨</div>
              <div className="absolute bottom-10 left-0 lg:-left-12 text-4xl sm:text-6xl opacity-20 transform -rotate-12 pointer-events-none">🔥</div>
              
              <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-black text-[10px] uppercase tracking-widest rounded-full border border-orange-200 dark:border-orange-900/30 shadow-sm">
                FIRE SAFETY TRAINING COURSE
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-primary leading-tight drop-shadow-sm px-2">
                Become a Fire Safety Hero!
              </h1>
              <p className="text-sm sm:text-base font-bold text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed px-4">
                Complete 5 modules to learn fire safety and protect your home.
              </p>

              <div className="flex items-center gap-2 bg-yellow-400/10 dark:bg-yellow-400/5 px-4 py-1.5 rounded-full border border-yellow-400/30 text-yellow-700 dark:text-yellow-400 font-extrabold text-xs sm:text-sm shadow-sm mt-1">
                <span>👨‍🚒</span>
                <span>{user?.name || "Fire Safety Hero"}</span>
              </div>
            </div>
          )}

          {/* ── Modules Grid ── */}
          <div className="mb-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white flex items-center justify-center gap-3">
              <BookOpen className="h-6 w-6 text-blue-500" /> Your Training Modules
            </h2>
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
                  badgeClass: "bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-950/30 dark:border-blue-900/30 dark:text-blue-400"
                }

                return (
                  <div
                    key={module.id}
                    className={cn(
                      "relative overflow-hidden rounded-[2rem] flex flex-col transition-all duration-300 bg-white dark:bg-slate-900 group h-full will-change-transform border-[3px]",
                      module.isLocked
                        ? "border-slate-200 dark:border-slate-800 opacity-80 bg-slate-50/50 dark:bg-slate-950/50 shadow-none"
                        : `${theme.borderClass} ${theme.shadowClass} hover:-translate-y-1.5`
                    )}
                  >
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
                      <h4 className={cn(
                        "text-xl sm:text-2xl font-black mb-3 leading-tight transition-colors duration-300",
                        module.isLocked ? "text-slate-400 dark:text-slate-600" : "text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400"
                      )}>
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
                              <span>{module.isCompleted ? "Mastered" : "Training Progress"}</span>
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
                                className={cn(
                                  "flex items-center justify-center shrink-0 w-[52px] h-[52px] rounded-2xl border-[3px] shadow-sm transition-transform group-hover/badge:scale-110 cursor-help",
                                  module.isCompleted 
                                    ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30" 
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
                                className={cn(
                                  "w-full flex items-center justify-center gap-2 font-black py-3.5 rounded-2xl text-sm border-b-[4px] active:border-b-0 active:translate-y-[4px] shadow-lg transition-all uppercase tracking-wide",
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
                                className={cn(
                                  "w-full flex items-center justify-center gap-2 font-black py-4 rounded-2xl text-base border-b-[6px] active:border-b-0 active:translate-y-[6px] shadow-xl transition-all uppercase tracking-widest",
                                  theme.buttonClass
                                )}
                              >
                                {module.progress > 0 ? "Continue Mission" : "Start Learning"}
                                <ArrowRight className="h-5 w-5" />
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
                  "relative rounded-[2rem] flex flex-col transition-all duration-500 overflow-hidden bg-white dark:bg-slate-900 h-full border-[3px]",
                  completedCount === 5
                    ? "border-yellow-400 shadow-xl shadow-yellow-100/40 dark:shadow-yellow-950/20 hover:-translate-y-1.5"
                    : "border-slate-200 dark:border-slate-800 opacity-80"
                )}
              >
                {/* Header Graphic Area - Solid Accent */}
                <div className={cn(
                  "h-32 sm:h-36 p-6 flex flex-col justify-end border-b-[3px] relative overflow-hidden",
                  completedCount === 5 ? "bg-yellow-400 border-yellow-300 dark:bg-yellow-500 dark:border-yellow-600" : "bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800"
                )}>
                  <div className="relative z-10">
                    <Trophy className={cn("h-10 w-10 mb-2", completedCount === 5 ? "text-yellow-900 dark:text-yellow-950" : "text-slate-300 dark:text-slate-600")} />
                    <h4 className={cn("text-2xl sm:text-3xl font-black", completedCount === 5 ? "text-yellow-950" : "text-slate-400 dark:text-slate-600")}>
                      Your Certificate
                    </h4>
                  </div>
                </div>

                <div className="p-7 flex flex-col flex-1">
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
                        className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-red-600 font-black py-4 rounded-2xl text-base border-b-[6px] border-yellow-700 active:border-b-0 active:translate-y-[6px] shadow-lg transition-all uppercase tracking-widest"
                      >
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

          {/* ── Motivational Footer ── */}
          <div className="mt-20 border-[4px] border-blue-200 dark:border-slate-800 bg-white dark:bg-slate-800 rounded-[2rem] p-8 sm:p-12 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -z-0"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full -z-0"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4">🔥</div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-2">Keep Up the Great Work!</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">
                  Every lesson you complete makes you a better fire safety hero!
                </p>
              </div>
          </div>

        </div>
      </div>
    </div>
  )
}

CourseHubPage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default CourseHubPage
