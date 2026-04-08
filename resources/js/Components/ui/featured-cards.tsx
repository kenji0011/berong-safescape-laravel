'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { PermissionGuard } from '@/components/permission-guard';
import TiltedCard from '@/components/ui/tilted-card';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Briefcase, Users, Baby } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

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
    color: 'from-blue-500 to-blue-700',
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
    color: 'from-orange-500 to-red-600',
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
    color: 'from-green-500 to-emerald-600',
  },
];

interface ServerUser {
  id: number;
  name: string;
  age?: number;
  role: string;
}

export function FeaturedCards({ serverUser }: { serverUser?: ServerUser | null } = {}) {
  const { user: clientUser } = useAuth();

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

    // 2. Professionals and Admins see ALL cards
    if (user.role === 'admin' || user.permissions?.accessProfessional) {
      return true;
    }

    // 3. Age-based filtering for standard users
    if (user.age !== undefined && user.age !== null) {
      if (user.age < 13) {
        // Kid (< 13): Show ONLY Kids card
        return card.requiredPermission === 'accessKids';
      } else {
        // Adult (>= 13): Show ONLY Adult card
        return card.requiredPermission === 'accessAdult';
      }
    }

    // 4. Logged in but no age info: Show all
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
              <div className="w-full bg-white rounded-3xl border-2 border-b-[6px] border-slate-800 p-4 transition-all hover:-translate-y-1 active:translate-y-1 active:border-b-[2px] active:mt-[4px] overflow-hidden relative">
                <div className="flex items-center gap-4">
                  {/* Icon Section */}
                  <div className={`bg-gradient-to-br ${card.color} h-16 w-16 rounded-2xl flex items-center justify-center text-white border-2 border-slate-800 shadow-[0_4px_0_#1e293b] shrink-0 group-hover:scale-105 transition-transform`}>
                    {card.icon}
                  </div>
                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-lg text-slate-800 leading-tight">{card.title}</h3>
                    <p className="text-[13px] font-bold text-slate-500 line-clamp-2 leading-snug mt-1 border-slate-800">{card.description}</p>
                  </div>
                </div>
                {/* Full Width Mobile Button */}
                <div className="mt-4 w-full bg-yellow-400 text-slate-900 border-2 border-b-[4px] border-slate-800 hover:bg-yellow-300 transition-colors font-black text-sm py-3 rounded-xl flex items-center justify-center gap-2">
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
                <div className="w-full flex flex-col bg-white rounded-3xl border-2 border-b-[8px] border-slate-800 overflow-hidden relative transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl active:translate-y-1 active:border-b-[4px] active:mt-[4px]">
                  
                  {/* Image Area */}
                  <div className="h-[200px] shrink-0 w-full border-b-2 border-slate-800 overflow-hidden relative">
                    <img 
                      src={card.imageUrl} 
                      alt={card.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors duration-500" />
                  </div>
                  
                  {/* Content Area */}
                  <div className="p-6 flex-1 flex flex-col relative bg-yellow-50 bg-opacity-50">
                    
                    {/* Floating Icon overlapping image and content */}
                    <div className={`absolute -top-10 right-6 h-16 w-16 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center text-white border-2 border-slate-800 shadow-[0_4px_0_#1e293b] group-hover:-translate-y-1 transition-transform z-10`}>
                      {card.icon}
                    </div>

                    <div className="pr-16"> {/* padding to avoid icon */}
                      <h3 className="text-xl lg:text-2xl font-black text-slate-800 leading-tight mb-2">
                        {card.title}
                      </h3>
                      <p className="text-sm font-bold text-slate-600 line-clamp-2">
                        {card.description}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                      <div className="w-full bg-[#d60000] text-white border-2 border-b-[4px] border-slate-800 group-hover:bg-[#b30000] transition-colors font-black text-sm py-3 rounded-xl flex items-center justify-center gap-2">
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
