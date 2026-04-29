import React, { useState } from "react"
import { Link, router } from '@inertiajs/react'
import { ArrowLeft, CheckCircle, XCircle, Lightbulb } from "lucide-react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import axios from "axios"
import { cn } from "@/lib/utils"

const QuizPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isFinished, setIsFinished] = useState(false)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)
  
  const [soundEffects] = useState({
    click: new Audio('/sounds/click.mp3'),
    match: new Audio('/sounds/match.mp3'),
    wrong: new Audio('/sounds/wrong.mp3'),
    win: new Audio('/sounds/win.mp3'),
    failed: new Audio('/sounds/failed.mp3')
  })

  const playSound = (type: 'click' | 'match' | 'wrong' | 'win' | 'failed') => {
    const audio = soundEffects[type]
    if (audio) {
      audio.currentTime = 0
      audio.volume = 0.4
      audio.play().catch(e => console.log("Audio play failed:", e))
    }
  }
  
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
        playSound('match')
      } else {
        playSound('wrong')
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
      
      // Award Quiz Hero Badge ONLY IF perfect score
      if (score === questions.length) {
        playSound('win')
        axios.post('/api/badges/award', {
          badge_id: 'quiz_hero',
          badge_name: 'Quiz Hero',
          badge_icon: '🏆'
        }).catch(err => console.error("Failed to award badge:", err.response?.data || err.message))
      } else {
        playSound('failed')
      }
    }
  }

  if (isFinished) {
    const isPerfect = score === questions.length
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:bg-slate-950 p-4 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary opacity-10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-600 opacity-10 blur-[100px] rounded-full"></div>
        
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 shadow-[0_32px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.3)] border-[6px] border-white dark:border-slate-800 text-center max-w-lg w-full relative z-10 transition-colors">
          
          {isPerfect ? (
            <div className="animate-in zoom-in duration-700">
              <div className="h-32 w-32 bg-yellow-400 rounded-[2.5rem] flex items-center justify-center text-7xl mx-auto mb-6 shadow-xl border-4 border-white dark:border-slate-800 transform -rotate-6">
                🏆
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">MASTERPIECE!</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold mb-8">You've earned the <span className="text-yellow-600 dark:text-yellow-400">Quiz Hero</span> badge!</p>
            </div>
          ) : (
            <div className="animate-in zoom-in duration-700">
              <div className="h-28 w-28 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-6xl mx-auto mb-6 shadow-inner border-2 border-slate-200 dark:border-slate-700">
                ⭐
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">GOOD EFFORT!</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 px-4">
                Score <span className="text-primary">5/5</span> to unlock the <span className="text-slate-700 dark:text-slate-200">Quiz Hero</span> badge.
              </p>
            </div>
          )}

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 mb-10 border border-slate-100 dark:border-slate-700">
             <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Final Score</span>
             <div className="flex items-center justify-center gap-3">
                <span className={cn("text-6xl font-black", isPerfect ? "text-emerald-500" : "text-orange-500")}>{score}</span>
                <span className="text-3xl font-black text-slate-300 dark:text-slate-600 mt-2">/ {questions.length}</span>
             </div>
          </div>

          <div className="flex flex-col gap-4">
            {!isPerfect && (
              <button
                onClick={() => {
                  setCurrentQuestionIndex(0)
                  setScore(0)
                  setSelectedOption(null)
                  setIsFinished(false)
                  setIsAnswerRevealed(false)
                }}
                className="w-full bg-primary hover:bg-red-500 text-white font-black py-5 rounded-2xl border-b-[6px] border-red-800 active:border-b-0 active:translate-y-[6px] transition-all uppercase tracking-widest shadow-xl flex items-center justify-center gap-3"
              >
                Try Again
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </button>
            )}
            
            <Link
              href="/kids/challenges"
              className={cn(
                "w-full font-black py-5 rounded-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-3",
                isPerfect 
                  ? "bg-primary hover:bg-red-500 text-white border-b-[6px] border-red-800 active:border-b-0 active:translate-y-[6px] shadow-xl" 
                  : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 shadow-md"
              )}
            >
              Back to Activities
              <CheckCircle className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progressPercentage = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <div className="min-h-screen relative flex flex-col font-sans bg-blue-50 dark:bg-slate-950 transition-colors duration-500 selection:bg-orange-300 selection:text-orange-900">
      {/* Heroic Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/challenges-bg.png" 
          alt="" 
          className="w-full h-full object-cover opacity-100 dark:opacity-50 transition-opacity duration-500" 
        />
        <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/60 transition-colors duration-500"></div>
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col py-4 pb-28 sm:pb-4">
        {/* Ghost Header - absolute positioned to save vertical space */}
        <div className="absolute top-2 left-4 z-20">
          <Link 
            href="/kids/challenges" 
            className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold hover:text-orange-600 dark:hover:text-orange-400 transition-all text-sm bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-white/60 dark:border-slate-700/60 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Activities
          </Link>
        </div>

        {/* Main Quiz Hub Container */}
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 flex-1 flex flex-col lg:max-h-[85vh] pt-12 sm:pt-0">
          
          <div className="flex flex-col flex-1 w-full bg-white dark:bg-slate-900 border border-white/60 dark:border-slate-800/60 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_25px_60px_rgba(234,88,12,0.15)] overflow-hidden transition-colors duration-500">
            
            {/* Header: Progress & Score */}
            <div className="flex items-center justify-between font-extrabold text-slate-400 dark:text-slate-500 mb-4 text-sm uppercase tracking-wider">
              <span>Question <span className="text-orange-500 text-base">{currentQuestionIndex + 1}</span> of {questions.length}</span>
              <span className="bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full shadow-inner border border-orange-200/50 dark:border-orange-900/30">Score: {score}</span>
            </div>

            {/* Custom Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-6 overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-700/50">
              <div 
                className="h-full bg-orange-500 rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Question Statement */}
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-6 tracking-tight leading-tight">
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
                    onClick={() => { 
                      if (!isAnswerRevealed) {
                        setSelectedOption(index)
                        playSound('click')
                      } 
                    }}
                    className={cn(
                      "w-full rounded-2xl p-4 sm:p-5 text-left font-bold text-base sm:text-lg transition-all duration-300 relative overflow-hidden group border-2 flex items-center justify-between",
                      !isAnswerRevealed && isSelected 
                        ? "border-orange-500 bg-orange-100 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100 shadow-[0_10px_25px_rgba(249,115,22,0.15)] ring-4 ring-orange-500/20 transform scale-[1.02] cursor-pointer"
                        : !isAnswerRevealed && "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
                      isAnswerRevealed && showCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 shadow-sm",
                      isAnswerRevealed && showIncorrect && "border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-900 dark:text-rose-100 shadow-sm",
                      isAnswerRevealed && !showCorrect && !showIncorrect && "border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/30 text-slate-400 dark:text-slate-600 opacity-60 grayscale cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors",
                        !isAnswerRevealed && isSelected ? "bg-orange-500 text-white shadow-md font-black" : "",
                        !isAnswerRevealed && !isSelected ? "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold group-hover:bg-orange-200 dark:group-hover:bg-orange-900/40 group-hover:text-orange-700 dark:group-hover:text-orange-300" : "",
                        isAnswerRevealed && showCorrect ? "bg-emerald-500 text-white font-black" : "",
                        isAnswerRevealed && showIncorrect ? "bg-rose-500 text-white font-black" : "",
                        isAnswerRevealed && !showCorrect && !showIncorrect ? "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-500 font-bold" : ""
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
              <div className="mb-4 p-4 rounded-2xl bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 shadow-sm flex items-start gap-3 animate-in slide-in-from-bottom-4 fade-in duration-500 shrink-0">
                <Lightbulb className="h-6 w-6 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className={cn("font-black text-lg mb-1", selectedOption === currentQuestion.correctAnswer ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                    {selectedOption === currentQuestion.correctAnswer ? "Correct!" : "Nice try!"}
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 font-medium text-sm sm:text-base leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            )}

            {/* Spacer if explanation isn't visible to prevent button jump */}
            {!isAnswerRevealed && <div className="flex-1 min-h-[4rem]" />}

            {/* Footer / Submission */}
            <div className="flex justify-end pt-4 border-t font-sans border-slate-100 dark:border-slate-800 mt-auto">
              <button 
                onClick={handleSubmit}
                className={cn(
                  "px-8 sm:px-10 py-3 rounded-full font-black text-base transition-all duration-300 shadow-lg",
                  selectedOption !== null 
                    ? "bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 hover:shadow-xl active:translate-y-0 active:shadow-md"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"
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
