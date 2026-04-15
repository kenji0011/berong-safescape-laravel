"use client";

import axios from 'axios';

const apiFetch = async (url: string, options: RequestInit = {}) => {
  const method = options.method || 'GET';
  const headers = options.headers instanceof Headers
    ? Object.fromEntries(options.headers.entries())
    : Array.isArray(options.headers)
      ? Object.fromEntries(options.headers)
      : options.headers;
  let data = undefined;
  if (options.body) {
    try {
      if (typeof options.body === 'string') data = JSON.parse(options.body);
      else data = options.body;
    } catch {
      data = options.body;
    }
  }

  try {
    const res = await axios({
      url,
      method,
      data,
      headers,
      withCredentials: true,
      withXSRFToken: true,
      validateStatus: () => true,
    });

    return {
      ok: res.status >= 200 && res.status < 300,
      json: async () => res.data,
      status: res.status,
    } as any;
  } catch (err: any) {
    if (err.response) {
      return { ok: false, json: async () => err.response.data, status: err.response.status } as any;
    }

    return {
      ok: false,
      json: async () => ({ error: err?.message || 'Unable to reach the server' }),
      status: 0,
    } as any;
  }
};

import { useEffect, useState } from "react"
import { router, usePage } from '@inertiajs/react';
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, ImageIcon, FileText, Video, Users, Plus, Trash2, AlertCircle, CheckCircle, HelpCircle, BookOpen, Search, BarChart3 } from "lucide-react"
import type { CarouselImage, BlogPost } from "@/lib/mock-data"
import { ImageUpload } from "@/components/ui/image-upload"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SortableCarouselList } from "@/components/sortable-carousel-list"
import { SortableContentList } from "@/components/sortable-content-list"
import { LoadingOverlay } from "@/components/ui/loading-overlay"

const getPermissionsForRole = (role?: string) => ({
  accessKids: role === "admin" || role === "kid" || role === "professional",
  accessAdult: role === "admin" || role === "adult" || role === "professional",
  accessProfessional: role === "admin" || role === "professional",
  isAdmin: role === "admin",
})

const getApiErrorMessage = (payload: any, fallback: string) => {
  if (!payload) return fallback
  if (typeof payload === "string") return payload
  if (typeof payload?.error === "string" && payload.error.trim()) return payload.error
  if (typeof payload?.message === "string" && payload.message.trim()) return payload.message

  if (payload?.errors && typeof payload.errors === "object") {
    const firstError = Object.values(payload.errors).flat().find((value) => typeof value === "string")
    if (typeof firstError === "string" && firstError.trim()) return firstError
  }

  return fallback
}

const normalizeCarouselImage = (image: any): CarouselImage => ({
  id: image?.id,
  title: image?.title ?? "",
  altText: image?.altText ?? image?.alt_text ?? image?.alt ?? "",
  url: image?.url ?? image?.imageUrl ?? image?.image_url ?? "",
})

const normalizeBlogPost = (post: any): BlogPost => ({
  id: post?.id,
  title: post?.title ?? "",
  excerpt: post?.excerpt ?? "",
  content: post?.content ?? "",
  imageUrl: post?.imageUrl ?? post?.image_url ?? "",
  category: post?.category ?? "adult",
  createdAt: post?.createdAt ?? post?.created_at ?? new Date().toISOString(),
  author: typeof post?.author === "string" ? post.author : post?.author?.name ?? "Unknown",
})

const normalizeVideo = (video: any) => ({
  ...video,
  youtubeId: video?.youtubeId ?? video?.youtube_id ?? "",
  isActive: video?.isActive ?? video?.is_active ?? false,
})

const normalizeUser = (user: any) => ({
  ...user,
  email: user?.email ?? "",
  isActive: user?.isActive ?? user?.is_active ?? true,
  createdAt: user?.createdAt ?? user?.created_at ?? "",
  permissions: user?.permissions ?? getPermissionsForRole(user?.role),
})

const normalizeFireCodeSection = (section: any) => ({
  ...section,
  sectionNum: section?.sectionNum ?? section?.section_num ?? "",
  updatedAt: section?.updatedAt ?? section?.updated_at ?? null,
})

export default function AdminPage({
  initialCarouselImages,
  initialBlogPosts,
  initialVideos,
  initialUsers,
  initialQuickQuestions,
  initialFireCodeSections,
}: any) {
  
  const { user, isAuthenticated, isLoading } = useAuth()
  const [loading, setLoading] = useState(!initialCarouselImages)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittingMessage, setSubmittingMessage] = useState("")
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  // Carousel Management
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>(
    initialCarouselImages ? initialCarouselImages.map(normalizeCarouselImage) : []
  )
  const [newCarousel, setNewCarousel] = useState({ title: "", alt: "", url: "" })
  const [carouselUploadKey, setCarouselUploadKey] = useState(0)

  // Blog Management
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(
    initialBlogPosts ? initialBlogPosts.map(normalizeBlogPost) : []
  )
  const [newBlog, setNewBlog] = useState({
    title: "",
    excerpt: "",
    content: "",
    imageUrl: "",
    category: "adult" as "adult" | "professional",
  })
  const [blogUploadKey, setBlogUploadKey] = useState(0)

  // Video Management
  const [videos, setVideos] = useState<any[]>(
    initialVideos ? initialVideos.map(normalizeVideo) : []
  )
  const [newVideo, setNewVideo] = useState({
    title: "",
    description: "",
    youtubeId: "",
    category: "professional" as "professional" | "adult" | "kids",
    duration: "",
    isActive: true
  })

  // User Management
  // Extract data array if it's paginated (Laravel paginate wrapper)
  const resolvedUsers = initialUsers 
    ? (Array.isArray(initialUsers) ? initialUsers : initialUsers.data ?? []) 
    : []
  const [users, setUsers] = useState<any[]>(resolvedUsers.map(normalizeUser))
  const [userSearchQuery, setUserSearchQuery] = useState("")

  // Filter users based on search query
  const filteredUsers = users.filter((user) =>
    (user.name && user.name.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
    (user.role && user.role.toLowerCase().includes(userSearchQuery.toLowerCase()))
  )

  // Quick Questions Management
  const [quickQuestions, setQuickQuestions] = useState<any[]>(initialQuickQuestions || [])
  const [newQuickQuestion, setNewQuickQuestion] = useState({
    category: "emergency",
    questionText: "",
    responseText: "",
    isActive: true
  })

  // Fire Codes Management
  const [fireCodeSections, setFireCodeSections] = useState<any[]>(
    initialFireCodeSections ? initialFireCodeSections.map(normalizeFireCodeSection) : []
  )
  const [newFireCode, setNewFireCode] = useState({
    title: "",
    sectionNum: "",
    content: "",
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
  });

  // Confirmation Dialog Functions
  const openConfirmationDialog = (title: string, description: string, action: string, onConfirm: () => void, item: any = null) => {
    setConfirmationDialog({
      isOpen: true,
      title,
      description,
      action,
      item,
      onConfirm,
    });
  };

  const closeConfirmationDialog = () => {
    setConfirmationDialog({
      ...confirmationDialog,
      isOpen: false,
    });
  };

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.visit("/login")
      return
    }

    if (!user?.permissions.isAdmin) {
      router.visit("/")
      return
    }

    // Only load from database if Inertia props aren't provided
    if (!initialCarouselImages) {
      loadCarouselImages()
      loadBlogPosts()
      loadVideos()
      loadUsers()
      loadQuickQuestions()
      loadFireCodeSections()
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user, router, isLoading, initialCarouselImages])

  const loadCarouselImages = async () => {
    try {
      const response = await apiFetch('/api/content/carousel', { cache: 'no-store' })
      if (response.ok) {
        const payload = await response.json()
        const images = Array.isArray(payload) ? payload : payload?.images ?? []
        setCarouselImages(images.map(normalizeCarouselImage))
      } else {
        console.error('Failed to load carousel images')
      }
    } catch (error) {
      console.error('Error loading carousel images:', error)
    }
  }

  const loadBlogPosts = async () => {
    try {
      const response = await apiFetch('/api/content/blogs', { cache: 'no-store' })
      if (response.ok) {
        const payload = await response.json()
        const blogs = Array.isArray(payload) ? payload : payload?.posts ?? payload?.blogs ?? []
        setBlogPosts(blogs.map(normalizeBlogPost))
      } else {
        console.error('Failed to load blog posts')
      }
    } catch (error) {
      console.error('Error loading blog posts:', error)
    }
  }

  const loadVideos = async () => {
    try {
      const response = await apiFetch('/api/admin/videos', { cache: 'no-store' })
      if (response.ok) {
        const payload = await response.json()
        const videos = Array.isArray(payload) ? payload : payload?.videos ?? []
        setVideos(videos.map(normalizeVideo))
      } else {
        console.error('Failed to load videos')
      }
    } catch (error) {
      console.error('Error loading videos:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await apiFetch('/api/admin/users', { cache: 'no-store' })
      if (response.ok) {
        const payload = await response.json()
        const usersData = Array.isArray(payload)
          ? payload
          : payload?.users?.data ?? payload?.users ?? []
        setUsers(usersData.map(normalizeUser))
      } else {
        console.error('Failed to load users')
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadQuickQuestions = async () => {
    try {
      const response = await apiFetch('/api/admin/quick-questions', { cache: 'no-store' })
      if (response.ok) {
        const payload = await response.json()
        const questions = Array.isArray(payload) ? payload : payload?.questions ?? []
        setQuickQuestions(questions)
      } else {
        console.error('Failed to load quick questions')
      }
    } catch (error) {
      console.error('Error loading quick questions:', error)
    }
  }

  const loadFireCodeSections = async () => {
    try {
      const response = await apiFetch('/api/admin/fire-codes', { cache: 'no-store' })
      if (response.ok) {
        const payload = await response.json()
        const sections = Array.isArray(payload) ? payload : payload?.sections ?? []
        setFireCodeSections(sections.map(normalizeFireCodeSection))
      } else {
        console.error('Failed to load fire code sections')
      }
    } catch (error) {
      console.error('Error loading fire code sections:', error)
    }
  }

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
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newQuickQuestion),
          })

          if (response.ok) {
            await loadQuickQuestions() // Reload the list
            setNewQuickQuestion({ category: "emergency", questionText: "", responseText: "", isActive: true })
            setSuccess("Quick question added successfully")
            setTimeout(() => setSuccess(""), 3000)
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
          const response = await apiFetch(`/api/admin/quick-questions/${id}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            await loadQuickQuestions() // Reload the list
            setSuccess("Quick question deleted")
            setTimeout(() => setSuccess(""), 3000)
          } else {
            setError("Failed to delete quick question")
          }
        } catch (error) {
          console.error('Error deleting quick question:', error)
          setError("Network error occurred")
        } finally {
          closeConfirmationDialog();
        }
      }
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
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newCarousel),
          })

          if (response.ok) {
            await loadCarouselImages() // Reload the list
            setNewCarousel({ title: "", alt: "", url: "" })
            setCarouselUploadKey(prev => prev + 1) // Reset upload component
            setSuccess("Carousel image added successfully")
            setTimeout(() => setSuccess(""), 3000)
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

  // Accept string OR number to avoid TypeErrors
  const handleDeleteCarousel = (id: string | number) => {
    const numericId = Number(id); // Use Number() instead of parseInt for safety
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
          const response = await apiFetch(`/api/admin/carousel/${numericId}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            await loadCarouselImages() // Reload the list
            setSuccess("Carousel image deleted")
            setTimeout(() => setSuccess(""), 3000)
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
      { id: numericId }
    );
  }

  // Handle carousel reordering
  const handleReorderCarousel = async (newOrder: CarouselImage[]) => {
    try {
      const imageIds = newOrder.map((img) => img.id)
      const response = await apiFetch('/api/admin/carousel/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to reorder')
      }

      const payload = await response.json()
      const updated = Array.isArray(payload) ? payload : payload?.images ?? []
      setCarouselImages(updated.map(normalizeCarouselImage))

      setSuccess('Carousel order updated')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error reordering:', error)
      setError('Failed to update order')
      // Reload to revert
      await loadCarouselImages()
      throw error // Re-throw to trigger component revert
    }
  }

  // Handle blog reordering
  const handleReorderBlogs = async (newOrder: BlogPost[]) => {
    try {
      const blogIds = newOrder.map((blog) => blog.id)
      const response = await apiFetch('/api/admin/blogs/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to reorder')
      }

      const payload = await response.json()
      const updated = Array.isArray(payload) ? payload : []
      setBlogPosts(updated.length > 0 ? updated.map(normalizeBlogPost) : newOrder)

      setSuccess('Blog order updated')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error reordering blogs:', error)
      setError('Failed to update blog order')
      await loadBlogPosts()
      throw error
    }
  }

  // Handle video reordering
  const handleReorderVideos = async (newOrder: any[]) => {
    try {
      const videoIds = newOrder.map((video) => video.id)
      const response = await apiFetch('/api/admin/videos/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to reorder')
      }

      const payload = await response.json()
      const updated = Array.isArray(payload) ? payload : []
      setVideos(updated.length > 0 ? updated.map(normalizeVideo) : newOrder)

      setSuccess('Video order updated')
      setTimeout(() => setSuccess(''), 3000)
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
            authorId: user?.id || 1, // Default to first user if no current user
          }

          const response = await apiFetch('/api/admin/blogs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(blogData),
          })

          if (response.ok) {
            await loadBlogPosts() // Reload the list
            
            // --- INJECT MOCK NOTIFICATION ---
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
            // --------------------------------

            setNewBlog({ title: "", excerpt: "", content: "", imageUrl: "", category: "adult" })
            setBlogUploadKey(prev => prev + 1) // Reset upload component
            setSuccess("Blog post added successfully")
            setTimeout(() => setSuccess(""), 3000)
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
          const response = await apiFetch(`/api/admin/blogs/${id}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            await loadBlogPosts() // Reload the list
            setSuccess("Blog post deleted")
            setTimeout(() => setSuccess(""), 3000)
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
      { id }
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
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newVideo),
          });

          if (response.ok) {
            await loadVideos(); // Reload the list
            
            // --- INJECT MOCK NOTIFICATION ---
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
            // --------------------------------

            setNewVideo({ title: "", description: "", youtubeId: "", category: "professional", duration: "", isActive: true });
            setSuccess("Video added successfully");
            setTimeout(() => setSuccess(""), 3000);
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

  // Accept string OR number
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
          const response = await apiFetch(`/api/admin/videos/${numericId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            await loadVideos(); // Reload the list
            setSuccess("Video deleted");
            setTimeout(() => setSuccess(""), 3000);
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
      { id: numericId }
    );
  }

  // Password verification for role changes
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          permission: roleChangeDialog.permission,
          action: roleChangeDialog.action,
          adminPassword: roleChangePassword,
        }),
      })

      if (response.ok) {
        await loadUsers()
        setSuccess("User permissions updated")
        setTimeout(() => setSuccess(""), 3000)
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
    if (!newFireCode.title || !newFireCode.sectionNum || !newFireCode.content) {
      setError("Please fill all fire code section fields")
      return
    }

    openConfirmationDialog(
      "Add Fire Code Section",
      "Are you sure you want to add this fire code section?",
      "add-fire-code",
      async () => {
        try {
          setIsSubmitting(true);
          setSubmittingMessage("Adding fire code section...");
          closeConfirmationDialog();

          const response = await apiFetch('/api/admin/fire-codes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newFireCode),
          })

          if (response.ok) {
            await loadFireCodeSections() // Reload the list
            setNewFireCode({ title: "", sectionNum: "", content: "", parentSectionId: "" })
            setSuccess("Fire code section added successfully")
            setTimeout(() => setSuccess(""), 3000)
          } else {
            const errorData = await response.json()
            setError(errorData.error || "Failed to add fire code section")
          }
        } catch (error) {
          console.error('Error adding fire code section:', error)
          setError("Network error occurred")
        } finally {
          setIsSubmitting(false);
        }
      }
    );
  }

  const handleDeleteFireCode = (id: number) => {
    openConfirmationDialog(
      "Delete Fire Code Section",
      "Are you sure you want to delete this fire code section? This action cannot be undone.",
      "delete-fire-code",
      async () => {
        try {
          const response = await apiFetch(`/api/admin/fire-codes/${id}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            await loadFireCodeSections() // Reload the list
            setSuccess("Fire code section deleted")
            setTimeout(() => setSuccess(""), 3000)
          } else {
            setError("Failed to delete fire code section")
          }
        } catch (error) {
          console.error('Error deleting fire code section:', error)
          setError("Network error occurred")
        } finally {
          closeConfirmationDialog();
        }
      },
      { id }
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Loading Overlay for content submissions */}
      <LoadingOverlay isLoading={isSubmitting} message={submittingMessage} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Panel</h1>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">Manage content, users, and platform settings</p>
            </div>
            <button
              onClick={() => router.visit("/admin/analytics")}
              className="flex items-center gap-2 bg-[#ff6b00] text-white font-extrabold px-4 sm:px-5 pb-2 pt-2.5 rounded-xl text-sm shadow-[0_4px_0_#c2410c] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#c2410c] active:translate-y-1 active:shadow-[0_0px_0_#c2410c] transition-all"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Community Analytics</span>
              <span className="sm:hidden">Analytics</span>
            </button>
          </div>
        </div>

        {/* Alerts moved to individual tabs */}

        {/* Admin Tabs */}
        <Tabs defaultValue="carousel" className="space-y-6">
          {/* Mobile: Icons only, evenly spaced */}
          <TabsList className="flex w-full sm:grid sm:grid-cols-6 bg-muted/50 p-1.5 rounded-xl gap-1">
            <TabsTrigger
              value="carousel"
              className="flex-1 font-bold text-slate-500 data-[state=active]:bg-[#d60000] data-[state=active]:text-white transition-all rounded-lg sm:rounded-xl py-2.5 sm:py-3 px-1 sm:px-4 data-[state=active]:shadow-[0_4px_0_#991b1b] data-[state=active]:translate-y-0 translate-y-1 hover:-translate-y-0.5 hover:bg-slate-200 data-[state=active]:hover:-translate-y-0.5 data-[state=active]:hover:shadow-[0_6px_0_#991b1b]"
            >
              <ImageIcon className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline text-sm">Carousel</span>
            </TabsTrigger>
            <TabsTrigger
              value="blogs"
              className="flex-1 font-bold text-slate-500 data-[state=active]:bg-[#d60000] data-[state=active]:text-white transition-all rounded-lg sm:rounded-xl py-2.5 sm:py-3 px-1 sm:px-4 data-[state=active]:shadow-[0_4px_0_#991b1b] data-[state=active]:translate-y-0 translate-y-1 hover:-translate-y-0.5 hover:bg-slate-200 data-[state=active]:hover:-translate-y-0.5 data-[state=active]:hover:shadow-[0_6px_0_#991b1b]"
            >
              <FileText className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline text-sm">Blogs</span>
            </TabsTrigger>
            <TabsTrigger
              value="videos"
              className="flex-1 font-bold text-slate-500 data-[state=active]:bg-[#d60000] data-[state=active]:text-white transition-all rounded-lg sm:rounded-xl py-2.5 sm:py-3 px-1 sm:px-4 data-[state=active]:shadow-[0_4px_0_#991b1b] data-[state=active]:translate-y-0 translate-y-1 hover:-translate-y-0.5 hover:bg-slate-200 data-[state=active]:hover:-translate-y-0.5 data-[state=active]:hover:shadow-[0_6px_0_#991b1b]"
            >
              <Video className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline text-sm">Videos</span>
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex-1 font-bold text-slate-500 data-[state=active]:bg-[#d60000] data-[state=active]:text-white transition-all rounded-lg sm:rounded-xl py-2.5 sm:py-3 px-1 sm:px-4 data-[state=active]:shadow-[0_4px_0_#991b1b] data-[state=active]:translate-y-0 translate-y-1 hover:-translate-y-0.5 hover:bg-slate-200 data-[state=active]:hover:-translate-y-0.5 data-[state=active]:hover:shadow-[0_6px_0_#991b1b]"
            >
              <Users className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline text-sm">Users</span>
            </TabsTrigger>
            <TabsTrigger
              value="quick-questions"
              className="flex-1 font-bold text-slate-500 data-[state=active]:bg-[#d60000] data-[state=active]:text-white transition-all rounded-lg sm:rounded-xl py-2.5 sm:py-3 px-1 sm:px-4 data-[state=active]:shadow-[0_4px_0_#991b1b] data-[state=active]:translate-y-0 translate-y-1 hover:-translate-y-0.5 hover:bg-slate-200 data-[state=active]:hover:-translate-y-0.5 data-[state=active]:hover:shadow-[0_6px_0_#991b1b]"
            >
              <HelpCircle className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline text-sm">Q&A</span>
            </TabsTrigger>
            <TabsTrigger
              value="fire-codes"
              className="flex-1 font-bold text-slate-500 data-[state=active]:bg-[#d60000] data-[state=active]:text-white transition-all rounded-lg sm:rounded-xl py-2.5 sm:py-3 px-1 sm:px-4 data-[state=active]:shadow-[0_4px_0_#991b1b] data-[state=active]:translate-y-0 translate-y-1 hover:-translate-y-0.5 hover:bg-slate-200 data-[state=active]:hover:-translate-y-0.5 data-[state=active]:hover:shadow-[0_6px_0_#991b1b]"
            >
              <BookOpen className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline text-sm">Fire Codes</span>
            </TabsTrigger>
          </TabsList>

          <ConfirmationDialog
            isOpen={confirmationDialog.isOpen}
            onClose={closeConfirmationDialog}
            onConfirm={() => {
              confirmationDialog.onConfirm();
            }}
            title={confirmationDialog.title}
            description={confirmationDialog.description}
          />

          {/* Password Verification Dialog for Role Changes */}
          <AlertDialog open={roleChangeDialog.isOpen} onOpenChange={(open) => { if (!open && !roleChangeLoading) closeRoleChangeDialog() }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Verify Admin Password</AlertDialogTitle>
                <AlertDialogDescription>
                  Enter your admin password to {roleChangeDialog.action === 'remove' ? 'remove' : 'grant'} the <strong>{roleChangeDialog.permission}</strong> permission for <strong>{roleChangeDialog.userName}</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Label htmlFor="role-change-password">Password</Label>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmRoleChange()
                  }}
                  autoFocus
                />
                {roleChangeError && (
                  <p className="text-sm text-destructive mt-2">{roleChangeError}</p>
                )}
              </div>
              <AlertDialogFooter>
                <Button variant="outline" onClick={closeRoleChangeDialog} disabled={roleChangeLoading}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmRoleChange}
                  disabled={roleChangeLoading || !roleChangePassword}
                >
                  {roleChangeLoading ? 'Verifying...' : 'Confirm Change'}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Carousel Management */}
          <TabsContent value="carousel" className="space-y-6">
            <ImageUpload
              key={carouselUploadKey}
              title="Upload Carousel Image"
              description="Upload an image to generate a URL for the carousel"
              onUploadComplete={(url) => setNewCarousel({ ...newCarousel, url })}
            />

            <Card>
              <CardHeader>
                <CardTitle>Add New Carousel Image</CardTitle>
                <CardDescription>Add images to the dashboard carousel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carousel-title">Title</Label>
                    <Input
                      id="carousel-title"
                      placeholder="Image title"
                      value={newCarousel.title}
                      onChange={(e) => setNewCarousel({ ...newCarousel, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carousel-alt">Alt Text</Label>
                    <Input
                      id="carousel-alt"
                      placeholder="Image description"
                      value={newCarousel.alt}
                      onChange={(e) => setNewCarousel({ ...newCarousel, alt: e.target.value })}
                    />
                  </div>
                </div>
                {/* Image URL is now set automatically from the upload component - hidden from user */}
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleAddCarousel}
                    className="inline-flex items-center justify-center bg-[#d60000] text-white font-extrabold px-5 pb-2 pt-2.5 rounded-xl text-sm shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Image
                  </button>
                  {success && <div className="text-sm font-bold text-green-700 flex items-center gap-2 bg-green-50 border-2 border-green-200 px-4 py-2 rounded-xl animate-in fade-in zoom-in-95 duration-300"><CheckCircle className="h-4 w-4"/> {success}</div>}
                  {error && <div className="text-sm font-bold text-red-700 flex items-center gap-2 bg-red-50 border-2 border-red-200 px-4 py-2 rounded-xl animate-in fade-in zoom-in-95 duration-300"><AlertCircle className="h-4 w-4"/> {error}</div>}
                </div>
              </CardContent>
            </Card>

            <SortableCarouselList
              images={carouselImages}
              onReorder={handleReorderCarousel}
              onDelete={handleDeleteCarousel}
            />
          </TabsContent>

          {/* Blog Management */}
          <TabsContent value="blogs" className="space-y-6">
            <ImageUpload
              key={blogUploadKey}
              title="Upload Blog Image"
              description="Upload an image to generate a URL for the blog post"
              onUploadComplete={(url) => setNewBlog({ ...newBlog, imageUrl: url })}
            />

            <Card>
              <CardHeader>
                <CardTitle>Add New Blog Post</CardTitle>
                <CardDescription>Create educational content for adult and professional sections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="blog-title">Title</Label>
                    <Input
                      id="blog-title"
                      placeholder="Blog post title"
                      value={newBlog.title}
                      onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blog-category">Category</Label>
                  <select
                    id="blog-category"
                    className="w-full h-10 px-3 rounded-md border-input bg-background"
                    value={newBlog.category}
                    onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value as "adult" | "professional" })}
                  >
                    <option value="adult">Adult</option>
                  </select>
                </div>
                {/* Image URL is now set automatically from the upload component - hidden from user */}
                <div className="space-y-2">
                  <Label htmlFor="blog-excerpt">Excerpt</Label>
                  <Textarea
                    id="blog-excerpt"
                    placeholder="Brief description"
                    value={newBlog.excerpt}
                    onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blog-content">Content</Label>
                  <Textarea
                    id="blog-content"
                    placeholder="Full blog content"
                    value={newBlog.content}
                    onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                    rows={6}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleAddBlog}
                    className="inline-flex items-center justify-center bg-[#d60000] text-white font-extrabold px-5 pb-2 pt-2.5 rounded-xl text-sm shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Blog Post
                  </button>
                  {success && <div className="text-sm font-bold text-green-700 flex items-center gap-2 bg-green-50 border-2 border-green-200 px-4 py-2 rounded-xl animate-in fade-in zoom-in-95 duration-300"><CheckCircle className="h-4 w-4"/> {success}</div>}
                  {error && <div className="text-sm font-bold text-red-700 flex items-center gap-2 bg-red-50 border-2 border-red-200 px-4 py-2 rounded-xl animate-in fade-in zoom-in-95 duration-300"><AlertCircle className="h-4 w-4"/> {error}</div>}
                </div>
              </CardContent>
            </Card>

            <SortableContentList
              items={blogPosts}
              title="Current Blog Posts"
              description={`${blogPosts.length} blog posts`}
              onReorder={handleReorderBlogs}
              onDelete={handleDeleteBlog}
              renderContent={(post) => (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{post.title}</h4>
                    <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent capitalize">
                      {post.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    By {typeof post.author === 'string' ? post.author : post.author?.name} • {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </>
              )}
            />
          </TabsContent>

          {/* Video Management */}
          <TabsContent value="videos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Video</CardTitle>
                <CardDescription>Add educational videos for different sections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="video-title">Title</Label>
                  <Input
                    id="video-title"
                    placeholder="Video title"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video-description">Description</Label>
                  <Textarea
                    id="video-description"
                    placeholder="Video description"
                    value={newVideo.description}
                    onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="video-youtube-id">YouTube URL or ID</Label>
                    <Input
                      id="video-youtube-id"
                      placeholder="Paste full URL or video ID"
                      value={newVideo.youtubeId}
                      onChange={(e) => setNewVideo({ ...newVideo, youtubeId: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video-duration">Duration</Label>
                  <Input
                    id="video-duration"
                    placeholder="Duration (e.g., 15:30)"
                    value={newVideo.duration}
                    onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="video-category">Category</Label>
                    <select
                      id="video-category"
                      className="w-full h-10 px-3 rounded-md border-input bg-background"
                      value={newVideo.category}
                      onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value as "professional" | "adult" | "kids" })}
                    >
                      <option value="professional">Professional</option>
                    </select>
                  </div>
                  <div className="space-y-2 flex items-center pt-6">
                    <input
                      type="checkbox"
                      id="video-active"
                      checked={newVideo.isActive}
                      onChange={(e) => setNewVideo({ ...newVideo, isActive: e.target.checked })}
                      className="mr-2 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <Label htmlFor="video-active">Active</Label>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleAddVideo}
                    className="w-full md:w-auto inline-flex items-center justify-center bg-[#d60000] text-white font-extrabold px-5 pb-2 pt-2.5 rounded-xl text-sm shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Video
                  </button>
                  {success && <div className="text-sm font-bold text-green-700 flex items-center gap-2 bg-green-50 border-2 border-green-200 px-4 py-2 rounded-xl animate-in fade-in zoom-in-95 duration-300"><CheckCircle className="h-4 w-4"/> {success}</div>}
                  {error && <div className="text-sm font-bold text-red-700 flex items-center gap-2 bg-red-50 border-2 border-red-200 px-4 py-2 rounded-xl animate-in fade-in zoom-in-95 duration-300"><AlertCircle className="h-4 w-4"/> {error}</div>}
                </div>
              </CardContent>
            </Card>

            <SortableContentList
              items={videos}
              title="Current Videos"
              description={`${videos.length} videos in database`}
              onReorder={handleReorderVideos}
              onDelete={handleDeleteVideo}
              renderContent={(video) => (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{video.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${video.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {video.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent capitalize">
                      {video.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{video.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    YouTube ID: {video.youtubeId} • Duration: {video.duration}
                  </p>
                </>
              )}
            />
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user permissions and access levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 relative">
                  <Input
                    type="text"
                    placeholder="Search users by name, email, or role..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-10"
                    autoComplete="off"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-4">
                  {filteredUsers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No users found</p>
                  ) : (
                    filteredUsers.map((u) => (
                      <div key={u.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{u.name}</h4>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Age: {u.age} • Role: {u.role}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          <button
                            type="button"
                            onClick={() => promptRoleChange(u.id, "accessKids", u.name, u.permissions.accessKids ? "remove" : "add")}
                            className={`inline-flex items-center justify-center font-extrabold px-4 pb-1.5 pt-2 rounded-xl text-xs sm:text-sm transition-all ${
                              u.permissions.accessKids
                                ? "bg-slate-600 text-white shadow-[0_4px_0_#1e293b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#1e293b] hover:bg-red-600 hover:shadow-[0_4px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b]"
                                : "bg-white border-2 border-slate-200 text-slate-500 shadow-[0_4px_0_#e2e8f0] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#e2e8f0] hover:bg-slate-50 active:translate-y-1 active:shadow-[0_0px_0_#e2e8f0]"
                            }`}
                          >
                            Kids Access {u.permissions.accessKids && <Trash2 className="h-3 w-3 ml-2 inline opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: 0.7 }} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => promptRoleChange(u.id, "accessAdult", u.name, u.permissions.accessAdult ? "remove" : "add")}
                            className={`inline-flex items-center justify-center font-extrabold px-4 pb-1.5 pt-2 rounded-xl text-xs sm:text-sm transition-all ${
                              u.permissions.accessAdult
                                ? "bg-teal-700 text-white shadow-[0_4px_0_#134e4a] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#134e4a] hover:bg-red-600 hover:shadow-[0_4px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b]"
                                : "bg-white border-2 border-slate-200 text-slate-500 shadow-[0_4px_0_#e2e8f0] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#e2e8f0] hover:bg-slate-50 active:translate-y-1 active:shadow-[0_0px_0_#e2e8f0]"
                            }`}
                          >
                            Adult Access {u.permissions.accessAdult && <Trash2 className="h-3 w-3 ml-2 inline opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: 0.7 }} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => promptRoleChange(u.id, "accessProfessional", u.name, u.permissions.accessProfessional ? "remove" : "add")}
                            className={`inline-flex items-center justify-center font-extrabold px-4 pb-1.5 pt-2 rounded-xl text-xs sm:text-sm transition-all ${
                              u.permissions.accessProfessional
                                ? "bg-[#d60000] text-white shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] hover:bg-red-600 hover:shadow-[0_4px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b]"
                                : "bg-white border-2 border-slate-200 text-slate-500 shadow-[0_4px_0_#e2e8f0] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#e2e8f0] hover:bg-slate-50 active:translate-y-1 active:shadow-[0_0px_0_#e2e8f0]"
                            }`}
                          >
                            Professional Access {u.permissions.accessProfessional && <Trash2 className="h-3 w-3 ml-2 inline opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: 0.7 }} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => promptRoleChange(u.id, "isAdmin", u.name, u.permissions.isAdmin ? "remove" : "add")}
                            className={`inline-flex items-center justify-center font-extrabold px-4 pb-1.5 pt-2 rounded-xl text-xs sm:text-sm transition-all ${
                              u.permissions.isAdmin
                                ? "bg-slate-900 text-white shadow-[0_4px_0_#000000] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#000000] hover:bg-red-600 hover:shadow-[0_4px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b]"
                                : "bg-white border-2 border-slate-200 text-slate-500 shadow-[0_4px_0_#e2e8f0] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#e2e8f0] hover:bg-slate-50 active:translate-y-1 active:shadow-[0_0px_0_#e2e8f0]"
                            }`}
                          >
                            Admin {u.permissions.isAdmin && <Trash2 className="h-3 w-3 ml-2 inline opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: 0.7 }} />}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick Questions Management */}
          <TabsContent value="quick-questions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Quick Question</CardTitle>
                <CardDescription>Create frequently asked questions for the chatbot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qq-category">Category</Label>
                    <Select
                      value={newQuickQuestion.category}
                      onValueChange={(value) => setNewQuickQuestion({ ...newQuickQuestion, category: value })}
                    >
                      <SelectTrigger id="qq-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emergency">Emergency Procedures</SelectItem>
                        <SelectItem value="prevention">Fire Prevention</SelectItem>
                        <SelectItem value="equipment">Safety Equipment</SelectItem>
                        <SelectItem value="general">General Information</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qq-active">Status</Label>
                    <Select
                      value={newQuickQuestion.isActive ? "active" : "inactive"}
                      onValueChange={(value) => setNewQuickQuestion({ ...newQuickQuestion, isActive: value === "active" })}
                    >
                      <SelectTrigger id="qq-active">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qq-question">Question</Label>
                  <Input
                    id="qq-question"
                    placeholder="Enter the question"
                    value={newQuickQuestion.questionText}
                    onChange={(e) => setNewQuickQuestion({ ...newQuickQuestion, questionText: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qq-response">Response</Label>
                  <Textarea
                    id="qq-response"
                    placeholder="Enter the response"
                    value={newQuickQuestion.responseText}
                    onChange={(e) => setNewQuickQuestion({ ...newQuickQuestion, responseText: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleAddQuickQuestion}
                    className="inline-flex items-center justify-center bg-[#d60000] text-white font-extrabold px-5 pb-2 pt-2.5 rounded-xl text-sm shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Quick Question
                  </button>
                  {success && <div className="text-sm font-bold text-green-700 flex items-center gap-2 bg-green-50 border-2 border-green-200 px-4 py-2 rounded-xl animate-in fade-in zoom-in-95 duration-300"><CheckCircle className="h-4 w-4"/> {success}</div>}
                  {error && <div className="text-sm font-bold text-red-700 flex items-center gap-2 bg-red-50 border-2 border-red-200 px-4 py-2 rounded-xl animate-in fade-in zoom-in-95 duration-300"><AlertCircle className="h-4 w-4"/> {error}</div>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Quick Questions</CardTitle>
                <CardDescription>{quickQuestions.length} questions in database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quickQuestions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No quick questions yet</p>
                  ) : (
                    quickQuestions.map((question) => (
                      <div key={question.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{question.questionText}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${question.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {question.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent capitalize">
                              {question.category}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{question.responseText}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuickQuestion(question.id)}
                          className="ml-4 flex items-center justify-center bg-red-600 text-white font-extrabold h-10 w-10 pb-1 rounded-xl text-sm shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all"
                          aria-label="Delete question"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fire Codes Management */}
          <TabsContent value="fire-codes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Fire Code Section</CardTitle>
                <CardDescription>Add sections to the Fire Code & Regulations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fc-title">Title</Label>
                  <Input
                    id="fc-title"
                    placeholder="Section title"
                    value={newFireCode.title}
                    onChange={(e) => setNewFireCode({ ...newFireCode, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fc-section-num">Section Number</Label>
                    <Input
                      id="fc-section-num"
                      placeholder="e.g., 1.1, 2.3.1, etc."
                      value={newFireCode.sectionNum}
                      onChange={(e) => setNewFireCode({ ...newFireCode, sectionNum: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fc-parent-section">Parent Section (Optional)</Label>
                    <Input
                      id="fc-parent-section"
                      placeholder="Parent section ID"
                      value={newFireCode.parentSectionId}
                      onChange={(e) => setNewFireCode({ ...newFireCode, parentSectionId: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fc-content">Content</Label>
                  <Textarea
                    id="fc-content"
                    placeholder="Section content"
                    rows={6}
                    value={newFireCode.content}
                    onChange={(e) => setNewFireCode({ ...newFireCode, content: e.target.value })}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleAddFireCode}
                    className="inline-flex items-center justify-center bg-[#d60000] text-white font-extrabold px-5 pb-2 pt-2.5 rounded-xl text-sm shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Fire Code Section
                  </button>
                  {success && <div className="text-sm font-bold text-green-700 flex items-center gap-2 bg-green-50 border-2 border-green-200 px-4 py-2 rounded-xl animate-in fade-in zoom-in-95 duration-300"><CheckCircle className="h-4 w-4"/> {success}</div>}
                  {error && <div className="text-sm font-bold text-red-700 flex items-center gap-2 bg-red-50 border-2 border-red-200 px-4 py-2 rounded-xl animate-in fade-in zoom-in-95 duration-300"><AlertCircle className="h-4 w-4"/> {error}</div>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Fire Code Sections</CardTitle>
                <CardDescription>Fire Code & Regulations sections in the database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fireCodeSections.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No fire code sections yet</p>
                  ) : (
                    fireCodeSections.map((section) => (
                      <div key={section.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{section.title}</h4>
                            <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent">
                              {section.sectionNum}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{section.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Last updated: {new Date(section.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteFireCode(section.id)}
                          className="ml-4 flex items-center justify-center bg-red-600 text-white font-extrabold h-10 w-10 pb-1 rounded-xl text-sm shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all"
                          aria-label="Delete section"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
