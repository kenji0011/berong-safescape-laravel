import React, { useEffect, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import RootLayout from '@/Layouts/RootLayout';
import { Navigation } from '@/components/navigation';
import { HeroCarousel } from '@/components/ui/hero-carousel';
import { FeaturedCards } from '@/components/ui/featured-cards';
import { Footer } from '@/components/footer';
import { LandingAboutSection } from '@/components/landing-about-section';
import { LandingAssessmentSection } from '@/components/landing-assessment-section';
import { HeroSection } from '@/Components/hero-section';
import Particles from '@/Components/ui/particles';

export default function Welcome({ carouselImages }: { carouselImages?: any[] }) {
  const { auth } = usePage().props as any;
  const serverUser = auth?.user;
  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <>
      <Head title="Berong E-Learning for BFP Sta Cruz">
        {carouselImages && carouselImages.length > 0 && (
          <link rel="preload" as="image" href={carouselImages[0].imageUrl} fetchPriority="high" />
        )}
      </Head>
      <div className="min-h-screen flex flex-col relative" style={{ scrollBehavior: 'smooth' }}>
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

        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[80px] sm:pt-[96px] pb-6 sm:pb-8 w-full relative z-10">
          {/* Cinematic Hero Section */}
          <section className="mb-8 sm:mb-12">
            <HeroSection />
          </section>

          {/* Carousel */}
          <section className="mb-8 sm:mb-12">
            <HeroCarousel initialImages={carouselImages} />
          </section>

          <section id="featured-section" className="mb-10 sm:mb-12 scroll-mt-24">
            <FeaturedCards serverUser={mappedUser} />
          </section>

          <section id="about-section" className="mb-16 sm:mb-24 mt-8 sm:mt-12 scroll-mt-24">
            <LandingAboutSection />
          </section>

          <section className="mb-12 sm:mb-16">
            <LandingAssessmentSection serverUser={mappedUser} />
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

// Attach persistent layout
Welcome.layout = (page: React.ReactNode) => <RootLayout>{page}</RootLayout>;
