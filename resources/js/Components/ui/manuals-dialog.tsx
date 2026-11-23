"use client";

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Card, CardContent } from "@/Components/ui/card";
import { FileText, Download, BookOpen, Eye, Loader2, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Manual {
  id: string;
  title: string;
  filename?: string;
  description?: string;
  category: string;
  updatedAt?: string | null;
}

export function ManualsDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Fire Code", "Policy", "Education", "Public Safety", "Regulatory", "Specialized"];

  useEffect(() => {
    if (isOpen) {
      const loadManuals = async () => {
        try {
          setLoading(true);
          const response = await fetch("/api/content/manuals", {
            headers: {
              "X-Requested-With": "XMLHttpRequest",
            }
          });
          if (response.ok) {
            const data = await response.json();
            setManuals(data);
          }
        } catch (err) {
          console.error("Error loading manuals:", err);
        } finally {
          setLoading(false);
        }
      };
      loadManuals();
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleView = (manual: Manual) => {
    if (manual.filename) {
      window.open(`/modules/bfp_manuals/${encodeURIComponent(manual.filename)}`, '_blank');
    }
  };

  const handleDownload = (manual: Manual) => {
    if (!manual.filename) return;
    const link = document.createElement('a');
    link.href = `/modules/bfp_manuals/${encodeURIComponent(manual.filename)}`;
    link.download = manual.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryColors = (category: string) => {
    switch (category?.toLowerCase()) {
      case "fire code":
        return {
          badge: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20",
          iconBg: "bg-red-50 dark:bg-red-500/10",
          iconText: "text-red-500 dark:text-red-400"
        };
      case "policy":
        return {
          badge: "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-500/20",
          iconBg: "bg-cyan-50 dark:bg-cyan-500/10",
          iconText: "text-cyan-500 dark:text-cyan-400"
        };
      case "education":
        return {
          badge: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20",
          iconBg: "bg-amber-50 dark:bg-amber-500/10",
          iconText: "text-amber-500 dark:text-amber-400"
        };
      case "public safety":
        return {
          badge: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
          iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
          iconText: "text-emerald-500 dark:text-emerald-400"
        };
      case "regulatory":
        return {
          badge: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20",
          iconBg: "bg-rose-50 dark:bg-rose-500/10",
          iconText: "text-rose-500 dark:text-rose-400"
        };
      default:
        return {
          badge: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20",
          iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
          iconText: "text-indigo-500 dark:text-indigo-400"
        };
    }
  };

  const filteredManuals = (activeCategory === "All"
    ? manuals
    : manuals.filter(m => m.category?.toLowerCase() === activeCategory.toLowerCase()))
    .sort((a, b) => {
      const volA = parseInt(a.title.match(/Volume\s+(\d+)/i)?.[1] || "9999", 10);
      const volB = parseInt(b.title.match(/Volume\s+(\d+)/i)?.[1] || "9999", 10);
      return volA - volB;
    });

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="contents cursor-pointer">
        {children}
      </div>

      {typeof window !== "undefined" && ReactDOM.createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-x-hidden overflow-y-auto">
              {/* Backdrop */}
              <motion.div
                key="manuals-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="fixed inset-0 bg-black/65 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
              />

              {/* Morphing Modal Container with fixed height */}
              <motion.div
                key="manuals-modal"
                initial={{ opacity: 0, scale: 0.86, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: 16 }}
                transition={{ type: "spring", damping: 28, stiffness: 360, mass: 0.8 }}
                className="w-[95vw] sm:max-w-4xl lg:max-w-5xl h-[88vh] sm:h-[82vh] max-h-[760px] min-h-[420px] rounded-[1.75rem] sm:rounded-[2.25rem] border-[3px] sm:border-[4px] border-blue-600 dark:border-blue-500 bg-white dark:bg-slate-900 p-4 sm:p-6 md:p-8 shadow-2xl flex flex-col my-auto relative z-10 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex flex-row items-center justify-between gap-3 mb-3 sm:mb-5 shrink-0">
                  <div className="flex flex-row items-center gap-3 sm:gap-4 min-w-0">
                    <div className="bg-blue-600 p-2.5 sm:p-3.5 rounded-2xl shadow-md shrink-0 border-2 border-white/10 text-white">
                      <BookOpen className="h-5 w-5 sm:h-7 sm:w-7" />
                    </div>
                    <div className="space-y-0.5 sm:space-y-1 min-w-0">
                      <h2 className="text-base sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight transition-colors">
                        BFP Manuals & Fire Codes
                      </h2>
                      <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed max-w-md">
                        Access official fire safety manuals, standard operating procedures, and fire regulations.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-all shrink-0 cursor-pointer active:scale-90"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                  </button>
                </div>

                {/* Mobile View: Horizontally Scrollable Pills */}
                <div className="flex sm:hidden flex-row overflow-x-auto whitespace-nowrap gap-1.5 mb-3 pb-2 border-b-2 border-slate-100 dark:border-slate-800 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scrollbar-none shrink-0">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`relative px-3.5 py-1.5 rounded-xl text-[11px] font-black transition-colors duration-200 outline-none focus:outline-none cursor-pointer shrink-0 z-0 ${
                        activeCategory === cat
                          ? "text-white"
                          : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {activeCategory === cat && (
                        <motion.div
                          layoutId="activeManualsMobileTab"
                          className="absolute inset-0 bg-blue-600 rounded-xl shadow-[0_2px_0_#1d4ed8] -z-10"
                          initial={false}
                          transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        />
                      )}
                      <span className="relative z-10">{cat}</span>
                    </button>
                  ))}
                </div>

                {/* Desktop View: Sliding Tabs Container */}
                <div className="hidden sm:flex bg-slate-100/70 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-[1.5rem] border-2 border-slate-200 dark:border-slate-700 gap-1 shadow-inner h-auto transition-colors relative mb-4 shrink-0">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`relative flex-1 font-black text-xs transition-colors duration-200 rounded-xl py-2.5 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 cursor-pointer z-0 ${
                        activeCategory === cat
                          ? "text-white"
                          : "text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-700/40 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      {activeCategory === cat && (
                        <motion.div
                          layoutId="activeManualsTab"
                          className="absolute inset-0 bg-blue-600 rounded-xl shadow-[0_3px_0_#1d4ed8] -z-10"
                          initial={false}
                          transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        />
                      )}
                      <span className="relative z-10">{cat}</span>
                    </button>
                  ))}
                </div>

                {/* Content container with fixed height and smooth internal scroll */}
                <div className="pt-1 flex-1 overflow-y-auto pr-1 sm:pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full flex flex-col min-h-0">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-12 my-auto">
                      <Loader2 className="h-7 w-7 animate-spin text-blue-600 mb-2" />
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Synchronizing manual database...</p>
                    </div>
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="flex-1 flex flex-col min-h-0"
                      >
                        {filteredManuals.length === 0 ? (
                          <div className="flex flex-col items-center justify-center flex-1 my-auto py-12 text-center">
                            <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-3 text-slate-400 dark:text-slate-500">
                              <Info className="h-7 w-7" />
                            </div>
                            <h3 className="text-slate-800 dark:text-white font-extrabold text-sm sm:text-base mb-1">No Items Found</h3>
                            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold max-w-xs">
                              No registered entries found for {activeCategory === "All" ? "any category" : `the "${activeCategory}" category`}.
                            </p>
                          </div>
                        ) : (
                          <div className="grid gap-3 sm:gap-3.5 pb-2">
                            {filteredManuals.map((manual, idx) => {
                              const colors = getCategoryColors(manual.category);
                              return (
                                <motion.div
                                  key={manual.id}
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.015 * idx, duration: 0.18 }}
                                >
                                  <Card className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-b-[4px] border-slate-200 dark:border-slate-700 hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs dark:shadow-[0_4px_0_#0f172a] transition-all overflow-hidden p-3.5 sm:p-4 py-3.5 sm:py-4 gap-0">
                                    <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                      <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <div className={`p-1.5 rounded-lg shrink-0 ${colors.iconBg}`}>
                                            <FileText className={`h-4 w-4 ${colors.iconText}`} strokeWidth={2.5} />
                                          </div>
                                          <h3 className="font-extrabold text-slate-800 dark:text-white text-xs sm:text-base leading-snug line-clamp-2 sm:line-clamp-1 flex-1 min-w-0">{manual.title}</h3>
                                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-bold text-[8px] sm:text-[9px] tracking-wider uppercase border shrink-0 ${colors.badge}`}>
                                            {manual.category}
                                          </span>
                                        </div>
                                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium pl-7 leading-relaxed line-clamp-2">
                                          {manual.description || "No description provided."}
                                        </p>
                                      </div>
                                      <div className="flex flex-row items-center justify-end sm:justify-start gap-2 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700/60 shrink-0">
                                        <button
                                          onClick={() => handleView(manual)}
                                          className="flex-1 sm:flex-initial inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-extrabold h-8.5 px-3.5 sm:px-4 rounded-xl text-xs shadow-[0_2px_0_#1d4ed8] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                                        >
                                          <Eye className="h-3.5 w-3.5 mr-1.5" strokeWidth={2.5} />
                                          View
                                        </button>
                                        <button
                                          onClick={() => handleDownload(manual)}
                                          className="flex-1 sm:flex-initial inline-flex items-center justify-center bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-extrabold h-8.5 px-3.5 sm:px-4 rounded-xl text-xs shadow-[0_2px_0_#cbd5e1] dark:shadow-[0_2px_0_#0f172a] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                                        >
                                          <Download className="h-3.5 w-3.5 mr-1.5" strokeWidth={2.5} />
                                          Save
                                        </button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

