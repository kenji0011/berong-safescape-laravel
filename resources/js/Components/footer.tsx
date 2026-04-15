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
    <footer className="bg-[#0f172a] text-white pt-12 pb-8 sm:pt-16 sm:pb-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-12">
          {/* BFP Logo and Description Column */}
          <div className="col-span-2 md:col-span-1 pr-0 sm:pr-6">
            <div className="flex items-center gap-4">
              <img src="/berong_profile.png" alt="Berong Mascot" className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-md" />
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">BFP Berong</h3>
                <p className="text-sm text-slate-400 leading-tight mt-0.5">Fire Safety Education<br/>Platform</p>
              </div>
            </div>
            <p className="mt-6 text-sm md:text-[15px] text-slate-400 font-medium leading-relaxed max-w-[280px]">
              Empowering communities with knowledge and skills for fire safety.
            </p>
            <div className="mt-5">
              {socialMediaLinks.map((social, index) => (
                <Link key={index} href={social.url} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-white hover:bg-slate-200 text-black font-bold h-9 px-5 rounded-md text-[13px] shadow-sm transition-colors">
                    {social.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Footer Link Columns */}
          {footerColumns.map((column, index) => (
            <div key={index} className="col-span-1">
              <h4 className="text-base font-bold text-white mb-5">{column.title}</h4>
              <ul className="space-y-1.5">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <button
                      onClick={() => handleLinkClick(link)}
                      className="text-sm md:text-[15px] text-slate-400 hover:text-white font-medium transition-colors block text-left w-full py-1.5"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800/60 flex justify-center items-center">
          <p className="text-[13px] text-slate-500 font-medium">
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
