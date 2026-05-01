import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, CheckCircle, AlertCircle, BookOpen, Trash2 } from "lucide-react"
import type { FireCodesTabProps } from "@/types/admin"

export const AdminFireCodesTab: React.FC<FireCodesTabProps> = ({
  fireCodeSections,
  newFireCode,
  setNewFireCode,
  handleAddFireCode,
  handleDeleteFireCode,
  success,
  error
}) => {
  return (
    <div className="space-y-6">
      <Card className="rounded-[1.5rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-[0_4px_0_#e2e8f0] dark:hover:shadow-[0_4px_0_#0f172a] overflow-hidden bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md transition-all mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800 dark:text-white">Add New Fire Code Section</CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">Add sections to the Fire Code & Regulations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fc-title" className="font-bold text-slate-700 dark:text-slate-300">Title</Label>
            <Input
              id="fc-title"
              placeholder="Section title"
              value={newFireCode.title}
              onChange={(e) => setNewFireCode({ ...newFireCode, title: e.target.value })}
              className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fc-section-num" className="font-bold text-slate-700 dark:text-slate-300">Section Number</Label>
              <Input
                id="fc-section-num"
                placeholder="e.g., 1.1, 2.3.1, etc."
                value={newFireCode.sectionNum}
                onChange={(e) => setNewFireCode({ ...newFireCode, sectionNum: e.target.value })}
                className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fc-parent-section" className="font-bold text-slate-700 dark:text-slate-300">Parent Section (Optional)</Label>
              <Input
                id="fc-parent-section"
                placeholder="Parent section ID"
                value={newFireCode.parentSectionId}
                onChange={(e) => setNewFireCode({ ...newFireCode, parentSectionId: e.target.value })}
                className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fc-content" className="font-bold text-slate-700 dark:text-slate-300">Content</Label>
            <Textarea
              id="fc-content"
              placeholder="Section content"
              rows={6}
              value={newFireCode.content}
              onChange={(e) => setNewFireCode({ ...newFireCode, content: e.target.value })}
              className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl resize-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <button
              type="button"
              onClick={handleAddFireCode}
              className="inline-flex items-center justify-center bg-[#d60000] text-white font-extrabold px-5 pb-2 pt-2.5 rounded-xl text-sm shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Fire Code Section
            </button>
            {success && (
              <div className="text-sm font-bold text-green-700 dark:text-green-400 flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-900/50 px-4 py-2 rounded-xl animate-in fade-in zoom-in-95 duration-300">
                <CheckCircle className="h-4 w-4"/> {success}
              </div>
            )}
            {error && (
              <div className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-900/50 px-4 py-2 rounded-xl animate-in fade-in zoom-in-95 duration-300">
                <AlertCircle className="h-4 w-4"/> {error}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] overflow-hidden bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md transition-all mb-6">
        <CardHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 p-2 rounded-xl shadow-sm">
              <BookOpen className="h-6 w-6 text-[#d60000]" strokeWidth={2.5} />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Current Fire Code Sections</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 font-medium mt-1">Fire Code & Regulations sections in the database</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          <div className="space-y-4">
            {fireCodeSections.length === 0 ? (
              <p className="text-slate-500 font-medium text-center py-8">No fire code sections yet</p>
            ) : (
              fireCodeSections.map((section) => (
                <div key={section.id} className="flex items-start justify-between gap-2 sm:gap-3 p-3 sm:p-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm hover:shadow-[0_4px_0_#e2e8f0] dark:hover:shadow-[0_4px_0_#0f172a] hover:-translate-y-0.5 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start sm:items-center gap-2 mb-2">
                      <h4 className="font-bold text-slate-800 dark:text-white w-full sm:w-auto">{section.title}</h4>
                      <span className="text-xs font-bold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                        {section.sectionNum}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{section.content}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
                      Last updated: {new Date(section.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteFireCode(section.id)}
                    className="ml-2 sm:ml-4 flex items-center justify-center bg-[#d60000] text-white font-extrabold h-9 w-9 sm:h-10 sm:w-10 pb-1 rounded-xl text-sm shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all shrink-0"
                    aria-label="Delete section"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
