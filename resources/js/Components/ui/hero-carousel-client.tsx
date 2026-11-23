"use client"

import React, { useState, useEffect, useMemo, Suspense } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/Components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"
import { Maximize2 } from "lucide-react"
import Image from '@/Components/Image';

const ImageViewerModal = React.lazy(() =>
    import("@/Components/Modals/image-viewer-modal").then((m) => ({ default: m.ImageViewerModal }))
);

type CarouselImage = {
    id: number;
    title: string;
    altText: string | null;
    imageUrl: string;
    order: number;
    isActive: boolean;
};

interface HeroCarouselClientProps {
    images: CarouselImage[];
}

type CarouselApi = Parameters<NonNullable<React.ComponentProps<typeof Carousel>['setApi']>>[0];

export function HeroCarouselClient({ images }: HeroCarouselClientProps) {
    const [isViewerOpen, setIsViewerOpen] = useState(false)
    const [selectedImage, setSelectedImage] = useState<CarouselImage | null>(null)
    const [api, setApi] = useState<CarouselApi>()
    // Load only the LCP slide (index 0) initially so off-screen slides never compete for Slow 4G bandwidth
    const [loadedSlides, setLoadedSlides] = useState<Set<number>>(() => new Set([0]))

    const plugins = useMemo(
        () => [
            Autoplay({
                delay: 5000,
                stopOnInteraction: false,
            }),
        ],
        []
    )

    const markSlidesLoaded = (indices: number[]) => {
        setLoadedSlides((prev) => {
            let changed = false
            const next = new Set(prev)
            for (const idx of indices) {
                if (idx >= 0 && idx < images.length && !next.has(idx)) {
                    next.add(idx)
                    changed = true
                }
            }
            return changed ? next : prev
        })
    }

    // Warm up slide 2 shortly after initial mount/LCP so the first autoplay transition is seamless
    useEffect(() => {
        if (images.length <= 1) return
        const timer = window.setTimeout(() => {
            markSlidesLoaded([1])
        }, 2000)
        return () => window.clearTimeout(timer)
    }, [images.length])

    // Load active slide and its immediate neighbors as user navigates or autoplay advances
    useEffect(() => {
        if (!api || images.length <= 1) return

        const handleSelect = () => {
            const current = api.selectedScrollSnap()
            const nextIdx = (current + 1) % images.length
            const prevIdx = (current - 1 + images.length) % images.length
            markSlidesLoaded([current, nextIdx, prevIdx])
        }

        api.on("select", handleSelect)
        return () => {
            api.off("select", handleSelect)
        }
    }, [api, images.length])

    const handleImageClick = (image: CarouselImage) => {
        setSelectedImage(image)
        setIsViewerOpen(true)
    }

    return (
        <div className="relative w-full max-w-7xl mx-auto">
            <Carousel
                className="w-full"
                setApi={setApi}
                plugins={plugins}
            >
                <CarouselContent>
                    {images.map((image, index) => {
                        const shouldRenderImage = loadedSlides.has(index)
                        return (
                            <CarouselItem key={image.id}>
                                <div className="relative isolate w-full aspect-video overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-gray-200 dark:border-slate-800 group/slide bg-slate-200 dark:bg-slate-800 transition-colors duration-500">
                                    {shouldRenderImage && (
                                        <Image
                                            src={image.imageUrl}
                                            alt={image.altText ?? image.title}
                                            fill
                                            priority={index === 0}
                                            loading={index === 0 ? "eager" : "lazy"}
                                            decoding={index === 0 ? "sync" : "async"}
                                            fetchPriority={index === 0 ? "high" : "low"}
                                            onLoad={index === 0 && images.length > 1 ? () => markSlidesLoaded([1]) : undefined}
                                            className="absolute inset-0 w-full h-full object-cover transition-[transform,scale,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover/slide:scale-[1.06]"
                                        />
                                    )}

                                    {/* Gradient Overlay - Bottom Left aligned */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent flex flex-col justify-end items-start p-6 pb-10 sm:p-10 sm:pb-14 md:p-12 md:pb-16 pointer-events-none rounded-[2rem] sm:rounded-[2.5rem]">
                                        <div className="relative z-10 text-white w-full max-w-5xl pointer-events-auto transition-[transform,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/slide:-translate-y-1">
                                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 sm:mb-4 drop-shadow-2xl tracking-tight leading-tight">
                                                {image.title}
                                            </h1>
                                            {image.altText && (
                                                <p className="text-sm sm:text-base md:text-lg font-medium text-gray-200 drop-shadow-md max-w-3xl hidden sm:block leading-relaxed">
                                                    {image.altText}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Transparent Clickable Overlay Button */}
                                    <button
                                        onClick={() => handleImageClick(image)}
                                        className="absolute inset-0 z-10 w-full h-full cursor-zoom-in bg-black/0 hover:bg-black/15 transition-colors duration-500 ease-out outline-none focus:ring-2 focus:ring-primary focus:ring-inset rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center group/overlay"
                                        aria-label={`View full screen image: ${image.title}`}
                                    >
                                        {/* Center Overlay Hint */}
                                        <div className="opacity-0 translate-y-3 scale-95 group-hover/overlay:opacity-100 group-hover/overlay:translate-y-0 group-hover/overlay:scale-100 transition-[opacity,transform,translate,scale] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform bg-slate-900/90 backdrop-blur-md text-white font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl flex items-center gap-2 shadow-2xl border border-slate-700/50 text-xs sm:text-sm">
                                            <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                                            Click to expand
                                        </div>
                                    </button>
                                </div>
                            </CarouselItem>
                        )
                    })}
                </CarouselContent>
                {/* Hide arrows on mobile, show on tablet+ */}
                <CarouselPrevious className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 hidden sm:flex" />
                <CarouselNext className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 hidden sm:flex" />
            </Carousel>

            {/* Lazy Image Viewer Modal (only loads when user clicks an image) */}
            {selectedImage && isViewerOpen && (
                <Suspense fallback={null}>
                    <ImageViewerModal
                        isOpen={isViewerOpen}
                        onClose={() => setIsViewerOpen(false)}
                        imageUrl={selectedImage.imageUrl}
                        imageTitle={selectedImage.title}
                        imageAlt={selectedImage.altText ?? selectedImage.title}
                        description={selectedImage.altText}
                    />
                </Suspense>
            )}
        </div>
    );
}
