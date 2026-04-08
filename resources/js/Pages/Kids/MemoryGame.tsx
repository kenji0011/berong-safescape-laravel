import React from "react"
import { Link } from '@inertiajs/react'
import { ArrowLeft, RotateCcw } from "lucide-react"
import DashboardLayout from "@/Layouts/DashboardLayout"

const MemoryGamePage = () => {
  // 12 cards for a 4x3 grid
  const cards = Array.from({ length: 12 }).map((_, i) => ({ id: i }))

  return (
    <div className="min-h-screen relative flex flex-col font-sans">
      {/* Background Image Layer */}
      <div
        className="fixed inset-0 opacity-20 bg-cover z-0 pointer-events-none"
        style={{ backgroundImage: "url('/web-background-image.jpg')", backgroundPosition: 'center' }}
      />

      <div className="relative z-10 w-full flex-1 flex flex-col pt-6 pb-12">
        {/* Ghost Header - floats above content */}
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pb-6">
          <Link 
            href="/kids" 
            className="inline-flex items-center gap-2 text-slate-800 font-bold hover:text-black transition-all text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Activities
          </Link>
        </div>

        {/* Main Game Hub Container */}
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex-1 flex items-center justify-center">
          <div className="w-full bg-[#f4fbff] border border-slate-200/50 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl overflow-hidden">
            
            {/* Header: Title & New Game */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Memory Match Game
              </h2>
              <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm text-sm">
                <RotateCcw className="h-4 w-4" />
                New Game
              </button>
            </div>

            {/* Stats Header */}
            <div className="flex items-center justify-between mb-8 px-2">
              <div>
                <div className="text-slate-500 font-medium text-sm mb-1">Moves</div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 leading-none">0</div>
              </div>
              <div className="text-right">
                <div className="text-slate-500 font-medium text-sm mb-1">Matches</div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 leading-none">0 / 6</div>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 sm:gap-6">
              {cards.map((card) => (
                <div 
                  key={card.id}
                  className="aspect-square rounded-2xl bg-gradient-to-br from-[#c69cf7] to-[#9752fe] shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center"
                >
                  <span className="text-4xl sm:text-5xl font-black text-[#ff1f40] drop-shadow-sm">?</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

MemoryGamePage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default MemoryGamePage
