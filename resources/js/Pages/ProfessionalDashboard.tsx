"use client"

import React, { useState, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Link } from '@inertiajs/react'
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

interface ProfessionalPageClientProps {
    initialVideos?: VideoContent[]
}

const getYouTubeId = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
};

const ProfessionalDashboard = ({ initialVideos = professionalVideos }: ProfessionalPageClientProps) => {
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

    const videos = initialVideos

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
        <div className="min-h-screen relative">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Welcome Banner */}
                <ProfessionalWelcomeBanner />

                {/* Access Notice */}
                <Alert className="mb-6 border border-red-500 rounded-xl bg-white text-slate-800 shadow-sm">
                    <Shield className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-slate-700 font-medium">
                        This section contains professional-level content for firefighters and fire safety professionals.
                    </AlertDescription>
                </Alert>

                {/* Quick Links - Horizontal on mobile, grid on desktop */}
                <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 mb-8 sm:mb-10">
                    <Card
                        className="overflow-hidden cursor-pointer border-2 border-b-[4px] border-slate-200 hover:border-slate-300 rounded-2xl bg-white h-full group active:border-b-2 active:translate-y-[2px] transition-all shadow-sm hover:shadow-md"
                        onClick={() => document.getElementById('training-videos-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                            <div className="p-3 bg-red-50 rounded-xl">
                                <Video className="h-6 w-6 text-red-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <CardTitle className="text-base sm:text-lg text-slate-800 font-bold mb-1">Training Videos</CardTitle>
                                <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">{videos.length} professional training videos</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="overflow-hidden cursor-pointer border-2 border-b-[4px] border-slate-200 hover:border-slate-300 rounded-2xl bg-white h-full group active:border-b-2 active:translate-y-[2px] transition-all shadow-sm hover:shadow-md"
                        onClick={() => document.getElementById('manuals-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <BookOpen className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <CardTitle className="text-base sm:text-lg text-slate-800 font-bold mb-1">BFP Manuals</CardTitle>
                                <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">Standard operating procedures and guidelines</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search Bar */}
                <div className="mb-10 relative">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Search training videos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-14 py-6 rounded-full border-2 border-slate-200 bg-white shadow-sm focus-visible:ring-red-500 text-base"
                    />
                </div>

                {/* Video Player */}
                {selectedVideo && (
                    <div ref={playerRef} className="max-w-5xl mx-auto mb-12">
                        <Card className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden pt-6 px-6">
                        <CardHeader className="px-0 pt-0 pb-4">
                            <CardTitle className="text-2xl text-slate-800 font-extrabold">{selectedVideo.title}</CardTitle>
                            <CardDescription className="text-slate-500 font-medium">{selectedVideo.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pb-6">
                            <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-5 shadow-inner">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo.youtubeId)}`}
                                    title={selectedVideo.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                />
                            </div>
                            <div className="flex items-center gap-4 text-sm font-semibold">
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <Clock className="h-4 w-4" />
                                    <span>{selectedVideo.duration || 'Watch Video'}</span>
                                </div>
                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 font-bold bg-red-50 text-red-600 text-xs tracking-wide">
                                    PROFESSIONAL
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    </div>
                )}

                {/* Video Grid */}
                <div id="training-videos-section">
                    <h2 className="text-2xl font-bold mb-6 text-slate-800">Training Videos</h2>
                    {filteredVideos.length === 0 ? (
                        <Card className="rounded-[2rem] border-slate-200 hover:shadow-md transition-shadow">
                            <CardContent className="py-12 text-center text-slate-500">
                                <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                <p className="font-medium">No videos found matching your search.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredVideos.map((video) => (
                                <Card
                                    key={video.id}
                                    className="flex flex-col cursor-pointer group bg-white rounded-[1.5rem] border-2 border-b-[4px] border-slate-200 overflow-hidden hover:-translate-y-1 active:border-b-2 active:translate-y-[2px] transition-all hover:border-slate-300 shadow-sm hover:shadow-md"
                                    onClick={() => handleVideoSelect(video)}
                                >
                                    <CardHeader className="p-0 mb-4">
                                        <div className="aspect-video bg-slate-100 overflow-hidden relative">
                                            <img
                                                src={`https://img.youtube.com/vi/${getYouTubeId(video.youtubeId)}/maxresdefault.jpg`}
                                                alt={video.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                                    <Play className="h-6 w-6 text-white ml-1" fill="currentColor" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex flex-col flex-1 px-5 pb-5">
                                        <CardTitle className="text-[17px] font-bold text-slate-800 line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">{video.title}</CardTitle>
                                        <p className="text-sm text-slate-600 font-medium line-clamp-2 mb-4 leading-relaxed">{video.description}</p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-1.5 text-sm text-slate-600 font-semibold">
                                                <Clock className="h-4 w-4" />
                                                <span>{video.duration || 'Watch Video'}</span>
                                            </div>
                                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 font-bold bg-red-50 text-red-600 text-[10px] tracking-wider uppercase">
                                                Professional
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Resources Section */}
                <div id="manuals-section" className="mt-12 mb-8">
                    <h2 className="text-2xl font-bold mb-6 text-slate-800">Additional Resources</h2>
                    <div className="bg-slate-100/70 rounded-3xl border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors hover:bg-slate-100">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 bg-white rounded-xl shadow-sm shrink-0">
                                <BookOpen className="h-6 w-6 text-slate-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">BFP Standard Operating Procedures</h3>
                                <p className="text-slate-600 font-medium text-sm md:text-base leading-relaxed">
                                    Access comprehensive manuals covering firefighting operations, emergency response protocols, and
                                    safety procedures.
                                </p>
                            </div>
                        </div>
                        <ManualsDialog>
                            <Button className="shrink-0 h-auto bg-slate-700 hover:bg-slate-600 text-white shadow-[0_6px_0_0_#0f172a] hover:shadow-[0_4px_0_0_#0f172a] active:shadow-none hover:translate-y-[2px] active:translate-y-[6px] transition-all rounded-full px-8 py-3.5 font-bold text-base flex items-center">
                                <FileText className="h-5 w-5 mr-2" />
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
