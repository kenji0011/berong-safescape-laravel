import { useState, useCallback } from "react"
import { apiFetch } from "@/lib/api-fetch"
import type { 
  AdminInitialData, 
  Video, 
  User, 
  QuickQuestion, 
  FireCodeSection,
  CarouselImage,
  BlogPost
} from "@/types/admin"

import { 
  getPermissionsForRole, 
  normalizeCarouselImage, 
  normalizeBlogPost, 
  normalizeVideo, 
  normalizeUser, 
  normalizeFireCodeSection 
} from "@/lib/admin-utils"

export function useAdminData(initialData: AdminInitialData) {
  const [loading, setLoading] = useState(false)

  // Carousel
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>(
    initialData.initialCarouselImages ? initialData.initialCarouselImages.map(normalizeCarouselImage) : []
  )

  // Blogs
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(
    initialData.initialBlogPosts ? initialData.initialBlogPosts.map(normalizeBlogPost) : []
  )

  // Videos
  const [videos, setVideos] = useState<Video[]>(
    initialData.initialVideos ? initialData.initialVideos.map(normalizeVideo) : []
  )

  // Users
  const resolvedUsers = initialData.initialUsers 
    ? (Array.isArray(initialData.initialUsers) ? initialData.initialUsers : initialData.initialUsers.data ?? []) 
    : []
  const [users, setUsers] = useState<User[]>(resolvedUsers.map(normalizeUser))

  // Quick Questions
  const [quickQuestions, setQuickQuestions] = useState<QuickQuestion[]>(initialData.initialQuickQuestions || [])

  // Fire Codes
  const [fireCodeSections, setFireCodeSections] = useState<FireCodeSection[]>(
    initialData.initialFireCodeSections ? initialData.initialFireCodeSections.map(normalizeFireCodeSection) : []
  )

  const loadCarouselImages = useCallback(async () => {
    try {
      const response = await apiFetch('/api/content/carousel', { cache: 'no-store' })
      if (response.ok) {
        const payload = await response.json()
        const images = Array.isArray(payload) ? payload : payload?.images ?? []
        setCarouselImages(images.map(normalizeCarouselImage))
      }
    } catch (error) {
      console.error('Error loading carousel images:', error)
    }
  }, [])

  const loadBlogPosts = useCallback(async () => {
    try {
      const response = await apiFetch('/api/content/blogs', { cache: 'no-store' })
      if (response.ok) {
        const payload = await response.json()
        const blogs = Array.isArray(payload) ? payload : payload?.posts ?? payload?.blogs ?? []
        setBlogPosts(blogs.map(normalizeBlogPost))
      }
    } catch (error) {
      console.error('Error loading blog posts:', error)
    }
  }, [])

  const loadVideos = useCallback(async () => {
    try {
      const response = await apiFetch('/api/admin/videos', { cache: 'no-store' })
      if (response.ok) {
        const payload = await response.json()
        const videoData = Array.isArray(payload) ? payload : payload?.videos ?? []
        setVideos(videoData.map(normalizeVideo))
      }
    } catch (error) {
      console.error('Error loading videos:', error)
    }
  }, [])

  const loadUsers = useCallback(async () => {
    try {
      const response = await apiFetch('/api/admin/users', { cache: 'no-store' })
      if (response.ok) {
        const payload = await response.json()
        const usersData = Array.isArray(payload)
          ? payload
          : payload?.users?.data ?? payload?.users ?? []
        setUsers(usersData.map(normalizeUser))
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }, [])

  const loadQuickQuestions = useCallback(async () => {
    try {
      const response = await apiFetch('/api/admin/quick-questions', { cache: 'no-store' })
      if (response.ok) {
        const payload = await response.json()
        const questions = Array.isArray(payload) ? payload : payload?.questions ?? []
        setQuickQuestions(questions)
      }
    } catch (error) {
      console.error('Error loading quick questions:', error)
    }
  }, [])

  const loadFireCodeSections = useCallback(async () => {
    try {
      const response = await apiFetch('/api/admin/fire-codes', { cache: 'no-store' })
      if (response.ok) {
        const payload = await response.json()
        const sections = Array.isArray(payload) ? payload : payload?.sections ?? []
        setFireCodeSections(sections.map(normalizeFireCodeSection))
      }
    } catch (error) {
      console.error('Error loading fire code sections:', error)
    }
  }, [])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    await Promise.allSettled([
      loadCarouselImages(),
      loadBlogPosts(),
      loadVideos(),
      loadUsers(),
      loadQuickQuestions(),
      loadFireCodeSections()
    ])
    setLoading(false)
  }, [
    loadCarouselImages, 
    loadBlogPosts, 
    loadVideos, 
    loadUsers, 
    loadQuickQuestions, 
    loadFireCodeSections
  ])

  return {
    carouselImages, setCarouselImages, loadCarouselImages,
    blogPosts, setBlogPosts, loadBlogPosts,
    videos, setVideos, loadVideos,
    users, setUsers, loadUsers,
    quickQuestions, setQuickQuestions, loadQuickQuestions,
    fireCodeSections, setFireCodeSections, loadFireCodeSections,
    refreshAll,
    loading
  }
}
