"use client"

import React, { useState, useEffect, useRef } from "react"
import ReactDOM from "react-dom"
import { motion, AnimatePresence } from "motion/react"
import ReactMarkdown from "react-markdown"
import DOMPurify from "dompurify"
import {
    ArrowLeft,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Maximize2,
    ShieldAlert,
    User,
    X,
    ZoomIn,
    ZoomOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSettings } from "@/lib/settings-context"

export interface ArticleItem {
    id: number | string
    title: string
    content?: string | null
    excerpt?: string | null
    imageUrl?: string | null
    category?: string | null
    author?: { name: string } | string | null
    created_at?: string | null
    createdAt?: string | null
}

export const ARTICLE_MORPH_SPRING = {
    type: "spring" as const,
    stiffness: 310,
    damping: 32,
    mass: 0.9,
}

export const SMOOTH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

function formatCategoryLabel(category?: string | null): string {
    if (!category || category.toLowerCase() === "adult") {
        return "Fire Safety Education"
    }
    return category
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
}

function getReadingTimeMinutes(text: string): number | null {
    const plain = text
        .replace(/<[^>]+>/g, " ")
        .replace(/[#*_`>\-\[\]()]/g, " ")
        .trim()
    if (!plain) return null
    const words = plain.split(/\s+/).filter(Boolean).length
    if (words < 45) return null
    return Math.max(1, Math.ceil(words / 200))
}

function formatPublishedDate(dateString?: string | null): string {
    if (!dateString) return "Recently published"
    const parsed = new Date(dateString)
    if (Number.isNaN(parsed.getTime())) return "Recently published"
    return parsed.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

function getAuthorName(author?: ArticleItem["author"]): string {
    if (!author) return "BFP Admin"
    if (typeof author === "string") return author.trim() || "BFP Admin"
    return author.name?.trim() || "BFP Admin"
}

interface ArticleImageLightboxProps {
    image: { url: string; title: string } | null
    onClose: () => void
}

export const ArticleImageLightbox: React.FC<ArticleImageLightboxProps> = ({
    image,
    onClose,
}) => {
    const { reduceMotion } = useSettings()
    const [isZoomed, setIsZoomed] = useState(false)

    useEffect(() => {
        if (!image) {
            setIsZoomed(false)
            return
        }
        document.documentElement.classList.add("lightbox-open")

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.stopPropagation()
                onClose()
            }
        }
        window.addEventListener("keydown", handleKeyDown, true)
        return () => {
            document.documentElement.classList.remove("lightbox-open")
            window.removeEventListener("keydown", handleKeyDown, true)
        }
    }, [image, onClose])

    if (typeof window === "undefined") return null

    return ReactDOM.createPortal(
        <AnimatePresence>
            {image && (
                <motion.div
                    key="article-image-lightbox"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
                    className="fixed inset-0 z-[100050] bg-slate-950/92 backdrop-blur-md flex flex-col"
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-label={image.title}
                >
                    {/* Minimal Top Controls */}
                    <div
                        className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-xs sm:text-sm font-bold text-white/90 truncate max-w-[65vw]">
                            {image.title}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsZoomed((prev) => !prev)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-colors cursor-pointer"
                                aria-label={isZoomed ? "Fit to screen" : "Zoom in"}
                            >
                                {isZoomed ? (
                                    <>
                                        <ZoomOut className="h-4 w-4" strokeWidth={2.2} />
                                        <span className="hidden sm:inline">Fit</span>
                                    </>
                                ) : (
                                    <>
                                        <ZoomIn className="h-4 w-4" strokeWidth={2.2} />
                                        <span className="hidden sm:inline">Zoom</span>
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center justify-center transition-colors cursor-pointer"
                                aria-label="Close image preview"
                            >
                                <X className="h-4.5 w-4.5" strokeWidth={2.4} />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Image Viewport */}
                    <div className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8">
                        <motion.img
                            src={image.url}
                            alt={image.title}
                            initial={{ opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: reduceMotion ? 0 : 0.28, ease: SMOOTH_EASE }}
                            onClick={(e) => {
                                e.stopPropagation()
                                setIsZoomed((prev) => !prev)
                            }}
                            className={cn(
                                "rounded-xl shadow-2xl select-none transition-all duration-300 ease-out",
                                isZoomed
                                    ? "w-[min(1400px,155vw)] max-w-none h-auto cursor-zoom-out my-auto"
                                    : "max-w-[92vw] max-h-[82vh] w-auto h-auto object-contain cursor-zoom-in"
                            )}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    )
}

interface ArticleBodyContentProps {
    content?: string | null
    excerpt?: string | null
}

const ArticleBodyContent: React.FC<ArticleBodyContentProps> = ({
    content,
    excerpt,
}) => {
    const rawContent = (content || "").trim()
    const rawExcerpt = (excerpt || "").trim()
    const effectiveBody = rawContent || rawExcerpt

    const hasDistinctExcerpt = Boolean(
        rawExcerpt &&
            rawContent &&
            rawExcerpt.toLowerCase() !== rawContent.toLowerCase() &&
            !rawContent.toLowerCase().includes(rawExcerpt.toLowerCase())
    )

    const isHtml = /<[a-z][\s\S]*>/i.test(effectiveBody)

    if (!effectiveBody && !hasDistinctExcerpt) {
        return null
    }

    return (
        <div className="space-y-5">
            {hasDistinctExcerpt && (
                <p className="border-l-[3px] border-orange-500/75 pl-4 text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
                    {rawExcerpt}
                </p>
            )}

            {effectiveBody &&
                (isHtml ? (
                    <div
                        className={cn(
                            "prose prose-slate dark:prose-invert max-w-none",
                            "prose-headings:font-black prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:tracking-tight",
                            "prose-h2:text-lg sm:prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3",
                            "prose-h3:text-base sm:prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-2",
                            "prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:text-sm sm:prose-p:text-[15.5px] prose-p:leading-[1.8] prose-p:font-medium prose-p:my-3.5",
                            "prose-strong:font-extrabold prose-strong:text-slate-900 dark:prose-strong:text-white",
                            "prose-a:text-orange-600 dark:prose-a:text-orange-400 prose-a:font-bold prose-a:no-underline hover:prose-a:underline",
                            "prose-ul:my-4 prose-ol:my-4 prose-li:text-slate-600 dark:prose-li:text-slate-300 prose-li:text-sm sm:prose-li:text-[15px] prose-li:leading-[1.75] prose-li:font-medium prose-li:marker:text-orange-500",
                            "prose-blockquote:border-l-orange-500/70 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-800/50 prose-blockquote:rounded-r-xl prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic",
                            "prose-img:rounded-xl prose-img:shadow-sm"
                        )}
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(effectiveBody),
                        }}
                    />
                ) : (
                    <div className="space-y-4 text-slate-600 dark:text-slate-300 text-sm sm:text-[15.5px] leading-[1.8] font-medium">
                        <ReactMarkdown
                            components={{
                                h1: ({ children }) => (
                                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight pt-3 pb-1">
                                        {children}
                                    </h2>
                                ),
                                h2: ({ children }) => (
                                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight pt-3 pb-1">
                                        {children}
                                    </h2>
                                ),
                                h3: ({ children }) => (
                                    <h3 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight pt-2">
                                        {children}
                                    </h3>
                                ),
                                p: ({ children }) => (
                                    <p className="text-slate-600 dark:text-slate-300 leading-[1.8]">
                                        {children}
                                    </p>
                                ),
                                ul: ({ children }) => (
                                    <ul className="space-y-2 pl-5 list-disc marker:text-orange-500">
                                        {children}
                                    </ul>
                                ),
                                ol: ({ children }) => (
                                    <ol className="space-y-2 pl-5 list-decimal marker:text-orange-500 marker:font-bold">
                                        {children}
                                    </ol>
                                ),
                                li: ({ children }) => (
                                    <li className="pl-1 leading-[1.75]">{children}</li>
                                ),
                                strong: ({ children }) => (
                                    <strong className="font-extrabold text-slate-900 dark:text-white">
                                        {children}
                                    </strong>
                                ),
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-[3px] border-orange-500/70 bg-slate-50 dark:bg-slate-800/60 rounded-r-xl py-3 px-4 text-slate-700 dark:text-slate-200">
                                        {children}
                                    </blockquote>
                                ),
                                a: ({ href, children }) => (
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-orange-600 dark:text-orange-400 font-bold hover:underline"
                                    >
                                        {children}
                                    </a>
                                ),
                                hr: () => (
                                    <hr className="border-slate-200 dark:border-slate-800 my-5" />
                                ),
                            }}
                        >
                            {effectiveBody}
                        </ReactMarkdown>
                    </div>
                ))}
        </div>
    )
}

interface ArticleReaderCardProps {
    article: ArticleItem
    onExpandImage: (url: string, title: string) => void
    cardLayoutId?: string
    imageLayoutId?: string
    direction?: number
}

export const ArticleReaderCard: React.FC<ArticleReaderCardProps> = ({
    article,
    onExpandImage,
    cardLayoutId,
    imageLayoutId,
    direction = 0,
}) => {
    const { reduceMotion } = useSettings()
    const authorName = getAuthorName(article.author)
    const publishedDate = formatPublishedDate(article.created_at || article.createdAt)
    const categoryLabel = formatCategoryLabel(article.category)
    const readMinutes = getReadingTimeMinutes(
        `${article.excerpt || ""} ${article.content || ""}`
    )
    const morphTransition = reduceMotion ? { duration: 0 } : ARTICLE_MORPH_SPRING

    return (
        <motion.article
            layoutId={cardLayoutId}
            transition={morphTransition}
            className="bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200/90 dark:border-slate-800 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.16)] dark:shadow-[0_24px_70px_-15px_rgba(0,0,0,0.6)] overflow-hidden"
        >
            {/* Accent Top Rule */}
            <div className="h-[3px] w-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-400" />

            <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.div
                    key={article.id}
                    custom={direction}
                    initial={
                        reduceMotion
                            ? { opacity: 1 }
                            : {
                                  opacity: 0,
                                  x: direction === 0 ? 0 : direction > 0 ? 24 : -24,
                                  y: direction === 0 ? 8 : 0,
                              }
                    }
                    animate={{
                        opacity: 1,
                        x: 0,
                        y: 0,
                        transition: {
                            duration: reduceMotion ? 0 : 0.28,
                            ease: SMOOTH_EASE,
                        },
                    }}
                    exit={{
                        opacity: 0,
                        x: reduceMotion
                            ? 0
                            : direction === 0
                              ? 0
                              : direction > 0
                                ? -20
                                : 20,
                        transition: {
                            duration: reduceMotion ? 0 : 0.16,
                            ease: [0.4, 0, 1, 1],
                        },
                    }}
                >
                    {/* Editorial Header */}
                    <header className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider border border-orange-500/20">
                                {categoryLabel}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                                {publishedDate}
                            </span>
                            {readMinutes && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                                    {readMinutes} min read
                                </span>
                            )}
                        </div>

                        <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.2] mb-4">
                            {article.title}
                        </h1>

                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0">
                                <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            </div>
                            <div className="min-w-0 leading-tight">
                                <p className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate">
                                    {authorName}
                                </p>
                                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                    Bureau of Fire Protection Guide
                                </p>
                            </div>
                        </div>
                    </header>

                    {/* Hero Visual / Infographic Showcase */}
                    {article.imageUrl && (
                        <div className="px-5 sm:px-8">
                            <motion.div
                                layoutId={imageLayoutId}
                                transition={morphTransition}
                                onClick={() =>
                                    onExpandImage(article.imageUrl!, article.title)
                                }
                                className="relative group rounded-2xl overflow-hidden bg-slate-100/90 dark:bg-slate-950/75 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center cursor-zoom-in"
                            >
                                <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="w-full max-h-[420px] sm:max-h-[520px] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.012]"
                                />
                                <div className="absolute bottom-3 right-3 pointer-events-none">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 text-white text-[11px] font-bold border border-white/15 backdrop-blur-md shadow-md transition-opacity duration-200 opacity-90 group-hover:opacity-100">
                                        <Maximize2
                                            className="h-3 w-3 text-orange-400"
                                            strokeWidth={2.5}
                                        />
                                        Expand image
                                    </span>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Clean Article Content */}
                    <div className="px-5 sm:px-8 py-6 sm:py-7">
                        <ArticleBodyContent
                            content={article.content}
                            excerpt={article.excerpt}
                        />
                    </div>

                    {/* Integrated, Uncluttered Emergency Protocol */}
                    <div className="px-5 sm:px-8 pb-6 sm:pb-8">
                        <div className="rounded-2xl bg-red-50/70 dark:bg-red-950/25 border border-red-200/75 dark:border-red-900/40 px-4 py-3.5 sm:px-5 sm:py-4 flex items-start gap-3.5">
                            <div className="h-9 w-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <ShieldAlert
                                    className="h-4.5 w-4.5 text-red-600 dark:text-red-400"
                                    strokeWidth={2.2}
                                />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-xs sm:text-sm font-black text-red-700 dark:text-red-400 tracking-tight mb-0.5">
                                    Emergency Protocol
                                </h2>
                                <p className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                                    In a fire emergency, evacuate immediately and call{" "}
                                    <strong className="font-extrabold text-red-700 dark:text-red-400">
                                        911
                                    </strong>{" "}
                                    from a safe location. Never risk your safety attempting to fight a spreading fire.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </motion.article>
    )
}

interface ArticlePagerFooterProps {
    prevArticle: ArticleItem | null
    nextArticle: ArticleItem | null
    onSelect: (index: number, direction: number) => void
    activeIndex: number
}

export const ArticlePagerFooter: React.FC<ArticlePagerFooterProps> = ({
    prevArticle,
    nextArticle,
    onSelect,
    activeIndex,
}) => {
    if (!prevArticle && !nextArticle) return null

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            {prevArticle ? (
                <button
                    type="button"
                    onClick={() => onSelect(activeIndex - 1, -1)}
                    className="group text-left p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 hover:border-orange-500/40 shadow-xs hover:shadow-md transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 cursor-pointer flex items-center gap-3"
                >
                    <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        <ChevronLeft
                            className="h-4.5 w-4.5 group-hover:-translate-x-0.5 transition-transform"
                            strokeWidth={2.5}
                        />
                    </div>
                    <div className="min-w-0">
                        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Previous Article
                        </span>
                        <span className="block text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mt-0.5">
                            {prevArticle.title}
                        </span>
                    </div>
                </button>
            ) : (
                <div className="hidden sm:block" />
            )}

            {nextArticle ? (
                <button
                    type="button"
                    onClick={() => onSelect(activeIndex + 1, 1)}
                    className="group text-right p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 hover:border-orange-500/40 shadow-xs hover:shadow-md transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 cursor-pointer flex items-center justify-end gap-3"
                >
                    <div className="min-w-0">
                        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Next Article
                        </span>
                        <span className="block text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mt-0.5">
                            {nextArticle.title}
                        </span>
                    </div>
                    <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        <ChevronRight
                            className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform"
                            strokeWidth={2.5}
                        />
                    </div>
                </button>
            ) : (
                <div className="hidden sm:block" />
            )}
        </div>
    )
}

interface ArticleReaderOverlayProps {
    articles: ArticleItem[]
    activeIndex: number | null
    morphCardId: string | number | null
    direction: number
    onNavigate: (index: number, direction: number) => void
    onClose: () => void
}

export const ArticleReaderOverlay: React.FC<ArticleReaderOverlayProps> = ({
    articles,
    activeIndex,
    morphCardId,
    direction,
    onNavigate,
    onClose,
}) => {
    const { reduceMotion } = useSettings()
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [lightboxImage, setLightboxImage] = useState<{
        url: string
        title: string
    } | null>(null)

    const isOpen = activeIndex !== null && Boolean(articles[activeIndex])
    const currentArticle = isOpen ? articles[activeIndex!] : null
    const prevArticle =
        isOpen && activeIndex! > 0 ? articles[activeIndex! - 1] : null
    const nextArticle =
        isOpen && activeIndex! < articles.length - 1
            ? articles[activeIndex! + 1]
            : null

    // Lock background scroll cleanly while overlay is open
    useEffect(() => {
        if (!isOpen) return
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"

        return () => {
            document.body.style.overflow = prevOverflow
        }
    }, [isOpen])

    // Keyboard support: Escape to close, Left/Right arrows to switch articles
    useEffect(() => {
        if (!isOpen || lightboxImage) return
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            } else if (e.key === "ArrowLeft" && activeIndex! > 0) {
                onNavigate(activeIndex! - 1, -1)
            } else if (e.key === "ArrowRight" && activeIndex! < articles.length - 1) {
                onNavigate(activeIndex! + 1, 1)
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, lightboxImage, activeIndex, articles.length, onNavigate, onClose])

    // Scroll overlay back to top cleanly when switching between articles
    useEffect(() => {
        if (isOpen && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: 0,
                behavior: reduceMotion ? "auto" : "smooth",
            })
        }
    }, [activeIndex, isOpen, reduceMotion])

    const isMorphingCurrent = Boolean(
        currentArticle &&
            morphCardId !== null &&
            String(currentArticle.id) === String(morphCardId)
    )

    if (typeof window === "undefined") return null

    return (
        <>
            {ReactDOM.createPortal(
                <>
                    {/* Backdrop fades independently so layoutId card unmounts cleanly on reverse morph */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                key="article-reader-backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: reduceMotion ? 0 : 0.2,
                                    ease: "easeOut",
                                }}
                                onClick={onClose}
                                className="fixed inset-0 z-[99990] bg-slate-950/60 dark:bg-slate-950/78 backdrop-blur-md pointer-events-auto"
                            />
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {isOpen && currentArticle && (
                            <motion.div
                                key="article-reader-shell"
                                ref={scrollContainerRef}
                                layoutScroll
                                initial={
                                    isMorphingCurrent || reduceMotion
                                        ? false
                                        : { opacity: 0, scale: 0.97, y: 10 }
                                }
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={
                                    isMorphingCurrent || reduceMotion
                                        ? { opacity: 0, transition: { duration: 0 } }
                                        : {
                                              opacity: 0,
                                              scale: 0.96,
                                              y: 12,
                                              transition: {
                                                  duration: 0.2,
                                                  ease: [0.4, 0, 1, 1],
                                              },
                                          }
                                }
                                transition={{
                                    duration: reduceMotion ? 0 : 0.24,
                                    ease: SMOOTH_EASE,
                                }}
                                onClick={onClose}
                                className="fixed inset-0 z-[99991] overflow-y-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10"
                                role="dialog"
                                aria-modal="true"
                                aria-label={currentArticle.title}
                            >
                                <div
                                    className="max-w-4xl mx-auto"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Minimal Top Controls */}
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: reduceMotion ? 0 : 0.24,
                                            ease: SMOOTH_EASE,
                                        }}
                                        className="flex items-center justify-between gap-3 mb-4"
                                    >
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-200/90 dark:border-slate-700 hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400 shadow-md transition-colors cursor-pointer"
                                        >
                                            <ArrowLeft
                                                className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform"
                                                strokeWidth={2.5}
                                            />
                                            Back to Articles
                                        </button>

                                        <div className="flex items-center gap-2">
                                            {articles.length > 1 && (
                                                <div className="flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/90 dark:border-slate-700 shadow-md">
                                                    <span className="text-[11px] sm:text-xs font-extrabold text-slate-500 dark:text-slate-400 tracking-wide uppercase pl-1">
                                                        <span className="text-orange-600 dark:text-orange-400">
                                                            {activeIndex! + 1}
                                                        </span>{" "}
                                                        / {articles.length}
                                                    </span>
                                                    <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700" />
                                                    <div className="flex items-center gap-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                onNavigate(
                                                                    activeIndex! - 1,
                                                                    -1
                                                                )
                                                            }
                                                            disabled={activeIndex === 0}
                                                            aria-label="Previous article"
                                                            className="p-1 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-default"
                                                        >
                                                            <ChevronLeft
                                                                className="h-4 w-4"
                                                                strokeWidth={2.5}
                                                            />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                onNavigate(
                                                                    activeIndex! + 1,
                                                                    1
                                                                )
                                                            }
                                                            disabled={
                                                                activeIndex ===
                                                                articles.length - 1
                                                            }
                                                            aria-label="Next article"
                                                            className="p-1 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-default"
                                                        >
                                                            <ChevronRight
                                                                className="h-4 w-4"
                                                                strokeWidth={2.5}
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={onClose}
                                                aria-label="Close article"
                                                className="h-9 w-9 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/90 dark:border-slate-700 shadow-md flex items-center justify-center transition-colors cursor-pointer"
                                            >
                                                <X
                                                    className="h-4.5 w-4.5"
                                                    strokeWidth={2.5}
                                                />
                                            </button>
                                        </div>
                                    </motion.div>

                                    {/* Editorial Card */}
                                    <ArticleReaderCard
                                        article={currentArticle}
                                        onExpandImage={(url, title) =>
                                            setLightboxImage({ url, title })
                                        }
                                        cardLayoutId={
                                            isMorphingCurrent
                                                ? `article-card-${currentArticle.id}`
                                                : undefined
                                        }
                                        imageLayoutId={
                                            isMorphingCurrent
                                                ? `article-image-${currentArticle.id}`
                                                : undefined
                                        }
                                        direction={direction}
                                    />

                                    {/* Previous / Next Article Strip */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: reduceMotion ? 0 : 0.24,
                                            delay: reduceMotion ? 0 : 0.08,
                                            ease: SMOOTH_EASE,
                                        }}
                                    >
                                        <ArticlePagerFooter
                                            prevArticle={prevArticle}
                                            nextArticle={nextArticle}
                                            onSelect={onNavigate}
                                            activeIndex={activeIndex!}
                                        />
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>,
                document.body
            )}

            <ArticleImageLightbox
                image={lightboxImage}
                onClose={() => setLightboxImage(null)}
            />
        </>
    )
}
