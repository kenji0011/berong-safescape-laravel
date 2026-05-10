import React, { useState, useEffect } from "react"
import { Link, router } from '@inertiajs/react'
import { ArrowLeft, CheckCircle, XCircle, Lightbulb, Flame, Zap } from "lucide-react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import axios from "axios"
import { cn } from "@/lib/utils"
import confetti from 'canvas-confetti'

type Question = {
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
};

const quizData = {
  easy: [
    { text: "What should you do if your clothes catch on fire?", options: ["Run fast", "Stop, Drop, and Roll", "Jump up and down", "Hide under a bed"], correctAnswer: "Stop, Drop, and Roll", explanation: "Stop, Drop, and Roll helps put out the flames on your clothes!" },
    { text: "What is the very first thing you do if you hear a fire alarm?", options: ["Hide in the closet", "Pack your toys", "Get out safely and quickly", "Look for the fire"], correctAnswer: "Get out safely and quickly", explanation: "Always prioritize getting out safely and quickly over material items!" },
    { text: "When escaping a fire, if there is smoke, you should...", options: ["Crawl low under the smoke", "Run fast and breathe deep", "Wave a towel to clear it", "Walk normally"], correctAnswer: "Crawl low under the smoke", explanation: "Smoke rises naturally, so crawling low keeps you in the cleanest air." },
    { text: "Who should you call if there is a fire?", options: ["The pizza delivery", "Your friends", "Ghostbusters", "911 / Emergency Number"], correctAnswer: "911 / Emergency Number", explanation: "911 or your local emergency number will send the fire department to help you right away." },
    { text: "Should you ever hide from firefighters?", options: ["Yes, they look scary", "No, they are there to help you!", "Only if you are playing hide and seek", "Sometimes"], correctAnswer: "No, they are there to help you!", explanation: "Firefighters wear masks and heavy gear that might look scary, but they are your friends there to save you." }
  ],
  medium: [
    { text: "What is the best way to check if a closed door is safe to open during a fire?", options: ["Touch the doorknob with your palm", "Use the back of your hand to feel the door", "Kick the door open", "Look under the crack"], correctAnswer: "Use the back of your hand to feel the door", explanation: "The back of your hand is very sensitive to heat and won't get burned as easily as your palm." },
    { text: "How often should you test the smoke alarms in your home?", options: ["Once a year", "Every day", "Once a month", "Only when they beep"], correctAnswer: "Once a month", explanation: "Testing smoke alarms once a month ensures they are always ready to protect you." },
    { text: "What is an EDITH plan?", options: ["Emergency Door In The House", "Exit Drills In The Home", "Every Dog Is Trained to Help", "Extra Doors In The Hallway"], correctAnswer: "Exit Drills In The Home", explanation: "EDITH stands for Exit Drills In The Home, which means practicing your escape plan!" },
    { text: "Where is the safest place to meet your family after escaping a fire?", options: ["In the living room", "A pre-arranged meeting spot outside", "At the neighbor's back porch", "In the car"], correctAnswer: "A pre-arranged meeting spot outside", explanation: "Having a specific meeting spot outside like a mailbox or tree ensures everyone is accounted for safely." },
    { text: "If a small pan catches fire while cooking, what is the safest thing to do?", options: ["Throw water on it", "Blow on it", "Cover it with a lid to smother the fire", "Carry it outside"], correctAnswer: "Cover it with a lid to smother the fire", explanation: "Covering the pan removes the oxygen the fire needs to burn. Never use water on a grease fire!" }
  ],
  hard: [
    { text: "If you find matches or a lighter lying around, what is the safest thing to do?", options: ["Throw them in the trash", "Hide them so no one else finds them", "Leave them alone and tell an adult right away", "Try to light one outside"], correctAnswer: "Leave them alone and tell an adult right away", explanation: "Matches and lighters are tools for adults, not toys. Always let an adult handle them safely." },
    { text: "What should you do if your favorite pet or toy is left inside a burning building?", options: ["Run back inside quickly to get them", "Cry and wait by the door", "Ask a friend to go in with you", "Never go back inside; tell a firefighter right away"], correctAnswer: "Never go back inside; tell a firefighter right away", explanation: "Firefighters are trained and have special gear to rescue pets. You should never go back inside a burning building for any reason!" },
    { text: "When you call 911 or your local emergency number, what is the most important information to give them?", options: ["Your favorite color", "Your name, address, and what the emergency is", "How many toys you have", "The time of day"], correctAnswer: "Your name, address, and what the emergency is", explanation: "The operator needs to know exactly where you are and what is happening so they can send the right help immediately." },
    { text: "Why is it important to close doors behind you when escaping a fire?", options: ["To keep the house neat", "So robbers can't get in", "To slow down the fire and smoke from spreading", "To keep your pets inside"], correctAnswer: "To slow down the fire and smoke from spreading", explanation: "Closing doors cuts off oxygen to the fire and creates a barrier against smoke, giving you more time to escape." },
    { text: "If there is a fire and you are trapped in your room, what should you do?", options: ["Hide under the bed or in the closet", "Open the window and wave a bright cloth while yelling for help", "Go to sleep and wait", "Try to run through the fire"], correctAnswer: "Open the window and wave a bright cloth while yelling for help", explanation: "Never hide! Go to a window, yell loudly, and wave a bright cloth so firefighters can easily find and rescue you." }
  ]
};

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const QuizPage = () => {
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([])
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedOptionText, setSelectedOptionText] = useState<string | null>(null)
  const [isFinished, setIsFinished] = useState(false)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)
  const [showLevelTransition, setShowLevelTransition] = useState(false)
  
  const [soundEffects] = useState({
    click: new Audio('/sounds/click.mp3'),
    match: new Audio('/sounds/match.mp3'),
    wrong: new Audio('/sounds/wrong.mp3'),
    win: new Audio('/sounds/win.mp3'),
    failed: new Audio('/sounds/failed.mp3')
  })

  useEffect(() => {
    startQuiz(false);
  }, []);

  const playSound = (type: 'click' | 'match' | 'wrong' | 'win' | 'failed') => {
    const audio = soundEffects[type]
    if (audio) {
      audio.currentTime = 0
      audio.volume = 0.4
      audio.play().catch(e => console.log("Audio play failed:", e))
    }
  }

  const startQuiz = (playStartSound = true) => {
    const easy = shuffleArray(quizData.easy).map(q => ({ ...q, difficulty: 'Easy' as const, options: shuffleArray(q.options) }));
    const medium = shuffleArray(quizData.medium).map(q => ({ ...q, difficulty: 'Medium' as const, options: shuffleArray(q.options) }));
    const hard = shuffleArray(quizData.hard).map(q => ({ ...q, difficulty: 'Hard' as const, options: shuffleArray(q.options) }));
    
    setActiveQuestions([...easy, ...medium, ...hard]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOptionText(null);
    setIsAnswerRevealed(false);
    setIsFinished(false);
    setShowLevelTransition(false);
    
    if (playStartSound) {
      playSound('click');
    }
  };

  const triggerFireworks = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const handleSubmit = () => {
    if (selectedOptionText === null) return
    
    if (!isAnswerRevealed) {
      if (selectedOptionText === activeQuestions[currentQuestionIndex].correctAnswer) {
        setScore(prev => prev + 1)
        playSound('match')
      } else {
        playSound('wrong')
      }
      setIsAnswerRevealed(true)
      return
    }

    if (currentQuestionIndex < activeQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex)
      setSelectedOptionText(null)
      setIsAnswerRevealed(false)
      
      // Trigger Level Up transition when moving to Medium (5) or Hard (10)
      if (nextIndex === 5 || nextIndex === 10) {
        setShowLevelTransition(true);
      }
    } else {
      setIsFinished(true)
      
      // We check against score since it has already been correctly incremented
      if (score === activeQuestions.length) {
        playSound('win')
        triggerFireworks()
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

  // Waiting for questions to load
  if (activeQuestions.length === 0) {
    return <div className="min-h-screen bg-blue-50 dark:bg-slate-950"></div>;
  }

  // View: Results Screen
  if (isFinished) {
    const isPerfect = score === activeQuestions.length
    
    return (
      <div className="w-full flex-1 min-h-[calc(100vh-100px)] flex items-center justify-center bg-blue-50 dark:bg-slate-950 p-4 sm:p-8 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary opacity-10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-600 opacity-10 blur-[100px] rounded-full"></div>
        
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-12 shadow-[0_32px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.3)] border-[4px] sm:border-[6px] border-white dark:border-slate-800 text-center max-w-lg w-full relative z-10 transition-colors">
          
          {isPerfect ? (
            <div className="animate-in zoom-in duration-700">
              <div className="h-24 w-24 sm:h-32 sm:w-32 bg-yellow-400 rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center text-5xl sm:text-7xl mx-auto mb-4 sm:mb-6 shadow-xl border-4 border-white dark:border-slate-800 transform -rotate-6">
                🏆
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1 sm:mb-2 tracking-tighter">MASTERPIECE!</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold mb-6 sm:mb-8 text-sm sm:text-base">You've earned the <span className="text-yellow-600 dark:text-yellow-400">Quiz Hero</span> badge!</p>
            </div>
          ) : (
            <div className="animate-in zoom-in duration-700">
              <div className="h-24 w-24 sm:h-28 sm:w-28 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center text-5xl sm:text-6xl mx-auto mb-4 sm:mb-6 shadow-inner border-2 border-slate-200 dark:border-slate-700">
                ⭐
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1 sm:mb-2 tracking-tighter">GOOD EFFORT!</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold mb-6 sm:mb-8 px-2 sm:px-4 text-sm sm:text-base">
                Score <span className="text-primary">15/15</span> to unlock the <span className="text-slate-700 dark:text-slate-200">Quiz Hero</span> badge.
              </p>
            </div>
          )}

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-8 sm:mb-10 border border-slate-100 dark:border-slate-700">
             <span className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Final Score</span>
             <div className="flex items-center justify-center gap-2 sm:gap-3">
                <span className={cn("text-5xl sm:text-6xl font-black", isPerfect ? "text-emerald-500" : "text-orange-500")}>{score}</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-300 dark:text-slate-600 mt-1 sm:mt-2">/ {activeQuestions.length}</span>
             </div>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4">
            {!isPerfect && (
              <button
                onClick={() => startQuiz(true)}
                className="w-full bg-primary hover:bg-red-500 text-white font-black py-4 sm:py-5 rounded-xl sm:rounded-2xl border-b-[4px] sm:border-b-[6px] border-red-800 active:border-b-0 active:translate-y-[4px] sm:active:translate-y-[6px] transition-all uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
              >
                Try Again
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </button>
            )}
            
            <Link
              href="/kids/challenges"
              className={cn(
                "w-full font-black py-4 sm:py-5 rounded-xl sm:rounded-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base",
                isPerfect 
                  ? "bg-primary hover:bg-red-500 text-white border-b-[4px] sm:border-b-[6px] border-red-800 active:border-b-0 active:translate-y-[4px] sm:active:translate-y-[6px] shadow-xl" 
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

  // View: Active Quiz
  const currentQuestion = activeQuestions[currentQuestionIndex]
  const progressPercentage = ((currentQuestionIndex) / activeQuestions.length) * 100;

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
        {/* Header */}
        <div className="absolute top-2 left-4 z-20 flex gap-2">
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
          
          <div className="flex flex-col flex-1 w-full bg-white dark:bg-slate-900 border border-white/60 dark:border-slate-800/60 rounded-[2.5rem] p-5 sm:p-8 shadow-[0_25px_60px_rgba(234,88,12,0.15)] overflow-hidden transition-colors duration-500 relative">
            
            {showLevelTransition ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center animate-in zoom-in duration-500 py-10">
                <div className={cn(
                  "h-24 w-24 rounded-3xl flex items-center justify-center text-white mb-6 shadow-lg mx-auto transform -rotate-6",
                  currentQuestionIndex === 5 ? "bg-orange-500" : "bg-rose-500"
                )}>
                  {currentQuestionIndex === 5 ? <Flame className="h-12 w-12" strokeWidth={2.5} /> : <Zap className="h-12 w-12" strokeWidth={2.5} />}
                </div>
                
                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">
                  LEVEL UP!
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 text-lg max-w-md mx-auto">
                  You are entering the <span className={currentQuestionIndex === 5 ? "text-orange-600 dark:text-orange-400" : "text-rose-600 dark:text-rose-400"}>{currentQuestionIndex === 5 ? 'Medium' : 'Hard'}</span> difficulty stage. Get ready for tougher questions!
                </p>
                
                <button
                  onClick={() => setShowLevelTransition(false)}
                  className={cn(
                    "w-full sm:w-auto px-8 py-4 text-white font-black rounded-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:translate-y-[6px] active:shadow-sm border-b-[6px] active:border-b-0 mx-auto",
                    currentQuestionIndex === 5 
                      ? "bg-orange-500 hover:bg-orange-400 border-orange-700" 
                      : "bg-rose-500 hover:bg-rose-400 border-rose-700"
                  )}
                >
                  Continue to {currentQuestionIndex === 5 ? 'Medium' : 'Hard'}
                  <ArrowLeft className="h-5 w-5 rotate-180" />
                </button>
              </div>
            ) : (
              <>
                {/* Header: Progress & Score */}
                <div className="flex items-center justify-between font-extrabold text-slate-400 dark:text-slate-500 mb-2 text-sm uppercase tracking-wider">
                  <span>Question <span className="text-orange-500 text-base">{currentQuestionIndex + 1}</span> of {activeQuestions.length}</span>
                  <span className="bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full shadow-inner border border-orange-200/50 dark:border-orange-900/30">Score: {score}</span>
                </div>

                {/* Difficulty Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn(
                    "px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-full border shadow-sm",
                    currentQuestion.difficulty === 'Easy' ? "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400" : "",
                    currentQuestion.difficulty === 'Medium' ? "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400" : "",
                    currentQuestion.difficulty === 'Hard' ? "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-400" : ""
                  )}>
                    {currentQuestion.difficulty} Level
                  </span>
                </div>

                {/* Custom Progress Bar */}
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-5 overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-700/50">
                  <div 
                    className="h-full bg-orange-500 rounded-full transition-all duration-700 ease-out" 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                {/* Question Statement */}
                <h2 className="text-2xl sm:text-[28px] font-black text-slate-800 dark:text-white mb-5 tracking-tight leading-tight">
                  {currentQuestion.text}
                </h2>

                {/* Options Grid */}
                <div className="space-y-2.5 mb-4 flex-none">
                  {currentQuestion.options.map((optionText, index) => {
                    const isSelected = selectedOptionText === optionText
                    const isCorrectOption = optionText === currentQuestion.correctAnswer
                    const showCorrect = isAnswerRevealed && isCorrectOption
                    const showIncorrect = isAnswerRevealed && isSelected && !isCorrectOption

                    return (
                      <div 
                        key={index}
                        onClick={() => { 
                          if (!isAnswerRevealed) {
                            setSelectedOptionText(optionText)
                            playSound('click')
                          } 
                        }}
                        className={cn(
                          "w-full rounded-2xl p-3.5 sm:p-4 text-left font-bold text-base sm:text-[17px] transition-all duration-300 relative overflow-hidden group border-2 flex items-center justify-between",
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
                            "h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-sm transition-colors",
                            !isAnswerRevealed && isSelected ? "bg-orange-500 text-white shadow-md font-black" : "",
                            !isAnswerRevealed && !isSelected ? "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold group-hover:bg-orange-200 dark:group-hover:bg-orange-900/40 group-hover:text-orange-700 dark:group-hover:text-orange-300" : "",
                            isAnswerRevealed && showCorrect ? "bg-emerald-500 text-white font-black" : "",
                            isAnswerRevealed && showIncorrect ? "bg-rose-500 text-white font-black" : "",
                            isAnswerRevealed && !showCorrect && !showIncorrect ? "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-500 font-bold" : ""
                          )}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          {optionText}
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
                      <h4 className={cn("font-black text-lg mb-1", selectedOptionText === currentQuestion.correctAnswer ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                        {selectedOptionText === currentQuestion.correctAnswer ? "Correct!" : "Nice try!"}
                      </h4>
                      <p className="text-slate-700 dark:text-slate-300 font-medium text-sm sm:text-[15px] leading-relaxed">
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
                      selectedOptionText !== null 
                        ? "bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 hover:shadow-xl active:translate-y-0 active:shadow-md"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"
                    )}
                    disabled={selectedOptionText === null}
                  >
                    {!isAnswerRevealed ? 'Submit Answer' : (currentQuestionIndex < activeQuestions.length - 1 ? 'Next Question' : 'Finish Quiz')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

QuizPage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default QuizPage
