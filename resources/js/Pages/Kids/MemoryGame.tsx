import React, { useState, useEffect } from "react"
import { Link } from '@inertiajs/react'
import { ArrowLeft, RotateCcw, Trophy, Sparkles } from "lucide-react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import axios from "axios"
import { cn } from "@/lib/utils"
import { playSound as playSoundUtil } from '@/lib/audio'

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
  const [hasStarted, setHasStarted] = useState(false)

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

  const soundMap: Record<string, string> = {
    click: '/sounds/click.mp3',
    match: '/sounds/match.mp3',
    wrong: '/sounds/wrong.mp3',
    win: '/sounds/win.mp3'
  }

  const playSound = (type: 'click' | 'match' | 'wrong' | 'win') => {
    playSoundUtil(soundMap[type], 'games')
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
                badge_icon: '/memory_hall.png'
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
      <div className="-mt-[104px] sm:-mt-[120px] pt-[104px] sm:pt-[120px] min-h-[calc(100vh+104px)] sm:min-h-[calc(100vh+120px)] relative flex flex-col font-sans bg-blue-50 dark:bg-slate-950 selection:bg-teal-300 selection:text-teal-900 transition-colors duration-500">
        {/* Heroic Background */}
        <div className="fixed top-0 left-0 w-full z-0 overflow-hidden pointer-events-none" style={{ height: '100vh', minHeight: '100lvh' }}>
          <img 
            src="/challenges-bg.png" 
            alt="" 
            className="w-full h-full object-cover opacity-100 dark:opacity-50 transition-opacity duration-500" 
          />
          <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/60 transition-colors duration-500"></div>
        </div>
        
        <div className="relative z-10 w-full flex-1 flex items-center justify-center pt-6 pb-12">
          <div className="max-w-xl mx-auto w-full px-4 sm:px-6">
            <div className="w-full bg-white dark:bg-slate-900 border border-white/60 dark:border-slate-800/60 rounded-[3rem] p-10 sm:p-14 shadow-[0_20px_60px_rgba(20,184,166,0.15)] flex flex-col items-center text-center transform transition-all duration-700 animate-in fade-in zoom-in">
              <div className="w-32 h-32 md:w-48 md:h-48 mb-6 animate-bounce-slow drop-shadow-2xl mx-auto">
                <img src="/memory_hall.png" alt="Memory Master Badge" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-teal-600 dark:text-teal-400 tracking-tight mb-4 drop-shadow-sm">You Won!</h2>
              <p className="text-lg sm:text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">All matches found!</p>
              <div className="text-lg font-medium text-slate-500 dark:text-slate-400 mb-10 bg-teal-50 dark:bg-teal-950/30 px-6 py-2 rounded-2xl border border-teal-100 dark:border-teal-900/50 shadow-sm w-full">
                It took you <span className="text-teal-600 dark:text-teal-400 font-black mx-1 text-2xl">{moves}</span> moves.
              </div>
              <div className="flex flex-col sm:flex-row w-full gap-4">
                <button 
                  onClick={initGame}
                  className="flex-1 bg-teal-500 hover:bg-teal-400 text-white shadow-lg hover:-translate-y-1 active:translate-y-0 px-8 py-4 rounded-full font-black text-lg transition-all duration-300 border-b-4 border-teal-700 active:border-b-0 uppercase tracking-widest"
                >
                  Play Again
                </button>
                <Link 
                  href="/kids/challenges" 
                  className="flex-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 shadow-sm hover:shadow-md hover:-translate-y-1 active:translate-y-0 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center text-center uppercase tracking-widest"
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

  if (!hasStarted) {
    return (
      <div className="-mt-[104px] sm:-mt-[120px] pt-[104px] sm:pt-[120px] min-h-screen relative flex flex-col font-sans bg-blue-50 dark:bg-slate-950 selection:bg-teal-300 selection:text-teal-900 transition-colors duration-500">
        <div className="fixed top-0 left-0 w-full z-0 pointer-events-none" style={{ height: '100vh', minHeight: '100lvh' }}>
          <img src="/challenges-bg.png" alt="" className="w-full h-full object-cover opacity-100 dark:opacity-50 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/60 transition-colors duration-500"></div>
        </div>
        
        <div className="absolute top-[112px] sm:top-[128px] left-4 z-[60]">
          <Link href="/kids/challenges" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold hover:text-teal-600 dark:hover:text-teal-400 transition-all text-sm bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-white/60 dark:border-slate-700/60 shadow-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Activities
          </Link>
        </div>
        
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 pb-16 sm:pb-24">
          
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[3rem] shadow-2xl text-center animate-in zoom-in duration-500 transition-colors">
            <div className="w-24 h-24 bg-teal-100 dark:bg-teal-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
               <img src="/memory_hall.png" alt="Memory Game" className="w-16 h-16 object-contain drop-shadow-md" />
            </div>
            <h1 className="text-4xl font-black mb-2 italic text-slate-900 dark:text-white tracking-tight uppercase">MEMORY MATCH</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
               Train your brain! Flip the cards to find matching safety symbols. Can you find all the pairs?
            </p>
            
            <button 
             onClick={() => setHasStarted(true)}
             className="w-full bg-teal-500 hover:bg-teal-400 text-white font-black py-4 rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 text-lg uppercase tracking-widest border-b-4 border-teal-700 active:border-b-0"
            >
               START GAME
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="-mt-[104px] sm:-mt-[120px] pt-[104px] sm:pt-[120px] min-h-screen relative flex flex-col font-sans bg-blue-50 dark:bg-slate-950 selection:bg-teal-300 selection:text-teal-900 transition-colors duration-500">
      {/* Heroic Background */}
      <div className="fixed top-0 left-0 w-full z-0 pointer-events-none" style={{ height: '100vh', minHeight: '100lvh' }}>
        <img 
          src="/challenges-bg.png" 
          alt="" 
          className="w-full h-full object-cover opacity-100 dark:opacity-50 transition-opacity duration-500" 
        />
        <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/60 transition-colors duration-500"></div>
      </div>

      <div className="absolute top-[112px] sm:top-[128px] left-4 z-[60]">
        <Link 
          href="/kids/challenges" 
          className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold hover:text-teal-600 dark:hover:text-teal-400 transition-all text-sm bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-white/60 dark:border-slate-700/60 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Activities
        </Link>
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col py-4 pb-28 sm:pb-4">

        <div className="max-w-[calc(60vh)] sm:max-w-4xl mx-auto w-full px-4 sm:px-6 flex-1 flex items-start justify-center pt-12 sm:pt-4">
          <div className="w-full bg-white dark:bg-slate-900 border border-white/60 dark:border-slate-800/60 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_25px_60px_rgba(20,184,166,0.15)] overflow-hidden lg:max-h-[85vh] flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700 transition-colors">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400 tracking-tight">
                Memory Match Game
              </h2>
              <button onClick={initGame} className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-teal-200 dark:border-slate-700 rounded-full font-bold text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors shadow-sm text-sm hover:shadow-md hover:-translate-y-0.5">
                <RotateCcw className="h-4 w-4" />
                New Game
              </button>
            </div>

            <div className="flex items-center justify-between mb-6 px-6 py-3 bg-teal-50/50 dark:bg-teal-900/20 rounded-2xl border border-teal-100 dark:border-teal-800/50 shadow-sm transition-colors">
              <div>
                <div className="text-teal-600/70 dark:text-teal-400/50 font-bold text-xs sm:text-sm uppercase tracking-widest mb-1">Moves</div>
                <div className="text-3xl sm:text-4xl font-black text-teal-900 dark:text-teal-50 leading-none">{moves}</div>
              </div>
              <div className="text-right">
                <div className="text-teal-600/70 dark:text-teal-400/50 font-bold text-xs sm:text-sm uppercase tracking-widest mb-1">Matches</div>
                <div className="text-3xl sm:text-4xl font-black text-teal-900 dark:text-teal-50 leading-none">{matches} / 6</div>
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
                      ? "bg-white dark:bg-slate-800 border-2 border-teal-100 dark:border-teal-900/50 shadow-[0_10px_20px_rgba(20,184,166,0.1)] scale-[1.02]"
                      : "bg-teal-500 dark:bg-teal-600 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] border-b-4 border-teal-700 dark:border-teal-800"
                  )}
                >
                  {card.isFlipped || card.isMatched ? (
                    <span className="text-3xl sm:text-5xl drop-shadow-md">
                      {card.emoji}
                    </span>
                  ) : (
                    <span className="text-3xl sm:text-5xl font-black text-white/50 dark:text-teal-900/40 drop-shadow-sm group-hover:text-white/80 transition-colors">?</span>
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
