import type { CarouselImage, BlogPost } from "@/lib/mock-data"
export type { CarouselImage, BlogPost }

export interface User {
  id: string | number
  name: string
  email: string
  role: string
  age?: number
  isActive: boolean
  createdAt: string
  permissions: {
    accessKids: boolean
    accessAdult: boolean
    accessProfessional: boolean
    isAdmin: boolean
  }
}

export interface Video {
  id: string | number
  title: string
  description: string
  youtubeId: string
  category: "professional" | "adult" | "kids"
  duration: string
  isActive: boolean
  order?: number
}

export interface QuickQuestion {
  id: number
  category: string
  questionText: string
  responseText: string
  isActive: boolean
}

export interface FireCodeSection {
  id: number
  title: string
  sectionNum: string
  content: string
  parentSectionId?: string
  updatedAt: string | null
}

export interface AdminInitialData {
  initialCarouselImages?: any[]
  initialBlogPosts?: any[]
  initialVideos?: any[]
  initialUsers?: any | any[]
  initialQuickQuestions?: any[]
  initialFireCodeSections?: any[]
}

export interface AdminTabProps {
  success: string
  error: string
  setSuccess: (msg: string) => void
  setError: (msg: string) => void
  setIsSubmitting: (val: boolean) => void
  setSubmittingMessage: (msg: string) => void
  openConfirmationDialog: (
    title: string,
    description: string,
    action: string,
    onConfirm: () => void,
    item?: any,
    variant?: 'default' | 'destructive'
  ) => void
  closeConfirmationDialog: () => void
}

export interface CarouselTabProps extends AdminTabProps {
  carouselImages: CarouselImage[]
  newCarousel: { title: string; alt: string; url: string }
  setNewCarousel: (val: { title: string; alt: string; url: string }) => void
  carouselUploadKey: number
  handleAddCarousel: () => void
  handleDeleteCarousel: (id: string | number) => void
  handleReorderCarousel: (newOrder: CarouselImage[]) => Promise<void>
}

export interface BlogsTabProps extends AdminTabProps {
  blogPosts: BlogPost[]
  newBlog: {
    title: string
    excerpt: string
    content: string
    imageUrl: string
    category: "adult" | "professional"
  }
  setNewBlog: (val: any) => void
  blogUploadKey: number
  handleAddBlog: () => void
  handleDeleteBlog: (id: string | number) => void
  handleReorderBlogs: (newOrder: BlogPost[]) => Promise<void>
}

export interface VideosTabProps extends AdminTabProps {
  videos: Video[]
  newVideo: {
    title: string
    description: string
    youtubeId: string
    category: "professional" | "adult" | "kids"
    duration: string
    isActive: boolean
  }
  setNewVideo: (val: any) => void
  handleAddVideo: () => void
  handleDeleteVideo: (id: string | number) => void
  handleReorderVideos: (newOrder: Video[]) => Promise<void>
}

export interface UsersTabProps extends AdminTabProps {
  users: User[]
  filteredUsers: User[]
  userSearchQuery: string
  setUserSearchQuery: (val: string) => void
  promptRoleChange: (userId: string | number, permission: string, userName: string, action?: string) => void
}

export interface QuestionsTabProps extends AdminTabProps {
  quickQuestions: QuickQuestion[]
  newQuickQuestion: {
    category: string
    questionText: string
    responseText: string
    isActive: boolean
  }
  setNewQuickQuestion: (val: any) => void
  handleAddQuickQuestion: () => void
  handleDeleteQuickQuestion: (id: number) => void
}

export interface FireCodesTabProps extends AdminTabProps {
  fireCodeSections: FireCodeSection[]
  newFireCode: {
    title: string
    sectionNum: string
    content: string
    parentSectionId: string
  }
  setNewFireCode: (val: any) => void
  handleAddFireCode: () => void
  handleDeleteFireCode: (id: number) => void
}
