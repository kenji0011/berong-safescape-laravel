"use client"

import React, { useState } from "react"
import { Head, Link } from '@inertiajs/react'
import DashboardLayout from "@/Layouts/DashboardLayout"
import { ArrowLeft, User, Calendar, Maximize2, X, Flame } from "lucide-react"

interface BlogArticleProps {
    blog: {
        id: number
        title: string
        content: string
        excerpt: string
        imageUrl: string
        author?: {
            name: string
        } | string
        created_at: string
        createdAt?: string
    }
}

const BlogArticleClient = ({ blog }: BlogArticleProps) => {
    const [isImageExpanded, setIsImageExpanded] = useState(false);

    // Handle both naming conventions just in case
    const dateString = blog.created_at || blog.createdAt;
    const formattedDate = dateString 
        ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Unknown Date';
        
    const authorName = typeof blog.author === 'string' ? blog.author : blog.author?.name || 'Admin';

    return (
        <div className="min-h-screen selection:bg-red-500 selection:text-white pb-24 relative">
            <Head title={`${blog.title} - SafeScape`} />
            
            {/* Expanded Image Modal Lightbox */}
            {isImageExpanded && blog.imageUrl && (
                <div 
                    className="fixed inset-0 z-[100] bg-slate-900/95 flex items-center justify-center p-4 sm:p-8 cursor-zoom-out animate-in fade-in duration-200"
                    onClick={() => setIsImageExpanded(false)}
                >
                    <button 
                        className="absolute top-6 right-6 text-white/70 hover:text-white hover:bg-white/20 bg-white/10 p-3 rounded-full transition-all active:scale-95 border border-white/20"
                        onClick={(e) => { e.stopPropagation(); setIsImageExpanded(false); }}
                        title="Close"
                    >
                        <X className="h-6 w-6" strokeWidth={2.5} />
                    </button>
                    <img 
                        src={blog.imageUrl} 
                        alt={blog.title} 
                        className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 ring-4 ring-white/10"
                    />
                </div>
            )}

            {/* Exact same background scaling string as RootLayout.tsx for perfect consistency, but at full opacity */}
            <div 
                className="fixed inset-0 bg-cover -z-10 pointer-events-none"
                style={{ 
                    backgroundImage: "url('/web-background-image.jpg')", 
                    backgroundPosition: 'center 80%'
                }}
            />

            {/* Frosting overlay to ensure text readability */}
            <div className="fixed inset-0 bg-background/90 -z-10 pointer-events-none transition-colors duration-500"></div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 relative z-10">
                {/* Desktop absolute-positioned Back to Articles button (Upper Leftmost corner) */}
                <div className="hidden lg:block lg:absolute lg:top-1.5 lg:left-4 xl:left-6 z-20">
                    <Link 
                        href="/adult" 
                        className="group inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 bg-white dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-200 font-bold hover:text-slate-900 dark:hover:text-white border-2 border-slate-200 dark:border-slate-700 border-b-[4px] dark:border-b-slate-900 active:border-b-2 active:translate-y-[2px] shadow-sm transition-all text-xs sm:text-sm"
                    >
                        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform duration-300" strokeWidth={3} />
                        Back to Articles
                    </Link>
                </div>

                {/* Navigation Bar - Mobile/Tablet only to avoid overlaps */}
                <div className="mb-4 sm:mb-6 flex lg:hidden">
                    <Link 
                        href="/adult" 
                        className="group inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-200 font-bold hover:text-slate-900 dark:hover:text-white border-2 border-slate-200 dark:border-slate-700 border-b-[4px] dark:border-b-slate-900 active:border-b-2 active:translate-y-[2px] shadow-sm transition-all text-xs sm:text-sm"
                    >
                        <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:-translate-x-1 transition-transform duration-300" strokeWidth={3} />
                        Back to Articles
                    </Link>
                </div>

                {/* Main Unified Article Card */}
                <article className="max-w-3xl mx-auto bg-white dark:bg-slate-800/90 backdrop-blur-md rounded-[1.5rem] sm:rounded-[2rem] shadow-xl dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] border border-slate-200/60 dark:border-slate-700/50 overflow-hidden transition-all duration-300">
                    
                    {/* Header Section */}
                    <div className="p-4 sm:p-8 md:p-9 pb-3 sm:pb-5 bg-white dark:bg-transparent transition-colors">
                        <span className="inline-block px-2.5 py-0.5 bg-orange-500/10 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider rounded-full border border-orange-500/20 mb-3 sm:mb-4 shadow-sm transition-colors">
                            Fire Safety Education
                        </span>
                        
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-white leading-[1.2] tracking-tight mb-3 sm:mb-4 transition-colors">
                            {blog.title}
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400 transition-colors">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200/50 dark:border-slate-800/80 shadow-inner shrink-0 transition-colors">
                                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400" />
                                </div>
                                <div className="text-left py-0.5">
                                    <div className="font-extrabold text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-tight transition-colors">{authorName}</div>
                                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5 transition-colors">
                                        <Calendar className="h-3 w-3" />
                                        {formattedDate}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Expandable Image Section */}
                    {blog.imageUrl && (
                        <div className="px-4 sm:px-8 md:px-9">
                            <div 
                                className="w-full relative group cursor-zoom-in rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-700/50 bg-slate-950/20 dark:bg-slate-950/40 transition-all hover:border-orange-500/30 hover:shadow-xl active:scale-[0.995]"
                                onClick={() => setIsImageExpanded(true)}
                            >
                                {/* Ambient Blurred Background reflection */}
                                <div 
                                    className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 dark:opacity-40 scale-105 pointer-events-none select-none"
                                    style={{ backgroundImage: `url(${blog.imageUrl})` }}
                                />
                                {/* Subtle dark glass overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/10 z-0" />
                                
                                {/* Foreground sharp image */}
                                <div className="relative z-10 flex items-center justify-center p-3 sm:p-5 min-h-[160px] sm:min-h-[260px] md:min-h-[320px]">
                                    <img 
                                        src={blog.imageUrl} 
                                        alt={blog.title} 
                                        className="max-w-full h-auto max-h-[220px] sm:max-h-[320px] md:max-h-[380px] object-contain rounded-lg shadow-md transition-transform duration-500 group-hover:scale-[1.01]"
                                    />
                                </div>
                                
                                {/* Expand Overlay Hint */}
                                <div className="absolute inset-0 z-20 bg-slate-950/0 group-hover:bg-slate-950/10 transition-colors duration-300 flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-white font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl text-xs sm:text-sm border border-white/20">
                                        <Maximize2 className="h-3.5 w-3.5 text-orange-500" />
                                        Click to expand poster
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Article Content */}
                    <div className="p-4 sm:p-8 md:p-9 pt-5 sm:pt-8 relative">
                        <div 
                            className="prose prose-slate dark:prose-invert max-w-none 
                                prose-headings:font-black prose-headings:text-slate-800 dark:prose-headings:text-white prose-headings:tracking-tight 
                                prose-h2:text-base sm:prose-h2:text-xl prose-h2:mt-5 sm:prose-h2:mt-7 prose-h2:mb-2.5 sm:prose-h2:mb-3
                                prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:font-medium prose-p:leading-[1.7] sm:prose-p:leading-[1.8] prose-p:mb-5 prose-p:text-[13px] sm:prose-p:text-sm md:prose-p:text-base
                                prose-a:text-orange-600 dark:prose-a:text-orange-400 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                                prose-strong:font-black prose-strong:text-slate-800 dark:prose-strong:text-white
                                prose-ul:marker:text-orange-400 dark:prose-ul:marker:text-orange-500 prose-li:font-medium prose-li:text-[13px] sm:prose-li:text-sm md:prose-li:text-base
                                prose-img:rounded-xl sm:prose-img:rounded-2xl prose-img:shadow-md border-slate-100 dark:border-slate-700"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />
                    </div>
                </article>

                {/* Emergency Protocol */}
                <div className="max-w-3xl mx-auto mt-6 sm:mt-8 overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-red-500/[0.02] dark:bg-red-500/[0.03] backdrop-blur-md border border-red-500/20 dark:border-red-500/25 p-5 sm:p-8 shadow-sm transition-colors">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 rounded-full bg-red-500/20 blur-md animate-pulse" />
                            <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 shadow-sm transition-colors">
                                <Flame className="h-5 w-5 sm:h-7 sm:w-7 text-red-500 dark:text-red-400" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-[1.1rem] sm:text-[1.35rem] font-black text-red-600 dark:text-red-400 mb-1.5 transition-colors">Emergency Protocol</h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium text-[13px] sm:text-base transition-colors">
                                In case of a fire emergency, do not hesitate. Call <strong className="font-extrabold text-red-600 dark:text-red-400">911</strong> immediately. Never put yourself at risk trying to fight a large fire. <strong className="font-extrabold text-red-500 dark:text-red-400">Evacuate first</strong>, then call for help.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

BlogArticleClient.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default BlogArticleClient
