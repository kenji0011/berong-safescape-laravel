"use client"

import { useAuth } from "@/lib/auth-context"
import { Flame, Sparkles, Gamepad2, BookOpen, Trophy, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface KidsWelcomeBannerProps {
  completedModules: number[]
}

export function KidsWelcomeBanner({ completedModules = [] }: KidsWelcomeBannerProps) {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'Fire Hero'
  const totalBadges = 5
  const badgesFound = completedModules.length

  // Avatars Mapping
  const AVATAR_MAP: Record<string, string> = {
    cow: '🐮',
    ff1: '👨‍🚒',
    ff2: '👩‍🚒',
    kid1: '🧒',
    kid2: '👧',
    adult1: '👨',
    adult2: '👩',
  }

  const userAvatar = AVATAR_MAP[user?.avatar || 'cow'] || '🐮'

  // Determine Hero Rank
  const getHeroRank = (count: number) => {
    if (count >= 5) return "Master Hero"
    if (count >= 3) return "Safety Elite"
    if (count >= 1) return "Fire Scout"
    return "Recruit"
  }

  // Calculate progress to next rank
  const getNextRankInfo = (count: number) => {
    if (count >= 5) return { next: "GODLIKE HERO", needed: 0, progress: 100 }
    if (count >= 3) return { next: "MASTER HERO", needed: 5 - count, progress: (count / 5) * 100 }
    if (count >= 1) return { next: "SAFETY ELITE", needed: 3 - count, progress: (count / 3) * 100 }
    return { next: "FIRE SCOUT", needed: 1 - count, progress: 0 }
  }

  const rankInfo = getNextRankInfo(badgesFound)

  const badgeDetails = [
    { name: "Fire Triangle", desc: "Learned the 3 elements of fire", icon: "🔥" },
    { name: "Safety Leader", desc: "Mastered the school fire drill", icon: "🛡️" },
    { name: "Plan Master", desc: "Created a home escape plan", icon: "📢" },
    { name: "Low & Go!", desc: "Mastered the smoke crawl", icon: "🏃" },
    { name: "Home Guard", desc: "Passed the final fire safety exam", icon: "🏘️" }
  ]

  return (
    <div className="relative group bg-gradient-to-br from-rose-600 via-red-500 to-orange-500 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(244,63,94,0.3)] mb-8 sm:mb-10 border-[6px] border-white/90 overflow-visible transition-all duration-500 hover:shadow-[0_30px_60px_rgba(244,63,94,0.4)]">
      
      {/* ── Advanced Mesh Gradient Background Layer ── */}
      <div className="absolute inset-0 overflow-hidden rounded-[1.6rem] sm:rounded-[2.1rem] pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[60%] bg-yellow-400/30 rounded-full blur-[80px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[70%] bg-pink-500/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] left-[30%] w-[30%] h-[40%] bg-orange-300/20 rounded-full blur-[60px] animate-bounce-slow"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        
        {/* Animated Sparkles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-ping opacity-20"
              style={{ 
                top: `${Math.random() * 100}%`, 
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Main Content Container (Mobile Optimized) ── */}
      <div className="relative z-10 px-4 sm:px-10 py-6 sm:py-10 flex flex-col items-center">
        
        {/* ── Welcome Typography (Responsive Scale) ── */}
        <div className="text-center mb-8 sm:mb-10 relative px-2">
          <div className="absolute -top-6 sm:top-[-8] left-1/2 -translate-x-1/2 opacity-40">
            <Sparkles className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-300 animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-6xl font-black text-white mb-2 drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] tracking-tighter leading-tight">
            Welcome, <span className="text-yellow-300 italic">{firstName}!</span>
          </h1>
          <p className="text-base sm:text-2xl font-bold text-yellow-100/90 drop-shadow-md tracking-tight leading-snug">
            {badgesFound >= 5 
              ? "You are a Master Fire Safety Hero! 🏅" 
              : "Ready for your next mission, Hero?"}
          </p>
        </div>

        {/* ── Integrated Stats Strip (Responsive Layout) ── */}
        <div className="flex flex-col lg:flex-row items-center justify-center w-full gap-4 sm:gap-8 mb-8 sm:mb-10 max-w-4xl">
          
          {/* Avatar Section (Mobile Friendly) */}
          <div className="w-full sm:w-auto flex items-center gap-4 sm:gap-5 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 sm:pl-5 sm:pr-8 border border-white/20 shadow-xl group/avatar-box hover:bg-white/15 transition-all">
            <div className="relative group/avatar shrink-0">
              <div className="absolute inset-[-4px] sm:inset-[-6] rounded-full border-2 border-white/30 animate-[spin_10s_linear_infinite] pointer-events-none"></div>
              <div className="relative h-14 w-14 sm:h-20 sm:w-20 rounded-full ring-2 sm:ring-4 ring-yellow-400 bg-white flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-500 group-hover/avatar:scale-110">
                <span className="text-3xl sm:text-5xl animate-bounce-slow">{userAvatar}</span>
                <div className="absolute inset-0 bg-gradient-to-t from-rose-100/50 to-transparent"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-[9px] sm:text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-0.5 sm:mb-1">Hero Rank</p>
              <h3 className={cn(
                "text-base sm:text-xl font-black uppercase tracking-tight leading-none",
                badgesFound >= 5 ? "text-yellow-300" : "text-white"
              )}>
                {getHeroRank(badgesFound)}
              </h3>
            </div>
          </div>

          {/* Badge Strip (Wrap for Mobile) */}
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-4 sm:px-8 border border-white/20 shadow-xl">
            <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-center">
               <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400 fill-yellow-400" />
               <span className="text-white font-black text-[9px] sm:text-[10px] uppercase tracking-widest opacity-60">Achieved</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {badgeDetails.map((badge, i) => {
                const isUnlocked = completedModules.includes(i + 1)
                return (
                  <div key={i} className="group/item relative">
                    <div className={cn(
                      "h-9 w-9 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center text-lg sm:text-2xl transition-all duration-500 shadow-lg border-2",
                      isUnlocked 
                        ? "bg-gradient-to-br from-yellow-300 to-yellow-500 border-white hover:scale-115" 
                        : "bg-black/20 border-white/10 opacity-30"
                    )}>
                      {isUnlocked ? badge.icon : <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/40" />}
                    </div>
                    {/* Tooltips only on larger screens where hover exists */}
                    <div className="hidden sm:block absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 p-3 bg-white rounded-xl shadow-2xl opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-300 text-center pointer-events-none scale-90 group-hover/item:scale-100 z-50">
                       <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45"></div>
                       <span className="text-[11px] font-black text-slate-800 uppercase block mb-1">{isUnlocked ? badge.name : "Locked"}</span>
                       <p className="text-[9px] font-bold text-slate-500 leading-tight">{isUnlocked ? badge.desc : "Complete training to earn!"}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="hidden sm:block bg-white/20 px-3 py-1.5 rounded-lg border border-white/30 ml-2">
                <span className="text-yellow-200 font-black text-xs tabular-nums">{badgesFound}/5</span>
            </div>
          </div>
        </div>

        {/* ── 3D Action Buttons (Compact 'Play, Learn, Win' Row) ── */}
        <div className="flex flex-wrap justify-center items-center w-full gap-3 sm:gap-6">
          {[
            { label: "Play", icon: Gamepad2, color: "bg-[#22c55e]", shadow: "#15803d", href: "/kids/safescape" },
            { label: "Learn", icon: BookOpen, color: "bg-[#3b82f6]", shadow: "#1d4ed8", href: "/kids/intel" },
            { label: "Win", icon: Trophy, color: "bg-[#facc15]", shadow: "#ca8a04", textColor: "text-amber-900", href: "/kids/rewards" }
          ].map((btn, i) => (
            <button 
              key={i}
              className={cn(
                "group/btn relative flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-8 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl border-none transition-all duration-200 active:duration-75 cursor-pointer overflow-hidden min-w-[90px] sm:min-w-[140px]",
                btn.color,
                btn.textColor || "text-white",
                "shadow-[0_5px_0_0_var(--btn-shadow)] sm:shadow-[0_8px_0_0_var(--btn-shadow)]",
                "hover:shadow-[0_3px_0_0_var(--btn-shadow)] sm:hover:shadow-[0_4px_0_0_var(--btn-shadow)]",
                "hover:translate-y-[2px] sm:hover:translate-y-[4px]",
                "active:translate-y-[5px] sm:active:translate-y-[8px] active:shadow-none"
              )}
              style={{ "--btn-shadow": btn.shadow } as React.CSSProperties}
            >
              <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
              
              <btn.icon className={cn("h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover/btn:scale-120 group-hover/btn:rotate-6 shrink-0", btn.textColor ? "fill-amber-900" : "fill-white")} />
              <span className="font-black text-sm sm:text-xl tracking-wide uppercase whitespace-nowrap">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }
        @keyframes bg-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      ` }} />
    </div>
  )
}
