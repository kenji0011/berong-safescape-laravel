import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Label } from "@/Components/ui/label"
import { Input } from "@/Components/ui/input"
import { Textarea } from "@/Components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Plus, CheckCircle, AlertCircle, BookOpen, Trash2, Upload, FileText, ExternalLink, Loader2 } from "lucide-react"
import type { FireCodesTabProps } from "@/types/admin"
import { apiFetch } from "@/lib/api-fetch"

export const AdminFireCodesTab: React.FC<FireCodesTabProps> = ({
  fireCodeSections,
  newFireCode,
  setNewFireCode,
  handleAddFireCode,
  handleDeleteFireCode,
  success,
  error
}) => {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Please select a PDF file only.")
      e.target.value = ""
      return
    }

    setUploading(true)
    setUploadError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await apiFetch("/api/admin/upload-manual", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (response.ok && data.success) {
        setNewFireCode({
          ...newFireCode,
          filename: data.filename
        })
      } else {
        setUploadError(data.error || "Failed to upload file")
      }
    } catch (err) {
      console.error("Error uploading file:", err)
      setUploadError("Error uploading file")
    } finally {
      setUploading(false)
    }
  }

  const getCategoryColors = (category: string) => {
    switch (category?.toLowerCase()) {
      case "fire code":
        return {
          badge: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20",
          iconBg: "bg-red-50 dark:bg-red-500/10",
          iconText: "text-red-500 dark:text-red-400"
        }
      case "policy":
        return {
          badge: "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-500/20",
          iconBg: "bg-cyan-50 dark:bg-cyan-500/10",
          iconText: "text-cyan-500 dark:text-cyan-400"
        }
      case "education":
        return {
          badge: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20",
          iconBg: "bg-amber-50 dark:bg-amber-500/10",
          iconText: "text-amber-500 dark:text-amber-400"
        }
      case "public safety":
        return {
          badge: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
          iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
          iconText: "text-emerald-500 dark:text-emerald-400"
        }
      case "regulatory":
        return {
          badge: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20",
          iconBg: "bg-rose-50 dark:bg-rose-500/10",
          iconText: "text-rose-500 dark:text-rose-400"
        }
      default:
        return {
          badge: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20",
          iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
          iconText: "text-indigo-500 dark:text-indigo-400"
        }
    }
  }

  return (
    <div className="space-y-6">
      {/* CARD 1: Add New Manual */}
      <div className="rounded-[1.75rem] sm:rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] overflow-hidden bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md transition-all mb-6 p-6 sm:p-7 md:p-8 flex flex-col gap-5 sm:gap-6">
        {/* Header Row */}
        <div className="flex items-center gap-3">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 p-2 sm:p-2.5 rounded-xl shadow-sm shrink-0">
            <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-[#d60000]" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white tracking-tight">Add New Manual or Fire Code PDF</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">Upload manuals or fire codes as PDF files</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex flex-col justify-between gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fc-category" className="font-bold text-slate-700 dark:text-slate-300">Category</Label>
              <Select
                value={newFireCode.category || "Policy"}
                onValueChange={(value) => setNewFireCode({ ...newFireCode, category: value })}
              >
                <SelectTrigger id="fc-category" className="w-full h-11 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 font-bold text-slate-700 dark:text-white focus:ring-red-500 shadow-sm transition-all hover:border-slate-300">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 shadow-xl p-1">
                  <SelectItem value="Fire Code" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Fire Code</SelectItem>
                  <SelectItem value="Policy" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Policy</SelectItem>
                  <SelectItem value="Education" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Education</SelectItem>
                  <SelectItem value="Public Safety" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Public Safety</SelectItem>
                  <SelectItem value="Regulatory" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Regulatory</SelectItem>
                  <SelectItem value="Specialized" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Specialized</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fc-title" className="font-bold text-slate-700 dark:text-slate-300">Title</Label>
              <Input
                id="fc-title"
                placeholder="Title / Name of the document"
                value={newFireCode.title}
                onChange={(e) => setNewFireCode({ ...newFireCode, title: e.target.value })}
                className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl font-bold h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700 dark:text-slate-300">Document File (PDF)</Label>
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="fc-manual-file-input"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="fc-manual-file-input"
                    className={`inline-flex items-center justify-center bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl px-4 py-5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-red-500 dark:hover:border-red-500 cursor-pointer w-full text-center transition-all ${
                      uploading ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin text-red-500" />
                        Uploading document...
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 mr-2 text-slate-400" />
                        Click to select & upload PDF Manual / Fire Code
                      </>
                    )}
                  </label>
                </div>
                {newFireCode.filename && (
                  <div className="flex items-center gap-2 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-2.5 rounded-xl border border-green-200 dark:border-green-900/30">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate flex-1">Uploaded: {newFireCode.filename}</span>
                    <a
                      href={`/modules/bfp_manuals/${encodeURIComponent(newFireCode.filename)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline flex items-center text-blue-600 dark:text-blue-400 shrink-0"
                    >
                      View <ExternalLink className="h-3 w-3 ml-0.5" />
                    </a>
                  </div>
                )}
                {uploadError && (
                  <div className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5 mt-1">
                    <AlertCircle className="h-4 w-4" /> {uploadError}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fc-filename" className="font-bold text-slate-700 dark:text-slate-300">Or enter Filename manually</Label>
              <Input
                id="fc-filename"
                placeholder="e.g., manual-name.pdf"
                value={newFireCode.filename || ""}
                onChange={(e) => setNewFireCode({ ...newFireCode, filename: e.target.value })}
                className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl font-bold h-11"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Specify the filename directly if already present in public/modules/bfp_manuals/</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fc-description" className="font-bold text-slate-700 dark:text-slate-300">Description</Label>
            <Textarea
              id="fc-description"
              placeholder="Short description of the manual or fire code content..."
              rows={4}
              value={newFireCode.description || ""}
              onChange={(e) => setNewFireCode({ ...newFireCode, description: e.target.value })}
              className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl resize-none font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 mt-auto">
            <button
              type="button"
              onClick={handleAddFireCode}
              disabled={uploading}
              className="inline-flex items-center justify-center bg-[#d60000] hover:bg-red-500 disabled:opacity-50 text-white font-extrabold px-6 pb-2.5 pt-3 rounded-xl text-sm shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all cursor-pointer"
            >
              <Plus className="h-5 w-5 mr-2" strokeWidth={2.5} />
              Add Document
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
        </div>
      </div>

      {/* CARD 2: Current Manuals & Fire Codes */}
      <div className="rounded-[1.75rem] sm:rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] overflow-hidden bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md transition-all mb-6 p-6 sm:p-7 md:p-8 flex flex-col gap-5 sm:gap-6">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 p-2 sm:p-2.5 rounded-xl shadow-sm shrink-0">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-[#d60000]" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight truncate">
                Current Manuals & Fire Codes
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5 line-clamp-1">
                List of all manuals and fire codes registered in the system
              </p>
            </div>
          </div>
          {fireCodeSections.length > 0 && (
            <span className="hidden sm:inline-flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black px-2.5 py-1 rounded-full shrink-0">
              {fireCodeSections.length} {fireCodeSections.length === 1 ? 'file' : 'files'}
            </span>
          )}
        </div>

        {/* List Content */}
        <div>
          <div className="space-y-3 sm:space-y-4">
            {fireCodeSections.length === 0 ? (
              <div className="text-center py-10 px-4 bg-white/60 dark:bg-slate-900/40 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">No manuals or fire codes uploaded yet</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Use the form above to add document PDFs.</p>
              </div>
            ) : (
              fireCodeSections.map((section) => {
                const colors = getCategoryColors(section.category)
                return (
                  <div 
                    key={section.id} 
                    className="p-4 sm:p-5 border-2 border-slate-200 dark:border-slate-700/80 rounded-xl bg-white dark:bg-slate-900/70 backdrop-blur-sm shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col gap-3"
                  >
                    {/* Header Row: Category, Title & Action Button */}
                    <div className="flex items-start justify-between gap-3 w-full">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`inline-flex items-center text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-lg border shadow-2xs ${colors.badge}`}>
                            {section.category || "Policy"}
                          </span>
                        </div>
                        <h4 className="font-black text-sm sm:text-base text-slate-800 dark:text-white leading-snug break-words [word-break:break-word]">
                          {section.title}
                        </h4>
                      </div>

                      {/* Red Trash Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteFireCode(section.id)}
                        className="flex items-center justify-center bg-[#d60000] hover:bg-red-500 text-white font-extrabold h-9 w-9 sm:h-10 sm:w-10 rounded-xl shadow-[0_3px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#991b1b] active:translate-y-1 active:shadow-none transition-all shrink-0 cursor-pointer"
                        title="Delete manual"
                        aria-label="Delete manual"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Description */}
                    {section.description && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed break-words [word-break:break-word] line-clamp-3">
                        {section.description}
                      </p>
                    )}

                    {/* File Attachment & Metadata Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-1">
                      {section.filename ? (
                        <a 
                          href={`/modules/bfp_manuals/${encodeURIComponent(section.filename)}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-2 max-w-full px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors group/link min-w-0"
                        >
                          <FileText className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                          <span className="truncate max-w-[200px] xs:max-w-[260px] sm:max-w-[380px]">{section.filename}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-70 group-hover/link:opacity-100 transition-opacity" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 italic font-medium">No PDF file attached</span>
                      )}

                      <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-bold ml-auto">
                        Updated: {new Date(section.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
