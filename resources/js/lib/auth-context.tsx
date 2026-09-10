"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { router, usePage } from '@inertiajs/react';

import type { User, UserRole, UserPermissions } from "@/types/user"
export type { User, UserRole, UserPermissions }

interface AuthContextType {
  user: User | null
  login: (username: string, password: string, confirmOverwrite?: boolean) => Promise<{ success: boolean; error?: string; user?: User; requiresConfirmation?: boolean }>
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

  const roles = (user.role ?? '').split(',').map(r => r.trim());
  if (roles.includes('admin')) return '/admin'
  if (roles.includes('professional')) return '/professional'
  if (roles.includes('adult')) return '/adult'
  if (roles.includes('kid')) return '/kids'

  return '/'
}

// Helper function to determine permissions
function determinePermissions(role: string) {
  const roles = (role ?? "guest").split(",");
  const isAdmin = roles.includes("admin");
  const isProfessional = roles.includes("professional") || isAdmin;
  const isAdult = roles.includes("adult") || isProfessional;
  const isKid = roles.includes("kid") || isAdult;
  return {
    accessKids: isKid,
    accessAdult: isAdult,
    accessProfessional: isProfessional,
    isAdmin: isAdmin,
  };
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

  const login = async (username: string, password: string, confirmOverwrite: boolean = false): Promise<{ success: boolean; error?: string; user?: User; requiresConfirmation?: boolean }> => {
    setIsAuthenticating(true)
    return new Promise((resolve) => {
        router.post('/login', { username, password, confirm_overwrite: confirmOverwrite }, {
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
                if (errors.session_conflict) {
                    resolve({ success: false, requiresConfirmation: true, error: errors.session_conflict as string });
                } else {
                    resolve({ success: false, error: Object.values(errors)[0] as string || 'Login failed' });
                }
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
