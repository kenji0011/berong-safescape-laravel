import React, { useState, useEffect } from "react"
import { Link } from '@inertiajs/react'
import { ArrowLeft, RotateCcw, Trophy, Sparkles } from "lucide-react"
import DashboardLayout from "@/Layouts/DashboardLayout"
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

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched) return

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
        newCards[first].isMatched = true
        newCards[second].isMatched = true
        setCards(newCards)
        setMatches((prev) => prev + 1)
        setFlippedIndices([])
        setIsLocked(false)
      } else {
        setTimeout(() => {
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
      <div className="min-h-screen relative flex flex-col font-sans bg-gradient-to-br from-[#F0FDFA] via-[#CCFBF1] to-[#99F6E4] selection:bg-teal-300 selection:text-teal-900">
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-10 -right-20 w-80 h-80 rounded-full bg-teal-400/30 blur-3xl opacity-70 animate-pulse duration-1000" />
          <div className="absolute bottom-10 -left-20 w-96 h-96 rounded-full bg-cyan-400/30 blur-3xl opacity-70" />
        </div>
        
        <div className="relative z-10 w-full flex-1 flex items-center justify-center pt-6 pb-12">
          <div className="max-w-xl mx-auto w-full px-4 sm:px-6">
            <div className="w-full bg-white/80 backdrop-blur-xl border border-white/60 rounded-[3rem] p-10 sm:p-14 shadow-[0_20px_60px_rgba(20,184,166,0.15)] flex flex-col items-center text-center transform transition-all duration-700 animate-in fade-in zoom-in">
              <div className="text-8xl md:text-9xl mb-6 animate-bounce-slow drop-shadow-2xl">🏆</div>
              <h2 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 tracking-tight mb-4 drop-shadow-sm">You Won!</h2>
              <p className="text-lg sm:text-xl font-bold text-slate-600 mb-2">All matches found!</p>
              <p className="text-lg font-medium text-slate-500 mb-10 bg-teal-50 px-6 py-2 rounded-2xl border border-teal-100 shadow-sm w-full">
                It took you <span className="text-teal-600 font-black mx-1 text-2xl">{moves}</span> moves.
              </p>
              <div className="flex flex-col sm:flex-row w-full gap-4">
                <button 
                  onClick={initGame}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-[0_8px_30px_rgba(20,184,166,0.3)] hover:shadow-[0_15px_40px_rgba(20,184,166,0.4)] hover:-translate-y-1 active:translate-y-0 px-8 py-4 rounded-full font-black text-lg transition-all duration-300"
                >
                  Play Again
                </button>
                <Link 
                  href="/kids" 
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
    <div className="min-h-screen relative flex flex-col font-sans bg-gradient-to-br from-[#F0FDFA] via-[#CCFBF1] to-[#99F6E4] selection:bg-teal-300 selection:text-teal-900">
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 -left-32 w-96 h-96 rounded-full bg-teal-400/20 blur-3xl opacity-60" />
        <div className="absolute bottom-20 -right-20 w-80 h-80 rounded-full bg-cyan-400/30 blur-3xl opacity-60 animate-pulse duration-1000" />
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col py-4">
        {/* Ghost Header - absolute positioned to save vertical space */}
        <div className="absolute top-2 left-4 z-20">
          <Link 
            href="/kids" 
            className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-teal-600 transition-all text-sm bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/60 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Activities
          </Link>
        </div>

        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex-1 flex items-center justify-center">
          <div className="w-full bg-white/90 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_25px_60px_rgba(20,184,166,0.15)] overflow-hidden lg:max-h-[85vh] flex flex-col">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 tracking-tight">
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

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 flex-1">
              {cards.map((card, idx) => (
                <div 
                  key={card.id}
                  onClick={() => handleCardClick(idx)}
                  className={cn(
                    "aspect-square rounded-2xl sm:rounded-[2rem] shadow-sm cursor-pointer transition-all duration-300 flex items-center justify-center transform",
                    card.isFlipped || card.isMatched 
                      ? "bg-white border-2 border-teal-100 shadow-[0_10px_20px_rgba(20,184,166,0.1)] scale-[1.02]"
                      : "bg-gradient-to-br from-[#2DD4BF] to-[#0891B2] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(20,184,166,0.3)] active:scale-[0.98]"
                  )}
                >
                  {card.isFlipped || card.isMatched ? (
                    <span className="text-4xl sm:text-5xl drop-shadow-md">
                      {card.emoji}
                    </span>
                  ) : (
                    <span className="text-4xl sm:text-5xl font-black text-white/50 drop-shadow-sm group-hover:text-white/80 transition-colors">?</span>
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
