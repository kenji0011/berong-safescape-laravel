'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { Link } from '@inertiajs/react';
import { PermissionGuard } from '@/components/permission-guard';
import { ArrowRight, Briefcase, Users, Baby, Flame } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { FeaturedCardsSkeleton } from '@/components/dashboard-skeletons';

// Define the type for a featured card item
type FeaturedCardItem = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  hoverImageUrl?: string;
  link: string;
  requiredPermission: 'accessKids' | 'accessAdult' | 'accessProfessional' | 'isAdmin';
  icon: React.ReactNode;
  color: string;
  btn: string;
  gradient: string;
  accentBorder: string;
};

// Mock data for featured cards - this will be replaced by dynamic data or defined constants
const mockFeaturedCards: FeaturedCardItem[] = [
  {
    id: 1,
    title: 'Professional Learning',
    btn: 'For Professionals',
    description: 'Access comprehensive fire safety codes, standards, and professional training materials.',
    imageUrl: '/prof_learning.jpg',
    hoverImageUrl: '/prof_preview.jpg',
    link: '/professional',
    requiredPermission: 'accessProfessional',
    icon: <Briefcase className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />,
    color: 'bg-red-600',
    gradient: 'from-red-600 to-rose-700',
    accentBorder: 'hover:border-red-400/50',
  },
  {
    id: 2,
    title: 'Adult Learning',
    btn: 'For Adults',
    description: 'Learn essential fire safety practices for your home, family, and workplace.',
    imageUrl: '/adult_card.png',
    hoverImageUrl: '/adults_preview.jpg',
    link: '/adult',
    requiredPermission: 'accessAdult',
    icon: <Users className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />,
    color: 'bg-orange-600',
    gradient: 'from-orange-500 to-amber-600',
    accentBorder: 'hover:border-orange-400/50',
  },
  {
    id: 3,
    title: 'Kids Learning',
    btn: 'For Kids',
    description: 'Fun and interactive modules to teach children about fire safety.',
    imageUrl: '/kids_card.png',
    hoverImageUrl: '/kids_preview.jpg',
    link: '/kids',
    requiredPermission: 'accessKids',
    icon: <Baby className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />,
    color: 'bg-emerald-600',
    gradient: 'from-emerald-500 to-teal-600',
    accentBorder: 'hover:border-emerald-400/50',
  },
];

interface ServerUser {
  id: number;
  name: string;
  age?: number;
  role: string;
}

// Animated Card Component
function AnimatedFeaturedCard({
  card,
  index,
  reduceMotion,
  isBento = false,
  isRestricted = false,
}: {
  card: FeaturedCardItem;
  index: number;
  reduceMotion: boolean;
  isBento?: boolean;
  isRestricted?: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const cardContent = (
    <div className={`w-full flex flex-col bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden relative transition-all duration-300 border-2 border-white/60 dark:border-slate-700/60 ${isRestricted ? '' : card.accentBorder} shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] ${isRestricted ? 'grayscale opacity-50' : 'group-hover:-translate-y-2 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-active:translate-y-0 group-active:shadow-[0_4px_20px_rgba(0,0,0,0.06)]'}`}>

      {/* Full Card Hover Overlay */}
      {card.hoverImageUrl && (
        <div className={`absolute inset-0 z-20 pointer-events-none transition-all duration-500 ease-out opacity-0 ${isRestricted ? '' : 'group-hover:opacity-100'}`}>
          <img
            src={card.hoverImageUrl}
            alt={`${card.title} hover preview`}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out scale-110 ${isRestricted ? '' : 'group-hover:scale-100'}`}
          />
          {/* Dark gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90 transition-opacity duration-500" />
        </div>
      )}

      {/* Image Area */}
      <div className="h-[140px] sm:h-[200px] shrink-0 w-full overflow-hidden relative bg-slate-900">
        <img
          src={card.imageUrl}
          alt={card.title}
          fetchpriority="high"
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${isRestricted ? '' : 'group-hover:scale-110'}`}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col relative z-30 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm transition-all duration-500 group-hover:bg-transparent dark:group-hover:bg-transparent group-hover:backdrop-blur-none">

        {/* Floating Icon */}
        <div className={`absolute -top-7 sm:-top-8 right-4 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 bg-gradient-to-br ${card.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg ${isRestricted ? '' : 'group-hover:opacity-0 group-hover:scale-75 group-hover:-translate-y-4'} transition-all duration-500 z-10 border-2 border-white/30`}>
          {card.icon}
        </div>

        <div className="pr-14 sm:pr-16 group-hover:pr-0 transition-all duration-500">
          <h3 className={`text-lg sm:text-xl lg:text-2xl font-black text-slate-800 dark:text-white leading-tight mb-1.5 sm:mb-2 transition-all duration-500 ${isRestricted ? '' : 'group-hover:text-white group-hover:drop-shadow-lg group-hover:-translate-y-2'}`}>
            {card.title}
          </h3>
          <div className={`transition-all duration-500 overflow-hidden ${isRestricted ? '' : 'group-hover:max-h-0 group-hover:opacity-0'} max-h-[4rem]`}>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {card.description}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-4 sm:pt-5 transition-transform duration-500 group-hover:-translate-y-2">
          {isRestricted ? (
            <div className="w-full bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 font-extrabold text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 tracking-wide uppercase cursor-not-allowed">
              🔒 Locked
            </div>
          ) : (
            <div className={`w-full bg-gradient-to-r ${card.gradient} text-white font-extrabold text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.15)] transition-all group-hover:-translate-y-0.5 group-hover:shadow-[0_6px_0_rgba(0,0,0,0.15)] group-active:translate-y-[4px] group-active:shadow-[0_0px_0_rgba(0,0,0,0.15)] flex items-center justify-center gap-2 tracking-wide uppercase`}>
              {card.btn}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={3} />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.5,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="h-full"
    >
      {isRestricted ? (
        <div className="flex w-full h-full cursor-not-allowed">
          {cardContent}
        </div>
      ) : (
        <PermissionGuard requiredPermission={card.requiredPermission} targetPath={card.link}>
          <Link href={card.link} prefetch={false} className="outline-none flex w-full h-full group">
            {cardContent}
          </Link>
        </PermissionGuard>
      )}
    </motion.div>
  );
}

// Mobile Card Component  
function MobileAnimatedCard({
  card,
  index,
  reduceMotion,
  isRestricted = false,
}: {
  card: FeaturedCardItem;
  index: number;
  reduceMotion: boolean;
  isRestricted?: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  const cardContent = (
    <div className={`w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-4 transition-all duration-300 overflow-hidden relative border-2 border-white/60 dark:border-slate-700/60 shadow-[0_4px_15px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_15px_rgba(0,0,0,0.3)] ${isRestricted ? 'grayscale opacity-50' : 'group-hover:-translate-y-1 group-active:translate-y-[2px] group-active:shadow-none'}`}>
      <div className="flex items-center gap-4">
        {/* Icon Section */}
        <div className={`bg-gradient-to-br ${card.gradient} h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 ${isRestricted ? '' : 'group-hover:scale-105 group-hover:rotate-3'} transition-all duration-300 border border-white/20`}>
          {card.icon}
        </div>
        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3 className={`font-black text-base text-slate-800 dark:text-white leading-tight transition-colors ${isRestricted ? '' : 'group-hover:text-red-600 dark:group-hover:text-orange-400'}`}>{card.title}</h3>
          <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug mt-1 transition-colors">{card.description}</p>
        </div>
      </div>
      {/* Full Width Mobile Button */}
      {isRestricted ? (
        <div className="mt-3 w-full bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 tracking-wide uppercase cursor-not-allowed">
          🔒 Locked
        </div>
      ) : (
        <div className={`mt-3 w-full bg-gradient-to-r ${card.gradient} text-white font-extrabold text-xs py-2.5 rounded-xl shadow-[0_3px_0_rgba(0,0,0,0.15)] transition-all group-hover:-translate-y-0.5 group-hover:shadow-[0_5px_0_rgba(0,0,0,0.15)] group-active:translate-y-[3px] group-active:shadow-[0_0px_0_rgba(0,0,0,0.15)] flex items-center justify-center gap-2 tracking-wide uppercase`}>
          {card.btn}
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={3} />
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: "easeOut",
      }}
    >
      {isRestricted ? (
        <div className="block w-full cursor-not-allowed">
          {cardContent}
        </div>
      ) : (
        <PermissionGuard requiredPermission={card.requiredPermission} targetPath={card.link}>
          <Link href={card.link} prefetch={false} className="outline-none block w-full group">
            {cardContent}
          </Link>
        </PermissionGuard>
      )}
    </motion.div>
  );
}

export function FeaturedCards({ serverUser }: { serverUser?: ServerUser | null } = {}) {
  const { user: clientUser, isLoading } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const reduceMotion = Boolean(prefersReducedMotion || isMobile);

  if (isLoading) {
    return <FeaturedCardsSkeleton />;
  }

  // Use client user if available, otherwise reconstruct from serverUser
  const user = clientUser || (serverUser ? {
    ...serverUser,
    permissions: serverUser.role === 'admin'
      ? { accessKids: true, accessAdult: true, accessProfessional: true, isAdmin: true }
      : serverUser.role === 'professional'
        ? { accessKids: true, accessAdult: true, accessProfessional: true, isAdmin: false }
        : serverUser.role === 'adult'
          ? { accessKids: false, accessAdult: true, accessProfessional: false, isAdmin: false }
          : serverUser.role === 'kid'
            ? { accessKids: true, accessAdult: false, accessProfessional: false, isAdmin: false }
            : { accessKids: false, accessAdult: false, accessProfessional: false, isAdmin: false }
  } as any : null);

  // Determine if a card is restricted (greyed out) for the current user
  const isCardRestricted = (card: FeaturedCardItem): boolean => {
    // Not logged in or admin — all cards accessible
    if (!user || user.role === 'admin') return false;

    if (user.role === 'kid') {
      // Kids can only access Kids
      return card.requiredPermission !== 'accessKids';
    }
    if (user.role === 'adult') {
      // Adults can only access Adult
      return card.requiredPermission !== 'accessAdult';
    }
    if (user.role === 'professional') {
      // Professionals can access Adult + Professional
      return card.requiredPermission === 'accessKids';
    }

    return false;
  };

  // Always show all 3 cards
  const visibleCards = mockFeaturedCards;

  return (
    <div ref={sectionRef} className="max-w-7xl mx-auto px-4">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 sm:mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 mb-4">
          <Flame className="h-3.5 w-3.5 text-red-500" strokeWidth={2.5} />
          <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">Choose Your Path</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tight">
          Start Your <span className="text-red-500">Fire Safety</span> Journey
        </h2>
      </motion.div>

      {/* Mobile: Staggered animated cards */}
      <div className="md:hidden space-y-3">
        {visibleCards.map((card, index) => (
          <MobileAnimatedCard
            key={card.id}
            card={card}
            index={index}
            reduceMotion={reduceMotion}
            isRestricted={isCardRestricted(card)}
          />
        ))}
      </div>

      {/* Desktop: Bento grid with glassmorphism */}
      <div
        className={`hidden md:grid gap-6 w-full ${
          visibleCards.length === 1
            ? 'grid-cols-1 max-w-md mx-auto'
            : visibleCards.length === 2
              ? 'grid-cols-2 max-w-4xl mx-auto'
              : 'grid-cols-3 max-w-6xl mx-auto'
        }`}
      >
        {visibleCards.map((card, index) => (
          <AnimatedFeaturedCard
            key={card.id}
            card={card}
            index={index}
            reduceMotion={reduceMotion}
            isBento={visibleCards.length >= 3}
            isRestricted={isCardRestricted(card)}
          />
        ))}
      </div>
    </div>
  );
}
