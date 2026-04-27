import React, { Suspense, lazy } from 'react';
import { Head, usePage } from '@inertiajs/react';
import RootLayout from '@/Layouts/RootLayout';
import { Navigation } from '@/components/navigation';
import { HeroCarousel } from '@/components/ui/hero-carousel';
import { FeaturedCards } from '@/components/ui/featured-cards';
import { Footer } from '@/components/footer';
import { HeroCarouselSkeleton } from '@/Components/dashboard-skeletons';
import { Deferred } from '@inertiajs/react';

const LandingAboutSection = lazy(() =>
  import('@/components/landing-about-section').then((module) => ({
    default: module.LandingAboutSection,
  }))
);

const LandingAssessmentSection = lazy(() =>
  import('@/components/landing-assessment-section').then((module) => ({
    default: module.LandingAssessmentSection,
  }))
);

export default function Welcome({ carouselImages }: { carouselImages?: any[] }) {
  const { auth } = usePage().props as any;
  const serverUser = auth?.user;
  
  const mappedUser = serverUser ? {
    id: serverUser.id,
    name: serverUser.name || 'User',
    age: serverUser.age ?? undefined,
    role: serverUser.role || 'guest',
  } : null;

  return (
    <>
      <Head title="Berong E-Learning for BFP Sta Cruz" />
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
          <section className="mb-8 sm:mb-12">
            <Deferred data="carouselImages" fallback={<HeroCarouselSkeleton />}>
              {carouselImages && carouselImages.length > 0 && (
                <Head>
                  <link rel="preload" as="image" href={carouselImages[0].imageUrl} fetchpriority="high" />
                </Head>
              )}
              <HeroCarousel initialImages={carouselImages} />
            </Deferred>
          </section>

          <section className="mb-10 sm:mb-12">
            <FeaturedCards serverUser={mappedUser} />
          </section>

          <section className="mb-16 sm:mb-24 mt-8 sm:mt-12">
            <Suspense fallback={<div className="h-72 animate-pulse rounded-3xl bg-slate-100" />}>
              <LandingAboutSection />
            </Suspense>
          </section>

          <section className="mb-12 sm:mb-16">
            <Suspense fallback={<div className="h-56 animate-pulse rounded-3xl bg-slate-100" />}>
              <LandingAssessmentSection serverUser={mappedUser} />
            </Suspense>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

// Attach persistent layout
Welcome.layout = (page: React.ReactNode) => <RootLayout>{page}</RootLayout>;
