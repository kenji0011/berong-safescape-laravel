"use client";

import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { FooterDialogContent } from '@/components/ui/footer-dialog';
import { useState } from 'react';

// Define types for footer links
type FooterLink = {
  name: string;
  url: string;
  dialogType?: 'contact' | 'about' | 'faq' | 'report' | 'privacy' | 'terms';
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

const footerColumns: FooterColumn[] = [
  {
    title: 'Customer Support',
    links: [
      { name: 'Contact Us', url: '#', dialogType: 'contact' },
      { name: 'FAQs', url: '#', dialogType: 'faq' },
      { name: 'Report an Issue', url: '#', dialogType: 'report' },
    ],
  },
  {
    title: 'Products & Solutions',
    links: [
      { name: 'For Professionals', url: '/professional' },
      { name: 'For Adults', url: '/adult' },
      { name: 'For Kids', url: '/kids' },
    ],
  },
  {
    title: 'Quick Links',
    links: [
      { name: 'Home', url: '/' },
      { name: 'About Us', url: '/about' },
      { name: 'Privacy Policy', url: '#', dialogType: 'privacy' },
      { name: 'Terms of Service', url: '#', dialogType: 'terms' },
    ],
  },
];

const socialMediaLinks = [
  { name: 'Facebook', url: 'https://www.facebook.com/bfpsantacruzfslaguna' },
];

const isLinkRestricted = (linkName: string, userRole: string | undefined): boolean => {
  if (!userRole) return false;
  if (userRole === 'admin') return false; // Admin has full access

  if (userRole === 'kid') {
    return linkName === 'For Professionals' || linkName === 'For Adults';
  }
  if (userRole === 'adult') {
    return linkName === 'For Kids' || linkName === 'For Professionals';
  }
  if (userRole === 'professional') {
    return linkName === 'For Kids';
  }

  return false;
};

export function Footer() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'contact' | 'about' | 'faq' | 'report' | 'privacy' | 'terms' | null>(null);

  const { auth } = usePage().props as any;
  const userRole = auth?.user?.role;

  const handleLinkClick = (link: FooterLink) => {
    // Extra safety check in JS handler
    if (isLinkRestricted(link.name, userRole)) return;

    if (link.dialogType) {
      setDialogType(link.dialogType);
      setDialogOpen(true);
    } else if (link.url && link.url.startsWith('/')) {
      window.location.href = link.url;
    } else if (link.url && link.url.startsWith('http')) {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. MOBILE ONLY FOOTER (Old Footer Design) - hidden on sm and above        */}
      {/* ========================================================================= */}
      <footer className="block sm:hidden bg-[#0f172a] text-white pt-6 pb-4 relative overflow-hidden">
        <style>{`
          .footer-link {
            transition: none !important;
            will-change: transform;
            backface-visibility: hidden;
          }
          @media (hover: hover) {
            .footer-link:not(:disabled):hover {
              color: white !important;
              transform: translateX(4px);
            }
          }
        `}</style>
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            {/* BFP Logo and Description Column */}
            <div className="col-span-2 pr-0">
              <div className="flex items-center gap-3">
                <img src="/berong_profile.png" alt="Berong Mascot" className="w-14 h-14 object-contain drop-shadow-md" />
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">BFP Berong</h3>
                  <p className="text-[13px] text-slate-400 leading-tight">Fire Safety Education<br/>Platform</p>
                </div>
              </div>
              <p className="mt-3 text-[14px] text-slate-400 font-medium leading-relaxed max-w-[300px]">
                Empowering communities with knowledge and skills for fire safety.
              </p>
              <div className="mt-3">
                {socialMediaLinks.map((social, index) => (
                  <Link key={index} href={social.url} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-white hover:bg-slate-200 text-black font-bold h-8 px-4 rounded-md text-[12px] shadow-sm transition-colors">
                      {social.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer Link Columns */}
            {footerColumns.map((column, index) => (
              <div key={index} className="col-span-1">
                <h4 className="text-[15px] font-bold text-white mb-3">{column.title}</h4>
                <ul className="space-y-1">
                  {column.links.map((link, linkIndex) => {
                    const isRestricted = isLinkRestricted(link.name, userRole);
                    return (
                      <li key={linkIndex}>
                        <button
                          onClick={() => handleLinkClick(link)}
                          disabled={isRestricted}
                          className={`footer-link text-[13px] font-medium block text-left w-full py-0.5 transition-colors duration-150 ${
                            isRestricted 
                              ? 'text-slate-600 cursor-not-allowed opacity-40' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {link.name}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-center items-center">
            <p className="text-[11px] text-slate-500 font-medium text-center">
              &copy; {new Date().getFullYear()} BFP Sta.Cruz Laguna. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 2. DESKTOP ONLY FOOTER (New Premium Footer Design) - hidden on mobile    */}
      {/* ========================================================================= */}
      <footer className="hidden sm:block relative bg-[#0a0f1c] text-white pt-20 pb-10 px-6 sm:px-12 lg:px-20 overflow-hidden w-full">
        <div className="max-w-[1600px] mx-auto relative z-10 w-full flex flex-col items-center">
          
          {/* 1. Tagline (Centered) */}
          <div className="w-full text-center mb-16 px-4">
            <p className="text-[14px] sm:text-[16px] text-slate-300 font-medium tracking-wide max-w-4xl mx-auto">
              Empowering communities with essential knowledge and interactive skills for fire safety.
            </p>
          </div>

          {/* 2. Sub-Category Links (Center Aligned) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-24 md:gap-32 lg:gap-40 mb-20 w-full max-w-5xl justify-items-center">
            {footerColumns.map((column, index) => (
              <div key={index} className="flex flex-col gap-6 items-center">
                <h4 className="text-[14px] sm:text-[15px] font-bold text-white tracking-wide uppercase opacity-90 text-center">
                  {column.title}
                </h4>
                <ul className="flex flex-col gap-3 items-center">
                  {column.links.map((link, linkIndex) => {
                    const isRestricted = isLinkRestricted(link.name, userRole);
                    return (
                      <li key={linkIndex}>
                        <button
                          onClick={() => handleLinkClick(link)}
                          disabled={isRestricted}
                          className={`text-[13px] sm:text-[14px] font-medium block text-center whitespace-nowrap will-change-colors transform translate-z-0 transition-colors duration-150 ease-out ${
                            isRestricted
                              ? 'text-slate-700 cursor-not-allowed opacity-45'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {link.name}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {column.title === 'Products & Solutions' && (
                  <div className="mt-4">
                    <a
                      href="https://www.facebook.com/bfpsantacruzfslaguna"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-1.5 bg-[#0b1329]/95 hover:bg-[#121c38]/95 border border-slate-800 hover:border-slate-700/80 rounded-full transition-[transform,background-color,border-color] duration-150 ease-out group hover:scale-[1.03] active:scale-95 shadow-md shadow-black/30 will-change-[transform,background-color] transform translate-z-0"
                    >
                      <div className="flex items-center justify-center w-5 h-5 bg-[#1877f2] rounded-full shrink-0 group-hover:scale-105 transition-transform duration-150 ease-out will-change-transform">
                        <svg className="w-2.5 h-2.5 text-white fill-current" viewBox="0 0 24 24">
                          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                        </svg>
                      </div>
                      <span className="text-[13px] font-semibold text-white tracking-wide select-none">
                        Facebook
                      </span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 3. Horizontal Divider */}
          <div className="w-full h-px bg-slate-800/60 mb-12"></div>

          {/* 4. Massive Mascot + Berong Unit */}
          <div className="w-full flex justify-center items-end mb-16 overflow-visible">
            <div className="flex items-end relative group">
              
              {/* MASCOT CONTAINER */}
              <div className="hidden sm:block shrink-0 w-auto pointer-events-none select-none mb-[8.5px]">
                <img 
                  src="/RD Logo.png" 
                  alt="Berong Mascot" 
                  className="w-auto h-[10vw] sm:h-[8vw] xl:h-[240px] object-contain drop-shadow-2xl"
                  draggable={false}
                />
              </div>
              
              {/* BERONG TYPOGRAPHY */}
              <h1 className="text-[28vw] sm:text-[24vw] xl:text-[340px] font-semibold tracking-tighter text-white leading-[0.75] select-none whitespace-nowrap ml-0 sm:-ml-[5vw] xl:-ml-[28px]">
                Berong
              </h1>
            </div>
          </div>

          {/* 5. Copyright */}
          <div className="w-full text-center">
            <p className="text-[12px] sm:text-[13px] text-slate-500 font-medium tracking-widest opacity-80">
              &copy; {new Date().getFullYear()} BFP Sta.Cruz Laguna. All rights reserved.
            </p>
          </div>

        </div>
      </footer>

      {/* Dialog Rendering */}
      {dialogOpen && (
        <FooterDialogContent
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          contentType={dialogType}
        />
      )}
    </>
  );
}