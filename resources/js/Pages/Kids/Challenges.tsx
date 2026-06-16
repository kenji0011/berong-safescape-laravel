"use client"

import { useEffect, useState } from "react"
import { ContentGrid } from "@/Components/content-grid"
import type { ContentCardData } from "@/Components/content-card"
import DashboardLayout from "@/Layouts/DashboardLayout"
import React from "react"
import Particles from "@/Components/ui/particles"
import { useSettings } from "@/lib/settings-context"
import { ArrowLeft } from "lucide-react"
import { Link } from "@inertiajs/react"

interface ChallengesProps {
  progress?: {
    completedModules: number[]
    earnedBadges: any[]
  }
}

const KidsChallengesPage = ({ progress }: ChallengesProps) => {
  const { reduceMotion } = useSettings()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const [challenges, setChallenges] = useState<ContentCardData[]>([])
  const [isLoadingContent, setIsLoadingContent] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingContent(true)
        // Artificial delay to show off the cool skeleton loading
        await new Promise(resolve => setTimeout(resolve, 1000))

        const earnedBadgeIds = progress?.earnedBadges?.map(b => b.badge_id) || []

        const content: ContentCardData[] = [
          {
            id: "activity-1",
            title: "Fire Safety Quiz",
            description: "Test your knowledge with fun questions and earn your Quiz Hero badge!",
            type: "activity",
            imageUrl: "/fire_safety_quiz.jpg",
            href: "/kids/quiz",
            difficulty: "medium",
            category: "activities",
            isCompleted: earnedBadgeIds.includes('quiz_hero'),
            badgeImageUrl: "/quiz_hall.png",
            badgeName: "Quiz Hero",
            badgeHint: "Score 100% on any Fire Safety Quiz."
          },
            {
              id: "activity-2",
              title: "Memory Game",
              description: "Match fire safety symbols and tools to sharpen your hero senses!",
              type: "activity",
              imageUrl: "/memory_game.jpg",
              href: "/kids/memory-game",
              difficulty: "easy",
              category: "activities",
              isCompleted: earnedBadgeIds.includes('memory_master'),
              badgeImageUrl: "/memory_hall.png",
              badgeName: "Memory Master",
              badgeHint: "Finish the Memory Match game with zero mistakes."
            },
            {
              id: "activity-3",
              title: "The Smoke Crawl",
              description: "Stay low and find your way out of the smoke-filled maze!",
              type: "activity",
              imageUrl: "/smoke_crawl.png",
              href: "/kids/smoke-crawl",
              difficulty: "hard",
              category: "activities",
              isCompleted: earnedBadgeIds.includes('smoke_scout'),
              badgeImageUrl: "/smoke_hall.png",
              badgeName: "Smoke Scout",
              badgeHint: "Stay low and find your way out of the smoke-filled maze!"
            },
            {
              id: "activity-7",
              title: "Hot or Not?",
              description: "Can you spot the difference between safe toys and dangerous tools?",
              type: "activity",
              imageUrl: "/hotornot.jpg",
              href: "/kids/hot-or-not",
              difficulty: "easy",
              category: "activities",
              isCompleted: earnedBadgeIds.includes('safety_scout'),
              badgeImageUrl: "/safety_hall.png",
              badgeName: "Safety Scout",
              badgeHint: "Correcty identify all hazards in the Hazard House."
            },
            {
              id: "activity-8",
              title: "Hazard Blitz",
              description: "Fast-paced action! Neutralize falling hazards before they hit the floor. Watch out for safety gear!",
              type: "activity",
              imageUrl: "/hazard_blitz.jpg",
              href: "/kids/hazard-blitz",
              difficulty: "medium",
              category: "activities",
              isCompleted: earnedBadgeIds.includes('hazard_hero'),
              badgeImageUrl: "/hazard_hall.png",
              badgeName: "Hazard Hero",
              badgeHint: "Neutralize hazards and reach 500 points in Hazard Blitz."
            },
            {
              id: "activity-9",
              title: "3D Hazard Hunt",
              description: "Explore a 3D room, identify dangerous fire hazards, and clear the area before time runs out!",
              type: "activity",
              imageUrl: "/hazard_hunt_pr.jpg",
              href: "/game",
              difficulty: "medium",
              category: "activities",
              isCompleted: false,
              badgeLabel: "Early Access"
            }
          ]

        // Preload images to prevent "popping"
        content.forEach(item => {
          if (item.imageUrl) {
            const img = new Image()
            img.src = item.imageUrl
          }
        })

        setChallenges(content)
      } catch (err) {
        console.error("Failed to fetch challenges:", err)
      } finally {
        setIsLoadingContent(false)
      }
    }
    fetchData()
  }, [progress])

  return (
    <div className="-mt-[104px] sm:-mt-[120px] pt-[88px] sm:pt-[120px] min-h-[calc(100vh+104px)] sm:min-h-[calc(100vh+120px)] relative bg-background transition-colors duration-500">
      {/* Background Image with Overlay */}
      <div className="fixed top-0 left-0 w-full z-0 pointer-events-none" style={{ height: '100vh', minHeight: '100lvh' }}>
        <img 
          src="/challenges-bg.png" 
          alt="" 
          className="w-full h-full object-cover opacity-20 dark:opacity-10 mix-blend-multiply grayscale-[20%]" 
        />
        <div className="absolute inset-0 bg-background/90"></div>
      </div>
      {/* Animated Particles Background */}
      {!isMobile && !reduceMotion && (
        <Particles
          className="!fixed !inset-0 z-0"
          quantity={50}
          color="#3b82f6"
          size={2}
          staticity={50}
          ease={70}
        />
      )}

      <div className="relative z-10 w-full h-full flex-1">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 sm:py-8">
          {/* Premium Header Section */}
          <div className="relative mb-8 sm:mb-12 group">
            {/* Background Glow */}
            <div className="absolute -inset-2 bg-blue-500/10 rounded-[2.5rem] opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            
            <div className="relative bg-white dark:bg-slate-800 rounded-[2rem] p-5 sm:p-8 shadow-xl border-2 border-slate-50 dark:border-slate-700 overflow-hidden transition-colors duration-500">
               {/* Decorative floating elements */}
                <div className="hidden sm:block absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                   <img src="/games.png" className="h-24 w-24 sm:h-36 sm:w-36 object-contain" alt="" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full opacity-60"></div>
               
               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 relative z-10">
                  <Link 
                    href="/kids" 
                    className="group/btn bg-slate-50 dark:bg-slate-700 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-x-1 border-2 border-slate-100 dark:border-slate-600 flex items-center justify-center shrink-0"
                  >
                     <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 dark:text-slate-300 group-hover/btn:text-blue-600 transition-colors" />
                  </Link>
                  
                  <div className="flex-1">
                     <div className="flex items-center gap-3 mb-1">
                        <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-200 dark:border-blue-800">
                           Mission: Possible
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                           Live Ops
                        </span>
                     </div>
                     <h1 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-1 sm:mb-2 uppercase">
                        Mini <span className="text-blue-600 dark:text-blue-400">Games</span>
                     </h1>
                     <p className="text-slate-500 dark:text-slate-400 font-bold text-sm sm:text-base max-w-lg leading-relaxed">
                        Ready to play? Pick a game below and prove you're a Fire Safety Master! 🌟
                     </p>
                  </div>
               </div>
            </div>
          </div>

          {/* Challenges Grid */}
          <div className="mt-12">
            <ContentGrid
              contents={challenges}
              variant="grid"
              isLoading={isLoadingContent}
              skeletonCount={6}
              emptyMessage="More challenges coming soon! 🎉"
            />
          </div>
        </main>
      </div>
    </div>
  )
}

KidsChallengesPage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default KidsChallengesPage
