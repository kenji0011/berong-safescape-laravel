import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Label } from "@/Components/ui/label"
import { Input } from "@/Components/ui/input"
import { Textarea } from "@/Components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Plus, CheckCircle, AlertCircle, HelpCircle, Trash2 } from "lucide-react"
import { Skeleton } from "@/Components/ui/skeleton"
import type { QuestionsTabProps } from "@/types/admin"

export const AdminQuestionsTab: React.FC<QuestionsTabProps> = ({
  loading,
  quickQuestions,
  newQuickQuestion,
  setNewQuickQuestion,
  handleAddQuickQuestion,
  handleDeleteQuickQuestion,
  success,
  error
}) => {
  return (
    <div className="space-y-6">
      {/* CARD 1: Add New Quick Question */}
      <div className="rounded-[1.75rem] sm:rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] overflow-hidden bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md transition-all mb-6 p-6 sm:p-7 md:p-8 flex flex-col gap-5 sm:gap-6">
        {/* Header Row */}
        <div className="flex items-center gap-3">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 p-2 sm:p-2.5 rounded-xl shadow-sm shrink-0">
            <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-[#d60000]" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white tracking-tight">Add New Quick Question</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">Create frequently asked questions for the chatbot</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex flex-col justify-between gap-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qq-category" className="font-bold text-slate-700 dark:text-slate-300">Category</Label>
              <Select
                value={newQuickQuestion.category}
                onValueChange={(value) => setNewQuickQuestion({ ...newQuickQuestion, category: value })}
              >
                <SelectTrigger id="qq-category" className="w-full h-11 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 font-bold text-slate-700 dark:text-white focus:ring-red-500 shadow-sm transition-all hover:border-slate-300">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 shadow-xl p-1">
                  <SelectItem value="emergency" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-700 focus:text-red-600 dark:focus:text-red-400 transition-colors cursor-pointer py-2.5">
                    Emergency Procedures
                  </SelectItem>
                  <SelectItem value="prevention" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-700 focus:text-red-600 dark:focus:text-red-400 transition-colors cursor-pointer py-2.5">
                    Fire Prevention
                  </SelectItem>
                  <SelectItem value="equipment" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-700 focus:text-red-600 dark:focus:text-red-400 transition-colors cursor-pointer py-2.5">
                    Safety Equipment
                  </SelectItem>
                  <SelectItem value="general" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-700 focus:text-red-600 dark:focus:text-red-400 transition-colors cursor-pointer py-2.5">
                    General Information
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qq-active" className="font-bold text-slate-700 dark:text-slate-300">Status</Label>
              <Select
                value={newQuickQuestion.isActive ? "active" : "inactive"}
                onValueChange={(value) => setNewQuickQuestion({ ...newQuickQuestion, isActive: value === "active" })}
              >
                <SelectTrigger id="qq-active" className="w-full h-11 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 font-bold text-slate-700 dark:text-white focus:ring-red-500 shadow-sm transition-all hover:border-slate-300">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 shadow-xl p-1">
                  <SelectItem value="active" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-700 focus:text-red-600 dark:focus:text-red-400 transition-colors cursor-pointer py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                      Active
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-700 focus:text-red-600 dark:focus:text-red-400 transition-colors cursor-pointer py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-slate-400" />
                      Inactive
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="qq-question" className="font-bold text-slate-700 dark:text-slate-300">Question</Label>
            <Input
              id="qq-question"
              placeholder="Enter the question"
              value={newQuickQuestion.questionText}
              onChange={(e) => setNewQuickQuestion({ ...newQuickQuestion, questionText: e.target.value })}
              className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl font-bold h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qq-response" className="font-bold text-slate-700 dark:text-slate-300">Response</Label>
            <Textarea
              id="qq-response"
              placeholder="Enter the response"
              value={newQuickQuestion.responseText}
              onChange={(e) => setNewQuickQuestion({ ...newQuickQuestion, responseText: e.target.value })}
              rows={4}
              className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl resize-none font-medium"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-2 mt-auto">
            <button
              type="button"
              onClick={handleAddQuickQuestion}
              className="inline-flex items-center justify-center bg-[#d60000] hover:bg-red-500 text-white font-extrabold px-6 pb-2.5 pt-3 rounded-xl text-sm shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all cursor-pointer"
            >
              <Plus className="h-5 w-5 mr-2" strokeWidth={2.5} />
              Add Quick Question
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

      {/* CARD 2: Current Quick Questions */}
      <div className="rounded-[1.75rem] sm:rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] overflow-hidden bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md transition-all mb-6 p-6 sm:p-7 md:p-8 flex flex-col gap-5 sm:gap-6">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 p-2 sm:p-2.5 rounded-xl shadow-sm shrink-0">
              <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-[#d60000]" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight truncate">
                Current Quick Questions
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5 line-clamp-1">
                {quickQuestions.length} questions in database
              </p>
            </div>
          </div>
          {quickQuestions.length > 0 && (
            <span className="hidden sm:inline-flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black px-2.5 py-1 rounded-full shrink-0">
              {quickQuestions.length} {quickQuestions.length === 1 ? 'question' : 'questions'}
            </span>
          )}
        </div>

        {/* List Content */}
        <div>
          <div className="space-y-3 sm:space-y-4">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 sm:p-5 border-2 border-slate-200 dark:border-slate-700/80 rounded-xl bg-white dark:bg-slate-900/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Skeleton className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" />
                        <Skeleton className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <Skeleton className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700" />
                    <Skeleton className="h-14 w-full rounded-xl bg-slate-100 dark:bg-slate-800/40" />
                  </div>
                ))}
              </div>
            ) : quickQuestions.length === 0 ? (
              <div className="text-center py-10 px-4 bg-white/60 dark:bg-slate-900/40 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <HelpCircle className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">No quick questions added yet</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Use the form above to add chatbot quick questions.</p>
              </div>
            ) : (
              quickQuestions.map((question) => (
                <div 
                  key={question.id} 
                  className="p-4 sm:p-5 border-2 border-slate-200 dark:border-slate-700/80 rounded-xl bg-white dark:bg-slate-900/70 backdrop-blur-sm shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col gap-3"
                >
                  {/* Header Row: Category, Status, Question & Delete Button */}
                  <div className="flex items-start justify-between gap-3 w-full">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`inline-flex items-center text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-lg border shadow-2xs ${question.isActive ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20'}`}>
                          {question.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="inline-flex items-center text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-lg border shadow-2xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                          {question.category}
                        </span>
                      </div>
                      <h4 className="font-black text-sm sm:text-base text-slate-800 dark:text-white leading-snug break-words [word-break:break-word]">
                        {question.questionText}
                      </h4>
                    </div>

                    {/* Red Trash Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteQuickQuestion(question.id)}
                      className="flex items-center justify-center bg-[#d60000] hover:bg-red-500 text-white font-extrabold h-9 w-9 sm:h-10 sm:w-10 rounded-xl shadow-[0_3px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#991b1b] active:translate-y-1 active:shadow-none transition-all shrink-0 cursor-pointer"
                      title="Delete question"
                      aria-label="Delete question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Response */}
                  {question.responseText && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed break-words [word-break:break-word] pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-1">
                      {question.responseText}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
