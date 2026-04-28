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
      title: "🔥 SafeScape Fire Safety Course",
      description: "Complete 5 exciting modules to become a Fire Safety Hero! Learn about the Fire Triangle, escape plans, and more!",
      type: "module",
      emoji: "🛡️",
      href: "/kids/safescape",
      isNew: true,
      category: "modules",
      isCompleted: completedIds.length >= 5
    },
    {
      id: "video-game",
      title: "🎮 Fire Safety Adventure",
      description: "The ultimate 3D fire safety game is under development. Prepare for an epic mission!",
      type: "game",
      emoji: "🕹️",
      href: "#",
      isLocked: true,
      category: "games",
      duration: "Coming Soon!"
    },
    {
      id: "escape-room-game",
      title: "🕵️ Fire Escape Room",
      description: "Test your speed and logic in our upcoming virtual escape room challenge. Can you find the way out?",
      type: "game",
      emoji: "🔦",
      href: "#",
      isLocked: true,
      category: "games",
      duration: "Under Development"
    },
    {
      id: "video-portal",
      title: "🎬 Fire Safety Videos",
      description: "Watch exciting videos and learn how to be a Fire Safety Hero! New videos added every week.",
      type: "video",
      emoji: "📺",
      href: "/kids/videos",
      duration: "Full Library",
      category: "videos"
    },
    {
      id: "activity-portal",
      title: "✨ Mini Games",
      description: "Play fun quizzes and memory games! Earn extra points and show off your knowledge.",
      type: "activity",
      emoji: "🏆",
      href: "/kids/challenges",
      difficulty: "medium",
      category: "activities"
    },
    {
      id: "more-content",
      title: "✨ More Missions Coming!",
      description: "We're busy building new adventures for our Fire Safety Heroes! Keep practicing your skills.",
      type: "activity",
      emoji: "🚀",
      href: "#",
      isLocked: true,
      category: "activities",
      duration: "More contents soon!"
    },
  ]

  const allContent = useMemo(() => {
    return buildContent(progress?.completedModules || [])
  }, [progress])

  const handleContentClick = (content: ContentCardData) => {
    if (content.href !== "#") {
      router.visit(content.href)
    }
  }

  return (
    <div className="min-h-screen relative bg-blue-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Optimized Background - Using fixed div instead of bg-fixed to prevent scroll repaints */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none transform-gpu"
        style={{ 
          backgroundImage: "url('/challenges-bg.png')",
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        }}
      >
        <div className="absolute inset-0 bg-white/10 dark:bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      {!isMobile && !reduceMotion && (
        <Particles 
          className="!fixed !inset-0 z-0" 
          quantity={60} 
          color={["#ef4444", "#f97316", "#fbbf24"]} 
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
