import React, { useEffect, useState } from "react"
import { Head, Link } from '@inertiajs/react'
import DashboardLayout from "@/Layouts/DashboardLayout"
import { ArrowLeft, BookOpen, Flame, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

const ModuleTwoPage = ({ moduleNum }: { moduleNum: number }) => {
  const currentModule = moduleNum || 2

  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;

      const data = e.data;
      if (data && data.type === 'SAFESCAPE_SECTION_COMPLETE') {
        try {
          // Send progress payload to the backend
          await fetch("/api/kids/safescape", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "X-XSRF-TOKEN": document.cookie.match(new RegExp("(^| )XSRF-TOKEN=([^;]+)"))?.[2] ? decodeURIComponent(document.cookie.match(new RegExp("(^| )XSRF-TOKEN=([^;]+)"))![2]) : ""
            },
            body: JSON.stringify({
              moduleNum: data.moduleNum,
              sectionData: data.sectionData,
              completed: data.completed
            }),
          })
        } catch (error) {
          console.error("Failed to sync progress:", error)
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    const iframe = e.target as HTMLIFrameElement;
    try {
      if (!iframe.contentWindow) return;
      const iframeDoc = iframe.contentWindow.document;

      iframeDoc.body.style.backgroundColor = 'transparent'; 
      iframeDoc.documentElement.style.overflow = 'hidden'; // Hide inner scrollbar

      const nav = iframeDoc.querySelector('.ss-nav') as HTMLElement;
      if (nav) nav.style.display = 'none';

      // Dynamically resize iframe to content height
      const resizeIframe = () => {
        setTimeout(() => {
          if (!iframeDoc.documentElement) return;
          const newHeight = Math.max(iframeDoc.body.scrollHeight, iframeDoc.documentElement.scrollHeight);
          const currentHeight = parseInt(iframe.style.height) || 0;
          if (Math.abs(newHeight - currentHeight) > 5) {
            iframe.style.height = `${newHeight}px`;
          }
        }, 50);
      };

      resizeIframe();
      
      const observer = new MutationObserver(resizeIframe);
      observer.observe(iframeDoc.body, { childList: true, subtree: true, attributes: true });

      const links = iframeDoc.querySelectorAll('a');
      links.forEach(link => {
        link.addEventListener('click', (ev) => {
          ev.preventDefault();
          const href = link.getAttribute('href');
          if (!href) return;
          
          if (href.includes('index.html') && href.includes('../')) {
            const match = href.match(/module_(\d+)/);
            if (match) {
              window.parent.location.href = `/kids/safescape/${match[1]}`;
            } else {
              window.parent.location.href = '/kids/safescape';
            }
          }
        });
      });
    } catch(err) {
      console.warn("Iframe manipulation restriction or error", err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Head title={`Module ${currentModule} | SafeScape`} />

      {/* ── Sub Header ── */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8 shadow-sm z-20 relative">
        <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/kids/safescape" className="inline-flex items-center justify-center gap-2 p-2 sm:px-4 sm:py-2 bg-white rounded-full text-slate-700 font-bold hover:text-slate-900 border-[3px] border-slate-200 shadow-[0_3px_0_#cbd5e1] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_0px_0_#cbd5e1] transition-all text-sm whitespace-nowrap"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Back to Dashboard</span></Link>
            <div className="hidden sm:flex items-center gap-2">
              <Flame className="h-5 w-5 text-[#ff4b3e]" />
              <h1 className="text-xl font-black text-slate-800">SafeScape Fire Safety Course</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-6">
            {/* Module dots */}
            <div className="flex items-center gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <React.Fragment key={n}>
                  <Link
                    href={`/kids/safescape/${n}`}
                    className={cn(
                      "h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-black transition-all shrink-0 border-[3px] focus:outline-none",
                      n === currentModule
                        ? "bg-[#ff4b3e] text-white border-white shadow-[0_4px_0_#991b1b] -translate-y-0.5 pointer-events-none"
                        : "bg-white text-slate-400 border-slate-200 shadow-[0_3px_0_#cbd5e1] hover:-translate-y-0.5 hover:shadow-[0_4px_0_#cbd5e1] hover:text-slate-600 active:translate-y-1 active:shadow-[0_0px_0_#cbd5e1]"
                    )}
                  >{n}</Link>
                  {n < 5 && <div className="h-0.5 w-2 sm:w-6 bg-slate-200 rounded shrink-0" />}
                </React.Fragment>
              ))}
            </div>
            {/* Progress */}
            <div className="text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 whitespace-nowrap hidden lg:block">
              Status: <span className="text-[#ff4b3e] font-black ml-1">In Progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dark Module Content Area ── */}
      <div className="flex-1 bg-blue-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] flex flex-col w-full">
        <iframe 
          src={`/modules/module_${currentModule}/index.html`}
          className="w-full border-none m-0 p-0"
          style={{ minHeight: '3000px' }}
          onLoad={handleIframeLoad}
          loading="eager"
          allow="fullscreen; autoplay; encrypted-media"
          title={`SafeScape Module ${currentModule}`}
        />
      </div>
    </div>
  )
}

ModuleTwoPage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default ModuleTwoPage
