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
    src: "https://www.youtube.com/embed/J7x5Xih-OPE",
    thumbnail: "https://img.youtube.com/vi/J7x5Xih-OPE/maxresdefault.jpg",
    icon: "🎬"
  })

  const moreVideos = [
    {
      id: "1",
      title: "Fire Safety for Kids",
      description: "Learn important fire safety rules in a fun way!",
      src: "https://www.youtube.com/embed/J7x5Xih-OPE",
      thumbnail: "https://img.youtube.com/vi/J7x5Xih-OPE/maxresdefault.jpg",
      color: "bg-purple-200",
      icon: "🎬"
    },
    {
      id: "2",
      title: "Stop, Drop, and Roll",
      description: "Learn what to do if your clothes catch fire!",
      src: "https://www.youtube.com/embed/8o4wX_V-z8A",
      thumbnail: "https://img.youtube.com/vi/8o4wX_V-z8A/maxresdefault.jpg",
      color: "bg-[#fbcfe8]",
      icon: "🔥"
    },
    {
      id: "3",
      title: "Meet a Firefighter",
      description: "See what firefighters do every day!",
      src: "https://www.youtube.com/embed/dummy_id3", // Replace with real later
      thumbnail: "https://img.youtube.com/vi/dummy_id3/maxresdefault.jpg",
      color: "bg-[#fbcfe8]",
      icon: "🚒"
    }
  ]

  return (
    <div className="min-h-screen bg-[#f3f4f6]" style={{ backgroundImage: "linear-gradient(to bottom, #e2e8f0 0%, #f3f4f6 100%)" }}>
      
      {/* Ghost Header - floats above content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <Link 
          href="/kids" 
          className="inline-flex items-center gap-2 text-slate-600 font-bold hover:text-slate-900 transition-all text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* Page Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="text-4xl mb-4 animate-bounce-slow">🎬</div>
          <h1 className="text-3xl sm:text-4xl font-black text-purple-700 tracking-tight mb-2">
            Fire Safety Videos
          </h1>
          <p className="text-purple-500 font-bold">
            Learn fire safety through fun videos!
          </p>
        </div>

        {/* Main Video Player Container */}
        <div className="bg-white rounded-2xl border-[3px] border-purple-400 shadow-[0_8px_0_0_#c084fc] overflow-hidden mb-12 transform transition-all hover:-translate-y-1 hover:shadow-[0_12px_0_0_#c084fc]">
          
          {/* Header Bar */}
          <div className="bg-[#fdf2f8] px-4 py-3 border-b-2 border-purple-200 flex items-center gap-3">
            <span className="text-xl">{activeVideo.icon}</span>
            <h2 className="text-purple-800 font-black text-lg">{activeVideo.title}</h2>
          </div>

          {/* Video iframe / wrapper */}
          <div className="w-full aspect-video bg-black relative border-b-2 border-purple-100">
            <iframe 
              src={activeVideo.src} 
              className="w-full h-full absolute inset-0"
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              frameBorder="0"
            ></iframe>
          </div>

          {/* Description Footer */}
          <div className="px-6 py-5">
            <p className="text-slate-600 font-bold">
              {activeVideo.description}
            </p>
          </div>
        </div>

        {/* More Videos Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6 text-purple-900 font-black text-xl">
            <Play className="h-5 w-5 text-purple-600" />
            <h3>More Videos to Watch</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {moreVideos.map((video) => {
              const isActive = activeVideo.id === video.id
              return (
                <div 
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className={cn(
                    "bg-[#f0f9ff] rounded-2xl p-4 border-2 shadow-sm cursor-pointer transition-all h-full flex flex-col",
                    isActive 
                      ? "border-purple-400 shadow-[0_4px_0_0_#c084fc] -translate-y-1 bg-white" 
                      : "border-transparent hover:border-purple-200 hover:shadow-md hover:-translate-y-1"
                  )}
                >
                  <div className={cn("h-32 rounded-xl mb-4 flex items-center justify-center text-5xl", video.color)}>
                    {video.icon}
                  </div>
                  <h4 className="font-black text-slate-800 text-base mb-2">{video.title}</h4>
                  <p className="text-slate-500 font-medium text-xs leading-relaxed flex-1">
                    {video.description}
                  </p>
                  
                  {isActive && (
                    <div className="mt-4 flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider">
                      <Play className="h-4 w-4" /> Now Playing
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="bg-[#fffbeb] border-[3px] border-[#fbbf24] rounded-2xl p-6 shadow-sm mt-12 mb-8">
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-[#fcd34d] rounded-full flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-white fill-white" />
            </div>
            <h3 className="text-[#92400e] text-2xl font-black mb-2">Great Job Watching!</h3>
            <p className="text-[#b45309] font-bold text-sm flex items-center justify-center gap-2">
              Every video makes you smarter about fire safety! Keep learning! <GraduationCap className="h-4 w-4" />
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

VideosPage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default VideosPage
