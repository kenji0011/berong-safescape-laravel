import React from "react"
import { Link } from '@inertiajs/react'
import { ArrowLeft, Trophy, Lock, Calendar, Shield, CheckCircle, Zap, ArrowRight, BadgeCheck } from "lucide-react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

interface BadgeHallProps {
  completedModules: number[]
  earnedBadges?: any[]
}

const ALL_BADGES = [
  { id: 'module_1', moduleNum: 1, name: "Fire Triangle", source: "Module 1", icon: "🔥", hint: "Complete Module 1: Fire is a Tool, Not a Toy and pass the quiz.", target: "/kids/safescape/1" },
  { id: 'module_2', moduleNum: 2, name: "Safety Leader", source: "Module 2", icon: "🛡️", hint: "Master the Fire Drill in Module 2 to earn this badge.", target: "/kids/safescape/2" },
  { id: 'module_3', moduleNum: 3, name: "Plan Master", source: "Module 3", icon: "📢", hint: "Create your Family Escape Plan in Module 3.", target: "/kids/safescape/3" },
  { id: 'module_4', moduleNum: 4, name: "Low & Go!", source: "Module 4", icon: "🏃", hint: "Learn the Smoke Crawling technique in Module 4.", target: "/kids/safescape/4" },
  { id: 'module_5', moduleNum: 5, name: "Home Guard", source: "Module 5", icon: "🏘️", hint: "Complete the final Module 5 training session.", target: "/kids/safescape/5" },
  { id: 'quiz_hero', name: "Quiz Hero", source: "Fire Quiz", icon: "🏆", hint: "Score 100% on any Fire Safety Quiz.", target: "/kids/challenges" },
  { id: 'memory_master', name: "Memory Master", source: "Memory Game", icon: "🧠", hint: "Finish the Memory Match game with zero mistakes.", target: "/kids/challenges" },
  { id: 'smoke_scout', name: "Smoke Scout", source: "Smoke Crawl", icon: "🔦", hint: "Navigate the Smoke Labyrinth safely.", target: "/kids/safescape/4" },
  { id: 'safety_scout', name: "Safety Scout", source: "Hot or Not", icon: "🤖", hint: "Correcty identify all hazards in the Hazard House.", target: "/kids/challenges" },
  { id: 'intel_analyst', name: "Intel Analyst", source: "Videos", icon: "🎬", hint: "Watch all fire safety training videos.", target: "/kids/videos" }
]

const BadgeHallPage = ({ completedModules = [], earnedBadges = [] }: BadgeHallProps) => {
  const { user } = useAuth()
  
  const getBadgeState = (badge: typeof ALL_BADGES[0]) => {
    const earned = earnedBadges.find(b => b.badge_id === badge.id)
    const isEarned = (badge.moduleNum && completedModules.includes(badge.moduleNum)) || !!earned
    return { isEarned, date: earned?.earnedAt || (isEarned ? "Recent" : null) }
  }

  const earnedCount = ALL_BADGES.filter(b => getBadgeState(b).isEarned).length

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex flex-col text-white">
      {/* ── High-Impact Hero Header: Optimized for Mobile Readability ── */}
      <div className="relative pt-8 sm:pt-12 pb-12 sm:pb-20 px-4 sm:px-10 bg-primary overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <Link
            href="/kids"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-2xl text-white font-black text-xs sm:text-sm hover:bg-white/20 border-2 border-white/20 transition-all mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="flex flex-row items-center gap-6 sm:gap-12">
            <div className="h-24 w-24 sm:h-44 sm:w-44 bg-white/20 rounded-[2rem] sm:rounded-[3rem] flex items-center justify-center text-5xl sm:text-8xl shadow-2xl border-2 sm:border-4 border-white/30 shrink-0 transform -rotate-3">
               {earnedCount >= 5 ? '🏆' : '🎖️'}
            </div>
            
            <div className="text-left flex-1">
              <div className="flex items-center gap-2 mb-2 sm:mb-4">
                <span className="px-3 py-1 bg-yellow-400 text-red-700 text-[10px] sm:text-xs font-black rounded-full uppercase tracking-widest shadow-lg">Hero Hall</span>
                <span className="text-yellow-200 font-black text-xs sm:text-base">{earnedCount} / {ALL_BADGES.length}</span>
              </div>
              <h1 className="text-4xl sm:text-7xl font-black uppercase tracking-tighter leading-none mb-2 sm:mb-4 text-white drop-shadow-2xl">
                Badge <span className="text-yellow-300">Hall</span>
              </h1>
              <p className="text-xs sm:text-xl font-bold text-white leading-tight max-w-2xl opacity-95">
                Collect all badges to become a <span className="text-yellow-300">Legendary Fire Hero!</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Area: 2 Columns on Mobile ── */}
      <div className="flex-1 bg-slate-900/50 -mt-6 sm:-mt-10 rounded-t-[2rem] sm:rounded-t-[4rem] border-t-4 sm:border-t-8 border-slate-900 px-3 sm:px-6 py-10 sm:py-16 pb-24">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {ALL_BADGES.map((badge, i) => {
              const state = getBadgeState(badge)
              return (
                <div 
                  key={i} 
                  className={cn(
                    "group relative p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border-2 sm:border-[3px] transition-all duration-500 flex flex-col aspect-square sm:aspect-auto sm:h-[300px] overflow-hidden",
                    state.isEarned 
                      ? "bg-slate-800 border-white/10 shadow-xl hover:-translate-y-1.5 sm:hover:-translate-y-2" 
                      : "bg-slate-950/40 border-slate-800/40 opacity-60"
                  )}
                >
                  {/* Badge Graphic Row - Larger Icons */}
                  <div className="flex items-start justify-between mb-4 sm:mb-6 shrink-0">
                    <div className={cn(
                      "h-12 w-12 sm:h-20 sm:w-20 rounded-xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-6xl shadow-lg relative transform group-hover:scale-110 transition-transform duration-500",
                      state.isEarned 
                        ? "bg-yellow-400 border-2 sm:border-[4px] border-white/20" 
                        : "bg-slate-900 border border-slate-800"
                    )}>
                      {state.isEarned ? badge.icon : <Lock className="h-5 w-5 sm:h-8 sm:w-8 text-slate-700" />}
                      {state.isEarned && (
                        <div className="absolute -top-1.5 -right-1.5 bg-green-500 rounded-full p-1 border-2 sm:border-[4px] border-slate-800 shadow-md">
                           <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {state.isEarned && (
                      <div className="hidden sm:flex bg-slate-900/50 px-3 py-2 rounded-xl border border-white/5 flex-col items-end">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Earned</span>
                        <div className="flex items-center gap-1 text-yellow-400 font-black text-[10px]">
                          {state.date === "Recent" ? "Today" : new Date(state.date!).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Text Details Area - Optimized Mobile Typography */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <h3 className={cn(
                      "text-sm sm:text-xl font-black uppercase tracking-tight mb-1 truncate",
                      state.isEarned ? "text-white" : "text-slate-600"
                    )}>
                      {state.isEarned ? badge.name : "Locked"}
                    </h3>
                    
                    <div className={cn(
                      "inline-block self-start px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-3",
                      state.isEarned ? "bg-blue-900/30 text-blue-400 border border-blue-500/20" : "bg-slate-900 text-slate-700"
                    )}>
                      {badge.source}
                    </div>
                    
                    <p className={cn(
                      "text-[10px] sm:text-sm font-bold leading-tight line-clamp-2 sm:line-clamp-4",
                      state.isEarned ? "text-slate-400" : "text-slate-600 italic"
                    )}>
                      {state.isEarned 
                        ? `Mastered hero skills in ${badge.source}.` 
                        : badge.hint}
                    </p>
                  </div>

                  {/* Action Link (If Locked) - Compact on Mobile */}
                  {!state.isEarned && (
                    <div className="mt-auto pt-3 sm:pt-5 border-t border-slate-800/50">
                      <Link 
                        href={badge.target || "/kids/safescape"} 
                        className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-2.5 rounded-xl flex items-center justify-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-[0_4px_0_rgb(154,52,18)] active:shadow-none active:translate-y-[4px] border-t border-white/20"
                      >
                        Go!
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Link>
                    </div>
                  )}
                  
                  {/* Decorative Spacer */}
                  {state.isEarned && <div className="mt-auto h-[10px] sm:h-[40px]" />}
                </div>
              )
            })}
          </div>

          {/* Compact Motivational Footer for Mobile */}
          <div className="mt-12 sm:mt-20 p-6 sm:p-12 bg-blue-600 rounded-[2.5rem] sm:rounded-[3rem] border-4 border-white/10 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -z-0"></div>
            <div className="relative z-10">
              <Shield className="h-10 w-10 sm:h-16 sm:w-16 text-yellow-300 mx-auto mb-4 sm:mb-6" />
              <h2 className="text-xl sm:text-5xl font-black uppercase mb-2 sm:mb-4">You're Doing Great!</h2>
              <p className="text-sm sm:text-2xl font-bold text-white/80 max-w-2xl mx-auto leading-tight">
                Only {ALL_BADGES.length - earnedCount} badges left to go. Keep training and keep the community safe!
              </p>
              <Link
                href="/kids"
                className="mt-6 sm:mt-10 inline-flex items-center gap-2 sm:gap-3 px-8 py-3 sm:px-12 sm:py-5 bg-white text-blue-700 font-black rounded-xl sm:rounded-2xl shadow-xl hover:bg-yellow-400 hover:text-red-700 transition-all uppercase tracking-widest text-xs sm:text-lg"
              >
                Continue Training
                <ArrowLeft className="h-4 w-4 sm:h-6 sm:w-6 rotate-180" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

BadgeHallPage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default BadgeHallPage
