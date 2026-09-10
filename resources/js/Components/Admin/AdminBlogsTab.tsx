import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Label } from "@/Components/ui/label"
import { Input } from "@/Components/ui/input"
import { Textarea } from "@/Components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Plus, CheckCircle, AlertCircle } from "lucide-react"
import { ImageUpload } from "@/Components/ui/image-upload"
import { SortableContentList } from "@/Components/sortable-content-list"
import type { BlogsTabProps, BlogPost } from "@/types/admin"

export const AdminBlogsTab: React.FC<BlogsTabProps> = ({
  blogPosts,
  newBlog,
  setNewBlog,
  blogUploadKey,
  handleAddBlog,
  handleDeleteBlog,
  handleReorderBlogs,
  success,
  error
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImageUpload
          key={blogUploadKey}
          title="Upload Blog Image"
          description="Upload an image for your blog post"
          enableCropping={false}
          recommendedResolution="1200 × 630 PX (High Quality)"
          minWidth={1200}
          minHeight={630}
          onUploadComplete={(url) => setNewBlog({ ...newBlog, imageUrl: url })}
        />

        <div className="rounded-[1.75rem] sm:rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] overflow-hidden bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md transition-all h-full flex flex-col p-6 sm:p-7 md:p-8 gap-5 sm:gap-6">
          {/* Header Row */}
          <div className="flex items-center gap-3">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 p-2 sm:p-2.5 rounded-xl shadow-sm shrink-0">
              <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-[#d60000]" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white tracking-tight">Add New Blog Post</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">Create educational content for adult and professional sections</p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blog-title" className="font-bold text-slate-700 dark:text-slate-300">Title</Label>
                  <Input
                    id="blog-title"
                    placeholder="Blog post title"
                    value={newBlog.title}
                    onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                    className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl font-bold h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blog-category" className="font-bold text-slate-700 dark:text-slate-300">Category</Label>
                  <Select
                    value={newBlog.category}
                    onValueChange={(value: any) => setNewBlog({ ...newBlog, category: value })}
                  >
                    <SelectTrigger id="blog-category" className="w-full h-11 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 font-bold text-slate-700 dark:text-white focus:ring-red-500 shadow-sm transition-all hover:border-slate-300">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 shadow-xl p-1">
                      <SelectItem value="adult" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-700 focus:text-red-600 dark:focus:text-red-400 transition-colors cursor-pointer py-2.5">
                        Adult
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-excerpt" className="font-bold text-slate-700 dark:text-slate-300">Excerpt</Label>
                <Input
                  id="blog-excerpt"
                  placeholder="Short summary for the card"
                  value={newBlog.excerpt}
                  onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                  className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl font-bold h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-content" className="font-bold text-slate-700 dark:text-slate-300">Content</Label>
                <Textarea
                  id="blog-content"
                  placeholder="Full blog post content (Markdown supported)"
                  rows={4}
                  value={newBlog.content}
                  onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                  className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl resize-none font-medium"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2 mt-auto">
              <button
                type="button"
                onClick={handleAddBlog}
                className="inline-flex items-center justify-center bg-[#d60000] hover:bg-red-500 text-white font-extrabold px-6 pb-2.5 pt-3 rounded-xl text-sm shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all cursor-pointer"
              >
                <Plus className="h-5 w-5 mr-2" strokeWidth={2.5} />
                Add Post
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

      <SortableContentList
        title="Current Blog Posts"
        description={`${blogPosts.length} posts published • Drag to reorder`}
        items={blogPosts}
        onReorder={(newOrder) => handleReorderBlogs(newOrder as BlogPost[])}
        onDelete={handleDeleteBlog}
        renderContent={(blog) => (
          <div className="flex flex-col gap-1 min-w-0 pr-1">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className="inline-flex items-center text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-lg border shadow-2xs bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-500/20">
                {blog.category || "Adult"}
              </span>
            </div>
            <h4 className="font-black text-sm sm:text-base text-slate-800 dark:text-white leading-snug break-words [word-break:break-word]">
              {blog.title}
            </h4>
            {blog.excerpt && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed break-words [word-break:break-word] line-clamp-2 mt-0.5">
                {blog.excerpt}
              </p>
            )}
          </div>
        )}
      />
    </div>
  )
}
