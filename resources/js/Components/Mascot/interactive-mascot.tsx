import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useSpring } from 'motion/react'
import { useMascot, MascotMood } from '@/hooks/use-mascot'
import confetti from 'canvas-confetti'
import { playSound } from '@/lib/audio'
import Image from '@/Components/Image'

export interface InteractiveMascotProps {
  isOnLeft?: boolean
  isMobile?: boolean
  isChatOpen?: boolean
  isDragging?: boolean
  onPoke?: () => void
  defaultSpeech?: string
  lottieAnimationData?: any
  className?: string
}

export const InteractiveMascot: React.FC<InteractiveMascotProps> = ({
  isOnLeft = false,
  isMobile: forcedIsMobile,
  isChatOpen = false,
  isDragging = false,
  onPoke,
  defaultSpeech = "LET'S LEARN ABOUT FIRE SAFETY!",
  lottieAnimationData,
  className = '',
}) => {
  const mascotRef = useRef<HTMLDivElement>(null)
  const {
    mood,
    speechText,
    isSleeping,
    isThinking,
    celebrate,
    say,
    react,
    wakeUp,
    setHovered,
  } = useMascot()

  // Screen size detection for adaptive mobile/desktop rendering
  const [isScreenMobile, setIsScreenMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => {
      setIsScreenMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const isMobile = forcedIsMobile !== undefined ? forcedIsMobile : isScreenMobile

  // Mouse / Pointer Vector Tracking (Desktop)
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 })
  const springX = useSpring(0, { stiffness: 180, damping: 22 })
  const springY = useSpring(0, { stiffness: 180, damping: 22 })
  const springRotate = useSpring(0, { stiffness: 180, damping: 22 })

  useEffect(() => {
    if (isMobile || isSleeping) {
      springX.set(0)
      springY.set(0)
      springRotate.set(0)
      return
    }

    const handlePointerMove = (e: MouseEvent) => {
      if (!mascotRef.current) return
      const rect = mascotRef.current.getBoundingClientRect()
      const mascotCenterX = rect.left + rect.width / 2
      const mascotCenterY = rect.top + rect.height / 2

      // Vector from mascot to cursor
      const deltaX = e.clientX - mascotCenterX
      const deltaY = e.clientY - mascotCenterY
      const distance = Math.hypot(deltaX, deltaY) || 1

      // Normalize vector (-1 to 1 range with dampening)
      const maxDistance = Math.max(window.innerWidth, window.innerHeight) / 1.5
      const clampedMagnitude = Math.min(distance / maxDistance, 1)

      const normX = (deltaX / distance) * clampedMagnitude
      const normY = (deltaY / distance) * clampedMagnitude

      setPointerOffset({ x: normX, y: normY })

      // Target rotation & offset: Berong turns his head towards cursor
      const lookAngle = normX * (isOnLeft ? -10 : 10)
      const lookX = normX * 8
      const lookY = normY * 6

      springRotate.set(lookAngle)
      springX.set(lookX)
      springY.set(lookY)
    }

    window.addEventListener('mousemove', handlePointerMove, { passive: true })
    return () => window.removeEventListener('mousemove', handlePointerMove)
  }, [isMobile, isSleeping, isOnLeft, springX, springY, springRotate])

  // Periodic Random Blinking Effect
  const [isBlinking, setIsBlinking] = useState(false)
  useEffect(() => {
    if (isSleeping) return

    let blinkTimeout: ReturnType<typeof setTimeout>
    const scheduleBlink = () => {
      const nextBlinkDelay = 2500 + Math.random() * 3500 // every 2.5 - 6s
      blinkTimeout = setTimeout(() => {
        setIsBlinking(true)
        setTimeout(() => {
          setIsBlinking(false)
          scheduleBlink()
        }, 180)
      }, nextBlinkDelay)
    }

    scheduleBlink()
    return () => clearTimeout(blinkTimeout)
  }, [isSleeping])

  // Confetti trigger on celebrate mood
  const lastCelebrationTime = useRef(0)
  useEffect(() => {
    if (mood === 'celebrate') {
      const now = Date.now()
      if (now - lastCelebrationTime.current > 2000) {
        lastCelebrationTime.current = now
        try {
          playSound('/sounds/win.mp3', 'notification')
        } catch {
          // ignore audio failure
        }

        // Fire festive sparks from bottom right
        const originX = isOnLeft ? 0.15 : 0.88
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { x: originX, y: 0.85 },
          colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'],
          disableForReducedMotion: true,
        })
      }
    }
  }, [mood, isOnLeft])

  // Handle Mascot Poke / Click
  const handlePoke = (e: React.MouseEvent) => {
    if (isDragging) return
    e.stopPropagation()

    if (isSleeping) {
      wakeUp()
      playSound('/sounds/tap.mp3', 'general')
      return
    }

    // Playful reaction quotes if no custom speech is active
    if (!speechText) {
      const quotes = [
        "Fire safety begins with YOU! 🚒",
        "Tandaan: Stop, Drop, and Roll! 🔥",
        "Call 911 or BFP in an emergency! 🚨",
        "Keep matches and lighters away from kids! ⚡",
        "Always know two ways out! 🚪",
        "Check your smoke alarms regularly! 🔔",
      ]
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
      say(randomQuote, 3500)
    }

    react('happy', 1500)
    try {
      playSound('/sounds/tap.mp3', 'general')
    } catch {
      // Audio fallback
    }

    if (onPoke) {
      onPoke()
    }
  }

  // Display speech bubble text priority: custom speechText > default CTA
  const activeSpeech = speechText || (defaultSpeech && !isChatOpen ? defaultSpeech : null)

  // Floating Zzz letters for sleeping mode
  const zzzItems = useMemo(() => [
    { id: 1, size: 'text-xs', delay: 0, x: 12, y: -20 },
    { id: 2, size: 'text-sm', delay: 0.6, x: 22, y: -38 },
    { id: 3, size: 'text-base', delay: 1.2, x: 30, y: -58 },
  ], [])

  return (
    <div
      ref={mascotRef}
      className={`relative select-none ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handlePoke}
    >
      {/* ============================================================ */}
      {/* 1. SPEECH BUBBLE CTA / FIRE SAFETY TIP */}
      {/* ============================================================ */}
      <AnimatePresence>
        {activeSpeech && !isSleeping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
            exit={{ opacity: 0, scale: 0.6, y: 15, transition: { duration: 0.2 } }}
            transition={{
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              default: { type: "spring", stiffness: 260, damping: 20 },
            }}
            className={`absolute bottom-full mb-3 z-50 pointer-events-auto ${
              isMobile ? 'right-0' : isOnLeft ? 'left-2' : 'right-0'
            }`}
          >
            <div className="relative bg-white dark:bg-slate-900 border-[3.5px] border-[#ff6b00] rounded-2xl sm:rounded-[2rem] px-4 py-2 sm:px-5 sm:py-2.5 shadow-[0_12px_30px_-5px_rgba(255,107,0,0.35)] max-w-[260px] sm:max-w-[320px]">
              <div className="text-[#e60000] dark:text-red-400 font-black text-xs sm:text-sm leading-tight text-center tracking-wide">
                {activeSpeech}
              </div>
              {/* Bubble pointer tail */}
              <div
                className={`absolute -bottom-[9px] w-4 h-4 bg-white dark:bg-slate-900 border-b-[3.5px] border-r-[3.5px] border-[#ff6b00] transform rotate-45 rounded-br-[2px] ${
                  isOnLeft ? 'left-8 sm:left-10' : 'right-8 sm:right-10'
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 2. SLEEPING MODE "Zzz" PARTICLES */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isSleeping && (
          <div className="absolute -top-6 right-2 sm:right-4 z-40 pointer-events-none">
            {zzzItems.map(item => (
              <motion.span
                key={item.id}
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [0, -25, -45],
                  x: [0, item.x / 2, item.x],
                  scale: [0.6, 1, 1.2],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: item.delay,
                  ease: "easeInOut",
                }}
                className={`absolute font-black text-blue-400 dark:text-blue-300 drop-shadow-md select-none ${item.size}`}
              >
                Z
              </motion.span>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 3. THINKING BUBBLE (WHEN AI BOT IS RESPONDING) */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 10 }}
            className={`absolute -top-12 ${isOnLeft ? 'left-6' : 'right-6'} z-40 pointer-events-none`}
          >
            <div className="bg-white dark:bg-slate-800 border-2 border-orange-500 rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-red-500 animate-bounce" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 4. ADAPTIVE MOBILE VIEW (< 640px): ANIMATED CIRCULAR COMPANION */}
      {/* ============================================================ */}
      {isMobile ? (
        <motion.div
          animate={
            isSleeping
              ? { scale: [1, 0.96, 1], y: [0, 2, 0] }
              : mood === 'celebrate'
              ? { scale: [1, 1.2, 1, 1.15, 1], rotate: [0, -8, 8, -5, 0] }
              : isThinking
              ? { rotate: [-5, 5, -5] }
              : { y: [0, -3, 0] }
          }
          transition={{
            duration: mood === 'celebrate' ? 0.8 : 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative group cursor-pointer"
        >
          <div className="relative h-14 w-14 rounded-full bg-white dark:bg-slate-900 border-[3px] border-orange-500 shadow-xl flex items-center justify-center overflow-hidden">
            <Image
              src="/berong_pr.webp"
              alt="Berong Assistant"
              width={56}
              height={56}
              className={`h-12 w-12 object-contain select-none transition-all duration-300 ${
                isSleeping ? 'opacity-70 grayscale-[25%]' : 'group-hover:scale-110'
              }`}
              draggable={false}
            />

            {/* Blinking eyelid overlay on mobile */}
            {isBlinking && !isSleeping && (
              <div className="absolute inset-0 bg-amber-950/20 backdrop-blur-[0.5px] rounded-full pointer-events-none" />
            )}

            {/* Sleep state badge */}
            {isSleeping && (
              <div className="absolute inset-0 bg-blue-950/30 flex items-center justify-center">
                <span className="text-[10px] font-black text-white bg-blue-600/80 px-1 rounded">
                  Zzz
                </span>
              </div>
            )}

            {/* Celebrate badge */}
            {mood === 'celebrate' && (
              <div className="absolute -top-1 -right-1 bg-yellow-400 text-[10px] rounded-full p-0.5 shadow animate-ping">
                🎉
              </div>
            )}
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-orange-500/30 animate-ping opacity-25 pointer-events-none" />
        </motion.div>
      ) : (
        /* ============================================================ */
        /* 5. DESKTOP / TABLET VIEW (≥ 640px): FULL ANIMATED MASCOT RIG */
        /* ============================================================ */
        <motion.div
          animate={
            isSleeping
              ? {
                  y: [0, 4, 0],
                  rotate: [4, 6, 4],
                  scale: [0.98, 0.96, 0.98],
                }
              : mood === 'celebrate'
              ? {
                  y: [0, -22, 0, -15, 0],
                  scale: [1, 1.08, 1, 1.05, 1],
                  rotate: [0, -6, 6, -3, 0],
                }
              : mood === 'alert'
              ? {
                  x: [-3, 3, -3, 3, 0],
                  scale: [1, 1.04, 1],
                }
              : {
                  y: [0, -5, 0],
                  scale: [1, 1.015, 1],
                }
          }
          transition={{
            duration: mood === 'celebrate' ? 0.9 : isSleeping ? 4 : 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            transform: isOnLeft ? 'scaleX(-1)' : 'none',
            x: springX,
            y: springY,
            rotate: springRotate,
          }}
          className="relative cursor-pointer transition-transform duration-150"
        >
          {/* Main Mascot Artwork */}
          <div className="relative">
            <Image
              src={mood === 'sad' ? '/berong_logout.webp' : '/rd-logo.webp'}
              alt="Berong Mascot"
              width={180}
              height={180}
              className={`chatbot-berong-image drop-shadow-2xl select-none w-24 sm:w-28 md:w-36 lg:w-40 h-auto transition-all duration-300 ${
                isSleeping ? 'opacity-85 brightness-95' : 'hover:scale-[1.03]'
              }`}
              draggable={false}
              priority
            />

            {/* Subtle Eyelid / Blink Animation */}
            {isBlinking && !isSleeping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-[32%] left-[42%] w-[28%] h-[8%] bg-[#6a3d1c] rounded-full pointer-events-none opacity-85"
              />
            )}

            {/* Sleeping Closed Eyes Effect */}
            {isSleeping && (
              <div className="absolute top-[33%] left-[40%] w-[32%] h-[10%] bg-[#532e14] rounded-full pointer-events-none opacity-90 shadow-sm" />
            )}

            {/* Alert Siren / Fire Pulsing Halo */}
            {mood === 'alert' && (
              <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-40 pointer-events-none" />
            )}

            {/* Optional Extensible Slot for Custom Lottie file */}
            {lottieAnimationData && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Lottie container ready for custom rigged animation */}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default InteractiveMascot
