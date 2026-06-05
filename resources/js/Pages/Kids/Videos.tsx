import React, { useState, useRef } from "react"
import { Link } from '@inertiajs/react'
import { ArrowLeft, Play, Tv, Star, GraduationCap, BadgeCheck } from "lucide-react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import axios from "axios"
import { cn } from "@/lib/utils"
import Particles from "@/Components/ui/particles"
import { useSettings } from "@/lib/settings-context"
import { useEffect } from "react"

interface Video {
  id: string | number;
  title: string;
  description: string;
  youtubeId: string;
  category: string;
  duration?: string;
}

interface VideosPageProps {
  initialVideos: Video[];
  watchedVideoIds: string[];
}

const VideosPage = ({ initialVideos, watchedVideoIds }: VideosPageProps) => {
  const { reduceMotion } = useSettings()
  const [isMobile, setIsMobile] = React.useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Helper to extract YouTube ID in case it's a full URL
  const extractId = (id: string) => {
    if (!id) return '';
    if (id.includes('youtube.com') || id.includes('youtu.be')) {
      const regex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([^&?\n]+)/;
      const match = id.match(regex);
      if (match && match[1]) {
        id = match[1];
      } else {
        try {
          const url = new URL(id);
          if (url.hostname.includes('youtube.com')) {
            id = url.searchParams.get('v') || id.split('/').pop() || id;
          } else if (url.hostname.includes('youtu.be')) {
            id = url.pathname.slice(1);
          }
        } catch (e) {}
      }
    }
    if (id.includes('?')) id = id.split('?')[0];
    if (id.includes('&')) id = id.split('&')[0];
    return id;
  }

  // Map database videos to UI format
  const videos = initialVideos || []
  const moreVideos = videos.map((v, index) => {
    const cleanId = extractId(v.youtubeId);
    return {
      id: v.id.toString(),
      title: v.title,
      description: v.description || "Learn important fire safety rules in a fun way!",
      src: `https://www.youtube.com/embed/${cleanId}`,
      thumbnail: `https://img.youtube.com/vi/${cleanId}/maxresdefault.jpg`,
      color: index % 2 === 0 ? "bg-purple-200" : "bg-[#fbcfe8]",
      icon: index % 3 === 0 ? "🎬" : index % 3 === 1 ? "🔥" : "🚒",
      duration: v.duration || "3:00",
      cleanId: cleanId // useful for the player
    }
  })

  const [activeVideo, setActiveVideo] = useState(moreVideos[0] || {
    id: "0",
    title: "No Videos Available",
    description: "Check back later for new fire safety videos!",
    src: "",
    thumbnail: "",
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
    const videoId = (activeVideo as any).cleanId || activeVideo.src.split('/').pop() || '';
    if (isApiLoaded && !ytPlayerRef.current) {
      initPlayer(videoId)
    } else if (ytPlayerRef.current && isApiLoaded) {
      ytPlayerRef.current.loadVideoById(videoId)
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

  const activeVideoRef = useRef(activeVideo)
  
  useEffect(() => {
    activeVideoRef.current = activeVideo
  }, [activeVideo])

  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set())

  // Sync watched videos and filter to only include those in the current list
  useEffect(() => {
    const validIds = new Set(moreVideos.map(v => v.id))
    const filteredWatched = watchedVideoIds.filter(id => validIds.has(id))
    setWatchedVideos(new Set(filteredWatched))
  }, [watchedVideoIds])

  const [badgeAwarded, setBadgeAwarded] = useState(false)

  const logVideoWatched = async (videoId: string) => {
    try {
      await axios.post('/api/engagement/log', {
        activityType: 'VIDEO_WATCHED',
        metadata: { videoId, category: 'kids' }
      })
    } catch (err) {
      console.error("Failed to log video progress:", err)
    }
  }

  const onPlayerStateChange = (event: any) => {
    // YT.PlayerState.ENDED is 0
    if (event.data === 0) {
      const currentVideoId = activeVideoRef.current.id
      
      // Log progress to database if not already watched
      if (!watchedVideos.has(currentVideoId)) {
        logVideoWatched(currentVideoId)
      }

      setWatchedVideos(prev => {
        const newWatched = new Set(prev)
        newWatched.add(currentVideoId)
        
        // Check if all videos have been watched
        if (!badgeAwarded && moreVideos.length > 0 && newWatched.size === moreVideos.length) {
          awardBadge()
        }
        return newWatched
      })
    }
  }

  const awardBadge = () => {
    setBadgeAwarded(true)
    new Audio('/sounds/win.mp3').play().catch(() => {})
    axios.post('/api/badges/award', {
      badge_id: 'intel_analyst',
      badge_name: 'Intel Analyst',
      badge_icon: '/intel_hall.png'
    }).catch(err => {
      setBadgeAwarded(false)
      console.error("Failed to award badge:", err.response?.data || err.message)
    })
  }

  const handleVideoSelect = (video: any) => {
    new Audio('/sounds/tap.mp3').play().catch(() => {})
    setActiveVideo(video)
    playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // Removed hardcoded moreVideos list as it is now derived from props

  return (
    <div className="min-h-screen relative overflow-hidden bg-blue-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Heroic Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/challenges-bg.png" 
          alt="" 
          className="w-full h-full object-cover opacity-30 dark:opacity-10 mix-blend-multiply" 
        />
        <div className="absolute inset-0 bg-background/80 transition-colors duration-500"></div>
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
            {/* Background Glow */}
            <div className="absolute -inset-2 bg-red-500/10 rounded-[2.5rem] opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            
            <div className="relative bg-white dark:bg-slate-800 rounded-[2rem] p-5 sm:p-8 shadow-xl border-2 border-slate-50 dark:border-slate-700 overflow-hidden transition-colors duration-500">
               {/* Decorative floating elements */}
               <div className="hidden sm:block absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                  <img src="/intel_hall.png" className="h-24 w-24 sm:h-36 sm:w-36 object-contain" alt="" />
               </div>
               <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full blur-2xl opacity-60"></div>
               
               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 relative z-10">
                  <Link 
                    href="/kids" 
                    className="group/btn bg-slate-50 dark:bg-slate-700 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-x-1 border-2 border-slate-100 dark:border-slate-600 flex items-center justify-center shrink-0"
                  >
                     <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 dark:text-slate-300 group-hover/btn:text-red-600 transition-colors" />
                  </Link>
                  
                  <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="px-2.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-200 dark:border-red-800">
                           Watch & Learn
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                           <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                           Live Comms
                        </span>
                     </div>
                     <h1 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-1 sm:mb-2 uppercase">
                        Fire Safety <span className="text-primary">Videos</span>
                     </h1>
                     <p className="text-slate-500 dark:text-slate-400 font-bold text-sm sm:text-base max-w-lg leading-relaxed flex items-center flex-wrap gap-1.5">
                        <span>Watch all fire safety videos to the end to earn your</span>
                        <span className="text-red-600 font-black">Intel Analyst Badge</span>!
                        <img src="/intel_hall.png" className="h-5 w-5 object-contain inline-block align-middle" alt="Intel Analyst" />
                     </p>
                  </div>
               </div>

               {/* Badge Progress Tracker */}
               <div className="mt-6 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Star className={cn("h-3 w-3", watchedVideos.size > 0 ? "text-amber-500 fill-amber-500" : "text-slate-300 dark:text-slate-600")} />
                        Intel Analyst Badge Progress
                     </span>
                     <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                        {watchedVideos.size} / {moreVideos.length} Completed
                     </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full border-2 border-slate-200 dark:border-slate-600 overflow-hidden shadow-inner">
                     <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(251,191,36,0.5)]" 
                        style={{ width: `${(watchedVideos.size / moreVideos.length) * 100}%` }}
                     />
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
               <div className="px-6 sm:px-10 py-6 bg-slate-800 border-t border-slate-700 flex flex-col sm:flex-row gap-6 items-center sm:items-start lg:items-center">
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-slate-300 font-bold text-sm sm:text-lg leading-relaxed">
                      " {activeVideo.description} "
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center sm:justify-end gap-2 w-full sm:w-auto">
                    <div className="px-3 sm:px-4 py-2 bg-slate-700 rounded-xl text-slate-300 font-black text-[10px] sm:text-xs uppercase tracking-tighter whitespace-nowrap">Day 0{activeVideo.id}</div>
                    <div className="px-3 sm:px-4 py-2 bg-red-600 rounded-xl text-white font-black text-[10px] sm:text-xs uppercase tracking-tighter shadow-lg shadow-red-900/20 whitespace-nowrap">Active Intel</div>
                    <div className="px-3 sm:px-4 py-2 bg-amber-500 rounded-xl text-white font-black text-[10px] sm:text-xs uppercase tracking-tighter shadow-lg shadow-amber-900/20 flex items-center gap-1.5 whitespace-nowrap">
                      <span className="hidden sm:inline text-xs">🎬</span>
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
                    <h3 className="text-xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Mission Briefings</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Select a target to begin training</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {moreVideos.map((video) => {
                const isActive = activeVideo.id === video.id
                return (
                  <div 
                    key={video.id}
                    onClick={() => handleVideoSelect(video)}
                    className={cn(
                      "group relative flex flex-col cursor-pointer transition-all duration-300",
                      isActive ? "scale-[1.02]" : "hover:scale-[1.02]"
                    )}
                  >
                    {/* Thumbnail Container */}
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-4 shadow-md group-hover:shadow-xl transition-shadow">
                       <img src={video.thumbnail} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                       
                       {/* Duration Overlay */}
                       <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-bold text-white tracking-wider">
                          {video.duration}
                       </div>

                       {/* Active Glow */}
                       {isActive && (
                         <div className="absolute inset-0 border-[4px] border-primary rounded-2xl animate-pulse pointer-events-none" />
                       )}
                    </div>

                    {/* Info Section - Modern Layout */}
                    <div className="flex flex-col px-1">
                       <div className="flex-1 min-w-0">
                          <h4 className={cn(
                            "font-black text-base sm:text-xl tracking-tight leading-snug line-clamp-2 mb-1 transition-colors uppercase",
                            isActive ? "text-primary" : "text-slate-800 dark:text-white group-hover:text-primary"
                          )}>
                             {video.title}
                          </h4>
                          
                          <div className="flex flex-col gap-0.5">
                             <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">
                                <span>HQ Briefing</span>
                                {watchedVideos.has(video.id) && (
                                  <>
                                    <div className="w-1 h-1 rounded-full bg-slate-400" />
                                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-500">
                                       <BadgeCheck className="h-3 w-3 fill-current" />
                                       Watched
                                    </span>
                                  </>
                                )}
                             </div>
                             
                             {isActive && (
                               <div className="flex items-center gap-1.5 text-[10px] font-black text-red-600 uppercase tracking-[0.15em] mt-1">
                                  <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                                  Now Playing
                               </div>
                             )}
                          </div>
                       </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Motivational Footer */}
          <div className="relative group/footer">
            <div className="absolute -inset-2 bg-yellow-400/20 rounded-[3rem] group-hover/footer:opacity-30 transition-opacity"></div>
            
            <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 sm:p-12 border-2 border-amber-50 dark:border-amber-900/20 shadow-2xl text-center transition-colors duration-500">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-100/50 dark:bg-amber-900/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-100/30 dark:bg-red-900/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="h-20 w-20 bg-amber-500 border-4 border-white dark:border-slate-800 rounded-[2rem] shadow-xl flex items-center justify-center mb-8 transform rotate-3 group-hover/footer:rotate-12 transition-transform duration-500">
                  <Star className="h-10 w-10 text-white fill-white" />
                </div>
                <h3 className="text-slate-800 dark:text-white text-2xl sm:text-4xl font-black mb-4 tracking-tight uppercase">Great Job, Hero! 🌟</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm sm:text-base max-w-lg leading-relaxed mb-8">
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
