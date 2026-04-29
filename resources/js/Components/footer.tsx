"use client";

import { Link } from '@inertiajs/react';
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

// Mock data for footer columns - this will be replaced by dynamic data or defined constants
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

// Social media links
const socialMediaLinks = [
  { name: 'Facebook', url: 'https://www.facebook.com/bfpsantacruzfslaguna' },
];

export function Footer() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'contact' | 'about' | 'faq' | 'report' | 'privacy' | 'terms' | null>(null);

  const handleLinkClick = (link: FooterLink) => {
    if (link.dialogType) {
      setDialogType(link.dialogType);
      setDialogOpen(true);
    } else if (link.url && link.url.startsWith('/')) {
      // For navigation links, use next/link behavior
      window.location.href = link.url;
    } else if (link.url && link.url.startsWith('http')) {
      // For external links, open in new tab
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <footer className="bg-[#0f172a] text-white pt-6 pb-4 sm:pt-12 sm:pb-8 relative overflow-hidden">
      <style>{`
        .footer-link {
          transition: none !important;
          will-change: transform;
          backface-visibility: hidden;
        }
        @media (hover: hover) {
          .footer-link:hover {
            color: white !important;
            transform: translateX(4px);
          }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 sm:gap-x-8 sm:gap-y-10">
          {/* BFP Logo and Description Column */}
          <div className="col-span-2 md:col-span-1 pr-0 sm:pr-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <img src="/berong_profile.png" alt="Berong Mascot" className="w-14 h-14 sm:w-18 sm:h-18 object-contain drop-shadow-md" />
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">BFP Berong</h3>
                <p className="text-[13px] sm:text-sm text-slate-400 leading-tight">Fire Safety Education<br/>Platform</p>
              </div>
            </div>
            <p className="mt-3 sm:mt-4 text-[14px] sm:text-[15px] text-slate-400 font-medium leading-relaxed max-w-[300px]">
              Empowering communities with knowledge and skills for fire safety.
            </p>
            <div className="mt-3 sm:mt-4">
              {socialMediaLinks.map((social, index) => (
                <Link key={index} href={social.url} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-white md:hover:bg-slate-200 text-black font-bold h-8 sm:h-9 px-4 sm:px-5 rounded-md text-[12px] sm:text-[13px] shadow-sm transition-colors">
                    {social.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Footer Link Columns */}
          {footerColumns.map((column, index) => (
            <div key={index} className="col-span-1">
              <h4 className="text-[15px] sm:text-[16px] font-bold text-white mb-3 sm:mb-4">{column.title}</h4>
              <ul className="space-y-1 sm:space-y-1.5">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <button
                      onClick={() => handleLinkClick(link)}
                      className="footer-link text-[13px] sm:text-[14px] text-slate-400 font-medium block text-left w-full py-0.5 sm:py-1"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 sm:mt-10 pt-4 sm:pt-6 border-t border-slate-800/60 flex justify-center items-center">
          <p className="text-[11px] sm:text-[13px] text-slate-500 font-medium text-center">
            &copy; {new Date().getFullYear()} BFP Sta.Cruz Laguna. All rights reserved.
          </p>
        </div>
      </div>
      {dialogOpen && (
        <FooterDialogContent
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          contentType={dialogType}
        />
      )}
    </footer>
  );
}
