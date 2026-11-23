"use client"

import { useEffect, useState } from "react"
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { motion, AnimatePresence } from "motion/react"
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/Components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Alert, AlertDescription } from "@/Components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog"
import {
  User, Key, CheckCircle, AlertCircle, Eye, EyeOff, Loader2,
  Trophy, BookOpen, ArrowUpRight, Minus, Lock, Check, Shield,
  Camera, Mail, Award, Calendar, Sparkles
} from "lucide-react"
import { ScoreGauge } from "@/Components/score-gauge"
import { ScoreCardsSkeleton } from "@/Components/dashboard-skeletons"
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
  const isKid = user?.role ? user.role.split(',').map(r => r.trim()).some(r => r === 'kid' || r === 'adult') : false
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
    { id: 'cow', icon: '/berong_pr.webp', label: 'Berong', category: 'Special' },
    { id: 'ff1', icon: '/hero_jack.webp?v=2', label: 'Hero Jack', category: 'Firefighter' },
    { id: 'ff2', icon: '/hero_sarah.webp?v=2', label: 'Hero Sarah', category: 'Firefighter' },
    { id: 'kid1', icon: '/hero_boy.webp', label: 'Safety Scout', category: 'Kid' },
    { id: 'kid2', icon: '/hero_girl.webp', label: 'Explorer', category: 'Kid' },
    { id: 'adult1', icon: '/hero_male.webp', label: 'Guardian', category: 'Adult' },
    { id: 'adult2', icon: '/hero_female.webp', label: 'Mentor', category: 'Adult' },
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
  const [activeAvatarTab, setActiveAvatarTab] = useState("All")

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

  const filteredAvatars = activeAvatarTab === "All"
    ? AVATAR_OPTIONS
    : AVATAR_OPTIONS.filter(opt => opt.category === activeAvatarTab);

  return (
    <div className="min-h-screen relative">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[104px] sm:pt-[120px] pb-8 relative z-10">
        {/* Background Layer with Dotted Pattern */}
        <div className="fixed inset-0 pointer-events-none transition-colors duration-500 bg-white dark:bg-slate-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Header Cover Banner */}
        <div 
          style={{ viewTransitionName: 'profile-banner-morph' }}
          className="mb-6 sm:mb-8 bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-800 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] overflow-hidden transition-all relative z-10"
        >
          {/* Cover color band */}
          <div className="h-28 sm:h-36 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 dark:from-rose-800 dark:via-orange-850 dark:to-amber-600 relative overflow-hidden">
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:14px_24px]" />
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl" />
            <div className="absolute left-12 top-4 w-24 h-24 rounded-full bg-yellow-300/20 blur-lg" />
          </div>
          
          {/* Main header content */}
          <div className="px-4 sm:px-8 pb-5 sm:pb-8 pt-0 relative flex flex-col md:flex-row items-center md:items-center md:justify-between gap-5 -mt-12 sm:-mt-14">
            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 text-center md:text-left w-full md:w-auto">
              {/* Avatar Selector Trigger */}
              <button 
                onClick={() => setShowAvatarModal(true)}
                style={{ viewTransitionName: 'profile-avatar-morph' }}
                className="group relative flex items-center justify-center h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-900 shadow-xl hover:border-yellow-400 dark:hover:border-yellow-500 transition-all duration-300 shrink-0 overflow-visible cursor-pointer"
              >
                <div className="h-full w-full flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden rounded-full relative bg-slate-50 dark:bg-slate-950">
                  {(() => {
                    const opt = AVATAR_OPTIONS.find(opt => opt.id === profile.avatar);
                    if (opt?.icon.startsWith('/')) {
                      return <img 
                        src={opt.icon} 
                        alt={opt.label} 
                        className={cn(
                          "h-full w-full object-cover rounded-full transform-gpu transition-all duration-300",
                          opt.id === 'cow' && "dark:brightness-90 dark:contrast-110 dark:grayscale-[5%]"
                        )} 
                      />;
                    }
                    return <span className="text-4xl sm:text-5xl">{opt?.icon || "🐮"}</span>;
                  })()}
                  
                  {/* Hover Edit Overlay */}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                    <Camera className="h-6 w-6 text-white animate-pulse" strokeWidth={2.5} />
                  </div>
                </div>
                {/* Plus/Edit Icon Badge */}
                <div className="absolute bottom-0 right-0 h-7 w-7 sm:h-8 sm:w-8 bg-yellow-400 hover:bg-yellow-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
                  <Camera className="text-white h-3.5 w-3.5" strokeWidth={3} />
                </div>
              </button>
              
              {/* Profile Name & Email Box */}
              <div 
                style={{ viewTransitionName: 'profile-header-card-morph' }}
                className="w-full md:w-auto flex flex-col justify-center bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border-[2.5px] border-slate-200 dark:border-slate-800 p-4 sm:px-6 sm:py-4 rounded-2xl shadow-sm"
              >
                <div className="flex flex-col sm:flex-row items-center gap-2 mb-1 justify-center md:justify-start">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight transition-colors">{profile.name || "Fire Safety Hero"}</h1>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-950/60 text-[#d60000] dark:text-red-400 text-[10px] font-black uppercase tracking-wider rounded-full border border-red-200 dark:border-red-900/60 transition-colors">
                    <Shield className="h-3 w-3" strokeWidth={2.5} />
                    {profile.role || "User"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold transition-colors flex items-center justify-center md:justify-start gap-1.5 mt-0.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {profile.email || "No email linked"}
                </p>
              </div>
            </div>

            {/* Quick stats board (2-column grid on mobile) */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-3 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border-[2.5px] border-slate-200 dark:border-slate-800 p-3 sm:px-5 sm:py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex-1 md:flex-initial cursor-default">
                <div className="bg-yellow-100 dark:bg-yellow-950/50 p-2 rounded-xl text-yellow-600 dark:text-yellow-400 shrink-0">
                  <Award className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">XP Points</p>
                  <p className="text-base sm:text-lg font-black text-slate-800 dark:text-white mt-1 leading-none">{scores?.engagementPoints ?? 0}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border-[2.5px] border-slate-200 dark:border-slate-800 p-3 sm:px-5 sm:py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex-1 md:flex-initial cursor-default">
                <div className="bg-blue-100 dark:bg-blue-950/50 p-2 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                  <Calendar className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Age Group</p>
                  <p className="text-base sm:text-lg font-black text-slate-800 dark:text-white mt-1 leading-none">{profile.age ? `${profile.age} Y/O` : "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8 relative z-10">
          {/* Profile Information */}
          <Card className="rounded-[1.5rem] sm:rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-800 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] bg-white dark:bg-slate-900 p-0 gap-0 overflow-hidden transition-colors flex flex-col h-full">
            <CardHeader className="bg-slate-50 dark:bg-slate-950/60 border-b-[3px] border-slate-100 dark:border-slate-800 px-5 sm:px-7 py-3.5 sm:py-4 [.border-b]:pb-3.5 sm:[.border-b]:pb-4 transition-colors">
              <CardTitle className="text-lg sm:text-xl font-black text-slate-800 dark:text-white transition-colors">Profile Information</CardTitle>
              <CardDescription className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 transition-colors">Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="px-5 sm:px-7 pt-4 pb-5 sm:pb-7 space-y-6 dark:bg-slate-900 transition-colors flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name" className="font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-300 ml-1 transition-colors">Full Name</Label>
                  <div className="relative flex items-center">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 z-10" strokeWidth={2.5} />
                    <Input
                      id="profile-name"
                      placeholder="Your full name"
                      value={profile.name}
                      onChange={(e) => {
                        setError("")
                        setProfile({ ...profile, name: e.target.value })
                      }}
                      style={{ paddingLeft: '3.25rem' }}
                      className="rounded-2xl border-[3px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pr-4 py-3.5 focus-visible:border-red-500 dark:focus-visible:border-red-500 focus-visible:ring-offset-0 focus-visible:ring-0 transition-colors font-semibold text-sm text-slate-800 dark:text-slate-200 w-full shadow-xs"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email" className="font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-300 ml-1 transition-colors">Email Address</Label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 z-10" strokeWidth={2.5} />
                    <Input
                      id="profile-email"
                      type="email"
                      placeholder="your.email@example.com (optional)"
                      value={profile.email}
                      readOnly
                      style={{ paddingLeft: '3.25rem' }}
                      className="rounded-2xl border-[3px] border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/60 pr-4 py-3.5 transition-colors font-semibold text-sm text-slate-500 dark:text-slate-400 w-full cursor-not-allowed select-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 ml-1 font-semibold transition-colors">
                    Used for password reset. Must be unique per account.
                  </p>
                </div>
              </div>

              <div className="space-y-5 pt-2">
                {/* Account Status Info Box */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-slate-50 dark:bg-slate-950/50 border-[2.5px] border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 transition-colors flex flex-col justify-center">
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account Role</p>
                    <p className="text-sm sm:text-base font-black text-slate-700 dark:text-slate-200 mt-1 capitalize truncate">{profile.role}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/50 border-[2.5px] border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 transition-colors flex flex-col justify-center">
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Age</p>
                    <p className="text-sm sm:text-base font-black text-slate-700 dark:text-slate-200 mt-1 truncate">{profile.age ? `${profile.age} Y/O` : "N/A"}</p>
                  </div>
                </div>

                <button 
                  onClick={handleUpdateProfile} 
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl border-b-[5px] border-red-800 active:border-b-0 active:translate-y-[5px] transition-all uppercase tracking-widest text-xs sm:text-sm shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <User className="h-4.5 w-4.5" strokeWidth={2.5} />
                  Update Profile
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Password Management */}
          <Card className="rounded-[1.5rem] sm:rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-800 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] bg-white dark:bg-slate-900 p-0 gap-0 overflow-hidden transition-colors flex flex-col h-full">
            <CardHeader className="bg-slate-50 dark:bg-slate-950/60 border-b-[3px] border-slate-100 dark:border-slate-800 px-5 sm:px-7 py-3.5 sm:py-4 [.border-b]:pb-3.5 sm:[.border-b]:pb-4 transition-colors">
              <CardTitle className="text-lg sm:text-xl font-black text-slate-800 dark:text-white transition-colors">Password Management</CardTitle>
              <CardDescription className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 transition-colors">Change your account password</CardDescription>
            </CardHeader>
            <CardContent className="px-5 sm:px-7 pt-4 pb-5 sm:pb-7 space-y-6 dark:bg-slate-900 transition-colors flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-300 ml-1 transition-colors">Current Password</Label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 z-10" strokeWidth={2.5} />
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      value={password.current}
                      onChange={(e) => {
                        setError("")
                        setPassword({ ...password, current: e.target.value })
                      }}
                      style={{ paddingLeft: '3.25rem', paddingRight: '3.25rem' }}
                      className="rounded-2xl border-[3px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-3.5 focus-visible:border-red-500 dark:focus-visible:border-red-500 focus-visible:ring-offset-0 focus-visible:ring-0 transition-colors font-semibold text-sm text-slate-800 dark:text-slate-200 w-full shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-300 ml-1 transition-colors">New Password</Label>
                  <div className="relative flex items-center">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 z-10" strokeWidth={2.5} />
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password.new}
                      onChange={(e) => {
                        setError("")
                        setPassword({ ...password, new: e.target.value })
                      }}
                      style={{ paddingLeft: '3.25rem', paddingRight: '3.25rem' }}
                      className="rounded-2xl border-[3px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-3.5 focus-visible:border-red-500 dark:focus-visible:border-red-500 focus-visible:ring-offset-0 focus-visible:ring-0 transition-colors font-semibold text-sm text-slate-800 dark:text-slate-200 w-full shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Permanent Password Requirements */}
                  <div className="bg-slate-50 dark:bg-slate-950/50 border-[2.5px] border-slate-200 dark:border-slate-800 rounded-2xl p-4 transition-colors">
                    <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                      <Shield className="h-3 w-3 text-orange-500" />
                      Password Strength
                    </p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      {[
                        { label: "At least 8 characters", met: password.new.length >= 8 },
                        { label: "One uppercase letter", met: /[A-Z]/.test(password.new) },
                        { label: "One lowercase letter", met: /[a-z]/.test(password.new) },
                        { label: "One number (0-9)", met: /[0-9]/.test(password.new) },
                        { label: "One special character", met: /[^A-Za-z0-9]/.test(password.new) },
                      ].map((req, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className={`h-4 w-4 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${req.met ? "bg-green-500 scale-110" : "bg-slate-200 dark:bg-slate-800"}`}>
                            <Check className={`h-2.5 w-2.5 text-white transition-opacity ${req.met ? "opacity-100" : "opacity-0"}`} strokeWidth={5} />
                          </div>
                          <span className={`text-[10px] sm:text-xs font-semibold leading-tight transition-colors ${req.met ? "text-green-700 dark:text-green-400" : "text-slate-500 dark:text-slate-400"}`}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-300 ml-1 transition-colors">Confirm New Password</Label>
                  <div className="relative flex items-center">
                    <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 z-10" strokeWidth={2.5} />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={password.confirm}
                      onChange={(e) => {
                        setError("")
                        setPassword({ ...password, confirm: e.target.value })
                      }}
                      style={{ paddingLeft: '3.25rem', paddingRight: '3.25rem' }}
                      className="rounded-2xl border-[3px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-3.5 focus-visible:border-red-500 dark:focus-visible:border-red-500 focus-visible:ring-offset-0 focus-visible:ring-0 transition-colors font-semibold text-sm text-slate-800 dark:text-slate-200 w-full shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                  className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-black py-4 rounded-2xl border-b-[5px] border-slate-950 dark:border-slate-900 active:border-b-0 active:translate-y-[5px] transition-all uppercase tracking-widest text-xs sm:text-sm shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Key className="h-4.5 w-4.5" strokeWidth={2.5} />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Scores */}
        <Card className="mb-24 sm:mb-16 rounded-[1.5rem] sm:rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-800 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] bg-white dark:bg-slate-900 p-0 gap-0 overflow-hidden transition-all duration-300 relative z-10">
          <CardHeader className="bg-slate-50 dark:bg-slate-950/60 border-b-[3px] border-slate-100 dark:border-slate-800 px-5 sm:px-7 py-3.5 sm:py-4 [.border-b]:pb-3.5 sm:[.border-b]:pb-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl font-black text-slate-800 dark:text-white transition-colors">
                  <div className="bg-orange-100 dark:bg-orange-950/50 p-2 rounded-xl text-orange-600 dark:text-orange-400 shrink-0">
                    <Trophy className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  Assessment Scores
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 font-semibold mt-1 text-xs sm:text-sm transition-colors">Track your fire safety knowledge growth</CardDescription>
              </div>
              <div className="flex items-center gap-2.5 bg-white dark:bg-slate-950 px-3.5 py-2 rounded-2xl border-[2.5px] border-slate-200 dark:border-slate-800 shadow-xs transition-colors w-fit">
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
          <CardContent className="p-4 sm:p-7">
            {scoresLoading ? (
              <ScoreCardsSkeleton />
            ) : scores ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                {/* Pre-Test Card */}
                <div className={cn(
                  "relative group overflow-hidden border-[3px] rounded-[1.25rem] sm:rounded-[1.75rem] p-4 sm:p-6 transition-all duration-300 shadow-[0_4px_0_#cbd5e1] dark:shadow-[0_4px_0_#0f172a]",
                  scores.preTestScore !== null 
                    ? "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500" 
                    : "bg-slate-50/50 dark:bg-slate-950/40 border-dashed border-slate-300 dark:border-slate-800"
                )}>
                  {/* Decorative background circle */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <div className="shrink-0 scale-90 sm:scale-100">
                      {scores.preTestScore !== null ? (
                        <ScoreGauge 
                          percentage={getScorePercentage(scores.preTestScore, 15)} 
                          color="#3b82f6" 
                          size={100}
                          strokeWidth={9}
                        />
                      ) : (
                        <div className="w-[100px] h-[100px] rounded-full border-4 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-50 dark:bg-slate-900 shadow-inner">
                          <BookOpen className="h-7 w-7 text-slate-300 dark:text-slate-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 mb-1.5">
                        <span className="w-fit mx-auto sm:mx-0 inline-block px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-black text-[9px] uppercase tracking-widest rounded-full border border-blue-200 dark:border-blue-900/60">
                          Baseline Test
                        </span>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">Pre-Test</h3>
                      </div>
                      
                      {scores.preTestScore !== null ? (
                        <div className="space-y-3">
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                            Initial assessment taken before starting modules.
                          </p>
                          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Raw Score</span>
                              <span className="text-base font-black text-slate-800 dark:text-white mt-0.5">{scores.preTestScore} / 15</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</span>
                              <span className={cn("text-base font-black mt-0.5", getScoreColor(getScorePercentage(scores.preTestScore, 15)))}>
                                {getScoreLabel(getScorePercentage(scores.preTestScore, 15))}
                              </span>
                            </div>
                          </div>
                          {scores.preTestCompletedAt && (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center sm:justify-start gap-1.5 text-slate-400 dark:text-slate-500 text-[11px] font-semibold">
                              <CheckCircle className="h-3.5 w-3.5 text-blue-500" />
                              Completed {formatDate(scores.preTestCompletedAt)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-slate-400 font-medium leading-relaxed">
                            Start your fire safety journey by taking the Pre-Test assessment.
                          </p>
                          <Button 
                            onClick={() => router.visit('/assessment/pre-test')}
                            variant="outline"
                            className="rounded-full border-2 border-blue-500 text-blue-600 font-black px-5 hover:bg-blue-50 transition-all uppercase text-[11px] tracking-widest cursor-pointer"
                          >
                            Take Pre-Test Now
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Post-Test Card */}
                {!isKid ? (
                  <div className="relative group overflow-hidden border-[3px] border-slate-200 dark:border-slate-800 rounded-[1.25rem] sm:rounded-[1.75rem] p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/40 opacity-75 transition-all duration-300 shadow-[0_4px_0_#cbd5e1] dark:shadow-[0_4px_0_#0f172a]">
                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                      <div className="shrink-0 scale-90 sm:scale-100">
                        <div className="w-[100px] h-[100px] rounded-full border-4 border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center bg-white dark:bg-slate-900 shadow-inner">
                          <Lock className="h-7 w-7 text-slate-300 dark:text-slate-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 text-center sm:text-left min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 mb-1.5">
                          <span className="w-fit mx-auto sm:mx-0 inline-block px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-[9px] uppercase tracking-widest rounded-full border border-slate-200 dark:border-slate-700">
                            Final Exam
                          </span>
                          <h3 className="text-xl font-black text-slate-400 dark:text-slate-500">Post-Test</h3>
                        </div>
                        
                        <div className="space-y-3">
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                            Only applicable for student accounts to measure learning progress.
                          </p>
                          <div className="flex items-center gap-3 bg-slate-100/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 w-fit mx-auto sm:mx-0">
                            <div className="bg-slate-200 dark:bg-slate-800 p-1.5 rounded-lg">
                              <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col text-left">
                              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">Not Applicable</span>
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 leading-none">For Educator/Adult profiles</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={cn(
                    "relative group overflow-hidden border-[3px] rounded-[1.25rem] sm:rounded-[1.75rem] p-4 sm:p-6 transition-all duration-300 shadow-[0_4px_0_#cbd5e1] dark:shadow-[0_4px_0_#0f172a]",
                    scores.postTestScore !== null 
                      ? "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-orange-500 dark:hover:border-orange-500" 
                      : "bg-slate-50/50 dark:bg-slate-950/40 border-dashed border-slate-300 dark:border-slate-800"
                  )}>
                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                      <div className="shrink-0 scale-90 sm:scale-100">
                        {scores.postTestScore !== null ? (
                          <ScoreGauge 
                            percentage={getScorePercentage(scores.postTestScore, 15)} 
                            color="#f97316" 
                            size={100}
                            strokeWidth={9}
                          />
                        ) : (
                          <div className="w-[100px] h-[100px] rounded-full border-4 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-50 dark:bg-slate-900 shadow-inner">
                            <Trophy className="h-7 w-7 text-slate-300 dark:text-slate-600" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 text-center sm:text-left min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 mb-1.5">
                          <span className="w-fit mx-auto sm:mx-0 inline-block px-2.5 py-0.5 bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-black text-[9px] uppercase tracking-widest rounded-full border border-orange-200 dark:border-orange-900/60">
                            Final Exam
                          </span>
                          <h3 className="text-xl font-black text-slate-800 dark:text-white">Post-Test</h3>
                        </div>
                        
                        {scores.postTestScore !== null ? (
                          <div className="space-y-3">
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                              Final assessment taken after completing all fire safety modules.
                            </p>
                            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Final Score</span>
                                <span className="text-base font-black text-slate-800 dark:text-white mt-0.5">{scores.postTestScore} / 15</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</span>
                                <span className={cn("text-base font-black mt-0.5", getScoreColor(getScorePercentage(scores.postTestScore, 15)))}>
                                  {getScoreLabel(getScorePercentage(scores.postTestScore, 15))}
                                </span>
                              </div>
                            </div>
                            {scores.postTestCompletedAt && (
                              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center sm:justify-start gap-1.5 text-slate-400 dark:text-slate-500 text-[11px] font-semibold">
                                <CheckCircle className="h-3.5 w-3.5 text-orange-500" />
                                Completed {formatDate(scores.postTestCompletedAt)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                              Take the Post-Test assessment to measure your fire safety knowledge improvement.
                            </p>
                            <Button 
                              onClick={() => router.visit('/assessment/post-test')}
                              variant="outline"
                              className="rounded-full border-2 border-orange-500 text-orange-600 font-black px-5 hover:bg-orange-50 transition-all uppercase text-[11px] tracking-widest cursor-pointer"
                            >
                              Take Post-Test Now
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertCircle className="h-12 w-12 text-slate-200 dark:text-slate-700 mb-4" />
                <h3 className="text-lg font-black text-slate-800 dark:text-white">No Assessment Data</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto mt-2">
                  Take your first step towards becoming a fire safety hero by starting the Pre-Test.
                </p>
                <Button 
                  onClick={() => router.visit('/assessment/pre-test')}
                  className="mt-6 bg-[#e11d48] text-white rounded-full font-black px-8 py-6 shadow-lg hover:scale-105 transition-all cursor-pointer"
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
            {/* Category tabs */}
            <div className="flex flex-nowrap items-center overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-1.5 sm:gap-2 mb-6 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800 w-full sm:w-fit mx-auto transition-colors snap-x">
              {['All', 'Special', 'Firefighter', 'Kid', 'Adult'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveAvatarTab(cat)}
                  className={cn(
                    "relative flex items-center justify-center py-1.5 sm:py-2 whitespace-nowrap shrink-0 snap-start px-4 sm:px-5 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer",
                    activeAvatarTab === cat 
                      ? "text-amber-950" 
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  )}
                >
                  {activeAvatarTab === cat && (
                    <motion.div
                      layoutId="activeHeroTab"
                      className="absolute inset-0 bg-yellow-400 shadow-sm rounded-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{cat}s</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 content-start gap-2 sm:gap-4 mb-8 min-h-[360px] sm:min-h-[400px]">
              {filteredAvatars.map((opt) => (
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
                    {(() => {
                      if (opt.icon.startsWith('/')) {
                        return <img 
                          src={opt.icon} 
                          alt={opt.label} 
                          className={cn(
                            "h-full w-full object-cover rounded-full transform-gpu transition-all duration-300",
                            opt.id === 'cow' && "dark:brightness-90 dark:contrast-110 dark:grayscale-[5%]"
                          )} 
                        />;
                      }
                      return opt.icon;
                    })()}
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

            <div className="flex gap-2 sm:gap-4 sticky bottom-0 bg-transparent mt-6 transition-colors">
              <Button
                variant="outline"
                onClick={() => setShowAvatarModal(false)}
                className="flex-1 rounded-xl sm:rounded-2xl border-2 py-4 sm:py-6 font-bold text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-xs sm:text-base cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAvatar}
                disabled={avatarLoading}
                className="flex-[2] bg-yellow-400 hover:bg-yellow-500 text-amber-950 rounded-xl sm:rounded-2xl py-4 sm:py-6 font-black uppercase tracking-widest shadow-[0_4px_0_#ca8a04] active:translate-y-1 active:shadow-none transition-all text-xs sm:text-base cursor-pointer"
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
