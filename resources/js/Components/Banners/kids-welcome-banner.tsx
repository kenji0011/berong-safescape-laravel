"use client"

import { useAuth } from "@/lib/auth-context"
import { Link, router } from '@inertiajs/react'
import { Flame, Trophy, Lock, Shield, Star, Zap, ChevronRight, BadgeCheck, Gamepad2, BookOpen, CircleHelp, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect, useRef } from "react"
import ReactDOM from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import confetti from 'canvas-confetti'
import { playSound } from '@/lib/audio'
import { preloadKidsPages } from '@/lib/preload-kids-pages'

interface KidsWelcomeBannerProps {
  completedModules: number[]
  earnedBadges?: any[]
}

export function KidsWelcomeBanner({ completedModules = [], earnedBadges = [] }: KidsWelcomeBannerProps) {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'Fire Hero'
  
  const [streak, setStreak] = useState(1)

  const handleOpenHallClick = (e: React.MouseEvent, href: string = '/kids/badges') => {
    playSound('/sounds/click.mp3', 'general')
    if (window.scrollY > 0) {
      sessionStorage.setItem('safescape_kids_dashboard_scroll', window.scrollY.toString())
    }
    router.visit(href)
  }

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
    { id: 'module_1', moduleNum: 1, image: "/badges/fire_hall.webp?v=2" },
    { id: 'module_2', moduleNum: 2, image: "/badges/shield_hall.webp?v=2" },
    { id: 'module_3', moduleNum: 3, image: "/badges/plan_hall.webp?v=2" },
    { id: 'module_4', moduleNum: 4, image: "/badges/low_hall.webp?v=2" },
    { id: 'module_5', moduleNum: 5, image: "/badges/home_hall.webp?v=2" },
    { id: 'quiz_hero', image: "/badges/quiz_hall.webp?v=2" },
    { id: 'memory_master', image: "/badges/memory_hall.webp?v=2" },
    { id: 'smoke_scout', image: "/badges/smoke_hall.webp?v=2" },
    { id: 'safety_scout', image: "/badges/safety_hall.webp?v=2" },
    { id: 'hazard_hero', image: "/badges/hazard_hall.webp?v=2" },
    { id: 'intel_analyst', image: "/badges/intel_hall.webp?v=2" }
  ]

  const totalBadges = ALL_BADGES.length
  
  const isBadgeEarned = (badgeId: string, moduleNum?: number) => {
    const earned = earnedBadges.find(b => b.badge_id === badgeId)
    return (moduleNum && completedModules.includes(moduleNum)) || !!earned
  }

  // Count unique earned badges based on the official list
  const badgesFound = ALL_BADGES.filter(b => isBadgeEarned(b.id, b.moduleNum)).length
  const progressPercent = (badgesFound / totalBadges) * 100

  const AVATAR_MAP: Record<string, string> = {
    cow: '/berong_pr.webp', ff1: '/hero_jack.webp?v=2', ff2: '/hero_sarah.webp?v=2', kid1: '/hero_boy.webp', kid2: '/hero_girl.webp', adult1: '/hero_male.webp', adult2: '/hero_female.webp',
  }
  const userAvatar = AVATAR_MAP[user?.avatar || 'cow'] || '/berong_pr.webp'

  // Ranking Logic
  const getHeroRank = (count: number) => {
    if (count >= 10) return { name: "Legendary Hero", color: "text-yellow-300", bg: "bg-yellow-400/30", icon: Star, image: "/ranks/legendary_hero.webp" }
    if (count >= 7) return { name: "Master Hero", color: "text-orange-300", bg: "bg-orange-400/30", icon: Trophy, image: "/ranks/master_hero.webp" }
    if (count >= 4) return { name: "Safety Elite", color: "text-blue-300", bg: "bg-blue-400/30", icon: Shield, image: "/ranks/safety_elite.webp" }
    if (count >= 1) return { name: "Fire Scout", color: "text-green-300", bg: "bg-green-400/30", icon: Flame, image: "/ranks/fire_scout.webp" }
    return { name: "Recruit", color: "text-slate-300", bg: "bg-slate-400/30", icon: Zap, image: "/ranks/recruit.webp" }
  }

  const RANKS = [
    { name: "Legendary Hero", count: 10, color: "text-yellow-400", bg: "bg-yellow-400/10", icon: Star, image: "/ranks/legendary_hero.webp", desc: "The ultimate protector of the city! You've mastered almost everything." },
    { name: "Master Hero", count: 7, color: "text-orange-400", bg: "bg-orange-400/10", icon: Trophy, image: "/ranks/master_hero.webp", desc: "A true expert in fire safety. You lead by example." },
    { name: "Safety Elite", count: 4, color: "text-blue-400", bg: "bg-blue-400/10", icon: Shield, image: "/ranks/safety_elite.webp", desc: "A highly skilled responder. You know exactly what to do." },
    { name: "Fire Scout", count: 1, color: "text-emerald-400", bg: "bg-emerald-400/10", icon: Flame, image: "/ranks/fire_scout.webp", desc: "A brave beginner. You've taken your first steps to safety." },
    { name: "Recruit", count: 0, color: "text-slate-400", bg: "bg-slate-400/10", icon: Zap, image: "/ranks/recruit.webp", desc: "A new hero in training. Start a module to earn your first badge!" }
  ]

  const currentRank = getHeroRank(badgesFound)
  const RankIcon = currentRank.icon
  const [showRankGuide, setShowRankGuide] = useState(false)
  const [showPromotion, setShowPromotion] = useState(false)
  const [promotedRank, setPromotedRank] = useState<any>(null)
  const currentRankRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to current rank when Hero Rank Guide modal opens
  useEffect(() => {
    if (showRankGuide) {
      const timer = setTimeout(() => {
        currentRankRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [showRankGuide])

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
        setShowPromotion(true);
        (window as any).isSafescapeRankModalOpen = true;
        playSound('/sounds/finish.mp3', 'notification');
        
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
    <div className="relative z-20">
      {/* Mobile Streak Tag - Positioned Absolute Overlapping Top Right */}
      <div className="absolute -top-3 -right-2 sm:-top-4 sm:-right-2 z-30 lg:hidden">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-orange-300 rounded-full text-orange-600 font-extrabold text-xs shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
          🔥 {streak} Day Streak
        </span>
      </div>

      <div className="relative bg-primary rounded-2xl sm:rounded-[2.5rem] shadow-xl border-[3px] sm:border-[6px] border-white/90 dark:border-black/20 overflow-hidden transform translate-z-0 transition-colors duration-500">
        
        {/* Decorative Elements - Simplified */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white dark:bg-slate-800 rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white dark:bg-slate-800 rounded-full"></div>
        </div>



        <div className="relative z-10 px-4 sm:px-10 pt-6 sm:pt-8 lg:pt-10 pb-4 sm:pb-6 lg:pb-4 flex flex-col items-center">
          
          {/* ── Header: Now includes Avatar on Mobile ── */}
          <div className="mb-6 lg:mb-8 flex flex-row items-center justify-center gap-4 sm:flex-col sm:text-center w-full max-w-lg mx-auto sm:max-w-none">
            <div className="sm:hidden h-20 w-20 shrink-0 rounded-full bg-white dark:bg-red-900/30 shadow-xl flex items-center justify-center text-4xl border-[3px] border-white dark:border-white/20 transform rotate-3 transition-colors overflow-hidden">
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
            <div className="flex flex-col items-start sm:items-center">
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white drop-shadow-md tracking-tighter mb-0.5 sm:mb-1 leading-tight">
                Welcome, <span className="text-yellow-300">{firstName}!</span>
              </h1>
              <div className="flex flex-wrap items-center justify-start sm:justify-center gap-1.5 sm:gap-2.5 text-yellow-50/90 font-black text-[13px] sm:text-xl tracking-tight">
                <span className="flex items-center gap-1.5 sm:gap-2">
                  You are a{" "}
                  <button
                    onClick={() => {
                      playSound('/sounds/tap.mp3', 'general');
                      setShowRankGuide(true);
                    }}
                    className="text-yellow-300 underline underline-offset-4 decoration-yellow-400/50 hover:text-yellow-200 transition-colors cursor-pointer inline-flex items-center gap-1.5 font-black"
                  >
                    {currentRank.name}
                    <img src={currentRank.image} alt={currentRank.name} className="h-6 w-6 sm:h-8 sm:w-8 inline-block object-contain drop-shadow" />
                  </button>
                </span>
                
                <button 
                  onClick={() => {
                    playSound('/sounds/tap.mp3', 'general');
                    setShowRankGuide(true);
                  }}
                  className="ml-1 p-1 hover:bg-white/20 rounded-full transition-colors group cursor-pointer"
                  title="View Hero Rank Guide"
                  aria-label="View Hero Rank Guide"
                >
                  <CircleHelp className="h-4 w-4 sm:h-5 sm:w-5 text-white/60 group-hover:text-white transition-colors" />
                </button>
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
                <div className="flex-1 min-w-0">
                   <span className="text-[10px] font-black text-yellow-300/80 uppercase tracking-widest block mb-1">HERO IDENTITY</span>
                   <h3 className="text-2xl sm:text-3xl font-black text-white leading-none mb-3 truncate">Hero {firstName}</h3>
                    <div className="flex flex-wrap gap-2 items-center">
                       <div 
                         onClick={() => {
                           playSound('/sounds/tap.mp3', 'general');
                           setShowRankGuide(true);
                         }}
                         className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400 hover:bg-yellow-300 border border-yellow-300/80 rounded-full text-red-800 font-black text-xs uppercase shadow-sm cursor-pointer transition-all hover:scale-105 active:scale-95"
                       >
                          <img src={currentRank.image} alt={currentRank.name} className="h-3.5 w-3.5 object-contain inline-block" />
                          <span>Level {Math.floor(badgesFound / 2) + 1}</span>
                       </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/95 dark:bg-slate-900 border border-orange-200 dark:border-slate-700 rounded-full text-orange-600 dark:text-orange-400 font-black text-xs uppercase shadow-sm">
                         <span>🔥</span>
                         <span>{streak} Day Streak</span>
                      </div>
                    </div>
                </div>
             </div>

             {/* Card 2: Badges Summary Link */}
             <div 
               onClick={(e) => handleOpenHallClick(e, "/kids/badges")}
               onMouseEnter={() => preloadKidsPages()}
               onTouchStart={() => preloadKidsPages()}
               className="bg-white/10 dark:bg-slate-950/40 backdrop-blur-xl rounded-[2rem] p-6 border border-white/20 dark:border-white/5 flex flex-col shadow-2xl hover:bg-white/15 dark:hover:bg-white/10 transition-all group cursor-pointer"
             >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-300" />
                      <span className="text-[10px] font-black text-yellow-300/80 uppercase tracking-widest">Achieved Badges</span>
                  </div>
                  <div className="px-4 py-1.5 bg-yellow-400 group-hover:bg-yellow-300 active:scale-95 rounded-xl text-red-700 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg">
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
             </div>
          </div>

          {/* ── Action Navigation Buttons ── */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mt-1 sm:mt-2 pb-2 select-none">
            {/* Play Button - Scrolls to Adventures & Games */}
            <button
              type="button"
              onClick={() => {
                playSound('/sounds/tap.mp3', 'general');
                const target = document.getElementById('adventure-board') || document.querySelector('.wood-board');
                if (target) {
                  const navOffset = 80;
                  const elementPosition = target.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - navOffset;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                }
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-8 sm:py-3 bg-emerald-500 hover:bg-emerald-400 rounded-xl sm:rounded-2xl shadow-[0_4px_0_rgb(5,150,105)] hover:shadow-[0_6px_0_rgb(5,150,105)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none border-t border-white/30 text-white transform transition-all cursor-pointer outline-none"
            >
              <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-base font-black uppercase tracking-widest">Play</span>
            </button>
            
            {/* Learn Button - Navigates to SafeScape Course */}
            <Link
              href="/kids/safescape"
              onClick={() => playSound('/sounds/tap.mp3', 'general')}
              className="flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-8 sm:py-3 bg-blue-600 hover:bg-blue-500 rounded-xl sm:rounded-2xl shadow-[0_4px_0_rgb(29,78,216)] hover:shadow-[0_6px_0_rgb(29,78,216)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none border-t border-white/30 text-white transform transition-all cursor-pointer outline-none"
            >
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-base font-black uppercase tracking-widest">Learn</span>
            </Link>
            
            {/* Win Button - Navigates to Badge Hall */}
            <button
              type="button"
              onMouseEnter={() => preloadKidsPages()}
              onTouchStart={() => preloadKidsPages()}
              onClick={(e) => handleOpenHallClick(e, "/kids/badges")}
              className="flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-8 sm:py-3 bg-yellow-400 hover:bg-yellow-300 rounded-xl sm:rounded-2xl shadow-[0_4px_0_rgb(202,138,4)] hover:shadow-[0_6px_0_rgb(202,138,4)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none border-t border-white/30 text-red-700 transform transition-all cursor-pointer outline-none"
            >
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-base font-black uppercase tracking-widest">Win</span>
            </button>
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
                  className="mx-auto w-32 h-32 sm:w-40 sm:h-40 bg-slate-800 rounded-full flex items-center justify-center p-4 mb-6 shadow-[0_0_40px_rgba(250,204,21,0.2)] border-[6px] border-yellow-400 overflow-hidden"
                >
                  <img src={promotedRank.image} alt={promotedRank.name} className="h-full w-full object-contain drop-shadow-xl" />
                </motion.div>
                <h2 className={cn("text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-2", promotedRank.color)}>
                  {promotedRank.name}
                </h2>
                <p className="text-white/80 font-bold mb-8 text-sm sm:text-base">
                  Congratulations! You've reached a new Hero Rank!
                </p>
                <button 
                  onClick={() => {
                    playSound('/sounds/click.mp3', 'general');
                    setShowPromotion(false);
                    (window as any).isSafescapeRankModalOpen = false;
                    window.dispatchEvent(new Event('safescape_rank_modal_closed'));
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

      {/* Hero Rank Guide Animated Morph Portal Modal */}
      {typeof window !== 'undefined' && ReactDOM.createPortal(
        <AnimatePresence>
          {showRankGuide && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-x-hidden overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {/* Backdrop with smooth fade */}
              <motion.div
                key="hero-rank-guide-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="fixed inset-0 bg-black/65 backdrop-blur-sm"
                onClick={() => setShowRankGuide(false)}
              />

              {/* Modal with spring morph & spacious, highly readable layout matching Professional Rank Guide */}
              <motion.div
                key="hero-rank-guide-modal"
                initial={{ opacity: 0, scale: 0.85, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: 16 }}
                transition={{ type: "spring", damping: 28, stiffness: 360, mass: 0.8 }}
                className="relative w-full max-w-[94vw] xs:max-w-md sm:max-w-lg md:max-w-xl max-h-[88vh] sm:max-h-[90vh] bg-white dark:bg-slate-950 border-[3px] sm:border-[4px] border-primary rounded-[1.75rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col my-auto z-10"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-primary p-4 xs:p-5 sm:p-7 text-center relative shrink-0">
                  <button
                    onClick={() => setShowRankGuide(false)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-black/20 hover:bg-black/35 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                  </button>
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
                    <Star className="absolute top-2 left-2 sm:top-4 sm:left-4 h-8 w-8 sm:h-14 sm:w-14 text-white rotate-12" />
                    <Trophy className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 h-8 w-8 sm:h-14 sm:w-14 text-white -rotate-12" />
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-1 text-center">
                    Hero Rank Guide
                  </h3>
                  <p className="text-white/90 font-bold text-xs sm:text-sm text-center">
                    Collect badges to level up your Hero Rank!
                  </p>
                </div>

                {/* Rank list with transition highlight on current rank */}
                <div className="p-3 xs:p-4 sm:p-5 space-y-3 sm:space-y-3.5 bg-slate-50 dark:bg-slate-950 overflow-y-auto max-h-[56vh] sm:max-h-[60vh] scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {RANKS.map((rank, i) => {
                    const isCurrent = currentRank.name === rank.name

                    return (
                      <motion.div 
                        key={i}
                        ref={isCurrent ? currentRankRef : null}
                        initial={{ opacity: 0, y: isCurrent ? 8 : 14, scale: isCurrent ? 0.95 : 0.98 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0, 
                          scale: isCurrent ? 1.02 : 1,
                          transition: { 
                            delay: isCurrent ? 0.1 : 0.04 * i,
                            type: "spring",
                            stiffness: 380,
                            damping: 24
                          }
                        }}
                        className={cn(
                          "relative flex items-center gap-3 sm:gap-4 p-3 xs:p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all",
                          isCurrent 
                            ? "bg-white dark:bg-slate-900 border-primary shadow-md ring-2 ring-primary/25" 
                            : "bg-white/85 dark:bg-slate-900/85 border-slate-200 dark:border-slate-800/85 opacity-90 dark:opacity-75"
                        )}
                      >
                        {isCurrent && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.22, type: "spring", bounce: 0.55 }}
                            className="absolute -top-2.5 -right-1.5 sm:-top-3 sm:-right-2 bg-primary text-white text-[8.5px] sm:text-[9.5px] font-black px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md border-2 border-white dark:border-slate-950 uppercase tracking-tight flex items-center gap-1"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            Current Rank
                          </motion.div>
                        )}
                        <div className={cn("h-10 w-10 sm:h-13 sm:w-13 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border-2 overflow-hidden p-1 bg-white/80 dark:bg-slate-800/80 shadow-xs", rank.color.replace('text-', 'border-'))}>
                          <img src={rank.image} alt={rank.name} className="h-full w-full object-contain drop-shadow-xs" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5 mb-0.5">
                            <h4 className={cn("font-black text-xs sm:text-base uppercase tracking-tight truncate", rank.color.replace('-400', '-600'), "dark:" + rank.color)}>{rank.name}</h4>
                            <span className="text-[9.5px] sm:text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md uppercase shrink-0 border border-slate-200/60 dark:border-slate-700/60">{rank.count}+ Badges</span>
                          </div>
                          <p className="text-[11px] xs:text-xs sm:text-[13px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{rank.desc}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Footer Button */}
                <div className="p-3 xs:p-4 sm:p-5 pt-1.5 sm:pt-2 bg-slate-50 dark:bg-slate-950 shrink-0">
                  <button
                    onClick={() => {
                      playSound('/sounds/click.mp3', 'general');
                      setShowRankGuide(false);
                    }}
                    className="w-full bg-primary hover:bg-primary/90 active:scale-[0.99] text-white font-black py-3 sm:py-4 rounded-xl sm:rounded-2xl border-b-[4px] sm:border-b-[6px] border-red-800 active:border-b-0 active:translate-y-[4px] sm:active:translate-y-[6px] transition-all uppercase tracking-widest text-xs sm:text-sm shadow-md cursor-pointer"
                  >
                    Got it, Hero!
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
