"use client";

import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { FooterDialogContent } from '@/components/ui/footer-dialog';
import { useRef, useState, useEffect } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useAuth, User } from '@/lib/auth-context';

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

const isLinkRestricted = (linkName: string, user: User | null): boolean => {
  if (!user) return false;
  if (user.role && user.role.split(',').includes('admin')) return false; // Admin has full access

  if (linkName === 'For Professionals') {
    return !user.permissions?.accessProfessional;
  }
  if (linkName === 'For Adults') {
    return !user.permissions?.accessAdult;
  }
  if (linkName === 'For Kids') {
    return !user.permissions?.accessKids;
  }

  return false;
};

// Animated Footer Link with arrow on hover
function FooterLinkItem({ link, isRestricted, onClick, isMobile = false }: {
  link: FooterLink;
  isRestricted: boolean;
  onClick: () => void;
  isMobile?: boolean;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        disabled={isRestricted}
        className={`group/link flex items-center gap-1.5 text-[13px] sm:text-[14px] font-medium text-left justify-start w-full whitespace-nowrap transition-all duration-200 ${
          isRestricted
            ? 'text-slate-700 cursor-not-allowed opacity-40'
            : 'text-slate-400 hover:text-white'
        }`}
      >

        {link.name}
      </button>
    </li>
  );
}

export function Footer() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'contact' | 'about' | 'faq' | 'report' | 'privacy' | 'terms' | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const { user } = useAuth();

  // Scroll-into-view detection for desktop footer
  const desktopFooterRef = useRef(null);
  const isDesktopInView = useInView(desktopFooterRef, { once: true, margin: "-80px" });

  // Scroll-into-view detection for mobile footer
  const mobileFooterRef = useRef(null);
  const isMobileInView = useInView(mobileFooterRef, { once: true, margin: "-40px" });

  const reduceMotion = Boolean(prefersReducedMotion);

  const handleLinkClick = (link: FooterLink) => {
    // Extra safety check in JS handler
    if (isLinkRestricted(link.name, user)) return;

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
      {/* 1. MOBILE ONLY FOOTER — Modern Animated Design                            */}
      {/* ========================================================================= */}
      <footer ref={mobileFooterRef} className="block sm:hidden relative text-white pt-8 pb-5 overflow-hidden">
        {/* Breathing gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1c] via-[#0f1729] to-[#0a0f1c] footer-breathing-bg" />
        
        {/* Floating ambient blobs */}
        <motion.div
          className="absolute top-[-10%] right-[-5%] w-[60%] h-[40%] bg-red-500/[0.04] rounded-full blur-3xl pointer-events-none"
          animate={reduceMotion ? {} : { x: [0, 20, 0], y: [0, -15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[35%] bg-orange-500/[0.04] rounded-full blur-3xl pointer-events-none"
          animate={reduceMotion ? {} : { x: [0, -15, 0], y: [0, 10, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.4) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }} />

        {/* Premium Bottom Edge Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-red-600/10 via-orange-500/5 to-transparent pointer-events-none" />
        <motion.div 
          className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[100%] h-[200px] bg-gradient-to-r from-red-600/20 via-orange-500/20 to-red-600/20 blur-[80px] rounded-[100%] pointer-events-none"
          animate={reduceMotion ? {} : { opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="max-w-7xl mx-auto px-5 relative z-10">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isMobileInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
                <img src="/berong_profile.png" alt="Berong Mascot" className="w-12 h-12 object-contain drop-shadow-md" />
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-wide">SafeScape</h3>
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest">Fire Safety Education</p>
              </div>
            </div>
            <p className="text-[13px] text-slate-400 font-medium leading-relaxed max-w-[300px]">
              Empowering communities with knowledge and skills for fire safety.
            </p>
          </motion.div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 mb-6">
            {footerColumns.map((column, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={isMobileInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.15 + index * 0.1 }}
                className="col-span-1"
              >
                <h4 className="text-[11px] font-black text-white mb-2.5 uppercase tracking-widest">{column.title}</h4>
                <ul className="space-y-1.5">
                  {column.links.map((link, linkIndex) => (
                    <FooterLinkItem
                      key={linkIndex}
                      link={link}
                      isRestricted={isLinkRestricted(link.name, user)}
                      onClick={() => handleLinkClick(link)}
                      isMobile
                    />
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Social + Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isMobileInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-5">
              {socialMediaLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-slate-800 hover:border-slate-600 rounded-full transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center w-5 h-5 bg-[#1877f2] rounded-full shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-2.5 h-2.5 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                    </svg>
                  </div>
                  <span className="text-[12px] font-semibold text-slate-300 group-hover:text-white transition-colors">{social.name}</span>
                </a>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-800/60 text-center">
              <p className="text-[10px] text-slate-600 font-semibold tracking-widest uppercase">
                &copy; {new Date().getFullYear()} BFP Sta.Cruz Laguna. All rights reserved.
              </p>
            </div>
          </motion.div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 2. DESKTOP ONLY FOOTER — Premium Animated Design                          */}
      {/* ========================================================================= */}
      <footer ref={desktopFooterRef} className="hidden sm:block relative text-white pt-[120px] pb-10 px-6 sm:px-12 lg:px-20 overflow-hidden w-full min-h-screen">
        {/* Breathing gradient background */}
        <style>{`
          @keyframes footerBreathing {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .footer-breathing-bg {
            background-size: 200% 200%;
            animation: footerBreathing 12s ease-in-out infinite;
          }
        `}</style>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1c] via-[#0f1729] to-[#0a0f1c] footer-breathing-bg" />

        {/* Floating ambient blobs */}
        <motion.div
          className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-red-500/[0.03] rounded-full blur-3xl"
          animate={reduceMotion ? {} : { x: [0, 20, 0], y: [0, -15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-orange-500/[0.03] rounded-full blur-3xl"
          animate={reduceMotion ? {} : { x: [0, -15, 0], y: [0, 10, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.5) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }} />

        {/* Premium Bottom Edge Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-gradient-to-t from-red-600/10 via-orange-500/5 to-transparent pointer-events-none" />
        <motion.div 
          className="absolute bottom-[-250px] left-1/2 -translate-x-1/2 w-[80%] max-w-[1200px] h-[500px] bg-gradient-to-r from-red-600/20 via-orange-500/20 to-red-600/20 blur-[120px] rounded-[100%] pointer-events-none"
          animate={reduceMotion ? {} : { opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />



        <div className="max-w-[1600px] mx-auto relative z-10 w-full flex flex-col items-center min-h-[calc(100vh-160px)] justify-between">
          
          {/* 1. Tagline (Centered) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isDesktopInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full text-center mb-10 mt-6 px-4"
          >
            <p className="text-[14px] sm:text-[16px] text-slate-400 font-medium tracking-wide max-w-4xl mx-auto leading-relaxed">
              Empowering communities with essential knowledge and interactive skills for fire safety.
            </p>
          </motion.div>

          {/* 2. Sub-Category Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-24 md:gap-32 lg:gap-40 mb-6 w-full max-w-5xl justify-items-center">
            {footerColumns.map((column, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isDesktopInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="flex flex-col gap-5 items-start"
              >
                {/* Animated underline on header */}
                <div className="relative">
                  <h4 className="text-[12px] sm:text-[13px] font-black text-white tracking-[0.2em] uppercase text-left">
                    {column.title}
                  </h4>
                </div>
                <ul className="flex flex-col gap-2.5 items-start w-full">
                  {column.links.map((link, linkIndex) => (
                    <FooterLinkItem
                      key={linkIndex}
                      link={link}
                      isRestricted={isLinkRestricted(link.name, user)}
                      onClick={() => handleLinkClick(link)}
                    />
                  ))}
                </ul>
                {column.title === 'Products & Solutions' && (
                  <motion.div
                    className="mt-2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isDesktopInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >
                    <a
                      href="https://www.facebook.com/bfpsantacruzfslaguna"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2 bg-white/5 hover:bg-[#1877f2]/15 border border-slate-700/50 hover:border-[#1877f2]/40 rounded-full transition-all duration-300 group hover:scale-105 active:scale-95 shadow-lg shadow-black/20"
                    >
                      <div className="flex items-center justify-center w-5 h-5 bg-[#1877f2] rounded-full shrink-0 group-hover:shadow-[0_0_12px_rgba(24,119,242,0.5)] transition-shadow duration-300">
                        <svg className="w-2.5 h-2.5 text-white fill-current" viewBox="0 0 24 24">
                          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                        </svg>
                      </div>
                      <span className="text-[13px] font-semibold text-slate-300 group-hover:text-white tracking-wide select-none transition-colors">
                        Facebook
                      </span>
                    </a>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* 3. Animated Gradient Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isDesktopInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full h-px mb-12 bg-gradient-to-r from-transparent via-slate-700/60 to-transparent"
          />

          {/* 4. Massive Mascot + Berong Unit — Scroll-triggered reveal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isDesktopInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="w-full flex justify-center items-end mb-6 overflow-visible"
          >
            <div className="flex items-end relative group">
              {/* MASCOT CONTAINER — slides in from left */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={isDesktopInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
                className="hidden sm:block shrink-0 w-auto pointer-events-none select-none mb-[79px] -mr-[1vw] xl:-mr-[13px]"
              >
                <img 
                  src="/RD Logo.png" 
                  alt="Berong Mascot" 
                  className="w-auto h-[10vw] sm:h-[8vw] xl:h-[220px] object-contain drop-shadow-2xl"
                  draggable={false}
                />
              </motion.div>
              
              {/* BERONG TYPOGRAPHY — modernized font */}
              <h1 className="text-[24vw] xl:text-[300px] font-black tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40 leading-[0.95] pb-[0.15em] select-none whitespace-nowrap" style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}>
                Berong
              </h1>
            </div>
          </motion.div>

          {/* 5. Copyright */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isDesktopInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 1.0 }}
            className="w-full text-center relative pt-8 mt-4"
          >
            {/* Premium Gradient Divider */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 max-w-xl h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent blur-[2px]" />
            
            <p className="text-[11px] sm:text-[12px] text-slate-400 font-semibold tracking-[0.2em] uppercase relative z-10 drop-shadow-sm">
              &copy; {new Date().getFullYear()} BFP Sta.Cruz Laguna. All rights reserved.
            </p>
          </motion.div>

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