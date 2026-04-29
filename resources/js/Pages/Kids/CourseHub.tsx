import React, { useMemo } from "react"
import { Link, Deferred } from '@inertiajs/react'
import { ArrowLeft, ArrowRight, BookOpen, Trophy, Shield, CheckCircle, Lock, Flame, ChevronRight, ClipboardCheck } from "lucide-react"
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
        <div className="bg-blue-600 px-4 sm:px-6 py-6 sm:py-8 relative overflow-hidden animate-in slide-in-from-top fade-in duration-500">
          <div className="max-w-6xl mx-auto relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-4 flex-1">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border-2 border-white/30">
                <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-blue-200" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">Course Completed!</h3>
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
      <div className="flex-1 bg-background py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto">

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
          <div className="flex flex-col items-center text-center mb-10 sm:mb-16 space-y-4 sm:space-y-6 relative">
            <div className="absolute top-0 right-0 lg:-right-12 text-4xl sm:text-6xl opacity-20 transform rotate-12 pointer-events-none">✨</div>
            <div className="absolute bottom-10 left-0 lg:-left-12 text-4xl sm:text-6xl opacity-20 transform -rotate-12 pointer-events-none">🔥</div>
            
            <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-full border-2 border-orange-200 dark:border-orange-900/30 shadow-sm">
              FIRE SAFETY TRAINING COURSE
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-primary leading-tight drop-shadow-sm px-2">
              Become a Fire Safety Hero!
            </h1>
            <p className="text-base sm:text-lg font-bold text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed px-4">
              Complete 5 exciting modules to learn how to protect yourself, your family,
              and your friends from fire hazards.
            </p>

            <div className="flex flex-col items-center mt-2 sm:mt-4 gap-2 sm:gap-3">
              <span className="text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-wider">Welcome, Fire Safety Hero:</span>
              <div className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-slate-800 border-[3px] border-yellow-400 px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl shadow-[0_4px_0_#facc15] sm:shadow-[0_6px_0_#facc15] transform -rotate-1 hover:rotate-0 transition-transform">
                <div className="text-xl sm:text-2xl">👨‍🚒</div>
                <span className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white">{user?.name || "Fire Safety Hero"}</span>
              </div>
            </div>
          </div>

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

                return (
                  <div
                    key={module.id}
                    className={cn(
                      "relative overflow-hidden rounded-[1.5rem] flex flex-col transition-all duration-300 bg-white dark:bg-slate-800 group h-[380px] will-change-transform",
                      module.isCompleted
                        ? "border-[4px] border-emerald-500 shadow-xl shadow-emerald-100/40 dark:shadow-emerald-950/20"
                        : module.isLocked
                        ? "border-[3px] border-slate-100 dark:border-slate-800 opacity-80 cursor-not-allowed bg-slate-50 dark:bg-slate-900/50"
                        : "border-[3px] border-white dark:border-slate-700 shadow-xl shadow-orange-100/30 dark:shadow-orange-950/10 hover:-translate-y-1.5"
                    )}
                  >
                    {/* Top Header Background Image */}
                    {meta?.bgImage && (
                      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none overflow-hidden">
                        <img 
                          src={meta.bgImage} 
                          alt="" 
                          className={cn(
                            "absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out",
                            module.isLocked ? "opacity-5 grayscale" : "opacity-[0.5] group-hover:opacity-[0.6] group-hover:scale-105"
                          )} 
                        />
                        <div className="absolute inset-0 bg-white dark:bg-slate-800 opacity-80"></div>
                      </div>
                    )}

                    {/* Content Container */}
                    <div className="relative z-10 p-5 sm:p-6 pb-4 sm:pb-5 flex flex-col flex-1 h-full">
                      {/* Status Badges Row */}
                      <div className="flex items-center justify-between mb-3 h-6">
                         {/* Adaptive Learning Badge */}
                        {module.recommendedAction && !module.isLocked ? (
                          <div className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all duration-300",
                            module.recommendedAction === 'Priority Review' ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30' : 
                            module.recommendedAction === 'Needs Practice' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/30' : 
                            'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
                          )}>
                            {module.recommendedAction}
                          </div>
                        ) : <div />}

                        {/* Completed icon */}
                        {module.isCompleted && (
                          <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 animate-in zoom-in duration-500">
                            <CheckCircle className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Module Number */}
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className={cn(
                          "text-3xl font-black italic tracking-tighter opacity-100 leading-none",
                          module.isCompleted ? "text-emerald-500" : !module.isLocked ? "text-orange-500" : "text-slate-400 dark:text-slate-600"
                        )}>
                          {numLabel}
                        </span>
                        <div className={cn(
                          "h-1 w-8 rounded-full",
                          module.isCompleted ? "bg-emerald-400" : !module.isLocked ? "bg-orange-400" : "bg-slate-200 dark:bg-slate-700"
                        )}></div>
                      </div>

                      {/* Title */}
                      <h4 className={cn(
                        "text-xl font-black mb-3 leading-snug transition-colors duration-300",
                        module.isLocked ? "text-slate-400 dark:text-slate-600" : "text-slate-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400"
                      )}>
                        {module.title}
                      </h4>

                      {/* Description */}
                      <div className="min-h-[56px] mb-5">
                        <p className={cn(
                          "text-sm leading-relaxed font-bold line-clamp-2",
                          module.isLocked ? "text-slate-300 dark:text-slate-600" : "text-slate-500 dark:text-slate-400"
                        )}>
                          {module.description}
                        </p>
                      </div>

                      {/* Interaction Pills */}
                      {meta && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          <div className={cn(
                            "flex items-center gap-2 text-xs font-black px-3 py-1.5 rounded-xl border uppercase tracking-tight transition-all duration-300 h-fit",
                            module.isCompleted 
                              ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-500 border-amber-200 dark:border-amber-900/30" 
                              : "bg-slate-50 dark:bg-slate-900/30 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800"
                          )}>
                            <span className="text-sm">{meta.badge.icon}</span>
                            <span>{meta.badge.name} Badge</span>
                          </div>
                        </div>
                      )}

                      {/* Progress bar (Only if needed) */}
                      {!module.isCompleted && !module.isLocked && module.progress > 0 && (
                        <div className="mb-6 h-3 flex items-center">
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-1000"
                              style={{ width: `${module.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex-1" />

                      {/* CTA Button Area */}
                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between relative z-20">
                        {module.isCompleted ? (
                          <>
                            <div className="flex flex-col">
                               <span className="text-[9px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase leading-none">Status</span>
                               <span className="text-xs font-black text-slate-400 dark:text-slate-500">Completed</span>
                            </div>
                            <Link
                              href={moduleRoute}
                              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black px-6 py-2.5 rounded-xl text-sm border-b-[4px] border-emerald-700 active:border-b-0 active:translate-y-[4px] shadow-lg transition-all uppercase tracking-wide"
                            >
                              <CheckCircle className="h-4 w-4" /> Review
                            </Link>
                          </>
                        ) : module.isLocked ? (
                          <>
                            <div className="flex flex-col opacity-50">
                               <span className="text-[9px] font-black tracking-widest text-slate-400 dark:text-slate-600 uppercase leading-none">Status</span>
                               <span className="text-xs font-black text-slate-400 dark:text-slate-600">Locked</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 font-bold px-6 py-2.5 rounded-xl text-sm border-2 border-slate-200 dark:border-slate-800 cursor-not-allowed">
                              <Lock className="h-4 w-4" /> Locked
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex flex-col">
                               <span className="text-[9px] font-black tracking-widest text-orange-500 dark:text-orange-400 uppercase leading-none">Status</span>
                               <span className="text-xs font-black text-slate-400 dark:text-slate-500">{module.progress > 0 ? "In Progress" : "Available"}</span>
                            </div>
                            <Link
                              href={moduleRoute}
                              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-black px-8 py-3 rounded-xl text-sm border-b-[4px] border-orange-700 active:border-b-0 active:translate-y-[4px] shadow-xl shadow-orange-100 dark:shadow-orange-950/20 transition-all uppercase tracking-wide"
                            >
                              {module.progress > 0 ? "Continue" : "Start Now"}
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Lock overlay */}
                    {module.isLocked && (
                      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/20">
                        <div className="bg-white/90 dark:bg-slate-800/90 p-4 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 transform rotate-3">
                          <Lock className="h-8 w-8 text-slate-200 dark:text-slate-700" />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* ── Certificate Card ── */}
              <div
                className={cn(
                  "relative rounded-[1.5rem] flex flex-col transition-all duration-500 overflow-hidden bg-white dark:bg-slate-800 h-[380px]",
                  completedCount === 5
                    ? "border-[4px] border-yellow-400 shadow-xl shadow-yellow-100/40 dark:shadow-yellow-950/20 hover:-translate-y-1.5"
                    : "border-[3px] border-slate-100 dark:border-slate-800 opacity-80"
                )}
              >
                {/* Header Graphic Area */}
                <div className={cn(
                  "h-32 sm:h-40 p-5 flex flex-col justify-end border-b-4 relative overflow-hidden",
                  completedCount === 5 ? "bg-yellow-400 border-yellow-200 dark:bg-yellow-500 dark:border-yellow-600" : "bg-slate-100 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800"
                )}>
                  <img 
                    src="/images/kids/module5.png" 
                    alt="" 
                    className={cn(
                      "absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-20 transition-all duration-500",
                      completedCount < 5 && "grayscale"
                    )} 
                  />
                  <div className="absolute inset-0 bg-white/40 dark:bg-slate-800/40"></div>
                  
                  <div className="relative z-10">
                    <Trophy className={cn("h-10 w-10 mb-2", completedCount === 5 ? "text-yellow-800 dark:text-yellow-950" : "text-slate-400 dark:text-slate-600")} />
                    <h4 className={cn("text-2xl font-black", completedCount === 5 ? "text-yellow-900 dark:text-yellow-950" : "text-slate-500 dark:text-slate-600")}>
                      Your Certificate
                    </h4>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pb-4 sm:pb-5 flex flex-col flex-1">
                  <p className={cn("text-sm leading-relaxed mb-6 flex-1 font-bold", completedCount === 5 ? "text-slate-700 dark:text-slate-300" : "text-slate-500 dark:text-slate-500")}>
                    {completedCount === 5 
                      ? "Congratulations! You've completed all modules and earned your Fire Safety Hero Certificate!" 
                      : "Complete all 5 fire safety modules to unlock your official hero certificate."}
                  </p>
                  
                  {/* CTA Button */}
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    {completedCount === 5 ? (
                      <>
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black tracking-widest text-emerald-500 dark:text-emerald-400 uppercase leading-none">Status</span>
                           <span className="text-xs font-black text-slate-400 dark:text-slate-500">Earned!</span>
                        </div>
                        <Link
                          href="/kids/certificate"
                          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-red-600 font-black px-6 py-2.5 rounded-xl text-sm border-b-[4px] border-yellow-700 active:border-b-0 active:translate-y-[4px] shadow-lg transition-all uppercase tracking-wide"
                        >
                          <Trophy className="h-4 w-4" /> View Certificate
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col opacity-50">
                           <span className="text-[9px] font-black tracking-widest text-slate-400 dark:text-slate-600 uppercase leading-none">Status</span>
                           <span className="text-xs font-black text-slate-400 dark:text-slate-600">Locked</span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 font-bold px-6 py-2.5 rounded-xl text-sm border-2 border-slate-200 dark:border-slate-800">
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
          <div className="mt-20 border-[4px] border-blue-200 dark:border-slate-800 bg-white dark:bg-slate-800 rounded-[2rem] p-8 sm:p-12 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -z-0"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full -z-0"></div>
            <div className="relative z-10">
              <div className="text-5xl mb-4 animate-bounce">🔥</div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-2">Keep Up the Great Work!</h3>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">
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
