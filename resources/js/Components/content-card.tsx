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
    activity: "from-[#fcd34d] via-[#fbbf24] to-[#f59e0b]", // Bright Vibrant Gold/Amber
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
        "relative h-40 sm:h-52 w-full flex items-center justify-center bg-gradient-to-br overflow-hidden z-0 shrink-0 transition-all duration-500",
        typeGradients[content.type] || "from-slate-400 to-slate-600"
      )}>
        {/* Subtle Glassmorphism Patterns / Lighting */}
        <div className="absolute inset-0 bg-white/10 opacity-30 mix-blend-overlay bg-[url('/noise.png')] pointer-events-none"></div>
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/20 blur-[40px] rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-150"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-black/10 blur-[40px] rounded-full pointer-events-none"></div>

        {/* Quest Type Label (Top Left) */}
        <div className="absolute top-3 left-3 z-20">
           <div className={cn(
             "backdrop-blur-md text-white font-black text-[9px] sm:text-[10px] tracking-widest uppercase px-3 py-1 rounded-full border-2 border-white/30 shadow-lg",
             content.type === "module" ? "bg-yellow-500/80" : "bg-black/30"
           )}>
             {content.type === "module" ? "⭐ MISSION" : content.type}
           </div>
        </div>

        {/* Status badges (Top Right) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
          {content.isNew && (
            <div className="bg-white text-rose-500 font-black text-[9px] sm:text-[10px] tracking-wider uppercase px-3 py-1 rounded-full shadow-xl animate-bounce border-2 border-rose-100">
              New!
            </div>
          )}
          {content.isCompleted && (
            <div className="bg-[#10B981] text-white font-black text-[9px] sm:text-[10px] tracking-wider uppercase px-3 py-1 rounded-full shadow-xl flex items-center gap-1.5 border-2 border-emerald-400">
              <CheckCircle className="h-3 w-3" /> DONE
            </div>
          )}
        </div>

        {/* Lock overlay */}
        {content.isLocked && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[3px] flex items-center justify-center z-30">
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
               <img
                 src={content.imageUrl}
                 alt={content.title}
                 className="w-full h-full object-cover transition-all duration-700"
                 onError={() => setImageError(true)}
               />
               {/* Subtle Overlay to make text/status more readable if needed, though they are already positioned well */}
               <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
          ) : (
            <div className="text-5xl sm:text-8xl drop-shadow-2xl group-hover:-translate-y-2 transition-transform duration-500">{typeIcons[content.type]}</div>
          )}
        </div>

        {/* Badge Reward Preview (Bottom Right) */}
        {content.type === "module" && !content.isCompleted && (
          <div className="absolute bottom-3 right-3 z-20 group-hover:translate-y-[-2px] transition-transform">
            <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-xl border-2 border-yellow-400 shadow-lg flex items-center gap-1.5">
               <div className="bg-yellow-100 h-6 w-6 rounded-full flex items-center justify-center text-sm">🎖️</div>
               <div className="flex flex-col">
                  <span className="text-[7px] font-black text-slate-800 leading-tight">Badge</span>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Text Content Section */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col bg-white z-10 relative">
        <h3 className="font-black text-lg sm:text-xl text-slate-800 leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1 tracking-tight">
          {content.title}
        </h3>

        {content.description && (
          <p className="text-[12px] sm:text-[13px] text-slate-500 font-bold leading-relaxed mb-4 sm:mb-6 line-clamp-2">
            {content.description}
          </p>
        )}

        {/* Footer Actions */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t-2 border-slate-50">
          {content.duration ? (
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wide">
              <Play className="h-3 w-3 sm:h-4 sm:w-4 fill-slate-400" />
              <span>{content.duration}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wide">
               {content.difficulty && (
                 <span className={cn("px-2 py-0.5 rounded-md text-white", badgeColors[content.difficulty])}>
                    {content.difficulty}
                 </span>
               )}
            </div>
          )}

          {!content.isLocked ? (
            <div className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-sm transition-all shadow-md active:translate-y-0.5 active:shadow-none",
              (content.type === "module" || content.type === "activity")
                ? "bg-yellow-400 text-amber-900 shadow-[0_3px_0_0_#ca8a04] sm:shadow-[0_4px_0_0_#ca8a04] hover:bg-yellow-300" 
                : "bg-indigo-600 text-white shadow-[0_3px_0_0_#4338ca] sm:shadow-[0_4px_0_0_#4338ca] hover:bg-indigo-500"
            )}>
              <span>{content.type === "game" ? "PLAY" : content.type === "video" ? "WATCH" : "START"}</span>
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
            </div>
          ) : (
            <div className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
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
          "group relative flex flex-col h-full w-full rounded-3xl sm:rounded-[2.5rem] overflow-hidden bg-white transition-all duration-500 ease-out",
          "opacity-60 cursor-not-allowed filter grayscale-[0.3]",
          content.type === "module" && "ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]"
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
         "group relative flex flex-col h-full w-full rounded-3xl sm:rounded-[2.5rem] overflow-hidden bg-white transition-all duration-500 ease-out",
         "hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] hover:-translate-y-2 cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100",
         content.type === "module" && "ring-4 ring-yellow-400 shadow-[0_10px_30px_rgba(250,204,21,0.2)] hover:shadow-[0_20px_40px_rgba(250,204,21,0.4)]"
      )}
    >
      {innerContent}
    </Link>
  )
}

