import React, { useEffect } from "react"
import { Head } from '@inertiajs/react'

export default function ModuleTwoPage({ moduleNum }: { moduleNum: number }) {
  const currentModule = moduleNum || 2

  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;

      const data = e.data;
      if (data && data.type === 'SAFESCAPE_SECTION_COMPLETE') {
        try {
          // Send progress payload to the backend
          await fetch("/api/kids/safescape", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "X-XSRF-TOKEN": document.cookie.match(new RegExp("(^| )XSRF-TOKEN=([^;]+)"))?.[2] ? decodeURIComponent(document.cookie.match(new RegExp("(^| )XSRF-TOKEN=([^;]+)"))![2]) : ""
            },
            body: JSON.stringify({
              moduleNum: data.moduleNum,
              sectionData: data.sectionData,
              completed: data.completed
            }),
          })
        } catch (error) {
          console.error("Failed to sync progress:", error)
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    const iframe = e.target as HTMLIFrameElement;
    try {
      if (!iframe.contentWindow) return;
      const iframeDoc = iframe.contentWindow.document;

      // Force background color to match full page mapping
      iframeDoc.body.style.backgroundColor = '#0f1729'; // slate-900 

      // 1. Hide legacy HTML navigation to prevent overlapping headers
      const nav = iframeDoc.querySelector('.ss-nav') as HTMLElement;
      if (nav) nav.style.display = 'none';

      // 2. Intercept legacy <a> tags inside HTML so it redirects natively to our React router app
      const links = iframeDoc.querySelectorAll('a');
      links.forEach(link => {
        link.addEventListener('click', (ev) => {
          ev.preventDefault();
          const href = link.getAttribute('href');
          if (!href) return;
          
          if (href.includes('index.html') && href.includes('../')) {
            const match = href.match(/module_(\d+)/);
            if (match) {
              window.parent.location.href = `/kids/safescape/${match[1]}`;
            } else {
              window.parent.location.href = '/kids/safescape';
            }
          }
        });
      });
    } catch(err) {
      console.warn("Iframe manipulation restriction or error", err);
    }
  }

  return (
    <>
      <Head title={`Module ${currentModule} | SafeScape`} />
      <div className="fixed inset-0 w-screen h-screen z-50 bg-slate-900 m-0 p-0 overflow-hidden">
        
        {/* Floating Back Button - Overlaid on top of the iframe */}
        <button 
          onClick={() => window.parent.location.href = '/kids/safescape'}
          className="absolute top-4 left-4 z-[999] bg-slate-800/90 hover:bg-slate-700 hover:scale-105 text-white px-5 py-2.5 rounded-full font-black shadow-2xl shadow-black/50 backdrop-blur-sm flex items-center gap-2 border-2 border-slate-600 transition-all text-sm tracking-wide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          BACK TO DASHBOARD
        </button>

        <iframe 
          src={`/modules/module_${currentModule}/index.html`}
          className="w-full h-full border-none m-0 p-0"
          onLoad={handleIframeLoad}
          allow="fullscreen; autoplay; encrypted-media"
          title={`SafeScape Module ${currentModule}`}
        />
      </div>
    </>
  )
}

