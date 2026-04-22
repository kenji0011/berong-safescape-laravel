import React, { useRef, useState } from "react"
import { Head, Link, usePage } from '@inertiajs/react'
import DashboardLayout from "@/Layouts/DashboardLayout"
import { ArrowLeft, Download, Award, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

import { useAuth } from "@/lib/auth-context"

const CertificatePage = () => {
  const { user } = useAuth() as { user: { name: string } | null }
  const userName = user?.name || 'Future Hero'
  const certificateRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

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
    <div className="min-h-screen relative flex flex-col font-sans bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A] selection:bg-amber-300 selection:text-amber-900">
      <Head title="Your Certificate | SafeScape" />
      
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 -right-20 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl opacity-70 animate-pulse" />
        <div className="absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-orange-400/20 blur-3xl opacity-70" />
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col py-4">
        {/* Header */}
        <div className="absolute top-4 left-4 z-20">
          <Link 
            href="/kids/safescape" 
            className="inline-flex items-center gap-2 text-amber-700 font-bold hover:text-orange-600 transition-all text-sm bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/60 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Modules
          </Link>
        </div>

        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 flex-1 flex flex-col items-center justify-center pt-16 sm:pt-0">
          
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 tracking-tight drop-shadow-sm flex items-center justify-center gap-3">
              <Award className="h-10 w-10 text-amber-500" />
              Congratulations, Hero!
            </h1>
            <p className="text-amber-900/60 font-bold mt-2 text-lg">You've successfully completed your Fire Safety Training!</p>
          </div>

          <div className="w-full bg-white/90 backdrop-blur-2xl border border-white/60 rounded-3xl sm:rounded-[2.5rem] p-3 sm:p-10 shadow-[0_25px_60px_rgba(245,158,11,0.15)] flex flex-col items-center">
            
            <div 
              ref={certificateRef} 
              className="relative w-full max-w-4xl select-none shadow-xl border border-amber-100 bg-white" 
              style={{ aspectRatio: '1123/794', containerType: 'inline-size' }}
            >
              <img 
                src="/safescape_certificate.svg" 
                alt="Certificate Template" 
                className="absolute inset-0 w-full h-full" 
                crossOrigin="anonymous" 
              />
              <div 
                className="absolute inset-x-0 text-center flex justify-center items-center" 
                style={{ top: '50%', transform: 'translateY(-50%)' }}
              >
                <h2 
                  className="font-bold text-[#1a1a2e] uppercase tracking-widest break-words px-4 sm:px-8" 
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
                  className="text-[#333]" 
                  style={{ 
                    fontFamily: "'Alice', 'Georgia', serif",
                    fontSize: 'clamp(0.4rem, 1.8cqw, 1.2rem)'
                  }}
                >
                  {formattedDate}
                </p>
              </div>
            </div>

            {/* Action */}
            <div className="mt-8 flex justify-center w-full">
              <button 
                onClick={handleDownload}
                disabled={downloading}
                className={cn(
                  "px-8 sm:px-12 py-4 rounded-full font-black text-lg transition-all duration-300 shadow-xl flex items-center justify-center gap-3",
                  downloading ? "bg-amber-400 text-amber-900 cursor-wait opacity-80" : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-[0_15px_40px_rgba(245,158,11,0.4)] hover:-translate-y-1 active:translate-y-0"
                )}
              >
                {downloading ? (
                  <><Loader2 className="h-6 w-6 animate-spin" /> Generating PDF...</>
                ) : (
                  <><Download className="h-6 w-6" /> Download Certificate</>
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
