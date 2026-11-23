"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Head, Link } from "@inertiajs/react"
import { motion } from "motion/react"
import { ArrowLeft } from "lucide-react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import { useSettings } from "@/lib/settings-context"
import {
    ArticleImageLightbox,
    ArticleItem,
    ArticlePagerFooter,
    ArticleReaderCard,
    SMOOTH_EASE,
} from "@/Components/Adult/ArticleReader"

interface BlogArticleProps {
    blog: ArticleItem
    allBlogs?: ArticleItem[]
}

const BlogArticleClient = ({ blog, allBlogs }: BlogArticleProps) => {
    const { reduceMotion } = useSettings()
    const articles = allBlogs && allBlogs.length > 0 ? allBlogs : [blog]
    const initialIndex = articles.findIndex((b) => String(b.id) === String(blog.id))

    const [activeIndex, setActiveIndex] = useState(
        initialIndex !== -1 ? initialIndex : 0
    )
    const [direction, setDirection] = useState(0)
    const [lightboxImage, setLightboxImage] = useState<{
        url: string
        title: string
    } | null>(null)

    const currentBlog = articles[activeIndex] || blog
    const prevArticle = activeIndex > 0 ? articles[activeIndex - 1] : null
    const nextArticle =
        activeIndex < articles.length - 1 ? articles[activeIndex + 1] : null

    const navigateToIndex = useCallback(
        (index: number, navDirection: number) => {
            if (index < 0 || index >= articles.length || index === activeIndex) {
                return
            }
            setDirection(navDirection)
            setActiveIndex(index)
            const target = articles[index]
            if (target?.id) {
                window.history.replaceState(
                    window.history.state,
                    "",
                    `/adult/blog/${target.id}`
                )
            }
            window.scrollTo({
                top: 0,
                behavior: reduceMotion ? "auto" : "smooth",
            })
        },
        [activeIndex, articles, reduceMotion]
    )

    useEffect(() => {
        if (lightboxImage) return
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft" && activeIndex > 0) {
                navigateToIndex(activeIndex - 1, -1)
            } else if (e.key === "ArrowRight" && activeIndex < articles.length - 1) {
                navigateToIndex(activeIndex + 1, 1)
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [activeIndex, articles.length, lightboxImage, navigateToIndex])

    return (
        <div className="min-h-screen selection:bg-orange-500 selection:text-white pb-20 sm:pb-28 relative overflow-x-hidden">
            <Head title={`${currentBlog.title} - SafeScape`} />

            {/* Fixed Background Image */}
            <div
                className="fixed top-0 left-0 w-full -z-10 pointer-events-none"
                style={{ height: "100vh", minHeight: "100lvh" }}
            >
                <img
                    src="/web-background-image.webp"
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ objectPosition: "center 80%" }}
                />
            </div>

            {/* Subtle Frosting Overlay */}
            <div className="fixed inset-0 bg-slate-50/88 dark:bg-slate-950/88 -z-10 pointer-events-none transition-colors duration-500" />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-3 relative z-10">
                {/* Clean Top Bar */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: reduceMotion ? 0 : 0.3,
                        ease: SMOOTH_EASE,
                    }}
                    className="flex items-center justify-between gap-3 mb-3"
                >
                    <Link
                        href="/adult#articles-section"
                        className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-200/90 dark:border-slate-700 hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400 shadow-sm transition-colors"
                    >
                        <ArrowLeft
                            className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform"
                            strokeWidth={2.5}
                        />
                        Back to Articles
                    </Link>

                    {articles.length > 1 && (
                        <div className="flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/90 dark:border-slate-700 shadow-sm">
                            <span className="text-[11px] sm:text-xs font-extrabold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                                <span className="text-orange-600 dark:text-orange-400">
                                    {activeIndex + 1}
                                </span>{" "}
                                / {articles.length}
                            </span>
                        </div>
                    )}
                </motion.div>

                {/* Main Article Content Card */}
                <motion.div
                    initial={{ opacity: 0, y: 14, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                        duration: reduceMotion ? 0 : 0.38,
                        ease: SMOOTH_EASE,
                    }}
                >
                    <ArticleReaderCard
                        article={currentBlog}
                        onExpandImage={(url, title) =>
                            setLightboxImage({ url, title })
                        }
                        direction={direction}
                    />
                </motion.div>

                {/* Clean Previous / Next Article Navigation */}
                <ArticlePagerFooter
                    prevArticle={prevArticle}
                    nextArticle={nextArticle}
                    onSelect={navigateToIndex}
                    activeIndex={activeIndex}
                />
            </main>

            <ArticleImageLightbox
                image={lightboxImage}
                onClose={() => setLightboxImage(null)}
            />
        </div>
    )
}

BlogArticleClient.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
)

export default BlogArticleClient
