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
    <div className={`w-full flex flex-col bg-white dark:bg-[#0B1120] rounded-[2rem] overflow-hidden relative transition-all duration-500 border border-slate-200 dark:border-slate-800 shadow-xl ${isRestricted ? 'grayscale opacity-50' : 'group-hover/card:-translate-y-3 group-hover/card:shadow-[0_30px_60px_rgba(0,0,0,0.12)] dark:group-hover/card:shadow-[0_30px_60px_rgba(0,0,0,0.6)] group-hover/card:dark:border-slate-700/80'}`}>

      {/* Full Card Hover Overlay */}
      {card.hoverImageUrl && (
        <div className={`absolute inset-0 z-20 pointer-events-none transition-all duration-700 ease-out opacity-0 ${isRestricted ? '' : 'group-hover/card:opacity-100'}`}>
          <img
            src={card.hoverImageUrl}
            alt={`${card.title} hover preview`}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out scale-110 ${isRestricted ? '' : 'group-hover/card:scale-100'}`}
          />
          {/* Dark gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-95 transition-opacity duration-700" />
        </div>
      )}

      {/* Image Area */}
      <div className="h-[180px] sm:h-[220px] shrink-0 w-full overflow-hidden relative bg-slate-900">
        <img
          src={card.imageUrl}
          alt={card.title}
          fetchpriority="high"
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out ${isRestricted ? '' : 'group-hover/card:scale-110'}`}
        />
        {/* Sleek Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent mix-blend-multiply" />
      </div>

      {/* Content Area */}
      <div className="p-5 sm:p-8 flex-1 flex flex-col relative z-30 transition-all duration-500 bg-transparent">

        {/* Floating Icon */}
        <div className={`absolute -top-8 sm:-top-10 right-6 sm:right-8 h-14 w-14 sm:h-16 sm:w-16 bg-gradient-to-br ${card.gradient} rounded-[1.25rem] sm:rounded-2xl shadow-xl flex items-center justify-center text-white ${isRestricted ? '' : 'group-hover/card:-translate-y-2 group-hover/card:scale-110 group-hover/card:rotate-6'} transition-all duration-500 z-10 border-4 border-white dark:border-[#0B1120]`}>
          {card.icon}
        </div>

        <div className="pr-16 sm:pr-20 transition-all duration-500 relative z-10">
          <h3 className={`text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-2 sm:mb-3 transition-colors duration-300 ${isRestricted ? '' : 'group-hover/card:text-white'}`}>
            {card.title}
          </h3>
          <div className="transition-all duration-500">
            <p className={`text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 transition-colors duration-300 ${isRestricted ? '' : 'group-hover/card:text-slate-300'}`}>
              {card.description}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-6 transition-all duration-500">
          {isRestricted ? (
            <div className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 font-extrabold text-xs sm:text-sm py-3.5 sm:py-4 rounded-xl flex items-center justify-center tracking-[0.15em] uppercase cursor-not-allowed">
              🔒 Locked
            </div>
          ) : (
            <div className={`w-full bg-gradient-to-r ${card.gradient} text-white font-black text-xs sm:text-sm py-3.5 sm:py-4 rounded-xl shadow-lg transition-all flex items-center justify-center tracking-[0.15em] uppercase ${isRestricted ? '' : 'group-hover/card:shadow-[0_10px_20px_rgba(0,0,0,0.2)] group-hover/card:-translate-y-1'}`}>
              {card.btn}
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
        <div className="flex w-full h-full cursor-not-allowed group/card">
          {cardContent}
        </div>
      ) : (
        <PermissionGuard requiredPermission={card.requiredPermission} targetPath={card.link}>
          <Link href={card.link} prefetch={false} className="outline-none flex w-full h-full group/card">
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
        className="text-center mb-10 sm:mb-14"
      >
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 mb-6 shadow-sm">
          <Flame className="h-4 w-4 text-red-500" strokeWidth={2.5} />
          <span className="text-[10px] sm:text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-[0.2em]">Choose Your Path</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-tight">
          Start Your <span className="text-red-500 drop-shadow-sm">Fire Safety</span> Journey
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
