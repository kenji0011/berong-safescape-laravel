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

export function HeroCarouselSkeleton() {
  return (
    <div className="w-full h-[300px] sm:h-[450px] md:h-[500px] rounded-[2rem] sm:rounded-[3rem] bg-slate-200 animate-pulse relative overflow-hidden border-[4px] border-white shadow-xl">
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
    <div className="flex flex-col h-full bg-white rounded-2xl sm:rounded-3xl border-2 sm:border-[4px] border-white overflow-hidden relative shadow-[0_4px_0_#cbd5e1] sm:shadow-[0_6px_0_#cbd5e1] animate-pulse">
      <Skeleton className="h-28 sm:h-48 w-full" />
      <div className="p-3 sm:p-5 flex flex-col flex-1 gap-3">
        <Skeleton className="h-5 sm:h-7 w-3/4" />
        <div className="hidden sm:flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="mt-auto pt-4 border-t-2 border-dashed border-slate-100 flex justify-between">
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-6 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function AdultDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Banner Skeleton */}
      <Skeleton className="h-32 sm:h-48 w-full rounded-[2rem]" />
      
      {/* Notice Skeleton */}
      <Skeleton className="h-16 w-full rounded-2xl" />
      
      {/* Feature Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Skeleton className="h-32 w-full rounded-[2rem]" />
        <Skeleton className="h-32 w-full rounded-[2rem]" />
      </div>
      
      {/* Search Skeleton */}
      <Skeleton className="h-14 w-full rounded-full" />
      
      {/* Grid Header Skeleton */}
      <Skeleton className="h-8 w-48 mb-6" />
      
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
          <div key={i} className="w-full bg-white rounded-3xl p-4 shadow-[0_6px_0_#cbd5e1] animate-pulse flex items-center gap-4">
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
          <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_0_#cbd5e1] animate-pulse h-[380px]">
            <Skeleton className="h-[200px] w-full" />
            <div className="p-6 space-y-4">
               <div className="flex justify-between items-start">
                  <Skeleton className="h-7 w-1/2" />
                  <div className="h-12 w-12 rounded-2xl bg-slate-200 -mt-10 z-10" />
               </div>
               <Skeleton className="h-4 w-full" />
               <Skeleton className="h-10 w-full rounded-full mt-auto" />
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
      <div className="w-full max-w-sm bg-white border-2 border-slate-100 px-6 py-4 rounded-[2rem] shadow-sm flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2 w-1/2" />
        </div>
      </div>

      {/* Progress Bar Skeleton */}
      <div className="w-full max-w-sm bg-white/80 p-4 rounded-3xl border-2 border-slate-100 shadow-sm mb-12">
        <div className="flex justify-between mb-3">
          <Skeleton className="h-2 w-20" />
          <Skeleton className="h-2 w-8" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
      </div>

      {/* Main Card Skeleton */}
      <div className="w-[18rem] md:w-[22rem] h-[26rem] md:h-[30rem] bg-white border-[4px] md:border-[6px] border-slate-50 rounded-[2.5rem] md:rounded-[4rem] shadow-xl flex flex-col items-center justify-center p-8">
        <Skeleton className="h-40 w-40 md:h-56 md:w-56 rounded-3xl mb-8" />
        <Skeleton className="h-8 w-3/4 rounded-xl" />
      </div>
    </div>
  )
}
