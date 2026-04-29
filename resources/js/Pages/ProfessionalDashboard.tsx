"use client"

import React, { useState, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Link, Deferred } from '@inertiajs/react'
import { Navigation } from "@/Components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Video, Clock, Search, BookOpen, FileText, AlertCircle, Play } from "lucide-react"
import { professionalVideos, type VideoContent } from "@/lib/mock-data"
import { ManualsDialog } from "@/Components/ui/manuals-dialog"
import { Footer } from "@/Components/footer"
import DashboardLayout from "@/Layouts/DashboardLayout"
import SpotlightCard from "@/Components/ui/spotlight-card"
import "@/components/ui/spotlight-card.css"
// import { logEngagement } from "@/lib/engagement-tracker" // Removed since tracking might not exist yet
import { ProfessionalWelcomeBanner } from "@/components/professional-welcome-banner"

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
}

const getYouTubeId = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
};

const ProfessionalDashboard = ({ initialVideos }: ProfessionalPageClientProps) => {
    const { user } = useAuth()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null)
    const trackedVideos = useRef<Set<string>>(new Set())
    const playerRef = useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (selectedVideo) {
            setTimeout(() => {
                playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }, 100)
        }
    }, [selectedVideo])

    const videos = initialVideos || []

    // Handle video selection with tracking
    const handleVideoSelect = (video: VideoContent) => {
        setSelectedVideo(video)
        if (!trackedVideos.current.has(video.id.toString())) {
            trackedVideos.current.add(video.id.toString())
            // logEngagement({
            //     activityType: "VIDEO_WATCHED",
            //     metadata: { videoId: String(video.id), videoTitle: video.title }
            // })
        }
    }

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

                {/* Access Notice */}
                <div className="mb-6 sm:mb-8 bg-red-50 dark:bg-red-950/20 border-[3px] border-dashed border-red-200 dark:border-red-900/30 rounded-2xl sm:rounded-[1.25rem] p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white dark:bg-slate-800 border-[2px] sm:border-[3px] border-red-100 dark:border-red-900 flex items-center justify-center shrink-0 shadow-sm">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-slate-800 dark:text-white font-black text-sm sm:text-base leading-tight">Professional Content</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-[10px] sm:text-xs mt-0.5 leading-snug">This section contains professional-level content for firefighters and fire safety professionals.</p>
                    </div>
                </div>

                {/* Quick Links - Horizontal on mobile, grid on desktop */}
                <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-5 mb-8 sm:mb-10">
                    <Link href="#training-videos-section" onClick={(e) => { e.preventDefault(); document.getElementById('training-videos-section')?.scrollIntoView({ behavior: 'smooth' }) }} className="block group h-full outline-none">
                        <div className="relative overflow-hidden bg-white dark:bg-slate-800 border-[3px] sm:border-[4px] border-white dark:border-slate-700 rounded-2xl sm:rounded-[1.5rem] shadow-[0_6px_0_#cbd5e1] dark:shadow-[0_6px_0_#0f172a] sm:shadow-[0_8px_0_#cbd5e1] sm:hover:shadow-[0_12px_0_#cbd5e1] dark:hover:shadow-[0_12px_0_#0f172a] hover:-translate-y-1 sm:hover:-translate-y-1.5 active:translate-y-[6px] sm:active:translate-y-[8px] active:shadow-none transition-all duration-300 flex flex-col h-full">
                            <div className="absolute inset-0 bg-red-50/50 dark:bg-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none"></div>
                            <img
                                src="/Training Vidoes Modal.png"
                                alt="Training Background"
                                className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-10 group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-105 pointer-events-none dark:invert dark:opacity-5"
                            />
                            
                            <div className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4 relative z-10 bg-transparent">
                                <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-[1rem] bg-white dark:bg-slate-700 border-[2px] border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0 group-hover:bg-red-50 dark:group-hover:bg-red-900/30 group-hover:border-red-200 dark:group-hover:border-red-800 group-hover:scale-110 transition-all duration-300 shadow-sm">
                                    <Video className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base sm:text-xl font-black text-slate-800 dark:text-white mb-0.5 sm:mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Training Videos</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] sm:text-xs">{videos.length} professional training videos</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link href="#manuals-section" onClick={(e) => { e.preventDefault(); document.getElementById('manuals-section')?.scrollIntoView({ behavior: 'smooth' }) }} className="block group h-full outline-none">
                        <div className="relative overflow-hidden bg-white dark:bg-slate-800 border-[3px] sm:border-[4px] border-white dark:border-slate-700 rounded-2xl sm:rounded-[1.5rem] shadow-[0_6px_0_#cbd5e1] dark:shadow-[0_6px_0_#0f172a] sm:shadow-[0_8px_0_#cbd5e1] sm:hover:shadow-[0_12px_0_#cbd5e1] dark:hover:shadow-[0_12px_0_#0f172a] hover:-translate-y-1 sm:hover:-translate-y-1.5 active:translate-y-[6px] sm:active:translate-y-[8px] active:shadow-none transition-all duration-300 flex flex-col h-full">
                            <div className="absolute inset-0 bg-blue-50/50 dark:bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none"></div>
                            <img
                                src="/BFP Manuals Modal.png"
                                alt="Manuals Background"
                                className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-10 group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-105 pointer-events-none dark:invert dark:opacity-5"
                            />
                            
                            <div className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4 relative z-10 bg-transparent">
                                <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-[1rem] bg-white dark:bg-slate-700 border-[2px] border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:border-blue-200 dark:group-hover:border-blue-800 group-hover:scale-110 transition-all duration-300 shadow-sm">
                                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base sm:text-xl font-black text-slate-800 dark:text-white mb-0.5 sm:mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">BFP Manuals</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] sm:text-xs">Standard operating procedures</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="mb-10 relative">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Search training videos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-14 py-6 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white shadow-sm focus-visible:ring-red-500 text-base"
                    />
                </div>

                {/* Video Player */}
                {selectedVideo && (
                    <div ref={playerRef} className="max-w-5xl mx-auto mb-12">
                        <Card className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden pt-6 px-6">
                        <CardHeader className="px-0 pt-0 pb-4">
                            <CardTitle className="text-2xl text-slate-800 dark:text-white font-extrabold">{selectedVideo.title}</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">{selectedVideo.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pb-6">
                            <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-5 shadow-inner">
                                <iframe
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
                    <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Training Videos</h2>
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
                                        className="flex flex-row sm:flex-col cursor-pointer group bg-white dark:bg-slate-800 rounded-[1.25rem] sm:rounded-[1.5rem] border-2 border-b-[4px] border-slate-200 dark:border-slate-700 dark:shadow-[0_4px_0_#0f172a] overflow-hidden hover:-translate-y-1 active:border-b-[2px] active:translate-y-[2px] transition-all hover:border-slate-300 dark:hover:border-slate-600 shadow-sm hover:shadow-md h-auto items-stretch"
                                        onClick={() => handleVideoSelect(video)}
                                    >
                                        <CardHeader className="p-2 sm:p-0 sm:mb-4 w-[140px] sm:w-full shrink-0 flex items-center justify-center">
                                            <div className="w-full h-full sm:aspect-video bg-slate-100 dark:bg-slate-900 overflow-hidden relative rounded-xl sm:rounded-none sm:rounded-t-[1.3rem] min-h-[75px]">
                                                <img
                                                    src={`https://img.youtube.com/vi/${getYouTubeId(video.youtubeId)}/mqdefault.jpg`}
                                                    alt={video.title}
                                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <div className="w-8 h-8 sm:w-14 sm:h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                                        <Play className="h-4 w-4 sm:h-6 sm:w-6 text-white ml-0.5 sm:ml-1" fill="currentColor" />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex flex-col flex-1 py-3 pr-3 pl-1 sm:px-5 sm:pb-5 sm:pt-0 justify-center">
                                            <CardTitle className="text-sm sm:text-[17px] font-bold text-slate-800 dark:text-white line-clamp-2 mb-1.5 sm:mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-tight">{video.title}</CardTitle>
                                            <p className="hidden sm:block text-sm text-slate-600 dark:text-slate-400 font-medium line-clamp-2 mb-4 leading-relaxed">{video.description}</p>
                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">
                                                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    <span className="truncate">{video.duration || 'Watch Video'}</span>
                                                </div>
                                                <span className="hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 font-bold bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] tracking-wider uppercase">
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
                <div id="manuals-section" className="mt-8 sm:mt-12 mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-slate-800 dark:text-white">Additional Resources</h2>
                    <div className="bg-slate-100/70 dark:bg-slate-800 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50">
                        <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full">
                            <div className="p-2 sm:p-3 bg-white dark:bg-slate-700 rounded-lg sm:rounded-xl shadow-sm shrink-0">
                                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 dark:text-slate-300" />
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-1 sm:mb-2">BFP Standard Operating Procedures</h3>
                                <p className="text-slate-600 dark:text-slate-400 font-medium text-[13px] sm:text-sm md:text-base leading-relaxed">
                                    Access comprehensive manuals covering firefighting operations, emergency response protocols, and
                                    safety procedures.
                                </p>
                            </div>
                        </div>
                        <ManualsDialog>
                            <Button className="w-full sm:w-auto shrink-0 h-auto bg-slate-700 dark:bg-slate-900 hover:bg-slate-600 dark:hover:bg-slate-950 text-white shadow-[0_4px_0_0_#0f172a] sm:shadow-[0_6px_0_0_#0f172a] hover:shadow-[0_2px_0_0_#0f172a] sm:hover:shadow-[0_4px_0_0_#0f172a] active:shadow-none hover:translate-y-[2px] active:translate-y-[4px] sm:active:translate-y-[6px] transition-all rounded-full px-6 py-2.5 sm:px-8 sm:py-3.5 font-bold text-sm sm:text-base flex items-center justify-center">
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                View Manuals
                            </Button>
                        </ManualsDialog>
                    </div>
                </div>
            </main>
        </div>
    )
}

ProfessionalDashboard.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default ProfessionalDashboard
