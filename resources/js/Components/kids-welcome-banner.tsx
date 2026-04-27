"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Flame, Sparkles, Gamepad2, BookOpen, Trophy, Lock, Shield, Star, Zap, ChevronRight, Calendar, BadgeCheck, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from "@/Components/ui/dialog"

interface KidsWelcomeBannerProps {
  completedModules: number[]
  earnedBadges?: any[]
}

export function KidsWelcomeBanner({ completedModules = [], earnedBadges = [] }: KidsWelcomeBannerProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const firstName = user?.name?.split(' ')[0] || 'Fire Hero'
  
  // All possible badges with source info
  const allBadges = [
    { id: 'module_1', moduleNum: 1, name: "Fire Triangle", source: "Module 1", icon: "🔥" },
    { id: 'module_2', moduleNum: 2, name: "Safety Leader", source: "Module 2", icon: "🛡️" },
    { id: 'module_3', moduleNum: 3, name: "Plan Master", source: "Module 3", icon: "📢" },
    { id: 'module_4', moduleNum: 4, name: "Low & Go!", source: "Module 4", icon: "🏃" },
    { id: 'module_5', moduleNum: 5, name: "Home Guard", source: "Module 5", icon: "🏘️" },
    { id: 'quiz_hero', name: "Quiz Hero", source: "Fire Quiz", icon: "🏆" },
    { id: 'memory_master', name: "Memory Master", source: "Memory Game", icon: "🧠" },
    {id: 'smoke_scout', name: "Smoke Scout", source: "Smoke Crawl", icon: "🔦" },
    { id: 'safety_scout', name: "Safety Scout", source: "Hot or Not", icon: "🤖" },
    { id: 'intel_analyst', name: "Intel Analyst", source: "Mission Intel", icon: "🎬" }
  ]

  const totalBadges = allBadges.length
  
  const getBadgeData = (badgeId: string, moduleNum?: number) => {
    const earned = earnedBadges.find(b => b.badge_id === badgeId)
    const isEarned = (moduleNum && completedModules.includes(moduleNum)) || !!earned
    return { isEarned, date: earned?.earnedAt || (isEarned ? "Recent" : null) }
  }

  const badgesFound = allBadges.filter(b => getBadgeData(b.id, b.moduleNum).isEarned).length
  const progressPercent = (badgesFound / totalBadges) * 100

  // Avatars Mapping
  const AVATAR_MAP: Record<string, string> = {
    cow: '🐮', ff1: '👨‍🚒', ff2: '👩‍🚒', kid1: '🧒', kid2: '👧', adult1: '👨', adult2: '👩',
  }
  const userAvatar = AVATAR_MAP[user?.avatar || 'cow'] || '🐮'

  // Ranking Logic
  const getHeroRank = (count: number) => {
    if (count >= 8) return { name: "Legendary Hero", color: "text-yellow-300", bg: "bg-yellow-400/30", icon: Star }
    if (count >= 5) return { name: "Master Hero", color: "text-orange-300", bg: "bg-orange-400/30", icon: Trophy }
    if (count >= 3) return { name: "Safety Elite", color: "text-blue-300", bg: "bg-blue-400/30", icon: Shield }
    if (count >= 1) return { name: "Fire Scout", color: "text-green-300", bg: "bg-green-400/30", icon: Flame }
    return { name: "Recruit", color: "text-slate-300", bg: "bg-slate-400/30", icon: Zap }
  }

  const currentRank = getHeroRank(badgesFound)
  const RankIcon = currentRank.icon

  const formatDate = (dateStr?: string) => {
    if (!dateStr || dateStr === "Recent") return "Today"
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return "Today"
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
    } catch { return "Today" }
  }

  return (
    <div className="relative bg-gradient-to-br from-rose-600 via-red-500 to-orange-500 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_15px_40px_rgba(244,63,94,0.3)] mb-6 sm:mb-8 border-4 sm:border-[6px] border-white/90 overflow-hidden transform translate-z-0">
      
      {/* Decorative Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 px-4 sm:px-10 py-5 sm:py-6 lg:py-7 flex flex-col items-center">
        
        {/* ── Header ── */}
        <div className="text-center mb-5 lg:mb-6">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white drop-shadow-md tracking-tighter mb-0.5">
            Welcome, <span className="text-yellow-300">{firstName}!</span>
          </h1>
          <p className="text-sm sm:text-lg lg:text-xl font-bold text-yellow-50/90 tracking-tight flex items-center justify-center gap-2">
            You are a <span className="text-yellow-300 underline decoration-yellow-400/50 underline-offset-4">{currentRank.name}!</span> 🎖️
          </p>
        </div>

        {/* ── Stats Row ── */}
        <div className="hidden lg:flex items-stretch justify-center w-full gap-5 mb-6 max-w-4xl">
           
           {/* Card 1: Hero Rank */}
           <div className="flex-1 bg-white/10 backdrop-blur-md rounded-[1.5rem] p-5 border border-white/20 flex items-center gap-5 shadow-xl group hover:bg-white/15 transition-all">
              <div className="h-16 w-16 rounded-full bg-white shadow-2xl flex items-center justify-center text-4xl transform group-hover:scale-110 transition-transform duration-300">
                {userAvatar}
              </div>
              <div className="flex flex-col items-start">
                 <span className="text-[9px] font-black text-yellow-300/80 uppercase tracking-[0.2em] mb-0.5">Hero Rank</span>
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-1.5">
                    {currentRank.name}
                 </h3>
                 <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-yellow-400 rounded-full text-red-700 font-black text-[10px] uppercase">
                    <RankIcon className="h-2.5 w-2.5" />
                    Level {Math.floor(badgesFound / 2) + 1}
                 </div>
              </div>
           </div>

           {/* Card 2: Achieved Badges & XP Bar */}
           <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <div className="flex-[1.2] bg-white/10 backdrop-blur-md rounded-[1.5rem] p-5 border border-white/20 flex flex-col shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                      <Trophy className="h-3.5 w-3.5 text-yellow-300" />
                      <span className="text-[9px] font-black text-yellow-300/80 uppercase tracking-[0.2em]">Achieved Badges</span>
                  </div>
                  
                  <DialogTrigger asChild>
                    <button 
                      className="px-3 py-1 bg-yellow-400 hover:bg-yellow-300 rounded-lg text-red-700 font-black text-[10px] uppercase tracking-wider transition-all active:scale-90 shadow-sm border border-yellow-500/20"
                      onClick={() => setIsOpen(true)}
                    >
                      More
                    </button>
                  </DialogTrigger>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {allBadges
                    .map(b => ({ ...b, earned: getBadgeData(b.id, b.moduleNum).isEarned }))
                    .sort((a, b) => (b.earned ? 1 : 0) - (a.earned ? 1 : 0))
                    .slice(0, 5)
                    .map((badge, i) => (
                      <div key={i} className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center text-xl transition-all shadow-lg border",
                        badge.earned 
                          ? "bg-gradient-to-br from-yellow-300 to-orange-400 border-white/30" 
                          : "bg-black/20 border-white/5 opacity-30"
                      )}>
                        {badge.earned ? badge.icon : <Lock className="h-3 w-3 text-white/20" />}
                      </div>
                    ))
                  }
                  {badgesFound > 5 && (
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-yellow-300 font-black text-xs shadow-lg">
                      +{badgesFound - 5}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center px-1">
                      <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Next Rank Progress</span>
                      <span className="text-[10px] font-black text-yellow-300">{progressPercent.toFixed(0)}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-black/30 rounded-full border border-white/5 overflow-hidden p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-300 to-white rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(255,255,255,0.4)]" 
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                  </div>
                </div>
            </div>

            {/* Badge Modal - ENHANCED WITH DATES & SOURCE */}
            <DialogContent showCloseButton={false} className="w-[92vw] sm:max-w-2xl bg-[#ff4b3e] border-none text-white rounded-[2rem] p-0 overflow-hidden shadow-2xl transform-gpu">
              <div className="p-5 sm:p-8 lg:p-10 relative bg-gradient-to-b from-rose-500 to-orange-500 h-full">
                <DialogClose className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4 text-white" />
                </DialogClose>
                
                <DialogHeader className="mb-8 relative z-10 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-400 rounded-2xl shadow-lg">
                      <Trophy className="h-6 w-6 text-red-600" />
                    </div>
                    <DialogTitle className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-white drop-shadow-md">Hero Badge Hall</DialogTitle>
                  </div>
                  <DialogDescription className="sr-only">Detailed list of your earned badges including dates and source.</DialogDescription>
                  <p className="text-white/80 font-bold text-sm sm:text-lg">Every badge tells the story of your hero training!</p>
                </DialogHeader>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 overflow-y-auto max-h-[55vh] pr-2 custom-scrollbar overscroll-contain">
                  {allBadges.map((badge, i) => {
                    const badgeState = getBadgeData(badge.id, (badge as any).moduleNum)
                    return (
                      <div key={i} className={cn(
                        "relative p-3 sm:p-5 rounded-2xl border transition-all flex flex-col items-center text-center group",
                        badgeState.isEarned 
                          ? "bg-white/10 border-white/20 shadow-xl" 
                          : "bg-black/10 border-white/5 opacity-40"
                      )}>
                        {/* Icon */}
                        <div className={cn(
                          "h-12 w-12 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl mb-3 shadow-lg relative transform group-hover:scale-110 transition-transform",
                          badgeState.isEarned ? "bg-gradient-to-br from-yellow-300 to-orange-400 border-2 border-white/30" : "bg-white/5 border border-white/10"
                        )}>
                          {badgeState.isEarned ? badge.icon : <Lock className="h-5 w-5 text-white/20" />}
                          {badgeState.isEarned && (
                            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white shadow-md">
                               <BadgeCheck className="h-2 w-2 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Text Info */}
                        <div className="flex flex-col gap-0.5 w-full">
                          <h5 className="font-black text-[10px] sm:text-sm uppercase tracking-tight text-white">{badgeState.isEarned ? badge.name : "Locked"}</h5>
                          {badgeState.isEarned ? (
                            <>
                              <span className="text-[8px] sm:text-[10px] font-bold text-yellow-300/80 uppercase tracking-widest">{badge.source}</span>
                              <div className="mt-2 py-1 px-2 bg-black/20 rounded-lg flex items-center justify-center gap-1 border border-white/5">
                                 <Calendar className="h-2.5 w-2.5 text-white/50" />
                                 <span className="text-[8px] sm:text-[9px] font-black text-white/90">{formatDate(badgeState.date)}</span>
                              </div>
                            </>
                          ) : (
                            <span className="text-[8px] sm:text-[10px] font-bold text-white/20 uppercase">Keep Training!</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </DialogContent>
           </Dialog>
        </div>

        {/* ── Mobile/Fallback Stats Button ── */}
        <div className="lg:hidden w-full max-w-sm mb-5">
          <button 
            className="w-full bg-white/15 hover:bg-white/20 rounded-2xl p-3 border border-white/20 flex items-center gap-4 transition-all active:scale-95 shadow-xl"
            onClick={() => setIsOpen(true)}
          >
            <div className="h-10 w-10 rounded-full bg-white shadow-xl flex items-center justify-center text-2xl overflow-hidden shrink-0">
              {userAvatar}
            </div>
            <div className="flex flex-col items-start flex-1">
              <div className={cn("px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-[0.15em] mb-0.5 shadow-sm", currentRank.bg, currentRank.color)}>
                {currentRank.name}
              </div>
              <div className="text-white font-black text-[11px] uppercase tracking-tight">View Hero Stats</div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-yellow-300" />
          </button>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-row justify-center items-center w-full gap-2 sm:gap-4 px-1 max-w-2xl">
          {[
            { label: "Play", icon: Gamepad2, color: "bg-[#22c55e]", shadow: "#15803d", href: "/kids/safescape" },
            { label: "Learn", icon: BookOpen, color: "bg-[#3b82f6]", shadow: "#1d4ed8", href: "/kids/intel" },
            { label: "Win", icon: Trophy, color: "bg-[#facc15]", shadow: "#ca8a04", textColor: "text-amber-900", href: "/kids/rewards" }
          ].map((btn, i) => (
            <button 
              key={i}
              className={cn(
                "group/btn relative flex items-center justify-center gap-1.5 sm:gap-3 px-2 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl border-none transition-all duration-200 cursor-pointer overflow-hidden flex-1 sm:flex-initial lg:flex-1 max-w-[100px] sm:max-w-[160px] lg:max-w-[180px]",
                btn.color,
                btn.textColor || "text-white",
                "shadow-[0_4px_0_0_var(--btn-shadow)] sm:shadow-[0_5px_0_0_var(--btn-shadow)]",
                "hover:translate-y-[1.5px] active:translate-y-[3px] active:shadow-none"
              )}
              style={{ "--btn-shadow": btn.shadow } as React.CSSProperties}
            >
              <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
              <btn.icon className={cn("h-4 w-4 sm:h-5 lg:h-5 transition-transform group-hover/btn:scale-110", btn.textColor ? "fill-amber-900" : "fill-white")} />
              <span className="font-black text-[9px] sm:text-base lg:text-lg tracking-wide uppercase whitespace-nowrap">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer { 0% { transform: translateX(-100%) skewX(-20deg); } 100% { transform: translateX(200%) skewX(-20deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
      ` }} />
    </div>
  )
}
