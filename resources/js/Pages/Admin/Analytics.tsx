"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, Award, TrendingUp, AlertTriangle, 
  MapPin, Clock, ArrowLeft, RefreshCw, BarChart3, Download, ClipboardCheck, ArrowRight, ShieldAlert, FileText, Target, Flame, Briefcase, GraduationCap, Loader2, AlertCircle, BookOpen, Gamepad2, Video, ChevronDown, School, Star, MessageSquare
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { BARANGAYS_SANTA_CRUZ, ASSESSMENT_CATEGORIES } from "@/lib/constants"

interface SummaryData {
  totalUsers: number
  profilesCompleted: number
  preTestsTaken: number
  postTestsTaken: number
  averagePreTestScore: number
  averagePostTestScore: number
  averageImprovement: number
  totalEngagementPoints: number
  avgEngagementPerUser: number
  activeUsersToday: number
  activeUsersThisWeek: number
}

interface BarangayData {
  barangay: string
  userCount: number
  avgPreTestScore: number
  avgPostTestScore: number
  avgImprovement: number
  profilesCompleted: number
}

interface DemographicData {
  gender: Record<string, number>
  ageGroups: Record<string, number>
  occupations: Record<string, number>
  schools: Record<string, number>
}

interface KnowledgeData {
  category: string
  avgScore: number
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
}

export default function AnalyticsDashboard({ 
  initialSummaryData, 
  initialBarangayData, 
  initialDemographicData, 
  initialKnowledgeData 
}: any) {
  const { user, isLoading: authLoading } = useAuth()
  
  const [loading, setLoading] = useState(!initialSummaryData)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [summary, setSummary] = useState<SummaryData | null>(initialSummaryData || null)
  const [barangayData, setBarangayData] = useState<BarangayData[]>(initialBarangayData || [])
  const [demographicData, setDemographicData] = useState<DemographicData | null>(initialDemographicData || null)
  const [knowledgeData, setKnowledgeData] = useState<KnowledgeData[]>(initialKnowledgeData || [])
  const [schoolAnalytics, setSchoolAnalytics] = useState<any>(null)
  const [feedbackAnalytics, setFeedbackAnalytics] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (authLoading) return

    if (user?.role !== "admin") {
      router.visit("/")
      return
    }
    
    // Only fetch if initial data wasn't provided by Inertia
    if (!initialSummaryData) {
      fetchAllData()
    } else {
      setLoading(false)
    }
  }, [user, router, authLoading, initialSummaryData])

  const fetchAllData = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true)
      else setLoading(true)
      setError("")

      const refreshParam = refresh ? "&refresh=true" : ""

      const [summaryRes, barangayRes, demographicsRes, knowledgeRes, schoolRes, feedbackRes] = await Promise.all([
        axios.get(`/api/admin/analytics?type=summary${refreshParam}`),
        axios.get(`/api/admin/analytics?type=barangay${refreshParam}`),
        axios.get(`/api/admin/analytics?type=demographics${refreshParam}`),
        axios.get(`/api/admin/analytics?type=knowledge${refreshParam}`),
        axios.get('/api/admin/school-analytics').catch(() => ({ data: null })),
        axios.get('/api/admin/feedback-analytics').catch(() => ({ data: null })),
      ])

      setSummary(summaryRes.data.data)
      setBarangayData(barangayRes.data.data)
      setDemographicData(demographicsRes.data.data)
      setKnowledgeData(knowledgeRes.data.data)
      if (schoolRes.data) setSchoolAnalytics(schoolRes.data)
      if (feedbackRes.data) setFeedbackAnalytics(feedbackRes.data)
    } catch (err) {
      setError("Failed to load analytics data")
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleExport = () => {
    try {
      const a = document.createElement("a")
      a.href = "/api/admin/analytics/export"
      a.download = `safescape_analytics_${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      setError("Failed to export data")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (user?.role !== "admin") {
    return null
  }

  // Find max values for bar chart scaling
  const maxBarangayUsers = Math.max(...(Array.isArray(barangayData) ? barangayData : []).map(b => b.userCount || 0), 1)
  const maxKnowledgeScore = 100

  return (
    <div 
      className="min-h-screen pb-12 font-sans selection:bg-red-500 selection:text-white relative bg-fixed bg-cover bg-center"
      style={{ backgroundImage: "url('/web-background-image.jpg')", backgroundPosition: 'center 80%' }}
    >
      {/* Heavy semi-transparent overlay so the image is 'a little bit seen' */}
      <div className="absolute inset-0 bg-slate-50/90 sm:bg-slate-50/85 z-0 pointer-events-none"></div>

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Header */}
          <div className="bg-white border-b-2 border-slate-200 fixed top-0 w-full z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6 pb-4">
            <div className="flex flex-col gap-4">
              
              {/* Top Row: Title Area */}
              <div className="flex items-start gap-3 sm:gap-4">
                <button 
                  onClick={() => router.visit("/admin")} 
                  className="h-10 w-10 sm:h-12 sm:w-12 bg-white rounded-full border-2 border-slate-200 border-b-[4px] active:border-b-2 active:translate-y-[2px] shadow-sm flex items-center justify-center hover:bg-slate-50 transition-all shrink-0 mt-1 sm:mt-0"
                >
                  <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700" strokeWidth={3} />
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-3xl font-black text-slate-800 flex items-center gap-2 sm:gap-3 leading-tight tracking-tight">
                    <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg sm:rounded-xl shrink-0 border-2 border-orange-200">
                      <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" strokeWidth={3} />
                    </div>
                    Analytics
                  </h1>
                  <p className="text-[10px] sm:text-xs text-slate-400 font-bold mt-1.5 sm:mt-2 tracking-wide uppercase truncate">
                    Santa Cruz, Laguna • Fire Safety Data
                  </p>
                </div>
              </div>
              
              {/* Middle Row: Actions + Tab Selector */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  className="rounded-full border-2 border-slate-200 border-b-[4px] active:border-b-2 active:translate-y-[2px] shadow-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all h-10 px-4 sm:px-6"
                  onClick={() => fetchAllData(true)}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} strokeWidth={3} />
                  Refresh
                </Button>
                <Button 
                  onClick={handleExport}
                  className="rounded-full border-2 border-red-700 border-b-[4px] active:border-b-2 active:translate-y-[2px] shadow-sm font-bold bg-red-600 hover:bg-red-500 text-white transition-all h-10 px-4 sm:px-6"
                >
                  <Download className="h-4 w-4 mr-2" strokeWidth={3} />
                  Export CSV
                </Button>

                {/* Tab Selector Pill — inline with actions */}
                <div className="flex bg-[#1c1d22] rounded-[2rem] p-1.5 sm:p-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] border-b-[4px] sm:border-b-[6px] border-[#0a0a0c] w-fit max-w-[95%] sm:max-w-full gap-1 overflow-hidden sm:ml-auto">
                {/* Left Side: Overview Button */}
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={activeTab === 'overview'
                    ? "bg-yellow-400 border-2 sm:border-[3px] border-white rounded-[1.5rem] shadow-[0_3px_0_0_#ca8a04] sm:shadow-[0_4px_0_0_#ca8a04] px-3 sm:px-6 py-2.5 flex items-center justify-center select-none z-50 transition-transform active:translate-y-[3px] sm:active:translate-y-[4px] active:shadow-none sm:active:shadow-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 min-w-[90px]"
                    : "border-2 sm:border-[3px] border-transparent flex items-center px-3 sm:px-6 py-2.5 active:opacity-70 transition-transform outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 select-none justify-center group hover:bg-white/10 rounded-[1.5rem] cursor-pointer min-w-[90px]"
                  }
                >
                   <span className={`font-black tracking-widest uppercase text-[10px] sm:text-xs pt-0.5 whitespace-nowrap drop-shadow-sm ${activeTab === 'overview' ? 'text-slate-900 drop-shadow-none' : 'text-slate-300 group-hover:text-white'}`}>
                      Overview
                   </span>
                </button>
                
                {/* Right Side: Dropdown (Text Trigger) */}
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className={activeTab !== 'overview'
                        ? "bg-yellow-400 border-2 sm:border-[3px] border-white rounded-[1.5rem] shadow-[0_3px_0_0_#ca8a04] sm:shadow-[0_4px_0_0_#ca8a04] px-2 sm:px-5 py-2.5 flex items-center justify-center gap-1 select-none z-50 transition-transform active:translate-y-[3px] sm:active:translate-y-[4px] active:shadow-none sm:active:shadow-none data-[state=open]:translate-y-[3px] sm:data-[state=open]:translate-y-[4px] data-[state=open]:shadow-none sm:data-[state=open]:shadow-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 group flex-1 min-w-[120px]"
                        : "border-2 sm:border-[3px] border-transparent flex items-center gap-1 px-2 sm:px-5 py-2.5 active:opacity-70 transition-transform outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 select-none group justify-center hover:bg-white/10 rounded-[1.5rem] cursor-pointer flex-1 min-w-[100px]"
                      }
                    >
                       <span className={`font-black tracking-widest uppercase text-[10px] sm:text-xs pt-0.5 truncate drop-shadow-sm ${activeTab !== 'overview' ? 'text-slate-900 drop-shadow-none' : 'text-slate-300 group-hover:text-white'}`}>
                          {activeTab === 'overview' ? 'Menu' : activeTab === 'barangay' ? 'By Barangay' : activeTab === 'demographics' ? 'Demographics' : 'Data Gaps'}
                       </span>
                       <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-data-[state=open]:rotate-180 drop-shadow-sm shrink-0 ${activeTab !== 'overview' ? 'text-slate-900 drop-shadow-none' : 'text-slate-300 group-hover:text-white'}`} strokeWidth={3} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" alignOffset={0} side="bottom" sideOffset={12} avoidCollisions={false} className="w-[180px] sm:w-[220px] rounded-[1.25rem] border-4 border-slate-200 shadow-[0_8px_0_0_#cbd5e1] p-2 font-black uppercase tracking-wider text-[11px] sm:text-sm text-slate-600 bg-white z-[100] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=top]:slide-in-from-bottom-2">
                     <DropdownMenuItem onClick={() => setActiveTab('barangay')} className="py-3 px-3 sm:px-4 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors focus:bg-slate-100 active:scale-95 active:bg-slate-200 mb-1 text-slate-700 outline-none flex items-center justify-between">
                       By Barangay
                       {activeTab === 'barangay' && <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-yellow-500 shrink-0" />}
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => setActiveTab('demographics')} className="py-3 px-3 sm:px-4 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors focus:bg-slate-100 active:scale-95 active:bg-slate-200 mb-1 text-slate-700 outline-none flex items-center justify-between">
                       Demographics
                       {activeTab === 'demographics' && <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-yellow-500 shrink-0" />}
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => setActiveTab('knowledge')} className="py-3 px-3 sm:px-4 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors focus:bg-slate-100 active:scale-95 active:bg-slate-200 mb-1 text-slate-700 outline-none flex items-center justify-between">
                       Knowledge Gaps
                       {activeTab === 'knowledge' && <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-yellow-500 shrink-0" />}
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => setActiveTab('schools')} className="py-3 px-3 sm:px-4 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors focus:bg-slate-100 active:scale-95 active:bg-slate-200 mb-1 text-slate-700 outline-none flex items-center justify-between">
                       Schools
                       {activeTab === 'schools' && <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-yellow-500 shrink-0" />}
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => setActiveTab('feedback')} className="py-3 px-3 sm:px-4 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors focus:bg-slate-100 active:scale-95 active:bg-slate-200 text-slate-700 outline-none flex items-center justify-between">
                       Feedback
                       {activeTab === 'feedback' && <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-yellow-500 shrink-0" />}
                     </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer to prevent content from hiding behind the fixed header */}
        <div className="h-[200px] sm:h-[200px]" aria-hidden="true" />
        
        <div className="w-full max-w-7xl mx-auto px-4 py-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Overview Tab */}
          <TabsContent value="overview">
            {summary && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] sm:border-b-[6px] p-5 sm:p-6 relative overflow-hidden group hover:-translate-y-1 transition-all flex flex-col justify-between">
                    <div className="absolute -right-6 -top-6 w-20 h-20 sm:w-24 sm:h-24 bg-blue-100 rounded-full blur-2xl group-hover:bg-blue-200 transition-colors"></div>
                    <div className="flex justify-between items-start mb-2 sm:mb-6 relative z-10">
                      <span className="font-extrabold text-slate-500 uppercase tracking-tight sm:tracking-wider text-[11px] sm:text-sm leading-tight">Total Users</span>
                      <div className="p-2 sm:p-3 bg-blue-50 rounded-xl sm:rounded-2xl text-blue-500 shadow-sm border sm:border-2 border-blue-100 shrink-0">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5}/>
                      </div>
                    </div>
                    <div className="relative z-10 mt-2 sm:mt-0">
                      <div className="text-4xl sm:text-5xl font-black text-slate-800 drop-shadow-sm leading-none">{summary.totalUsers}</div>
                      <p className="font-bold text-slate-400 mt-1.5 text-[11px] sm:text-sm leading-tight">{summary.profilesCompleted} profiles</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] sm:border-b-[6px] p-5 sm:p-6 relative overflow-hidden group hover:-translate-y-1 transition-all flex flex-col justify-between">
                    <div className="absolute -right-6 -top-6 w-20 h-20 sm:w-24 sm:h-24 bg-orange-100 rounded-full blur-2xl group-hover:bg-orange-200 transition-colors"></div>
                    <div className="flex justify-between items-start mb-2 sm:mb-6 relative z-10">
                      <span className="font-extrabold text-slate-500 uppercase tracking-tight sm:tracking-wider text-[11px] sm:text-sm leading-tight">Pre-Tests Taken</span>
                      <div className="p-2 sm:p-3 bg-orange-50 rounded-xl sm:rounded-2xl text-orange-500 shadow-sm border sm:border-2 border-orange-100 shrink-0">
                        <ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5}/>
                      </div>
                    </div>
                    <div className="relative z-10 mt-2 sm:mt-0">
                      <div className="text-4xl sm:text-5xl font-black text-slate-800 drop-shadow-sm leading-none">{summary.preTestsTaken}</div>
                      <p className="font-bold text-slate-400 mt-1.5 text-[11px] sm:text-sm leading-tight">Avg score: {summary.averagePreTestScore}/15</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] sm:border-b-[6px] p-5 sm:p-6 relative overflow-hidden group hover:-translate-y-1 transition-all flex flex-col justify-between">
                    <div className="absolute -right-6 -top-6 w-20 h-20 sm:w-24 sm:h-24 bg-emerald-100 rounded-full blur-2xl group-hover:bg-emerald-200 transition-colors"></div>
                    <div className="flex justify-between items-start mb-2 sm:mb-6 relative z-10">
                      <span className="font-extrabold text-slate-500 uppercase tracking-tight sm:tracking-wider text-[11px] sm:text-sm leading-tight">Post-Tests Taken</span>
                      <div className="p-2 sm:p-3 bg-emerald-50 rounded-xl sm:rounded-2xl text-emerald-500 shadow-sm border sm:border-2 border-emerald-100 shrink-0">
                        <Award className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5}/>
                      </div>
                    </div>
                    <div className="relative z-10 mt-2 sm:mt-0">
                      <div className="text-4xl sm:text-5xl font-black text-slate-800 drop-shadow-sm leading-none">{summary.postTestsTaken}</div>
                      <p className="font-bold text-slate-400 mt-1.5 text-[11px] sm:text-sm leading-tight">Avg score: {summary.averagePostTestScore}/15</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] sm:border-b-[6px] p-5 sm:p-6 relative overflow-hidden group hover:-translate-y-1 transition-all flex flex-col justify-between">
                    <div className="absolute -right-6 -top-6 w-20 h-20 sm:w-24 sm:h-24 bg-red-100 rounded-full blur-2xl group-hover:bg-red-200 transition-colors"></div>
                    <div className="flex justify-between items-start mb-2 sm:mb-6 relative z-10">
                      <span className="font-extrabold text-slate-500 uppercase tracking-tight sm:tracking-wider text-[11px] sm:text-sm leading-tight">Avg Improv.</span>
                      <div className="p-2 sm:p-3 bg-red-50 rounded-xl sm:rounded-2xl text-red-500 shadow-sm border sm:border-2 border-red-100 shrink-0">
                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5}/>
                      </div>
                    </div>
                    <div className="relative z-10 mt-2 sm:mt-0">
                      <div className={`text-4xl sm:text-5xl font-black drop-shadow-sm leading-none ${summary.averageImprovement >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {summary.averageImprovement >= 0 ? "+" : ""}{summary.averageImprovement}
                      </div>
                      <p className="font-bold text-slate-400 mt-1.5 text-[11px] sm:text-sm leading-tight">points improved</p>
                    </div>
                  </div>
                </div>

                {/* Engagement Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] sm:border-b-[6px] p-4 sm:p-6 relative overflow-hidden group hover:-translate-y-1 transition-all col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                      <div className="p-2 sm:p-2.5 bg-purple-100 rounded-lg sm:rounded-xl text-purple-600 shadow-sm border sm:border-2 border-purple-200">
                        <Target className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
                      </div>
                      <span className="font-extrabold text-slate-500 uppercase tracking-tight sm:tracking-wider text-[12px] sm:text-sm">Total Points</span>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <span className="text-3xl sm:text-4xl font-black text-slate-800 drop-shadow-sm leading-none">{summary.totalEngagementPoints.toLocaleString()}</span>
                      <p className="font-bold text-slate-400 mt-1 sm:mt-2 text-[11px] sm:text-sm">Avg {summary.avgEngagementPerUser} per user</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] sm:border-b-[6px] p-4 sm:p-6 relative overflow-hidden group hover:-translate-y-1 transition-all">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                      <div className="p-2 sm:p-2.5 bg-yellow-100 rounded-lg sm:rounded-xl text-yellow-600 shadow-sm border sm:border-2 border-yellow-200">
                        <Clock className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
                      </div>
                      <span className="font-extrabold text-slate-500 uppercase tracking-tight sm:tracking-wider text-[12px] sm:text-sm">Active Today</span>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <span className="text-3xl sm:text-4xl font-black text-slate-800 drop-shadow-sm leading-none">{summary.activeUsersToday}</span>
                      <p className="font-bold text-slate-400 mt-1 sm:mt-2 text-[11px] sm:text-sm">activities today</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] sm:border-b-[6px] p-4 sm:p-6 relative overflow-hidden group hover:-translate-y-1 transition-all">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                      <div className="p-2 sm:p-2.5 bg-emerald-100 rounded-lg sm:rounded-xl text-emerald-600 shadow-sm border sm:border-2 border-emerald-200">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
                      </div>
                      <span className="font-extrabold text-slate-500 uppercase tracking-tight sm:tracking-wider text-[12px] sm:text-sm">This Week</span>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <span className="text-3xl sm:text-4xl font-black text-slate-800 drop-shadow-sm leading-none">{summary.activeUsersThisWeek}</span>
                      <p className="font-bold text-slate-400 mt-1 sm:mt-2 text-[11px] sm:text-sm">unique users</p>
                    </div>
                  </div>
                </div>

                {/* Completion Funnel Replacement */}
                <div className="mb-6 space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 mb-3 mt-8">
                    <Target className="h-6 w-6 text-indigo-500" strokeWidth={3} />
                    <h3 className="font-black text-slate-700 text-lg uppercase tracking-tight">User Journey Funnel</h3>
                  </div>
                  
                  {/* Step 1 */}
                  <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] sm:border-b-[6px] p-4 sm:p-5 relative overflow-hidden flex items-center gap-4 group hover:-translate-y-1 transition-all">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 border-blue-200 shadow-inner">
                      <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" strokeWidth={2.5}/>
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-slate-800 text-base sm:text-xl leading-tight">Registered Users</div>
                      <div className="font-bold text-slate-400 text-[10px] sm:text-sm mt-0.5">Total platform adoption</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl sm:text-4xl font-black text-blue-600 drop-shadow-sm leading-none">{summary?.totalUsers || 0}</div>
                      <div className="font-bold text-slate-400 text-[10px] sm:text-xs mt-1 bg-slate-100 px-2 py-0.5 rounded-full inline-block">100% Core Base</div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] sm:border-b-[6px] p-4 sm:p-5 relative overflow-hidden flex items-center gap-4 group hover:-translate-y-1 transition-all">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 border-orange-200 shadow-inner">
                      <ClipboardCheck className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" strokeWidth={2.5}/>
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-slate-800 text-base sm:text-xl leading-tight">Profiles & Pre-Test</div>
                      <div className="font-bold text-slate-400 text-[10px] sm:text-sm mt-0.5">Initial assessment completion</div>
                      {/* Thick visual progress bar */}
                      <div className="w-full h-2.5 sm:h-3 bg-slate-100 rounded-full mt-2 sm:mt-3 overflow-hidden border border-slate-200">
                        <div 
                          className="h-full bg-orange-400 rounded-full transition-all duration-1000" 
                          style={{ width: `${(summary?.totalUsers || 0) > 0 ? ((summary?.profilesCompleted || 0) / (summary?.totalUsers || 1)) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="text-2xl sm:text-4xl font-black text-orange-600 drop-shadow-sm leading-none">{summary?.profilesCompleted || 0}</div>
                      <div className="font-extrabold text-orange-500 text-[10px] sm:text-xs mt-1 bg-orange-50 px-2 py-0.5 rounded-full inline-block border border-orange-100">
                        {(summary?.totalUsers || 0) > 0 ? Math.round(((summary?.profilesCompleted || 0) / (summary?.totalUsers || 1)) * 100) : 0}% Conv.
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] sm:border-b-[6px] p-4 sm:p-5 relative overflow-hidden flex items-center gap-4 group hover:-translate-y-1 transition-all">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 border-emerald-200 shadow-inner">
                      <Award className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500" strokeWidth={2.5}/>
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-slate-800 text-base sm:text-xl leading-tight">Post-Test Graduates</div>
                      <div className="font-bold text-slate-400 text-[10px] sm:text-sm mt-0.5">Final learning validation</div>
                      {/* Thick visual progress bar */}
                      <div className="w-full h-2.5 sm:h-3 bg-slate-100 rounded-full mt-2 sm:mt-3 overflow-hidden border border-slate-200">
                        <div 
                          className="h-full bg-emerald-400 rounded-full transition-all duration-1000" 
                          style={{ width: `${(summary?.totalUsers || 0) > 0 ? ((summary?.postTestsTaken || 0) / (summary?.totalUsers || 1)) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="text-2xl sm:text-4xl font-black text-emerald-600 drop-shadow-sm leading-none">{summary?.postTestsTaken || 0}</div>
                      <div className="font-extrabold text-emerald-500 text-[10px] sm:text-xs mt-1 bg-emerald-50 px-2 py-0.5 rounded-full inline-block border border-emerald-100">
                        {(summary?.totalUsers || 0) > 0 ? Math.round(((summary?.postTestsTaken || 0) / (summary?.totalUsers || 1)) * 100) : 0}% Conv.
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </TabsContent>

          {/* Barangay Tab */}
          <TabsContent value="barangay" className="mt-4 sm:mt-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] sm:border-b-[6px] p-5 sm:p-8 relative overflow-hidden group hover:-translate-y-1 transition-all flex flex-col">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="p-2.5 sm:p-3 bg-orange-100 rounded-xl sm:rounded-2xl text-orange-600 border-2 border-orange-200 shadow-sm shrink-0">
                    <MapPin className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg sm:text-2xl uppercase tracking-tight leading-none">Users by Barangay</h3>
                    <p className="font-bold text-slate-400 text-xs sm:text-sm mt-1 sm:mt-1.5 uppercase tracking-wide">Distribution of users across Santa Cruz, Laguna barangays</p>
                  </div>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  {(Array.isArray(barangayData) ? barangayData : []).filter(b => b.userCount > 0).map((b) => (
                    <div key={b.barangay} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-5 bg-slate-50 rounded-xl sm:rounded-[1.5rem] border-2 border-slate-100 transition-colors hover:bg-slate-100">
                      <div className="w-full sm:w-56 text-sm sm:text-base font-black text-slate-700 uppercase tracking-tight truncate">{b.barangay}</div>
                      <div className="flex-1 w-full flex items-center gap-3 sm:gap-4">
                        <div className="w-full h-3 sm:h-5 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                           <div className="h-full bg-orange-400 rounded-full transition-all duration-1000" style={{ width: `${(b.userCount / maxBarangayUsers) * 100}%` }} />
                        </div>
                        <div className="w-12 sm:w-16 text-right font-black text-slate-800 text-base sm:text-lg">{b.userCount}</div>
                      </div>
                    </div>
                  ))}
                  {((Array.isArray(barangayData) ? barangayData : []).filter(b => (b.userCount || 0) > 0).length === 0) && (
                    <p className="text-center text-slate-400 font-bold py-8 text-sm">No barangay data available yet</p>
                  )}
                </div>
              </div>

              {/* Score Analytics — Mobile-Friendly Cards */}
              <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] sm:border-b-[6px] p-5 sm:p-8 relative overflow-hidden flex flex-col">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="p-2.5 sm:p-3 bg-blue-100 rounded-xl sm:rounded-2xl text-blue-600 border-2 border-blue-200 shadow-sm shrink-0">
                    <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg sm:text-2xl uppercase tracking-tight leading-none">Pre-Test vs Post-Test Scores by Barangay</h3>
                    <p className="font-bold text-slate-400 text-xs sm:text-sm mt-1 sm:mt-1.5 uppercase tracking-wide">Average assessment scores comparison</p>
                  </div>
                </div>

                {/* Desktop: Table layout */}
                <div className="hidden lg:block">
                  <table className="w-full text-sm border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-slate-400 uppercase tracking-widest text-xs font-black">
                        <th className="text-left px-6">Barangay</th>
                        <th className="text-center px-4">Users</th>
                        <th className="text-center px-4">Avg Pre-Test</th>
                        <th className="text-center px-4">Avg Post-Test</th>
                        <th className="text-center px-6">Improvement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(barangayData) ? barangayData : []).filter(b => (b.userCount || 0) > 0).map((b) => (
                        <tr key={b.barangay} className="bg-slate-50 border-2 border-slate-100 transition-colors hover:bg-slate-100">
                          <td className="py-5 px-6 font-black uppercase tracking-tight text-slate-700 rounded-l-[1.5rem] border-y-2 border-l-2 border-slate-100 text-sm">{b.barangay}</td>
                          <td className="py-5 px-4 text-center font-bold text-slate-500 border-y-2 border-slate-100 text-lg tabular-nums">{b.userCount}</td>
                          <td className="py-5 px-4 text-center border-y-2 border-slate-100">
                            <span className="bg-orange-100 text-orange-600 border-2 border-orange-200 px-4 py-2 rounded-full font-black text-sm">
                              {b.avgPreTestScore}/15
                            </span>
                          </td>
                          <td className="py-5 px-4 text-center border-y-2 border-slate-100">
                            <span className="bg-emerald-100 text-emerald-600 border-2 border-emerald-200 px-4 py-2 rounded-full font-black text-sm">
                              {b.avgPostTestScore}/15
                            </span>
                          </td>
                          <td className="py-5 px-6 text-center rounded-r-[1.5rem] border-y-2 border-r-2 border-slate-100">
                            <span className={`font-black text-base px-4 py-2 rounded-full border-2 ${b.avgImprovement >= 0 ? 'bg-green-100 text-green-700 border-green-200 shadow-sm' : 'bg-red-100 text-red-700 border-red-200 shadow-sm'}`}>
                              {b.avgImprovement >= 0 ? "+" : ""}{b.avgImprovement}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {((Array.isArray(barangayData) ? barangayData : []).filter(b => (b.userCount || 0) > 0).length === 0) && (
                    <p className="text-center text-slate-400 font-bold py-8 text-sm">No data available</p>
                  )}
                </div>

                {/* Mobile: Card layout */}
                <div className="lg:hidden space-y-3">
                  {(Array.isArray(barangayData) ? barangayData : []).filter(b => (b.userCount || 0) > 0).map((b) => (
                    <div key={b.barangay} className="bg-slate-50 rounded-xl border-2 border-slate-100 p-4 transition-colors hover:bg-slate-100">
                      <div className="font-black text-slate-700 uppercase tracking-tight text-sm mb-3">{b.barangay}</div>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="flex flex-col items-center bg-white rounded-xl border-2 border-slate-200 border-b-[3px] p-2.5">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Users</span>
                          <span className="text-lg font-black text-slate-700 tabular-nums leading-none">{b.userCount}</span>
                        </div>
                        <div className="flex flex-col items-center bg-orange-50 rounded-xl border-2 border-orange-200 border-b-[3px] p-2.5">
                          <span className="text-[9px] font-extrabold text-orange-400 uppercase tracking-wider mb-1">Pre</span>
                          <span className="text-base font-black text-orange-600 tabular-nums leading-none">{b.avgPreTestScore}/15</span>
                        </div>
                        <div className="flex flex-col items-center bg-emerald-50 rounded-xl border-2 border-emerald-200 border-b-[3px] p-2.5">
                          <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-wider mb-1">Post</span>
                          <span className="text-base font-black text-emerald-600 tabular-nums leading-none">{b.avgPostTestScore}/15</span>
                        </div>
                        <div className={`flex flex-col items-center rounded-xl border-2 border-b-[3px] p-2.5 ${b.avgImprovement >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                          <span className={`text-[9px] font-extrabold uppercase tracking-wider mb-1 ${b.avgImprovement >= 0 ? 'text-green-400' : 'text-red-400'}`}>Improv</span>
                          <span className={`text-lg font-black tabular-nums leading-none ${b.avgImprovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {b.avgImprovement >= 0 ? "+" : ""}{b.avgImprovement}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {((Array.isArray(barangayData) ? barangayData : []).filter(b => (b.userCount || 0) > 0).length === 0) && (
                    <p className="text-center text-slate-400 font-bold py-8 text-sm">No data available</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          {/* Demographics Tab */}
          <TabsContent value="demographics" className="mt-4 sm:mt-6">
            {demographicData && (
              <div className="grid grid-cols-2 gap-3 sm:gap-6">
                
                {/* Gender */}
                <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] sm:border-b-[6px] p-5 sm:p-6 lg:p-8 relative overflow-hidden group hover:-translate-y-1 transition-all flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 sm:p-2.5 bg-pink-100 rounded-lg sm:rounded-xl text-pink-600 border sm:border-2 border-pink-200 shadow-sm shrink-0">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
                    </div>
                    <h3 className="font-extrabold text-slate-700 text-xs sm:text-sm uppercase tracking-tight leading-tight">Gender</h3>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-5 flex-1">
                    {Object.entries(demographicData?.gender || ({} as Record<string, number>)).map(([gender, count]) => {
                      const total = Object.values(demographicData?.gender || ({} as Record<string, number>)).reduce((a: number, b: number) => a + b, 0) as number
                      const percentage = total > 0 ? Math.round(((count as number) / total) * 100) : 0
                      return (
                        <div key={gender} className="w-full">
                          <div className="flex justify-between items-end mb-1.5 sm:mb-2">
                            <span className="font-bold text-slate-700 text-[11px] sm:text-sm leading-none">{gender}</span>
                            <span className="font-black text-slate-500 text-[11px] sm:text-sm leading-none">{percentage}%</span>
                          </div>
                          <div className="w-full h-3 sm:h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div className="h-full bg-pink-400 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
                          </div>
                          <p className="text-right text-slate-400 font-bold text-[10px] sm:text-[11px] mt-1 sm:mt-1.5">{count} users</p>
                        </div>
                      )
                    })}
                    {Object.keys(demographicData.gender).length === 0 && (
                      <p className="text-center text-slate-400 font-bold py-4 text-xs">No data</p>
                    )}
                  </div>
                </div>

                {/* Age Groups */}
                <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] sm:border-b-[6px] p-5 sm:p-6 lg:p-8 relative overflow-hidden group hover:-translate-y-1 transition-all flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 sm:p-2.5 bg-purple-100 rounded-lg sm:rounded-xl text-purple-600 border sm:border-2 border-purple-200 shadow-sm shrink-0">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
                    </div>
                    <h3 className="font-extrabold text-slate-700 text-xs sm:text-sm uppercase tracking-tight leading-tight">Age Groups</h3>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-5 flex-1">
                    {Object.entries(demographicData?.ageGroups || ({} as Record<string, number>))
                      .filter(([_, count]) => (count as number) > 0)
                      .map(([age, count]) => {
                        const total = Object.values(demographicData?.ageGroups || ({} as Record<string, number>)).reduce((a: number, b: number) => a + b, 0) as number
                        const percentage = total > 0 ? Math.round(((count as number) / total) * 100) : 0
                        return (
                          <div key={age} className="w-full">
                            <div className="flex justify-between items-end mb-1.5 sm:mb-2">
                              <span className="font-bold text-slate-700 text-[11px] sm:text-sm leading-none">{age}</span>
                              <span className="font-black text-slate-500 text-[11px] sm:text-sm leading-none">{percentage}%</span>
                            </div>
                            <div className="w-full h-3 sm:h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                              <div className="h-full bg-purple-400 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
                            </div>
                            <p className="text-right text-slate-400 font-bold text-[10px] sm:text-[11px] mt-1 sm:mt-1.5">{count} users</p>
                          </div>
                        )
                      })}
                    {Object.values(demographicData.ageGroups).every(v => v === 0) && (
                      <p className="text-center text-slate-400 font-bold py-4 text-xs">No data</p>
                    )}
                  </div>
                </div>

                {/* Occupations */}
                <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] sm:border-b-[6px] p-5 sm:p-6 lg:p-8 relative overflow-hidden group hover:-translate-y-1 transition-all flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 sm:p-2.5 bg-emerald-100 rounded-lg sm:rounded-xl text-emerald-600 border sm:border-2 border-emerald-200 shadow-sm shrink-0">
                      <Briefcase className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
                    </div>
                    <h3 className="font-extrabold text-slate-700 text-xs sm:text-sm uppercase tracking-tight leading-tight">Occupations</h3>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-5 flex-1">
                    {Object.entries(demographicData?.occupations || ({} as Record<string, number>))
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .slice(0, 5) // Limit to top 5 to prevent massive 2x2 cards
                      .map(([occupation, count]) => {
                        const total = Object.values(demographicData?.occupations || ({} as Record<string, number>)).reduce((a: number, b: number) => a + b, 0) as number
                        const percentage = total > 0 ? Math.round(((count as number) / total) * 100) : 0
                        return (
                          <div key={occupation} className="w-full">
                            <div className="flex justify-between items-start gap-2 mb-1.5 sm:mb-2">
                              <span className="font-bold text-slate-700 text-[11px] sm:text-sm leading-snug break-words flex-1">{occupation}</span>
                              <span className="font-black text-slate-500 text-[11px] sm:text-sm leading-none shrink-0">{percentage}%</span>
                            </div>
                            <div className="w-full h-3 sm:h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                              <div className="h-full bg-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
                            </div>
                            <p className="text-right text-slate-400 font-bold text-[10px] sm:text-[11px] mt-1 sm:mt-1.5">{count} adults</p>
                          </div>
                        )
                      })}
                    {Object.keys(demographicData.occupations).length === 0 && (
                      <p className="text-center text-slate-400 font-bold py-4 text-xs">No data</p>
                    )}
                  </div>
                </div>

                {/* Schools */}
                <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] sm:border-b-[6px] p-5 sm:p-6 lg:p-8 relative overflow-hidden group hover:-translate-y-1 transition-all flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 sm:p-2.5 bg-sky-100 rounded-lg sm:rounded-xl text-sky-600 border sm:border-2 border-sky-200 shadow-sm shrink-0">
                      <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
                    </div>
                    <h3 className="font-extrabold text-slate-700 text-xs sm:text-sm uppercase tracking-tight leading-tight">Schools</h3>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-5 flex-1">
                    {Object.entries(demographicData?.schools || ({} as Record<string, number>))
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .slice(0, 5) // Limit to top 5
                      .map(([school, count]) => {
                        const total = Object.values(demographicData?.schools || ({} as Record<string, number>)).reduce((a: number, b: number) => a + b, 0) as number
                        const percentage = total > 0 ? Math.round(((count as number) / total) * 100) : 0
                        return (
                          <div key={school} className="w-full">
                            <div className="flex justify-between items-start gap-2 mb-1.5 sm:mb-2">
                              <span className="font-bold text-slate-700 text-[11px] sm:text-sm leading-snug break-words flex-1">{school}</span>
                              <span className="font-black text-slate-500 text-[11px] sm:text-sm leading-none shrink-0">{percentage}%</span>
                            </div>
                            <div className="w-full h-3 sm:h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                              <div className="h-full bg-sky-400 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
                            </div>
                            <p className="text-right text-slate-400 font-bold text-[10px] sm:text-[11px] mt-1 sm:mt-1.5">{count} kids</p>
                          </div>
                        )
                      })}
                    {Object.keys(demographicData.schools).length === 0 && (
                      <p className="text-center text-slate-400 font-bold py-4 text-xs">No data</p>
                    )}
                  </div>
                </div>

              </div>
            )}
          </TabsContent>

          {/* Knowledge Gaps Tab */}
          <TabsContent value="knowledge" className="mt-4 sm:mt-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] sm:border-b-[6px] p-5 sm:p-8 lg:p-8 relative overflow-hidden flex flex-col">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="p-2.5 sm:p-3 bg-orange-100 rounded-xl sm:rounded-2xl text-orange-600 border-2 border-orange-200 shadow-sm shrink-0">
                    <Flame className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg sm:text-2xl uppercase tracking-tight leading-none">Knowledge Gap Analysis</h3>
                    <p className="font-bold text-slate-400 text-xs sm:text-sm mt-1 sm:mt-1.5 uppercase tracking-wide">Areas where users struggle most (sorted by lowest scores first)</p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {(Array.isArray(knowledgeData) ? knowledgeData : []).map((k) => (
                    <div key={k.category} className="bg-slate-50 rounded-xl sm:rounded-2xl border-2 border-slate-100 p-4 sm:p-5 lg:p-6 transition-colors hover:bg-slate-100">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <span className="font-black text-slate-700 text-sm sm:text-base uppercase tracking-tight">{k.category}</span>
                        <span className={`font-black text-xs sm:text-sm px-3 sm:px-4 py-1.5 rounded-full border-2 ${
                          k.avgScore >= 70 
                            ? 'bg-green-100 text-green-700 border-green-200' 
                            : k.avgScore >= 50 
                              ? 'bg-yellow-100 text-yellow-700 border-yellow-200' 
                              : 'bg-red-100 text-red-700 border-red-200'
                        }`}>
                          {k.avgScore}% correct
                        </span>
                      </div>
                      <div className="w-full h-3 sm:h-4 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            k.avgScore >= 70 ? "bg-green-400" : k.avgScore >= 50 ? "bg-yellow-400" : "bg-red-400"
                          }`}
                          style={{ width: `${k.avgScore}%`, minWidth: "4px" }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-3 sm:gap-5 mt-2.5 sm:mt-3">
                        <span className="font-bold text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider">Questions: {k.totalQuestions}</span>
                        <span className="font-bold text-emerald-400 text-[10px] sm:text-xs uppercase tracking-wider">Correct: {k.correctAnswers}</span>
                        <span className="font-bold text-red-400 text-[10px] sm:text-xs uppercase tracking-wider">Incorrect: {k.incorrectAnswers}</span>
                      </div>
                    </div>
                  ))}
                  {knowledgeData.length === 0 && (
                    <p className="text-center text-slate-400 font-bold py-8 text-sm">No assessment data available yet</p>
                  )}
                </div>

                {knowledgeData.length > 0 && (
                  <div className="mt-6 sm:mt-8 bg-orange-50 rounded-xl sm:rounded-2xl border-2 border-orange-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="h-5 w-5 text-orange-500" strokeWidth={2.5} />
                      <h4 className="font-black text-orange-700 text-sm sm:text-base uppercase tracking-tight">Insights</h4>
                    </div>
                    <div className="space-y-2">
                      {(Array.isArray(knowledgeData) ? knowledgeData : []).filter(k => (k.avgScore || 0) < 50).length > 0 && (
                        <p className="font-bold text-orange-600 text-xs sm:text-sm">
                          <span className="text-orange-800">Priority Focus Areas:</span>{" "}
                          {(Array.isArray(knowledgeData) ? knowledgeData : []).filter(k => (k.avgScore || 0) < 50).map(k => k.category).join(", ")}
                        </p>
                      )}
                      {(Array.isArray(knowledgeData) ? knowledgeData : []).filter(k => (k.avgScore || 0) >= 70).length > 0 && (
                        <p className="font-bold text-emerald-600 text-xs sm:text-sm">
                          <span className="text-emerald-800">Strong Knowledge Areas:</span>{" "}
                          {(Array.isArray(knowledgeData) ? knowledgeData : []).filter(k => (k.avgScore || 0) >= 70).map(k => k.category).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Per-School Analytics Tab */}
          <TabsContent value="schools" className="mt-4 sm:mt-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Summary Cards */}
              {schoolAnalytics?.summary && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                  <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] p-4 sm:p-5 hover:-translate-y-1 transition-all">
                    <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs">Schools</span>
                    <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">{schoolAnalytics.summary.totalSchools}</div>
                  </div>
                  <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] p-4 sm:p-5 hover:-translate-y-1 transition-all">
                    <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs">Students</span>
                    <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">{schoolAnalytics.summary.totalStudents}</div>
                  </div>
                  <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] p-4 sm:p-5 hover:-translate-y-1 transition-all">
                    <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs">Avg Pre-Test</span>
                    <div className="text-2xl sm:text-3xl font-black text-orange-500 mt-1">{schoolAnalytics.summary.overallAvgPreTest}</div>
                  </div>
                  <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] p-4 sm:p-5 hover:-translate-y-1 transition-all">
                    <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs">Avg Post-Test</span>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-500 mt-1">{schoolAnalytics.summary.overallAvgPostTest}</div>
                  </div>
                  <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] p-4 sm:p-5 hover:-translate-y-1 transition-all col-span-2 lg:col-span-1">
                    <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs">Completion Rate</span>
                    <div className="text-2xl sm:text-3xl font-black text-blue-500 mt-1">{schoolAnalytics.summary.overallCompletionRate}%</div>
                  </div>
                </div>
              )}

              {/* School Leaderboard */}
              <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] sm:border-b-[6px] p-5 sm:p-8">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="p-2.5 sm:p-3 bg-sky-100 rounded-xl sm:rounded-2xl text-sky-600 border-2 border-sky-200 shadow-sm shrink-0">
                    <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg sm:text-2xl uppercase tracking-tight leading-none">School Leaderboard</h3>
                    <p className="font-bold text-slate-400 text-xs sm:text-sm mt-1 sm:mt-1.5 uppercase tracking-wide">Ranked by average post-test score</p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {(schoolAnalytics?.schools || []).map((school: any, index: number) => (
                    <div key={school.id} className="bg-slate-50 rounded-xl sm:rounded-2xl border-2 border-slate-100 p-4 sm:p-5 transition-colors hover:bg-slate-100">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl border-2 border-b-[3px] shrink-0 ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                          index === 1 ? 'bg-slate-100 text-slate-600 border-slate-300' :
                          index === 2 ? 'bg-orange-100 text-orange-700 border-orange-300' :
                          'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-black text-slate-700 text-sm sm:text-base uppercase tracking-tight truncate">{school.name}</div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-bold text-[10px] sm:text-xs">
                              {school.totalStudents} students
                            </span>
                            <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full font-bold text-[10px] sm:text-xs capitalize">
                              {school.type}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 mt-3">
                            <div className="bg-orange-50 rounded-lg border border-orange-200 p-2 text-center">
                              <div className="text-[9px] font-extrabold text-orange-400 uppercase tracking-tighter">Pre-Test</div>
                              <div className="text-[13px] sm:text-sm font-black text-orange-600">{school.averagePreTestScore}</div>
                            </div>
                            <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-2 text-center">
                              <div className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-tighter">Post-Test</div>
                              <div className="text-[13px] sm:text-sm font-black text-emerald-600">{school.averagePostTestScore}</div>
                            </div>
                            <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-2 text-center">
                              <div className="text-[9px] font-extrabold text-yellow-500 uppercase tracking-tighter">Increase</div>
                              <div className="text-[13px] sm:text-sm font-black text-yellow-600">
                                {school.averagePreTestScore > 0 ? `+${Math.round(((school.averagePostTestScore - school.averagePreTestScore) / school.averagePreTestScore) * 100)}%` : '+0%'}
                              </div>
                            </div>
                            <div className="bg-blue-50 rounded-lg border border-blue-200 p-2 text-center">
                              <div className="text-[9px] font-extrabold text-blue-400 uppercase tracking-tighter">Complete</div>
                              <div className="text-[13px] sm:text-sm font-black text-blue-600">{school.averageCompletionRate}%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!schoolAnalytics?.schools || schoolAnalytics.schools.length === 0) && (
                    <p className="text-center text-slate-400 font-bold py-8 text-sm">No school data available yet</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* User Feedback Analytics Tab */}
          <TabsContent value="feedback" className="mt-4 sm:mt-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Feedback Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] p-5 sm:p-6 hover:-translate-y-1 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-yellow-100 rounded-xl text-yellow-600 border-2 border-yellow-200 shrink-0">
                      <Star className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                    <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[11px] sm:text-xs">Avg Rating</span>
                  </div>
                  <div className="text-4xl sm:text-5xl font-black text-yellow-500">{feedbackAnalytics?.overallAverage || 0}<span className="text-lg text-slate-400">/5</span></div>
                </div>
                <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] p-5 sm:p-6 hover:-translate-y-1 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-blue-100 rounded-xl text-blue-600 border-2 border-blue-200 shrink-0">
                      <MessageSquare className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                    <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[11px] sm:text-xs">Total Feedback</span>
                  </div>
                  <div className="text-4xl sm:text-5xl font-black text-slate-800">{feedbackAnalytics?.totalFeedback || 0}</div>
                </div>
                <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] p-5 sm:p-6 hover:-translate-y-1 transition-all col-span-2 lg:col-span-1">
                  <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[11px] sm:text-xs">Rating Distribution</span>
                  <div className="mt-3 space-y-1.5">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = feedbackAnalytics?.ratingDistribution?.[star] || 0
                      const total = feedbackAnalytics?.totalFeedback || 1
                      const pct = Math.round((count / total) * 100) || 0
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="font-black text-xs text-yellow-500 w-4">{star}★</span>
                          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="font-bold text-slate-400 text-[10px] w-6 text-right">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* By Feature Type */}
              <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] sm:border-b-[6px] p-5 sm:p-8">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="p-2.5 sm:p-3 bg-purple-100 rounded-xl sm:rounded-2xl text-purple-600 border-2 border-purple-200 shadow-sm shrink-0">
                    <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg sm:text-2xl uppercase tracking-tight leading-none">Ratings by Feature</h3>
                    <p className="font-bold text-slate-400 text-xs sm:text-sm mt-1 sm:mt-1.5 uppercase tracking-wide">How users rate different features</p>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {(feedbackAnalytics?.byFeatureName || []).map((f: any) => (
                    <div key={f.featureName} className="bg-slate-50 rounded-xl sm:rounded-2xl border-2 border-slate-100 p-4 sm:p-5 transition-colors hover:bg-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-black text-slate-700 text-sm sm:text-base uppercase tracking-tight">{f.featureName}</span>
                          <span className="ml-2 bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold text-[10px] capitalize">{f.featureType}</span>
                        </div>
                        <span className="font-black text-yellow-600 text-base sm:text-lg">{f.avgRating}★</span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                        <div className="h-full bg-yellow-400 rounded-full transition-all duration-1000" style={{ width: `${(f.avgRating / 5) * 100}%` }} />
                      </div>
                      <p className="font-bold text-slate-400 text-[10px] sm:text-xs mt-1.5">{f.totalCount} reviews</p>
                    </div>
                  ))}
                  {(!feedbackAnalytics?.byFeatureName || feedbackAnalytics.byFeatureName.length === 0) && (
                    <p className="text-center text-slate-400 font-bold py-8 text-sm">No feedback data available yet. Users can submit feedback after completing modules.</p>
                  )}
                </div>
              </div>

              {/* Recent Feedback */}
              <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 border-b-[4px] sm:border-b-[6px] p-5 sm:p-8">
                <h3 className="font-black text-slate-800 text-lg sm:text-xl uppercase tracking-tight mb-4 sm:mb-6">Recent Feedback</h3>
                <div className="space-y-3">
                  {(feedbackAnalytics?.recentFeedback || []).slice(0, 10).map((fb: any) => (
                    <div key={fb.id} className="bg-slate-50 rounded-xl border-2 border-slate-100 p-4 transition-colors hover:bg-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-700 text-sm">{fb.user?.name || 'Anonymous'}</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold text-[10px]">{fb.featureName}</span>
                        <span className="text-slate-400 font-bold text-[10px]">{new Date(fb.created_at).toLocaleDateString()}</span>
                      </div>
                      {fb.comments && <p className="text-slate-500 text-xs mt-1.5 italic">"{fb.comments}"</p>}
                    </div>
                  ))}
                  {(!feedbackAnalytics?.recentFeedback || feedbackAnalytics.recentFeedback.length === 0) && (
                    <p className="text-center text-slate-400 font-bold py-8 text-sm">No feedback submitted yet</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
      </div>
    </div>
  )
}
