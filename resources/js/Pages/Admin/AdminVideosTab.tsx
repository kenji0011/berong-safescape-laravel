import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, CheckCircle, AlertCircle } from "lucide-react"
import { SortableContentList } from "@/components/sortable-content-list"
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
      <Card className="rounded-[1.5rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-[0_4px_0_#e2e8f0] dark:hover:shadow-[0_4px_0_#0f172a] overflow-hidden bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md transition-all mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800 dark:text-white">Add New Video</CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">Add YouTube educational videos to different sections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="video-title" className="font-bold text-slate-700 dark:text-slate-300">Title</Label>
              <Input
                id="video-title"
                placeholder="Video title"
                value={newVideo.title}
                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl"
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
                  const match = val.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\n]+)/);
                  if (match && match[1]) {
                    val = match[1];
                  }
                  setNewVideo({ ...newVideo, youtubeId: val });
                }}
                className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl"
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
                <SelectTrigger id="video-category" className="w-full h-10 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 font-bold text-slate-700 dark:text-white focus:ring-red-500 shadow-sm transition-all hover:border-slate-300">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 shadow-xl p-1">
                  <SelectItem value="kids" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-700 focus:text-red-600 dark:focus:text-red-400 transition-colors cursor-pointer py-2.5">
                    Kids
                  </SelectItem>
                  <SelectItem value="adult" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-700 focus:text-red-600 dark:focus:text-red-400 transition-colors cursor-pointer py-2.5">
                    Adult
                  </SelectItem>
                  <SelectItem value="professional" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-700 focus:text-red-600 dark:focus:text-red-400 transition-colors cursor-pointer py-2.5">
                    Professional
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
                className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-active" className="font-bold text-slate-700 dark:text-slate-300">Status</Label>
              <Select
                value={newVideo.isActive ? "active" : "inactive"}
                onValueChange={(value) => setNewVideo({ ...newVideo, isActive: value === "active" })}
              >
                <SelectTrigger id="video-active" className="w-full h-10 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 font-bold text-slate-700 dark:text-white focus:ring-red-500 shadow-sm transition-all hover:border-slate-300">
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
              className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl resize-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <button
              type="button"
              onClick={handleAddVideo}
              className="inline-flex items-center justify-center bg-[#d60000] text-white font-extrabold px-6 pb-2.5 pt-3 rounded-xl text-sm shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all"
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
        </CardContent>
      </Card>

      <SortableContentList
        title="Current Videos"
        description={`${videos.length} videos in collection`}
        items={videos}
        onReorder={(newOrder) => handleReorderVideos(newOrder as Video[])}
        onDelete={handleDeleteVideo}
        renderContent={(video) => (
          <div className="flex flex-col">
            <h4 className="font-semibold text-slate-800 dark:text-white truncate">{video.title}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md border border-slate-200 dark:border-slate-700">
                {video.category}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {video.duration}
              </span>
            </div>
          </div>
        )}
      />
    </div>
  )
}
