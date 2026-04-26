"use client"

import React, { useState } from "react"
import { router, usePage } from '@inertiajs/react';
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

interface AdultPageClientProps {
    initialBlogs: BlogPost[]
}

const AdultPageClient = ({ initialBlogs }: AdultPageClientProps) => {
    
    const { user } = useAuth()
    const [searchQuery, setSearchQuery] = useState("")

    const blogs = initialBlogs

    const filteredBlogs = blogs.filter(
        (blog) =>
            blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blog.content.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (
        <>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Welcome Banner */}
                <AdultWelcomeBanner />

                {/* Access Notice */}
                <div className="mb-6 sm:mb-8 bg-blue-50/50 backdrop-blur-sm border-[3px] border-dashed border-blue-200 rounded-2xl sm:rounded-[1.25rem] p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white border-[2px] sm:border-[3px] border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
                        <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-slate-800 font-black text-sm sm:text-base leading-tight">Fire Safety Awareness</h3>
                        <p className="text-slate-500 font-medium text-[10px] sm:text-xs mt-0.5 leading-snug">Learn essential fire safety practices to protect your home and family from preventable hazards.</p>
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
                    <Link href="#articles-section" onClick={(e) => { e.preventDefault(); document.getElementById('articles-section')?.scrollIntoView({ behavior: 'smooth' }) }} className="block group h-full outline-none">
                        <div className="relative overflow-hidden bg-white border-[3px] sm:border-[4px] border-white rounded-2xl sm:rounded-[1.5rem] shadow-[0_6px_0_#cbd5e1] sm:shadow-[0_8px_0_#cbd5e1] hover:shadow-[0_8px_0_#cbd5e1] sm:hover:shadow-[0_12px_0_#cbd5e1] hover:-translate-y-1 sm:hover:-translate-y-1.5 active:translate-y-[6px] sm:active:translate-y-[8px] active:shadow-[0_0px_0_#cbd5e1] transition-all duration-300 flex flex-col h-full">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none"></div>
                            
                            <div className="h-28 sm:h-40 w-full border-b-[4px] border-slate-100 relative overflow-hidden bg-slate-50">
                                <img
                                    src="/Articles Modal.png"
                                    alt="Articles Background"
                                    className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-30 group-hover:opacity-40 transition-opacity duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
                                <div className="absolute bottom-2 sm:bottom-4 left-3 sm:left-4 bg-white p-2 sm:p-3 rounded-xl sm:rounded-2xl border-[3px] border-slate-100 shadow-sm transform -rotate-3 group-hover:rotate-0 transition-transform">
                                    <BookOpen className="h-5 w-5 sm:h-7 sm:w-7 text-orange-500" strokeWidth={2.5} />
                                </div>
                            </div>
                            
                            <div className="p-4 sm:p-6 flex-1 flex flex-col relative z-10 bg-white">
                                <h3 className="text-lg sm:text-2xl font-black text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">Fire Safety Articles</h3>
                                <p className="text-slate-500 font-bold text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 flex-1">
                                    Read comprehensive articles on home fire safety, prevention tips, and emergency preparedness.
                                </p>
                                
                                <div className="mt-auto flex items-center justify-between pt-4 border-t-[3px] border-dashed border-slate-100">
                                    <span className="text-orange-600 font-black text-[10px] sm:text-xs uppercase tracking-wider bg-orange-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border-2 border-orange-100">
                                        {blogs.length} articles
                                    </span>
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-slate-50 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:border-orange-600 group-hover:text-white transition-colors shadow-sm">
                                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link href="/adult/simulation" className="block group h-full outline-none">
                        <div className="relative overflow-hidden bg-white border-[3px] sm:border-[4px] border-white rounded-2xl sm:rounded-[1.5rem] shadow-[0_6px_0_#cbd5e1] sm:shadow-[0_8px_0_#cbd5e1] hover:shadow-[0_8px_0_#cbd5e1] sm:hover:shadow-[0_12px_0_#cbd5e1] hover:-translate-y-1 sm:hover:-translate-y-1.5 active:translate-y-[6px] sm:active:translate-y-[8px] active:shadow-[0_0px_0_#cbd5e1] transition-all duration-300 flex flex-col h-full">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-rose-50/50 opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none"></div>
                            
                            <div className="h-28 sm:h-40 w-full border-b-[3px] sm:border-[4px] border-slate-100 relative overflow-hidden bg-slate-50">
                                <img
                                    src="/EDITH Modal.png"
                                    alt="EDITH Background"
                                    className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-30 group-hover:opacity-40 transition-opacity duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
                                <div className="absolute bottom-2 sm:bottom-4 left-3 sm:left-4 bg-white p-2 sm:p-3 rounded-xl sm:rounded-2xl border-[2px] sm:border-[3px] border-slate-100 shadow-sm transform rotate-3 group-hover:rotate-0 transition-transform">
                                    <Flame className="h-5 w-5 sm:h-7 sm:w-7 text-red-500" strokeWidth={2.5} />
                                </div>
                            </div>
                            
                            <div className="p-4 sm:p-6 flex-1 flex flex-col relative z-10 bg-white">
                                <h3 className="text-lg sm:text-2xl font-black text-slate-800 mb-2 group-hover:text-red-600 transition-colors">Exit Drill In The Home (EDITH)</h3>
                                <p className="text-slate-500 font-bold text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 flex-1">
                                    Interactive tool to visualize how fire spreads in different environments.
                                </p>
                                
                                <div className="mt-auto pt-4 border-t-[3px] border-dashed border-slate-100">
                                    <button className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-2 sm:py-3 px-3 sm:px-5 rounded-full shadow-[0_4px_0_#991b1b] group-hover:shadow-[0_6px_0_#991b1b] group-hover:-translate-y-0.5 active:translate-y-[4px] active:shadow-[0_0px_0_#991b1b] transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-[10px] sm:text-xs">
                                        Launch Simulator
                                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" strokeWidth={3} />
                                    </button>
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
                        placeholder="Search fire safety articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-14 py-6 rounded-full border-2 border-slate-200 bg-white shadow-sm focus-visible:ring-red-500 text-base text-slate-800 placeholder:text-slate-400"
                    />
                </div>

                {/* Blog Grid */}
                <div id="articles-section">
                    <h2 className="text-2xl font-bold mb-6 text-foreground">Fire Safety Articles</h2>
                    {filteredBlogs.length === 0 ? (
                        <div className="relative overflow-hidden bg-white/60 backdrop-blur-md border-[4px] border-dashed border-slate-300 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center shadow-sm transition-all duration-300">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-100 rounded-full blur-3xl opacity-50 -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10 transform -translate-x-1/2 translate-y-1/2"></div>
                            
                            <div className="bg-slate-100 h-20 w-20 rounded-full flex items-center justify-center mb-6 shadow-inner border-[3px] border-white relative">
                                <Search className="h-8 w-8 text-slate-400" strokeWidth={3} />
                                {searchQuery && (
                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black h-6 w-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                        !
                                    </div>
                                )}
                            </div>
                            
                            <h3 className="text-2xl font-black text-slate-800 mb-2">
                                {searchQuery ? "No Matches Found" : "No Articles Available"}
                            </h3>
                            <p className="text-slate-500 font-bold max-w-md mx-auto leading-relaxed">
                                {searchQuery 
                                    ? `We couldn't find any articles matching "${searchQuery}". Try adjusting your keywords or browse all articles.` 
                                    : "There are no articles published at the moment. Please check back later!"}
                            </p>
                            
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery("")}
                                    className="mt-8 inline-flex items-center gap-2 bg-white text-slate-700 font-black px-6 py-3 rounded-full border-[3px] border-slate-200 shadow-[0_4px_0_#cbd5e1] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#cbd5e1] active:translate-y-1 active:shadow-[0_0px_0_#cbd5e1] transition-all uppercase tracking-wide text-sm"
                                >
                                    Clear Search & View All
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                            {filteredBlogs.map((blog) => (
                                <Link key={blog.id} href={`/adult/blog/${blog.id}`} className="outline-none block w-full group h-full">
                                    <div className="flex flex-col h-full bg-white rounded-2xl sm:rounded-3xl border-2 sm:border-[4px] border-white overflow-hidden relative transition-all duration-300 shadow-[0_4px_0_#cbd5e1] sm:shadow-[0_6px_0_#cbd5e1] group-hover:-translate-y-1 sm:group-hover:-translate-y-1.5 group-hover:shadow-[0_6px_0_#cbd5e1] sm:group-hover:shadow-[0_12px_0_#cbd5e1] group-active:translate-y-[2px] sm:group-active:translate-y-[6px] group-active:shadow-[0_0px_0_#cbd5e1]">
                                        {/* Image Header */}
                                        <div className="h-28 sm:h-48 shrink-0 w-full border-b-2 sm:border-b-[3px] border-white relative overflow-hidden bg-slate-100">
                                            <img
                                                src={blog.imageUrl || "/placeholder.svg?height=300&width=400"}
                                                alt={blog.title}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            {/* Tag / Badge */}
                                            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-yellow-400 text-red-600 text-[9px] sm:text-xs font-extrabold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border-[2px] border-white shadow-[0_2px_0_rgba(0,0,0,0.15)] uppercase tracking-wide z-10">
                                                Article
                                            </div>
                                        </div>
                                        
                                        {/* Content Area */}
                                        <div className="p-3 sm:p-5 flex flex-col flex-1 bg-white">
                                            <div className="min-h-[2.5rem] sm:min-h-[3.5rem]">
                                                <h3 className="font-black text-xs sm:text-lg text-slate-800 line-clamp-2 mb-1 sm:mb-2 group-hover:text-red-600 transition-colors leading-tight">
                                                    {blog.title}
                                                </h3>
                                            </div>
                                            
                                            <div className="hidden sm:block flex-1 min-h-[4.5rem]">
                                                <p className="text-sm font-bold text-slate-500 line-clamp-3 mb-4">
                                                    {blog.excerpt || ''}
                                                </p>
                                            </div>
                                            
                                            {/* Metadata Footer */}
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[9px] sm:text-xs font-bold text-slate-500 pt-2 sm:pt-4 border-t-2 sm:border-t-[3px] border-dashed border-slate-100 mt-auto gap-1 sm:gap-0">
                                                <div className="flex items-center gap-1 sm:gap-1.5 text-slate-700 bg-slate-50 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl border-[2px] border-white shadow-sm w-fit max-w-full overflow-hidden">
                                                    <User className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-slate-800 shrink-0" strokeWidth={3} />
                                                    <span className="truncate">{typeof blog.author === 'string' ? blog.author : blog.author?.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-50 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl border-[2px] border-white shadow-sm w-fit max-w-full overflow-hidden">
                                                    <Calendar className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-slate-600 shrink-0" strokeWidth={3} />
                                                    <span className="truncate">{new Date((blog as any).created_at || blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    )
}

AdultPageClient.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default AdultPageClient
