"use client"

import { useState, useEffect } from "react"
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
  Star
} from "lucide-react"
import {
  BARANGAYS_SANTA_CRUZ,
  ALL_SCHOOLS,
  OCCUPATION_CATEGORIES,
  GENDER_OPTIONS,
  GRADE_LEVELS,
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

export function RegistrationWizard() {
  
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
    setData(prev => ({ ...prev, [field]: value }))
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
        else if (parseInt(data.age) < 1 || parseInt(data.age) > 120) errors.age = "Please enter a valid age"
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
      <Card className="w-full max-w-lg mx-auto border-none shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-3xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 p-6 text-center rounded-t-3xl">
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Registration Complete! 🎉</h2>
          <p className="text-white/80 text-sm mt-1">Welcome to SafeScape Fire Safety Learning</p>
        </div>
        <CardContent className="space-y-6 p-6">
          <div className="text-center p-6 bg-orange-50 rounded-2xl border-2 border-orange-200">
            <p className="text-sm text-orange-600 font-semibold mb-2">Your Pre-Test Score</p>
            <div className="text-5xl font-black" style={{ color: rating.color }}>
              {registrationResult.score} / {registrationResult.maxScore}
            </div>
            <p className="text-lg font-bold mt-2" style={{ color: rating.color }}>
              {rating.label}
            </p>
            <p className="text-sm text-slate-500 mt-4">
              This is your baseline score. Complete modules and activities to unlock the Post-Test
              and see how much you&apos;ve improved!
            </p>
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-yellow-400 text-red-600 font-extrabold py-3 rounded-full text-lg shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-[0_0px_0_#b45309] transition-all flex items-center justify-center gap-2 mt-4"
          >
            🚀 Start Learning
            <ChevronRight className="h-5 w-5" />
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto border-none shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-3xl overflow-hidden">
      {/* Colorful Gradient Header */}
      <div className="bg-red-600 px-4 sm:px-6 pt-4 sm:pt-5 pb-5 sm:pb-6 rounded-t-3xl">
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
          </div>
          <span className="text-lg sm:text-xl font-bold text-white">SafeScape</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">Create Your Account 🎓</h2>
        <p className="text-white/80 text-xs sm:text-sm">
          Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].description}
        </p>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
            <div
              className="bg-yellow-400 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-3">
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
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-[2px] sm:border-[3px] transition-all ${
                    isCompleted
                      ? "bg-yellow-400 border-white text-red-600 shadow-[0_2px_0_#b45309] sm:shadow-[0_3px_0_#b45309]"
                      : isCurrent
                        ? "bg-white border-yellow-400 text-orange-500 shadow-md sm:shadow-lg"
                        : "bg-white/20 border-white/30 text-white/60"
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>
                  <span className="text-[10px] sm:text-xs mt-1.5 font-semibold hidden sm:block">{step.title}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <CardHeader className="sr-only">
        <CardTitle>Create Your Account</CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <Label htmlFor="lastName" className="text-sm font-bold text-slate-700">Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Enter your last name"
                value={data.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                className={`rounded-xl border-2 h-11 text-base focus:border-orange-400 focus:ring-orange-400 ${validationErrors.lastName ? "border-red-400 bg-red-50" : "border-gray-200"}`}
              />
              {validationErrors.lastName && (
                <p className="text-sm text-red-500 mt-1 font-medium">⚠️ {validationErrors.lastName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="firstName" className="text-sm font-bold text-slate-700">First Name *</Label>
              <Input
                id="firstName"
                placeholder="Enter your first name"
                value={data.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                className={`rounded-xl border-2 h-11 text-base focus:border-orange-400 focus:ring-orange-400 ${validationErrors.firstName ? "border-red-400 bg-red-50" : "border-gray-200"}`}
              />
              {validationErrors.firstName && (
                <p className="text-sm text-red-500 mt-1 font-medium">⚠️ {validationErrors.firstName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="middleName" className="text-sm font-bold text-slate-700">Middle Name (Optional)</Label>
              <Input
                id="middleName"
                placeholder="Enter your middle name"
                value={data.middleName}
                onChange={(e) => updateField("middleName", e.target.value)}
                className="rounded-xl border-2 border-gray-200 h-11 text-base focus:border-orange-400 focus:ring-orange-400"
              />
            </div>

            <div>
              <Label htmlFor="age" className="text-sm font-bold text-slate-700">Age *</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                min="1"
                max="120"
                value={data.age}
                onChange={(e) => updateField("age", e.target.value)}
                className={`rounded-xl border-2 h-11 text-base focus:border-orange-400 focus:ring-orange-400 ${validationErrors.age ? "border-red-400 bg-red-50" : "border-gray-200"}`}
              />
              {validationErrors.age && (
                <p className="text-sm text-red-500 mt-1 font-medium">⚠️ {validationErrors.age}</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-bold text-slate-700">Gender *</Label>
              <Select value={data.gender} onValueChange={(value) => updateField("gender", value)}>
                <SelectTrigger className={`rounded-xl border-2 h-11 text-base focus:border-orange-400 ${validationErrors.gender ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
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
              <Label>Barangay *</Label>
              <Select value={data.barangay} onValueChange={(value) => updateField("barangay", value)}>
                <SelectTrigger className={validationErrors.barangay ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select your barangay" />
                </SelectTrigger>
                <SelectContent>
                  {BARANGAYS_SANTA_CRUZ.map((brgy) => (
                    <SelectItem key={brgy} value={brgy}>{brgy}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.barangay && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.barangay}</p>
              )}
            </div>

            {isKid ? (
              <>
                <div>
                  <Label>School *</Label>
                  <Select value={data.school} onValueChange={(value) => updateField("school", value)}>
                    <SelectTrigger className={validationErrors.school ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select your school" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_SCHOOLS.map((school) => (
                        <SelectItem key={school} value={school}>{school}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.school && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.school}</p>
                  )}
                </div>

                {data.school === "Other (Please specify)" && (
                  <div>
                    <Label htmlFor="schoolOther">Specify School *</Label>
                    <Input
                      id="schoolOther"
                      placeholder="Enter your school name"
                      value={data.schoolOther}
                      onChange={(e) => updateField("schoolOther", e.target.value)}
                      className={validationErrors.schoolOther ? "border-red-500" : ""}
                    />
                    {validationErrors.schoolOther && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.schoolOther}</p>
                    )}
                  </div>
                )}

                <div>
                  <Label>Grade Level *</Label>
                  <Select value={data.gradeLevel} onValueChange={(value) => updateField("gradeLevel", value)}>
                    <SelectTrigger className={validationErrors.gradeLevel ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select your grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
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
                  <Label>Occupation *</Label>
                  <Select value={data.occupation} onValueChange={(value) => updateField("occupation", value)}>
                    <SelectTrigger className={validationErrors.occupation ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select your occupation" />
                    </SelectTrigger>
                    <SelectContent>
                      {OCCUPATION_CATEGORIES.map((occ) => (
                        <SelectItem key={occ} value={occ}>{occ}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.occupation && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.occupation}</p>
                  )}
                </div>

                {data.occupation === "Other (Please specify)" && (
                  <div>
                    <Label htmlFor="occupationOther">Specify Occupation *</Label>
                    <Input
                      id="occupationOther"
                      placeholder="Enter your occupation"
                      value={data.occupationOther}
                      onChange={(e) => updateField("occupationOther", e.target.value)}
                      className={validationErrors.occupationOther ? "border-red-500" : ""}
                    />
                    {validationErrors.occupationOther && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.occupationOther}</p>
                    )}
                  </div>
                )}

                {data.occupation === "Student" && (
                  <div>
                    <Label>School (Optional)</Label>
                    <Select value={data.school} onValueChange={(value) => updateField("school", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your school" />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_SCHOOLS.map((school) => (
                          <SelectItem key={school} value={school}>{school}</SelectItem>
                        ))}
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
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                placeholder="Choose a username"
                value={data.username}
                onChange={(e) => updateField("username", e.target.value)}
                className={validationErrors.username ? "border-red-500" : ""}
              />
              {validationErrors.username && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.username}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                value={data.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={validationErrors.email ? "border-red-500" : ""}
              />
              {validationErrors.email && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={data.password}
                onChange={(e) => updateField("password", e.target.value)}
                className={validationErrors.password ? "border-red-500" : ""}
              />
              {validationErrors.password && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={data.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                className={validationErrors.confirmPassword ? "border-red-500" : ""}
              />
              {validationErrors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-start space-x-2 pt-4">
              <Checkbox
                id="consent"
                checked={data.dataPrivacyConsent}
                onCheckedChange={(checked) => updateField("dataPrivacyConsent", checked)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="consent"
                  className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${validationErrors.dataPrivacyConsent ? "text-red-500" : ""
                    }`}
                >
                  I agree to the Data Privacy Policy *
                </label>
                <p className="text-xs text-muted-foreground">
                  Your data (barangay, school) will be used for community fire safety analytics.
                  Individual information is kept confidential and only aggregated data is shared.
                </p>
              </div>
            </div>
            {validationErrors.dataPrivacyConsent && (
              <p className="text-sm text-red-500">{validationErrors.dataPrivacyConsent}</p>
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
                <div className="p-4 bg-orange-50 rounded-2xl border-2 border-orange-200">
                  <span className="inline-block text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full mb-2">
                    {questions[currentQuestionIndex].category}
                  </span>
                  <h3 className="text-base font-bold text-slate-800 mb-3">
                    {questions[currentQuestionIndex].question}
                  </h3>

                  <RadioGroup
                    value={data.preTestAnswers[questions[currentQuestionIndex].id]?.toString() || ""}
                    onValueChange={(value) => handleAnswerQuestion(questions[currentQuestionIndex].id, parseInt(value))}
                  >
                    {questions[currentQuestionIndex].options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 rounded-xl hover:bg-orange-100/60 border-2 border-transparent hover:border-orange-300 transition-all cursor-pointer">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} className="border-orange-400 text-orange-500" />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer font-medium">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Question Navigation */}
                <div className="flex justify-end mt-4 sm:mt-5">

                  {currentQuestionIndex === questions.length - 1 && (
                    <button
                      onClick={handleSubmit}
                      disabled={loading || Object.keys(data.preTestAnswers).length < questions.length}
                      className={`flex items-center gap-1 font-extrabold px-5 py-2 rounded-full border-[3px] transition-all text-sm ${
                        loading || Object.keys(data.preTestAnswers).length < questions.length
                          ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                          : "bg-green-500 text-white border-green-300 shadow-[0_4px_0_#166534] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#166534] active:translate-y-1 active:shadow-[0_0px_0_#166534]"
                      }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Complete Registration
                          <Check className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Question dots for quick navigation */}
                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-5 sm:mt-6">
                  {questions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-[10px] sm:text-[11px] font-bold transition-all border-2 ${
                        currentQuestionIndex === idx
                          ? "bg-orange-500 text-white border-orange-300 shadow-[0_3px_0_#c2410c] scale-110"
                          : data.preTestAnswers[q.id] !== undefined
                            ? "bg-green-400 text-white border-green-300 shadow-[0_2px_0_#166534]"
                            : "bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
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
              disabled={currentStep === 1}
              className={`flex items-center gap-1 font-bold px-5 py-2.5 rounded-full border-[3px] transition-all text-sm ${
                currentStep === 1
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-gray-300 text-slate-600 shadow-[0_3px_0_#94a3b8] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#94a3b8] active:translate-y-1 active:shadow-[0_0px_0_#94a3b8]"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1 bg-yellow-400 text-red-600 font-extrabold px-6 py-2.5 rounded-full border-[3px] border-white shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-[0_0px_0_#b45309] transition-all text-sm"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {currentStep === 4 && questions.length > 0 && (
          <div className="flex justify-start mt-6 sm:mt-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 font-bold px-5 py-2.5 rounded-full border-[3px] border-gray-300 text-slate-600 shadow-[0_3px_0_#94a3b8] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#94a3b8] active:translate-y-1 active:shadow-[0_0px_0_#94a3b8] transition-all text-sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Account
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
