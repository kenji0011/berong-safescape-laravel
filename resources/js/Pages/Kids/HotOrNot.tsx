import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react'
import { Link } from '@inertiajs/react'
import { ArrowLeft, ArrowRight, CheckCircle2, Flame, Box, AlertTriangle, Trophy } from 'lucide-react'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { HotOrNotSkeleton } from '@/Components/dashboard-skeletons'
import axios from 'axios'
import { playSound } from '@/lib/audio'

const ITEMS = [
  { id: 1, name: 'MATCHSTICK', icon: '🔥', type: 'hot', tip: 'Matches and lighters are for adults only. They can start dangerous fires!' },
  { id: 2, name: 'TEDDY BEAR', icon: '🧸', type: 'toy', tip: 'Teddy bears are safe friends to play and cuddle with!' },
  { id: 3, name: 'IRON', icon: '🔌', type: 'hot', tip: 'An iron gets very hot. Never touch it or pull the cord!' },
  { id: 4, name: 'LEGO BLOCK', icon: '🧱', type: 'toy', tip: 'Lego is great for building, but remember to pick them up so no one trips!' },
  { id: 5, name: 'STOVE', icon: '🍳', type: 'hot', tip: 'The stove stays hot even after it is turned off. Stay away from the kitchen when someone is cooking!' },
  { id: 6, name: 'TOY CAR', icon: '🏎️', type: 'toy', tip: 'Vroom! Toy cars are perfect for racing on the floor.' },
  { id: 7, name: 'CANDLE', icon: '🕯️', type: 'hot', tip: 'Candles have real fire. Only adults should handle them!' },
  { id: 8, name: 'DOLL', icon: '🪆', type: 'toy', tip: 'Dolls are safe toys to play house and dress up with.' },
  { id: 9, name: 'FIREWORK', icon: '🎆', type: 'hot', tip: 'Fireworks are loud and hot. Only watch them from far away with a grown-up!' },
  { id: 10, name: 'STORY BOOK', icon: '📚', type: 'toy', tip: 'Books are safe and help you learn amazing things!' },
]

export default function HotOrNot() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'win'>('start')
  const [isLoading, setIsLoading] = useState(true)
  const [deck, setDeck] = useState(ITEMS)
  const [score, setScore] = useState(0)
  const [showIntervention, setShowIntervention] = useState(false)
  const [isAnswering, setIsAnswering] = useState(false)
  
  const playSoundEffect = (type: 'match' | 'wrong' | 'win') => {
    playSound(`/sounds/${type}.mp3`, 'games');
  }

  const progress = (score / ITEMS.length) * 100

  const initGame = () => {
    setDeck([...ITEMS].sort(() => Math.random() - 0.5))
    setScore(0)
    setGameState('playing')
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!deck.length || isAnswering) return
    
    const item = deck[0]
    const isCorrect = (direction === 'left' && item.type === 'hot') || 
                      (direction === 'right' && item.type === 'toy')

    if (isCorrect) {
      playSoundEffect('match')
      const newScore = score + 1
      setScore(newScore)
      
      // Delay removing the item and showing win state to allow animation to play
      if (newScore === ITEMS.length) {
         setDeck(prev => prev.slice(1)) // Remove last item to trigger exit
         
         // Award Safety Scout Badge
         axios.post('/api/badges/award', {
            badge_id: 'safety_scout',
            badge_name: 'Safety Scout',
            badge_icon: '/safety_hall.png'
         }).catch(err => console.error("Failed to award badge:", err.response?.data || err.message))

         setTimeout(() => {
            playSoundEffect('win')
            setGameState('win')
         }, 400)
      } else {
         setDeck(prev => prev.slice(1))
      }
    } else {
      playSoundEffect('wrong')
      setShowIntervention(true)
      setIsAnswering(true)
    }
  }

  const dangerGlow = useMotionValue(0.5)
  const safeGlow = useMotionValue(0.5)
  const dangerBg = useMotionValue(0)
  const safeBg = useMotionValue(0)

  return (
    <div className="-mt-[104px] sm:-mt-[120px] pt-[104px] sm:pt-[120px] min-h-screen relative flex flex-col font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 overflow-hidden select-none">
      {/* Background Zones */}
      <div className="absolute inset-0 flex pointer-events-none overflow-hidden">
         {/* Danger Zone (Left) */}
         <div className="flex-1 relative flex items-center justify-center border-r border-slate-100 dark:border-slate-900/50 overflow-hidden">
            <motion.div 
              style={{ opacity: dangerBg }}
              className="absolute inset-0 bg-rose-500/10"
            />
            <motion.div 
               style={{ opacity: dangerGlow }} 
               className="absolute -left-12 md:-left-24 top-1/2 -translate-y-1/2 flex flex-col items-center z-10"
            >
               <Flame className="h-32 w-32 md:h-64 md:w-64 text-rose-500/80 dark:text-rose-400 transition-all duration-500 dark:drop-shadow-[0_0_35px_rgba(244,63,94,0.6)]" />
            </motion.div>
         </div>
         {/* Safe Zone (Right) */}
         <div className="flex-1 relative flex items-center justify-center border-l border-slate-100 dark:border-slate-900/50 overflow-hidden">
            <motion.div 
              style={{ opacity: safeBg }}
              className="absolute inset-0 bg-emerald-500/10"
            />
            <motion.div 
               style={{ opacity: safeGlow }} 
               className="absolute -right-12 md:-right-24 top-1/2 -translate-y-1/2 flex flex-col items-center z-10"
            >
               <Box className="h-32 w-32 md:h-64 md:w-64 text-emerald-500/80 dark:text-emerald-400 transition-all duration-500 dark:drop-shadow-[0_0_35px_rgba(16,185,129,0.6)]" />
            </motion.div>
         </div>
      </div>

      {/* Ghost Header - absolute positioned to save vertical space */}
      <div className="absolute top-[112px] sm:top-[128px] left-4 right-4 z-[60] flex items-center justify-between pointer-events-none">
        <Link 
          href="/kids/challenges" 
          className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-all text-sm bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-white/60 dark:border-slate-700/50 shadow-sm pointer-events-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Activities
        </Link>
        
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-white/60 dark:border-slate-700/50 shadow-sm pointer-events-auto">
           <CheckCircle2 className="h-4 w-4 text-emerald-600" />
           <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">{score}</span>
        </div>
      </div>

      {/* Game Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center pt-16 md:pt-10 p-4 md:p-6">
        {isLoading ? (
          <HotOrNotSkeleton />
        ) : gameState === 'start' && (
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[3rem] shadow-2xl text-center animate-in zoom-in duration-500 transition-colors">
             <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <img src="/safety_hall.png" alt="Safety Scout" className="w-16 h-16 object-contain drop-shadow-md" />
             </div>
             <h1 className="text-4xl font-black mb-2 italic text-slate-900 dark:text-white tracking-tight uppercase">HOT OR NOT?</h1>
             <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                Some things are for kids, and some are for grown-ups only. Can you sort them all safely?
             </p>
             
             <div className="flex gap-4 mb-8">
                <div className="flex-1 bg-rose-50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/20 text-center flex flex-col items-center">
                   <div className="mb-2 bg-rose-100 dark:bg-rose-900/30 p-2 rounded-full">
                     <ArrowLeft className="h-6 w-6 text-rose-500" />
                   </div>
                   <div className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase">Swipe Left</div>
                   <div className="text-xs font-bold mt-1">Hot Tools</div>
                </div>
                <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 text-center flex flex-col items-center">
                   <div className="mb-2 bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                     <ArrowRight className="h-6 w-6 text-emerald-500" />
                   </div>
                   <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">Swipe Right</div>
                   <div className="text-xs font-bold mt-1">Safe Toys</div>
                </div>
             </div>

             <button 
              onClick={initGame}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 text-lg"
             >
                LET'S PLAY!
             </button>
          </div>
        )}

        {gameState === 'playing' && (
           <div className="relative flex flex-col items-center gap-12 w-full max-w-lg mx-auto">
              {/* Mission Control (Hint + Progress) */}
              <div className="flex flex-col items-center gap-6 w-full max-w-sm px-4">
                 <div className="hidden md:flex items-center gap-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 px-6 py-4 rounded-[2rem] shadow-xl w-full transition-colors">
                    <div className="shrink-0">
                       <img src="/safety_hall.png" alt="Robot" className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-sm" />
                    </div>
                    <div className="text-[10px] md:text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-[0.15em] leading-relaxed">
                       "Swipe right for toys, <br className="md:hidden" /> left for hot things!"
                    </div>
                 </div>

                 <div className="w-full bg-white dark:bg-slate-900 p-4 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-lg">
                    <div className="flex justify-between items-center mb-3 px-1">
                       <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Mission Progress</span>
                       <span className="text-sm md:text-base font-black text-emerald-600 tabular-nums">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 md:h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                       <motion.div 
                         className="h-full bg-emerald-500 shadow-sm"
                         initial={{ width: 0 }}
                         animate={{ width: `${progress}%` }}
                       />
                    </div>
                 </div>
              </div>

              <div className="relative w-full h-[26rem] md:h-[30rem] flex items-center justify-center">
                 <AnimatePresence>
                    {deck.length > 0 && (
                      <SwipeCard 
                         key={deck[0].id}
                         item={deck[0]}
                         onSwipe={handleSwipe}
                         dangerGlow={dangerGlow}
                         safeGlow={safeGlow}
                         dangerBg={dangerBg}
                         safeBg={safeBg}
                      />
                    )}
                 </AnimatePresence>
              </div>
           </div>
        )}

        {gameState === 'win' && (
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 md:p-12 rounded-[3rem] shadow-2xl text-center animate-in zoom-in duration-500 transition-colors">
             <div className="w-20 h-20 md:w-24 md:h-24 bg-yellow-100 dark:bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl md:text-5xl">🏆</div>
             <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight italic">SAFETY SCOUT!</h1>
             <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">You're an expert at spotting danger! You found all 10 items and kept everyone safe.</p>
             <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 p-6 rounded-3xl mb-8 flex items-center gap-4 text-left">
                <div className="shrink-0">
                   <img src="/safety_hall.png" alt="Safety Scout Badge" className="w-14 h-14 object-contain drop-shadow-md" />
                </div>
                <div>
                   <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-1">Badge Unlocked</div>
                   <div className="text-slate-900 dark:text-white font-black text-lg">Safety Scout</div>
                </div>
             </div>
             <div className="flex flex-col gap-3">
                <button onClick={initGame} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest">Play Again</button>
                <Link href="/kids/challenges" className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-center">Back</Link>
             </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showIntervention && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-10 inset-x-6 z-50 bg-white dark:bg-slate-900 border-4 border-rose-100 dark:border-rose-900/20 p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-4 max-w-lg mx-auto"
          >
             <div className="animate-bounce shrink-0">
                <img src="/safety_hall.png" alt="Safety Tip" className="w-12 h-12 object-contain drop-shadow-md" />
             </div>
             <div className="flex-1">
                <div className="text-rose-600 font-black text-[10px] uppercase tracking-widest mb-1">Safety Tip!</div>
                <div className="text-slate-700 dark:text-slate-300 font-bold text-sm leading-tight">
                   {deck[0]?.tip}
                </div>
             </div>
             <button 
              onClick={() => {
                setShowIntervention(false)
                setIsAnswering(false)
                setDeck(prev => [...prev.slice(1), prev[0]])
              }}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-colors"
             >
                Got it!
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SwipeCard({ item, onSwipe, dangerGlow, safeGlow, dangerBg, safeBg }: any) {
   const x = useMotionValue(0)
   const [exitX, setExitX] = useState(0)
   const rotate = useTransform(x, [-200, 200], [-25, 25])
   const opacity = useTransform(x, [-300, -250, 0, 250, 300], [0.8, 1, 1, 1, 0.8])
   const glowBg = useTransform(
      x,
      [-150, 0, 150],
      [
        'rgba(244, 63, 94, 0.15)', 
        'rgba(255, 255, 255, 0)', 
        'rgba(16, 185, 129, 0.15)'
      ]
   )

   // Sync parent motion values for background effects
   useEffect(() => {
      const unsubscribeX = x.on('change', (latest) => {
         // Update background glow based on distance
         const d = Math.abs(latest)
         const glowVal = 0.5 + (d / 100) * 0.5
         const bgVal = (d / 100) * 0.5

         if (latest < 0) {
            dangerGlow.set(Math.min(glowVal, 1))
            dangerBg.set(Math.min(bgVal, 0.5))
            safeGlow.set(0.5)
            safeBg.set(0)
         } else if (latest > 0) {
            safeGlow.set(Math.min(glowVal, 1))
            safeBg.set(Math.min(bgVal, 0.5))
            dangerGlow.set(0.5)
            dangerBg.set(0)
         } else {
            dangerGlow.set(0.5)
            safeGlow.set(0.5)
            dangerBg.set(0)
            safeBg.set(0)
         }
      })
      return () => unsubscribeX()
   }, [x, dangerGlow, safeGlow, dangerBg, safeBg])

   const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

   return (
      <motion.div
         style={{ x, rotate, opacity, position: 'absolute' }}
         drag="x"
         dragConstraints={{ left: 0, right: 0 }}
         onDragEnd={(_, info) => {
            if (info.offset.x < -100) {
               setExitX(-600)
               onSwipe('left')
            } else if (info.offset.x > 100) {
               setExitX(600)
               onSwipe('right')
            }
         }}
         className="w-[18rem] md:w-[22rem] h-[26rem] md:h-[30rem] bg-white dark:bg-slate-900 border-[4px] md:border-[6px] border-slate-50 dark:border-slate-800 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center p-6 md:p-8 cursor-grab active:cursor-grabbing overflow-hidden group relative transition-colors duration-500"
         whileTap={{ scale: 0.98 }}
         initial={{ scale: 0.8, opacity: 0, y: 20 }}
         animate={{ scale: 1, opacity: 1, y: 0 }}
         exit={isMobile ? {
            x: exitX,
            opacity: 0,
            transition: { duration: 0.2 }
         } : { 
            x: exitX, 
            y: 0,
            scale: 0, 
            opacity: 0,
            rotate: exitX > 0 ? 45 : -45,
            transition: { 
               type: 'spring',
               stiffness: 300,
               damping: 30,
               duration: 0.4
            } 
         }}
      >
         {/* Dynamic Glow Background */}
         <motion.div 
            style={{ background: glowBg }}
            className="absolute inset-0 pointer-events-none"
         />

         <div className="relative z-10 w-full text-center">
            <motion.div 
               initial={{ scale: 0.5, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="text-8xl md:text-[12rem] mb-6 filter drop-shadow-2xl select-none leading-none flex justify-center items-center"
            >
               {item.icon}
            </motion.div>
            <div className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
               {item.name}
            </div>
         </div>
      </motion.div>
   )
}

HotOrNot.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>
