import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Label } from "@/Components/ui/label"
import { Input } from "@/Components/ui/input"
import { Plus, CheckCircle, AlertCircle } from "lucide-react"
import { ImageUpload } from "@/Components/ui/image-upload"
import { SortableCarouselList } from "@/Components/sortable-carousel-list"
import type { CarouselTabProps } from "@/types/admin"

export const AdminCarouselTab: React.FC<CarouselTabProps> = ({
  carouselImages,
  newCarousel,
  setNewCarousel,
  carouselUploadKey,
  handleAddCarousel,
  handleDeleteCarousel,
  handleReorderCarousel,
  success,
  error
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImageUpload
          key={carouselUploadKey}
          title="Upload Carousel Image"
          description="Upload an image for the dashboard carousel"
          recommendedResolution="1920 × 1080 PX (High Quality)"
          overlayTitle={newCarousel.title}
          overlayAlt={newCarousel.alt}
          onUploadComplete={(url) => setNewCarousel({ ...newCarousel, url })}
        />

        <div className="rounded-[1.75rem] sm:rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] overflow-hidden bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md transition-all h-full flex flex-col p-6 sm:p-7 md:p-8 gap-5 sm:gap-6">
          {/* Header Row */}
          <div className="flex items-center gap-3">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 p-2 sm:p-2.5 rounded-xl shadow-sm shrink-0">
              <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-[#d60000]" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white tracking-tight">Add New Carousel Image</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">Add images to the dashboard carousel</p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 flex flex-col justify-between gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carousel-title" className="font-bold text-slate-700 dark:text-slate-300">Title</Label>
                <Input
                  id="carousel-title"
                  placeholder="Image title"
                  value={newCarousel.title}
                  onChange={(e) => setNewCarousel({ ...newCarousel, title: e.target.value })}
                  className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl font-bold h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carousel-alt" className="font-bold text-slate-700 dark:text-slate-300">Alt Text</Label>
                <Input
                  id="carousel-alt"
                  placeholder="Image description"
                  value={newCarousel.alt}
                  onChange={(e) => setNewCarousel({ ...newCarousel, alt: e.target.value })}
                  className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl font-bold h-11"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 mt-auto">
              <button
                type="button"
                onClick={handleAddCarousel}
                className="inline-flex items-center justify-center bg-[#d60000] hover:bg-red-500 text-white font-extrabold px-6 pb-2.5 pt-3 rounded-xl text-sm shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all cursor-pointer"
              >
                <Plus className="h-5 w-5 mr-2" strokeWidth={2.5} />
                Add Image
              </button>
              {success && (
                <div className="text-sm font-bold text-green-700 dark:text-green-400 flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-900/50 px-4 py-2 rounded-xl animate-in fade-in zoom-in-95 duration-300">
                  <CheckCircle className="h-4 w-4"/> {success}
                </div>
              )}
              {error && (
                <div className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-900/50 px-4 py-2 rounded-xl animate-in fade-in zoom-in-95 duration-300">
                  <AlertCircle className="h-4 w-4"/> {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SortableCarouselList
        images={carouselImages}
        onReorder={handleReorderCarousel}
        onDelete={handleDeleteCarousel}
      />
    </div>
  )
}
