import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Label } from "@/Components/ui/label"
import { Input } from "@/Components/ui/input"
import { Textarea } from "@/Components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Plus, CheckCircle, AlertCircle } from "lucide-react"
import { SortableContentList } from "@/Components/sortable-content-list"
import type { VideosTabProps, Video } from "@/types/admin"

export const AdminVideosTab: React.FC<VideosTabProps> = ({
  videos,
  newVideo,
  setNewVideo,
  handleAddVideo,
  handleDeleteVideo,
  handleReorderVideos,
  success,
  error
}) => {
  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] sm:rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] overflow-hidden bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md transition-all mb-6 p-6 sm:p-7 md:p-8 flex flex-col gap-5 sm:gap-6">
        {/* Header Row */}
        <div className="flex items-center gap-3">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 p-2 sm:p-2.5 rounded-xl shadow-sm shrink-0">
            <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-[#d60000]" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white tracking-tight">Add New Video</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">Add YouTube educational videos to different sections</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="video-title" className="font-bold text-slate-700 dark:text-slate-300">Title</Label>
                <Input
                  id="video-title"
                  placeholder="Video title"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl font-bold h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-youtubeId" className="font-bold text-slate-700 dark:text-slate-300">YouTube URL or ID</Label>
                <Input
                  id="video-youtubeId"
                  placeholder="https://youtu.be/... or dQw4w9WgXcQ"
                  value={newVideo.youtubeId}
                  onChange={(e) => {
                    let val = e.target.value;
                    const regex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([^&?\n]+)/;
                    const match = val.match(regex);
                    
                    if (match && match[1]) {
                      val = match[1];
                    } else if (val.includes('youtube.com') || val.includes('youtu.be')) {
                      try {
                        const url = new URL(val);
                        if (url.hostname.includes('youtube.com')) {
                          val = url.searchParams.get('v') || val.split('/').pop() || val;
                        } else if (url.hostname.includes('youtu.be')) {
                          val = url.pathname.slice(1);
                        }
                      } catch (e) {
                        // fallback to original val
                      }
                    }
                    
                    if (val.includes('?')) val = val.split('?')[0];
                    if (val.includes('&')) val = val.split('&')[0];
                    
                    setNewVideo({ ...newVideo, youtubeId: val });
                  }}
                  className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl font-bold h-11"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="video-category" className="font-bold text-slate-700 dark:text-slate-300">Category</Label>
                <Select
                  value={newVideo.category}
                  onValueChange={(value: any) => setNewVideo({ ...newVideo, category: value })}
                >
                  <SelectTrigger id="video-category" className="w-full h-11 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 font-bold text-slate-700 dark:text-white focus:ring-red-500 shadow-sm transition-all hover:border-slate-300">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 shadow-xl p-1">
                    <SelectItem value="kids" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-700 focus:text-red-600 dark:focus:text-red-400 transition-colors cursor-pointer py-2.5">
                      Kids
                    </SelectItem>
                    <SelectItem value="professional" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-700 focus:text-red-600 dark:focus:text-red-400 transition-colors cursor-pointer py-2.5">
                      Professional
                    </SelectItem>
                    <SelectItem value="adult" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-700 focus:text-red-600 dark:focus:text-red-400 transition-colors cursor-pointer py-2.5">
                      Adult
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-duration" className="font-bold text-slate-700 dark:text-slate-300">Duration</Label>
                <Input
                  id="video-duration"
                  placeholder="e.g., 5:30"
                  value={newVideo.duration}
                  onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })}
                  className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl font-bold h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-active" className="font-bold text-slate-700 dark:text-slate-300">Status</Label>
                <Select
                  value={newVideo.isActive ? "active" : "inactive"}
                  onValueChange={(value) => setNewVideo({ ...newVideo, isActive: value === "active" })}
                >
                  <SelectTrigger id="video-active" className="w-full h-11 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 font-bold text-slate-700 dark:text-white focus:ring-red-500 shadow-sm transition-all hover:border-slate-300">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 shadow-xl p-1">
                    <SelectItem value="active" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-700 focus:text-red-600 dark:focus:text-red-400 transition-colors cursor-pointer py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="inactive" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-700 focus:text-red-600 dark:focus:text-red-400 transition-colors cursor-pointer py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-slate-400" />
                        Inactive
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-description" className="font-bold text-slate-700 dark:text-slate-300">Description</Label>
              <Textarea
                id="video-description"
                placeholder="Short description of the video content"
                rows={3}
                value={newVideo.description}
                onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl resize-none font-medium"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-2 mt-auto">
            <button
              type="button"
              onClick={handleAddVideo}
              className="inline-flex items-center justify-center bg-[#d60000] hover:bg-red-500 text-white font-extrabold px-6 pb-2.5 pt-3 rounded-xl text-sm shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all cursor-pointer"
            >
              <Plus className="h-5 w-5 mr-2" strokeWidth={2.5} />
              Add Video
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

      <div className="grid grid-cols-1 gap-6">
        <SortableContentList
          title="Current Videos in Kids"
          description={`${videos.filter(v => v.category === 'kids').length} videos in collection • Drag to reorder`}
          items={videos.filter(v => v.category === 'kids')}
          onReorder={(newOrder) => handleReorderVideos(newOrder as Video[])}
          onDelete={handleDeleteVideo}
          renderContent={(video) => (
            <div className="flex flex-col gap-1 min-w-0 pr-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-black text-sm sm:text-base text-slate-800 dark:text-white leading-snug break-words [word-break:break-word]">
                  {video.title}
                </h4>
                {video.duration && (
                  <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shrink-0">
                    {video.duration}
                  </span>
                )}
              </div>
              {video.description && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed break-words [word-break:break-word] line-clamp-2 mt-0.5">
                  {video.description}
                </p>
              )}
            </div>
          )}
        />

        <SortableContentList
          title="Current Videos in Professional"
          description={`${videos.filter(v => v.category === 'professional').length} videos in collection • Drag to reorder`}
          items={videos.filter(v => v.category === 'professional')}
          onReorder={(newOrder) => handleReorderVideos(newOrder as Video[])}
          onDelete={handleDeleteVideo}
          renderContent={(video) => (
            <div className="flex flex-col gap-1 min-w-0 pr-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-black text-sm sm:text-base text-slate-800 dark:text-white leading-snug break-words [word-break:break-word]">
                  {video.title}
                </h4>
                {video.duration && (
                  <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shrink-0">
                    {video.duration}
                  </span>
                )}
              </div>
              {video.description && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed break-words [word-break:break-word] line-clamp-2 mt-0.5">
                  {video.description}
                </p>
              )}
            </div>
          )}
        />

        <SortableContentList
          title="Current Videos in Adults"
          description={`${videos.filter(v => v.category === 'adult').length} videos in collection • Drag to reorder`}
          items={videos.filter(v => v.category === 'adult')}
          onReorder={(newOrder) => handleReorderVideos(newOrder as Video[])}
          onDelete={handleDeleteVideo}
          renderContent={(video) => (
            <div className="flex flex-col gap-1 min-w-0 pr-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-black text-sm sm:text-base text-slate-800 dark:text-white leading-snug break-words [word-break:break-word]">
                  {video.title}
                </h4>
                {video.duration && (
                  <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shrink-0">
                    {video.duration}
                  </span>
                )}
              </div>
              {video.description && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed break-words [word-break:break-word] line-clamp-2 mt-0.5">
                  {video.description}
                </p>
              )}
            </div>
          )}
        />
      </div>
    </div>
  )
}
