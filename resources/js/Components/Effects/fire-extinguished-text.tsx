"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";

interface FireExtinguishedTextProps {
    text: string;
    className?: string;
    replayTrigger?: number;
}

// Cartoon Multi-Layer Flame SVG
function CartoonFlame({
    size = 24,
    color = "#F97316",
    innerColor = "#FBBF24",
    delay = 0,
    duration = 0.5,
    xDrift = 0,
}: {
    size?: number;
    color?: string;
    innerColor?: string;
    delay?: number;
    duration?: number;
    xDrift?: number;
}) {
    return (
        <motion.svg
            viewBox="0 0 28 36"
            width={size}
            height={size * 1.3}
            className="absolute pointer-events-none drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]"
            style={{ bottom: "60%", left: "50%", marginLeft: -size / 2 }}
            animate={{
                y: [0, -(size * 0.9 + Math.random() * 8), -(size * 1.3 + Math.random() * 12)],
                x: [0, xDrift * 0.6, xDrift],
                scale: [0.8, 1.25, 0.2],
                opacity: [1, 0.9, 0],
                rotate: [0, xDrift > 0 ? 15 : -15, 0],
            }}
            transition={{
                duration,
                repeat: Infinity,
                delay,
                ease: "easeOut",
            }}
        >
            {/* Outer Flame */}
            <path
                d="M14 0C14 0 2 13 2 22C2 29 7.5 36 14 36C20.5 36 26 29 26 22C26 13 14 0 14 0Z"
                fill={color}
            />
            {/* Mid Flame */}
            <path
                d="M14 8C14 8 5.5 17 5.5 24C5.5 29 9.3 33.5 14 33.5C18.7 33.5 22.5 29 22.5 24C22.5 17 14 8 14 8Z"
                fill={innerColor}
            />
            {/* Hot Inner White/Yellow Core */}
            <path
                d="M14 16C14 16 9 22 9 26.5C9 29.5 11.2 31.5 14 31.5C16.8 31.5 19 29.5 19 26.5C19 22 14 16 14 16Z"
                fill="#FEF08A"
                opacity={0.95}
            />
        </motion.svg>
    );
}

// Rising Ember Spark
function EmberSpark({ delay = 0 }: { delay?: number }) {
    const xDist = (Math.random() - 0.5) * 28;
    const yDist = 30 + Math.random() * 35;
    const size = 3 + Math.random() * 3;

    return (
        <motion.div
            className="absolute rounded-full bg-amber-300 pointer-events-none shadow-[0_0_8px_#f59e0b]"
            style={{
                width: size,
                height: size,
                bottom: "75%",
                left: "50%",
            }}
            animate={{
                y: [0, -yDist],
                x: [0, xDist * 0.5, xDist],
                opacity: [1, 0.8, 0],
                scale: [1, 1.4, 0.2],
            }}
            transition={{
                duration: 0.6 + Math.random() * 0.4,
                repeat: Infinity,
                delay,
                ease: "easeOut",
            }}
        />
    );
}

// Cartoon Sizzling Steam Puff
function CartoonSteam({ delay = 0, xOffset = 0 }: { delay?: number; xOffset?: number }) {
    const size = 16 + Math.random() * 18;
    const xDrift = (Math.random() - 0.5) * 36 + xOffset;

    return (
        <motion.div
            className="absolute pointer-events-none rounded-full bg-slate-100/85 dark:bg-slate-200/80 shadow-[0_0_12px_rgba(255,255,255,0.7)] backdrop-blur-xs"
            style={{
                width: size,
                height: size,
                bottom: "70%",
                left: "50%",
                marginLeft: -size / 2,
            }}
            initial={{ scale: 0.3, opacity: 0.9, y: 0, x: 0 }}
            animate={{
                y: [0, -35 - Math.random() * 25, -60 - Math.random() * 20],
                x: [0, xDrift * 0.5, xDrift],
                scale: [0.3, 1.8, 2.6],
                opacity: [0.9, 0.6, 0],
            }}
            transition={{
                duration: 0.85 + Math.random() * 0.35,
                ease: "easeOut",
                delay,
            }}
        />
    );
}

// Water Splash Droplet
function WaterSplashParticle({ delay = 0, angle = 0, speed = 30 }: { delay?: number; angle?: number; speed?: number }) {
    const rad = (angle * Math.PI) / 180;
    const targetX = Math.cos(rad) * speed;
    const targetY = Math.sin(rad) * speed;

    return (
        <motion.div
            className="absolute pointer-events-none rounded-full bg-sky-300 shadow-[0_0_6px_#38bdf8]"
            style={{
                width: 4 + Math.random() * 3,
                height: 4 + Math.random() * 3,
                left: "50%",
                top: "50%",
            }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
                x: [0, targetX],
                y: [0, targetY + 15], // gravity pull
                scale: [1, 1.3, 0],
                opacity: [1, 0.8, 0],
            }}
            transition={{
                duration: 0.45 + Math.random() * 0.2,
                ease: "easeOut",
                delay,
            }}
        />
    );
}

// Sparkle Star for Clean State
function SparkleStar({ delay = 0 }: { delay?: number }) {
    return (
        <motion.div
            className="absolute pointer-events-none text-yellow-300 z-20"
            style={{
                top: `${Math.random() * 60}%`,
                left: `${Math.random() * 80 + 10}%`,
            }}
            initial={{ scale: 0, rotate: 0, opacity: 0 }}
            animate={{
                scale: [0, 1.3, 0],
                rotate: [0, 90, 180],
                opacity: [0, 1, 0],
            }}
            transition={{
                duration: 0.7,
                delay,
                ease: "easeOut",
            }}
        >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.9)]" />
        </motion.div>
    );
}

// Cartoon Firefighter Extinguisher Nozzle
function FirefighterNozzle() {
    return (
        <div className="relative flex items-center select-none pointer-events-none">
            {/* Nozzle Body */}
            <div className="relative flex items-center">
                {/* Hose Grip (Red) */}
                <div className="w-7 h-4 sm:w-9 sm:h-5 bg-red-600 rounded-l-md border-2 border-red-800 shadow-[inset_0_2px_0_rgba(255,255,255,0.4)] flex items-center justify-center">
                    <div className="w-1 h-3 bg-red-900/60 rounded-full mx-0.5" />
                    <div className="w-1 h-3 bg-red-900/60 rounded-full mx-0.5" />
                </div>
                {/* Brass Coupling */}
                <div className="w-2.5 h-5 sm:w-3 sm:h-6 bg-amber-400 border-2 border-amber-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]" />
                {/* Tapered Nozzle Tip */}
                <div className="w-4 h-3 sm:w-5 sm:h-4 bg-slate-800 rounded-r-sm border-2 border-slate-950 flex items-center justify-end">
                    <div className="w-1 h-2 bg-sky-400 rounded-full shadow-[0_0_6px_#38bdf8]" />
                </div>
            </div>

            {/* High-Pressure Pressurized Water Spray Cone */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 w-28 sm:w-36 h-16 sm:h-20 pointer-events-none overflow-visible">
                {/* Concentrated Water Jet Core */}
                <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-4 sm:h-5 bg-gradient-to-r from-sky-400 via-sky-300 to-transparent rounded-r-full blur-xs opacity-90"
                    animate={{
                        width: ["70%", "95%", "80%"],
                        opacity: [0.85, 1, 0.9],
                        scaleY: [1, 1.25, 0.95],
                    }}
                    transition={{
                        duration: 0.15,
                        repeat: Infinity,
                        repeatType: "mirror",
                    }}
                />

                {/* Flying Droplets & Bubbles Cone */}
                {[...Array(12)].map((_, i) => {
                    const yAngle = (i - 6) * 4;
                    const travelDist = 70 + Math.random() * 50;
                    return (
                        <motion.div
                            key={i}
                            className="absolute left-0 top-1/2 rounded-full bg-sky-200 border border-sky-400 shadow-[0_0_6px_#7dd3fc]"
                            style={{
                                width: 4 + (i % 3) * 2,
                                height: 4 + (i % 3) * 2,
                            }}
                            animate={{
                                x: [0, travelDist],
                                y: [0, yAngle * 2.5 + (Math.random() - 0.5) * 10],
                                scale: [0.6, 1.3, 0.2],
                                opacity: [1, 0.9, 0],
                            }}
                            transition={{
                                duration: 0.25 + (i % 4) * 0.06,
                                repeat: Infinity,
                                delay: (i * 0.03) % 0.2,
                                ease: "easeOut",
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export function FireExtinguishedText({ text, className = "", replayTrigger }: FireExtinguishedTextProps) {
    const ref = useRef<HTMLHeadingElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });
    const [state, setState] = useState<"on-fire" | "extinguishing" | "clean">("on-fire");
    const [sprayProgress, setSprayProgress] = useState(0);
    const isInitialMount = useRef(true);

    // Animation trigger logic
    const runExtinguishAnimation = useCallback(() => {
        setState("extinguishing");
        setSprayProgress(0);

        const duration = 2000; // 2.0s smooth sweep across letters
        let start: number | null = null;

        const animate = (timestamp: number) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            setSprayProgress(progress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setState("clean");
            }
        };

        requestAnimationFrame(animate);
    }, []);

    // Initial scroll trigger
    useEffect(() => {
        if (!isInView) return;

        // Start burning for 1.3s so the viewer notices the flames, then extinguish!
        const timer = setTimeout(() => {
            runExtinguishAnimation();
        }, 1300);

        return () => clearTimeout(timer);
    }, [isInView, runExtinguishAnimation]);

    // External replay trigger (e.g., clicking "Our Heroes" button)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (replayTrigger && replayTrigger > 0) {
            setState("on-fire");
            setSprayProgress(0);

            const timer = setTimeout(() => {
                runExtinguishAnimation();
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [replayTrigger, runExtinguishAnimation]);

    const letters = text.split("");
    const flamePalette = ["#EF4444", "#F97316", "#F59E0B", "#DC2626", "#EA580C"];

    return (
        <h2
            ref={ref}
            className={`relative inline-block select-none ${className}`}
        >
            {/* Fire Glow Aura behind text */}
            <AnimatePresence>
                {state !== "clean" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0.5, 0.9, 0.6, 0.95, 0.5],
                            scale: [0.98, 1.05, 0.99, 1.04, 0.98],
                        }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            repeatType: "mirror",
                        }}
                        className="absolute -inset-6 sm:-inset-8 bg-gradient-to-t from-red-600/35 via-orange-500/25 to-yellow-400/20 rounded-3xl blur-xl z-0 pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* Clean State Sparkles Celebration */}
            {state === "clean" && (
                <>
                    <SparkleStar delay={0.1} />
                    <SparkleStar delay={0.3} />
                    <SparkleStar delay={0.5} />
                    <SparkleStar delay={0.7} />
                </>
            )}

            {/* Sweeping Firefighter Water Jet Nozzle */}
            {state === "extinguishing" && (
                <div
                    className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-30 transition-all"
                    style={{
                        left: `${sprayProgress * 100}%`,
                        transform: "translate(-85%, -50%)",
                    }}
                >
                    <FirefighterNozzle />
                </div>
            )}

            {/* Letter Container */}
            <span className="flex flex-wrap justify-center items-center relative z-10 gap-x-[0.08em]">
                {letters.map((char, idx) => {
                    if (char === " ") {
                        return <span key={idx} className="w-2.5 sm:w-4" />;
                    }

                    const charProgress = idx / letters.length;
                    const isExtinguished =
                        state === "clean" ||
                        (state === "extinguishing" && sprayProgress >= charProgress + 0.04);
                    const isBeingExtinguished =
                        state === "extinguishing" &&
                        Math.abs(sprayProgress - charProgress) <= 0.08;

                    const mainColor = flamePalette[idx % flamePalette.length];

                    return (
                        <span
                            key={idx}
                            className="relative inline-flex items-center justify-center overflow-visible"
                        >
                            {/* Cartoon Fire Flames on Burning Characters */}
                            {!isExtinguished && (
                                <span className="absolute -top-3 sm:-top-4 left-0 right-0 bottom-0 pointer-events-none z-20 overflow-visible">
                                    {/* Main Tall Flame */}
                                    <CartoonFlame
                                        size={18 + (idx % 3) * 5}
                                        color={mainColor}
                                        innerColor="#FBBF24"
                                        delay={(idx * 0.08) % 0.3}
                                        duration={0.45 + ((idx * 7) % 5) * 0.06}
                                        xDrift={(idx % 2 === 0 ? 1 : -1) * (4 + (idx % 4) * 2)}
                                    />

                                    {/* Secondary Dancing Side Flame */}
                                    <CartoonFlame
                                        size={12 + (idx % 2) * 4}
                                        color="#F97316"
                                        innerColor="#FDE047"
                                        delay={0.15 + (idx * 0.05) % 0.25}
                                        duration={0.4 + ((idx * 3) % 4) * 0.06}
                                        xDrift={(idx % 2 === 0 ? -1 : 1) * (8 + (idx % 3) * 3)}
                                    />

                                    {/* Ember Sparks */}
                                    <EmberSpark delay={(idx * 0.12) % 0.4} />
                                </span>
                            )}

                            {/* Sizzling Steam & Splash Bursts when being hit by Water */}
                            {isBeingExtinguished && (
                                <span className="absolute -top-6 left-0 right-0 bottom-0 pointer-events-none z-25 overflow-visible">
                                    {/* Puffy Steam Puffs */}
                                    <CartoonSteam delay={0} xOffset={-8} />
                                    <CartoonSteam delay={0.06} xOffset={8} />
                                    <CartoonSteam delay={0.12} xOffset={0} />

                                    {/* Water Splash Particles */}
                                    {[0, 60, 120, 180, 240, 300].map((angle, sIdx) => (
                                        <WaterSplashParticle
                                            key={sIdx}
                                            angle={angle}
                                            speed={22 + (sIdx % 3) * 8}
                                            delay={sIdx * 0.02}
                                        />
                                    ))}
                                </span>
                            )}

                            {/* Letter Character */}
                            <motion.span
                                className="inline-block"
                                animate={
                                    isExtinguished
                                        ? {
                                              color: "#ffffff",
                                              textShadow:
                                                  "0 3px 10px rgba(0,0,0,0.6), 0 0 15px rgba(255,255,255,0.4)",
                                              scale: isBeingExtinguished
                                                  ? [1.25, 0.95, 1]
                                                  : 1,
                                              y: 0,
                                              rotate: 0,
                                          }
                                        : {
                                              color: [
                                                  "#FEF08A",
                                                  "#F97316",
                                                  "#EF4444",
                                                  "#F59E0B",
                                                  "#FEF08A",
                                              ],
                                              textShadow: [
                                                  "0 0 12px rgba(239,68,68,0.9), 0 0 24px rgba(249,115,22,0.7)",
                                                  "0 0 18px rgba(251,191,36,1), 0 0 30px rgba(245,158,11,0.8)",
                                                  "0 0 12px rgba(239,68,68,0.9), 0 0 24px rgba(249,115,22,0.7)",
                                              ],
                                              scale: [1, 1.08, 0.96, 1.05, 1],
                                              y: [0, -3, 2, -2, 0],
                                              rotate: [
                                                  0,
                                                  (idx % 2 === 0 ? 1 : -1) * 3,
                                                  (idx % 2 === 0 ? -1 : 1) * 2,
                                                  0,
                                              ],
                                          }
                                }
                                transition={
                                    isExtinguished
                                        ? {
                                              duration: 0.4,
                                              type: "spring",
                                              stiffness: 280,
                                              damping: 14,
                                          }
                                        : {
                                              duration: 0.5 + (idx % 4) * 0.08,
                                              repeat: Infinity,
                                              repeatType: "mirror",
                                          }
                                }
                            >
                                {char}
                            </motion.span>
                        </span>
                    );
                })}
            </span>
        </h2>
    );
}
