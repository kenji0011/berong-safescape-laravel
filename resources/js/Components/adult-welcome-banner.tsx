"use client"

import { useAuth } from "@/lib/auth-context"
import { Flame, Home, BookOpen } from "lucide-react"

export function AdultWelcomeBanner() {
    const { user } = useAuth()
    const firstName = user?.name?.split(' ')[0] || 'Safety Hero'

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-900 via-amber-700 to-orange-950 rounded-3xl shadow-xl mb-8 border border-orange-500/30 text-center">
            {/* Abstract background graphics */}
            <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
            </div>



            {/* Main content */}
            <div className="relative z-10 px-8 py-10 sm:px-12 sm:py-12 flex flex-col items-center">
                {/* <div className="mb-4 inline-flex items-center justify-center p-3 bg-orange-800 rounded-2xl ring-1 ring-orange-400 shadow-lg shadow-orange-900/20">
                    
                </div> */}

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight drop-shadow-xl">
                    Welcome home, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-amber-200">{firstName}</span>!

                </h1>

                <p className="text-orange-100/90 text-lg sm:text-xl max-w-2xl mx-auto mb-6 font-medium leading-relaxed drop-shadow-sm">
                    Protecting your family starts with knowledge. <br className="hidden sm:block" /> Explore the latest fire safety articles and simulations today.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                    <span className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white text-sm font-bold shadow-2xl transition-all hover:bg-black/40">
                        <BookOpen className="h-4 w-4 text-orange-400" strokeWidth={2.5} />
                        Articles
                    </span>
                    <span className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white text-sm font-bold shadow-2xl transition-all hover:bg-black/40">
                        <Flame className="h-4 w-4 text-red-500" strokeWidth={2.5} />
                        Simulations
                    </span>
                </div>
            </div>
        </div>
    )
}
