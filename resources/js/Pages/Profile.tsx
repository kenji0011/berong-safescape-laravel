"use client"

import { useEffect, useState } from "react"
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  User, Key, CheckCircle, AlertCircle, Eye, EyeOff, Loader2,
  Trophy, BookOpen, ArrowUpRight, Minus, Lock, Check, Shield
} from "lucide-react"
import { ScoreGauge } from "@/components/score-gauge"
import { cn } from "@/lib/utils"

interface UserScores {
  preTestScore: number | null
  preTestMax: number
  preTestCompletedAt: string | null
  postTestScore: number | null
  postTestMax: number
  postTestCompletedAt: string | null
  engagementPoints: number
}

export default function ProfilePage() {
  
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  // Profile Management
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    age: "",
    role: "",
    avatar: "cow",
  })

  // Avatars Configuration
  const AVATAR_OPTIONS = [
    { id: 'cow', icon: '🐮', label: 'Default Guide', category: 'Special' },
    { id: 'ff1', icon: '👨‍🚒', label: 'Hero Jack', category: 'Firefighter' },
    { id: 'ff2', icon: '👩‍🚒', label: 'Hero Sarah', category: 'Firefighter' },
    { id: 'kid1', icon: '🧒', label: 'Safety Scout', category: 'Kid' },
    { id: 'kid2', icon: '👧', label: 'Explorer', category: 'Kid' },
    { id: 'adult1', icon: '👨', label: 'Guardian', category: 'Adult' },
    { id: 'adult2', icon: '👩', label: 'Mentor', category: 'Adult' },
  ]

  // Password Management
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Confirm dialog for profile update
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showConfirmPasswordField, setShowConfirmPasswordField] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [confirmError, setConfirmError] = useState("")

  // Password change loading
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Avatar Modal Management
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState("cow")

  // Scores
  const [scores, setScores] = useState<UserScores | null>(null)
  const [scoresLoading, setScoresLoading] = useState(true)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.visit("/login")
      return
    }

    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        age: user.age ? user.age.toString() : "",
        role: user.role || "",
        avatar: user.avatar || "cow",
      })
      setSelectedAvatar(user.avatar || "cow")
    }

    setLoading(false)
    fetchScores()
  }, [isAuthenticated, user, router, isLoading])

  // Auto-hide notifications
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const fetchScores = async () => {
    try {
      setScoresLoading(true)
      const response = await axios.get('/api/auth/user-scores')
      const result = response.data
      if (result.success) {
        setScores(result.scores)
      }
    } catch (err) {
      console.error('Failed to fetch scores:', err)
    } finally {
      setScoresLoading(false)
    }
  }

  const handleUpdateProfile = () => {
    setError("")
    if (!profile.name.trim()) {
      setError("Name is required")
      return
    }

    // Email validation
    if (profile.email && profile.email.trim()) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (!emailRegex.test(profile.email.trim())) {
        setError("Please enter a valid email address")
        return
      }
    }

    // Show password confirmation dialog
    setConfirmPassword("")
    setConfirmError("")
    setShowConfirmPasswordField(false)
    setShowConfirmDialog(true)
  }

  const handleConfirmUpdate = async () => {
    if (!confirmPassword) {
      setConfirmError("Please enter your password to confirm changes")
      return
    }

    setConfirmLoading(true)
    setConfirmError("")

    try {
      const response = await axios.put('/api/auth/update-profile', {
        name: profile.name.trim(),
        email: profile.email.trim() || null,
        avatar: profile.avatar,
        password: confirmPassword,
      })

      const result = response.data

      if (result.success) {
        setShowConfirmDialog(false)
        setConfirmPassword("")
        setSuccess("Profile updated successfully!")
        // Refresh user data in auth context
        if (refreshUser) await refreshUser()
      } else {
        setConfirmError(result.error || "Failed to update profile")
      }
    } catch (err: any) {
      setConfirmError(err.response?.data?.error || "Network error. Please try again.")
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setError("")

    if (!password.current || !password.new || !password.confirm) {
      setError("Please fill all password fields")
      return
    }

    if (password.new !== password.confirm) {
      setError("New passwords do not match")
      return
    }

    const COMMON_PASSWORDS = ['password123', 'password', '123456', 'qwerty', 'abc123', 'letmein', 'admin', 'welcome', 'monkey', 'password1', 'iloveyou', 'sunshine', 'princess', 'football', 'shadow', 'master', 'trustno1', 'dragon'];
    
    if (password.new.length < 8) {
      setError("New password must be at least 8 characters")
      return
    }

    if (!/[A-Z]/.test(password.new)) {
      setError("New password must contain at least one uppercase letter")
      return
    }

    if (!/[a-z]/.test(password.new)) {
      setError("New password must contain at least one lowercase letter")
      return
    }

    if (!/[0-9]/.test(password.new)) {
      setError("New password must contain at least one number")
      return
    }

    if (!/[^A-Za-z0-9]/.test(password.new)) {
      setError("New password must contain at least one special character (!@#$%^&*)")
      return
    }

    if (COMMON_PASSWORDS.includes(password.new.toLowerCase())) {
      setError("This password is too common. Please choose a stronger one.")
      return
    }

    if (password.current === password.new) {
      setError("New password must be different from your current password")
      return
    }

    setPasswordLoading(true)

    try {
      const response = await axios.put('/api/auth/change-password', {
        currentPassword: password.current,
        newPassword: password.new,
        confirmPassword: password.confirm,
      })

      const result = response.data

      if (result.success) {
        setPassword({ current: "", new: "", confirm: "" })
        setShowCurrentPassword(false)
        setShowNewPassword(false)
        setShowConfirmPassword(false)
        setSuccess("Password changed successfully!")
      } else {
        setError(result.error || "Failed to change password")
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Network error. Please try again.")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSaveAvatar = async () => {
    setAvatarLoading(true)
    setError("")

    try {
      const response = await axios.put('/api/auth/update-avatar', {
        avatar: selectedAvatar,
      })
      
      if (response.data.success) {
        setProfile({ ...profile, avatar: selectedAvatar })
        if (refreshUser) await refreshUser()
        setSuccess("Hero avatar updated!")
        setShowAvatarModal(false)
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (err: any) {
      setError("Failed to update avatar. Please try again.")
    } finally {
      setAvatarLoading(false)
    }
  }

  const getScorePercentage = (score: number | null, max: number) => {
    if (score === null || max === 0) return 0
    return Math.round((score / max) * 100)
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    if (percentage >= 40) return "text-orange-500"
    return "text-red-500"
  }

  const getScoreBg = (percentage: number) => {
    if (percentage >= 80) return "bg-green-100"
    if (percentage >= 60) return "bg-yellow-100"
    if (percentage >= 40) return "bg-orange-100"
    return "bg-red-100"
  }

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 90) return "Outstanding!"
    if (percentage >= 80) return "Excellent"
    if (percentage >= 70) return "Very Good"
    if (percentage >= 60) return "Good"
    if (percentage >= 50) return "Fair"
    if (percentage >= 40) return "Needs Improvement"
    return "Keep Studying"
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[80px] sm:pt-[96px] pb-8 relative z-10">
        {/* Background Overlay - Dynamic based on theme */}
        <div className="fixed inset-0 bg-background transition-colors duration-500 pointer-events-none" />

        {/* Header */}
        <div className="mb-6 sm:mb-8 bg-white dark:bg-slate-800 p-6 rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#1e293b] flex items-center justify-between transition-colors relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-xl transition-colors">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-[#d60000] dark:text-red-400" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight transition-colors">User Profile</h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors">Manage your account and choose your hero.</p>
              </div>
            </div>
          </div>

          {/* Minimalist Avatar Trigger - ONLY FOR KIDS */}
          {profile.role === 'kid' ? (
            <button 
              onClick={() => setShowAvatarModal(true)}
              className="group relative flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-dashed border-slate-200 dark:border-slate-700 hover:border-yellow-400 dark:hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 transition-all duration-300 shrink-0 overflow-visible"
            >
              <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">
                {AVATAR_OPTIONS.find(opt => opt.id === profile.avatar)?.icon || "🐮"}
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 sm:h-7 sm:w-7 bg-yellow-400 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white font-black text-xs sm:text-sm">+</span>
              </div>
            </button>
          ) : (
            <div className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-slate-100 dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-inner shrink-0 transition-colors">
               <User className="h-8 w-8 sm:h-10 sm:w-10 text-slate-400 dark:text-slate-500" />
            </div>
          )}
        </div>

        {/* Floating Feedback Notifications (Toasts) */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 w-[calc(100%-2rem)] max-w-md pointer-events-none">
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } }}
                className="bg-green-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto border-2 border-white dark:border-slate-800"
              >
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <p className="font-black text-sm uppercase tracking-wider">{success}</p>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } }}
                className="bg-red-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto border-2 border-white dark:border-slate-800"
              >
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <p className="font-black text-sm uppercase tracking-wider">{error}</p>
                <button 
                  onClick={() => setError("")}
                  className="ml-auto hover:bg-white/10 p-1 rounded-md transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-8 relative z-10">
          {/* Profile Information */}
          <Card className="rounded-[2rem] border-2 border-slate-200 dark:border-slate-700 shadow-[0_8px_0_#e2e8f0] dark:shadow-[0_8px_0_#1e293b] bg-white dark:bg-slate-800 p-0 overflow-hidden transition-colors">
            <CardHeader className="bg-slate-100/50 dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-700 pt-8 pb-8 rounded-t-[1.85rem] transition-colors">
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-white transition-colors">Profile Information</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 pb-8 dark:bg-slate-800 transition-colors">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name" className="font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Full Name</Label>
                  <Input
                    id="profile-name"
                    placeholder="Your full name"
                    value={profile.name}
                    onChange={(e) => {
                      setError("")
                      setProfile({ ...profile, name: e.target.value })
                    }}
                    className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-6 focus-visible:border-red-500 dark:focus-visible:border-red-500 focus-visible:ring-offset-0 focus-visible:ring-0 transition-colors font-medium text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email" className="font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Email Address</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    placeholder="your.email@example.com (optional)"
                    value={profile.email}
                    onChange={(e) => {
                      setError("")
                      setProfile({ ...profile, email: e.target.value })
                    }}
                    className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-6 focus-visible:border-red-500 dark:focus-visible:border-red-500 focus-visible:ring-offset-0 focus-visible:ring-0 transition-colors font-medium text-slate-700 dark:text-slate-200"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 ml-1 font-medium transition-colors">
                    Used for password reset. Must be unique per account.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-age" className="font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Age</Label>
                  <Input
                    id="profile-age"
                    type="number"
                    value={profile.age}
                    disabled
                    className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-6 font-medium text-slate-500 dark:text-slate-400 italic transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-role" className="font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Role</Label>
                  <Input
                    id="profile-role"
                    value={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                    disabled
                    className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-6 font-medium text-slate-500 dark:text-slate-400 italic transition-colors"
                  />
                </div>
              </div>
              <Button 
                onClick={handleUpdateProfile} 
                className="w-full bg-[#e11d48] text-white shadow-[0_4px_0_#9f1239] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#9f1239] hover:bg-[#e11d48] active:translate-y-1 active:shadow-[0_0px_0_#9f1239] rounded-full font-black uppercase tracking-wider py-6 transition-all"
              >
                <User className="h-5 w-5 mr-2" strokeWidth={2.5} />
                Update Profile
              </Button>
            </CardContent>
          </Card>

          {/* Password Management */}
          <Card className="rounded-[2rem] border-2 border-slate-200 dark:border-slate-700 shadow-[0_8px_0_#e2e8f0] dark:shadow-[0_8px_0_#1e293b] bg-white dark:bg-slate-800 p-0 overflow-hidden transition-colors">
            <CardHeader className="bg-slate-100/50 dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-700 pt-8 pb-8 rounded-t-[1.85rem] transition-colors">
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-white transition-colors">Password Management</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Change your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 pb-8 dark:bg-slate-800 transition-colors">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter your current password"
                      value={password.current}
                      onChange={(e) => {
                        setError("")
                        setPassword({ ...password, current: e.target.value })
                      }}
                      className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-6 pr-12 focus-visible:border-red-500 dark:focus-visible:border-red-500 focus-visible:ring-offset-0 focus-visible:ring-0 transition-colors font-medium text-slate-700 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                      tabIndex={-1}
                    >
                      {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={password.new}
                      onChange={(e) => {
                        setError("")
                        setPassword({ ...password, new: e.target.value })
                      }}
                      className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-6 pr-12 focus-visible:border-red-500 dark:focus-visible:border-red-500 focus-visible:ring-offset-0 focus-visible:ring-0 transition-colors font-medium text-slate-700 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Permanent Password Requirements - Inline Below Input */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 transition-colors">
                    <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                      <Shield className="h-3 w-3 text-orange-500" />
                      Password Strength
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                      {[
                        { label: "At least 8 characters", met: password.new.length >= 8 },
                        { label: "One uppercase letter", met: /[A-Z]/.test(password.new) },
                        { label: "One lowercase letter", met: /[a-z]/.test(password.new) },
                        { label: "One number (0-9)", met: /[0-9]/.test(password.new) },
                        { label: "One special character (!@#...)", met: /[^A-Za-z0-9]/.test(password.new) },
                      ].map((req, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <div className={`h-4 w-4 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${req.met ? "bg-green-500 scale-110" : "bg-slate-100 dark:bg-slate-800"}`}>
                            <Check className={`h-2.5 w-2.5 text-white transition-opacity ${req.met ? "opacity-100" : "opacity-0"}`} strokeWidth={5} />
                          </div>
                          <span className={`text-[10px] sm:text-xs font-bold leading-tight transition-colors ${req.met ? "text-green-700 dark:text-green-400" : "text-slate-500 dark:text-slate-400"}`}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={password.confirm}
                      onChange={(e) => {
                        setError("")
                        setPassword({ ...password, confirm: e.target.value })
                      }}
                      className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-6 pr-12 focus-visible:border-red-500 dark:focus-visible:border-red-500 focus-visible:ring-offset-0 focus-visible:ring-0 transition-colors font-medium text-slate-700 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleChangePassword}
                className="w-full bg-slate-900 dark:bg-slate-700 text-white shadow-[0_4px_0_#0f172a] dark:shadow-[0_4px_0_#1e293b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#0f172a] dark:hover:shadow-[0_6px_0_#1e293b] hover:bg-slate-900 dark:hover:bg-slate-600 active:translate-y-1 active:shadow-[0_0px_0_#0f172a] rounded-full font-black uppercase tracking-wider py-6 transition-all"
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <Key className="h-5 w-5 mr-2" />
                    Change Password
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Scores */}
        <Card className="mt-8 rounded-[2rem] border-2 border-slate-200 dark:border-slate-700 shadow-[0_12px_0_#f1f5f9] dark:shadow-[0_12px_0_#1e293b] bg-white dark:bg-slate-800 p-0 overflow-hidden transition-all duration-300 relative z-10">
          <CardHeader className="bg-slate-100/50 dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-700 p-5 sm:p-8 rounded-t-[1.85rem] transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-black text-slate-800 dark:text-white transition-colors">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-1.5 sm:p-2 rounded-xl transition-colors">
                    <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 dark:text-orange-400" strokeWidth={2.5} />
                  </div>
                  Assessment Scores
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 font-bold mt-1 ml-1 text-xs sm:text-sm transition-colors">Track your fire safety knowledge growth</CardDescription>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-sm transition-colors w-fit">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Total Progress</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-16 sm:w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${scores ? (getScorePercentage(scores.preTestScore, 15) + getScorePercentage(scores.postTestScore, 15)) / 2 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            {scoresLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-orange-400" strokeWidth={3} />
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading performance data...</p>
              </div>
            ) : scores ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pre-Test Card */}
                <div className={cn(
                  "relative group overflow-hidden border-2 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 transition-all duration-500",
                  scores.preTestScore !== null 
                    ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-500/50" 
                    : "bg-slate-50/50 dark:bg-slate-900/30 border-dashed border-slate-300 dark:border-slate-700 opacity-80"
                )}>
                  {/* Decorative background circle */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
                  
                  <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
                    <div className="shrink-0 scale-90 sm:scale-100">
                      {scores.preTestScore !== null ? (
                        <ScoreGauge 
                          percentage={getScorePercentage(scores.preTestScore, 15)} 
                          color="#3b82f6" 
                          size={110}
                          strokeWidth={10}
                        />
                      ) : (
                        <div className="w-[110px] h-[110px] rounded-full border-4 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-800 shadow-inner transition-colors">
                          <BookOpen className="h-8 w-8 text-slate-200 dark:text-slate-700 transition-colors" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest rounded-full border border-blue-200 dark:border-blue-800 transition-colors">
                          Baseline Test
                        </span>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white transition-colors">Pre-Test</h3>
                      </div>
                      
                      {scores.preTestScore !== null ? (
                        <div className="space-y-4">
                          <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed transition-colors">
                            Initial assessment taken before starting the course modules.
                          </p>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Raw Score</span>
                              <span className="text-xl font-black text-slate-800 dark:text-white transition-colors">{scores.preTestScore} / 15</span>
                            </div>
                            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 hidden sm:block transition-colors" />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Status</span>
                              <span className={cn("text-lg font-black", getScoreColor(getScorePercentage(scores.preTestScore, 15)))}>
                                {getScoreLabel(getScorePercentage(scores.preTestScore, 15))}
                              </span>
                            </div>
                          </div>
                          {scores.preTestCompletedAt && (
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-center sm:justify-start gap-2 text-slate-400 dark:text-slate-500 text-xs font-bold transition-colors">
                              <CheckCircle className="h-3.5 w-3.5 text-blue-400 dark:text-blue-500" />
                              Completed {formatDate(scores.preTestCompletedAt)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-slate-400 font-medium leading-relaxed">
                            Start your fire safety journey by taking the Pre-Test assessment.
                          </p>
                          <Button 
                            onClick={() => router.visit('/assessment/pre-test')}
                            variant="outline"
                            className="rounded-full border-2 border-blue-500 text-blue-600 font-black px-6 hover:bg-blue-50 transition-all uppercase text-xs tracking-widest"
                          >
                            Take Pre-Test Now
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Post-Test Card */}
                <div className={cn(
                  "relative group overflow-hidden border-2 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 transition-all duration-500",
                  scores.postTestScore !== null 
                    ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-500/50" 
                    : "bg-slate-50/50 dark:bg-slate-900/30 border-dashed border-slate-300 dark:border-slate-700 opacity-80"
                )}>
                  {/* Decorative background circle */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-50 dark:bg-orange-900/20 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
                  
                  <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
                    <div className="shrink-0 scale-90 sm:scale-100">
                      {scores.postTestScore !== null ? (
                        <ScoreGauge 
                          percentage={getScorePercentage(scores.postTestScore, 15)} 
                          color="#f97316" 
                          size={110}
                          strokeWidth={10}
                        />
                      ) : (
                        <div className="w-[110px] h-[110px] rounded-full border-4 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-800 shadow-inner transition-colors">
                          <Trophy className="h-8 w-8 text-slate-200 dark:text-slate-700 transition-colors" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 font-black text-[10px] uppercase tracking-widest rounded-full border border-orange-200 dark:border-orange-800 transition-colors">
                          Final Exam
                        </span>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white transition-colors">Post-Test</h3>
                      </div>
                      
                      {scores.postTestScore !== null ? (
                        <div className="space-y-4">
                          <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed transition-colors">
                            Final assessment taken after completing all fire safety modules.
                          </p>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Final Score</span>
                              <span className="text-xl font-black text-slate-800 dark:text-white transition-colors">{scores.postTestScore} / 15</span>
                            </div>
                            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 hidden sm:block transition-colors" />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Status</span>
                              <span className={cn("text-lg font-black", getScoreColor(getScorePercentage(scores.postTestScore, 15)))}>
                                {getScoreLabel(getScorePercentage(scores.postTestScore, 15))}
                              </span>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            {scores.postTestCompletedAt && (
                              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                                <CheckCircle className="h-3.5 w-3.5 text-orange-400" />
                                Completed {formatDate(scores.postTestCompletedAt)}
                              </div>
                            )}
                            
                            {/* Improvement Indicator */}
                            {scores.preTestScore !== null && (
                              <div className={cn(
                                "inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-500",
                                scores.postTestScore > scores.preTestScore 
                                  ? "bg-green-50 text-green-600 border-2 border-green-100 shadow-sm" 
                                  : "bg-slate-50 text-slate-500 border-2 border-slate-100"
                              )}>
                                {scores.postTestScore > scores.preTestScore ? (
                                  <>
                                    <div className="bg-green-500 p-1 rounded-full">
                                      <ArrowUpRight className="h-3 w-3 text-white" strokeWidth={4} />
                                    </div>
                                    +{scores.postTestScore - scores.preTestScore} Points Up!
                                  </>
                                ) : scores.postTestScore === scores.preTestScore ? (
                                  "Consistent Result"
                                ) : (
                                  "Practice More"
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-slate-400 font-medium leading-relaxed">
                            {scores.preTestScore !== null 
                              ? "Complete all modules to unlock your final Post-Test exam." 
                              : "Unlock after completing modules and Pre-Test."}
                          </p>
                          <div className="flex items-center justify-center sm:justify-start gap-2 bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-2xl border-2 border-slate-200/50 dark:border-slate-700/50 transition-colors">
                            <Lock className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                            <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Currently Locked</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertCircle className="h-12 w-12 text-slate-200 mb-4" />
                <h3 className="text-lg font-black text-slate-800">No Assessment Data</h3>
                <p className="text-slate-500 font-medium max-w-xs mx-auto mt-2">
                  Take your first step towards becoming a fire safety hero by starting the Pre-Test.
                </p>
                <Button 
                  onClick={() => router.visit('/assessment/pre-test')}
                  className="mt-6 bg-[#e11d48] text-white rounded-full font-black px-8 py-6 shadow-lg shadow-red-100 hover:scale-105 transition-all"
                >
                  Start Assessment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Password Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-700 p-0 overflow-hidden shadow-[0_8px_0_#e2e8f0] dark:shadow-[0_8px_0_#0f172a] bg-white dark:bg-slate-800 transition-colors">
          {/* Header */}
          <div className="bg-slate-50 dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-700 p-6 sm:p-8 transition-colors">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl font-black text-slate-800 dark:text-white transition-colors">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl transition-colors">
                  <Key className="h-5 w-5 text-orange-500 dark:text-orange-400" strokeWidth={2.5} />
                </div>
                Confirm Changes
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium mt-1 ml-1 transition-colors">
                Enter your password to save profile changes.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="confirm-edit-password" className="font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Password</Label>
              <div className="relative">
                <Input
                  id="confirm-edit-password"
                  type={showConfirmPasswordField ? "text" : "password"}
                  placeholder="Enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmError("")
                    setConfirmPassword(e.target.value)
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && confirmPassword) handleConfirmUpdate() }}
                  className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-6 pr-12 focus-visible:border-orange-500 dark:focus-visible:border-orange-500 focus-visible:ring-offset-0 focus-visible:ring-0 transition-colors font-medium text-slate-700 dark:text-slate-200"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPasswordField(!showConfirmPasswordField)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPasswordField ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {confirmError && (
              <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded-xl p-3 transition-colors">
                <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                <span className="text-sm font-bold">{confirmError}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmDialog(false)
                  setConfirmPassword("")
                  setConfirmError("")
                }}
                className="flex-1 rounded-full border-2 border-slate-200 dark:border-slate-700 font-black py-6 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all uppercase tracking-wider text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmUpdate}
                disabled={confirmLoading || !confirmPassword}
                className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white rounded-full font-black py-6 shadow-[0_4px_0_#c2410c] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#c2410c] active:translate-y-1 active:shadow-[0_0px_0_#c2410c] transition-all uppercase tracking-wider text-xs"
              >
                {confirmLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Confirm & Save"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Hero Selection Modal */}
      <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
        <DialogContent className="sm:max-w-2xl rounded-[2.5rem] border-[4px] border-slate-100 dark:border-slate-800 p-0 overflow-hidden shadow-2xl transition-colors">
          <div className="bg-yellow-500 p-5 sm:p-8 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-3xl font-black flex items-center gap-2 sm:gap-3">
                <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl">
                  <Trophy className="h-5 w-5 sm:h-8 sm:w-8 text-white" strokeWidth={3} />
                </div>
                CHOOSE YOUR HERO
              </DialogTitle>
              <DialogDescription className="text-yellow-50 font-bold text-sm sm:text-lg mt-1 sm:mt-2 opacity-90">
                Select an identity to lead your fire safety mission.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-4 sm:p-8 bg-slate-50/50 dark:bg-slate-900/50 max-h-[70vh] overflow-y-auto transition-colors">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 mb-8">
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedAvatar(opt.id)}
                  className={cn(
                    "group relative flex flex-col items-center gap-1.5 sm:gap-3 p-2 sm:p-5 rounded-2xl sm:rounded-[2rem] border-[3px] transition-all duration-300",
                    selectedAvatar === opt.id 
                      ? "bg-white dark:bg-slate-800 border-yellow-400 dark:border-yellow-500 shadow-xl scale-105 z-10" 
                      : "bg-white/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800"
                  )}
                >
                  <div className={cn(
                    "h-14 w-14 sm:h-20 sm:w-20 rounded-full flex items-center justify-center text-3xl sm:text-5xl transition-transform group-hover:scale-110",
                    selectedAvatar === opt.id ? "bg-yellow-50 dark:bg-yellow-900/30" : "bg-slate-50 dark:bg-slate-900"
                  )}>
                    {opt.icon}
                  </div>
                  
                  <div className="text-center px-1">
                    <p className={cn(
                      "text-[8px] sm:text-[10px] font-black uppercase tracking-widest leading-none mb-0.5 sm:mb-1",
                      selectedAvatar === opt.id ? "text-yellow-600" : "text-slate-400"
                    )}>
                      {opt.category}
                    </p>
                    <p className={cn(
                      "text-[10px] sm:text-xs font-black tracking-tight leading-tight transition-colors",
                      selectedAvatar === opt.id ? "text-slate-800 dark:text-white" : "text-slate-600 dark:text-slate-400"
                    )}>
                      {opt.label}
                    </p>
                  </div>

                  {selectedAvatar === opt.id && (
                    <div className="absolute top-2 right-2 h-6 w-6 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      <CheckCircle className="h-3 w-3 text-white" strokeWidth={4} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-2 sm:gap-4 sticky bottom-0 bg-white dark:bg-slate-800 p-2 rounded-2xl border-t border-slate-100 dark:border-slate-700 mt-2 sm:mt-0 transition-colors">
              <Button
                variant="outline"
                onClick={() => setShowAvatarModal(false)}
                className="flex-1 rounded-xl sm:rounded-2xl border-2 py-4 sm:py-6 font-bold text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-xs sm:text-base"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAvatar}
                disabled={avatarLoading}
                className="flex-[2] bg-yellow-400 hover:bg-yellow-500 text-amber-950 rounded-xl sm:rounded-2xl py-4 sm:py-6 font-black uppercase tracking-widest shadow-[0_4px_0_#ca8a04] active:translate-y-1 active:shadow-none transition-all text-xs sm:text-base"
              >
                {avatarLoading ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                ) : (
                  "Save My Hero"
                )}
              </Button>
            </div>
            
            <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-bold mt-4 uppercase tracking-tighter transition-colors">
              Tip: Your hero will appear on your main dashboard mission map!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
