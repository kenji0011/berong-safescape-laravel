import React, { useState } from "react"
import { Link } from '@inertiajs/react'
import { ArrowLeft } from "lucide-react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import { cn } from "@/lib/utils"

const QuizPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isFinished, setIsFinished] = useState(false)
  
  const questions = [
    {
      text: "What should you do if your clothes catch on fire?",
      options: ["Run fast", "Stop, Drop, and Roll", "Jump up and down", "Hide under a bed"],
      correctAnswer: 1
    },
    {
      text: "What is the very first thing you do if you hear a fire alarm?",
      options: ["Hide in the closet", "Pack your toys", "Get out safely and quickly", "Look for the fire"],
      correctAnswer: 2
    },
    {
      text: "When escaping a fire, if there is smoke, you should...",
      options: ["Crawl low under the smoke", "Run fast and breathe deep", "Wave a towel to clear it", "Walk normally"],
      correctAnswer: 0
    },
    {
      text: "Who should you call if there is a fire?",
      options: ["The pizza delivery", "Your friends", "Ghostbusters", "911 / Emergency Number"],
      correctAnswer: 3
    },
    {
      text: "Should you ever hide from firefighters?",
      options: ["Yes, they look scary", "No, they are there to help you!", "Only if you are playing hide and seek", "Sometimes"],
      correctAnswer: 1
    }
  ]

  const handleSubmit = () => {
    if (selectedOption === null) return
    
    if (selectedOption === questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1)
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedOption(null)
    } else {
      setIsFinished(true)
    }
  }

  if (isFinished) {
    return (
      <div className="min-h-screen relative flex flex-col font-sans">
        {/* Background Image Layer */}
        <div
          className="fixed inset-0 opacity-20 bg-cover z-0 pointer-events-none"
          style={{ backgroundImage: "url('/web-background-image.jpg')", backgroundPosition: 'center' }}
        />

        <div className="relative z-10 w-full flex-1 flex items-center justify-center pt-6 pb-12">
          <div className="max-w-xl mx-auto w-full px-4 sm:px-6">
            <div className="w-full bg-[#f0f9ff] border-[4px] border-slate-700 rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col items-center text-center">
              <div className="text-7xl mb-6">🎉</div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-800 mb-4">Quiz Finished!</h2>
              <p className="text-xl sm:text-2xl font-bold text-slate-600 mb-10">
                You scored <span className="text-blue-600 font-black">{score}</span> out of {questions.length}
              </p>
              <Link 
                href="/kids" 
                className="bg-blue-500 text-white border-[3px] border-blue-700 shadow-[0_6px_0_0_#1d4ed8] hover:-translate-y-1 hover:shadow-[0_8px_0_0_#1d4ed8] active:translate-y-0 active:shadow-[0_0px_0_0_#1d4ed8] px-8 py-4 rounded-2xl font-bold text-xl transition-all"
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

  return (
    <div className="min-h-screen relative flex flex-col font-sans">
      {/* Background Image Layer */}
      <div
        className="fixed inset-0 opacity-20 bg-cover z-0 pointer-events-none"
        style={{ backgroundImage: "url('/web-background-image.jpg')", backgroundPosition: 'center' }}
      />

      <div className="relative z-10 w-full flex-1 flex flex-col pt-6 pb-12">
        {/* Ghost Header - floats above content */}
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pb-6">
          <Link 
            href="/kids" 
            className="inline-flex items-center gap-2 text-slate-800 font-bold hover:text-black transition-all text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Activities
          </Link>
        </div>

        {/* Main Quiz Hub Container */}
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex-1 flex items-center justify-center">
          <div className="w-full bg-[#f0f9ff] border-[4px] border-slate-700 rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden">
            
            {/* Header: Progress & Score */}
            <div className="flex items-center justify-between font-bold text-slate-600 mb-8 sm:mb-10 text-sm sm:text-base">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>Score: {score}</span>
            </div>

            {/* Question Statement */}
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-8 sm:mb-12">
              {currentQuestion.text}
            </h2>

            {/* Options Grid */}
            <div className="space-y-4 mb-10">
              {currentQuestion.options.map((option, index) => (
                <div 
                  key={index}
                  onClick={() => setSelectedOption(index)}
                  className={cn(
                    "w-full bg-transparent border-2 rounded-xl p-4 sm:p-5 text-left font-medium text-lg sm:text-xl cursor-pointer transition-all",
                    selectedOption === index 
                      ? "border-blue-500 bg-blue-50 text-blue-900 shadow-sm"
                      : "border-slate-300 text-slate-800 hover:border-slate-400 hover:bg-white/50"
                  )}
                >
                  {option}
                </div>
              ))}
            </div>

            {/* Footer / Submission */}
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSubmit}
                className={cn(
                  "px-6 sm:px-8 py-3 rounded-xl font-bold text-base sm:text-lg transition-all",
                  selectedOption !== null 
                    ? "bg-slate-700 text-white hover:bg-slate-800 shadow-md hover:-translate-y-0.5 active:translate-y-0"
                    : "bg-[#94a3b8] text-white cursor-not-allowed opacity-90"
                )}
                disabled={selectedOption === null}
              >
                Submit Answer
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
