'use client';

import React, { useEffect } from 'react';
import { Mail, Phone, MapPin, X, Loader2, Info, HelpCircle, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';

const DIALOG_DATA = {
  contact: { title: 'Contact Us', description: 'Get in touch for support.', Icon: Phone, color: 'text-blue-500' },
  about: { title: 'About Us', description: 'Our mission and vision.', Icon: Info, color: 'text-amber-500' },
  faq: { title: 'FAQs', description: 'Common questions.', Icon: HelpCircle, color: 'text-purple-500' },
  report: { title: 'Report Issue', description: 'Help us improve.', Icon: AlertTriangle, color: 'text-orange-500' },
  privacy: { title: 'Privacy Policy', description: 'Data protection.', Icon: ShieldCheck, color: 'text-green-500' },
  terms: { title: 'Terms of Service', description: 'Rules of use.', Icon: FileText, color: 'text-slate-500' }
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

  // Bypassing Radix UI completely for a "Zero-Overhead" native modal
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop - Hardware accelerated */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Body - Simple Div, no complex portal logic */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform animate-in zoom-in-95 duration-200">
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
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-hide text-slate-600 dark:text-slate-400">
          <p className="font-bold mb-4">{data.description}</p>
          
          <div className="space-y-4">
            {contentType === 'contact' && (
               <div className="space-y-3">
                  {[
                    { icon: Mail, label: 'Email', val: 'stacruzfire@yahoo.com' },
                    { icon: Phone, label: 'Phone', val: '0967 052 8897' },
                    { icon: MapPin, label: 'Address', val: 'Sta. Cruz, Laguna' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      <item.icon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-bold text-slate-800 dark:text-white">{item.val}</span>
                    </div>
                  ))}
               </div>
            )}
            
            {contentType === 'about' && <p>BFP Berong is a fire safety platform by BFP Sta. Cruz Laguna. We educate through interactive technology.</p>}
            {contentType === 'faq' && <p>All modules are free. You can access them by logging in as a Kid, Adult, or Professional.</p>}
            {contentType === 'privacy' && <p>We respect your privacy. Data is used only for training progress and BFP analytics.</p>}
            {contentType === 'terms' && <p>Educational use only. Content is property of BFP Sta. Cruz Laguna.</p>}
            {contentType === 'report' && <p>Send screenshots of any bugs to stacruzfire@yahoo.com</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
