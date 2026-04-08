"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Sparkles } from "lucide-react"
import Image from '@/components/Image';
import { motion, AnimatePresence, useMotionValue, animate } from "motion/react"
import { useAuth } from "@/lib/auth-context"
import { Link } from '@inertiajs/react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
        const response = await fetch('/api/quick-questions')
        if (response.ok) {
          const questions = await response.json()
          setQuickQuestions(questions)
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

    // Get bot response and add to messages
    const botResponse = await generateBotResponse(inputValue)
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      sender: "bot",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, botMessage])
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
  }

  const generateBotResponse = async (input: string): Promise<string> => {
    // Only use AI for authenticated users
    if (!isAuthenticated) {
      return generateRuleBasedResponse(input) + "\n\n💡 Sign in for AI-powered responses!"
    }

    try {
      // Use AI backend for logged-in users
      const response = await fetch('/api/chatbot/ai-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.response;
      } else {
        console.error('AI response failed:', response.status);
        // Fallback to rule-based response
        return generateRuleBasedResponse(input);
      }
    } catch (error) {
      console.error('Error calling AI backend:', error);
      // Fallback to rule-based response
      return generateRuleBasedResponse(input);
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
      {/* Chatbot Toggle - Berong Character fixed to right side, draggable vertically */}
      <div ref={constraintsRef} className="fixed inset-0 z-[60] pointer-events-none">
        {/* Berong Character - Clickable to toggle chat, hidden when chat is open */}
        <AnimatePresence>
          {!isOpen && (
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
                // Only open chat if not dragging
                if (!isDragging) setIsOpen(true)
              }}
              style={{
                x: dragX,
                y: dragY,
                rotate: rotationValue,
                cursor: isDragging ? "grabbing" : "pointer",
                touchAction: "none" // Better touch support
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
                      {/* The tail - positioned based on which side */}
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
      </div>

      {/* Chatbot Window - Positioned based on which side Berong is on */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 30,
              mass: 0.8
            }}
            className={`chatbot-window-container fixed bottom-24 z-50 ${isOnLeft ? 'left-6' : 'right-6'}`}
            style={{ transformOrigin: isOnLeft ? 'bottom left' : 'bottom right' }}
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
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-9 w-9 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" strokeWidth={3} />
                </button>
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
                    className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-orange-500 transition-colors"
                    title="Voice input (coming soon)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                  </button>
                  <button
                    onClick={handleSend}
                    className="h-10 w-10 flex items-center justify-center bg-[#1e293b] hover:bg-[#334155] text-white rounded-full shadow-md transition-all active:scale-95"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
};
