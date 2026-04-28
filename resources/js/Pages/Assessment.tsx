"use client"

import { useState, useEffect } from "react"
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

    // Embedded feedback state
    const [feedbackRating, setFeedbackRating] = useState(0)
    const [feedbackHover, setFeedbackHover] = useState(0)
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
    const [feedbackSuccess, setFeedbackSuccess] = useState(false)
    const [feedbackComment, setFeedbackComment] = useState("")

    const isPreTest = type === 'preTest'
    const title = isPreTest ? "Pre-Test Assessment" : "Post-Test Assessment"
    const description = isPreTest 
        ? "Let's establish your baseline knowledge before you start learning."
        : "Show us what you've learned! This is your final assessment."

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

    const handleSubmit = async () => {
        // Validate all questions answered
        if (Object.keys(answers).length < questions.length) {
            setError("Please answer all questions before submitting.")
            return
        }

        setSubmitting(true)
        setError("")

        try {
            // Format answers for the API
            const formattedAnswers = Object.entries(answers).map(([qId, ansIdx]) => ({
                questionId: parseInt(qId),
                selectedAnswer: ansIdx
            }))

            const endpoint = isPreTest ? "/api/assessments/pre-test" : "/api/assessments/post-test"
            const response = await axios.post(endpoint, { answers: formattedAnswers })

            if (response.status === 200) {
                // Refresh the global user state to ensure scores are updated in auth-context
                await refreshUser()
                
                setResult({
                    success: true,
                    score: response.data.score,
                    maxScore: response.data.maxScore
                })
            } else {
                setError("Failed to submit assessment")
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Submission failed. Please try again.")
        } finally {
            setSubmitting(false)
        }
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
        if (user?.role === "kid") router.visit("/kids")
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
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 selection:bg-orange-500 selection:text-white transition-colors duration-500">
                <Head title={`${title} Results - SafeScape`} />
                <Card className="w-full max-w-3xl mx-auto border-[4px] border-slate-200 dark:border-slate-800 shadow-[0_8px_0_#e2e8f0] dark:shadow-[0_8px_0_#0f172a] rounded-[2rem] overflow-hidden p-0 bg-white dark:bg-slate-900">
                    <div className="bg-gradient-to-br from-[#ff4b3e] via-[#ff6b35] to-[#ff8c00] p-4 sm:p-6 text-center border-b-[4px] sm:border-b-[5px] border-orange-600 relative overflow-hidden">
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
                            className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mb-2 sm:mb-3 shadow-[0_4px_0_rgba(0,0,0,0.15)] sm:shadow-[0_5px_0_rgba(0,0,0,0.15)] border-[3px] sm:border-[4px] border-white relative z-10"
                        >
                            <Check className="w-7 h-7 sm:w-8 sm:h-8 text-green-500" strokeWidth={5} />
                        </motion.div>
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md relative z-10 italic uppercase">
                            Assessment <span className="text-yellow-300">Complete!</span>
                        </h2>
                        <p className="text-white/90 text-[10px] sm:text-xs font-black mt-0.5 uppercase tracking-[0.1em] sm:tracking-[0.15em] relative z-10">{title}</p>
                    </div>
                    
                    <CardContent className="p-5 sm:p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-stretch">
                            {/* Score Box - 2/5 width */}
                            <div className="md:col-span-2 text-center p-5 sm:p-6 bg-white dark:bg-slate-800 rounded-3xl border-[3px] sm:border-[4px] border-slate-100 dark:border-slate-700 shadow-[0_6px_0_#f1f5f9] dark:shadow-[0_6px_0_#0f172a] flex flex-col justify-center relative overflow-hidden transition-colors">
                                {/* Subtle decorative bg */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 dark:bg-slate-700 rounded-full blur-3xl -mr-12 -mt-12"></div>
                                
                                <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mb-1 sm:mb-2 relative z-10">Final Score</p>
                                <div className="text-5xl sm:text-6xl font-black mb-1 sm:mb-2 drop-shadow-sm flex items-center justify-center gap-1 relative z-10" style={{ color: rating.color }}>
                                    {result.score} <span className="text-slate-200 dark:text-slate-700 text-2xl sm:text-3xl">/</span> {result.maxScore}
                                </div>
                                <div className={`inline-block px-4 sm:px-5 py-1 rounded-full text-sm sm:text-lg font-black uppercase tracking-wider mb-2 border-2 mx-auto relative z-10`} style={{ backgroundColor: `${rating.color}15`, color: rating.color, borderColor: `${rating.color}30` }}>
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
                                    <div className="bg-white dark:bg-slate-800 border-[3px] sm:border-[4px] border-slate-100 dark:border-slate-700 rounded-3xl p-5 sm:p-6 text-center h-full shadow-[0_6px_0_#f1f5f9] dark:shadow-[0_6px_0_#0f172a] relative overflow-hidden flex flex-col justify-center transition-colors">
                                        {feedbackSuccess ? (
                                            <div className="flex flex-col items-center py-2 sm:py-4">
                                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mb-3 border-4 border-green-200 dark:border-emerald-900/30 shadow-inner">
                                                    <Check className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" strokeWidth={5} />
                                                </div>
                                                <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white mb-1">Thank You!</h3>
                                                <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">Your feedback helps!</p>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white mb-1">Help Us Improve</h3>
                                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Rate your Experience</p>
                                                
                                                <div className="flex justify-center gap-2 mb-4 bg-slate-50 dark:bg-slate-900 py-2 sm:py-3 rounded-2xl sm:rounded-3xl border-2 border-slate-100 dark:border-slate-700 w-fit mx-auto px-4 sm:px-6 shadow-inner">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            onClick={() => !feedbackSubmitting && setFeedbackRating(star)}
                                                            onMouseEnter={() => !feedbackSubmitting && setFeedbackHover(star)}
                                                            onMouseLeave={() => !feedbackSubmitting && setFeedbackHover(0)}
                                                            className="p-1 transition-transform hover:scale-125 hover:-translate-y-1 active:scale-90 outline-none"
                                                        >
                                                            <Star 
                                                                className={`h-6 w-6 sm:h-8 sm:w-8 transition-colors ${
                                                                    (feedbackHover || feedbackRating) >= star 
                                                                        ? "text-yellow-400 fill-yellow-400 drop-shadow-sm" 
                                                                        : "text-slate-200 dark:text-slate-700 fill-slate-100 dark:fill-slate-800"
                                                                }`} 
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                                
                                                {feedbackRating > 0 && (
                                                    <div className="mt-2 space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                                                        <textarea
                                                            className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all resize-none font-bold text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-inner"
                                                            rows={1}
                                                            placeholder="Any thoughts?"
                                                            value={feedbackComment}
                                                            onChange={(e) => setFeedbackComment(e.target.value)}
                                                            disabled={feedbackSubmitting}
                                                        />
                                                        <Button 
                                                            onClick={handleFeedbackSubmit}
                                                            disabled={feedbackSubmitting}
                                                            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full font-black text-xs sm:text-sm py-3 sm:py-5 shadow-[0_4px_0_#1e40af] sm:shadow-[0_5px_0_#1e40af] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 border-[2px] sm:border-[3px] border-blue-700"
                                                        >
                                                            {feedbackSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                                                        </Button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border-[3px] sm:border-[4px] border-blue-100 dark:border-blue-800 rounded-3xl p-5 sm:p-6 text-center h-full shadow-[0_6px_0_#dbeafe] dark:shadow-[0_6px_0_#0f172a] flex flex-col justify-center items-center text-blue-800 dark:text-blue-300 transition-colors">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                                            <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500" />
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-black mb-1 italic">Ready to Learn?</h3>
                                        <p className="text-xs sm:text-sm font-bold opacity-80 leading-tight">Complete modules and earn your badge!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-2 sm:pt-4 max-w-xl mx-auto w-full">
                            <Button 
                                onClick={handleContinue}
                                className="w-full bg-yellow-400 hover:bg-yellow-300 text-red-700 font-black py-4 sm:py-5 rounded-full text-base sm:text-lg border-[3px] sm:border-[4px] border-yellow-500 shadow-[0_4px_0_#ca8a04] sm:shadow-[0_6px_0_#ca8a04] active:translate-y-[4px] sm:active:translate-y-[6px] active:shadow-none transition-all flex items-center justify-center gap-2 uppercase tracking-tight"
                            >
                                {isPreTest ? "Start" : "Return to Dashboard"}
                                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 stroke-[3]" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-blue-50 dark:bg-slate-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-500 selection:bg-orange-500 selection:text-white">
            <Head title={`${title} - SafeScape`} />
            
            <div className="max-w-3xl mx-auto mb-6 flex items-center gap-4">
                <button 
                    onClick={() => router.visit('/')}
                    className="h-10 w-10 sm:h-12 sm:w-12 bg-white dark:bg-slate-800 rounded-full border-2 border-slate-200 dark:border-slate-700 border-b-[4px] active:border-b-2 active:translate-y-[2px] shadow-sm flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shrink-0"
                >
                    <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700 dark:text-slate-300" strokeWidth={3} />
                </button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">{title}</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{description}</p>
                </div>
            </div>

            <Card className="max-w-2xl mx-auto border-[4px] border-blue-200 dark:border-blue-900 shadow-[0_8px_0_#bfdbfe] dark:shadow-[0_8px_0_#1e3a8a] rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-500">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
                        <span className="text-slate-600 dark:text-slate-400 font-bold">Loading questions...</span>
                    </div>
                ) : questions.length === 0 ? (
                    <div className="text-center py-24 px-4">
                        <Shield className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Questions Found</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">We couldn't find any questions for this assessment.</p>
                        <Button onClick={() => router.visit('/')} variant="outline" className="border-2 rounded-full font-bold dark:border-slate-700 dark:text-slate-300">
                            Return Home
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Progress Header */}
                        <div className="bg-white dark:bg-slate-900 px-6 pb-4 pt-6 border-b-2 border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-bold text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                                    Question {currentQuestionIndex + 1} of {questions.length}
                                </span>
                                <span className="font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/30 px-3 py-1 rounded-full text-xs">
                                    {Math.round(((currentQuestionIndex) / questions.length) * 100)}% Completed
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-inner">
                                <div
                                    className="bg-green-500 h-4 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Question Content */}
                        <CardContent className="p-4 sm:p-8 pt-2 sm:pt-4 bg-white dark:bg-slate-900">
                            {error && (
                                <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900/30 rounded-2xl flex items-start gap-3">
                                    <Shield className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-red-700 dark:text-red-400 font-bold">{error}</p>
                                </div>
                            )}

                            <div className="mb-6 p-5 sm:p-6 bg-blue-600 dark:bg-blue-700 rounded-[1.5rem] border-[3px] border-blue-700 dark:border-blue-800 shadow-[0_4px_0_#1d4ed8] dark:shadow-[0_4px_0_#1e3a8a] relative mt-2">
                                <span className="absolute -top-3 sm:-top-4 left-6 px-3 py-1 bg-yellow-400 text-orange-800 font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-full border-[2px] border-yellow-500 shadow-sm">
                                    {questions[currentQuestionIndex].category}
                                </span>
                                <h3 className="text-lg sm:text-xl font-black text-white leading-tight mt-1">
                                    {questions[currentQuestionIndex].question}
                                </h3>
                            </div>

                            <RadioGroup
                                value={answers[questions[currentQuestionIndex].id]?.toString() || ""}
                                onValueChange={(value) => handleAnswerQuestion(questions[currentQuestionIndex].id, parseInt(value))}
                                className="space-y-4"
                            >
                                {questions[currentQuestionIndex].options.map((option, index) => {
                                    const isSelected = answers[questions[currentQuestionIndex].id] === index
                                    return (
                                        <div 
                                            key={index} 
                                            className={`
                                                flex items-center space-x-3 p-3 sm:p-4 rounded-xl border-[2px] transition-all cursor-pointer group
                                                ${isSelected 
                                                    ? 'bg-green-50 dark:bg-emerald-950/20 border-green-500 dark:border-emerald-500 shadow-[0_4px_0_#22c55e] dark:shadow-[0_4px_0_#059669] -translate-y-1' 
                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-[0_4px_0_#e2e8f0] dark:shadow-[0_4px_0_#0f172a] hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700/50 hover:-translate-y-1 hover:shadow-[0_6px_0_#93c5fd] dark:hover:shadow-[0_6px_0_#1e3a8a] active:shadow-none active:translate-y-[2px]'
                                                }
                                            `}
                                            onClick={() => handleAnswerQuestion(questions[currentQuestionIndex].id, index)}
                                        >
                                            <RadioGroupItem 
                                                value={index.toString()} 
                                                id={`q-${questions[currentQuestionIndex].id}-opt-${index}`} 
                                                className={`h-6 w-6 border-2 transition-all ${
                                                    isSelected ? 'border-green-600 dark:border-emerald-500 fill-green-600 dark:fill-emerald-500 text-green-600 dark:text-emerald-500' : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-400 dark:group-hover:border-blue-500'
                                                }`}
                                            />
                                            <Label 
                                                htmlFor={`q-${questions[currentQuestionIndex].id}-opt-${index}`}
                                                className={`text-base sm:text-lg font-bold cursor-pointer w-full leading-snug ${
                                                    isSelected ? 'text-green-900 dark:text-emerald-50' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
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
                        <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-t-[3px] border-slate-200 dark:border-slate-700 flex justify-between items-center rounded-b-[2rem]">
                            <Button 
                                variant="outline" 
                                disabled={currentQuestionIndex === 0 || submitting} 
                                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                                className={`rounded-full font-black px-5 border-[2px] active:translate-y-[2px] transition-all shadow-[0_2px_0_#cbd5e1] dark:shadow-[0_2px_0_#0f172a] active:shadow-none h-10 ${
                                    currentQuestionIndex === 0 || submitting ? 'opacity-50 border-slate-200 dark:border-slate-700 shadow-none' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                                }`}
                            >
                                <ChevronLeft className="h-5 w-5 mr-1" /> Back
                            </Button>

                            {currentQuestionIndex === questions.length - 1 ? (
                                <Button 
                                    onClick={handleSubmit} 
                                    disabled={submitting || answers[questions[currentQuestionIndex].id] === undefined}
                                    className={`rounded-full font-black px-6 py-5 text-base border-2 transition-all text-white relative ${
                                        answers[questions[currentQuestionIndex].id] === undefined
                                            ? 'bg-slate-300 dark:bg-slate-700 border-slate-400 dark:border-slate-600 opacity-50 cursor-not-allowed'
                                            : 'bg-green-500 hover:bg-green-400 dark:bg-emerald-600 dark:hover:bg-emerald-500 border-green-600 dark:border-emerald-700 shadow-[0_4px_0_#16a34a] dark:shadow-[0_4px_0_#065f46] active:shadow-none active:translate-y-[4px]'
                                    }`}
                                >
                                    {submitting ? (
                                        <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Submitting...</>
                                    ) : (
                                        <><Check className="h-5 w-5 mr-2" strokeWidth={4} /> Submit Results</>
                                    )}
                                </Button>
                            ) : (
                                <div />
                            )}
                        </div>
                    </>
                )}
            </Card>
        </div>
    )
}
