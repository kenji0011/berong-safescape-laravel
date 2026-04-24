import React, { useEffect, useState } from "react"
import { Head, Link, router } from '@inertiajs/react'
import DashboardLayout from "@/Layouts/DashboardLayout"
import { ArrowLeft, BookOpen, ChevronRight, Flame, Trophy, ClipboardCheck, PartyPopper, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

const ModuleFivePage = ({ moduleNum }: { moduleNum: number }) => {
  const { user } = useAuth()
  const currentModule = moduleNum || 5
  const [moduleCompleted, setModuleCompleted] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)

  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;

      const data = e.data;
      if (data && data.type === 'SAFESCAPE_SECTION_COMPLETE') {
        try {
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

          // Show completion banner when Module 5 is done
          if (data.completed && data.moduleNum === 5) {
            setModuleCompleted(true)
          }
        } catch (error) {
          console.error("Failed to sync progress:", error)
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    setIframeLoading(false);
    const iframe = e.target as HTMLIFrameElement;
    try {
      if (!iframe.contentWindow) return;
      const iframeDoc = iframe.contentWindow.document;

      iframeDoc.body.style.backgroundColor = 'transparent'; 
      iframeDoc.documentElement.style.overflow = 'hidden';

      const nav = iframeDoc.querySelector('.ss-nav') as HTMLElement;
      if (nav) nav.style.display = 'none';

      // Dynamically resize iframe to content height without breaking scroll momentum
      const resizeIframe = () => {
        if (!iframeDoc.documentElement) return;
        
        const main = iframeDoc.querySelector('main');
        const footer = iframeDoc.querySelector('footer');
        
        if (main && footer) {
          const winScroll = iframeDoc.defaultView?.scrollY || 0;
          const bottom = Math.max(
            main.getBoundingClientRect().bottom + winScroll,
            footer.getBoundingClientRect().bottom + winScroll
          );
          
          const newHeight = bottom + 20; // 20px safety buffer
          const currentHeight = parseInt(iframe.style.height) || 0;
          
          if (Math.abs(newHeight - currentHeight) > 10) {
            iframe.style.height = `${newHeight}px`;
          }
        } else {
          // Fallback if structure is missing
          iframe.style.height = `${iframeDoc.body.scrollHeight}px`;
        }
      };

      // Check if the congratulations/completion screen appeared inside the iframe
      const checkForCompletion = () => {
        const examResult = iframeDoc.getElementById('exam-result');
        const isExamPassed = examResult && !examResult.classList.contains('hidden') && 
                             iframeDoc.getElementById('result-title')?.innerText?.includes('CONGRATULATIONS');
                             
        const alreadyInjected = iframeDoc.getElementById('post-test-cta');
        
        if (isExamPassed && !alreadyInjected) {
          setModuleCompleted(true);
          
          const certificateBtn = iframeDoc.getElementById('btn-view-cert');
          const btnContainer = certificateBtn?.parentElement;
          
          if (btnContainer) {
            const ctaBtn = iframeDoc.createElement('a');
            ctaBtn.id = 'post-test-cta';
            ctaBtn.href = '/assessment/post-test';
            ctaBtn.className = 'bg-yellow-400 text-red-600 font-black px-6 py-3 sm:px-10 sm:py-4 text-sm sm:text-base rounded-full border-[3px] border-white shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_0px_0_#b45309] transition-all uppercase tracking-wide text-center w-full sm:w-auto block whitespace-nowrap';
            ctaBtn.innerHTML = `Take Post-Test <i class="fa-solid fa-arrow-right ml-2"></i>`;
            
            btnContainer.appendChild(ctaBtn);
            resizeIframe();
          }
        }
      };

      resizeIframe();
      const observer = new MutationObserver(() => {
        resizeIframe();
        checkForCompletion();
      });
      observer.observe(iframeDoc.body, { childList: true, subtree: true, attributes: true });

      // Also check immediately in case completion is already shown
      checkForCompletion();

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
              Status: <span className={cn("font-black ml-1", moduleCompleted ? "text-green-500" : "text-[#ff4b3e]")}>{moduleCompleted ? "Completed ✓" : "In Progress"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Module 5 Completion Banner ── */}
      {moduleCompleted && (user?.postTestScore === null || user?.postTestScore === undefined) && (
        <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 px-4 sm:px-6 py-6 sm:py-8 relative overflow-hidden animate-in slide-in-from-top fade-in duration-500">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
          <div className="max-w-4xl mx-auto relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-4 flex-1">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 border-2 border-white/30">
                <Trophy className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-200" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">🎉 All Modules Complete!</h3>
                <p className="text-white/80 text-xs sm:text-sm font-bold mt-0.5">You've finished all 5 fire safety modules. Take the final Post-Test to earn your certificate!</p>
              </div>
            </div>
            <button
              onClick={() => router.visit('/assessment/post-test')}
              className="w-full sm:w-auto bg-white hover:bg-yellow-50 text-green-700 font-black px-6 py-3.5 rounded-full border-2 border-white border-b-[4px] border-b-green-200 active:border-b-2 active:translate-y-[2px] shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base shrink-0 uppercase tracking-wider"
            >
              <ClipboardCheck className="h-5 w-5" />
              Take Post-Test
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Post-Test Completed Banner ── */}
      {moduleCompleted && user?.postTestScore !== null && user?.postTestScore !== undefined && (
        <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-4 sm:px-6 py-6 sm:py-8 relative overflow-hidden animate-in slide-in-from-top fade-in duration-500">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
          <div className="max-w-4xl mx-auto relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-4 flex-1">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 border-2 border-white/30">
                <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-blue-200" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">🎉 Course Completed!</h3>
                <p className="text-white/80 text-xs sm:text-sm font-bold mt-0.5">You've successfully finished your fire safety training. View your official certificate!</p>
              </div>
            </div>
            <Link
              href="/kids/certificate"
              className="w-full sm:w-auto bg-white hover:bg-blue-50 text-indigo-700 font-black px-6 py-3.5 rounded-full border-2 border-white border-b-[4px] border-b-blue-200 active:border-b-2 active:translate-y-[2px] shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base shrink-0 uppercase tracking-wider"
            >
              <Trophy className="h-5 w-5 text-yellow-500" />
              View Certificate
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Dark Module Content Area ── */}
      <div className="flex-1 bg-blue-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] flex flex-col w-full relative">
        
        {/* Skeleton Loader */}
        {iframeLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pt-10 pb-20 px-4 pointer-events-none">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-sm border-[3px] border-blue-200 flex items-center justify-center mb-6 animate-bounce">
              <Flame className="h-8 w-8 sm:h-10 sm:w-10 text-[#ff4b3e] animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-3 w-full max-w-2xl px-2 sm:px-6">
              <div className="h-6 sm:h-10 w-48 sm:w-64 bg-blue-200/50 rounded-full animate-pulse"></div>
              <div className="h-4 sm:h-5 w-64 sm:w-96 bg-blue-200/50 rounded-full animate-pulse delay-75 mb-6"></div>
              
              <div className="w-full space-y-4">
                <div className="h-48 sm:h-64 w-full bg-white/60 rounded-[2rem] border-[3px] border-blue-200/50 animate-pulse delay-150"></div>
                <div className="h-32 sm:h-48 w-full bg-white/60 rounded-[2rem] border-[3px] border-blue-200/50 animate-pulse delay-200"></div>
              </div>
            </div>
            <p className="mt-8 text-blue-400 font-bold tracking-widest uppercase text-sm animate-pulse delay-300">Loading Module Content...</p>
          </div>
        )}

        <iframe 
          src={`/modules/module_${currentModule}/index.html`}
          className={cn(
            "w-full border-none m-0 p-0 transition-opacity duration-700",
            iframeLoading ? "opacity-0" : "opacity-100"
          )}
          style={{ minHeight: '800px' }}
          onLoad={handleIframeLoad}
          loading="eager"
          allow="fullscreen; autoplay; encrypted-media"
          title={`SafeScape Module ${currentModule}`}
        />
      </div>
    </div>
  )
}

ModuleFivePage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default ModuleFivePage

