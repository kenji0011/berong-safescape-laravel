"use client"

import React, { useState, useEffect, useRef } from "react"
import ReactDOM, { flushSync } from "react-dom"
import { Head, Link } from '@inertiajs/react'
import DashboardLayout from "@/Layouts/DashboardLayout"
import { ArrowLeft, User, Calendar, Maximize2, X, Flame, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, PhoneCall } from "lucide-react"
import DOMPurify from "dompurify"
import { cn } from "@/lib/utils"

interface BlogItem {
    id: number | string
    title: string
    content: string
    excerpt?: string
    imageUrl: string
    author?: {
        name: string
    } | string
    created_at?: string
    createdAt?: string
}

interface BlogArticleProps {
    blog: BlogItem
    allBlogs?: BlogItem[]
}

interface ArticleContentSectionProps {
    content: string
    isExpanded: boolean
    onToggleExpand: () => void
}

const ArticleContentSection: React.FC<ArticleContentSectionProps> = ({
    content,
    isExpanded,
    onToggleExpand,
}) => {
    const textRef = useRef<HTMLDivElement>(null)
    const [isOverflowing, setIsOverflowing] = useState(false)

    const checkOverflow = () => {
        const el = textRef.current
        if (!el) return
        if (!isExpanded) {
            // When line-clamp-5 is applied, scrollHeight exceeds clientHeight when text actually overflows
            const hasOverflow = el.scrollHeight > el.clientHeight + 4
            setIsOverflowing(hasOverflow)
        }
    }

    useEffect(() => {
        checkOverflow()
    }, [content])

    useEffect(() => {
        const handleResize = () => {
            if (!isExpanded) {
                checkOverflow()
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [isExpanded, content])

    useEffect(() => {
        const el = textRef.current
        if (!el || typeof ResizeObserver === 'undefined') return
        const observer = new ResizeObserver(() => {
            if (!isExpanded) {
                checkOverflow()
            }
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [isExpanded, content])

    const showButton = isOverflowing || isExpanded

    return (
        <div className="p-3.5 sm:p-5 pt-2.5 sm:pt-3 relative">
            <div 
                ref={textRef}
                className={cn(
                    "prose prose-slate dark:prose-invert max-w-none transition-all duration-300",
                    "prose-headings:font-black prose-headings:text-slate-800 dark:prose-headings:text-white prose-headings:tracking-tight",
                    "prose-h2:text-sm sm:prose-h2:text-base prose-h2:mt-2 prose-h2:mb-1.5",
                    "prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:font-medium prose-p:leading-relaxed prose-p:mb-2 prose-p:text-xs sm:prose-p:text-[13px]",
                    "prose-a:text-orange-600 dark:prose-a:text-orange-400 prose-a:font-bold prose-a:no-underline hover:prose-a:underline",
                    "prose-strong:font-black prose-strong:text-slate-800 dark:prose-strong:text-white",
                    "prose-ul:marker:text-orange-400 dark:prose-ul:marker:text-orange-500 prose-li:font-medium prose-li:text-xs sm:prose-li:text-[13px]",
                    "prose-img:rounded-xl prose-img:shadow-md border-slate-100 dark:border-slate-700",
                    !isExpanded && "line-clamp-5"
                )}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            />
            {showButton && (
                <div className="flex justify-end mt-1.5">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            onToggleExpand()
                        }}
                        className="text-xs font-black text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 inline-flex items-center gap-1.5 transition-all cursor-pointer py-1 px-3 rounded-full bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500/40 shadow-xs active:scale-95"
                    >
                        {isExpanded ? (
                            <>
                                <span>Show Less</span>
                                <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.5} />
                            </>
                        ) : (
                            <>
                                <span>See More</span>
                                <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}

const BlogArticleClient = ({ blog, allBlogs }: BlogArticleProps) => {
    // Array of all published articles in order
    const articles = (allBlogs && allBlogs.length > 0) ? allBlogs : [blog];
    
    // Initial active index based on the clicked blog
    const initialIndex = articles.findIndex((b) => String(b.id) === String(blog.id));
    const [activeIndex, setActiveIndex] = useState(initialIndex !== -1 ? initialIndex : 0);

    const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
    const [isLightboxToggling, setIsLightboxToggling] = useState(false);

    const [expandedArticles, setExpandedArticles] = useState<Record<string | number, boolean>>({});

    const toggleArticleExpand = (id: string | number) => {
        setExpandedArticles(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const containerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const isProgrammaticScroll = useRef(false);
    const scrollTimeoutRef = useRef<any>(null);

    const scrollToArticle = (index: number, smooth: boolean = true) => {
        if (index < 0 || index >= articles.length) return;
        setActiveIndex(index);
        isProgrammaticScroll.current = true;
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
            isProgrammaticScroll.current = false;
        }, 500);

        const cardEl = cardRefs.current[index];
        if (cardEl) {
            cardEl.scrollIntoView({
                behavior: smooth ? 'smooth' : 'auto',
                block: 'nearest',
                inline: 'center'
            });
        }
        const targetBlog = articles[index];
        if (targetBlog && targetBlog.id) {
            window.history.replaceState(null, '', `/adult/blog/${targetBlog.id}`);
        }
    };

    // Scroll to initial active article on mount without jump
    useEffect(() => {
        const targetIdx = initialIndex !== -1 ? initialIndex : 0;
        if (cardRefs.current[targetIdx]) {
            isProgrammaticScroll.current = true;
            cardRefs.current[targetIdx]?.scrollIntoView({
                behavior: 'auto',
                block: 'nearest',
                inline: 'center'
            });
            setTimeout(() => {
                isProgrammaticScroll.current = false;
            }, 100);
        }
    }, []);

    // Horizontal scroll sync to detect active card when manually scrolled
    const handleScroll = () => {
        if (isProgrammaticScroll.current || !containerRef.current) return;
        const container = containerRef.current;
        const containerCenter = container.scrollLeft + container.offsetWidth / 2;

        let closestIndex = activeIndex;
        let minDistance = Infinity;

        cardRefs.current.forEach((card, idx) => {
            if (!card) return;
            const cardCenter = card.offsetLeft + card.offsetWidth / 2;
            const dist = Math.abs(containerCenter - cardCenter);
            if (dist < minDistance) {
                minDistance = dist;
                closestIndex = idx;
            }
        });

        if (closestIndex !== activeIndex && minDistance < 180) {
            setActiveIndex(closestIndex);
            const targetBlog = articles[closestIndex];
            if (targetBlog && targetBlog.id) {
                window.history.replaceState(null, '', `/adult/blog/${targetBlog.id}`);
            }
        }
    };

    // Keyboard navigation (Left / Right arrow keys)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxImage) return;
            if (e.key === 'ArrowLeft') {
                scrollToArticle(activeIndex - 1);
            } else if (e.key === 'ArrowRight') {
                scrollToArticle(activeIndex + 1);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeIndex, articles.length, lightboxImage]);

    // Lightbox open / close
    const openLightbox = (url: string, title: string) => {
        document.documentElement.classList.add('lightbox-open');
        if (!document.startViewTransition) {
            setLightboxImage({ url, title });
            return;
        }
        setIsLightboxToggling(true);
        const transition = document.startViewTransition(() => {
            flushSync(() => {
                setLightboxImage({ url, title });
            });
        });
        if (transition && transition.finished) {
            transition.finished.finally(() => setIsLightboxToggling(false));
        } else {
            setTimeout(() => setIsLightboxToggling(false), 450);
        }
    };

    const closeLightbox = () => {
        document.documentElement.classList.remove('lightbox-open');
        if (!document.startViewTransition) {
            setLightboxImage(null);
            return;
        }
        setIsLightboxToggling(true);
        const transition = document.startViewTransition(() => {
            flushSync(() => {
                setLightboxImage(null);
            });
        });
        if (transition && transition.finished) {
            transition.finished.finally(() => setIsLightboxToggling(false));
        } else {
            setTimeout(() => setIsLightboxToggling(false), 450);
        }
    };

    const currentBlog = articles[activeIndex] || blog;

    return (
        <div className="min-h-screen selection:bg-red-500 selection:text-white pb-12 relative overflow-x-hidden">
            <Head title={`${currentBlog.title} - SafeScape`} />
            
            {/* Expanded Image Modal Lightbox */}
            {lightboxImage && ReactDOM.createPortal(
                <div 
                    style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        width: '100vw', 
                        height: '100vh', 
                        zIndex: 2147483647, 
                        background: '#000', 
                        overflowY: 'auto', 
                        overflowX: 'hidden', 
                        WebkitOverflowScrolling: 'touch',
                        viewTransitionName: 'lightbox-backdrop'
                    }}
                    onClick={closeLightbox}
                >
                    <button 
                        style={{ position: 'fixed', top: 16, right: 16, zIndex: 2147483647, background: 'rgba(0,0,0,0.8)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '50%', padding: 12, color: 'white', cursor: 'pointer', backdropFilter: 'blur(8px)', lineHeight: 0 }}
                        onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                        aria-label="Close fullscreen preview"
                    >
                        <X className="h-6 w-6" strokeWidth={2.5} />
                    </button>
                    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowX: 'hidden' }}>
                        <img 
                            src={lightboxImage.url} 
                            alt={lightboxImage.title} 
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: 'block', width: '175%', maxWidth: 'none', height: 'auto', flexShrink: 0, viewTransitionName: 'article-hero-image' }}
                        />
                    </div>
                </div>,
                document.body
            )}

            {/* Fixed Background Image */}
            <div 
                className="fixed top-0 left-0 w-full -z-10 pointer-events-none"
                style={{ height: '100vh', minHeight: '100lvh' }}
            >
                <img 
                    src="/web-background-image.webp"
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center 80%' }}
                />
            </div>

            {/* Frosting overlay */}
            <div className="fixed inset-0 bg-background/90 -z-10 pointer-events-none transition-colors duration-500" />

            {/* Desktop Floating Side Navigation Arrows */}
            {articles.length > 1 && (
                <>
                    {activeIndex > 0 && (
                        <button
                            onClick={() => scrollToArticle(activeIndex - 1)}
                            aria-label="Previous article"
                            title={articles[activeIndex - 1]?.title ? `Previous: ${articles[activeIndex - 1].title}` : "Previous article"}
                            className="fixed left-4 xl:left-8 top-1/2 -translate-y-1/2 z-30 hidden lg:flex h-11 w-11 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-slate-200 dark:border-slate-700 shadow-xl items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-110 hover:bg-orange-500 hover:text-white hover:border-orange-500 active:scale-95 transition-all duration-200 group"
                        >
                            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" strokeWidth={3} />
                        </button>
                    )}

                    {activeIndex < articles.length - 1 && (
                        <button
                            onClick={() => scrollToArticle(activeIndex + 1)}
                            aria-label="Next article"
                            title={articles[activeIndex + 1]?.title ? `Next: ${articles[activeIndex + 1].title}` : "Next article"}
                            className="fixed right-4 xl:right-8 top-1/2 -translate-y-1/2 z-30 hidden lg:flex h-11 w-11 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-slate-200 dark:border-slate-700 shadow-xl items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-110 hover:bg-orange-500 hover:text-white hover:border-orange-500 active:scale-95 transition-all duration-200 group"
                        >
                            <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" strokeWidth={3} />
                        </button>
                    )}
                </>
            )}

            <main className="w-full relative z-10 pt-2 sm:pt-4 pb-10">
                {/* Top Navigation Bar with Back button & Article Counter */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-2 sm:mb-3 flex items-center justify-between gap-3 relative z-20">
                    <Link 
                        href="/adult#articles-section" 
                        className="group inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-full text-slate-700 dark:text-slate-200 font-extrabold hover:text-orange-600 dark:hover:text-orange-400 border-2 border-slate-200 dark:border-slate-700 hover:border-orange-500/50 dark:hover:border-orange-500/50 shadow-sm hover:shadow-md active:scale-95 transition-all text-xs sm:text-sm"
                    >
                        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700/80 group-hover:bg-orange-500 flex items-center justify-center transition-colors duration-200 shrink-0">
                            <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-600 dark:text-slate-300 group-hover:text-white group-hover:-translate-x-0.5 transition-all duration-200" strokeWidth={3} />
                        </div>
                        <span>Back to Articles</span>
                    </Link>

                    {articles.length > 1 && (
                        <div className="flex items-center gap-2 sm:gap-2.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                            <span className="text-[11px] sm:text-xs font-black text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                                Article <span className="text-orange-500 font-black">{activeIndex + 1}</span> of {articles.length}
                            </span>
                            <div className="h-3 w-[1.5px] bg-slate-200 dark:bg-slate-700" />
                            <div className="flex items-center gap-0.5 sm:gap-1">
                                <button
                                    onClick={() => scrollToArticle(activeIndex - 1)}
                                    disabled={activeIndex === 0}
                                    aria-label="Previous article"
                                    className="p-1 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
                                </button>
                                <button
                                    onClick={() => scrollToArticle(activeIndex + 1)}
                                    disabled={activeIndex === articles.length - 1}
                                    aria-label="Next article"
                                    className="p-1 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                >
                                    <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Horizontal Articles Track */}
                <div 
                    ref={containerRef}
                    onScroll={handleScroll}
                    className="w-full overflow-x-auto snap-x snap-mandatory scroll-smooth py-1 sm:py-2 flex items-start gap-4 sm:gap-6 lg:gap-8"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                        paddingLeft: 'max(1rem, calc((100vw - min(740px, 90vw)) / 2))',
                        paddingRight: 'max(1rem, calc((100vw - min(740px, 90vw)) / 2))'
                    }}
                >
                    {articles.map((item, idx) => {
                        const isActive = idx === activeIndex;
                        const isExpanded = !!expandedArticles[item.id];
                        const dateString = item.created_at || item.createdAt;
                        const formattedDate = dateString 
                            ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                            : 'Recently';
                        const authorName = typeof item.author === 'string' ? item.author : item.author?.name || 'BFP Admin';

                        return (
                            <div
                                key={item.id}
                                ref={(el) => { cardRefs.current[idx] = el; }}
                                className={cn(
                                    "shrink-0 snap-center transition-all duration-500 ease-out relative",
                                    "w-[90vw] sm:w-[660px] lg:w-[740px]",
                                    isActive 
                                        ? "opacity-100 scale-100 z-20" 
                                        : "opacity-40 hover:opacity-75 scale-[0.95] hover:scale-[0.97] cursor-pointer z-10"
                                )}
                                onClick={() => {
                                    if (!isActive) {
                                        scrollToArticle(idx);
                                    }
                                }}
                            >
                                <article 
                                    style={{ 
                                        viewTransitionName: (String(item.id) === String(blog.id) && !lightboxImage && !isLightboxToggling) 
                                            ? 'article-card-morph' 
                                            : 'none' 
                                    }}
                                    className={cn(
                                        "bg-white dark:bg-slate-800/90 backdrop-blur-md rounded-[1.25rem] sm:rounded-[1.75rem] overflow-hidden transition-all duration-300 flex flex-col",
                                        isActive 
                                            ? "shadow-2xl dark:shadow-[0_16px_50px_rgba(0,0,0,0.35)] border-2 border-orange-500/30 dark:border-orange-500/30" 
                                            : "shadow-md border border-slate-200/60 dark:border-slate-700/50 hover:border-orange-500/30"
                                    )}
                                >
                                    {/* Header Section */}
                                    <div className="p-3.5 sm:p-5 pb-2 sm:pb-3 bg-white dark:bg-transparent transition-colors">
                                        <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
                                            <span className="inline-block px-2 py-0.5 bg-orange-500/10 dark:bg-orange-500/10 text-orange-600 dark:orange-400 font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider rounded-full border border-orange-500/20 shadow-sm transition-colors">
                                                Fire Safety Education
                                            </span>
                                            {!isActive && (
                                                <span className="text-[10px] sm:text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full border border-orange-500/20">
                                                    Click to view
                                                </span>
                                            )}
                                        </div>
                                        
                                        <h1 
                                            style={{ 
                                                viewTransitionName: (String(item.id) === String(blog.id) && !lightboxImage && !isLightboxToggling) 
                                                    ? 'article-hero-title' 
                                                    : 'none' 
                                            }}
                                            className="text-base sm:text-lg md:text-xl font-black text-slate-800 dark:text-white leading-snug tracking-tight mb-2 transition-colors line-clamp-2"
                                        >
                                            {item.title}
                                        </h1>
                                        
                                        <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200/50 dark:border-slate-800/80 shadow-inner shrink-0 transition-colors">
                                                    <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-500 dark:text-slate-400" />
                                                </div>
                                                <div className="text-left py-0.5 leading-tight">
                                                    <div className="font-extrabold text-slate-800 dark:text-slate-200 text-xs sm:text-[13px] transition-colors">{authorName}</div>
                                                    <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 transition-colors">
                                                        <Calendar className="h-2.5 w-2.5" />
                                                        {formattedDate}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expandable Image Section (constrained height to prevent vertical bloat) */}
                                    {item.imageUrl && (
                                        <div className="px-3 sm:px-5">
                                            <div 
                                                className={cn(
                                                    "w-full relative group rounded-xl overflow-hidden border border-slate-200/90 dark:border-slate-700/90 bg-slate-900/60 shadow-sm transition-all flex items-center justify-center",
                                                    isActive ? "cursor-zoom-in hover:border-orange-500/50 hover:shadow-lg active:scale-[0.995]" : ""
                                                )}
                                                onClick={(e) => {
                                                    if (isActive) {
                                                        e.stopPropagation();
                                                        openLightbox(item.imageUrl, item.title);
                                                    }
                                                }}
                                            >
                                                <img 
                                                    src={item.imageUrl} 
                                                    alt={item.title} 
                                                    className="w-full max-h-[260px] sm:max-h-[300px] md:max-h-[320px] object-contain transition-transform duration-300 group-hover:scale-[1.005]"
                                                    style={{ 
                                                        viewTransitionName: (String(item.id) === String(blog.id) && !lightboxImage) 
                                                            ? 'article-hero-image' 
                                                            : 'none' 
                                                    }}
                                                />
                                                
                                                {/* Expand Overlay Hint */}
                                                {isActive && (
                                                    <div className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 z-20 transition-all duration-200 pointer-events-none">
                                                        <div className="bg-slate-950/85 text-white font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xl text-[9px] sm:text-[10px] border border-white/20 backdrop-blur-md">
                                                            <Maximize2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-orange-400" strokeWidth={2.5} />
                                                            <span>Tap to expand</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Article Content */}
                                    <ArticleContentSection
                                        content={item.content || item.excerpt || ''}
                                        isExpanded={isExpanded}
                                        onToggleExpand={() => toggleArticleExpand(item.id)}
                                    />
                                </article>
                            </div>
                        );
                    })}
                </div>

                {/* Compact Pagination Dots */}
                {articles.length > 1 && (
                    <div className="flex items-center justify-center gap-1.5 mt-2 mb-1.5">
                        {articles.map((item, idx) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToArticle(idx)}
                                aria-label={`Go to article ${idx + 1}`}
                                className={cn(
                                    "transition-all duration-300 rounded-full",
                                    idx === activeIndex
                                        ? "w-6 h-1.5 bg-orange-500 shadow-sm"
                                        : "w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                                )}
                            />
                        ))}
                    </div>
                )}

                {/* Emergency Protocol - Solid opaque styling for maximum readability (glassmorphism removed) */}
                <div className="max-w-3xl mx-auto px-4 mt-3 sm:mt-4 transition-all duration-300 ease-in-out">
                    <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border-2 border-red-500/80 dark:border-red-500/80 border-l-[6px] border-l-red-600 dark:border-l-red-500 p-4 sm:p-5 shadow-xl shadow-red-950/10 dark:shadow-2xl dark:shadow-black/70 transition-all">
                        <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 items-start sm:items-center justify-between">
                            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1">
                                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-red-600 dark:bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/30 ring-4 ring-red-100 dark:ring-red-950/70">
                                    <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-white animate-pulse" strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h3 className="text-sm sm:text-base font-black text-red-600 dark:text-red-400 tracking-tight">
                                            Emergency Protocol
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-950/90 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800">
                                            Immediate Action
                                        </span>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium text-xs sm:text-[13px]">
                                        In case of a fire emergency, do not hesitate. Call <strong className="font-black text-red-700 dark:text-red-300 bg-red-100/80 dark:bg-red-950/90 px-1.5 py-0.5 rounded border border-red-300/80 dark:border-red-800">911</strong> immediately. Never put yourself at risk trying to fight a large fire. <strong className="font-black text-red-700 dark:text-red-300 bg-red-100/80 dark:bg-red-950/90 px-1.5 py-0.5 rounded border border-red-300/80 dark:border-red-800">Evacuate first</strong>, then call for help.
                                    </p>
                                </div>
                            </div>
                            <div className="w-full sm:w-auto flex justify-end sm:justify-start shrink-0 pt-1 sm:pt-0">
                                <a
                                    href="tel:911"
                                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 w-full sm:w-auto rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-xs sm:text-sm shadow-md shadow-red-600/30 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-wide cursor-pointer"
                                >
                                    <PhoneCall className="h-4 w-4" strokeWidth={2.5} />
                                    <span>Call 911</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

BlogArticleClient.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default BlogArticleClient
