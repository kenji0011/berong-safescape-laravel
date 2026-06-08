"use client";

import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import SplashCursor from "@/components/SplashCursor";
import Image from '@/components/Image';
import { Link } from '@inertiajs/react';
import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import { useSettings } from "@/lib/settings-context";
import {
    Github,
    Linkedin,
    Instagram,
    Globe,
    Flame,
    Users,
    GraduationCap,
    Shield,
    Handshake,
    BookOpen,
    Cpu,
    Gamepad2,
    Code,
    Database,
    Brain,
    Palette,
    Music
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Team member data
const teamMembers = [
    {
        name: "John Kervin D. Evangelista",
        roles: ["Project Head", "DevOps", "AI/ML Engineer", "Developer"],
        image: "/evangelista_1x1.png",
        socials: [
            { icon: Github, url: "https://github.com/Toneejake", label: "GitHub" },
            { icon: Globe, url: "https://toneejake.tech", label: "Portfolio" },
            { icon: Linkedin, url: "https://www.linkedin.com/in/jkevangelista/", label: "LinkedIn" },
        ],
        color: "from-red-500 to-orange-500",
        roleIcons: [Shield, Code, Brain, Cpu],
    },
    {
        name: "Aedran Gabriel R. Teaño",
        roles: ["Game Developer", "3D/2D Artist", "Sound Designer"],
        image: "/teano_1x1.jpg",
        socials: [
            { icon: Github, url: "https://github.com/Izect", label: "GitHub" },
            { icon: Instagram, url: "https://www.instagram.com/aedraaann/", label: "Instagram" },
            { icon: Linkedin, url: "https://www.linkedin.com/in/aedran-gabriel-teano-76b38a257/", label: "LinkedIn" },
        ],
        color: "from-purple-500 to-pink-500",
        roleIcons: [Gamepad2, Palette, Music],
    },
    {
        name: "Keinji C. Velina",
        roles: ["Developer", "Data Scientist", "AI Engineer"],
        image: "/velina_1x1.png",
        socials: [
            { icon: Github, url: "https://github.com/sitol2", label: "GitHub" },
            { icon: Linkedin, url: "https://www.linkedin.com/in/keinji-velina-423736326/", label: "LinkedIn" },
        ],
        color: "from-blue-500 to-cyan-500",
        roleIcons: [Code, Database, Brain],
    },
    {
        name: "Kean Gabriel E. Salvahan",
        roles: ["Developer", "UI Designer", "UX Designer"],
        image: "/salvahan_pr.jpg",
        socials: [
            { icon: Github, url: "https://github.com/kenji0011", label: "GitHub" },
            { icon: Globe, url: "https://kenji-v2-beta-green.vercel.app/#about", label: "Portfolio" },
            { icon: Linkedin, url: "https://www.linkedin.com/in/salvahan-kean-gabriel-e-06760537b", label: "LinkedIn" },
        ],
        color: "from-emerald-500 to-teal-500",
        roleIcons: [Cpu, GraduationCap, Palette],
    },
    {
        name: "Prince Genel R. Umali",
        roles: ["AI Engineer", "Developer", "Data Scientist"],
        image: "/umali_pr.jpg",
        socials: [
            { icon: Github, url: "#", label: "GitHub" },
            { icon: Linkedin, url: "#", label: "LinkedIn" },
        ],
        color: "from-amber-500 to-yellow-500",
        roleIcons: [Brain, Cpu, Database],
    },
    {
        name: "Justin Angelo A. Luzande",
        roles: ["Developer", "UI Designer", "UX Designer"],
        image: "/luzande_pr.jpg",
        socials: [
            { icon: Github, url: "#", label: "GitHub" },
            { icon: Linkedin, url: "#", label: "LinkedIn" },
        ],
        color: "from-rose-500 to-pink-500",
        roleIcons: [Cpu, GraduationCap, Palette],
    },
    {
        name: "Aeron Jhed V. Lachano",
        roles: ["Game Designer", "Game Developer"],
        image: "/lachano_pr.png",
        socials: [
            { icon: Github, url: "#", label: "GitHub" },
            { icon: Linkedin, url: "#", label: "LinkedIn" },
        ],
        color: "from-indigo-500 to-blue-500",
        roleIcons: [Palette, Gamepad2],
    },
    {
        name: "Axcel Andrei V. Delos Reyes",
        roles: ["Game Designer", "Game Developer"],
        image: "/delosreyes_pr.jpg",
        socials: [
            { icon: Github, url: "#", label: "GitHub" },
            { icon: Linkedin, url: "#", label: "LinkedIn" },
        ],
        color: "from-violet-500 to-purple-500",
        roleIcons: [Palette, Gamepad2],
    },
    {
        name: "Zyril G. Dela Paz",
        roles: ["Game Designer", "Game Developer"],
        image: "/delapaz_pr.jpg",
        socials: [
            { icon: Github, url: "#", label: "GitHub" },
            { icon: Linkedin, url: "#", label: "LinkedIn" },
        ],
        color: "from-orange-500 to-red-500",
        roleIcons: [Palette, Gamepad2],
    },
];

// Animated Feature Card Component
function FeatureCard({
    feature,
    index,
    reduceMotion
}: {
    feature: { icon: any; title: string; description: string; color: string };
    index: number;
    reduceMotion: boolean;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { 
                opacity: 1, 
                y: 0
            } : {}}
            transition={{
                opacity: { duration: 0.5, delay: index * 0.1 },
                y: { duration: 0.5, delay: index * 0.1 }
            }}
            whileHover={reduceMotion ? {} : { 
                scale: 1.05,
                y: -12,
                transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            whileTap={reduceMotion ? {} : { 
                scale: 0.98,
                y: 4,
                transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            className="group bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-[0_6px_0_#b45309] sm:shadow-[0_8px_0_#b45309] dark:shadow-[0_6px_0_#0f172a] sm:dark:shadow-[0_8px_0_#0f172a] hover:shadow-[0_10px_0_#b45309] sm:hover:shadow-[0_12px_0_#b45309] dark:hover:shadow-[0_10px_0_#000] border-[3px] sm:border-[4px] border-white dark:border-slate-700 relative overflow-hidden h-full cursor-pointer"
        >
            {/* Playful Background Blob */}
            <div className={`absolute -top-10 -right-10 w-24 h-24 ${feature.color.split(' ')[0]} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700`} />
            
            <div className={`${feature.color} w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:rotate-6 transition-transform duration-300 shadow-inner border-2 border-white/50`}>
                <feature.icon className="w-7 h-7 sm:w-10 sm:h-10 text-white drop-shadow-sm" strokeWidth={2.5} />
            </div>
            
            <h3 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white mb-2 sm:mb-3 tracking-tight transition-colors">{feature.title}</h3>
            <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 font-bold leading-relaxed transition-colors">{feature.description}</p>
        </motion.div>
    );
}

// Animated Team Card Component
function TeamCard({ member, index }: { member: typeof teamMembers[0]; index: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    // Different animations for each team member
    // Index 0: John - flip from left (rotateY: -15)
    // Index 1: Aedran - slide up only (no rotation)
    // Index 2: Keinji - flip from right (rotateY: 15)
    const getInitialAnimation = () => {
        switch (index % 3) {
            case 0: return { opacity: 0, scale: 0.8, rotateY: -15, y: 40 }; // Left - flip from left
            case 1: return { opacity: 0, scale: 0.8, rotateY: 0, y: 60 };   // Center - just slide up
            case 2: return { opacity: 0, scale: 0.8, rotateY: 15, y: 40 };  // Right - flip from right
            default: return { opacity: 0, scale: 0.8, rotateY: -15, y: 40 };
        }
    };

    const getHoverAnimation = () => {
        switch (index % 3) {
            case 0: return { scale: 1.02, rotateY: 5 };   // Left - tilt right on hover
            case 1: return { scale: 1.02, y: -5 };        // Center - lift up on hover
            case 2: return { scale: 1.02, rotateY: -5 };  // Right - tilt left on hover
            default: return { scale: 1.02, rotateY: 5 };
        }
    };

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: index * 0.1
            }}
            className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 border border-slate-200 dark:border-slate-700 h-full flex flex-col cursor-pointer"
        >
            {/* Gradient Header */}
            <div className={`h-32 bg-gradient-to-r ${member.color} relative`}>
                <div className="absolute inset-0 bg-black/20" />
                {/* Decorative circles - Animated only on desktop */}
                <motion.div
                    className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"
                    animate={typeof window !== 'undefined' && window.innerWidth < 640 ? {} : { scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                    className="absolute top-4 left-4 w-12 h-12 bg-white/10 rounded-full"
                    animate={typeof window !== 'undefined' && window.innerWidth < 640 ? {} : { scale: [1, 1.2, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                />
            </div>

            {/* Profile Image */}
            <div className="relative -mt-16 flex justify-center">
                <div className="relative">
                    <div className={`absolute inset-0 bg-slate-400 rounded-full opacity-50 group-hover:opacity-75 transition-opacity`} />
                    <div className="relative w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-xl">
                        <Image
                            src={member.image}
                            alt={member.name}
                            fill
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-4 text-center flex flex-col flex-1">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 transition-colors">{member.name}</h3>

                {/* Roles */}
                <div className="flex flex-wrap justify-center gap-2 mb-4 flex-grow content-start min-h-[70px]">
                    {member.roles.map((role, roleIndex) => (
                        <motion.span
                            key={roleIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: index * 0.1 + roleIndex * 0.05 + 0.15 }}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors"
                        >
                            {member.roleIcons[roleIndex] && (
                                <span className="w-3 h-3">
                                    {(() => {
                                        const Icon = member.roleIcons[roleIndex];
                                        return <Icon className="w-3 h-3" />;
                                    })()}
                                </span>
                            )}
                            {role}
                        </motion.span>
                    ))}
                </div>

                {/* Social Links */}
                <div className="flex justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto transition-colors">
                    {member.socials.map((social, socialIndex) => (
                        <Link
                            key={socialIndex}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/social"
                        >
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 rounded-full dark:bg-slate-700 dark:border-slate-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 group-hover/social:scale-110"
                            >
                                <social.icon className="w-5 h-5" />
                            </Button>
                        </Link>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

// Partnership Card Component - Simple fade
function PartnershipCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: delay * 0.1
            }}
            whileHover={{
                scale: 1.02,
                transition: { duration: 0.3 }
            }}
            className="bg-white/5 rounded-2xl p-5 sm:p-8 border border-white/10 hover:border-white/20 transition-all duration-300"
        >
            {children}
        </motion.div>
    );
}

export default function AboutPage() {
    // Hero section scroll animation
    const heroRef = useRef(null);
    const { scrollYProgress: heroScrollProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });

    const mascotRotateY = useTransform(heroScrollProgress, [0, 1], [0, 15]);
    const mascotScale = useTransform(heroScrollProgress, [0, 0.5], [1, 0.9]);
    const heroTextY = useTransform(heroScrollProgress, [0, 1], [0, 100]);
    const heroOpacity = useTransform(heroScrollProgress, [0, 0.6], [1, 0]);
    const heroScale = useTransform(heroScrollProgress, [0, 0.8], [1, 0.95]);

    // CTA section scroll animation
    const ctaRef = useRef(null);
    const { scrollYProgress: ctaScrollProgress } = useScroll({
        target: ctaRef,
        offset: ["start end", "center center"]
    });

    const ctaScale = useTransform(ctaScrollProgress, [0, 1], [0.9, 1]);
    const ctaOpacity = useTransform(ctaScrollProgress, [0, 0.5], [0, 1]);

    // Platform Overview section scroll animation (fade out when scrolling past)
    const platformRef = useRef(null);
    const { scrollYProgress: platformScrollProgress } = useScroll({
        target: platformRef,
        offset: ["start start", "end start"]
    });
    const platformOpacity = useTransform(platformScrollProgress, [0.5, 1], [1, 0]);
    const platformScale = useTransform(platformScrollProgress, [0.5, 1], [1, 0.95]);

    // Partnership section scroll animation
    const partnershipRef = useRef(null);
    const { scrollYProgress: partnershipScrollProgress } = useScroll({
        target: partnershipRef,
        offset: ["start start", "end start"]
    });
    const partnershipOpacity = useTransform(partnershipScrollProgress, [0.5, 1], [1, 0]);
    const partnershipScale = useTransform(partnershipScrollProgress, [0.5, 1], [1, 0.95]);

    // Team section scroll animation
    const teamRef = useRef(null);
    const { scrollYProgress: teamScrollProgress } = useScroll({
        target: teamRef,
        offset: ["start start", "end start"]
    });
    const teamOpacity = useTransform(teamScrollProgress, [0.5, 1], [1, 0]);
    const teamScale = useTransform(teamScrollProgress, [0.5, 1], [1, 0.95]);

    // Floating Berong companion - follows scroll
    const pageRef = useRef(null);
    const { scrollYProgress } = useScroll();

    // Berong position changes as user scrolls through page
    // Moves from right side, through different positions based on scroll
    const berongY = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [100, 200, 350, 500, 600]);
    const berongX = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0, -20, 20, -20, 0]);
    const berongRotate = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0, -10, 10, -5, 0]);
    const berongScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.9]);

    const features = [
        {
            icon: BookOpen,
            title: "E-Learning Modules",
            description: "Interactive courses for professionals, adults, and kids tailored to different learning needs.",
            color: "bg-blue-500",
        },
        {
            icon: Brain,
            title: "AI-Powered Chatbot",
            description: "Berong AI assistant trained on official BFP protocols to answer your fire safety questions.",
            color: "bg-purple-500",
        },
        {
            icon: Flame,
            title: "Fire Simulation",
            description: "Advanced fire spread simulation using PPO and UNet models for evacuation planning.",
            color: "bg-orange-500",
        },
        {
            icon: Gamepad2,
            title: "Educational Games",
            description: "Fun and engaging games that teach fire safety concepts to learners of all ages.",
            color: "bg-green-500",
        },
    ];

    const { reduceMotion } = useSettings();

    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />
            {!reduceMotion && <SplashCursor />}

            <main className="flex-grow pt-[64px] sm:pt-[72px]">
                {/* Hero Section with 3D Parallax */}
                <motion.section
                    ref={heroRef}
                    className="relative bg-white dark:bg-slate-950 py-10 sm:py-28 overflow-hidden transition-colors duration-500"
                    style={{ opacity: heroOpacity, scale: heroScale }}
                >
                    {/* Background Pattern */}
                    <motion.div
                        className="absolute inset-0 opacity-5"
                        style={{ y: useTransform(heroScrollProgress, [0, 1], [0, 50]) }}
                    >
                        <div className="absolute inset-0" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dc2626' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }} />
                    </motion.div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                            {/* Berong Mascot - 3D Rotation on Scroll */}
                            <motion.div
                                className="flex-shrink-0"
                                style={{
                                    rotateY: mascotRotateY,
                                    scale: mascotScale,
                                    transformPerspective: 1000
                                }}
                            >
                                <div className="relative w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96">
                                    <motion.div
                                        className="absolute inset-0 bg-red-500/20 rounded-full"
                                        animate={typeof window !== 'undefined' && window.innerWidth < 640 ? { scale: 1, opacity: 0.2 } : { scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
                                        transition={typeof window !== 'undefined' && window.innerWidth < 640 ? {} : { duration: 3, repeat: Infinity }}
                                    />
                                    <motion.div
                                        className="relative w-full h-full"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{
                                            opacity: 1,
                                            scale: 1,
                                            y: typeof window !== 'undefined' && window.innerWidth < 640 ? 0 : [0, -10, 0]
                                        }}
                                        transition={{
                                            opacity: { duration: 0.6 },
                                            scale: { duration: 0.6 },
                                            y: { duration: 3, repeat: typeof window !== 'undefined' && window.innerWidth < 640 ? 0 : Infinity, ease: "easeInOut" }
                                        }}
                                    >
                                        <Image
                                            src="/berong-official-logo.jpg"
                                            alt="Berong's E-Learning - Official Logo"
                                            fill
                                            className="object-contain drop-shadow-2xl relative z-10 rounded-full"
                                            priority
                                        />
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Hero Content - Parallax Text */}
                            <motion.div
                                className="text-center lg:text-left flex-grow max-w-2xl"
                                style={{ y: heroTextY, opacity: heroOpacity }}
                            >
                                <motion.span
                                    className="text-red-600 dark:text-red-400 font-semibold text-sm sm:text-xl uppercase tracking-wider mb-2 sm:mb-4 block transition-colors"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    About SafeScape
                                </motion.span>
                                <motion.h1
                                    className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-2 sm:mb-6 leading-tight text-gray-900 dark:text-white transition-colors"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.05 }}
                                >
                                    Meet <span className="text-red-600 dark:text-red-500">Berong</span>
                                </motion.h1>
                                <motion.p
                                    className="text-lg sm:text-3xl font-light mb-4 sm:mb-6 text-gray-700 dark:text-slate-300 transition-colors"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1 }}
                                >
                                    Your Fire Safety Companion
                                </motion.p>
                                <motion.p
                                    className="text-sm sm:text-xl text-gray-600 dark:text-slate-400 leading-relaxed px-2 sm:px-0 transition-colors"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.15 }}
                                >
                                    <strong className="text-gray-900 dark:text-white">SafeScape</strong>, locally known as <strong className="text-gray-900 dark:text-white">&quot;Berong E-Learning&quot;</strong>, is named after the official mascot of the Bureau of Fire Protection.
                                    Berong represents our commitment to making fire safety education accessible, engaging, and effective for every Filipino.
                                </motion.p>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>

                {/* Platform Overview Section - Card Flip Animation */}
                <motion.section
                    ref={platformRef}
                    className="py-10 sm:py-14 bg-red-600 dark:bg-red-950 text-white relative overflow-hidden shadow-sm mx-0 transition-colors duration-500"
                    style={{ opacity: platformOpacity }}
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }} />
                    </div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <motion.div
                            className="text-center mb-10 sm:mb-16"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <h2 className="text-3xl sm:text-6xl font-black text-white mb-4 sm:mb-6 drop-shadow-lg uppercase tracking-tight italic">
                                What is <span className="text-yellow-400 drop-shadow-[0_4px_0_#b45309]">SafeScape</span>?
                            </h2>
                            <p className="text-white font-bold max-w-2xl mx-auto text-sm sm:text-2xl px-4 leading-relaxed opacity-95">
                                A comprehensive fire safety education platform designed to empower communities with knowledge and skills.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" style={{ perspective: 1000 }}>
                            {features.map((feature, index) => (
                                <FeatureCard key={index} feature={feature} index={index} reduceMotion={reduceMotion} />
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Partnership Section - 3D Perspective Depth */}
                <motion.section
                    ref={partnershipRef}
                    className="py-16 sm:py-20 bg-gray-900 text-white relative overflow-hidden"
                    style={{ opacity: partnershipOpacity }}
                >
                    {/* Animated Background decoration */}
                    <motion.div
                        className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full"
                        animate={typeof window !== 'undefined' && window.innerWidth < 640 ? {} : {
                            x: [0, 30, 0],
                            y: [0, -20, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 8, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full"
                        animate={typeof window !== 'undefined' && window.innerWidth < 640 ? {} : {
                            x: [0, -30, 0],
                            y: [0, 20, 0],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 10, repeat: Infinity }}
                    />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <motion.div
                            className="text-center mb-8 sm:mb-12"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <span className="text-yellow-400 font-semibold text-sm sm:text-lg uppercase tracking-wider mb-2 sm:mb-4 block">
                                Collaborative Initiative
                            </span>
                            <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">
                                LSPU & BFP Sta. Cruz Partnership
                            </h2>
                            <p className="text-gray-300 max-w-4xl mx-auto text-sm sm:text-lg leading-relaxed px-2 sm:px-0">
                                SafeScape is a collaborative research initiative between the <strong className="text-white">College of Computer Studies (CCS)</strong> at
                                <strong className="text-white"> Laguna State Polytechnic University (LSPU) - Santa Cruz Campus</strong> and the
                                <strong className="text-white"> Bureau of Fire Protection (BFP) Santa Cruz</strong>. This partnership was formalized through a
                                Memorandum of Agreement to address local fire safety challenges by leveraging advanced digital technologies.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" style={{ perspective: 1500 }}>
                            {/* LSPU Card */}                             <PartnershipCard delay={0}>
                                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                    <div className="relative w-14 h-14 sm:w-20 sm:h-20 flex-shrink-0">
                                        <Image
                                            src="/lspu logo.png"
                                            alt="LSPU Logo"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold">LSPU - Santa Cruz Campus</h3>
                                        <p className="text-xs sm:text-gray-400">College of Computer Studies</p>
                                    </div>
                                </div>
                                <p className="text-gray-300 text-xs sm:text-base leading-relaxed mb-4">

                                    The university provided technological expertise in AI, machine learning, and software development.
                                    Computer Science researchers majoring in Intelligent Systems designed and developed the platform under academic supervision.
                                </p>
                                <div className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                                        <div>
                                            <p className="text-yellow-400 font-semibold text-[10px] sm:text-sm">Project Initiation & Thesis Adviser</p>
                                            <p className="text-white font-medium text-xs sm:text-base">Dr. Mia V. Villarica, DIT</p>
                                            <p className="text-gray-400 text-[10px] sm:text-sm">CCS Dean, LSPU Santa Cruz</p>
                                        </div>
                                    </div>
                                </div>
                            </PartnershipCard>

                            {/* BFP Card */}                             <PartnershipCard delay={1}>
                                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                    <div className="relative w-12 h-12 sm:w-20 sm:h-20 flex-shrink-0">
                                        <Image
                                            src="/bfp logo.png"
                                            alt="BFP Logo"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-xl font-bold">BFP Santa Cruz Fire Station</h3>
                                        <p className="text-[10px] sm:text-sm text-gray-400">Bureau of Fire Protection</p>
                                    </div>
                                </div>
                                <p className="text-gray-300 text-xs sm:text-base leading-relaxed mb-4">

                                    BFP Santa Cruz reached out to LSPU-CCS to find innovative ways to enhance community fire preparedness.
                                    They provided the official knowledge base, including manuals and protocols, used to train the Berong AI chatbot and develop educational modules.
                                </p>
                                <div className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                                        <div>
                                            <p className="text-yellow-400 font-semibold text-[10px] sm:text-sm">Project Initiator & Guide</p>
                                            <p className="text-white font-medium text-xs sm:text-base">FSINSP Cesar A. Morfe Jr.</p>
                                            <p className="text-gray-400 text-[10px] sm:text-sm leading-tight">Initiated the partnership and provided constant guidance</p>
                                        </div>
                                    </div>
                                </div>
                            </PartnershipCard>
                        </div>
                    </div>
                </motion.section>

                {/* Research Team Section - Staggered 3D Cards */}
                <motion.section
                    ref={teamRef}
                    className="py-16 sm:py-20 bg-white dark:bg-slate-900 transition-colors duration-500"
                    style={{ opacity: teamOpacity }}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            className="text-center mb-12"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <span className="text-red-600 dark:text-red-400 font-semibold text-lg uppercase tracking-wider mb-4 block transition-colors">
                                The Research Team
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-4 transition-colors">
                                Meet the Developers
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg transition-colors">
                                Computer Science researchers majoring in Intelligent Systems who designed and developed SafeScape.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {teamMembers.map((member, index) => (
                                <TeamCard key={index} member={member} index={index} />
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Call to Action - Zoom and Fade */}
                <motion.section
                    ref={ctaRef}
                    className="py-16 sm:py-20 bg-red-600 dark:bg-red-950 text-white transition-colors duration-500"
                    style={{ scale: ctaScale, opacity: ctaOpacity }}
                >
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <motion.div
                            animate={typeof window !== 'undefined' && window.innerWidth < 640 ? { scale: 1, rotate: 0 } : {
                                scale: [1, 1.2, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={typeof window !== 'undefined' && window.innerWidth < 640 ? {} : {
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <Flame className="w-16 h-16 mx-auto mb-6" />
                        </motion.div>
                        <motion.h2
                            className="text-3xl sm:text-4xl font-bold mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            Ready to Learn Fire Safety?
                        </motion.h2>
                        <motion.p
                            className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            Join thousands of Filipinos in learning essential fire safety skills. Start your journey with Berong today!
                        </motion.p>
                        <motion.div
                            className="flex flex-col sm:flex-row gap-6 justify-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                        >
                            <Link href="/">
                                <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-red-700 font-black px-10 py-7 text-xl rounded-full border-[4px] border-white shadow-[0_6px_0_#b45309] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all uppercase tracking-tight italic">
                                    Explore Platform
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-black px-10 py-7 text-xl rounded-full border-[4px] border-white shadow-[0_6px_0_#9a3412] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all uppercase tracking-tight italic">
                                    Create Account
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </motion.section>
            </main>

            <Footer />
        </div>
    );
}
