"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Shield,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  MapPin,
  KeyRound,
  ClipboardList,
  Loader2,
  Star,
  Eye,
  EyeOff
} from "lucide-react"
import {
  BARANGAYS_SANTA_CRUZ,
  ALL_SCHOOLS,
  OCCUPATION_CATEGORIES,
  GENDER_OPTIONS,
  GRADE_LEVELS,
  COLLEGES_WITH_YEARS,
  getScoreRating
} from "@/lib/constants"

// Types
interface AssessmentQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  category: string
}

interface RegistrationData {
  // Step 1: Basic Info
  firstName: string
  lastName: string
  middleName: string
  age: string
  gender: string

  // Step 2: Location & Background
  barangay: string
  school: string
  schoolOther: string
  occupation: string
  occupationOther: string
  gradeLevel: string

  // Step 3: Account
  username: string
  email: string
  password: string
  confirmPassword: string
  dataPrivacyConsent: boolean

  // Step 4: Pre-Test Answers
  preTestAnswers: Record<number, number> // questionId -> selectedAnswerIndex
}

const STEPS = [
  { id: 1, title: "Basic Info", icon: User, description: "Tell us about yourself" },
  { id: 2, title: "Location", icon: MapPin, description: "Where are you from?" },
  { id: 3, title: "Account", icon: KeyRound, description: "Create your account" },
  { id: 4, title: "Pre-Test", icon: ClipboardList, description: "Quick assessment" },
]

interface RegistrationWizardProps {
  onBackToLogin?: () => void
}

export function RegistrationWizard({ onBackToLogin }: RegistrationWizardProps) {
  
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [registrationResult, setRegistrationResult] = useState<{
    success: boolean
    score?: number
    maxScore?: number
    user?: any
  } | null>(null)

  const [data, setData] = useState<RegistrationData>({
    firstName: "",
    lastName: "",
    middleName: "",
    age: "",
    gender: "",
    barangay: "",
    school: "",
    schoolOther: "",
    occupation: "",
    occupationOther: "",
    gradeLevel: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    dataPrivacyConsent: false,
    preTestAnswers: {},
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackHover, setFeedbackHover] = useState(0)
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Ref for password container to ensure visibility on mobile
  const passwordContainerRef = useRef<HTMLDivElement>(null);

  // Memoized lists for selects to prevent costly re-renders on hover
  const genderOptionsList = useMemo(() => {
    return GENDER_OPTIONS.map((option) => (
      <SelectItem key={option} value={option} className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-orange-50 dark:focus:bg-slate-800 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer py-2.5">
        {option}
      </SelectItem>
    ))
  }, [])

  const barangaysList = useMemo(() => {
    return BARANGAYS_SANTA_CRUZ.map((brgy) => (
      <SelectItem key={brgy} value={brgy} className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-orange-50 dark:focus:bg-slate-800 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer py-2.5">
        {brgy}
      </SelectItem>
    ))
  }, [])

  const schoolsList = useMemo(() => {
    return ALL_SCHOOLS.map((school) => (
      <SelectItem key={school} value={school} className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-orange-50 dark:focus:bg-slate-800 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer py-2.5">
        {school}
      </SelectItem>
    ))
  }, [])

  const occupationsList = useMemo(() => {
    return OCCUPATION_CATEGORIES.map((occ) => (
      <SelectItem key={occ} value={occ} className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-orange-50 dark:focus:bg-slate-800 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer py-2.5">
        {occ}
      </SelectItem>
    ))
  }, [])

  const gradeLevelsList = useMemo(() => {
    const levels = COLLEGES_WITH_YEARS.includes(data.school as any)
      ? ["Grade 11", "Grade 12", "1st Year", "2nd Year", "3rd Year", "4th Year"]
      : GRADE_LEVELS;
    return levels.map((level) => (
      <SelectItem key={level} value={level} className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-orange-50 dark:focus:bg-slate-800 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer py-2.5">
        {level}
      </SelectItem>
    ))
  }, [data.school])

  // Fetch pre-test questions when reaching step 4
  useEffect(() => {
    if (currentStep === 4 && questions.length === 0) {
      fetchQuestions()
    }
  }, [currentStep])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const role = parseInt(data.age) < 18 ? "kid" : "adult"
      const response = await axios.get(`/api/assessment/questions?role=${role}&type=preTest`)
      if (response.status === 200) {
        setQuestions(response.data.questions || [])
      } else {
        setError("Failed to load assessment questions")
      }
    } catch (err) {
      setError("Failed to load assessment questions")
    } finally {
      setLoading(false)
    }
  }

  const isKid = parseInt(data.age) < 18

  const autoCapitalize = (text: string) =>
    text.replace(/\b\w/g, (char) => char.toUpperCase())

  const updateField = (field: keyof RegistrationData, value: any) => {
    // Auto-capitalize first letter of each word for name fields
    if (field === "firstName" || field === "lastName" || field === "middleName") {
      value = autoCapitalize(value as string)
    }
    
    setData(prev => {
      const next = { ...prev, [field]: value };
      
      // If school changes, check if the current gradeLevel is valid for the selected school
      if (field === "school") {
        const allowedLevels = COLLEGES_WITH_YEARS.includes(value as any)
          ? ["Grade 11", "Grade 12", "1st Year", "2nd Year", "3rd Year", "4th Year"]
          : GRADE_LEVELS;
        
        if (prev.gradeLevel && !allowedLevels.includes(prev.gradeLevel as any)) {
          next.gradeLevel = "";
        }
      }
      
      return next;
    })

    // Clear validation error when user types
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!data.lastName.trim()) errors.lastName = "Last Name is required"
        if (!data.firstName.trim()) errors.firstName = "First Name is required"
        if (!data.age) errors.age = "Age is required"
        else if (parseInt(data.age) < 1 || parseInt(data.age) > 99) errors.age = "Please enter a valid age (1-99)"
        if (!data.gender) errors.gender = "Please select your gender"
        break

      case 2:
        if (!data.barangay) errors.barangay = "Please select your barangay"
        if (isKid) {
          if (!data.school) errors.school = "Please select your school"
          if (data.school === "Other (Please specify)" && !data.schoolOther.trim()) {
            errors.schoolOther = "Please specify your school"
          }
          if (!data.gradeLevel) errors.gradeLevel = "Please select your grade level"
        } else {
          if (!data.occupation) errors.occupation = "Please select your occupation"
          if (data.occupation === "Other (Please specify)" && !data.occupationOther.trim()) {
            errors.occupationOther = "Please specify your occupation"
          }
        }
        break

      case 3:
        if (!data.username.trim()) errors.username = "Username is required"
        else if (data.username.length < 3 || data.username.length > 20) {
          errors.username = "Username must be 3-20 characters"
        } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
          errors.username = "Username can only contain letters, numbers, and underscores"
        }

        if (!data.email.trim()) errors.email = "Email is required"
        else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(data.email)) {
          errors.email = "Email must be a @gmail.com address"
        }

        const COMMON_PASSWORDS = ['password123', 'password', '123456', 'qwerty', 'abc123', 'letmein', 'admin', 'welcome', 'monkey', 'password1', 'iloveyou', 'sunshine', 'princess', 'football', 'shadow', 'master', 'trustno1', 'dragon'];
        if (!data.password) errors.password = "Password is required"
        else if (data.password.length < 8) errors.password = "Password must be at least 8 characters"
        else if (!/[A-Z]/.test(data.password)) errors.password = "Password must contain at least one uppercase letter"
        else if (!/[a-z]/.test(data.password)) errors.password = "Password must contain at least one lowercase letter"
        else if (!/[0-9]/.test(data.password)) errors.password = "Password must contain at least one number"
        else if (!/[^A-Za-z0-9]/.test(data.password)) errors.password = "Password must contain at least one special character (!@#$%^&*)"
        else if (COMMON_PASSWORDS.includes(data.password.toLowerCase())) errors.password = "This password is too common. Please choose a stronger one."

        if (data.password !== data.confirmPassword) errors.confirmPassword = "Passwords do not match"
        if (!data.dataPrivacyConsent) errors.dataPrivacyConsent = "You must agree to the data privacy policy"
        break

      case 4:
        // Check if all questions are answered
        if (Object.keys(data.preTestAnswers).length < questions.length) {
          errors.preTest = "Please answer all questions"
        }
        break
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
      const response = await axios.get(`/api/auth/check-username?username=${username}`)
      const result = response.data

      if (result.error) {
        return false
      }

      return result.available
    } catch (error) {
      console.error('Error checking username:', error)
      return false
    }
  }

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3) {
        // Validate ALL credentials against the server before proceeding to the pre-test
        setLoading(true)
        setError("")
        try {
          const response = await axios.post('/api/auth/validate-credentials', {
              username: data.username,
              password: data.password,
              password_confirmation: data.confirmPassword,
              email: data.email,
          })
          const result = response.data

          if (result.valid === false) {
            // Show server-side validation errors
            const serverErrors: Record<string, string> = {}
            if (result.errors?.username) serverErrors.username = Array.isArray(result.errors.username) ? result.errors.username[0] : result.errors.username
            if (result.errors?.password) serverErrors.password = Array.isArray(result.errors.password) ? result.errors.password[0] : result.errors.password
            if (result.errors?.email) serverErrors.email = Array.isArray(result.errors.email) ? result.errors.email[0] : result.errors.email
            setValidationErrors(prev => ({ ...prev, ...serverErrors }))
            setError(Object.values(result.errors || {}).map((e: any) => Array.isArray(e) ? e[0] : e).join('. '))
            setLoading(false)
            return
          }
        } catch (err) {
          setError('Failed to validate credentials. Please try again.')
          setLoading(false)
          return
        }
        setLoading(false)
      }

      if (currentStep < 4) {
        setCurrentStep(prev => prev + 1)
        setError("")
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      setError("")
    } else if (currentStep === 1 && onBackToLogin) {
      onBackToLogin()
    }
  }

  const handleAnswerQuestion = (questionId: number, answerIndex: number) => {
    setData(prev => ({
      ...prev,
      preTestAnswers: {
        ...prev.preTestAnswers,
        [questionId]: answerIndex
      }
    }))
    
    // Auto-advance to the next question after a short delay
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1)
      }, 400)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return

    setLoading(true)
    setError("")

    try {
      const response = await axios.post("/api/auth/register", {
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName || undefined,
          age: parseInt(data.age),
          gender: data.gender,
          barangay: data.barangay,
          school: data.school === "Other (Please specify)" ? data.schoolOther : data.school,
          schoolOther: data.school === "Other (Please specify)" ? data.schoolOther : null,
          occupation: data.occupation === "Other (Please specify)" ? data.occupationOther : data.occupation,
          occupationOther: data.occupation === "Other (Please specify)" ? data.occupationOther : null,
          gradeLevel: data.gradeLevel || null,
          username: data.username,
          email: data.email,
          password: data.password,
          password_confirmation: data.confirmPassword,
          dataPrivacyConsent: data.dataPrivacyConsent,
          preTestAnswers: data.preTestAnswers,
      })

      const result = response.data

      if (result.success) {
        setRegistrationResult({
          success: true,
          score: result.preTestScore,
          maxScore: result.maxScore,
          user: result.user,
        })
        // Store user in localStorage
        localStorage.setItem("user", JSON.stringify(result.user))
      } else {
        setError(result.error || "Registration failed")
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleFeedbackSubmit = async () => {
    if (feedbackRating === 0) return
    setFeedbackSubmitting(true)
    try {
        await axios.post('/api/feedback', {
            featureName: 'Registration Pre-Test',
            featureType: 'quiz',
            rating: feedbackRating,
            comments: ''
        })
        setFeedbackSuccess(true)
    } catch(err) {
        console.error('Failed to submit registration feedback', err)
    } finally {
        setFeedbackSubmitting(false)
    }
  }

  const handleContinue = async () => {
    // Small delay to ensure cookie is fully set before middleware checks it
    // This fixes a race condition where navigation happens before cookie propagation
    await new Promise(resolve => setTimeout(resolve, 100))

    // Redirect based on role - use full page navigation to ensure session cookie is sent
    if (registrationResult?.user) {
      const role = registrationResult.user.role
      if (role === "kid") window.location.href = "/kids"
      else if (role === "adult") window.location.href = "/adult"
      else if (role === "professional") window.location.href = "/professional"
      else window.location.href = "/"
    } else {
      window.location.href = "/"
    }
  }

  // Show results after registration
  if (registrationResult?.success) {
    const percentage = registrationResult.maxScore
      ? Math.round((registrationResult.score! / registrationResult.maxScore) * 100)
      : 0
    const rating = getScoreRating(percentage)

    return (
      <Card className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md mx-auto rounded-none sm:rounded-[2rem] border-none sm:border border-slate-100 dark:border-slate-800/80 shadow-none sm:shadow-2xl bg-white dark:bg-slate-900 overflow-hidden transition-colors duration-500 flex flex-col py-0 gap-0 sm:gap-6">
        {/* Header Section */}
        <div className="bg-red-600 px-6 pt-[calc(1.25rem+env(safe-area-inset-top,0px))] pb-6 sm:pt-6 sm:pb-6 text-center rounded-none sm:rounded-t-[2rem] relative overflow-hidden shrink-0">
          {/* Decorative faint circles in background */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white blur-lg"></div>
            <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-white blur-md"></div>
          </div>

          <div className="relative z-10 mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-[0_0_0_6px_rgba(255,255,255,0.2)] animate-bounce duration-[2000ms]">
            <Check className="w-8 h-8 text-green-500" strokeWidth={4} />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight relative z-10">Registration Complete!</h2>
          <p className="text-white/80 text-xs mt-1 font-medium relative z-10">Welcome to SafeScape Fire Safety Learning</p>
        </div>

        {/* Content Section */}
        <CardContent className="flex-1 flex flex-col justify-center p-6 sm:p-8 space-y-6 bg-white dark:bg-slate-900">
          
          {/* Score Card */}
          <div className="text-center p-6 bg-slate-50 dark:bg-slate-950/40 rounded-3xl border-2 border-slate-100 dark:border-slate-800/50 shadow-md transition-colors">
            <span className="inline-block text-[10px] font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-3 py-1 rounded-full uppercase tracking-wider mb-3 border border-orange-100 dark:border-orange-500/20">
              Your Pre-Test Score
            </span>
            <div className="flex justify-center items-baseline gap-1.5 mb-1">
              <span className="text-5xl font-black" style={{ color: rating.color }}>
                {registrationResult.score}
              </span>
              <span className="text-2xl font-bold text-slate-300 dark:text-slate-700">
                / {registrationResult.maxScore}
              </span>
            </div>
            <p className="text-base font-black uppercase tracking-wide mb-3" style={{ color: rating.color }}>
              {rating.label}
            </p>
            
            <div className="h-px w-12 bg-slate-200 dark:bg-slate-800 mx-auto mb-3"></div>
            
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto transition-colors">
              This is your baseline score. Complete modules and activities to unlock the Post-Test
              and see how much you've improved!
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-2 text-center">
            <button
              onClick={handleContinue}
              className="mx-auto inline-flex items-center gap-1.5 bg-yellow-400 text-red-700 font-extrabold px-8 py-2.5 rounded-full text-sm border-[3px] border-white shadow-[0_3px_0_#b45309] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#b45309] active:translate-y-0.5 active:shadow-[0_0px_0_#b45309] transition-all"
            >
              Start Learning Now
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-3xl mx-auto rounded-none sm:rounded-[2rem] border-none sm:border border-slate-100 dark:border-slate-800/80 shadow-none sm:shadow-2xl bg-white dark:bg-slate-900 overflow-hidden transition-colors duration-500 flex flex-col justify-between sm:justify-start py-0 gap-0 sm:gap-1">
      {/* Colorful Gradient Header */}
      <div className="bg-primary px-4 sm:px-8 pt-[calc(1rem+env(safe-area-inset-top,0px))] sm:pt-4 pb-3 sm:pb-4 rounded-none sm:rounded-t-[1.85rem]">
        <div className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-tight mb-0.5">Create Your Account 🎓</h2>
            <p className="text-white/80 text-[10px] sm:text-xs">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 sm:mt-3">
          <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
            <div
              className="bg-yellow-400 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((step) => {
              const Icon = step.icon
              const isCompleted = currentStep > step.id
              const isCurrent = currentStep === step.id
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center transition-all ${
                    isCompleted ? "text-yellow-300" : isCurrent ? "text-white" : "text-white/40"
                  }`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-[2px] transition-all ${
                    isCompleted
                      ? "bg-yellow-400 border-white text-red-600 shadow-[0_2px_0_#b45309]"
                      : isCurrent
                        ? "bg-white border-yellow-400 text-orange-500 shadow-sm"
                        : "bg-white/20 border-white/30 text-white/60"
                  }`}>
                    {isCompleted ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </div>
                  <span className="text-[9px] sm:text-[10px] mt-1 font-semibold hidden sm:block uppercase tracking-wider">{step.title}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <CardHeader className="sr-only">
        <CardTitle>Create Your Account</CardTitle>
      </CardHeader>

      <CardContent className="pt-2 px-5 pb-3 sm:pt-2 sm:px-6 sm:pb-4 flex-1 overflow-y-auto flex flex-col justify-between sm:justify-start">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/20 rounded-2xl flex items-start gap-2 transition-colors">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <Label htmlFor="firstName" className="text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">First Name *</Label>
              <Input
                id="firstName"
                autoComplete="given-name"
                placeholder="Enter your first name"
                value={data.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                className={`rounded-xl border-2 h-11 text-base focus:border-orange-400 focus:ring-orange-400 dark:bg-slate-950 dark:text-white dark:border-slate-800 ${validationErrors.firstName ? "border-red-400 bg-red-50 dark:bg-red-500/10" : "border-gray-200"}`}
              />
              {validationErrors.firstName && (
                <p className="text-sm text-red-500 mt-1 font-medium">⚠️ {validationErrors.firstName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName" className="text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">Last Name *</Label>
              <Input
                id="lastName"
                autoComplete="family-name"
                placeholder="Enter your last name"
                value={data.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                className={`rounded-xl border-2 h-11 text-base focus:border-orange-400 focus:ring-orange-400 dark:bg-slate-950 dark:text-white dark:border-slate-800 ${validationErrors.lastName ? "border-red-400 bg-red-50 dark:bg-red-500/10" : "border-gray-200"}`}
              />
              {validationErrors.lastName && (
                <p className="text-sm text-red-500 mt-1 font-medium">⚠️ {validationErrors.lastName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="middleName" className="text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">Middle Name (Optional)</Label>
              <Input
                id="middleName"
                placeholder="Enter your middle name"
                value={data.middleName}
                onChange={(e) => updateField("middleName", e.target.value)}
                className="rounded-xl border-2 border-gray-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white h-11 text-base focus:border-orange-400 focus:ring-orange-400"
              />
            </div>

            <div>
              <Label htmlFor="age" className="text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">Age *</Label>
              <Input
                id="age"
                type="number"
                inputMode="numeric"
                placeholder="Enter your age"
                min="1"
                max="99"
                value={data.age}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                  updateField("age", val);
                }}
                onKeyDown={(e) => {
                  if (['.', 'e', 'E', '+', '-'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                className={`rounded-xl border-2 h-11 text-base focus:border-orange-400 focus:ring-orange-400 dark:bg-slate-950 dark:text-white dark:border-slate-800 ${validationErrors.age ? "border-red-400 bg-red-50 dark:bg-red-500/10" : "border-gray-200"}`}
              />
              {validationErrors.age && (
                <p className="text-sm text-red-500 mt-1 font-medium">⚠️ {validationErrors.age}</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">Gender *</Label>
              <Select value={data.gender} onValueChange={(value) => updateField("gender", value)}>
                <SelectTrigger className={`rounded-xl border-2 h-11 text-xs sm:text-sm md:text-base font-bold text-slate-700 dark:text-slate-200 focus:ring-orange-400 focus:border-orange-400 transition-all hover:border-slate-300 dark:bg-slate-950 dark:border-slate-800 ${validationErrors.gender ? "border-red-400 bg-red-50 dark:bg-red-500/10" : "border-gray-200"}`}>
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-xl p-1">
                  {genderOptionsList}
                </SelectContent>
              </Select>
              {validationErrors.gender && (
                <p className="text-sm text-red-500 mt-1 font-medium">⚠️ {validationErrors.gender}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Location & Background */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Barangay *</Label>
              <Select value={data.barangay} onValueChange={(value) => updateField("barangay", value)}>
                <SelectTrigger className={`rounded-xl border-2 h-11 text-xs sm:text-sm md:text-base font-bold text-slate-700 dark:text-slate-200 focus:ring-orange-400 focus:border-orange-400 transition-all hover:border-slate-300 dark:bg-slate-950 dark:border-slate-800 ${validationErrors.barangay ? "border-red-500 bg-red-50 dark:bg-red-500/10" : "border-gray-200"}`}>
                  <SelectValue placeholder="Select your barangay" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-xl p-1">
                  {barangaysList}
                </SelectContent>
              </Select>
              {validationErrors.barangay && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.barangay}</p>
              )}
            </div>

            {isKid ? (
              <>
                <div>
                  <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">School *</Label>
                  <Select value={data.school} onValueChange={(value) => updateField("school", value)}>
                    <SelectTrigger className={`rounded-xl border-2 h-11 text-xs sm:text-sm md:text-base font-bold text-slate-700 dark:text-slate-200 focus:ring-orange-400 focus:border-orange-400 transition-all hover:border-slate-300 dark:bg-slate-950 dark:border-slate-800 ${validationErrors.school ? "border-red-500 bg-red-50 dark:bg-red-500/10" : "border-gray-200"}`}>
                      <SelectValue placeholder="Select your school" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-xl p-1">
                      {schoolsList}
                    </SelectContent>
                  </Select>
                  {validationErrors.school && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.school}</p>
                  )}
                </div>

                {data.school === "Other (Please specify)" && (
                  <div>
                    <Label htmlFor="schoolOther" className="text-sm font-bold text-slate-700 dark:text-slate-300">Specify School *</Label>
                    <Input
                      id="schoolOther"
                      placeholder="Enter your school name"
                      value={data.schoolOther}
                      onChange={(e) => updateField("schoolOther", e.target.value)}
                      className={`rounded-xl border-2 h-11 text-xs sm:text-sm md:text-base dark:bg-slate-950 dark:text-white dark:border-slate-800 ${validationErrors.schoolOther ? "border-red-500 bg-red-50 dark:bg-red-500/10" : "border-gray-200"}`}
                    />
                    {validationErrors.schoolOther && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.schoolOther}</p>
                    )}
                  </div>
                )}

                <div>
                  <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Grade Level *</Label>
                  <Select value={data.gradeLevel} onValueChange={(value) => updateField("gradeLevel", value)}>
                    <SelectTrigger className={`rounded-xl border-2 h-11 text-xs sm:text-sm md:text-base font-bold text-slate-700 dark:text-slate-200 focus:ring-orange-400 focus:border-orange-400 transition-all hover:border-slate-300 dark:bg-slate-950 dark:border-slate-800 ${validationErrors.gradeLevel ? "border-red-500 bg-red-50 dark:bg-red-500/10" : "border-gray-200"}`}>
                      <SelectValue placeholder="Select your grade level" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-xl p-1">
                      {gradeLevelsList}
                    </SelectContent>
                  </Select>
                  {validationErrors.gradeLevel && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.gradeLevel}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Occupation *</Label>
                  <Select value={data.occupation} onValueChange={(value) => updateField("occupation", value)}>
                    <SelectTrigger className={`rounded-xl border-2 h-11 text-xs sm:text-sm md:text-base font-bold text-slate-700 dark:text-slate-200 focus:ring-orange-400 focus:border-orange-400 transition-all hover:border-slate-300 dark:bg-slate-950 dark:border-slate-800 ${validationErrors.occupation ? "border-red-500 bg-red-50 dark:bg-red-500/10" : "border-gray-200"}`}>
                      <SelectValue placeholder="Select your occupation" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-xl p-1">
                      {occupationsList}
                    </SelectContent>
                  </Select>
                  {validationErrors.occupation && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.occupation}</p>
                  )}
                </div>

                {data.occupation === "Other (Please specify)" && (
                  <div>
                    <Label htmlFor="occupationOther" className="text-sm font-bold text-slate-700 dark:text-slate-300">Specify Occupation *</Label>
                    <Input
                      id="occupationOther"
                      placeholder="Enter your occupation"
                      value={data.occupationOther}
                      onChange={(e) => updateField("occupationOther", e.target.value)}
                      className={`rounded-xl border-2 h-11 text-xs sm:text-sm md:text-base dark:bg-slate-950 dark:text-white dark:border-slate-800 ${validationErrors.occupationOther ? "border-red-500 bg-red-50 dark:bg-red-500/10" : "border-gray-200"}`}
                    />
                    {validationErrors.occupationOther && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.occupationOther}</p>
                    )}
                  </div>
                )}

                {data.occupation === "Student" && (
                  <div>
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">School (Optional)</Label>
                    <Select value={data.school} onValueChange={(value) => updateField("school", value)}>
                      <SelectTrigger className="rounded-xl border-2 h-11 text-xs sm:text-sm md:text-base font-bold text-slate-700 dark:text-slate-200 focus:ring-orange-400 focus:border-orange-400 transition-all hover:border-slate-300 dark:bg-slate-950 dark:border-slate-800 border-gray-200 transition-colors">
                        <SelectValue placeholder="Select your school" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-2 border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-xl p-1">
                        {schoolsList}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 3: Account */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Username *</Label>
                <Input
                  id="username"
                  autoComplete="username"
                  placeholder="Choose a username"
                  value={data.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  className={`rounded-xl border-2 h-11 text-base focus:border-orange-400 focus:ring-orange-400 dark:bg-slate-950 dark:text-white dark:border-slate-800 ${validationErrors.username ? "border-red-400 bg-red-50 dark:bg-red-500/10" : "border-gray-200"}`}
                />
                {validationErrors.username && (
                  <p className="text-sm text-red-500 mt-1 font-medium">⚠️ {validationErrors.username}</p>
                )}
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium ml-1 transition-colors">
                  3-20 characters, letters, numbers, and underscores only
                </p>
              </div>
 
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="example@gmail.com"
                  value={data.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={`rounded-xl border-2 h-11 text-base focus:border-orange-400 focus:ring-orange-400 dark:bg-slate-950 dark:text-white dark:border-slate-800 ${validationErrors.email ? "border-red-400 bg-red-50 dark:bg-red-500/10" : "border-gray-200"}`}
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-500 mt-1 font-medium">⚠️ {validationErrors.email}</p>
                )}
              </div>
            </div>
 
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2" ref={passwordContainerRef}>
                <Label htmlFor="password" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={data.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    onFocus={() => {
                      // Small delay to allow the mobile keyboard to fully open before scrolling
                      setTimeout(() => {
                        passwordContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }, 300);
                    }}
                    className={`rounded-xl border-2 h-11 text-base focus:border-orange-400 focus:ring-orange-400 dark:bg-slate-950 dark:text-white dark:border-slate-800 pr-10 ${validationErrors.password ? "border-red-400 bg-red-50 dark:bg-red-500/10" : "border-gray-200"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-red-500 mt-1 font-medium">⚠️ {validationErrors.password}</p>
                )}
              </div>
 
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  value={data.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  className={`rounded-xl border-2 h-11 text-base focus:border-orange-400 focus:ring-orange-400 dark:bg-slate-950 dark:text-white dark:border-slate-800 ${validationErrors.confirmPassword ? "border-red-400 bg-red-50 dark:bg-red-500/10" : "border-gray-200"}`}
                />
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1 font-medium">⚠️ {validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>
 
            {/* Password Requirements Checklist - Now Full Width and Horizontally Grid-aligned */}
            <div className="bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 transition-colors w-full">
              <p className="text-xs font-black text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider transition-colors">Password Requirements:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { label: "At least 8 characters", met: data.password.length >= 8 },
                  { label: "One uppercase letter", met: /[A-Z]/.test(data.password) },
                  { label: "One lowercase letter", met: /[a-z]/.test(data.password) },
                  { label: "One number (0-9)", met: /[0-9]/.test(data.password) },
                  { label: "One special character (!@#...)", met: /[^A-Za-z0-9]/.test(data.password) },
                ].map((req, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors shrink-0 ${req.met ? "bg-green-500" : "bg-slate-200 dark:bg-slate-800"}`}>
                      <Check className={`h-2.5 w-2.5 text-white transition-opacity ${req.met ? "opacity-100" : "opacity-0"}`} strokeWidth={4} />
                    </div>
                    <span className={`text-[11px] font-bold transition-colors ${req.met ? "text-green-700 dark:text-green-400" : "text-slate-500 dark:text-slate-400"}`}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
 
            <div className="flex items-start space-x-3 pt-2 group cursor-pointer" onClick={() => updateField("dataPrivacyConsent", !data.dataPrivacyConsent)}>
              <div className={`mt-0.5 shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${data.dataPrivacyConsent ? "bg-orange-500 border-orange-500 shadow-[0_2px_0_#ca8a04]" : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"}`}>
                {data.dataPrivacyConsent && <Check className="h-3.5 w-3.5 text-white" strokeWidth={4} />}
              </div>
              <div className="grid gap-1.5 leading-none">
                <label className={`text-[13px] font-black leading-tight cursor-pointer transition-colors ${data.dataPrivacyConsent ? "text-slate-800 dark:text-white" : "text-slate-600 dark:text-slate-400"} ${validationErrors.dataPrivacyConsent ? "text-red-500" : ""}`}>
                  I agree to the Data Privacy Policy *
                </label>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 leading-relaxed transition-colors">
                  Your data (barangay, school) will be used for community fire safety analytics.
                  Individual information is kept confidential and only aggregated data is shared.
                </p>
              </div>
            </div>
            {validationErrors.dataPrivacyConsent && (
              <p className="text-sm text-red-500 font-bold ml-8">⚠️ {validationErrors.dataPrivacyConsent}</p>
            )}
          </div>
        )}

        {/* Step 4: Pre-Test */}
        {currentStep === 4 && (
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <span className="ml-2">Loading questions...</span>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No questions available</p>
                <Button onClick={fetchQuestions} variant="outline" className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                {/* Question Container */}
                <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-block text-[10px] sm:text-xs font-black text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20 px-3 py-1 rounded-full uppercase tracking-wider transition-colors">
                      {questions[currentQuestionIndex].category}
                    </span>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                      {currentQuestionIndex + 1} of {questions.length}
                    </span>
                  </div>
                  
                  <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white mb-4 leading-tight transition-colors">
                    {questions[currentQuestionIndex].question}
                  </h3>

                  <RadioGroup
                    value={data.preTestAnswers[questions[currentQuestionIndex].id]?.toString() || ""}
                    onValueChange={(value) => handleAnswerQuestion(questions[currentQuestionIndex].id, parseInt(value))}
                    className="gap-2"
                  >
                    {questions[currentQuestionIndex].options.map((option, index) => {
                      const isSelected = data.preTestAnswers[questions[currentQuestionIndex].id] === index;
                      return (
                        <div 
                          key={index} 
                          className="relative flex items-center"
                        >
                          {/* We place the RadioGroupItem completely hidden over the whole area so it handles accessibility and clicking perfectly, or we use a big label */}
                          <RadioGroupItem 
                            value={index.toString()} 
                            id={`option-${index}`} 
                            className="peer sr-only" 
                          />
                          <Label 
                            htmlFor={`option-${index}`} 
                            className={`flex-1 flex items-center p-3 cursor-pointer rounded-xl border-[2px] transition-all font-bold text-[13px] sm:text-sm ${
                              isSelected 
                                ? "bg-orange-50 dark:bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300 shadow-[0_3px_0_#ca8a04]" 
                                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-orange-300 dark:hover:border-orange-500/30 hover:bg-orange-50/50 dark:hover:bg-orange-500/5 shadow-[0_3px_0_#cbd5e1] dark:shadow-[0_3px_0_#1e293b]"
                            }`}
                          >
                            <div className={`mr-3 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? "border-orange-500" : "border-slate-300 dark:border-slate-600"
                            }`}>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                            </div>
                            {option}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>

                {validationErrors.preTest && (
                  <p className="text-sm text-red-500 text-center mt-2">{validationErrors.preTest}</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 && !onBackToLogin}
              className={`flex items-center gap-1 font-bold px-5 h-11 rounded-full border-[3px] transition-all text-sm ${
                currentStep === 1 && !onBackToLogin
                  ? "border-gray-200 dark:border-slate-800 text-gray-300 dark:text-slate-700 cursor-not-allowed"
                  : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 shadow-[0_3px_0_#94a3b8] dark:shadow-[0_3px_0_#1e293b] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#94a3b8] dark:hover:shadow-[0_5px_0_#1e293b] active:translate-y-1 active:shadow-[0_0px_0_#94a3b8]"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              {currentStep === 1 ? "Back to Login" : "Back"}
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1 bg-yellow-400 text-red-600 font-extrabold px-6 h-11 rounded-full border-[3px] border-white shadow-[0_3px_0_#b45309] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#b45309] active:translate-y-1 active:shadow-[0_0px_0_#b45309] transition-all text-sm"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {currentStep === 4 && questions.length > 0 && (
          <div className="flex justify-between items-center mt-3 sm:mt-4">
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              disabled={currentQuestionIndex === 0}
              className={`flex items-center gap-1 font-bold px-5 py-2.5 rounded-full border-[3px] transition-all text-sm ${
                currentQuestionIndex === 0
                  ? "border-gray-200 dark:border-slate-800 text-gray-300 dark:text-slate-700 cursor-not-allowed"
                  : "border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 shadow-[0_3px_0_#94a3b8] dark:shadow-[0_3px_0_#1e293b] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#94a3b8] dark:hover:shadow-[0_5px_0_#1e293b] active:translate-y-1 active:shadow-[0_0px_0_#94a3b8]"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              {currentQuestionIndex === 0 ? "Back" : `Question ${currentQuestionIndex}`}
            </button>

            {currentQuestionIndex === questions.length - 1 && (
              <button
                onClick={handleSubmit}
                disabled={loading || Object.keys(data.preTestAnswers).length < questions.length}
                className={`flex items-center gap-1 font-extrabold px-8 py-2.5 rounded-full border-[3px] transition-all text-sm ${
                  loading || Object.keys(data.preTestAnswers).length < questions.length
                    ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                    : "bg-yellow-400 text-red-600 border-white shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-[0_0px_0_#b45309]"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
