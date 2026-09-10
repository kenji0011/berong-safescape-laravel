"use client"

import React, { useState, useRef, useEffect } from "react"
import ReactDOM from "react-dom"
import { useAuth } from "@/lib/auth-context"
import { Link, Deferred } from '@inertiajs/react'
import { motion, AnimatePresence } from "framer-motion"
import confetti from 'canvas-confetti'
import { Navigation } from "@/Components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Alert, AlertDescription } from "@/Components/ui/alert"
import { Trophy, Star, Shield, Zap, Medal, Video, Clock, Search, BookOpen, FileText, AlertCircle, Play, CheckCircle2, GraduationCap, ArrowRight, CircleHelp, Gamepad2, X, ChevronDown, ChevronUp } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog"
import { professionalVideos } from "@/lib/mock-data"
import type { VideoContent } from "@/types"
import { ManualsDialog } from "@/Components/ui/manuals-dialog"
import axios from "axios"
import { Progress } from "@/Components/ui/progress"
import { Footer } from "@/Components/footer"
import DashboardLayout from "@/Layouts/DashboardLayout"
import SpotlightCard from "@/Components/ui/spotlight-card"
import "@/Components/ui/spotlight-card.css"
import { cn, getYouTubeId, formatTimeAgo } from "@/lib/utils"
import { ProfessionalWelcomeBanner } from "@/Components/Banners"
import { playSound } from '@/lib/audio'

const VideoSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 w-full">
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="flex flex-row sm:flex-col bg-white dark:bg-slate-900 rounded-[1.25rem] sm:rounded-[1.5rem] border-[3px] border-slate-200 dark:border-slate-800 p-2.5 sm:p-3 overflow-hidden shadow-[0_4px_0_#cbd5e1] dark:shadow-[0_4px_0_#0f172a] h-auto animate-pulse gap-0">
                <div className="w-[135px] xs:w-[155px] sm:w-full aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl sm:rounded-2xl shrink-0" />
                <div className="flex flex-row items-start gap-2.5 sm:gap-3 flex-1 min-w-0 pl-3 sm:pl-0 sm:mt-3">
                    <div className="hidden sm:block h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 mt-0.5" />
                    <div className="flex flex-col flex-1 min-w-0 space-y-2 py-0.5">
                        <div className="h-3.5 sm:h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                        <div className="h-3.5 sm:h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/5" />
                        <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-2/5 mt-1" />
                    </div>
                </div>
            </Card>
        ))}
    </div>
)

interface ProfessionalPageClientProps {
    initialVideos?: VideoContent[]
    watchedVideoIds?: string[]
}

const PROFESSIONAL_RANKS = [
    { name: "Master Fire Chief", count: 10, icon: Trophy, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40", border: "border-red-200 dark:border-red-800/60", desc: "The highest honor! You have mastered all training materials and lead with supreme expertise." },
    { name: "Elite Responder", count: 6, icon: Star, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40", border: "border-blue-200 dark:border-blue-800/60", desc: "An exceptional officer with advanced knowledge and rapid response capabilities." },
    { name: "Safety Specialist", count: 3, icon: Shield, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800/60", desc: "A dedicated professional focused on specialized fire safety and prevention protocols." },
    { name: "Active Officer", count: 1, icon: Zap, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40", border: "border-orange-200 dark:border-orange-800/60", desc: "A committed member of the force actively participating in ongoing training." },
    { name: "Novice Officer", count: 0, icon: Medal, color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-900/40", border: "border-slate-200 dark:border-slate-800/60", desc: "A new professional starting their journey in advanced fire safety training." },
]

const ProfessionalDashboard = ({ initialVideos, watchedVideoIds = [] }: ProfessionalPageClientProps) => {
    const { user } = useAuth()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null)
    const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set())
    const [showRankGuide, setShowRankGuide] = useState(false)
    const [showPromotion, setShowPromotion] = useState(false)
    const [promotedRank, setPromotedRank] = useState<any>(null)
    const [highlightManuals, setHighlightManuals] = useState(false)
    const playerRef = useRef<HTMLDivElement>(null)
    const ytPlayerRef = useRef<any>(null)
    const currentRankRef = useRef<HTMLDivElement>(null)
    const [isYTReady, setIsYTReady] = useState(false)
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

    // Auto-scroll to current rank when Rank Guide modal opens
    useEffect(() => {
        if (showRankGuide) {
            const timer = setTimeout(() => {
                currentRankRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }, 150)
            return () => clearTimeout(timer)
        }
    }, [showRankGuide])

    // Sync watchedIds when deferred prop arrives
    useEffect(() => {
        if (watchedVideoIds && watchedVideoIds.length > 0) {
            setWatchedIds(new Set(watchedVideoIds.map(String)))
        }
    }, [watchedVideoIds])

    // Load YouTube API
    useEffect(() => {
        if ((window as any).YT && (window as any).YT.Player) {
            setIsYTReady(true)
            return
        }

        const tag = document.createElement('script')
        tag.src = "https://www.youtube.com/iframe_api"
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

        ;(window as any).onYouTubeIframeAPIReady = () => {
            setIsYTReady(true)
        }
    }, [])

    // Handle Video Completion
    const handleVideoEnd = async (videoId: string) => {
        if (!watchedIds.has(videoId)) {
            try {
                await axios.post('/api/engagement/log', {
                    activityType: "VIDEO_WATCHED",
                    metadata: { videoId, videoTitle: selectedVideo?.title }
                })
                
                setWatchedIds(prev => new Set([...prev, videoId]))
            } catch (error) {
                console.error("Failed to log video completion", error)
            }
        }
    }

    // Initialize/Update Player
    useEffect(() => {
        if (selectedVideo && isYTReady && (window as any).YT && (window as any).YT.Player) {
            if (ytPlayerRef.current) {
                try {
                    ytPlayerRef.current.destroy()
                } catch (e) {
                    console.error("Error destroying YT player", e)
                }
                ytPlayerRef.current = null
            }

            const containerWrapper = document.getElementById('youtube-player-container')
            if (containerWrapper) {
                containerWrapper.innerHTML = '<div id="youtube-player" class="w-full h-full"></div>'
                
                ytPlayerRef.current = new (window as any).YT.Player('youtube-player', {
                    videoId: getYouTubeId(selectedVideo.youtubeId),
                    width: '100%',
                    height: '100%',
                    playerVars: {
                        autoplay: 0,
                        rel: 0,
                        modestbranding: 1,
                        enablejsapi: 1,
                        origin: window.location.origin
                    },
                    events: {
                        'onStateChange': (event: any) => {
                            if (event.data === (window as any).YT.PlayerState.ENDED) {
                                handleVideoEnd(selectedVideo.id.toString())
                            }
                        }
                    }
                })
            }
        }
    }, [selectedVideo, isYTReady])

    useEffect(() => {
        if (selectedVideo) {
            setTimeout(() => {
                playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 100)
        }
    }, [selectedVideo])

    const videos = initialVideos || []
    const watchedCount = videos.filter(v => watchedIds.has(v.id.toString())).length;
    const progressPercent = videos.length > 0 ? Math.round((watchedCount / videos.length) * 100) : 0

    // Ranking Logic for Professionals
    const getProfessionalRank = (count: number) => {
        if (count >= 10) return { name: "Master Fire Chief", icon: Trophy, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
        if (count >= 6) return { name: "Elite Responder", icon: Star, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
        if (count >= 3) return { name: "Safety Specialist", icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
        if (count >= 1) return { name: "Active Officer", icon: Zap, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
        return { name: "Novice Officer", icon: Medal, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" };
    };

    const currentRank = getProfessionalRank(watchedCount);
    const RankIcon = currentRank.icon;

    // Promotion logic
    useEffect(() => {
        if (!user?.id) return;
        
        const storageKey = `safescape_prof_video_count_${user.id}`;
        const savedCountStr = localStorage.getItem(storageKey);
        const videoCount = watchedCount;
        
        // Initialize if not set
        if (savedCountStr === null) {
            localStorage.setItem(storageKey, videoCount.toString());
            return;
        }
        
        const savedCount = parseInt(savedCountStr, 10);
        
        if (videoCount > savedCount) {
            const oldRankName = getProfessionalRank(savedCount).name;
            const newRank = getProfessionalRank(videoCount);
            
            if (newRank.name !== oldRankName && newRank.name !== "Novice Officer") {
                setPromotedRank(newRank);
                setShowPromotion(true);
                // Play sound if you have one, or just trigger confetti
                try {
                    playSound('/sounds/finish.mp3', 'notification');
                } catch (e) {}

                // Trigger confetti
                const duration = 3000;
                const end = Date.now() + duration;
                const frame = () => {
                    confetti({
                        particleCount: 5,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: ['#FFD700', '#C0C0C0', '#CD7F32', '#E5E4E2'] // Metallic palette
                    });
                    confetti({
                        particleCount: 5,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: ['#FFD700', '#C0C0C0', '#CD7F32', '#E5E4E2'] // Metallic palette
                    });
                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                };
                frame();
            }
            localStorage.setItem(storageKey, videoCount.toString());
        }
    }, [watchedCount, user?.id]);

    // Handle video selection and player close
    const handleClosePlayer = () => {
        if (ytPlayerRef.current) {
            try {
                ytPlayerRef.current.stopVideo?.()
                ytPlayerRef.current.destroy?.()
            } catch (e) {
                console.error("Error destroying YT player", e)
            }
            ytPlayerRef.current = null
        }
        setSelectedVideo(null)
        setIsDescriptionExpanded(false)
    }

    const handleVideoSelect = (video: VideoContent) => {
        setSelectedVideo(video)
        setIsDescriptionExpanded(false)
        setTimeout(() => {
            playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 150)
    }

    const handleScrollToManuals = (e: React.MouseEvent) => {
        e.preventDefault();
        const element = document.getElementById('manuals-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightManuals(true);
            setTimeout(() => {
                setHighlightManuals(false);
            }, 2000);
        }
    };

    const filteredVideos = videos.filter(
        (video) =>
            (video.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (video.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
    )

    return (
        <div className="min-h-screen relative transition-colors duration-500">
            {/* Background Overlay - 70% opacity to let background be 30% visible */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-slate-50/70 dark:bg-slate-950/70 transition-colors duration-500" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8 w-full relative z-10">
                {/* Welcome Banner */}
                <ProfessionalWelcomeBanner />

                {/* Quick Links - Horizontal on mobile, grid on desktop */}
                <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-5 mb-8 sm:mb-10">
                    <Link href="/professional/the-right-call" className="block group h-full outline-none">
                        <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-4 flex items-center gap-3 sm:gap-6 shadow-[0_6px_0_#cbd5e1] dark:shadow-[0_6px_0_#1e293b] sm:shadow-[0_8px_0_#cbd5e1] sm:dark:shadow-[0_8px_0_#1e293b] border-[3px] border-white dark:border-slate-700 h-full hover:translate-y-[2px] active:translate-y-[6px] sm:hover:translate-y-[2px] sm:active:translate-y-[8px] hover:shadow-[0_4px_0_#cbd5e1] dark:hover:shadow-[0_4px_0_#1e293b] sm:hover:shadow-[0_6px_0_#cbd5e1] sm:dark:hover:shadow-[0_6px_0_#1e293b] active:shadow-none transition-all duration-200">
                            {/* Subtle Background Image */}
                            <div className="absolute inset-0 z-0 opacity-[0.05] dark:opacity-[0.1] group-hover:opacity-[0.08] dark:group-hover:opacity-[0.15] transition-opacity duration-500">
                                <img src="/therightcall_kids.webp" className="w-full h-full object-cover dark:brightness-50" alt="" />
                            </div>
                            
                            {/* Icon Box */}
                            <div className="h-12 w-12 sm:h-20 sm:w-20 rounded-xl sm:rounded-[1.5rem] bg-white dark:bg-slate-900 border-[2px] sm:border-[3px] border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm z-10 group-hover:scale-105 transition-all">
                                <Gamepad2 className="h-6 w-6 sm:h-10 sm:w-10 text-red-500" strokeWidth={2.5} />
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 z-10 min-w-0">
                                <h3 className="text-base sm:text-2xl font-black text-slate-800 dark:text-white leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors truncate">
                                    The Right Call
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] sm:text-sm mt-0.5 sm:mt-1.5 line-clamp-1 transition-colors">
                                    Answer emergency calls and dispatch the right team!
                                </p>
                            </div>
                            
                            {/* Arrow */}
                            <div className="h-8 w-8 sm:h-12 sm:w-12 bg-red-500 dark:bg-red-600 rounded-full border-[2px] sm:border-[3px] border-red-400 dark:border-red-500 flex items-center justify-center text-white group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.8)] group-hover:ring-4 group-hover:ring-red-500/30 transition-all duration-300 z-10 shrink-0">
                                <ArrowRight className="h-4 w-4 sm:h-6 sm:w-6 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" strokeWidth={3} />
                            </div>
                        </div>
                    </Link>

                    <Link href="#manuals-section" onClick={handleScrollToManuals} className="block group h-full outline-none relative">
                        <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-4 flex items-center gap-3 sm:gap-6 shadow-[0_6px_0_#cbd5e1] dark:shadow-[0_6px_0_#1e293b] sm:shadow-[0_8px_0_#cbd5e1] sm:dark:shadow-[0_8px_0_#1e293b] border-[3px] border-white dark:border-slate-700 h-full hover:translate-y-[2px] active:translate-y-[6px] sm:hover:translate-y-[2px] sm:active:translate-y-[8px] hover:shadow-[0_4px_0_#cbd5e1] dark:hover:shadow-[0_4px_0_#1e293b] sm:hover:shadow-[0_6px_0_#cbd5e1] sm:dark:hover:shadow-[0_6px_0_#1e293b] active:shadow-none transition-all duration-200">
                            {/* Subtle Background Image */}
                            <div className="absolute inset-0 z-0 opacity-[0.05] dark:opacity-[0.1] group-hover:opacity-[0.08] dark:group-hover:opacity-[0.15] transition-opacity duration-500">
                                <img src="/bfp-manuals-modal.webp" className="w-full h-full object-cover dark:brightness-50" alt="" />
                            </div>
                            
                            {/* Icon Box */}
                            <div className="h-12 w-12 sm:h-20 sm:w-20 rounded-xl sm:rounded-[1.5rem] bg-white dark:bg-slate-900 border-[2px] sm:border-[3px] border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm z-10 group-hover:scale-105 transition-all">
                                <BookOpen className="h-6 w-6 sm:h-10 sm:w-10 text-blue-500" strokeWidth={2.5} />
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 z-10 min-w-0">
                                <h3 className="text-base sm:text-2xl font-black text-slate-800 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                    Training Manuals
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] sm:text-sm mt-0.5 sm:mt-1.5 line-clamp-1 transition-colors">
                                    Standard operating procedures
                                </p>
                            </div>
                            
                            {/* Arrow */}
                            <div className="h-8 w-8 sm:h-12 sm:w-12 bg-blue-500 dark:bg-blue-600 rounded-full border-[2px] sm:border-[3px] border-blue-400 dark:border-blue-500 flex items-center justify-center text-white group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] group-hover:ring-4 group-hover:ring-blue-500/30 transition-all duration-300 z-10 shrink-0">
                                <ArrowRight className="h-4 w-4 sm:h-6 sm:w-6 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" strokeWidth={3} />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Video Grid Section */}
                <motion.div 
                    layout 
                    transition={{ duration: 0.48, ease: [0.25, 1, 0.5, 1] }} 
                    id="training-videos-section" 
                    className="space-y-6"
                >
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 sm:gap-6">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">Training Videos</h2>
                        
                        <div className="grid grid-cols-2 sm:flex sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 w-full xl:w-auto">
                            {/* Professional Rank Card Trigger */}
                            <div 
                                onClick={() => setShowRankGuide(true)}
                                className="flex items-center gap-2.5 sm:gap-3.5 p-2.5 xs:p-3 sm:p-4 rounded-2xl border-[3px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_0_#cbd5e1] dark:shadow-[0_4px_0_#0f172a] hover:border-red-500/40 hover:shadow-[0_6px_0_#cbd5e1] dark:hover:shadow-[0_6px_0_#0f172a] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_2px_0_#cbd5e1] flex-1 sm:flex-initial min-w-0 sm:min-w-[240px] cursor-pointer transition-all group/rank"
                            >
                                <div className={cn("h-9 w-9 sm:h-11 sm:w-11 rounded-xl border-2 flex items-center justify-center shrink-0 shadow-sm group-hover/rank:scale-105 transition-transform", currentRank.bg, currentRank.border, currentRank.color)}>
                                    <RankIcon className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={2.5} />
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="text-[9px] xs:text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">Rank</span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setShowRankGuide(true); }}
                                            className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group/btn cursor-pointer"
                                            title="View Rank Guide"
                                        >
                                            <CircleHelp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 group-hover/btn:text-red-500 group-hover/rank:text-red-500 transition-colors" />
                                        </button>
                                    </div>
                                    <span className={`text-xs xs:text-sm sm:text-base font-black ${currentRank.color} truncate`}>{currentRank.name}</span>
                                </div>
                            </div>

                            {/* Training Progress Card */}
                            <div className="flex items-center gap-2.5 sm:gap-3.5 p-2.5 xs:p-3 sm:p-4 rounded-2xl border-[3px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_0_#cbd5e1] dark:shadow-[0_4px_0_#0f172a] flex-1 sm:flex-initial min-w-0 sm:min-w-[280px] cursor-default transition-all">
                                <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border-2 border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-sm">
                                    <GraduationCap className="h-4.5 w-4.5 sm:h-5.5 sm:w-5.5" strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5">
                                    <div className="flex justify-between items-center gap-1">
                                        <span className="text-[9px] xs:text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">Progress</span>
                                        <span className="text-[9px] xs:text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 sm:px-2 rounded-full border border-emerald-200 dark:border-emerald-800/80 shrink-0">
                                            {watchedCount}/{videos.length}
                                        </span>
                                    </div>
                                    <div className="relative h-2 sm:h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                                        <motion.div 
                                            className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full shadow-xs" 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercent}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar - Positioned BELOW Training Progress card (right before video cards) */}
                    <div className="relative group w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-red-500 transition-colors duration-300" />
                        <input
                            type="text"
                            placeholder="Search training videos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-[3px] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-[0_4px_0_#cbd5e1] dark:shadow-[0_4px_0_#0f172a] focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/20 text-sm font-semibold transition-all duration-300"
                        />
                    </div>

                    {/* Video Player with Smooth Animated Expand/Collapse (Positioned below Search Bar) */}
                    <AnimatePresence mode="wait">
                        {selectedVideo && (
                            <motion.div
                                key="professional-video-player"
                                ref={playerRef}
                                initial={{ opacity: 0, height: 0, scale: 0.96 }}
                                animate={{ 
                                    opacity: 1, 
                                    height: "auto", 
                                    scale: 1,
                                    transition: {
                                        height: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
                                        opacity: { duration: 0.3, delay: 0.05 },
                                        scale: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
                                    }
                                }}
                                exit={{ 
                                    opacity: 0, 
                                    height: 0, 
                                    scale: 0.96,
                                    transition: {
                                        height: { duration: 0.4, ease: [0.25, 1, 0.5, 1] },
                                        opacity: { duration: 0.2 },
                                        scale: { duration: 0.3, ease: "easeIn" }
                                    }
                                }}
                                className="w-full max-w-5xl mx-auto scroll-mt-28 sm:scroll-mt-36 overflow-hidden"
                            >
                                <Card className="bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-800 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_4px_0_#0f172a] sm:shadow-[0_8px_0_#cbd5e1] dark:sm:shadow-[0_8px_0_#0f172a] overflow-hidden p-3.5 sm:p-5 transition-all duration-300 gap-2.5 sm:gap-3 ring-2 ring-red-500/20">
                                    <div className="flex items-start justify-between gap-3">
                                        <motion.div
                                            key={selectedVideo.id || selectedVideo.youtubeId}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.3, delay: 0.1 }}
                                            className="min-w-0 flex-1 pt-0.5"
                                        >
                                            <h3 className="text-base sm:text-2xl font-black text-slate-800 dark:text-white leading-tight">
                                                {selectedVideo.title}
                                            </h3>
                                        </motion.div>
                                        <motion.button
                                            whileHover={{ scale: 1.12, rotate: 90 }}
                                            whileTap={{ scale: 0.88 }}
                                            onClick={handleClosePlayer}
                                            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer shadow-sm active:scale-95"
                                            title="Close Player"
                                            aria-label="Close Player"
                                        >
                                            <X className="h-5 w-5" strokeWidth={2.5} />
                                        </motion.button>
                                    </div>

                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.35, delay: 0.15 }}
                                        className="aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800 relative group"
                                    >
                                        <div id="youtube-player-container" className="w-full h-full">
                                            <div id="youtube-player" className="w-full h-full" />
                                        </div>
                                    </motion.div>

                                    {/* YouTube-Style Expandable Description Box */}
                                    <div 
                                        onClick={() => setIsDescriptionExpanded(prev => !prev)}
                                        className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-100/90 dark:bg-slate-800/70 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 transition-colors cursor-pointer group/desc"
                                    >
                                        <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                            <span>{formatTimeAgo(selectedVideo.created_at || selectedVideo.createdAt)}</span>
                                        </div>
                                        {selectedVideo.description && selectedVideo.description.trim() ? (
                                            <>
                                                <p className={cn(
                                                    "text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line",
                                                    !isDescriptionExpanded && "line-clamp-3"
                                                )}>
                                                    {selectedVideo.description}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsDescriptionExpanded(prev => !prev);
                                                    }}
                                                    className="mt-1.5 text-xs font-black text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 inline-flex items-center gap-1 transition-colors cursor-pointer"
                                                >
                                                    {isDescriptionExpanded ? (
                                                        <>
                                                            <span>Show less</span>
                                                            <ChevronUp className="h-3.5 w-3.5" />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>See more</span>
                                                            <ChevronDown className="h-3.5 w-3.5" />
                                                        </>
                                                    )}
                                                </button>
                                            </>
                                        ) : (
                                            <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 italic">
                                                No description provided for this video.
                                            </p>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <Deferred data="initialVideos" fallback={<VideoSkeleton />}>
                        {filteredVideos.length === 0 ? (
                            <Card className="rounded-[2rem] border-slate-200 dark:border-slate-700 dark:bg-slate-800 hover:shadow-md transition-shadow">
                                <CardContent className="py-12 text-center text-slate-500 dark:text-slate-400">
                                    <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                    <p className="font-medium">No videos found matching your search.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <motion.div 
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            >
                                {filteredVideos.map((video, idx) => (
                                    <motion.div
                                        key={video.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                                        className="h-full"
                                    >
                                        <Card
                                            className={`flex flex-row sm:flex-col h-full cursor-pointer group bg-white dark:bg-slate-900 rounded-[1.25rem] sm:rounded-[1.5rem] border-[3px] transition-all duration-300 overflow-hidden p-2.5 sm:p-3 gap-0 ${
                                                selectedVideo?.id === video.id
                                                    ? 'border-red-500 shadow-[0_6px_0_#ef4444] ring-2 ring-red-400/30'
                                                    : 'border-slate-200 dark:border-slate-800 shadow-[0_4px_0_#cbd5e1] dark:shadow-[0_4px_0_#0f172a] hover:-translate-y-1 hover:shadow-[0_6px_0_#cbd5e1] dark:hover:shadow-[0_6px_0_#0f172a]'
                                            } active:translate-y-0.5 active:shadow-none`}
                                            onClick={() => handleVideoSelect(video)}
                                        >
                                            {/* Thumbnail Box */}
                                            <div className="relative w-[135px] xs:w-[155px] sm:w-full aspect-video bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                                                <img
                                                    src={`https://img.youtube.com/vi/${getYouTubeId(video.youtubeId)}/mqdefault.jpg`}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                                                {/* Status Badge */}
                                                {watchedIds.has(video.id.toString()) && (
                                                    <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 z-20">
                                                        <div className="bg-emerald-500/95 backdrop-blur-xs text-white font-black text-[8px] sm:text-[9.5px] tracking-wider uppercase px-2 py-0.5 rounded-full shadow-md border border-white/20 flex items-center gap-1">
                                                            <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                                            Watched
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Duration Badge Overlay */}
                                                {video.duration && (
                                                    <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-black/85 backdrop-blur-xs px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-extrabold text-white tracking-wide flex items-center gap-1 shadow-md border border-white/10 z-20">
                                                        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-400" />
                                                        {video.duration}
                                                    </div>
                                                )}

                                                {/* Play Icon Overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 pointer-events-none">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600/95 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white/40 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                                        <Play className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5 fill-current" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Info Section (YouTube Layout) */}
                                            <div className="flex flex-row items-start gap-2.5 sm:gap-3 flex-1 min-w-0 pl-3 sm:pl-0 sm:mt-3">
                                                {/* Channel Avatar (Desktop) */}
                                                <div className="hidden sm:flex shrink-0 mt-0.5">
                                                    <div className="h-9 w-9 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center p-0.5">
                                                        <img
                                                            src="/berong-official-logo.webp"
                                                            alt="Bureau of Fire Protection"
                                                            className="w-full h-full object-contain rounded-full"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Text Details Column */}
                                                <div className="flex flex-col flex-1 min-w-0 justify-start">
                                                    <h3 className="text-xs xs:text-sm sm:text-[15px] font-extrabold text-slate-800 dark:text-white line-clamp-2 leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                                        {video.title}
                                                    </h3>

                                                    {/* Metadata Line */}
                                                    <div className="flex items-center gap-1.5 text-[10px] xs:text-[11px] sm:text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                                                        <span className="capitalize">{video.category || "Training"}</span>
                                                        <span>•</span>
                                                        <span>{formatTimeAgo(video.created_at || video.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </Deferred>
                </motion.div>

                {/* Resources Section */}
                <div 
                    id="manuals-section" 
                    className={cn(
                        "mt-8 sm:mt-12 mb-6 sm:mb-8 transition-all duration-500 rounded-[2.2rem] p-1.5",
                        highlightManuals 
                            ? "ring-[6px] ring-blue-500/50 dark:ring-blue-400/50 scale-[1.01] bg-blue-500/5 dark:bg-blue-400/5" 
                            : "ring-0 ring-transparent scale-100 bg-transparent"
                    )}
                >
                    <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 text-slate-800 dark:text-white tracking-tight">Additional Resources</h2>
                    <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-800 p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-6 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] transition-all duration-300">
                        <div className="flex items-start gap-3.5 sm:gap-5 flex-1 min-w-0">
                            <div className="p-3 sm:p-4 bg-blue-500/10 dark:bg-blue-950/40 border-2 border-blue-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-sm text-blue-500 dark:text-blue-400">
                                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base sm:text-xl font-black text-slate-800 dark:text-white leading-tight mb-1 sm:mb-1.5">
                                    BFP Standard Operating Procedures
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm md:text-base leading-relaxed">
                                    Access comprehensive manuals covering firefighting operations, emergency response protocols, and responder safety procedures.
                                </p>
                            </div>
                        </div>
                        <ManualsDialog>
                            <button className="w-full md:w-auto shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-6 py-3 rounded-xl text-sm sm:text-base shadow-[0_4px_0_#1d4ed8] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#1d4ed8] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-blue-400/30">
                                <FileText className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={2.5} />
                                View Manuals
                            </button>
                        </ManualsDialog>
                    </div>
                </div>
            </main>

            {/* Professional Promotion Animation Overlay */}
            <AnimatePresence>
                {showPromotion && promotedRank && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 20, stiffness: 100 }}
                            className="bg-white dark:bg-slate-900 border-[1px] border-slate-200 dark:border-slate-800 rounded-[1.5rem] max-w-lg w-full relative overflow-hidden shadow-2xl"
                        >
                            {/* Institutional Header Gradient */}
                            <div className="h-2 bg-gradient-to-r from-red-600 via-red-500 to-red-700 w-full" />
                            
                            <div className="p-8 sm:p-12 text-center relative z-10">
                                {/* Subtle Background Emblem */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.07] pointer-events-none -z-10">
                                    <Shield className="w-64 h-64" />
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-black text-red-600 dark:text-red-500 uppercase tracking-[0.3em] mb-1">
                                            Official Commendation
                                        </h3>
                                        <div className="h-px w-12 bg-red-600/30 mx-auto" />
                                    </div>

                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="mx-auto w-24 h-24 sm:w-32 sm:h-32 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-700 shadow-inner"
                                    >
                                        <promotedRank.icon className={cn("h-12 w-12 sm:h-16 sm:w-16", promotedRank.color)} strokeWidth={1.5} />
                                    </motion.div>

                                    <div className="space-y-3">
                                        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">
                                            {promotedRank.name}
                                        </h2>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base leading-relaxed max-w-[280px] mx-auto">
                                            Your dedication to professional excellence and fire safety protocols has earned you this advancement in rank.
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <button 
                                            onClick={() => setShowPromotion(false)}
                                            className="group relative w-full overflow-hidden rounded-xl bg-slate-900 dark:bg-white px-8 py-4 text-white dark:text-slate-900 transition-all hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-[0.98]"
                                        >
                                            <span className="relative z-10 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                                                Acknowledge Promotion
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </span>
                                        </button>
                                        <p className="mt-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest opacity-60">
                                            SafeScape Bureau of Fire Protection
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Corner Accents */}
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <div className="w-12 h-12 border-t-2 border-r-2 border-red-500 rounded-tr-xl" />
                            </div>
                            <div className="absolute bottom-0 left-0 p-4 opacity-20">
                                <div className="w-12 h-12 border-b-2 border-l-2 border-red-500 rounded-bl-xl" />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Professional Rank Guide Animated Morph Portal Modal */}
            {typeof window !== 'undefined' && ReactDOM.createPortal(
                <AnimatePresence>
                    {showRankGuide && (
                        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-x-hidden overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {/* Backdrop with smooth fade */}
                            <motion.div
                                key="rank-guide-backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="fixed inset-0 bg-black/65 backdrop-blur-sm"
                                onClick={() => setShowRankGuide(false)}
                            />

                            {/* Modal with spring morph & spacious, highly readable layout */}
                            <motion.div
                                key="rank-guide-modal"
                                initial={{ opacity: 0, scale: 0.85, y: 24 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.88, y: 16 }}
                                transition={{ type: "spring", damping: 28, stiffness: 360, mass: 0.8 }}
                                className="relative w-full max-w-[94vw] xs:max-w-md sm:max-w-lg md:max-w-xl max-h-[88vh] sm:max-h-[90vh] bg-white dark:bg-slate-950 border-[3px] sm:border-[4px] border-red-500 rounded-[1.75rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col my-auto z-10"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="bg-red-500 p-4 xs:p-5 sm:p-7 text-center relative shrink-0">
                                    <button
                                        onClick={() => setShowRankGuide(false)}
                                        className="absolute top-3 right-3 sm:top-4 sm:right-4 h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-black/20 hover:bg-black/35 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer"
                                        aria-label="Close"
                                    >
                                        <X className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                                    </button>
                                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
                                        <Star className="absolute top-2 left-2 sm:top-4 sm:left-4 h-8 w-8 sm:h-14 sm:w-14 text-white rotate-12" />
                                        <Trophy className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 h-8 w-8 sm:h-14 sm:w-14 text-white -rotate-12" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-1 text-center">
                                        Professional Rank Guide
                                    </h3>
                                    <p className="text-white/90 font-bold text-xs sm:text-sm text-center">
                                        Complete training videos to level up your rank!
                                    </p>
                                </div>

                                {/* Rank list with transition highlight on current rank */}
                                <div className="p-3 xs:p-4 sm:p-5 space-y-3 sm:space-y-3.5 bg-slate-50 dark:bg-slate-950 overflow-y-auto max-h-[56vh] sm:max-h-[60vh] scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                    {PROFESSIONAL_RANKS.map((rank, i) => {
                                        const Icon = rank.icon
                                        const isCurrent = currentRank.name === rank.name

                                        return (
                                            <motion.div 
                                                key={i}
                                                ref={isCurrent ? currentRankRef : null}
                                                initial={{ opacity: 0, y: isCurrent ? 8 : 14, scale: isCurrent ? 0.95 : 0.98 }}
                                                animate={{ 
                                                    opacity: 1, 
                                                    y: 0, 
                                                    scale: isCurrent ? 1.02 : 1,
                                                    transition: { 
                                                        delay: isCurrent ? 0.1 : 0.04 * i,
                                                        type: "spring",
                                                        stiffness: 380,
                                                        damping: 24
                                                    }
                                                }}
                                                className={cn(
                                                    "relative flex items-center gap-3 sm:gap-4 p-3 xs:p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all",
                                                    isCurrent 
                                                        ? "bg-white dark:bg-[#0c152b] border-red-500 shadow-md ring-2 ring-red-500/25" 
                                                        : "bg-white/85 dark:bg-[#070d19]/85 border-slate-200 dark:border-slate-800/85 opacity-90 dark:opacity-75"
                                                )}
                                            >
                                                {isCurrent && (
                                                    <motion.div 
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: 0.22, type: "spring", bounce: 0.55 }}
                                                        className="absolute -top-2.5 -right-1.5 sm:-top-3 sm:-right-2 bg-red-500 text-white text-[8.5px] sm:text-[9.5px] font-black px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md border-2 border-white dark:border-slate-950 uppercase tracking-tight flex items-center gap-1"
                                                    >
                                                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                                        Current Rank
                                                    </motion.div>
                                                )}
                                                <div className={cn("h-10 w-10 sm:h-13 sm:w-13 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-xs", rank.bg, rank.border, rank.color)}>
                                                    <Icon className="h-5 w-5 sm:h-6.5 sm:w-6.5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1.5 mb-0.5">
                                                        <h4 className={cn("font-black text-xs sm:text-base uppercase tracking-tight truncate", rank.color)}>{rank.name}</h4>
                                                        <span className="text-[9.5px] sm:text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md uppercase shrink-0 border border-slate-200/60 dark:border-slate-700/60">{rank.count}+ Videos</span>
                                                    </div>
                                                    <p className="text-[11px] xs:text-xs sm:text-[13px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{rank.desc}</p>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>

                                {/* Footer Button */}
                                <div className="p-3 xs:p-4 sm:p-5 pt-1.5 sm:pt-2 bg-slate-50 dark:bg-slate-950 shrink-0">
                                    <button
                                        onClick={() => setShowRankGuide(false)}
                                        className="w-full bg-red-500 hover:bg-red-600 active:scale-[0.99] text-white font-black py-3 sm:py-4 rounded-xl sm:rounded-2xl border-b-[4px] sm:border-b-[6px] border-red-800 active:border-b-0 active:translate-y-[4px] sm:active:translate-y-[6px] transition-all uppercase tracking-widest text-xs sm:text-sm shadow-md cursor-pointer"
                                    >
                                        Got it, Officer!
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    )
}

ProfessionalDashboard.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default ProfessionalDashboard
