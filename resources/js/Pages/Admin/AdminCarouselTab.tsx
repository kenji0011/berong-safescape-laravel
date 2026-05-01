import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Plus, CheckCircle, AlertCircle } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"
import { SortableCarouselList } from "@/components/sortable-carousel-list"
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
          description="Upload an image to generate a URL for the carousel"
          onUploadComplete={(url) => setNewCarousel({ ...newCarousel, url })}
        />

        <Card className="rounded-[1.5rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-[0_4px_0_#e2e8f0] dark:hover:shadow-[0_4px_0_#0f172a] overflow-hidden bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md transition-all h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800 dark:text-white">Add New Carousel Image</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">Add images to the dashboard carousel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carousel-title" className="font-bold text-slate-700 dark:text-slate-300">Title</Label>
                  <Input
                    id="carousel-title"
                    placeholder="Image title"
                    value={newCarousel.title}
                    onChange={(e) => setNewCarousel({ ...newCarousel, title: e.target.value })}
                    className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carousel-alt" className="font-bold text-slate-700 dark:text-slate-300">Alt Text</Label>
                  <Input
                    id="carousel-alt"
                    placeholder="Image description"
                    value={newCarousel.alt}
                    onChange={(e) => setNewCarousel({ ...newCarousel, alt: e.target.value })}
                    className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <button
                type="button"
                onClick={handleAddCarousel}
                className="inline-flex items-center justify-center bg-[#d60000] text-white font-extrabold px-6 pb-2.5 pt-3 rounded-xl text-sm shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all"
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
          </CardContent>
        </Card>
      </div>

      <SortableCarouselList
        images={carouselImages}
        onReorder={handleReorderCarousel}
        onDelete={handleDeleteCarousel}
      />
    </div>
  )
}
