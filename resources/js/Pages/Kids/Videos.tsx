import React, { useState, useRef } from "react"
import { Link } from '@inertiajs/react'
import { ArrowLeft, Play, Tv, Star, GraduationCap } from "lucide-react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import axios from "axios"
import { cn } from "@/lib/utils"
import Particles from "@/Components/ui/particles"
import { useSettings } from "@/lib/settings-context"
import { useEffect } from "react"

const VideosPage = () => {
  const { reduceMotion } = useSettings()
  const [isMobile, setIsMobile] = React.useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const [activeVideo, setActiveVideo] = useState({
    id: "1",
    title: "Fire Safety for Kids",
    description: "Learn important fire safety rules in a fun way!",
    src: "https://www.youtube.com/embed/AWHGdWOI4kw",
    thumbnail: "https://img.youtube.com/vi/AWHGdWOI4kw/maxresdefault.jpg",
    icon: "🎬"
  })

  const playerRef = useRef<HTMLDivElement>(null)
  const ytPlayerRef = useRef<any>(null)
  const [isApiLoaded, setIsApiLoaded] = useState(false)

  // Load YouTube IFrame API
  useEffect(() => {
    if (!(window as any).YT) {
      const tag = document.createElement('script')
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      ;(window as any).onYouTubeIframeAPIReady = () => {
        setIsApiLoaded(true)
      }
    } else {
      setIsApiLoaded(true)
    }
  }, [])

  // Initialize or update player
  useEffect(() => {
    if (isApiLoaded && !ytPlayerRef.current) {
      initPlayer(activeVideo.src.split('/').pop() || '')
    } else if (ytPlayerRef.current && isApiLoaded) {
      ytPlayerRef.current.loadVideoById(activeVideo.src.split('/').pop() || '')
    }
  }, [isApiLoaded, activeVideo])

  const initPlayer = (videoId: string) => {
    ytPlayerRef.current = new (window as any).YT.Player('youtube-player', {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        'autoplay': 0,
        'controls': 1,
        'rel': 0,
        'modestbranding': 1,
        'enablejsapi': 1,
        'origin': window.location.origin
      },
      events: {
        'onStateChange': onPlayerStateChange
      }
    })
  }

  const onPlayerStateChange = (event: any) => {
    // YT.PlayerState.ENDED is 0
    if (event.data === 0) {
      awardBadge()
    }
  }

  const awardBadge = () => {
    axios.post('/api/badges/award', {
      badge_id: 'intel_analyst',
      badge_name: 'Intel Analyst',
      badge_icon: '🎬'
    }).catch(err => console.error("Failed to award badge:", err.response?.data || err.message))
  }

  const handleVideoSelect = (video: any) => {
    setActiveVideo(video)
    playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const moreVideos = [
    {
      id: "1",
      title: "Fire Safety for Kids",
      description: "Learn important fire safety rules in a fun way!",
      src: "https://www.youtube.com/embed/AWHGdWOI4kw",
      thumbnail: "https://img.youtube.com/vi/AWHGdWOI4kw/maxresdefault.jpg",
      color: "bg-purple-200",
      icon: "🎬"
    },
    {
      id: "2",
      title: "Stop, Drop, and Roll",
      description: "Learn what to do if your clothes catch fire!",
      src: "https://www.youtube.com/embed/ZlB9q3E-RCI",
      thumbnail: "https://img.youtube.com/vi/ZlB9q3E-RCI/maxresdefault.jpg",
      color: "bg-[#fbcfe8]",
      icon: "🔥"
    },
    {
      id: "3",
      title: "Meet a Firefighter",
      description: "See what firefighters do every day!",
      src: "https://www.youtube.com/embed/5_lGysdHLFQ",
      thumbnail: "https://img.youtube.com/vi/5_lGysdHLFQ/maxresdefault.jpg",
      color: "bg-[#fbcfe8]",
      icon: "🚒"
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-blue-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Heroic Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/challenges-bg.png" 
          alt="" 
          className="w-full h-full object-cover opacity-30 dark:opacity-10 mix-blend-multiply" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white/40 to-blue-50/90 dark:from-slate-950/80 dark:via-slate-900/40 dark:to-slate-950/90"></div>
      </div>

      {/* Animated Particles */}
      {!isMobile && !reduceMotion && (
        <Particles
          className="!fixed !inset-0 z-0"
          quantity={60}
          color="#3b82f6"
          size={2}
          staticity={50}
          ease={70}
        />
      )}

      <div className="relative z-10 w-full h-full flex-1">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Premium Header Section */}
          <div className="relative mb-12 group">
            <div className="absolute -inset-2 bg-gradient-to-r from-red-500 to-rose-600 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            
            <div className="relative bg-white dark:bg-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl border-2 border-slate-50 dark:border-slate-700 overflow-hidden transition-colors duration-500">
               {/* Decorative floating elements */}
               <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                  <div className="text-8xl sm:text-9xl font-black">🎬</div>
               </div>
               <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full blur-2xl opacity-60"></div>
               
               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
                  <Link 
                    href="/kids" 
                    className="group/btn bg-slate-50 dark:bg-slate-700 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-x-1 border-2 border-slate-100 dark:border-slate-600 flex items-center justify-center"
                  >
                     <ArrowLeft className="h-6 w-6 text-slate-600 dark:text-slate-300 group-hover/btn:text-red-600 transition-colors" />
                  </Link>
                  
                  <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-200 dark:border-red-800">
                           Watch & Learn
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                           <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                           Live Comms
                        </span>
                     </div>
                     <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
                        Fire Safety <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600">Videos</span>
                     </h1>
                     <p className="text-slate-500 dark:text-slate-400 font-bold text-sm sm:text-base max-w-lg leading-relaxed">
                        Watch any fire safety video to the end to earn your <span className="text-red-600 font-black">Intel Analyst Badge</span>! 🎬
                     </p>
                  </div>
               </div>
            </div>
          </div>

          {/* Main Video Player Container - Styled as a "Mission Screen" */}
          <div ref={playerRef} className="relative mb-16 group/player animate-in fade-in zoom-in duration-700">
            <div className="absolute -inset-4 bg-slate-900 rounded-[3rem] opacity-5 shadow-2xl"></div>
            
            <div className="relative bg-slate-900 rounded-[2.5rem] border-[8px] border-slate-800 dark:border-slate-800 shadow-2xl overflow-hidden">
               {/* Player Header/Status Bar */}
               <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <h2 className="text-slate-300 font-black text-sm sm:text-lg tracking-widest uppercase">Target: {activeVideo.title}</h2>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="px-2 py-0.5 bg-slate-700 rounded text-[10px] text-slate-400 font-mono">SECURE FEED</div>
                    <div className="px-2 py-0.5 bg-red-900/30 text-red-400 rounded text-[10px] font-mono border border-red-900/50">HQ DIRECT</div>
                  </div>
               </div>

               {/* Video Viewport */}
               <div className="w-full aspect-video relative group/iframe">
                  <div id="youtube-player" className="w-full h-full absolute inset-0"></div>
                  {/* Subtle scanline effect overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
               </div>

               {/* Tactical Info Panel */}
               <div className="px-6 sm:px-10 py-6 bg-slate-800/50 backdrop-blur-md border-t border-slate-700 flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex-1">
                    <p className="text-slate-300 font-bold text-base sm:text-lg leading-relaxed italic">
                      " {activeVideo.description} "
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-4 py-2 bg-slate-700 rounded-xl text-slate-300 font-black text-xs uppercase tracking-tighter">Day 0{activeVideo.id}</div>
                    <div className="px-4 py-2 bg-red-600 rounded-xl text-white font-black text-xs uppercase tracking-tighter shadow-lg shadow-red-900/20">Active Intel</div>
                    <div className="px-4 py-2 bg-amber-500 rounded-xl text-white font-black text-xs uppercase tracking-tighter shadow-lg shadow-amber-900/20 flex items-center gap-2">
                      <span>🎬</span>
                      <span>REWARD AVAILABLE</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* More Videos Section */}
          <div className="mb-20">
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 dark:shadow-red-950/20 rotate-3 group-hover:rotate-0 transition-transform">
                     <Play className="h-6 w-6 text-white fill-current" />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">Mission Briefings</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-widest">Select a target to begin training</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {moreVideos.map((video) => {
                const isActive = activeVideo.id === video.id
                return (
                  <div 
                    key={video.id}
                    onClick={() => handleVideoSelect(video)}
                    className={cn(
                      "group relative flex flex-col bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden transition-all duration-500 cursor-pointer h-full border-2",
                      isActive 
                        ? "border-red-500 shadow-2xl shadow-red-200 dark:shadow-red-950/20 scale-[1.02] z-10" 
                        : "border-slate-50 dark:border-slate-700 shadow-xl hover:shadow-2xl hover:border-red-200 dark:hover:border-red-800 hover:-translate-y-2"
                    )}
                  >
                    {/* Full-bleed Thumbnail */}
                    <div className="relative w-full h-48 sm:h-52 overflow-hidden">
                       <img src={video.thumbnail} alt={video.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                       
                       {/* Play Overlay */}
                       <div className={cn(
                         "absolute inset-0 flex items-center justify-center transition-all duration-500",
                         isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                       )}>
                          <div className="w-16 h-16 rounded-full bg-red-600/90 backdrop-blur-sm border-4 border-white dark:border-slate-800 flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-110">
                             <Play className="h-6 w-6 text-white fill-current ml-1" />
                          </div>
                       </div>

                       {/* Duration Badge */}
                       <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                          {video.id === "1" ? "3:45" : video.id === "2" ? "2:15" : "4:30"}
                       </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                         <span className="text-xl">{video.icon}</span>
                         <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">NEW VIDEO</span>
                         <span className="ml-auto text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/30 flex items-center gap-1">
                           🎬 BADGE
                         </span>
                      </div>
                      <h4 className="font-black text-slate-800 dark:text-white text-xl mb-3 tracking-tight leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{video.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed flex-1">
                        {video.description}
                      </p>
                      
                      {isActive && (
                        <div className="mt-6 w-full bg-red-600 text-white font-black text-[10px] py-3 rounded-2xl shadow-lg shadow-red-200 dark:shadow-red-950/20 flex items-center justify-center gap-2 tracking-[0.2em] uppercase animate-pulse">
                          <Tv className="h-4 w-4" /> Now Playing
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Motivational Footer */}
          <div className="relative group/footer">
            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-[3rem] blur-xl opacity-20 group-hover/footer:opacity-30 transition-opacity"></div>
            
            <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 sm:p-12 border-2 border-amber-50 dark:border-amber-900/20 shadow-2xl text-center transition-colors duration-500">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-100/50 dark:bg-amber-900/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-100/30 dark:bg-red-900/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="h-20 w-20 bg-amber-500 border-4 border-white dark:border-slate-800 rounded-[2rem] shadow-xl flex items-center justify-center mb-8 transform rotate-3 group-hover/footer:rotate-12 transition-transform duration-500">
                  <Star className="h-10 w-10 text-white fill-white" />
                </div>
                <h3 className="text-slate-800 dark:text-white text-3xl sm:text-4xl font-black mb-4 tracking-tight">Great Job, Hero! 🌟</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-lg max-w-lg leading-relaxed mb-8">
                  Every video you watch adds to your hero knowledge. Keep training to earn your master badge!
                </p>
                <Link 
                  href="/kids/challenges"
                  className="px-10 py-4 bg-slate-900 dark:bg-slate-700 text-white rounded-full font-black text-sm tracking-widest uppercase hover:bg-slate-800 dark:hover:bg-slate-600 hover:-translate-y-1 transition-all shadow-xl active:scale-95 flex items-center gap-3"
                >
                  Go to Challenges <GraduationCap className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}

VideosPage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default VideosPage
