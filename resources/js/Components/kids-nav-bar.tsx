"use client"

import { useState } from "react"
import { Gamepad2, Video, Sparkles, BookOpen, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export type ContentCategory = "all" | "games" | "videos" | "activities" | "modules"

interface KidsNavBarProps {
  activeCategory: ContentCategory
  onCategoryChange: (category: ContentCategory) => void
}

export function KidsNavBar({ activeCategory, onCategoryChange }: KidsNavBarProps) {
  const categories = [
    { id: "all" as ContentCategory, label: "All Missions", icon: Home, color: "bg-slate-500 hover:bg-slate-400", shadow: "shadow-[0_6px_0_0_#334155] hover:shadow-[0_4px_0_0_#334155]" },
    { id: "videos" as ContentCategory, label: "Mission Intel", icon: Video, color: "bg-[#9333ea] hover:bg-[#a855f7]", shadow: "shadow-[0_6px_0_0_#6b21a8] hover:shadow-[0_4px_0_0_#6b21a8]" },
    { id: "games" as ContentCategory, label: "Training Ground", icon: Gamepad2, color: "bg-[#16a34a] hover:bg-[#22c55e]", shadow: "shadow-[0_6px_0_0_#166534] hover:shadow-[0_4px_0_0_#166534]" },
    { id: "activities" as ContentCategory, label: "Challenges", icon: Sparkles, color: "bg-[#eab308] hover:bg-[#facc15]", shadow: "shadow-[0_6px_0_0_#854d0e] hover:shadow-[0_4px_0_0_#854d0e]" },
    { id: "modules" as ContentCategory, label: "My Progress", icon: BookOpen, color: "bg-[#2563eb] hover:bg-[#3b82f6]", shadow: "shadow-[0_6px_0_0_#1e40af] hover:shadow-[0_4px_0_0_#1e40af]" },
  ]

  return (
    <div className="mb-8">
      {/* Desktop Navigation - Horizontal */}
      <div className="hidden md:flex justify-center gap-4 flex-wrap">
        {categories.map((category) => {
          const Icon = category.icon
          const isActive = activeCategory === category.id

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "flex items-center gap-2.5 px-8 py-3.5 rounded-full font-black text-sm uppercase transition-all duration-200 active:duration-75 border-2",
                isActive
                  ? `${category.color} text-white border-transparent ${category.shadow} active:translate-y-[4px] active:shadow-none hover:-translate-y-0.5`
                  : "bg-white text-slate-700 border-transparent shadow-[0_4px_0_0_#cbd5e1] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_#cbd5e1] hover:text-blue-600 active:translate-y-[4px] active:shadow-none"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2.5} />
              <span className="tracking-wide">{category.label}</span>
            </button>
          )
        })}
      </div>

      {/* Mobile Navigation - Wrapping Grid */}
      <div className="md:hidden w-full px-2 mb-2">
        <div className="flex flex-wrap justify-center gap-2 pb-2">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = activeCategory === category.id

            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-full font-black text-[11px] uppercase transition-all duration-200 active:duration-75 shrink-0 border-2",
                  isActive
                    ? `${category.color} text-white border-transparent ${category.shadow} active:translate-y-[4px] active:shadow-none hover:-translate-y-0.5`
                    : "bg-white text-slate-700 border-transparent shadow-[0_4px_0_0_#cbd5e1] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_#cbd5e1] hover:text-blue-600 active:translate-y-[4px] active:shadow-none"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={3} />
                <span className="tracking-wider whitespace-nowrap">{category.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
