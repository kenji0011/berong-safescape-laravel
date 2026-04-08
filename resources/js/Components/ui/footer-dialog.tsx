'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Phone, Info, HelpCircle, AlertTriangle, ShieldCheck, FileText, Mail, MapPin } from 'lucide-react';

interface FooterDialogContentProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'contact' | 'about' | 'faq' | 'report' | 'privacy' | 'terms' | null;
}

export function FooterDialogContent({ isOpen, onClose, contentType }: FooterDialogContentProps) {
  // Define content based on the type
  const getContent = () => {
    switch (contentType) {
      case 'contact':
        return {
          title: 'Contact Us',
          description: 'Get in touch with our team for support and inquiries.',
          Icon: Phone
        };
      case 'about':
        return {
          title: 'About Us',
          description: 'Learn more about our mission to promote fire safety education.',
          Icon: Info
        };
      case 'faq':
        return {
          title: 'Frequently Asked Questions',
          description: 'Find answers to common questions about our platform and services.',
          Icon: HelpCircle
        };
      case 'report':
        return {
          title: 'Report an Issue',
          description: 'Report any issues or problems with our platform.',
          Icon: AlertTriangle
        };
      case 'privacy':
        return {
          title: 'Privacy Policy',
          description: 'Our commitment to protecting your privacy and personal information.',
          Icon: ShieldCheck
        };
      case 'terms':
        return {
          title: 'Terms of Service',
          description: 'Terms and conditions for using our platform.',
          Icon: FileText
        };
      default:
        return {
          title: '',
          description: '',
          Icon: Info
        };
    }
  };

  const { title, description, Icon } = getContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl w-[95vw] max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] rounded-[2rem] border-2 border-b-[8px] border-slate-200 p-6 md:p-8">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className={`border-2 p-3 rounded-2xl shadow-sm ${
                contentType === 'contact' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                contentType === 'about' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                contentType === 'faq' ? 'bg-purple-50 border-purple-100 text-purple-600' :
                contentType === 'report' ? 'bg-orange-50 border-orange-100 text-orange-600' :
                contentType === 'privacy' ? 'bg-green-50 border-green-100 text-green-600' :
                'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <Icon className="h-7 w-7" strokeWidth={2.5} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-extrabold text-slate-800 text-left">{title}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-slate-600 font-medium leading-relaxed text-left pl-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-5 text-slate-700 font-medium">
          {contentType === 'contact' && (
            <div className="space-y-4">
              <p className="px-1 text-slate-600">For general inquiries, please reach out to us:</p>
              <div className="grid gap-3">
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-300 transition-colors">
                  <div className="bg-blue-50 p-2.5 rounded-xl"><Mail className="w-5 h-5 text-blue-500" /></div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-400">Email</h4>
                    <p className="font-bold text-slate-800">stacruzfire@yahoo.com</p>
                  </div>
                </div>
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-300 transition-colors">
                  <div className="bg-blue-50 p-2.5 rounded-xl"><Phone className="w-5 h-5 text-blue-500" /></div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-400">Phone</h4>
                    <p className="font-bold text-slate-800">0967 052 8897</p>
                  </div>
                </div>
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-300 transition-colors">
                  <div className="bg-blue-50 p-2.5 rounded-xl"><MapPin className="w-5 h-5 text-blue-500" /></div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-400">Address</h4>
                    <p className="font-bold text-slate-800">Bureau of Fire Protection, Sta. Cruz, Laguna</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {contentType === 'about' && (
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 space-y-4">
              <p>The BFP Berong platform is an educational initiative by the Bureau of Fire Protection Sta. Cruz, Laguna.</p>
              <p>Our mission is to provide comprehensive fire safety education to different sectors of the community through interactive and engaging content.</p>
              <p>We aim to reduce fire-related incidents by increasing awareness and preparedness among citizens of all ages.</p>
            </div>
          )}
          
          {contentType === 'faq' && (
            <div className="space-y-4">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-sm hover:border-purple-300 transition-all">
                <h4 className="font-extrabold text-slate-800">How can I access the professional content?</h4>
                <p className="pt-2 text-[13px] text-slate-500 leading-relaxed font-medium">Professional content is available to verified BFP personnel and certified fire safety professionals.</p>
              </div>
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-sm hover:border-purple-300 transition-all">
                <h4 className="font-extrabold text-slate-800">Is this platform free to use?</h4>
                <p className="pt-2 text-[13px] text-slate-500 leading-relaxed font-medium">Yes, our platform is completely free to use for educational purposes.</p>
              </div>
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-sm hover:border-purple-300 transition-all">
                <h4 className="font-extrabold text-slate-800">How often is the content updated?</h4>
                <p className="pt-2 text-[13px] text-slate-500 leading-relaxed font-medium">Our content is regularly updated to reflect the latest fire safety regulations and best practices.</p>
              </div>
            </div>
          )}
          
          {contentType === 'report' && (
            <div className="space-y-4">
              <p className="px-1 text-slate-600">If you encounter any issues with our platform, please report them using our contact:</p>
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 space-y-3 text-orange-900 shadow-inner">
                <div className="flex items-center gap-3"><div className="h-2 w-2 rounded-full bg-orange-400" /><p>Technical problems or bugs</p></div>
                <div className="flex items-center gap-3"><div className="h-2 w-2 rounded-full bg-orange-400" /><p>Inaccurate information</p></div>
                <div className="flex items-center gap-3"><div className="h-2 w-2 rounded-full bg-orange-400" /><p>Content suggestions</p></div>
                <div className="flex items-center gap-3"><div className="h-2 w-2 rounded-full bg-orange-400" /><p>Accessibility concerns</p></div>
              </div>
              <p className="pt-2 px-1 text-sm text-slate-500 font-bold italic">We will review all reports and respond as soon as possible.</p>
            </div>
          )}
          
          {contentType === 'privacy' && (
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 space-y-4 text-[13px] leading-relaxed">
              <p className="text-sm font-bold text-slate-800">At BFP Berong, we are committed to protecting your privacy and safeguarding your personal information.</p>
              <div className="pt-2">
                  <h4 className="font-extrabold text-slate-800 text-[15px] mb-1">Information We Collect</h4>
                  <p className="text-slate-500">We collect information necessary to provide you with the best educational experience, including account information and learning progress.</p>
              </div>
              <div className="pt-2">
                  <h4 className="font-extrabold text-slate-800 text-[15px] mb-1">How We Use Your Information</h4>
                  <p className="text-slate-500">Your information is used solely for educational purposes and to improve our platform's content and functionality.</p>
              </div>
            </div>
          )}
          
          {contentType === 'terms' && (
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 space-y-4 text-[13px] leading-relaxed">
              <p className="text-sm font-bold text-slate-800">These terms govern your use of the BFP Berong educational platform.</p>
              <div className="pt-2">
                  <h4 className="font-extrabold text-slate-800 text-[15px] mb-1">Acceptable Use</h4>
                  <p className="text-slate-500">You agree to use this platform for educational purposes only and not to distribute harmful or inappropriate content.</p>
              </div>
              <div className="pt-2">
                  <h4 className="font-extrabold text-slate-800 text-[15px] mb-1">Content Ownership</h4>
                  <p className="text-slate-500">All educational content is owned by the Bureau of Fire Protection Sta.Cruz Laguna and is provided for educational purposes.</p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-end mt-2">
          <Button 
            type="button" 
            onClick={onClose} 
            className="w-full sm:w-auto bg-[#d60000] text-white font-extrabold px-8 py-2.5 h-auto rounded-xl shadow-[0_4px_0_#991b1b] hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-none transition-all outline-none border-2 border-[#ff3b3b]"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
