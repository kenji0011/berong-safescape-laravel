import React, { useEffect, useState } from "react"
import { Link } from '@inertiajs/react'
import { ArrowLeft, Trophy, Lock, Calendar, Shield, CheckCircle, Zap, ArrowRight, BadgeCheck, X, Check } from "lucide-react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { playSound } from '@/lib/audio'

interface BadgeHallProps {
  completedModules: number[]
  earnedBadges?: any[]
}

const ALL_BADGES = [
  { id: 'module_1', moduleNum: 1, name: "Fire Triangle", alias: "Fire Scout", source: "Module 1", image: "/fire_hall.png", hint: "Complete Module 1: Fire is a Tool, Not a Toy and pass the quiz.", target: "/kids/safescape/1" },
  { id: 'module_2', moduleNum: 2, name: "Safety Leader", alias: "Fire Marshal", source: "Module 2", image: "/shield_hall.png", hint: "Master the Fire Drill in Module 2 to earn this badge.", target: "/kids/safescape/2" },
  { id: 'module_3', moduleNum: 3, name: "Plan Master", alias: "Escape Planner", source: "Module 3", image: "/plan_hall.png", hint: "Create your Family Escape Plan in Module 3.", target: "/kids/safescape/3" },
  { id: 'module_4', moduleNum: 4, name: "Low & Go!", alias: "Smoke Crawler", source: "Module 4", image: "/low_hall.png", hint: "Learn the Smoke Crawling technique in Module 4.", target: "/kids/safescape/4" },
  { id: 'module_5', moduleNum: 5, name: "Home Guard", alias: "Fire Prevention", source: "Module 5", image: "/home_hall.png", hint: "Complete the final Module 5 training session.", target: "/kids/safescape/5" },
  { id: 'quiz_hero', name: "Quiz Hero", source: "Fire Quiz", image: "/quiz_hall.png", hint: "Score 100% on any Fire Safety Quiz.", target: "/kids/quiz" },
  { id: 'memory_master', name: "Memory Master", source: "Memory Game", image: "/memory_hall.png", hint: "Finish the Memory Match game with zero mistakes.", target: "/kids/memory-game" },
  { id: 'smoke_scout', name: "Smoke Scout", source: "Smoke Crawl", image: "/smoke_hall.png", hint: "Stay low and find your way out of the smoke-filled maze!", target: "/kids/smoke-crawl" },
  { id: 'safety_scout', name: "Safety Scout", source: "Hot or Not", image: "/safety_hall.png", hint: "Correcty identify all hazards in the Hazard House.", target: "/kids/hot-or-not" },
  { id: 'hazard_hero', name: "Hazard Hero", source: "Hazard Blitz", image: "/hazard_hall.png", hint: "Neutralize hazards and reach 500 points in Hazard Blitz.", target: "/kids/hazard-blitz" },
  { id: 'intel_analyst', name: "Intel Analyst", source: "Videos", image: "/intel_hall.png", hint: "Watch all fire safety training videos.", target: "/kids/videos" },
  { id: 'task_master', name: "Task Master", source: "Inspector Game", image: "/task_master_badge.png", hint: "Complete all 5 Modules first to unlock the Inspector Game.", target: "/kids/task-master", requiresAllModules: true },
  { id: 'dispatch_hero', name: "Dispatch Hero", source: "The Right Call", image: "/dispatch_hall.png", hint: "Watch all Fire Safety Videos first to unlock The Right Call.", target: "/kids/the-right-call", requiresBadge: 'intel_analyst' },
] as const

const BadgeHallPage = ({ completedModules = [], earnedBadges = [] }: BadgeHallProps) => {
  const { user } = useAuth()
  const [selectedLockedBadge, setSelectedLockedBadge] = useState<typeof ALL_BADGES[number] | null>(null)
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const highlight = params.get('highlight');
    if (highlight) {
      const decodedName = decodeURIComponent(highlight).toLowerCase();
      const index = ALL_BADGES.findIndex(b => 
        b.name.toLowerCase() === decodedName || 
        ('alias' in b && b.alias?.toLowerCase() === decodedName)
      );
      if (index !== -1) {
        const el = document.getElementById(`badge-card-${index}`);
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('animate-bounce', 'ring-4', 'ring-yellow-400', 'ring-offset-4', 'ring-offset-slate-50', 'dark:ring-offset-slate-900', 'shadow-[0_0_40px_rgba(250,204,21,0.6)]');
            el.style.animationDuration = '2s'; // Slow down the bounce speed
            playSound('/sounds/win.mp3', 'notification');
            setTimeout(() => {
              el.classList.remove('animate-bounce', 'ring-4', 'ring-yellow-400', 'ring-offset-4', 'ring-offset-slate-50', 'dark:ring-offset-slate-900', 'shadow-[0_0_40px_rgba(250,204,21,0.6)]');
              el.style.animationDuration = ''; // Reset
            }, 3000);
          }, 400); // slight delay to ensure smooth scrolling starts after layout
        }
      }
    }
  }, []);

  const allModulesCompleted = completedModules.length >= 5

  const getBadgeState = (badge: typeof ALL_BADGES[number]) => {
    const earned = earnedBadges.find(b => b.badge_id === badge.id)
    const isEarned = ('moduleNum' in badge && badge.moduleNum && completedModules.includes(badge.moduleNum)) || !!earned
    return { isEarned, date: earned?.earnedAt || (isEarned ? "Recent" : null) }
  }

  // Check if a badge's game/content is accessible (prerequisites met)
  const isBadgeAccessible = (badge: typeof ALL_BADGES[number]) => {
    if ('requiresAllModules' in badge && badge.requiresAllModules) return allModulesCompleted
    if ('requiresBadge' in badge && badge.requiresBadge) return earnedBadges.some(b => b.badge_id === badge.requiresBadge)
    return true // freely accessible
  }

  const earnedCount = ALL_BADGES.filter(b => getBadgeState(b).isEarned).length

  return (
    <div className="-mt-[104px] sm:-mt-[120px] min-h-[calc(100vh+104px)] sm:min-h-[calc(100vh+120px)] bg-slate-50 dark:bg-slate-950 font-sans flex flex-col text-slate-900 dark:text-white transition-colors duration-500">
      {/* ── High-Impact Hero Header: Optimized for Mobile Readability ── */}
      <div className="relative pt-[104px] sm:pt-[168px] pb-12 sm:pb-20 px-4 sm:px-10 bg-gradient-to-br from-primary via-red-600 to-rose-700 overflow-hidden shrink-0">
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
            <div className="h-24 w-24 sm:h-44 sm:w-44 bg-white/20 rounded-[2rem] sm:rounded-[3rem] flex items-center justify-center shadow-2xl border-2 sm:border-4 border-white/30 shrink-0 transform -rotate-3 overflow-hidden">
               <img src="/badge_hall.png" className="h-full w-full object-contain p-2 sm:p-4" alt="Badge Hall" />
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
      <div className="flex-1 bg-white/50 dark:bg-slate-900/50 -mt-6 sm:-mt-10 rounded-t-[2rem] sm:rounded-t-[4rem] border-t-4 sm:border-t-8 border-slate-100 dark:border-slate-900 px-3 sm:px-6 py-10 sm:py-16 pb-24 transition-colors">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
            {ALL_BADGES.map((badge, i) => {
              const state = getBadgeState(badge)
              return (
                <div 
                  key={i} 
                  id={`badge-card-${i}`}
                  onClick={() => {
                    if (state.isEarned) {
                      playSound('/sounds/tap.mp3', 'general');
                    }
                  }}
                  className={cn(
                    "group relative p-3 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border-2 sm:border-[3px] transition-all duration-500 flex flex-col min-h-[180px] sm:min-h-[300px] h-auto overflow-hidden cursor-pointer",
                    state.isEarned 
                      ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 shadow-xl hover:-translate-y-1.5 sm:hover:-translate-y-2" 
                      : "bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/40"
                  )}
                >
                  {/* Badge Graphic Row - Centered Hero Display */}
                  <div className={cn("flex items-center justify-center mb-4 sm:mb-6 shrink-0 relative mt-2", !state.isEarned && "opacity-50")}>
                    <div className="relative z-10">
                      {/* Badge Graphic */}
                      <div className="h-16 w-16 sm:h-32 sm:w-32 flex items-center justify-center relative transform group-hover:scale-110 transition-transform duration-500">
                        <img 
                          src={badge.image} 
                          className={cn(
                            "h-full w-full object-contain drop-shadow-lg",
                            !state.isEarned && "filter grayscale opacity-40 contrast-75 brightness-75 drop-shadow-none"
                          )} 
                          alt={badge.name} 
                        />
                        {!state.isEarned && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl sm:rounded-3xl">
                            <Lock className="h-6 w-6 sm:h-10 sm:w-10 text-slate-400 drop-shadow-md" />
                          </div>
                        )}
                      </div>

                      {/* Checkmark Floating Outside */}
                      {state.isEarned && (
                        <div className="absolute -bottom-1 -right-1 sm:-bottom-3 sm:-right-3 z-20 bg-green-500 rounded-full shadow-[0_4px_10px_rgba(34,197,94,0.5)] border-2 sm:border-[3px] border-white dark:border-slate-800 flex items-center justify-center h-6 w-6 sm:h-10 sm:w-10">
                           <Check className="h-3 w-3 sm:h-6 sm:w-6 text-white stroke-[4]" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text Details Area - Centered & Premium */}
                  <div className={cn("flex-1 flex flex-col items-center text-center overflow-hidden mb-3 sm:mb-4", !state.isEarned && "opacity-60")}>
                    <h3 className={cn(
                      "text-[12px] sm:text-2xl font-black uppercase tracking-tight mb-1 sm:mb-2 w-full line-clamp-2 sm:truncate leading-tight",
                      state.isEarned ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-600"
                    )}>
                      {state.isEarned ? badge.name : "Locked"}
                    </h3>
                    
                    <div className={cn(
                      "inline-block px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[7px] sm:text-[11px] font-black uppercase tracking-widest mb-2 sm:mb-3",
                      state.isEarned 
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-500/20" 
                        : "bg-slate-200 dark:bg-slate-900 text-slate-500 dark:text-slate-700"
                    )}>
                      {badge.source}
                    </div>
                    
                    <p className={cn(
                      "text-[9px] sm:text-[13px] font-semibold leading-tight sm:leading-relaxed line-clamp-2 sm:line-clamp-3",
                      state.isEarned ? "text-slate-600 dark:text-slate-400" : "text-slate-400 dark:text-slate-600 italic"
                    )}>
                      {state.isEarned 
                        ? `Mastered hero skills in ${badge.source}.` 
                        : badge.hint}
                    </p>
                  </div>

                  {/* Action Footer - Certificate Stamp Style */}
                  <div className="mt-auto pt-2 sm:pt-5 border-t border-slate-100 dark:border-slate-800/50">
                    {state.isEarned ? (
                      <div className="w-full flex items-center justify-between py-1.5 sm:py-3 px-2 sm:px-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg sm:rounded-xl border border-emerald-200 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-300">
                        <div className="flex items-center gap-1 sm:gap-2">
                           <span className="text-[7px] sm:text-[11px] font-black uppercase tracking-widest">Obtained</span>
                        </div>
                        <div className="font-black text-[8px] sm:text-xs">
                          {state.date === "Recent" ? "Today" : new Date(state.date!).toLocaleDateString()}
                        </div>
                      </div>
                    ) : isBadgeAccessible(badge) ? (
                      <Link 
                        href={badge.target || "/kids/safescape"} 
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-black py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-[0_4px_0_#c2410c] active:shadow-none active:translate-y-[4px] border-t border-white/20"
                      >
                        Go!
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Link>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLockedBadge(badge);
                        }}
                        className="w-full bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-black py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-[0_4px_0_#94a3b8] dark:shadow-[0_4px_0_#475569] active:shadow-none active:translate-y-[4px] border-t border-white/20"
                      >
                        <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                        Locked
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Compact Motivational Footer for Mobile */}
          <div className="mt-12 sm:mt-20 p-6 sm:p-12 bg-blue-600 rounded-[2.5rem] sm:rounded-[3rem] border-4 border-white/10 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -z-0"></div>
            <div className="relative z-10">
              <Shield className="h-10 w-10 sm:h-16 sm:w-16 text-yellow-300 mx-auto mb-4 sm:mb-6" />
              <h2 className="text-xl sm:text-5xl font-black uppercase mb-2 sm:mb-4 text-white">You're Doing Great!</h2>
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

      {/* Locked Badge Hint Modal */}
      {selectedLockedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="absolute inset-0" 
            onClick={() => setSelectedLockedBadge(null)} 
          />
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-slate-200 dark:border-slate-800 relative flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedLockedBadge(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="h-20 w-20 sm:h-24 sm:w-24 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-inner p-4 relative overflow-hidden">
              <img 
                src={selectedLockedBadge.image} 
                className="h-full w-full object-contain filter grayscale opacity-50 relative z-10" 
                alt={selectedLockedBadge.name} 
              />
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <Lock className="h-8 w-8 text-slate-500/50" />
              </div>
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-black uppercase mb-2 text-slate-900 dark:text-white">
              Unlock {selectedLockedBadge.name}?
            </h3>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-4 py-3 rounded-xl mb-2 text-sm sm:text-base font-bold border border-blue-200 dark:border-blue-800/50 w-full text-left">
              <span className="block text-xs uppercase tracking-widest text-blue-500 mb-1">Mission Hint:</span>
              {selectedLockedBadge.hint}
            </div>
            
          </div>
        </div>
      )}
    </div>
  )
}

BadgeHallPage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default BadgeHallPage
