import React, { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { Navigation } from "@/Components/navigation";
import { Footer } from "@/Components/footer";
import { FeedbackWidget } from "@/Components/FeedbackWidget";
import RootLayout from "./RootLayout";
import { motion } from "motion/react";
import { Smartphone, RotateCw } from "lucide-react";
import { preloadAudioFiles } from "@/lib/audio";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { url } = usePage();
    const [isMobileLandscape, setIsMobileLandscape] = useState(false);

    useEffect(() => {
        // Only preload game sound effects on Kids / Game routes during browser idle time
        if (!url.startsWith('/kids') && !url.startsWith('/game')) return;

        const warmAudio = () => {
            preloadAudioFiles([
                '/sounds/click.mp3',
                '/sounds/tap.mp3',
                '/sounds/combo.mp3',
                '/sounds/win.mp3',
                '/sounds/wrong.mp3',
                '/sounds/match.mp3',
                '/sounds/spark.mp3',
                '/sounds/fire_extinguish.mp3',
                '/sounds/wood.mp3'
            ]);
        };

        if ('requestIdleCallback' in window) {
            const idleId = (window as any).requestIdleCallback(warmAudio, { timeout: 3000 });
            return () => (window as any).cancelIdleCallback?.(idleId);
        }
        const timerId = setTimeout(warmAudio, 2000);
        return () => clearTimeout(timerId);
    }, [url]);

    useEffect(() => {
        const handleResize = () => {
            const isTouch = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
            const isLandscape = window.innerWidth > window.innerHeight;
            // Mobile phones in landscape have very short screen heights (usually < 500px), 
            // while tablets (like iPads) have heights of 600px or more.
            const isPhoneHeight = window.innerHeight < 500;
            
            setIsMobileLandscape(isTouch && isLandscape && isPhoneHeight);
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("orientationchange", handleResize);
        handleResize(); // Initial check

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("orientationchange", handleResize);
        };
    }, []);

    return (
        <RootLayout>
            <div className="min-h-screen relative flex flex-col">
                <Navigation />
                <div className="flex-1 w-full text-scalable relative z-10 pt-[104px] sm:pt-[120px]">
                    {children}
                </div>
                <div className="relative z-50">
                    <Footer />
                    <FeedbackWidget />
                </div>
            </div>

            {/* Mobile-only Landscape Rotation Warning Overlay */}
            {isMobileLandscape && (
                <div className="fixed inset-0 z-[99999] bg-slate-950/98 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 text-center">
                    <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                        <motion.div
                            animate={{ 
                                rotate: [0, -90, -90, 0],
                            }}
                            transition={{ 
                                duration: 2.5, 
                                repeat: Infinity, 
                                ease: "easeInOut",
                                repeatDelay: 0.5
                            }}
                            className="text-orange-500"
                        >
                            <Smartphone className="w-16 h-16 stroke-[1.5]" />
                        </motion.div>
                        <motion.div
                            animate={{ 
                                opacity: [0.3, 1, 1, 0.3],
                                scale: [0.9, 1.1, 1.1, 0.9]
                            }}
                            transition={{ 
                                duration: 2.5, 
                                repeat: Infinity, 
                                ease: "easeInOut",
                                repeatDelay: 0.5
                            }}
                            className="absolute -top-1 -right-1 text-yellow-400"
                        >
                            <RotateCw className="w-6 h-6 animate-spin" style={{ animationDuration: '3s' }} />
                        </motion.div>
                    </div>
                    <h2 className="text-2xl font-black uppercase mb-3 tracking-wider text-orange-500">
                        Rotate Your Device
                    </h2>
                    <p className="text-slate-300 font-bold max-w-xs leading-relaxed text-sm">
                        Please turn your phone to portrait mode (vertical) to browse the website!
                    </p>
                </div>
            )}
        </RootLayout>
    );
}
