"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Deferred, Link } from "@inertiajs/react"
import { motion, AnimatePresence, LayoutGroup } from "motion/react"
import { Card } from "@/Components/ui/card"
import {
    Flame,
    Search,
    BookOpen,
    ArrowRight,
    Clock,
    Play,
    X,
    ChevronDown,
} from "lucide-react"
import type { BlogPost } from "@/types"
import DashboardLayout from "@/Layouts/DashboardLayout"
import { cn, getYouTubeId, formatTimeAgo } from "@/lib/utils"
import { useSettings } from "@/lib/settings-context"
import { AdultWelcomeBanner } from "@/Components/Banners"
import { AdultDashboardSkeleton } from "@/Components/dashboard-skeletons"
import {
    ARTICLE_MORPH_SPRING,
    ArticleReaderOverlay,
    SMOOTH_EASE,
} from "@/Components/Adult/ArticleReader"

interface AdultPageClientProps {
    initialBlogs: BlogPost[]
    initialVideos?: any[]
}

const AdultPageClient = ({ initialBlogs, initialVideos }: AdultPageClientProps) => {
    const { reduceMotion } = useSettings()
    const [searchQuery, setSearchQuery] = useState("")
    const [videoSearchQuery, setVideoSearchQuery] = useState("")
    const [selectedVideo, setSelectedVideo] = useState<any>(null)
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

    // Morph-expanded article state
    const [openArticleIndex, setOpenArticleIndex] = useState<number | null>(null)
    const [morphArticleId, setMorphArticleId] = useState<string | number | null>(null)
    const [returningArticleId, setReturningArticleId] = useState<string | number | null>(null)
    const [articleNavDirection, setArticleNavDirection] = useState(0)

    // Smooth YouTube player refs (matching ProfessionalDashboard architecture)
    const playerRef = useRef<HTMLDivElement>(null)
    const playerContainerRef = useRef<HTMLDivElement>(null)
    const ytPlayerRef = useRef<any>(null)
    const isYTPlayerReadyRef = useRef(false)
    const pendingVideoIdRef = useRef<string | null>(null)
    const selectedVideoRef = useRef<any>(null)
    const scrollTimerRef = useRef<number | null>(null)
    const ytInitTimerRef = useRef<number | null>(null)
    const iframeFallbackTimerRef = useRef<number | null>(null)
    const [isYTReady, setIsYTReady] = useState(false)
    const [isIframeReady, setIsIframeReady] = useState(false)

    selectedVideoRef.current = selectedVideo

    const blogs = initialBlogs || []
    const videos = initialVideos || []

    const filteredBlogs = blogs.filter(
        (blog) =>
            (blog.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (blog.excerpt?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (blog.content?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    )

    const filteredVideos = videos.filter(
        (video: any) =>
            (video.title?.toLowerCase() || "").includes(videoSearchQuery.toLowerCase()) ||
            (video.description?.toLowerCase() || "").includes(videoSearchQuery.toLowerCase())
    )

    const destroyYTPlayer = useCallback(() => {
        if (ytInitTimerRef.current) {
            window.clearTimeout(ytInitTimerRef.current)
            ytInitTimerRef.current = null
        }
        if (iframeFallbackTimerRef.current) {
            window.clearTimeout(iframeFallbackTimerRef.current)
            iframeFallbackTimerRef.current = null
        }
        pendingVideoIdRef.current = null
        isYTPlayerReadyRef.current = false
        if (ytPlayerRef.current) {
            try {
                ytPlayerRef.current.destroy?.()
            } catch (e) {
                console.error("Error destroying YT player", e)
            }
            ytPlayerRef.current = null
        }
        setIsIframeReady(false)
    }, [])

    useEffect(() => {
        return () => {
            if (scrollTimerRef.current) {
                window.clearTimeout(scrollTimerRef.current)
                scrollTimerRef.current = null
            }
            destroyYTPlayer()
        }
    }, [destroyYTPlayer])

    // Smooth scroll to articles section if returning via #articles-section
    useEffect(() => {
        if (typeof window !== "undefined" && window.location.hash === "#articles-section") {
            const timer = setTimeout(() => {
                const el = document.getElementById("articles-section")
                if (el) {
                    el.scrollIntoView({
                        behavior: reduceMotion ? "auto" : "smooth",
                        block: "start",
                    })
                }
            }, 60)
            return () => clearTimeout(timer)
        }
    }, [reduceMotion])

    // Load YouTube IFrame API
    useEffect(() => {
        if ((window as any).YT && (window as any).YT.Player) {
            setIsYTReady(true)
            return
        }

        const existingScript = document.querySelector(
            'script[src="https://www.youtube.com/iframe_api"]'
        )
        if (!existingScript) {
            const tag = document.createElement("script")
            tag.src = "https://www.youtube.com/iframe_api"
            const firstScriptTag = document.getElementsByTagName("script")[0]
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
        }

        const previousReady = (window as any).onYouTubeIframeAPIReady
        ;(window as any).onYouTubeIframeAPIReady = () => {
            previousReady?.()
            setIsYTReady(true)
        }
    }, [])

    // Initialize / Update YouTube Player without blocking open or close animations
    useEffect(() => {
        if (ytInitTimerRef.current) {
            window.clearTimeout(ytInitTimerRef.current)
            ytInitTimerRef.current = null
        }

        if (!selectedVideo || !isYTReady || !(window as any).YT?.Player) {
            return
        }

        const targetYoutubeId = getYouTubeId(selectedVideo.youtubeId)
        const existingIframe = ytPlayerRef.current?.getIframe?.()
        const isPlayerAttached = Boolean(
            existingIframe && document.body.contains(existingIframe)
        )

        // Reuse attached player when switching videos (or reversing mid-close)
        if (ytPlayerRef.current && isPlayerAttached) {
            if (
                isYTPlayerReadyRef.current &&
                typeof ytPlayerRef.current.loadVideoById === "function"
            ) {
                try {
                    ytPlayerRef.current.loadVideoById(targetYoutubeId)
                    setIsIframeReady(true)
                } catch (e) {
                    console.error("Error loading YT video", e)
                }
            } else {
                pendingVideoIdRef.current = targetYoutubeId
            }
            return
        }

        if (ytPlayerRef.current) {
            try {
                ytPlayerRef.current.destroy?.()
            } catch (e) {
                console.error("Error destroying stale YT player", e)
            }
            ytPlayerRef.current = null
            isYTPlayerReadyRef.current = false
        }

        setIsIframeReady(false)

        const mountPlayer = () => {
            const container = playerContainerRef.current
            if (!container || !selectedVideoRef.current) return

            const latestYoutubeId = getYouTubeId(selectedVideoRef.current.youtubeId)
            container.innerHTML = ""
            const mountEl = document.createElement("div")
            mountEl.className = "w-full h-full"
            container.appendChild(mountEl)

            isYTPlayerReadyRef.current = false
            pendingVideoIdRef.current = null

            if (iframeFallbackTimerRef.current) {
                window.clearTimeout(iframeFallbackTimerRef.current)
            }
            iframeFallbackTimerRef.current = window.setTimeout(() => {
                setIsIframeReady(true)
            }, 1200)

            ytPlayerRef.current = new (window as any).YT.Player(mountEl, {
                videoId: latestYoutubeId,
                width: "100%",
                height: "100%",
                playerVars: {
                    autoplay: 1,
                    rel: 0,
                    modestbranding: 1,
                    enablejsapi: 1,
                    origin: window.location.origin,
                },
                events: {
                    onReady: (event: any) => {
                        isYTPlayerReadyRef.current = true
                        if (iframeFallbackTimerRef.current) {
                            window.clearTimeout(iframeFallbackTimerRef.current)
                            iframeFallbackTimerRef.current = null
                        }
                        if (!selectedVideoRef.current) {
                            try {
                                event.target.pauseVideo?.()
                            } catch (e) {}
                            return
                        }
                        if (
                            pendingVideoIdRef.current &&
                            pendingVideoIdRef.current !== latestYoutubeId
                        ) {
                            try {
                                event.target.loadVideoById(pendingVideoIdRef.current)
                            } catch (e) {}
                            pendingVideoIdRef.current = null
                        }
                        setIsIframeReady(true)
                    },
                },
            })
        }

        if (reduceMotion) {
            mountPlayer()
        } else {
            ytInitTimerRef.current = window.setTimeout(mountPlayer, 180)
        }

        return () => {
            if (ytInitTimerRef.current) {
                window.clearTimeout(ytInitTimerRef.current)
                ytInitTimerRef.current = null
            }
        }
    }, [selectedVideo, isYTReady, reduceMotion])

    const handlePlayerExitComplete = useCallback(() => {
        if (!selectedVideoRef.current) {
            destroyYTPlayer()
            setIsDescriptionExpanded(false)
        }
    }, [destroyYTPlayer])

    const handleClosePlayer = useCallback(() => {
        if (scrollTimerRef.current) {
            window.clearTimeout(scrollTimerRef.current)
            scrollTimerRef.current = null
        }
        if (ytInitTimerRef.current) {
            window.clearTimeout(ytInitTimerRef.current)
            ytInitTimerRef.current = null
        }
        // Pause immediately so audio stops, deferring heavy iframe teardown until after collapse completes
        if (ytPlayerRef.current) {
            try {
                ytPlayerRef.current.pauseVideo?.()
            } catch (e) {}
        }
        setSelectedVideo(null)
    }, [])

    const handleSelectVideo = useCallback(
        (video: any) => {
            if (selectedVideoRef.current?.id !== video.id) {
                setIsDescriptionExpanded(false)
            }
            setSelectedVideo(video)

            if (scrollTimerRef.current) {
                window.clearTimeout(scrollTimerRef.current)
            }
            scrollTimerRef.current = window.setTimeout(
                () => {
                    playerRef.current?.scrollIntoView({
                        behavior: reduceMotion ? "auto" : "smooth",
                        block: "start",
                    })
                    scrollTimerRef.current = null
                },
                reduceMotion ? 0 : 60
            )
        },
        [reduceMotion]
    )

    // Article morph handlers
    const handleArticleCardClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        blog: BlogPost,
        index: number
    ) => {
        // Preserve standard new-tab / modifier-click behavior
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
            return
        }
        e.preventDefault()
        setArticleNavDirection(0)
        setReturningArticleId(null)
        setMorphArticleId(blog.id)
        setOpenArticleIndex(index)
    }

    const handleNavigateArticle = useCallback((index: number, direction: number) => {
        setArticleNavDirection(direction)
        // Clear morph target once navigating to another article so close smoothly fades instead of jumping across grid slots
        setMorphArticleId(null)
        setOpenArticleIndex(index)
    }, [])

    const handleCloseArticle = useCallback(() => {
        if (morphArticleId !== null) {
            setReturningArticleId(morphArticleId)
        }
        setOpenArticleIndex(null)
    }, [morphArticleId])

    const morphTransition = reduceMotion ? { duration: 0 } : ARTICLE_MORPH_SPRING

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8 w-full relative min-h-screen">
            {/* Background Overlay - 70% opacity to let background be 30% visible */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-slate-50/70 dark:bg-slate-950/70 transition-colors duration-500" />

            <div className="relative z-10">
                {/* Welcome Banner */}
                <AdultWelcomeBanner />

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-12">
                    {/* Fire Safety Articles Feature (Mobile) */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: reduceMotion ? 0 : 0.36,
                            ease: SMOOTH_EASE,
                        }}
                        className="md:hidden h-full"
                    >
                        <Link
                            href="#articles-section"
                            onClick={(e) => {
                                e.preventDefault()
                                document
                                    .getElementById("articles-section")
                                    ?.scrollIntoView({
                                        behavior: reduceMotion ? "auto" : "smooth",
                                    })
                            }}
                            className="block group h-full outline-none"
                        >
                            <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-4 flex items-center gap-3 sm:gap-6 shadow-[0_6px_0_#cbd5e1] dark:shadow-[0_6px_0_#1e293b] sm:shadow-[0_8px_0_#cbd5e1] sm:dark:shadow-[0_8px_0_#1e293b] border-[3px] border-white dark:border-slate-700 h-full hover:translate-y-[2px] active:translate-y-[6px] sm:hover:translate-y-[2px] sm:active:translate-y-[8px] hover:shadow-[0_4px_0_#cbd5e1] dark:hover:shadow-[0_4px_0_#1e293b] sm:hover:shadow-[0_6px_0_#cbd5e1] sm:dark:hover:shadow-[0_6px_0_#1e293b] active:shadow-none transition-[transform,box-shadow,border-color] duration-200 ease-out">
                                <div className="absolute inset-0 z-0 opacity-[0.05] dark:opacity-[0.1] group-hover:opacity-[0.08] dark:group-hover:opacity-[0.15] transition-opacity duration-500">
                                    <img
                                        src="/articles-modal.webp"
                                        className="w-full h-full object-cover dark:brightness-50"
                                        alt=""
                                    />
                                </div>

                                <div className="h-12 w-12 sm:h-20 sm:w-20 rounded-xl sm:rounded-[1.5rem] bg-white dark:bg-slate-900 border-[2px] sm:border-[3px] border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm z-10 group-hover:scale-105 transition-transform duration-300">
                                    <BookOpen
                                        className="h-6 w-6 sm:h-10 sm:w-10 text-orange-500"
                                        strokeWidth={2.5}
                                    />
                                </div>

                                <div className="flex-1 z-10 min-w-0">
                                    <h3 className="text-sm sm:text-lg md:text-base lg:text-lg xl:text-2xl font-black text-slate-800 dark:text-white leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                        Fire Safety Articles
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] sm:text-sm mt-0.5 sm:mt-1.5 line-clamp-1 transition-colors">
                                        {blogs.length} professional fire safety guides
                                    </p>
                                </div>

                                <div className="h-8 w-8 sm:h-12 sm:w-12 bg-orange-500 dark:bg-orange-600 rounded-full border-[2px] sm:border-[3px] border-orange-400 dark:border-orange-500 flex items-center justify-center text-white group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(249,115,22,0.65)] group-hover:ring-4 group-hover:ring-orange-500/25 transition-all duration-300 z-10 shrink-0">
                                    <ArrowRight
                                        className="h-4 w-4 sm:h-6 sm:w-6"
                                        strokeWidth={3}
                                    />
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* EDITH Feature */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: reduceMotion ? 0 : 0.36,
                            delay: reduceMotion ? 0 : 0.04,
                            ease: SMOOTH_EASE,
                        }}
                        className="h-full"
                    >
                        <a
                            href="https://edith.bfpscberong.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group h-full outline-none relative"
                        >
                            <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-4 flex items-center gap-3 sm:gap-6 shadow-[0_6px_0_#cbd5e1] dark:shadow-[0_6px_0_#1e293b] sm:shadow-[0_8px_0_#cbd5e1] sm:dark:shadow-[0_8px_0_#1e293b] border-[3px] border-white dark:border-slate-700 h-full hover:translate-y-[2px] active:translate-y-[6px] sm:hover:translate-y-[2px] sm:active:translate-y-[8px] hover:shadow-[0_4px_0_#cbd5e1] dark:hover:shadow-[0_4px_0_#1e293b] sm:hover:shadow-[0_6px_0_#cbd5e1] sm:dark:hover:shadow-[0_6px_0_#1e293b] active:shadow-none transition-[transform,box-shadow,border-color] duration-200 ease-out">
                                <div className="absolute inset-0 z-0 opacity-[0.05] dark:opacity-[0.1] group-hover:opacity-[0.08] dark:group-hover:opacity-[0.15] transition-opacity duration-500">
                                    <img
                                        src="/edith-modal.webp"
                                        className="w-full h-full object-cover dark:brightness-50"
                                        alt=""
                                    />
                                </div>

                                <div className="h-12 w-12 sm:h-20 sm:w-20 rounded-xl sm:rounded-[1.5rem] bg-white dark:bg-slate-900 border-[2px] sm:border-[3px] border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm z-10 group-hover:scale-105 transition-transform duration-300">
                                    <Flame
                                        className="h-6 w-6 sm:h-10 sm:w-10 text-red-500"
                                        strokeWidth={2.5}
                                    />
                                </div>

                                <div className="flex-1 z-10 min-w-0">
                                    <h3 className="text-sm sm:text-lg md:text-base lg:text-lg xl:text-2xl font-black text-slate-800 dark:text-white leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                        Launch Exit Drill (EDITH) Simulator
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] sm:text-sm mt-0.5 sm:mt-1.5 line-clamp-1 transition-colors">
                                        Interactive home fire spread simulator
                                    </p>
                                </div>

                                <div className="h-8 w-8 sm:h-12 sm:w-12 bg-red-500 dark:bg-red-600 rounded-full border-[2px] sm:border-[3px] border-red-400 dark:border-red-500 flex items-center justify-center text-white group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(239,68,68,0.65)] group-hover:ring-4 group-hover:ring-red-500/25 transition-all duration-300 z-10 shrink-0">
                                    <ArrowRight
                                        className="h-4 w-4 sm:h-6 sm:w-6"
                                        strokeWidth={3}
                                    />
                                </div>
                            </div>
                        </a>
                    </motion.div>

                    {/* Fire Safety Videos Feature */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: reduceMotion ? 0 : 0.36,
                            delay: reduceMotion ? 0 : 0.08,
                            ease: SMOOTH_EASE,
                        }}
                        className="h-full"
                    >
                        <Link
                            href="#videos-section"
                            onClick={(e) => {
                                e.preventDefault()
                                document
                                    .getElementById("videos-section")
                                    ?.scrollIntoView({
                                        behavior: reduceMotion ? "auto" : "smooth",
                                    })
                            }}
                            className="block group h-full outline-none"
                        >
                            <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-4 flex items-center gap-3 sm:gap-6 shadow-[0_6px_0_#cbd5e1] dark:shadow-[0_6px_0_#1e293b] sm:shadow-[0_8px_0_#cbd5e1] sm:dark:shadow-[0_8px_0_#1e293b] border-[3px] border-white dark:border-slate-700 h-full hover:translate-y-[2px] active:translate-y-[6px] sm:hover:translate-y-[2px] sm:active:translate-y-[8px] hover:shadow-[0_4px_0_#cbd5e1] dark:hover:shadow-[0_4px_0_#1e293b] sm:hover:shadow-[0_6px_0_#cbd5e1] sm:dark:hover:shadow-[0_6px_0_#1e293b] active:shadow-none transition-[transform,box-shadow,border-color] duration-200 ease-out">
                                <div className="absolute inset-0 z-0 opacity-[0.05] dark:opacity-[0.1] group-hover:opacity-[0.08] dark:group-hover:opacity-[0.15] transition-opacity duration-500">
                                    <img
                                        src="/videos-modal.webp"
                                        className="w-full h-full object-cover dark:brightness-50"
                                        alt=""
                                    />
                                </div>

                                <div className="h-12 w-12 sm:h-20 sm:w-20 rounded-xl sm:rounded-[1.5rem] bg-white dark:bg-slate-900 border-[2px] sm:border-[3px] border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm z-10 group-hover:scale-105 transition-transform duration-300">
                                    <Play
                                        className="h-6 w-6 sm:h-10 sm:w-10 text-orange-500"
                                        strokeWidth={2.5}
                                    />
                                </div>

                                <div className="flex-1 z-10 min-w-0">
                                    <h3 className="text-sm sm:text-lg md:text-base lg:text-lg xl:text-2xl font-black text-slate-800 dark:text-white leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                        Fire Safety Videos
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] sm:text-sm mt-0.5 sm:mt-1.5 line-clamp-1 transition-colors">
                                        {videos.length} interactive safety videos
                                    </p>
                                </div>

                                <div className="h-8 w-8 sm:h-12 sm:w-12 bg-orange-500 dark:bg-orange-600 rounded-full border-[2px] sm:border-[3px] border-orange-400 dark:border-orange-500 flex items-center justify-center text-white group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(249,115,22,0.65)] group-hover:ring-4 group-hover:ring-orange-500/25 transition-all duration-300 z-10 shrink-0">
                                    <ArrowRight
                                        className="h-4 w-4 sm:h-6 sm:w-6"
                                        strokeWidth={3}
                                    />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                </div>

                {/* Fire Safety Articles Section with Smooth Shared-Element Morph Expansion */}
                <LayoutGroup id="adult-articles-morph">
                    <div id="articles-section" className="scroll-mt-24 sm:scroll-mt-32">
                        <h2 className="text-2xl sm:text-3xl font-black mb-4 sm:mb-6 text-slate-800 dark:text-white tracking-tight">
                            Fire Safety Articles
                        </h2>

                        {/* Article Search Bar */}
                        <div className="mb-6 relative group max-w-md w-full">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-orange-500 transition-colors duration-300" />
                            <input
                                type="text"
                                placeholder="Search fire safety articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-[3px] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-[0_4px_0_#cbd5e1] dark:shadow-[0_4px_0_#0f172a] focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 text-sm font-semibold transition-all duration-300"
                            />
                        </div>

                        {filteredBlogs.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: reduceMotion ? 0 : 0.3,
                                    ease: SMOOTH_EASE,
                                }}
                                className="relative overflow-hidden bg-white dark:bg-slate-800 border-[4px] border-dashed border-slate-300 dark:border-slate-700 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center shadow-sm transition-colors duration-300"
                            >
                                <div className="bg-slate-100 dark:bg-slate-700 h-20 w-20 rounded-full flex items-center justify-center mb-6 shadow-inner border-[3px] border-white dark:border-slate-600 relative transition-colors">
                                    <Search
                                        className="h-8 w-8 text-slate-400 dark:text-slate-500"
                                        strokeWidth={3}
                                    />
                                </div>

                                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 transition-colors">
                                    {searchQuery ? "No Matches Found" : "No Articles Available"}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 font-bold max-w-md mx-auto leading-relaxed transition-colors">
                                    {searchQuery
                                        ? `We couldn't find any articles matching "${searchQuery}". Try adjusting your keywords or browse all articles.`
                                        : "There are no articles published at the moment. Please check back later."}
                                </p>

                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="mt-8 inline-flex items-center gap-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black px-6 py-3 rounded-full border-[3px] border-slate-200 dark:border-slate-600 shadow-[0_4px_0_#cbd5e1] dark:shadow-[0_4px_0_#1e293b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#cbd5e1] dark:hover:shadow-[0_6px_0_#1e293b] active:translate-y-1 active:shadow-none transition-[transform,box-shadow] uppercase tracking-wide text-sm cursor-pointer"
                                    >
                                        Clear Search & View All
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                {filteredBlogs.map((blog, idx) => {
                                    const isMorphActive =
                                        openArticleIndex !== null &&
                                        morphArticleId !== null &&
                                        String(morphArticleId) === String(blog.id)
                                    const isReturning =
                                        returningArticleId !== null &&
                                        String(returningArticleId) === String(blog.id)
                                    const authorFull =
                                        typeof blog.author === "string"
                                            ? blog.author
                                            : blog.author?.name || "BFP Admin"
                                    const authorShort =
                                        authorFull.length > 10
                                            ? authorFull.split(" ")[0]
                                            : authorFull

                                    const cardBody = (
                                        <>
                                            {/* Image Section */}
                                            <motion.div
                                                layoutId={
                                                    !isMorphActive
                                                        ? `article-image-${blog.id}`
                                                        : undefined
                                                }
                                                transition={morphTransition}
                                                className="relative h-28 sm:h-52 shrink-0 w-full overflow-hidden bg-slate-100 dark:bg-slate-900"
                                            >
                                                <img
                                                    src={
                                                        blog.imageUrl ||
                                                        "/placeholder.svg?height=300&width=400"
                                                    }
                                                    alt={blog.title}
                                                    decoding="async"
                                                    loading="lazy"
                                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                                />
                                            </motion.div>

                                            {/* Accent Line */}
                                            <div className="h-[2px] sm:h-[3px] w-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-400" />

                                            {/* Content Area */}
                                            <div className="p-2.5 sm:p-5 flex flex-col flex-1 bg-white dark:bg-slate-900 transition-colors">
                                                <h3 className="font-black text-[11px] sm:text-[1.05rem] text-slate-800 dark:text-white line-clamp-2 mb-1.5 sm:mb-2.5 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug tracking-tight">
                                                    {blog.title}
                                                </h3>

                                                <p className="text-[10px] sm:text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 sm:line-clamp-3 mb-2.5 sm:mb-5 leading-relaxed flex-1 transition-colors">
                                                    {blog.excerpt || ""}
                                                </p>

                                                {/* Footer */}
                                                <div className="flex items-center justify-between pt-2 sm:pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto transition-colors">
                                                    <div className="flex flex-col min-w-0 leading-tight">
                                                        <span className="hidden sm:inline text-xs font-extrabold text-slate-700 dark:text-slate-300 truncate transition-colors">
                                                            {authorFull}
                                                        </span>
                                                        <span className="sm:hidden text-[10px] font-extrabold text-slate-600 dark:text-slate-400 truncate transition-colors">
                                                            {authorShort}
                                                        </span>
                                                        <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                                                            Publisher
                                                        </span>
                                                    </div>

                                                    <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
                                                        {formatTimeAgo(
                                                            (blog as any).created_at ||
                                                                blog.createdAt
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )

                                    return (
                                        <motion.div
                                            key={blog.id}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: reduceMotion ? 0 : 0.34,
                                                delay: reduceMotion
                                                    ? 0
                                                    : Math.min(idx * 0.04, 0.28),
                                                ease: SMOOTH_EASE,
                                            }}
                                            className={cn(
                                                "h-full relative",
                                                isReturning && "z-30"
                                            )}
                                        >
                                            <a
                                                id={`article-card-${blog.id}`}
                                                href={`/adult/blog/${blog.id}`}
                                                onClick={(e) =>
                                                    handleArticleCardClick(e, blog, idx)
                                                }
                                                className="outline-none block w-full group h-full"
                                            >
                                                {isMorphActive ? (
                                                    /* Invisible structural placeholder keeps grid height locked while card is morphed open */
                                                    <div
                                                        aria-hidden="true"
                                                        className="flex flex-col h-full rounded-xl sm:rounded-[1.75rem] overflow-hidden border-[2px] border-transparent opacity-0 pointer-events-none select-none"
                                                    >
                                                        {cardBody}
                                                    </div>
                                                ) : (
                                                    <motion.div
                                                        layoutId={`article-card-${blog.id}`}
                                                        transition={morphTransition}
                                                        onLayoutAnimationComplete={() => {
                                                            if (isReturning) {
                                                                setReturningArticleId(null)
                                                            }
                                                        }}
                                                        className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl sm:rounded-[1.75rem] overflow-hidden relative transition-[transform,box-shadow,border-color] duration-300 ease-out border-[2px] border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] group-hover:-translate-y-1.5 group-hover:border-orange-500/35 group-hover:shadow-[0_14px_32px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_14px_32px_rgba(249,115,22,0.14)] group-active:translate-y-0"
                                                    >
                                                        {cardBody}
                                                    </motion.div>
                                                )}
                                            </a>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Morph-Expanded Article Reader Overlay */}
                    <ArticleReaderOverlay
                        articles={filteredBlogs}
                        activeIndex={openArticleIndex}
                        morphCardId={morphArticleId}
                        direction={articleNavDirection}
                        onNavigate={handleNavigateArticle}
                        onClose={handleCloseArticle}
                    />
                </LayoutGroup>

                {/* Videos Section — Matching ProfessionalDashboard's Smooth Zero-Snap Expand/Collapse */}
                <div
                    id="videos-section"
                    style={{ overflowAnchor: "none" }}
                    className="mt-16 sm:mt-24"
                >
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-6">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                                Fire Safety Videos
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">
                                Watch educational videos designed to help you prepare for emergency situations.
                            </p>
                        </div>
                    </div>

                    {/* Video Search Bar */}
                    <div className="relative group w-full max-w-md mb-6">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-orange-500 transition-colors duration-300" />
                        <input
                            type="text"
                            placeholder="Search fire safety videos..."
                            value={videoSearchQuery}
                            onChange={(e) => setVideoSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-[3px] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-[0_4px_0_#cbd5e1] dark:shadow-[0_4px_0_#0f172a] focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 text-sm font-semibold transition-all duration-300"
                        />
                    </div>

                    {/* Video Player with Smooth Animated Expand/Collapse (Zero external margin so mount/unmount never snaps) */}
                    <div
                        ref={playerRef}
                        className={cn(
                            "scroll-mt-28 sm:scroll-mt-36",
                            !selectedVideo && "pointer-events-none"
                        )}
                    >
                        <AnimatePresence
                            initial={false}
                            onExitComplete={handlePlayerExitComplete}
                        >
                            {selectedVideo && (
                                <motion.div
                                    key="adult-video-player"
                                    initial={{ height: 0 }}
                                    animate={{
                                        height: "auto",
                                        transition: {
                                            height: {
                                                duration: reduceMotion ? 0 : 0.4,
                                                ease: [0.25, 0.9, 0.3, 1],
                                            },
                                        },
                                    }}
                                    exit={{
                                        height: 0,
                                        transition: {
                                            height: {
                                                duration: reduceMotion ? 0 : 0.36,
                                                ease: [0.4, 0, 0.2, 1],
                                            },
                                        },
                                    }}
                                    className="w-full max-w-5xl mx-auto overflow-hidden"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: -14, scale: 0.975 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                            transition: {
                                                duration: reduceMotion ? 0 : 0.36,
                                                ease: [0.25, 0.9, 0.3, 1],
                                                opacity: {
                                                    duration: reduceMotion ? 0 : 0.26,
                                                    ease: "easeOut",
                                                },
                                            },
                                        }}
                                        exit={{
                                            opacity: 0,
                                            y: -12,
                                            scale: 0.975,
                                            transition: {
                                                duration: reduceMotion ? 0 : 0.34,
                                                ease: [0.4, 0, 0.2, 1],
                                                opacity: {
                                                    duration: reduceMotion ? 0 : 0.26,
                                                    ease: [0.4, 0, 1, 1],
                                                },
                                            },
                                        }}
                                        style={{ transformOrigin: "top center" }}
                                        className="pt-0.5 pb-7 sm:pb-8 will-change-transform transform-gpu"
                                    >
                                        <Card className="bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-800 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_4px_0_#0f172a] sm:shadow-[0_8px_0_#cbd5e1] dark:sm:shadow-[0_8px_0_#0f172a] overflow-hidden p-3.5 sm:p-5 transition-colors duration-300 gap-2.5 sm:gap-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <motion.div
                                                    key={
                                                        selectedVideo.id ||
                                                        selectedVideo.youtubeId
                                                    }
                                                    initial={{ opacity: 0, y: 4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{
                                                        duration: reduceMotion ? 0 : 0.24,
                                                        ease: SMOOTH_EASE,
                                                    }}
                                                    className="min-w-0 flex-1 pt-0.5"
                                                >
                                                    <h3 className="text-base sm:text-2xl font-black text-slate-800 dark:text-white leading-tight">
                                                        {selectedVideo.title}
                                                    </h3>
                                                </motion.div>
                                                <motion.button
                                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 420,
                                                        damping: 24,
                                                    }}
                                                    onClick={handleClosePlayer}
                                                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer shadow-sm"
                                                    title="Close Player"
                                                    aria-label="Close Player"
                                                >
                                                    <X
                                                        className="h-5 w-5"
                                                        strokeWidth={2.5}
                                                    />
                                                </motion.button>
                                            </div>

                                            <div className="aspect-video bg-slate-950 rounded-xl sm:rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800 relative group">
                                                {/* Cached thumbnail backdrop provides immediate visual continuity while YouTube iframe loads */}
                                                <img
                                                    src={`https://img.youtube.com/vi/${getYouTubeId(selectedVideo.youtubeId)}/mqdefault.jpg`}
                                                    alt=""
                                                    aria-hidden="true"
                                                    className={cn(
                                                        "absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none select-none",
                                                        isIframeReady
                                                            ? "opacity-0"
                                                            : "opacity-85"
                                                    )}
                                                />
                                                {!isIframeReady && (
                                                    <div className="absolute inset-0 bg-slate-950/35 flex items-center justify-center pointer-events-none">
                                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-500/90 text-white flex items-center justify-center shadow-lg border-2 border-white/30">
                                                            <Play className="h-5 w-5 sm:h-6 sm:w-6 ml-0.5 fill-current" />
                                                        </div>
                                                    </div>
                                                )}
                                                <div
                                                    ref={playerContainerRef}
                                                    className={cn(
                                                        "relative z-10 w-full h-full transition-opacity duration-300",
                                                        isIframeReady
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    )}
                                                />
                                            </div>

                                            {/* YouTube-Style Expandable Description Box */}
                                            <div
                                                onClick={() =>
                                                    setIsDescriptionExpanded(
                                                        (prev) => !prev
                                                    )
                                                }
                                                className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-100/90 dark:bg-slate-800/70 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 transition-colors cursor-pointer group/desc"
                                            >
                                                <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    <span>
                                                        {formatTimeAgo(
                                                            selectedVideo.created_at ||
                                                                selectedVideo.createdAt
                                                        )}
                                                    </span>
                                                </div>
                                                {selectedVideo.description &&
                                                selectedVideo.description.trim() ? (
                                                    <>
                                                        <p
                                                            className={cn(
                                                                "text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line",
                                                                !isDescriptionExpanded &&
                                                                    "line-clamp-3"
                                                            )}
                                                        >
                                                            {selectedVideo.description}
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setIsDescriptionExpanded(
                                                                    (prev) => !prev
                                                                )
                                                            }}
                                                            className="mt-1.5 text-xs font-black text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 inline-flex items-center gap-1 transition-colors cursor-pointer"
                                                        >
                                                            <span>
                                                                {isDescriptionExpanded
                                                                    ? "Show less"
                                                                    : "See more"}
                                                            </span>
                                                            <ChevronDown
                                                                className={cn(
                                                                    "h-3.5 w-3.5 transition-transform duration-200",
                                                                    isDescriptionExpanded &&
                                                                        "rotate-180"
                                                                )}
                                                            />
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
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Deferred data="initialVideos" fallback={<AdultDashboardSkeleton />}>
                        {filteredVideos.length === 0 ? (
                            <div className="relative overflow-hidden bg-white dark:bg-slate-800 border-[4px] border-dashed border-slate-300 dark:border-slate-700 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center shadow-sm">
                                <div className="bg-slate-100 dark:bg-slate-700 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                                    <Play
                                        className="h-6 w-6 text-slate-400 dark:text-slate-500"
                                        strokeWidth={3}
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                                    No Videos Found
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
                                    {videoSearchQuery
                                        ? "No videos match your search query."
                                        : "Please check back later. Videos are added regularly by the administrator."}
                                </p>
                            </div>
                        ) : (
                            <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: reduceMotion ? 0 : 0.4,
                                    ease: SMOOTH_EASE,
                                }}
                            >
                                {filteredVideos.map((video: any, idx: number) => (
                                    <motion.div
                                        key={video.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: reduceMotion ? 0 : 0.32,
                                            delay: reduceMotion
                                                ? 0
                                                : Math.min(idx * 0.04, 0.32),
                                            ease: SMOOTH_EASE,
                                        }}
                                        className="h-full"
                                    >
                                        <Card
                                            className={cn(
                                                "flex flex-row sm:flex-col h-full cursor-pointer group bg-white dark:bg-slate-900 rounded-[1.25rem] sm:rounded-[1.5rem] border-[3px] transition-[transform,box-shadow,border-color] duration-250 ease-out overflow-hidden p-2.5 sm:p-3 gap-0",
                                                selectedVideo?.id === video.id
                                                    ? "border-orange-500 shadow-[0_6px_0_#ea580c] ring-2 ring-orange-400/30"
                                                    : "border-slate-200 dark:border-slate-800 shadow-[0_4px_0_#cbd5e1] dark:shadow-[0_4px_0_#0f172a] ring-0 ring-transparent hover:border-orange-500/40 hover:-translate-y-1 hover:shadow-[0_6px_0_#cbd5e1] dark:hover:shadow-[0_6px_0_#0f172a]",
                                                "active:translate-y-0.5 active:shadow-none"
                                            )}
                                            onClick={() => handleSelectVideo(video)}
                                        >
                                            {/* Thumbnail Box */}
                                            <div className="relative w-[135px] xs:w-[155px] sm:w-full aspect-video bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800/80">
                                                <img
                                                    src={`https://img.youtube.com/vi/${getYouTubeId(video.youtubeId)}/mqdefault.jpg`}
                                                    alt={video.title}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                                                {/* Duration Badge Overlay */}
                                                {video.duration && (
                                                    <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-black/85 backdrop-blur-xs px-1.5 py-0.5 sm:px-2 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-black text-white tracking-wider flex items-center gap-1 shadow-md border border-white/10 z-20">
                                                        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-orange-400" />
                                                        {video.duration}
                                                    </div>
                                                )}

                                                {/* Play Icon Overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 pointer-events-none">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/95 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white/40 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                                        <Play className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5 fill-current" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Info Section (YouTube Layout) */}
                                            <div className="flex flex-row items-start gap-2.5 sm:gap-3 flex-1 min-w-0 pl-3 sm:pl-0 sm:mt-3">
                                                {/* Mascot Avatar (Desktop) */}
                                                <div className="hidden sm:flex shrink-0 mt-0.5">
                                                    <div className="h-9 w-9 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center p-0.5">
                                                        <img
                                                            src="/berong-official-logo.webp"
                                                            alt="SafeScape"
                                                            className="w-full h-full object-contain rounded-full"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Text Details Column */}
                                                <div className="flex flex-col flex-1 min-w-0 justify-start">
                                                    <h3 className="text-xs xs:text-sm sm:text-[15px] font-extrabold text-slate-800 dark:text-white line-clamp-2 leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                                        {video.title}
                                                    </h3>

                                                    {/* Metadata Line */}
                                                    <div className="flex items-center gap-1.5 text-[10px] xs:text-[11px] sm:text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                                                        <span className="capitalize">
                                                            {video.category || "Adult"}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {formatTimeAgo(
                                                                video.created_at ||
                                                                    video.createdAt
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </Deferred>
                </div>
            </div>
        </main>
    )
}

AdultPageClient.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
)

export default AdultPageClient
