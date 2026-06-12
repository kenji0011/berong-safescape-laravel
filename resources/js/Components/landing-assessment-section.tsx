import { useState, useEffect, useRef } from "react"
import { motion, useInView, useReducedMotion } from "motion/react"
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    ArrowRight,
    Check,
    Lock,
    Trophy,
    Loader2,
    LogIn,
    X,
    Download,
    Shield
} from "lucide-react"
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"

interface EligibilityData {
    eligible: boolean
    alreadyCompleted?: boolean
    reason: string
    requirements?: {
        minEngagementPoints: number
        minModulesCompleted: number
        minQuizzesCompleted: number
    }
    current?: {
        engagementPoints: number
        modulesCompleted: number
        quizzesCompleted: number
    }
    progress?: {
        engagementPoints: number
        modulesCompleted: number
        quizzesCompleted: number
    }
    preTestScore?: number
    postTestScore?: number
    completedAt?: string
    isAdult?: boolean
}

interface ServerUser {
    id: number
    name: string
    age?: number
    role: string
}

interface LandingAssessmentProps {
    serverUser?: ServerUser | null
}

export function LandingAssessmentSection({ serverUser }: LandingAssessmentProps = {}) {
    const { user: clientUser, isAuthenticated: clientIsAuthenticated, isLoading } = useAuth()

    // Use server-provided user when available (avoids waiting for client auth check)
    const user = clientUser || (serverUser ? {
        ...serverUser,
        username: '',
        permissions: { accessKids: false, accessAdult: false, accessProfessional: false, isAdmin: false },
        isActive: true,
        createdAt: '',
    } as any : null)
    const isAuthenticated = clientIsAuthenticated || !!serverUser

    
    const [loading, setLoading] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [eligibility, setEligibility] = useState<EligibilityData | null>(null)
    const [showCertificate, setShowCertificate] = useState(false)
    const certificateRef = useRef<HTMLDivElement>(null)
    const sectionRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" })
    const prefersReducedMotion = useReducedMotion()

    // Format date properly
    const formatDate = (dateString?: string) => {
        if (!dateString) return ""
        const d = new Date(dateString)
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const day = d.getDate()
        const getOrdinal = (n: number) => {
            const s = ["th", "st", "nd", "rd"]
            const v = n % 100
            return n + (s[(v - 20) % 10] || s[v] || s[0])
        }
        return `Given this ${getOrdinal(day)} day of ${monthNames[d.getMonth()]}, ${d.getFullYear()}`
    }

    useEffect(() => {
        // If server already told us the user is authenticated, check immediately
        if (isAuthenticated) {
            checkEligibility()
        } else if (!isLoading && !isAuthenticated) {
            setLoading(false);
        }
    }, [isLoading, isAuthenticated])

    const checkEligibility = async () => {
        try {
            setLoading(true)
            const response = await axios.get("/api/assessments/post-test-eligibility")
            setEligibility(response.data)
        } catch (err: any) {
            if (err.response && err.response.status === 401) {
                // Silently ignore 401 Unauthorized errors
                return;
            }
            console.error("Failed to check eligibility", err)
        } finally {
            setLoading(false)
        }
    }

    const downloadPDF = async () => {
        if (!certificateRef.current) return;

        try {
            setDownloading(true);
            const [{ toPng }, { default: JsPDF }] = await Promise.all([
                import("html-to-image"),
                import("jspdf"),
            ]);

            // html-to-image handles modern CSS like Tailwind v4 oklch() colors much better
            const dataUrl = await toPng(certificateRef.current, {
                quality: 1.0,
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                filter: (node) => {
                    // Filter out elements that might cause serialization issues
                    // like elements with specific oklch styles or external SVGs if they fail
                    return true;
                },
                style: {
                    // Force a consistent rendering context
                    transform: 'none',
                    margin: '0',
                }
            });

            // A4 size in mm: 297 x 210 (Landscape)
            const pdf = new JsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`SafeScape_Certificate_${user?.name?.replace(/\s+/g, '_') || 'Hero'}.pdf`);
        } catch (error) {
            console.error("Error generating PDF", error);
        } finally {
            setDownloading(false);
        }
    }

    const handleStartClick = () => {
        if (!isAuthenticated) {
            router.visit("/login")
        } else {
            router.visit("/assessment/post-test")
        }
    }

    if (isLoading) {
        return (
            <div className="py-12 bg-transparent flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <motion.div
            ref={sectionRef}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full bg-gradient-to-br from-slate-100 via-slate-50 to-orange-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 rounded-[2.5rem] py-8 sm:py-16 px-6 sm:px-12 border border-slate-200/80 dark:border-slate-700/50 shadow-sm relative overflow-hidden transition-colors duration-500"
        >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/30 dark:bg-orange-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-200/20 dark:bg-red-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
            {/* Dot pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, rgba(0,0,0,0.4) 1px, transparent 0)",
                backgroundSize: "24px 24px",
            }} />
            
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-8 sm:mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 mb-4"
                    >
                        <Trophy className="h-3.5 w-3.5 text-red-500" strokeWidth={2.5} />
                        <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">Certification</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.25 }}
                        className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white mb-4 sm:mb-6"
                    >
                        Become a SafeScape Hero
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.35 }}
                        className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto"
                    >
                        Take the official post-test to validate your fire safety knowledge and earn your verified certificate.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.97 }}
                    animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.45 }}
                    className="max-w-3xl mx-auto shadow-xl rounded-3xl hover:shadow-2xl transition-shadow duration-300"
                >
                    <div className="overflow-hidden rounded-3xl bg-white dark:bg-slate-800">
                        <div className="md:flex">
                            <div className="md:w-5/12 bg-gradient-to-br from-[#fb5656] to-rose-600 p-6 sm:p-8 text-white flex flex-col justify-center items-center text-center rounded-none relative z-10 shadow-[0_4px_24px_rgba(0,0,0,0.15)] md:shadow-[4px_0_24px_rgba(0,0,0,0.15)] overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-rose-900/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
                                
                                <motion.div 
                                    animate={{ y: [0, -8, 0] }} 
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-14 h-14 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md rounded-2xl sm:rounded-[2rem] flex items-center justify-center mb-4 sm:mb-6 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.15)] relative z-10"
                                >
                                    <Trophy className="w-7 h-7 sm:w-10 sm:h-10 text-white drop-shadow-md" strokeWidth={2.5} />
                                </motion.div>
                                <h3 className="text-2xl sm:text-3xl font-black mb-1 sm:mb-2 tracking-tight drop-shadow-sm relative z-10">Final Assessment</h3>
                                <div className="bg-white/20 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/20 backdrop-blur-sm relative z-10 mt-1 sm:mt-2">
                                    <p className="text-white text-[9px] sm:text-[10px] font-black tracking-widest uppercase drop-shadow-sm">Official Certification</p>
                                </div>
                            </div>

                            <div className="md:w-7/12 p-6 sm:p-10 flex flex-col justify-center bg-white dark:bg-slate-800 rounded-none z-0">
                            {!isAuthenticated ? (
                                <div className="space-y-4">
                                    <h4 className="text-2xl font-bold text-slate-800 dark:text-white">Ready for the challenge?</h4>
                                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                                        Log in to unlock the exam. Remember, you must complete all learning activities first!
                                    </p>
                                    <button onClick={handleStartClick} className="w-full bg-[#1e293b] hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-black h-12 rounded-full mt-4 border-2 border-slate-900 dark:border-slate-600 border-b-[4px] active:border-b-2 active:translate-y-[2px] shadow-sm transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm">
                                        <Shield className="h-5 w-5" /> Login to Start
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h4 className="text-xl font-bold text-slate-800 dark:text-white">
                                        {eligibility?.alreadyCompleted ? "You've Certified!" : "Take the Challenge"}
                                    </h4>

                                    {loading ? (
                                        <div className="flex items-center text-slate-500 dark:text-slate-400">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking eligibility...
                                        </div>
                                    ) : eligibility?.alreadyCompleted ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-emerald-950/20 rounded-lg border border-green-100 dark:border-emerald-900/30 text-green-700 dark:text-emerald-400 transition-colors">
                                                <Check className="h-5 w-5" />
                                                <span className="font-medium">Assessment Completed</span>
                                            </div>
                                            <div className="flex gap-3">
                                                <button onClick={handleStartClick} className="flex-1 h-11 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-black rounded-full border-2 border-slate-200 dark:border-slate-600 border-b-[4px] active:border-b-2 active:translate-y-[2px] shadow-sm transition-all flex items-center justify-center uppercase tracking-wider text-xs">
                                                    View Results
                                                </button>
                                                <button onClick={() => setShowCertificate(true)} className="flex-1 h-11 text-white bg-red-600 hover:bg-red-500 font-black rounded-full border-2 border-red-700 dark:border-red-500 border-b-[4px] active:border-b-2 active:translate-y-[2px] shadow-sm transition-all flex items-center justify-center uppercase tracking-wider text-xs">
                                                    View Certificate
                                                </button>
                                            </div>
                                        </div>
                                    ) : eligibility?.eligible ? (
                                        <div className="space-y-4">
                                            <p className="text-slate-600 dark:text-slate-400">
                                                You've met all the requirements! You are now eligible to take the final post-test assessment.
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium mb-2">
                                                <Check className="h-4 w-4" /> Requirements Met
                                            </div>
                                            <button onClick={handleStartClick} className="w-full h-12 bg-green-600 hover:bg-green-500 text-white font-black rounded-full border-2 border-green-700 border-b-[4px] active:border-b-2 active:translate-y-[2px] shadow-sm transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm">
                                                Start Assessment <ArrowRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-slate-50/80 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm backdrop-blur-md transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600">
                                                <h5 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                                    <Lock className="h-4 w-4 text-amber-500" />
                                                    Unlock Requirements
                                                </h5>

                                                <div className="space-y-3 text-sm">
                                                    {/* Pre-Test Requirement */}
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-0.5 rounded-full p-0.5 ${typeof eligibility?.preTestScore === 'number' ? 'bg-green-100 dark:bg-emerald-950 text-green-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-600'}`}>
                                                            <Check className="h-3 w-3" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className={`font-medium ${typeof eligibility?.preTestScore === 'number' ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-500'}`}>
                                                                Complete Pre-Test Assessment
                                                            </p>
                                                            {typeof eligibility?.preTestScore !== 'number' && (
                                                                <Button
                                                                    variant="link"
                                                                    className="h-auto p-0 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-xs"
                                                                    onClick={() => router.visit('/assessment/pre-test')}
                                                                >
                                                                    Take Pre-Test Now →
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Modules Requirement (Kids Only) */}
                                                    {!eligibility?.isAdult && eligibility?.requirements && (
                                                        <div className="flex items-start gap-3">
                                                            <div className={`mt-0.5 rounded-full p-0.5 ${(eligibility.current?.modulesCompleted || 0) >= (eligibility.requirements.minModulesCompleted || 0) ? 'bg-green-100 dark:bg-emerald-950 text-green-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-600'}`}>
                                                                <Check className="h-3 w-3" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className={`font-medium ${(eligibility.current?.modulesCompleted || 0) >= (eligibility.requirements.minModulesCompleted || 0) ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-500'}`}>
                                                                    Complete Learning Modules
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Progress value={eligibility.progress?.modulesCompleted || 0} className="h-1.5 w-24 bg-slate-200 dark:bg-slate-700" />
                                                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                                                        {eligibility.current?.modulesCompleted}/{eligibility.requirements.minModulesCompleted}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Engagement Points Requirement */}
                                                    {eligibility?.requirements && (
                                                        <div className="flex items-start gap-3">
                                                            <div className={`mt-0.5 rounded-full p-0.5 ${(eligibility.current?.engagementPoints || 0) >= (eligibility.requirements.minEngagementPoints || 0) ? 'bg-green-100 dark:bg-emerald-950 text-green-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-600'}`}>
                                                                <Check className="h-3 w-3" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className={`font-medium ${(eligibility.current?.engagementPoints || 0) >= (eligibility.requirements.minEngagementPoints || 0) ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-500'}`}>
                                                                    Earn Engagement Points
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Progress value={eligibility.progress?.engagementPoints || 0} className="h-1.5 w-24 bg-slate-200 dark:bg-slate-700" />
                                                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                                                        {eligibility.current?.engagementPoints}/{eligibility.requirements.minEngagementPoints}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <button onClick={() => router.visit(user?.age && user.age < 18 ? "/kids" : "/adult")} className="w-full h-12 bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 font-black rounded-full border-2 border-slate-950 dark:border-slate-600 border-b-[4px] active:border-b-2 active:translate-y-[2px] shadow-sm transition-all flex items-center justify-center uppercase tracking-wider text-sm">
                                                Continue Learning Activities
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        </div>
                    </div>
                </motion.div>
            
            {/* End of max-w-4xl wrapper */}
            </div>

            {/* Certificate Modal */}
            <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
                <DialogContent aria-describedby={undefined} className="max-w-[95vw] sm:max-w-4xl md:max-w-5xl lg:max-w-6xl w-full p-0 overflow-hidden bg-transparent border-none shadow-none">
                    <DialogTitle className="sr-only">Certificate of Completion</DialogTitle>
                    <div className="relative w-full max-w-[95vw] sm:max-w-4xl md:max-w-5xl lg:max-w-6xl bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col items-center">
                        <DialogClose asChild>
                            <button className="absolute top-4 right-4 z-20 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition-colors shadow-lg disabled:opacity-50" disabled={downloading}>
                                <X className="h-5 w-5" />
                            </button>
                        </DialogClose>

                        <div ref={certificateRef} className="relative w-full select-none" style={{ aspectRatio: '1123/794' }}>
                            <img src="/safescape_certificate.svg" alt="Certificate Template" className="absolute inset-0 w-full h-full object-contain" crossOrigin="anonymous" />

                            <div className="absolute inset-x-0 text-center flex justify-center items-center" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                                <h2 className="text-[clamp(1rem,3vw,2.5rem)] font-bold text-[#1a1a2e] uppercase tracking-widest" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                                    {user?.name || "Future Hero"}
                                </h2>
                            </div>

                            <div className="absolute inset-x-0 text-center flex justify-center items-center" style={{ top: '78%', transform: 'translateY(-50%)' }}>
                                <p className="text-[clamp(0.6rem,1.5vw,1rem)] text-[#333]" style={{ fontFamily: "'Alice', 'Georgia', serif" }}>
                                    {formatDate(eligibility?.completedAt)}
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-slate-50 dark:bg-slate-900 w-full p-4 border-t border-slate-200 dark:border-slate-800 flex justify-center items-center transition-colors">
                            <Button
                                onClick={downloadPDF}
                                disabled={downloading}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full font-bold transition-colors flex items-center gap-2"
                            >
                                {downloading ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Generating PDF...</>
                                ) : (
                                    <><Download className="h-4 w-4" /> Download Certificate</>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
        // </section>
    )
}
