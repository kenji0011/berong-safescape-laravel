import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
      <Card className="rounded-[1.5rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-[0_4px_0_#e2e8f0] dark:hover:shadow-[0_4px_0_#0f172a] overflow-hidden bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md transition-all mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800 dark:text-white">Add New Manual or Fire Code PDF</CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">Upload manuals or fire codes as PDF files</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fc-category" className="font-bold text-slate-700 dark:text-slate-300">Category</Label>
              <Select
                value={newFireCode.category || "Policy"}
                onValueChange={(value) => setNewFireCode({ ...newFireCode, category: value })}
              >
                <SelectTrigger id="fc-category" className="w-full border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 font-bold text-slate-700 dark:text-white focus:ring-red-500 shadow-sm transition-all hover:border-slate-300">
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
                className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl"
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
                    className={`inline-flex items-center justify-center bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl px-4 py-6 text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-red-500 dark:hover:border-red-500 cursor-pointer w-full text-center transition-all ${
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
                      href={`/modules/bfp_manuals/${newFireCode.filename}`}
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
                className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl"
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
              className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            <button
              type="button"
              onClick={handleAddFireCode}
              disabled={uploading}
              className="inline-flex items-center justify-center bg-[#d60000] hover:bg-red-500 disabled:opacity-50 text-white font-extrabold px-5 pb-2 pt-2.5 rounded-xl text-sm shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
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
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] overflow-hidden bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md transition-all mb-6">
        <CardHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 p-2 rounded-xl shadow-sm">
              <BookOpen className="h-6 w-6 text-[#d60000]" strokeWidth={2.5} />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Current Manuals & Fire Codes</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 font-medium mt-1">List of all manuals and fire codes registered in the system</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          <div className="space-y-4">
            {fireCodeSections.length === 0 ? (
              <p className="text-slate-500 font-medium text-center py-8">No manuals or fire codes yet</p>
            ) : (
              fireCodeSections.map((section) => {
                const colors = getCategoryColors(section.category)
                return (
                  <div key={section.id} className="flex items-start justify-between gap-2 sm:gap-3 p-3 sm:p-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm hover:shadow-[0_4px_0_#e2e8f0] dark:hover:shadow-[0_4px_0_#0f172a] hover:-translate-y-0.5 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start sm:items-center gap-2 mb-2">
                        <h4 className="font-bold text-slate-800 dark:text-white w-full sm:w-auto pr-2">{section.title}</h4>
                        <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md border shadow-sm ${colors.badge}`}>
                          {section.category || "Policy"}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{section.description || "No description provided."}</p>

                      {section.filename && (
                        <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold mt-2">
                          <FileText className="h-3.5 w-3.5" />
                          <a href={`/modules/bfp_manuals/${section.filename}`} target="_blank" rel="noreferrer" className="hover:underline flex items-center">
                            {section.filename} <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}
                      
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
                        Last updated: {new Date(section.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteFireCode(section.id)}
                      className="ml-2 sm:ml-4 flex items-center justify-center bg-[#d60000] text-white font-extrabold h-9 w-9 sm:h-10 sm:w-10 pb-1 rounded-xl shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all shrink-0"
                      aria-label="Delete section"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
