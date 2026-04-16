"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Sparkles, Minimize2, Maximize2, Volume2, VolumeX, Mic, Square } from "lucide-react"
import Image from '@/components/Image';
import { motion, AnimatePresence, useMotionValue, animate } from "motion/react"
import { useAuth } from "@/lib/auth-context"
import { Link } from '@inertiajs/react';
import axios from 'axios';
import ReactMarkdown from "react-markdown"
import chatbotIntents from "@/lib/chatbot-intents.json"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

interface QuickQuestion {
  id: number;
  questionText: string;
  responseText: string;
  category: string;
}

// Pre-process intents for fast matching: extract keywords from all patterns
const processedIntents = Object.entries(chatbotIntents).map(([tag, data]) => {
  const intentData = data as { patterns: string[]; responses: string[] }
  // Extract unique keywords from all patterns (lowercased, 3+ chars)
  const allKeywords = new Set<string>()
  intentData.patterns.forEach((pattern: string) => {
    pattern.toLowerCase().split(/\s+/).forEach((word: string) => {
      const clean = word.replace(/[^a-z0-9]/g, "")
      if (clean.length >= 3) allKeywords.add(clean)
    })
  })
  return {
    tag,
    patterns: intentData.patterns.map((p: string) => p.toLowerCase()),
    responses: intentData.responses,
    keywords: Array.from(allKeywords),
  }
})

export function Chatbot() {
  const { isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [showCTA, setShowCTA] = useState(true)
  const ctaTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [quickQuestions, setQuickQuestions] = useState<Record<string, QuickQuestion[]>>({})
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [showQuickQuestions, setShowQuickQuestions] = useState(true)
  const [readAloud, setReadAloud] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const readAloudRef = useRef(readAloud)
  useEffect(() => {
    readAloudRef.current = readAloud
  }, [readAloud])

  const speakText = (text: string) => {
    if (!readAloudRef.current) return
    window.speechSynthesis.cancel() // Stop any current speech
    
    // Attempt to parse out basic markdown if present to read cleaner
    const cleanText = text.replace(/[*#_`]/g, '').replace(/\n+/g, ' ')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'en-US'
    window.speechSynthesis.speak(utterance)
  }

  const startListening = () => {
    // Check support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support Speech Recognition. Please try Chrome or Edge.")
      return
    }
    
    // type cast to any to bypass TS window type issues
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US' // Can also be tl-PH for tagalog

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInputValue(prev => prev + (prev.length > 0 ? ' ' : '') + transcript)
      setShowQuickQuestions(false)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error)
      if (event.error === 'not-allowed') {
        alert("Microphone access was denied. Please check your browser settings to allow microphone input.")
      } else {
        alert(`Microphone error: ${event.error}`)
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  // Compact mode — small circle button instead of full mascot
  const [useMiniButton, setUseMiniButton] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chatbot-mini-mode') === 'true'
    }
    return false
  })

  const toggleMiniMode = () => {
    setUseMiniButton(prev => {
      const next = !prev
      localStorage.setItem('chatbot-mini-mode', String(next))
      return next
    })
  }

  // Draggable chathead state - full XY drag with rotation
  const [isDragging, setIsDragging] = useState(false)
  const [isOnLeft, setIsOnLeft] = useState(false)
  const constraintsRef = useRef<HTMLDivElement>(null)
  const chatheadRef = useRef<HTMLDivElement>(null)
  const dragX = useMotionValue(0)
  const dragY = useMotionValue(0)
  // Separate rotation value - only tilts during active dragging, resets to 0 when snapped
  const rotationValue = useMotionValue(0)
  const lastDragX = useRef(0)

  // Mini button draggable state
  const miniRef = useRef<HTMLDivElement>(null)
  const miniDragX = useMotionValue(0)
  const miniDragY = useMotionValue(0)
  const [miniIsOnLeft, setMiniIsOnLeft] = useState(false)

  // Entry slide-in animation via motion value (so it doesn't conflict with snap)
  useEffect(() => {
    if (!isOpen) {
      rotationValue.set(0)
      if (isOnLeft) {
        // Re-enter from the left side
        const screenWidth = window.innerWidth
        const chatheadWidth = chatheadRef.current?.offsetWidth || 160
        const leftOffset = screenWidth < 640 ? 0 : 5  // less offset on mobile
        const targetX = -(screenWidth - chatheadWidth) + leftOffset  // adjust berong sides
        dragX.set(targetX - 100) // start further off-screen left
        animate(dragX, targetX, { type: "spring", stiffness: 400, damping: 25 })
      } else {
        // Re-enter from the right side (default)
        dragX.set(100)
        animate(dragX, 0, { type: "spring", stiffness: 400, damping: 25 })
      }
    }
  }, [isOpen])

  // Snap to nearest screen edge when drag ends
  const handleDragEnd = () => {
    setIsDragging(false)
    // Reset rotation to 0 (straight) when snapping
    animate(rotationValue, 0, { type: "spring", stiffness: 400, damping: 30 })

    const chatheadEl = chatheadRef.current
    if (!chatheadEl) return

    const chatheadWidth = chatheadEl.offsetWidth
    const screenWidth = window.innerWidth
    const currentCenterX = (screenWidth - chatheadWidth) + dragX.get() + chatheadWidth / 2
    const isCloserToLeft = currentCenterX < screenWidth / 2

    if (isCloserToLeft) {
      // Snap to left edge
      const leftOffset = screenWidth < 640 ? 0 : 5  // less offset on mobile
      const targetX = -(screenWidth - chatheadWidth) + leftOffset  // adjust berong sides
      animate(dragX, targetX, { type: "spring", stiffness: 400, damping: 30 })
      setIsOnLeft(true)
    } else {
      // Snap back to right edge (original position)
      animate(dragX, 0, { type: "spring", stiffness: 400, damping: 30 })
      setIsOnLeft(false)
    }
  }

  // Update rotation based on drag movement delta (tilt while dragging)
  const handleDrag = () => {
    const currentX = dragX.get()
    const delta = currentX - lastDragX.current
    // Clamp rotation between -15 and 15 degrees based on drag direction
    const newRotation = Math.max(-15, Math.min(15, delta * -0.5))
    rotationValue.set(newRotation)
    lastDragX.current = currentX
  }

  const startCTATimeout = () => {
    if (ctaTimeoutRef.current) clearTimeout(ctaTimeoutRef.current)
    ctaTimeoutRef.current = setTimeout(() => {
      setShowCTA(false)
    }, 5000)
  }

  useEffect(() => {
    if (!isOpen) {
      setShowCTA(true)
      startCTATimeout()
    }
    return () => {
      if (ctaTimeoutRef.current) clearTimeout(ctaTimeoutRef.current)
    }
  }, [isOpen])

  const handleMouseEnter = () => {
    if (!isOpen && !isDragging) {
      setShowCTA(true)
      if (ctaTimeoutRef.current) clearTimeout(ctaTimeoutRef.current)
    }
  }

  const handleMouseLeave = () => {
    if (!isOpen) {
      startCTATimeout()
    }
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Load quick questions when the component mounts
  useEffect(() => {
    const loadQuickQuestions = async () => {
      try {
        const response = await axios.get('/api/quick-questions')
        if (response.data) {
          const questionsArray: QuickQuestion[] = response.data
          
          const grouped: Record<string, QuickQuestion[]> = {}
          questionsArray.forEach((q) => {
            const cat = q.category || 'General'
            if (!grouped[cat]) grouped[cat] = []
            grouped[cat].push(q)
          })
          
          setQuickQuestions(grouped)
        }
      } catch (error) {
        console.error('Error loading quick questions:', error)
      } finally {
        setLoadingQuestions(false)
      }
    }

    if (isOpen) {
      // Add initial welcome message when the chatbot opens
      if (messages.length === 0) {
        const welcomeMessage = isAuthenticated
          ? "Hello! I'm Berong the BFP Sta Cruz assistant. I'm powered by AI to help you with fire safety questions. Ask me anything!"
          : "Hello! I'm Berong the BFP Sta Cruz assistant. How can I help you with fire safety today?\n\n💡 Tip: Sign in to unlock AI-powered responses for more personalized help!"

        setMessages([
          {
            id: "1",
            text: welcomeMessage,
            sender: "bot",
            timestamp: new Date(),
          }
        ])
      }

      // Show quick questions when opening chatbot
      setShowQuickQuestions(true);

      // Load quick questions if not already loaded
      if (Object.keys(quickQuestions).length === 0) {
        loadQuickQuestions()
      }
    }
  }, [isOpen, messages.length, quickQuestions, isAuthenticated])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Create an abort controller for stopping generation
    abortControllerRef.current = new AbortController()

    // Get bot response and add to messages
    const currentContext = [...messages, userMessage]
    setIsTyping(true)
    
    let botResponse = ""
    try {
      botResponse = await generateBotResponse(inputValue, currentContext, abortControllerRef.current.signal)
    } finally {
      setIsTyping(false)
      abortControllerRef.current = null
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      sender: "bot",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, botMessage])
    if (botResponse !== "Response generation stopped.") {
      speakText(botResponse)
    }
  }

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const handleQuickQuestion = async (questionText: string, responseText: string) => {
    // Add the question as a user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: questionText,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // Add the response as a bot message
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: responseText,
      sender: "bot",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, botMessage])
    speakText(responseText)
  }

  const generateBotResponse = async (input: string, currentHistory: Message[] = [], signal?: AbortSignal): Promise<string> => {
    // Only use AI for authenticated users
    if (!isAuthenticated) {
      return generateRuleBasedResponse(input) + "\n\n💡 Sign in for AI-powered responses!"
    }

    try {
      // Use AI backend for logged-in users
      // Map history to simple role/text objects
      const recentHistory = currentHistory.slice(currentHistory.length > 5 ? currentHistory.length - 5 : 0).map(m => ({
        role: m.sender === 'user' ? 'user' : 'bot',
        text: m.text
      }));

      const response = await axios.post('/api/chatbot/ai-response', {
        message: input,
        history: recentHistory
      }, { signal });

      if (response.data && response.data.response) {
        return response.data.response;
      } else {
        console.error('AI response data empty:', response);
        return "I apologize, but my AI system received an unexpected response. Please try asking your question again.";
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return "Response generation stopped.";
      }
      console.error('Error calling AI backend:', error);
      return "I'm having trouble connecting to my knowledge base right now. For emergencies, please call 911 immediately.";
    }
  }

  const generateRuleBasedResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()
    const inputWords = lowerInput.split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, "")).filter(w => w.length >= 3)

    // Step 1: Check for exact/near-exact pattern match
    let bestMatch: { tag: string; score: number } = { tag: "", score: 0 }

    for (const intent of processedIntents) {
      // Check if input closely matches any full pattern
      for (const pattern of intent.patterns) {
        const patternWords = pattern.split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, "")).filter(w => w.length >= 3)
        const matchingWords = inputWords.filter(w => patternWords.includes(w))
        // Score = what fraction of the pattern keywords match, boosted by how many input words match
        if (patternWords.length > 0) {
          const patternCoverage = matchingWords.length / patternWords.length
          const inputCoverage = matchingWords.length / Math.max(inputWords.length, 1)
          const score = (patternCoverage * 0.7) + (inputCoverage * 0.3)
          if (score > bestMatch.score) {
            bestMatch = { tag: intent.tag, score }
          }
        }
      }

      // Also do keyword overlap scoring
      const matchingKeywords = inputWords.filter(w => intent.keywords.includes(w))
      if (matchingKeywords.length > 0) {
        const keywordScore = (matchingKeywords.length / Math.max(inputWords.length, 1)) * 0.6
        if (keywordScore > bestMatch.score) {
          bestMatch = { tag: intent.tag, score: keywordScore }
        }
      }
    }

    // Step 2: If we have a decent match (score > 0.2), return a response from that intent
    if (bestMatch.score > 0.2 && bestMatch.tag) {
      const intentData = chatbotIntents[bestMatch.tag as keyof typeof chatbotIntents]
      if (intentData && intentData.responses.length > 0) {
        const randomIndex = Math.floor(Math.random() * intentData.responses.length)
        return intentData.responses[randomIndex]
      }
    }

    // Step 3: Fallback for no match
    return "Thank you for your question! I can help with fire safety topics like fire prevention, emergency procedures, fire extinguishers, evacuation planning, and more. Try asking about a specific fire safety topic!"
  }

  return (
    <>
      {/* Chatbot Toggle - Berong Character or Mini Button */}
      <div ref={constraintsRef} className="fixed inset-0 z-[60] pointer-events-none">
        {/* Full Mascot Mode */}
        <AnimatePresence>
          {!isOpen && !useMiniButton && (
            <motion.div
              className="pointer-events-auto absolute right-0 bottom-0"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              drag
              dragConstraints={constraintsRef}
              dragElastic={0.1}
              dragMomentum={false}
              onDragStart={() => { setIsDragging(true); lastDragX.current = dragX.get() }}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              ref={chatheadRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: isDragging ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              whileDrag={{ scale: 1.1, cursor: "grabbing" }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => {
                if (!isDragging) setIsOpen(true)
              }}
              style={{
                x: dragX,
                y: dragY,
                rotate: rotationValue,
                cursor: isDragging ? "grabbing" : "pointer",
                touchAction: "none"
              }}
            >
              {/* Drag handle hint */}
              <div className="absolute top-2 left-2 bg-black/20 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] text-white/80 opacity-0 hover:opacity-100 transition-opacity">
                ✥ Drag me
              </div>

              {/* Speech Bubble CTA */}
              <AnimatePresence>
                {showCTA && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
                    exit={{ opacity: 0, scale: 0.5, y: 20, transition: { delay: 0, duration: 0.2 } }}
                    transition={{ 
                      delay: 1.5,
                      y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                      default: { type: "spring", stiffness: 200 }
                    }}
                    className={`absolute bottom-full mb-4 z-50 pointer-events-auto ${isOnLeft ? 'left-4' : 'right-0'}`}
                  >
                    <div className="relative bg-white border-[4px] border-[#ff6b00] rounded-[2rem] px-5 sm:px-6 py-2 sm:py-3 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)]">
                      <div className="text-[#e60000] font-black text-xs sm:text-sm md:text-base leading-[1.2] text-center tracking-wide whitespace-nowrap">
                        LET&apos;S LEARN ABOUT<br />FIRE SAFETY!
                      </div>
                      <div className={`absolute -bottom-[11px] w-4 h-4 sm:w-5 sm:h-5 bg-white border-b-[4px] border-r-[4px] border-[#ff6b00] transform rotate-45 rounded-br-[3px] ${isOnLeft ? 'left-6 sm:left-10' : 'right-6 sm:right-10'}`}></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Image
                src="/RD Logo.png"
                alt="Berong - BFP Assistant"
                width={180}
                height={180}
                className="chatbot-berong-image drop-shadow-2xl select-none w-24 sm:w-28 md:w-36 lg:w-40 h-auto transition-all duration-300"
                style={{ transform: isOnLeft ? 'scaleX(-1)' : 'none' }}
                draggable={false}
                priority
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mini Circle Button Mode (AssistiveTouch-style) */}
        <AnimatePresence>
          {!isOpen && useMiniButton && (
            <motion.div
              ref={miniRef}
              className="pointer-events-auto absolute right-4 bottom-6"
              drag
              dragConstraints={constraintsRef}
              dragElastic={0.1}
              dragMomentum={false}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => {
                // Snap to nearest edge
                const el = miniRef.current
                if (!el) { setIsDragging(false); return }

                const btnSize = el.offsetWidth
                const screenW = window.innerWidth
                const screenH = window.innerHeight
                // The button's default position is right-4 bottom-6 (right:16px, bottom:24px)
                // So its default left = screenW - 16 - btnSize
                const defaultLeft = screenW - 16 - btnSize
                const currentLeft = defaultLeft + miniDragX.get()
                const centerX = currentLeft + btnSize / 2
                const isLeft = centerX < screenW / 2

                // Clamp Y so it stays on screen
                const defaultTop = screenH - 24 - btnSize
                const currentTop = defaultTop + miniDragY.get()
                const clampedTop = Math.max(8, Math.min(screenH - btnSize - 8, currentTop))
                const clampedY = clampedTop - defaultTop
                animate(miniDragY, clampedY, { type: 'spring', stiffness: 400, damping: 30 })

                if (isLeft) {
                  // Snap to left: target left = 16px
                  const targetX = 16 - defaultLeft
                  animate(miniDragX, targetX, { type: 'spring', stiffness: 400, damping: 30 })
                  setMiniIsOnLeft(true)
                } else {
                  // Snap to right: target left = screenW - 16 - btnSize = defaultLeft => x=0
                  animate(miniDragX, 0, { type: 'spring', stiffness: 400, damping: 30 })
                  setMiniIsOnLeft(false)
                }

                setTimeout(() => setIsDragging(false), 50)
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={() => {
                if (!isDragging) setIsOpen(true)
              }}
              style={{
                x: miniDragX,
                y: miniDragY,
                touchAction: 'none',
              }}
            >
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-[#ff6b00] to-[#ff8c00] border-[3px] border-white shadow-[0_4px_20px_rgba(255,107,0,0.4)] cursor-pointer flex items-center justify-center overflow-hidden group">
                <Image
                  src="/RD Logo.png"
                  alt="Berong - BFP Assistant"
                  width={56}
                  height={56}
                  className="h-10 w-10 sm:h-12 sm:w-12 object-contain select-none drop-shadow-md group-hover:scale-110 transition-transform duration-200"
                  draggable={false}
                />
                {/* Subtle pulse ring */}
                <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-30 pointer-events-none" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chatbot Window - Positioned based on which side Berong is on */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.95,
            }}
            transition={{
              duration: 0.25,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className={`chatbot-window-container fixed bottom-24 z-50 ${(useMiniButton ? miniIsOnLeft : isOnLeft) ? 'left-6' : 'right-6'}`}
            style={{
              transformOrigin: (useMiniButton ? miniIsOnLeft : isOnLeft) ? 'bottom left' : 'bottom right',
              willChange: 'transform, opacity',
            }}
          >
            <Card className="chatbot-window w-[480px] max-w-[90vw] h-[70vh] min-h-[450px] max-h-[620px] flex flex-col shadow-2xl p-0 gap-0 overflow-hidden border-[3px] border-[#ff6b00] rounded-2xl">
              {/* Header — Orange */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#ff6b00] to-[#ff8c00] text-white rounded-t-xl">
                <div className="flex items-center gap-3">
                  <Image
                    src="/RD Logo.png"
                    alt="BFP Assistant"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain rounded-full bg-white/20 p-0.5"
                  />
                  <h3 className="font-black text-lg tracking-wide">BFP Assistant</h3>
                </div>
                <div className="flex items-center gap-1">
                  {/* Toggle Read Aloud */}
                  <button
                    onClick={() => {
                      setReadAloud(prev => !prev)
                      if (readAloud) window.speechSynthesis.cancel()
                    }}
                    className={`h-9 w-9 flex items-center justify-center rounded-lg transition-colors ${readAloud ? 'bg-white/30 text-white' : 'text-white/80 hover:bg-white/20'}`}
                    title={readAloud ? 'Turn off voice' : 'Turn on voice'}
                  >
                    {readAloud ? <Volume2 className="h-5 w-5" strokeWidth={2.5} /> : <VolumeX className="h-5 w-5" strokeWidth={2.5} />}
                  </button>

                  {/* Toggle mini/full mascot mode */}
                  <button
                    onClick={toggleMiniMode}
                    className="h-9 w-9 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition-colors"
                    title={useMiniButton ? 'Switch to full mascot' : 'Switch to mini button'}
                  >
                    {useMiniButton ? <Maximize2 className="h-5 w-5" strokeWidth={2.5} /> : <Minimize2 className="h-5 w-5" strokeWidth={2.5} />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="h-9 w-9 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-6 w-6" strokeWidth={3} />
                  </button>
                </div>
              </div>

              {/* Quick Questions Section */}
              {loadingQuestions ? (
                <div className="p-3 text-center">
                  <div className="animate-pulse text-xs text-muted-foreground">Loading suggestions...</div>
                </div>
              ) : Object.keys(quickQuestions).length > 0 && showQuickQuestions ? (
                <div className="py-2 px-3 bg-gray-50/80 border-b backdrop-blur-sm">
                  {/* Header with Icon */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Suggested Topics
                    </h4>
                  </div>

                  {/* Scrollable Area */}
                  <div className="max-h-[110px] overflow-y-auto pr-1 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {Object.entries(quickQuestions).map(([category, questions]) => (
                      <div key={category} className="first:mt-0">
                        <h5 className="text-[10px] font-bold text-gray-400 mb-2 pl-1 uppercase">
                          {category}
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {questions.slice(0, 4).map((question) => (
                            <button
                              key={question.id}
                              onClick={() => handleQuickQuestion(question.questionText, question.responseText)}
                              className="text-xs text-left px-3 py-2 rounded-xl bg-white border border-gray-200 shadow-sm text-gray-700 transition-all duration-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 hover:shadow-md active:scale-95"
                            >
                              {question.questionText}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Messages — white background */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 ${
                        message.sender === "user"
                          ? "bg-[#1a6b3c] text-white rounded-br-md"
                          : "bg-[#1e3a4a] text-white border border-[#2a5060] rounded-bl-md"
                      }`}
                    >
                      {message.sender === "bot" ? (
                        <div className="text-sm prose prose-sm prose-invert max-w-none
                          [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>li]:my-0.5
                          [&>ul]:pl-4 [&>ol]:pl-4 [&>ul]:list-disc [&>ol]:list-decimal
                          [&>h1]:text-base [&>h1]:font-bold [&>h1]:mt-2 [&>h1]:mb-1
                          [&>h2]:text-sm [&>h2]:font-bold [&>h2]:mt-2 [&>h2]:mb-1
                          [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:mt-1.5 [&>h3]:mb-0.5
                          [&>strong]:font-semibold [&>em]:italic
                          [&>code]:bg-white/10 [&>code]:px-1 [&>code]:rounded [&>code]:text-xs
                          [&>blockquote]:border-l-2 [&>blockquote]:border-orange-400 [&>blockquote]:pl-2 [&>blockquote]:italic
                        ">
                          <ReactMarkdown>{message.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{message.text}</p>
                      )}
                    </div>
                  </div>
                ))}
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#1e3a4a] text-white border border-[#2a5060] rounded-2xl rounded-bl-md p-3 px-4 flex items-center gap-1.5 h-10 w-16">
                      <motion.div
                        className="w-1.5 h-1.5 bg-orange-400 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div
                        className="w-1.5 h-1.5 bg-orange-400 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                      />
                      <motion.div
                        className="w-1.5 h-1.5 bg-orange-400 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                      />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer — with mic + send */}
              <div className="px-4 py-3 border-t border-gray-200 bg-white rounded-b-xl">
                <div className="flex items-center gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      if (e.target.value.trim() !== '') {
                        setShowQuickQuestions(false);
                      }
                    }}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask about fire safety..."
                    className="flex-1 border-gray-300 bg-gray-50 rounded-xl focus:ring-orange-400 focus:border-orange-400"
                  />
                  <button
                    type="button"
                    onClick={startListening}
                    className={`h-10 w-10 flex items-center justify-center transition-all ${
                      isListening 
                        ? 'text-red-500 bg-red-100 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                        : 'text-gray-400 hover:text-orange-500'
                    }`}
                    title={isListening ? "Listening..." : "Voice input"}
                  >
                    <Mic className="h-5 w-5" strokeWidth={isListening ? 2.5 : 2} />
                  </button>
                  {isTyping ? (
                    <button
                      onClick={handleStopGeneration}
                      className="h-10 w-10 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-all active:scale-95"
                      title="Stop generating"
                    >
                      <Square className="h-4 w-4 fill-current" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
                      className={`h-10 w-10 flex items-center justify-center text-white rounded-full shadow-md transition-all active:scale-95 ${
                        inputValue.trim() ? 'bg-[#1e293b] hover:bg-[#334155]' : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <Send className="h-4 w-4 ml-0.5" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
};
