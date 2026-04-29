import React from "react"
import { Skeleton } from "@/Components/ui/skeleton"
import { cn } from "@/lib/utils"

export function KidsWelcomeBannerSkeleton() {
  return (
    <div className="relative bg-slate-200 dark:bg-slate-900/80 rounded-2xl sm:rounded-[2.5rem] shadow-xl mb-6 sm:mb-8 border-[3px] sm:border-[6px] border-white/90 dark:border-slate-800 overflow-hidden animate-pulse transition-colors">
      <div className="relative z-10 px-4 sm:px-10 pt-6 sm:pt-8 lg:pt-10 pb-4 sm:pb-6 lg:pb-4 flex flex-col items-center">
        
        {/* Header Skeleton */}
        <div className="text-center mb-6 lg:mb-8 flex flex-col items-center gap-3">
          <Skeleton className="sm:hidden h-16 w-16 rounded-full bg-white/20" />
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-10 sm:h-16 lg:h-20 w-64 sm:w-[500px] bg-white/20 rounded-xl" />
            <Skeleton className="h-4 sm:h-6 w-48 sm:w-80 bg-white/10 rounded-lg" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
           {/* Card 1 Identity */}
           <div className="hidden lg:flex bg-white/5 dark:bg-white/5 rounded-[2rem] p-6 border border-white/10 items-center gap-6">
              <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white/10" />
              <div className="flex-1 space-y-3">
                 <Skeleton className="h-3 w-24 bg-white/10" />
                 <Skeleton className="h-10 w-48 bg-white/20" />
                 <Skeleton className="h-6 w-20 bg-white/10 rounded-full" />
              </div>
           </div>

           {/* Card 2 Badges */}
           <div className="bg-white/5 dark:bg-white/5 rounded-[2rem] p-6 border border-white/10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32 bg-white/10" />
                <Skeleton className="h-8 w-24 bg-white/20 rounded-xl" />
              </div>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Skeleton key={i} className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/10" />
                ))}
              </div>
              <div className="space-y-2 mt-2">
                <Skeleton className="h-2 w-full bg-white/5 rounded-full" />
                <Skeleton className="h-3 w-full bg-white/10 rounded-full" />
              </div>
           </div>
        </div>

        {/* Motto Tags Skeleton */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mt-1 sm:mt-2">
           <Skeleton className="h-10 sm:h-14 w-24 sm:w-40 rounded-xl sm:rounded-2xl bg-white/20" />
           <Skeleton className="h-10 sm:h-14 w-24 sm:w-40 rounded-xl sm:rounded-2xl bg-white/20" />
           <Skeleton className="h-10 sm:h-14 w-24 sm:w-40 rounded-xl sm:rounded-2xl bg-white/20" />
        </div>
      </div>
    </div>
  )
}

export function ContentCardSkeleton() {
  return (
    <div className="flex flex-col h-full w-full rounded-3xl sm:rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm animate-pulse transition-colors">
      {/* Visual Header Skeleton */}
      <Skeleton className="h-40 sm:h-52 w-full" />
      
      {/* Text Content Skeleton */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        <Skeleton className="h-6 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-4 sm:mb-6" />
        
        {/* Footer Skeleton */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t-2 border-slate-50 dark:border-slate-800">
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

export function HeroCarouselSkeleton() {
  return (
    <div className="w-full h-[300px] sm:h-[450px] md:h-[500px] rounded-[2rem] sm:rounded-[3rem] bg-slate-200 dark:bg-slate-800 animate-pulse relative overflow-hidden border-[4px] border-white dark:border-slate-700 shadow-xl transition-colors">
      <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16 md:px-24">
        <Skeleton className="h-10 sm:h-16 w-3/4 mb-4 rounded-xl" />
        <Skeleton className="h-6 sm:h-8 w-1/2 mb-8 rounded-lg" />
        <div className="flex gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </div>
      {/* Dots skeleton */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-2 w-8 rounded-full" />
        ))}
      </div>
    </div>
  )
}

export function BlogCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl border-2 sm:border-[4px] border-white dark:border-slate-700 overflow-hidden relative shadow-[0_4px_0_#cbd5e1] dark:shadow-[0_4px_0_#1e293b] sm:shadow-[0_6px_0_#cbd5e1] sm:dark:shadow-[0_6px_0_#1e293b] animate-pulse transition-colors">
      <Skeleton className="h-28 sm:h-48 w-full bg-slate-200 dark:bg-slate-700" />
      <div className="p-3 sm:p-5 flex flex-col flex-1 gap-3">
        <Skeleton className="h-5 sm:h-7 w-3/4 bg-slate-200 dark:bg-slate-700" />
        <div className="hidden sm:flex flex-col gap-2">
          <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="mt-auto pt-4 border-t-2 border-dashed border-slate-100 dark:border-slate-700 flex justify-between transition-colors">
          <Skeleton className="h-6 w-24 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="h-6 w-24 rounded-lg bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  )
}

export function AdultDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Banner Skeleton */}
      <Skeleton className="h-32 sm:h-48 w-full rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
      
      {/* Notice Skeleton */}
      <Skeleton className="h-16 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
      
      {/* Feature Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Skeleton className="h-32 w-full rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="h-32 w-full rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
      </div>
      
      {/* Search Skeleton */}
      <Skeleton className="h-14 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
      
      {/* Grid Header Skeleton */}
      <Skeleton className="h-8 w-48 mb-6 bg-slate-200 dark:bg-slate-800" />
      
      {/* Blog Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <BlogCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function FeaturedCardsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Mobile skeleton */}
      <div className="md:hidden space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-full bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-[0_6px_0_#cbd5e1] dark:shadow-[0_6px_0_#1e293b] animate-pulse flex items-center gap-4 transition-colors">
             <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
             <div className="flex-1 space-y-2">
               <Skeleton className="h-5 w-1/2" />
               <Skeleton className="h-4 w-3/4" />
             </div>
          </div>
        ))}
      </div>
      
      {/* Desktop skeleton */}
      <div className="hidden md:grid grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#1e293b] animate-pulse h-[380px] transition-colors">
            <Skeleton className="h-[200px] w-full bg-slate-200 dark:bg-slate-800" />
            <div className="p-6 space-y-4">
               <div className="flex justify-between items-start">
                  <Skeleton className="h-7 w-1/2 bg-slate-200 dark:bg-slate-800" />
                  <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-700 -mt-10 z-10" />
               </div>
               <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-800" />
               <Skeleton className="h-10 w-full rounded-full mt-auto bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function HotOrNotSkeleton() {
  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center pt-6 md:pt-10 animate-pulse px-4">
      {/* Robot Hint Skeleton */}
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 px-6 py-4 rounded-[2rem] shadow-sm flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2 w-1/2" />
        </div>
      </div>

      {/* Progress Bar Skeleton */}
      <div className="w-full max-w-sm bg-white/80 dark:bg-slate-900/80 p-4 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-sm mb-12">
        <div className="flex justify-between mb-3">
          <Skeleton className="h-2 w-20" />
          <Skeleton className="h-2 w-8" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
      </div>

      {/* Main Card Skeleton */}
      <div className="w-[18rem] md:w-[22rem] h-[26rem] md:h-[30rem] bg-white dark:bg-slate-900 border-[4px] md:border-[6px] border-slate-50 dark:border-slate-800 rounded-[2.5rem] md:rounded-[4rem] shadow-xl flex flex-col items-center justify-center p-8">
        <Skeleton className="h-40 w-40 md:h-56 md:w-56 rounded-3xl mb-8" />
        <Skeleton className="h-8 w-3/4 rounded-xl" />
      </div>
    </div>
  )
}
