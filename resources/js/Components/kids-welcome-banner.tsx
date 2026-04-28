"use client"

import { useAuth } from "@/lib/auth-context"
import { Link } from '@inertiajs/react'
import { Flame, Trophy, Lock, Shield, Star, Zap, ChevronRight, BadgeCheck, Gamepad2, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface KidsWelcomeBannerProps {
  completedModules: number[]
  earnedBadges?: any[]
}

export function KidsWelcomeBanner({ completedModules = [], earnedBadges = [] }: KidsWelcomeBannerProps) {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'Fire Hero'
  
  // All possible badges for summary
  const allBadgesSummary = [
    { id: 'module_1', moduleNum: 1, icon: "🔥" },
    { id: 'module_2', moduleNum: 2, icon: "🛡️" },
    { id: 'module_3', moduleNum: 3, icon: "📢" },
    { id: 'module_4', moduleNum: 4, icon: "🏃" },
    { id: 'module_5', moduleNum: 5, icon: "🏘️" },
    { id: 'quiz_hero', icon: "🏆" },
    { id: 'memory_master', icon: "🧠" },
  ]

  const totalBadges = 10 // Total badges in the Hall of Fame
  
  const isBadgeEarned = (badgeId: string, moduleNum?: number) => {
    const earned = earnedBadges.find(b => b.badge_id === badgeId)
    return (moduleNum && completedModules.includes(moduleNum)) || !!earned
  }

  const badgesFound = earnedBadges.length + completedModules.length // Simplified for banner
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

  return (
    <div className="relative bg-gradient-to-br from-rose-600 via-red-500 to-orange-500 rounded-2xl sm:rounded-[2.5rem] shadow-[0_15px_40px_rgba(244,63,94,0.3)] mb-6 sm:mb-8 border-[3px] sm:border-[6px] border-white/90 overflow-hidden transform translate-z-0">
      
      {/* Decorative Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/20 rounded-full blur-[60px] sm:blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/20 rounded-full blur-[60px] sm:blur-[100px]"></div>
      </div>

      <div className="relative z-10 px-4 sm:px-10 pt-6 sm:pt-8 lg:pt-10 pb-4 sm:pb-6 lg:pb-4 flex flex-col items-center">
        
        {/* ── Header: Now includes Avatar on Mobile ── */}
        <div className="text-center mb-6 lg:mb-8 flex flex-col items-center gap-3">
          <div className="sm:hidden h-16 w-16 rounded-full bg-white shadow-xl flex items-center justify-center text-3xl border-2 border-white transform rotate-3">
            {userAvatar}
          </div>
          <div>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white drop-shadow-md tracking-tighter mb-1">
              Welcome, <span className="text-yellow-300">{firstName}!</span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-yellow-50/90 font-black text-sm sm:text-xl tracking-tight">
              You are a <span className="text-yellow-300 underline underline-offset-4 decoration-yellow-400/50">{currentRank.name}</span> <RankIcon className="h-5 w-5 sm:h-6 sm:w-6 fill-yellow-300 text-yellow-300" />
            </div>
          </div>
        </div>
 
        {/* ── Stats Container ── */}
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
           
           {/* Card 1: Identity & Rank - HIDDEN ON MOBILE */}
           <div className="hidden lg:flex bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/20 items-center gap-6 shadow-2xl">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white shadow-inner flex items-center justify-center text-4xl sm:text-5xl border-4 border-white transform hover:scale-110 transition-transform duration-500">
                {userAvatar}
              </div>
              <div className="flex-1">
                 <span className="text-[10px] font-black text-yellow-300/80 uppercase tracking-widest block mb-1">HERO IDENTITY</span>
                 <h3 className="text-2xl sm:text-4xl font-black text-white leading-none mb-3">{firstName}</h3>
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400 rounded-full text-red-700 font-black text-xs uppercase shadow-md">
                    <RankIcon className="h-3 w-3" />
                    Level {Math.floor(badgesFound / 2) + 1}
                 </div>
              </div>
           </div>

           {/* Card 2: Badges Summary Link */}
           <Link 
             href="/kids/badges"
             className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/20 flex flex-col shadow-2xl hover:bg-white/15 transition-all group"
           >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-300" />
                    <span className="text-[10px] font-black text-yellow-300/80 uppercase tracking-widest">Achieved Badges</span>
                </div>
                <div className="px-4 py-1.5 bg-yellow-400 group-hover:bg-yellow-300 rounded-xl text-red-700 font-black text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg">
                  Open Hall
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                {allBadgesSummary.slice(0, 5).map((badge, i) => {
                  const earned = isBadgeEarned(badge.id, badge.moduleNum)
                  return (
                    <div key={i} className={cn(
                      "h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl transition-all shadow-lg border-2",
                      earned 
                        ? "bg-gradient-to-br from-yellow-300 to-orange-400 border-white/30" 
                        : "bg-black/30 border-white/5 opacity-30"
                    )}>
                      {earned ? badge.icon : <Lock className="h-3 w-3 text-white/20" />}
                    </div>
                  )
                })}
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center bg-white/10 border border-white/20 text-yellow-300 font-black text-sm">
                  +{totalBadges - 5}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Global Ranking Progress</span>
                    <span className="text-xs font-black text-yellow-300">{progressPercent.toFixed(0)}%</span>
                </div>
                <div className="h-3 w-full bg-black/40 rounded-full border border-white/10 overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-300 via-orange-400 to-white rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
              </div>
           </Link>
        </div>

        {/* ── Original High-Impact Motto Tags: Non-Selectable & Ultra-Tight ── */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mt-1 sm:mt-2 pb-2 select-none">
          {/* Play Tag */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-4 py-1.5 sm:px-8 sm:py-3 bg-emerald-500 rounded-xl sm:rounded-2xl shadow-[0_4px_0_rgb(5,150,105)] border-t border-white/30 text-white transform transition-transform active:translate-y-1 active:shadow-none cursor-default">
            <Gamepad2 className="h-3 w-3 sm:h-5 sm:w-5" />
            <span className="text-[10px] sm:text-base font-black uppercase tracking-widest">Play</span>
          </div>
          
          {/* Learn Tag */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-4 py-1.5 sm:px-8 sm:py-3 bg-blue-600 rounded-xl sm:rounded-2xl shadow-[0_4px_0_rgb(29,78,216)] border-t border-white/30 text-white transform transition-transform active:translate-y-1 active:shadow-none cursor-default">
            <BookOpen className="h-3 w-3 sm:h-5 sm:w-5" />
            <span className="text-[10px] sm:text-base font-black uppercase tracking-widest">Learn</span>
          </div>
          
          {/* Win Tag */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-4 py-1.5 sm:px-8 sm:py-3 bg-yellow-400 rounded-xl sm:rounded-2xl shadow-[0_4px_0_rgb(202,138,4)] border-t border-white/30 text-red-700 transform transition-transform active:translate-y-1 active:shadow-none cursor-default">
            <Trophy className="h-3 w-3 sm:h-5 sm:w-5" />
            <span className="text-[10px] sm:text-base font-black uppercase tracking-widest">Win</span>
          </div>
        </div>
      </div>
    </div>
  )
}
