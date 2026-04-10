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
                <Alert className="mb-6 border border-accent rounded-xl bg-white text-slate-800 shadow-sm">
                    <Flame className="h-4 w-4 text-accent" />
                    <AlertDescription className="text-slate-700 font-medium">
                        Learn essential fire safety practices to protect your home and family.
                    </AlertDescription>
                </Alert>

                {/* Feature Cards - Compact on mobile */}
                <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 mb-6 sm:mb-8">
                    <SpotlightCard spotlightColor="rgba(245, 158, 11, 0.15)">
                        <Card
                            className="relative overflow-hidden hover:shadow-md transition-all cursor-pointer border-y border-r border-slate-200 border-l-[4px] border-l-accent rounded-2xl bg-white h-full group"
                            onClick={() => document.getElementById('articles-section')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-center z-0 opacity-20 group-hover:opacity-30 transition-opacity"
                                style={{ backgroundImage: "url('/Articles Modal.png')" }}
                            />
                            <CardContent className="relative z-10 p-4 sm:p-6 bg-background/60 backdrop-blur-[2px]">
                                <div className="flex items-start gap-3">
                                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-accent flex-shrink-0 mt-0.5 drop-shadow-md" />
                                    <div className="min-w-0 flex-1 drop-shadow-sm">
                                        <CardTitle className="text-lg sm:text-2xl mb-1 sm:mb-2 text-foreground font-extrabold">Fire Safety Articles</CardTitle>
                                        <p className="text-xs sm:text-sm text-foreground/90 font-medium mb-2 sm:mb-4 line-clamp-2">
                                            Read comprehensive articles on home fire safety, prevention tips, and emergency preparedness.
                                        </p>
                                        <p className="text-xs sm:text-sm font-bold text-accent">{blogs.length} articles available</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </SpotlightCard>

                    <SpotlightCard spotlightColor="rgba(239, 68, 68, 0.15)">
                        <Card className="relative overflow-hidden hover:shadow-md transition-all cursor-pointer border-y border-r border-slate-200 border-l-[4px] border-l-red-500 rounded-2xl bg-white h-full group">
                            <div
                                className="absolute inset-0 bg-cover bg-center z-0 opacity-20 group-hover:opacity-30 transition-opacity"
                                style={{ backgroundImage: "url('/EDITH Modal.png')" }}
                            />
                            <CardContent className="relative z-10 p-4 sm:p-6 bg-background/60 backdrop-blur-[2px]">
                                <div className="flex items-start gap-3">
                                    <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 flex-shrink-0 mt-0.5 drop-shadow-md" />
                                    <div className="min-w-0 flex-1 drop-shadow-sm">
                                        <CardTitle className="text-lg sm:text-2xl mb-1 sm:mb-2 text-foreground font-extrabold">Exit Drill In The Home (EDITH)</CardTitle>
                                        <p className="text-xs sm:text-sm text-foreground/90 font-medium mb-2 sm:mb-4 line-clamp-2">
                                            Interactive tool to visualize how fire spreads in different environments.
                                        </p>
                                        <Link href="/adult/simulation">
                                            <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto mt-2 font-bold rounded-full shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all">
                                                Launch Simulator
                                                <ArrowRight className="h-4 w-4 ml-2" strokeWidth={3} />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </SpotlightCard>
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
                        <Card>
                            <CardContent className="py-12 text-center">
                                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    {searchQuery ? "No articles found matching your search." : "No articles available yet."}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBlogs.map((blog) => (
                                <Link key={blog.id} href={`/adult/blog/${blog.id}`} className="outline-none block w-full group h-full">
                                    <div className="flex flex-col h-full bg-white rounded-2xl border-2 border-b-[6px] border-slate-800 overflow-hidden relative transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_0_#1e293b] active:translate-y-1 active:border-b-[2px] active:shadow-none">
                                        {/* Image Header */}
                                        <div className="h-48 shrink-0 w-full border-b-2 border-slate-800 relative overflow-hidden bg-slate-100">
                                            <img
                                                src={blog.imageUrl || "/placeholder.svg?height=300&width=400"}
                                                alt={blog.title}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            {/* Tag / Badge */}
                                            <div className="absolute top-3 left-3 bg-yellow-400 text-slate-900 text-xs font-black px-3 py-1 rounded-full border-2 border-slate-800 shadow-[0_2px_0_#1e293b] z-10">
                                                Article
                                            </div>
                                        </div>
                                        
                                        {/* Content Area */}
                                        <div className="p-5 flex flex-col flex-1 bg-white">
                                            <h3 className="font-black text-lg text-slate-800 line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">
                                                {blog.title}
                                            </h3>
                                            
                                            <p className="text-sm font-bold text-slate-500 line-clamp-3 mb-4 flex-1">
                                                {blog.excerpt || ''}
                                            </p>
                                            
                                            {/* Metadata Footer */}
                                            <div className="flex items-center justify-between text-xs font-black text-slate-500 pt-4 border-t-2 border-dashed border-slate-200 mt-auto">
                                                <div className="flex items-center gap-1.5 text-slate-700">
                                                    <User className="h-3.5 w-3.5 text-slate-800" strokeWidth={3} />
                                                    <span>{typeof blog.author === 'string' ? blog.author : blog.author?.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-md border-2 border-slate-200">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-600" strokeWidth={3} />
                                                    <span>{new Date((blog as any).created_at || blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
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
