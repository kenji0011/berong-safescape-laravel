"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from '@/components/Image';

interface ImageViewerModalProps {
    isOpen: boolean
    onClose: () => void
    imageUrl: string
    imageTitle: string
    imageAlt: string
}

export function ImageViewerModal({
    isOpen,
    onClose,
    imageUrl,
    imageTitle,
    imageAlt
}: ImageViewerModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                className="max-w-[95vw] sm:max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none" 
                aria-describedby={undefined}
                showCloseButton={false}
            >
                <DialogTitle className="sr-only">{imageTitle}</DialogTitle>
                <div className="relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-4">
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
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-6 sm:p-10 pointer-events-none">
                                <h3 className="text-white text-xl sm:text-3xl font-black tracking-tight drop-shadow-lg">{imageTitle}</h3>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
