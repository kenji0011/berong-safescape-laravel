import React, { useEffect, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import RootLayout from '@/Layouts/RootLayout';
import { Navigation } from '@/Components/navigation';
import { HeroCarousel } from '@/Components/ui/hero-carousel';
import { FeaturedCards } from '@/Components/ui/featured-cards';
import { Footer } from '@/Components/footer';
import { HeroSection, LandingAboutSection, LandingAssessmentSection } from '@/Components/Landing';
import Particles from '@/Components/ui/particles';
import { Smartphone, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export default function Welcome({ carouselImages }: { carouselImages?: any[] }) {
  const { auth } = usePage().props as any;
  const serverUser = auth?.user;
  const [isMobile, setIsMobile] = useState(false);
  const [showShortcutGuide, setShowShortcutGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  
  const mappedUser = serverUser ? {
    id: serverUser.id,
    name: serverUser.name || 'User',
    age: serverUser.age ?? undefined,
    role: serverUser.role || 'guest',
  } : null;

  const tutorialSteps = [
    {
      title: "Step 1: Open Chrome",
      desc: "Launch the Google Chrome browser on your mobile device and navigate to bfpscberong.app.",
      image: "/tutorial/step_1.webp"
    },
    {
      title: "Step 2: Access Menu",
      desc: "Tap the three vertical dots located in the top-right corner of the Chrome interface.",
      image: "/tutorial/step_2.webp"
    },
    {
      title: "Step 3: Add to Home Screen",
      desc: "Scroll down the menu list and tap 'Add to Home screen' or 'Install app'.",
      image: "/tutorial/step_3.webp"
    },
    {
      title: "Step 4: Install SafeScape",
      desc: "When the 'Install app' prompt appears on your screen, tap 'Install'.",
      image: "/tutorial/step_4.webp"
    },
    {
      title: "Step 5: Process Completion",
      desc: "Wait for the installation to finish and navigate to your phone's home screen.",
      image: "/tutorial/step_5.webp"
    },
    {
      title: "Step 6: Launch Directly",
      desc: "Open the newly created SafeScape shortcut to access the application instantly.",
      image: "/tutorial/step_6.webp"
    }
  ];

  return (
    <>
      <Head title="Berong E-Learning for BFP Sta Cruz">
        {carouselImages && carouselImages.length > 0 && (
          <link rel="preload" as="image" href={carouselImages[0].imageUrl} fetchPriority="high" />
        )}

      </Head>
      <div className="min-h-screen flex flex-col relative">
        <Navigation />

        {/* Global floating fire particles (desktop only, very subtle) */}
        {!isMobile && (
          <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
            <Particles
              className="!absolute !inset-0"
              quantity={20}
              color={['#f97316', '#ef4444', '#fbbf24']}
              size={1.2}
              staticity={60}
              ease={80}
              vx={0}
              vy={-0.05}
            />
          </div>
        )}

        <main className="flex-grow pt-[96px] sm:pt-[120px] pb-6 sm:pb-8 w-full relative z-10 overflow-x-clip">
          {/* Hero Carousel - Topmost Section */}
          <section className="mb-8 sm:mb-32 w-[95vw] sm:w-full mx-auto sm:px-6 lg:px-8 max-w-7xl">
            <HeroCarousel initialImages={carouselImages} />
          </section>

          {/* Cinematic Hero Section */}
          <section className="mb-8 sm:mb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <HeroSection />
          </section>

          {/* Choose Your Path (Featured Cards) */}
          <section id="featured-section" className="mb-8 sm:mb-32 scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <FeaturedCards serverUser={mappedUser} />
          </section>

          {/* About SafeScape Sections */}
          <section id="about-section" className="mb-8 sm:mb-32 scroll-mt-24 w-full">
            <LandingAboutSection />
          </section>

          {/* Assessment Section */}
          <section id="final-assessment" className="mb-8 sm:mb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <LandingAssessmentSection serverUser={mappedUser} />
          </section>
        </main>

        <Footer />

        {/* Global Floating Install Shortcut Button (Mobile View Only) */}
        <AnimatePresence>
          {isMobile && !showShortcutGuide && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setCurrentStep(0);
                setShowShortcutGuide(true);
              }}
              className="fixed left-6 bottom-6 z-50 ss-install-shortcut-btn bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border-2 border-yellow-500 shadow-[0_4px_0_0_#ca8a04] dark:shadow-[0_4px_0_0_#854d0e] active:translate-y-1 active:shadow-none hover:-translate-y-1 transition-all rounded-full px-6 py-3 font-black text-sm flex items-center gap-3 w-max cursor-pointer"
            >
              <Smartphone className="h-5 w-5 shrink-0" />
              <span className="whitespace-nowrap">Create Shortcut</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Step-by-Step Tutorial Dialog (Mobile Screens Only) */}
        <AnimatePresence>
          {showShortcutGuide && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-slate-900 border-[3px] border-red-500 rounded-[1.75rem] sm:rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="bg-red-500 p-5 text-center relative shrink-0">
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">
                    Create Mobile Shortcut
                  </h3>
                  <button
                    onClick={() => setShowShortcutGuide(false)}
                    className="absolute top-4 right-4 p-1 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-5 sm:p-6 flex-grow overflow-y-auto flex flex-col justify-between gap-4">
                  <div className="space-y-4">
                    {/* Image Container */}
                    <div className="h-[280px] w-full bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center p-2.5 border border-slate-200 dark:border-slate-850">
                      <img
                        src={tutorialSteps[currentStep].image}
                        alt={tutorialSteps[currentStep].title}
                        className="h-full w-full object-contain rounded-lg"
                      />
                    </div>

                    {/* Step Text Details */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-wide">
                        {tutorialSteps[currentStep].title}
                      </h4>
                      <p className="text-xs font-semibold text-slate-650 dark:text-slate-400 leading-relaxed">
                        {tutorialSteps[currentStep].desc}
                      </p>
                    </div>
                  </div>

                  {/* Slide Navigation & Indicators */}
                  <div className="flex items-center justify-between pt-5 mt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    {/* Previous Button */}
                    {currentStep > 0 ? (
                      <button
                        onClick={() => setCurrentStep((prev) => prev - 1)}
                        className="p-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="w-[34px]" />
                    )}

                    {/* Step Counter */}
                    <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Step {currentStep + 1} of {tutorialSteps.length}
                    </span>

                    {/* Next or Finish Button */}
                    {currentStep < tutorialSteps.length - 1 ? (
                      <button
                        onClick={() => setCurrentStep((prev) => prev + 1)}
                        className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowShortcutGuide(false)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                      >
                        Finish
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// Attach persistent layout
Welcome.layout = (page: React.ReactNode) => <RootLayout>{page}</RootLayout>;

