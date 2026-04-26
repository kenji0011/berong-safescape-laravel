"use client"

import { useEffect, useState } from "react"
import { router } from '@inertiajs/react'
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

interface KidsPageProps {
  // If modules come from backend, we could accept them here, but for now we restore the old static logic exactly
  // modules?: any[]
}

const KidsDashboardPage = ({}: KidsPageProps) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { reduceMotion } = useSettings()
  const [allContent, setAllContent] = useState<ContentCardData[]>([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const [completedModules, setCompletedModules] = useState<number[]>([])

  // Load content and progress
  useEffect(() => {
    const fetchData = async () => {
      try {
        let completedIds: number[] = []
        
        // Fetch progress
        const progressResponse = await fetch('/api/kids/safescape')
        if (progressResponse.ok) {
          const progressData = await progressResponse.json()
          completedIds = progressData.completedModules || []
          setCompletedModules(completedIds)
        }

        // Create content array with games, videos, and modules
        const content: ContentCardData[] = [
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
            id: "video-portal",
            title: "🎬 Mission Intel",
            description: "Watch exciting videos and learn how to be a Fire Safety Hero! New intel added every week.",
            type: "video",
            emoji: "📺",
            href: "/kids/videos",
            duration: "Full Library",
            category: "videos"
          },
          // Unified Activity Portal (Shown in "All" view)
          {
            id: "activity-portal",
            title: "✨ Challenge Center",
            description: "Test your skills with quizzes and memory games! Earn extra points and show off your knowledge.",
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

        setAllContent(content)
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
      }
    }

    fetchData()
  }, [])

  const handleContentClick = (content: ContentCardData) => {
    router.visit(content.href)
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/challenges-bg.png')" }}
    >
      {/* Animated Particles Background - Fire themed (Hidden on Mobile or when Reduce Motion is on) */}
      {!isMobile && !reduceMotion && (
        <>
          <Particles
            className="!fixed !inset-0 z-0"
            quantity={100}
            color="#ef4444"
            size={2.5}
            staticity={30}
            ease={80}
          />
          <Particles
            className="!fixed !inset-0 z-0"
            quantity={60}
            color="#f97316"
            size={3}
            staticity={50}
            ease={60}
          />
          <Particles
            className="!fixed !inset-0 z-0"
            quantity={40}
            color="#fbbf24"
            size={2}
            staticity={40}
            ease={70}
          />
        </>
      )}

      <div className="relative z-10 w-full h-full flex-1">

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Banner */}
          <KidsWelcomeBanner completedModules={completedModules} />

          {/* Content Grid */}
          <ContentGrid
            contents={allContent}
            onCardClick={handleContentClick}
            emptyMessage="No content available yet. Check back soon! 🎉"
          />
        </main>
      </div>
    </div>
  )
}

KidsDashboardPage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default KidsDashboardPage
