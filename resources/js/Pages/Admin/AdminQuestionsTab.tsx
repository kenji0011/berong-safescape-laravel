import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, CheckCircle, AlertCircle, HelpCircle, Trash2 } from "lucide-react"
import type { QuestionsTabProps } from "@/types/admin"

export const AdminQuestionsTab: React.FC<QuestionsTabProps> = ({
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
      <Card className="rounded-[1.5rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-[0_4px_0_#e2e8f0] dark:hover:shadow-[0_4px_0_#0f172a] overflow-hidden bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md transition-all mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800 dark:text-white">Add New Quick Question</CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">Create frequently asked questions for the chatbot</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qq-category" className="font-bold text-slate-700 dark:text-slate-300">Category</Label>
              <Select
                value={newQuickQuestion.category}
                onValueChange={(value) => setNewQuickQuestion({ ...newQuickQuestion, category: value })}
              >
                <SelectTrigger id="qq-category" className="w-full h-10 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 font-bold text-slate-700 dark:text-white focus:ring-red-500 shadow-sm transition-all hover:border-slate-300">
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
                <SelectTrigger id="qq-active" className="w-full h-10 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 font-bold text-slate-700 dark:text-white focus:ring-red-500 shadow-sm transition-all hover:border-slate-300">
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
              className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl"
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
              className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl resize-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <button
              type="button"
              onClick={handleAddQuickQuestion}
              className="inline-flex items-center justify-center bg-[#d60000] text-white font-extrabold px-5 pb-2 pt-2.5 rounded-xl text-sm shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
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
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] overflow-hidden bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md transition-all mb-6">
        <CardHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 p-2 rounded-xl shadow-sm">
              <HelpCircle className="h-6 w-6 text-[#d60000]" strokeWidth={2.5} />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Current Quick Questions</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 font-medium mt-1">{quickQuestions.length} questions in database</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          <div className="space-y-4">
            {quickQuestions.length === 0 ? (
              <p className="text-slate-500 font-medium text-center py-8">No quick questions yet</p>
            ) : (
              quickQuestions.map((question) => (
                <div key={question.id} className="flex items-start justify-between gap-2 sm:gap-3 p-3 sm:p-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm hover:shadow-[0_4px_0_#e2e8f0] dark:hover:shadow-[0_4px_0_#0f172a] hover:-translate-y-0.5 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start sm:items-center gap-2 mb-2">
                      <h4 className="font-bold text-slate-800 dark:text-white w-full sm:w-auto">{question.questionText}</h4>
                      <span className={`text-xs px-2 py-1 rounded-md font-bold shrink-0 ${question.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'}`}>
                        {question.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-md font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize shrink-0">
                        {question.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{question.responseText}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuickQuestion(question.id)}
                    className="ml-2 sm:ml-4 flex items-center justify-center bg-[#d60000] text-white font-extrabold h-9 w-9 sm:h-10 sm:w-10 pb-1 rounded-xl text-sm shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all shrink-0"
                    aria-label="Delete question"
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
