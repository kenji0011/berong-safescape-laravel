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
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-orange-100/50 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-orange-300/10 rounded-full blur-3xl pointer-events-none" />

      {/* Registration Wizard Modal - Full screen overlay */}
      {showRegistrationWizard && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-6 sm:py-8">
          <div className="w-full max-w-3xl mx-2 sm:mx-4">
            <RegistrationWizard />
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl z-10 relative flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        {/* Left Side — Branding */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="flex justify-center lg:justify-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="h-16 w-16 sm:h-20 sm:w-20 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 flex items-center justify-center p-1.5 sm:p-2 flex-shrink-0">
              <img src="/bfp-logo-red.jpg" alt="BFP Logo" width="72" height="72" className="object-contain w-full h-full" />
            </div>
            <div className="h-16 w-16 sm:h-20 sm:w-20 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 flex items-center justify-center p-1.5 sm:p-2 flex-shrink-0">
              <img
                src="/philippine-flag-seal.jpg"
                alt="Philippine Seal"
                width="72"
                height="72"
                className="object-contain w-full h-full"
              />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#d60000] mb-3 sm:mb-4 tracking-tight drop-shadow-sm">Berong E-Learning</h1>
          <div className="inline-flex items-center justify-center px-5 sm:px-6 py-2 bg-white border border-gray-200 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest text-center leading-tight">BFP Sta Cruz Fire Safety Education</p>
          </div>
        </div>

        {/* Right Side — Login Card */}
        <div className="w-full max-w-md flex-shrink-0">
        <Card className="border-[2px] sm:border-[3px] border-[#fb923c] rounded-[1.75rem] sm:rounded-[2.5rem] shadow-2xl bg-white overflow-hidden relative pb-2 sm:pb-4 mx-auto w-full">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-orange-50 rounded-bl-[100px] sm:rounded-bl-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-blue-50/40 rounded-tr-[80px] sm:rounded-tr-[100px] pointer-events-none" />

          <CardHeader className="pt-6 sm:pt-8 pb-1 sm:pb-2 relative z-10 px-5 sm:px-6">
            <div className="flex flex-col items-center mb-1 sm:mb-2">
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-red-50 border border-red-200 rounded-[14px] sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-[#d60000]" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight text-center">Access your Account</CardTitle>
            </div>
            <CardDescription className="text-center text-slate-500 font-medium text-xs sm:text-sm">Sign in or create an account to access learning materials</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 px-5 sm:px-8">
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl h-12 sm:h-14 mb-4 sm:mb-6">
                <TabsTrigger value="login" className="rounded-lg sm:rounded-xl font-extrabold text-slate-400 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#d60000] data-[state=active]:shadow-[0_2px_0_#dc2626] data-[state=active]:border-2 data-[state=active]:border-red-200 transition-all duration-300 h-full">Log In</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg sm:rounded-xl font-extrabold text-slate-400 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-[0_2px_0_#2563eb] data-[state=active]:border-2 data-[state=active]:border-blue-200 transition-all duration-300 h-full">Register</TabsTrigger>
              </TabsList>


              {/* Login Tab */}
              <TabsContent value="login" className="mt-0 animate-in fade-in-0 slide-in-from-left-4 duration-300">
                <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                  <div className="space-y-1 sm:space-y-1.5">
                    <Label htmlFor="login-username" className="text-[11px] sm:text-xs font-bold text-slate-700 ml-1">Username</Label>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="Enter your username"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      required
                      autoComplete="off"
                      className="h-11 sm:h-12 rounded-lg sm:rounded-xl border-slate-200 bg-slate-50 px-3 sm:px-4 text-sm placeholder:text-slate-400 focus-visible:ring-[#d60000] focus-visible:border-[#d60000] transition-all font-medium text-slate-800"
                    />
                    {validationErrors.username && (
                      <p className="mt-1 text-[11px] sm:text-sm text-red-600">{validationErrors.username}</p>
                    )}
                  </div>
                  <div className="space-y-1 sm:space-y-1.5">
                    <Label htmlFor="login-password" className="text-[11px] sm:text-xs font-bold text-slate-700 ml-1">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        autoComplete="new-password"
                        className="h-11 sm:h-12 rounded-lg sm:rounded-xl border-slate-200 bg-slate-50 px-3 sm:px-4 text-sm placeholder:text-slate-400 focus-visible:ring-[#d60000] focus-visible:border-[#d60000] transition-all pr-10 sm:pr-12 font-medium text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 sm:p-1.5 transition-colors"
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
                    className="w-full bg-[#d60000] text-white font-extrabold h-12 sm:h-13 rounded-xl sm:rounded-2xl text-sm sm:text-base mt-1 sm:mt-2 shadow-[0_5px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_7px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_5px_0_#991b1b]"
                  >
                    {loading ? "Signing in..." : "Log In"}
                  </button>

                  <div className="flex flex-col items-center gap-1 sm:gap-2 pt-4 sm:pt-6 pb-1 sm:pb-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-[11px] sm:text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md sm:rounded-lg h-7 sm:h-8 px-2 sm:px-3"
                      onClick={() => {
                        setShowResetDialog(true)
                        setResetMessage(null)
                        setResetUsername("")
                        setResetCode("")
                        setResetStep(1)
                      }}
                    >
                      <KeyRound className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 text-slate-400" />
                      Forgot Password?
                    </Button>
                    
                    <Link href="/">
                      <Button variant="ghost" className="text-[11px] sm:text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md sm:rounded-lg h-7 sm:h-8 px-2 sm:px-3">
                        <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 text-slate-400" />
                        Back to Dashboard
                      </Button>
                    </Link>
                  </div>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="mt-0 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
                  <div className="text-center">
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1 sm:mb-2 mt-1 sm:mt-2 tracking-tight">Create Your Account</h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mb-4 sm:mb-6">
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

                  <p className="text-[10px] sm:text-[11px] text-center text-slate-400 font-medium mt-4 sm:mt-6 px-2 sm:px-4 leading-relaxed">
                    Registration includes a quick fire safety assessment to personalize your learning experience.
                  </p>
                  
                  <div className="flex flex-col items-center pt-1 sm:pt-2">
                    <Link href="/">
                      <Button variant="ghost" className="text-[11px] sm:text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md sm:rounded-lg h-7 sm:h-8 px-2 sm:px-3">
                        <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 text-slate-400" />
                        Back to Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Reset Password Dialog */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-orange-500" />
                Reset Password
              </DialogTitle>
              <DialogDescription>
                {resetStep === 1 && 'Enter your username. A verification code will be sent to your email.'}
                {resetStep === 2 && 'Enter the 6-digit verification code sent to your email.'}
                {resetStep === 3 && 'Your password has been reset successfully!'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Step 1: Username */}
              {resetStep === 1 && (
                <div className="space-y-2">
                  <Label htmlFor="reset-username">Username</Label>
                  <Input
                    id="reset-username"
                    placeholder="Enter your username"
                    value={resetUsername}
                    onChange={(e) => {
                      setResetUsername(e.target.value)
                      setResetMessage(null)
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleResetPassword() }}
                  />
                </div>
              )}

              {/* Step 2: Verification Code */}
              {resetStep === 2 && (
                <div className="space-y-2">
                  <Label htmlFor="reset-code">Verification Code</Label>
                  <Input
                    id="reset-code"
                    placeholder="Enter 6-digit code"
                    value={resetCode}
                    onChange={(e) => {
                      setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                      setResetMessage(null)
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && resetCode.length === 6) handleResetPassword() }}
                    maxLength={6}
                    className="text-center text-2xl tracking-[0.5em] font-Arial"
                  />
                </div>
              )}

              {resetMessage && (
                <Alert variant={resetMessage.type === 'error' ? 'destructive' : 'default'}
                  className={resetMessage.type === 'success' ? 'border-green-500 bg-green-50 text-green-800' : ''}
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{resetMessage.text}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              {resetStep === 3 ? (
                <Button onClick={() => setShowResetDialog(false)} className="w-full">
                  Back to Sign In
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => {
                    if (resetStep === 2) {
                      setResetStep(1)
                      setResetCode("")
                      setResetMessage(null)
                    } else {
                      setShowResetDialog(false)
                    }
                  }}>
                    {resetStep === 2 ? 'Back' : 'Cancel'}
                  </Button>
                  <Button
                    onClick={handleResetPassword}
                    disabled={resetLoading || (resetStep === 1 ? !resetUsername.trim() : resetCode.length !== 6)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {resetStep === 1 ? 'Sending...' : 'Verifying...'}
                      </>
                    ) : (
                      resetStep === 1 ? 'Send Code' : 'Verify & Reset'
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  )
}

function AuthLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
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

