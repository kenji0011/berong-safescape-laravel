import React, { Suspense } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { Chatbot } from "@/components/chatbot";
import { PageLoader } from "@/components/page-loader";
import { LogoutLoader } from "@/components/logout-loader";
import { LoginLoader } from "@/components/login-loader";
import { ProfileCheckWrapper } from "@/components/profile-check-wrapper";
import { usePage } from '@inertiajs/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { url } = usePage();
  const isAuthPage = url.startsWith('/login') || url.startsWith('/register');
  
  const isMiniGame = url.startsWith('/kids/quiz') || 
                     url.startsWith('/kids/memory-game') || 
                     url.startsWith('/kids/smoke-crawl') || 
                     url.startsWith('/kids/hot-or-not') || 
                     url.startsWith('/kids/hazard-blitz') ||
                     url.startsWith('/assessment');

  return (
    <AuthProvider>
      <div className="antialiased relative min-h-screen font-sans bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
        <Suspense fallback={null}>
          <PageLoader />
        </Suspense>

        {/* Background Image Layer - 20% opacity */}
        <div
          className="fixed inset-0 opacity-10 sm:opacity-20 bg-cover z-0 pointer-events-none transform-gpu"
          style={{ 
            backgroundImage: "url('/web-background-image.jpg')", 
            backgroundPosition: 'center 80%',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        />

        {/* Content Layer - Full opacity */}
        <div className="relative z-10 w-full min-h-screen flex flex-col">
          <ProfileCheckWrapper>
            {children}
          </ProfileCheckWrapper>
          {(!isAuthPage && !isMiniGame) && <Chatbot />}
          <LoginLoader />
          <LogoutLoader />
        </div>
      </div>
    </AuthProvider>
  );
}
