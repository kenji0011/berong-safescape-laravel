import React, { useState } from "react"
import { Link } from '@inertiajs/react'
import { ArrowLeft } from "lucide-react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import { cn } from "@/lib/utils"

const QuizPage = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  
  const options = [
    "Run fast",
    "Stop, Drop, and Roll",
    "Jump up and down",
    "Hide under a bed"
  ]

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
              <span>Question 1 of 5</span>
              <span>Score: 0</span>
            </div>

            {/* Question Statement */}
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-8 sm:mb-12">
              What should you do if your clothes catch on fire?
            </h2>

            {/* Options Grid */}
            <div className="space-y-4 mb-10">
              {options.map((option, index) => (
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
