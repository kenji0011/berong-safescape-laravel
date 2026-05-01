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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] rounded-[2rem] border-2 border-b-[8px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 transition-colors duration-500">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-100 dark:border-blue-900/30 p-3 rounded-2xl shadow-sm">
              <BookOpen className="h-7 w-7 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-extrabold text-slate-800 dark:text-white transition-colors">BFP Standard Operating Procedures</DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                Access official fire safety manuals and standard operating procedures.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div className="grid gap-5">
            {manuals.map((manual) => (
              <Card key={manual.id} className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-b-[4px] border-slate-200 dark:border-slate-700 hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm dark:shadow-[0_4px_0_#0f172a] active:translate-y-[2px] active:border-b-2 transition-all overflow-hidden">
                <CardContent className="p-4 md:py-3.5 md:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="bg-red-50 dark:bg-red-950/30 p-1.5 rounded-lg shrink-0">
                            <FileText className="h-4 w-4 text-red-500 dark:text-red-400" />
                        </div>
                        <h3 className="font-extrabold text-slate-800 dark:text-white text-base line-clamp-1">{manual.title}</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mb-2 line-clamp-1 pl-10 opacity-80">{manual.description}</p>
                      <div className="pl-10">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[9px] tracking-wider uppercase border border-slate-200 dark:border-slate-600">
                            {manual.category}
                          </span>
                      </div>
                    </div>
                    <div className="flex gap-2.5 sm:ml-4 shrink-0">
                      <button
                        onClick={() => handleView(manual.filename)}
                        className="inline-flex items-center justify-center bg-slate-800 dark:bg-slate-950 text-white font-extrabold h-9 px-4 rounded-xl text-xs shadow-[0_3px_0_#0f172a] sm:shadow-[0_3px_0_#000] hover:-translate-y-0.5 hover:shadow-[0_4px_0_#0f172a] active:translate-y-1 active:shadow-none transition-all"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(manual.filename)}
                        className="inline-flex items-center justify-center bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 font-extrabold h-9 px-4 rounded-xl text-xs shadow-[0_3px_0_#e2e8f0] dark:shadow-[0_3px_0_#0f172a] hover:-translate-y-0.5 hover:shadow-[0_4px_0_#e2e8f0] dark:hover:shadow-[0_4px_0_#0f172a] hover:bg-slate-50 dark:hover:bg-slate-600 active:translate-y-1 active:shadow-none transition-all"
                      >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Save
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
