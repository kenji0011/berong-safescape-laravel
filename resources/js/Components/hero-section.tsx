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
                className="absolute inset-0 z-0"
                style={{ y: bgY }}
            >
                {/* Base gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-orange-500 to-amber-500 dark:from-red-900 dark:via-orange-800 dark:to-amber-900" />

                {/* Animated overlay blobs */}
                <motion.div
                    className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-white/10 rounded-full blur-3xl"
                    animate={reduceMotion ? {} : {
                        x: [0, 30, 0],
                        y: [0, -20, 0],
                        scale: [1, 1.15, 1],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-yellow-400/10 rounded-full blur-3xl"
                    animate={reduceMotion ? {} : {
                        x: [0, -20, 0],
                        y: [0, 15, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Dot pattern overlay */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)",
                        backgroundSize: "32px 32px",
                    }}
                />
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
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white font-bold text-xs sm:text-sm uppercase tracking-widest shadow-lg text-center leading-snug">
                        <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" strokeWidth={2.5} />
                        <span className="sm:hidden">BFP — Sta. Cruz, Laguna</span>
                        <span className="hidden sm:inline">Bureau of Fire Protection — Sta. Cruz, Laguna</span>
                    </span>
                </motion.div>

                {/* Animated Headline */}
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight mb-6 sm:mb-8 drop-shadow-xl">
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
                                    ? "text-yellow-300 drop-shadow-[0_4px_20px_rgba(253,224,71,0.4)]"
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
                    className="text-base sm:text-xl md:text-2xl text-white/90 font-medium max-w-2xl leading-relaxed mb-8 sm:mb-10 px-2"
                >
                    Empowering every Filipino with interactive fire safety education — 
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
                        className="group px-8 sm:px-10 py-3 sm:py-4 bg-white text-red-600 font-extrabold text-sm sm:text-base rounded-full border-2 border-white shadow-[0_4px_0_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:shadow-[0_8px_0_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-wide flex items-center gap-2"
                    >
                        <Flame className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
                        Get Started
                    </button>
                </motion.div>
            </motion.div>


        </section>
    );
}
