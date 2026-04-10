import React, { useState } from "react"
import { Link } from '@inertiajs/react'
import { ArrowLeft, Play, Tv, Star, GraduationCap } from "lucide-react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import { cn } from "@/lib/utils"

const VideosPage = () => {
  const [activeVideo, setActiveVideo] = useState({
    id: "1",
    title: "Fire Safety for Kids",
    description: "Learn important fire safety rules in a fun way!",
    src: "https://www.youtube.com/embed/AWHGdWOI4kw",
    thumbnail: "https://img.youtube.com/vi/AWHGdWOI4kw/maxresdefault.jpg",
    icon: "🎬"
  })

  const moreVideos = [
    {
      id: "1",
      title: "Fire Safety for Kids",
      description: "Learn important fire safety rules in a fun way!",
      src: "https://www.youtube.com/embed/AWHGdWOI4kw",
      thumbnail: "https://img.youtube.com/vi/AWHGdWOI4kw/maxresdefault.jpg",
      color: "bg-purple-200",
      icon: "🎬"
    },
    {
      id: "2",
      title: "Stop, Drop, and Roll",
      description: "Learn what to do if your clothes catch fire!",
      src: "https://www.youtube.com/embed/ZlB9q3E-RCI",
      thumbnail: "https://img.youtube.com/vi/ZlB9q3E-RCI/maxresdefault.jpg",
      color: "bg-[#fbcfe8]",
      icon: "🔥"
    },
    {
      id: "3",
      title: "Meet a Firefighter",
      description: "See what firefighters do every day!",
      src: "https://www.youtube.com/embed/5_lGysdHLFQ",
      thumbnail: "https://img.youtube.com/vi/5_lGysdHLFQ/maxresdefault.jpg",
      color: "bg-[#fbcfe8]",
      icon: "🚒"
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#fdf4ff] via-[#f3e8ff] to-[#e0e7ff] selection:bg-fuchsia-300 selection:text-fuchsia-900">
      
      {/* Decorative Blob Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-[#d946ef]/20 to-[#8b5cf6]/20 blur-3xl" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[50%] rounded-full bg-gradient-to-bl from-[#ec4899]/20 to-[#6366f1]/20 blur-3xl delay-700 duration-1000 animate-pulse" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[40%] rounded-full bg-gradient-to-tr from-[#8b5cf6]/20 to-[#3b82f6]/20 blur-3xl opacity-60" />
      </div>

      {/* Ghost Header - floats above content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <Link 
          href="/kids" 
          className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-[#d946ef] transition-all text-sm bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/60 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* Page Title */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="text-5xl mb-4 animate-bounce-slow drop-shadow-lg">🎬</div>
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] tracking-tight mb-3 drop-shadow-sm">
            Fire Safety Videos
          </h1>
          <p className="text-slate-600 font-bold text-lg sm:text-xl">
            Learn fire safety through fun videos!
          </p>
        </div>

        {/* Main Video Player Container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-[0_20px_60px_rgba(139,92,246,0.15)] overflow-hidden mb-16 transform transition-all duration-500 hover:shadow-[0_25px_60px_rgba(139,92,246,0.25)]">
          
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-[#fdf4ff] to-white/50 px-6 py-4 border-b border-purple-100/50 flex items-center gap-4">
            <span className="text-2xl drop-shadow-sm">{activeVideo.icon}</span>
            <h2 className="text-[#6b21a8] font-black text-xl sm:text-2xl tracking-tight">{activeVideo.title}</h2>
          </div>

          {/* Video iframe / wrapper */}
          <div className="w-full aspect-video bg-slate-900 relative">
            <iframe 
              src={activeVideo.src} 
              className="w-full h-full absolute inset-0 shadow-inner"
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              frameBorder="0"
            ></iframe>
          </div>

          {/* Description Footer */}
          <div className="px-6 sm:px-8 py-6 bg-white/50">
            <p className="text-slate-600 font-medium text-lg leading-relaxed">
              {activeVideo.description}
            </p>
          </div>
        </div>

        {/* More Videos Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8 text-slate-800 font-black text-2xl">
            <div className="bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] p-2 rounded-xl shadow-md text-white">
              <Play className="h-5 w-5 fill-white" />
            </div>
            <h3>More Videos to Watch</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {moreVideos.map((video) => {
              const isActive = activeVideo.id === video.id
              return (
                <div 
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className={cn(
                    "rounded-[2rem] p-5 border cursor-pointer transition-all duration-300 h-full flex flex-col group relative overflow-hidden",
                    isActive 
                      ? "border-[#d946ef]/40 shadow-[0_10px_30px_rgba(217,70,239,0.2)] -translate-y-2 bg-gradient-to-b from-[#fdf4ff] to-white z-10 ring-2 ring-[#d946ef]/20" 
                      : "border-white/60 bg-white/60 backdrop-blur-lg hover:border-[#8b5cf6]/30 hover:shadow-[0_15px_35px_rgba(139,92,246,0.15)] hover:-translate-y-2"
                  )}
                >
                  {/* Thumbnail area mimicking YouTube */}
                  <div className="relative w-full h-40 rounded-xl mb-5 overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                     <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
                     <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                     {/* Play button overlay */}
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-lg text-[#d946ef] transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                           <Play className="h-6 w-6 fill-current" />
                        </div>
                     </div>
                  </div>

                  <h4 className="font-extrabold text-slate-800 text-lg mb-2 group-hover:text-[#8b5cf6] transition-colors">{video.title}</h4>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed flex-1">
                    {video.description}
                  </p>
                  
                  {isActive && (
                    <div className="mt-5 flex items-center justify-center gap-2 text-white bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md">
                      <Tv className="h-4 w-4" /> Now Playing
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#fef3c7] to-[#fef08a] rounded-[2rem] p-8 sm:p-10 shadow-lg border border-yellow-200/50 mt-16 mb-8 text-center group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-yellow-300/30 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-orange-300/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-20 w-20 bg-gradient-to-br from-[#f59e0b] to-[#ea580c] rounded-2xl shadow-xl flex items-center justify-center mb-6 transform rotate-3 hover:rotate-12 transition-transform duration-300">
              <Star className="h-10 w-10 text-white fill-white" />
            </div>
            <h3 className="text-[#9a3412] text-3xl font-black mb-3 drop-shadow-sm">Great Job Watching!</h3>
            <p className="text-[#c2410c] font-bold text-lg max-w-lg leading-relaxed flex items-center justify-center gap-3">
              Every video makes you smarter about fire safety! Keep learning! <GraduationCap className="h-5 w-5" />
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

VideosPage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default VideosPage
