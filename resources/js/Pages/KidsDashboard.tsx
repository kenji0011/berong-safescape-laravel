"use client"

import { useEffect, useState } from "react"
import { router } from '@inertiajs/react'
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/Components/navigation"
import { KidsWelcomeBanner } from "@/components/kids-welcome-banner"
import { KidsNavBar, ContentCategory } from "@/components/kids-nav-bar"
import { ContentGrid } from "@/components/content-grid"
import type { ContentCardData } from "@/components/content-card"
import { Footer } from "@/Components/footer"
import DashboardLayout from "@/Layouts/DashboardLayout"
import React from "react"
import Particles from "@/components/ui/particles"
import { useSettings } from "@/lib/settings-context"

interface KidsPageProps {
  // If modules come from backend, we could accept them here, but for now we restore the old static logic exactly
  // modules?: any[]
}

const KidsDashboardPage = ({}: KidsPageProps) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { reduceMotion } = useSettings()
  const [activeCategory, setActiveCategory] = useState<ContentCategory>("all")
  const [allContent, setAllContent] = useState<ContentCardData[]>([])
  const [filteredContent, setFilteredContent] = useState<ContentCardData[]>([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load content
  useEffect(() => {
    // Create content array with games, videos, and modules
    const content: ContentCardData[] = [
      // SafeScape Course - The main learning course
      {
        id: "safescape-course",
        title: "🔥 SafeScape Fire Safety Course",
        description: "Complete 5 exciting modules to become a Fire Safety Hero! Learn about the Fire Triangle, escape plans, and more!",
        type: "module",
        emoji: "🛡️",
        href: "/kids/safescape",
        isNew: true,
        category: "modules"
      },

      // Games
      // (Games mapped for replacement next month)

      // Videos
      {
        id: "video-1",
        title: "Fire Safety Basics",
        description: "Learn the fundamentals of staying safe from fire",
        type: "video",
        emoji: "📺",
        href: "/kids/videos",
        duration: "5 min",
        category: "videos"
      },
      {
        id: "video-2",
        title: "Stop, Drop, and Roll",
        description: "What to do if your clothes catch fire",
        type: "video",
        emoji: "🎬",
        href: "/kids/videos",
        duration: "3 min",
        category: "videos"
      },

      // Activities
      {
        id: "activity-1",
        title: "Fire Safety Quiz",
        description: "Test your knowledge with fun questions!",
        type: "activity",
        emoji: "❓",
        href: "/kids/quiz",
        difficulty: "medium",
        category: "activities"
      },
      {
        id: "activity-2",
        title: "Memory Game",
        description: "Match fire safety symbols and tools",
        type: "activity",
        emoji: "🧠",
        href: "/kids/memory-game",
        difficulty: "easy",
        category: "activities"
      },
    ]

    setAllContent(content)
    setFilteredContent(content)
  }, [])

  // Filter content
  useEffect(() => {
    if (activeCategory === "all") {
      setFilteredContent(allContent)
    } else {
      const categoryMap: { [key in ContentCategory]?: string } = {
        games: "game",
        videos: "video",
        activities: "activity",
        modules: "module"
      }
      const filterType = categoryMap[activeCategory]
      setFilteredContent(allContent.filter(c => c.type === filterType || c.category === activeCategory))
    }
  }, [activeCategory, allContent])

  return (
    <div className="min-h-screen relative overflow-hidden">
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
          <KidsWelcomeBanner />

          {/* Navigation Bar */}
          <KidsNavBar
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          {/* Content Grid */}
          <ContentGrid
            contents={filteredContent}
            emptyMessage={`No ${activeCategory === "all" ? "" : activeCategory} content available yet. Check back soon! 🎉`}
          />
        </main>
      </div>
    </div>
  )
}

KidsDashboardPage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default KidsDashboardPage
