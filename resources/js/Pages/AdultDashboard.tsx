"use client"

import React, { useState } from "react"
import { router, usePage, Deferred } from '@inertiajs/react';
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/Components/navigation"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Flame, Search, BookOpen, Calendar, User, ArrowRight, AlertCircle, Maximize2 } from "lucide-react"
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
                                <div className="h-8 w-8 sm:h-12 sm:w-12 bg-orange-500 dark:bg-orange-600 rounded-full border-[2px] sm:border-[3px] border-orange-400 dark:border-orange-500 flex items-center justify-center text-white group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(249,115,22,0.8)] group-hover:ring-4 group-hover:ring-orange-500/30 transition-all duration-300 z-10 shrink-0">
                                    <ArrowRight className="h-4 w-4 sm:h-6 sm:w-6 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" strokeWidth={3} />
                                </div>
                            </div>
                        </Link>

                        {/* EDITH Feature */}
                        <Link href="/adult/simulation" className="block group h-full outline-none relative">
                            {/* FLOATING HOVER PREVIEW WINDOW */}
                            <div className="absolute bottom-[105%] left-1/2 -translate-x-1/2 mb-2 w-[305px] sm:w-[350px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border-2 border-red-100 dark:border-red-500/40 p-3 shadow-2xl shadow-red-100/50 dark:shadow-red-500/25 pointer-events-none opacity-0 scale-95 -translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-300 z-50">
                                {/* Triangle indicator below preview */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-3 h-3 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-red-100 dark:border-red-500/40 rotate-45" />
                                
                                {/* Preview indicator */}
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <div className="flex items-center gap-1">
                                        <Flame className="h-3 w-3 text-red-600 dark:text-red-500 shrink-0" strokeWidth={2.5} />
                                        <span className="text-[9.5px] sm:text-[10px] font-black text-red-600 dark:text-red-400 tracking-wider uppercase">Simulator Preview</span>
                                    </div>
                                    <span className="text-[8px] sm:text-[8.5px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">Interactive</span>
                                </div>
                                
                                {/* Simulator Frame */}
                                <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-50/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-inner">
                                    <img src="/EDITH Modal.png" className="w-full h-full object-cover opacity-80" alt="Simulator Preview" />
                                    
                                    {/* Animated simulated overlays! */}
                                    {/* Fire Outbreak Source (Pulsing Fire Dot) */}
                                    <div className="absolute top-[28%] left-[22%] -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                                        <span className="absolute inline-flex h-8 w-8 rounded-full bg-red-500/30 animate-ping"></span>
                                        <span className="absolute inline-flex h-5 w-5 rounded-full bg-red-500/40 animate-pulse"></span>
                                        <div className="h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white"></div>
                                    </div>
                                    <span className="absolute top-[18%] left-[26%] z-20 bg-red-600/90 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded tracking-wide shadow-sm uppercase animate-pulse">FIRE OUTBREAK</span>

                                    {/* Exit Pathway (Glowing Evacuation Arrow and safe indicator) */}
                                    <div className="absolute bottom-[25%] right-[20%] z-20 flex items-center gap-1.5 bg-emerald-500/95 text-white text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded shadow-md tracking-wider uppercase animate-bounce">
                                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-200"></span>
                                        </span>
                                        Safe Exit Egress
                                    </div>

                                    {/* SVG path to represent glowing escape route */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M 30,22 L 55,22 L 55,42 L 72,42" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" className="animate-[dash_2s_linear_infinite]" />
                                    </svg>
                                    
                                    {/* Custom animation stylesheet injection inline */}
                                    <style>{`
                                        @keyframes dash {
                                            to {
                                                stroke-dashoffset: -20;
                                            }
                                        }
                                    `}</style>
                                </div>
                                
                                {/* Info Box */}
                                <div className="mt-2 text-left px-1">
                                    <h4 className="text-[11px] font-black text-slate-800 dark:text-white leading-tight">Floor Plan Escape Routing</h4>
                                    <p className="text-[9.2px] sm:text-[9.8px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                                        Map safe paths under custom fire spread vectors. Test exit delays and fire code egress protocols.
                                    </p>
                                </div>
                            </div>

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
                                <div className="h-8 w-8 sm:h-12 sm:w-12 bg-red-500 dark:bg-red-600 rounded-full border-[2px] sm:border-[3px] border-red-400 dark:border-red-500 flex items-center justify-center text-white group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.8)] group-hover:ring-4 group-hover:ring-red-500/30 transition-all duration-300 z-10 shrink-0">
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
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                {filteredBlogs.map((blog) => (
                                    <Link key={blog.id} href={`/adult/blog/${blog.id}`} className="outline-none block w-full group h-full">
                                        <div className="flex flex-col h-full bg-white dark:bg-slate-800/90 rounded-xl sm:rounded-[1.75rem] overflow-hidden relative transition-all duration-300 border-[2px] border-slate-100 dark:border-slate-700/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] group-hover:-translate-y-1.5 group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] group-active:translate-y-0 group-active:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                                            {/* Image Section */}
                                            <div className="relative h-28 sm:h-52 shrink-0 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                                                <img
                                                    src={blog.imageUrl || "/placeholder.svg?height=300&width=400"}
                                                    alt={blog.title}
                                                    decoding="async"
                                                    loading="lazy"
                                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                                />
                                                {/* Bottom Gradient Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-[1]" />
                                                
                                                {/* Read Time / Date on Image */}
                                                <div className="absolute bottom-3 left-3 z-[2] flex items-center gap-2">
                                                    <span className="text-white/90 text-[10px] sm:text-xs font-bold flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" strokeWidth={2.5} />
                                                        {new Date((blog as any).created_at || blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Accent Line */}
                                            <div className="h-[2px] sm:h-[3px] w-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-400" />
                                            
                                            {/* Content Area */}
                                            <div className="p-2.5 sm:p-5 flex flex-col flex-1 bg-white dark:bg-slate-800/90 transition-colors">
                                                <h3 className="font-black text-[11px] sm:text-[1.05rem] text-slate-800 dark:text-white line-clamp-2 mb-1.5 sm:mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug tracking-tight">
                                                    {blog.title}
                                                </h3>
                                                
                                                <p className="text-[10px] sm:text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 sm:line-clamp-3 mb-2.5 sm:mb-5 leading-relaxed flex-1 transition-colors">
                                                    {blog.excerpt || ''}
                                                </p>
                                                
                                                {/* Footer */}
                                                <div className="flex items-center justify-between pt-2 sm:pt-4 border-t border-slate-100/80 dark:border-slate-700/40 mt-auto transition-colors">
                                                    {/* Author */}
                                                    <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                                                        <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-slate-100 dark:bg-slate-900/80 flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                                                            <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-500 dark:text-slate-400" strokeWidth={2.5} />
                                                        </div>
                                                        <div className="flex flex-col min-w-0 leading-none">
                                                            <span className="hidden sm:inline text-xs font-extrabold text-slate-700 dark:text-slate-300 truncate transition-colors">
                                                                {typeof blog.author === 'string' ? blog.author : blog.author?.name}
                                                            </span>
                                                            <span className="sm:hidden text-[10px] font-extrabold text-slate-600 dark:text-slate-400 truncate transition-colors">
                                                                {(() => {
                                                                    const name = typeof blog.author === 'string' ? blog.author : blog.author?.name || '';
                                                                    return name.length > 10 ? name.split(' ')[0] : name;
                                                                })()}
                                                            </span>
                                                            <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Publisher</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Read More CTA Pill */}
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-50 dark:bg-slate-900/60 hover:bg-orange-500 dark:hover:bg-orange-600 border border-slate-200/60 dark:border-slate-700/60 hover:border-orange-500/20 dark:hover:border-orange-600/20 text-slate-600 dark:text-slate-400 hover:text-white dark:hover:text-white font-extrabold text-[10px] sm:text-xs transition-all duration-300 shadow-sm shrink-0">
                                                        Read
                                                        <ArrowRight className="h-2.5 w-2.5 sm:h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-300" strokeWidth={2.5} />
                                                    </span>
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
