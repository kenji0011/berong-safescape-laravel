"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { Link, router } from '@inertiajs/react'
import { ArrowLeft, CheckCircle, Shield, BookOpen, Trophy, Flame, FlaskConical, RotateCcw } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import DashboardLayout from "@/Layouts/DashboardLayout"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type LabItem = { id: string; label: string; role: string; bg: string; icon: string; correct: boolean }

const LAB_ITEMS: LabItem[] = [
  { id: "wood",  label: "Wood",  role: "Fuel",    bg: "bg-amber-800 border-amber-600 hover:bg-amber-700", icon: "🌲", correct: true  },
  { id: "spark", label: "Spark", role: "Heat",    bg: "bg-red-800   border-red-600   hover:bg-red-700",   icon: "✨", correct: true  },
  { id: "fan",   label: "Fan",   role: "Oxygen",  bg: "bg-blue-800  border-blue-600  hover:bg-blue-700",  icon: "💨", correct: true  },
  { id: "water", label: "Water", role: "Remover", bg: "bg-cyan-800  border-cyan-600  hover:bg-cyan-700",  icon: "🪣", correct: false },
]

const CORRECT_IDS = ["wood", "spark", "fan"]

// ─────────────────────────────────────────────
// ModuleOne Page
// ─────────────────────────────────────────────
const ModuleOnePage = () => {
  const { user } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)

  // ── Progress state ──
  const [videoStarted,    setVideoStarted]    = useState(false)
  const [section1Done,    setSection1Done]    = useState(false)
  const [section2Done,    setSection2Done]    = useState(false)
  const [pitItems,        setPitItems]        = useState<string[]>([])
  const [labCompleted,    setLabCompleted]    = useState(false)
  const [mixerEverCompleted, setMixerEverCompleted] = useState(false)
  const [moduleCompleted, setModuleCompleted] = useState(false)
  const [saving,          setSaving]          = useState(false)
  const [pitMessage,      setPitMessage]      = useState("The pit is empty.")
  const [pitWater,        setPitWater]        = useState(false)
  const [isDragOver,      setIsDragOver]      = useState(false)
  const [toast,           setToast]           = useState<{ msg: string; type: "success" | "info" } | null>(null)
  const [moduleLoading,   setModuleLoading]   = useState(true)

  // Simulated loading to match the skeleton experience of other modules
  useEffect(() => {
    const timer = setTimeout(() => {
      setModuleLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Load progress from backend on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/kids/safescape", { credentials: "include" })
        if (!res.ok) return
        const data = await res.json()
        const m1 = data.sectionData?.module1 ?? {}
        if (m1.videoWatched)           setVideoStarted(true)
        if (m1.section1Read)           setSection1Done(true)
        if (m1.section2Read)           setSection2Done(true)
        if (m1.elementMixerCompleted)  { setLabCompleted(true); setMixerEverCompleted(true); setPitItems(CORRECT_IDS) }
        if (data.completedModules?.includes(1)) setModuleCompleted(true)
      } catch (_) {}
    }
    load()
  }, [])

  // ── Progress bar ──
  const progress = useMemo(() => {
    let p = 0
    if (videoStarted)   p += 25
    if (section1Done)   p += 25
    if (section2Done)   p += 25
    if (labCompleted)   p += 25
    return p
  }, [videoStarted, section1Done, section2Done, labCompleted])

  // ── Helper: save to backend ──
  const saveSection = async (sectionData: Record<string, boolean>, completed: boolean) => {
    try {
      await fetch("/api/kids/safescape", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-XSRF-TOKEN": getCookie("XSRF-TOKEN") },
        body: JSON.stringify({ moduleNum: 1, sectionData, completed }),
      })
    } catch (_) {}
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
      saveSection({ videoWatched: true, section1Read: section1Done, section2Read: section2Done, elementMixerCompleted: labCompleted }, false)
      showToast("Video started! Keep watching. 🎬", "info")
    }
  }

  const handleSection1 = () => {
    if (section1Done) return
    setSection1Done(true)
    saveSection({ videoWatched: videoStarted, section1Read: true, section2Read: section2Done, elementMixerCompleted: labCompleted }, false)
    showToast("Great! Fire Triangle mastered! 🔥")
  }

  const handleSection2 = () => {
    if (section2Done) return
    setSection2Done(true)
    saveSection({ videoWatched: videoStarted, section1Read: section1Done, section2Read: true, elementMixerCompleted: labCompleted }, false)
    showToast("You know the rules! Stay safe! ✅")
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
    // Water can ALWAYS be used — even after the fire is lit
    if (item.id === "water") {
      if (pitItems.includes("spark")) {
        // Remove heat specifically, like the old version
        const next = pitItems.filter(id => id !== "spark")
        setPitItems(next)
        setLabCompleted(false)
        setPitWater(true)
        setPitMessage("💦 Sizzle! Water removed the Heat.")
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
      const sectionData = { videoWatched: videoStarted, section1Read: section1Done, section2Read: section2Done, elementMixerCompleted: true }
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
      await fetch("/api/kids/safescape", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-XSRF-TOKEN": getCookie("XSRF-TOKEN") },
        body: JSON.stringify({ moduleNum: 1, sectionData: { videoWatched: true, section1Read: true, section2Read: true, elementMixerCompleted: true }, completed: true }),
      })
      setModuleCompleted(true)
      router.visit('/kids/safescape/2')
    } catch (_) {
      showToast("Error saving progress. Try again.", "info")
    } finally {
      setSaving(false)
    }
  }

  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-blue-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] font-sans flex flex-col">

      {/* ── Sub Header ── */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8 shadow-sm z-20 relative">
        <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/kids/safescape" className="inline-flex items-center justify-center gap-2 p-2 sm:px-4 sm:py-2 bg-white rounded-full text-slate-700 font-bold hover:text-slate-900 border-[3px] border-slate-200 shadow-[0_3px_0_#cbd5e1] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_0px_0_#cbd5e1] transition-all text-sm whitespace-nowrap">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              <Flame className="h-5 w-5 text-[#ff4b3e]" />
              <h1 className="text-xl font-black text-slate-800">SafeScape Fire Safety Course</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-6">
            {/* Module dots */}
            <div className="flex items-center gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <React.Fragment key={n}>
                  <Link
                    href={`/kids/safescape/${n}`}
                    className={cn(
                      "h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-black transition-all shrink-0 border-[3px] focus:outline-none",
                      n === 1
                        ? "bg-[#ff4b3e] text-white border-white shadow-[0_4px_0_#991b1b] -translate-y-0.5 pointer-events-none"
                        : "bg-white text-slate-400 border-slate-200 shadow-[0_3px_0_#cbd5e1] hover:-translate-y-0.5 hover:shadow-[0_4px_0_#cbd5e1] hover:text-slate-600 active:translate-y-1 active:shadow-[0_0px_0_#cbd5e1]"
                    )}
                  >{n}</Link>
                  {n < 5 && <div className="h-0.5 w-2 sm:w-6 bg-slate-200 rounded shrink-0" />}
                </React.Fragment>
              ))}
            </div>
            {/* Progress */}
            <div className="text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 whitespace-nowrap hidden lg:block">
              Progress: <span className="text-[#ff4b3e] font-black ml-1">{progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Module Content Area ── */}
      <div className="flex-1 relative">
        
        {/* Skeleton Loader (Simulated for visual consistency with other modules) */}
        {moduleLoading && (
          <div className="absolute inset-0 z-10 bg-blue-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] flex flex-col items-center justify-start pt-32 px-4 pointer-events-none">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-sm border-[3px] border-blue-200 flex items-center justify-center mb-6 animate-bounce">
              <Flame className="h-8 w-8 sm:h-10 sm:w-10 text-[#ff4b3e] animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-3 w-full max-w-2xl px-2 sm:px-6">
              <div className="h-6 sm:h-10 w-48 sm:w-64 bg-blue-200/50 rounded-full animate-pulse"></div>
              <div className="h-4 sm:h-5 w-64 sm:w-96 bg-blue-200/50 rounded-full animate-pulse delay-75 mb-6"></div>
              
              <div className="w-full space-y-4">
                <div className="h-48 sm:h-64 w-full bg-white/60 rounded-[2rem] border-[3px] border-blue-200/50 animate-pulse delay-150"></div>
                <div className="h-32 sm:h-48 w-full bg-white/60 rounded-[2rem] border-[3px] border-blue-200/50 animate-pulse delay-200"></div>
              </div>
            </div>
            <p className="mt-8 text-blue-400 font-bold tracking-widest uppercase text-sm animate-pulse delay-300">Loading Module Content...</p>
          </div>
        )}

        <div className={cn(
          "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 space-y-10 sm:space-y-14 md:space-y-20 transition-opacity duration-700",
          moduleLoading ? "opacity-0" : "opacity-100"
        )}>



          {/* ── Intro ── */}
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff4b3e] to-[#ff8c00] leading-tight drop-shadow-sm">
              Fire is a Tool, Not a Toy
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-bold leading-relaxed max-w-2xl mx-auto">
              To be a fire safety hero, the first thing you need to do is understand what fire is and respect its power.
              Just like some tools are only for grown-ups to use, fire is also something that needs to be handled with great care.
              This module will help you understand why fire is a tool for adults and not a toy for kids.
            </p>
          </div>

          {/* ── Video Section ── */}
          <section className={cn("relative bg-white rounded-[1.5rem] sm:rounded-[2rem] border-[3px] sm:border-[4px] border-blue-200 shadow-sm p-4 sm:p-6 md:p-10 text-center transition-all", videoStarted && "border-green-200")}>
            {videoStarted && (
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-500 border-[3px] border-white shadow-sm flex items-center justify-center">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            )}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-blue-600 mb-4 sm:mb-6 drop-shadow-sm">Watch the Intro Video</h2>
            <div className="w-full aspect-video bg-slate-100 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border-[3px] sm:border-[4px] border-blue-200 relative">
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
            <p className="text-center text-slate-500 font-bold text-xs sm:text-sm mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-slate-100 uppercase tracking-widest">Watch the video to continue</p>
          </section>

          {/* ── Section 1.1 — What Makes a Fire? (unlocked after video) ── */}
          <section className={cn(
            "relative bg-orange-50/50 rounded-[2rem] border-[4px] border-orange-200 p-5 sm:p-8 md:p-12 shadow-sm transition-all duration-500",
            !videoStarted && "opacity-30 pointer-events-none select-none",
            section1Done && "border-green-200"
          )}>
            {section1Done && (
              <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-green-500 border-[3px] border-white shadow-sm flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            )}
            {!videoStarted && (
              <div className="absolute inset-0 rounded-[2rem] bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                <p className="text-slate-500 font-bold text-lg bg-white px-6 py-3 rounded-full border-2 border-slate-200 shadow-sm">
                  🎬 Watch the video first to unlock
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
              {/* Text content */}
              <div className="space-y-4 sm:space-y-6 order-2 md:order-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <span className="bg-orange-100 text-orange-600 border-2 border-orange-200 shadow-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-xl text-xs sm:text-sm font-black">1.1</span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800">What Makes a Fire?</h2>
                </div>
                <div className="text-slate-600 leading-relaxed text-sm sm:text-base space-y-3 sm:space-y-4 font-medium">
                  <p>
                    Have you ever seen a stool with three legs? If you take one leg away, the stool falls over.{" "}
                    <strong className="text-slate-800">Fire is just like that!</strong> It needs three things to exist, and we call this the "fire triangle."
                    If you take any one of them away, the fire goes out.
                  </p>
                  <ul className="space-y-3 sm:space-y-4 bg-white p-4 sm:p-6 rounded-2xl border-[3px] border-orange-100 shadow-sm">
                    <li className="flex gap-3 sm:gap-4 items-start">
                      <span className="text-red-400 text-lg sm:text-xl mt-0.5">🔥</span>
                      <div>
                        <strong className="text-slate-800 block text-sm sm:text-base">Heat</strong>
                        <span className="text-xs sm:text-sm text-slate-500">This is something hot, like a spark or a flame, that gets the fire started.</span>
                      </div>
                    </li>
                    <li className="flex gap-3 sm:gap-4 items-start">
                      <span className="text-amber-400 text-lg sm:text-xl mt-0.5">🌲</span>
                      <div>
                        <strong className="text-slate-800 block text-sm sm:text-base">Fuel</strong>
                        <span className="text-xs sm:text-sm text-slate-500">This is anything that can burn, like paper, wood, or cloth.</span>
                      </div>
                    </li>
                    <li className="flex gap-3 sm:gap-4 items-start">
                      <span className="text-blue-400 text-lg sm:text-xl mt-0.5">💨</span>
                      <div>
                        <strong className="text-slate-800 block text-sm sm:text-base">Air (Oxygen)</strong>
                        <span className="text-xs sm:text-sm text-slate-500">Fire needs to breathe, just like we do! It uses a part of the air called oxygen to stay alive.</span>
                      </div>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={handleSection1}
                  disabled={section1Done}
                  className={cn(
                    "inline-flex items-center gap-2 font-black text-sm transition-all uppercase tracking-wide",
                    section1Done
                      ? "bg-green-500 text-white px-6 py-3 rounded-full border-[3px] border-green-600 shadow-[0_4px_0_#15803d] cursor-default"
                      : "bg-orange-400 hover:bg-orange-500 text-white px-6 py-3 rounded-full border-[3px] border-white shadow-[0_4px_0_#c2410c] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
                  )}
                >
                  <CheckCircle className="h-4 w-4" />
                  {section1Done ? "Completed ✓" : "I understand the Fire Triangle"}
                </button>
              </div>

              {/* Fire Triangle Image */}
              <div className="order-1 md:order-2">
                <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-[3px] sm:border-[4px] border-orange-200 shadow-sm transform hover:rotate-0 rotate-1 transition-transform duration-500 flex items-center justify-center p-3 sm:p-4">
                  <img
                    src="/modules/assets/images/m1.png"
                    alt="The Fire Triangle — Heat, Fuel, Oxygen"
                    className="w-full h-auto max-h-48 sm:max-h-60 md:max-h-72 object-contain"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 1.2 — Grown-Up Tools (unlocked after section1) ── */}
          <section className={cn(
            "relative bg-white rounded-[2rem] border-[4px] border-red-200 p-5 sm:p-8 md:p-12 overflow-hidden shadow-sm transition-all duration-500",
            !section1Done && "opacity-30 pointer-events-none select-none",
            section2Done && "border-green-200"
          )}>
            {section2Done && (
              <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-green-500 border-[3px] border-white shadow-sm flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            )}
            {!section1Done && (
              <div className="absolute inset-0 rounded-[2rem] bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                <p className="text-slate-500 font-bold text-lg bg-white px-6 py-3 rounded-full border-2 border-slate-200 shadow-sm">
                  ✅ Complete Section 1.1 first
                </p>
              </div>
            )}

            <div className="relative z-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-8">
                <span className="bg-red-100 text-red-600 border-2 border-red-200 shadow-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-xl text-xs sm:text-sm font-black">1.2</span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800">Grown-Up Tools</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
                <div className="md:col-span-2 text-slate-600 space-y-3 sm:space-y-5 leading-relaxed text-sm sm:text-base font-medium">
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
                      "inline-flex items-center gap-2 font-black text-sm transition-all uppercase tracking-wide mt-2",
                      section2Done
                        ? "bg-green-500 text-white px-6 py-3 rounded-full border-[3px] border-green-600 shadow-[0_4px_0_#15803d] cursor-default"
                        : "bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full border-[3px] border-white shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
                    )}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {section2Done ? "Completed ✓" : "I understand the rules"}
                  </button>
                </div>

                {/* Golden Rule Card */}
                <div className="bg-red-50 border-[3px] border-red-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:scale-105 transition-transform duration-300">
                  <div className="bg-red-500 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-md border-[3px] border-white">
                    <span className="text-white text-lg sm:text-xl">✋</span>
                  </div>
                  <h3 className="text-red-600 font-black mb-2 sm:mb-3 uppercase tracking-wider text-[10px] sm:text-xs">Powerful Rule</h3>
                  <p className="text-slate-700 font-medium italic text-xs sm:text-sm leading-relaxed">
                    "If you find matches or a lighter,{" "}
                    <span className="text-red-500 font-black">do not touch them</span>.
                    Go and tell a grown-up right away."
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Element Mixer Lab (unlocked after section2) ── */}
          <section className={cn(
            "relative bg-purple-50 rounded-[2rem] border-[4px] border-purple-200 p-5 sm:p-8 md:p-12 shadow-sm transition-all duration-500",
            !section2Done && "opacity-30 pointer-events-none select-none",
            labCompleted && "border-green-200"
          )}>
            {labCompleted && (
              <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-green-500 border-[3px] border-white shadow-sm flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            )}
            {!section2Done && (
              <div className="absolute inset-0 rounded-[2rem] bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                <p className="text-slate-500 font-bold text-lg bg-white px-6 py-3 rounded-full border-2 border-slate-200 shadow-sm">
                  ✅ Complete Section 1.2 first
                </p>
              </div>
            )}

            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <FlaskConical className="h-5 w-5 sm:h-7 sm:w-7 text-purple-500" />
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-purple-900">The Element Mixer Lab</h2>
              </div>
              <p className="text-slate-600 font-bold leading-relaxed text-sm sm:text-base">
                By understanding what fire needs to start, you are already taking a huge step in preventing fires.
                <br />Prove your knowledge by building the Fire Triangle below!
              </p>
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
                      <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2 pointer-events-none">{item.icon}</div>
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
                    "relative w-44 h-44 sm:w-60 sm:h-60 md:w-72 md:h-72 rounded-full border-4 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-300 bg-white",
                    labCompleted
                      ? "border-[#ff4b3e] shadow-[0_0_50px_rgba(255,75,62,0.4)]"
                      : isDragOver
                      ? "border-orange-400 bg-orange-500/5 scale-105 shadow-[0_0_30px_rgba(251,146,60,0.25)]"
                      : pitWater
                      ? "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                      : pitItems.length > 0
                      ? "border-orange-600"
                      : "border-slate-600"
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
                        background: "radial-gradient(circle, #fbbf24 0%, #f97316 50%, #ef4444 100%)",
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
                            {item.icon}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Fire emoji — bottom of circle */}
                  {labCompleted && (
                    <div className="z-20 text-2xl sm:text-4xl" style={{ marginTop: 14 }}>🔥</div>
                  )}

                  {/* Water splash */}
                  {pitWater && <div className="text-3xl sm:text-5xl animate-bounce z-10">💦</div>}

                  {/* Placeholder */}
                  {pitItems.length === 0 && !pitWater && !labCompleted && (
                    <p className="text-slate-500 font-black text-xs sm:text-sm uppercase tracking-widest text-center z-10 px-8">
                      TAP OR DROP HERE
                    </p>
                  )}
                </div>

                {/* Status message — BELOW pit */}
                <p className={cn(
                  "text-xs sm:text-sm font-bold text-center transition-colors min-h-[20px]",
                  labCompleted ? "text-orange-500" : "text-slate-500"
                )}>
                  {labCompleted ? "⚠️ FIRE STARTED! The Triangle is complete!" : pitMessage}
                </p>

                {/* Clear Pit link — always below */}
                <button
                  type="button"
                  onClick={resetPit}
                  className="text-xs text-slate-400 hover:text-slate-700 underline transition-colors"
                >
                  Clear Pit &amp; Restart
                </button>
              </div>
            </div>
          </section>

          {/* ── Module 1 Complete Card ── */}
          {mixerEverCompleted && (
            <div className="rounded-[2rem] bg-white border-[4px] border-green-200 p-8 sm:p-12 text-center shadow-sm">
              <div className="h-16 w-16 rounded-full bg-green-500 border-[3px] border-white flex items-center justify-center mx-auto mb-6 shadow-md">
                <CheckCircle className="h-9 w-9 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-3">Module 1 Complete!</h2>
              <p className="text-slate-600 font-bold mb-8 max-w-md mx-auto leading-relaxed">
                Great job! You've learned about the Fire Triangle and why fire tools are for grown-ups only.
              </p>
              {!moduleCompleted ? (
                <button
                  onClick={completeModule}
                  disabled={saving}
                  className="inline-flex items-center gap-2 sm:gap-3 bg-yellow-400 text-red-600 font-black text-sm sm:text-lg px-6 py-3 sm:px-10 sm:py-4 rounded-full border-[3px] border-white shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-[0_0px_0_#b45309] transition-all uppercase tracking-wide disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Continue to Module 2 →"}
                </button>
              ) : (
                <Link
                  href="/kids/safescape/2"
                  className="inline-flex items-center gap-2 sm:gap-3 bg-yellow-400 text-red-600 font-black text-sm sm:text-lg px-6 py-3 sm:px-10 sm:py-4 rounded-full border-[3px] border-white shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-[0_0px_0_#b45309] transition-all uppercase tracking-wide"
                >
                  Continue to Module 2 →
                </Link>
              )}
            </div>
          )}

          {/* ── Footer ── */}
          <div className="text-center py-8 border-t-2 border-slate-200">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">SafeScape Intelligent Systems Project</p>
            <p className="text-slate-400 text-xs mt-1 opacity-50">Module 1: Fire is a Tool, Not a Toy</p>
          </div>

        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-white font-bold text-sm transition-all animate-in slide-in-from-bottom-4",
          toast.type === "success" ? "bg-green-600" : "bg-blue-600"
        )}>
          {toast.type === "success" ? "✅" : "ℹ️"} {toast.msg}
        </div>
      )}

    </div>
  )
}

ModuleOnePage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default ModuleOnePage
