"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Sparkles, Minimize2, Maximize2, Volume2, VolumeX, Mic, Square, User } from "lucide-react"
import Image from '@/components/Image';
import { motion, AnimatePresence, useMotionValue, animate } from "motion/react"
import { useAuth } from "@/lib/auth-context"
import { Link } from '@inertiajs/react';
import axios from 'axios';
import ReactMarkdown from "react-markdown"
import chatbotIntents from "@/lib/chatbot-intents.json"
import { createAudio } from '@/lib/audio'

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
  const { user, isAuthenticated } = useAuth()
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
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null)
  const [isTTSLoading, setIsTTSLoading] = useState(false)

  const playPop = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return
      const ctx = new AudioContextClass()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(400, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.4, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.1)
    } catch (e) {
      console.warn("Pop sound failed:", e)
    }
  }

  const playChirp = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return
      const ctx = new AudioContextClass()
      const now = ctx.currentTime
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = "sine"
      osc1.frequency.setValueAtTime(600, now)
      gain1.gain.setValueAtTime(0.3, now)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.15)

      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = "sine"
      osc2.frequency.setValueAtTime(800, now + 0.08)
      gain2.gain.setValueAtTime(0.3, now + 0.08)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(now + 0.08)
      osc2.stop(now + 0.25)
    } catch (e) {
      console.warn("Chirp sound failed:", e)
    }
  }

  const playClose = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return
      const ctx = new AudioContextClass()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.15)
    } catch (e) {
      console.warn("Close sound failed:", e)
    }
  }

  const readAloudRef = useRef(readAloud)
  useEffect(() => {
    readAloudRef.current = readAloud
  }, [readAloud])

  const speakText = async (text: string, messageId: string | null = null, force: boolean = false) => {
    if (!readAloudRef.current && !force) return

    if (isTTSLoading) return;

    // If clicking the button of the currently speaking message, just stop it and return
    if (messageId && speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }
      setSpeakingMessageId(null);
      return;
    }

    // Stop any current native speech or audio
    window.speechSynthesis.cancel()
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current.currentTime = 0
    }
    setSpeakingMessageId(null)

    // Set new speaking message
    setSpeakingMessageId(messageId)
    setIsTTSLoading(true)

    try {
      // Call our backend API to get the audio from OpenAI
      const response = await axios.post('/api/chatbot/tts', { text }, {
        responseType: 'blob' // Expecting an audio file back
      })

      // Create a URL for the blob and play it
      const audioUrl = URL.createObjectURL(response.data)
      const audio = createAudio(audioUrl, 'general')

      currentAudioRef.current = audio
      audio.play()
      setIsTTSLoading(false)

      // Cleanup URL after playing
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        setSpeakingMessageId(null)
        setIsTTSLoading(false)
      }
      audio.onerror = () => {
        setSpeakingMessageId(null)
        setIsTTSLoading(false)
      }
    } catch (error) {
      setIsTTSLoading(false)
      console.error("AI Voice Error, falling back to browser voice:", error)

      // Fallback to built-in browser voice if the API fails (e.g., missing API key)
      const cleanText = text.replace(/[*#_`]/g, '').replace(/\n+/g, ' ')
      const utterance = new SpeechSynthesisUtterance(cleanText)

      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(voice =>
        voice.name.includes('Google US English') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Microsoft Zira') ||
        voice.lang === 'en-US' ||
        voice.lang === 'en-GB'
      )

      if (preferredVoice) {
        utterance.voice = preferredVoice
      } else {
        utterance.lang = 'en-US'
      }

      utterance.onend = () => {
        setSpeakingMessageId(null)
        setIsTTSLoading(false)
      }
      utterance.onerror = () => {
        setSpeakingMessageId(null)
        setIsTTSLoading(false)
      }

      window.speechSynthesis.speak(utterance)
    }
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
  const isMounted = useRef(false)
  useEffect(() => {
    if (!isOpen) {
      rotationValue.set(0)
      if (isOnLeft) {
        // Re-enter from the left side
        const screenWidth = window.innerWidth
        const chatheadWidth = chatheadRef.current?.offsetWidth || 160
        const leftOffset = screenWidth < 640
          ? (useMiniButton ? 24 : 0)
          : (useMiniButton ? 32 : 0)
        const targetX = -(screenWidth - chatheadWidth) + leftOffset  // adjust berong sides

        if (!isMounted.current) {
          dragX.set(targetX)
        } else {
          dragX.set(targetX - 100) // start further off-screen left
          animate(dragX, targetX, { type: "spring", stiffness: 400, damping: 25 })
        }
      } else {
        // Re-enter from the right side (default)
        if (!isMounted.current) {
          dragX.set(0)
        } else {
          dragX.set(100)
          animate(dragX, 0, { type: "spring", stiffness: 400, damping: 25 })
        }
      }
      isMounted.current = true
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
      const leftOffset = screenWidth < 640
        ? (useMiniButton ? 24 : 0)
        : (useMiniButton ? 32 : 0)
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

  // Auto-scroll to bottom when messages change or typing indicator appears
  useEffect(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    })
  }, [messages, isTyping, isOpen])

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
    playChirp()
    if (botResponse !== "Response generation stopped.") {
      speakText(botResponse, botMessage.id)
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
    playChirp()
    speakText(responseText, botMessage.id)
  }

  const generateBotResponse = async (input: string, currentHistory: Message[] = [], signal?: AbortSignal): Promise<string> => {
    // Guest users cannot use the chatbot (no API, no fallback)
    if (!isAuthenticated) {
      return "💡 Please log in to your account to use the Berong AI Assistant!"
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

      // If the backend indicates an error (e.g. missing API key, 503 overload)
      if (response.data && response.data.error) {
        console.warn('AI fallback triggered due to backend error:', response.data.response);
        return generateRuleBasedResponse(input) + "\n\n*(Offline Mode)*";
      }

      if (response.data && response.data.response) {
        return response.data.response;
      } else {
        console.error('AI response data empty:', response);
        return generateRuleBasedResponse(input) + "\n\n*(Offline Mode)*";
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return "Response generation stopped.";
      }
      console.error('Error calling AI backend, triggering fallback:', error);
      return generateRuleBasedResponse(input) + "\n\n*(Offline Mode)*";
    }
  }

  const generateRuleBasedResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    // Stop words to prevent false positive matches on common conversational words
    const stopWords = new Set([
      'what', 'when', 'where', 'how', 'why', 'who', 'is', 'the', 'a', 'an', 'and', 'or', 'do', 'does', 'did',
      'for', 'to', 'in', 'of', 'on', 'with', 'about', 'should', 'can', 'will', 'would', 'could', 'if', 'my',
      'your', 'i', 'me', 'you', 'it', 'know', 'are', 'we', 'they', 'them', 'that', 'this', 'then', 'than',
      'there', 'their', 'was', 'were', 'been', 'has', 'have', 'had', 'got', 'get', 'some', 'any', 'all',
      'out', 'put', 'up', 'down', 'from', 'by', 'as', 'at', 'so', 'be', 'yout', 'tell', 'make', 'use',
      'hi', 'hello', 'hey', 'chatbot', 'bot', 'assistant', 'want', 'wanted', 'ask', 'question', 'quick', 'help', 'please'
    ]);

    // Only consider meaningful words >= 2 chars
    const inputWords = lowerInput.split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, "")).filter(w => w.length >= 2 && !stopWords.has(w))

    // Step 1: Check for exact/near-exact pattern match using Cosine Similarity
    let bestMatch: { tag: string; score: number } = { tag: "", score: 0 }

    for (const intent of processedIntents) {
      // Check if input closely matches any full pattern
      for (const pattern of intent.patterns) {
        const patternWords = pattern.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, "")).filter(w => w.length >= 2 && !stopWords.has(w))

        // Skip if pattern only contained stop words
        if (patternWords.length === 0) continue;

        const matchingWords = inputWords.filter(w => patternWords.includes(w))

        if (matchingWords.length > 0) {
          // Calculate Cosine Similarity: MatchCount / sqrt(PatternLength * InputLength)
          const denominator = Math.sqrt(patternWords.length * inputWords.length);
          const score = denominator > 0 ? matchingWords.length / denominator : 0;

          if (score > bestMatch.score) {
            bestMatch = { tag: intent.tag, score }
          }
        }
      }

      // Also do keyword overlap scoring as a secondary measure
      const matchingKeywords = inputWords.filter(w => intent.keywords.includes(w))
      if (matchingKeywords.length > 0 && intent.keywords.length > 0) {
        const keywordDenominator = Math.sqrt(intent.keywords.length * inputWords.length);
        const keywordScore = keywordDenominator > 0 ? (matchingKeywords.length / keywordDenominator) * 0.8 : 0;

        if (keywordScore > bestMatch.score) {
          bestMatch = { tag: intent.tag, score: keywordScore }
        }
      }
    }

    // Step 2: If we have a decent match (Cosine Similarity > 0.55), return a response
    // 0.55 is a strict threshold that prevents random guesses
    if (bestMatch.score > 0.55 && bestMatch.tag) {
      const intentData = chatbotIntents[bestMatch.tag as keyof typeof chatbotIntents]
      if (intentData && intentData.responses.length > 0) {
        const randomIndex = Math.floor(Math.random() * intentData.responses.length)
        return intentData.responses[randomIndex]
      }
    }

    // Step 3: Fallback for no match
    return "Thank you for your question! Because I am currently running in offline mode, I can only understand basic English questions right now. Try asking a specific fire safety question in English, like 'how to prevent fires' or 'emergency procedure'."
  }

  return (
    <>
      {/* Chatbot Toggle - Berong Character or Mini Button */}
      <div ref={constraintsRef} className="fixed inset-x-0 top-24 bottom-6 z-[60] pointer-events-none">
        <AnimatePresence>
          {!isOpen ? (
            <motion.div
              key="chatbot-toggle"
              className={`pointer-events-auto fixed ss-chatbot-toggle ${useMiniButton ? 'right-6 bottom-6 sm:bottom-6' : 'right-0 bottom-0'}`}
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
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
              whileHover={{ scale: isDragging ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              whileDrag={{ scale: 1.1, cursor: "grabbing" }}
              transition={{ type: "spring", stiffness: 600, damping: 35 }}
              onClick={() => {
                if (!isDragging) {
                  setIsOpen(true)
                  playPop()
                }
              }}
              style={{
                x: dragX,
                y: dragY,
                rotate: rotationValue,
                cursor: isDragging ? "grabbing" : "pointer",
                touchAction: "none"
              }}
            >
              {useMiniButton ? (
                /* Mini Button Rendering */
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="relative"
                >
                  <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white border-[3px] border-orange-500 shadow-lg cursor-pointer flex items-center justify-center overflow-hidden group">
                    <Image
                      src="/berong_pr.png"
                      alt="Berong - BFP Assistant"
                      width={56}
                      height={56}
                      className="h-11 w-11 sm:h-13 sm:w-13 object-contain select-none drop-shadow-md group-hover:scale-110 transition-transform duration-200"
                      draggable={false}
                    />
                    <div className="absolute inset-0 rounded-full border-2 border-orange-500/30 animate-ping opacity-30 pointer-events-none" />
                  </div>
                </motion.div>
              ) : (
                /* Full Mascot Rendering */
                <>
                  {/* Drag handle hint */}
                  <div className="absolute top-2 left-2 bg-black/20 rounded-full px-2 py-0.5 text-[10px] text-white/80 opacity-0 hover:opacity-100 transition-opacity">
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
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="chatbot-window"
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.1 } }}
              transition={{ type: "spring", stiffness: 600, damping: 35 }}
              className={`chatbot-window-container ss-chatbot-window fixed bottom-20 z-50 ${(useMiniButton ? miniIsOnLeft : isOnLeft) ? 'left-8' : 'right-6'}`}
              style={{
                transformOrigin: (useMiniButton ? miniIsOnLeft : isOnLeft) ? 'bottom left' : 'bottom right',
                willChange: 'transform, opacity',
                pointerEvents: 'auto',
                transform: 'translate3d(0,0,0)',
                backfaceVisibility: 'hidden'
              }}
            >
              <Card className="chatbot-window w-[480px] max-w-[90vw] h-[70vh] min-h-[450px] max-h-[620px] flex flex-col shadow-2xl p-0 gap-0 overflow-hidden border-[3px] border-[#ff6b00] rounded-2xl dark:bg-slate-900 dark:border-[#ff8c00]">
                {/* Header — Orange */}
                <div className="flex items-center justify-between px-4 py-3 bg-orange-600 text-white rounded-t-xl shrink-0">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/berong_pr.png"
                      alt="BFP Assistant"
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain rounded-full bg-white p-0.5"
                    />
                    <h3 className="font-black text-lg tracking-wide">BFP Assistant</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Toggle Read Aloud */}
                    <button
                      onClick={() => {
                        setReadAloud(prev => !prev)
                        if (readAloud) {
                          window.speechSynthesis.cancel()
                          if (currentAudioRef.current) {
                            currentAudioRef.current.pause()
                            currentAudioRef.current.currentTime = 0
                          }
                          setSpeakingMessageId(null)
                          setIsTTSLoading(false)
                        }
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
                      onClick={() => {
                        setIsOpen(false)
                        playClose()
                      }}
                      className="h-9 w-9 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="h-6 w-6" strokeWidth={3} />
                    </button>
                  </div>
                </div>

                {/* Quick Questions Section */}
                {loadingQuestions ? (
                  <div className="p-3 text-center dark:bg-slate-950/50">
                    <div className="animate-pulse text-xs text-muted-foreground dark:text-slate-500">Loading suggestions...</div>
                  </div>
                ) : Object.keys(quickQuestions).length > 0 && showQuickQuestions ? (
                  <div className="py-2 px-3 bg-gray-50 dark:bg-slate-950 border-b dark:border-slate-800 shrink-0">
                    {/* Header with Icon */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Suggested Topics
                      </h4>
                    </div>

                    {/* Scrollable Area */}
                    <div className="max-h-[110px] overflow-y-auto pr-1 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {Object.entries(quickQuestions).map(([category, questions]) => (
                        <div key={category} className="first:mt-0">
                          <h5 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-2 pl-1 uppercase">
                            {category}
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {questions.slice(0, 4).map((question) => (
                              <button
                                key={question.id}
                                onClick={() => handleQuickQuestion(question.questionText, question.responseText)}
                                className="text-xs text-left px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm text-gray-700 dark:text-slate-300 transition-all duration-200 hover:border-orange-300 dark:hover:border-orange-500/50 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-700 dark:hover:text-orange-400 hover:shadow-md active:scale-95"
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

                {/* Messages — theme aware background */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-slate-900 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex gap-2 max-w-[90%] ${message.sender === "user" ? "ml-auto justify-end" : "justify-start"}`}>
                      {message.sender === "bot" && (
                        <div className="shrink-0 mt-auto">
                          <Image
                            src="/berong_pr.png"
                            alt="Berong"
                            width={28}
                            height={28}
                            className="h-7 w-7 object-contain rounded-full bg-white p-0.5 border border-slate-200 shadow-sm"
                          />
                        </div>
                      )}
                      <div
                        className={`rounded-2xl p-3 shadow-sm relative group w-fit ${message.sender === "user"
                            ? "bg-[#1a6b3c] dark:bg-[#1a6b3c] text-white"
                            : "bg-[#1e3a4a] dark:bg-slate-800 text-white border border-[#2a5060] dark:border-slate-700"
                          }`}
                      >
                        {message.sender === "bot" ? (
                          <>
                            <div className="text-sm prose prose-sm prose-invert max-w-none
                            [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>li]:my-0.5
                            [&>ul]:pl-4 [&>ol]:pl-4 [&>ul]:list-disc [&>ol]:list-decimal
                            [&>h1]:text-base [&>h1]:font-bold [&>h1]:mt-2 [&>h1]:mb-1
                            [&>h2]:text-sm [&>h2]:font-bold [&>h2]:mt-2 [&>h2]:mb-1
                            [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:mt-1.5 [&>h3]:mb-0.5
                            [&>strong]:font-semibold [&>em]:italic
                            [&>code]:bg-white/10 dark:[&>code]:bg-slate-950/50 [&>code]:px-1 [&>code]:rounded [&>code]:text-xs
                            [&>blockquote]:border-l-2 [&>blockquote]:border-orange-400 [&>blockquote]:pl-2 [&>blockquote]:italic
                          ">
                              <ReactMarkdown>{message.text}</ReactMarkdown>
                            </div>
                            <button
                              onClick={() => speakText(message.text, message.id, true)}
                              disabled={isTTSLoading}
                              className={`absolute -bottom-2 -right-2 h-8 w-8 flex items-center justify-center rounded-full border-2 shadow-md transition-all z-10 ${isTTSLoading ? 'cursor-not-allowed opacity-70' : 'hover:scale-110 active:scale-90'
                                } ${speakingMessageId === message.id
                                  ? `bg-orange-500 border-orange-200 text-white ${isTTSLoading ? 'animate-pulse' : ''}`
                                  : "bg-slate-500 dark:bg-slate-700 border-white dark:border-slate-900 text-white"
                                }`}
                              title={speakingMessageId === message.id && !isTTSLoading ? "Stop reading" : "Read aloud"}
                            >
                              {speakingMessageId === message.id && !isTTSLoading ? (
                                <Square className="h-3 w-3 fill-current" />
                              ) : (
                                <Volume2 className="h-4 w-4" strokeWidth={2.5} />
                              )}
                            </button>
                          </>
                        ) : (
                          <p className="text-sm font-medium">{message.text}</p>
                        )}
                      </div>
                      {message.sender === "user" && (() => {
                        const avatarId = user?.avatar || 'cow';
                        const avatarOpt = [
                          { id: 'cow', icon: '/berong_pr.png' },
                          { id: 'ff1', icon: '/hero_jack.png' },
                          { id: 'ff2', icon: '/hero_sarah.png' },
                          { id: 'kid1', icon: '🧒' },
                          { id: 'kid2', icon: '👧' },
                          { id: 'adult1', icon: '👨' },
                          { id: 'adult2', icon: '👩' },
                        ].find(opt => opt.id === avatarId);
                        
                        return (
                          <div className="shrink-0 mt-auto flex items-center justify-center h-7 w-7 rounded-full bg-slate-200 border border-slate-300 shadow-sm overflow-hidden">
                            {avatarOpt ? (
                              avatarOpt.icon.startsWith('/') ? (
                                <Image
                                  src={avatarOpt.icon}
                                  alt="User Avatar"
                                  width={28}
                                  height={28}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-sm">{avatarOpt.icon}</span>
                              )
                            ) : avatarId && avatarId !== 'cow' ? (
                                <Image
                                  src={avatarId.startsWith('http') ? avatarId : `/storage/${avatarId}`}
                                  alt="User Avatar"
                                  width={28}
                                  height={28}
                                  className="h-full w-full object-cover"
                                />
                            ) : (
                              <User className="h-4 w-4 text-slate-500" />
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-[#1e3a4a] dark:bg-slate-800 text-white border border-[#2a5060] dark:border-slate-700 rounded-2xl rounded-bl-md p-3 px-4 flex items-center gap-1.5 h-10 w-16">
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
                <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-xl shrink-0">
                  <div className="flex items-center gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !isTyping && handleSend()}
                      placeholder={isTyping ? "Berong is thinking..." : "Ask about fire safety..."}
                      disabled={isTyping}
                      className="flex-1 border-gray-300 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 rounded-xl focus:ring-orange-400 dark:focus:ring-orange-500 focus:border-orange-400 dark:focus:border-orange-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={isTyping ? undefined : startListening}
                      disabled={isTyping}
                      className={`h-10 w-10 flex items-center justify-center transition-all ${isListening
                          ? 'text-red-500 bg-red-100 dark:bg-red-950/30 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                          : 'text-gray-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-400 disabled:opacity-30 disabled:cursor-not-allowed'
                        }`}
                      title={isTyping ? "Generation in progress..." : (isListening ? "Listening..." : "Voice input")}
                    >
                      <Mic className="h-5 w-5" strokeWidth={isListening ? 2.5 : 2} />
                    </button>
                    {isTyping ? (
                      <button
                        onClick={handleStopGeneration}
                        className="h-10 w-10 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
                      >
                        <Square className="h-5 w-5 fill-current" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className="h-10 w-10 flex items-center justify-center bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 text-white rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:grayscale hover:scale-105 active:scale-95"
                      >
                        <Send className="h-5 w-5" strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
