import React, { useState, useEffect, useMemo, useRef } from "react"
import { Shield, Trophy, ArrowLeft } from "lucide-react"
import { Link, router } from '@inertiajs/react'
import axios from "axios"
import { cn } from "@/lib/utils"

export interface AdaptiveQuizProps {
  moduleNumber: number
  initialQuizPassed?: boolean
  initialQuizScore?: number
  initialQuizAnswers?: (number | null)[]
  initialQuizQuestions?: any[]
  isLocked?: boolean
  lockMessage?: string
  onComplete?: (score: number) => void
  nextModuleUrl?: string
  nextModuleText?: string
  isStandalone?: boolean
}

export function AdaptiveQuiz({
  moduleNumber,
  initialQuizPassed = false,
  initialQuizScore,
  initialQuizAnswers,
  initialQuizQuestions,
  isLocked = false,
  lockMessage = "Complete the lesson above first",
  onComplete,
  nextModuleUrl,
  nextModuleText = "Go to Next Module",
  isStandalone = false
}: AdaptiveQuizProps) {
  const reviewQuestionsRef = useRef<HTMLDivElement>(null)
  const resultCardRef = useRef<HTMLDivElement>(null)
  const quizSectionRef = useRef<HTMLElement>(null)

  const [quizQuestions, setQuizQuestions] = useState<any[]>([])
  const [quizLoading, setQuizLoading] = useState(true)
  const [predictedDifficulty, setPredictedDifficulty] = useState<string>("")
  
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(
    initialQuizAnswers || []
  )
  const [quizSubmitted, setQuizSubmitted] = useState(initialQuizPassed)
  const [quizPassed, setQuizPassed] = useState(initialQuizPassed)
  const [quizStarted, setQuizStarted] = useState(initialQuizPassed || isStandalone)
  const [reviewMode, setReviewMode] = useState(false)
  const [loadedScore, setLoadedScore] = useState<number | null>(
    initialQuizScore !== undefined ? Number(initialQuizScore) : null
  )
  const [saving, setSaving] = useState(false)

  // Fetch Adaptive Quiz Questions
  // If quiz was already passed and we have saved questions, use those for review.
  // Otherwise fetch new questions from the API for a fresh quiz attempt.
  useEffect(() => {
    if (initialQuizPassed && initialQuizQuestions && initialQuizQuestions.length > 0) {
      // Use saved questions for review mode (they match the saved answers)
      setQuizQuestions(initialQuizQuestions)
      setQuizLoading(false)
      return
    }
    setQuizLoading(true)
    axios.get(`/api/kids/adaptive-quiz/${moduleNumber}`).then(res => {
      if (res.data?.questions) {
        const formatted = res.data.questions.map((q: any) => ({
          q: q.text,
          options: q.options,
          correct: q.correctAnswer
        }))
        setQuizQuestions(formatted)
        setPredictedDifficulty(res.data.predictedDifficulty)
        // Initialize answers array to match question count if not already set
        if (!initialQuizAnswers || initialQuizAnswers.length === 0) {
          setQuizAnswers(new Array(formatted.length).fill(null))
        }
      }
    }).catch((e) => {
        console.error("Failed to load adaptive quiz", e)
    }).finally(() => {
      setQuizLoading(false)
    })
  }, [moduleNumber])

  const handleToggleReview = () => {
    const nextMode = !reviewMode
    setReviewMode(nextMode)
    if (nextMode) {
      setTimeout(() => {
        reviewQuestionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 150)
    } else {
      setTimeout(() => {
        resultCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 50)
    }
  }

  const handleQuizAnswer = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return
    const newAnswers = [...quizAnswers]
    newAnswers[qIdx] = optIdx
    setQuizAnswers(newAnswers)
  }

  const quizScore = useMemo(() => {
    return quizAnswers.reduce((score, answer, idx) => {
      if (!quizQuestions[idx]) return score;
      return score + (answer === quizQuestions[idx].correct ? 1 : 0)
    }, 0)
  }, [quizAnswers, quizQuestions])

  const allQuizAnswered = quizAnswers.length > 0 && quizAnswers.every(a => a !== null)

  const handleQuizSubmit = async () => {
    if (!allQuizAnswered) return
    setSaving(true)
    
    // Save quiz result + questions + answers to backend
    try {
      await axios.post("/api/kids/quiz", {
        quizType: `module_${moduleNumber}_quiz`,
        score: quizScore,
        maxScore: quizQuestions.length,
        quizAnswers: quizAnswers,
        quizQuestions: quizQuestions
      })
    } catch (e) {
      console.warn("Quiz stats not recorded", e)
    }

    setQuizSubmitted(true)
    setQuizPassed(true)
    setLoadedScore(quizScore) // Update loadedScore in real-time
    setSaving(false)
    
    if (onComplete) {
      onComplete(quizScore)
    }

    setTimeout(() => {
      resultCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 100)
  }

  const displayScore = useMemo(() => {
    if (loadedScore !== null) return loadedScore
    if (quizAnswers.some(a => a !== null) && quizSubmitted) return quizScore
    if (quizPassed) return quizQuestions.length || 5 // Default fallback for legacy passed quiz
    return null
  }, [loadedScore, quizSubmitted, quizScore, quizPassed, quizAnswers])

  const resultDetails = useMemo(() => {
    const score = displayScore ?? 0
    const total = quizQuestions.length || 5
    const pct = score / total

    if (pct >= 1) {
      return {
        icon: "🏆",
        title: "Fire Safety Champion!",
        titleColor: "text-yellow-500 dark:text-yellow-400",
        pillStyles: "border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 text-yellow-600 dark:text-yellow-400 shadow-[0_8px_32px_rgba(234,179,8,0.12)]",
        desc: "A perfect score! You are an absolute master of fire safety rules!"
      }
    } else if (pct >= 0.6) {
      return {
        icon: "🎉",
        title: moduleNumber === 5 ? "Final Exam Passed!" : "Fire Safety Certified!",
        titleColor: "text-green-500 dark:text-green-400",
        pillStyles: "border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10 text-green-600 dark:text-green-400 shadow-[0_8px_32px_rgba(34,197,94,0.12)]",
        desc: moduleNumber === 5 ? "Congratulations! You passed the final exam!" : "Well done! You have successfully completed this module quiz!"
      }
    } else if (pct > 0) {
      return {
        icon: "👍",
        title: "Great Effort!",
        titleColor: "text-orange-500 dark:text-orange-400",
        pillStyles: "border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400 shadow-[0_8px_32px_rgba(249,115,22,0.12)]",
        desc: "You completed the quiz! Review your answers below to learn how to keep your home safe!"
      }
    } else {
      return {
        icon: "💡",
        title: "Keep Learning!",
        titleColor: "text-slate-500 dark:text-slate-400",
        pillStyles: "border-slate-500/30 bg-gradient-to-br from-slate-500/10 to-gray-500/10 text-slate-600 dark:text-slate-400 shadow-[0_8px_32px_rgba(100,116,139,0.12)]",
        desc: "Don't worry! Review the module and try again anytime to improve your score!"
      }
    }
  }, [displayScore, quizQuestions.length, moduleNumber])

  return (
    <section ref={quizSectionRef} className={cn(
      "relative rounded-[2rem] border-[4px] shadow-sm transition-all duration-500 overflow-hidden",
      quizPassed
        ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 p-8 sm:p-14 text-center"
        : "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300 dark:border-yellow-900/30 p-5 sm:p-8 md:p-12",
      isLocked && "pointer-events-none select-none"
    )}>
      {isLocked && (
        <div className="absolute inset-0 rounded-[2rem] bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-[3px] flex items-center justify-center z-20 transition-all duration-300 p-4 sm:p-8">
          <p className="text-amber-600 dark:text-amber-400 font-black text-sm sm:text-base md:text-lg bg-white dark:bg-slate-800 px-6 py-3.5 sm:px-8 sm:py-4 rounded-full sm:rounded-3xl border-[3px] border-amber-500 shadow-2xl text-center max-w-[95%] transition-all">
            {lockMessage}
          </p>
        </div>
      )}

      <div className={cn("transition-all duration-500", isLocked && "opacity-20 blur-[1px]")}>
        {/* Header */}
        {!(quizPassed && !reviewMode) && (
          <div className="text-center mb-6 sm:mb-10">
            <h2 className={cn(
              "text-xl sm:text-2xl md:text-3xl font-black mb-2 sm:mb-3 drop-shadow-sm transition-colors",
              quizPassed ? "text-green-400" : "text-yellow-900 dark:text-yellow-300"
            )}>
              <Trophy className="h-6 w-6 sm:h-7 sm:w-7 inline-block mr-2 -mt-1" />
              Fire Safety Certification
            </h2>
          </div>
        )}

        {/* Review Mode */}
        {quizPassed && reviewMode && (
          <div
            ref={reviewQuestionsRef}
            className="max-w-2xl mx-auto space-y-5 sm:space-y-6 mb-8 sm:mb-12 animate-fade-in"
          >
            {quizQuestions.map((question, qIdx) => (
              <div
                key={qIdx}
                className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-[3px] border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
              >
                <h3 className="text-slate-800 dark:text-white font-black mb-3 sm:mb-4 text-sm sm:text-lg transition-colors">
                  {qIdx + 1}. {question.q}
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {question.options.map((opt: string, optIdx: number) => {
                    const isCorrect = optIdx === question.correct
                    const isSelected = quizAnswers[qIdx] === optIdx
                    
                    return (
                      <button
                        key={optIdx}
                        disabled
                        className={cn(
                          "w-full text-left p-3 sm:p-4 rounded-xl border-2 font-bold text-sm sm:text-base transition-all flex items-center justify-between",
                          isCorrect
                            ? "bg-green-500 border-green-600 text-white shadow-sm"
                            : isSelected
                            ? "bg-red-500 border-red-600 text-white shadow-sm"
                            : "border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 opacity-50 cursor-not-allowed"
                        )}
                      >
                        <span>{opt}</span>
                        {isSelected && !isCorrect && (
                          <span className="text-[10px] bg-red-700/50 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider ml-2 shrink-0">
                            Your Answer ✗
                          </span>
                        )}
                        {isCorrect && (
                          <span className="text-[10px] bg-green-700/50 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider ml-2 shrink-0">
                            Correct ✓
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quiz Passed Result Card */}
        {quizPassed && (
          <div
            ref={resultCardRef}
            className="w-full text-center max-w-xl mx-auto transition-colors"
          >
            <div className="text-5xl sm:text-7xl mb-5" style={{ filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.2))' }}>
              {resultDetails.icon}
            </div>
            <h3 className={cn("text-2xl sm:text-[2.75rem] font-black mb-2 uppercase leading-none tracking-tight", resultDetails.titleColor)}>
              {resultDetails.title}
            </h3>
            
            {displayScore !== null && (
              <div className={cn("my-6 inline-flex flex-col items-center justify-center border-2 rounded-2xl px-8 py-3.5 backdrop-blur-sm", resultDetails.pillStyles)}>
                <span className="opacity-70 text-[10px] font-black uppercase tracking-widest mb-0.5">
                  Quiz Score
                </span>
                <span className="font-extrabold text-3xl sm:text-4xl tracking-tight font-mono">
                  {displayScore} <span className="opacity-50 text-xl font-normal">/ {quizQuestions.length || 5}</span>
                </span>
              </div>
            )}

            <p className="text-slate-600 dark:text-slate-400 font-semibold text-base sm:text-lg mb-8 sm:mb-10">
              {resultDetails.desc}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-5">
              <button
                onClick={handleToggleReview}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-black px-6 sm:px-8 py-3 sm:py-4 rounded-[1.25rem] border-b-[5px] border-slate-300 dark:border-slate-950 active:border-b-[1px] active:mt-[4px] transition-all uppercase tracking-wider text-sm min-w-[210px] flex items-center justify-center gap-2"
              >
                {reviewMode ? "Hide Answers" : "Review Answers"}
              </button>
              {nextModuleUrl && (
                <Link
                  href={nextModuleUrl}
                  className="bg-amber-500 hover:bg-amber-400 text-white font-black px-6 sm:px-8 py-3 sm:py-4 rounded-[1.25rem] border-b-[5px] border-amber-700 active:border-b-[1px] active:mt-[4px] transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-2 min-w-[210px]"
                >
                  {nextModuleText}
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Quiz Questions */}
        {!quizPassed && (
          <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6">
            {!quizStarted ? (
              <div className="text-center p-8 sm:p-12 bg-white dark:bg-slate-900 rounded-3xl border-[3px] border-yellow-300 shadow-sm transition-colors animate-fade-in">
                <h3 className="text-2xl sm:text-3xl font-black mb-4 text-slate-800 dark:text-white">Ready to test your knowledge?</h3>
                <p className="mb-2 text-slate-600 dark:text-slate-400 font-bold text-sm sm:text-base">
                  {isStandalone ? "Start the quiz when you're ready!" : "Review the module content above and start when you're ready!"}
                </p>
                {predictedDifficulty && (
                  <p className="mb-8 text-indigo-500 dark:text-indigo-400 font-black text-sm">
                    Quiz Ready!  
                  </p>
                )}
                <button 
                  onClick={() => setQuizStarted(true)} 
                  disabled={quizLoading || quizQuestions.length === 0}
                  className="font-black px-8 sm:px-10 py-3 sm:py-4 rounded-full bg-yellow-400 text-red-600 shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all uppercase tracking-wide text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed">
                  {quizLoading ? 'Loading AI Questions...' : 'Start Quiz'}
                </button>
              </div>
            ) : (
              <>
                {quizQuestions.map((question, qIdx) => (
                  <div
                    key={qIdx}
                    className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-[3px] border-yellow-200 dark:border-yellow-900/30 shadow-sm transition-colors"
                  >
                    <h3 className="text-slate-800 dark:text-white font-black mb-3 sm:mb-4 text-sm sm:text-lg transition-colors">
                      {qIdx + 1}. {question.q}
                    </h3>
                    <div className="grid grid-cols-1 gap-2 sm:gap-3">
                      {question.options.map((opt: string, optIdx: number) => {
                        const isSelected = quizAnswers[qIdx] === optIdx
                        const isCorrect = optIdx === question.correct
                        let btnClass = "w-full text-left p-3 sm:p-4 rounded-xl border-2 font-bold transition-all text-sm sm:text-base "

                        if (quizSubmitted) {
                          if (isCorrect) {
                            btnClass += "bg-green-500 border-green-600 text-white shadow-sm"
                          } else if (isSelected && !isCorrect) {
                            btnClass += "bg-red-800 border-red-600 text-white opacity-70"
                          } else {
                            btnClass += "border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-950 opacity-50 cursor-not-allowed"
                          }
                        } else {
                          if (isSelected) {
                            btnClass += "border-yellow-400 dark:border-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 shadow-sm"
                          } else {
                            btnClass += "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm hover:-translate-y-0.5 active:translate-y-0.5"
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleQuizAnswer(qIdx, optIdx)}
                            disabled={quizSubmitted}
                            className={btnClass}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {/* Submit */}
                <div className="flex justify-center pt-2 sm:pt-4">
                  {!quizSubmitted ? (
                    <button
                      onClick={handleQuizSubmit}
                      disabled={!allQuizAnswered || saving}
                      className={cn(
                        "font-black px-8 sm:px-10 py-3 sm:py-4 rounded-full uppercase tracking-wide text-sm sm:text-base transition-all flex items-center gap-2",
                        allQuizAnswered && !saving
                          ? "bg-yellow-400 text-red-600 shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border-[3px] border-slate-300 dark:border-slate-700"
                      )}
                    >
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                      {saving ? "Checking..." : "Submit Answers"}
                    </button>
                  ) : (
                    <div className="text-center space-y-4">
                      <p className="text-lg sm:text-xl font-black text-[#ff4b3e]">
                        You scored {quizScore}/5.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
