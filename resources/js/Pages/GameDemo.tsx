import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import RootLayout from '@/Layouts/RootLayout';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import GameContainer from '@/Components/Game/GameContainer';

export default function GameDemo() {
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

