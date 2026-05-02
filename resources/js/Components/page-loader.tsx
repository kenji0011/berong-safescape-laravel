'use client';

import { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'motion/react';
import Image from '@/components/Image';
import { useAuth } from '@/lib/auth-context';

export function PageLoader() {
    const pathname = usePage().url;
    const searchParams = new URLSearchParams(window.location.search);
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticating, isLoggingOut } = useAuth();

    useEffect(() => {
        // Set loading to false after navigation completes
        setIsLoading(false);
    }, [pathname, searchParams]);

    useEffect(() => {
        // Listen for route change start and finish via Inertia events
        const removeStart = router.on('start', () => setIsLoading(true));
        const removeFinish = router.on('finish', () => setIsLoading(false));
        const removeNavigate = router.on('navigate', () => setIsLoading(false));

        return () => {
            removeStart();
            removeFinish();
            removeNavigate();
        };
    }, []);

    return (
        <AnimatePresence>
            {isLoading && !isAuthenticating && !isLoggingOut && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[999999] flex items-center justify-center"
                >
                    {/* Background Image and Red Overlay */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: "url('/web-background-image.jpg')" }}
                    >
                        <div className="absolute inset-0 bg-[#d60000]/90 backdrop-blur-sm" />
                    </div>

                    {/* Loader content */}
                    <div className="relative z-10 flex flex-col items-center">
                        {/* Berong Logo Spinner */}
                        <motion.div 
                            animate={{
                                scale: [1, 1.05, 1],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="relative mb-8"
                        >
                            {/* Outer spinning ring */}
                            <div className="absolute -inset-4 border-4 border-yellow-400/30 rounded-full"></div>
                            <div className="absolute -inset-4 border-4 border-transparent border-t-yellow-400 border-r-orange-500 rounded-full animate-spin"></div>

                            {/* Glow effect behind logo */}
                            <div className="absolute inset-0 bg-yellow-500/30 rounded-full blur-xl animate-pulse"></div>

                            {/* Berong Logo */}
                            <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-2xl border-4 border-yellow-400/50">
                                <img
                                    src="/berong-official-logo.jpg"
                                    alt="Berong - Loading"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </motion.div>

                        {/* Loading text */}
                        <div className="text-center flex flex-col items-center">
                            <motion.p 
                                className="text-white font-bold text-lg mb-1 tracking-wider"
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                Loading
                            </motion.p>
                            <div className="flex gap-1.5 justify-center mt-1">
                                <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
