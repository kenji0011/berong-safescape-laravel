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

interface KidsPageProps {
  modules?: any[]
  progress?: {
    completedModules: number[]
    badges: any[]
  }
}

const KidsDashboardPage = ({ modules, progress }: KidsPageProps) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { reduceMotion } = useSettings()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const buildContent = (completedIds: number[]): ContentCardData[] => [
    {
      id: "safescape-course",
      title: "SafeScape Fire Safety Course",
      description: "Complete 5 exciting modules to become a Fire Safety Hero! Learn about the Fire Triangle, escape plans, and more!",
      type: "module",
      emoji: "🛡️",
      href: "/kids/safescape",
      category: "modules",
      isCompleted: completedIds.length >= 5
    },
    {
      id: "edith-simulation",
      title: "EDITH Simulation",
      description: "Practice your Home Fire Escape Plan! Save your family from the spreading fire in this realistic 3D simulation.",
      type: "game",
      emoji: "🏠",
      href: "/kids/simulation",
      isLocked: completedIds.length < 5,
      category: "games",
      unlockRequirement: "Complete 5 Modules"
    },
    {
      id: "video-game",
      title: "Task Master",
      description: "Complete daily missions and earn legendary rewards! Show your skills as a top fire safety expert.",
      type: "game",
      imageUrl: "/task_master.png",
      href: "#",
      isLocked: true,
      category: "games",
      duration: "Under Development",
      unlockRequirement: "Under Development"
    },
    {
      id: "escape-room-game",
      title: "The Right Call",
      description: "Answer emergency calls and dispatch the right team! Do you have what it takes to be a dispatching hero?",
      type: "game",
      emoji: "🔦",
      href: "#",
      isLocked: true,
      category: "games",
      duration: "Under Development",
      unlockRequirement: "Under Development"
    },
    {
      id: "video-portal",
      title: "Fire Safety Videos",
      description: "Watch exciting videos and learn how to be a Fire Safety Hero! New videos added every week.",
      type: "video",
      emoji: "📺",
      href: "/kids/videos",
      duration: "Full Library",
      category: "videos"
    },
    {
      id: "activity-portal",
      title: "Mini Games",
      description: "Play fun quizzes and memory games! Earn extra points and show off your knowledge.",
      type: "activity",
      emoji: "🏆",
      href: "/kids/challenges",
      difficulty: "medium",
      category: "activities"
    },

  ]

  const allContent = useMemo(() => {
    return buildContent(progress?.completedModules || [])
  }, [progress])

  const handleContentClick = (content: ContentCardData) => {
    if (content.isLocked) {
      if (content.id === "edith-simulation") {
        toast.error("Access Denied!", {
          description: "You must complete all 5 modules of the SafeScape Fire Safety Course to unlock this simulation!",
          duration: 5000,
        })
      }
      return
    }

    if (content.href !== "#") {
      router.visit(content.href)
    }
  }

  return (
    <div className="min-h-screen relative bg-background transition-colors duration-500">
      {/* Optimized Background - Using fixed div instead of bg-fixed to prevent scroll repaints */}
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8">
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
    </div>
  )
}

KidsDashboardPage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default KidsDashboardPage
