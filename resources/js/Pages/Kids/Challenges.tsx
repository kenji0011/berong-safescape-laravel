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

const KidsChallengesPage = () => {
  const { reduceMotion } = useSettings()
  const [isMobile, setIsMobile] = useState(false)
  const [stats, setStats] = useState<{ onlineCount: number; totalStudents: number }>({ onlineCount: 12, totalStudents: 0 })

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/engagement/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err)
      }
    }
    fetchStats()
  }, [])

  const [challenges, setChallenges] = useState<ContentCardData[]>([])
  const [isLoadingContent, setIsLoadingContent] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingContent(true)
        // Artificial delay to show off the cool skeleton loading
        await new Promise(resolve => setTimeout(resolve, 1000))

        const content: ContentCardData[] = [
          {
            id: "activity-1",
            title: "Fire Safety Quiz",
            description: "Test your knowledge with fun questions and earn your Safety Scout badge!",
            type: "activity",
            imageUrl: "/fire_safety_quiz.jpg",
            href: "/kids/quiz",
            difficulty: "medium",
            category: "activities"
          },
            {
              id: "activity-2",
              title: "Memory Game",
              description: "Match fire safety symbols and tools to sharpen your hero senses!",
              type: "activity",
              imageUrl: "/memory_game.jpg",
              href: "/kids/memory-game",
              difficulty: "easy",
              category: "activities"
            },
            {
              id: "activity-3",
              title: "The Smoke Crawl",
              description: "Stay low and find your way out of the smoke-filled maze!",
              type: "activity",
              imageUrl: "/smoke_crawl.png",
              href: "/kids/smoke-crawl",
              difficulty: "hard",
              category: "activities"
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
  }, [])

  return (
    <div className="min-h-screen relative bg-blue-50">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/challenges-bg.png" 
          alt="" 
          className="w-full h-full object-cover opacity-40 mix-blend-multiply" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white/40 to-blue-50/90"></div>
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Premium Header Section */}
          <div className="relative mb-12 group">
            {/* Background Glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            
            <div className="relative bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl border-2 border-slate-50 overflow-hidden">
               {/* Decorative floating elements */}
               <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                  <div className="text-8xl sm:text-9xl font-black">🏆</div>
               </div>
               <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-60"></div>
               
               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
                  <Link 
                    href="/kids" 
                    className="group/btn bg-slate-50 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-x-1 border-2 border-slate-100 flex items-center justify-center"
                  >
                     <ArrowLeft className="h-6 w-6 text-slate-600 group-hover/btn:text-blue-600 transition-colors" />
                  </Link>
                  
                  <div className="flex-1">
                     <div className="flex items-center gap-3 mb-1">
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-200">
                           Mission: Possible
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                           Live Ops
                        </span>
                     </div>
                     <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mb-2">
                        Challenge <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Center</span>
                     </h1>
                     <p className="text-slate-500 font-bold text-sm sm:text-base max-w-lg leading-relaxed">
                        Ready to test your hero skills? Pick a mission below and prove you're the ultimate Fire Safety Master! 🌟
                     </p>
                  </div>

                  <div className="hidden lg:flex flex-col items-end gap-2 pr-4">
                     <div className="flex -space-x-3">
                        {[1,2,3,4,5].map(i => (
                           <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-xs shadow-sm overflow-hidden">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="User" />
                           </div>
                        ))}
                        <div className="w-10 h-10 rounded-full border-4 border-white bg-blue-500 flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                           +{stats.onlineCount > 5 ? stats.onlineCount - 5 : 0}
                        </div>
                     </div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Heroes Online Now</span>
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
              skeletonCount={3}
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
