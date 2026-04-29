'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { PermissionGuard } from '@/components/permission-guard';
import TiltedCard from '@/components/ui/tilted-card';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Briefcase, Users, Baby } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { FeaturedCardsSkeleton } from '@/components/dashboard-skeletons';

// Define the type for a featured card item
type FeaturedCardItem = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  requiredPermission: 'accessKids' | 'accessAdult' | 'accessProfessional' | 'isAdmin';
  icon: React.ReactNode;
  color: string;
  btn: string;
};

// Mock data for featured cards - this will be replaced by dynamic data fetching
const mockFeaturedCards: FeaturedCardItem[] = [
  {
    id: 1,
    title: 'Professional Learning',
    btn: 'For Professionals',
    description: 'Access comprehensive fire safety codes, standards, and professional training materials.',
    imageUrl: '/professional_card.png',
    link: '/professional',
    requiredPermission: 'accessProfessional',
    icon: <Briefcase className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />,
    color: 'bg-blue-600',
  },
  {
    id: 2,
    title: 'Adult Learning',
    btn: 'For Adults',
    description: 'Learn essential fire safety practices for your home, family, and workplace.',
    imageUrl: '/adult_card.png',
    link: '/adult',
    requiredPermission: 'accessAdult',
    icon: <Users className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />,
    color: 'bg-orange-600',
  },
  {
    id: 3,
    title: 'Kids Learning',
    btn: 'For Kids',
    description: 'Fun and interactive modules to teach children about fire safety.',
    imageUrl: '/kids_card.png',
    link: '/kids',
    requiredPermission: 'accessKids',
    icon: <Baby className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />,
    color: 'bg-emerald-600',
  },
];

interface ServerUser {
  id: number;
  name: string;
  age?: number;
  role: string;
}

export function FeaturedCards({ serverUser }: { serverUser?: ServerUser | null } = {}) {
  const { user: clientUser, isLoading } = useAuth();

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

  const visibleCards = mockFeaturedCards.filter(card => {
    // 1. Not logged in — hide cards entirely
    if (!user) {
      return false;
    }

    // 2. Admins see ALL cards
    if (user.role === 'admin') {
      return true;
    }

    // 3. Hide Kids card for non-kid roles (Professional and Adult)
    if (card.requiredPermission === 'accessKids' && user.role !== 'kid') {
      return false;
    }

    // 4. Permission-based check for the rest
    if (card.requiredPermission === 'accessProfessional') return !!user.permissions?.accessProfessional;
    if (card.requiredPermission === 'accessAdult') return !!user.permissions?.accessAdult;
    if (card.requiredPermission === 'accessKids') return !!user.permissions?.accessKids;

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Mobile: Horizontal compact cards */}
      <div className="md:hidden space-y-4">
        {visibleCards.map((card) => (
          <React.Fragment key={card.id}>
          <PermissionGuard requiredPermission={card.requiredPermission} targetPath={card.link}>
            <Link href={card.link} prefetch={false} className="outline-none block w-full group">
              <div className="w-full bg-white dark:bg-slate-800 rounded-3xl p-4 transition-all duration-300 overflow-hidden relative shadow-[0_6px_0_#cbd5e1] dark:shadow-[0_6px_0_#0f172a] group-hover:-translate-y-1 group-hover:shadow-[0_10px_0_#cbd5e1] dark:group-hover:shadow-[0_10px_0_#0f172a] group-active:translate-y-[6px] group-active:shadow-[0_0px_0_#cbd5e1] dark:group-active:shadow-none">
                <div className="flex items-center gap-4">
                  {/* Icon Section */}
                  <div className={`${card.color} h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-[0_4px_0_rgba(0,0,0,0.15)] shrink-0 group-hover:scale-105 transition-transform`}>
                    {card.icon}
                  </div>
                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-lg text-slate-800 dark:text-white leading-tight transition-colors">{card.title}</h3>
                    <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug mt-1 transition-colors">{card.description}</p>
                  </div>
                </div>
                {/* Full Width Mobile Button */}
                <div className="mt-4 w-full bg-[#e11d48] text-white font-extrabold text-sm py-2 rounded-full shadow-[0_4px_0_#9f1239] transition-all group-hover:-translate-y-0.5 group-hover:shadow-[0_6px_0_#9f1239] group-active:translate-y-[4px] group-active:shadow-[0_0px_0_#9f1239] flex items-center justify-center gap-2 tracking-wide uppercase">
                  {card.btn}
                  <ArrowRight className="h-4 w-4" strokeWidth={3} />
                </div>
              </div>
            </Link>
          </PermissionGuard>
          </React.Fragment>
        ))}
      </div>

      {/* Tablet & Desktop: Neobrutalist cards */}
      <div
        className={`hidden md:grid gap-8 p-4 w-full ${visibleCards.length === 1
          ? 'grid-cols-1 max-w-md mx-auto'
          : visibleCards.length === 2
            ? 'grid-cols-2 max-w-4xl mx-auto'
            : 'grid-cols-3 max-w-6xl mx-auto'
          }`}
      >
        {visibleCards.map((card) => (
          <div key={card.id} className="h-full">
            <PermissionGuard requiredPermission={card.requiredPermission} targetPath={card.link}>
              <Link href={card.link} prefetch={false} className="outline-none flex w-full h-full group">
                <div className="w-full flex flex-col bg-white dark:bg-slate-800 rounded-3xl overflow-hidden relative transition-all duration-300 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] group-hover:-translate-y-2 group-hover:shadow-[0_14px_0_#cbd5e1] dark:group-hover:shadow-[0_14px_0_#0f172a] group-active:translate-y-[8px] group-active:shadow-[0_0px_0_#cbd5e1] dark:group-active:shadow-none">
                  
                  {/* Image Area */}
                  <div className="h-[200px] shrink-0 w-full overflow-hidden relative">
                    <img 
                      src={card.imageUrl} 
                      alt={card.title} 
                      decoding="async"
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500" />
                  </div>
                  
                  {/* Content Area */}
                  <div className="p-6 flex-1 flex flex-col relative bg-slate-50 dark:bg-slate-800/50 transition-colors duration-500">
                    
                    {/* Floating Icon overlapping image and content */}
                    <div className={`absolute -top-10 right-6 h-16 w-16 ${card.color} rounded-2xl flex items-center justify-center text-white shadow-[0_4px_0_rgba(0,0,0,0.15)] group-hover:-translate-y-1 transition-transform z-10`}>
                      {card.icon}
                    </div>

                    <div className="pr-16"> {/* padding to avoid icon */}
                      <h3 className="text-xl lg:text-2xl font-black text-slate-800 dark:text-white leading-tight mb-2 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-400 line-clamp-2 transition-colors">
                        {card.description}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                      <div className="w-full bg-[#e11d48] text-white font-extrabold text-sm py-2 rounded-full shadow-[0_4px_0_#9f1239] transition-all group-hover:-translate-y-0.5 group-hover:shadow-[0_6px_0_#9f1239] group-active:translate-y-[4px] group-active:shadow-[0_0px_0_#9f1239] flex items-center justify-center gap-2 tracking-wide uppercase mt-6">
                        {card.btn}
                        <ArrowRight className="h-4 w-4" strokeWidth={3} />
                      </div>
                    </div>
                    
                  </div>
                </div>
              </Link>
            </PermissionGuard>
          </div>
        ))}
      </div>
    </div>
  );
}
