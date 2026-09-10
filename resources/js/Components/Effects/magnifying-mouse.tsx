import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { useSettings } from '@/lib/settings-context';
import { cn } from '@/lib/utils';

export function MagnifyingMouse() {
    const { magnifyingMouse } = useSettings();
    const [hoverText, setHoverText] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [horizontalAlign, setHorizontalAlign] = useState<'left' | 'center' | 'right'>('center');
    const [verticalAlign, setVerticalAlign] = useState<'top' | 'bottom'>('top');

    const animFrameRef = useRef<number | null>(null);

    // Track mouse position
    const mouseX = useMotionValue(-1000);
    const mouseY = useMotionValue(-1000);

    // Smooth springing for the bubble to follow the mouse effortlessly
    const springConfig = { damping: 28, stiffness: 350, mass: 0.4 };
    const bubbleX = useSpring(mouseX, springConfig);
    const bubbleY = useSpring(mouseY, springConfig);

    useEffect(() => {
        // Disabled or touch device / mobile screen
        if (!magnifyingMouse || window.innerWidth < 768) {
            setIsVisible(false);
            return;
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }

            animFrameRef.current = requestAnimationFrame(() => {
                const cx = e.clientX;
                const cy = e.clientY;
                const innerW = window.innerWidth;
                const innerH = window.innerHeight;

                mouseX.set(cx);
                mouseY.set(cy);

                // Horizontal clamping alignment
                if (cx < 180) {
                    setHorizontalAlign('left');
                } else if (cx > innerW - 180) {
                    setHorizontalAlign('right');
                } else {
                    setHorizontalAlign('center');
                }

                // Vertical clamping alignment
                if (cy < 140) {
                    setVerticalAlign('bottom');
                } else {
                    setVerticalAlign('top');
                }

                // Inspect element under cursor
                const rawEl = document.elementFromPoint(cx, cy);
                if (!rawEl) {
                    setIsVisible(false);
                    return;
                }

                // Extract element (handling SVG/path children gracefully)
                const element = (rawEl instanceof HTMLElement ? rawEl : rawEl.parentElement) as HTMLElement | null;
                if (!element) {
                    setIsVisible(false);
                    return;
                }

                let textToDisplay: string | null = null;

                // 1. Inputs & Textareas
                if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
                    textToDisplay = element.value || element.placeholder || element.getAttribute('aria-label');
                }
                // 2. Select Elements
                else if (element instanceof HTMLSelectElement) {
                    const selected = element.options[element.selectedIndex];
                    textToDisplay = selected?.text || element.getAttribute('aria-label');
                }
                // 3. Images with Alt or Title
                else if (element instanceof HTMLImageElement) {
                    textToDisplay = element.alt || element.title || element.getAttribute('aria-label');
                }
                // 4. Semantic / Interactive Containers
                else {
                    const target = element.closest<HTMLElement>(
                        'p, h1, h2, h3, h4, h5, h6, span, li, a, label, button, input, textarea, select, img, strong, em, b, i, [role="button"], [role="tab"], [role="menuitem"], [data-hover-text]'
                    ) || (element.tagName === 'DIV' && element.children.length === 0 ? element : null);

                    if (target) {
                        // Check if text is already large on the page (>= 24px / 1.5rem). If so, suppress Hover Reader to avoid redundancy.
                        try {
                            const computedStyle = window.getComputedStyle(target);
                            const fontSizePx = parseFloat(computedStyle.fontSize || '0');
                            if (fontSizePx >= 24) {
                                setIsVisible(false);
                                return;
                            }
                        } catch (err) {
                            // Fallback if computedStyle fails
                        }

                        // Check explicit data override or aria-label/title first
                        const explicitText = target.dataset.hoverText || target.getAttribute('aria-label') || target.getAttribute('title');
                        const rawText = target.innerText || target.textContent || '';
                        
                        textToDisplay = explicitText || rawText;
                    }
                }

                if (textToDisplay) {
                    // Clean extra spaces & newlines
                    let cleaned = textToDisplay.replace(/\s+/g, ' ').trim();

                    // If text is very long (>140 chars), grab first sentence or truncate cleanly
                    if (cleaned.length > 140) {
                        const firstSentence = cleaned.split(/(?<=[.!?])\s+/)[0];
                        if (firstSentence && firstSentence.length >= 10 && firstSentence.length <= 140) {
                            cleaned = firstSentence;
                        } else {
                            cleaned = cleaned.substring(0, 135) + '…';
                        }
                    }

                    // Ignore tiny non-alphanumeric noise (e.g. lone symbols or single punctuation)
                    if (cleaned.length >= 1 && /[a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]/.test(cleaned)) {
                        setHoverText(cleaned);
                        setIsVisible(true);
                        return;
                    }
                }

                setIsVisible(false);
            });
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        document.body.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            window.removeEventListener('mousemove', handleMouseMove);
            document.body.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [magnifyingMouse, mouseX, mouseY]);

    if (!magnifyingMouse) return null;

    // Compute transforms based on clamped alignment
    const getTranslateX = () => {
        if (horizontalAlign === 'left') return '10%';
        if (horizontalAlign === 'right') return '-90%';
        return '-50%';
    };

    const getTranslateY = () => {
        if (verticalAlign === 'bottom') return '28px';
        return '-115%';
    };

    return (
        <AnimatePresence>
            {isVisible && hoverText && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        x: bubbleX,
                        y: bubbleY,
                        translateX: getTranslateX(),
                        translateY: getTranslateY(),
                        pointerEvents: 'none',
                        userSelect: 'none',
                        zIndex: 999999,
                    }}
                    className={cn(
                        "max-w-md sm:max-w-lg w-max text-center px-6 py-4 rounded-[2rem]",
                        "bg-white/80 dark:bg-slate-900/85",
                        "backdrop-blur-xl shadow-[0_15px_40px_-5px_rgba(0,0,0,0.35)] dark:shadow-[0_15px_40px_-5px_rgba(0,0,0,0.7)]",
                        "border-2 border-cyan-400/60 dark:border-cyan-500/50",
                        "text-slate-900 dark:text-white font-black text-xl sm:text-2xl leading-tight tracking-wide",
                        "ring-4 ring-cyan-500/10"
                    )}
                >
                    {/* Water bubble highlight effect */}
                    <div className="absolute top-2 left-4 w-10 h-3 bg-white/70 dark:bg-cyan-300/30 rounded-[50%] rotate-[-15deg] blur-[1px]"></div>
                    {hoverText}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

