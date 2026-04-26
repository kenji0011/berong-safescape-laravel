import React, { useState, useEffect, useRef } from "react"
import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, Wind, ShieldAlert, CheckCircle, Info, RotateCcw, Flame } from "lucide-react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import { cn } from "@/lib/utils"

const TILE_SIZE = 40
const MAZE = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 5, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 3, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]

const SmokeCrawl = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [maze, setMaze] = useState<number[][]>([])
  const [player, setPlayer] = useState({ x: 1, y: 1 })
  const [oxygen, setOxygen] = useState(100)
  const [isCrouched, setIsCrouched] = useState(false)
  const [gameState, setGameState] = useState<'start' | 'countdown' | 'playing' | 'won' | 'lost' | 'paused'>('start')
  const [countdown, setCountdown] = useState(3)
  const [message, setMessage] = useState<string | null>(null)
  const [doorStates, setDoorStates] = useState<{ [key: string]: 'closed' | 'open' }>({})

  // Audio refs
  const musicRef = useRef<HTMLAudioElement | null>(null)
  const finishSoundRef = useRef<HTMLAudioElement | null>(null)
  const failSoundRef = useRef<HTMLAudioElement | null>(null)
  const doorSoundRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize audio
    musicRef.current = new Audio('/sounds/game_music.mp3')
    musicRef.current.loop = true
    musicRef.current.volume = 0.3

    finishSoundRef.current = new Audio('/sounds/finish.mp3')
    finishSoundRef.current.volume = 1.0
    
    failSoundRef.current = new Audio('/sounds/failed.mp3')
    failSoundRef.current.volume = 1.0
    
    doorSoundRef.current = new Audio('/sounds/open_door.mp3')
    doorSoundRef.current.volume = 0.8

    return () => {
      musicRef.current?.pause()
      musicRef.current = null
    }
  }, [])

  useEffect(() => {
    if (gameState === 'playing') {
      if (musicRef.current) {
        musicRef.current.play().catch(() => {})
      }
    } else {
      musicRef.current?.pause()
    }

    if (gameState === 'won') {
      if (finishSoundRef.current) {
        finishSoundRef.current.currentTime = 0
        finishSoundRef.current.play().catch(() => {})
      }
    }

    if (gameState === 'lost') {
      if (failSoundRef.current) {
        failSoundRef.current.currentTime = 0
        failSoundRef.current.play().catch((err) => console.error("Fail sound error:", err))
      }
    }
  }, [gameState])

  // Countdown timer logic
  useEffect(() => {
    if (gameState !== 'countdown') return

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setGameState('playing')
    }
  }, [gameState, countdown])

  // Procedural Maze Generation (Recursive Backtracking / DFS)
  const generateMaze = () => {
    const width = 15
    const height = 15
    const newMaze = Array(height).fill(null).map(() => Array(width).fill(1))
    
    const walk = (x: number, y: number) => {
      newMaze[y][x] = 0
      const dirs = [
        [0, -2], [0, 2], [-2, 0], [2, 0]
      ].sort(() => Math.random() - 0.5)

      for (const [dx, dy] of dirs) {
        const nx = x + dx
        const ny = y + dy
        if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && newMaze[ny][nx] === 1) {
          newMaze[y + dy / 2][x + dx / 2] = 0
          walk(nx, ny)
        }
      }
    }

    walk(1, 1)

    // Set Start (5) and Exit (4)
    newMaze[1][1] = 5
    newMaze[height - 2][width - 2] = 4

    // Ensure exit is reachable (it should be by the algo, but let's make sure it's clear)
    newMaze[height - 2][width - 3] = 0 
    newMaze[height - 3][width - 2] = 0

    // Add some random doors (2: Cool, 3: Hot)
    let doorsCount = 0
    while (doorsCount < 3) {
      const rx = Math.floor(Math.random() * (width - 2)) + 1
      const ry = Math.floor(Math.random() * (height - 2)) + 1
      if (newMaze[ry][rx] === 0 && (rx !== 1 || ry !== 1)) {
        newMaze[ry][rx] = Math.random() > 0.3 ? 2 : 3 // 70% chance cool door
        doorsCount++
      }
    }

    return newMaze
  }

  // Initialize game
  useEffect(() => {
    restartGame()
    setGameState('start') // Ensure it starts with the 'start' button
  }, [])

  // Keyboard controls
  useEffect(() => {
    if (gameState !== 'playing') return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault()
      }

      if (e.code === 'Space') {
        setIsCrouched(true)
      }

      let newX = player.x
      let newY = player.y

      if (e.key === 'ArrowUp') newY--
      if (e.key === 'ArrowDown') newY++
      if (e.key === 'ArrowLeft') newX--
      if (e.key === 'ArrowRight') newX++

      if (newX !== player.x || newY !== player.y) {
        movePlayer(newX, newY)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsCrouched(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [player, gameState, maze])

  // Oxygen depletion logic
  useEffect(() => {
    if (gameState !== 'playing') return

    const interval = setInterval(() => {
      setOxygen((prev) => {
        const depletion = isCrouched ? 0.5 : 4
        const next = prev - depletion
        if (next <= 0) {
          setGameState('lost')
          setMessage("You inhaled too much smoke! Remember to stay low.")
          return 0
        }
        return next
      })
    }, 200)

    return () => clearInterval(interval)
  }, [gameState, isCrouched])

  const movePlayer = (x: number, y: number) => {
    const tile = maze[y]?.[x]

    if (tile === 1 || tile === undefined) return // Wall or Out of bounds

    // Door logic
    if (tile === 2 || tile === 3) {
      const doorId = `${x}-${y}`
      if (doorStates[doorId] !== 'open') {
        checkDoor(x, y, tile === 3)
        return
      }
    }

    if (tile === 4) {
      setGameState('won')
      return
    }

    setPlayer({ x, y })
  }

  const checkDoor = (x: number, y: number, isHot: boolean) => {
    if (isHot) {
      setMessage("⚠️ Ouch! This door is HOT! Find another way out.")
      setTimeout(() => setMessage(null), 3000)
    } else {
      doorSoundRef.current?.play()
      setMessage("This door is cool. Opening...")
      setTimeout(() => {
        setDoorStates(prev => ({ ...prev, [`${x}-${y}`]: 'open' }))
        setPlayer({ x, y })
        setMessage(null)
      }, 1000)
    }
  }

  // Draw logic
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || maze.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw Maze
    maze.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile === 1) {
          ctx.fillStyle = '#475569' // slate-600 (Wall)
        } else if (tile === 4) {
          ctx.fillStyle = '#22c55e' // green-500 (Exit)
        } else if (tile === 2 || tile === 3) {
          const doorId = `${x}-${y}`
          ctx.fillStyle = doorStates[doorId] === 'open' ? '#cbd5e1' : '#b45309' // amber-700 (Door)
        } else {
          ctx.fillStyle = '#f8fafc' // slate-50 (Floor)
        }
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)

        // Add tile borders for grid feel
        ctx.strokeStyle = '#e2e8f0'
        ctx.lineWidth = 0.5
        ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
      })
    })

    // Draw Player
    ctx.fillStyle = '#f97316' // orange-500
    const playerSize = isCrouched ? TILE_SIZE * 0.6 : TILE_SIZE * 0.8
    const offset = (TILE_SIZE - playerSize) / 2
    ctx.beginPath()
    ctx.roundRect(player.x * TILE_SIZE + offset, player.y * TILE_SIZE + offset, playerSize, playerSize, 8)
    ctx.fill()
    
    // Add player face/eyes to show crouch better
    ctx.fillStyle = 'white'
    ctx.fillRect(player.x * TILE_SIZE + offset + 5, player.y * TILE_SIZE + offset + 5, 5, 5)
    ctx.fillRect(player.x * TILE_SIZE + offset + playerSize - 10, player.y * TILE_SIZE + offset + 5, 5, 5)

    // Smoke Overlay
    const isCountingDown = gameState === 'countdown'
    const smokeOpacity = isCountingDown ? 0.1 : 0.7
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, `rgba(15, 23, 42, ${smokeOpacity})`)
    gradient.addColorStop(0.3, `rgba(30, 41, 59, ${smokeOpacity - 0.2})`)
    gradient.addColorStop(0.7, `rgba(71, 85, 105, ${smokeOpacity - 0.6})`)
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

  }, [player, isCrouched, doorStates, maze, gameState])

  const restartGame = () => {
    const newMaze = generateMaze()
    setMaze(newMaze)
    setOxygen(100)
    setGameState('start')
    setMessage(null)
    setDoorStates({})
    setPlayer({ x: 1, y: 1 })
    setCountdown(3)
  }

  return (
    <div className="min-h-screen relative bg-blue-50 selection:bg-orange-500 selection:text-white pb-32">
      <Head title="The Smoke Crawl | SafeScape" />
      
      {/* Background decoration - Absolute instead of fixed to prevent scroll issues */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(239,246,255,1)_0%,rgba(219,234,254,1)_100%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/kids/challenges" 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Missions
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between bg-white rounded-3xl p-4 shadow-sm border-2 border-slate-100">
               <div className="flex items-center gap-3">
                  <Wind className={cn("h-6 w-6", oxygen < 30 ? "text-red-500 animate-bounce" : "text-blue-500")} />
                  <span className="font-black text-slate-800 text-sm uppercase tracking-wider">Oxygen Supply</span>
               </div>
               <div className="flex items-center gap-4 flex-1 max-w-xs ml-8">
                  <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className={cn("h-full transition-all duration-300", oxygen > 50 ? "bg-blue-500" : oxygen > 20 ? "bg-yellow-500" : "bg-red-500")}
                      style={{ width: `${oxygen}%` }}
                    ></div>
                  </div>
                  <span className="text-slate-700 font-black text-sm min-w-[3rem] text-right">{Math.round(oxygen)}%</span>
               </div>
            </div>

            <div className="relative bg-white rounded-[2rem] p-4 shadow-xl border-4 border-slate-100 overflow-hidden aspect-square flex items-center justify-center">
              <canvas 
                ref={canvasRef} 
                width={15 * TILE_SIZE} 
                height={15 * TILE_SIZE}
                className="max-w-full h-auto rounded-xl shadow-inner border border-slate-200"
              />

              {/* Overlays */}
              {gameState === 'start' && (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
                  <div className="w-24 h-24 bg-orange-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
                    <Wind className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-4xl font-black text-slate-800 mb-4 uppercase tracking-tighter">Mission Ready?</h2>
                  <p className="text-slate-500 text-lg mb-8 max-w-md font-bold">
                    Learn the "Stay Low and Go" principle in this smoke-filled escape maze!
                  </p>
                  <div className="flex flex-col gap-4 w-full max-w-xs">
                     <button 
                        onClick={() => {
                          setGameState('countdown')
                          setCountdown(3)
                          musicRef.current?.play().catch(() => {})
                        }}
                        className="bg-orange-500 hover:bg-orange-400 text-white font-black py-5 px-10 rounded-2xl shadow-[0_6px_0_#c2410c] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all uppercase tracking-widest text-2xl"
                     >
                        START GAME
                     </button>
                  </div>
                </div>
              )}

              {gameState === 'countdown' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="bg-white/80 backdrop-blur-md rounded-full w-40 h-40 flex items-center justify-center border-8 border-orange-500 shadow-2xl animate-in zoom-in fade-in duration-300">
                    <span className="text-8xl font-black text-orange-500 animate-pulse">{countdown}</span>
                  </div>
                  <p className="mt-8 bg-orange-500 text-white px-6 py-2 rounded-full font-black uppercase tracking-widest shadow-lg">Preview the Maze!</p>
                </div>
              )}

              {gameState === 'won' && (
                <div className="absolute inset-0 bg-green-500/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md">
                  <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-2">ESCAPED!</h2>
                  <p className="text-white/90 text-xl font-bold mb-8">You stayed low and found the way out! True Hero status earned.</p>
                  <div className="flex flex-col gap-4 w-full max-w-xs">
                     <button 
                        onClick={() => {
                          restartGame()
                          setGameState('countdown')
                          musicRef.current?.play().catch(() => {})
                        }}
                        className="bg-white text-green-600 hover:bg-green-50 font-black py-4 px-8 rounded-2xl shadow-[0_4px_0_#15803d] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all uppercase tracking-widest"
                     >
                        Play Again
                     </button>
                     <Link 
                        href="/kids/challenges"
                        className="text-white font-black uppercase tracking-widest underline decoration-2 underline-offset-8 mt-4"
                     >
                        Back to Challenges
                     </Link>
                  </div>
                </div>
              )}

              {gameState === 'lost' && (
                <div className="absolute inset-0 bg-red-600/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md">
                  <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                    <ShieldAlert className="h-12 w-12 text-red-600" />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-2">MISSION FAILED</h2>
                  <p className="text-white/90 text-lg font-bold mb-8">{message}</p>
                  <button 
                    onClick={() => {
                      restartGame()
                      setGameState('countdown')
                      musicRef.current?.play().catch(() => {})
                    }}
                    className="bg-white text-red-600 hover:bg-red-50 font-black py-4 px-8 rounded-2xl shadow-[0_4px_0_#991b1b] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all uppercase tracking-widest w-full max-w-xs"
                  >
                    Try Again
                    <RotateCcw className="inline-block ml-2 h-5 w-5" />
                  </button>
                </div>
              )}

              {/* HUD Messages */}
              {message && gameState === 'playing' && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white text-slate-800 px-6 py-3 rounded-2xl border-2 border-orange-500 shadow-2xl font-black text-sm flex items-center gap-3 animate-in fade-in zoom-in slide-in-from-top-4">
                  {message.includes('HOT') ? <Flame className="text-red-500 h-5 w-5" /> : <Info className="text-blue-500 h-5 w-5" />}
                  {message}
                </div>
              )}
            </div>
          </div>

          {/* Instructions Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-6 border-2 border-slate-100 shadow-xl">
               <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                  <Info className="text-blue-500 h-6 w-6" />
                  Mission Guide
               </h3>
               <div className="space-y-4">
                  <div className="flex gap-4">
                     <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-700 font-bold shrink-0 border border-slate-100">1</div>
                     <p className="text-slate-600 text-sm leading-relaxed font-bold">Use <span className="text-blue-600">Arrow Keys</span> to move your hero through the building.</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-700 font-bold shrink-0 border border-slate-100">2</div>
                     <p className="text-slate-600 text-sm leading-relaxed font-bold">Hold <span className="text-orange-600">Space Bar</span> to crouch. Staying low preserves your oxygen!</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-700 font-bold shrink-0 border border-slate-100">3</div>
                     <p className="text-slate-600 text-sm leading-relaxed font-bold">Watch the <span className="text-blue-600">Oxygen Bar</span>. If you stand up, it drains much faster.</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-700 font-bold shrink-0 border border-slate-100">4</div>
                     <p className="text-slate-600 text-sm leading-relaxed font-bold">Reach the <span className="text-green-600">Green Exit</span> to win!</p>
                  </div>
               </div>
            </div>

            <div className="bg-orange-50 rounded-[2rem] p-6 border-2 border-orange-100 shadow-lg">
               <h3 className="text-lg font-black text-orange-600 mb-2 flex items-center gap-2 uppercase tracking-wider">
                  <Flame className="h-5 w-5" />
                  Safety Tip
               </h3>
               <p className="text-slate-700 text-sm leading-relaxed italic font-bold">
                  "In a fire, the smoke is hot and poisonous. It naturally rises to the ceiling. By crawling on your hands and knees, you stay in the 'Good Air Zone' near the floor."
               </p>
            </div>

            {/* Mobile Controls Hint */}
            <div className="lg:hidden bg-white rounded-2xl p-4 border border-slate-100 text-center">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Mobile users can use on-screen joystick (coming soon)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

SmokeCrawl.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default SmokeCrawl
