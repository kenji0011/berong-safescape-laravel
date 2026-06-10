"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { Link, router } from '@inertiajs/react'
import { ArrowLeft, CheckCircle, Shield, BookOpen, Trophy, Flame, FlaskConical, RotateCcw, Info, Volume2, VolumeX, Eye, BellOff } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import DashboardLayout from "@/Layouts/DashboardLayout"
import axios from "axios"
import { cn } from "@/lib/utils"
import { ModuleNavigation } from "@/Components/module-navigation"
import { RotateCcw as RotateCcwIcon } from "lucide-react"
import { AdaptiveQuiz } from "@/Components/AdaptiveQuiz"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type LabItem = { id: string; label: string; role: string; bg: string; icon: string; image?: string; correct: boolean }

const LAB_ITEMS: LabItem[] = [
  { id: "wood",  label: "Wood",  role: "Fuel",    bg: "bg-amber-800 border-amber-600 hover:bg-amber-700", icon: "🪵", image: "/wood.png", correct: true  },
  { id: "spark", label: "Spark", role: "Heat",    bg: "bg-red-800   border-red-600   hover:bg-red-700",   icon: "✨", image: "/spark.png", correct: true  },
  { id: "fan",   label: "Fan",   role: "Oxygen",  bg: "bg-blue-800  border-blue-600  hover:bg-blue-700",  icon: "💨", image: "/fan.png", correct: true  },
  { id: "water", label: "Water", role: "Remover", bg: "bg-cyan-800  border-cyan-600  hover:bg-cyan-700",  icon: "🪣", image: "/water.png", correct: false },
]

const CORRECT_IDS = ["wood", "spark", "fan"]

// ─────────────────────────────────────────────
// ModuleOne Page
// ─────────────────────────────────────────────
const ModuleOnePage = ({ initialProgress }: { initialProgress?: any }) => {
  const { user } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const reviewQuestionsRef = useRef<HTMLDivElement>(null)
  const resultCardRef = useRef<HTMLDivElement>(null)
  const quizSectionRef = useRef<HTMLElement>(null)


  // ── Progress state ──
  const [videoStarted,    setVideoStarted]    = useState(initialProgress?.sectionData?.module1?.videoWatched || false)
  const [section1Done,    setSection1Done]    = useState(initialProgress?.sectionData?.module1?.section1Read || false)
  const [section2Done,    setSection2Done]    = useState(initialProgress?.sectionData?.module1?.section2Read || false)
  const [section3Done,    setSection3Done]    = useState(initialProgress?.sectionData?.module1?.section3Read || false)
  const [labCompleted,    setLabCompleted]    = useState(initialProgress?.sectionData?.module1?.elementMixerCompleted || false)
  const [mixerEverCompleted, setMixerEverCompleted] = useState(initialProgress?.sectionData?.module1?.elementMixerCompleted || false)
  const [moduleCompleted, setModuleCompleted] = useState(initialProgress?.completedModules?.includes(1) || false)
  const [saving,          setSaving]          = useState(false)
  const [pitMessage,      setPitMessage]      = useState("The pit is empty.")
  const [pitWater,        setPitWater]        = useState(false)
  const [isDragOver,      setIsDragOver]      = useState(false)
  const [toast,           setToast]           = useState<{ msg: string; type: "success" | "info" } | null>(null)
  const [moduleLoading,   setModuleLoading]   = useState(true)
  const [completedModules, setCompletedModules] = useState<number[]>(initialProgress?.completedModules || [])

  // Quiz state
  const [quizPassed,      setQuizPassed]      = useState(initialProgress?.sectionData?.module1?.quizPassed || false)
  const [quizScore,       setQuizScore]       = useState<number | null>(initialProgress?.sectionData?.module1?.quizScore !== undefined ? Number(initialProgress?.sectionData?.module1?.quizScore) : null)
  const [quizAnswers,     setQuizAnswers]     = useState<(number | null)[]>(initialProgress?.sectionData?.module1?.quizAnswers || [])
  const [pitItems,        setPitItems]        = useState<string[]>(initialProgress?.sectionData?.module1?.elementMixerCompleted ? CORRECT_IDS : [])
  const [showBadgeModal,  setShowBadgeModal]  = useState(false)

  // Simulated loading to match the skeleton experience of other modules
  useEffect(() => {
    const timer = setTimeout(() => {
      setModuleLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Tap sound removed per user request

  // Load progress from backend on mount
  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.get("/api/kids/safescape")
        const data = response.data
        const m1 = data.sectionData?.module1 ?? {}
        if (m1.videoWatched)           setVideoStarted(true)
        if (m1.section1Read)           setSection1Done(true)
        if (m1.section2Read)           setSection2Done(true)
        if (m1.section3Read)           setSection3Done(true)
        if (m1.elementMixerCompleted)  { setLabCompleted(true); setMixerEverCompleted(true); setPitItems(CORRECT_IDS) }
        if (m1.quizPassed)             { setQuizPassed(true) }
        if (m1.quizAnswers)            { setQuizAnswers(m1.quizAnswers) }
        if (m1.quizScore !== undefined && m1.quizScore !== null) { setQuizScore(Number(m1.quizScore)) }
        if (data.completedModules) setCompletedModules(data.completedModules)
        if (data.completedModules?.includes(1)) setModuleCompleted(true)
      } catch (error) {
        console.error("Failed to load progress:", error)
      }
    }
    load()
  }, [])

  // ── Progress bar ──
  const progress = useMemo(() => {
    if (moduleCompleted) return 100;
    const states = [videoStarted, section1Done, section2Done, section3Done, labCompleted, quizPassed];
    const completedCount = states.filter(Boolean).length;
    return Math.round((completedCount / 6) * 100);
  }, [videoStarted, section1Done, section2Done, section3Done, labCompleted, quizPassed, moduleCompleted])

  // ── Helper: save to backend ──
  const saveSection = async (sectionData: Record<string, any>, completed: boolean) => {
    try {
      await axios.post("/api/kids/safescape", { 
        moduleNum: 1, 
        sectionData, 
        completed 
      });
    } catch (error: any) {
      console.error("Failed to save section:", error.response?.data || error.message)
    }
  }

  function getCookie(name: string): string {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
    return match ? decodeURIComponent(match[2]) : ""
  }

  function showToast(msg: string, type: "success" | "info" = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Event handlers ──
  const handleVideoPlay = () => {
    if (!videoStarted) {
      setVideoStarted(true)
      saveSection({ videoWatched: true, section1Read: section1Done, section2Read: section2Done, section3Read: section3Done, elementMixerCompleted: labCompleted }, false)
      showToast("Video started! Keep watching.", "info")
    }
  }

  const handleSection1 = () => {
    if (section1Done) return
    setSection1Done(true)
    saveSection({ videoWatched: videoStarted, section1Read: true, section2Read: section2Done, section3Read: section3Done, elementMixerCompleted: labCompleted }, false)
    showToast("Great! Fire Triangle mastered!")
  }

  const handleSection2 = () => {
    if (section2Done) return
    setSection2Done(true)
    saveSection({ videoWatched: videoStarted, section1Read: section1Done, section2Read: true, section3Read: section3Done, elementMixerCompleted: labCompleted }, false)
    showToast("You know the rules! Stay safe!")
  }

  const handleSection3 = () => {
    if (section3Done) return
    setSection3Done(true)
    saveSection({ videoWatched: videoStarted, section1Read: section1Done, section2Read: section2Done, section3Read: true, elementMixerCompleted: labCompleted }, false)
    showToast("You understand how fire travels!")
  }

  // ── Drag-and-drop handlers ──
  const handleDragStart = (e: React.DragEvent, item: LabItem) => {
    e.dataTransfer.setData("itemId", item.id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const itemId = e.dataTransfer.getData("itemId")
    const item = LAB_ITEMS.find(i => i.id === itemId)
    if (!item) return
    handleItemDrop(item)
  }

  const handleItemDrop = (item: LabItem) => {
    // Play element-specific sound effect
    const soundMap: Record<string, string> = {
      wood: "/sounds/wood.mp3",
      spark: "/sounds/spark.mp3",
      fan: "/sounds/fan.mp3",
      water: "/sounds/water.mp3",
    }
    if (soundMap[item.id]) {
      new Audio(soundMap[item.id]).play().catch(e => console.warn("Failed to play element sound:", e))
    }

    // Water can ALWAYS be used — even after the fire is lit
    if (item.id === "water") {
      if (pitItems.includes("spark")) {
        // Remove heat specifically, like the old version
        const next = pitItems.filter(id => id !== "spark")
        setPitItems(next)
        setLabCompleted(false)
        setPitWater(true)
        setPitMessage("🌊 Sizzle! Water removed the Heat.")
        setTimeout(() => setPitWater(false), 1200)
      } else {
        setPitMessage("Water added, but there was no heat to cool.")
      }
      return
    }

    // For non-water items, block if already completed
    if (labCompleted) return

    if (pitItems.includes(item.id)) {
      setPitMessage(`You already have ${item.role}.`)
      return
    }

    const next = [...pitItems, item.id]
    setPitItems(next)

    const missing = CORRECT_IDS.filter(id => !next.includes(id))
    if (missing.length === 0) {
      setLabCompleted(true)
      setMixerEverCompleted(true)
      setPitMessage("🔥 FIRE STARTED! The Triangle is complete!")
      const sectionData = { videoWatched: videoStarted, section1Read: section1Done, section2Read: section2Done, section3Read: section3Done, elementMixerCompleted: true }
      saveSection(sectionData, false)
    } else {
      const missingLabels = missing.map(id => LAB_ITEMS.find(i => i.id === id)?.role ?? id)
      setPitMessage(`Added ${item.role}. Missing: ${missingLabels.join(", ")}.`)
    }
  }

  const resetPit = () => {
    setPitItems([])
    setLabCompleted(false)
    setPitMessage("Pit cleared. Start over!")
  }

  const completeModule = async () => {
    setSaving(true)
    try {
      // Award badge
      await axios.post('/api/badges/award', {
        badge_id: 'module_1',
        badge_name: 'Fire Scout',
        badge_icon: '/fire_hall.png'
      });

      await axios.post("/api/kids/safescape", { 
        moduleNum: 1, 
        sectionData: { videoWatched: true, section1Read: true, section2Read: true, section3Read: true, elementMixerCompleted: true, quizPassed: true }, 
        completed: true 
      });

      setModuleCompleted(true)
      setShowBadgeModal(true)
    } catch (error: any) {
      console.error("Failed to complete module:", error.response?.data || error.message)
      showToast("Error saving progress. Try again.", "info")
    } finally {
      setSaving(false)
    }
  }


  // ─────────────────────────────────────────────

  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] font-sans flex flex-col transition-colors duration-500">

      {/* ── Sub Header ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-6 lg:px-8 shadow-sm z-[50] sticky top-[64px] sm:top-[72px] ss-sub-header transition-colors">
        <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/kids/safescape" className="inline-flex items-center justify-center gap-2 p-2 sm:px-4 sm:py-2 bg-white dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300 font-bold hover:text-slate-900 dark:hover:text-white border-[3px] border-slate-200 dark:border-slate-700 shadow-[0_3px_0_#cbd5e1] dark:shadow-[0_3px_0_#0f172a] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all text-sm whitespace-nowrap">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              <Flame className="h-5 w-5 text-[#ff4b3e]" />
              <h1 className="text-xl font-black text-slate-800 dark:text-white transition-colors">SafeScape Fire Safety Course</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-6">
            {/* Module dots */}
            <ModuleNavigation currentModule={1} completedModules={completedModules} />
            {/* Progress */}
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-nowrap hidden lg:block transition-colors">
              {progress === 100 ? (
                <>Status: <span className="text-green-500 font-black ml-1">Completed ✓</span></>
              ) : (
                <>Progress: <span className="text-[#ff4b3e] font-black ml-1">{progress}%</span></>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Module Content Area ── */}
      <div className="flex-1 relative">
        
        {/* Skeleton Loader (Simulated for visual consistency with other modules) */}
        {moduleLoading && (
          <div className="absolute inset-0 z-10 bg-white dark:bg-slate-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] flex flex-col items-center justify-start pt-32 px-4 pointer-events-none transition-colors">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border-[3px] border-blue-200 dark:border-slate-800 flex items-center justify-center mb-6 animate-bounce transition-colors">
              <Flame className="h-8 w-8 sm:h-10 sm:w-10 text-[#ff4b3e] animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-3 w-full max-w-2xl px-2 sm:px-6">
              <div className="h-6 sm:h-10 w-48 sm:w-64 bg-blue-200/50 dark:bg-blue-900/30 rounded-full animate-pulse"></div>
              <div className="h-4 sm:h-5 w-64 sm:w-96 bg-blue-200/50 dark:bg-blue-900/30 rounded-full animate-pulse delay-75 mb-6"></div>
              
              <div className="w-full space-y-4">
                <div className="h-48 sm:h-64 w-full bg-white/60 dark:bg-slate-900/60 rounded-[2rem] border-[3px] border-blue-200/50 dark:border-slate-800/50 animate-pulse delay-150 transition-colors"></div>
                <div className="h-32 sm:h-48 w-full bg-white/60 dark:bg-slate-900/60 rounded-[2rem] border-[3px] border-blue-200/50 dark:border-slate-800/50 animate-pulse delay-200 transition-colors"></div>
              </div>
            </div>
            <p className="mt-8 text-blue-400 font-bold tracking-widest uppercase text-sm animate-pulse delay-300">Loading Module Content...</p>
          </div>
        )}

        <div className={cn(
          "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 space-y-10 sm:space-y-14 md:space-y-20 transition-opacity duration-700",
          moduleLoading ? "opacity-0" : "opacity-100"
        )}>

          <div className="space-y-10 sm:space-y-14 md:space-y-20 transition-all duration-500">

          {/* ── Intro ── */}
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-primary leading-tight drop-shadow-sm">
              Fire is a Tool, Not a Toy
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 font-bold leading-relaxed max-w-2xl mx-auto transition-colors">
              To be a fire safety hero, the first thing you need to do is understand what fire is and respect its power.
              Just like some tools are only for grown-ups to use, fire is also something that needs to be handled with great care.
              This module will help you understand why fire is a tool for adults and not a toy for kids.
            </p>
          </div>

          {/* ── Video Section ── */}
          <section className={cn("relative bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] border-[3px] sm:border-[4px] border-blue-200 dark:border-blue-900/50 shadow-sm p-4 sm:p-6 md:p-10 text-center transition-all")}>
            {videoStarted && (
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-500 border-[3px] border-white shadow-sm flex items-center justify-center">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            )}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-blue-600 dark:text-blue-400 mb-4 sm:mb-6 drop-shadow-sm transition-colors">Watch the Intro Video</h2>
            <div className="w-full aspect-video bg-slate-100 dark:bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border-[3px] sm:border-[4px] border-blue-200 dark:border-blue-900/50 relative transition-colors">
              <video
                ref={videoRef}
                controls
                className="w-full h-full object-cover"
                onPlay={handleVideoPlay}
              >
                <source src="/modules/assets/videos/m1.mp4" type="video/mp4" />
                Your browser doesn't support HTML5 video.
              </video>
            </div>
            <p className="text-center text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-sm mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-slate-100 dark:border-slate-800 uppercase tracking-widest transition-colors">Watch the video to continue</p>
          </section>

          {/* ── Section 1.1 — What Makes a Fire? (unlocked after video) ── */}
          <section className={cn(
            "relative bg-white dark:bg-slate-900 rounded-[2rem] border-[4px] border-orange-200 dark:border-orange-900/30 p-5 sm:p-8 md:p-12 shadow-sm transition-all duration-500 overflow-hidden",
            !videoStarted && "pointer-events-none select-none"
          )}>
            {section1Done && (
              <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-green-500 border-[3px] border-white shadow-sm flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            )}
            {!videoStarted && (
              <div className="absolute inset-0 rounded-[2rem] bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-[3px] flex items-center justify-center z-20 transition-all duration-300">
                <p className="text-amber-600 dark:text-amber-400 font-black text-sm sm:text-base md:text-lg bg-white dark:bg-slate-800 px-6 py-3.5 sm:px-8 sm:py-4 rounded-full border-[3px] border-amber-500 shadow-2xl flex items-center gap-2.5 transition-all">
                  🔒 Watch the video first to unlock
                </p>
              </div>
            )}

            <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center transition-all duration-500", !videoStarted && "opacity-20 blur-[1px]")}>
              {/* Text content */}
              <div className="space-y-4 sm:space-y-6 order-2 md:order-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <span className="bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 border-2 border-orange-200 dark:border-orange-800 shadow-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-xl text-xs sm:text-sm font-black transition-colors">1.1</span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-white transition-colors">What Makes a Fire?</h2>
                </div>
                <div className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base space-y-3 sm:space-y-4 font-medium transition-colors">
                  <p>
                    Have you ever seen a stool with three legs? If you take one leg away, the stool falls over.{" "}
                    <strong className="text-slate-800 dark:text-white transition-colors">Fire is just like that!</strong> It needs three things to exist, and we call this the "fire triangle."
                    If you take any one of them away, the fire goes out.
                  </p>
                  <ul className="space-y-3 sm:space-y-4 bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 rounded-2xl border-[3px] border-orange-100 dark:border-orange-900/30 shadow-inner transition-colors">
                    <li className="flex gap-3 sm:gap-4 items-start">
                      <span className="text-red-400 text-lg sm:text-xl mt-0.5">🔥</span>
                      <div>
                        <strong className="text-slate-800 dark:text-white block text-sm sm:text-base transition-colors">Heat</strong>
                        <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors">This is something hot, like a spark or a flame, that gets the fire started.</span>
                      </div>
                    </li>
                    <li className="flex gap-3 sm:gap-4 items-start">
                      <span className="text-amber-400 text-lg sm:text-xl mt-0.5">🌲</span>
                      <div>
                        <strong className="text-slate-800 dark:text-white block text-sm sm:text-base transition-colors">Fuel</strong>
                        <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors">This is anything that can burn, like paper, wood, or cloth.</span>
                      </div>
                    </li>
                    <li className="flex gap-3 sm:gap-4 items-start">
                      <span className="text-blue-400 text-lg sm:text-xl mt-0.5">💨</span>
                      <div>
                        <strong className="text-slate-800 dark:text-white block text-sm sm:text-base transition-colors">Air (Oxygen)</strong>
                        <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors">Fire needs to breathe, just like we do! It uses a part of the air called oxygen to stay alive.</span>
                      </div>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={handleSection1}
                  disabled={section1Done}
                  className={cn(
                    "inline-flex items-center gap-2 text-sm transition-all uppercase tracking-wide",
                    section1Done
                      ? "bg-green-500 text-white px-6 py-3 rounded-full border-[3px] border-green-600 shadow-[0_4px_0_#15803d] cursor-default font-black"
                      : "bg-orange-400 hover:bg-orange-500 text-white px-6 py-3 rounded-full shadow-[0_4px_0_#c2410c] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none font-normal"
                  )}
                >
                  {section1Done && <CheckCircle className="h-4 w-4" />}
                  {section1Done ? "Completed" : "I understand the Fire Triangle"}
                </button>
              </div>

              {/* Fire Triangle Image */}
              <div className="order-1 md:order-2">
                <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-[3px] sm:border-[4px] border-orange-200 dark:border-orange-900/30 shadow-sm transform hover:rotate-0 rotate-1 transition-all duration-500 flex items-center justify-center p-3 sm:p-4">
                  <img
                    src="/modules/assets/images/m1.png"
                    alt="The Fire Triangle — Heat, Fuel, Oxygen"
                    className="w-full h-auto max-h-48 sm:max-h-60 md:max-h-72 object-contain dark:brightness-90"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 1.2 — Grown-Up Tools (unlocked after section1) ── */}
          <section className={cn(
            "relative bg-white dark:bg-slate-900 rounded-[2rem] border-[4px] border-red-200 dark:border-red-900/30 p-5 sm:p-8 md:p-12 overflow-hidden shadow-sm transition-all duration-500",
            !section1Done && "pointer-events-none select-none"
          )}>
            {section2Done && (
              <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-green-500 border-[3px] border-white shadow-sm flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            )}
            {!section1Done && (
              <div className="absolute inset-0 rounded-[2rem] bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-[3px] flex items-center justify-center z-20 transition-all duration-300">
                <p className="text-amber-600 dark:text-amber-400 font-black text-sm sm:text-base md:text-lg bg-white dark:bg-slate-800 px-6 py-3.5 sm:px-8 sm:py-4 rounded-full border-[3px] border-amber-500 shadow-2xl flex items-center gap-2.5 transition-all">
                  🔒 Complete Section 1.1 first
                </p>
              </div>
            )}

            <div className={cn("relative z-10 transition-all duration-500", !section1Done && "opacity-20 blur-[1px]")}>
              <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-8">
                <span className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 shadow-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-xl text-xs sm:text-sm font-black transition-colors">1.2</span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-white transition-colors">Grown-Up Tools</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
                <div className="md:col-span-2 text-slate-600 dark:text-slate-400 space-y-3 sm:space-y-5 leading-relaxed text-sm sm:text-base font-medium transition-colors">
                  <p>
                    You know that grown-ups use special tools for their jobs, like power saws or even cars.
                    These tools are very helpful, but they can be very dangerous if they aren't used correctly,
                    which is why only trained adults are allowed to use them.
                  </p>
                  <p>
                    Matches and lighters are the same. They are tools that grown-ups use to light candles or start a barbecue.
                    They are <span className="text-red-500 font-black">not toys</span>.
                    Because they create heat, they can easily start a dangerous fire if they fall into the wrong hands.
                  </p>
                  <button
                    onClick={handleSection2}
                    disabled={section2Done}
                    className={cn(
                      "inline-flex items-center gap-2 text-sm transition-all uppercase tracking-wide mt-2",
                      section2Done
                        ? "bg-green-500 text-white px-6 py-3 rounded-full border-[3px] border-green-600 shadow-[0_4px_0_#15803d] cursor-default font-black"
                        : "bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none font-normal"
                    )}
                  >
                    {section2Done && <CheckCircle className="h-4 w-4" />}
                    {section2Done ? "Completed" : "I understand the rules"}
                  </button>
                </div>

                {/* Golden Rule Card */}
                <div className="bg-red-50 dark:bg-red-950/20 border-[3px] border-red-200 dark:border-red-900/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:scale-105 transition-all duration-300">
            <div className="bg-red-500 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-md border-[3px] border-white dark:border-red-900">
                    <span className="text-white text-lg sm:text-xl">✋</span>
                  </div>
                  <h3 className="text-red-600 dark:text-red-400 font-black mb-2 sm:mb-3 uppercase tracking-wider text-[10px] sm:text-xs transition-colors">Powerful Rule</h3>
                  <p className="text-slate-700 dark:text-slate-300 font-medium italic text-xs sm:text-sm leading-relaxed transition-colors">
                    "If you find matches or a lighter,{" "}
                    <span className="text-red-500 font-black">do not touch them</span>.
                    Go and tell a grown-up right away."
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 1.3 — How a Fire Grows & Travels (unlocked after section2) ── */}
          <section className={cn(
            "relative bg-white dark:bg-slate-900 rounded-[2rem] border-[4px] border-rose-200 dark:border-rose-900/30 p-5 sm:p-8 md:p-12 shadow-sm transition-all duration-500 overflow-hidden",
            !section2Done && "pointer-events-none select-none"
          )}>
            {section3Done && (
              <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-green-500 border-[3px] border-white shadow-sm flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            )}
            {!section2Done && (
              <div className="absolute inset-0 rounded-[2rem] bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-[3px] flex items-center justify-center z-20 transition-all duration-300">
                <p className="text-amber-600 dark:text-amber-400 font-black text-sm sm:text-base md:text-lg bg-white dark:bg-slate-800 px-6 py-3.5 sm:px-8 sm:py-4 rounded-full border-[3px] border-amber-500 shadow-2xl flex items-center gap-2.5 transition-all">
                  🔒 Complete Section 1.2 first
                </p>
              </div>
            )}

            <div className={cn("space-y-6 transition-all duration-500", !section2Done && "opacity-20 blur-[1px]")}>
              {/* Header */}
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 border-2 border-rose-200 dark:border-rose-800 shadow-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-xl text-xs sm:text-sm font-black transition-colors">1.3</span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-white transition-colors">How a Fire Grows & Travels</h2>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 font-bold text-sm sm:text-base leading-relaxed transition-colors">
                Fire is fast! See how a tiny spark uses household items to grow and fill a room with smoke.
              </p>

              {/* Centered, Larger Diagram Card at the Top */}
              <div className="bg-slate-50 dark:bg-slate-950 rounded-[1.5rem] overflow-hidden border-[3px] border-rose-200 dark:border-rose-900/30 shadow-sm flex items-center justify-center p-3 sm:p-4 max-w-[760px] mx-auto w-full transition-all">
                <img
                  src="/module_1.3.png"
                  alt="How a Fire Grows and Travels Diagram"
                  className="w-full h-auto object-contain rounded-lg dark:brightness-95"
                />
              </div>

              {/* Side-by-Side Descriptions at the Bottom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
                {/* DON'T FIGHT IT Callout */}
                <div className="bg-red-50 dark:bg-red-950/40 border-l-[6px] border-red-500 rounded-r-2xl p-4 sm:p-5 shadow-sm transition-colors flex flex-col justify-center">
                  <h3 className="text-red-600 dark:text-red-400 font-black mb-1.5 text-sm sm:text-base uppercase tracking-wider">
                    🚨 DON'T FIGHT IT!
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-300">
                    Fire grows too fast for kids to fight! If you see fire or smell smoke, don't try to hide. Get out! and tell a grown-up right away!
                  </p>
                </div>

                {/* Simplified Metaphor */}
                <div className="bg-amber-50/80 dark:bg-amber-950/20 border-l-[6px] border-amber-500 rounded-r-2xl p-4 sm:p-5 shadow-sm transition-colors flex flex-col justify-center">
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                    "Fire is like a hungry little monster. It doesn't stay in one place—it eats wood, paper, and curtains to grow bigger, hotter, and faster every single second!"
                  </p>
                </div>
              </div>

              {/* Centered Completion Button */}
              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleSection3}
                  disabled={section3Done}
                  className={cn(
                    "inline-flex items-center gap-2 text-sm transition-all uppercase tracking-wide",
                    section3Done
                      ? "bg-green-500 text-white px-6 py-3 rounded-full border-[3px] border-green-600 shadow-[0_4px_0_#15803d] cursor-default font-black"
                      : "bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-full shadow-[0_4px_0_#be123c] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none font-normal"
                  )}
                >
                  {section3Done && <CheckCircle className="h-4 w-4" />}
                  {section3Done ? "Completed" : "I understand how fire grows & travels"}
                </button>
              </div>
            </div>
          </section>

          {/* ── Element Mixer Lab (unlocked after section3) ── */}
          <section className={cn(
            "relative bg-purple-50 dark:bg-purple-950/20 rounded-[2rem] border-[4px] border-purple-200 dark:border-purple-900/30 p-5 sm:p-8 md:p-12 shadow-sm transition-all duration-500 overflow-hidden",
            !section3Done && "pointer-events-none select-none"
          )}>
            {mixerEverCompleted && (
              <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-green-500 border-[3px] border-white shadow-sm flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            )}
            {!section3Done && (
              <div className="absolute inset-0 rounded-[2rem] bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-[3px] flex items-center justify-center z-20 transition-all duration-300">
                <p className="text-amber-600 dark:text-amber-400 font-black text-sm sm:text-base md:text-lg bg-white dark:bg-slate-800 px-6 py-3.5 sm:px-8 sm:py-4 rounded-full border-[3px] border-amber-500 shadow-2xl flex items-center gap-2.5 transition-all">
                  🔒 Complete Section 1.3 first
                </p>
              </div>
            )}

            <div className={cn("transition-all duration-500", !section3Done && "opacity-20 blur-[1px]")}>
              <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <FlaskConical className="h-5 w-5 sm:h-7 sm:w-7 text-purple-500 dark:text-purple-400 transition-colors" />
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-purple-900 dark:text-purple-300 transition-colors">The Element Mixer Lab</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed text-sm sm:text-base transition-colors">
                By understanding what fire needs to start, you are already taking a huge step in preventing fires.
                <br />Prove your knowledge by building the Fire Triangle below!
              </p>
              
              <div className="bg-purple-100/50 dark:bg-purple-950/40 p-4 sm:p-6 rounded-2xl border-2 border-purple-200 dark:border-purple-900/40 text-left max-w-xl mx-auto space-y-2 mt-4 text-xs sm:text-sm">
                <p className="font-extrabold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                  <Info className="h-4 w-4 text-purple-500" />
                  🔬 How to Play:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 font-bold">
                  <li><strong>Tap</strong> or <strong>Drag & Drop</strong> the items into the Fire Pit.</li>
                  <li>Mix the <strong>3 correct elements</strong> to complete the Fire Triangle and light the fire!</li>
                  <li>Use <strong>Water</strong> anytime to douse the Heat (Spark) and experiment!</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10 items-center justify-center select-none">

              {/* ── Item Inventory (draggable) ── */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 shrink-0">
                {LAB_ITEMS.map((item) => {
                  const inPit = pitItems.includes(item.id)
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onClick={() => handleItemDrop(item)}
                      className={cn(
                        "p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-center w-[6.5rem] sm:w-32 shadow-lg transition-all select-none cursor-pointer hover:-translate-y-1 active:scale-95",
                        item.bg,
                        inPit && item.correct ? "opacity-50" : ""
                      )}
                    >
                      <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2 pointer-events-none flex items-center justify-center h-8 sm:h-10">
                        {item.image ? (
                          <img src={item.image} alt={item.label} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                        ) : (
                          item.icon
                        )}
                      </div>
                      <p className="font-black text-white text-xs sm:text-sm pointer-events-none">{item.label}</p>
                      <p className="text-[10px] sm:text-xs text-white/60 mt-0.5 pointer-events-none">{item.role}</p>
                    </div>
                  )
                })}
              </div>

              {/* ── Fire Pit (drop zone) ── */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className={cn(
                    "relative w-44 h-44 sm:w-60 sm:h-60 md:w-72 md:h-72 rounded-full border-4 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-300 bg-white dark:bg-slate-900",
                    labCompleted
                      ? "border-[#ff4b3e] shadow-[0_0_50px_rgba(255,75,62,0.4)]"
                      : isDragOver
                      ? "border-orange-400 bg-orange-500/5 scale-105 shadow-[0_0_30px_rgba(251,146,60,0.25)]"
                      : pitWater
                      ? "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                      : pitItems.length > 0
                      ? "border-orange-600"
                      : "border-slate-600 dark:border-slate-700"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {/* Fire glow blob — only when all 3 correct items are present */}
                  {labCompleted && !pitWater && (
                    <div
                      className="absolute bottom-6 sm:bottom-8 w-14 h-14 sm:w-20 sm:h-20 rounded-full opacity-100 scale-125"
                      style={{
                        backgroundColor: "#ef4444",
                        filter: "blur(6px)",
                        animation: "pulse 1s ease-in-out infinite",
                      }}
                    />
                  )}

                  {/* Items badge row — top of circle */}
                  {!pitWater && pitItems.length > 0 && (
                    <div className="absolute top-6 sm:top-10 flex items-center gap-1.5 sm:gap-2 z-20">
                      {pitItems.map((id) => {
                        const item = LAB_ITEMS.find(i => i.id === id)
                        if (!item) return null
                        const badgeColor = id === "wood" ? "bg-amber-800/80 border-amber-600"
                          : id === "spark" ? "bg-red-800/80 border-red-600"
                          : id === "fan"   ? "bg-blue-800/80 border-blue-600"
                          : "bg-cyan-800/80 border-cyan-600"
                        return (
                          <div key={id} className={cn("h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 flex items-center justify-center text-base sm:text-xl shadow-md", badgeColor)}
                            style={{ animation: "popIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275)" }}
                          >
                            {item.image ? (
                              <img src={item.image} alt={item.label} className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                            ) : (
                              item.icon
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Fire image — bottom of circle with animated fire effect */}
                  {labCompleted && !pitWater && (
                    <div className="z-20 relative flex items-center justify-center" style={{ marginTop: 14 }}>
                      {/* Animated fire glow layers */}
                      <div className="absolute w-16 h-16 sm:w-24 sm:h-24 rounded-full animate-pulse" style={{ background: 'radial-gradient(circle, rgba(255,120,0,0.4) 0%, rgba(255,60,0,0.15) 50%, transparent 70%)' }} />
                      <div className="absolute w-12 h-12 sm:w-20 sm:h-20 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,200,0,0.3) 0%, transparent 60%)', animation: 'fireFlicker 0.8s ease-in-out infinite alternate' }} />
                      {/* Fire sparks */}
                      <div className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-yellow-400 rounded-full" style={{ animation: 'fireSpark 1.2s ease-out infinite', opacity: 0.8 }} />
                      <div className="absolute -top-1 sm:-top-2 left-1/3 w-1 h-1 bg-orange-400 rounded-full" style={{ animation: 'fireSpark 1.5s ease-out infinite 0.3s', opacity: 0.6 }} />
                      <div className="absolute -top-1 sm:-top-2 right-1/3 w-1 h-1 bg-red-400 rounded-full" style={{ animation: 'fireSpark 1.8s ease-out infinite 0.6s', opacity: 0.7 }} />
                      {/* Fire image */}
                      <img src="/fire_hall.png" alt="Fire" className="w-10 h-10 sm:w-16 sm:h-16 object-contain relative z-10 drop-shadow-[0_0_12px_rgba(255,100,0,0.8)]" style={{ animation: 'fireWobble 0.6s ease-in-out infinite alternate' }} />
                    </div>
                  )}

                  {/* Water splash */}
                  {pitWater && (
                    <div className="z-10 relative flex items-center justify-center animate-bounce">
                      {/* Water ripple glow */}
                      <div className="absolute w-16 h-16 sm:w-24 sm:h-24 rounded-full animate-ping opacity-20" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.6) 0%, transparent 70%)' }} />
                      <img src="/water_drop.png" alt="Water splash" className="w-10 h-10 sm:w-16 sm:h-16 object-contain relative z-10 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
                    </div>
                  )}

                  {/* Placeholder */}
                  {pitItems.length === 0 && !pitWater && !labCompleted && (
                    <p className="text-slate-500 dark:text-slate-400 font-black text-xs sm:text-sm uppercase tracking-widest text-center z-10 px-8 transition-colors">
                      TAP OR DROP HERE
                    </p>
                  )}
                </div>

                {/* Status message — BELOW pit */}
                <p className={cn(
                  "text-xs sm:text-sm font-bold text-center transition-colors min-h-[20px]",
                  labCompleted ? "text-orange-500" : "text-slate-500 dark:text-slate-400"
                )}>
                  {labCompleted ? "⚠️ FIRE STARTED! The Triangle is complete!" : pitMessage}
                </p>

                {/* Clear Pit Button — always below */}
                <button
                  type="button"
                  onClick={resetPit}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-extrabold text-xs sm:text-sm rounded-full border-[3px] border-slate-300 dark:border-slate-700 shadow-[0_3px_0_#cbd5e1] dark:shadow-[0_3px_0_#0f172a] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Clear Pit &amp; Restart</span>
                </button>
              </div>
            </div>
            {/* Fire animation keyframes */}
            <style>{`
              @keyframes fireWobble {
                0% { transform: rotate(-3deg) scale(1); }
                50% { transform: rotate(2deg) scale(1.08); }
                100% { transform: rotate(-2deg) scale(1.04); }
              }
              @keyframes fireFlicker {
                0% { opacity: 0.3; transform: scale(0.9); }
                50% { opacity: 0.6; transform: scale(1.15); }
                100% { opacity: 0.4; transform: scale(1); }
              }
              @keyframes fireSpark {
                0% { transform: translateY(0) scale(1); opacity: 0.8; }
                50% { transform: translateY(-12px) scale(0.6); opacity: 0.4; }
                100% { transform: translateY(-20px) scale(0.2); opacity: 0; }
              }
              @keyframes popIn {
                0% { transform: scale(0); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
              }
            `}</style>
            </div>
          </section>
          </div>

          <AdaptiveQuiz 
            moduleNumber={1}
            isLocked={!section3Done || !mixerEverCompleted}
            lockMessage="Complete Section 1.4 first"
            initialQuizPassed={quizPassed}
            initialQuizScore={quizScore ?? undefined}
            initialQuizAnswers={quizAnswers}
            initialQuizQuestions={initialProgress?.sectionData?.module1?.quizQuestions}
            onComplete={(score) => {
              setQuizPassed(true);
              setQuizScore(score);
              setModuleCompleted(true);
              setShowBadgeModal(true);
            }}
            nextModuleUrl="/kids/safescape/2"
            nextModuleText="Go to Module 2"
          />

          {/* ── Footer ── */}
          <div className="text-center py-8 border-t-2 border-slate-200 dark:border-slate-800 transition-colors">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest transition-colors">SafeScape Intelligent Systems Project</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 opacity-50 transition-colors">Module 1: Fire is a Tool, Not a Toy</p>
          </div>

        </div>
      </div>

      {/* ── Badge Earned Modal ── */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] max-w-sm w-full p-8 flex flex-col items-center text-center shadow-2xl border-[4px] border-amber-200 dark:border-amber-900/50 animate-in zoom-in-95 duration-500">
            <div className="h-24 w-24 bg-amber-50 dark:bg-amber-900/20 rounded-full border-[4px] border-amber-100 dark:border-amber-800 flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.amber.300/20)_0%,transparent_70%)] animate-pulse"></div>
              <img src="/fire_hall.png" alt="Fire Scout Badge" className="h-16 w-16 object-contain relative z-10 drop-shadow-md" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Badge Unlocked!</h2>
            <p className="text-amber-600 dark:text-amber-400 font-bold uppercase tracking-widest text-sm mb-4">Fire Scout</p>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-8 leading-relaxed">
              Congratulations! You've mastered the Fire Triangle and earned your first official SafeScape badge.
            </p>
            <button
              onClick={() => router.visit('/kids/safescape/2')}
              className="w-full bg-amber-500 hover:bg-amber-400 text-white font-black px-6 py-4 rounded-[1.25rem] border-b-[5px] border-amber-700 active:border-b-[1px] active:mt-[4px] transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-2"
            >
              Continue to Module 2
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </button>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={cn(
          "fixed top-20 left-1/2 -translate-x-1/2 right-auto bottom-auto md:top-28 md:right-8 md:left-auto md:translate-x-0 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-slate-800 dark:text-white font-extrabold text-xs sm:text-sm transition-all animate-in fade-in slide-in-from-top-4 duration-300 bg-white dark:bg-slate-900 border-[3px] shadow-slate-200 dark:shadow-slate-950",
          toast.type === "success" ? "border-emerald-500" : "border-blue-500"
        )}>
          {toast.type === "success" ? (
            <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
          ) : (
            <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 shrink-0" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

    </div>
  )
}

ModuleOnePage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default ModuleOnePage
