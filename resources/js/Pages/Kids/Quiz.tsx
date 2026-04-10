import React, { useState } from "react"
import { Link } from '@inertiajs/react'
import { ArrowLeft, CheckCircle, XCircle, Lightbulb } from "lucide-react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import { cn } from "@/lib/utils"

const QuizPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isFinished, setIsFinished] = useState(false)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)
  
  const questions = [
    {
      text: "What should you do if your clothes catch on fire?",
      options: ["Run fast", "Stop, Drop, and Roll", "Jump up and down", "Hide under a bed"],
      correctAnswer: 1,
      explanation: "Stop, Drop, and Roll helps put out the flames on your clothes!"
    },
    {
      text: "What is the very first thing you do if you hear a fire alarm?",
      options: ["Hide in the closet", "Pack your toys", "Get out safely and quickly", "Look for the fire"],
      correctAnswer: 2,
      explanation: "Always prioritize getting out safely and quickly over material items!"
    },
    {
      text: "When escaping a fire, if there is smoke, you should...",
      options: ["Crawl low under the smoke", "Run fast and breathe deep", "Wave a towel to clear it", "Walk normally"],
      correctAnswer: 0,
      explanation: "Smoke rises naturally, so crawling low keeps you in the cleanest air."
    },
    {
      text: "Who should you call if there is a fire?",
      options: ["The pizza delivery", "Your friends", "Ghostbusters", "911 / Emergency Number"],
      correctAnswer: 3,
      explanation: "911 or your local emergency number will send the fire department to help you right away."
    },
    {
      text: "Should you ever hide from firefighters?",
      options: ["Yes, they look scary", "No, they are there to help you!", "Only if you are playing hide and seek", "Sometimes"],
      correctAnswer: 1,
      explanation: "Firefighters wear masks and heavy gear that might look scary, but they are your friends there to save you."
    }
  ]

  const handleSubmit = () => {
    if (selectedOption === null) return
    
    if (!isAnswerRevealed) {
      if (selectedOption === questions[currentQuestionIndex].correctAnswer) {
        setScore(prev => prev + 1)
      }
      setIsAnswerRevealed(true)
      return
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswerRevealed(false)
    } else {
      setIsFinished(true)
    }
  }

  if (isFinished) {
    return (
      <div className="min-h-screen relative flex flex-col font-sans bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-[#FED7AA] selection:bg-orange-300 selection:text-orange-900">
        {/* Decorative Blob Background */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-orange-400/20 blur-3xl opacity-70 animate-pulse" />
          <div className="absolute bottom-10 -left-10 w-72 h-72 rounded-full bg-rose-400/20 blur-3xl opacity-70" />
        </div>

        <div className="relative z-10 w-full flex-1 flex items-center justify-center pt-6 pb-12">
          <div className="max-w-xl mx-auto w-full px-4 sm:px-6">
            <div className="w-full bg-white/80 backdrop-blur-xl border border-white/60 rounded-[3rem] p-10 sm:p-14 shadow-[0_20px_60px_rgba(234,88,12,0.15)] flex flex-col items-center text-center transform transition-all duration-700 animate-in fade-in zoom-in w-full max-w-full">
              <div className="text-8xl md:text-9xl mb-6 animate-bounce-slow drop-shadow-2xl">🎉</div>
              <h2 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-600 tracking-tight mb-4 drop-shadow-sm">Quiz Finished!</h2>
              <p className="text-lg sm:text-xl font-bold text-slate-600 mb-10 bg-orange-50 px-6 py-3 rounded-2xl border border-orange-100 shadow-sm w-full">
                You scored <span className="text-orange-600 font-black mx-1 text-2xl">{score}</span> out of {questions.length}
              </p>
              <Link 
                href="/kids" 
                className="bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-[0_8px_30px_rgba(249,115,22,0.3)] hover:shadow-[0_15px_40px_rgba(249,115,22,0.4)] hover:-translate-y-1 active:translate-y-0 px-10 py-5 rounded-full font-black text-lg transition-all duration-300 w-full mb-2 inline-flex items-center justify-center text-center"
              >
                Back to Activities
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progressPercentage = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <div className="min-h-screen relative flex flex-col font-sans bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-[#FED7AA] selection:bg-orange-300 selection:text-orange-900">
      {/* Decorative Blob Background */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 -left-32 w-96 h-96 rounded-full bg-orange-400/20 blur-3xl opacity-60" />
        <div className="absolute bottom-20 -right-20 w-80 h-80 rounded-full bg-rose-400/20 blur-3xl opacity-60 animate-pulse duration-1000" />
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col py-4">
        {/* Ghost Header - absolute positioned to save vertical space */}
        <div className="absolute top-2 left-4 z-20">
          <Link 
            href="/kids" 
            className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-orange-600 transition-all text-sm bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/60 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Activities
          </Link>
        </div>

        {/* Main Quiz Hub Container */}
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 flex-1 flex flex-col lg:max-h-[85vh]">
          
          <div className="flex flex-col flex-1 w-full bg-white/90 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_25px_60px_rgba(234,88,12,0.15)] overflow-hidden">
            
            {/* Header: Progress & Score */}
            <div className="flex items-center justify-between font-extrabold text-slate-400 mb-4 text-sm uppercase tracking-wider">
              <span>Question <span className="text-orange-500 text-base">{currentQuestionIndex + 1}</span> of {questions.length}</span>
              <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full shadow-inner border border-orange-200/50">Score: {score}</span>
            </div>

            {/* Custom Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full mb-6 overflow-hidden shadow-inner border border-slate-200/50">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-rose-500 rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Question Statement */}
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-6 tracking-tight leading-tight">
              {currentQuestion.text}
            </h2>

            {/* Options Grid */}
            <div className="space-y-3 mb-4 flex-none">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOption === index
                const isCorrectOption = index === currentQuestion.correctAnswer
                const showCorrect = isAnswerRevealed && isCorrectOption
                const showIncorrect = isAnswerRevealed && isSelected && !isCorrectOption

                return (
                  <div 
                    key={index}
                    onClick={() => { if (!isAnswerRevealed) setSelectedOption(index) }}
                    className={cn(
                      "w-full rounded-2xl p-4 sm:p-5 text-left font-bold text-base sm:text-lg transition-all duration-300 relative overflow-hidden group border-2 flex items-center justify-between",
                      !isAnswerRevealed && isSelected 
                        ? "border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100/50 text-orange-900 shadow-[0_10px_25px_rgba(249,115,22,0.15)] ring-4 ring-orange-500/20 transform scale-[1.02] cursor-pointer"
                        : !isAnswerRevealed && "border-slate-100 bg-slate-50 text-slate-700 hover:border-orange-300 hover:bg-orange-50/30 hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
                      isAnswerRevealed && showCorrect && "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm",
                      isAnswerRevealed && showIncorrect && "border-rose-500 bg-rose-50 text-rose-900 shadow-sm",
                      isAnswerRevealed && !showCorrect && !showIncorrect && "border-slate-100 bg-slate-100 text-slate-400 opacity-60 grayscale cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors",
                        !isAnswerRevealed && isSelected ? "bg-orange-500 text-white shadow-md font-black" : "",
                        !isAnswerRevealed && !isSelected ? "bg-slate-200 text-slate-500 font-bold group-hover:bg-orange-200 group-hover:text-orange-700" : "",
                        isAnswerRevealed && showCorrect ? "bg-emerald-500 text-white font-black" : "",
                        isAnswerRevealed && showIncorrect ? "bg-rose-500 text-white font-black" : "",
                        isAnswerRevealed && !showCorrect && !showIncorrect ? "bg-slate-300 text-slate-500 font-bold" : ""
                      )}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      {option}
                    </div>

                    {/* Reveal Icons */}
                    {isAnswerRevealed && showCorrect && <CheckCircle className="h-6 w-6 text-emerald-500 ml-4 shrink-0 animate-in zoom-in duration-300" />}
                    {isAnswerRevealed && showIncorrect && <XCircle className="h-6 w-6 text-rose-500 ml-4 shrink-0 animate-in zoom-in duration-300" />}
                  </div>
                )
              })}
            </div>

            {/* Explanation Box */}
            {isAnswerRevealed && (
              <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm flex items-start gap-3 animate-in slide-in-from-bottom-4 fade-in duration-500 shrink-0">
                <Lightbulb className="h-6 w-6 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className={cn("font-black text-lg mb-1", selectedOption === currentQuestion.correctAnswer ? "text-emerald-600" : "text-rose-600")}>
                    {selectedOption === currentQuestion.correctAnswer ? "Correct!" : "Nice try!"}
                  </h4>
                  <p className="text-slate-700 font-medium text-sm sm:text-base leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            )}

            {/* Spacer if explanation isn't visible to prevent button jump */}
            {!isAnswerRevealed && <div className="flex-1 min-h-[4rem]" />}

            {/* Footer / Submission */}
            <div className="flex justify-end pt-4 border-t font-sans border-slate-100 mt-auto">
              <button 
                onClick={handleSubmit}
                className={cn(
                  "px-8 sm:px-10 py-3 rounded-full font-black text-base transition-all duration-300 shadow-lg",
                  selectedOption !== null 
                    ? "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl active:translate-y-0 active:shadow-md"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                )}
                disabled={selectedOption === null}
              >
                {!isAnswerRevealed ? 'Submit Answer' : (currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz')}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

QuizPage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default QuizPage
