"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, GripVertical, ImageIcon } from "lucide-react"
import type { CarouselImage } from "@/lib/mock-data"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Sortable Carousel Item Component
function SortableCarouselItem({
    image,
    onDelete
}: {
    image: CarouselImage
    onDelete: (id: string | number) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: image.id })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        ...(isDragging ? { zIndex: 50, position: 'relative' as const } : {}),
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 p-4 border-2 rounded-2xl bg-white transition-shadow transition-colors duration-200 ${
                isDragging 
                    ? 'border-red-400 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] opacity-95 ring-4 ring-red-100' 
                    : 'border-slate-200 shadow-sm hover:shadow-[0_4px_0_#e2e8f0]'
            }`}
        >
            <button
                {...attributes}
                {...listeners}
                className={`touch-none cursor-grab active:cursor-grabbing p-2 rounded-xl transition-all flex items-center justify-center shrink-0 ${
                    isDragging 
                        ? 'bg-red-50 text-red-600 border-2 border-red-200 shadow-inner' 
                        : 'bg-slate-50 text-slate-400 border-2 border-slate-200 hover:bg-slate-100 hover:text-slate-600 shadow-sm hover:shadow-[0_2px_0_#e2e8f0]'
                }`}
                aria-label="Drag to reorder"
            >
                <GripVertical className="h-5 w-5" />
            </button>

            <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{image.title}</h4>
                <p className="text-sm text-muted-foreground truncate">{image.altText}</p>
            </div>

            <button
                type="button"
                onClick={() => onDelete(image.id)}
                className={`ml-4 shrink-0 flex items-center justify-center font-extrabold h-10 w-10 pb-1 rounded-xl text-sm transition-all ${
                    isDragging 
                        ? 'bg-red-200 text-red-500' 
                        : 'bg-[#d60000] text-white shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b]'
                }`}
                aria-label="Delete image"
                disabled={isDragging}
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    )
}

// Main Sortable Carousel List Component
export function SortableCarouselList({
    images,
    onReorder,
    onDelete,
}: {
    images: CarouselImage[]
    onReorder: (newOrder: CarouselImage[]) => Promise<void>
    onDelete: (id: string | number) => void
}) {
    const [localImages, setLocalImages] = useState(images)

    // Update local state when prop changes
    useEffect(() => {
        setLocalImages(images)
    }, [images])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (!over || active.id === over.id) {
            return
        }

        const oldIndex = localImages.findIndex((img) => img.id === active.id)
        const newIndex = localImages.findIndex((img) => img.id === over.id)

        const newOrder = arrayMove(localImages, oldIndex, newIndex)

        // Optimistic update
        setLocalImages(newOrder)

        try {
            await onReorder(newOrder)
        } catch (error) {
            // Revert on error
            setLocalImages(images)
        }
    }

    return (
        <Card className="rounded-[2rem] border-[3px] border-slate-200 shadow-[0_8px_0_#cbd5e1] overflow-hidden bg-slate-50 transition-all mb-6">
            <CardHeader className="px-6 pt-6 pb-2">
                <div className="flex items-center gap-3">
                    <div className="bg-white border-2 border-slate-200 p-2 rounded-xl shadow-sm">
                        <ImageIcon className="h-6 w-6 text-[#d60000]" strokeWidth={2.5} />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Current Carousel Images</CardTitle>
                        <CardDescription className="text-slate-500 font-medium mt-1">
                            {images.length} images in carousel • Drag to reorder
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-4">
                {localImages.length === 0 ? (
                    <p className="text-slate-500 font-medium text-center py-8">
                        No carousel images yet
                    </p>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={localImages.map((img) => img.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-4">
                                {localImages.map((image) => (
                                    <SortableCarouselItem
                                        key={image.id}
                                        image={image}
                                        onDelete={onDelete}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </CardContent>
        </Card>
    )
}
