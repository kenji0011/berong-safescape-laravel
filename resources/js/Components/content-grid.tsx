"use client"

import { ContentCard, ContentCardData } from "./content-card"
import { cn } from "@/lib/utils"
import { Skeleton } from "./ui/skeleton"

interface ContentGridProps {
  contents: ContentCardData[]
  emptyMessage?: string
  onCardClick?: (content: ContentCardData) => void
  variant?: 'map' | 'grid'
  isLoading?: boolean
  skeletonCount?: number
}

export function ContentGrid({ 
  contents, 
  emptyMessage = "No content available yet. Check back soon! 🎉", 
  onCardClick,
  variant = 'map',
  isLoading = false,
  skeletonCount = 3
}: ContentGridProps) {
  if (!isLoading && contents.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-8xl mb-6">😊</div>
        <p className="text-2xl font-bold text-gray-600">{emptyMessage}</p>
      </div>
    )
  }

  const isMap = variant === 'map';

  return (
    <div className={cn(
      "relative mb-24 max-w-7xl mx-auto",
      isMap ? "p-0 md:p-12 md:pb-32 md:rounded-[3.5rem] md:bg-[#8b5a2b] dark:md:bg-[#5c3a1b] md:wood-board md:border-[8px] md:border-[#4a2e15] dark:md:border-[#2a1a0c] md:shadow-[0_15px_0_#4a2e15] dark:md:shadow-[0_15px_0_#2a1a0c] overflow-visible transition-colors mt-8 md:mt-24" : "p-0"
    )}>
      {/* Adventure Ropes holding the wooden board */}
      {isMap && (
        <>
          <div className="absolute -top-12 md:-top-32 left-[10%] md:left-[15%] w-4 md:w-8 flex flex-col items-center z-[-1] hidden md:flex">
            <div className="w-3 md:w-6 h-16 md:h-40 bg-[#d2b48c] dark:bg-[#a67c52] rounded-full border-x-2 md:border-x-4 border-[#8b5a2b] dark:border-[#4a2e15] shadow-[0_4px_8px_rgba(0,0,0,0.3)] flex flex-col justify-evenly overflow-hidden relative">
               {/* Diagonal rope lines */}
               {[...Array(14)].map((_, i) => (
                 <div key={`rope-l-${i}`} className="w-[150%] h-1 md:h-1.5 bg-[#8b5a2b]/50 dark:bg-[#4a2e15]/50 -rotate-[25deg] transform -translate-x-1"></div>
               ))}
            </div>
            {/* Nail holding it to the board */}
            <div className="absolute -bottom-2 md:-bottom-4 w-6 h-6 md:w-10 md:h-10 rounded-full bg-slate-300 dark:bg-slate-400 border-2 md:border-4 border-slate-500 dark:border-slate-600 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.5),0_4px_4px_rgba(0,0,0,0.4)] flex items-center justify-center z-10">
               <div className="w-2 h-2 md:w-4 md:h-4 rounded-full bg-slate-800/30"></div>
            </div>
          </div>
          <div className="absolute -top-12 md:-top-32 right-[10%] md:right-[15%] w-4 md:w-8 flex flex-col items-center z-[-1] hidden md:flex">
            <div className="w-3 md:w-6 h-16 md:h-40 bg-[#d2b48c] dark:bg-[#a67c52] rounded-full border-x-2 md:border-x-4 border-[#8b5a2b] dark:border-[#4a2e15] shadow-[0_4px_8px_rgba(0,0,0,0.3)] flex flex-col justify-evenly overflow-hidden relative">
               {/* Diagonal rope lines */}
               {[...Array(14)].map((_, i) => (
                 <div key={`rope-r-${i}`} className="w-[150%] h-1 md:h-1.5 bg-[#8b5a2b]/50 dark:bg-[#4a2e15]/50 -rotate-[25deg] transform -translate-x-1"></div>
               ))}
            </div>
            {/* Nail holding it to the board */}
            <div className="absolute -bottom-2 md:-bottom-4 w-6 h-6 md:w-10 md:h-10 rounded-full bg-slate-300 dark:bg-slate-400 border-2 md:border-4 border-slate-500 dark:border-slate-600 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.5),0_4px_4px_rgba(0,0,0,0.4)] flex items-center justify-center z-10">
               <div className="w-2 h-2 md:w-4 md:h-4 rounded-full bg-slate-800/30"></div>
            </div>
          </div>
        </>
      )}

      {/* Adventure Path SVG Background & Wood Texture (Desktop Only) */}
      {isMap && (
        <div className="absolute inset-0 z-0 pointer-events-none hidden md:block">
          {/* Wood Texture Overlay */}
          <div 
            className="absolute inset-0 rounded-[3.5rem] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 5, 50 10 T 100 10' stroke='rgba(74, 46, 21, 0.4)' fill='none' stroke-width='2'/%3E%3Cpath d='M0 20 Q 25 15, 50 20 T 100 20' stroke='rgba(74, 46, 21, 0.3)' fill='none' stroke-width='1'/%3E%3C/svg%3E")`,
              backgroundSize: '100px 20px'
            }}
          ></div>
          
          <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none" className="overflow-visible">
             <defs>
               <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="#f97316" />
                 <stop offset="50%" stopColor="#ef4444" />
                 <stop offset="100%" stopColor="#f59e0b" />
               </linearGradient>
               <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                 <feGaussianBlur stdDeviation="6" result="blur" />
                 <feComposite in="SourceGraphic" in2="blur" operator="over" />
               </filter>
             </defs>

             {/* Path Shadow/Glow */}
             <path 
               d="M 150,220 C 300,220 350,340 500,340 S 700,220 850,220 C 950,220 950,410 500,410 C 50,410 50,600 150,600 C 300,600 350,720 500,720 S 700,600 850,600" 
               stroke="url(#pathGradient)"
               strokeWidth="16"
               strokeOpacity="0.1"
               fill="none"
               className="blur-md"
             />

             {/* The Organic Dotted Path */}
             <path 
               d="M 150,220 C 300,220 350,340 500,340 S 700,220 850,220 C 950,220 950,410 500,410 C 50,410 50,600 150,600 C 300,600 350,720 500,720 S 700,600 850,600" 
               stroke="url(#pathGradient)"
               strokeWidth="4"
               strokeDasharray="12,16"
               fill="none"
               strokeLinecap="round"
               className="opacity-60 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]"
             />

              {/* Decorative Path Markers (Stars & Nodes) */}
              <g className="opacity-40 fill-orange-500">
                <circle cx="150" cy="220" r="6" />
                <circle cx="500" cy="340" r="6" />
                <circle cx="850" cy="220" r="6" />
                <circle cx="150" cy="600" r="6" />
                <circle cx="500" cy="720" r="6" />
                <circle cx="850" cy="600" r="6" />
                
                {/* Small adventure stars along the curves */}
                <text x="325" y="230" className="text-xl fill-yellow-500">⭐</text>
                <text x="675" y="320" className="text-xl fill-yellow-500">⭐</text>
                <text x="500" y="420" className="text-2xl fill-orange-500">📍</text>
                <text x="325" y="610" className="text-xl fill-yellow-500">⭐</text>
                <text x="675" y="710" className="text-xl fill-yellow-500">⭐</text>
              </g>

             {/* Static Fire Truck (at start of path) */}
             <text 
               className="text-4xl pointer-events-none drop-shadow-2xl z-50"
               x="150"
               y="220"
               dominantBaseline="middle"
               textAnchor="middle"
             >
               🚒
             </text>

             {/* Decorative Landmarks Scattered in Background */}
             <g className="opacity-30 text-3xl pointer-events-none">
                {/* Top Row Decor */}
                <text x="320" y="120">🌳</text>
                <text x="680" y="150">🌲</text>
                <text x="50" y="350">🏠</text>
                
                {/* Middle Decor */}
                <text x="900" y="380">🏢</text>
                <text x="450" y="480">🌲</text>
                <text x="550" y="480">🌳</text>
                
                {/* Bottom Row Decor */}
                <text x="100" y="800">🏠</text>
                <text x="850" y="850">🚒</text>
                <text x="350" y="920">🌳</text>
                <text x="650" y="900">🏢</text>
             </g>
          </svg>
        </div>
      )}

      <div className={cn(
        "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8 relative z-10",
        isMap ? "gap-y-6 sm:gap-y-12 md:gap-y-24" : "gap-y-4"
      )}>
        {isLoading ? (
          Array.from({ length: skeletonCount }).map((_, i) => (
            <div 
              key={`skeleton-${i}`}
              className={cn(
                "w-full h-full transform transition-all duration-500",
                isMap && i % 2 !== 0 ? "md:translate-y-20" : ""
              )}
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-[280px] sm:h-[450px] transition-colors duration-500">
                <Skeleton className="h-32 sm:h-52 w-full rounded-none" />
                <div className="p-4 sm:p-6 flex-1 flex flex-col gap-4">
                  <Skeleton className="h-6 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-5/6 rounded-md" />
                  <div className="mt-auto flex justify-between items-center">
                    <Skeleton className="h-8 w-20 rounded-full" />
                    <Skeleton className="h-10 w-28 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          contents.map((content, index) => (
            <div 
              key={content.id}
              className={cn(
                "w-full h-full transform transition-all duration-500",
                isMap && index % 2 !== 0 ? "md:translate-y-20" : ""
              )}
            >
              {/* Card Content */}
              <ContentCard 
                content={content} 
                onClick={() => onCardClick?.(content)}
              />
            </div>
          ))
        )}
      </div>

      {/* Decorative "X" at the end */}
      {isMap && (
        <div className="hidden md:flex absolute bottom-12 right-12 text-6xl text-rose-500 opacity-20 rotate-12 font-black pointer-events-none">
          ✕
        </div>
      )}
    </div>
  )
}
