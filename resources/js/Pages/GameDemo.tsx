import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, AlertTriangle, X } from 'lucide-react';
import RootLayout from '@/Layouts/RootLayout';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import GameContainer from '@/Components/Game/GameContainer';

export default function GameDemo() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Check hardware concurrency (CPU cores) and device memory (RAM in GB)
    // Note: deviceMemory is not supported on all browsers (e.g., Safari), so it defaults to 4
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;
    
    // If the device has less than 4 cores or explicitly less than 4GB of RAM
    if (cores < 4 || memory < 4) {
      setShowWarning(true);
    }
  }, []);

  return (
    <>
      <Head title="SafeScape 3D Game Demo" />
      <div className="min-h-screen flex flex-col relative bg-slate-950">
        <Navigation />

        <main className="flex-grow pt-[120px] pb-16 w-full relative z-10">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            {/* Back to Activities Button */}
            <div className="mb-6">
              <Link 
                href="/kids/challenges" 
                className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-orange-400 transition-all text-sm bg-slate-900 px-4 py-2 rounded-full border border-slate-700/60 shadow-sm hover:border-orange-500/50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Activities
              </Link>
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                Interactive <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Fire Safety</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Explore the 3D environment, identify hazards, and learn how to react in a safe, interactive simulation.
              </p>
            </div>
            
            {showWarning && (
              <div className="mb-8 max-w-3xl mx-auto bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-lg">
                <div className="bg-amber-500/20 p-2 rounded-full shrink-0">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-amber-500 font-bold text-lg mb-1">Performance Warning</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    It looks like your device might not meet the minimum specifications to run this 3D simulation smoothly. You may experience low framerates, lag, or unexpected crashes. For the best experience, we recommend using a device with at least 4GB of RAM and closing any background apps.
                  </p>
                </div>
                <button 
                  onClick={() => setShowWarning(false)}
                  className="shrink-0 p-1.5 hover:bg-amber-500/20 rounded-lg transition-colors text-amber-500"
                  aria-label="Dismiss warning"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            
            {/* The 3D Game Container */}
            <GameContainer />

          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

GameDemo.layout = (page: React.ReactNode) => <RootLayout>{page}</RootLayout>;

