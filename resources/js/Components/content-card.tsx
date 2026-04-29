"use client"

import React, { useState } from "react"
import { Link } from '@inertiajs/react'
import { motion } from "framer-motion"
import { Play, Lock, CheckCircle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "./ui/skeleton"

export interface ContentCardData {
  id: string | number
  title: string
  description?: string
  type: "game" | "video" | "activity" | "module" | "exam"
  imageUrl?: string
  emoji?: string
  href: string
  isLocked?: boolean
  isCompleted?: boolean
  isNew?: boolean
  difficulty?: "easy" | "medium" | "hard"
  duration?: string
  category?: string
}

interface ContentCardProps {
  content: ContentCardData
  onClick?: () => void
}

export const ContentCard = React.memo(({ content, onClick }: ContentCardProps) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Premium Gradients
  const typeGradients: Record<string, string> = {
    game: "bg-[#14B8A6]", // Teal 
    video: "bg-[#EC4899]", // Pink/Rose
    activity: "bg-[#f59e0b]", // Bright Vibrant Gold/Amber
    module: "bg-[#4F46E5]", // Indigo/Violet
    exam: "bg-[#EF4444]", // Red
  }

  const typeIcons: Record<string, string> = {
    game: "🎮",
    video: "🎬",
    activity: "✨",
    module: "📚",
    exam: "📝",
  }

  const badgeColors: Record<string, string> = {
    easy: "bg-[#10B981] text-white", // Emerald
    medium: "bg-[#F59E0B] text-white", // Amber
    hard: "bg-[#EF4444] text-white", // Red
  }

  const innerContent = (
    <>
      {/* Visual Header Section */}
      <div className={cn(
        "relative h-32 sm:h-52 w-full flex items-center justify-center overflow-hidden z-0 shrink-0 transition-all duration-500",
        typeGradients[content.type] || "bg-slate-400"
      )}>
        {/* Subtle Glassmorphism Patterns / Lighting - Optimized for mobile performance */}
        <div className="absolute inset-0 bg-white/10 opacity-30 pointer-events-none"></div>
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/20 rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-150 hidden sm:block"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-black/10 rounded-full pointer-events-none hidden sm:block"></div>

        {/* Quest Type Label (Top Left) */}
        <div className="absolute top-3 left-3 z-20">
           <div className={cn(
             "text-white font-black text-[7px] sm:text-[10px] tracking-widest uppercase px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border-2 border-white/30 shadow-lg",
             content.type === "module" ? "bg-yellow-500/80" : "bg-black/30"
           )}>
             {content.type === "module" ? "⭐ MODULE" : content.type}
           </div>
        </div>

        {/* Status badges (Top Right) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
          {content.isNew && (
            <div className="bg-rose-500 text-white font-black text-[7px] sm:text-[10px] tracking-widest uppercase px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-[0_4px_12px_rgba(244,63,94,0.4)] sm:animate-bounce border-2 border-white/40 flex items-center gap-1 sm:gap-1.5 ring-2 ring-rose-500/20">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="hidden sm:animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white"></span>
              </span>
              New!
            </div>
          )}
          {content.isCompleted && (
            <div className="bg-[#10B981] text-white font-black text-[7px] sm:text-[10px] tracking-wider uppercase px-2 py-1 sm:px-3 sm:py-1 rounded-full shadow-xl flex items-center gap-1 sm:gap-1.5 border-2 border-emerald-400">
              <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> DONE
            </div>
          )}
        </div>

        {/* Lock overlay */}
        {content.isLocked && (
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center z-30">
            <div className="bg-white/10 p-4 rounded-full border-2 border-white/20">
              <Lock className="h-10 w-10 text-white drop-shadow-2xl" />
            </div>
          </div>
        )}

        {/* Central Graphic */}
        <div className={cn(
           "absolute inset-0 z-10 transition-all duration-700 flex items-center justify-center",
           !content.isLocked && "group-hover:scale-110"
        )}>
          {content.emoji ? (
            <div className="text-5xl sm:text-8xl drop-shadow-2xl group-hover:-translate-y-2 transition-transform duration-500">{content.emoji}</div>
          ) : content.imageUrl && !imageError ? (
            <div className="relative w-full h-full">
               {imageLoading && (
                 <Skeleton className="absolute inset-0 z-20 bg-slate-200/50" />
               )}
               <img
                 src={content.imageUrl}
                 alt={content.title}
                 className={cn(
                   "w-full h-full object-cover transition-all duration-700",
                   imageLoading ? "opacity-0" : "opacity-100"
                 )}
                 onLoad={() => setImageLoading(false)}
                 onError={() => {
                   setImageError(true)
                   setImageLoading(false)
                 }}
               />
               {/* Subtle Overlay to make text/status more readable if needed, though they are already positioned well */}
               {!imageLoading && <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>}
            </div>
          ) : (
            <div className="text-5xl sm:text-8xl drop-shadow-2xl group-hover:-translate-y-2 transition-transform duration-500">{typeIcons[content.type]}</div>
          )}
        </div>

        {/* Badge Reward Preview (Bottom Right) */}
        {(content.type === "module" || content.type === "video" || content.type === "activity") && !content.isCompleted && (
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-20 group-hover:translate-y-[-2px] transition-transform">
            <div className="bg-white/90 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border-2 border-yellow-400 shadow-lg flex items-center gap-1 sm:gap-1.5">
               <div className="bg-yellow-100 h-4 w-4 sm:h-6 sm:w-6 rounded-full flex items-center justify-center text-[10px] sm:text-sm">🎖️</div>
               <div className="flex flex-col">
                  <span className="text-[6px] sm:text-[7px] font-black text-slate-800 leading-tight">Badge</span>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Text Content Section */}
      <div className="p-3 sm:p-6 flex-1 flex flex-col bg-white dark:bg-slate-800/90 z-10 relative">
        <h3 className="font-black text-[13px] sm:text-xl text-slate-800 dark:text-white leading-tight mb-1 sm:mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 tracking-tight">
          {content.title}
        </h3>

        {content.description && (
          <p className="text-[10px] sm:text-[13px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-3 sm:mb-6 line-clamp-2">
            {content.description}
          </p>
        )}

        {/* Footer Actions */}
        <div className="mt-auto flex items-center justify-between pt-3 sm:pt-4 border-t-2 border-slate-50 dark:border-slate-700/50">
          {content.duration ? (
            <div className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              <Play className="h-2.5 w-2.5 sm:h-4 sm:w-4 fill-slate-400 dark:fill-slate-500" />
              <span>{content.duration}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-xs font-black text-slate-400 uppercase tracking-wide">
               {content.difficulty && (
                 <span className={cn("px-1.5 py-0.5 rounded sm:rounded-md text-white", badgeColors[content.difficulty])}>
                    {content.difficulty}
                 </span>
               )}
            </div>
          )}

          {!content.isLocked ? (
            <div className={cn(
              "flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-2xl font-black text-[9px] sm:text-sm transition-all shadow-md active:translate-y-0.5 active:shadow-none",
              (content.type === "module" || content.type === "activity")
                ? "bg-yellow-400 text-amber-900 shadow-[0_2px_0_0_#ca8a04] sm:shadow-[0_4px_0_0_#ca8a04] hover:bg-yellow-300" 
                : "bg-indigo-600 text-white shadow-[0_2px_0_0_#4338ca] sm:shadow-[0_4px_0_0_#4338ca] hover:bg-indigo-500"
            )}>
              <span>{content.type === "game" ? "PLAY" : content.type === "video" ? "WATCH" : "START"}</span>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
            </div>
          ) : (
            <div className="text-[8px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
              Locked
            </div>
          )}
        </div>
      </div>
    </>
  )

  if (content.isLocked || content.href === "#") {
    return (
      <motion.div
        onClick={(e) => { e.preventDefault(); if (onClick) onClick(); }}
        whileHover={{ scale: 1.01 }}
        className={cn(
          "group relative flex flex-col h-full w-full rounded-2xl sm:rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-800",
          "opacity-60 cursor-not-allowed filter grayscale-[0.3]",
          content.type === "module" && "ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]"
        )}
      >
        {innerContent}
      </motion.div>
    )
  }

  const MotionLink = motion(Link);

  return (
    <MotionLink
      href={content.href}
      onClick={() => { if (onClick) onClick() }}
      whileHover={{ 
        y: -10,
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      whileTap={{ scale: 0.98 }}
      className={cn(
         "group relative flex flex-col h-full w-full rounded-2xl sm:rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-800",
         "cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-700/50",
         content.type === "module" && "ring-4 ring-yellow-400 shadow-[0_10px_30px_rgba(250,204,21,0.2)]"
      )}
    >
      {innerContent}
    </MotionLink>
  )
})

