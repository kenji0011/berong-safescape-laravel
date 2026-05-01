import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, CheckCircle, AlertCircle } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"
import { SortableContentList } from "@/components/sortable-content-list"
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
          description="Upload an image to generate a URL for the blog post"
          onUploadComplete={(url) => setNewBlog({ ...newBlog, imageUrl: url })}
        />

        <Card className="rounded-[1.5rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-[0_4px_0_#e2e8f0] dark:hover:shadow-[0_4px_0_#0f172a] overflow-hidden bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md transition-all h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800 dark:text-white">Add New Blog Post</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">Create educational content for adult and professional sections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blog-title" className="font-bold text-slate-700 dark:text-slate-300">Title</Label>
                  <Input
                    id="blog-title"
                    placeholder="Blog post title"
                    value={newBlog.title}
                    onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                    className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blog-category" className="font-bold text-slate-700 dark:text-slate-300">Category</Label>
                  <Select
                    value={newBlog.category}
                    onValueChange={(value: any) => setNewBlog({ ...newBlog, category: value })}
                  >
                    <SelectTrigger id="blog-category" className="w-full border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 font-bold text-slate-700 dark:text-white focus:ring-red-500 shadow-sm transition-all hover:border-slate-300">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 shadow-xl p-1">
                      <SelectItem value="adult" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-700 focus:text-red-600 dark:focus:text-red-400 transition-colors cursor-pointer py-2.5">
                        Adult
                      </SelectItem>
                      <SelectItem value="professional" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-700 focus:text-red-600 dark:focus:text-red-400 transition-colors cursor-pointer py-2.5">
                        Professional
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
                  className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl"
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
                  className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl resize-none"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <button
                type="button"
                onClick={handleAddBlog}
                className="inline-flex items-center justify-center bg-[#d60000] text-white font-extrabold px-6 pb-2.5 pt-3 rounded-xl text-sm shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all"
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
          </CardContent>
        </Card>
      </div>

      <SortableContentList
        title="Current Blog Posts"
        description={`${blogPosts.length} posts published`}
        items={blogPosts}
        onReorder={(newOrder) => handleReorderBlogs(newOrder as BlogPost[])}
        onDelete={handleDeleteBlog}
        renderContent={(blog) => (
          <div className="flex flex-col">
            <h4 className="font-semibold text-slate-800 dark:text-white truncate">{blog.title}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{blog.excerpt}</p>
          </div>
        )}
      />
    </div>
  )
}
