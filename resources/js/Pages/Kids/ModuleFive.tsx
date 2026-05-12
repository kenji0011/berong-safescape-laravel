import React, { useEffect, useState } from "react"
import { Head, Link, router } from '@inertiajs/react'
import DashboardLayout from "@/Layouts/DashboardLayout"
import { ArrowLeft, BookOpen, ChevronRight, Flame, Trophy, ClipboardCheck, PartyPopper, CheckCircle } from "lucide-react"
import axios from "axios"
import { cn } from "@/lib/utils"
import { ModuleNavigation } from "@/Components/module-navigation"
import { useAuth } from "@/lib/auth-context"

const ModuleFivePage = ({ moduleNum }: { moduleNum: number }) => {
  const { user } = useAuth()
  const currentModule = moduleNum || 5
  const [moduleCompleted, setModuleCompleted] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullProgress, setFullProgress] = useState<any>(null)
  const completedRef = React.useRef(moduleCompleted)
  const badgeAwardedRef = React.useRef(false)
  const quizSubmittedRef = React.useRef(false)
  const syncingRef = React.useRef(false)
  const pendingSyncRef = React.useRef<any>(null)
  const iframeRef = React.useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    completedRef.current = moduleCompleted
  }, [moduleCompleted])

  // Award badge automatically when module is completed
  useEffect(() => {
    if (moduleCompleted && !badgeAwardedRef.current) {
      badgeAwardedRef.current = true
      const awardBadge = async () => {
        try {
          await axios.post('/api/badges/award', {
            badge_id: `module_${currentModule}`,
            badge_name: 'Home Guard',
            badge_icon: '🏘️'
          });
        } catch (err: any) {
          console.error("Failed to award badge automatically:", err.response?.data || err.message)
        }
      }
      awardBadge()
    }
  }, [moduleCompleted, currentModule])

  const loadState = async () => {
    try {
      const response = await axios.get("/api/kids/safescape")
      const data = response.data
      setFullProgress(data)
      if (data.completedModules?.includes(currentModule)) {
        setModuleCompleted(true)
      }
    } catch (err) {
      console.error("Failed to load state:", err)
    }
  }

  useEffect(() => {
    loadState()
  }, [currentModule]);

  // Send progress to iframe when both are ready
  useEffect(() => {
    if (fullProgress && !iframeLoading && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'SAFESCAPE_INITIALIZE_PROGRESS',
        progress: fullProgress
      }, '*');
    }
  }, [fullProgress, iframeLoading]);

  const processSectionSync = async (data: any) => {
    try {
      if (data.completed && completedRef.current) return;

      syncingRef.current = true;
      console.log("Syncing section complete:", data);
      const response = await axios.post("/api/kids/safescape", {
        moduleNum: data.moduleNum,
        sectionData: data.sectionData,
        completed: data.completed
      });

      console.log("Progress synced successfully for module", data.moduleNum, response.data);

      if (data.completed && !completedRef.current) {
        console.log(`Module ${currentModule} marked as completed!`);
        setModuleCompleted(true)
        loadState()
      }
    } catch (error: any) {
      console.error("Failed to sync progress:", error.response?.data || error.message)
    } finally {
      syncingRef.current = false;

      // Process any queued message that arrived while we were syncing
      const pending = pendingSyncRef.current;
      if (pending) {
        pendingSyncRef.current = null;
        await processSectionSync(pending);
      }
    }
  };

  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;

      const data = e.data;
      if (!data) return;

      // 1. Iframe is ready - send initial progress
      if (data.type === 'SAFESCAPE_IFRAME_READY') {
        if (iframeRef.current?.contentWindow && fullProgress) {
          iframeRef.current.contentWindow.postMessage({
            type: 'SAFESCAPE_INITIALIZE_PROGRESS',
            progress: fullProgress
          }, '*');
        }
      }

      // 2. Section completed - sync to backend
      if (data.type === 'SAFESCAPE_SECTION_COMPLETE' && data.moduleNum === currentModule) {
        if (syncingRef.current) {
          // Queue the latest message instead of dropping it
          pendingSyncRef.current = data;
          return;
        }
        await processSectionSync(data);
      }

      // 3. Quiz submission
      if (data.type === 'SAFESCAPE_QUIZ_SUBMIT' && data.moduleNum === currentModule) {
        if (quizSubmittedRef.current || (moduleCompleted && data.score === data.maxScore)) return;
        
        try {
          quizSubmittedRef.current = true;
          console.log("Submitting quiz result:", data);
          const res = await axios.post("/api/kids/quiz", {
            quizType: `module_${data.moduleNum}_quiz`,
            score: data.score,
            maxScore: data.maxScore
          });

          console.log("Quiz result submitted. Result:", res.data);
          if (res.data.passed) {
             if (!completedRef.current) {
               setModuleCompleted(true);
               loadState(); 
             }
          } else {
             // If they failed, allow them to submit again later
             quizSubmittedRef.current = false;
          }
        } catch (error: any) {
          console.error("Failed to submit quiz:", error.response?.data || error.message);
          quizSubmittedRef.current = false;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [fullProgress, currentModule]);

  // Sync theme reactively
  useEffect(() => {
    const syncTheme = () => {
      const iframeWindow = iframeRef.current?.contentWindow;
      if (!iframeWindow) return;
      
      try {
        const iframeDoc = iframeWindow.document;
        if (!iframeDoc || !iframeDoc.documentElement || !iframeDoc.body) return;

        const isDark = document.documentElement.classList.contains('dark');
        
        if (isDark) {
          iframeDoc.documentElement.classList.add('dark');
          iframeDoc.body.classList.add('dark');
        } else {
          iframeDoc.documentElement.classList.remove('dark');
          iframeDoc.body.classList.remove('dark');
        }
      } catch (e) {
        // Ignore cross-origin errors or other iframe issues
      }
    };

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    const interval = setInterval(syncTheme, 1000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [iframeLoading]);

  // Force iframe to show as completed when moduleCompleted state becomes true
  useEffect(() => {
    if (moduleCompleted && !iframeLoading && iframeRef.current?.contentWindow) {
      const forceComplete = () => {
        const iframeWindow = iframeRef.current?.contentWindow;
        if (!iframeWindow) return;
        const iframeDoc = iframeWindow.document;
        const examResult = iframeDoc.getElementById('exam-result');
        // Only force completion if the user hasn't naturally finished the quiz
        if (examResult && examResult.classList.contains('hidden')) {
          forceIframeQuizCompleted(iframeWindow);
        }
      };

      forceComplete();
      setTimeout(forceComplete, 500);
      setTimeout(forceComplete, 1500);
    }
  }, [moduleCompleted, iframeLoading]);

  const forceIframeQuizCompleted = (iframeWindow: Window) => {
    try {
      const iframeDoc = iframeWindow.document;
      const iframeAny = iframeWindow as any;
      
      if (typeof iframeAny.localState !== 'undefined') {
        iframeAny.localState.finalExamPassed = true;
        iframeAny.localState.certified = true;
        iframeAny.localState.videoWatched = true;
      }
      
      // Module 5 uses loadExam() not renderQuiz()
      if (typeof iframeAny.loadExam === 'function') {
        iframeAny.loadExam();
      }
      
      if (typeof iframeAny.updateSectionStates === 'function') {
        iframeAny.updateSectionStates();
      }
      
      const styleId = 'safescape-completion-style';
      if (!iframeDoc.getElementById(styleId)) {
        const style = iframeDoc.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          .ss-completion-card { margin-top: 2rem !important; }
        `;
        iframeDoc.head.appendChild(style);
      }
    } catch (e) {};
  };

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
        const text = iframeDoc.body.innerText;
        const isPassedText = text.includes('MARSHAL CERTIFIED') || text.includes('CONGRATULATIONS') || text.includes('PASSED');
        
        const examResult = iframeDoc.getElementById('exam-result');
        const isExamPassed = isPassedText || (examResult && !examResult.classList.contains('hidden') && 
                             iframeDoc.getElementById('result-title')?.innerText?.includes('CONGRATULATIONS'));
                             
        const alreadyInjected = iframeDoc.getElementById('post-test-cta');
        
        if (isExamPassed && !completedRef.current) {
          setModuleCompleted(true);
        }

        if (isExamPassed && !alreadyInjected) {
          const certificateBtn = iframeDoc.getElementById('btn-view-cert');
          const btnContainer = certificateBtn?.parentElement;
          
          if (btnContainer) {
            const ctaBtn = iframeDoc.createElement('a');
            ctaBtn.id = 'post-test-cta';
            ctaBtn.href = '/assessment/post-test';
            ctaBtn.target = '_top';
            ctaBtn.className = 'ss-btn-premium ss-btn-gold block whitespace-nowrap';
            ctaBtn.innerHTML = `Take Post-Test <i class="fa-solid fa-arrow-right"></i>`;
            
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

      checkForCompletion();

      const resizeInterval = setInterval(() => {
        resizeIframe();
        checkForCompletion();
      }, 1000);

      iframe.addEventListener('beforeunload', () => clearInterval(resizeInterval), { once: true });

      const links = iframeDoc.querySelectorAll('a');
      links.forEach(link => {
        link.addEventListener('click', (ev) => {
          const href = link.getAttribute('href');
          if (!href) return;
          
          if ((href === 'index.html' || href === './index.html') && completedRef.current) {
            ev.preventDefault();
            return;
          }

          if (href.includes('index.html')) {
            ev.preventDefault();
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
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans flex flex-col transition-colors duration-500">
      <Head title={`Module ${currentModule} | SafeScape`} />

      {/* ── Sub Header ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-6 lg:px-8 shadow-sm z-20 relative transition-colors">
        <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/kids/safescape" className="inline-flex items-center justify-center gap-2 p-2 sm:px-4 sm:py-2 bg-white dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300 font-bold hover:text-slate-900 dark:hover:text-white border-[3px] border-slate-200 dark:border-slate-700 shadow-[0_3px_0_#cbd5e1] dark:shadow-[0_3px_0_#0f172a] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all text-sm whitespace-nowrap"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Back to Dashboard</span></Link>
            <div className="hidden sm:flex items-center gap-2">
              <Flame className="h-5 w-5 text-[#ff4b3e]" />
              <h1 className="text-xl font-black text-slate-800 dark:text-white transition-colors">SafeScape Fire Safety Course</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-6">
            {/* Module dots */}
            <ModuleNavigation currentModule={currentModule} completedModules={fullProgress?.completedModules || []} />
            {/* Progress */}
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-nowrap hidden lg:block transition-colors">
              Status: <span className={cn("font-black ml-1", moduleCompleted ? "text-green-500" : "text-[#ff4b3e]")}>{moduleCompleted ? "Completed ✓" : "In Progress"}</span>
            </div>
          </div>
        </div>
      </div>


      {/* ── Dark Module Content Area ── */}
      <div className="flex-1 bg-white dark:bg-slate-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] flex flex-col w-full relative transition-colors">
        
        {/* Skeleton Loader */}
        {iframeLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pt-10 pb-20 px-4 pointer-events-none transition-colors">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border-[3px] border-blue-200 dark:border-slate-800 flex items-center justify-center mb-6 animate-bounce">
              <Flame className="h-8 w-8 sm:h-10 sm:w-10 text-[#ff4b3e] animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-3 w-full max-w-2xl px-2 sm:px-6">
              <div className="h-6 sm:h-10 w-48 sm:w-64 bg-blue-200/50 dark:bg-slate-800/50 rounded-full animate-pulse"></div>
              <div className="h-4 sm:h-5 w-64 sm:w-96 bg-blue-200/50 dark:bg-slate-800/50 rounded-full animate-pulse delay-75 mb-6"></div>
              
              <div className="w-full space-y-4">
                <div className="h-48 sm:h-64 w-full bg-white/60 dark:bg-slate-900/60 rounded-[2rem] border-[3px] border-blue-200/50 dark:border-slate-800/50 animate-pulse delay-150"></div>
                <div className="h-32 sm:h-48 w-full bg-white/60 dark:bg-slate-900/60 rounded-[2rem] border-[3px] border-blue-200/50 dark:border-slate-800/50 animate-pulse delay-200"></div>
              </div>
            </div>
            <p className="mt-8 text-blue-400 dark:text-slate-500 font-bold tracking-widest uppercase text-sm animate-pulse delay-300">Loading Module Content...</p>
          </div>
        )}

        <iframe 
          ref={iframeRef}
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

