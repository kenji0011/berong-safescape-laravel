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
    } catch (_) {
      showToast("Error saving progress. Try again.", "info")
    } finally {
      setSaving(false)
    }
  }

  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">

      {/* ── Sub Header ── */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8 shadow-sm z-20 relative">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Link href="/kids/safescape" className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-slate-700 font-bold hover:text-slate-900 border-2 border-slate-200 shadow-sm transition-all text-sm whitespace-nowrap">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              <Flame className="h-5 w-5 text-[#ff4b3e]" />
              <h1 className="text-xl font-black text-slate-800">SafeScape Fire Safety Course</h1>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Module dots */}
            <div className="flex items-center gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <React.Fragment key={n}>
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-black transition-all shrink-0",
                    n === 1
                      ? "bg-[#ff4b3e] text-white shadow-md shadow-red-500/30 ring-2 ring-red-200"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  )}>{n}</div>
                  {n < 5 && <div className="h-0.5 w-3 sm:w-6 bg-slate-200 rounded shrink-0" />}
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

      {/* ── Dark Module Content Area ── */}
      <div className="flex-1 bg-[#0f1729]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-16">



          {/* ── Intro ── */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff4b3e] to-[#ff8c00] mb-6 leading-tight">
              Fire is a Tool, Not a Toy
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              To be a fire safety hero, the first thing you need to do is understand what fire is and respect its power.
              Just like some tools are only for grown-ups to use, fire is also something that needs to be handled with great care.
              This module will help you understand why fire is a tool for adults and not a toy for kids.
            </p>
          </div>

          {/* ── Video Section ── */}
          <div className={cn("relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl transition-all", videoStarted && "ring-2 ring-green-500/30")}>
            {/* Green checkmark badge when done */}
            {videoStarted && (
              <div className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            )}
            <div className="aspect-video w-full">
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
            <p className="text-center text-slate-500 text-sm py-3 border-t border-slate-800">
              Watch the video to continue
            </p>
          </div>

          {/* ── Section 1.1 — What Makes a Fire? (unlocked after video) ── */}
          <div className={cn(
            "relative rounded-2xl border border-slate-700 bg-slate-800/60 p-6 sm:p-10 transition-all duration-500",
            !videoStarted && "opacity-30 pointer-events-none select-none",
            section1Done && "ring-2 ring-green-500/30"
          )}>
            {section1Done && (
              <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            )}
            {!videoStarted && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <p className="text-slate-400 font-bold text-lg bg-slate-900/80 px-6 py-3 rounded-xl">
                  🎬 Watch the video first to unlock
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              {/* Text content */}
              <div className="space-y-6 order-2 md:order-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-slate-700 text-[#ff8c00] px-3 py-1 rounded text-sm font-mono font-bold">1.1</span>
                  <h2 className="text-3xl font-black text-white">What Makes a Fire?</h2>
                </div>
                <div className="text-slate-300 leading-relaxed text-base space-y-4">
                  <p>
                    Have you ever seen a stool with three legs? If you take one leg away, the stool falls over.{" "}
                    <strong className="text-white">Fire is just like that!</strong> It needs three things to exist, and we call this the "fire triangle."
                    If you take any one of them away, the fire goes out.
                  </p>
                  <ul className="space-y-4 bg-slate-900/60 p-6 rounded-xl border border-slate-700">
                    <li className="flex gap-4 items-start">
                      <span className="text-red-400 text-xl mt-0.5">🔥</span>
                      <div>
                        <strong className="text-white block">Heat</strong>
                        <span className="text-sm text-slate-400">This is something hot, like a spark or a flame, that gets the fire started.</span>
                      </div>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="text-amber-400 text-xl mt-0.5">🌲</span>
                      <div>
                        <strong className="text-white block">Fuel</strong>
                        <span className="text-sm text-slate-400">This is anything that can burn, like paper, wood, or cloth.</span>
                      </div>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="text-blue-400 text-xl mt-0.5">💨</span>
                      <div>
                        <strong className="text-white block">Air (Oxygen)</strong>
                        <span className="text-sm text-slate-400">Fire needs to breathe, just like we do! It uses a part of the air called oxygen to stay alive.</span>
                      </div>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={handleSection1}
                  disabled={section1Done}
                  className={cn(
                    "inline-flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm transition-all shadow-sm",
                    section1Done
                      ? "bg-green-700 text-green-100 cursor-default"
                      : "bg-slate-700 text-white border border-slate-500 hover:bg-slate-600 hover:border-slate-400 active:scale-95"
                  )}
                >
                  <CheckCircle className="h-4 w-4" />
                  {section1Done ? "Completed ✓" : "I understand the Fire Triangle"}
                </button>
              </div>

              {/* Fire Triangle Image */}
              <div className="order-1 md:order-2">
                <div className="bg-white rounded-2xl overflow-hidden border-4 border-slate-700 shadow-xl transform hover:rotate-0 rotate-1 transition-transform duration-500 flex items-center justify-center p-4">
                  <img
                    src="/modules/assets/images/m1.png"
                    alt="The Fire Triangle — Heat, Fuel, Oxygen"
                    className="w-full h-auto max-h-72 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 1.2 — Grown-Up Tools (unlocked after section1) ── */}
          <div className={cn(
            "relative rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6 sm:p-10 overflow-hidden shadow-2xl transition-all duration-500",
            !section1Done && "opacity-30 pointer-events-none select-none",
            section2Done && "ring-2 ring-green-500/30"
          )}>
            {section2Done && (
              <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            )}
            {!section1Done && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <p className="text-slate-400 font-bold text-lg bg-slate-900/80 px-6 py-3 rounded-xl">
                  ✅ Complete Section 1.1 first
                </p>
              </div>
            )}

            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 text-9xl opacity-5 pointer-events-none select-none">⚠️</div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <span className="bg-orange-900/60 text-[#ff8c00] px-3 py-1 rounded text-sm font-mono font-bold border border-orange-500/30">1.2</span>
                <h2 className="text-3xl font-black text-white">Grown-Up Tools</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 text-slate-300 space-y-5 leading-relaxed text-base">
                  <p>
                    You know that grown-ups use special tools for their jobs, like power saws or even cars.
                    These tools are very helpful, but they can be very dangerous if they aren't used correctly,
                    which is why only trained adults are allowed to use them.
                  </p>
                  <p>
                    Matches and lighters are the same. They are tools that grown-ups use to light candles or start a barbecue.
                    They are <span className="text-red-400 font-bold underline decoration-red-500/50">not toys</span>.
                    Because they create heat, they can easily start a dangerous fire if they fall into the wrong hands.
                  </p>
                  <button
                    onClick={handleSection2}
                    disabled={section2Done}
                    className={cn(
                      "inline-flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm transition-all shadow-sm mt-2",
                      section2Done
                        ? "bg-green-700 text-green-100 cursor-default"
                        : "bg-slate-700 text-white border border-slate-500 hover:bg-slate-600 hover:border-slate-400 active:scale-95"
                    )}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {section2Done ? "Completed ✓" : "I understand the rules"}
                  </button>
                </div>

                {/* Golden Rule Card */}
                <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg hover:scale-105 transition-transform duration-300">
                  <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-md">
                    <span className="text-white text-xl">✋</span>
                  </div>
                  <h3 className="text-red-300 font-black mb-3 uppercase tracking-wider text-xs">Powerful Rule</h3>
                  <p className="text-white font-medium italic text-sm leading-relaxed">
                    "If you find matches or a lighter,{" "}
                    <span className="text-red-400 font-bold">do not touch them</span>.
                    Go and tell a grown-up right away."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Element Mixer Lab (unlocked after section2) ── */}
          <div className={cn(
            "relative rounded-2xl border border-slate-700 bg-slate-800 p-6 sm:p-10 shadow-2xl transition-all duration-500",
            !section2Done && "opacity-30 pointer-events-none select-none",
            labCompleted && "ring-2 ring-green-500/30"
          )}>
            {labCompleted && (
              <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            )}
            {!section2Done && (
              <div className="absolute inset-0 flex items-center justify-center z-10 rounded-2xl">
                <p className="text-slate-400 font-bold text-lg bg-slate-900/80 px-6 py-3 rounded-xl">
                  ✅ Complete Section 1.2 first
                </p>
              </div>
            )}

            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FlaskConical className="h-7 w-7 text-purple-400" />
                <h2 className="text-3xl font-black text-white">The Element Mixer Lab</h2>
              </div>
              <p className="text-slate-400 leading-relaxed">
                By understanding what fire needs to start, you are already taking a huge step in preventing fires.
                <br />Prove your knowledge by building the Fire Triangle below!
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-10 items-center justify-center select-none">

              {/* ── Item Inventory (draggable) ── */}
              <div className="grid grid-cols-2 gap-4 shrink-0">
                {LAB_ITEMS.map((item) => {
                  const inPit = pitItems.includes(item.id)
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      className={cn(
                        "p-4 rounded-2xl border-2 text-center w-32 shadow-lg transition-all select-none cursor-grab active:cursor-grabbing hover:-translate-y-1 active:scale-95",
                        item.bg,
                        inPit && item.correct ? "opacity-50" : ""
                      )}
                    >
                      <div className="text-3xl mb-2 pointer-events-none">{item.icon}</div>
                      <p className="font-black text-white text-sm pointer-events-none">{item.label}</p>
                      <p className="text-xs text-white/60 mt-0.5 pointer-events-none">{item.role}</p>
                    </div>
                  )
                })}
              </div>

              {/* ── Fire Pit (drop zone) ── */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className={cn(
                    "relative w-60 h-60 sm:w-72 sm:h-72 rounded-full border-4 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-300 bg-slate-900",
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
                      className="absolute bottom-8 w-20 h-20 rounded-full opacity-100 scale-125"
                      style={{
                        background: "radial-gradient(circle, #fbbf24 0%, #f97316 50%, #ef4444 100%)",
                        filter: "blur(6px)",
                        animation: "pulse 1s ease-in-out infinite",
                      }}
                    />
                  )}

                  {/* Items badge row — top of circle */}
                  {!pitWater && pitItems.length > 0 && (
                    <div className="absolute top-10 flex items-center gap-2 z-20">
                      {pitItems.map((id) => {
                        const item = LAB_ITEMS.find(i => i.id === id)
                        if (!item) return null
                        const badgeColor = id === "wood" ? "bg-amber-800/80 border-amber-600"
                          : id === "spark" ? "bg-red-800/80 border-red-600"
                          : id === "fan"   ? "bg-blue-800/80 border-blue-600"
                          : "bg-cyan-800/80 border-cyan-600"
                        return (
                          <div key={id} className={cn("h-10 w-10 rounded-full border-2 flex items-center justify-center text-xl shadow-md", badgeColor)}
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
                    <div className="z-20 text-4xl" style={{ marginTop: 20 }}>🔥</div>
                  )}

                  {/* Water splash */}
                  {pitWater && <div className="text-5xl animate-bounce z-10">💦</div>}

                  {/* Placeholder */}
                  {pitItems.length === 0 && !pitWater && !labCompleted && (
                    <p className="text-slate-600 font-black text-xs sm:text-sm uppercase tracking-widest text-center z-10 px-8">
                      DROP ITEMS HERE
                    </p>
                  )}
                </div>

                {/* Status message — BELOW pit */}
                <p className={cn(
                  "text-sm font-bold text-center transition-colors min-h-[20px]",
                  labCompleted ? "text-orange-400" : "text-slate-400"
                )}>
                  {labCompleted ? "⚠️ FIRE STARTED! The Triangle is complete!" : pitMessage}
                </p>

                {/* Clear Pit link — always below */}
                <button
                  type="button"
                  onClick={resetPit}
                  className="text-xs text-slate-500 hover:text-white underline transition-colors"
                >
                  Clear Pit &amp; Restart
                </button>
              </div>
            </div>
          </div>

          {/* ── Module 1 Complete Card ── */}
          {mixerEverCompleted && (
            <div className="rounded-2xl bg-green-950/30 border border-green-500/40 p-8 sm:p-12 text-center shadow-xl">
              <div className="h-16 w-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="h-9 w-9 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Module 1 Complete!</h2>
              <p className="text-slate-300 mb-8 max-w-md mx-auto leading-relaxed">
                Great job! You've learned about the Fire Triangle and why fire tools are for grown-ups only.
              </p>
              {!moduleCompleted ? (
                <button
                  onClick={completeModule}
                  disabled={saving}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-[#ff4b3e] to-[#ff8c00] text-white font-black text-lg px-8 py-4 rounded-full shadow-[0_4px_0_#9a3412] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#9a3412] active:translate-y-1 active:shadow-none transition-all disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Continue to Module 2 →"}
                </button>
              ) : (
                <Link
                  href="/kids/safescape"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-[#ff4b3e] to-[#ff8c00] text-white font-black text-lg px-8 py-4 rounded-full shadow-[0_4px_0_#9a3412] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#9a3412] active:translate-y-1 active:shadow-none transition-all"
                >
                  Continue to Module 2 →
                </Link>
              )}
            </div>
          )}

          {/* ── Footer ── */}
          <div className="text-center py-8 border-t border-slate-800">
            <p className="text-slate-600 text-sm">SafeScape Intelligent Systems Project</p>
            <p className="text-slate-700 text-xs mt-1 opacity-50">Module 1: Fire is a Tool, Not a Toy</p>
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
