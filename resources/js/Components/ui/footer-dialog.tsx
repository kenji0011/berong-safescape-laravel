'use client';

import React, { useEffect } from 'react';
import { Mail, Phone, MapPin, X, Loader2, Info, HelpCircle, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';

const DIALOG_DATA = {
  contact: { title: 'Contact Us', description: 'Get in touch with our team for support and inquiries.', Icon: Phone, color: 'text-blue-500' },
  about: { title: 'About Us', description: 'Our mission and vision.', Icon: Info, color: 'text-amber-500' },
  faq: { title: 'Frequently Asked Questions', description: 'Find answers to common questions about our platform and services.', Icon: HelpCircle, color: 'text-purple-500' },
  report: { title: 'Report an Issue', description: 'Report any issues or problems with our platform.', Icon: AlertTriangle, color: 'text-orange-500' },
  privacy: { title: 'Privacy Policy', description: 'Our commitment to protecting your privacy and personal information.', Icon: ShieldCheck, color: 'text-green-500' },
  terms: { title: 'Terms of Service', description: 'Terms and conditions for using our platform.', Icon: FileText, color: 'text-slate-500' }
};

interface FooterDialogContentProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: keyof typeof DIALOG_DATA | null;
}

export function FooterDialogContent({ isOpen, onClose, contentType }: FooterDialogContentProps) {
  // Lock scroll when open - simple and effective
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !contentType) return null;

  const data = DIALOG_DATA[contentType];

  // Bypassing Radix UI completely for a "Zero-Overhead" native modal with hardware acceleration
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop - Hardware accelerated to prevent layout repaint & input lag */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-150 will-change-[backdrop-filter,opacity] transform translate-z-0" 
        onClick={onClose}
      />
      
      {/* Modal Body - Hardware accelerated zoom-in transition */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform animate-in zoom-in-95 duration-200 will-change-[transform,opacity] translate-z-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <data.Icon className={`w-5 h-5 ${data.color}`} />
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">{data.title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 md:hover:bg-slate-100 md:dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-hide text-slate-600 dark:text-slate-400">
          <p className="font-bold mb-4">{data.description}</p>
          
          <div className="space-y-4">
            {contentType === 'contact' && (
               <div className="space-y-4">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">For general inquiries, please reach out to us:</p>
                  <div className="space-y-3">
                    {[
                      { icon: Mail, label: 'Email', val: 'stacruzfire@yahoo.com' },
                      { icon: Phone, label: 'Phone', val: '0967 052 8897' },
                      { icon: MapPin, label: 'Address', val: 'Bureau of Fire Protection, Sta. Cruz, Laguna' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors md:hover:bg-slate-100 md:dark:hover:bg-slate-900">
                        <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                          <item.icon className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">{item.label}</span>
                          <span className="text-sm font-bold text-slate-800 dark:text-white leading-relaxed">{item.val}</span>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            )}
            
            {contentType === 'about' && <p>BFP Berong is a fire safety platform by BFP Sta. Cruz Laguna. We educate through interactive technology.</p>}
            {contentType === 'faq' && (
              <div className="space-y-6">
                {[
                  { 
                    q: "How can I access the professional content?", 
                    a: "Professional content is available to verified BFP personnel and certified fire safety professionals." 
                  },
                  { 
                    q: "Is this platform free to use?", 
                    a: "Yes, our platform is completely free to use for educational purposes." 
                  },
                  { 
                    q: "How often is the content updated?", 
                    a: "Our content is regularly updated to reflect the latest fire safety regulations and best practices." 
                  }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <h4 className="text-sm font-black text-slate-800 dark:text-white leading-tight">{item.q}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.a}</p>
                    {i < 2 && <div className="pt-4 border-b border-slate-100 dark:border-slate-800/50" />}
                  </div>
                ))}
              </div>
            )}
            {contentType === 'privacy' && (
              <div className="space-y-6">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">At BFP Berong, we are committed to protecting your privacy and safeguarding your personal information.</p>
                
                {[
                  { 
                    title: "Information We Collect", 
                    text: "We collect information necessary to provide you with the best educational experience, including account information and learning progress." 
                  },
                  { 
                    title: "How We Use Your Information", 
                    text: "Your information is used solely for educational purposes and to improve our platform's content and functionality." 
                  },
                  { 
                    title: "Data Security", 
                    text: "We implement appropriate security measures to protect your information against unauthorized access or alteration." 
                  }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.title}</h4>
                    <p className="text-sm font-bold text-slate-800 dark:text-white leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            )}
            {contentType === 'terms' && (
              <div className="space-y-6">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">These terms govern your use of the BFP Berong educational platform.</p>
                
                {[
                  { 
                    title: "Acceptable Use", 
                    text: "You agree to use this platform for educational purposes only and not to distribute harmful or inappropriate content." 
                  },
                  { 
                    title: "Content Ownership", 
                    text: "All educational content is owned by the Bureau of Fire Protection Sta. Cruz Laguna and is provided for educational purposes." 
                  }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.title}</h4>
                    <p className="text-sm font-bold text-slate-800 dark:text-white leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            )}
            {contentType === 'report' && (
              <div className="space-y-4">
                <p className="text-sm font-medium">If you encounter any issues with our platform, please report them using our contact:</p>
                <div className="space-y-2 pl-4">
                  {[
                    'Technical problems or bugs',
                    'Inaccurate information',
                    'Content suggestions',
                    'Accessibility concerns'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      <span className="text-sm font-bold text-slate-800 dark:text-white">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium pt-2 text-slate-500 dark:text-slate-400">
                  We will review all reports and respond as soon as possible.
                </p>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Support Email</p>
                  <p className="text-sm font-bold text-blue-500">stacruzfire@yahoo.com</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-red-600 md:hover:bg-red-700 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
