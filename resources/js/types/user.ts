export type UserRole = "guest" | "kid" | "adult" | "professional" | "admin"

export interface UserPermissions {
  accessKids: boolean
  accessAdult: boolean
  accessProfessional: boolean
  isAdmin: boolean
}

export interface User {
  id: string | number
  name: string
  email?: string
  username: string
  role: UserRole | string
  age?: number
  isActive: boolean
  createdAt: string
  permissions: UserPermissions
  profileCompleted?: boolean
  barangay?: string
  school?: string
  occupation?: string
  gender?: string
  preTestScore?: number
  postTestScore?: number
  engagementPoints?: number
  avatar?: string
  firstName?: string
  lastName?: string
  school_id?: number
  competency_scores?: any
}

export interface UserScores {
  preTestScore?: number | null
  postTestScore?: number | null
  engagementPoints?: number
}
