"use client"

import { useState } from "react"
import { Link } from '@inertiajs/react'
import { Play, Lock, CheckCircle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

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

export function ContentCard({ content, onClick }: ContentCardProps) {
  const [imageError, setImageError] = useState(false)

  // Premium Gradients
  const typeGradients: Record<string, string> = {
    game: "from-[#14B8A6] to-[#0D9488]", // Teal 
    video: "from-[#EC4899] to-[#F43F5E]", // Pink/Rose
    activity: "from-[#F59E0B] to-[#EA580C]", // Amber/Orange
    module: "from-[#4F46E5] to-[#7C3AED]", // Indigo/Violet
    exam: "from-[#EF4444] to-[#B91C1C]", // Red
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
        "relative h-52 sm:h-60 w-full flex items-center justify-center bg-gradient-to-br overflow-hidden z-0 shrink-0",
        typeGradients[content.type] || "from-slate-400 to-slate-600"
      )}>
        {/* Subtle Glassmorphism Patterns / Lighting */}
        <div className="absolute inset-0 bg-white/10 opacity-30 mix-blend-overlay bg-[url('/noise.png')] pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 blur-[50px] rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-150"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 blur-[50px] rounded-full pointer-events-none"></div>

        {/* Status badges */}
        <div className="absolute top-5 right-5 flex flex-col gap-2 z-20">
          {content.isNew && (
            <div className="bg-white text-rose-500 font-extrabold text-[11px] sm:text-xs tracking-wider uppercase px-4 py-1.5 rounded-full shadow-lg animate-pulse border border-rose-100">
              New!
            </div>
          )}
          {content.isCompleted && (
            <div className="bg-[#10B981] text-white font-extrabold text-[11px] sm:text-xs tracking-wider uppercase px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-emerald-400">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Done
            </div>
          )}
        </div>

        {/* Top left type indicator */}
        <div className="absolute top-5 left-5 z-20">
           <div className="bg-black/20 backdrop-blur-md text-white font-bold text-[10px] sm:text-xs tracking-widest uppercase px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
             {content.type}
           </div>
        </div>

        {/* Lock overlay */}
        {content.isLocked && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-30">
            <Lock className="h-16 w-16 text-white/90 drop-shadow-2xl" />
          </div>
        )}

        {/* Central Graphic */}
        <div className={cn(
           "z-10 transition-transform duration-500",
           !content.isLocked && "group-hover:scale-110 group-hover:-translate-y-1"
        )}>
          {content.emoji ? (
            <div className="text-8xl sm:text-9xl drop-shadow-2xl">{content.emoji}</div>
          ) : content.imageUrl && !imageError ? (
            <img
              src={content.imageUrl}
              alt={content.title}
              className="w-36 h-36 sm:w-44 sm:h-44 object-contain drop-shadow-2xl"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="text-8xl sm:text-9xl drop-shadow-2xl">{typeIcons[content.type]}</div>
          )}
        </div>

        {/* Detail Badges Bottom */}
        {content.difficulty && (
          <div className="absolute bottom-5 right-5 z-20">
            <div className={cn("font-bold text-[10px] sm:text-xs uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md", badgeColors[content.difficulty] || "bg-slate-500 text-white")}>
              {content.difficulty}
            </div>
          </div>
        )}
      </div>

      {/* Text Content Section */}
      <div className="p-6 sm:p-8 flex-1 flex flex-col bg-white z-10 relative">
        <h3 className="font-extrabold text-2xl sm:text-3xl text-slate-800 leading-tight mb-3 group-hover:text-[#4F46E5] transition-colors line-clamp-2">
          {content.title}
        </h3>

        {content.description && (
          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed mb-8 line-clamp-2">
            {content.description}
          </p>
        )}

        {/* Footer Actions */}
        <div className="mt-auto flex items-center justify-between pt-5 border-t-2 border-slate-50">
          {content.duration ? (
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-400">
              <Play className="h-4 w-4" />
              <span>{content.duration}</span>
            </div>
          ) : (
            <div />
          )}

          {!content.isLocked ? (
            <div className="flex items-center gap-2 text-[#4F46E5] bg-indigo-50/50 px-5 py-2.5 rounded-2xl font-bold text-sm sm:text-base transition-colors group-hover:bg-[#4F46E5] group-hover:text-white shadow-sm hover:shadow-md">
              <span>{content.type === "game" ? "Play Now" : content.type === "video" ? "Watch" : "Start"}</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </div>
          ) : (
            <div className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-4 py-2 rounded-xl">
              Locked
            </div>
          )}
        </div>
      </div>
    </>
  )

  if (content.isLocked || content.href === "#") {
    return (
      <div
        onClick={(e) => { e.preventDefault(); if (onClick) onClick(); }}
        className={cn(
          "group relative flex flex-col h-full w-full rounded-[2.5rem] overflow-hidden bg-white transition-all duration-500 ease-out",
          "opacity-60 cursor-not-allowed filter grayscale-[0.3]"
        )}
      >
        {innerContent}
      </div>
    )
  }

  return (
    <Link
      href={content.href}
      onClick={() => { if (onClick) onClick() }}
      className={cn(
         "group relative flex flex-col h-full w-full rounded-[2.5rem] overflow-hidden bg-white transition-all duration-500 ease-out",
         "hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] hover:-translate-y-2 cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100"
      )}
    >
      {innerContent}
    </Link>
  )
}

