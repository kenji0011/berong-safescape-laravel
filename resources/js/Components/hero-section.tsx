"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion, useInView } from "motion/react";
import { ChevronDown, Flame, Shield } from "lucide-react";
import Particles from "@/Components/ui/particles";

export function HeroSection() {
    const prefersReducedMotion = useReducedMotion();
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const reduceMotion = Boolean(prefersReducedMotion || isMobile);

    // Parallax scroll tracking
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });

    const bgY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 150]);
    const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
    const contentY = useTransform(scrollYProgress, [0, 0.6], [0, reduceMotion ? 0 : 80]);

    // Staggered word animation
    const headlineWords = ["Learn", "Fire", "Safety.", "Save", "Lives."];

    return (
        <section
            ref={sectionRef}
            className="relative w-full min-h-[50vh] sm:min-h-[70vh] flex flex-col items-center justify-center overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] mb-8 sm:mb-12"
        >
            {/* === Animated Background === */}
            <motion.div
                className="absolute inset-0 z-0 bg-slate-50 dark:bg-[#0B1120] transition-colors duration-500"
                style={{ y: bgY }}
            >
                {/* Modern Glow Effects */}
                <motion.div
                    className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-red-600/20 rounded-full blur-[120px]"
                    animate={reduceMotion ? {} : {
                        x: [0, 30, 0],
                        y: [0, -20, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-500/15 rounded-full blur-[100px]"
                    animate={reduceMotion ? {} : {
                        x: [0, -20, 0],
                        y: [0, 15, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.05]">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: "radial-gradient(circle at 2px 2px, #ffffff 1px, transparent 0)",
                            backgroundSize: "32px 32px",
                        }}
                    />
                </div>
            </motion.div>

            {/* === Fire Particles (desktop only) === */}
            {!isMobile && !reduceMotion && (
                <Particles
                    className="!absolute !inset-0 z-[1]"
                    quantity={35}
                    color={["#fbbf24"]}
                    size={2}
                    staticity={30}
                    ease={60}
                />
            )}

            {/* === Main Content === */}
            <motion.div
                className="relative z-10 flex flex-col items-center text-center px-4 sm:px-10 py-10 sm:py-24 max-w-4xl mx-auto"
                style={{ opacity: contentOpacity, y: contentY }}
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-6 sm:mb-8"
                >
                    <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-sm leading-snug">
                        <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-red-500" strokeWidth={2.5} />
                        <span className="sm:hidden">BFP — Sta. Cruz</span>
                        <span className="hidden sm:inline">Bureau of Fire Protection - Sta. Cruz, Laguna</span>
                    </span>
                </motion.div>

                {/* Animated Headline */}
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white leading-[0.95] tracking-tight mb-6 sm:mb-8 drop-shadow-md dark:drop-shadow-xl transition-colors duration-500">
                    {headlineWords.map((word, i) => (
                        <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                            animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                            transition={{
                                duration: 0.5,
                                delay: 0.2 + i * 0.1,
                                ease: [0.25, 0.46, 0.45, 0.94],
                            }}
                            className={`inline-block mr-[0.25em] ${
                                word === "Safety." || word === "Lives."
                                    ? "text-red-500 dark:text-yellow-300 drop-shadow-[0_2px_10px_rgba(239,68,68,0.3)] dark:drop-shadow-[0_4px_20px_rgba(253,224,71,0.4)]"
                                    : ""
                            }`}
                        >
                            {word}
                        </motion.span>
                    ))}
                </h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="text-base sm:text-xl md:text-2xl text-slate-700 dark:text-white/90 font-medium max-w-2xl leading-relaxed mb-8 sm:mb-10 px-2 transition-colors duration-500"
                >
                    Empowering every Filipino with interactive fire safety education - 
                    from kids to professionals.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 1.0 }}
                    className="flex justify-center"
                >
                    <button
                        onClick={() => {
                            document.getElementById("featured-section")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="group px-8 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white font-black text-xs sm:text-sm rounded-full shadow-lg hover:shadow-[0_10px_20px_rgba(220,38,38,0.3)] hover:-translate-y-1 active:translate-y-0 transition-all uppercase tracking-[0.15em] flex items-center gap-2"
                    >
                        <Flame className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                        Get Started
                    </button>
                </motion.div>
            </motion.div>


        </section>
    );
}
