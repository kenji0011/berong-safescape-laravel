"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { router, usePage } from '@inertiajs/react';
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertCircle, Loader2, KeyRound, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Link } from '@inertiajs/react';
import Image from '@/components/Image';
import { RegistrationWizard } from "@/components/registration-wizard"
import { Chatbot } from "@/components/chatbot"

function AuthContent() {
  
  const searchParams = new URLSearchParams(window.location.search)
  const { login, register, isAuthenticating, getRedirectPath } = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [showRegistrationWizard, setShowRegistrationWizard] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const defaultTab = searchParams.get("tab") || "login"

  // Reset password state
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resetUsername, setResetUsername] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [resetStep, setResetStep] = useState(1) // 1 = enter username, 2 = enter code
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    age: "",
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!loginData.username) {
      errors.username = "Username is required"
    } else if (loginData.username.length < 3) {
      errors.username = "Username must be at least 3 characters"
    }

    if (!loginData.password) {
      errors.password = "Password is required"
    } else if (loginData.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    if (!isLogin) {
      if (!registerData.name) {
        errors.name = "Name is required"
      }
      if (!registerData.username) {
        errors.username = "Username is required"
      } else if (registerData.username.length < 3 || registerData.username.length > 20) {
        errors.username = "Username must be 3-20 characters"
      } else if (!/^[a-zA-Z0-9_]+$/.test(registerData.username)) {
        errors.username = "Username can only contain letters, numbers, and underscores"
      }
      if (!registerData.age) {
        errors.age = "Age is required"
      } else if (Number.parseInt(registerData.age) < 1 || Number.parseInt(registerData.age) > 120) {
        errors.age = "Please enter a valid age"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!validateForm()) {
      setLoading(false)
      return
    }

    const result = await login(loginData.username, loginData.password)

    if (result.success) {
      // Determine redirect from the returned user (not stale React state)
      let redirectPath = '/'
      if (result.user) {
        if (result.user.role === 'admin') redirectPath = '/admin'
        else if (result.user.role === 'professional') redirectPath = '/professional'
        else if (result.user.role === 'adult') redirectPath = '/adult'
        else if (result.user.role === 'kid') redirectPath = '/kids'
      }
      // Small delay to ensure cookie is fully set and let loading animation play out
      await new Promise(resolve => setTimeout(resolve, 1500))
      // Use full page navigation to clear Next.js router cache
      window.location.href = redirectPath
      return // Ensure we don't setLoading(false) so loader persists
    } else {
      setError(result.error || "Invalid username or password")
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (resetStep === 1) {
      // Step 1: Send verification code
      if (!resetUsername.trim()) {
        setResetMessage({ type: 'error', text: 'Please enter your username.' })
        return
      }

      setResetLoading(true)
      setResetMessage(null)

      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: resetUsername.trim(), step: 1 }),
        })
        const result = await response.json()

        if (result.success) {
          setResetStep(2)
          setResetMessage({ type: 'success', text: result.message })
        } else {
          setResetMessage({ type: 'error', text: result.error })
        }
      } catch (err) {
        setResetMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
      } finally {
        setResetLoading(false)
      }
    } else if (resetStep === 2) {
      // Step 2: Verify code and reset password
      if (!resetCode.trim()) {
        setResetMessage({ type: 'error', text: 'Please enter the verification code.' })
        return
      }

      setResetLoading(true)
      setResetMessage(null)

      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: resetUsername.trim(), step: 2, code: resetCode.trim() }),
        })
        const result = await response.json()

        if (result.success) {
          setResetMessage({ type: 'success', text: result.message })
          setResetStep(3) // Done state
        } else {
          setResetMessage({ type: 'error', text: result.error })
        }
      } catch (err) {
        setResetMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
      } finally {
        setResetLoading(false)
      }
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!registerData.age || Number.parseInt(registerData.age) < 1) {
      setError("Please enter a valid age")
      return
    }

    setLoading(true)

    const result = await register(
      registerData.username,
      registerData.password,
      registerData.name,
      Number.parseInt(registerData.age),
    )

    if (result.success) {
      // Redirect based on user role
      const redirectPath = getRedirectPath()
      
      // Small delay to let the loading screen animation play out smoothly
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Use full page navigation to clear Next.js router cache
      window.location.href = redirectPath
      return // Ensure we don't setLoading(false) so loader persists
    } else {
      setError(result.error || "Registration failed. Username may already be taken.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-500">


      {/* Registration Wizard Modal - Full screen overlay */}
      {showRegistrationWizard && (
        <div className="fixed inset-0 z-50 bg-background flex items-start justify-center overflow-y-auto py-6 sm:py-8">
          <div className="w-full max-w-3xl mx-2 sm:mx-4">
            <RegistrationWizard onBackToLogin={() => setShowRegistrationWizard(false)} />
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl z-10 relative flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        {/* Left Side — Branding */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="flex justify-center lg:justify-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="h-16 w-16 sm:h-20 sm:w-20 bg-white dark:bg-slate-900 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-slate-800 flex items-center justify-center p-1.5 sm:p-2 flex-shrink-0 transition-colors">
              <img src="/bfp-logo-red.jpg" alt="BFP Logo" width="72" height="72" className="object-contain w-full h-full" />
            </div>
            <div className="h-16 w-16 sm:h-20 sm:w-20 bg-white dark:bg-slate-900 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-slate-800 flex items-center justify-center p-1.5 sm:p-2 flex-shrink-0 transition-colors">
              <img
                src="/philippine-flag-seal.jpg"
                alt="Philippine Seal"
                width="72"
                height="72"
                className="object-contain w-full h-full"
              />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#d60000] dark:text-red-500 mb-3 sm:mb-4 tracking-tight drop-shadow-sm transition-colors">Berong E-Learning</h1>
          <div className="inline-flex items-center justify-center px-5 sm:px-6 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-colors">
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest text-center leading-tight">BFP Sta Cruz Fire Safety Education</p>
          </div>
        </div>

        {/* Right Side — Login Card */}
        <div className="w-full max-w-md flex-shrink-0">
        <Card className="border-[2px] sm:border-[3px] border-[#fb923c] dark:border-orange-500/50 rounded-[1.75rem] sm:rounded-[2.5rem] shadow-2xl bg-white dark:bg-slate-900 overflow-hidden relative pb-2 sm:pb-4 mx-auto w-full transition-colors duration-500">


          <CardHeader className="pt-6 sm:pt-8 pb-1 sm:pb-2 relative z-10 px-5 sm:px-6">
            <div className="flex flex-col items-center mb-1 sm:mb-2">
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-[14px] sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 transition-colors">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-[#d60000] dark:text-red-500" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight text-center transition-colors">Access your Account</CardTitle>
            </div>
            <CardDescription className="text-center text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm transition-colors">Sign in or create an account to access learning materials</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 px-5 sm:px-8">
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl h-12 sm:h-14 mb-4 sm:mb-6 transition-colors">
                <TabsTrigger value="login" className="rounded-lg sm:rounded-xl font-extrabold text-slate-400 dark:text-slate-500 text-xs sm:text-sm data-[state=active]:bg-[#d60000] dark:data-[state=active]:bg-red-600 data-[state=active]:text-white dark:data-[state=active]:text-white data-[state=active]:shadow-[0_3px_0_#991b1b] dark:data-[state=active]:shadow-[0_3px_0_#7f1d1d] transition-all duration-300 h-full">Log In</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg sm:rounded-xl font-extrabold text-slate-400 dark:text-slate-500 text-xs sm:text-sm data-[state=active]:bg-[#2563eb] dark:data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:text-white data-[state=active]:shadow-[0_3px_0_#1e40af] dark:data-[state=active]:shadow-[0_3px_0_#1e3a8a] transition-all duration-300 h-full">Register</TabsTrigger>
              </TabsList>


              {/* Login Tab */}
              <TabsContent value="login" className="mt-0 animate-in fade-in-0 slide-in-from-left-4 duration-300">
                <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                  <div className="space-y-1 sm:space-y-1.5">
                    <Label htmlFor="login-username" className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Username</Label>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="Enter your username"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      required
                      autoComplete="off"
                      className="h-11 sm:h-12 rounded-lg sm:rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 sm:px-4 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-[#d60000] dark:focus-visible:ring-red-500 focus-visible:border-[#d60000] dark:focus-visible:border-red-500 transition-all font-medium text-slate-800 dark:text-slate-200"
                    />
                    {validationErrors.username && (
                      <p className="mt-1 text-[11px] sm:text-sm text-red-600">{validationErrors.username}</p>
                    )}
                  </div>
                  <div className="space-y-1 sm:space-y-1.5">
                    <Label htmlFor="login-password" className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        autoComplete="new-password"
                        className="h-11 sm:h-12 rounded-lg sm:rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 sm:px-4 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-[#d60000] dark:focus-visible:ring-red-500 focus-visible:border-[#d60000] dark:focus-visible:border-red-500 transition-all pr-10 sm:pr-12 font-medium text-slate-800 dark:text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 p-1 sm:p-1.5 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="mt-1 text-[11px] sm:text-sm text-red-600">{validationErrors.password}</p>
                    )}
                  </div>

                  {error && (
                    <Alert variant="destructive" className="rounded-lg sm:rounded-xl py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
                    </Alert>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#d60000] dark:bg-red-600 text-white font-extrabold h-12 sm:h-13 rounded-xl sm:rounded-2xl text-sm sm:text-base mt-1 sm:mt-2 shadow-[0_5px_0_#991b1b] dark:shadow-[0_5px_0_#7f1d1d] hover:-translate-y-0.5 hover:shadow-[0_7px_0_#991b1b] dark:hover:shadow-[0_7px_0_#7f1d1d] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] dark:active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_5px_0_#991b1b]"
                  >
                    {loading ? "Signing in..." : "Log In"}
                  </button>

                  <div className="flex flex-col items-center gap-1 sm:gap-2 pt-4 sm:pt-6 pb-1 sm:pb-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md sm:rounded-lg h-7 sm:h-8 px-2 sm:px-3 transition-colors"
                      onClick={() => {
                        setShowResetDialog(true)
                        setResetMessage(null)
                        setResetUsername("")
                        setResetCode("")
                        setResetStep(1)
                      }}
                    >
                      <KeyRound className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 text-slate-400 dark:text-slate-500" />
                      Forgot Password?
                    </Button>
                    
                    <Link href="/">
                      <Button variant="ghost" className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md sm:rounded-lg h-7 sm:h-8 px-2 sm:px-3 transition-colors">
                        <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 text-slate-400 dark:text-slate-500" />
                        Back to Dashboard
                      </Button>
                    </Link>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-0 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
                  <div className="text-center">
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-1 sm:mb-2 mt-1 sm:mt-2 tracking-tight transition-colors">Create Your Account</h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mb-4 sm:mb-6 transition-colors">
                      Join our fire safety community and help protect Santa Cruz, Laguna
                    </p>
                  </div>

                  <button
                    type="button"
                    className="w-full bg-blue-600 text-white font-extrabold h-12 sm:h-13 rounded-xl sm:rounded-2xl text-sm sm:text-base shadow-[0_5px_0_#1e40af] hover:-translate-y-0.5 hover:shadow-[0_7px_0_#1e40af] active:translate-y-1 active:shadow-[0_0px_0_#1e40af] transition-all"
                    onClick={() => setShowRegistrationWizard(true)}
                  >
                    Start Registration
                  </button>

                  <p className="text-[10px] sm:text-[11px] text-center text-slate-400 dark:text-slate-500 font-medium mt-4 sm:mt-6 px-2 sm:px-4 leading-relaxed transition-colors">
                    Registration includes a quick fire safety assessment to personalize your learning experience.
                  </p>
                  
                  <div className="flex flex-col items-center pt-1 sm:pt-2">
                    <Link href="/">
                      <Button variant="ghost" className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md sm:rounded-lg h-7 sm:h-8 px-2 sm:px-3 transition-colors">
                        <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 text-slate-400 dark:text-slate-500" />
                        Back to Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent className="sm:max-w-md bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-2xl p-0 overflow-hidden transition-all duration-300">
            <div className="bg-slate-50 dark:bg-slate-950/50 border-b-2 border-slate-100 dark:border-slate-800 p-6 sm:p-8 transition-colors">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-800 dark:text-white transition-colors">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl transition-colors">
                    <KeyRound className="h-6 w-6 text-orange-600 dark:text-orange-400" strokeWidth={2.5} />
                  </div>
                  Reset Password
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 font-bold mt-2 ml-1 text-sm transition-colors">
                  {resetStep === 1 && 'Enter your username. A verification code will be sent to your email.'}
                  {resetStep === 2 && 'Enter the 6-digit verification code sent to your email.'}
                  {resetStep === 3 && 'Your password has been reset successfully!'}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Step 1: Username */}
              {resetStep === 1 && (
                <div className="space-y-3">
                  <Label htmlFor="reset-username" className="font-black text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-widest text-[10px] transition-colors">Username</Label>
                  <Input
                    id="reset-username"
                    placeholder="Enter your username"
                    value={resetUsername}
                    onChange={(e) => {
                      setResetUsername(e.target.value)
                      setResetMessage(null)
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleResetPassword() }}
                    className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-6 focus-visible:ring-0 focus-visible:border-orange-500 dark:focus-visible:border-orange-500 font-bold text-slate-700 dark:text-white transition-all"
                  />
                </div>
              )}

              {/* Step 2: Verification Code */}
              {resetStep === 2 && (
                <div className="space-y-3 text-center">
                  <Label htmlFor="reset-code" className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[10px] transition-colors">Verification Code</Label>
                  <Input
                    id="reset-code"
                    placeholder="000000"
                    value={resetCode}
                    onChange={(e) => {
                      setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                      setResetMessage(null)
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && resetCode.length === 6) handleResetPassword() }}
                    maxLength={6}
                    className="text-center text-3xl tracking-[0.6em] font-mono h-20 rounded-[1.5rem] border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white dark:placeholder:text-slate-800 transition-all focus-visible:ring-0 focus-visible:border-orange-500 dark:focus-visible:border-orange-500"
                  />
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Code was sent to your associated email</p>
                </div>
              )}

              {resetMessage && (
                <Alert variant={resetMessage.type === 'error' ? 'destructive' : 'default'}
                  className={resetMessage.type === 'success' ? 'border-green-500 dark:border-green-500/50 bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-400 transition-colors' : 'dark:bg-red-500/10 dark:text-red-400 transition-colors'}
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{resetMessage.text}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="px-6 sm:p-8 pt-0 pb-8 flex flex-col gap-3">
              {resetStep === 3 ? (
                <Button 
                  onClick={() => setShowResetDialog(false)} 
                  className="w-full bg-slate-900 dark:bg-slate-700 text-white rounded-2xl h-14 font-black uppercase tracking-wider shadow-lg hover:bg-slate-800 transition-all"
                >
                  Back to Sign In
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-2xl h-12 sm:h-14 font-bold text-slate-500 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all" 
                    onClick={() => {
                      if (resetStep === 2) {
                        setResetStep(1)
                        setResetCode("")
                        setResetMessage(null)
                      } else {
                        setShowResetDialog(false)
                      }
                    }}
                  >
                    {resetStep === 2 ? 'Back' : 'Cancel'}
                  </Button>
                  <Button
                    onClick={handleResetPassword}
                    disabled={resetLoading || (resetStep === 1 && !resetUsername) || (resetStep === 2 && resetCode.length !== 6)}
                    className="flex-[1.5] bg-orange-500 hover:bg-orange-400 text-white rounded-2xl h-12 sm:h-14 font-black uppercase tracking-wider shadow-[0_4px_0_#c2410c] active:translate-y-1 active:shadow-none transition-all"
                  >
                    {resetLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      resetStep === 1 ? 'Send Code' : 'Verify Code'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  )
}

function AuthLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 transition-colors duration-500">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading platform...</p>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthContent />
    </Suspense>
  )
}

