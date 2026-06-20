import React, { useEffect, useState, useMemo } from "react"
import { Head, Link, router } from '@inertiajs/react'
import DashboardLayout from "@/Layouts/DashboardLayout"
import { ArrowLeft, BookOpen, ChevronRight, Flame, Trophy, ClipboardCheck, PartyPopper, CheckCircle, Info } from "lucide-react"
import axios from "axios"
import { cn } from "@/lib/utils"
import { ModuleNavigation } from "@/Components/module-navigation"
import { AdaptiveQuiz } from "@/Components/AdaptiveQuiz"
import { useAuth } from "@/lib/auth-context"

const ModuleFivePage = ({ moduleNum, initialProgress }: { moduleNum: number; initialProgress?: any }) => {
  const { user } = useAuth()
  const currentModule = moduleNum || 5
  const [moduleCompleted, setModuleCompleted] = useState(initialProgress?.completedModules?.includes(currentModule) || false)
  const [iframeLoading, setIframeLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullProgress, setFullProgress] = useState<any>(initialProgress || null)
  const moduleData = fullProgress?.sectionData?.module5 || {};
  const completedRef = React.useRef(moduleCompleted)
  const recentlyCompletedRef = React.useRef(false)
  const badgeShownRef = React.useRef(false)
  const badgeAwardedRef = React.useRef(false)
  const quizSubmittedRef = React.useRef(false)
  const syncingRef = React.useRef(false)
  const pendingSyncRef = React.useRef<any>(null)
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const [showBadgeModal, setShowBadgeModal] = useState(false)

  useEffect(() => {
    if (showBadgeModal) {
      try {
        const audio = new Audio('/sounds/finish.mp3')
        audio.play().catch(e => console.error("Audio play failed:", e))
      } catch (e) {}
    }
  }, [showBadgeModal])
  const [toast, setToast] = useState<{ msg: string; type: "success" | "info" } | null>(null)

  // Automatically clear toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

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
            badge_icon: '/home_hall.png'
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
  }, [iframeLoading]);

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
        recentlyCompletedRef.current = true;
      }
      loadState() // Sync full state in real-time for progress bar & checkboxes
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
               recentlyCompletedRef.current = true;
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

      // 4. Show Toast notification
      if (data.type === 'SAFESCAPE_SHOW_TOAST') {
        setToast({ msg: data.message, type: data.toastType });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [fullProgress, currentModule]);

  const progressPercent = useMemo(() => {
    if (moduleCompleted) return 100;
    const keys = ['videoWatched', 'sdrCompleted', 'sdrTrapCompleted', 'hazardHuntCompleted', 'finalExamPassed'];
    const completed = keys.filter(k => moduleData[k] === true || moduleData[k] === 'true' || moduleData[k] === 1 || moduleData[k] === '1').length;
    return Math.round((completed / keys.length) * 100);
  }, [fullProgress, moduleCompleted]);

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

      // Tap sound removed per user request

      const nav = iframeDoc.querySelector('.ss-nav') as HTMLElement;
      if (nav) nav.style.display = 'none';

      // Hide iframe footer
      const footer = iframeDoc.querySelector('footer');
      if (footer) footer.style.display = 'none';

      // Hide iframe final quiz (replaced by AdaptiveQuiz component)
      const finalQuiz = iframeDoc.querySelector('#final-exam') as HTMLElement;
      if (finalQuiz) finalQuiz.style.display = 'none';

      // Dynamically resize iframe to content height without breaking scroll momentum
      const resizeIframe = () => {
        try {
          const body = iframeDoc.body;
          if (!body) return;
          
          let maxBottom = 300; // Safe default minimum
          
          // Calculate natural page boundary based on flowable elements
          for (let i = 0; i < body.children.length; i++) {
            const child = body.children[i] as HTMLElement;
            if (!child) continue;
            
            // Skip absolute/fixed elements like overlays, modals, and toast notifications
            const style = iframeDoc.defaultView?.getComputedStyle(child);
            if (style && (style.position === 'absolute' || style.position === 'fixed')) {
              continue;
            }
            
            const bottom = child.offsetTop + child.offsetHeight;
            if (bottom > maxBottom) {
              maxBottom = bottom;
            }
          }
          
          const newHeight = maxBottom + 24; // 24px safety buffer
          const currentHeight = parseInt(iframe.style.height) || 0;
          if (newHeight > 0 && Math.abs(newHeight - currentHeight) > 15) {
            iframe.style.height = `${newHeight}px`;
          }
        } catch (e) {}
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
          recentlyCompletedRef.current = true;
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

      const links = iframeDoc.querySelectorAll('a');
      links.forEach(link => {
        link.addEventListener('click', (ev) => {
          const href = link.getAttribute('href');
          if (!href) return;
          
          if ((href === 'index.html' || href === './index.html') && completedRef.current) {
            ev.preventDefault();
            return;
          }

          if (href.includes('index.html') || href.includes('post-test')) {
            ev.preventDefault();
            
            if (recentlyCompletedRef.current && !badgeShownRef.current) {
               badgeShownRef.current = true;
               setShowBadgeModal(true);
               return;
            }

            const match = href.match(/module_(\d+)/);
            if (match) {
              router.visit(`/kids/safescape/${match[1]}`);
            } else if (href.includes('post-test')) {
              router.visit('/assessment/post-test');
            } else {
              router.visit('/kids/safescape');
            }
          }
        });
      });
    } catch(err) {
      console.warn("Iframe manipulation restriction or error", err);
    }
  }

  return (
    <div className="module-page-wrapper -mt-[104px] sm:-mt-[120px] pt-[104px] sm:pt-[120px] min-h-[calc(100vh+104px)] sm:min-h-[calc(100vh+120px)] bg-white dark:bg-slate-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] font-sans flex flex-col transition-colors duration-500">
      <Head title={`Module ${currentModule} | SafeScape`} />

      {/* ── Sub Header ── */}
      <div className="z-[50] sticky top-[96px] sm:top-[112px] ss-sub-header transition-all duration-500 w-full flex justify-center px-2 sm:px-4 -mt-2 mb-4 sm:mb-8 pointer-events-none">
        <div className="bg-white dark:bg-slate-900 border-[3px] border-slate-200 dark:border-slate-800 py-2 sm:py-3 px-3 sm:px-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 rounded-2xl sm:rounded-3xl w-[95vw] lg:w-max max-w-[1400px] flex flex-row items-center justify-between gap-2 sm:gap-4 transition-colors pointer-events-auto">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/kids/safescape" className="ss-back-button inline-flex items-center justify-center gap-2 p-2 sm:px-4 sm:py-2 bg-white dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300 font-bold hover:text-slate-900 dark:hover:text-white border-[3px] border-slate-200 dark:border-slate-700 shadow-[0_3px_0_#cbd5e1] dark:shadow-[0_3px_0_#0f172a] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all text-sm whitespace-nowrap"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Back to Dashboard</span></Link>
            <div className="hidden sm:flex items-center gap-2">
              <Flame className="h-5 w-5 text-[#ff4b3e]" />
              <h1 className="text-xl font-black text-slate-800 dark:text-white transition-colors">SafeScape Fire Safety Course</h1>
            </div>
            {/* Added for focus mode mobile */}
            <div className="hidden ss-focus-title items-center gap-1.5 sm:hidden">
              <Flame className="h-4 w-4 text-[#ff4b3e]" />
              <h1 className="text-sm font-black text-slate-800 dark:text-white transition-colors">SafeScape</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-6">
            {/* Module dots */}
            <ModuleNavigation currentModule={currentModule} completedModules={fullProgress?.completedModules || []} />
            {/* Progress */}
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-nowrap hidden lg:block transition-colors">
              {progressPercent === 100 ? (
                <>Status: <span className="text-green-500 font-black ml-1">Completed ✓</span></>
              ) : (
                <>Progress: <span className="text-[#ff4b3e] font-black ml-1">{progressPercent}%</span></>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* ── Dark Module Content Area ── */}
      <div className="flex-1 flex flex-col w-full relative transition-colors min-h-[80vh]">
        
        {/* Skeleton Loader */}
        {iframeLoading && (
          <div className="absolute inset-0 z-10 bg-white dark:bg-slate-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none transition-colors">
            <div className="sticky top-[20vh] flex flex-col items-center px-4 w-full">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border-[3px] border-blue-200 dark:border-slate-800 flex items-center justify-center mb-6 animate-bounce transition-colors">
                <Flame className="h-8 w-8 sm:h-10 sm:w-10 text-[#ff4b3e] animate-pulse" />
              </div>
              <div className="flex flex-col items-center gap-3 w-full max-w-2xl px-2 sm:px-6">
                <div className="h-6 sm:h-10 w-48 sm:w-64 bg-blue-200/50 dark:bg-blue-900/30 rounded-full animate-pulse"></div>
                <div className="h-4 sm:h-5 w-64 sm:w-96 bg-blue-200/50 dark:bg-blue-900/30 rounded-full animate-pulse delay-75 mb-6"></div>
                
                <div className="w-full space-y-4">
                  <div className="h-48 sm:h-64 w-full bg-white/60 dark:bg-slate-900/60 rounded-[2rem] border-[3px] border-blue-200/50 dark:border-slate-800/50 animate-pulse delay-150 transition-colors"></div>
                  <div className="h-32 sm:h-48 w-full bg-white/60 dark:bg-slate-900/60 rounded-[2rem] border-[3px] border-blue-200/50 dark:border-slate-800/50 animate-pulse delay-200 transition-colors"></div>
                </div>
              </div>
              <p className="mt-8 text-blue-400 font-bold tracking-widest uppercase text-sm animate-pulse delay-300">Loading Module Content...</p>
            </div>
          </div>
        )}

        <iframe 
          ref={iframeRef}
          src={`/modules/module_${currentModule}/index.html?v=5`}
          className={cn(
            "w-full border-none m-0 p-0 transition-opacity duration-700",
            iframeLoading ? "opacity-0" : "opacity-100"
          )}
          style={{ minHeight: '300px' }}
          onLoad={handleIframeLoad}
          loading="eager"
          allow="fullscreen; autoplay; encrypted-media"
          title={`SafeScape Module ${currentModule}`}
        />

        {!iframeLoading && (
          <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 z-20">
            <AdaptiveQuiz
              moduleNumber={currentModule}
              isLocked={!moduleData?.hazardHuntCompleted}
              lockMessage="Complete Section 5.4 first"
              initialQuizPassed={fullProgress?.sectionData?.[`module${currentModule}`]?.quizPassed}
              initialQuizScore={fullProgress?.sectionData?.[`module${currentModule}`]?.quizScore}
              initialQuizAnswers={fullProgress?.sectionData?.[`module${currentModule}`]?.quizAnswers}
              initialQuizQuestions={fullProgress?.sectionData?.[`module${currentModule}`]?.quizQuestions}
              onComplete={(score) => {
                setModuleCompleted(true);
                setShowBadgeModal(true);
              }}
              nextModuleUrl="/kids/safescape?show_cert_modal=true"
              nextModuleText="Back to Dashboard"
            />
            <footer className="module-footer mt-12 border-t-2 border-slate-200 dark:border-slate-800 py-8 text-center transition-colors">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest transition-colors">SafeScape Intelligent Systems Project</p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 transition-colors">Module 5: Final Exam</p>
            </footer>
          </div>
        )}

      </div>

      {/* ── Badge Earned Modal ── */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] max-w-sm w-full p-8 flex flex-col items-center text-center shadow-2xl border-[4px] border-amber-200 dark:border-amber-900/50 animate-in zoom-in-95 duration-500">
            <div className="h-24 w-24 bg-amber-50 dark:bg-amber-900/20 rounded-full border-[4px] border-amber-100 dark:border-amber-800 flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.amber.300/20)_0%,transparent_70%)] animate-pulse"></div>
              <img src="/home_hall.png" alt="Home Guard Badge" className="h-16 w-16 object-contain relative z-10 drop-shadow-md" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Badge Unlocked!</h2>
            <p className="text-amber-600 dark:text-amber-400 font-bold uppercase tracking-widest text-sm mb-4">Home Guard</p>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-8 leading-relaxed">
              Congratulations! You've completed the final training session and earned your Home Guard badge.
            </p>
            <button
              onClick={() => {
                setShowBadgeModal(false);
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-white font-black px-6 py-4 rounded-[1.25rem] border-b-[5px] border-amber-700 active:border-b-[1px] active:mt-[4px] transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-2"
            >
              Obtain Badge
              <Trophy className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={cn(
          "fixed top-20 left-1/2 -translate-x-1/2 right-auto bottom-auto md:top-28 md:right-8 md:left-auto md:translate-x-0 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-slate-800 dark:text-white font-extrabold text-xs sm:text-sm transition-all animate-in fade-in slide-in-from-top-4 duration-300 bg-white dark:bg-slate-900 border-[3px] shadow-slate-200 dark:shadow-slate-950 w-max max-w-[90vw] md:max-w-md",
          toast.type === "success" ? "border-emerald-500" : "border-blue-500"
        )}>
          {toast.type === "success" ? (
            <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
          ) : (
            <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 shrink-0" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

    </div>
  )
}

ModuleFivePage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default ModuleFivePage

