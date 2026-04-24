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
                    className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 cursor-zoom-out animate-in fade-in duration-200"
                    onClick={() => setIsImageExpanded(false)}
                >
                    <button 
                        className="absolute top-6 right-6 text-white/70 hover:text-white hover:bg-white/20 bg-white/10 p-3 rounded-full backdrop-blur-md transition-all active:scale-95 border border-white/20"
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
            <div className="fixed inset-0 bg-white/70 backdrop-blur-[2px] -z-10 pointer-events-none"></div>

            <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-12 relative z-10">
                {/* Navigation Bar */}
                <div className="mb-4 sm:mb-8 flex items-center justify-between">
                    <Link 
                        href="/adult" 
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white rounded-full text-slate-700 font-bold hover:text-slate-900 border-2 border-slate-200 border-b-[4px] active:border-b-2 active:translate-y-[2px] shadow-sm transition-all text-xs sm:text-sm"
                    >
                        <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={3} />
                        Back to Articles
                    </Link>
                </div>

                {/* Main Unified Article Card */}
                <article className="bg-white rounded-[1.5rem] sm:rounded-[3rem] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-2 border-slate-100 overflow-hidden">
                    
                    {/* Header Section */}
                    <div className="p-4 sm:p-8 md:p-10 pb-4 sm:pb-8 bg-gradient-to-b from-slate-50/80 to-white">
                        <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 bg-orange-100 text-orange-600 font-black text-[9px] sm:text-[10px] uppercase tracking-widest rounded-full border-2 border-orange-200 mb-3 sm:mb-4 shadow-sm">
                            Fire Safety Education
                        </span>
                        
                        <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-slate-800 leading-[1.2] tracking-tight mb-4 sm:mb-6">
                            {blog.title}
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-4 text-slate-500">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-orange-100 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                                </div>
                                <div className="text-left py-1">
                                    <div className="font-bold text-slate-800 text-[12px] sm:text-[14px] leading-tight">{authorName}</div>
                                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5">
                                        <Calendar className="h-3 w-3" />
                                        {formattedDate}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Expandable Image Section */}
                    {blog.imageUrl && (
                        <div className="px-3 sm:px-8 md:px-10">
                            <div 
                                className="w-full relative group cursor-zoom-in rounded-[1rem] sm:rounded-3xl overflow-hidden shadow-sm border-2 border-slate-100 bg-slate-50 ring-offset-2 transition-all hover:ring-4 hover:ring-orange-100 active:scale-[0.99]"
                                onClick={() => setIsImageExpanded(true)}
                            >
                                <img 
                                    src={blog.imageUrl} 
                                    alt={blog.title} 
                                    className="w-full h-auto max-h-[200px] sm:max-h-[300px] object-contain object-center transition-transform duration-500 group-hover:scale-[1.02]"
                                />
                                
                                {/* Overlay hint */}
                                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-300 flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/90 backdrop-blur-sm text-slate-800 font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2 shadow-lg text-xs sm:text-sm">
                                        <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                        Click to expand
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Article Content */}
                    <div className="p-4 sm:p-8 md:p-10 pt-5 sm:pt-10 relative">
                        <div 
                            className="prose prose-slate max-w-none 
                                prose-headings:font-black prose-headings:text-slate-800 prose-headings:tracking-tight 
                                prose-h2:text-lg sm:prose-h2:text-2xl prose-h2:mt-6 sm:prose-h2:mt-8 prose-h2:mb-3 sm:prose-h2:mb-4
                                prose-p:text-slate-600 prose-p:font-medium prose-p:leading-relaxed prose-p:mb-4 sm:prose-p:mb-5 prose-p:text-[13px] sm:prose-p:text-sm lg:prose-p:text-base
                                prose-a:text-orange-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                                prose-strong:font-black prose-strong:text-slate-800
                                prose-ul:marker:text-orange-400 prose-li:font-medium prose-li:text-[13px] sm:prose-li:text-sm lg:prose-li:text-base
                                prose-img:rounded-2xl sm:prose-img:rounded-3xl prose-img:shadow-md border-slate-100"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />
                    </div>
                </article>

                {/* Emergency Protocol */}
                <div className="mt-6 sm:mt-8 overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-[#fff5f5]/95 backdrop-blur-sm border-2 border-red-100 p-4 sm:p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center">
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-red-50">
                            <Flame className="h-5 w-5 sm:h-7 sm:w-7 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-[1.1rem] sm:text-[1.35rem] font-black text-red-950 mb-1.5 sm:mb-2">Emergency Protocol</h3>
                            <p className="text-red-900 leading-relaxed font-medium text-[13px] sm:text-base">
                                In case of a fire emergency, do not hesitate. Call <strong className="font-extrabold text-red-950">911</strong> immediately. Never put yourself at risk trying to fight a large fire. <strong className="font-extrabold text-red-700">Evacuate first</strong>, then call for help.
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
