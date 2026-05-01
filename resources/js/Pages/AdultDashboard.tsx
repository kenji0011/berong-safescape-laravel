"use client"

import React, { useState } from "react"
import { router, usePage, Deferred } from '@inertiajs/react';
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/Components/navigation"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Flame, Search, BookOpen, Calendar, User, ArrowRight, AlertCircle } from "lucide-react"
import type { BlogPost } from "@/lib/mock-data"
import { Link } from '@inertiajs/react';
import { Footer } from "@/Components/footer"
import DashboardLayout from "@/Layouts/DashboardLayout"
import SpotlightCard from "@/Components/ui/spotlight-card"
import "@/components/ui/spotlight-card.css"

import { AdultWelcomeBanner } from "@/Components/adult-welcome-banner"
import { AdultDashboardSkeleton } from "@/Components/dashboard-skeletons"

interface AdultPageClientProps {
    initialBlogs: BlogPost[]
}

const AdultPageClient = ({ initialBlogs }: AdultPageClientProps) => {
    
    const { user } = useAuth()
    const [searchQuery, setSearchQuery] = useState("")

    const blogs = initialBlogs || []

    const filteredBlogs = blogs.filter(
        (blog) =>
            blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blog.content.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (
        <>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8 w-full relative min-h-screen">
                {/* Background Overlay - Dynamic based on theme */}


                <div className="relative z-10">
                    {/* Welcome Banner */}
                    <AdultWelcomeBanner />

                    {/* Access Notice */}
                    <div className="mb-6 sm:mb-8 bg-blue-50/50 dark:bg-slate-900/50 backdrop-blur-sm border-[3px] border-dashed border-blue-200 dark:border-slate-800 rounded-2xl sm:rounded-[1.25rem] p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white dark:bg-slate-800 border-[2px] sm:border-[3px] border-blue-100 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm">
                            <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-slate-800 dark:text-white font-black text-sm sm:text-base leading-tight transition-colors">Fire Safety Awareness</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-[10px] sm:text-xs mt-0.5 leading-snug transition-colors">Learn essential fire safety practices to protect your home and family from preventable hazards.</p>
                        </div>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-12">
                        {/* Fire Safety Articles Feature */}
                        <Link 
                            href="#articles-section" 
                            onClick={(e) => { e.preventDefault(); document.getElementById('articles-section')?.scrollIntoView({ behavior: 'smooth' }) }} 
                            className="block group h-full outline-none"
                        >
                            <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-4 flex items-center gap-3 sm:gap-6 shadow-[0_6px_0_#cbd5e1] dark:shadow-[0_6px_0_#1e293b] sm:shadow-[0_8px_0_#cbd5e1] sm:dark:shadow-[0_8px_0_#1e293b] transition-all duration-300 border-[3px] border-white dark:border-slate-700 h-full transition-colors">
                                {/* Subtle Background Image */}
                                <div className="absolute inset-0 z-0 opacity-[0.05] dark:opacity-[0.1] group-hover:opacity-[0.08] dark:group-hover:opacity-[0.15] transition-opacity duration-500">
                                    <img src="/Articles Modal.png" className="w-full h-full object-cover dark:brightness-50" alt="" />
                                </div>

                                {/* Icon Box */}
                                <div className="h-12 w-12 sm:h-20 sm:w-20 rounded-xl sm:rounded-[1.5rem] bg-white dark:bg-slate-900 border-[2px] sm:border-[3px] border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm z-10 group-hover:scale-105 transition-all">
                                    <BookOpen className="h-6 w-6 sm:h-10 sm:w-10 text-orange-500" strokeWidth={2.5} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 z-10 min-w-0">
                                    <h3 className="text-base sm:text-2xl font-black text-slate-800 dark:text-white leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
                                        Fire Safety Articles
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] sm:text-sm mt-0.5 sm:mt-1.5 line-clamp-1 transition-colors">
                                        {blogs.length} professional fire safety guides
                                    </p>
                                </div>

                                {/* Arrow */}
                                <div className="h-8 w-8 sm:h-12 sm:w-12 bg-slate-50 dark:bg-slate-700 rounded-full border-[2px] sm:border-[3px] border-slate-100 dark:border-slate-600 flex items-center justify-center text-slate-300 dark:text-slate-500 group-hover:bg-orange-500 dark:group-hover:bg-orange-500 group-hover:text-white dark:group-hover:text-white group-hover:border-orange-400 dark:group-hover:border-orange-400 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(249,115,22,0.8)] group-hover:ring-4 group-hover:ring-orange-500/30 transition-all duration-300 z-10 shrink-0">
                                    <ArrowRight className="h-4 w-4 sm:h-6 sm:w-6 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" strokeWidth={3} />
                                </div>
                            </div>
                        </Link>

                        {/* EDITH Feature */}
                        <Link href="/adult/simulation" className="block group h-full outline-none">
                            <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-4 flex items-center gap-3 sm:gap-6 shadow-[0_6px_0_#cbd5e1] dark:shadow-[0_6px_0_#1e293b] sm:shadow-[0_8px_0_#cbd5e1] sm:dark:shadow-[0_8px_0_#1e293b] transition-all duration-300 border-[3px] border-white dark:border-slate-700 h-full transition-colors">
                                {/* Subtle Background Image */}
                                <div className="absolute inset-0 z-0 opacity-[0.05] dark:opacity-[0.1] group-hover:opacity-[0.08] dark:group-hover:opacity-[0.15] transition-opacity duration-500">
                                    <img src="/EDITH Modal.png" className="w-full h-full object-cover dark:brightness-50" alt="" />
                                </div>

                                {/* Icon Box */}
                                <div className="h-12 w-12 sm:h-20 sm:w-20 rounded-xl sm:rounded-[1.5rem] bg-white dark:bg-slate-900 border-[2px] sm:border-[3px] border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm z-10 group-hover:scale-105 transition-all">
                                    <Flame className="h-6 w-6 sm:h-10 sm:w-10 text-red-500" strokeWidth={2.5} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 z-10 min-w-0">
                                    <h3 className="text-base sm:text-2xl font-black text-slate-800 dark:text-white leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors truncate">
                                        Exit Drill (EDITH)
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] sm:text-sm mt-0.5 sm:mt-1.5 line-clamp-1 transition-colors">
                                        Interactive home fire spread simulator
                                    </p>
                                </div>

                                {/* Arrow */}
                                <div className="h-8 w-8 sm:h-12 sm:w-12 bg-slate-50 dark:bg-slate-700 rounded-full border-[2px] sm:border-[3px] border-slate-100 dark:border-slate-600 flex items-center justify-center text-slate-300 dark:text-slate-500 group-hover:bg-red-500 dark:group-hover:bg-red-500 group-hover:text-white dark:group-hover:text-white group-hover:border-red-400 dark:group-hover:border-red-400 group-hover:scale-110 group-hover:shadow-[0_0_30_rgba(239,68,68,0.8)] group-hover:ring-4 group-hover:ring-red-500/30 transition-all duration-300 z-10 shrink-0">
                                    <ArrowRight className="h-4 w-4 sm:h-6 sm:w-6 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" strokeWidth={3} />
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-10 relative">
                        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                        <Input
                            type="text"
                            placeholder="Search fire safety articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-14 py-6 rounded-full border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm focus-visible:ring-red-500 text-base text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                        />
                    </div>

                {/* Blog Grid */}
                <div id="articles-section">
                    <h2 className="text-2xl font-bold mb-6 text-foreground">Fire Safety Articles</h2>
                    <Deferred data="initialBlogs" fallback={<AdultDashboardSkeleton />}>
                        {filteredBlogs.length === 0 ? (
                            <div className="relative overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border-[4px] border-dashed border-slate-300 dark:border-slate-700 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center shadow-sm transition-all duration-300">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-red-100 dark:bg-red-900/20 rounded-full blur-3xl opacity-50 -z-10 transform translate-x-1/2 -translate-y-1/2 transition-colors"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 -z-10 transform -translate-x-1/2 translate-y-1/2 transition-colors"></div>
                                
                                <div className="bg-slate-100 dark:bg-slate-700 h-20 w-20 rounded-full flex items-center justify-center mb-6 shadow-inner border-[3px] border-white dark:border-slate-600 relative transition-colors">
                                    <Search className="h-8 w-8 text-slate-400 dark:text-slate-500" strokeWidth={3} />
                                    {searchQuery && (
                                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black h-6 w-6 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-600 shadow-sm">
                                            !
                                        </div>
                                    )}
                                </div>
                                
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 transition-colors">
                                    {searchQuery ? "No Matches Found" : "No Articles Available"}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 font-bold max-w-md mx-auto leading-relaxed transition-colors">
                                    {searchQuery 
                                        ? `We couldn't find any articles matching "${searchQuery}". Try adjusting your keywords or browse all articles.` 
                                        : "There are no articles published at the moment. Please check back later!"}
                                </p>
                                
                                {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery("")}
                                        className="mt-8 inline-flex items-center gap-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black px-6 py-3 rounded-full border-[3px] border-slate-200 dark:border-slate-600 shadow-[0_4px_0_#cbd5e1] dark:shadow-[0_4px_0_#1e293b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#cbd5e1] dark:hover:shadow-[0_6px_0_#1e293b] active:translate-y-1 active:shadow-[0_0px_0_#cbd5e1] transition-all uppercase tracking-wide text-sm"
                                    >
                                        Clear Search & View All
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                {filteredBlogs.map((blog) => (
                                    <Link key={blog.id} href={`/adult/blog/${blog.id}`} className="outline-none block w-full group h-full">
                                        <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl border-2 sm:border-[4px] border-white dark:border-slate-700 overflow-hidden relative transition-all duration-300 shadow-[0_4px_0_#cbd5e1] dark:shadow-[0_4px_0_#1e293b] sm:shadow-[0_6px_0_#cbd5e1] sm:dark:shadow-[0_6px_0_#1e293b] group-hover:-translate-y-1 sm:group-hover:-translate-y-1.5 group-hover:shadow-[0_6px_0_#cbd5e1] sm:group-hover:shadow-[0_12px_0_#cbd5e1] dark:group-hover:shadow-[0_12px_0_#1e293b] group-active:translate-y-[2px] sm:group-active:translate-y-[6px] group-active:shadow-[0_0px_0_#cbd5e1]">
                                            {/* Image Header */}
                                            <div className="h-28 sm:h-48 shrink-0 w-full border-b-2 sm:border-b-[3px] border-white dark:border-slate-700 relative overflow-hidden bg-slate-100 dark:bg-slate-900 transition-colors">
                                                <img
                                                    src={blog.imageUrl || "/placeholder.svg?height=300&width=400"}
                                                    alt={blog.title}
                                                    decoding="async"
                                                    loading="lazy"
                                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                {/* Image Overlay - Subtle darkening for text contrast if needed, but removed for now as it was obscuring the image */}
                                                <div className="absolute inset-0 bg-black/10 dark:bg-black/20 z-0 transition-opacity" />
                                                {/* Tag / Badge - Updated to Glassmorphism */}
                                                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black/40 backdrop-blur-md text-white text-[9px] sm:text-xs font-extrabold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/30 shadow-sm uppercase tracking-wide z-10">
                                                    Article
                                                </div>
                                            </div>
                                            
                                            {/* Content Area */}
                                            <div className="p-3 sm:p-5 flex flex-col flex-1 bg-white dark:bg-slate-800 transition-colors">
                                                <div className="min-h-[2.5rem] sm:min-h-[3.5rem]">
                                                    <h3 className="font-black text-xs sm:text-lg text-slate-800 dark:text-white line-clamp-2 mb-1 sm:mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-tight">
                                                        {blog.title}
                                                    </h3>
                                                </div>
                                                
                                                <div className="hidden sm:block flex-1 min-h-[4.5rem]">
                                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 transition-colors">
                                                        {blog.excerpt || ''}
                                                    </p>
                                                </div>
                                                
                                                {/* Metadata Footer */}
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[9px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 pt-2 sm:pt-4 border-t-2 sm:border-t-[3px] border-dashed border-slate-100 dark:border-slate-700 mt-auto gap-1 sm:gap-0 transition-colors">
                                                    <div className="flex items-center gap-1 sm:gap-1.5 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl border-[2px] border-white dark:border-slate-700 shadow-sm w-fit max-w-full overflow-hidden transition-colors">
                                                        <User className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-slate-800 dark:text-slate-300 shrink-0 transition-colors" strokeWidth={3} />
                                                        <span className="truncate">{typeof blog.author === 'string' ? blog.author : blog.author?.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-50 dark:bg-slate-900 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl border-[2px] border-white dark:border-slate-700 shadow-sm w-fit max-w-full overflow-hidden transition-colors">
                                                        <Calendar className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-slate-600 dark:text-slate-400 shrink-0 transition-colors" strokeWidth={3} />
                                                        <span className="truncate">{new Date((blog as any).created_at || blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Deferred>
                </div>
            </div>
        </main>
        </>
    )
}

AdultPageClient.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default AdultPageClient
