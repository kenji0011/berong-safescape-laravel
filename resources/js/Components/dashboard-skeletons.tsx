import React from "react"
import { Skeleton } from "@/Components/ui/skeleton"
import { cn } from "@/lib/utils"

export function KidsWelcomeBannerSkeleton() {
  return (
    <div className="relative overflow-hidden bg-slate-200 rounded-[1.5rem] sm:rounded-[2rem] mb-6 sm:mb-8 border-4 border-white text-center animate-pulse">
      <div className="relative z-10 px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mb-6">
          {/* Avatar Skeleton */}
          <Skeleton className="h-14 w-14 sm:h-20 sm:w-20 rounded-full" />
          
          {/* Badge Stats Skeleton */}
          <div className="bg-white/50 backdrop-blur-md border-2 border-white/30 rounded-2xl p-2.5 sm:p-4 flex flex-col items-center sm:items-start gap-2 shadow-inner w-40 sm:w-56">
            <Skeleton className="h-3 w-20" />
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-7 w-7 sm:h-10 sm:w-10 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-2 w-24 mt-1" />
          </div>
        </div>

        {/* Welcome Text Skeleton */}
        <Skeleton className="h-8 sm:h-12 w-64 sm:w-96 mb-3" />
        <Skeleton className="h-4 sm:h-6 w-48 sm:w-80 mb-6" />

        {/* Buttons Skeleton */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 sm:h-14 w-32 sm:w-44 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function ContentCardSkeleton() {
  return (
    <div className="flex flex-col h-full w-full rounded-3xl sm:rounded-[2.5rem] overflow-hidden bg-white border border-slate-100 shadow-sm animate-pulse">
      {/* Visual Header Skeleton */}
      <Skeleton className="h-40 sm:h-52 w-full" />
      
      {/* Text Content Skeleton */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        <Skeleton className="h-6 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-4 sm:mb-6" />
        
        {/* Footer Skeleton */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t-2 border-slate-50">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-24 rounded-xl sm:rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

export function ContentGridSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
      {Array.from({ length: count }).map((_, i) => (
        <ContentCardSkeleton key={i} />
      ))}
    </div>
  )
}
