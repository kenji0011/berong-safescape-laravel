import React, { useEffect, useState } from "react"
import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, Maximize, RotateCcw } from "lucide-react"
import axios from "axios"

export default function TaskMaster() {
  const [isPortrait, setIsPortrait] = useState(false);
  const [showWinNotification, setShowWinNotification] = useState(false);

  useEffect(() => {
    // Check orientation for mobile devices
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    
    window.addEventListener('resize', checkOrientation);
    checkOrientation();

    // Listen for messages from the Godot iframe
    const handleMessage = async (event: MessageEvent) => {
      // The Godot game should send something like: window.parent.postMessage("TASK_MASTER_WON", "*");
      if (event.data === "TASK_MASTER_WON" || event.data?.type === "TASK_MASTER_WON") {
        setShowWinNotification(true);
        // Save the badge via API
        try {
          await axios.post('/api/badges/award', { badge_id: 'task_master' });
        } catch (e) {
          console.error("Failed to award badge", e);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <>
      <Head title="Task Master Game" />
      
      <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center overflow-hidden touch-none">
        
        {/* Navigation Overlay (appears when hovering near top or can be always slightly visible) */}
        <Link 
          href="/kids" 
          className="absolute top-4 left-4 z-[10000] bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm transition-all border border-white/20 shadow-xl flex items-center gap-2 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold hidden sm:inline">Exit Game</span>
        </Link>

        {/* The Game Iframe */}
        <iframe 
          src="/games/task_master/index.html" 
          className="w-full h-full border-none pointer-events-auto"
          allowFullScreen
          scrolling="no"
        />

        {/* Please Rotate Device Warning for Mobile */}
        {isPortrait && (
          <div className="absolute inset-0 z-[10001] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 text-center">
            <RotateCcw className="h-16 w-16 mb-6 text-blue-400 animate-pulse" />
            <h2 className="text-3xl font-black uppercase mb-4 tracking-wider">Rotate Your Device</h2>
            <p className="text-lg font-medium text-slate-300 max-w-sm">
              Task Master is best played in landscape mode. Please turn your phone sideways to play!
            </p>
          </div>
        )}

        {/* Win Notification Overlay */}
        {showWinNotification && (
          <div className="absolute inset-0 z-[10002] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 sm:p-12 max-w-md w-full text-center shadow-[0_0_100px_rgba(59,130,246,0.3)] transform scale-100 animate-in zoom-in duration-300">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center shadow-inner border-4 border-white dark:border-slate-800 mb-6 relative overflow-hidden">
                {/* Placeholder Badge Image - User will replace later */}
                <span className="text-4xl">🏆</span>
              </div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase mb-2">Badge Earned!</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold mb-8">
                Congratulations! You completed the Task Master game and earned the Inspector Badge!
              </p>
              <Link 
                href="/kids/badges?highlight=task%20master" 
                className="w-full inline-flex items-center justify-center py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest transition-colors shadow-lg"
              >
                View in Badge Hall
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
