import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import RootLayout from '@/Layouts/RootLayout';
import { Navigation } from '@/components/navigation';
import { HeroCarousel } from '@/components/ui/hero-carousel';
import { FeaturedCards } from '@/components/ui/featured-cards';
import { Footer } from '@/components/footer';
import { LandingAboutSection } from '@/components/landing-about-section';
import { LandingAssessmentSection } from '@/components/landing-assessment-section';

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
      <Head title="Berong E-Learning for BFP Sta Cruz">
        {carouselImages && carouselImages.length > 0 && (
          <link rel="preload" as="image" href={carouselImages[0].imageUrl} fetchPriority="high" />
        )}
      </Head>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[80px] sm:pt-[96px] pb-6 sm:pb-8 w-full">
          <section className="mb-8 sm:mb-12">
            <HeroCarousel initialImages={carouselImages} />
          </section>

          <section className="mb-10 sm:mb-12">
            <FeaturedCards serverUser={mappedUser} />
          </section>

          <section className="mb-16 sm:mb-24 mt-8 sm:mt-12">
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
