'use client';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/lib/auth-context';
import Image from '@/components/Image';

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
                                opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#ef4444_0%,transparent_70%)]"
                        />
                        <div 
                            className="absolute inset-0 opacity-20"
                            style={{ 
                                backgroundImage: "url('/web-background-image.jpg')", 
                                backgroundSize: 'cover', 
                                backgroundPosition: 'center' 
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60" />
                    </div>

                    {/* Loader content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 1.1, opacity: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                        className="relative z-10 flex flex-col items-center"
                    >
                        {/* Hero Logo with Spinning Ring */}
                        <div className="relative mb-10">
                            {/* Outer Spinning Ring */}
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute -inset-4 border-2 border-dashed border-orange-500/40 rounded-full"
                            />
                            {/* Inner Pulsing Glow */}
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -inset-2 bg-orange-500/20 blur-xl rounded-full"
                            />
                            
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white/20 shadow-[0_0_40px_rgba(249,115,22,0.4)]"
                            >
                                <Image
                                    src="/berong-official-logo.jpg"
                                    alt="Berong - Logging Out"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </motion.div>
                        </div>

                        {/* Text Content */}
                        <div className="text-center">
                            <motion.h2
                                className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tighter uppercase"
                                animate={{ opacity: [0.8, 1, 0.8] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                Logging <span className="text-orange-500">Out</span>
                            </motion.h2>
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-white/60 font-bold tracking-widest text-xs sm:text-sm uppercase"
                            >
                                Stay Safe, Hero! See you next time.
                            </motion.p>
                        </div>

                        {/* Modern Progress Line */}
                        <div className="mt-8 w-48 h-1 bg-white/10 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                                animate={{ x: [-200, 200] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="w-1/2 h-full bg-gradient-to-r from-transparent via-orange-500 to-transparent"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
