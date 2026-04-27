"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { router, usePage } from '@inertiajs/react';

export type UserRole = "guest" | "kid" | "adult" | "professional" | "admin"

export interface User {
  id: number
  username: string
  email?: string
  name: string
  age: number
  role: UserRole
  permissions: {
    accessKids: boolean
    accessAdult: boolean
    accessProfessional: boolean
    isAdmin: boolean
  }
  isActive: boolean
  createdAt: string
  // Enhanced profile fields
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

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>
  register: (username: string, password: string, name: string, age: number) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
  isLoading: boolean
  isLoggingOut: boolean
  isAuthenticated: boolean
  isAuthenticating: boolean
  getRedirectPath: () => string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to determine redirect path based on user role
function determineRedirectPath(user: User | null): string {
  if (!user) return '/'

  if (user.role === 'admin') return '/admin'
  if (user.role === 'professional') return '/professional'
  if (user.role === 'adult') return '/adult'
  if (user.role === 'kid') return '/kids'

  return '/'
}

// Helper function to determine permissions
function determinePermissions(role: UserRole) {
  if (role === 'admin') {
    return {
      accessKids: true,
      accessAdult: true,
      accessProfessional: true,
      isAdmin: true,
    }
  }

  switch (role) {
    case "professional":
      return {
        accessKids: false,
        accessAdult: true,
        accessProfessional: true,
        isAdmin: false,
      }
    case "adult":
      return {
        accessKids: false,
        accessAdult: true,
        accessProfessional: false,
        isAdmin: false,
      }
    case "kid":
      return {
        accessKids: true,
        accessAdult: false,
        accessProfessional: false,
        isAdmin: false,
      }
    default:
      return {
        accessKids: false,
        accessAdult: false,
        accessProfessional: false,
        isAdmin: false,
      }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { auth } = usePage().props as any;
  const initialUser = auth?.user ? { ...auth.user, permissions: determinePermissions(auth.user.role) } : null;
  const [user, setUser] = useState<User | null>(initialUser)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  
  useEffect(() => {
    if (auth?.user) {
      setUser({ ...auth.user, permissions: determinePermissions(auth.user.role) });
    } else {
      setUser(null);
    }
  }, [auth]);

  const register = async (username: string, password: string, name: string, age: number): Promise<{ success: boolean; error?: string }> => {
    setIsAuthenticating(true)
    return new Promise((resolve) => {
        router.post('/register', { username, password, password_confirmation: password, name, age }, {
            onSuccess: () => {
                // Do not setIsAuthenticating(false) here, we wait for full page reload to Dashboard
                resolve({ success: true });
            },
            onError: (errors) => {
                setIsAuthenticating(false);
                resolve({ success: false, error: Object.values(errors)[0] as string || 'Registration failed' });
            }
        });
    });
  }

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    setIsAuthenticating(true)
    return new Promise((resolve) => {
        router.post('/login', { username, password }, {
            onSuccess: (page) => {
                // Do not setIsAuthenticating(false) here, we wait for full page reload to Dashboard
                const fetchedUser = (page.props as any).auth?.user;
                if (!fetchedUser) return resolve({ success: false, error: 'Login parsing failed' });
                const userWithPermissions = { ...fetchedUser, permissions: determinePermissions(fetchedUser.role) };
                setUser(userWithPermissions);
                resolve({ success: true, user: userWithPermissions });
            },
            onError: (errors) => {
                setIsAuthenticating(false);
                resolve({ success: false, error: Object.values(errors)[0] as string || 'Login failed' });
            }
        });
    });
  }

  const logout = () => {
    setIsLoggingOut(true)
    setTimeout(() => {
        router.post('/logout', {}, {
            onSuccess: () => {
                setIsLoggingOut(false);
                setUser(null);
                router.visit('/');
            }
        });
    }, 1500)
  }

  const refreshUser = async () => {
    router.reload({ only: ['auth'] });
  }

  const getRedirectPath = () => {
    return determineRedirectPath(user)
  }

  const isAuthenticated = user !== null

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, isLoading, isLoggingOut, isAuthenticated, isAuthenticating, getRedirectPath }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
