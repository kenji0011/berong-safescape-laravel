export interface CarouselImage {
  id: string | number
  url: string
  altText: string
  title: string
  order?: number
}

export interface BlogPost {
  id: string | number
  title: string
  excerpt: string
  content: string
  imageUrl: string
  category: "adult" | "professional"
  createdAt: string
  created_at?: string
  author: string | { id: number | string; name: string }
  order?: number
}

export interface VideoContent {
  id: string | number
  title: string
  description: string
  youtubeId: string
  category: "professional" | "adult" | "kids"
  duration: string
  created_at?: string
  createdAt?: string
  channelTitle?: string
  isActive?: boolean
  order?: number
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
  category: string
  sectionNum?: string
  content?: string
  description?: string
  filename?: string
  parentSectionId?: string
  updatedAt: string | null
}
