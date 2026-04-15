import React, { useState, useRef } from "react"
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

  const playerRef = useRef<HTMLDivElement>(null)

  const handleVideoSelect = (video: any) => {
    setActiveVideo(video)
    // Scroll to the top of the video player with a slight offset to account for any fixed headers if needed.
    playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

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
    <div className="min-h-screen relative overflow-hidden bg-slate-50">
      
      {/* Ghost Header - floats above content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
        <Link 
          href="/kids" 
          className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#e11d48] border-[2px] sm:border-[3px] border-white text-white font-extrabold px-3 sm:px-6 py-1.5 sm:py-2 rounded-full shadow-[0_3px_0_#9f1239] sm:shadow-[0_4px_0_#9f1239] transition-all hover:-translate-y-0.5 hover:shadow-[0_5px_0_#9f1239] sm:hover:shadow-[0_6px_0_#9f1239] active:translate-y-[3px] sm:active:translate-y-[4px] active:shadow-[0_0px_0_#9f1239] text-[10px] sm:text-sm uppercase tracking-wide"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" strokeWidth={3} />
          Back to Dashboard
        </Link>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* Page Title */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="text-5xl mb-4 drop-shadow-md">🎬</div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight mb-3">
            Fire Safety Videos
          </h1>
          <p className="text-slate-500 font-bold text-lg sm:text-xl">
            Learn fire safety through fun videos!
          </p>
        </div>

        {/* Main Video Player Container */}
        <div ref={playerRef} className="bg-white rounded-3xl border-[4px] border-white shadow-[0_8px_0_#cbd5e1] overflow-hidden mb-16">
          
          {/* Header Bar */}
          <div className="bg-white px-6 py-4 border-b-[4px] border-slate-100 flex items-center gap-4">
            <span className="text-2xl drop-shadow-sm">{activeVideo.icon}</span>
            <h2 className="text-slate-800 font-black text-xl sm:text-2xl tracking-tight">{activeVideo.title}</h2>
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
          <div className="px-6 sm:px-8 py-6 bg-slate-50 border-t-[4px] border-slate-100">
            <p className="text-slate-600 font-bold text-lg leading-relaxed">
              {activeVideo.description}
            </p>
          </div>
        </div>

        {/* More Videos Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8 text-slate-800 font-black text-2xl">
            <div className="bg-[#e11d48] p-2 rounded-xl border-[3px] border-white shadow-[0_4px_0_#9f1239] text-white">
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
                  onClick={() => handleVideoSelect(video)}
                  className={cn(
                    "flex flex-col bg-white rounded-3xl border-[4px] border-white overflow-hidden relative transition-all duration-300 cursor-pointer h-full group",
                    isActive 
                      ? "shadow-[0_0px_0_#cbd5e1] translate-y-[6px]" 
                      : "shadow-[0_6px_0_#cbd5e1] hover:-translate-y-1.5 hover:shadow-[0_10px_0_#cbd5e1] active:translate-y-[6px] active:shadow-[0_0px_0_#cbd5e1]"
                  )}
                >
                  {/* Thumbnail area mimicking YouTube */}
                  <div className="relative w-full h-40 border-b-[3px] border-white overflow-hidden bg-slate-100">
                     <img src={video.thumbnail} alt={video.title} className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
                     <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-300" />
                     {/* Play button overlay */}
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-yellow-400 border-[3px] border-white backdrop-blur-sm p-4 rounded-full shadow-[0_4px_0_#b45309] text-red-600 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                           <Play className="h-6 w-6 fill-current" />
                        </div>
                     </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 bg-yellow-50 bg-opacity-50">
                    <h4 className="font-extrabold text-slate-800 text-lg mb-2">{video.title}</h4>
                    <p className="text-slate-500 font-bold text-sm leading-relaxed flex-1">
                      {video.description}
                    </p>
                    
                    {isActive && (
                      <div className="mt-4 w-full bg-[#e11d48] border-[3px] border-white text-white font-extrabold text-sm py-2 rounded-full shadow-[0_4px_0_#9f1239] flex items-center justify-center gap-2 tracking-wide uppercase">
                        <Tv className="h-4 w-4" /> Now Playing
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="relative overflow-hidden bg-yellow-400 rounded-3xl p-8 sm:p-10 border-[4px] border-white shadow-[0_8px_0_#b45309] mt-16 mb-8 text-center group">
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-20 w-20 bg-[#e11d48] border-[3px] border-white rounded-2xl shadow-[0_4px_0_#9f1239] flex items-center justify-center mb-6 transform rotate-3 group-hover:rotate-12 transition-transform duration-300">
              <Star className="h-10 w-10 text-white fill-white" />
            </div>
            <h3 className="text-white text-3xl font-black mb-3 drop-shadow-md">Great Job Watching!</h3>
            <p className="text-red-900 font-bold text-lg max-w-lg leading-relaxed flex items-center justify-center gap-3">
              Every video makes you smarter about fire safety! Keep learning! <GraduationCap className="h-5 w-5" strokeWidth={3} />
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

VideosPage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default VideosPage
