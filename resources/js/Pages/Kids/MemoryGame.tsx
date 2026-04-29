import React, { useState, useEffect } from "react"
import { Link } from '@inertiajs/react'
import { ArrowLeft, RotateCcw, Trophy, Sparkles } from "lucide-react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import axios from "axios"
import { cn } from "@/lib/utils"

const EMOJIS = ["🚒", "🔥", "🧯", "🧑‍🚒", "🚰", "🚨"]

type Card = {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const generateCards = (): Card[] => {
  return [...EMOJIS, ...EMOJIS]
    .sort(() => Math.random() - 0.5)
    .map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }))
}

const MemoryGamePage = () => {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedIndices, setFlippedIndices] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [isLocked, setIsLocked] = useState(false)

  const initGame = () => {
    setCards(generateCards())
    setFlippedIndices([])
    setMoves(0)
    setMatches(0)
    setIsLocked(false)
  }

  useEffect(() => {
    initGame()
  }, [])

  const [soundEffects] = useState({
    click: new Audio('/sounds/click.mp3'),
    match: new Audio('/sounds/match.mp3'),
    wrong: new Audio('/sounds/wrong.mp3'),
    win: new Audio('/sounds/win.mp3')
  })

  const playSound = (type: 'click' | 'match' | 'wrong' | 'win') => {
    const audio = soundEffects[type]
    if (audio) {
      audio.currentTime = 0
      audio.volume = 0.4
      audio.play().catch(e => console.log("Audio play failed:", e))
    }
  }

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched) return

    playSound('click')
    const newCards = [...cards]
    newCards[index].isFlipped = true
    setCards(newCards)

    const newFlippedIndices = [...flippedIndices, index]
    setFlippedIndices(newFlippedIndices)

    if (newFlippedIndices.length === 2) {
      setIsLocked(true)
      setMoves((prev) => prev + 1)

      const [first, second] = newFlippedIndices

      if (newCards[first].emoji === newCards[second].emoji) {
        setTimeout(() => {
          newCards[first].isMatched = true
          newCards[second].isMatched = true
          setCards(newCards)
          setMatches((prev) => {
            const next = prev + 1
            if (next === 6) {
              playSound('win')
              
              // Award Memory Master Badge
              axios.post('/api/badges/award', {
                badge_id: 'memory_master',
                badge_name: 'Memory Master',
                badge_icon: '🧠'
              }).catch(err => console.error("Failed to award badge:", err.response?.data || err.message))
            }
            else playSound('match')
            return next
          })
          setFlippedIndices([])
          setIsLocked(false)
        }, 500)
      } else {
        setTimeout(() => {
          playSound('wrong')
          const resetCards = [...newCards]
          resetCards[first].isFlipped = false
          resetCards[second].isFlipped = false
          setCards(resetCards)
          setFlippedIndices([])
          setIsLocked(false)
        }, 1000)
      }
    }
  }

  if (matches === 6) {
    return (
      <div className="min-h-screen relative flex flex-col font-sans bg-blue-50 selection:bg-teal-300 selection:text-teal-900">
        {/* Heroic Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/challenges-bg.png" 
            alt="" 
            className="w-full h-full object-cover opacity-30 mix-blend-multiply" 
          />
          <div className="absolute inset-0 bg-background/80"></div>
        </div>
        
        <div className="relative z-10 w-full flex-1 flex items-center justify-center pt-6 pb-12">
          <div className="max-w-xl mx-auto w-full px-4 sm:px-6">
            <div className="w-full bg-white dark:bg-slate-900 border border-white/60 rounded-[3rem] p-10 sm:p-14 shadow-[0_20px_60px_rgba(20,184,166,0.15)] flex flex-col items-center text-center transform transition-all duration-700 animate-in fade-in zoom-in">
              <div className="text-8xl md:text-9xl mb-6 animate-bounce-slow drop-shadow-2xl">🏆</div>
              <h2 className="text-4xl sm:text-5xl font-black text-teal-600 tracking-tight mb-4 drop-shadow-sm">You Won!</h2>
              <p className="text-lg sm:text-xl font-bold text-slate-600 mb-2">All matches found!</p>
              <p className="text-lg font-medium text-slate-500 mb-10 bg-teal-50 px-6 py-2 rounded-2xl border border-teal-100 shadow-sm w-full">
                It took you <span className="text-teal-600 font-black mx-1 text-2xl">{moves}</span> moves.
              </p>
              <div className="flex flex-col sm:flex-row w-full gap-4">
                <button 
                  onClick={initGame}
                  className="flex-1 bg-teal-500 text-white shadow-lg hover:-translate-y-1 active:translate-y-0 px-8 py-4 rounded-full font-black text-lg transition-all duration-300"
                >
                  Play Again
                </button>
                <Link 
                  href="/kids/challenges" 
                  className="flex-1 bg-white text-slate-600 border-2 border-slate-200 hover:border-teal-300 hover:bg-teal-50 shadow-sm hover:shadow-md hover:-translate-y-1 active:translate-y-0 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center text-center"
                >
                  Go Back
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex flex-col font-sans bg-blue-50 selection:bg-teal-300 selection:text-teal-900">
      {/* Heroic Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/challenges-bg.png" 
          alt="" 
          className="w-full h-full object-cover opacity-30 mix-blend-multiply" 
        />
        <div className="absolute inset-0 bg-background/80"></div>
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col py-4 pb-28 sm:pb-4">
        {/* Ghost Header - absolute positioned to save vertical space */}
        <div className="absolute top-2 left-4 z-20">
          <Link 
            href="/kids/challenges" 
            className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-teal-600 transition-all text-sm bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-white/60 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Activities
          </Link>
        </div>

        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex-1 flex items-start justify-center pt-12 sm:pt-4">
          <div className="w-full bg-white dark:bg-slate-900 border border-white/60 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_25px_60px_rgba(20,184,166,0.15)] overflow-hidden lg:max-h-[85vh] flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-teal-600 tracking-tight">
                Memory Match Game
              </h2>
              <button onClick={initGame} className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-teal-200 rounded-full font-bold text-teal-700 hover:bg-teal-50 transition-colors shadow-sm text-sm hover:shadow-md hover:-translate-y-0.5">
                <RotateCcw className="h-4 w-4" />
                New Game
              </button>
            </div>

            <div className="flex items-center justify-between mb-6 px-6 py-3 bg-teal-50/50 rounded-2xl border border-teal-100 shadow-sm">
              <div>
                <div className="text-teal-600/70 font-bold text-xs sm:text-sm uppercase tracking-widest mb-1">Moves</div>
                <div className="text-3xl sm:text-4xl font-black text-teal-900 leading-none">{moves}</div>
              </div>
              <div className="text-right">
                <div className="text-teal-600/70 font-bold text-xs sm:text-sm uppercase tracking-widest mb-1">Matches</div>
                <div className="text-3xl sm:text-4xl font-black text-teal-900 leading-none">{matches} / 6</div>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 flex-1">
              {cards.map((card, idx) => (
                <div 
                  key={card.id}
                  onClick={() => handleCardClick(idx)}
                  className={cn(
                    "aspect-square rounded-2xl sm:rounded-[2rem] shadow-sm cursor-pointer transition-all duration-300 flex items-center justify-center transform",
                    card.isFlipped || card.isMatched 
                      ? "bg-white border-2 border-teal-100 shadow-[0_10px_20px_rgba(20,184,166,0.1)] scale-[1.02]"
                      : "bg-teal-500 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]"
                  )}
                >
                  {card.isFlipped || card.isMatched ? (
                    <span className="text-3xl sm:text-5xl drop-shadow-md">
                      {card.emoji}
                    </span>
                  ) : (
                    <span className="text-3xl sm:text-5xl font-black text-white/50 drop-shadow-sm group-hover:text-white/80 transition-colors">?</span>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

MemoryGamePage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default MemoryGamePage
