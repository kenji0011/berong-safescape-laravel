"use client";

import { apiFetch, getApiErrorMessage } from "@/lib/api-fetch";
import { useAdminFeedback } from "@/hooks/use-admin-feedback";

import React, { useEffect, useState, lazy, Suspense } from "react"
import { router, usePage } from '@inertiajs/react';
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, BarChart3, ImageIcon, FileText, Video, Users, HelpCircle, BookOpen, Loader2, AlertCircle } from "lucide-react"
import { motion } from "motion/react"
import type { CarouselImage, BlogPost } from "@/types/admin"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
import { Card, CardTitle, CardHeader, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Lazy load admin tabs
const AdminCarouselTab = lazy(() => import("./Admin/AdminCarouselTab").then(m => ({ default: m.AdminCarouselTab })))
const AdminBlogsTab = lazy(() => import("./Admin/AdminBlogsTab").then(m => ({ default: m.AdminBlogsTab })))
const AdminVideosTab = lazy(() => import("./Admin/AdminVideosTab").then(m => ({ default: m.AdminVideosTab })))
const AdminUsersTab = lazy(() => import("./Admin/AdminUsersTab").then(m => ({ default: m.AdminUsersTab })))
const AdminQuestionsTab = lazy(() => import("./Admin/AdminQuestionsTab").then(m => ({ default: m.AdminQuestionsTab })))
const AdminFireCodesTab = lazy(() => import("./Admin/AdminFireCodesTab").then(m => ({ default: m.AdminFireCodesTab })))

const TabLoading = () => (
  <div className="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 animate-pulse">
    <Loader2 className="h-10 w-10 text-[#d60000] animate-spin mb-4" />
    <p className="text-slate-500 dark:text-slate-400 font-bold">Synchronizing Terminal Data...</p>
  </div>
)

import { useAdminData } from "@/hooks/use-admin-data"
import { normalizeCarouselImage, normalizeBlogPost, normalizeVideo } from "@/lib/admin-utils"

function AdminDashboard({
  initialCarouselImages,
  initialBlogPosts,
  initialVideos,
  initialUsers,
  initialQuickQuestions,
  initialFireCodeSections,
}: any) {
  
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { success, error, setSuccess, setError } = useAdminFeedback()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittingMessage, setSubmittingMessage] = useState("")

  // Centralized Data Hook
  const {
    carouselImages, setCarouselImages, loadCarouselImages,
    blogPosts, setBlogPosts, loadBlogPosts,
    videos, setVideos, loadVideos,
    users, setUsers, loadUsers,
    quickQuestions, setQuickQuestions, loadQuickQuestions,
    fireCodeSections, setFireCodeSections, loadFireCodeSections,
    refreshAll,
    loading: dataLoading
  } = useAdminData({
    initialCarouselImages,
    initialBlogPosts,
    initialVideos,
    initialUsers,
    initialQuickQuestions,
    initialFireCodeSections,
  })

  // Local UI State for forms
  const [activeTab, setActiveTab] = useState("carousel")
  const [newCarousel, setNewCarousel] = useState({ title: "", alt: "", url: "" })
  const [carouselUploadKey, setCarouselUploadKey] = useState(0)

  const [newBlog, setNewBlog] = useState({
    title: "",
    excerpt: "",
    content: "",
    imageUrl: "",
    category: "adult" as "adult" | "professional",
  })
  const [blogUploadKey, setBlogUploadKey] = useState(0)

  const [newVideo, setNewVideo] = useState({
    title: "",
    description: "",
    youtubeId: "",
    category: "professional" as "professional" | "adult" | "kids",
    duration: "",
    isActive: true
  })

  const [userSearchQuery, setUserSearchQuery] = useState("")
  const filteredUsers = users.filter((user) =>
    (user.name && user.name.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
    (user.role && user.role.toLowerCase().includes(userSearchQuery.toLowerCase()))
  )

  const [newQuickQuestion, setNewQuickQuestion] = useState({
    category: "emergency",
    questionText: "",
    responseText: "",
    isActive: true
  })

  const [newFireCode, setNewFireCode] = useState({
    title: "",
    category: "Policy",
    sectionNum: "",
    content: "",
    description: "",
    filename: "",
    parentSectionId: ""
  })

  // Confirmation Dialog State
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: "",
    description: "",
    action: "",
    item: null as any,
    onConfirm: () => { },
    variant: 'default' as 'default' | 'destructive',
  });

  const openConfirmationDialog = (title: string, description: string, action: string, onConfirm: () => void, item: any = null, variant: 'default' | 'destructive' = 'default') => {
    setConfirmationDialog({
      isOpen: true,
      title,
      description,
      action,
      item,
      onConfirm,
      variant,
    } as any);
  };

  const closeConfirmationDialog = () => {
    setConfirmationDialog({
      ...confirmationDialog,
      isOpen: false,
    });
  };

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      router.visit("/login")
      return
    }

    if (!user?.permissions.isAdmin) {
      router.visit("/")
      return
    }

    // Only fetch if initial data is missing
    if (!initialCarouselImages) {
      refreshAll()
    }
  }, [isAuthenticated, user, authLoading, initialCarouselImages, refreshAll])

  const handleAddQuickQuestion = () => {
    if (!newQuickQuestion.questionText || !newQuickQuestion.responseText || !newQuickQuestion.category) {
      setError("Please fill all quick question fields")
      return
    }

    openConfirmationDialog(
      "Add Quick Question",
      "Are you sure you want to add this quick question?",
      "add-quick-question",
      async () => {
        try {
          setIsSubmitting(true);
          setSubmittingMessage("Adding quick question...");
          closeConfirmationDialog();

          const response = await apiFetch('/api/admin/quick-questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newQuickQuestion),
          })

          if (response.ok) {
            await loadQuickQuestions()
            setNewQuickQuestion({ category: "emergency", questionText: "", responseText: "", isActive: true })
            setSuccess("Quick question added successfully")
          } else {
            const errorData = await response.json()
            setError(errorData.error || "Failed to add quick question")
          }
        } catch (error) {
          console.error('Error adding quick question:', error)
          setError("Network error occurred")
        } finally {
          setIsSubmitting(false);
        }
      }
    );
  }

  const handleDeleteQuickQuestion = (id: number) => {
    openConfirmationDialog(
      "Delete Quick Question",
      "Are you sure you want to delete this quick question? This action cannot be undone.",
      "delete-quick-question",
      async () => {
        try {
          const response = await apiFetch(`/api/admin/quick-questions/${id}`, { method: 'DELETE' })
          if (response.ok) {
            await loadQuickQuestions()
            setSuccess("Quick question deleted")
          } else {
            setError("Failed to delete quick question")
          }
        } catch (error) {
          console.error('Error deleting quick question:', error)
          setError("Network error occurred")
        } finally {
          closeConfirmationDialog();
        }
      },
      null,
      "destructive"
    );
  }

  const handleAddCarousel = () => {
    if (!newCarousel.title || !newCarousel.alt || !newCarousel.url) {
      setError("Please fill all carousel fields")
      return
    }

    openConfirmationDialog(
      "Add Carousel Image",
      "Are you sure you want to add this carousel image?",
      "add-carousel-image",
      async () => {
        try {
          setIsSubmitting(true);
          setSubmittingMessage("Adding carousel image...");
          closeConfirmationDialog();

          const response = await apiFetch('/api/admin/carousel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCarousel),
          })

          if (response.ok) {
            await loadCarouselImages()
            setNewCarousel({ title: "", alt: "", url: "" })
            setCarouselUploadKey(prev => prev + 1)
            setSuccess("Carousel image added successfully")
          } else {
            const errorData = await response.json()
            setError(getApiErrorMessage(errorData, "Failed to add carousel image"))
          }
        } catch (error) {
          console.error('Error adding carousel image:', error)
          setError("Network error occurred")
        } finally {
          setIsSubmitting(false);
        }
      }
    );
  }

  const handleDeleteCarousel = (id: string | number) => {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      setError("Invalid carousel image ID");
      return;
    }

    openConfirmationDialog(
      "Delete Carousel Image",
      "Are you sure you want to delete this carousel image? This action cannot be undone.",
      "delete-carousel-image",
      async () => {
        try {
          const response = await apiFetch(`/api/admin/carousel/${numericId}`, { method: 'DELETE' })
          if (response.ok) {
            await loadCarouselImages()
            setSuccess("Carousel image deleted")
          } else {
            setError("Failed to delete carousel image")
          }
        } catch (error) {
          console.error('Error deleting carousel image:', error)
          setError("Network error occurred")
        } finally {
          closeConfirmationDialog();
        }
      },
      { id: numericId },
      "destructive"
    );
  }

  const handleReorderCarousel = async (newOrder: CarouselImage[]) => {
    try {
      const imageIds = newOrder.map((img) => img.id)
      const response = await apiFetch('/api/admin/carousel/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds }),
      })

      if (!response.ok) throw new Error('Failed to reorder')

      const payload = await response.json()
      const updated = Array.isArray(payload) ? payload : payload?.images ?? []
      setCarouselImages(updated.map(normalizeCarouselImage))
      setSuccess('Carousel order updated')
    } catch (error) {
      console.error('Error reordering:', error)
      setError('Failed to update order')
      await loadCarouselImages()
      throw error
    }
  }

  const handleReorderBlogs = async (newOrder: BlogPost[]) => {
    try {
      const blogIds = newOrder.map((blog) => blog.id)
      const response = await apiFetch('/api/admin/blogs/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogIds }),
      })

      if (!response.ok) throw new Error('Failed to reorder')

      const payload = await response.json()
      const updated = Array.isArray(payload) ? payload : []
      setBlogPosts(updated.length > 0 ? updated.map(normalizeBlogPost) : newOrder)
      setSuccess('Blog order updated')
    } catch (error) {
      console.error('Error reordering blogs:', error)
      setError('Failed to update blog order')
      await loadBlogPosts()
      throw error
    }
  }

  const handleReorderVideos = async (newOrder: any[]) => {
    try {
      const videoIds = newOrder.map((video) => video.id)
      const response = await apiFetch('/api/admin/videos/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoIds }),
      })

      if (!response.ok) throw new Error('Failed to reorder')

      const payload = await response.json()
      const updated = Array.isArray(payload) ? payload : []
      setVideos(updated.length > 0 ? updated.map(normalizeVideo) : newOrder)
      setSuccess('Video order updated')
    } catch (error) {
      console.error('Error reordering videos:', error)
      setError('Failed to update video order')
      await loadVideos()
      throw error
    }
  }

  const handleAddBlog = () => {
    if (!newBlog.title || !newBlog.excerpt || !newBlog.content) {
      setError("Please fill all blog fields")
      return
    }

    openConfirmationDialog(
      "Add Blog Post",
      "Are you sure you want to add this blog post?",
      "add-blog-post",
      async () => {
        try {
          setIsSubmitting(true);
          setSubmittingMessage("Adding blog post...");
          closeConfirmationDialog();

          const blogData = {
            ...newBlog,
            authorId: user?.id || 1,
          }

          const response = await apiFetch('/api/admin/blogs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(blogData),
          })

          if (response.ok) {
            await loadBlogPosts()
            
            if (typeof window !== 'undefined') {
              const saved = localStorage.getItem('safescape_mock_notifications');
              const notifs = saved ? JSON.parse(saved) : [];
              notifs.unshift({
                id: Date.now() + Math.floor(Math.random() * 1000), 
                title: "New Article Published",
                message: `A new article "${newBlog.title}" has been published to the Adult dashboard.`,
                type: "blog",
                category: "adult",
                isRead: false,
                createdAt: new Date().toISOString()
              });
              localStorage.setItem('safescape_mock_notifications', JSON.stringify(notifs));
              window.dispatchEvent(new Event('safescape_notifications_updated'));
            }

            setNewBlog({ title: "", excerpt: "", content: "", imageUrl: "", category: "adult" })
            setBlogUploadKey(prev => prev + 1)
            setSuccess("Blog post added successfully")
          } else {
            const errorData = await response.json()
            setError(errorData.error || "Failed to add blog post")
          }
        } catch (error) {
          console.error('Error adding blog post:', error)
          setError("Network error occurred")
        } finally {
          setIsSubmitting(false);
        }
      }
    );
  }

  const handleDeleteBlog = (id: string | number) => {
    openConfirmationDialog(
      "Delete Blog Post",
      "Are you sure you want to delete this blog post? This action cannot be undone.",
      "delete-blog-post",
      async () => {
        try {
          const response = await apiFetch(`/api/admin/blogs/${id}`, { method: 'DELETE' })
          if (response.ok) {
            await loadBlogPosts()
            setSuccess("Blog post deleted")
          } else {
            setError("Failed to delete blog post")
          }
        } catch (error) {
          console.error('Error deleting blog post:', error)
          setError("Network error occurred")
        } finally {
          closeConfirmationDialog();
        }
      },
      { id },
      "destructive"
    );
  }

  const handleAddVideo = () => {
    if (!newVideo.title || !newVideo.youtubeId || !newVideo.category) {
      setError("Please fill all video fields");
      return;
    }

    openConfirmationDialog(
      "Add Video",
      "Are you sure you want to add this video?",
      "add-video",
      async () => {
        try {
          setIsSubmitting(true);
          setSubmittingMessage("Adding video...");
          closeConfirmationDialog();

          const response = await apiFetch('/api/admin/videos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newVideo),
          });

          if (response.ok) {
            await loadVideos();
            
            if (typeof window !== 'undefined') {
              const saved = localStorage.getItem('safescape_mock_notifications');
              const notifs = saved ? JSON.parse(saved) : [];
              notifs.unshift({
                id: Date.now() + Math.floor(Math.random() * 1000), 
                title: "New Video Added",
                message: `A new video "${newVideo.title}" has been added to the ${newVideo.category} dashboard.`,
                type: "video",
                category: newVideo.category,
                isRead: false,
                createdAt: new Date().toISOString()
              });
              localStorage.setItem('safescape_mock_notifications', JSON.stringify(notifs));
              window.dispatchEvent(new Event('safescape_notifications_updated'));
            }

            setNewVideo({ title: "", description: "", youtubeId: "", category: "professional", duration: "", isActive: true });
            setSuccess("Video added successfully");
          } else {
            const errorData = await response.json();
            setError(errorData.error || "Failed to add video");
          }
        } catch (error) {
          console.error('Error adding video:', error);
          setError("Network error occurred");
        } finally {
          setIsSubmitting(false);
        }
      }
    );
  }

  const handleDeleteVideo = (id: string | number) => {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      setError("Invalid video ID");
      return;
    }

    openConfirmationDialog(
      "Delete Video",
      "Are you sure you want to delete this video? This action cannot be undone.",
      "delete-video",
      async () => {
        try {
          const response = await apiFetch(`/api/admin/videos/${numericId}`, { method: 'DELETE' });
          if (response.ok) {
            await loadVideos();
            setSuccess("Video deleted");
          } else {
            setError("Failed to delete video");
          }
        } catch (error) {
          console.error('Error deleting video:', error);
          setError("Network error occurred")
        } finally {
          closeConfirmationDialog();
        }
      },
      { id: numericId },
      "destructive"
    );
  }

  const [roleChangeDialog, setRoleChangeDialog] = useState({
    isOpen: false,
    userId: "",
    permission: "",
    userName: "",
    action: "add",
  })
  const [roleChangePassword, setRoleChangePassword] = useState("")
  const [roleChangeError, setRoleChangeError] = useState("")
  const [roleChangeLoading, setRoleChangeLoading] = useState(false)

  const promptRoleChange = (userId: string, permission: string, userName: string, action: string = "add") => {
    setRoleChangeDialog({ isOpen: true, userId, permission, userName, action })
    setRoleChangePassword("")
    setRoleChangeError("")
  }

  const closeRoleChangeDialog = () => {
    setRoleChangeDialog({ isOpen: false, userId: "", permission: "", userName: "", action: "add" })
    setRoleChangePassword("")
    setRoleChangeError("")
  }

  const handleConfirmRoleChange = async () => {
    if (!roleChangePassword) {
      setRoleChangeError("Please enter your password")
      return
    }

    setRoleChangeLoading(true)
    setRoleChangeError("")

    try {
      const response = await apiFetch(`/api/admin/users/${roleChangeDialog.userId}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permission: roleChangeDialog.permission,
          action: roleChangeDialog.action,
          adminPassword: roleChangePassword,
        }),
      })

      if (response.ok) {
        await loadUsers()
        setSuccess("User permissions updated")
        closeRoleChangeDialog()
      } else {
        const data = await response.json()
        setRoleChangeError(data.error || "Failed to update user permissions")
      }
    } catch (error) {
      console.error('Error updating user permissions:', error)
      setRoleChangeError("Network error occurred")
    } finally {
      setRoleChangeLoading(false)
    }
  }

  const handleAddFireCode = () => {
    if (!newFireCode.title || !newFireCode.category) {
      setError("Please fill in the title and category")
      return
    }

    if (!newFireCode.filename) {
      setError("Please upload a manual/fire code file or enter a filename")
      return
    }

    openConfirmationDialog(
      "Add Manual / Fire Code",
      "Are you sure you want to add this manual or fire code?",
      "add-fire-code",
      async () => {
        try {
          setIsSubmitting(true);
          setSubmittingMessage("Adding manual/fire code...");
          closeConfirmationDialog();

          const response = await apiFetch('/api/admin/fire-codes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newFireCode),
          })

          if (response.ok) {
            await loadFireCodeSections()
            setNewFireCode({
              title: "",
              category: "Policy",
              sectionNum: "",
              content: "",
              description: "",
              filename: "",
              parentSectionId: ""
            })
            setSuccess("Manual / Fire Code added successfully")
          } else {
            const errorData = await response.json()
            setError(errorData.error || "Failed to add manual / fire code")
          }
        } catch (error) {
          console.error('Error adding section:', error)
          setError("Network error occurred")
        } finally {
          setIsSubmitting(false);
        }
      }
    );
  }

  const handleDeleteFireCode = (id: number) => {
    openConfirmationDialog(
      "Delete Manual / Fire Code",
      "Are you sure you want to delete this manual or fire code? This action cannot be undone.",
      "delete-fire-code",
      async () => {
        try {
          const response = await apiFetch(`/api/admin/fire-codes/${id}`, { method: 'DELETE' })
          if (response.ok) {
            await loadFireCodeSections()
            setSuccess("Deleted successfully")
          } else {
            setError("Failed to delete")
          }
        } catch (error) {
          console.error('Error deleting section:', error)
          setError("Network error occurred")
        } finally {
          closeConfirmationDialog();
        }
      },
      { id },
      "destructive"
    );
  }

  if (dataLoading) {
    return (
      <div className="flex items-col items-center justify-center h-96 gap-4">
        <Loader2 className="h-10 w-10 text-[#d60000] animate-spin" />
        <p className="text-muted-foreground font-bold">Synchronizing Terminal Data...</p>
      </div>
    )
  }

  const commonProps = {
    success,
    error,
    setSuccess,
    setError,
    setIsSubmitting,
    setSubmittingMessage,
    openConfirmationDialog,
    closeConfirmationDialog,
  }

  return (
    <div className="min-h-screen relative transition-colors duration-500">
      <div className="fixed inset-0 bg-slate-50/40 dark:bg-slate-950/50 z-0 transition-colors duration-500" />

      <LoadingOverlay isLoading={isSubmitting} message={submittingMessage} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
        <div className="mb-4 sm:mb-8 bg-white/90 dark:bg-slate-800/50 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-[0_6px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] sm:shadow-[0_8px_0_#cbd5e1] flex items-center justify-between gap-3 transition-colors">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-0.5 sm:mb-1">
              <div className="bg-red-100/50 dark:bg-red-900/30 p-2 sm:p-2 rounded-lg sm:rounded-xl backdrop-blur-sm">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-[#d60000] dark:text-red-500" strokeWidth={2.5} />
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight truncate">Admin Panel</h1>
            </div>
            <p className="text-xs sm:text-base text-slate-500 dark:text-slate-400 font-bold leading-tight line-clamp-1 transition-colors">Manage content, users, and platform settings</p>
          </div>
          <button
            onClick={() => router.visit("/admin/analytics")}
            className="flex items-center gap-1.5 sm:gap-2 bg-[#ff6b00] text-white font-black px-4 sm:px-6 pb-2 pt-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-base shadow-[0_4px_0_#c2410c] sm:shadow-[0_6px_0_#c2410c] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#c2410c] active:translate-y-1 active:shadow-none transition-all shrink-0"
          >
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
            <span className="hidden sm:inline">Community Analytics</span>
            <span className="sm:hidden">Analytics</span>
          </button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex w-full sm:grid sm:grid-cols-6 bg-slate-200/70 dark:bg-slate-800/50 backdrop-blur-md p-2 rounded-[1.5rem] gap-2 shadow-inner h-auto border-2 border-slate-200 dark:border-slate-700 transition-colors">
            {[
              { id: "carousel", icon: ImageIcon, label: "Carousel" },
              { id: "blogs", icon: FileText, label: "Blogs" },
              { id: "videos", icon: Video, label: "Videos" },
              { id: "users", icon: Users, label: "Users" },
              { id: "quick-questions", icon: HelpCircle, label: "Q&A" },
              { id: "fire-codes", icon: BookOpen, label: "Manuals" }
            ].map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="relative flex-1 font-bold text-slate-500 dark:text-slate-400 transition-colors duration-300 rounded-xl py-3 px-2 sm:px-4 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200 data-[state=active]:!text-white data-[state=active]:hover:!text-white !bg-transparent data-[state=active]:!bg-transparent data-[state=active]:!shadow-none"
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeAdminTab"
                    className="absolute inset-0 bg-[#d60000] rounded-xl shadow-[0_4px_0_#991b1b]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center">
                  <tab.icon className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2" strokeWidth={2.5} />
                  <span className="hidden sm:inline text-sm">{tab.label}</span>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <ConfirmationDialog
            isOpen={confirmationDialog.isOpen}
            onClose={closeConfirmationDialog}
            onConfirm={confirmationDialog.onConfirm}
            title={confirmationDialog.title}
            description={confirmationDialog.description}
            variant={confirmationDialog.variant}
          />

          <AlertDialog open={roleChangeDialog.isOpen} onOpenChange={(open) => { if (!open && !roleChangeLoading) closeRoleChangeDialog() }}>
            <AlertDialogContent className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border-[3px] border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Verify Admin Password</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500 dark:text-slate-400 font-bold text-sm mt-2">
                  Enter your admin password to {roleChangeDialog.action === 'remove' ? 'remove' : 'grant'} the <strong className="text-slate-800 dark:text-white font-extrabold">{roleChangeDialog.permission}</strong> permission for <strong className="text-slate-800 dark:text-white font-extrabold">{roleChangeDialog.userName}</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-3">
                <Label htmlFor="role-change-password" className="font-bold text-slate-700 dark:text-slate-300">Password</Label>
                <Input
                  id="role-change-password"
                  type="password"
                  placeholder="Enter your password"
                  value={roleChangePassword}
                  autoComplete="new-password"
                  onChange={(e) => {
                    setRoleChangePassword(e.target.value)
                    setRoleChangeError("")
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmRoleChange() }}
                  autoFocus
                  className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl mt-1.5"
                />
                {roleChangeError && <p className="text-sm font-bold text-red-600 dark:text-red-400 mt-2 flex items-center gap-1.5"><AlertCircle className="h-4 w-4"/> {roleChangeError}</p>}
              </div>
              <AlertDialogFooter className="gap-3 mt-4">
                <Button 
                  variant="outline" 
                  onClick={closeRoleChangeDialog} 
                  disabled={roleChangeLoading}
                  className="rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all h-11"
                >
                  Cancel
                </Button>
                <button 
                  onClick={handleConfirmRoleChange} 
                  disabled={roleChangeLoading || !roleChangePassword}
                  className="rounded-xl font-black h-11 px-6 transition-all shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-none bg-[#d60000] text-white hover:bg-red-500 border-none disabled:opacity-50"
                >
                  {roleChangeLoading ? 'Verifying...' : 'Confirm Change'}
                </button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Suspense fallback={<TabLoading />}>
            <TabsContent value="carousel">
              <AdminCarouselTab
                {...commonProps}
                carouselImages={carouselImages}
                newCarousel={newCarousel}
                setNewCarousel={setNewCarousel}
                carouselUploadKey={carouselUploadKey}
                handleAddCarousel={handleAddCarousel}
                handleDeleteCarousel={handleDeleteCarousel}
                handleReorderCarousel={handleReorderCarousel}
              />
            </TabsContent>

            <TabsContent value="blogs">
              <AdminBlogsTab
                {...commonProps}
                blogPosts={blogPosts}
                newBlog={newBlog}
                setNewBlog={setNewBlog}
                blogUploadKey={blogUploadKey}
                handleAddBlog={handleAddBlog}
                handleDeleteBlog={handleDeleteBlog}
                handleReorderBlogs={handleReorderBlogs}
              />
            </TabsContent>

            <TabsContent value="videos">
              <AdminVideosTab
                {...commonProps}
                videos={videos}
                newVideo={newVideo}
                setNewVideo={setNewVideo}
                handleAddVideo={handleAddVideo}
                handleDeleteVideo={handleDeleteVideo}
                handleReorderVideos={handleReorderVideos}
              />
            </TabsContent>

            <TabsContent value="users">
              <AdminUsersTab
                {...commonProps}
                users={users}
                filteredUsers={filteredUsers}
                userSearchQuery={userSearchQuery}
                setUserSearchQuery={setUserSearchQuery}
                promptRoleChange={promptRoleChange}
              />
            </TabsContent>

            <TabsContent value="quick-questions">
              <AdminQuestionsTab
                {...commonProps}
                quickQuestions={quickQuestions}
                newQuickQuestion={newQuickQuestion}
                setNewQuickQuestion={setNewQuickQuestion}
                handleAddQuickQuestion={handleAddQuickQuestion}
                handleDeleteQuickQuestion={handleDeleteQuickQuestion}
              />
            </TabsContent>

            <TabsContent value="fire-codes">
              <AdminFireCodesTab
                {...commonProps}
                fireCodeSections={fireCodeSections}
                newFireCode={newFireCode}
                setNewFireCode={setNewFireCode}
                handleAddFireCode={handleAddFireCode}
                handleDeleteFireCode={handleDeleteFireCode}
              />
            </TabsContent>
          </Suspense>
        </Tabs>
      </main>
    </div>
  )
}

AdminDashboard.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default AdminDashboard
