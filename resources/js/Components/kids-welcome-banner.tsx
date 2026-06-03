"use client"

import { useAuth } from "@/lib/auth-context"
import { Link } from '@inertiajs/react'
import { Flame, Trophy, Lock, Shield, Star, Zap, ChevronRight, BadgeCheck, Gamepad2, BookOpen, CircleHelp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from 'canvas-confetti'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog"

interface KidsWelcomeBannerProps {
  completedModules: number[]
  earnedBadges?: any[]
}

export function KidsWelcomeBanner({ completedModules = [], earnedBadges = [] }: KidsWelcomeBannerProps) {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'Fire Hero'
  
  const [streak, setStreak] = useState(1)

  useEffect(() => {
    if (!user?.id) return
    const streakKey = `safescape_streak_${user.id}`
    const lastActiveKey = `safescape_last_active_${user.id}`
    
    const savedStreak = localStorage.getItem(streakKey)
    const savedLastActive = localStorage.getItem(lastActiveKey)
    
    const todayStr = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
    
    if (savedLastActive) {
      if (savedLastActive === todayStr) {
        setStreak(savedStreak ? parseInt(savedStreak, 10) : 1)
      } else {
        const lastActiveDate = new Date(savedLastActive)
        const todayDate = new Date(todayStr)
        
        const diffTime = Math.abs(todayDate.getTime() - lastActiveDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          const nextStreak = savedStreak ? parseInt(savedStreak, 10) + 1 : 2
          setStreak(nextStreak)
          localStorage.setItem(streakKey, nextStreak.toString())
        } else {
          setStreak(1)
          localStorage.setItem(streakKey, '1')
        }
      }
    } else {
      setStreak(1)
      localStorage.setItem(streakKey, '1')
    }
    localStorage.setItem(lastActiveKey, todayStr)
  }, [user?.id])
  
  // All possible badges for summary - Synchronized with BadgeHall.tsx
  const ALL_BADGES = [
    { id: 'module_1', moduleNum: 1, image: "/fire_hall.png" },
    { id: 'module_2', moduleNum: 2, image: "/shield_hall.png" },
    { id: 'module_3', moduleNum: 3, image: "/plan_hall.png" },
    { id: 'module_4', moduleNum: 4, image: "/low_hall.png" },
    { id: 'module_5', moduleNum: 5, image: "/home_hall.png" },
    { id: 'quiz_hero', image: "/quiz_hall.png" },
    { id: 'memory_master', image: "/memory_hall.png" },
    { id: 'smoke_scout', image: "/smoke_hall.png" },
    { id: 'safety_scout', image: "/safety_hall.png" },
    { id: 'hazard_hero', image: "/hazard_hall.png" },
    { id: 'intel_analyst', image: "/intel_hall.png" }
  ]

  const totalBadges = ALL_BADGES.length
  
  const isBadgeEarned = (badgeId: string, moduleNum?: number) => {
    const earned = earnedBadges.find(b => b.badge_id === badgeId)
    return (moduleNum && completedModules.includes(moduleNum)) || !!earned
  }

  // Count unique earned badges based on the official list
  const badgesFound = ALL_BADGES.filter(b => isBadgeEarned(b.id, b.moduleNum)).length
  const progressPercent = (badgesFound / totalBadges) * 100

  // Avatars Mapping
  const AVATAR_MAP: Record<string, string> = {
    cow: '/berong_pr.png', ff1: '👨‍🚒', ff2: '👩‍🚒', kid1: '🧒', kid2: '👧', adult1: '👨', adult2: '👩',
  }
  const userAvatar = AVATAR_MAP[user?.avatar || 'cow'] || '/berong_pr.png'

  // Ranking Logic
  const getHeroRank = (count: number) => {
    if (count >= 10) return { name: "Legendary Hero", color: "text-yellow-300", bg: "bg-yellow-400/30", icon: Star }
    if (count >= 7) return { name: "Master Hero", color: "text-orange-300", bg: "bg-orange-400/30", icon: Trophy }
    if (count >= 4) return { name: "Safety Elite", color: "text-blue-300", bg: "bg-blue-400/30", icon: Shield }
    if (count >= 1) return { name: "Fire Scout", color: "text-green-300", bg: "bg-green-400/30", icon: Flame }
    return { name: "Recruit", color: "text-slate-300", bg: "bg-slate-400/30", icon: Zap }
  }

  const RANKS = [
    { name: "Legendary Hero", count: 10, color: "text-yellow-400", bg: "bg-yellow-400/10", icon: Star, desc: "The ultimate protector of the city! You've mastered almost everything." },
    { name: "Master Hero", count: 7, color: "text-orange-400", bg: "bg-orange-400/10", icon: Trophy, desc: "A true expert in fire safety. You lead by example." },
    { name: "Safety Elite", count: 4, color: "text-blue-400", bg: "bg-blue-400/10", icon: Shield, desc: "A highly skilled responder. You know exactly what to do." },
    { name: "Fire Scout", count: 1, color: "text-emerald-400", bg: "bg-emerald-400/10", icon: Flame, desc: "A brave beginner. You've taken your first steps to safety." },
    { name: "Recruit", count: 0, color: "text-slate-400", bg: "bg-slate-400/10", icon: Zap, desc: "A new hero in training. Start a module to earn your first badge!" }
  ]

  const currentRank = getHeroRank(badgesFound)
  const RankIcon = currentRank.icon
  const [showRankGuide, setShowRankGuide] = useState(false)
  const [showPromotion, setShowPromotion] = useState(false)
  const [promotedRank, setPromotedRank] = useState<any>(null)

  useEffect(() => {
    if (!user?.id) return

    const storageKey = `safescape_badge_count_${user.id}`
    const savedCountStr = localStorage.getItem(storageKey)
    
    // If no saved count exists (e.g. first login on this device), we set it to current badges
    // to prevent triggering a fake promotion. It will only trigger when they ACTUALLY earn a new badge.
    const savedCount = savedCountStr !== null ? parseInt(savedCountStr, 10) : badgesFound

    if (badgesFound > savedCount) {
      const oldRankName = getHeroRank(savedCount).name
      const newRank = getHeroRank(badgesFound)

      if (newRank.name !== oldRankName && newRank.name !== "Recruit") {
        setPromotedRank(newRank)
        setShowPromotion(true)
        new Audio('/sounds/finish.mp3').play().catch(e => console.warn("Audio playback failed:", e));
        
        // Trigger confetti
        const duration = 3000;
        const end = Date.now() + duration;
        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#fcd34d']
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#fcd34d']
          });
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      }
      localStorage.setItem(storageKey, badgesFound.toString())
    } else if (badgesFound < savedCount || savedCountStr === null) {
       // Sync storage if badges decrease or if it's the very first time
       localStorage.setItem(storageKey, badgesFound.toString())
    }
  }, [badgesFound, user?.id])

  useEffect(() => {
    // Check for rankGuide parameter to automatically open the guide
    const params = new URLSearchParams(window.location.search);
    if (params.get('rankGuide') === 'true') {
      setShowRankGuide(true);
      // Clean up the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  return (
    <>
      <div className="relative bg-primary rounded-2xl sm:rounded-[2.5rem] shadow-xl mb-6 sm:mb-8 border-[3px] sm:border-[6px] border-white/90 dark:border-black/20 overflow-hidden transform translate-z-0 transition-colors duration-500">
        
        {/* Decorative Elements - Simplified */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white dark:bg-slate-800 rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white dark:bg-slate-800 rounded-full"></div>
        </div>

        <div className="relative z-10 px-4 sm:px-10 pt-6 sm:pt-8 lg:pt-10 pb-4 sm:pb-6 lg:pb-4 flex flex-col items-center">
          
          {/* ── Header: Now includes Avatar on Mobile ── */}
          <div className="text-center mb-6 lg:mb-8 flex flex-col items-center gap-3">
            <div className="sm:hidden h-16 w-16 rounded-full bg-white dark:bg-red-900/30 shadow-xl flex items-center justify-center text-3xl border-2 border-white dark:border-white/20 transform rotate-3 transition-colors overflow-hidden">
              {userAvatar.startsWith('/') ? (
                <img 
                  src={userAvatar} 
                  alt="Hero" 
                  className="h-full w-full object-cover rounded-full transform-gpu dark:brightness-90 dark:contrast-110 dark:grayscale-[5%]" 
                />
              ) : (
                userAvatar
              )}
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white drop-shadow-md tracking-tighter mb-1">
                Welcome, <span className="text-yellow-300">{firstName}!</span>
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-2.5 text-yellow-50/90 font-black text-sm sm:text-xl tracking-tight">
                <span className="flex items-center gap-2">
                  You are a <span className="text-yellow-300 underline underline-offset-4 decoration-yellow-400/50">{currentRank.name}</span> <RankIcon className="h-5 w-5 sm:h-6 sm:w-6 fill-yellow-300 text-yellow-300" />
                </span>
                <span className="hidden sm:inline lg:hidden opacity-30">|</span>
                <span className="inline-flex lg:hidden items-center gap-1.5 px-3 py-1 bg-white border border-orange-200 rounded-full text-orange-600 font-extrabold text-xs sm:text-sm shadow-md">
                  🔥 {streak} Day Streak
                </span>
                
                <Dialog open={showRankGuide} onOpenChange={setShowRankGuide}>
                  <DialogTrigger asChild>
                    <button 
                      onClick={() => new Audio('/sounds/tap.mp3').play().catch(() => {})}
                      className="ml-1 p-1 hover:bg-white/20 rounded-full transition-colors group"
                    >
                      <CircleHelp className="h-4 w-4 sm:h-5 sm:w-5 text-white/60 group-hover:text-white" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-slate-50 dark:bg-slate-950 border-[4px] border-primary rounded-[2.5rem] p-0 overflow-hidden">
                     <div className="bg-primary p-6 sm:p-8 text-center relative">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                           <Star className="absolute top-4 left-4 h-12 w-12 text-white rotate-12" />
                           <Trophy className="absolute bottom-4 right-4 h-12 w-12 text-white -rotate-12" />
                        </div>
                        <DialogHeader>
                          <DialogTitle className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter mb-2">Hero Rank Guide</DialogTitle>
                          <DialogDescription className="text-white/80 font-bold text-sm">
                            Collect badges to level up your Hero Rank!
                          </DialogDescription>
                        </DialogHeader>
                     </div>
                     
                     <div className="p-4 sm:p-6 space-y-3">
                        {RANKS.map((rank, i) => {
                          const Icon = rank.icon
                          const isCurrent = currentRank.name === rank.name
                          
                          return (
                            <div key={i} className={cn(
                              "relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all",
                              isCurrent ? "bg-white dark:bg-slate-900 border-primary shadow-lg scale-[1.02]" : "bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-70"
                            )}>
                               {isCurrent && (
                                 <div className="absolute -top-2.5 -right-2 bg-primary text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-md border-2 border-white dark:border-slate-900 uppercase tracking-tight">
                                    Current
                                 </div>
                               )}
                               <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-xl shrink-0 border-2", rank.bg, rank.color.replace('text-', 'border-'))}>
                                  <Icon className={cn("h-6 w-6", rank.color)} />
                               </div>
                               <div className="flex-1">
                                   <div className="flex items-center justify-between">
                                      <h4 className={cn("font-black text-sm uppercase tracking-tight", rank.color.replace('-400', '-600'), "dark:" + rank.color)}>{rank.name}</h4>
                                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">{rank.count}+ Badges</span>
                                   </div>
                                   <p className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-400 leading-tight mt-0.5">{rank.desc}</p>
                               </div>
                            </div>
                          )
                        })}
                     </div>

                     <div className="p-6 pt-0">
                        <button 
                          onClick={() => {
                            new Audio('/sounds/click.mp3').play().catch(() => {});
                            setShowRankGuide(false);
                          }}
                          className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl border-b-[6px] border-red-800 active:border-b-0 active:translate-y-[6px] transition-all uppercase tracking-widest text-sm"
                        >
                          Got it, Hero!
                        </button>
                     </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
   
          {/* ── Stats Container ── */}
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
             
             {/* Card 1: Identity & Rank - HIDDEN ON MOBILE */}
             <div className="hidden lg:flex bg-white/10 dark:bg-slate-950/40 rounded-[2rem] p-6 border border-white/20 dark:border-white/5 items-center gap-6 shadow-2xl transition-colors">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white dark:bg-red-900/30 shadow-inner flex items-center justify-center text-4xl sm:text-5xl border-4 border-white dark:border-white/20 transform hover:scale-110 transition-all duration-500 overflow-hidden">
                  {userAvatar.startsWith('/') ? (
                    <img 
                      src={userAvatar} 
                      alt="Hero" 
                      className="h-full w-full object-cover rounded-full transform-gpu dark:brightness-90 dark:contrast-110 dark:grayscale-[5%]" 
                    />
                  ) : (
                    userAvatar
                  )}
                </div>
                <div className="flex-1">
                   <span className="text-[10px] font-black text-yellow-300/80 uppercase tracking-widest block mb-1">HERO IDENTITY</span>
                   <h3 className="text-2xl sm:text-4xl font-black text-white leading-none mb-3">{firstName}</h3>
                    <div className="flex flex-wrap gap-2 items-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400 rounded-full text-red-700 font-black text-xs uppercase shadow-md">
                         <RankIcon className="h-3 w-3" />
                         Level {Math.floor(badgesFound / 2) + 1}
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-orange-200 rounded-full text-orange-600 font-black text-xs uppercase shadow-md">
                         <span>🔥</span>
                         <span>{streak} Day Streak</span>
                      </div>
                    </div>
                </div>
             </div>

             {/* Card 2: Badges Summary Link */}
             <Link 
               href="/kids/badges"
               onClick={() => new Audio('/sounds/click.mp3').play().catch(() => {})}
               className="bg-white/10 dark:bg-slate-950/40 backdrop-blur-xl rounded-[2rem] p-6 border border-white/20 dark:border-white/5 flex flex-col shadow-2xl hover:bg-white/15 dark:hover:bg-white/10 transition-all group"
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
                  {(() => {
                    const earnedList = ALL_BADGES.filter(b => isBadgeEarned(b.id, b.moduleNum));
                    const lockedList = ALL_BADGES.filter(b => !isBadgeEarned(b.id, b.moduleNum));
                    const displayBadges = [...earnedList, ...lockedList].slice(0, 5);
                    
                    return displayBadges.map((badge, i) => {
                      const earned = isBadgeEarned(badge.id, badge.moduleNum)
                      return (
                        <div key={i} className={cn(
                          "h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center transition-all shadow-lg border-2 relative overflow-hidden",
                          earned 
                            ? "bg-yellow-400 border-white/30" 
                            : "bg-black/30 border-white/5 opacity-30"
                        )}>
                          {earned ? (
                            <img src={badge.image} className="h-full w-full object-contain p-1" alt="Badge" />
                          ) : (
                            <div className="relative w-full h-full flex items-center justify-center">
                              <img src={badge.image} className="h-full w-full object-contain p-1 filter grayscale opacity-20" alt="Locked Badge" />
                              <Lock className="absolute inset-0 m-auto h-3 w-3 text-white/40" />
                            </div>
                          )}
                        </div>
                      )
                    });
                  })()}
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center bg-white/10 dark:bg-slate-900/50 border border-white/20 dark:border-white/5 text-yellow-300 font-black text-sm transition-colors">
                    +{totalBadges - 5}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                      <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Global Ranking Progress</span>
                      <span className="text-xs font-black text-yellow-300">{progressPercent.toFixed(0)}%</span>
                  </div>
                  <div className="h-3 w-full bg-black/40 dark:bg-black/60 rounded-full border border-white/10 dark:border-white/5 overflow-hidden p-0.5 transition-colors">
                      <div 
                        className="h-full bg-yellow-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(250,204,21,0.4)]" 
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

      {/* Promotion Animation Overlay */}
      <AnimatePresence>
        {showPromotion && promotedRank && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="bg-slate-900 border-[6px] border-yellow-400 rounded-[2.5rem] p-8 sm:p-12 max-w-sm w-full text-center relative overflow-hidden shadow-2xl"
            >
              <div className="relative z-10">
                <h3 className="text-sm font-black text-yellow-400/80 uppercase tracking-widest mb-4">Rank Up!</h3>
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
                  className="mx-auto w-32 h-32 sm:w-40 sm:h-40 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(250,204,21,0.2)] border-[6px] border-yellow-400"
                >
                  <promotedRank.icon className={cn("h-16 w-16 sm:h-20 sm:w-20", promotedRank.color)} />
                </motion.div>
                <h2 className={cn("text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-2", promotedRank.color)}>
                  {promotedRank.name}
                </h2>
                <p className="text-white/80 font-bold mb-8 text-sm sm:text-base">
                  Congratulations! You've reached a new Hero Rank!
                </p>
                <button 
                  onClick={() => {
                    new Audio('/sounds/click.mp3').play().catch(() => {});
                    setShowPromotion(false);
                  }}
                  className="w-full bg-yellow-400 text-yellow-900 font-black py-4 rounded-2xl shadow-[0_6px_0_#b45309] active:translate-y-[6px] active:shadow-none transition-all uppercase tracking-widest"
                >
                  Awesome!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
