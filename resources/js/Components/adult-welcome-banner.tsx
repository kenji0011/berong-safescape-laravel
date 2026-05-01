"use client"

import { useAuth } from "@/lib/auth-context"
import { Flame, Home, BookOpen } from "lucide-react"

export function AdultWelcomeBanner() {
    const { user } = useAuth()
    const firstName = user?.name?.split(' ')[0] || 'Safety Hero'

    return (
        <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] border-[3px] sm:border-[4px] border-slate-800 shadow-[0_6px_0_#0f172a] sm:shadow-[0_8px_0_#0f172a] mb-6 sm:mb-8 text-center transition-all">
            {/* Abstract background graphics */}
            <div className="absolute inset-0 z-0 overflow-hidden">

                <div className="absolute top-0 right-0 w-[30rem] sm:w-[40rem] h-[30rem] sm:h-[40rem] bg-orange-500/5 rounded-full -mr-20 sm:-mr-32 -mt-20 sm:-mt-32"></div>
                <div className="absolute bottom-0 left-0 w-[20rem] sm:w-[30rem] h-[20rem] sm:h-[30rem] bg-blue-500/5 rounded-full -ml-16 sm:-ml-20 -mb-16 sm:-mb-20"></div>
                {/* Subtle grid pattern for a modern technical look */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
            </div>

            {/* Main content */}
            <div className="relative z-10 px-4 py-6 sm:px-10 sm:py-10 flex flex-col items-center">
                {/* Floating Fire Icon */}
                <div className="mb-3 sm:mb-5 h-10 w-10 sm:h-12 sm:w-12 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/20 transform -rotate-3">
                    <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-md" strokeWidth={2.5} />
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-2 sm:mb-3 tracking-tight drop-shadow-xl">
                    Welcome home, <span className="text-orange-400 drop-shadow-[0_2px_10px_rgba(251,146,60,0.4)]">{firstName}</span>!
                </h1>

                <p className="text-slate-300 text-xs sm:text-base md:text-lg max-w-2xl mx-auto mb-5 sm:mb-6 font-medium leading-relaxed px-2">
                    Protecting your family starts with knowledge. <br className="hidden sm:block" /> Explore the latest fire safety articles and interactive simulations today.
                </p>

                <div className="flex flex-row flex-wrap justify-center gap-2 sm:gap-3 w-full sm:w-auto px-2 sm:px-0">
                    <span className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-white/10 border-[2px] border-white/20 text-white text-[10px] sm:text-xs md:text-sm font-black tracking-wide uppercase shadow-xl transition-all hover:bg-white/20 whitespace-nowrap">
                        <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-orange-400" strokeWidth={2.5} />
                        Articles
                    </span>
                    <span className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-white/10 border-[2px] border-white/20 text-white text-[10px] sm:text-xs md:text-sm font-black tracking-wide uppercase shadow-xl transition-all hover:bg-white/20 whitespace-nowrap">
                        <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-400" strokeWidth={2.5} />
                        Simulations
                    </span>
                </div>
            </div>
        </div>
    )
}
