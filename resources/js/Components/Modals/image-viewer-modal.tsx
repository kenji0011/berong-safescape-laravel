"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/Components/ui/dialog"
import { X } from "lucide-react"
import { Button } from "@/Components/ui/button"
import Image from '@/Components/Image';

interface ImageViewerModalProps {
    isOpen: boolean
    onClose: () => void
    imageUrl: string
    imageTitle: string
    imageAlt: string
    description?: string | null
}

export function ImageViewerModal({
    isOpen,
    onClose,
    imageUrl,
    imageTitle,
    imageAlt,
    description
}: ImageViewerModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.documentElement.classList.add('lightbox-open');
        } else {
            document.documentElement.classList.remove('lightbox-open');
        }
        return () => {
            document.documentElement.classList.remove('lightbox-open');
        };
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                className="max-w-[95vw] sm:max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none" 
                aria-describedby={undefined}
                showCloseButton={false}
            >
                <DialogTitle className="sr-only">{imageTitle}</DialogTitle>
                <div className="relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 cursor-zoom-out" onClick={onClose}>
                    <div className="relative w-full h-[80vh] sm:h-[90vh] bg-black/80 rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center">
                        <Image
                             src={imageUrl}
                             alt={imageAlt}
                             fill
                             className="object-contain p-2 sm:p-6"
                             priority
                        />

                        <Button
                            onClick={onClose}
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white z-20 rounded-full w-10 h-10 border border-white/20 transition-all hover:scale-110 active:scale-90"
                            aria-label="Close image viewer"
                        >
                            <X className="h-6 w-6" />
                        </Button>

                        {imageTitle && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/75 p-4 sm:p-6 md:p-8 pointer-events-none select-none">
                                <h3 className="text-white text-lg sm:text-2xl font-black tracking-tight drop-shadow-lg mb-1 sm:mb-2">{imageTitle}</h3>
                                {description && (
                                    <p className="text-slate-200 text-xs sm:text-sm md:text-base font-medium leading-relaxed drop-shadow max-w-4xl">
                                        {description}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
