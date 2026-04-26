import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, CheckCircle, ArrowRight, Star, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface CompletionCardProps {
  title: string
  description: string
  mainActionText: string
  onMainAction: () => void
  secondaryActionText?: string
  onSecondaryAction?: () => void
  confetti?: boolean
  type?: "module" | "quiz" | "certification"
  score?: {
    earned: number
    total: number
  }
}

export function CompletionCard({
  title,
  description,
  mainActionText,
  onMainAction,
  secondaryActionText,
  onSecondaryAction,
  type = "module",
  score
}: CompletionCardProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const isCertification = type === "certification"
  const isQuiz = type === "quiz"

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-2xl mx-auto"
        >
          <div className={cn(
            "relative overflow-hidden rounded-[2.5rem] border-[4px] p-8 sm:p-12 text-center shadow-2xl transition-all",
            isCertification 
              ? "bg-gradient-to-br from-yellow-400 via-orange-400 to-rose-500 border-yellow-200 text-white" 
              : isQuiz
              ? "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border-purple-200 text-white"
              : "bg-white border-green-200 text-slate-800"
          )}>
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
              <motion.div 
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" 
              />
              <motion.div 
                animate={{ 
                  rotate: [360, 0],
                  scale: [1, 1.3, 1]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" 
              />
            </div>

            {/* Icon / Trophy Area */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative z-10 flex justify-center mb-8"
            >
              <div className={cn(
                "h-24 w-24 rounded-full flex items-center justify-center shadow-xl border-[4px] border-white relative",
                isCertification || isQuiz ? "bg-white/20 backdrop-blur-md" : "bg-green-500"
              )}>
                {isCertification || isQuiz ? (
                  <Trophy className="h-12 w-12 text-white drop-shadow-lg" />
                ) : (
                  <CheckCircle className="h-12 w-12 text-white" strokeWidth={2.5} />
                )}
                
                {/* Floating Stars */}
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -right-2"
                >
                  <Star className="h-6 w-6 text-yellow-300 fill-yellow-300" />
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="absolute -bottom-1 -left-3"
                >
                  <Star className="h-5 w-5 text-yellow-200 fill-yellow-200" />
                </motion.div>
              </div>
            </motion.div>

            {/* Content */}
            <div className="relative z-10 space-y-4">
              <motion.h2 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={cn(
                  "text-4xl sm:text-5xl font-black tracking-tight drop-shadow-sm",
                  isCertification || isQuiz ? "text-white" : "text-slate-800"
                )}
              >
                {title}
              </motion.h2>

              <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={cn(
                  "text-lg sm:text-xl font-bold leading-relaxed max-w-md mx-auto",
                  isCertification || isQuiz ? "text-white/90" : "text-slate-600"
                )}
              >
                {description}
              </motion.p>

              {score && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30 shadow-inner mt-4"
                >
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                  <span className="text-xl font-black">
                    Score: {score.earned} / {score.total}
                  </span>
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
            >
              {secondaryActionText && (
                <button
                  onClick={onSecondaryAction}
                  className={cn(
                    "w-full sm:w-auto px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all",
                    isCertification || isQuiz 
                      ? "bg-white/10 hover:bg-white/20 text-white border-2 border-white/30" 
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-2 border-slate-200"
                  )}
                >
                  {secondaryActionText}
                </button>
              )}
              
              <button
                onClick={onMainAction}
                className={cn(
                  "w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full font-black text-lg transition-all shadow-lg border-[3px] border-white uppercase tracking-wider group",
                  isCertification || isQuiz 
                    ? "bg-yellow-400 text-orange-900 shadow-[0_6px_0_#b45309] hover:-translate-y-1 hover:shadow-[0_10px_0_#b45309] active:translate-y-1 active:shadow-none" 
                    : "bg-yellow-400 text-red-600 shadow-[0_6px_0_#b45309] hover:-translate-y-1 hover:shadow-[0_10px_0_#b45309] active:translate-y-1 active:shadow-none"
                )}
              >
                {mainActionText}
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
