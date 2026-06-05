"use client"

import React, { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Link, Deferred } from '@inertiajs/react'
import { motion, AnimatePresence } from "framer-motion"
import confetti from 'canvas-confetti'
import { Navigation } from "@/Components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trophy, Star, Shield, Zap, Medal, Video, Clock, Search, BookOpen, FileText, AlertCircle, Play, CheckCircle2, GraduationCap, ArrowRight, CircleHelp } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog"
import { professionalVideos, type VideoContent } from "@/lib/mock-data"
import { ManualsDialog } from "@/Components/ui/manuals-dialog"
import axios from "axios"
import { Progress } from "@/Components/ui/progress"
import { Footer } from "@/Components/footer"
import DashboardLayout from "@/Layouts/DashboardLayout"
import SpotlightCard from "@/Components/ui/spotlight-card"
import "@/Components/ui/spotlight-card.css"
import { cn } from "@/lib/utils"
import { ProfessionalWelcomeBanner } from "@/Components/professional-welcome-banner"

const VideoSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 w-full">
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="flex flex-row sm:flex-col bg-white rounded-[1.25rem] sm:rounded-[1.5rem] border-2 border-b-[4px] border-slate-200 overflow-hidden shadow-sm h-auto items-stretch animate-pulse">
                <CardHeader className="p-2 sm:p-0 sm:mb-4 w-[140px] sm:w-full shrink-0">
                    <div className="w-full h-full sm:aspect-video bg-slate-200 rounded-xl sm:rounded-none sm:rounded-t-[1.3rem] min-h-[75px]" />
                </CardHeader>
                <CardContent className="flex flex-col flex-1 py-3 pr-3 pl-1 sm:px-5 sm:pb-5 sm:pt-0 justify-center gap-2">
                    <div className="h-4 sm:h-5 bg-slate-200 rounded w-3/4 mb-1" />
                    <div className="hidden sm:block h-3 bg-slate-200 rounded w-full" />
                    <div className="hidden sm:block h-3 bg-slate-200 rounded w-5/6" />
                    <div className="flex items-center justify-between mt-auto pt-2">
                        <div className="h-3 bg-slate-200 rounded w-16" />
                        <div className="hidden sm:block h-4 bg-slate-200 rounded-full w-20" />
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
)

interface ProfessionalPageClientProps {
    initialVideos?: VideoContent[]
    watchedVideoIds?: string[]
}

const getYouTubeId = (id: string) => {
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
};

const PROFESSIONAL_RANKS = [
    { name: "Master Fire Chief", count: 10, icon: Trophy, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", desc: "The highest honor! You have mastered all training materials and lead with supreme expertise." },
    { name: "Elite Responder", count: 6, icon: Star, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", desc: "An exceptional officer with advanced knowledge and rapid response capabilities." },
    { name: "Safety Specialist", count: 3, icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", desc: "A dedicated professional focused on specialized fire safety and prevention protocols." },
    { name: "Active Officer", count: 1, icon: Zap, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", desc: "A committed member of the force actively participating in ongoing training." },
    { name: "Novice Officer", count: 0, icon: Medal, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", desc: "A new professional starting their journey in advanced fire safety training." },
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

    // Sync watchedIds when deferred prop arrives
    useEffect(() => {
        if (watchedVideoIds && watchedVideoIds.length > 0) {
            setWatchedIds(new Set(watchedVideoIds.map(String)))
        }
    }, [watchedVideoIds])

    // Load YouTube API
    useEffect(() => {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        (window as any).onYouTubeIframeAPIReady = () => {
            // API ready
        };
    }, []);

    // Handle Video Completion
    const handleVideoEnd = async (videoId: string) => {
        if (!watchedIds.has(videoId)) {
            try {
                await axios.post('/api/engagement/log', {
                    activityType: "VIDEO_WATCHED",
                    metadata: { videoId, videoTitle: selectedVideo?.title }
                });
                
                setWatchedIds(prev => new Set([...prev, videoId]));
            } catch (error) {
                console.error("Failed to log video completion", error);
            }
        }
    };

    // Initialize/Update Player
    useEffect(() => {
        if (selectedVideo && (window as any).YT && (window as any).YT.Player) {
            if (ytPlayerRef.current) {
                ytPlayerRef.current.destroy();
            }

            ytPlayerRef.current = new (window as any).YT.Player(`youtube-player-${selectedVideo.id}`, {
                events: {
                    'onStateChange': (event: any) => {
                        if (event.data === (window as any).YT.PlayerState.ENDED) {
                            handleVideoEnd(selectedVideo.id.toString());
                        }
                    }
                }
            });
        }
    }, [selectedVideo]);

    useEffect(() => {
        if (selectedVideo) {
            setTimeout(() => {
                playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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

    const currentRank = getProfessionalRank(watchedIds.size);
    const RankIcon = currentRank.icon;

    // Promotion logic
    useEffect(() => {
        if (!user?.id) return;
        
        const storageKey = `safescape_prof_video_count_${user.id}`;
        const savedCountStr = localStorage.getItem(storageKey);
        const videoCount = watchedIds.size;
        
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
                    new Audio('/sounds/finish.mp3').play().catch(() => {});
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
    }, [watchedIds.size, user?.id]);

    // Handle video selection
    const handleVideoSelect = (video: VideoContent) => {
        setSelectedVideo(video)
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
            video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (
        <div className="min-h-screen relative transition-colors duration-500">
            {/* Background Overlay - Dynamic based on theme */}


            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8 w-full relative z-10">
                {/* Welcome Banner */}
                <ProfessionalWelcomeBanner />

                {/* Quick Links - Horizontal on mobile, grid on desktop */}
                <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-5 mb-8 sm:mb-10">
                    <Link href="#training-videos-section" onClick={(e) => { e.preventDefault(); document.getElementById('training-videos-section')?.scrollIntoView({ behavior: 'smooth' }) }} className="block group h-full outline-none">
                        <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-4 flex items-center gap-3 sm:gap-6 shadow-[0_6px_0_#cbd5e1] dark:shadow-[0_6px_0_#1e293b] sm:shadow-[0_8px_0_#cbd5e1] sm:dark:shadow-[0_8px_0_#1e293b] border-[3px] border-white dark:border-slate-700 h-full hover:translate-y-[2px] active:translate-y-[6px] sm:hover:translate-y-[2px] sm:active:translate-y-[8px] hover:shadow-[0_4px_0_#cbd5e1] dark:hover:shadow-[0_4px_0_#1e293b] sm:hover:shadow-[0_6px_0_#cbd5e1] sm:dark:hover:shadow-[0_6px_0_#1e293b] active:shadow-none transition-all duration-200">
                            {/* Subtle Background Image */}
                            <div className="absolute inset-0 z-0 opacity-[0.05] dark:opacity-[0.1] group-hover:opacity-[0.08] dark:group-hover:opacity-[0.15] transition-opacity duration-500">
                                <img src="/Training Vidoes Modal.png" className="w-full h-full object-cover dark:brightness-50" alt="" />
                            </div>
                            
                            {/* Icon Box */}
                            <div className="h-12 w-12 sm:h-20 sm:w-20 rounded-xl sm:rounded-[1.5rem] bg-white dark:bg-slate-900 border-[2px] sm:border-[3px] border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm z-10 group-hover:scale-105 transition-all">
                                <Video className="h-6 w-6 sm:h-10 sm:w-10 text-red-500" strokeWidth={2.5} />
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 z-10 min-w-0">
                                <h3 className="text-base sm:text-2xl font-black text-slate-800 dark:text-white leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors truncate">
                                    Training Videos
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] sm:text-sm mt-0.5 sm:mt-1.5 line-clamp-1 transition-colors">
                                    {videos.length} professional training videos
                                </p>
                            </div>
                            
                            {/* Arrow */}
                            <div className="h-8 w-8 sm:h-12 sm:w-12 bg-red-500 dark:bg-red-600 rounded-full border-[2px] sm:border-[3px] border-red-400 dark:border-red-500 flex items-center justify-center text-white group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.8)] group-hover:ring-4 group-hover:ring-red-500/30 transition-all duration-300 z-10 shrink-0">
                                <ArrowRight className="h-4 w-4 sm:h-6 sm:w-6 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" strokeWidth={3} />
                            </div>
                        </div>
                    </Link>

                    <Link href="#manuals-section" onClick={handleScrollToManuals} className="block group h-full outline-none relative">
                        {/* FLOATING HOVER PREVIEW WINDOW */}
                        <div className="hidden sm:block absolute bottom-[105%] left-1/2 -translate-x-1/2 mb-2 w-[305px] sm:w-[350px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border-2 border-blue-100 dark:border-blue-500/40 p-3 shadow-2xl shadow-blue-100/50 dark:shadow-blue-500/25 pointer-events-none opacity-0 scale-95 -translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-300 z-50">
                            {/* Triangle indicator below preview */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-3 h-3 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-blue-100 dark:border-blue-500/40 rotate-45" />
                            
                            {/* Preview indicator */}
                            <div className="flex items-center justify-between mb-2 px-1">
                                <div className="flex items-center gap-1">
                                    <BookOpen className="h-3 w-3 text-blue-600 dark:text-blue-400 shrink-0" strokeWidth={2.5} />
                                    <span className="text-[9.5px] sm:text-[10px] font-black text-blue-600 dark:text-blue-400 tracking-wider uppercase">Manuals Preview</span>
                                </div>
                                <span className="text-[8px] sm:text-[8.5px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">SOP Reference</span>
                            </div>
                            
                            {/* Preview Frame */}
                            <div className="relative rounded-xl overflow-hidden h-[212px] bg-slate-50/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 shadow-inner flex flex-col p-2.5 justify-between">
                                {/* Blurred background cover */}
                                <div className="absolute inset-0 bg-cover bg-center opacity-25 z-0" style={{ backgroundImage: "url('/BFP Manuals Modal.png')" }} />
                                <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-slate-50/85 to-slate-50/95 dark:from-slate-950/70 dark:via-slate-950/90 dark:to-slate-950/95 z-0" />
                                
                                <div className="relative z-10 space-y-1.5">
                                    <span className="text-[8px] sm:text-[8.5px] font-black text-blue-600 dark:text-blue-400 tracking-wider uppercase block">SOP Document Index</span>
                                    
                                    {/* Chapters */}
                                    <div className="space-y-1 pr-0.5">
                                        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-md px-2 py-0.5">
                                            <span className="text-[9.2px] sm:text-[10.2px] font-bold text-slate-700 dark:text-slate-200 truncate">PFE Community Relations Agenda</span>
                                            <span className="text-[7px] sm:text-[7.5px] font-black text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-850 px-1 py-0.5 rounded shrink-0 ml-2">POLICY</span>
                                        </div>
                                        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-md px-2 py-0.5">
                                            <span className="text-[9.2px] sm:text-[10.2px] font-bold text-slate-700 dark:text-slate-200 truncate">Fire Safety For Children</span>
                                            <span className="text-[7px] sm:text-[7.5px] font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-850 px-1 py-0.5 rounded shrink-0 ml-2">EDUCATION</span>
                                        </div>
                                        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-md px-2 py-0.5">
                                            <span className="text-[9.2px] sm:text-[10.2px] font-bold text-slate-700 dark:text-slate-200 truncate">Fire Safety for Teenagers</span>
                                            <span className="text-[7px] sm:text-[7.5px] font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-850 px-1 py-0.5 rounded shrink-0 ml-2">EDUCATION</span>
                                        </div>
                                        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-md px-2 py-0.5">
                                            <span className="text-[9.2px] sm:text-[10.2px] font-bold text-slate-700 dark:text-slate-200 truncate">Fire Safety for Young Adults</span>
                                            <span className="text-[7px] sm:text-[7.5px] font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-850 px-1 py-0.5 rounded shrink-0 ml-2">EDUCATION</span>
                                        </div>
                                        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-md px-2 py-0.5">
                                            <span className="text-[9.2px] sm:text-[10.2px] font-bold text-slate-700 dark:text-slate-200 truncate">Fire Safety for General Public</span>
                                            <span className="text-[7px] sm:text-[7.5px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-850 px-1 py-0.5 rounded shrink-0 ml-2">PUBLIC SAFETY</span>
                                        </div>
                                        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-md px-2 py-0.5">
                                            <span className="text-[9.2px] sm:text-[10.2px] font-bold text-slate-700 dark:text-slate-200 truncate">Fire Safety for Business Establishments</span>
                                            <span className="text-[7px] sm:text-[7.5px] font-black text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-850 px-1 py-0.5 rounded shrink-0 ml-2">REGULATORY</span>
                                        </div>
                                        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-md px-2 py-0.5">
                                            <span className="text-[9.2px] sm:text-[10.2px] font-bold text-slate-700 dark:text-slate-200 truncate">Fire Safety for Special Care & Vulnerable</span>
                                            <span className="text-[7px] sm:text-[7.5px] font-black text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-850 px-1 py-0.5 rounded shrink-0 ml-2">SPECIALIZED</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Pages status */}
                                <div className="relative z-10 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80 pt-1.5 text-[8px] text-slate-500 dark:text-slate-400 font-bold">
                                    <span>BFP OFFICIAL REFERENCE</span>
                                    <span className="text-blue-600 dark:text-blue-400">PDF FORMAT</span>
                                </div>
                            </div>
                            
                            {/* Info Box */}
                            <div className="mt-2 text-left px-1">
                                <h4 className="text-[11px] font-black text-slate-800 dark:text-white leading-tight">Standard Operating Procedures</h4>
                                <p className="text-[9.2px] sm:text-[9.8px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                                    Direct access to BFP guidelines, command structures, structural fire strategies, and responder equipment checklists.
                                </p>
                            </div>
                        </div>
 
                        <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-4 flex items-center gap-3 sm:gap-6 shadow-[0_6px_0_#cbd5e1] dark:shadow-[0_6px_0_#1e293b] sm:shadow-[0_8px_0_#cbd5e1] sm:dark:shadow-[0_8px_0_#1e293b] border-[3px] border-white dark:border-slate-700 h-full hover:translate-y-[2px] active:translate-y-[6px] sm:hover:translate-y-[2px] sm:active:translate-y-[8px] hover:shadow-[0_4px_0_#cbd5e1] dark:hover:shadow-[0_4px_0_#1e293b] sm:hover:shadow-[0_6px_0_#cbd5e1] sm:dark:hover:shadow-[0_6px_0_#1e293b] active:shadow-none transition-all duration-200">
                            {/* Subtle Background Image */}
                            <div className="absolute inset-0 z-0 opacity-[0.05] dark:opacity-[0.1] group-hover:opacity-[0.08] dark:group-hover:opacity-[0.15] transition-opacity duration-500">
                                <img src="/BFP Manuals Modal.png" className="w-full h-full object-cover dark:brightness-50" alt="" />
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

                {/* Search Bar */}
                <div className="mb-10 relative group">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-red-500 transition-colors duration-300" />
                    <input
                        type="text"
                        placeholder="Search training videos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 py-6 rounded-full border-[3px] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-[0_4px_0_#cbd5e1] dark:shadow-[0_4px_0_#0f172a] focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/20 text-base transition-all duration-300"
                    />
                </div>

                {/* Video Player */}
                {selectedVideo && (
                    <div ref={playerRef} className="max-w-5xl mx-auto mb-12">
                        <Card className="bg-white dark:bg-slate-900 rounded-[2rem] border-[3px] sm:border-[4px] border-slate-200 dark:border-slate-800 shadow-[0_6px_0_#cbd5e1] sm:shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_6px_0_#0f172a] sm:dark:shadow-[0_8px_0_#0f172a] overflow-hidden pt-6 px-6 transition-all duration-300">
                        <CardHeader className="px-0 pt-0 pb-4">
                            <CardTitle className="text-2xl text-slate-800 dark:text-white font-extrabold">{selectedVideo.title}</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">{selectedVideo.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pb-6">
                            <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-5 shadow-inner border border-slate-100 dark:border-slate-800/80">
                                <iframe
                                    id={`youtube-player-${selectedVideo.id}`}
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo.youtubeId)}?enablejsapi=1&origin=${window.location.origin}`}
                                    title={selectedVideo.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                />
                            </div>
                            <div className="flex items-center gap-4 text-sm font-semibold">
                                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                    <Clock className="h-4 w-4" />
                                    <span>{selectedVideo.duration || 'Watch Video'}</span>
                                </div>
                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 font-bold bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs tracking-wide">
                                    PROFESSIONAL
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    </div>
                )}

                {/* Video Grid */}
                <div id="training-videos-section">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Training Videos</h2>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full xl:w-auto">
                            {/* Rank Badge */}
                            <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 bg-white dark:bg-slate-800 ${currentRank.border} dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500 flex-1 sm:flex-initial min-w-[200px]`}>
                                <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-900 shadow-inner ${currentRank.color} shrink-0`}>
                                    <RankIcon className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300">Professional Rank</span>
                                        <Dialog open={showRankGuide} onOpenChange={setShowRankGuide}>
                                            <DialogTrigger asChild>
                                                <button className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors group">
                                                    <CircleHelp className="h-3 w-3 text-slate-400 group-hover:text-red-500" />
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-md bg-slate-50 dark:bg-slate-950 border-[4px] border-red-500 rounded-[2.5rem] p-0 overflow-hidden">
                                                <div className="bg-red-500 p-6 sm:p-8 text-center relative">
                                                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                                                        <Star className="absolute top-4 left-4 h-12 w-12 text-white rotate-12" />
                                                        <Trophy className="absolute bottom-4 right-4 h-12 w-12 text-white -rotate-12" />
                                                    </div>
                                                    <DialogHeader>
                                                        <DialogTitle className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter mb-2 text-center">Professional Rank Guide</DialogTitle>
                                                        <DialogDescription className="text-white/80 font-bold text-sm text-center">
                                                            Complete training videos to level up your rank!
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                </div>

                                                <div className="p-4 sm:p-6 space-y-3">
                                                    {PROFESSIONAL_RANKS.map((rank, i) => {
                                                        const Icon = rank.icon
                                                        const isCurrent = currentRank.name === rank.name

                                                        return (
                                                            <div key={i} className={cn(
                                                                "relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all",
                                                                isCurrent ? "bg-white dark:bg-slate-900 border-red-500 shadow-lg scale-[1.02]" : "bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-70"
                                                            )}>
                                                                {isCurrent && (
                                                                    <div className="absolute -top-2.5 -right-2 bg-red-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-md border-2 border-white dark:border-slate-900 uppercase tracking-tight">
                                                                        Current
                                                                    </div>
                                                                )}
                                                                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-xl shrink-0 border-2", rank.bg, rank.border, rank.color)}>
                                                                    <Icon className={cn("h-6 w-6")} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <h4 className={cn("font-black text-sm uppercase tracking-tight", rank.color)}>{rank.name}</h4>
                                                                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">{rank.count}+ Videos</span>
                                                                    </div>
                                                                    <p className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-400 leading-tight mt-0.5">{rank.desc}</p>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>

                                                <div className="p-6 pt-0">
                                                    <button
                                                        onClick={() => setShowRankGuide(false)}
                                                        className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl border-b-[6px] border-red-800 active:border-b-0 active:translate-y-[6px] transition-all uppercase tracking-widest text-sm"
                                                    >
                                                        Got it, Officer!
                                                    </button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <span className={`text-[15px] font-black ${currentRank.color} dark:text-white whitespace-nowrap`}>{currentRank.name}</span>
                                </div>
                            </div>

                            {/* Progress Tracker */}
                            <div className="bg-white dark:bg-slate-800 px-5 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 flex-1 sm:flex-initial sm:min-w-[300px]">
                                <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0 shadow-inner">
                                    <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="flex-1 space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">
                                        <span>Training Progress</span>
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{watchedCount} / {videos.length}</span>
                                    </div>
                                    <Progress value={progressPercent} className="h-2.5 bg-slate-100 dark:bg-slate-700" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <Deferred data="initialVideos" fallback={<VideoSkeleton />}>
                        {filteredVideos.length === 0 ? (
                            <Card className="rounded-[2rem] border-slate-200 dark:border-slate-700 dark:bg-slate-800 hover:shadow-md transition-shadow">
                                <CardContent className="py-12 text-center text-slate-500 dark:text-slate-400">
                                    <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                    <p className="font-medium">No videos found matching your search.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                {filteredVideos.map((video) => (
                                    <Card
                                        key={video.id}
                                        className="flex flex-row sm:flex-col cursor-pointer group bg-transparent sm:bg-white dark:sm:bg-slate-800 rounded-xl sm:rounded-[1.5rem] border-none sm:border-[3px] sm:border-b-[6px] border-slate-200 dark:border-slate-700 shadow-none sm:shadow-sm sm:hover:translate-y-[-4px] sm:active:translate-y-[2px] transition-all duration-200 h-auto items-stretch py-2 sm:p-0 hover:shadow-lg dark:hover:shadow-[0_10px_25px_-5px_rgba(239,68,68,0.15)]"
                                        onClick={() => handleVideoSelect(video)}
                                    >
                                        <CardHeader className="p-0 w-[160px] xs:w-[180px] sm:w-full shrink-0 flex items-center justify-center relative">
                                            <div className="w-full aspect-video bg-slate-100 dark:bg-slate-900 overflow-hidden relative rounded-xl sm:rounded-none sm:rounded-t-[1.3rem] shadow-sm border border-slate-200/50 dark:border-slate-700/50 sm:border-none">
                                                <img
                                                    src={`https://img.youtube.com/vi/${getYouTubeId(video.youtubeId)}/mqdefault.jpg`}
                                                    alt={video.title}
                                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                {/* Status Badge */}
                                                <div className="absolute top-2 left-2 z-20 flex flex-col gap-2">
                                                    {watchedIds.has(video.id.toString()) && (
                                                        <div className="bg-emerald-500 text-white font-black text-[8px] sm:text-[10px] tracking-widest uppercase px-2 py-1 rounded-full shadow-lg border-2 border-white/20 flex items-center gap-1.5 animate-in zoom-in-95 duration-300">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Watched
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Play Button Overlay */}
                                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <div className="w-10 h-10 bg-red-600/90 rounded-full flex items-center justify-center shadow-lg">
                                                        <Play className="h-4 w-4 text-white ml-0.5" fill="currentColor" />
                                                    </div>
                                                </div>
                                                {/* Duration Badge - YouTube Style */}
                                                <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                                                    {video.duration}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex flex-col flex-1 py-1 px-3 sm:px-5 sm:pb-5 sm:pt-0 justify-start">
                                            <div className="flex justify-between items-start mb-1">
                                                <CardTitle className="text-[15px] sm:text-[17px] font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors pr-4">
                                                    {video.title}
                                                </CardTitle>
                                                <div className="sm:hidden text-slate-400 dark:text-slate-500 pt-1">
                                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM10.5 12c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm0-4.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5z"/></svg>
                                                </div>
                                            </div>
                                            
                                            <p className="hidden sm:block text-sm text-slate-600 dark:text-slate-400 font-medium line-clamp-2 mb-4 leading-relaxed">{video.description}</p>
                                            
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-auto gap-1">
                                                <div className="flex items-center gap-1.5 text-[12px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                                                    <span className="sm:hidden uppercase font-black text-red-500 text-[10px] tracking-tight mr-1">Professional</span>
                                                    <span className="hidden sm:inline-flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5 text-red-500" />
                                                        {video.duration}
                                                    </span>
                                                    <span className="sm:hidden opacity-50">•</span>
                                                    <span className="sm:hidden">Video Training</span>
                                                </div>
                                                
                                                {/* Desktop Professional Badge */}
                                                <span className="hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 font-black bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] tracking-widest uppercase border border-red-200 dark:border-red-800">
                                                    Professional
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </Deferred>
                </div>

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
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-800 p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 shadow-[0_6px_0_#cbd5e1] dark:shadow-[0_6px_0_#0f172a] sm:shadow-[0_8px_0_#cbd5e1] sm:dark:shadow-[0_8px_0_#0f172a] transition-all duration-300">
                        <div className="flex items-start gap-4 sm:gap-6 flex-1 w-full">
                            <div className="p-3 sm:p-4 bg-white dark:bg-slate-950 rounded-xl sm:rounded-2xl border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-base sm:text-xl font-black text-slate-800 dark:text-white mb-1 sm:mb-2">BFP Standard Operating Procedures</h3>
                                <p className="text-slate-600 dark:text-slate-400 font-medium text-[13px] sm:text-sm md:text-base leading-relaxed">
                                    Access comprehensive manuals covering firefighting operations, emergency response protocols, and
                                    safety procedures.
                                </p>
                            </div>
                        </div>
                        <ManualsDialog>
                            <Button className="w-full sm:w-auto shrink-0 h-auto bg-blue-600 hover:bg-blue-500 dark:bg-blue-700 dark:hover:bg-blue-650 text-white shadow-[0_4px_0_0_#1e3a8a] sm:shadow-[0_6px_0_0_#1e3a8a] hover:shadow-[0_2px_0_0_#1e3a8a] sm:hover:shadow-[0_4px_0_0_#1e3a8a] active:shadow-none hover:translate-y-[2px] active:translate-y-[4px] sm:active:translate-y-[6px] transition-all rounded-full px-6 py-2.5 sm:px-8 sm:py-3.5 font-black text-sm sm:text-base flex items-center justify-center border-2 border-blue-400 dark:border-blue-500/20">
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                View Manuals
                            </Button>
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
        </div>
    )
}

ProfessionalDashboard.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default ProfessionalDashboard
