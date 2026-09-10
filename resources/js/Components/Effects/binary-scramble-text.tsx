"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Terminal } from "lucide-react";

interface BinaryScrambleTextProps {
    text: string;
    className?: string;
    replayTrigger?: number;
    hoverToScramble?: boolean;
    showStatusBadge?: boolean;
}

const BINARY_CHARS = ["0", "1"];
const GLITCH_CHARS = ["0", "1", "0", "1", "<", ">", "/", "_"];

interface CharState {
    char: string;
    display: string;
    status: "pending" | "scrambling" | "locked" | "resolved";
}

export function BinaryScrambleText({
    text,
    className = "",
    replayTrigger = 0,
    hoverToScramble = true,
    showStatusBadge = false,
}: BinaryScrambleTextProps) {
    const containerRef = useRef<HTMLSpanElement>(null);
    const isInView = useInView(containerRef, { once: true, margin: "-80px" });
    const prefersReducedMotion = useReducedMotion();

    const [charStates, setCharStates] = useState<CharState[]>(() =>
        text.split("").map((char) => ({
            char,
            display: char === " " ? " " : "0",
            status: "pending",
        }))
    );

    const [isDecoding, setIsDecoding] = useState(false);
    const [isFullyResolved, setIsFullyResolved] = useState(false);
    const isInitialMount = useRef(true);
    const animationFrameRef = useRef<number | null>(null);

    // Core Scramble & Decode Loop
    const runBinaryDecode = useCallback(() => {
        if (prefersReducedMotion) {
            setCharStates(
                text.split("").map((char) => ({
                    char,
                    display: char,
                    status: "resolved",
                }))
            );
            setIsFullyResolved(true);
            setIsDecoding(false);
            return;
        }

        setIsDecoding(true);
        setIsFullyResolved(false);

        const chars = text.split("");
        const startTime = performance.now();
        const letterDelay = 45; // ms between each letter starting to decode
        const letterDuration = 180; // ms each letter spends scrambling

        // Reset to initial pending/scrambling state
        setCharStates(
            chars.map((char) => ({
                char,
                display: char === " " ? " " : BINARY_CHARS[Math.floor(Math.random() * BINARY_CHARS.length)],
                status: char === " " ? "resolved" : "pending",
            }))
        );

        const updateFrame = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            let allDone = true;

            const nextStates: CharState[] = chars.map((char, index) => {
                if (char === " ") {
                    return { char, display: " ", status: "resolved" };
                }

                const charStart = index * letterDelay;
                const charEnd = charStart + letterDuration;

                if (elapsed < charStart) {
                    allDone = false;
                    // Still waiting to start: show occasional low-frequency binary digit
                    return {
                        char,
                        display: Math.random() > 0.85 ? (Math.random() > 0.5 ? "1" : "0") : "0",
                        status: "pending",
                    };
                } else if (elapsed >= charStart && elapsed < charEnd) {
                    allDone = false;
                    // Active scrambling: rapid binary flickers
                    const randomChar =
                        Math.random() > 0.2
                            ? BINARY_CHARS[Math.floor(Math.random() * BINARY_CHARS.length)]
                            : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
                    return {
                        char,
                        display: randomChar,
                        status: "scrambling",
                    };
                } else {
                    // Fully resolved directly to final letter
                    return {
                        char,
                        display: char,
                        status: "resolved",
                    };
                }
            });

            setCharStates(nextStates);

            if (!allDone) {
                animationFrameRef.current = requestAnimationFrame(updateFrame);
            } else {
                setIsDecoding(false);
                setIsFullyResolved(true);
            }
        };

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(updateFrame);
    }, [text, prefersReducedMotion]);

    // Trigger on scroll into view
    useEffect(() => {
        if (isInView) {
            runBinaryDecode();
        }
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isInView, runBinaryDecode]);

    // Trigger on external replayTrigger change
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (replayTrigger > 0) {
            runBinaryDecode();
        }
    }, [replayTrigger, runBinaryDecode]);

    // Interactive hover scramble wave
    const handleMouseEnter = () => {
        if (!hoverToScramble || isDecoding) return;
        runBinaryDecode();
    };

    return (
        <span
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            className={`inline-flex flex-wrap items-baseline select-none transition-colors ${className} ${
                hoverToScramble ? "cursor-pointer" : ""
            }`}
            title={hoverToScramble ? "Click or hover to re-scramble binary" : undefined}
            onClick={() => {
                if (hoverToScramble && !isDecoding) {
                    runBinaryDecode();
                }
            }}
        >
            {charStates.map((item, index) => {
                if (item.char === " ") {
                    return (
                        <span key={index} className="inline-block w-[0.3em]">
                            &nbsp;
                        </span>
                    );
                }

                // Styling based on decode lifecycle - all using parent font-family
                if (item.status === "scrambling") {
                    return (
                        <motion.span
                            key={index}
                            className="inline-block font-bold tabular-nums text-[#d60000] dark:text-red-400 scale-105 transition-transform duration-75"
                        >
                            {item.display}
                        </motion.span>
                    );
                }

                if (item.status === "pending") {
                    return (
                        <span
                            key={index}
                            className="inline-block font-bold tabular-nums text-slate-400/70 dark:text-slate-600/70 opacity-60 text-[0.95em]"
                        >
                            {item.display}
                        </span>
                    );
                }

                // Resolved: identical font, weight, and color matching parent heading
                return (
                    <span key={index} className="inline-block transition-colors duration-200">
                        {item.display}
                    </span>
                );
            })}

            {/* Trailing Terminal Cursor */}
            {isDecoding && (
                <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
                    className="inline-block ml-1 font-bold text-[#d60000] dark:text-red-400"
                >
                    _
                </motion.span>
            )}

            {/* Optional Status Pill (if requested) */}
            {showStatusBadge && (
                <span className="ml-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-[10px] font-mono font-bold text-red-600 dark:text-red-400">
                    <Terminal className="w-3 h-3" />
                    {isDecoding ? "DECRYPTING..." : "01_COMPILED"}
                </span>
            )}
        </span>
    );
}
