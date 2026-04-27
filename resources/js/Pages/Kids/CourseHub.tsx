import React, { useMemo } from "react"
import { Link, Deferred } from '@inertiajs/react'
import { ArrowLeft, BookOpen, Trophy, Shield, CheckCircle, Lock, Flame, ChevronRight, ClipboardCheck } from "lucide-react"
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

interface CourseHubProps {
  initialModules?: ModuleData[]
}

// Static metadata per module (game names, icons, badges) since these are hardcoded per module
const MODULE_META: Record<number, { gameIcon: string; gameLabel: string; bgImage: string; badge: { name: string; icon: string } }> = {
  1: { gameIcon: "🎮", gameLabel: "Element Mixer Lab", bgImage: "/images/kids/module1.png", badge: { name: "Fire Triangle", icon: "🔥" } },
  2: { gameIcon: "🎵", gameLabel: "Rhythm Marshal Game", bgImage: "/images/kids/module2.png", badge: { name: "Safety Leader", icon: "🛡️" } },
  3: { gameIcon: "🌫️", gameLabel: "Smoke Labyrinth Game", bgImage: "/images/kids/module3.png", badge: { name: "Plan Master", icon: "📢" } },
  4: { gameIcon: "☁️", gameLabel: "Smoke Physics", bgImage: "/images/kids/module4.png", badge: { name: "Low & Go!", icon: "🏃" } },
  5: { gameIcon: "🌟", gameLabel: "Hero Certificate", bgImage: "/images/kids/module5.png", badge: { name: "Home Guard", icon: "🏘️" } },
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
  
  const completedCount = useMemo(() => modules.filter(m => m.isCompleted).length, [modules])
  const overallProgress = useMemo(() => {
    if (modules.length === 0) return 0
    return Math.round((completedCount / modules.length) * 100)
  }, [modules, completedCount])

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

      {/* ── Bright Module Content Area ── */}
      <div className="flex-1 bg-blue-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="max-w-6xl mx-auto">

          {/* ── SafeScape Internal Header ── */}
          <div className="flex items-center justify-between border-b-2 border-blue-200 pb-4 mb-12">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#ff4b3e]" />
              <span className="text-slate-800 font-black text-lg">SafeScape</span>
              <span className="text-slate-500 font-bold"> | Course Hub</span>
            </div>
            <div className="text-sm font-bold text-slate-500 bg-white px-4 py-1.5 rounded-full border-2 border-slate-200 shadow-sm hidden sm:block">
              Overall Progress: <span className="text-orange-500 font-black ml-1">{overallProgress}%</span>
            </div>
          </div>

          {/* ── Hero Section ── */}
          <div className="flex flex-col items-center text-center mb-10 sm:mb-16 space-y-4 sm:space-y-6 relative">
            <div className="absolute top-0 right-0 lg:-right-12 text-4xl sm:text-6xl opacity-20 transform rotate-12 pointer-events-none">✨</div>
            <div className="absolute bottom-10 left-0 lg:-left-12 text-4xl sm:text-6xl opacity-20 transform -rotate-12 pointer-events-none">🔥</div>
            
            <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 bg-orange-100 text-orange-600 font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-full border-2 border-orange-200 shadow-sm">
              🔥 FIRE SAFETY TRAINING COURSE
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff4b3e] to-[#ff8c00] leading-tight drop-shadow-sm px-2">
              Become a Fire Safety Hero!
            </h1>
            <p className="text-base sm:text-lg font-bold text-slate-500 max-w-2xl leading-relaxed px-4">
              Complete 5 exciting modules to learn how to protect yourself, your family,
              and your friends from fire hazards.
            </p>

            <div className="flex flex-col items-center mt-2 sm:mt-4 gap-2 sm:gap-3">
              <span className="text-slate-500 font-bold text-xs sm:text-sm uppercase tracking-wider">Welcome, Fire Safety Hero:</span>
              <div className="flex items-center gap-2 sm:gap-3 bg-white border-[3px] border-yellow-400 px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl shadow-[0_4px_0_#facc15] sm:shadow-[0_6px_0_#facc15] transform -rotate-1 hover:rotate-0 transition-transform">
                <div className="text-xl sm:text-2xl">👨‍🚒</div>
                <span className="text-lg sm:text-2xl font-black text-slate-800">{user?.name || "Fire Safety Hero"}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-xl mt-8 sm:mt-12 bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border-4 border-slate-100 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm font-black text-slate-500 mb-3 uppercase tracking-wider gap-1">
                <span>Course Progress</span>
                <span className="text-orange-500">{completedCount} of 5 modules completed</span>
              </div>
              <div className="h-3 sm:h-4 w-full bg-slate-100 rounded-full overflow-hidden border-2 border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-[#ff4b3e] to-[#ff8c00] rounded-full transition-all duration-700"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── Modules Grid ── */}
          <div className="mb-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center justify-center gap-3">
              <BookOpen className="h-6 w-6 text-blue-500" /> Your Training Modules
            </h2>
          </div>

          <Deferred data="initialModules" fallback={
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#ff4b3e]" />
            </div>
          }>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => {
                const meta = MODULE_META[module.dayNumber]
                const numLabel = String(module.dayNumber).padStart(2, "0")
                const moduleRoute = `/kids/safescape/${module.dayNumber}`

                return (
                  <div
                    key={module.id}
                    className={cn(
                      "relative overflow-hidden rounded-3xl flex flex-col transition-all duration-200 bg-white group",
                      module.isCompleted
                        ? "border-[4px] border-green-200 shadow-sm"
                        : module.isLocked
                        ? "border-[4px] border-slate-200 opacity-70 cursor-not-allowed bg-slate-50 grayscale-[50%]"
                        : "border-[4px] border-[#ff4b3e] shadow-[0_8px_0_#ff4b3e] hover:-translate-y-1 hover:shadow-[0_12px_0_#ff4b3e]"
                    )}
                  >
                    {/* Top Header Background Image (EDITH Style) */}
                    {meta?.bgImage && (
                      <div className="absolute top-0 left-0 w-full h-48 sm:h-56 z-0 pointer-events-none overflow-hidden rounded-t-3xl">
                        <img 
                          src={meta.bgImage} 
                          alt="" 
                          className={cn(
                            "absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-all duration-500",
                            module.isLocked ? "opacity-20 grayscale" : "opacity-30 group-hover:opacity-40 group-hover:scale-105"
                          )} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>
                      </div>
                    )}

                    {/* Content Container (Layered above background) */}
                    <div className="relative z-10 p-6 flex flex-col flex-1">
                      {/* Completed badge */}
                      {module.isCompleted && (
                        <div className="absolute top-0 right-0 sm:top-2 sm:right-2 h-8 w-8 rounded-full bg-green-500 flex items-center justify-center shadow-md border-2 border-white">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                      )}

                      {/* Adaptive Learning Badge */}
                      {module.recommendedAction && !module.isLocked && (
                        <div className={cn(
                          "absolute top-0 left-0 sm:top-2 sm:left-2 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest border-2 shadow-sm bg-white/90 backdrop-blur-sm",
                          module.recommendedAction === 'Priority Review' ? 'text-red-500 border-red-200' : 
                          module.recommendedAction === 'Needs Practice' ? 'text-orange-500 border-orange-200' : 
                          'text-green-500 border-green-200'
                        )}>
                          {module.recommendedAction}
                        </div>
                      )}

                      {/* Day number */}
                      <h3 className={cn(
                        "text-5xl font-black mb-2 mt-4 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]",
                        module.isCompleted ? "text-green-500" : !module.isLocked ? "text-[#ff4b3e]" : "text-slate-300"
                      )}>
                        {numLabel}
                      </h3>

                      {/* Title */}
                      <h4 className={cn("text-xl font-black mb-4", module.isLocked ? "text-slate-400" : "text-slate-800")}>
                        {module.title}
                      </h4>

                      {/* Lock overlay */}
                      {module.isLocked && (
                        <div className="absolute inset-0 rounded-[1.5rem] z-10 flex flex-col items-center justify-center bg-slate-100/40 backdrop-blur-[2px] m-2">
                          <div className="bg-white p-4 rounded-full shadow-sm mb-3 border-2 border-slate-200">
                            <Lock className="h-6 w-6 text-slate-400" />
                          </div>
                          <span className="text-sm font-bold text-slate-500 text-center bg-white py-1.5 px-4 rounded-full border-2 border-slate-200 shadow-sm">
                            Complete Module {module.dayNumber - 1} to unlock
                          </span>
                        </div>
                      )}

                      {/* Description */}
                      <p className={cn("text-sm leading-relaxed mb-6 flex-1 font-medium", module.isLocked ? "text-slate-400" : "text-slate-600")}>
                        {module.description}
                      </p>

                      {/* Game label */}
                      {meta && (
                        <div className="flex flex-col gap-2 mb-6">
                          <div className={cn(
                            "flex items-center gap-2 text-xs font-bold w-fit px-3 py-1.5 rounded-xl border-2",
                            module.isCompleted ? "bg-green-50 text-green-600 border-green-100" : module.isLocked ? "bg-slate-50 text-slate-400 border-slate-200" : "bg-blue-50 text-blue-600 border-blue-100"
                          )}>
                            <span className="text-base">{meta.gameIcon}</span>
                            {meta.gameLabel}
                          </div>
                          <div className={cn(
                            "flex items-center gap-2 text-xs font-black w-fit px-3 py-1.5 rounded-xl border-2 uppercase tracking-tight relative overflow-hidden",
                            module.isCompleted 
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200 shadow-sm" 
                              : "bg-slate-50 text-slate-400 border-slate-200"
                          )}>
                            <span className="text-base">{meta.badge.icon}</span>
                            <span>Badge: {meta.badge.name}</span>
                            {module.isCompleted && (
                              <span className="ml-1 px-1.5 py-0.5 bg-yellow-400 text-yellow-900 rounded-md text-[8px] animate-pulse">EARNED!</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Progress bar (in-progress modules) */}
                      {!module.isCompleted && !module.isLocked && module.progress > 0 && (
                        <div className="mb-6">
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className="h-full bg-gradient-to-r from-[#ff4b3e] to-[#ff8c00] rounded-full"
                              style={{ width: `${module.progress}%` }}
                            />
                          </div>
                          <p className="text-[11px] font-bold text-slate-500 mt-1.5 uppercase tracking-wider">{module.progress}% complete</p>
                        </div>
                      )}

                      {/* CTA Button */}
                      <div className="mt-auto border-t-2 border-slate-100 pt-5 flex items-center justify-between relative z-20">
                        {module.isCompleted ? (
                          <>
                            <span className="text-xs font-black tracking-widest text-green-500 uppercase">Completed</span>
                            <Link
                              href={moduleRoute}
                              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-black px-5 py-2 rounded-full text-sm border-2 border-green-600 border-b-[4px] active:border-b-2 active:translate-y-[2px] transition-all"
                            >
                              <CheckCircle className="h-4 w-4" /> Review
                            </Link>
                          </>
                        ) : module.isLocked ? (
                          <>
                            <span className="text-xs font-black tracking-widest text-slate-400 uppercase">Locked</span>
                            <div className="flex items-center gap-2 bg-slate-100 text-slate-400 font-bold px-5 py-2 rounded-full text-sm border-2 border-slate-200">
                              <Lock className="h-3.5 w-3.5" /> Locked
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-black tracking-widest text-orange-500 uppercase">
                              {module.progress > 0 ? "In Progress" : "Available"}
                            </span>
                            <Link
                              href={moduleRoute}
                              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-red-600 font-black px-6 py-2.5 rounded-full text-sm border-2 border-white shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-[0_0px_0_#b45309] transition-all uppercase tracking-wide"
                            >
                              {module.progress > 0 ? "Continue" : "Start"} →
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* ── Certificate Card ── */}
              <div
                className={cn(
                  "relative rounded-3xl flex flex-col transition-all duration-200 overflow-hidden bg-white",
                  completedCount === 5
                    ? "border-[4px] border-yellow-400 shadow-[0_8px_0_#facc15] hover:-translate-y-1 hover:shadow-[0_12px_0_#facc15]"
                    : "border-[4px] border-slate-200 opacity-70"
                )}
              >
                {/* Header Graphic Area */}
                <div className={cn(
                  "h-48 sm:h-56 p-6 flex flex-col justify-end border-b-4 relative overflow-hidden",
                  completedCount === 5 ? "bg-yellow-400 border-yellow-200" : "bg-slate-100 border-slate-200"
                )}>
                  <img 
                    src="/images/kids/module5.png" 
                    alt="" 
                    className={cn(
                      "absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-30 transition-all duration-500",
                      completedCount < 5 && "grayscale"
                    )} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                  
                  <div className="relative z-10">
                    <Trophy className={cn("h-8 w-8 mb-2", completedCount === 5 ? "text-yellow-800" : "text-slate-400")} />
                    <h4 className={cn("text-2xl font-black", completedCount === 5 ? "text-yellow-900" : "text-slate-500")}>
                      Your Certificate
                    </h4>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <p className={cn("text-sm leading-relaxed mb-6 flex-1 font-medium", completedCount === 5 ? "text-slate-700" : "text-slate-500")}>
                    {completedCount === 5 
                      ? "Congratulations! You've completed all modules and earned your Fire Safety Hero Certificate!" 
                      : "Complete all 5 fire safety modules to unlock your official hero certificate."}
                  </p>
                  
                  {/* CTA Button */}
                  <div className="mt-auto border-t-2 border-slate-100 pt-5 flex items-center justify-between">
                    {completedCount === 5 ? (
                      <>
                        <span className="text-xs font-black tracking-widest text-green-500 uppercase">Earned!</span>
                        <Link
                          href="/kids/certificate"
                          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-red-600 font-black px-5 py-2 rounded-full text-sm border-2 border-white shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-[0_0px_0_#b45309] transition-all uppercase tracking-wide"
                        >
                          <Trophy className="h-4 w-4" /> View Certificate
                        </Link>
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-black tracking-widest text-slate-400 uppercase">Locked</span>
                        <div className="flex items-center gap-2 bg-slate-100 text-slate-400 font-bold px-5 py-2 rounded-full text-sm border-2 border-slate-200">
                          <Lock className="h-3.5 w-3.5" /> Locked
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </Deferred>

          {/* ── Motivational Footer ── */}
          <div className="mt-20 border-[4px] border-blue-200 bg-white rounded-[2rem] p-8 sm:p-12 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full blur-3xl -z-0"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -z-0"></div>
            <div className="relative z-10">
              <div className="text-5xl mb-4 animate-bounce">🔥</div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">Keep Up the Great Work!</h3>
              <p className="text-slate-500 font-bold text-lg">
                Every lesson you complete makes you a better fire safety hero! 🦸‍♂️
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
