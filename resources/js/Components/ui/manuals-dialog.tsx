"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, BookOpen, Eye, Loader2, Info } from "lucide-react";
import { motion } from "framer-motion";

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

  const handleView = (manual: Manual) => {
    if (manual.filename) {
      window.open(`/modules/bfp_manuals/${manual.filename}`, '_blank');
    }
  };

  const handleDownload = (manual: Manual) => {
    if (!manual.filename) return;
    const link = document.createElement('a');
    link.href = `/modules/bfp_manuals/${manual.filename}`;
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

  const filteredManuals = activeCategory === "All"
    ? manuals
    : manuals.filter(m => m.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] rounded-[1.5rem] sm:rounded-[2rem] border-2 border-b-[8px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-6 md:p-8 transition-colors duration-500">
        <DialogHeader className="text-left">
          <div className="flex flex-row items-center gap-2.5 sm:gap-3.5 mb-2 sm:mb-4">
            <div className="bg-blue-600 dark:bg-blue-600 p-2 sm:p-3.5 rounded-2xl shadow-md shrink-0 border-2 border-white/10">
              <BookOpen className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
            </div>
            <div className="space-y-0.5 sm:space-y-1.5 max-w-xl pr-6 sm:pr-10">
              <DialogTitle className="text-base sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight transition-colors">
                BFP Manuals & Fire Codes
              </DialogTitle>
              <DialogDescription className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed max-w-md">
                Access official fire safety manuals, standard operating procedures, and fire regulations.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Mobile View: Horizontally Scrollable Pills */}
        <div className="flex sm:hidden flex-row overflow-x-auto whitespace-nowrap gap-1.5 mb-4 pb-2 border-b-2 border-slate-100 dark:border-slate-800 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
                activeCategory === cat
                  ? "bg-blue-600 text-white shadow-[0_2px_0_#1d4ed8]"
                  : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Desktop View: Sliding Tabs Container */}
        <div className="hidden sm:flex bg-slate-100/70 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-[1.5rem] border-2 border-slate-200 dark:border-slate-700 gap-1 shadow-inner h-auto transition-colors relative mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative flex-1 font-black text-xs transition-colors duration-300 rounded-xl py-2.5 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
                activeCategory === cat
                  ? "text-white"
                  : "text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-700/40 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {activeCategory === cat && (
                <motion.div
                  layoutId="activeManualsTab"
                  className="absolute inset-0 bg-blue-600 rounded-xl shadow-[0_3px_0_#1d4ed8]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          ))}
        </div>

        {/* Outer content container with standard fixed height and internal scroll to keep modal size constant */}
        <div className="space-y-3 pt-1 h-[280px] sm:h-[360px] overflow-y-auto pr-1 sm:pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full flex flex-col justify-start">
          {loading ? (
            <div className="flex flex-col items-center justify-center flex-1 py-8">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600 mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Synchronizing manual database...</p>
            </div>
          ) : filteredManuals.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-8 text-center animate-in fade-in duration-300">
              <Info className="h-8 w-8 text-slate-400 mb-2" />
              <h3 className="text-slate-800 dark:text-white font-extrabold text-sm mb-0.5">No Items Found</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">No registered entries for this category.</p>
            </div>
          ) : (
            <div className="grid gap-2.5 sm:gap-3.5 animate-in fade-in duration-300">
              {filteredManuals.map((manual) => {
                const colors = getCategoryColors(manual.category);
                return (
                  <Card key={manual.id} className="bg-white dark:bg-slate-800 rounded-xl border-2 border-b-[4px] border-slate-200 dark:border-slate-700 hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm dark:shadow-[0_4px_0_#0f172a] active:translate-y-[2px] active:border-b-2 transition-all overflow-hidden">
                    <CardContent className="p-2 sm:p-3 sm:py-3 sm:px-5">
                      <div className="flex flex-row items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                            <div className={`p-1 sm:p-1.5 rounded-lg shrink-0 ${colors.iconBg}`}>
                              <FileText className={`h-3.5 w-3.5 ${colors.iconText}`} />
                            </div>
                            <h3 className="font-extrabold text-slate-800 dark:text-white text-[11px] sm:text-base leading-snug truncate max-w-[120px] sm:max-w-none">{manual.title}</h3>
                            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 font-bold text-[7px] sm:text-[8px] tracking-wider uppercase border shrink-0 ${colors.badge}`}>
                              {manual.category}
                            </span>
                            {manual.filename && (
                              <span className="hidden md:inline-block text-[8px] font-bold text-slate-400 dark:text-slate-500 font-mono truncate max-w-[150px]">
                                {manual.filename}
                              </span>
                            )}
                          </div>
                          <p className="hidden sm:block text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium pl-7 opacity-85 leading-relaxed line-clamp-1">
                            {manual.description || "No description provided."}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                          <button
                            onClick={() => handleView(manual)}
                            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-extrabold h-7.5 px-2.5 sm:h-8.5 sm:px-4 rounded-lg text-[9px] sm:text-xs shadow-[0_2px_0_#1d4ed8] sm:shadow-[0_2px_0_#2563eb] hover:-translate-y-0.5 hover:shadow-[0_3px_0_#1d4ed8] active:translate-y-0.5 active:shadow-none transition-all outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                          >
                            <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleDownload(manual)}
                            className="inline-flex items-center justify-center bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 font-extrabold h-7.5 px-2.5 sm:h-8.5 sm:px-4 rounded-lg text-[9px] sm:text-xs shadow-[0_2px_0_#cbd5e1] dark:shadow-[0_2px_0_#0f172a] hover:-translate-y-0.5 hover:shadow-[0_3px_0_#cbd5e1] dark:hover:shadow-[0_3px_0_#0f172a] hover:bg-slate-50 dark:hover:bg-slate-600 active:translate-y-0.5 active:shadow-none transition-all outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                          >
                            <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1" />
                            Save
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
