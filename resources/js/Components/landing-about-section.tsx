"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, useReducedMotion } from "motion/react";
import { Link } from '@inertiajs/react';
import {
    Github,
    Linkedin,
    Instagram,
    Globe,
    Flame,
    GraduationCap,
    Shield,
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
];

// Feature Data
const features = [
    {
        icon: BookOpen,
        title: "E-Learning Modules",
        description: "Interactive courses for professionals, adults, and kids tailored to different learning needs.",
        color: "bg-blue-100 text-blue-500",
    },
    {
        icon: Brain,
        title: "AI-Powered Chatbot",
        description: "Berong AI assistant trained on official BFP protocols to answer your fire safety questions.",
        color: "bg-purple-100 text-purple-500",
    },
    {
        icon: Flame, // Or generic icon, change if needed
        title: "Fire Simulation",
        description: "Advanced fire spread simulation using PPO and UNet models for evacuation planning.",
        color: "bg-green-100 text-green-500",
    },
    {
        icon: Gamepad2,
        title: "Educational Games",
        description: "Fun and engaging games that teach fire safety concepts to learners of all ages.",
        color: "bg-orange-100 text-orange-500",
    },
];

// Animated Feature Card Component
function FeatureCard({
    feature,
    index,
    reduceMotion
}: {
    key?: React.Key;
    feature: { icon: any; title: string; description: string; color: string };
    index: number;
    reduceMotion: boolean;
}) {
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
                delay: index * 0.1
            }}
            className="group bg-white rounded-2xl p-5 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col items-start border border-gray-100"
        >
            <div className={`${feature.color} w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
                <feature.icon className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
            <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">{feature.description}</p>
        </motion.div>
    );
}

// Animated Team Card Component
function TeamCard({ member, index, reduceMotion }: { key?: React.Key; member: typeof teamMembers[0]; index: number; reduceMotion: boolean }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

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
            whileHover={reduceMotion ? undefined : {
                scale: 1.02,
                transition: { duration: 0.3 }
            }}
            className="group relative bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-border"
        >
            {/* Gradient Header */}
            <div className={`h-32 bg-gradient-to-r ${member.color} relative`}>
                <div className="absolute inset-0 bg-black/20" />
                {/* Decorative circles */}
                <motion.div
                    className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"
                    animate={reduceMotion ? undefined : { scale: [1, 1.1, 1] }}
                    transition={reduceMotion ? undefined : { duration: 3, repeat: Infinity }}
                />
                <motion.div
                    className="absolute top-4 left-4 w-12 h-12 bg-white/10 rounded-full"
                    animate={reduceMotion ? undefined : { scale: [1, 1.2, 1] }}
                    transition={reduceMotion ? undefined : { duration: 2.5, repeat: Infinity, delay: 0.5 }}
                />
            </div>

            {/* Profile Image */}
            <div className="relative -mt-16 flex justify-center">
                <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-r ${member.color} rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity`} />
                    <div className="relative w-32 h-32 rounded-full border-4 border-card overflow-hidden bg-white shadow-xl">
                        <img
                            src={member.image}
                            alt={member.name}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-4 text-center">
                <h3 className="text-xl font-bold text-foreground mb-2">{member.name}</h3>

                {/* Roles */}
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {member.roles.map((role, roleIndex) => (
                        <motion.span
                            key={roleIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: index * 0.1 + roleIndex * 0.05 + 0.15 }}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground"
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
                <div className="flex justify-center gap-3 pt-4 border-t border-border">
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
                                className="h-10 w-10 rounded-full hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 group-hover/social:scale-110"
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

// Partnership Card Component
function PartnershipCard({ children, delay = 0, reduceMotion = false }: { children: React.ReactNode; delay?: number; reduceMotion?: boolean }) {
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
            whileHover={reduceMotion ? undefined : {
                scale: 1.02,
                transition: { duration: 0.3 }
            }}
            className="bg-[#1e293b] rounded-2xl p-5 sm:p-6 border border-slate-700 hover:border-slate-500 transition-all duration-300"
        >
            {children}
        </motion.div>
    );
}

export function LandingAboutSection() {
    const prefersReducedMotion = useReducedMotion();
    const [isMobileViewport, setIsMobileViewport] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const mediaQuery = window.matchMedia("(max-width: 768px)");
        const updateViewport = () => setIsMobileViewport(mediaQuery.matches);

        updateViewport();

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", updateViewport);
            return () => mediaQuery.removeEventListener("change", updateViewport);
        }

        mediaQuery.addListener(updateViewport);
        return () => mediaQuery.removeListener(updateViewport);
    }, []);

    const reduceMotion = Boolean(prefersReducedMotion || isMobileViewport);

    // Hero section scroll animation
    const heroRef = useRef(null);
    const { scrollYProgress: heroScrollProgress } = useScroll({
        target: heroRef,
        offset: ["start end", "end start"]
    });
    const mascotRotateY = useTransform(heroScrollProgress, [0, 1], [0, 15]);
    const mascotScale = useTransform(heroScrollProgress, [0, 0.5], [1, 0.9]);
    const heroTextY = useTransform(heroScrollProgress, [0, 1], [0, reduceMotion ? 0 : 80]);
    const heroOpacity = useTransform(heroScrollProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const heroScale = useTransform(heroScrollProgress, [0, 0.8], [1, 0.95]);

    // Platform Overview section scroll animation
    const platformRef = useRef(null);
    const { scrollYProgress: platformScrollProgress } = useScroll({
        target: platformRef,
        offset: ["start end", "end start"]
    });
    const platformOpacity = useTransform(platformScrollProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const platformScale = useTransform(platformScrollProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95]);

    // Partnership section scroll animation
    const partnershipRef = useRef(null);
    const { scrollYProgress: partnershipScrollProgress } = useScroll({
        target: partnershipRef,
        offset: ["start end", "end start"]
    });
    const partnershipOpacity = useTransform(partnershipScrollProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const partnershipScale = useTransform(partnershipScrollProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95]);

    // Team section scroll animation
    const teamRef = useRef(null);
    const { scrollYProgress: teamScrollProgress } = useScroll({
        target: teamRef,
        offset: ["start end", "end start"]
    });
    const teamOpacity = useTransform(teamScrollProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const teamScale = useTransform(teamScrollProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95]);

    return (
        <div className="space-y-10 sm:space-y-20 mt-10 sm:mt-20">
            {/* Meet Berong Section */}
            <motion.section
                ref={heroRef}
                className="relative bg-white/95 backdrop-blur-sm pt-8 pb-10 sm:py-16 overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-sm"
                style={{ opacity: heroOpacity, scale: heroScale }}
            >
                {/* Background Pattern */}
                <motion.div
                    className="absolute inset-0 opacity-5"
                    style={{ y: useTransform(heroScrollProgress, [0, 1], [0, 50]) }}
                >
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dc2626' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </motion.div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-6 xl:gap-8 max-w-6xl mx-auto">
                        {/* Berong Mascot - 3D Rotation on Scroll */}
                        <motion.div
                            className="flex-shrink-0 flex justify-center lg:justify-end lg:w-[45%]"
                            style={{
                                rotateY: mascotRotateY,
                                scale: mascotScale,
                            }}
                        >
                            <div className="relative w-48 h-48 sm:w-80 sm:h-80 lg:w-[400px] lg:h-[400px]">
                                <motion.div
                                    className="relative w-full h-full"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    animate={{ 
                                        y: [-12, 12, -12],
                                        filter: [
                                            "drop-shadow(0px 30px 25px rgba(0, 0, 0, 0.15))",
                                            "drop-shadow(0px 10px 10px rgba(0, 0, 0, 0.35))",
                                            "drop-shadow(0px 30px 25px rgba(0, 0, 0, 0.15))"
                                        ]
                                    }}
                                    transition={{
                                        y: { duration: 4, ease: "easeInOut", repeat: Infinity },
                                        filter: { duration: 4, ease: "easeInOut", repeat: Infinity },
                                        opacity: { duration: 0.6 },
                                        scale: { duration: 0.6 }
                                    }}
                                >
                                    <img
                                        src="/berong-official-logo.jpg"
                                        alt="Berong's E-Learning - Official Logo"
                                        className="absolute inset-0 w-full h-full object-contain z-10"
                                    />
                                </motion.div>
                            </div>
                        </motion.div>
                        {/* Hero Content - Parallax Text */}
                        <motion.div
                            className="text-center lg:text-left flex-grow lg:w-[55%] pb-1 sm:pb-0 flex flex-col justify-center lg:-ml-4"
                            style={reduceMotion ? undefined : { y: heroTextY }}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4 }}
                                className="mb-4 flex justify-center lg:justify-start"
                            >
                                <span className="bg-red-100 text-red-600 font-bold text-xs sm:text-sm uppercase tracking-widest px-4 py-1.5 rounded-full inline-block">
                                    About SafeScape
                                </span>
                            </motion.div>
                            
                            <motion.h1
                                className="text-3xl sm:text-5xl lg:text-6xl font-black mb-2 sm:mb-3 text-slate-800"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.05 }}
                            >
                                Meet <span className="text-red-500">Berong</span>
                            </motion.h1>
                            
                            <motion.p
                                className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-orange-500"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                            >
                                Your Fire Safety Companion
                            </motion.p>
                            
                            <motion.p
                                className="text-sm sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 px-2 sm:px-0"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.15 }}
                            >
                                <strong className="text-slate-800">SafeScape</strong>, locally known as <strong className="text-slate-800">&quot;Berong E-Learning&quot;</strong>, is named after the official mascot of the Bureau of Fire Protection.
                                Berong represents our commitment to making fire safety education accessible, engaging, and effective for every Filipino.
                            </motion.p>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Platform Overview Section */}
            <motion.section
                ref={platformRef}
                className="py-10 sm:py-24 bg-gradient-to-br from-[#ff4b3e] to-[#ff8c00] text-white relative overflow-hidden rounded-[2.5rem] shadow-sm"
                style={{ opacity: platformOpacity, scale: platformScale }}
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
                        <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                            What is <span className="text-yellow-300">SafeScape</span>?
                        </h2>
                        <p className="text-white/95 font-medium max-w-3xl mx-auto text-sm sm:text-xl px-2">
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

            {/* Partnership Section */}
            <motion.section
                ref={partnershipRef}
                className="py-10 sm:py-14 bg-[#1e293b] text-white relative overflow-hidden rounded-[2.5rem] shadow-md"
                style={{ opacity: partnershipOpacity, scale: partnershipScale }}
            >
                {/* Animated Background decoration */}
                <motion.div
                    className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"
                    animate={reduceMotion ? undefined : {
                        x: [0, 30, 0],
                        y: [0, -20, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={reduceMotion ? undefined : { duration: 8, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"
                    animate={reduceMotion ? undefined : {
                        x: [0, -30, 0],
                        y: [0, 20, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={reduceMotion ? undefined : { duration: 10, repeat: Infinity }}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        className="text-center mb-8 sm:mb-10"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <span className="font-bold text-[10px] sm:text-xs uppercase tracking-widest mb-4 inline-block border border-yellow-500/30 text-yellow-400 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-yellow-500/10">
                            Collaborative Initiative
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3">
                            LSPU & BFP Sta. Cruz Partnership
                        </h2>
                        <p className="text-slate-300 font-medium max-w-4xl mx-auto text-sm sm:text-base leading-relaxed">
                            SafeScape is a collaborative research initiative between the <strong className="text-white">College of Computer Studies (CCS)</strong> at
                            <strong className="text-white"> Laguna State Polytechnic University (LSPU) - Santa Cruz Campus</strong> and the
                            <strong className="text-white"> Bureau of Fire Protection (BFP) Santa Cruz</strong>. This partnership was formalized through a
                            Memorandum of Agreement to address local fire safety challenges by leveraging advanced digital technologies.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" style={{ perspective: 1500 }}>
                        {/* LSPU Card */}
                        <PartnershipCard delay={0} reduceMotion={reduceMotion}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
                                    <img
                                        src="/lspu logo.png"
                                        alt="LSPU Logo"
                                        className="absolute inset-0 w-full h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold">LSPU - Santa Cruz Campus</h3>
                                    <p className="text-gray-400 text-xs sm:text-sm">College of Computer Studies</p>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed mb-4">
                                The university provided technological expertise in AI, machine learning, and software development.
                                Computer Science researchers majoring in Intelligent Systems designed and developed the platform under academic supervision.
                            </p>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10 mt-auto">
                                <div className="flex items-center gap-3">
                                    <GraduationCap className="w-5 h-5 text-yellow-400" />
                                    <div>
                                        <p className="text-yellow-400 font-semibold text-[10px] sm:text-xs">Project Initiation & Thesis Adviser</p>
                                        <p className="text-white font-medium text-sm">Dr. Mia V. Villarica, DIT</p>
                                        <p className="text-gray-400 text-[10px] sm:text-xs">CCS Dean, LSPU Santa Cruz</p>
                                    </div>
                                </div>
                            </div>
                        </PartnershipCard>

                        {/* BFP Card */}
                        <PartnershipCard delay={1} reduceMotion={reduceMotion}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
                                    <img
                                        src="/bfp logo.png"
                                        alt="BFP Logo"
                                        className="absolute inset-0 w-full h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold">BFP Santa Cruz Fire Station</h3>
                                    <p className="text-gray-400 text-xs sm:text-sm">Bureau of Fire Protection</p>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed mb-4">
                                BFP Santa Cruz reached out to LSPU-CCS to find innovative ways to enhance community fire preparedness.
                                They provided the official knowledge base, including manuals and protocols, used to train the Berong AI chatbot and develop educational modules.
                            </p>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10 mt-auto">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-yellow-400" />
                                    <div>
                                        <p className="text-yellow-400 font-semibold text-[10px] sm:text-xs">Project Initiator & Guide</p>
                                        <p className="text-white font-medium text-sm">FSINSP Cesar A. Morfe Jr.</p>
                                        <p className="text-gray-400 text-[10px] sm:text-xs">Initiated the partnership and provided constant guidance</p>
                                    </div>
                                </div>
                            </div>
                        </PartnershipCard>
                    </div>
                </div>
            </motion.section>

            {/* Research Team Section */}
            <motion.section
                ref={teamRef}
                className="pt-16 sm:pt-24 pb-4 sm:pb-8 bg-transparent rounded-3xl"
                style={{ opacity: teamOpacity, scale: teamScale }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="mb-6 flex justify-center">
                            <span className="bg-red-100 text-red-500 font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-block">
                                The Research Team
                            </span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-black text-slate-800 mb-4">
                            Meet the Developers
                        </h2>
                        <p className="text-slate-600 font-medium max-w-2xl mx-auto text-lg">
                            Computer Science researchers majoring in Intelligent Systems who designed and developed SafeScape.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ perspective: 1200 }}>
                        {teamMembers.map((member, index) => (
                            <TeamCard key={index} member={member} index={index} reduceMotion={reduceMotion} />
                        ))}
                    </div>
                </div>
            </motion.section>
        </div>
    );
}
