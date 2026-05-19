import React from "react"
import { Link } from '@inertiajs/react'
import { cn } from "@/lib/utils"

interface ModuleNavigationProps {
  currentModule: number
  completedModules: number[]
}

export const ModuleNavigation = ({ currentModule, completedModules }: ModuleNavigationProps) => {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {[1, 2, 3, 4, 5].map((n) => {
        const isCurrent = n === currentModule
        const isCompleted = completedModules.includes(n)
        const isUnlocked = n === 1 || completedModules.includes(n - 1)
        
        return (
          <React.Fragment key={n}>
            <Link
              href={isUnlocked ? `/kids/safescape/${n}` : "#"}
              className={cn(
                "h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-black transition-all shrink-0 border-[3px] focus:outline-none",
                isCompleted
                  ? isCurrent
                    ? "bg-green-500 text-white border-yellow-400 dark:border-yellow-500 shadow-[0_4px_0_#166534] -translate-y-0.5 pointer-events-none"
                    : "bg-green-500 text-white border-white dark:border-slate-200 shadow-[0_3px_0_#166534] hover:-translate-y-0.5 hover:shadow-[0_4px_0_#166534] active:translate-y-1 active:shadow-none"
                  : isCurrent
                    ? "bg-[#ff4b3e] text-white border-white dark:border-slate-200 shadow-[0_4px_0_#991b1b] -translate-y-0.5 pointer-events-none"
                    : isUnlocked
                      ? "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 shadow-[0_3px_0_#cbd5e1] dark:shadow-[0_3px_0_#0f172a] hover:-translate-y-0.5 hover:shadow-[0_4px_0_#cbd5e1] dark:hover:shadow-[0_4px_0_#0f172a] hover:text-slate-600 dark:hover:text-slate-300 active:translate-y-1 active:shadow-none"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-300 dark:text-slate-700 border-slate-200 dark:border-slate-800 shadow-none cursor-not-allowed opacity-60"
              )}
              onClick={(e) => {
                if (!isUnlocked) e.preventDefault()
              }}
            >
              {n}
            </Link>
            {n < 5 && (
              <div className={cn(
                "h-0.5 w-2 sm:w-6 rounded shrink-0 transition-colors",
                completedModules.includes(n) ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"
              )} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
