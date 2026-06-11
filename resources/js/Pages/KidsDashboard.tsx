"use client"

import { useEffect, useState, useMemo } from "react"
import { router, Deferred } from '@inertiajs/react'
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/Components/navigation"
import { KidsWelcomeBanner } from "@/Components/kids-welcome-banner"
import { ContentGrid } from "@/Components/content-grid"
import { ContentCard, ContentCardData } from "@/Components/content-card"
import { Footer } from "@/Components/footer"
import DashboardLayout from "@/Layouts/DashboardLayout"
import React from "react"
import { toast } from "sonner"
import Particles from "@/Components/ui/particles"
import { useSettings } from "@/lib/settings-context"
import { KidsWelcomeBannerSkeleton, ContentGridSkeleton } from "@/Components/dashboard-skeletons"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Sparkles } from "lucide-react"

interface KidsPageProps {
  modules?: any[]
  progress?: {
    completedModules: number[]
    badges: any[]
  }
}

const KidsDashboardPage = ({ modules, progress }: KidsPageProps) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { reduceMotion, focusMode } = useSettings()
  const [isMobile, setIsMobile] = useState(false)

  const [showFirstTimeTutorial, setShowFirstTimeTutorial] = useState(false)
  const [pulseFirstModule, setPulseFirstModule] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // Show tutorial only for Kids, on their first visit, when they haven't completed any modules yet
    if (user && (!progress?.completedModules || progress.completedModules.length === 0)) {
      const tutorialSeenKey = `safescape_kid_tutorial_seen_${user.id}`
      const firstModuleClickedKey = `safescape_first_module_clicked_${user.id}`
      const tutorialSeen = localStorage.getItem(tutorialSeenKey)
      const firstModuleClicked = localStorage.getItem(firstModuleClickedKey)
      if (!tutorialSeen) {
        const timer = setTimeout(() => {
          setShowFirstTimeTutorial(true)
          new Audio('/sounds/combo.mp3').play().catch(() => {})
        }, 1200) // Small delay to let the dashboard render
        return () => clearTimeout(timer)
      } else if (!firstModuleClicked) {
        // If they already saw the tutorial but still haven't clicked the module, pulse the card to guide them!
        setPulseFirstModule(true)
      }
    }
  }, [user, progress])

  const dismissTutorial = () => {
    if (!user) return
    new Audio('/sounds/click.mp3').play().catch(() => {})
    const tutorialSeenKey = `safescape_kid_tutorial_seen_${user.id}`
    const firstModuleClickedKey = `safescape_first_module_clicked_${user.id}`
    localStorage.setItem(tutorialSeenKey, 'true')
    setShowFirstTimeTutorial(false)
    const firstModuleClicked = localStorage.getItem(firstModuleClickedKey)
    if (!firstModuleClicked) {
      setPulseFirstModule(true)
    }
  }

  const buildContent = (completedIds: number[], badges: any[], shouldPulse: boolean): ContentCardData[] => [
    {
      id: "safescape-course",
      title: "SafeScape Fire Safety Course",
      description: "Complete 5 exciting modules to become a Fire Safety Hero! Learn about the Fire Triangle, escape plans, and more!",
      type: "module",
      illustrationUrl: "/module.png",
      href: "/kids/safescape",
      category: "modules",
      isCompleted: completedIds.length >= 5,
      shouldPulse: shouldPulse
    },
    {
      id: "edith-simulation",
      title: "EDITH Simulation",
      description: "Practice your Home Fire Escape Plan! Save your family from the spreading fire in this realistic 3D simulation.",
      type: "game",
      illustrationUrl: "/edith.png",
      href: "/kids/simulation",
      isLocked: completedIds.length < 5,
      category: "games",
      unlockRequirement: "Complete 5 Modules"
    },
    {
      id: "video-game",
      title: "Task Master",
      description: "Complete tasks and learn about fire safety.",
      type: "game",
      imageUrl: "/task_master.png",
      videoPreviewUrl: "/task_master_preview.mp4",
      href: "/kids/task-master",
      isLocked: completedIds.length < 5,
      category: "games",
      unlockRequirement: "Complete 5 Modules"
    },
    {
      id: "video-portal",
      title: "Fire Safety Videos",
      description: "Watch exciting videos and learn how to be a Fire Safety Hero! New videos added every week.",
      type: "video",
      illustrationUrl: "/videos.png",
      href: "/kids/videos",
      duration: "Full Library",
      category: "videos"
    },
    {
      id: "escape-room-game",
      title: "The Right Call",
      description: "Answer emergency calls and dispatch the right team! Do you have what it takes to be a dispatching hero?",
      type: "game",
      imageUrl: "/therightcall_kids.png",
      videoPreviewUrl: "/right_call_preview.mp4",
      href: "/kids/the-right-call",
      isLocked: !badges.some(b => b.badge_id === 'intel_analyst'),
      category: "games",
      unlockRequirement: "Watch all Fire Safety Videos"
    },
    {
      id: "activity-portal",
      title: "Mini Games",
      description: "Play fun quizzes and memory games! Earn extra points and show off your knowledge.",
      type: "activity",
      illustrationUrl: "/games.png",
      videoPreviewUrl: "/mini_games_preview.mp4",
      href: "/kids/challenges",
      difficulty: "medium",
      category: "activities"
    },

  ]

  const allContent = useMemo(() => {
    return buildContent(progress?.completedModules || [], progress?.badges || [], pulseFirstModule)
  }, [progress, pulseFirstModule])

  const handleContentClick = (content: ContentCardData) => {
    if (content.isLocked) {
      toast.error("Access Denied!", {
        description: `You must ${content.unlockRequirement?.toLowerCase() || 'complete the requirements'} to unlock ${content.title}!`,
        duration: 5000,
      })
      return
    }

    if (content.id === "safescape-course" && user) {
      const firstModuleClickedKey = `safescape_first_module_clicked_${user.id}`
      localStorage.setItem(firstModuleClickedKey, 'true')
      setPulseFirstModule(false)
    }

    new Audio('/sounds/tap.mp3').play().catch(() => {})

    if (content.href !== "#") {
      router.visit(content.href)
    }
  }

  return (
    <div className="min-h-screen relative bg-background transition-colors duration-500">
      {/* Optimized Background */}
      {focusMode ? (
        <div className="fixed inset-0 z-0 pointer-events-none transition-colors duration-500 bg-white dark:bg-slate-950 ss-dotted-grid" />
      ) : (
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none transform-gpu"
          style={{ 
            backgroundImage: "url('/challenges-bg.png')",
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          <div className="absolute inset-0 bg-white/10 dark:bg-slate-900/60"></div>
        </div>
      )}

      {!isMobile && !reduceMotion && (
        <Particles 
          className="!fixed !inset-0 z-0" 
          quantity={60} 
          color={["#ef4444"]} 
          size={2.5} 
          staticity={40} 
          ease={70} 
        />
      )}

      <div className="relative z-10 w-full h-full flex-1">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-8">
          {/* Deferred Welcome Banner */}
          <Deferred data="progress" fallback={<KidsWelcomeBannerSkeleton />}>
            <KidsWelcomeBanner 
              completedModules={progress?.completedModules || []} 
              earnedBadges={progress?.badges || []} 
            />
          </Deferred>

          {/* Deferred Content Grid */}
          <Deferred data="progress" fallback={<ContentGridSkeleton count={6} />}>
            <ContentGrid
              contents={allContent}
              onCardClick={handleContentClick}
              emptyMessage="No content available yet. Check back soon! 🎉"
            />
          </Deferred>
        </main>
      </div>

      {/* First-time Kid Tutorial Modal */}
      <AnimatePresence>
        {showFirstTimeTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
              className="bg-slate-900 border-[6px] border-yellow-400 rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full text-center relative overflow-hidden shadow-[0_20px_50px_rgba(234,179,8,0.3)] transition-colors duration-500"
            >
              {/* Spinning background light effect */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.15)_0%,transparent_70%)] pointer-events-none"></div>
              
              <div className="relative z-10">
                {/* Mascot avatar with white background clipped nicely to a perfect circle */}
                <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-yellow-400 overflow-hidden transform hover:scale-105 transition-transform duration-300 shrink-0">
                  <img 
                    src="/berong_pr.png" 
                    alt="Berong Mascot" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-yellow-400 uppercase tracking-tighter mb-2">
                  Hey there, Future Fire Hero!
                </h3>
                
                <p className="text-white font-black text-sm uppercase tracking-wider mb-4 px-3 py-1 bg-red-500/20 rounded-xl inline-block border border-red-500/30">
                  Mission Alert
                </p>

                <p className="text-slate-200 font-bold text-sm sm:text-base leading-relaxed mb-6">
                  Before we play games and earn points, you need to check out the <span className="text-yellow-300 font-black">SafeScape Fire Safety Course</span> first to learn the fire safety basics!
                </p>

                <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800/80 mb-6 text-left flex items-start gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-xl border border-blue-500/30 shrink-0 text-blue-300">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-blue-300 uppercase">Your First Objective:</h4>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5 leading-tight">
                      Click the <span className="text-white font-bold">START</span> button on the first card below to begin Module 1!
                    </p>
                  </div>
                </div>

                <button 
                  onClick={dismissTutorial}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-red-700 font-extrabold py-4 rounded-2xl border-b-[6px] border-yellow-700 active:border-b-0 active:translate-y-[6px] transition-all uppercase tracking-widest text-sm shadow-lg flex items-center justify-center gap-2"
                >
                  Let's Go, Berong!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

KidsDashboardPage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default KidsDashboardPage
