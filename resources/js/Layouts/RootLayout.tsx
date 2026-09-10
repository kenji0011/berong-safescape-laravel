import React, { Suspense, useState, useEffect } from "react";
import { AuthProvider } from "@/lib/auth-context";

// Lazy-load the Chatbot to keep the initial page bundle lightweight
const Chatbot = React.lazy(() => import("@/Components/chatbot").then(m => ({ default: m.Chatbot })));
import { PageLoader, LogoutLoader, LoginLoader } from "@/Components/Loaders";
import { ProfileCheckWrapper } from "@/Components/profile-check-wrapper";
import { FocusModeManager } from "@/Components/focus-mode-manager";
import { usePage } from '@inertiajs/react';
import { Toaster } from "@/Components/ui/sonner";
import { AlertTriangle } from "lucide-react";

import { PageExpiredModal } from "@/Components/Modals";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { url, component, props } = usePage();
  const isAuthPage = url.startsWith('/login') || url.startsWith('/register');
  
  const isMiniGame = url.startsWith('/kids/quiz') || 
                     url.startsWith('/kids/memory-game') || 
                     url.startsWith('/kids/smoke-crawl') || 
                     url.startsWith('/kids/hot-or-not') || 
                     url.startsWith('/kids/hazard-blitz') ||
                     url.startsWith('/assessment') ||
                     url.startsWith('/game');

  const isHighOpacityBg = component === 'ProfessionalDashboard' || component === 'AdultDashboard' || component === 'AdultPageClient';

  const typedProps = props as any;
  const initialAlert = typedProps.maintenanceAlert;
  const [localAlert, setLocalAlert] = useState<{ warning_message: string; is_active: boolean; scheduled_at?: string | null } | null>(initialAlert);
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");

  // Sync prop changes
  useEffect(() => {
    setLocalAlert(initialAlert);
  }, [initialAlert]);

  // Client-side real-time countdown timer
  useEffect(() => {
    if (!localAlert || !localAlert.scheduled_at) {
      setTimeLeftStr("");
      return;
    }

    const updateTimer = () => {
      const scheduledTime = new Date(localAlert.scheduled_at!).getTime();
      const now = Date.now();
      const diff = scheduledTime - now;

      if (diff <= 0) {
        setTimeLeftStr("System offline shortly");
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeftStr(`${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [localAlert]);

  // Background polling for standing sessions (checks every 25s without duplicate per-route fetches)
  useEffect(() => {
    if (url.startsWith('/maintenance') || url.startsWith('/login') || url.startsWith('/logout')) {
      return;
    }

    const checkMaintenanceStatus = async () => {
      try {
        const response = await fetch('/api/maintenance-status');
        if (response.ok) {
          const data = await response.json();
          
          // 1. If maintenance is active, redirect non-admins
          if (data.is_active) {
            const user = typedProps.auth?.user;
            const isAdmin = user?.role === 'admin' || user?.role?.includes('admin');
            
            if (!isAdmin) {
              window.location.href = '/maintenance';
              return;
            }
          }

          // 2. Update alert banner state
          if (data.warning_active) {
            setLocalAlert({
              warning_message: data.warning_message,
              is_active: data.is_active,
              scheduled_at: data.scheduled_at || null
            });
          } else {
            setLocalAlert(null);
          }
        }
      } catch (error) {
        // Non-critical network error
      }
    };

    const interval = setInterval(checkMaintenanceStatus, 25000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthProvider>
      <div className="antialiased relative min-h-screen font-sans bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
        <Suspense fallback={null}>
          <PageLoader />
        </Suspense>

        {/* Background Image Layer */}
        <div
          className={`fixed top-0 left-0 w-full z-0 pointer-events-none transform-gpu ${isHighOpacityBg ? 'opacity-100' : 'opacity-10 sm:opacity-20'}`}
          style={{ height: '100vh', minHeight: '100lvh' }}
        >
          <img 
            src="/web-background-image.webp"
            alt=""
            className="w-full h-full object-cover"
            style={{ 
              objectPosition: 'center 80%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          />
        </div>

        {/* Content Layer - Full opacity */}
        <div className="relative z-10 w-full min-h-screen flex flex-col">
          <ProfileCheckWrapper>
            <div className={(localAlert && !localAlert.is_active) ? "pb-12" : ""}>
              {children}
            </div>
          </ProfileCheckWrapper>
          {(!isAuthPage && !isMiniGame && !url.startsWith('/maintenance')) && (
            <Suspense fallback={null}>
              <Chatbot />
            </Suspense>
          )}
          <LoginLoader />
          <LogoutLoader />
          <FocusModeManager />
          <PageExpiredModal />
        </div>
        <Toaster position="top-right" richColors duration={3000} />

        {/* Global Pre-Maintenance Alert Banner */}
        {(localAlert && !localAlert.is_active) && (
          <div className="fixed bottom-0 left-0 w-full z-[10001] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 text-xs sm:text-sm font-black py-3 px-4 text-left sm:text-center flex items-start sm:items-center justify-start sm:justify-center gap-2 shadow-[0_-4px_20px_rgba(245,158,11,0.25)] select-none animate-slide-up">
            <AlertTriangle className="h-4 w-4 shrink-0 text-slate-950 mt-0.5 sm:mt-0" />
            <span className="tracking-wide flex items-center flex-wrap justify-start sm:justify-center gap-2">
              <span>{localAlert.warning_message}</span>
              {timeLeftStr && (
                <span className="px-2 py-0.5 bg-slate-950 text-amber-400 rounded-lg text-[10px] sm:text-xs font-mono tracking-tight shadow-sm border border-amber-400/20 whitespace-nowrap">
                  {timeLeftStr}
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </AuthProvider>
  );
}
