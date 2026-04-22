import React, { useState, useEffect } from "react"
import { Link } from '@inertiajs/react'
import { ArrowLeft, BookOpen, Trophy, Shield, CheckCircle, Lock, Flame, Star, ChevronRight, ClipboardCheck } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
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

// Static metadata per module (game names, icons) since these are hardcoded per module
const MODULE_META: Record<number, { gameIcon: string; gameLabel: string }> = {
  1: { gameIcon: "🎮", gameLabel: "Element Mixer Lab"   },
  2: { gameIcon: "🎵", gameLabel: "Rhythm Marshal Game" },
  3: { gameIcon: "🌫️", gameLabel: "Smoke Labyrinth Game" },
  4: { gameIcon: "☁️", gameLabel: "Smoke Physics"       },
  5: { gameIcon: "🌟", gameLabel: "Hero Certificate"    },
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
const CourseHubPage = () => {
  const { user } = useAuth()
  const [modules, setModules]         = useState<ModuleData[]>(STATIC_MODULES)
  const [loading, setLoading]         = useState(true)
  const [overallProgress, setOverall] = useState(0)

  // ── Fetch real progress ──
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/kids/modules", { credentials: "include" })
        if (res.ok) {
          const data: ModuleData[] = await res.json()
          if (data && data.length > 0) {
            setModules(data)
            const completed = data.filter(m => m.isCompleted).length
            setOverall(Math.round((completed / data.length) * 100))
          }
        }
      } catch (_) {
        /* fall back to static data */
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const completedCount  = modules.filter(m => m.isCompleted).length
  const inProgressCount = modules.filter(m => !m.isCompleted && !m.isLocked).length
  const lockedCount     = modules.filter(m => m.isLocked).length

  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">

      {/* ── Sub Header ── */}
      <div className="bg-white border-b border-slate-200 py-2 sm:py-3 px-3 sm:px-6 lg:px-8 shadow-sm z-20 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link
              href="/kids"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white rounded-full text-slate-700 font-bold hover:text-slate-900 border-2 border-slate-200 shadow-sm transition-all text-xs sm:text-sm whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
            <div className="hidden md:flex items-center gap-2">
              <Flame className="h-5 w-5 text-[#ff4b3e]" />
              <h1 className="text-xl font-black text-slate-800">SafeScape Fire Safety Course</h1>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="flex items-center gap-1 sm:gap-2 bg-white px-2 sm:px-4 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg sm:rounded-xl font-bold text-slate-700 text-xs sm:text-sm whitespace-nowrap">
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
              <span>{completedCount}/5<span className="hidden sm:inline"> Modules</span></span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 bg-white px-2 sm:px-4 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg sm:rounded-xl font-bold text-slate-700 text-xs sm:text-sm whitespace-nowrap">
              <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />
              <span>{overallProgress}%<span className="hidden sm:inline"> Complete</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Course Completion Banner ── */}
      {completedCount === 5 && (user?.postTestScore === null || user?.postTestScore === undefined) && (
        <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 px-4 sm:px-6 py-6 sm:py-8 relative overflow-hidden animate-in slide-in-from-top fade-in duration-500">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
          <div className="max-w-6xl mx-auto relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-4 flex-1">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 border-2 border-white/30">
                <Trophy className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-200" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">🎉 All Modules Complete!</h3>
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
        <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-4 sm:px-6 py-6 sm:py-8 relative overflow-hidden animate-in slide-in-from-top fade-in duration-500">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
          <div className="max-w-6xl mx-auto relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-4 flex-1">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 border-2 border-white/30">
                <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-blue-200" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">🎉 Course Completed!</h3>
                <p className="text-white/80 text-xs sm:text-sm font-bold mt-0.5">You've successfully finished your fire safety training. View your official certificate!</p>
              </div>
            </div>
            <Link
              href="/kids/certificate"
              className="w-full sm:w-auto bg-white hover:bg-blue-50 text-indigo-700 font-black px-6 py-3.5 rounded-full border-2 border-white border-b-[4px] border-b-blue-200 active:border-b-2 active:translate-y-[2px] shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base shrink-0 uppercase tracking-wider"
            >
              <Trophy className="h-5 w-5 text-yellow-500" />
              View Certificate
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Dark Module Content Area ── */}
      <div className="flex-1 bg-[#111827] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          {/* ── SafeScape Internal Header ── */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-12">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#ff4b3e]" />
              <span className="text-white font-black text-lg">SafeScape</span>
              <span className="text-slate-400 font-medium"> | Course Hub</span>
            </div>
            <div className="text-sm font-bold text-slate-400">
              Overall Progress: <span className="text-yellow-400 font-black">{overallProgress}%</span>
            </div>
          </div>

          {/* ── Hero Section ── */}
          <div className="flex flex-col items-center text-center mb-16 space-y-6">
            <span className="inline-block px-4 py-1.5 bg-[#451a03] text-orange-400 font-bold text-xs uppercase tracking-widest rounded-full border border-[#78350f]">
              🔥 FIRE SAFETY TRAINING COURSE
            </span>
            <h1 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff4b3e] to-[#ff8c00] leading-tight">
              Become a Fire Safety Hero!
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
              Complete 5 exciting modules to learn how to protect yourself, your family,
              and your friends from fire hazards.
            </p>

            <div className="flex flex-col items-center mt-4 gap-3">
              <span className="text-slate-400 text-sm">Welcome, Fire Safety Hero:</span>
              <div className="flex items-center gap-3 bg-[#1e293b] border border-slate-700 px-6 py-3 rounded-2xl shadow-xl">
                <div className="text-2xl">👨‍🚒</div>
                <span className="text-2xl font-black text-yellow-400">{user?.name || "Fire Safety Hero"}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-xl mt-8">
              <div className="flex items-center justify-between text-sm font-medium text-slate-400 mb-2">
                <span>Course Progress</span>
                <span>{completedCount} of 5 modules completed</span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ff4b3e] to-[#ff8c00] rounded-full transition-all duration-700"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── Modules Grid ── */}
          <div className="mb-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-3">
              <BookOpen className="h-6 w-6 text-orange-500" /> Your Training Modules
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#ff4b3e]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => {
                const meta = MODULE_META[module.dayNumber]
                const numLabel = String(module.dayNumber).padStart(2, "0")
                const moduleRoute = `/kids/safescape/${module.dayNumber}`

                return (
                  <div
                    key={module.id}
                    className={cn(
                      "relative rounded-2xl p-6 flex flex-col transition-all duration-200",
                      module.isCompleted
                        ? "bg-[#1e293b] border border-green-500/30 hover:bg-slate-800"
                        : module.isLocked
                        ? "bg-[#1e293b]/50 border border-slate-800 opacity-60 cursor-not-allowed"
                        : "bg-[#1e293b] border-2 border-[#ff4b3e] hover:bg-slate-800 shadow-[0_0_15px_rgba(255,75,62,0.12)]"
                    )}
                  >
                    {/* Completed badge */}
                    {module.isCompleted && (
                      <div className="absolute top-4 right-4 h-7 w-7 rounded-full bg-green-500 flex items-center justify-center shadow">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    )}

                    {/* Adaptive Learning Badge */}
                    {module.recommendedAction && !module.isLocked && (
                      <div className={cn(
                        "absolute top-4 left-4 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider border-2 shadow-sm",
                        module.recommendedAction === 'Priority Review' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 
                        module.recommendedAction === 'Needs Practice' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : 
                        'bg-green-500/20 text-green-400 border-green-500/50'
                      )}>
                        {module.recommendedAction}
                      </div>
                    )}

                    {/* Day number */}
                    <h3 className={cn(
                      "text-5xl font-black mb-2",
                      module.isCompleted || !module.isLocked ? "text-[#ff8c00]" : "text-slate-700"
                    )}>
                      {numLabel}
                    </h3>

                    {/* Title */}
                    <h4 className={cn("text-xl font-black mb-4", module.isLocked ? "text-gray-500" : "text-white")}>
                      {module.title}
                    </h4>

                    {/* Lock overlay */}
                    {module.isLocked && (
                      <div className="absolute inset-0 rounded-2xl z-10 flex flex-col items-center justify-center bg-[#111827]/80 backdrop-blur-sm">
                        <Lock className="h-8 w-8 text-slate-500 mb-2" />
                        <span className="text-sm font-medium text-slate-400 text-center px-6">
                          Complete Module {module.dayNumber - 1} to unlock
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    <p className={cn("text-sm leading-relaxed mb-6 flex-1", module.isLocked ? "text-slate-600" : "text-slate-400")}>
                      {module.description}
                    </p>

                    {/* Game label */}
                    {meta && (
                      <div className={cn(
                        "flex items-center gap-2 text-xs font-bold mb-6 w-fit px-3 py-1.5 rounded-lg",
                        module.isCompleted ? "bg-green-500/10 text-green-400" : module.isLocked ? "bg-slate-800/50 text-slate-600" : "bg-blue-500/10 text-blue-400"
                      )}>
                        <span className="text-base">{meta.gameIcon}</span>
                        {meta.gameLabel}
                      </div>
                    )}

                    {/* Progress bar (in-progress modules) */}
                    {!module.isCompleted && !module.isLocked && module.progress > 0 && (
                      <div className="mb-4">
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#ff4b3e] to-[#ff8c00] rounded-full"
                            style={{ width: `${module.progress}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{module.progress}% complete</p>
                      </div>
                    )}

                    {/* CTA Button */}
                    <div className="mt-auto border-t border-slate-700 pt-4 flex items-center justify-between">
                      {module.isCompleted ? (
                        <>
                          <span className="text-xs font-black tracking-wider text-green-500 uppercase">Completed</span>
                          <div className="flex gap-2">

                            <Link
                              href={moduleRoute}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-black px-4 py-2 rounded-full text-sm shadow-[0_4px_0_#166534] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all"
                            >
                              <CheckCircle className="h-4 w-4" /> Review
                            </Link>
                          </div>
                        </>
                      ) : module.isLocked ? (
                        <>
                          <span className="text-xs font-black tracking-wider text-slate-600 uppercase">Locked</span>
                          <div className="flex items-center gap-2 bg-slate-800 text-slate-500 font-bold px-5 py-2 rounded-full text-sm">
                            <Lock className="h-3.5 w-3.5" /> Locked
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-black tracking-wider text-orange-500 uppercase">
                            {module.progress > 0 ? "In Progress" : "Available"}
                          </span>
                          <Link
                            href={moduleRoute}
                            className="flex items-center gap-2 bg-gradient-to-r from-[#ff4b3e] to-[#ff8c00] hover:brightness-110 text-white font-black px-6 py-2.5 rounded-full text-sm shadow-[0_4px_0_#9a3412] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all"
                          >
                            {module.progress > 0 ? "Continue" : "Start"} →
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* ── Certificate Card ── */}
              <div
                className={cn(
                  "relative rounded-2xl flex flex-col transition-all duration-200 overflow-hidden",
                  completedCount === 5
                    ? "bg-[#1e293b] border-2 border-orange-500 hover:bg-slate-800 shadow-[0_0_20px_rgba(249,115,22,0.2)]"
                    : "bg-[#1e293b]/50 border border-slate-800 opacity-70"
                )}
              >
                {/* Header Graphic Area */}
                <div className={cn(
                  "h-32 p-6 flex flex-col justify-end",
                  completedCount === 5 ? "bg-gradient-to-br from-orange-400 to-amber-600" : "bg-slate-800"
                )}>
                  <Trophy className={cn("h-8 w-8 mb-2", completedCount === 5 ? "text-yellow-100" : "text-slate-600")} />
                  <h4 className={cn("text-2xl font-black", completedCount === 5 ? "text-white" : "text-slate-500")}>
                    Your Certificate
                  </h4>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <p className="text-sm leading-relaxed mb-6 flex-1 text-slate-400">
                    {completedCount === 5 
                      ? "Congratulations! You've completed all modules and earned your Fire Safety Hero Certificate!" 
                      : "Complete all 5 fire safety modules to unlock your official hero certificate."}
                  </p>
                  
                  {/* CTA Button */}
                  <div className="mt-auto border-t border-slate-700 pt-4 flex items-center justify-between">
                    {completedCount === 5 ? (
                      <>
                        <span className="text-xs font-black tracking-wider text-green-500 uppercase">Earned!</span>
                        <Link
                          href="/kids/certificate"
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-black px-4 py-2 rounded-full text-sm shadow-[0_4px_0_#166534] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all"
                        >
                          <Trophy className="h-4 w-4" /> View Certificate
                        </Link>
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-black tracking-wider text-slate-600 uppercase">Locked</span>
                        <div className="flex items-center gap-2 bg-slate-800 text-slate-500 font-bold px-5 py-2 rounded-full text-sm">
                          <Lock className="h-3.5 w-3.5" /> Locked
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ── Motivational Footer ── */}
          <div className="mt-16 border border-orange-500/20 bg-[#1e293b] rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">🔥</div>
            <h3 className="text-2xl font-black text-orange-400 mb-2">Keep Up the Great Work!</h3>
            <p className="text-slate-400 font-medium">
              Every lesson you complete makes you a better fire safety hero! 🦸‍♂️
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

CourseHubPage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default CourseHubPage
