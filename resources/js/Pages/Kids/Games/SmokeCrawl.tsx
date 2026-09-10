import React, { useState, useEffect, useRef } from "react"
import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, Wind, ShieldAlert, CheckCircle, Info, RotateCcw, Flame, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, User } from "lucide-react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import axios from "axios"
import { cn } from "@/lib/utils"
import { createAudio } from '@/lib/audio'

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
  const [showTouchControls, setShowTouchControls] = useState(false)

  useEffect(() => {
    const checkControls = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmall = window.innerWidth < 1024
      setShowTouchControls(isTouch || isSmall)
    };
    checkControls()
    window.addEventListener('resize', checkControls)
    return () => window.removeEventListener('resize', checkControls)
  }, [])

  // Audio refs
  const musicRef = useRef<HTMLAudioElement | null>(null)
  const finishSoundRef = useRef<HTMLAudioElement | null>(null)
  const failSoundRef = useRef<HTMLAudioElement | null>(null)
  const doorSoundRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize audio
    musicRef.current = createAudio('/sounds/game_music.mp3', 'music')
    musicRef.current.loop = true
    musicRef.current.volume = Math.min(musicRef.current.volume, 0.3)

    finishSoundRef.current = createAudio('/sounds/finish.mp3', 'games')
    
    failSoundRef.current = createAudio('/sounds/failed.mp3', 'games')
    
    doorSoundRef.current = createAudio('/sounds/open_door.mp3', 'games')

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
    let newMaze: number[][] = []
    let validMaze = false

    while (!validMaze) {
      newMaze = Array(height).fill(null).map(() => Array(width).fill(1))
      
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

      // Create alternative paths by breaking some walls (to ensure there's a way around)
      for (let i = 0; i < 20; i++) { // Increased from 10 to 20 for more alternate routes
        const rx = Math.floor(Math.random() * (width - 2)) + 1
        const ry = Math.floor(Math.random() * (height - 2)) + 1
        if (newMaze[ry][rx] === 1) {
          newMaze[ry][rx] = 0
        }
      }

      // Set Start (5) and Exit (4)
      newMaze[1][1] = 5
      newMaze[height - 2][width - 2] = 4

      // Ensure exit is reachable
      newMaze[height - 2][width - 3] = 0 
      newMaze[height - 3][width - 2] = 0

      // Add some random doors (2: Cool, 3: Hot)
      let doorsCount = 0
      while (doorsCount < 5) { // Increased to 5 doors for slightly more challenge
        const rx = Math.floor(Math.random() * (width - 2)) + 1
        const ry = Math.floor(Math.random() * (height - 2)) + 1
        if (newMaze[ry][rx] === 0 && (rx !== 1 || ry !== 1) && (rx !== width - 2 || ry !== height - 2)) {
          newMaze[ry][rx] = Math.random() > 0.4 ? 2 : 3 // 60% chance cool door
          doorsCount++
        }
      }

      // Verify that there is a valid path to the exit without passing through hot doors
      const checkPath = () => {
        const queue = [{ x: 1, y: 1 }]
        const visited = new Set(['1,1'])

        while (queue.length > 0) {
          const current = queue.shift()!
          const { x, y } = current
          
          if (newMaze[y][x] === 4) return true // Reached exit
          
          const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]]
          for (const [dx, dy] of dirs) {
            const nx = x + dx
            const ny = y + dy
            if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1) {
              const tile = newMaze[ny][nx]
              // Can walk on floor (0), start (5), exit (4), and cool doors (2)
              if ((tile === 0 || tile === 2 || tile === 4 || tile === 5) && !visited.has(`${nx},${ny}`)) {
                visited.add(`${nx},${ny}`)
                queue.push({ x: nx, y: ny })
              }
            }
          }
        }
        return false // No valid path found
      }

      validMaze = checkPath()
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
      
      // Award Smoke Scout Badge
      axios.post('/api/badges/award', {
        badge_id: 'smoke_scout',
        badge_name: 'Smoke Scout',
        badge_icon: '/badges/smoke_hall.webp?v=2'
      }).catch(err => console.error("Failed to award badge:", err.response?.data || err.message))
      return
    }

    setPlayer({ x, y })
  }

  const checkDoor = (x: number, y: number, isHot: boolean) => {
    setMessage("Checking the door with the back of your hand...")
    
    setTimeout(() => {
      if (isHot) {
        doorSoundRef.current?.play()
        setMessage("⚠️ THIS DOOR IS HOT! You felt the heat with the back of your hand. DO NOT OPEN IT! Find another way around.")
        // Door remains closed, player doesn't move. No oxygen penalty.
        setTimeout(() => {
          setMessage(null)
        }, 3000)
      } else {
        doorSoundRef.current?.play()
        setMessage("This door is cool. Opening...")
        setTimeout(() => {
          setDoorStates(prev => ({ ...prev, [`${x}-${y}`]: 'open' }))
          setPlayer({ x, y })
          setMessage(null)
        }, 1000)
      }
    }, 800)
  }

  // Draw logic
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || maze.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isDark = document.documentElement.classList.contains('dark')

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw Maze
    maze.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile === 1) {
          ctx.fillStyle = isDark ? '#1e293b' : '#475569' // slate-800 vs slate-600 (Wall)
        } else if (tile === 4) {
          ctx.fillStyle = '#22c55e' // green-500 (Exit)
        } else if (tile === 2 || tile === 3) {
          const doorId = `${x}-${y}`
          if (doorStates[doorId] === 'open') {
             ctx.fillStyle = isDark ? '#334155' : '#cbd5e1' // open door
          } else {
             ctx.fillStyle = '#b45309' // amber-700 (Door)
          }
        } else {
          ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc' // slate-950 vs slate-50 (Floor)
        }
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)

        // Add tile borders for grid feel
        ctx.strokeStyle = isDark ? '#1e293b' : '#e2e8f0'
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
    setIsCrouched(false)
    setGameState('start')
    setMessage(null)
    setDoorStates({})
    setPlayer({ x: 1, y: 1 })
    setCountdown(3)
  }

  return (
    <div className="-mt-[104px] sm:-mt-[120px] pt-[104px] sm:pt-[120px] min-h-screen relative bg-blue-50 dark:bg-slate-950 selection:bg-orange-500 selection:text-white pb-8 sm:pb-32 overflow-x-hidden transition-colors duration-500">
      <Head title="The Smoke Crawl | SafeScape" />
      
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full pointer-events-none z-0 overflow-hidden" style={{ height: '100vh', minHeight: '100lvh' }}>
        <img 
          src="/challenges-bg.webp" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover opacity-100 dark:opacity-50 transition-opacity duration-500" 
        />
        <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/60 transition-colors duration-500"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Ghost Header - absolute positioned to save vertical space and maintain consistency */}
      <div className="absolute top-[112px] sm:top-[128px] left-4 z-[60]">
        <Link 
          href="/kids/challenges" 
          className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold hover:text-orange-600 dark:hover:text-orange-400 transition-all text-sm bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-white/60 dark:border-slate-700/60 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="inline">Back to Activities</span>
        </Link>
      </div>

      <div className="relative z-10 pt-16 sm:pt-6 p-2 sm:p-6 max-w-5xl mx-auto w-full">


        <div className={cn(
          "grid grid-cols-1 gap-4 sm:gap-8",
          showTouchControls ? "w-full" : "lg:grid-cols-3"
        )}>
          {/* Main Game Area */}
          <div className={cn(
            "flex flex-col items-center justify-center w-full",
            showTouchControls ? "" : "lg:col-span-2"
          )}>
            {/* O2 Status Bar */}
            <div className="w-full max-w-[500px] mb-2 sm:mb-4 flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 shadow-sm border-2 border-slate-100 dark:border-slate-800 transition-colors">
               <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <Wind className={cn("h-4 w-4 sm:h-6 sm:w-6", oxygen < 30 ? "text-red-500 animate-bounce" : "text-blue-500 dark:text-blue-400")} />
                  <span className="font-black text-slate-800 dark:text-white text-[10px] sm:text-sm uppercase tracking-wider">O₂</span>
               </div>
               <div className="flex items-center gap-2 sm:gap-4 flex-1 ml-3 sm:ml-8">
                  <div className="flex-1 h-3 sm:h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div 
                      className={cn("h-full transition-all duration-300", oxygen > 50 ? "bg-blue-500" : oxygen > 20 ? "bg-yellow-500" : "bg-red-500")}
                      style={{ width: `${oxygen}%` }}
                    ></div>
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 font-black text-xs sm:text-sm min-w-[2.5rem] text-right">{Math.round(oxygen)}%</span>
               </div>
            </div>

            {/* Game Board & Touch Controls Container */}
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 mt-2">
              
              {/* TABLET ONLY: Crouch Button (Left side on tablets) */}
              {gameState !== 'start' && showTouchControls && (
                <div className="hidden md:flex md:w-44 shrink-0 md:order-1 justify-center">
                  <button 
                    onClick={() => setIsCrouched(!isCrouched)}
                    style={{ touchAction: 'none' }}
                    className={cn(
                      "w-full rounded-3xl font-black text-sm shadow-lg flex flex-col items-center justify-center gap-3 py-10 transition-all border-2 border-slate-200 dark:border-slate-700 active:scale-95",
                      isCrouched 
                        ? "bg-orange-500 text-white shadow-[0_6px_0_#c2410c] border-orange-600 scale-[1.02]" 
                        : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400"
                    )}
                  >
                    <User className={cn("h-10 w-10", isCrouched ? "animate-pulse" : "")} />
                    <span>{isCrouched ? "STAYING LOW" : "TAP TO CROUCH"}</span>
                  </button>
                </div>
              )}

              {/* Map Canvas (Center Column - Reduced and centered) */}
              <div className="relative bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2rem] p-1.5 sm:p-4 shadow-xl border-2 sm:border-4 border-slate-100 dark:border-slate-800 overflow-hidden aspect-square flex items-center justify-center w-full max-w-[280px] sm:max-w-[320px] md:max-w-[400px] mx-auto md:order-2 order-1 transition-colors">
                <canvas 
                  ref={canvasRef} 
                  width={15 * TILE_SIZE} 
                  height={15 * TILE_SIZE}
                  className="max-w-full h-auto rounded-xl shadow-inner border border-slate-200 dark:border-slate-700"
                />

                {/* Overlays */}
                {gameState === 'start' && (
                  <div className="absolute inset-0 bg-white/95 dark:bg-slate-950/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
                    <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                      <Wind className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mb-3 uppercase tracking-tighter">Mission Ready?</h2>
                    
                    {/* Controls Preview for Mobile/Tablets */}
                    {showTouchControls ? (
                      <div className="w-full bg-blue-50 dark:bg-slate-900 rounded-2xl p-3 mb-4 border border-blue-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-left">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex gap-1">
                            <div className="w-5 h-5 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded flex items-center justify-center"><ChevronUp className="h-3 w-3 dark:text-slate-300" /></div>
                          </div>
                          <div className="flex gap-1">
                            <div className="w-5 h-5 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded flex items-center justify-center"><ChevronLeft className="h-3 w-3 dark:text-slate-300" /></div>
                            <div className="w-5 h-5 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded flex items-center justify-center"><ChevronDown className="h-3 w-3 dark:text-slate-300" /></div>
                            <div className="w-5 h-5 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded flex items-center justify-center"><ChevronRight className="h-3 w-3 dark:text-slate-300" /></div>
                          </div>
                          <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 mt-0.5 uppercase">Move</span>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1 border-l border-blue-200 dark:border-slate-700">
                          <div className="w-10 h-6 bg-orange-500 rounded flex items-center justify-center shadow-sm">
                            <User className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 mt-0.5 uppercase">Stay Low</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 max-w-xs font-bold">
                        Learn the "Stay Low and Go" principle in this smoke-filled escape maze!
                      </p>
                    )}
                    <div className="flex flex-col gap-4 w-full max-w-xs">
                       <button 
                          onClick={() => {
                            setGameState('countdown')
                            setCountdown(3)
                            musicRef.current?.play().catch(() => {})
                          }}
                          className="bg-orange-500 hover:bg-orange-400 text-white font-black py-3 px-6 rounded-2xl shadow-[0_4px_0_#c2410c] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all uppercase tracking-widest text-base"
                       >
                          START GAME
                       </button>
                    </div>
                  </div>
                )}

                {gameState === 'countdown' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full w-28 h-28 flex items-center justify-center border-4 border-orange-500 shadow-2xl animate-in zoom-in fade-in duration-300">
                      <span className="text-6xl font-black text-orange-500 animate-pulse">{countdown}</span>
                    </div>
                    <p className="mt-4 bg-orange-500 text-white px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest shadow-lg">Preview the Maze!</p>
                  </div>
                )}

                {gameState === 'won' && (
                  <div className="absolute inset-0 bg-green-500/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-lg overflow-hidden">
                      <img src="/badges/smoke_hall.webp?v=2" alt="Smoke Scout Badge" className="w-full h-full object-contain p-2" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-1">ESCAPED!</h2>
                    <p className="text-white/90 text-sm font-bold mb-6">You stayed low and found the way out! True Hero status earned.</p>
                    <div className="flex flex-col gap-3 w-full max-w-xs">
                       <button 
                          onClick={() => {
                            restartGame()
                            setGameState('countdown')
                            musicRef.current?.play().catch(() => {})
                          }}
                          className="bg-white text-green-600 hover:bg-green-50 font-black py-3 px-6 rounded-2xl shadow-[0_4px_0_#15803d] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all uppercase tracking-widest text-sm"
                       >
                          Play Again
                       </button>
                       <Link 
                          href="/kids/challenges"
                          className="text-white font-black text-xs uppercase tracking-widest underline decoration-2 underline-offset-4 mt-2"
                       >
                          Back to Challenges
                       </Link>
                    </div>
                  </div>
                )}

                {gameState === 'lost' && (
                  <div className="absolute inset-0 bg-red-600/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-lg">
                      <ShieldAlert className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-1">MISSION FAILED</h2>
                    <p className="text-white/90 text-sm font-bold mb-6">{message}</p>
                    <button 
                      onClick={() => {
                        restartGame()
                        setGameState('countdown')
                        musicRef.current?.play().catch(() => {})
                      }}
                      className="bg-white text-red-600 hover:bg-red-50 font-black py-3 px-6 rounded-2xl shadow-[0_4px_0_#991b1b] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all uppercase tracking-widest text-sm w-full max-w-xs"
                    >
                      Try Again
                      <RotateCcw className="inline-block ml-2 h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* HUD Messages */}
                {message && gameState === 'playing' && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-4 py-2 rounded-2xl border-2 border-orange-500 shadow-2xl font-black text-xs flex items-center gap-2 animate-in fade-in zoom-in slide-in-from-top-4 max-w-[90%]">
                    {message.includes('HOT') ? <Flame className="text-red-500 h-4 w-4 shrink-0" /> : <Info className="text-blue-500 h-4 w-4 shrink-0" />}
                    <span>{message}</span>
                  </div>
                )}
              </div>

              {/* TABLET ONLY: D-Pad (Right side on tablets) */}
              {gameState !== 'start' && showTouchControls && (
                <div className="hidden md:flex md:w-64 shrink-0 md:order-3 justify-center">
                  <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-[220px] md:max-w-[280px] mx-auto">
                    <div />
                    <button 
                      onClick={() => movePlayer(player.x, player.y - 1)} 
                      style={{ touchAction: 'none' }}
                      className="w-14 h-14 md:w-20 md:h-20 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 active:bg-orange-500 active:text-white active:scale-90 transition-all shadow-md"
                    >
                      <ChevronUp className="h-7 w-7 md:h-10 md:w-10" />
                    </button>
                    <div />
                    <button 
                      onClick={() => movePlayer(player.x - 1, player.y)}
                      style={{ touchAction: 'none' }}
                      className="w-14 h-14 md:w-20 md:h-20 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 active:bg-orange-500 active:text-white active:scale-90 transition-all shadow-md"
                    >
                      <ChevronLeft className="h-7 w-7 md:h-10 md:w-10" />
                    </button>
                    <div className="flex items-center justify-center text-slate-300 dark:text-slate-600">
                      <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full bg-current" />
                    </div>
                    <button 
                      onClick={() => movePlayer(player.x + 1, player.y)}
                      style={{ touchAction: 'none' }}
                      className="w-14 h-14 md:w-20 md:h-20 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 active:bg-orange-500 active:text-white active:scale-90 transition-all shadow-md"
                    >
                      <ChevronRight className="h-7 w-7 md:h-10 md:w-10" />
                    </button>
                    <div />
                    <button 
                      onClick={() => movePlayer(player.x, player.y + 1)}
                      style={{ touchAction: 'none' }}
                      className="w-14 h-14 md:w-20 md:h-20 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 active:bg-orange-500 active:text-white active:scale-90 transition-all shadow-md"
                    >
                      <ChevronDown className="h-7 w-7 md:h-10 md:w-10" />
                    </button>
                    <div />
                  </div>
                </div>
              )}

            </div>

            {/* MOBILE ONLY: Side-by-Side Controls (Below the map, compact layout) */}
            {gameState !== 'start' && showTouchControls && (
              <div className="flex md:hidden flex-row items-center justify-between gap-4 w-full max-w-[280px] sm:max-w-[320px] mt-4 bg-white/60 dark:bg-slate-900/60 p-3 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-lg">
                
                {/* Crouch Toggle */}
                <button 
                  onClick={() => setIsCrouched(!isCrouched)}
                  style={{ touchAction: 'none' }}
                  className={cn(
                    "flex-1 max-w-[110px] h-[96px] rounded-2xl font-black text-[9px] uppercase shadow-md flex flex-col items-center justify-center gap-1.5 transition-all border border-slate-200 dark:border-slate-700 active:scale-95",
                    isCrouched 
                      ? "bg-orange-500 text-white border-orange-600 shadow-[0_4px_0_#c2410c] scale-[1.02]" 
                      : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400"
                  )}
                >
                  <User className={cn("h-6 w-6", isCrouched ? "animate-pulse" : "")} />
                  <span>{isCrouched ? "STAYING LOW" : "TAP TO CROUCH"}</span>
                </button>

                {/* D-Pad (Compact layout) */}
                <div className="grid grid-cols-3 gap-1.5 w-[116px] shrink-0">
                  <div />
                  <button 
                    onClick={() => movePlayer(player.x, player.y - 1)} 
                    style={{ touchAction: 'none' }}
                    className="w-9 h-9 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 active:bg-orange-500 active:text-white active:scale-90 transition-all shadow-sm"
                  >
                    <ChevronUp className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  </button>
                  <div />
                  <button 
                    onClick={() => movePlayer(player.x - 1, player.y)}
                    style={{ touchAction: 'none' }}
                    className="w-9 h-9 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 active:bg-orange-500 active:text-white active:scale-90 transition-all shadow-sm"
                  >
                    <ChevronLeft className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  </button>
                  <div className="flex items-center justify-center text-slate-300 dark:text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  </div>
                  <button 
                    onClick={() => movePlayer(player.x + 1, player.y)}
                    style={{ touchAction: 'none' }}
                    className="w-9 h-9 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 active:bg-orange-500 active:text-white active:scale-90 transition-all shadow-sm"
                  >
                    <ChevronRight className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  </button>
                  <div />
                  <button 
                    onClick={() => movePlayer(player.x, player.y + 1)}
                    style={{ touchAction: 'none' }}
                    className="w-9 h-9 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 active:bg-orange-500 active:text-white active:scale-90 transition-all shadow-sm"
                  >
                    <ChevronDown className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  </button>
                  <div />
                </div>
              </div>
            )}
          </div>

          {/* Instructions Sidebar - Moved to bottom on mobile, side on desktop */}
          <div className="block lg:block space-y-6 mt-8 lg:mt-0">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border-2 border-slate-100 dark:border-slate-800 shadow-xl transition-colors">
               <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Info className="text-blue-500 dark:text-blue-400 h-6 w-6" />
                  Mission Guide
               </h3>
               <div className="space-y-4">
                  <div className="flex gap-4">
                     <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold shrink-0 border border-slate-100 dark:border-slate-700">1</div>
                     <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-bold">Use the <span className="text-blue-600 dark:text-blue-400">Arrows</span> to move through the building.</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold shrink-0 border border-slate-100 dark:border-slate-700">2</div>
                     <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-bold">
                        {showTouchControls ? (
                          <span>Tap <span className="text-orange-600 dark:text-orange-400">Crouch</span></span>
                        ) : (
                          <span>Hold <span className="text-orange-600 dark:text-orange-400">Spacebar</span></span>
                        )}
                        {" "}to stay low and save oxygen!
                     </p>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold shrink-0 border border-slate-100 dark:border-slate-700">3</div>
                     <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-bold">Reach the <span className="text-green-600 dark:text-green-400">Green Exit</span> to win the mission.</p>
                  </div>
               </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950/20 rounded-[2rem] p-6 border-2 border-orange-100 dark:border-orange-900/30 shadow-lg">
               <h3 className="text-lg font-black text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
                  <Flame className="h-5 w-5" />
                  Safety Tip
               </h3>
               <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed italic font-bold">
                  "In a fire, the smoke is hot and poisonous. It naturally rises to the ceiling. By crawling on your hands and knees, you stay in the 'Good Air Zone' near the floor."
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

SmokeCrawl.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default SmokeCrawl
