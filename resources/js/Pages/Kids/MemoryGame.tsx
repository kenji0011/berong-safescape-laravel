import React, { useState, useEffect } from "react"
import { Link } from '@inertiajs/react'
import { ArrowLeft, RotateCcw } from "lucide-react"
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
      <div className="min-h-screen relative flex flex-col font-sans">
        <div
          className="fixed inset-0 opacity-20 bg-cover z-0 pointer-events-none"
          style={{ backgroundImage: "url('/web-background-image.jpg')", backgroundPosition: 'center' }}
        />
        <div className="relative z-10 w-full flex-1 flex items-center justify-center pt-6 pb-12">
          <div className="max-w-xl mx-auto w-full px-4 sm:px-6">
            <div className="w-full bg-[#f4fbff] border-[4px] border-slate-700 rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col items-center text-center">
              <div className="text-7xl mb-6">🏆</div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-800 mb-4">You Won!</h2>
              <p className="text-xl sm:text-2xl font-bold text-slate-600 mb-2">All matches found!</p>
              <p className="text-lg font-medium text-slate-500 mb-10">
                It took you <span className="text-blue-600 font-bold">{moves}</span> moves.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={initGame}
                  className="bg-blue-500 text-white border-[3px] border-blue-700 shadow-[0_6px_0_0_#1d4ed8] hover:-translate-y-1 hover:shadow-[0_8px_0_0_#1d4ed8] active:translate-y-0 active:shadow-[0_0px_0_0_#1d4ed8] px-8 py-4 rounded-2xl font-bold text-xl transition-all"
                >
                  Play Again
                </button>
                <Link 
                  href="/kids" 
                  className="bg-slate-200 text-slate-700 border-[3px] border-slate-300 shadow-[0_6px_0_0_#94a3b8] hover:-translate-y-1 hover:shadow-[0_8px_0_0_#94a3b8] active:translate-y-0 active:shadow-[0_0px_0_0_#94a3b8] px-8 py-4 rounded-2xl font-bold text-xl transition-all flex items-center justify-center"
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
    <div className="min-h-screen relative flex flex-col font-sans">
      <div
        className="fixed inset-0 opacity-20 bg-cover z-0 pointer-events-none"
        style={{ backgroundImage: "url('/web-background-image.jpg')", backgroundPosition: 'center' }}
      />

      <div className="relative z-10 w-full flex-1 flex flex-col pt-6 pb-12">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pb-6">
          <Link 
            href="/kids" 
            className="inline-flex items-center gap-2 text-slate-800 font-bold hover:text-black transition-all text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Activities
          </Link>
        </div>

        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex-1 flex items-center justify-center">
          <div className="w-full bg-[#f4fbff] border border-slate-200/50 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl overflow-hidden">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Memory Match Game
              </h2>
              <button onClick={initGame} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm text-sm">
                <RotateCcw className="h-4 w-4" />
                New Game
              </button>
            </div>

            <div className="flex items-center justify-between mb-8 px-2">
              <div>
                <div className="text-slate-500 font-medium text-sm mb-1">Moves</div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 leading-none">{moves}</div>
              </div>
              <div className="text-right">
                <div className="text-slate-500 font-medium text-sm mb-1">Matches</div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 leading-none">{matches} / 6</div>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 sm:gap-6 perspective-1000">
              {cards.map((card, idx) => (
                <div 
                  key={card.id}
                  onClick={() => handleCardClick(idx)}
                  className={cn(
                    "aspect-square rounded-2xl shadow-sm cursor-pointer transition-all duration-300 flex items-center justify-center transform",
                    card.isFlipped || card.isMatched 
                      ? "bg-white border-2 border-slate-100" 
                      : "bg-gradient-to-br from-[#c69cf7] to-[#9752fe] hover:-translate-y-1 hover:shadow-md hover:brightness-110 active:scale-95"
                  )}
                >
                  {card.isFlipped || card.isMatched ? (
                    <span className="text-4xl sm:text-5xl drop-shadow-none">
                      {card.emoji}
                    </span>
                  ) : (
                    <span className="text-4xl sm:text-5xl font-black text-[#ff1f40] drop-shadow-sm">?</span>
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
