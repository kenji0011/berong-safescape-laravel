"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, BookOpen, Eye } from "lucide-react";

interface Manual {
  id: string;
  title: string;
  filename: string;
  description: string;
  category: string;
}

export function ManualsDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const manuals: Manual[] = [
    {
      id: "1",
      title: "PFE Community Relations Agenda",
      filename: "Volume-0-PFE-The-BFP-Community-Relations-Agenda.pdf",
      description: "Community relations agenda for the Bureau of Fire Protection",
      category: "Policy"
    },
    {
      id: "2",
      title: "Fire Safety For Children",
      filename: "Volume-1-Fire-Safety-For-Children.pdf",
      description: "Age-appropriate fire safety guidelines for children",
      category: "Education"
    },
    {
      id: "3",
      title: "Fire Safety for Teenagers",
      filename: "Volume-2-Fire-Safety-for-Teenagers.pdf",
      description: "Fire safety guidelines tailored for teenage audiences",
      category: "Education"
    },
    {
      id: "4",
      title: "Fire Safety for Young Adults",
      filename: "Volume-3-Fire-Safety-for-Young-Adults.pdf",
      description: "Fire safety guidelines for young adult demographics",
      category: "Education"
    },
    {
      id: "5",
      title: "Fire Safety for General Public",
      filename: "Volume-4-Fire-Safety-for-General-Public.pdf",
      description: "General fire safety guidelines for public awareness",
      category: "Public Safety"
    },
    {
      id: "6",
      title: "Fire Safety for Business Establishments",
      filename: "Volume-5-Fire-Safety-for-Business-Establishments.pdf",
      description: "Fire safety requirements and guidelines for businesses",
      category: "Regulatory"
    },
    {
      id: "7",
      title: "Fire Safety for Special Care and Vulnerable Individuals",
      filename: "Volume-6-Fire-Safety-for-Special-Care-and-Vulnerable-Individuals.pdf",
      description: "Specialized fire safety protocols for vulnerable populations",
      category: "Specialized"
    }
  ];

  const handleView = (filename: string) => {
    window.open(`/modules/bfp_manuals/${filename}`, '_blank');
  };

  const handleDownload = (filename: string) => {
    // Create a temporary link to trigger the download
    const link = document.createElement('a');
    link.href = `/modules/bfp_manuals/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryColors = (category: string) => {
    switch (category.toLowerCase()) {
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] rounded-[1.5rem] sm:rounded-[2rem] border-2 border-b-[8px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 md:p-8 transition-colors duration-500">
        <DialogHeader className="text-left">
          <div className="flex flex-row items-start gap-3.5 mb-4">
            <div className="bg-blue-600 dark:bg-blue-600 p-2.5 sm:p-3.5 rounded-2xl shadow-md shrink-0 border-2 border-white/10">
              <BookOpen className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
            </div>
            <div className="space-y-1 sm:space-y-1.5 max-w-xl pr-10">
              <DialogTitle className="text-xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight transition-colors">
                BFP Standard Operating Procedures
              </DialogTitle>
              <DialogDescription className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed max-w-md">
                Access official fire safety manuals and standard operating procedures.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="grid gap-3.5">
            {manuals.map((manual) => {
              const colors = getCategoryColors(manual.category);
              return (
                <Card key={manual.id} className="bg-white dark:bg-slate-800 rounded-xl border-2 border-b-[4px] border-slate-200 dark:border-slate-700 hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm dark:shadow-[0_4px_0_#0f172a] active:translate-y-[2px] active:border-b-2 transition-all overflow-hidden">
                  <CardContent className="p-3 sm:py-3 sm:px-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <div className={`p-1.5 rounded-lg shrink-0 ${colors.iconBg}`}>
                              <FileText className={`h-3.5 w-3.5 ${colors.iconText}`} />
                          </div>
                          <h3 className="font-extrabold text-slate-800 dark:text-white text-[13px] sm:text-base leading-snug">{manual.title}</h3>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-bold text-[8px] tracking-wider uppercase border shrink-0 ${colors.badge}`}>
                            {manual.category}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 pl-7 opacity-85 leading-relaxed line-clamp-1">
                          {manual.description}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:ml-4 shrink-0">
                        <button
                          onClick={() => handleView(manual.filename)}
                          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-extrabold h-8.5 w-full sm:w-auto sm:px-4 rounded-lg text-[10px] sm:text-xs shadow-[0_2px_0_#1d4ed8] sm:shadow-[0_2px_0_#2563eb] hover:-translate-y-0.5 hover:shadow-[0_3px_0_#1d4ed8] active:translate-y-0.5 active:shadow-none transition-all"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(manual.filename)}
                          className="inline-flex items-center justify-center bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 font-extrabold h-8.5 w-full sm:w-auto sm:px-4 rounded-lg text-[10px] sm:text-xs shadow-[0_2px_0_#cbd5e1] dark:shadow-[0_2px_0_#0f172a] hover:-translate-y-0.5 hover:shadow-[0_3px_0_#cbd5e1] dark:hover:shadow-[0_3px_0_#0f172a] hover:bg-slate-50 dark:hover:bg-slate-600 active:translate-y-0.5 active:shadow-none transition-all"
                        >
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Save
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
