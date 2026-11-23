import React from "react"
import { Skeleton } from "@/Components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * Shared YouTube-style Video Card Skeleton
 * Matches AdultDashboard & ProfessionalDashboard video cards:
 * Horizontal on mobile (135/155px aspect-video thumb + text), vertical on sm+
 */
export function VideoCardSkeleton() {
  return (
    <div className="flex flex-row sm:flex-col h-full bg-white dark:bg-slate-900 rounded-[1.25rem] sm:rounded-[1.5rem] border-[3px] border-slate-200 dark:border-slate-800 shadow-[0_4px_0_#cbd5e1] dark:shadow-[0_4px_0_#0f172a] overflow-hidden p-2.5 sm:p-3 gap-0">
      {/* Thumbnail Box */}
      <Skeleton className="w-[135px] xs:w-[155px] sm:w-full aspect-video rounded-xl sm:rounded-2xl shrink-0 bg-slate-200 dark:bg-slate-800" />

      {/* Info Section */}
      <div className="flex flex-row items-start gap-2.5 sm:gap-3 flex-1 min-w-0 pl-3 sm:pl-0 sm:mt-3">
        {/* Channel Avatar (Desktop) */}
        <Skeleton className="hidden sm:block h-9 w-9 rounded-full shrink-0 mt-0.5 bg-slate-200 dark:bg-slate-800" />

        {/* Text Details Column */}
        <div className="flex flex-col flex-1 min-w-0 justify-start space-y-1.5 sm:space-y-2 py-0.5">
          <Skeleton className="h-3.5 sm:h-4 w-5/6 rounded-md bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-3.5 sm:h-4 w-3/5 rounded-md bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-2.5 sm:h-3 w-2/5 rounded-md bg-slate-100 dark:bg-slate-800/70 mt-0.5" />
        </div>
      </div>
    </div>
  )
}

export function VideoGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Matches KidsWelcomeBanner exact responsive layout:
 * Mobile: horizontal avatar (h-20 w-20) + text; sm+: centered title/rank;
 * Stats Grid: Identity (lg only) + Badges summary (6 boxes + progress bar);
 * Action buttons: Play / Learn / Win
 */
export function KidsWelcomeBannerSkeleton() {
  return (
    <div className="relative z-20">
      <div className="relative bg-slate-200/90 dark:bg-slate-900/85 rounded-2xl sm:rounded-[2.5rem] shadow-xl border-[3px] sm:border-[6px] border-white/90 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="relative z-10 px-4 sm:px-10 pt-6 sm:pt-8 lg:pt-10 pb-4 sm:pb-6 lg:pb-4 flex flex-col items-center">
          {/* Header */}
          <div className="mb-6 lg:mb-8 flex flex-row items-center justify-center gap-4 sm:flex-col sm:text-center w-full max-w-lg mx-auto sm:max-w-none">
            <Skeleton className="sm:hidden h-20 w-20 shrink-0 rounded-full bg-white/40 dark:bg-slate-800" />
            <div className="flex flex-col items-start sm:items-center gap-2 flex-1 sm:flex-initial">
              <Skeleton className="h-8 sm:h-12 lg:h-[72px] w-48 sm:w-[420px] lg:w-[540px] rounded-xl bg-white/40 dark:bg-slate-800" />
              <Skeleton className="h-4 sm:h-6 w-40 sm:w-72 rounded-lg bg-white/30 dark:bg-slate-800/80" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Card 1: Identity & Rank (lg only) */}
            <div className="hidden lg:flex bg-white/35 dark:bg-slate-950/40 rounded-[2rem] p-6 border border-white/40 dark:border-white/5 items-center gap-6">
              <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full shrink-0 bg-white/50 dark:bg-slate-800" />
              <div className="flex-1 space-y-2.5 min-w-0">
                <Skeleton className="h-2.5 w-24 rounded bg-white/40 dark:bg-slate-800" />
                <Skeleton className="h-8 w-44 rounded-lg bg-white/50 dark:bg-slate-800" />
                <div className="flex gap-2 pt-0.5">
                  <Skeleton className="h-6 w-20 rounded-full bg-white/45 dark:bg-slate-800" />
                  <Skeleton className="h-6 w-28 rounded-full bg-white/45 dark:bg-slate-800" />
                </div>
              </div>
            </div>

            {/* Card 2: Badges Summary */}
            <div className="bg-white/35 dark:bg-slate-950/40 rounded-[2rem] p-6 border border-white/40 dark:border-white/5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-32 rounded bg-white/45 dark:bg-slate-800" />
                <Skeleton className="h-7 w-24 rounded-xl bg-white/50 dark:bg-slate-800" />
              </div>
              <div className="flex items-center gap-3 mb-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl shrink-0 bg-white/45 dark:bg-slate-800"
                  />
                ))}
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <Skeleton className="h-2.5 w-36 rounded bg-white/35 dark:bg-slate-800" />
                  <Skeleton className="h-3.5 w-9 rounded bg-white/45 dark:bg-slate-800" />
                </div>
                <Skeleton className="h-3 w-full rounded-full bg-white/40 dark:bg-slate-800" />
              </div>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mt-1 sm:mt-2 pb-2">
            <Skeleton className="h-9 sm:h-12 w-24 sm:w-36 rounded-xl sm:rounded-2xl bg-white/50 dark:bg-slate-800" />
            <Skeleton className="h-9 sm:h-12 w-24 sm:w-36 rounded-xl sm:rounded-2xl bg-white/50 dark:bg-slate-800" />
            <Skeleton className="h-9 sm:h-12 w-24 sm:w-36 rounded-xl sm:rounded-2xl bg-white/50 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Matches ContentCard exact dimensions:
 * rounded-2xl sm:rounded-[2.5rem], h-32 sm:h-52 header, p-3 sm:p-6 body, footer badge + CTA
 */
export function ContentCardSkeleton() {
  return (
    <div className="flex flex-col h-full w-full rounded-2xl sm:rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-colors">
      {/* Visual Header */}
      <Skeleton className="h-32 sm:h-52 w-full rounded-none shrink-0 bg-slate-200 dark:bg-slate-700/80" />

      {/* Text Content */}
      <div className="p-3 sm:p-6 flex-1 flex flex-col">
        <Skeleton className="h-4 sm:h-6 w-3/4 rounded-lg mb-1.5 sm:mb-2 bg-slate-200 dark:bg-slate-700" />
        <Skeleton className="h-3 sm:h-3.5 w-full rounded-md mb-1 bg-slate-200/80 dark:bg-slate-700/70" />
        <Skeleton className="h-3 sm:h-3.5 w-5/6 rounded-md mb-3 sm:mb-6 bg-slate-200/80 dark:bg-slate-700/70" />

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-3 sm:pt-4 border-t-2 border-slate-100 dark:border-slate-700/50">
          <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="h-7 sm:h-10 w-16 sm:w-24 rounded-lg sm:rounded-2xl bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  )
}

/**
 * Matches ContentGrid exact board container, 2-col mobile / 3-col lg grid, and staggered odd cards
 */
export function ContentGridSkeleton({
  count = 6,
  variant = "map",
}: {
  count?: number
  variant?: "map" | "grid"
}) {
  const isMap = variant === "map"

  return (
    <div
      className={cn(
        "relative mb-24 max-w-7xl mx-auto",
        isMap
          ? "p-0 md:p-12 md:pb-32 md:rounded-[3.5rem] md:bg-slate-200/60 dark:md:bg-slate-900/60 md:border-[8px] md:border-slate-300/60 dark:md:border-slate-800 mt-8 md:mt-24"
          : "p-0"
      )}
    >
      <div
        className={cn(
          "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8 relative z-10",
          isMap ? "gap-y-6 sm:gap-y-12 md:gap-y-24" : "gap-y-4"
        )}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-full h-full",
              isMap && i % 2 !== 0 ? "md:translate-y-20" : ""
            )}
          >
            <ContentCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Matches HeroCarouselClient exact aspect-video ratio, bottom-left overlay text, and desktop arrows
 */
export function HeroCarouselSkeleton() {
  return (
    <div className="relative w-full max-w-7xl mx-auto">
      <div className="relative w-full aspect-video overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-gray-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-800 transition-colors">
        <Skeleton className="absolute inset-0 w-full h-full rounded-none bg-slate-200 dark:bg-slate-800" />
        {/* Bottom-left title & subtitle matching HeroCarouselClient */}
        <div className="absolute inset-0 flex flex-col justify-end items-start p-6 pb-10 sm:p-10 sm:pb-14 md:p-12 md:pb-16">
          <div className="w-full max-w-5xl space-y-3 sm:space-y-4">
            <Skeleton className="h-8 sm:h-11 md:h-14 w-3/4 max-w-2xl rounded-xl bg-slate-300/80 dark:bg-slate-700/80" />
            <Skeleton className="hidden sm:block h-4 sm:h-5 md:h-6 w-2/3 max-w-xl rounded-lg bg-slate-300/60 dark:bg-slate-700/60" />
          </div>
        </div>
        {/* Desktop side arrows */}
        <Skeleton className="hidden sm:block absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/60 dark:bg-slate-700/80" />
        <Skeleton className="hidden sm:block absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/60 dark:bg-slate-700/80" />
      </div>
    </div>
  )
}

/**
 * Matches AdultDashboard article preview cards:
 * rounded-xl sm:rounded-[1.75rem], h-28 sm:h-52 image, accent bar, p-2.5 sm:p-5 body, publisher + time footer
 */
export function BlogCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl sm:rounded-[1.75rem] border-[2px] border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] transition-colors">
      <Skeleton className="h-28 sm:h-52 w-full rounded-none shrink-0 bg-slate-200 dark:bg-slate-800" />
      <div className="h-[2px] sm:h-[3px] w-full bg-slate-200 dark:bg-slate-800" />
      <div className="p-2.5 sm:p-5 flex flex-col flex-1">
        <Skeleton className="h-3.5 sm:h-5 w-5/6 rounded-md mb-1.5 sm:mb-2 bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="h-3 sm:h-4 w-full rounded-md mb-1 bg-slate-200/80 dark:bg-slate-800/80" />
        <Skeleton className="h-3 sm:h-4 w-4/5 rounded-md mb-2.5 sm:mb-5 bg-slate-200/80 dark:bg-slate-800/80" />
        <div className="mt-auto pt-2 sm:pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="space-y-1">
            <Skeleton className="h-3 sm:h-3.5 w-16 sm:w-24 rounded bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-2 w-12 rounded bg-slate-100 dark:bg-slate-800/70" />
          </div>
          <Skeleton className="h-3 w-12 sm:w-16 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  )
}

/**
 * Full AdultDashboard page skeleton (matching actual Welcome Banner + 2 Feature Cards + Articles Grid)
 */
export function AdultDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Welcome Banner Skeleton */}
      <Skeleton className="h-44 sm:h-56 w-full rounded-[2rem] bg-slate-200 dark:bg-slate-800" />

      {/* Feature Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-4 flex items-center gap-3 sm:gap-6 border-[3px] border-white dark:border-slate-700 shadow-[0_6px_0_#cbd5e1] dark:shadow-[0_6px_0_#1e293b]"
          >
            <Skeleton className="h-12 w-12 sm:h-20 sm:w-20 rounded-xl sm:rounded-[1.5rem] shrink-0 bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1 space-y-2 min-w-0">
              <Skeleton className="h-5 sm:h-7 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-3 sm:h-4 w-1/2 rounded-md bg-slate-200/80 dark:bg-slate-700/80" />
            </div>
            <Skeleton className="h-8 w-8 sm:h-12 sm:w-12 rounded-full shrink-0 bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>

      {/* Articles Header & Search */}
      <div>
        <Skeleton className="h-8 sm:h-9 w-56 rounded-lg mb-4 sm:mb-6 bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="h-12 w-full max-w-md rounded-2xl mb-6 bg-slate-200 dark:bg-slate-800" />

        {/* Blog Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Matches FeaturedCards exact header + mobile cards (icon + text + full-width button) + desktop 3-col cards
 */
export function FeaturedCardsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Section Header */}
      <div className="text-center mb-10 sm:mb-14 flex flex-col items-center">
        <Skeleton className="h-7 sm:h-8 w-36 sm:w-44 rounded-full mb-6 bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="h-9 sm:h-12 w-72 sm:w-[460px] rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Mobile skeleton matching MobileAnimatedCard */}
      <div className="md:hidden space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-full bg-white/80 dark:bg-slate-800/80 rounded-[1.5rem] p-5 sm:p-6 border-2 border-white/60 dark:border-slate-700/60 shadow-[0_4px_15px_rgba(0,0,0,0.06)] transition-colors"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-xl shrink-0 bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1 space-y-2 min-w-0">
                <Skeleton className="h-5 w-1/2 rounded-md bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-3.5 w-full rounded bg-slate-200/80 dark:bg-slate-700/80" />
                <Skeleton className="h-3.5 w-3/4 rounded bg-slate-200/80 dark:bg-slate-700/80" />
              </div>
            </div>
            <Skeleton className="mt-4 h-10 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>

      {/* Desktop skeleton matching AnimatedFeaturedCard */}
      <div className="hidden md:grid grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#0B1120] rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-xl flex flex-col transition-colors"
          >
            <Skeleton className="h-[180px] sm:h-[220px] w-full rounded-none shrink-0 bg-slate-200 dark:bg-slate-800" />
            <div className="p-6 sm:p-7 md:p-8 flex-1 flex flex-col relative">
              <Skeleton className="absolute -top-8 sm:-top-10 right-6 sm:right-8 h-14 w-14 sm:h-16 sm:w-16 rounded-xl border-4 border-white dark:border-[#0B1120] bg-slate-300 dark:bg-slate-700" />
              <Skeleton className="h-7 w-2/3 rounded-lg mb-3 bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2 mb-2">
                <Skeleton className="h-4 w-full rounded bg-slate-200/80 dark:bg-slate-800/80" />
                <Skeleton className="h-4 w-5/6 rounded bg-slate-200/80 dark:bg-slate-800/80" />
              </div>
              <div className="mt-auto pt-6">
                <Skeleton className="h-12 sm:h-[52px] w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Matches HotOrNot initial 'start' card modal (max-w-md, rounded-[3rem], p-8)
 */
export function HotOrNotSkeleton() {
  return (
    <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[3rem] shadow-2xl text-center">
      <Skeleton className="w-24 h-24 rounded-3xl mx-auto mb-6 bg-slate-200 dark:bg-slate-800" />
      <Skeleton className="h-10 w-56 rounded-xl mx-auto mb-3 bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-2 mb-8">
        <Skeleton className="h-4 w-full rounded bg-slate-200/80 dark:bg-slate-800/80" />
        <Skeleton className="h-4 w-4/5 rounded mx-auto bg-slate-200/80 dark:bg-slate-800/80" />
      </div>

      <div className="flex gap-4 mb-8">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2"
          >
            <Skeleton className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
            <Skeleton className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
            <Skeleton className="h-3.5 w-20 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>

      <Skeleton className="w-full h-[60px] rounded-2xl bg-slate-200 dark:bg-slate-800" />
    </div>
  )
}

/**
 * Matches AdminUsersTab user row: avatar + name + email/username/role + 4 permission buttons
 */
export function UserRowSkeleton() {
  return (
    <div className="p-4 sm:p-5 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
        <Skeleton className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
        <div className="space-y-2 flex-1 min-w-0">
          <Skeleton className="h-5 w-40 sm:w-52 rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
            <Skeleton className="h-3.5 w-40 sm:w-48 rounded bg-slate-200/80 dark:bg-slate-800/80" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-20 rounded bg-slate-200/80 dark:bg-slate-800/80" />
              <Skeleton className="h-4 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-auto grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 shrink-0">
        <Skeleton className="h-9 w-full sm:w-[74px] rounded-xl bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="h-9 w-full sm:w-[86px] rounded-xl bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="h-9 w-full sm:w-[68px] rounded-xl bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="h-9 w-full sm:w-[82px] rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  )
}

export function UserListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <UserRowSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Matches Profile.tsx Pre-Test & Post-Test cards:
 * 100px ScoreGauge + badge/title + subtitle + 2-col score/status box + completed footer
 */
export function ScoreCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="border-[3px] border-slate-200 dark:border-slate-800 rounded-[1.25rem] sm:rounded-[1.75rem] p-4 sm:p-6 bg-white dark:bg-slate-950 shadow-[0_4px_0_#cbd5e1] dark:shadow-[0_4px_0_#0f172a]"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Skeleton className="w-[100px] h-[100px] scale-90 sm:scale-100 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-3 w-full min-w-0">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1.5">
                <Skeleton className="h-4 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-6 w-28 rounded-md bg-slate-200 dark:bg-slate-800" />
              </div>
              <Skeleton className="h-3.5 w-4/5 mx-auto sm:mx-0 rounded bg-slate-200/80 dark:bg-slate-800/80" />
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5">
                  <Skeleton className="h-2.5 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                  <Skeleton className="h-5 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-2.5 w-14 rounded bg-slate-200 dark:bg-slate-800" />
                  <Skeleton className="h-5 w-20 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-center sm:justify-start">
                <Skeleton className="h-3.5 w-40 rounded bg-slate-200/80 dark:bg-slate-800/80" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Matches FireCodeViewer exact 1/3 left column (Search card + 500px TOC card) and 2/3 right column (600px viewer)
 */
export function FireCodeViewerSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left panel: Search + TOC */}
      <div className="lg:col-span-1 space-y-4">
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <Skeleton className="h-6 w-40 rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1 rounded-md bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-9 w-10 rounded-md bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>

        <div className="h-[500px] border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-4">
          <Skeleton className="h-6 w-52 rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2.5 flex-1">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 rounded-md bg-slate-50 dark:bg-slate-800/40"
              >
                <Skeleton className="h-4 w-10 rounded bg-slate-200 dark:bg-slate-700 shrink-0" />
                <Skeleton className="h-4 flex-1 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel: 600px Content Viewer */}
      <div className="lg:col-span-2 h-[600px] border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-slate-900 shadow-sm space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-3">
          <Skeleton className="h-7 w-2/3 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-5 w-32 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-4 w-4/6 rounded bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800 mt-4" />
          <Skeleton className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  )
}

/**
 * Matches Admin/Analytics.tsx Overview tab exact structure:
 * Row 1: 4 Metric Cards (2-col mobile, 4-col lg)
 * Row 2: 3 Engagement Cards (col-span-2 on first mobile, 3-col lg)
 * Row 3: User Journey Funnel heading + 3 horizontal funnel step cards
 */
export function AnalyticsOverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Row 1: 4 Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 dark:border-slate-700 border-b-[4px] sm:border-b-[6px] p-5 sm:p-6 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-2 sm:mb-6 gap-2">
              <Skeleton className="h-3.5 sm:h-4 w-20 sm:w-28 rounded bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl shrink-0 bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="mt-2 sm:mt-0 space-y-2">
              <Skeleton className="h-9 sm:h-12 w-20 sm:w-24 rounded-lg bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 rounded bg-slate-200/80 dark:bg-slate-700/80" />
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: 3 Engagement Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "bg-white dark:bg-slate-800 rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 dark:border-slate-700 border-b-[4px] sm:border-b-[6px] p-4 sm:p-6 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a]",
              i === 1 && "col-span-2 lg:col-span-1"
            )}
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
              <Skeleton className="h-9 w-9 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl shrink-0 bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-4 w-24 sm:w-28 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="mt-2 sm:mt-0 space-y-2">
              <Skeleton className="h-8 sm:h-10 w-24 rounded-lg bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-3 sm:h-4 w-28 sm:w-36 rounded bg-slate-200/80 dark:bg-slate-700/80" />
            </div>
          </div>
        ))}
      </div>

      {/* Row 3: User Journey Funnel (3 step cards) */}
      <div className="mb-6 space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 mb-3 mt-8">
          <Skeleton className="h-6 w-6 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="h-6 w-48 rounded-md bg-slate-200 dark:bg-slate-700" />
        </div>

        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 dark:border-slate-700 border-b-[4px] sm:border-b-[6px] p-4 sm:p-5 flex items-center gap-4 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a]"
          >
            <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl shrink-0 bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <Skeleton className="h-5 sm:h-6 w-40 sm:w-52 rounded-md bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-3 sm:h-4 w-32 sm:w-44 rounded bg-slate-200/80 dark:bg-slate-700/80" />
              {step > 1 && (
                <Skeleton className="h-2.5 sm:h-3 w-full rounded-full mt-2 sm:mt-3 bg-slate-100 dark:bg-slate-700/70" />
              )}
            </div>
            <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
              <Skeleton className="h-7 sm:h-10 w-14 sm:w-16 rounded-lg bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-4 sm:h-5 w-16 sm:w-20 rounded-full bg-slate-100 dark:bg-slate-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Matches LandingAssessmentSection inner card state (rendered below the existing <h4> heading)
 */
export function AssessmentCardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50/80 dark:bg-slate-900/60 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-700/50 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded-full shrink-0 bg-slate-200 dark:bg-slate-700" />
            <Skeleton className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded-full shrink-0 bg-slate-200 dark:bg-slate-700" />
            <Skeleton className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
      <Skeleton className="h-12 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
    </div>
  )
}

/**
 * Matches AdminDashboard tab content card containers
 */
export function AdminTableSkeleton({ rows = 4, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-[1.75rem] sm:rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] p-6 sm:p-7 md:p-8 bg-white/90 dark:bg-slate-800/50 backdrop-blur-md space-y-4">
      <div className="flex justify-between items-center pb-4 border-b-2 border-slate-200/80 dark:border-slate-700/80 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 sm:h-7 w-44 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="h-3.5 w-60 rounded bg-slate-200/80 dark:bg-slate-700/80" />
        </div>
        <Skeleton className="h-10 w-28 sm:w-32 rounded-xl shrink-0 bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="space-y-3 pt-1">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/90 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-700/60"
          >
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                className={cn(
                  "h-4 rounded bg-slate-200 dark:bg-slate-700",
                  c === 0 ? "w-1/3" : "flex-1"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Matches AdminDashboard exact header card, 7-tab strip, and tab content container
 */
export function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-8 space-y-6">
        {/* Boxed Admin Panel Header Card */}
        <div className="bg-white/90 dark:bg-slate-800/50 backdrop-blur-md p-6 sm:p-7 md:p-8 rounded-[1.75rem] sm:rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <Skeleton className="h-11 w-11 sm:h-14 sm:w-14 rounded-xl shrink-0 bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-2 min-w-0">
              <Skeleton className="h-6 sm:h-8 w-36 sm:w-48 rounded-lg bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-3.5 sm:h-4 w-48 sm:w-72 rounded bg-slate-200/80 dark:bg-slate-700/80" />
            </div>
          </div>
          <Skeleton className="h-10 sm:h-11 w-28 sm:w-48 rounded-xl shrink-0 bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* 7-Tab Bar (single row flex on mobile, 7-col grid on sm+) */}
        <div className="flex w-full sm:grid sm:grid-cols-7 bg-slate-200/70 dark:bg-slate-800/50 p-2.5 rounded-[1.5rem] sm:rounded-[1.75rem] gap-2 border-2 border-slate-200 dark:border-slate-700">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton
              key={i}
              className="flex-1 h-11 rounded-xl bg-slate-300/70 dark:bg-slate-700"
            />
          ))}
        </div>

        {/* Main Content Area Skeleton */}
        <AdminTableSkeleton rows={5} cols={4} />
      </div>
    </div>
  )
}

/**
 * Matches CourseHub.tsx Training Module Cards (5 modules in 1/2/3-col grid)
 */
export function CourseModuleCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] flex flex-col bg-white dark:bg-slate-900 border-[3px] border-slate-200 dark:border-slate-800 shadow-[0_8px_0_#e2e8f0] dark:shadow-[0_8px_0_#0f172a] p-6 sm:p-7 h-full">
      {/* Top Row: Module # Badge & Completion Check */}
      <div className="flex items-center justify-between mb-6 gap-2">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-10 w-10 rounded-2xl shrink-0 bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-6 w-24 rounded-lg bg-slate-100 dark:bg-slate-800/70" />
        </div>
        <Skeleton className="h-9 w-9 rounded-full shrink-0 bg-slate-100 dark:bg-slate-800/70" />
      </div>

      {/* Title */}
      <Skeleton className="h-7 sm:h-8 w-4/5 rounded-lg mb-3 bg-slate-200 dark:bg-slate-800" />

      {/* Description */}
      <div className="space-y-2 mb-6">
        <Skeleton className="h-4 w-full rounded bg-slate-200/80 dark:bg-slate-800/80" />
        <Skeleton className="h-4 w-5/6 rounded bg-slate-200/80 dark:bg-slate-800/80" />
      </div>

      <div className="flex-1" />

      {/* Bottom Section: Progress Bar + Badge & Full-Width CTA */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-3 w-10 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <Skeleton className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
        </div>

        <div className="pt-2 flex items-center justify-between gap-3">
          <Skeleton className="w-[52px] h-[52px] rounded-2xl shrink-0 bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="flex-1 h-[54px] rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  )
}

export function CourseModulesGridSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[800px]">
      {Array.from({ length: count }).map((_, i) => (
        <CourseModuleCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Matches Kids ModuleOne–ModuleFive content layout (max-w-5xl intro + aspect-video card + activity card)
 */
export function KidsModuleSkeleton() {
  return (
    <div className="absolute inset-0 z-10 bg-white dark:bg-slate-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 space-y-10 sm:space-y-14">
        {/* Intro Heading & Subtitle */}
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center space-y-3 sm:space-y-4">
          <Skeleton className="h-9 sm:h-12 md:h-14 w-3/4 max-w-xl rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-4 sm:h-5 w-full max-w-2xl rounded-lg bg-slate-200/80 dark:bg-slate-800/80" />
          <Skeleton className="h-4 sm:h-5 w-4/5 max-w-xl rounded-lg bg-slate-200/80 dark:bg-slate-800/80" />
        </div>

        {/* Intro Video Section Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] border-[3px] sm:border-[4px] border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 md:p-10 space-y-4 sm:space-y-6">
          <Skeleton className="h-7 sm:h-8 w-56 mx-auto rounded-xl bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="w-full aspect-video rounded-2xl sm:rounded-3xl bg-slate-200/90 dark:bg-slate-800" />
          <div className="pt-4 sm:pt-6 border-t-2 border-slate-100 dark:border-slate-800 flex justify-center">
            <Skeleton className="h-4 w-48 rounded bg-slate-200/80 dark:bg-slate-800/80" />
          </div>
        </div>

        {/* Interactive Activity Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-[4px] border-slate-200 dark:border-slate-800 p-5 sm:p-8 md:p-12 shadow-sm space-y-5">
          <Skeleton className="h-7 sm:h-8 w-64 mx-auto rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-36 sm:h-44 rounded-2xl bg-slate-100 dark:bg-slate-800/70" />
            <Skeleton className="h-36 sm:h-44 rounded-2xl bg-slate-100 dark:bg-slate-800/70" />
            <Skeleton className="h-36 sm:h-44 rounded-2xl bg-slate-100 dark:bg-slate-800/70" />
          </div>
        </div>
      </div>
    </div>
  )
}
