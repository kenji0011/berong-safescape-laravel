"use client"

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react"
import ReactDOM from "react-dom"
import { motion, AnimatePresence, useMotionValue, animate } from "motion/react"
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

export interface ArticleOriginRect {
    top: number
    left: number
    width: number
    height: number
}

export const SMOOTH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const MORPH_OPEN_SPRING = {
    type: "spring" as const,
    stiffness: 330,
    damping: 32,
    mass: 0.85,
}

const SLIDE_VARIANTS = {
    enter: ({ dir, reduced }: { dir: number; reduced: boolean }) => ({
        opacity: reduced ? 1 : 0,
        x: reduced || dir === 0 ? 0 : dir > 0 ? 52 : -52,
    }),
    center: ({ reduced }: { dir: number; reduced: boolean }) => ({
        opacity: 1,
        x: 0,
        transition: reduced
            ? { duration: 0 }
            : {
                  x: { duration: 0.28, ease: SMOOTH_EASE },
                  opacity: { duration: 0.22, ease: "easeOut" as const },
              },
    }),
    exit: ({ dir, reduced }: { dir: number; reduced: boolean }) => ({
        opacity: reduced ? 1 : 0,
        x: reduced || dir === 0 ? 0 : dir > 0 ? -48 : 48,
        transition: reduced
            ? { duration: 0 }
            : {
                  x: { duration: 0.18, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
                  opacity: { duration: 0.15, ease: "easeIn" as const },
              },
    }),
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
        <div className="space-y-3">
            {hasDistinctExcerpt && (
                <p className="border-l-[3px] border-orange-500/75 pl-3.5 text-[13px] sm:text-[15px] font-semibold text-slate-700 dark:text-slate-200 leading-snug">
                    {rawExcerpt}
                </p>
            )}

            {effectiveBody &&
                (isHtml ? (
                    <div
                        className={cn(
                            "prose prose-slate dark:prose-invert max-w-none",
                            "prose-headings:font-black prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:tracking-tight",
                            "prose-h2:text-base sm:prose-h2:text-lg prose-h2:mt-4 prose-h2:mb-2",
                            "prose-h3:text-sm sm:prose-h3:text-base prose-h3:mt-3.5 prose-h3:mb-1.5",
                            "prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:text-xs sm:prose-p:text-[14.5px] prose-p:leading-[1.68] prose-p:font-medium prose-p:my-2.5",
                            "prose-strong:font-extrabold prose-strong:text-slate-900 dark:prose-strong:text-white",
                            "prose-a:text-orange-600 dark:prose-a:text-orange-400 prose-a:font-bold prose-a:no-underline hover:prose-a:underline",
                            "prose-ul:my-3 prose-ol:my-3 prose-li:text-slate-600 dark:prose-li:text-slate-300 prose-li:text-xs sm:prose-li:text-[14px] prose-li:leading-[1.65] prose-li:font-medium prose-li:marker:text-orange-500",
                            "prose-blockquote:border-l-orange-500/70 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-800/50 prose-blockquote:rounded-r-xl prose-blockquote:py-2 prose-blockquote:px-3.5 prose-blockquote:not-italic",
                            "prose-img:rounded-xl prose-img:shadow-sm"
                        )}
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(effectiveBody),
                        }}
                    />
                ) : (
                    <div className="space-y-2.5 text-slate-600 dark:text-slate-300 text-xs sm:text-[14.5px] leading-[1.68] font-medium">
                        <ReactMarkdown
                            components={{
                                h1: ({ children }) => (
                                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight pt-2 pb-0.5">
                                        {children}
                                    </h2>
                                ),
                                h2: ({ children }) => (
                                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight pt-2 pb-0.5">
                                        {children}
                                    </h2>
                                ),
                                h3: ({ children }) => (
                                    <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight pt-1.5">
                                        {children}
                                    </h3>
                                ),
                                p: ({ children }) => (
                                    <p className="text-slate-600 dark:text-slate-300 leading-[1.68]">
                                        {children}
                                    </p>
                                ),
                                ul: ({ children }) => (
                                    <ul className="space-y-1.5 pl-5 list-disc marker:text-orange-500">
                                        {children}
                                    </ul>
                                ),
                                ol: ({ children }) => (
                                    <ol className="space-y-1.5 pl-5 list-decimal marker:text-orange-500 marker:font-bold">
                                        {children}
                                    </ol>
                                ),
                                li: ({ children }) => (
                                    <li className="pl-1 leading-[1.65]">{children}</li>
                                ),
                                strong: ({ children }) => (
                                    <strong className="font-extrabold text-slate-900 dark:text-white">
                                        {children}
                                    </strong>
                                ),
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-[3px] border-orange-500/70 bg-slate-50 dark:bg-slate-800/60 rounded-r-xl py-2.5 px-3.5 text-slate-700 dark:text-slate-200">
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
                                    <hr className="border-slate-200 dark:border-slate-800 my-4" />
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
    direction?: number
}

export const ArticleReaderCard: React.FC<ArticleReaderCardProps> = ({
    article,
    onExpandImage,
    direction = 0,
}) => {
    const { reduceMotion } = useSettings()
    const publishedDate = formatPublishedDate(article.created_at || article.createdAt)
    const readMinutes = getReadingTimeMinutes(
        `${article.excerpt || ""} ${article.content || ""}`
    )
    const slideCustom = { dir: direction, reduced: reduceMotion }

    return (
        <article className="bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[1.75rem] border border-slate-200/90 dark:border-slate-800 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.16)] dark:shadow-[0_24px_70px_-15px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Directional Slide Transition Between Articles */}
            <AnimatePresence mode="wait" initial={false} custom={slideCustom}>
                <motion.div
                    key={article.id}
                    custom={slideCustom}
                    variants={SLIDE_VARIANTS}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="will-change-transform"
                >
                    {/* Streamlined Compact Header */}
                    <header className="px-5 sm:px-7 pt-4 sm:pt-5 pb-3 sm:pb-3.5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1.5 sm:gap-4">
                        <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                            {article.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 shrink-0 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                                {publishedDate}
                            </span>
                            {readMinutes && (
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                                    {readMinutes} min read
                                </span>
                            )}
                        </div>
                    </header>

                    {/* Hero Visual / Infographic Showcase (Sized to keep full article visible on desktop) */}
                    {article.imageUrl && (
                        <div className="px-5 sm:px-7">
                            <div
                                onClick={() =>
                                    onExpandImage(article.imageUrl!, article.title)
                                }
                                className="relative group rounded-2xl overflow-hidden bg-slate-100/90 dark:bg-slate-950/75 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center cursor-zoom-in"
                            >
                                <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="w-full max-h-[300px] sm:max-h-[min(43vh,380px)] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.012]"
                                />
                                <div className="absolute bottom-2.5 right-2.5 pointer-events-none">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 text-white text-[11px] font-bold border border-white/15 backdrop-blur-md shadow-md transition-opacity duration-200 opacity-90 group-hover:opacity-100">
                                        <Maximize2
                                            className="h-3 w-3 text-orange-400"
                                            strokeWidth={2.5}
                                        />
                                        Expand image
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Clean Article Content */}
                    <div className="px-5 sm:px-7 py-3.5 sm:py-4.5">
                        <ArticleBodyContent
                            content={article.content}
                            excerpt={article.excerpt}
                        />
                    </div>

                    {/* Integrated Emergency Protocol */}
                    <div className="px-5 sm:px-7 pb-4 sm:pb-5">
                        <div className="rounded-xl sm:rounded-2xl bg-red-50/75 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/45 px-4 py-3 sm:px-5 sm:py-3.5 flex items-start sm:items-center gap-3.5">
                            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-red-500/12 border border-red-500/25 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                                <ShieldAlert
                                    className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-red-600 dark:text-red-400"
                                    strokeWidth={2.2}
                                />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-sm sm:text-base font-black text-red-700 dark:text-red-400 tracking-tight leading-snug">
                                    Emergency Protocol
                                </h2>
                                <p className="text-xs sm:text-[14.5px] font-medium text-slate-700 dark:text-slate-200 leading-relaxed mt-0.5">
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
        </article>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
            {prevArticle ? (
                <button
                    type="button"
                    onClick={() => onSelect(activeIndex - 1, -1)}
                    className="group text-left px-3.5 py-2.5 sm:py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 hover:border-orange-500/40 shadow-xs hover:shadow-md transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 cursor-pointer flex items-center gap-3"
                >
                    <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        <ChevronLeft
                            className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform"
                            strokeWidth={2.5}
                        />
                    </div>
                    <div className="min-w-0">
                        <span className="block text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Previous Article
                        </span>
                        <span className="block text-xs sm:text-[13px] font-extrabold text-slate-800 dark:text-slate-100 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mt-0.5">
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
                    className="group text-right px-3.5 py-2.5 sm:py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 hover:border-orange-500/40 shadow-xs hover:shadow-md transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 cursor-pointer flex items-center justify-end gap-3"
                >
                    <div className="min-w-0">
                        <span className="block text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Next Article
                        </span>
                        <span className="block text-xs sm:text-[13px] font-extrabold text-slate-800 dark:text-slate-100 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mt-0.5">
                            {nextArticle.title}
                        </span>
                    </div>
                    <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        <ChevronRight
                            className="h-4 w-4 group-hover:translate-x-0.5 transition-transform"
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
    originRect: ArticleOriginRect | null
    direction: number
    onNavigate: (index: number, direction: number) => void
    onClose: () => void
}

export const ArticleReaderOverlay: React.FC<ArticleReaderOverlayProps> = ({
    articles,
    activeIndex,
    originRect,
    direction,
    onNavigate,
    onClose,
}) => {
    const { reduceMotion } = useSettings()
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const cardContainerRef = useRef<HTMLDivElement>(null)
    const isClosingRef = useRef(false)
    const activeControlsRef = useRef<Array<{ stop: () => void }>>([])
    const [isClosing, setIsClosing] = useState(false)
    const [lightboxImage, setLightboxImage] = useState<{
        url: string
        title: string
    } | null>(null)

    // GPU-composited FLIP MotionValues (zero layoutId distortion, zero z-index trapping)
    const cardX = useMotionValue(0)
    const cardY = useMotionValue(0)
    const cardScale = useMotionValue(1)
    const cardOpacity = useMotionValue(1)
    const backdropOpacity = useMotionValue(0)
    const chromeOpacity = useMotionValue(0)
    const chromeY = useMotionValue(-8)

    const isOpen = activeIndex !== null && Boolean(articles[activeIndex])
    const currentArticle = isOpen ? articles[activeIndex!] : null
    const prevArticle =
        isOpen && activeIndex! > 0 ? articles[activeIndex! - 1] : null
    const nextArticle =
        isOpen && activeIndex! < articles.length - 1
            ? articles[activeIndex! + 1]
            : null

    const stopActiveAnimations = useCallback(() => {
        activeControlsRef.current.forEach((ctrl) => ctrl.stop())
        activeControlsRef.current = []
    }, [])

    // Run true GPU FLIP morph from clicked preview card rect ONLY on initial open
    useLayoutEffect(() => {
        if (!isOpen) {
            isClosingRef.current = false
            setIsClosing(false)
            return
        }

        isClosingRef.current = false
        setIsClosing(false)
        stopActiveAnimations()

        if (reduceMotion) {
            cardX.jump(0)
            cardY.jump(0)
            cardScale.jump(1)
            cardOpacity.jump(1)
            backdropOpacity.jump(1)
            chromeOpacity.jump(1)
            chromeY.jump(0)
            return
        }

        const cardEl = cardContainerRef.current
        if (cardEl && originRect) {
            // Reset transform before measuring true centered resting rect
            cardX.jump(0)
            cardY.jump(0)
            cardScale.jump(1)
            const targetRect = cardEl.getBoundingClientRect()

            if (targetRect.width > 0 && targetRect.height > 0) {
                const dx =
                    originRect.left +
                    originRect.width / 2 -
                    (targetRect.left + targetRect.width / 2)
                const dy =
                    originRect.top +
                    originRect.height / 2 -
                    (targetRect.top + targetRect.height / 2)
                const startScale = Math.max(
                    0.35,
                    Math.min(0.92, originRect.width / targetRect.width)
                )

                cardX.jump(dx)
                cardY.jump(dy)
                cardScale.jump(startScale)
                cardOpacity.jump(0.35)
            } else {
                cardY.jump(24)
                cardScale.jump(0.94)
                cardOpacity.jump(0)
            }
        } else {
            cardX.jump(0)
            cardY.jump(24)
            cardScale.jump(0.94)
            cardOpacity.jump(0)
        }

        backdropOpacity.jump(0)
        chromeOpacity.jump(0)
        chromeY.jump(-8)

        activeControlsRef.current = [
            animate(backdropOpacity, 1, { duration: 0.26, ease: "easeOut" }),
            animate(cardX, 0, MORPH_OPEN_SPRING),
            animate(cardY, 0, MORPH_OPEN_SPRING),
            animate(cardScale, 1, MORPH_OPEN_SPRING),
            animate(cardOpacity, 1, { duration: 0.22, ease: "easeOut" }),
            animate(chromeOpacity, 1, {
                duration: 0.24,
                delay: 0.08,
                ease: "easeOut",
            }),
            animate(chromeY, 0, {
                duration: 0.26,
                delay: 0.06,
                ease: SMOOTH_EASE,
            }),
        ]

        return () => {
            stopActiveAnimations()
        }
        // Only run when overlay opens (not when switching between articles via Next/Prev!)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, originRect, reduceMotion])

    // Smooth reverse FLIP morph back to the currently viewed article's preview card on close
    const triggerClose = useCallback(() => {
        if (isClosingRef.current || !isOpen || !currentArticle) return

        if (reduceMotion) {
            onClose()
            return
        }

        isClosingRef.current = true
        setIsClosing(true)
        stopActiveAnimations()

        const cardEl = cardContainerRef.current
        const destEl = document.getElementById(`article-card-${currentArticle.id}`)
        const currentRect = cardEl?.getBoundingClientRect()
        const destRect = destEl?.getBoundingClientRect()

        const isDestVisible = Boolean(
            currentRect &&
                destRect &&
                destRect.width > 0 &&
                destRect.bottom > 24 &&
                destRect.top < window.innerHeight - 24
        )

        const closeEase: [number, number, number, number] = [0.4, 0, 0.2, 1]
        const animations: Array<ReturnType<typeof animate>> = [
            animate(backdropOpacity, 0, { duration: 0.24, ease: "easeInOut" }),
            animate(chromeOpacity, 0, { duration: 0.14, ease: "easeIn" }),
            animate(chromeY, -6, { duration: 0.16, ease: "easeIn" }),
        ]

        if (isDestVisible && currentRect && destRect) {
            const dx =
                destRect.left +
                destRect.width / 2 -
                (currentRect.left + currentRect.width / 2)
            const dy =
                destRect.top +
                destRect.height / 2 -
                (currentRect.top + currentRect.height / 2)
            const endScale = Math.max(
                0.34,
                Math.min(0.92, destRect.width / currentRect.width)
            )

            animations.push(
                animate(cardX, dx, { duration: 0.28, ease: closeEase }),
                animate(cardY, dy, { duration: 0.28, ease: closeEase }),
                animate(cardScale, endScale, { duration: 0.28, ease: closeEase }),
                animate(cardOpacity, 0, {
                    duration: 0.18,
                    delay: 0.09,
                    ease: "easeIn",
                })
            )
        } else {
            animations.push(
                animate(cardY, 18, { duration: 0.22, ease: [0.4, 0, 1, 1] }),
                animate(cardScale, 0.94, { duration: 0.22, ease: [0.4, 0, 1, 1] }),
                animate(cardOpacity, 0, { duration: 0.2, ease: "easeIn" })
            )
        }

        activeControlsRef.current = animations

        Promise.all(animations.map((a) => a.finished)).finally(() => {
            if (isClosingRef.current) {
                isClosingRef.current = false
                setIsClosing(false)
                onClose()
            }
        })
    }, [
        isOpen,
        currentArticle,
        reduceMotion,
        onClose,
        stopActiveAnimations,
        backdropOpacity,
        chromeOpacity,
        chromeY,
        cardX,
        cardY,
        cardScale,
        cardOpacity,
    ])

    // Lock background scroll and flag article-open cleanly while overlay is open
    useLayoutEffect(() => {
        if (!isOpen) return
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"
        document.documentElement.classList.add("article-open")

        return () => {
            document.body.style.overflow = prevOverflow
            document.documentElement.classList.remove("article-open")
        }
    }, [isOpen])

    // Keyboard support: Escape to close, Left/Right arrows to slide between articles
    useEffect(() => {
        if (!isOpen || lightboxImage || isClosing) return
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                triggerClose()
            } else if (e.key === "ArrowLeft" && activeIndex! > 0) {
                onNavigate(activeIndex! - 1, -1)
            } else if (e.key === "ArrowRight" && activeIndex! < articles.length - 1) {
                onNavigate(activeIndex! + 1, 1)
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [
        isOpen,
        lightboxImage,
        isClosing,
        activeIndex,
        articles.length,
        onNavigate,
        triggerClose,
    ])

    // Scroll overlay cleanly back to top when switching articles
    useEffect(() => {
        if (isOpen && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: 0,
                behavior: reduceMotion ? "auto" : "smooth",
            })
        }
    }, [activeIndex, isOpen, reduceMotion])

    if (typeof window === "undefined" || !isOpen || !currentArticle) {
        return (
            <ArticleImageLightbox
                image={lightboxImage}
                onClose={() => setLightboxImage(null)}
            />
        )
    }

    return (
        <>
            {ReactDOM.createPortal(
                <div
                    className={cn(
                        "fixed inset-0 z-[99990]",
                        isClosing && "pointer-events-none"
                    )}
                    role="dialog"
                    aria-modal="true"
                    aria-label={currentArticle.title}
                >
                    {/* Smooth Frosted Backdrop */}
                    <motion.div
                        style={{ opacity: backdropOpacity }}
                        onClick={triggerClose}
                        className="fixed inset-0 bg-slate-950/62 dark:bg-slate-950/80 backdrop-blur-md"
                    />

                    {/* Scrollable Reader Layer */}
                    <div
                        ref={scrollContainerRef}
                        onClick={triggerClose}
                        className="fixed inset-0 overflow-y-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5"
                    >
                        <div
                            className="max-w-4xl mx-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Minimal Top Controls */}
                            <motion.div
                                style={{ opacity: chromeOpacity, y: chromeY }}
                                className="flex items-center justify-between gap-3 mb-2.5 sm:mb-3"
                            >
                                <button
                                    type="button"
                                    onClick={triggerClose}
                                    className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-200/90 dark:border-slate-700 hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400 shadow-md transition-colors cursor-pointer"
                                >
                                    <ArrowLeft
                                        className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform"
                                        strokeWidth={2.5}
                                    />
                                    Back to Articles
                                </button>

                                <div className="flex items-center gap-2">
                                    {articles.length > 1 && (
                                        <div className="flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/90 dark:border-slate-700 shadow-md">
                                            <span className="text-[11px] sm:text-xs font-extrabold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                                                <span className="text-orange-600 dark:text-orange-400">
                                                    {activeIndex! + 1}
                                                </span>{" "}
                                                / {articles.length}
                                            </span>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={triggerClose}
                                        aria-label="Close article"
                                        className="h-9 w-9 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/90 dark:border-slate-700 shadow-md flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                        <X className="h-4.5 w-4.5" strokeWidth={2.5} />
                                    </button>
                                </div>
                            </motion.div>

                            {/* GPU-Composited FLIP Morphing Editorial Card */}
                            <motion.div
                                ref={cardContainerRef}
                                style={{
                                    x: cardX,
                                    y: cardY,
                                    scale: cardScale,
                                    opacity: cardOpacity,
                                }}
                                className="will-change-transform transform-gpu"
                            >
                                <ArticleReaderCard
                                    article={currentArticle}
                                    onExpandImage={(url, title) =>
                                        setLightboxImage({ url, title })
                                    }
                                    direction={direction}
                                />
                            </motion.div>

                            {/* Previous / Next Article Strip */}
                            <motion.div style={{ opacity: chromeOpacity }}>
                                <ArticlePagerFooter
                                    prevArticle={prevArticle}
                                    nextArticle={nextArticle}
                                    onSelect={onNavigate}
                                    activeIndex={activeIndex!}
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <ArticleImageLightbox
                image={lightboxImage}
                onClose={() => setLightboxImage(null)}
            />
        </>
    )
}
