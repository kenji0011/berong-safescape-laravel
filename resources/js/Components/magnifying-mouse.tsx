import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { useSettings } from '@/lib/settings-context';
import { cn } from '@/lib/utils';

export function MagnifyingMouse() {
    const { magnifyingMouse } = useSettings();
    const [hoverText, setHoverText] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isNearTop, setIsNearTop] = useState(false);

    // Track mouse position
    const mouseX = useMotionValue(-1000);
    const mouseY = useMotionValue(-1000);

    // Smooth springing for the bubble to follow the mouse
    const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
    const bubbleX = useSpring(mouseX, springConfig);
    const bubbleY = useSpring(mouseY, springConfig);

    useEffect(() => {
        // Feature disabled or mobile view
        if (!magnifyingMouse || window.innerWidth < 768) {
            setIsVisible(false);
            return;
        }

        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            setIsNearTop(e.clientY < window.innerHeight / 2.5); // True if mouse is in the upper portion of the screen

            // Hide bubble temporarily if we want to check what's underneath it 
            // (but since bubble has pointer-events-none, elementFromPoint works correctly)
            const element = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;

            if (element) {
                // Find the closest meaningful text container
                let target = element.closest('p, h1, h2, h3, h4, h5, h6, span, li, a, label, button, strong, em, b, i');
                
                // If no semantic tag is found, check if it's a leaf div (no children) with text
                if (!target && element.tagName === 'DIV' && element.children.length === 0) {
                    target = element;
                }

                if (target && target instanceof HTMLElement && target.innerText && target.innerText.trim().length > 0) {
                    setHoverText(target.innerText.trim());
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            } else {
                setIsVisible(false);
            }
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.body.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.body.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [magnifyingMouse, mouseX, mouseY]);

    if (!magnifyingMouse) return null;

    return (
        <AnimatePresence>
            {isVisible && hoverText && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        x: bubbleX,
                        y: bubbleY,
                        translateX: '-50%',
                        translateY: isNearTop ? '20%' : '-120%', // Flips below cursor if near top
                        pointerEvents: 'none',
                        zIndex: 9999,
                    }}
                    className={cn(
                        "max-w-md w-max text-center p-6 rounded-[2rem]",
                        "bg-white/60 dark:bg-slate-900/60",
                        "backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)]",
                        "border-2 border-white/80 dark:border-white/20",
                        "text-slate-900 dark:text-white font-black text-2xl leading-tight"
                    )}
                >
                    {/* Water bubble highlight effect */}
                    <div className="absolute top-2 left-4 w-8 h-3 bg-white/60 rounded-[50%] rotate-[-15deg] blur-[1px]"></div>
                    {hoverText}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
