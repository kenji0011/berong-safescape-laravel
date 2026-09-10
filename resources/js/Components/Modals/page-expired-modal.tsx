import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { RefreshCw, ShieldAlert, Clock, ArrowRight } from "lucide-react";

export function PageExpiredModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    // 1. Intercept Inertia 419 Page Expired errors
    const removeInvalidListener = router.on("invalid", (event: any) => {
      const status = event.detail.response?.status;
      if (status === 419) {
        event.preventDefault(); // Stop default Inertia error modal
        setIsOpen(true);
      }
    });

    const removeExceptionListener = router.on("exception", (event: any) => {
      const status = event.detail.response?.status || event.detail.exception?.status;
      if (status === 419) {
        setIsOpen(true);
      }
    });

    // 2. Custom window event for Axios / apiFetch 419 responses
    const handleCustomExpired = () => {
      setIsOpen(true);
    };

    window.addEventListener("safescape-session-expired", handleCustomExpired);

    return () => {
      removeInvalidListener();
      removeExceptionListener();
      window.removeEventListener("safescape-session-expired", handleCustomExpired);
    };
  }, []);

  // Countdown timer to auto-refresh after 30 seconds if idle
  useEffect(() => {
    if (!isOpen) return;

    setCountdown(30);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border-[3px] border-amber-400 dark:border-amber-500 rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden text-center">
        
        {/* Glow effect background */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-red-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Icon Header */}
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="relative p-3.5 sm:p-4 bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-500/50 rounded-2xl text-amber-600 dark:text-amber-400 shadow-md">
            <ShieldAlert className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={2.5} />
            <div className="absolute -bottom-1 -right-1 p-1 bg-red-600 rounded-full text-white">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/50 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2.5">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          Session Security Timeout (419)
        </span>

        {/* Title */}
        <h3 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-snug">
          Page Needs a Refresh
        </h3>

        {/* Body Description */}
        <p className="mt-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
          Your security session has timed out because you were away. Please refresh the page to update your security token and continue safely.
        </p>

        {/* Countdown Info */}
        <div className="mt-3.5 sm:mt-4 p-2.5 sm:p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
          <span className="text-[11px] sm:text-xs">Auto-refreshing in:</span>
          <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-amber-600 dark:text-amber-400 font-mono font-black text-xs sm:text-sm">
            {countdown}s
          </span>
        </div>

        {/* Actions */}
        <div className="mt-5 sm:mt-6 flex flex-col items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            className="w-full inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-extrabold text-xs sm:text-sm text-white bg-[#d60000] hover:bg-red-600 border-b-4 border-red-900 active:translate-y-1 active:border-b-0 shadow-lg transition-all cursor-pointer touch-manipulation"
          >
            <RefreshCw className="h-4 w-4 animate-spin" style={{ animationDuration: '3s' }} />
            Refresh Page Now
            <ArrowRight className="h-4 w-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
