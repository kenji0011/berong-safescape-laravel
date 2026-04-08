"use client"

import { useState } from "react"
import { Link } from '@inertiajs/react';
import { Play, Lock, CheckCircle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

  if (true) {
    const bgColors: Record<string, string> = {
      video: "bg-purple-500",
      activity: "bg-yellow-500",
      module: "bg-blue-500",
      game: "bg-green-500",
      exam: "bg-red-500"
    }

    const innerModuleContent = (
      <div className={cn(
        "flex flex-col md:flex-row bg-white rounded-[2rem] border-4 transition-all overflow-hidden h-full",
        content.isLocked
          ? "opacity-60 border-slate-200 bg-slate-50"
          : "border-slate-100 shadow-[0_8px_0_0_#cbd5e1] hover:shadow-[0_4px_0_0_#cbd5e1] hover:translate-y-1"
      )}>
        {/* Left Side (Visual) */}
        <div className={`relative w-full md:w-5/12 ${bgColors[content.type] || "bg-blue-500"} p-8 flex items-center justify-center shrink-0 min-h-[200px]`}>
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-white text-slate-800 font-extrabold px-3 py-1 shadow-sm text-[10px] uppercase tracking-wider">
              {content.type}
            </Badge>
          </div>

          {content.isLocked && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20">
              <Lock className="h-16 w-16 text-white drop-shadow-lg" />
            </div>
          )}

          <div className={cn("text-8xl sm:text-9xl drop-shadow-xl z-0", !content.isLocked && "animate-bounce-slow")}>
            {content.imageUrl && !imageError ? (
              <img
                src={content.imageUrl}
                alt={content.title}
                className="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-2xl"
                onError={() => setImageError(true)}
              />
            ) : (
              content.emoji || "📚"
            )}
          </div>
        </div>

        {/* Right Side (Content) */}
        <div className="relative p-6 md:p-8 flex flex-col justify-center flex-1 bg-white">
          {content.isNew && (
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
              <Badge className="bg-red-500 text-white font-black px-3 py-1.5 shadow-md shadow-red-500/20 text-xs animate-pulse">
                NEW!
              </Badge>
            </div>
          )}
          {content.isCompleted && (
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
              <Badge className="bg-green-500 text-white font-black px-3 py-1.5 shadow-md shadow-green-500/20 text-xs flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" /> DONE
              </Badge>
            </div>
          )}

          {/* Remove emoji/icon from title if present */}
          <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mb-3 leading-tight group-hover:text-blue-600 transition-colors pr-16 line-clamp-2">
            {content.title.replace(/^[\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF]\s*/g, '')}
          </h3>
          
          <p className="text-slate-600 font-bold text-sm sm:text-base leading-relaxed max-w-lg mb-6 sm:mb-8 opacity-90">
            {content.description}
          </p>

          <div className="mt-auto flex items-center justify-between">
            {content.duration && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Play className="h-3 w-3" />
                <span>{content.duration}</span>
              </div>
            )}
            {!content.duration && <div></div>}

            {!content.isLocked ? (
              <button className="flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-800 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-black text-sm sm:text-base shadow-[0_4px_0_0_#e2e8f0] hover:shadow-[0_2px_0_0_#bfdbfe] hover:translate-y-0.5 active:translate-y-1 active:shadow-none transition-all">
                {content.type === "video" ? "WATCH" : content.type === "game" ? "PLAY" : "START"} <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
              </button>
            ) : (
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 bg-slate-100 px-4 py-2 rounded-full">
                <Lock className="h-3 w-3" /> Locked
              </div>
            )}
          </div>
        </div>
      </div>
    )

    if (content.isLocked) {
      return (
        <div onClick={onClick} className="group block h-full w-full cursor-not-allowed">
          {innerModuleContent}
        </div>
      )
    }

    return (
      <Link href={content.href} onClick={onClick} className="group block cursor-pointer h-full w-full">
        {innerModuleContent}
      </Link>
    )
  }

  const typeColors = {
    game: "from-green-400 to-emerald-600",
    video: "from-purple-400 to-purple-600",
    activity: "from-yellow-400 to-orange-600",
    module: "from-blue-400 to-blue-600",
    exam: "from-red-400 to-red-600",
  }

  const typeIcons = {
    game: "🎮",
    video: "🎬",
    activity: "✨",
    module: "📚",
    exam: "📝",
  }

  const difficultyColors = {
    easy: "bg-green-500",
    medium: "bg-yellow-500",
    hard: "bg-red-500",
  }

  // Mobile compact card layout (small vertical cards for 2-column grid)
  const mobileCardContent = (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 sm:hidden border-2",
      content.isLocked
        ? "opacity-60 bg-gray-50 border-gray-200"
        : "border-transparent hover:border-yellow-400 hover:shadow-lg active:scale-[0.98]"
    )}>
      {/* Compact Image/Emoji Section */}
      <div className={cn(
        "relative h-20 flex items-center justify-center bg-gradient-to-br",
        typeColors[content.type]
      )}>
        {/* Status badges */}
        {content.isNew && (
          <div className="absolute top-1 right-1">
            <Badge className="bg-red-500 text-white text-[9px] px-1 py-0 shadow animate-pulse">
              NEW
            </Badge>
          </div>
        )}
        {content.isCompleted && (
          <div className="absolute top-1 right-1">
            <Badge className="bg-green-500 text-white text-[9px] px-1 py-0 shadow">
              ✓
            </Badge>
          </div>
        )}

        {/* Lock overlay */}
        {content.isLocked && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Lock className="h-6 w-6 text-white" />
          </div>
        )}

        {/* Content display */}
        {content.emoji ? (
          <div className="text-3xl">{content.emoji}</div>
        ) : content.imageUrl && !imageError ? (
          <img
            src={content.imageUrl}
            alt={content.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-3xl">{typeIcons[content.type]}</div>
        )}

        {/* Difficulty badge */}
        {content.difficulty && (
          <div className="absolute bottom-1 right-1">
            <Badge className={cn(difficultyColors[content.difficulty], "text-white text-[8px] px-1 py-0")}>
              {content.difficulty}
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <CardContent className="p-2 bg-white">
        <h3 className="font-bold text-[11px] text-gray-800 line-clamp-2 leading-tight mb-1">
          {content.title}
        </h3>

        {!content.isLocked && (
          <div className="flex items-center gap-0.5 text-blue-600 font-semibold text-[10px]">
            <span>{content.type === "game" ? "Play" : content.type === "video" ? "Watch" : "Start"}</span>
            <Play className="h-2.5 w-2.5" />
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Desktop/Tablet full card layout
  const desktopCardContent = (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 border-4 hidden sm:flex sm:flex-col h-full",
      content.isLocked
        ? "opacity-60 border-gray-300 bg-gray-50"
        : "border-transparent hover:border-yellow-400 hover:shadow-2xl hover:-translate-y-2"
    )}>
      {/* Image/Emoji Section */}
      <div className={cn(
        "relative h-48 flex items-center justify-center bg-gradient-to-br",
        typeColors[content.type]
      )}>
        {/* Status badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {content.isNew && (
            <Badge className="bg-red-500 text-white font-bold shadow-lg animate-pulse">
              NEW!
            </Badge>
          )}
          {content.isCompleted && (
            <Badge className="bg-green-500 text-white font-bold shadow-lg">
              <CheckCircle className="h-3 w-3 mr-1" />
              Done!
            </Badge>
          )}
        </div>

        {/* Lock overlay */}
        {content.isLocked && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Lock className="h-16 w-16 text-white drop-shadow-lg" />
          </div>
        )}

        {/* Content display */}
        {content.emoji ? (
          <div className="text-8xl animate-bounce-slow">{content.emoji}</div>
        ) : content.imageUrl && !imageError ? (
          <img
            src={content.imageUrl}
            alt={content.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-8xl">{typeIcons[content.type]}</div>
        )}

        {/* Type badge */}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-white/90 text-gray-800 font-bold text-xs uppercase">
            {content.type}
          </Badge>
        </div>

        {/* Difficulty badge */}
        {content.difficulty && (
          <div className="absolute bottom-3 right-3">
            <Badge className={cn(difficultyColors[content.difficulty], "text-white font-bold")}>
              {content.difficulty}
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <CardContent className="p-5 bg-white flex-1 flex flex-col">
        <h3 className="font-black text-xl mb-2 text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {content.title}
        </h3>

        {content.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {content.description}
          </p>
        )}

        {/* Meta information */}
        <div className="flex items-center justify-between mt-auto pt-3">
          {content.duration && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Play className="h-3 w-3" />
              <span>{content.duration}</span>
            </div>
          )}

          {!content.isLocked && (
            <div className="ml-auto">
              <div className="flex items-center gap-1 text-blue-600 font-bold text-sm">
                <span>{content.type === "game" ? "Play Now" : content.type === "video" ? "Watch" : "Start"}</span>
                <Play className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}

          {content.isLocked && (
            <div className="ml-auto text-xs text-gray-500 font-semibold">
              🔒 Complete previous lessons
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (content.isLocked || content.href === "#") {
    return (
      <div 
        onClick={(e) => {
          if (content.href === "#") e.preventDefault()
          if (onClick) onClick()
        }} 
        className={cn("group block h-full", !content.isLocked && "cursor-pointer")}
      >
        {mobileCardContent}
        {desktopCardContent}
      </div>
    )
  }

  return (
    <Link href={content.href} onClick={onClick} className="group block cursor-pointer h-full">
      {mobileCardContent}
      {desktopCardContent}
    </Link>
  )
}

