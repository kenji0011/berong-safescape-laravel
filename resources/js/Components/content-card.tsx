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
  illustrationUrl?: string
  emoji?: string
  href: string
  isLocked?: boolean
  isCompleted?: boolean
  isNew?: boolean
  shouldPulse?: boolean
  difficulty?: "easy" | "medium" | "hard"
  duration?: string
  category?: string
  hideBadge?: boolean
  unlockRequirement?: string
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

        {/* Top-Left Indicator: Module or Difficulty */}
        <div className="absolute top-3 left-3 z-20">
           {content.type === "module" ? (
             <div className="bg-yellow-500/80 text-white font-black text-[7px] sm:text-[10px] tracking-widest uppercase px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border-2 border-white/30 shadow-lg">
               ⭐ MODULE
             </div>
           ) : (content.difficulty && content.id !== "activity-portal") ? (
             <div className={cn(
               "font-black text-[7px] sm:text-[10px] tracking-widest uppercase px-2 py-1 sm:px-3 sm:py-1 rounded-full border-2 border-white/30 shadow-lg text-white",
               badgeColors[content.difficulty]
             )}>
               {content.difficulty}
             </div>
           ) : null}
         </div>
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
              <CheckCircle className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
            </div>
          )}
        </div>

        {/* Lock overlay */}
        {content.isLocked && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-2 sm:p-4 text-center">
            <div className="bg-white/10 p-3 sm:p-4 rounded-full border-2 border-white/20 mb-2 sm:mb-3 shadow-2xl">
              <Lock className="h-6 w-6 sm:h-10 sm:w-10 text-white drop-shadow-2xl" />
            </div>
            {content.unlockRequirement && (
              <div className="bg-slate-900/80 border border-slate-700/50 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl max-w-[90%]">
                <span className="text-[9px] sm:text-xs font-black text-amber-400 uppercase tracking-widest drop-shadow-md leading-tight block">
                  {content.unlockRequirement}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Central Graphic */}
        <div className={cn(
           "absolute inset-0 z-10 transition-all duration-700 flex items-center justify-center",
           !content.isLocked && "group-hover:scale-110"
        )}>
          {content.illustrationUrl ? (
            <div className="h-20 w-20 sm:h-36 sm:w-36 flex items-center justify-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] group-hover:-translate-y-2 transition-transform duration-500">
              <img src={content.illustrationUrl} className="h-full w-full object-contain" alt={content.title} />
            </div>
          ) : content.emoji ? (
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
               {/* Subtle Overlay */}
               {!imageLoading && <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>}
            </div>
          ) : (
            <div className="text-5xl sm:text-8xl drop-shadow-2xl group-hover:-translate-y-2 transition-transform duration-500">{typeIcons[content.type]}</div>
          )}
        </div>

        {/* Start Here Floating Indication */}
        {content.shouldPulse && (
          <div className="absolute inset-0 z-40 bg-yellow-400/10 pointer-events-none flex items-center justify-center">
            <div className="bg-yellow-400 text-red-700 font-extrabold px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-full text-[9px] sm:text-xs uppercase tracking-widest animate-bounce shadow-[0_10px_25px_rgba(234,179,8,0.5)] border-2 border-white flex items-center gap-1">
              <span>Start Here</span>
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
          <div className="flex items-center gap-2 text-[8px] sm:text-xs font-black uppercase tracking-wide">
            {(content.type === "module" || content.type === "video" || content.type === "activity") && !content.hideBadge && (
              <div className={cn(
                "px-2 py-1 rounded-lg border-2 shadow-sm flex items-center gap-1.5 transition-colors",
                content.isCompleted 
                  ? "bg-emerald-500 border-emerald-400 text-white" 
                  : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800"
              )}>
                 <div className="flex items-center justify-center">
                    <span className="text-[10px] sm:text-sm">🎖️</span>
                 </div>
                 <span className={cn(
                   "text-[8px] sm:text-[10px] font-black uppercase tracking-wider",
                   content.isCompleted ? "text-white" : "text-slate-500 dark:text-slate-400"
                 )}>
                    {content.isCompleted ? "Earned" : "Badge"}
                 </span>
              </div>
            )}
            {content.duration && (
              <div className="hidden sm:flex items-center gap-1.5 ml-1 text-slate-400 dark:text-slate-500">
                <Play className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 fill-slate-400 dark:fill-slate-500" />
                <span>{content.duration}</span>
              </div>
            )}
          </div>

          {!content.isLocked ? (
            <div className={cn(
              "flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-2xl font-black text-[9px] sm:text-sm transition-all shadow-md active:translate-y-0.5 active:shadow-none",
              (content.type === "module" || content.type === "activity")
                ? "bg-yellow-400 text-amber-900 shadow-[0_2px_0_0_#ca8a04] sm:shadow-[0_4px_0_0_#ca8a04] hover:bg-yellow-300" 
                : "bg-indigo-600 text-white shadow-[0_2px_0_0_#4338ca] sm:shadow-[0_4px_0_0_#4338ca] hover:bg-indigo-500"
            )}>
              <span>{content.type === "game" ? "PLAY" : content.type === "video" ? "WATCH" : "START"}</span>
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
          content.shouldPulse 
            ? "ring-[6px] ring-yellow-400 animate-pulse shadow-[0_0_40px_rgba(250,204,21,0.6)]" 
            : (content.type === "module" && "ring-4 ring-yellow-400 shadow-[0_10px_30px_rgba(250,204,21,0.2)]")
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
         content.shouldPulse 
           ? "ring-[6px] ring-yellow-400 animate-pulse shadow-[0_0_45px_rgba(250,204,21,0.7)]" 
           : (content.type === "module" && "ring-4 ring-yellow-400 shadow-[0_10px_30px_rgba(250,204,21,0.2)]")
      )}
    >
      {innerContent}
    </MotionLink>
  )
})

