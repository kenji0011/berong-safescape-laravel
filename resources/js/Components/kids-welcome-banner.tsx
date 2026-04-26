"use client"

import { useAuth } from "@/lib/auth-context"
import { Flame, Sparkles, Gamepad2, BookOpen, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

interface KidsWelcomeBannerProps {
  completedModules: number[]
}

export function KidsWelcomeBanner({ completedModules = [] }: KidsWelcomeBannerProps) {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'Fire Hero'

  const totalBadges = 5
  const badgesFound = completedModules.length
  
  // Determine Hero Rank
  const getHeroRank = (count: number) => {
    if (count >= 5) return "Master Hero"
    if (count >= 3) return "Safety Elite"
    if (count >= 1) return "Fire Scout"
    return "Recruit"
  }

  const badgeIcons = ["🔥", "🛡️", "📢", "🏃", "🏘️"]

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 rounded-[1.5rem] sm:rounded-[2rem] shadow-lg shadow-orange-500/20 mb-6 sm:mb-8 border-4 border-white text-center">
      {/* Abstract background graphics */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-15 mix-blend-overlay pointer-events-none"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mb-6">
          {/* Avatar & Rank */}
          <div className="relative">
            <div className="inline-flex items-center justify-center rounded-full ring-4 ring-yellow-400/50 bg-white shadow-xl backdrop-blur-md animate-bounce-slow overflow-hidden">
              <div className="bg-gradient-to-br from-pink-100 to-rose-200 rounded-full h-14 w-14 sm:h-20 sm:w-20 flex items-center justify-center border-4 border-white">
                <span className="text-3xl sm:text-5xl drop-shadow-md">🐮</span>
              </div>
            </div>
            <div className={cn(
              "absolute -bottom-2 -right-2 text-amber-900 text-[10px] sm:text-xs font-black px-2 py-1 rounded-lg border-2 border-white shadow-md uppercase tracking-tighter transform rotate-12",
              badgesFound >= 5 ? "bg-gradient-to-r from-yellow-300 to-yellow-500" : "bg-yellow-400"
            )}>
              {getHeroRank(badgesFound)}
            </div>
          </div>

          {/* Badge Stats */}
          <div className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-2xl p-2.5 sm:p-4 flex flex-col items-center sm:items-start gap-1 shadow-inner">
            <div className="flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-300 fill-yellow-300" />
              <span className="text-white font-black text-[10px] sm:text-sm uppercase tracking-wider">Badge Collection</span>
            </div>
            <div className="flex gap-1 mt-1">
              {badgeIcons.map((icon, i) => {
                const isUnlocked = completedModules.includes(i + 1)
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "h-7 w-7 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-sm sm:text-xl transition-all duration-500 shadow-md border-2",
                      isUnlocked 
                        ? "bg-yellow-400 border-white" 
                        : "bg-black/20 border-dashed border-white/40 opacity-40"
                    )}
                  >
                    {isUnlocked ? icon : "🔒"}
                  </div>
                )
              })}
            </div>
            <p className="text-[9px] text-yellow-100 font-bold mt-1 uppercase tracking-tight">
              {badgesFound} of {totalBadges} Badges Found
            </p>
          </div>
        </div>

        {/* Welcome text */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-1.5 sm:mb-2 drop-shadow-xl tracking-tight">
          Welcome, {firstName}!
        </h1>
        <p className="text-base sm:text-xl font-bold text-yellow-100 mb-5 sm:mb-6 drop-shadow-md max-w-lg leading-relaxed">
          {badgesFound >= 5 
            ? "You are a Master Fire Safety Hero! 🏅" 
            : "Your mission: Become a Fire Safety Hero!"}
        </p>

        {/* 3D Action Buttons */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          <button className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white px-5 sm:px-8 py-2 sm:py-3 rounded-full border-none shadow-[0_5px_0_0_#15803d] sm:shadow-[0_6px_0_0_#15803d] hover:shadow-[0_3px_0_0_#15803d] sm:hover:shadow-[0_4px_0_0_#15803d] active:translate-y-[5px] sm:active:translate-y-[6px] active:shadow-none transition-all duration-200 active:duration-75 cursor-pointer">
            <Gamepad2 className="h-4 w-4 sm:h-6 sm:w-6 text-white fill-white" />
            <span className="font-black text-sm sm:text-lg tracking-wide uppercase">Start Training</span>
          </button>
          
          <button className="flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-5 sm:px-8 py-2 sm:py-3 rounded-full border-none shadow-[0_5px_0_0_#1d4ed8] sm:shadow-[0_6px_0_0_#1d4ed8] hover:shadow-[0_3px_0_0_#1d4ed8] sm:hover:shadow-[0_4px_0_0_#1d4ed8] active:translate-y-[5px] sm:active:translate-y-[6px] active:shadow-none transition-all duration-200 active:duration-75 cursor-pointer">
            <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-white fill-white" />
            <span className="font-black text-sm sm:text-lg tracking-wide uppercase">Open Intel</span>
          </button>
          
          <button className="flex items-center gap-2 bg-[#facc15] hover:bg-[#eab308] text-amber-900 px-5 sm:px-8 py-2 sm:py-3 rounded-full border-none shadow-[0_5px_0_0_#ca8a04] sm:shadow-[0_6px_0_0_#ca8a04] hover:shadow-[0_3px_0_0_#ca8a04] sm:hover:shadow-[0_4px_0_0_#ca8a04] active:translate-y-[5px] sm:active:translate-y-[6px] active:shadow-none transition-all duration-200 active:duration-75 cursor-pointer">
            <Trophy className="h-4 w-4 sm:h-6 sm:w-6 text-amber-900 fill-amber-900" />
            <span className="font-black text-sm sm:text-lg tracking-wide uppercase">Rewards</span>
          </button>
        </div>
      </div>
    </div>
  )
}
