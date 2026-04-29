"use client"

import { useState } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"
import { Maximize2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from '@inertiajs/react';
import { ImageViewerModal } from "@/components/image-viewer-modal"

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
                            <div className="relative isolate w-full h-[40vh] sm:h-[50vh] min-h-[300px] overflow-hidden rounded-[2.5rem] shadow-2xl border border-gray-200 dark:border-slate-800 group-slide [mask-image:radial-gradient(white,black)] [-webkit-mask-image:-webkit-radial-gradient(white,black)] bg-slate-200 dark:bg-slate-800 transition-colors duration-500">
                                <style dangerouslySetInnerHTML={{ __html: `
                                    .carousel-zoom-image {
                                        transition: opacity 0.7s ease-out, transform 0.7s cubic-bezier(0.33, 1, 0.68, 1) !important;
                                    }
                                    .group-slide:hover .carousel-zoom-image {
                                        transform: scale(1.1) !important;
                                    }
                                `}} />
                                <img
                                    src={image.imageUrl}
                                    alt={image.altText ?? image.title}
                                    decoding="async"
                                    loading={index === 0 ? "eager" : "lazy"}
                                    {...(index === 0 ? { fetchpriority: "high" } : {})}
                                    onLoad={(e) => (e.currentTarget.style.opacity = "1")}
                                    style={{ opacity: 0 }}
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
                                    className="absolute inset-0 z-10 w-full h-full cursor-pointer bg-transparent hover:bg-white/5 transition-colors outline-none focus:ring-2 focus:ring-primary focus:ring-inset rounded-[2.5rem]"
                                    aria-label={`View full screen image: ${image.title}`}
                                >
                                    {/* Maximize Icon (Top Right) */}
                                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-100 sm:opacity-0 sm:group-hover/slide:opacity-100 transition-opacity duration-300">
                                        <div className="bg-black/45 backdrop-blur-sm rounded-full p-1.5 sm:p-2 text-white shadow-sm">
                                            <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </div>
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
