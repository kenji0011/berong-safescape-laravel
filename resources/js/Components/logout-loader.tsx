'use client';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/lib/auth-context';
import Image from '@/Components/Image';

export function LogoutLoader() {
    const { isLoggingOut } = useAuth();

    return (
        <AnimatePresence>
            {isLoggingOut && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-[999999] flex items-center justify-center overflow-hidden"
                >
                    {/* Cinematic Fire Background */}
                    <div className="absolute inset-0 bg-[#450a0a]">
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.1, 0.2, 0.1]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-[#ef4444]/20"
                        />
                        <div 
                            className="absolute inset-0 opacity-20"
                            style={{ 
                                backgroundImage: "url('/web-background-image.jpg')", 
                                backgroundSize: 'cover', 
                                backgroundPosition: 'center' 
                            }}
                        />
                        <div className="absolute inset-0 bg-black/60" />
                    </div>

                    {/* Loader content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 1.1, opacity: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                        className="relative z-10 flex flex-col items-center"
                    >
                        {/* Hero Mascot with Bouncy Ring */}
                        <div className="relative mb-10">
                            {/* Outer Spinning Ring */}
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                className="absolute -inset-6 border-[6px] border-dashed border-yellow-300 rounded-full"
                            />
                            {/* Inner Pulsing Glow */}
                            <motion.div 
                                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -inset-2 bg-yellow-200/40 rounded-full"
                            />
                            
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-[2rem] overflow-hidden border-[6px] border-white shadow-[0_0_40px_rgba(250,204,21,0.5)] bg-white p-2"
                            >
                                <Image
                                    src="/berong_logout.png"
                                    alt="Berong Logging Out"
                                    className="w-full h-full object-contain drop-shadow-md"
                                    priority={true}
                                />
                            </motion.div>
                        </div>

                        {/* Text Content */}
                        <div className="text-center mt-6">
                            <motion.h2
                                className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-wide uppercase"
                                style={{ textShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                animate={{ opacity: [0.9, 1, 0.9], scale: [1, 1.02, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                Logging <span className="text-yellow-300">Out!</span>
                            </motion.h2>
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-white/90 font-bold tracking-wide text-sm sm:text-base bg-black/10 px-6 py-2 rounded-full backdrop-blur-sm uppercase"
                            >
                                Stay Safe, Hero! See you next time.
                            </motion.p>
                        </div>

                        {/* Fun Progress Line */}
                        <div className="mt-8 w-56 h-3 bg-white/30 rounded-full overflow-hidden border-2 border-white/40 shadow-inner">
                            <motion.div 
                                animate={{ x: [-250, 250] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="w-1/2 h-full bg-yellow-400 rounded-full shadow-[0_0_10px_#facc15]"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
