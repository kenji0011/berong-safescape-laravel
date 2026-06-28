import React, { useRef, useState } from "react"
import { Head, Link, usePage } from '@inertiajs/react'
import DashboardLayout from "@/Layouts/DashboardLayout"
import { ArrowLeft, Download, Award, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { playSound } from '@/lib/audio'
import { useAuth } from "@/lib/auth-context"

const CertificatePage = () => {
  const { user } = useAuth() as { user: { name: string } | null }
  const userName = user?.name || 'Future Hero'
  const certificateRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  // Play victory celebration sound on load
  React.useEffect(() => {
    playSound('/sounds/wingame.mp3', 'notification')
  }, [])

  // Format date as "Given this Xth day of Month, Year"
  const d = new Date()
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const day = d.getDate()
  const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"]
      const v = n % 100
      return n + (s[(v - 20) % 10] || s[v] || s[0])
  }
  const formattedDate = `Given this ${getOrdinal(day)} day of ${monthNames[d.getMonth()]}, ${d.getFullYear()}`

  const handleDownload = async () => {
    if (!certificateRef.current) return
    playSound('/sounds/click.mp3', 'general')
    try {
      setDownloading(true)
      const [{ toPng }, { default: JsPDF }] = await Promise.all([
          import("html-to-image"),
          import("jspdf"),
      ]);

      const dataUrl = await toPng(certificateRef.current, { 
        quality: 1.0, 
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        filter: () => true,
        style: {
            transform: 'none',
            margin: '0',
        }
      })
      const pdf = new JsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`SafeScape_Certificate_${userName.replace(/\s+/g, '_')}.pdf`)
    } catch (err) {
      console.error('Failed to generate PDF', err)
      alert("Failed to download certificate. Please try again.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="-mt-[104px] sm:-mt-[120px] pt-[104px] sm:pt-[120px] min-h-[calc(100vh+104px)] sm:min-h-[calc(100vh+120px)] relative flex flex-col font-sans bg-background selection:bg-amber-300 selection:text-amber-900 transition-colors duration-500">
      <Head title="Your Certificate | SafeScape" />
      
      {/* Decorative Background - Premium Ambient Glows */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-amber-400/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-orange-400/20 to-transparent blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col py-4">
        {/* Header */}
        <div className="absolute top-4 left-4 z-20">
          <Link 
            href="/kids/safescape" 
            className="inline-flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold hover:text-orange-600 dark:hover:text-orange-400 transition-all text-sm bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-white/60 dark:border-slate-700/60 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Modules
          </Link>
        </div>

        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex-1 flex flex-col items-center justify-start sm:justify-center pt-24 sm:pt-4 pb-6">
          
          <div className="text-center mb-6 sm:mb-6 animate-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-600 dark:text-amber-400 tracking-tight drop-shadow-sm flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-2 sm:mb-3">
              <div className="p-2 sm:p-3 bg-amber-100 dark:bg-amber-900/40 rounded-full sm:rounded-2xl shadow-inner inline-flex">
                <Award className="h-10 w-10 sm:h-10 sm:w-10 text-amber-500" />
              </div>
              <span>Congratulations, Hero!</span>
            </h1>
            <p className="text-amber-900/70 dark:text-amber-200/80 font-bold text-sm sm:text-lg max-w-2xl mx-auto transition-colors px-4">
              You've successfully completed your Fire Safety Training. We are proud to present you with this official certificate!
            </p>
          </div>

          <div className="w-full bg-white dark:bg-slate-900 border-[3px] sm:border-[4px] border-amber-100 dark:border-slate-800 rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 lg:p-8 shadow-2xl flex flex-col items-center transition-all duration-500 animate-in zoom-in-95 duration-700 delay-150">
            
            <div className="w-full max-w-3xl mx-auto bg-amber-50 dark:bg-slate-950 rounded-[1.5rem] sm:rounded-[1.5rem] p-2 sm:p-4 shadow-inner border-2 border-amber-100 dark:border-slate-800 mb-6 sm:mb-6">
              <div 
                ref={certificateRef} 
                className="relative w-full select-none shadow-[0_10px_40px_rgba(0,0,0,0.15)] border-[3px] border-white dark:border-slate-800 bg-white rounded-lg sm:rounded-xl overflow-hidden group hover:scale-[1.01] transition-transform duration-500" 
                style={{ aspectRatio: '1123/794', containerType: 'inline-size' }}
              >
                <img 
                  src="/safescape_certificate.svg" 
                  alt="Certificate Template" 
                  className="absolute inset-0 w-full h-full object-cover" 
                  crossOrigin="anonymous" 
                />
                <div 
                  className="absolute inset-x-0 text-center flex justify-center items-center" 
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                >
                  <h2 
                    className="font-bold text-[#1a1a2e] uppercase tracking-widest break-words px-4 sm:px-8 drop-shadow-sm" 
                    style={{ 
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: 'clamp(0.75rem, 5cqw, 3.5rem)'
                    }}
                  >
                    {userName}
                  </h2>
                </div>
                <div 
                  className="absolute inset-x-0 text-center flex justify-center items-center" 
                  style={{ top: '78%', transform: 'translateY(-50%)' }}
                >
                  <p 
                    className="text-[#333] font-medium" 
                    style={{ 
                      fontFamily: "'Alice', 'Georgia', serif",
                      fontSize: 'clamp(0.4rem, 1.8cqw, 1.2rem)'
                    }}
                  >
                    {formattedDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="flex justify-center w-full max-w-md mx-auto">
              <button 
                onClick={handleDownload}
                disabled={downloading}
                className={cn(
                  "w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-full font-black text-base sm:text-xl transition-all duration-300 flex items-center justify-center gap-3 border-b-[6px] active:border-b-0 active:translate-y-[6px]",
                  downloading 
                    ? "bg-amber-300 text-amber-800 border-amber-400 cursor-wait opacity-90" 
                    : "bg-amber-500 hover:bg-amber-400 text-white border-amber-700 shadow-[0_10px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_10px_30px_rgba(245,158,11,0.4)]"
                )}
              >
                {downloading ? (
                  <><Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" /> Generating PDF...</>
                ) : (
                  <><Download className="h-6 w-6 sm:h-8 sm:w-8" /> Download Certificate</>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

CertificatePage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default CertificatePage
