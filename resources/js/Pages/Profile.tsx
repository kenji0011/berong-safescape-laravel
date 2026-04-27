"use client"

import { useEffect, useState } from "react"
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
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
  Trophy, BookOpen, ArrowUpRight, Minus, Lock
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
    if (profile.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
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
        setTimeout(() => setSuccess(""), 4000)
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

    if (password.new.length < 8) {
      setError("New password must be at least 8 characters")
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
        setTimeout(() => setSuccess(""), 4000)
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
    <div className="min-h-screen">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 bg-white p-6 rounded-[2rem] border-[3px] border-slate-200 shadow-[0_8px_0_#cbd5e1] flex items-center justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-red-100 p-2 rounded-xl">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-[#d60000]" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">User Profile</h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Manage your account and choose your hero.</p>
              </div>
            </div>
          </div>

          {/* Minimalist Avatar Trigger - ONLY FOR KIDS */}
          {profile.role === 'kid' ? (
            <button 
              onClick={() => setShowAvatarModal(true)}
              className="group relative flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-dashed border-slate-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-300 shrink-0 overflow-visible"
            >
              <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">
                {AVATAR_OPTIONS.find(opt => opt.id === profile.avatar)?.icon || "🐮"}
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 sm:h-7 sm:w-7 bg-yellow-400 rounded-full border-4 border-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white font-black text-xs sm:text-sm">+</span>
              </div>
            </button>
          ) : (
            <div className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-slate-100 border-4 border-white shadow-inner shrink-0">
               <User className="h-8 w-8 sm:h-10 sm:w-10 text-slate-400" />
            </div>
          )}
        </div>

        {/* Alerts */}
        {success && (
          <Alert className="mb-6 border-green-500 bg-green-50 rounded-2xl">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 font-medium">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6 rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-8">
          {/* Profile Information */}
          <Card className="rounded-[2rem] border-2 border-slate-200 shadow-[0_8px_0_#e2e8f0] bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b-2 border-slate-100 pb-6">
              <CardTitle className="text-xl font-bold text-slate-800">Profile Information</CardTitle>
              <CardDescription className="text-slate-500 font-medium">Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name" className="font-bold text-slate-700 ml-1">Full Name</Label>
                  <Input
                    id="profile-name"
                    placeholder="Your full name"
                    value={profile.name}
                    onChange={(e) => {
                      setError("")
                      setProfile({ ...profile, name: e.target.value })
                    }}
                    className="rounded-2xl border-2 border-slate-200 bg-white px-4 py-6 focus-visible:border-red-500 focus-visible:ring-offset-0 focus-visible:ring-0 transition-colors font-medium text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email" className="font-bold text-slate-700 ml-1">Email Address</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    placeholder="your.email@example.com (optional)"
                    value={profile.email}
                    onChange={(e) => {
                      setError("")
                      setProfile({ ...profile, email: e.target.value })
                    }}
                    className="rounded-2xl border-2 border-slate-200 bg-white px-4 py-6 focus-visible:border-red-500 focus-visible:ring-offset-0 focus-visible:ring-0 transition-colors font-medium text-slate-700"
                  />
                  <p className="text-xs text-slate-500 ml-1 font-medium">
                    Used for password reset. Must be unique per account.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-age" className="font-bold text-slate-700 ml-1">Age</Label>
                  <Input
                    id="profile-age"
                    type="number"
                    value={profile.age}
                    disabled
                    className="rounded-2xl border-2 border-slate-200 bg-slate-50/50 px-4 py-6 font-medium text-slate-500 italic"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-role" className="font-bold text-slate-700 ml-1">Role</Label>
                  <Input
                    id="profile-role"
                    value={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                    disabled
                    className="rounded-2xl border-2 border-slate-200 bg-slate-50/50 px-4 py-6 font-medium text-slate-500 italic"
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
          <Card className="rounded-[2rem] border-2 border-slate-200 shadow-[0_8px_0_#e2e8f0] bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b-2 border-slate-100 pb-6">
              <CardTitle className="text-xl font-bold text-slate-800">Password Management</CardTitle>
              <CardDescription className="text-slate-500 font-medium">Change your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="font-bold text-slate-700 ml-1">Current Password</Label>
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
                      className="rounded-2xl border-2 border-slate-200 bg-white px-4 py-6 pr-12 focus-visible:border-red-500 focus-visible:ring-offset-0 focus-visible:ring-0 transition-colors font-medium text-slate-700"
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
                  <Label htmlFor="new-password" className="font-bold text-slate-700 ml-1">New Password</Label>
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
                      className="rounded-2xl border-2 border-slate-200 bg-white px-4 py-6 pr-12 focus-visible:border-red-500 focus-visible:ring-offset-0 focus-visible:ring-0 transition-colors font-medium text-slate-700"
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
                  <p className="text-xs text-slate-500 ml-1 font-medium">Must be at least 8 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="font-bold text-slate-700 ml-1">Confirm New Password</Label>
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
                      className="rounded-2xl border-2 border-slate-200 bg-white px-4 py-6 pr-12 focus-visible:border-red-500 focus-visible:ring-offset-0 focus-visible:ring-0 transition-colors font-medium text-slate-700"
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
                className="w-full bg-slate-800 text-white shadow-[0_4px_0_#0f172a] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#0f172a] hover:bg-slate-800 active:translate-y-1 active:shadow-[0_0px_0_#0f172a] rounded-full font-black uppercase tracking-wider py-6 transition-all"
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
        <Card className="mt-8 rounded-[2rem] border-2 border-slate-200 shadow-[0_12px_0_#f1f5f9] bg-white overflow-hidden transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b-2 border-slate-100 pb-6 pt-8 px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-800">
                  <div className="bg-orange-100 p-2 rounded-xl">
                    <Trophy className="h-6 w-6 text-orange-500" strokeWidth={2.5} />
                  </div>
                  Assessment Scores
                </CardTitle>
                <CardDescription className="text-slate-500 font-bold mt-1 ml-1">Track your fire safety knowledge growth</CardDescription>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border-2 border-slate-100 shadow-sm">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Progress</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
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
                  "relative group overflow-hidden border-2 rounded-[2.5rem] p-8 transition-all duration-500",
                  scores.preTestScore !== null 
                    ? "bg-white border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200" 
                    : "bg-slate-50/50 border-dashed border-slate-300 opacity-80"
                )}>
                  {/* Decorative background circle */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
                  
                  <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
                    <div className="shrink-0">
                      {scores.preTestScore !== null ? (
                        <ScoreGauge 
                          percentage={getScorePercentage(scores.preTestScore, 15)} 
                          color="#3b82f6" 
                          size={130}
                          strokeWidth={12}
                        />
                      ) : (
                        <div className="w-[130px] h-[130px] rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center bg-white shadow-inner">
                          <BookOpen className="h-10 w-10 text-slate-200" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 font-black text-[10px] uppercase tracking-widest rounded-full border border-blue-200">
                          Baseline Test
                        </span>
                        <h3 className="text-2xl font-black text-slate-800">Pre-Test</h3>
                      </div>
                      
                      {scores.preTestScore !== null ? (
                        <div className="space-y-4">
                          <p className="text-slate-500 font-bold leading-relaxed">
                            Initial assessment taken before starting the course modules.
                          </p>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Raw Score</span>
                              <span className="text-xl font-black text-slate-800">{scores.preTestScore} / 15</span>
                            </div>
                            <div className="w-px h-8 bg-slate-200 hidden sm:block" />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                              <span className={cn("text-lg font-black", getScoreColor(getScorePercentage(scores.preTestScore, 15)))}>
                                {getScoreLabel(getScorePercentage(scores.preTestScore, 15))}
                              </span>
                            </div>
                          </div>
                          {scores.preTestCompletedAt && (
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-center sm:justify-start gap-2 text-slate-400 text-xs font-bold">
                              <CheckCircle className="h-3.5 w-3.5 text-blue-400" />
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
                  "relative group overflow-hidden border-2 rounded-[2.5rem] p-8 transition-all duration-500",
                  scores.postTestScore !== null 
                    ? "bg-white border-slate-200 shadow-sm hover:shadow-xl hover:border-orange-200" 
                    : "bg-slate-50/50 border-dashed border-slate-300 opacity-80"
                )}>
                  {/* Decorative background circle */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
                  
                  <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
                    <div className="shrink-0">
                      {scores.postTestScore !== null ? (
                        <ScoreGauge 
                          percentage={getScorePercentage(scores.postTestScore, 15)} 
                          color="#f97316" 
                          size={130}
                          strokeWidth={12}
                        />
                      ) : (
                        <div className="w-[130px] h-[130px] rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center bg-white shadow-inner">
                          <Trophy className="h-10 w-10 text-slate-200" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 font-black text-[10px] uppercase tracking-widest rounded-full border border-orange-200">
                          Final Exam
                        </span>
                        <h3 className="text-2xl font-black text-slate-800">Post-Test</h3>
                      </div>
                      
                      {scores.postTestScore !== null ? (
                        <div className="space-y-4">
                          <p className="text-slate-500 font-bold leading-relaxed">
                            Final assessment taken after completing all fire safety modules.
                          </p>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Score</span>
                              <span className="text-xl font-black text-slate-800">{scores.postTestScore} / 15</span>
                            </div>
                            <div className="w-px h-8 bg-slate-200 hidden sm:block" />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
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
                          <div className="flex items-center justify-center sm:justify-start gap-2 bg-slate-100/50 p-4 rounded-2xl border-2 border-slate-200/50">
                            <Lock className="h-4 w-4 text-slate-300" />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Currently Locked</span>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-orange-500" />
              Confirm Changes
            </DialogTitle>
            <DialogDescription>
              Enter your password to save profile changes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="confirm-edit-password">Password</Label>
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
                  className="pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPasswordField(!showConfirmPasswordField)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPasswordField ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {confirmError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{confirmError}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false)
                setConfirmPassword("")
                setConfirmError("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmUpdate}
              disabled={confirmLoading || !confirmPassword}
              className="bg-orange-500 hover:bg-orange-600"
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Hero Selection Modal */}
      <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
        <DialogContent className="sm:max-w-2xl rounded-[2.5rem] border-[4px] border-slate-100 p-0 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-5 sm:p-8 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-3xl font-black flex items-center gap-2 sm:gap-3">
                <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl backdrop-blur-md">
                  <Trophy className="h-5 w-5 sm:h-8 sm:w-8 text-white" strokeWidth={3} />
                </div>
                CHOOSE YOUR HERO
              </DialogTitle>
              <DialogDescription className="text-yellow-50 font-bold text-sm sm:text-lg mt-1 sm:mt-2 opacity-90">
                Select an identity to lead your fire safety mission.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-4 sm:p-8 bg-slate-50/50 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 mb-8">
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedAvatar(opt.id)}
                  className={cn(
                    "group relative flex flex-col items-center gap-1.5 sm:gap-3 p-2 sm:p-5 rounded-2xl sm:rounded-[2rem] border-[3px] transition-all duration-300",
                    selectedAvatar === opt.id 
                      ? "bg-white border-yellow-400 shadow-xl scale-105 z-10" 
                      : "bg-white/50 border-slate-100 hover:border-slate-200 hover:bg-white"
                  )}
                >
                  <div className={cn(
                    "h-14 w-14 sm:h-20 sm:w-20 rounded-full flex items-center justify-center text-3xl sm:text-5xl transition-transform group-hover:scale-110",
                    selectedAvatar === opt.id ? "bg-yellow-50" : "bg-slate-50"
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
                      "text-[10px] sm:text-xs font-black tracking-tight leading-tight",
                      selectedAvatar === opt.id ? "text-slate-800" : "text-slate-600"
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

            <div className="flex gap-2 sm:gap-4 sticky bottom-0 bg-white/80 backdrop-blur-sm p-2 rounded-2xl border-t border-slate-100 mt-2 sm:mt-0">
              <Button
                variant="outline"
                onClick={() => setShowAvatarModal(false)}
                className="flex-1 rounded-xl sm:rounded-2xl border-2 py-4 sm:py-6 font-bold text-slate-500 hover:bg-slate-100 transition-all text-xs sm:text-base"
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
            
            <p className="text-center text-[11px] text-slate-400 font-bold mt-4 uppercase tracking-tighter">
              Tip: Your hero will appear on your main dashboard mission map!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
