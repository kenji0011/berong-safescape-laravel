"use client"

import { useState, useEffect, useRef } from "react"
import { Head, router } from '@inertiajs/react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Loader2, Shield, Star } from "lucide-react"
import { motion, AnimatePresence } from 'motion/react'
import { getScoreRating } from "@/lib/constants"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface AssessmentQuestion {
    id: number
    question: string
    options: string[]
    correctAnswer: number
    category: string
}

interface AssessmentProps {
    type: 'preTest' | 'postTest'
}

export default function Assessment({ type }: AssessmentProps) {
    const { user, isAuthenticated, refreshUser } = useAuth()
    const [questions, setQuestions] = useState<AssessmentQuestion[]>([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<number, number>>({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [result, setResult] = useState<{
        success: boolean
        score?: number
        maxScore?: number
    } | null>(null)
    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    const [showWarningModal, setShowWarningModal] = useState(() => {
        if (type === 'postTest') {
            const hasCompleted = user?.postTestScore !== undefined && user?.postTestScore !== null
            return !hasCompleted
        }
        return false
    })
    const [showRefreshWarning, setShowRefreshWarning] = useState(false)
    const [showEscapeWarning, setShowEscapeWarning] = useState(false)
    const answersRef = useRef<Record<number, number>>({})

    const isPreTest = type === 'preTest'
    const title = isPreTest ? "Pre-Test Assessment" : "Post-Test Assessment"
    const description = isPreTest 
        ? "Let's establish your baseline knowledge before you start learning."
        : "Show us what you've learned! This is your final assessment."
    const isTestStarted = !loading && questions.length > 0 && !result && !showWarningModal

    useEffect(() => {
        answersRef.current = answers
    }, [answers])

    // Auto Focus Mode and Fullscreen for Post-Test
    useEffect(() => {
        if (type === 'postTest' && !loading && questions.length > 0 && !result && !showWarningModal) {
            // Auto enter focus mode
            document.documentElement.classList.add("module-focus-mode")
            
            // Auto request fullscreen
            const enterFullscreen = () => {
                const docEl = document.documentElement
                if (docEl.requestFullscreen) {
                    docEl.requestFullscreen().catch(() => {})
                }
            }
            enterFullscreen()
        }

        return () => {
            document.documentElement.classList.remove("module-focus-mode")
        }
    }, [type, loading, questions.length, !!result, showWarningModal])

    // Countdown Timer (20 Minutes) for Post-Test
    useEffect(() => {
        if (type !== 'postTest' || loading || questions.length === 0 || result || showWarningModal) return

        // 20 minutes = 1200 seconds
        setTimeLeft(1200)

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null) return null
                if (prev <= 1) {
                    clearInterval(timer)
                    handleAutoSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [type, loading, questions.length, !!result, showWarningModal])

    // Prevent Refresh / Navigation when Test is in progress
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isTestStarted) {
                e.preventDefault()
                e.returnValue = "Are you sure you want to leave? Your progress on this assessment will be lost."
                return e.returnValue
            }
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload)
        }
    }, [isTestStarted])

    // Intercept F5 / Refresh keys and Escape key to block refresh/exiting and keep fullscreen active
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isTestStarted) return

            if (
                e.key === "F5" || 
                (e.ctrlKey && (e.key === "r" || e.key === "R")) || 
                (e.metaKey && (e.key === "r" || e.key === "R"))
            ) {
                e.preventDefault()
                setShowRefreshWarning(true)
            }

            if (e.key === "Escape" && type === "postTest") {
                e.preventDefault()
                setShowEscapeWarning(true)
                // Force fullscreen back if exited
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {})
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [isTestStarted, type])

    // Intercept fullscreenchange to prevent escaping fullscreen during Post-Test
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (isTestStarted && type === "postTest" && !document.fullscreenElement) {
                setShowEscapeWarning(true)
                // Instantly request fullscreen back
                const docEl = document.documentElement
                if (docEl.requestFullscreen) {
                    docEl.requestFullscreen().catch(() => {})
                }
            }
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange)
        }
    }, [isTestStarted, type])

    // Embedded feedback state
    const [feedbackRating, setFeedbackRating] = useState(0)
    const [feedbackHover, setFeedbackHover] = useState(0)
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
    const [feedbackSuccess, setFeedbackSuccess] = useState(false)
    const [feedbackComment, setFeedbackComment] = useState("")



    useEffect(() => {
        if (!isAuthenticated) return

        const fetchQuestions = async () => {
            try {
                setLoading(true)
                const role = (user?.age && user.age < 18) || user?.role === 'kid' ? "kid" : "adult"
                const response = await axios.get(`/api/assessments/questions?role=${role}&type=${type}`)
                if (response.status === 200) {
                    const fetchedQuestions = response.data.questions || []
                    setQuestions(fetchedQuestions)
                    
                    // If the user has already completed this assessment, show the results screen directly
                    const existingScore = isPreTest ? user?.preTestScore : user?.postTestScore
                    if (existingScore !== null && existingScore !== undefined) {
                        setResult({
                            success: true,
                            score: existingScore,
                            maxScore: fetchedQuestions.length
                        })
                        setShowWarningModal(false)
                    }
                } else {
                    setError("Failed to load assessment questions")
                }
            } catch (err) {
                setError("Failed to load assessment questions. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        fetchQuestions()
    }, [isAuthenticated, user, type])

    const handleAnswerQuestion = (questionId: number, answerIndex: number) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answerIndex
        }))

        // Auto-advance to the next question
        if (currentQuestionIndex < questions.length - 1) {
            setTimeout(() => {
                setCurrentQuestionIndex(prev => {
                    if (questions[prev]?.id === questionId) {
                        return prev + 1
                    }
                    return prev
                })
            }, 500)
        }
    }

    const submitAssessment = async (currentAnswers: Record<number, number>) => {
        setSubmitting(true)
        setError("")

        try {
            // Format answers for the API, default to "-1" for unanswered ones
            const formattedAnswers = questions.map(q => ({
                questionId: q.id,
                selectedAnswer: currentAnswers[q.id] !== undefined ? String(currentAnswers[q.id]) : "-1"
            }))

            const endpoint = isPreTest ? "/api/assessments/pre-test" : "/api/assessments/post-test"
            const response = await axios.post(endpoint, { answers: formattedAnswers })

            if (response.status === 200) {
                // Play win sound
                new Audio('/sounds/win.mp3').play().catch(e => console.warn("Audio playback failed:", e));

                // Refresh the global user state
                await refreshUser()
                
                setResult({
                    success: true,
                    score: response.data.score,
                    maxScore: response.data.maxScore
                })

                // Turn off Focus Mode
                document.documentElement.classList.remove("module-focus-mode")
                if (document.fullscreenElement && document.exitFullscreen) {
                    document.exitFullscreen().catch(() => {})
                }
            } else {
                setError("Failed to submit assessment")
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Submission failed. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    const handleAutoSubmit = () => {
        submitAssessment(answersRef.current)
    }

    const handleSubmit = async () => {
        // Validate all questions answered
        if (Object.keys(answers).length < questions.length) {
            setError("Please answer all questions before submitting.")
            return
        }
        await submitAssessment(answers)
    }

    const handleFeedbackSubmit = async () => {
        if (feedbackRating === 0) return
        setFeedbackSubmitting(true)
        try {
            await axios.post('/api/feedback', {
                featureName: isPreTest ? 'Pre-Test Assessment' : 'Post-Test Assessment',
                featureType: 'quiz',
                rating: feedbackRating,
                comments: feedbackComment
            })
            setFeedbackSuccess(true)
        } catch(err) {
            console.error('Failed to submit post-test feedback', err)
        } finally {
            setFeedbackSubmitting(false)
        }
    }

    const handleContinue = () => {
        if (user?.role === "kid") router.visit("/kids/safescape")
        else if (user?.role === "adult") router.visit("/adult")
        else router.visit("/")
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center p-8">
                    <Shield className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Login Required</h2>
                    <p className="text-slate-600 mb-6">You must be logged in to take this assessment.</p>
                    <Button onClick={() => router.visit('/login')} className="w-full">Go to Login</Button>
                </Card>
            </div>
        )
    }

    // Results View
    if (result?.success) {
        const percentage = result.maxScore ? Math.round((result.score! / result.maxScore) * 100) : 0
        const rating = getScoreRating(percentage)

        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 sm:py-12 px-3 sm:px-4 selection:bg-orange-500 selection:text-white transition-colors duration-500">
                <Head title={`${title} Results - SafeScape`} />
                <Card className="w-full max-w-3xl mx-auto border-[3px] sm:border-[4px] border-slate-200 dark:border-slate-800 shadow-[0_6px_0_#e2e8f0] sm:shadow-[0_8px_0_#e2e8f0] dark:shadow-[0_6px_0_#0f172a] sm:dark:shadow-[0_8px_0_#0f172a] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden p-0 bg-white dark:bg-slate-900">
                    <div className="bg-red-600 p-4 sm:p-6 text-center border-b-[3px] sm:border-b-[5px] border-orange-600 relative overflow-hidden">
                        {/* Decorative background pattern - hidden on very small screens */}
                        <div className="absolute inset-0 opacity-10 hidden sm:flex flex-wrap gap-4 pointer-events-none p-4">
                            {[...Array(12)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 text-white rotate-12" fill="currentColor" />
                            ))}
                        </div>
                        
                        <motion.div 
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mb-2 sm:mb-3 shadow-[0_3px_0_rgba(0,0,0,0.15)] sm:shadow-[0_5px_0_rgba(0,0,0,0.15)] border-[2.5px] sm:border-[4px] border-white relative z-10"
                        >
                            <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" strokeWidth={5} />
                        </motion.div>
                        <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight drop-shadow-md relative z-10 italic uppercase">
                            Assessment <span className="text-yellow-300">Complete!</span>
                        </h2>
                        <p className="text-white/90 text-[9px] sm:text-xs font-black mt-0.5 uppercase tracking-[0.08em] sm:tracking-[0.15em] relative z-10">{title}</p>
                    </div>
                    
                    <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-5 items-stretch">
                            {/* Score Box - 2/5 width */}
                            <div className="md:col-span-2 text-center p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-[1.25rem] sm:rounded-3xl border-[2.5px] sm:border-[4px] border-slate-100 dark:border-slate-700 shadow-[0_4px_0_#f1f5f9] sm:shadow-[0_6px_0_#f1f5f9] dark:shadow-[0_4px_0_#0f172a] sm:dark:shadow-[0_4px_0_#0f172a] flex flex-col justify-center relative overflow-hidden transition-colors">
                                {/* Subtle decorative bg */}
                                <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 dark:bg-slate-700 rounded-full -mr-10 -mt-10 sm:-mr-12 sm:-mt-12"></div>
                                
                                <p className="text-[9px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mb-1 sm:mb-2 relative z-10">Final Score</p>
                                <div className="text-4xl sm:text-6xl font-black mb-1 sm:mb-2 drop-shadow-sm flex items-center justify-center gap-1 relative z-10" style={{ color: rating.color }}>
                                    {result.score} <span className="text-slate-200 dark:text-slate-700 text-xl sm:text-3xl">/</span> {result.maxScore}
                                </div>
                                <div className={`inline-block px-3 sm:px-5 py-0.5 sm:py-1 rounded-full text-xs sm:text-lg font-black uppercase tracking-wider mb-2 border-2 mx-auto relative z-10`} style={{ backgroundColor: `${rating.color}15`, color: rating.color, borderColor: `${rating.color}30` }}>
                                    {rating.label}
                                </div>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold max-w-[200px] mx-auto leading-tight sm:leading-snug relative z-10">
                                    {isPreTest 
                                        ? "This is your baseline score. Let's start learning!" 
                                        : "You're a safety hero!"}
                                </p>
                            </div>

                            {/* Feedback Section - 3/5 width */}
                            <div className="md:col-span-3">
                                {!isPreTest ? (
                                    <div className="bg-white dark:bg-slate-800 border-[2.5px] sm:border-[4px] border-slate-100 dark:border-slate-700 rounded-[1.25rem] sm:rounded-3xl p-4 sm:p-6 text-center h-full shadow-[0_4px_0_#f1f5f9] sm:shadow-[0_6px_0_#f1f5f9] dark:shadow-[0_4px_0_#0f172a] sm:dark:shadow-[0_4px_0_#0f172a] relative overflow-hidden flex flex-col justify-center transition-colors">
                                        {feedbackSuccess ? (
                                            <div className="flex flex-col items-center py-2 sm:py-4">
                                                <div className="w-10 h-10 sm:w-16 sm:h-16 bg-green-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mb-3 border-4 border-green-200 dark:border-emerald-900/30 shadow-inner">
                                                    <Check className="h-5 w-5 sm:h-8 sm:w-8 text-green-500" strokeWidth={5} />
                                                </div>
                                                <h3 className="text-base sm:text-xl font-black text-slate-800 dark:text-white mb-1">Thank You!</h3>
                                                <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">Your feedback helps!</p>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="text-base sm:text-xl font-black text-slate-800 dark:text-white mb-1">Help Us Improve</h3>
                                                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 sm:mb-3">Rate your Experience</p>
                                                
                                                <div className="flex justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 bg-slate-50 dark:bg-slate-900 py-1.5 sm:py-3 rounded-2xl sm:rounded-3xl border-2 border-slate-100 dark:border-slate-700 w-fit mx-auto px-3 sm:px-6 shadow-inner">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            onClick={() => !feedbackSubmitting && setFeedbackRating(star)}
                                                            onMouseEnter={() => !feedbackSubmitting && setFeedbackHover(star)}
                                                            onMouseLeave={() => !feedbackSubmitting && setFeedbackHover(0)}
                                                            className="p-0.5 transition-transform hover:scale-125 hover:-translate-y-1 active:scale-90 outline-none"
                                                        >
                                                            <Star 
                                                                className={`h-5 w-5 sm:h-8 sm:h-8 transition-colors ${
                                                                    (feedbackHover || feedbackRating) >= star 
                                                                        ? "text-yellow-400 fill-yellow-400 drop-shadow-sm" 
                                                                        : "text-slate-200 dark:text-slate-700 fill-slate-100 dark:fill-slate-800"
                                                                }`} 
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                                
                                                {feedbackRating > 0 && (
                                                    <div className="mt-2 space-y-2 sm:space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                                                        <textarea
                                                            className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-2.5 sm:p-3 focus:outline-none focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all resize-none font-bold text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-inner"
                                                            rows={1}
                                                            placeholder="Any thoughts?"
                                                            value={feedbackComment}
                                                            onChange={(e) => setFeedbackComment(e.target.value)}
                                                            disabled={feedbackSubmitting}
                                                        />
                                                        <Button 
                                                            onClick={handleFeedbackSubmit}
                                                            disabled={feedbackSubmitting}
                                                            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full font-black text-xs sm:text-sm py-2.5 sm:py-5 shadow-[0_3px_0_#1e40af] sm:shadow-[0_5px_0_#1e40af] active:translate-y-[3px] sm:active:translate-y-[5px] active:shadow-none transition-all flex items-center justify-center gap-2 border-[2px] sm:border-[3px] border-blue-700"
                                                        >
                                                            {feedbackSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Submit"}
                                                        </Button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border-[2.5px] sm:border-[4px] border-blue-100 dark:border-blue-800 rounded-[1.25rem] sm:rounded-3xl p-4 sm:p-6 text-center h-full shadow-[0_4px_0_#dbeafe] sm:shadow-[0_6px_0_#dbeafe] dark:shadow-[0_4px_0_#0f172a] sm:dark:shadow-[0_4px_0_#0f172a] flex flex-col justify-center items-center text-blue-800 dark:text-blue-300 transition-colors">
                                        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                                            <Shield className="w-5 h-5 sm:w-7 sm:h-7 text-blue-500" />
                                        </div>
                                        <h3 className="text-base sm:text-xl font-black mb-1 italic">Ready to Learn?</h3>
                                        <p className="text-xs sm:text-sm font-bold opacity-80 leading-tight">Complete modules and earn your badge!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-2 sm:pt-4 max-w-xl mx-auto w-full">
                            <Button 
                                onClick={handleContinue}
                                className="w-full bg-yellow-400 hover:bg-yellow-300 text-red-700 font-black py-3 sm:py-5 rounded-full text-sm sm:text-lg border-[2.5px] sm:border-[4px] border-yellow-500 shadow-[0_3px_0_#ca8a04] sm:shadow-[0_6px_0_#ca8a04] active:translate-y-[3px] sm:active:translate-y-[6px] active:shadow-none transition-all flex items-center justify-center gap-2 uppercase tracking-tight"
                            >
                                {isPreTest ? "Start" : "Return to Dashboard"}
                                <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 stroke-[3]" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-[100dvh] bg-background p-3 sm:p-6 lg:p-8 flex flex-col justify-center transition-colors duration-500 selection:bg-orange-500 selection:text-white">
            <Head title={`${title} - SafeScape`} />
            
            {/* Post-Test Warning Modal */}
            {showWarningModal && (
                <div className="fixed inset-0 z-[300] bg-slate-950/85 backdrop-blur-md overflow-y-auto flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border-[3px] sm:border-[4px] border-[#ff4b3e] rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-10 max-w-lg w-full text-center shadow-2xl space-y-4 sm:space-y-6 select-none my-auto">
                        <div className="inline-flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center bg-red-50 dark:bg-red-950/30 rounded-xl sm:rounded-2xl border-2 border-red-100 dark:border-red-900 mb-1 sm:mb-2">
                            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-[#ff4b3e]" strokeWidth={2.5} />
                        </div>
                        
                        <div className="space-y-1 sm:space-y-2">
                            <h2 className="text-xl sm:text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                Final Post-Test Notice
                            </h2>
                            <p className="text-[11px] sm:text-sm font-bold text-slate-500 dark:text-slate-400">
                                Please review these critical rules before beginning your final assessment.
                            </p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-left space-y-2.5 sm:space-y-3.5 shadow-inner">
                            <div className="flex gap-2.5 sm:gap-3">
                                <span className="text-sm sm:text-lg shrink-0 mt-0.5">⏱️</span>
                                <p className="text-[11px] sm:text-sm font-bold text-slate-700 dark:text-slate-300 leading-normal">
                                    <strong className="text-slate-900 dark:text-white">20-Minute Time Limit:</strong> You have exactly 20 minutes to complete the test. Once started, the countdown cannot be paused.
                                </p>
                            </div>
                            
                            <div className="flex gap-2.5 sm:gap-3">
                                <span className="text-sm sm:text-lg shrink-0 mt-0.5">🚫</span>
                                <p className="text-[11px] sm:text-sm font-bold text-slate-700 dark:text-slate-300 leading-normal">
                                    <strong className="text-slate-900 dark:text-white">No Review Backtracking:</strong> You cannot turn back or review module lessons once you begin taking this assessment.
                                </p>
                            </div>

                            <div className="flex gap-2.5 sm:gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                                <span className="text-sm sm:text-lg shrink-0 mt-0.5">❓</span>
                                <p className="text-[11px] sm:text-sm font-bold text-[#ff4b3e] dark:text-red-400 leading-normal">
                                    <strong>Have you thoroughly reviewed</strong> all fire safety lessons and materials before starting?
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                            <Button
                                onClick={() => handleContinue()}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-black py-3 sm:py-5 rounded-full border-[2.5px] sm:border-[3px] border-slate-200 dark:border-slate-700 shadow-[0_3px_0_#cbd5e1] sm:shadow-[0_4px_0_#cbd5e1] dark:shadow-[0_3px_0_#0f172a] sm:dark:shadow-[0_4px_0_#0f172a] active:translate-y-[3px] sm:active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-wider text-[11px] sm:text-sm"
                            >
                                No, Go Back
                            </Button>
                            <Button
                                onClick={() => setShowWarningModal(false)}
                                className="flex-1 bg-[#ff4b3e] hover:bg-[#e03a2f] text-white font-black py-3 sm:py-5 rounded-full border-[2.5px] sm:border-[3px] border-red-700 shadow-[0_3px_0_#b91c1c] sm:shadow-[0_4px_0_#b91c1c] active:translate-y-[3px] sm:active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-wider text-[11px] sm:text-sm flex items-center justify-center gap-1.5"
                            >
                                Yes, I am Ready!
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Custom F5 Refresh Warning Modal */}
            {showRefreshWarning && (
                <div className="fixed inset-0 z-[400] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border-[3px] sm:border-[4px] border-amber-500 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 max-w-md w-full text-center shadow-2xl space-y-4 sm:space-y-5 select-none my-auto">
                        <div className="inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center bg-amber-50 dark:bg-amber-950/30 rounded-xl sm:rounded-2xl border-2 border-amber-250 dark:border-amber-900/50">
                            <span className="text-xl sm:text-2xl">⚠️</span>
                        </div>
                        
                        <div className="space-y-1 sm:space-y-1.5">
                            <h3 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                Refresh Disabled
                            </h3>
                            <p className="text-[11px] sm:text-sm font-bold text-slate-500 dark:text-slate-400 leading-normal">
                                Refreshing is disabled to protect your active assessment progress. Please complete your questions and submit.
                            </p>
                        </div>

                        <Button
                            onClick={() => setShowRefreshWarning(false)}
                            className="w-full bg-amber-500 hover:bg-amber-400 text-white font-black py-2.5 sm:py-3.5 rounded-full border-[2.5px] sm:border-[3px] border-amber-600 shadow-[0_3px_0_#d97706] sm:shadow-[0_4px_0_#d97706] active:translate-y-[3px] sm:active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-wider text-xs sm:text-sm"
                        >
                            Return to Test
                        </Button>
                    </div>
                </div>
            )}
            
            {/* Custom ESC Escape Warning Modal */}
            {showEscapeWarning && (
                <div className="fixed inset-0 z-[400] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border-[3px] sm:border-[4px] border-red-500 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 max-w-md w-full text-center shadow-2xl space-y-4 sm:space-y-5 select-none my-auto">
                        <div className="inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center bg-red-50 dark:bg-red-950/30 rounded-xl sm:rounded-2xl border-2 border-red-100 dark:border-red-900 mb-1 sm:mb-2">
                            <span className="text-xl sm:text-2xl">🚫</span>
                        </div>
                        
                        <div className="space-y-1 sm:space-y-1.5">
                            <h3 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                Fullscreen Required
                            </h3>
                            <p className="text-[11px] sm:text-sm font-bold text-slate-500 dark:text-slate-400 leading-normal">
                                Exiting fullscreen mode is disabled during the Post-Test to keep you in focus. Please complete your questions inside fullscreen mode.
                            </p>
                        </div>

                        <Button
                            onClick={() => {
                                setShowEscapeWarning(false)
                                if (!document.fullscreenElement) {
                                    document.documentElement.requestFullscreen().catch(() => {})
                                }
                            }}
                            className="w-full bg-red-500 hover:bg-red-400 text-white font-black py-2.5 sm:py-3.5 rounded-full border-[2.5px] sm:border-[3px] border-red-600 shadow-[0_3px_0_#dc2626] sm:shadow-[0_4px_0_#dc2626] active:translate-y-[3px] sm:active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-wider text-xs sm:text-sm"
                        >
                            Return to Fullscreen
                        </Button>
                    </div>
                </div>
            )}
            
            <div className="max-w-3xl mx-auto mb-4 md:mb-6 flex items-center gap-3 md:gap-4 w-full shrink-0">
                {!isTestStarted && (
                    <button 
                        onClick={handleContinue}
                        className="h-9 w-9 sm:h-12 sm:w-12 bg-white dark:bg-slate-800 rounded-full border-2 border-slate-200 dark:border-slate-700 border-b-[4px] active:border-b-2 active:translate-y-[2px] shadow-sm flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4 sm:h-6 sm:w-6 text-slate-700 dark:text-slate-300" strokeWidth={3} />
                    </button>
                )}
                <div>
                    <h1 className="text-xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">{title}</h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">{description}</p>
                </div>
            </div>

            <Card className="w-full max-w-2xl mx-auto flex flex-col min-h-0 border-[3px] md:border-[4px] border-slate-200 dark:border-slate-800 shadow-[0_6px_0_#e2e8f0] dark:shadow-[0_6px_0_#0f172a] md:shadow-[0_8px_0_#e2e8f0] md:dark:shadow-[0_8px_0_#0f172a] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-500">
                {loading ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-12 md:py-24">
                        <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-orange-500 mb-4" />
                        <span className="text-slate-600 dark:text-slate-400 font-bold text-sm md:text-base">Loading questions...</span>
                    </div>
                ) : questions.length === 0 ? (
                    <div className="text-center flex-1 flex flex-col justify-center items-center py-12 md:py-24 px-4">
                        <Shield className="h-10 w-10 md:h-12 md:w-12 text-slate-300 dark:text-slate-700 mb-4" />
                        <h2 className="text-lg md:text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Questions Found</h2>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-6">We couldn't find any questions for this assessment.</p>
                        <Button onClick={() => router.visit('/')} variant="outline" className="border-2 rounded-full font-bold h-9 md:h-10 dark:border-slate-700 dark:text-slate-300">
                            Return Home
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Progress Header */}
                        <div className="bg-slate-50 dark:bg-slate-900/80 px-4 py-3 sm:px-5 md:px-6 md:pb-5 md:pt-6 border-b-[3px] border-slate-100 dark:border-slate-800 shrink-0">
                            <div className="flex flex-wrap justify-between items-center mb-2.5 md:mb-4 gap-2">
                                <span className="font-black text-slate-500 dark:text-slate-400 text-sm sm:text-base uppercase tracking-wider">
                                    Question {currentQuestionIndex + 1} of {questions.length}
                                </span>
                                <div className="flex items-center gap-1.5 md:gap-2">
                                    {timeLeft !== null && (
                                        <span className={cn(
                                            "font-black px-2.5 py-1 rounded-full text-sm sm:text-base border flex items-center gap-1 transition-all",
                                            timeLeft < 120 
                                                ? "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-900 text-red-655 dark:text-red-400"
                                                : "bg-amber-50 dark:bg-amber-950/30 border-amber-250 dark:border-amber-900/50 text-amber-600 dark:text-amber-400"
                                        )}>
                                            ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60) < 10 ? '0' : ''}{timeLeft % 60}
                                        </span>
                                    )}
                                    <span className="font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2.5 py-1 rounded-full text-sm sm:text-base border border-green-200 dark:border-green-900/50">
                                        {Math.round(((currentQuestionIndex) / questions.length) * 100)}% Completed
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 md:h-4 overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-inner">
                                <div
                                    className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Question Content */}
                        <CardContent className="p-4 sm:p-5 md:p-8 pt-3 sm:pt-4 bg-white dark:bg-slate-900 flex flex-col justify-start">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900/30 rounded-2xl flex items-start gap-3">
                                    <Shield className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-red-700 dark:text-red-400 font-bold">{error}</p>
                                </div>
                            )}

                            <div className="mb-4 md:mb-6 p-4 sm:p-5 md:p-6 bg-gradient-to-br from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 rounded-[1rem] md:rounded-[1.5rem] border-[2.5px] md:border-[3px] border-orange-600 dark:border-orange-800 shadow-[0_3px_0_#c2410c] md:shadow-[0_4px_0_#c2410c] relative mt-3 md:mt-2 shrink-0">
                                <span className="absolute -top-3 md:-top-4 left-4 md:left-6 px-2.5 py-0.5 md:px-3 md:py-1 bg-yellow-400 text-orange-800 font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-full border-[1.5px] md:border-[2px] border-yellow-500 shadow-sm">
                                    {questions[currentQuestionIndex].category}
                                </span>
                                <h3 className="text-base sm:text-lg md:text-xl font-black text-white leading-snug mt-1 drop-shadow-sm">
                                    {questions[currentQuestionIndex].question}
                                </h3>
                            </div>

                            <RadioGroup
                                key={questions[currentQuestionIndex].id}
                                value={answers[questions[currentQuestionIndex].id]?.toString() || ""}
                                onValueChange={(value) => handleAnswerQuestion(questions[currentQuestionIndex].id, parseInt(value))}
                                className="space-y-2.5 md:space-y-4"
                            >
                                {questions[currentQuestionIndex].options.map((option, index) => {
                                    const isSelected = answers[questions[currentQuestionIndex].id] === index
                                    return (
                                        <div 
                                            key={`${questions[currentQuestionIndex].id}-${index}`} 
                                            className={`
                                                flex items-center p-3 md:p-4 rounded-xl md:rounded-2xl border-[2px] md:border-[3px] transition-all cursor-pointer group outline-none focus:outline-none
                                                ${isSelected 
                                                    ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500 dark:border-yellow-600 shadow-[0_3px_0_#eab308] dark:shadow-[0_4px_0_#ca8a04] -translate-y-[2px] md:-translate-y-1' 
                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-[0_3px_0_#e2e8f0] dark:shadow-[0_4px_0_#0f172a] md:hover:border-orange-300 dark:md:hover:border-orange-700 md:hover:bg-orange-50 dark:md:hover:bg-slate-700/50 md:hover:-translate-y-1 md:hover:shadow-[0_4px_0_#fed7aa] dark:md:hover:shadow-[0_4px_0_#431407] active:shadow-none active:translate-y-[2px]'
                                                }
                                            `}
                                            onClick={() => handleAnswerQuestion(questions[currentQuestionIndex].id, index)}
                                        >
                                            <RadioGroupItem 
                                                value={index.toString()} 
                                                id={`q-${questions[currentQuestionIndex].id}-opt-${index}`} 
                                                className="hidden"
                                            />
                                            <Label 
                                                htmlFor={`q-${questions[currentQuestionIndex].id}-opt-${index}`}
                                                className={`text-sm sm:text-base font-black cursor-pointer w-full leading-snug ${
                                                    isSelected ? 'text-yellow-800 dark:text-yellow-500' : 'text-slate-700 dark:text-slate-300 md:group-hover:text-slate-900 dark:md:group-hover:text-white'
                                                }`}
                                            >
                                                {option}
                                            </Label>
                                        </div>
                                    )
                                })}
                            </RadioGroup>
                        </CardContent>

                        {/* Navigation Footer */}
                        <div className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/50">
                            <Button 
                                variant="outline" 
                                disabled={currentQuestionIndex === 0 || submitting} 
                                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                                className={`rounded-full font-black px-4 md:px-5 border-[2px] active:translate-y-[2px] transition-all shadow-[0_2px_0_#cbd5e1] dark:shadow-[0_2px_0_#0f172a] active:shadow-none h-9 md:h-10 text-xs md:text-sm ${
                                    currentQuestionIndex === 0 || submitting ? 'opacity-50 border-slate-200 dark:border-slate-700 shadow-none' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                                }`}
                            >
                                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 mr-1" /> Back
                            </Button>

                            {currentQuestionIndex === questions.length - 1 ? (
                                <Button 
                                    onClick={handleSubmit} 
                                    disabled={submitting || answers[questions[currentQuestionIndex].id] === undefined}
                                    className={`rounded-full font-black px-4 md:px-6 py-2 md:py-5 text-xs md:text-base border-2 transition-all text-white relative h-9 md:h-auto ${
                                        answers[questions[currentQuestionIndex].id] === undefined
                                            ? 'bg-slate-300 dark:bg-slate-700 border-slate-400 dark:border-slate-600 opacity-50 cursor-not-allowed'
                                            : 'bg-green-500 hover:bg-green-400 dark:bg-emerald-600 dark:hover:bg-emerald-500 border-green-600 dark:border-emerald-700 shadow-[0_3px_0_#16a34a] md:shadow-[0_4px_0_#16a34a] active:shadow-none active:translate-y-[2px] md:active:translate-y-[4px]'
                                    }`}
                                >
                                    {submitting ? (
                                        <><Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin mr-1 md:mr-2" /> Submitting...</>
                                    ) : (
                                        <><Check className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" strokeWidth={4} /> Submit</>
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                    disabled={answers[questions[currentQuestionIndex].id] === undefined}
                                    className={`rounded-full font-black px-4 md:px-5 border-[2px] active:translate-y-[2px] transition-all shadow-[0_2px_0_#cbd5e1] dark:shadow-[0_2px_0_#0f172a] active:shadow-none h-9 md:h-10 text-xs md:text-sm ${
                                        answers[questions[currentQuestionIndex].id] === undefined
                                            ? 'opacity-50 border-slate-200 dark:border-slate-700 shadow-none'
                                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                                    }`}
                                >
                                    Next <ChevronRight className="h-4 w-4 md:h-5 md:w-5 ml-1" />
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </Card>
        </div>
    )
}
