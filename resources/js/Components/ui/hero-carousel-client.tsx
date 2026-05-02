"use client"

import { useState } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"
import { Maximize2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from '@inertiajs/react';
import { ImageViewerModal } from "@/components/image-viewer-modal"
import Image from '@/Components/Image';

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

export function HeroCarouselClient({ images }: HeroCarouselClientProps) {
    const [isViewerOpen, setIsViewerOpen] = useState(false)
    const [selectedImage, setSelectedImage] = useState<CarouselImage | null>(null)

    const handleImageClick = (image: CarouselImage) => {
        setSelectedImage(image)
        setIsViewerOpen(true)
    }

    return (
        <div className="relative w-full max-w-7xl mx-auto">
            <Carousel
                className="w-full"
                plugins={[
                    Autoplay({
                        delay: 4000,
                        stopOnInteraction: false,
                    }),
                ]}
            >
                <CarouselContent>
                    {images.map((image, index) => (
                        <CarouselItem key={image.id}>
                            <div className="relative isolate w-full h-[40vh] sm:h-[50vh] min-h-[300px] overflow-hidden rounded-[2.5rem] shadow-2xl border border-gray-200 dark:border-slate-800 group-slide bg-slate-200 dark:bg-slate-800 transition-colors duration-500">
                                <style dangerouslySetInnerHTML={{ __html: `
                                    .carousel-zoom-image {
                                        transition: opacity 0.7s ease-out, transform 0.7s cubic-bezier(0.33, 1, 0.68, 1) !important;
                                        image-rendering: -webkit-optimize-contrast;
                                        image-rendering: high-quality;
                                    }
                                    .group-slide:hover .carousel-zoom-image {
                                        transform: scale(1.1) !important;
                                    }
                                `}} />
                                <Image
                                    src={image.imageUrl}
                                    alt={image.altText ?? image.title}
                                    fill
                                    priority={index === 0}
                                    className="absolute inset-0 w-full h-full object-cover carousel-zoom-image"
                                />

                                {/* Gradient Overlay - Bottom Left aligned */}
                                <div className="absolute inset-0 bg-gray-900/70 flex flex-col justify-end items-start p-6 pb-12 sm:p-10 sm:pb-16 md:p-14 md:pb-20 pointer-events-none rounded-[2.5rem]">
                                    <div className="relative z-10 text-white w-full max-w-5xl pointer-events-auto">
                                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 sm:mb-5 drop-shadow-2xl tracking-tight leading-tight">
                                            {image.title}
                                        </h1>
                                        {image.altText && (
                                            <p className="text-sm sm:text-lg md:text-xl font-medium text-gray-200 drop-shadow-md max-w-3xl">
                                                {image.altText}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Transparent Clickable Overlay Button */}
                                <button
                                    onClick={() => handleImageClick(image)}
                                    className="absolute inset-0 z-10 w-full h-full cursor-zoom-in bg-transparent transition-colors outline-none focus:ring-2 focus:ring-primary focus:ring-inset rounded-[2.5rem] flex items-center justify-center group/overlay"
                                    aria-label={`View full screen image: ${image.title}`}
                                >
                                    {/* Center Overlay Hint */}
                                    <div className="opacity-0 group-hover/overlay:opacity-100 translate-y-4 group-hover/overlay:translate-y-0 transition-all duration-300 bg-slate-900/90 backdrop-blur-md text-white font-bold px-4 py-2 sm:px-6 sm:py-3 rounded-full flex items-center gap-2 shadow-2xl border border-slate-700/50 text-xs sm:text-sm">
                                        <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                                        Click to expand
                                    </div>
                                </button>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                {/* Hide arrows on mobile, show on tablet+ */}
                <CarouselPrevious className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 hidden sm:flex" />
                <CarouselNext className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 hidden sm:flex" />
            </Carousel>

            {/* Image Viewer Modal */}
            {selectedImage && (
                <ImageViewerModal
                    isOpen={isViewerOpen}
                    onClose={() => setIsViewerOpen(false)}
                    imageUrl={selectedImage.imageUrl}
                    imageTitle={selectedImage.title}
                    imageAlt={selectedImage.altText ?? selectedImage.title}
                />
            )}
        </div>
    );
}
