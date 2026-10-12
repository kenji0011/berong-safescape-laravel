import React, { useEffect, useState, useRef } from "react"
import { Head, router } from '@inertiajs/react'
import { ArrowLeft, Maximize, RotateCcw, Cloud, ShieldCheck } from "lucide-react"
import axios from "axios"
import { useAuth } from "@/lib/auth-context"
import { playSound } from '@/lib/audio'

interface CloudProgress {
  high_score: number;
  total_calls_handled: number;
  successful_calls: number;
  accuracy_rate: number;
  current_rank: string;
  badge_unlocked: boolean;
}

export default function RightCall() {
  const { user } = useAuth();
  const isProfessional = user?.role === 'professional';
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const [dismissWarning, setDismissWarning] = useState(false);
  const [showWinNotification, setShowWinNotification] = useState(false);
  const [cloudProgress, setCloudProgress] = useState<CloudProgress | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load cloud progress on mount
  useEffect(() => {
    if (!user?.id) return;

    axios.get(`/api/games/right-call/load?user_id=${user.id}`)
      .then(res => {
        if (res.data) {
          setCloudProgress(res.data);
        }
      })
      .catch(err => {
        console.warn("Could not pre-fetch cloud progress:", err?.message);
      });
  }, [user?.id]);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    
    window.addEventListener('resize', checkOrientation);
    checkOrientation();

    // Listen for events from the Godot iframe
    const handleMessage = async (event: MessageEvent) => {
      // 1. Direct Cloud Save event from Godot
      if (event.data?.type === "RIGHT_CALL_SAVE") {
        if (!user?.id) return;
        setIsSyncing(true);
        try {
          const payload = {
            ...event.data.payload,
            user_id: user.id,
          };
          const res = await axios.post('/api/games/right-call/save', payload);
          if (res.data?.progress) {
            setCloudProgress(prev => ({
              ...(prev || {}),
              ...res.data.progress,
            }));
          }
          if (res.data?.is_new_badge) {
            playSound('/sounds/win.mp3', 'games');
            setShowWinNotification(true);
          }
        } catch (e) {
          console.error("Failed to save Right Call progress to cloud:", e);
        } finally {
          setIsSyncing(false);
        }
      }

      // 2. Request load from Godot via postMessage
      if (event.data === "RIGHT_CALL_REQUEST_LOAD" || event.data?.type === "RIGHT_CALL_REQUEST_LOAD") {
        if (!user?.id) return;
        try {
          const res = await axios.get(`/api/games/right-call/load?user_id=${user.id}`);
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
              type: "RIGHT_CALL_PROGRESS_LOADED",
              data: res.data
            }, "*");
          }
        } catch (e) {
          console.error("Failed to respond to Right Call load request:", e);
        }
      }

      // 3. Victory / Completion event from Godot
      if (event.data === "RIGHT_CALL_WON" || event.data?.type === "RIGHT_CALL_WON") {
        playSound('/sounds/win.mp3', 'games');
        setShowWinNotification(true);
        if (user?.id) {
          try {
            await axios.post('/api/games/right-call/save', {
              user_id: user.id,
              is_won: true,
            });
          } catch (e) {
            console.error("Failed to record win in cloud:", e);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('message', handleMessage);
    };
  }, [user?.id]);

  const iframeSrc = `/games/right-call/index.html?user_id=${user?.id || 'guest'}&player_name=${encodeURIComponent(user?.name || '')}`;

  return (
    <>
      <Head title="The Right Call" />
      
      <div 
        className="fixed inset-0 bg-black z-[9999] flex items-center justify-center overflow-hidden touch-none"
      >
        {/* Top Controls Bar */}
        <div className="absolute top-4 left-4 z-[10000] flex items-center gap-3">
          <button 
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                router.visit(isProfessional ? "/professional" : "/kids");
              }
            }}
            className="bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-all border border-white/20 shadow-xl flex items-center gap-2 group cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold hidden sm:inline">Exit Game</span>
          </button>

          <button 
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                  console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
              } else {
                document.exitFullscreen();
              }
            }}
            className="bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-all border border-white/20 shadow-xl flex items-center gap-2 group cursor-pointer"
          >
            <Maximize className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold hidden sm:inline">Fullscreen</span>
          </button>
        </div>

        {/* Top Right Cloud Progress Chip */}
        {user && (
          <div className="absolute top-4 right-4 z-[10000] flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15 text-white shadow-xl text-xs sm:text-sm font-semibold select-none pointer-events-none">
            <Cloud className={`h-4 w-4 ${isSyncing ? "text-yellow-400 animate-pulse" : "text-emerald-400"}`} />
            <span className="hidden sm:inline text-slate-300">
              {cloudProgress ? cloudProgress.current_rank : "Cloud Synced"}
            </span>
            {cloudProgress && cloudProgress.high_score > 0 && (
              <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold text-xs border border-emerald-500/30">
                Best: {cloudProgress.high_score.toLocaleString()}
              </span>
            )}
          </div>
        )}

        {/* The Game Iframe */}
        <iframe 
          ref={iframeRef}
          src={iframeSrc} 
          className="w-full h-full border-none pointer-events-auto"
          allowFullScreen
          scrolling="no"
        />

        {/* Please Rotate Device Warning for Mobile */}
        {isPortrait && !dismissWarning && (
          <div className="absolute inset-0 z-[10001] bg-slate-900/95 flex flex-col items-center justify-center text-white p-6 text-center">
            <RotateCcw className="h-16 w-16 mb-6 text-blue-400 animate-pulse" />
            <h2 className="text-3xl font-black uppercase mb-4 tracking-wider">Rotate Your Device</h2>
            <p className="text-lg font-medium text-slate-300 max-w-sm mb-8">
              The Right Call is best played in landscape mode. Please turn your phone sideways to play!
            </p>
            <button
              onClick={() => setDismissWarning(true)}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors"
            >
              Play Anyway
            </button>
          </div>
        )}

        {/* Win Notification Overlay */}
        {showWinNotification && (
          <div className="absolute inset-0 z-[10002] bg-black/80 flex flex-col items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 sm:p-12 max-w-md w-full text-center shadow-[0_0_100px_rgba(59,130,246,0.3)] transform scale-100 animate-in zoom-in duration-300">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center shadow-inner border-4 border-white dark:border-slate-800 mb-6 relative overflow-hidden">
                <span className="text-4xl">🏆</span>
              </div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase mb-2">
                {isProfessional ? "Simulation Complete!" : "Badge Earned!"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold mb-8">
                {isProfessional 
                  ? "Congratulations! You completed The Right Call and successfully handled the emergency calls!"
                  : "Congratulations! You completed The Right Call and earned the Dispatch Hero Badge!"}
              </p>
              <a 
                href={isProfessional ? "/professional" : "/kids/badges?highlight=dispatch%20hero"} 
                className="w-full inline-flex items-center justify-center py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest transition-colors shadow-lg"
              >
                {isProfessional ? "Return to Dashboard" : "View in Badge Hall"}
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
