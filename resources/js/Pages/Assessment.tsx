"use client"

import { useState, useEffect } from "react"
import { Head, router } from '@inertiajs/react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Loader2, Shield, Star } from "lucide-react"
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
    const { user, isAuthenticated } = useAuth()
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
                    setQuestions(response.data.questions || [])
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
                comments: ''
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
            <div className="min-h-screen bg-slate-50 py-12 px-4 selection:bg-orange-500 selection:text-white">
                <Head title={`${title} Results - SafeScape`} />
                <Card className="w-full max-w-lg mx-auto border-none shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-3xl overflow-hidden">
                    <div className="bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 p-6 text-center rounded-t-3xl">
                        <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                            <Check className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Assessment Complete! 🎉</h2>
                        <p className="text-white/80 text-sm mt-1">{title}</p>
                    </div>
                    
                    <CardContent className="space-y-6 p-6">
                        <div className="text-center p-6 bg-orange-50 rounded-2xl border-2 border-orange-200">
                            <p className="text-sm text-orange-600 font-semibold mb-2">Your Score</p>
                            <div className="text-5xl font-black" style={{ color: rating.color }}>
                                {result.score} / {result.maxScore}
                            </div>
                            <p className="text-lg font-bold mt-2" style={{ color: rating.color }}>
                                {rating.label}
                            </p>
                            <p className="text-sm text-slate-500 mt-4">
                                {isPreTest 
                                    ? "This is your baseline score. Complete modules and activities to unlock the Post-Test!" 
                                    : "Great job completing your final assessment!"}
                            </p>
                        </div>

                        {/* Inline Feedback Widget - Post-Test only */}
                        {!isPreTest && (
                            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-center mt-2 mb-4 animate-in fade-in slide-in-from-bottom-4">
                                {feedbackSuccess ? (
                                    <div className="flex flex-col items-center">
                                        <Check className="h-6 w-6 text-green-500 mb-2" />
                                        <p className="text-sm font-bold text-slate-700">Thanks for your feedback!</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Rate your Assessment Experience</p>
                                        <div className="flex justify-center gap-2 mb-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => !feedbackSubmitting && setFeedbackRating(star)}
                                                    onMouseEnter={() => !feedbackSubmitting && setFeedbackHover(star)}
                                                    onMouseLeave={() => !feedbackSubmitting && setFeedbackHover(0)}
                                                    className="p-1 transition-all hover:scale-110"
                                                >
                                                    <Star 
                                                        className={`h-6 w-6 sm:h-8 sm:w-8 transition-colors ${
                                                            (feedbackHover || feedbackRating) >= star 
                                                                ? "text-yellow-400 fill-yellow-400" 
                                                                : "text-slate-200"
                                                        }`} 
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        {feedbackRating > 0 && (
                                            <Button 
                                                onClick={handleFeedbackSubmit}
                                                disabled={feedbackSubmitting}
                                                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full font-bold px-6 py-2 mt-2 h-auto"
                                            >
                                                {feedbackSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                Submit Rating
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        <Button 
                            onClick={handleContinue}
                            className="w-full bg-yellow-400 text-red-600 font-extrabold py-6 rounded-full text-lg shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-[0_0px_0_#b45309] transition-all flex items-center justify-center gap-2"
                        >
                            🚀 {isPreTest ? "Start Learning" : "Return to Dashboard"}
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 selection:bg-orange-500 selection:text-white">
            <Head title={`${title} - SafeScape`} />
            
            <div className="max-w-3xl mx-auto mb-6 flex items-center gap-4">
                <button 
                    onClick={() => router.visit('/')}
                    className="h-10 w-10 sm:h-12 sm:w-12 bg-white rounded-full border-2 border-slate-200 border-b-[4px] active:border-b-2 active:translate-y-[2px] shadow-sm flex items-center justify-center hover:bg-slate-50 transition-all shrink-0"
                >
                    <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700" strokeWidth={3} />
                </button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{title}</h1>
                    <p className="text-sm text-slate-500 font-medium">{description}</p>
                </div>
            </div>

            <Card className="max-w-3xl mx-auto border-2 border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
                        <span className="text-slate-600 font-medium font-bold">Loading questions...</span>
                    </div>
                ) : questions.length === 0 ? (
                    <div className="text-center py-24 px-4">
                        <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-700 mb-2">No Questions Found</h2>
                        <p className="text-slate-500 mb-6">We couldn't find any questions for this assessment.</p>
                        <Button onClick={() => router.visit('/')} variant="outline" className="border-2 rounded-full font-bold">
                            Return Home
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Progress Header */}
                        <div className="bg-white px-6 pb-4 pt-6 border-b-2 border-slate-100">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-bold text-slate-500 text-sm uppercase tracking-wider">
                                    Question {currentQuestionIndex + 1} of {questions.length}
                                </span>
                                <span className="font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full text-xs">
                                    {Math.round(((currentQuestionIndex) / questions.length) * 100)}% Completed
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-orange-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Question Content */}
                        <CardContent className="p-6 sm:p-10 bg-white">
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-3">
                                    <Shield className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-red-700 font-bold">{error}</p>
                                </div>
                            )}

                            <div className="mb-8 p-6 sm:p-8 bg-blue-50/50 rounded-[2rem] border-2 border-blue-100 relative">
                                <span className="absolute -top-3 sm:-top-4 left-6 px-4 py-1.5 bg-blue-100 text-blue-700 font-black text-xs sm:text-sm uppercase tracking-widest rounded-full border-2 border-blue-200">
                                    {questions[currentQuestionIndex].category}
                                </span>
                                <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
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
                                                flex items-center space-x-3 p-4 sm:p-5 rounded-2xl border-[3px] transition-all cursor-pointer group
                                                ${isSelected 
                                                    ? 'bg-orange-50 border-orange-400 rotate-0 shadow-[0_4px_0_#fb923c] -translate-y-1' 
                                                    : 'bg-white border-slate-200 hover:border-orange-200 hover:bg-orange-50/50 active:scale-[0.98]'
                                                }
                                            `}
                                            onClick={() => handleAnswerQuestion(questions[currentQuestionIndex].id, index)}
                                        >
                                            <RadioGroupItem 
                                                value={index.toString()} 
                                                id={`q-${questions[currentQuestionIndex].id}-opt-${index}`} 
                                                className={`h-6 w-6 border-2 transition-all ${
                                                    isSelected ? 'border-orange-500 fill-orange-500 text-orange-500' : 'border-slate-300 group-hover:border-orange-300'
                                                }`}
                                            />
                                            <Label 
                                                htmlFor={`q-${questions[currentQuestionIndex].id}-opt-${index}`}
                                                className={`text-base sm:text-lg font-bold cursor-pointer w-full leading-snug ${
                                                    isSelected ? 'text-orange-900' : 'text-slate-700 group-hover:text-slate-900'
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
                        <div className="bg-slate-50 px-6 py-5 border-t-2 border-slate-200 flex justify-between items-center">
                            <Button 
                                variant="outline" 
                                disabled={currentQuestionIndex === 0 || submitting} 
                                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                                className="rounded-full font-black px-6 border-2 border-slate-300 border-b-[4px] active:border-b-2 active:translate-y-[2px]"
                            >
                                <ChevronLeft className="h-5 w-5 mr-1" /> Back
                            </Button>

                            {currentQuestionIndex === questions.length - 1 ? (
                                <Button 
                                    onClick={handleSubmit} 
                                    disabled={submitting || answers[questions[currentQuestionIndex].id] === undefined}
                                    className={`rounded-full font-black px-8 py-6 text-lg border-2 border-b-[4px] active:border-b-2 active:translate-y-[2px] shadow-sm transition-all text-white ${
                                        answers[questions[currentQuestionIndex].id] === undefined
                                            ? 'bg-slate-300 border-slate-400 opacity-50 cursor-not-allowed'
                                            : 'bg-green-500 hover:bg-green-400 border-green-600 shadow-[0_4px_0_#16a34a] hover:shadow-[0_4px_0_#16a34a]'
                                    }`}
                                >
                                    {submitting ? (
                                        <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Submitting...</>
                                    ) : (
                                        <><Check className="h-6 w-6 mr-2" strokeWidth={3} /> Submit Results</>
                                    )}
                                </Button>
                            ) : (
                                <Button 
                                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                    disabled={answers[questions[currentQuestionIndex].id] === undefined}
                                    className={`rounded-full font-black px-8 border-2 border-b-[4px] active:border-b-2 active:translate-y-[2px] shadow-sm transition-all ${
                                        answers[questions[currentQuestionIndex].id] === undefined
                                            ? 'bg-slate-200 text-slate-400 border-slate-300 shadow-none'
                                            : 'bg-orange-500 hover:bg-orange-400 text-white border-orange-600 shadow-[0_4px_0_#ea580c] hover:shadow-[0_4px_0_#ea580c]'
                                    }`}
                                >
                                    Next <ChevronRight className="h-5 w-5 ml-1" />
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </Card>
        </div>
    )
}
