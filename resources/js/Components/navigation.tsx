"use client"

import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { Button } from "@/components/ui/button"
import { LogOut, User, Menu, X, Home, Users, Briefcase, Baby, Shield, Info, Settings, ChevronDown, ArrowRight, Clock, Sliders, BookOpen, Eye, Focus, Type, Zap, Sun, Moon, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { NotificationPopover } from "@/components/ui/notification-popover"
import { SettingsPanel } from "@/components/settings-panel"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/Components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select"

function TimeDisplay({ mobile = false }: { mobile?: boolean }) {
  const [currentTime, setCurrentTime] = useState<string>("")

  useEffect(() => {
    const updateTime = () => {
        const date = new Date()
        const timeStr = date.toLocaleString('en-US', {
          timeZone: 'Asia/Manila',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
        const dateStr = date.toLocaleString('en-US', {
          timeZone: 'Asia/Manila',
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
        setCurrentTime(`${dateStr} • ${timeStr}`)
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  if (mobile) {
    return (
      <p className="text-slate-200 text-[11px] leading-relaxed drop-shadow-sm font-medium">
        {currentTime.split(' • ')[0] || 'Loading date...'} <br/> {currentTime.split(' • ')[1] || '...'}
      </p>
    )
  }

  return (
    <div className="flex items-center gap-1.5 opacity-90">
      <Clock className="h-3 w-3 text-yellow-400" strokeWidth={3} />
      <p className="text-white text-[10px] font-bold uppercase tracking-wider drop-shadow-sm whitespace-nowrap">
        {currentTime || "Loading..."}
      </p>
    </div>
  )
}

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth()
  const { url } = usePage();
  const isDashboard = url === '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showAccessibilityModal, setShowAccessibilityModal] = useState(false)

  const {
    reduceMotion,
    toggleReduceMotion,
    textSize,
    setTextSize,
    isDarkMode,
    toggleDarkMode,
    dyslexiaFont,
    toggleDyslexiaFont,
    focusMode,
    toggleFocusMode,
    colorBlindness,
    setColorBlindness,
    magnifyingMouse,
    toggleMagnifyingMouse
  } = useSettings()

  const accessibleItems = [];
  if (user?.permissions?.accessProfessional) accessibleItems.push({ name: 'PROFESSIONAL', href: '/professional', active: url.startsWith('/professional') });
  if (user?.permissions?.accessAdult) accessibleItems.push({ name: 'ADULTS', href: '/adult', active: url.startsWith('/adult') });
  if (user?.permissions?.accessKids) accessibleItems.push({ name: 'KIDS', href: '/kids', active: url.startsWith('/kids') });
  if (user?.role === 'admin') accessibleItems.push({ name: 'ADMIN', href: '/admin', active: url.startsWith('/admin') });

  return (
    <nav className="bg-primary fixed inset-x-0 top-0 z-[80] shadow-md dark:shadow-none dark:border-b dark:border-black/20 transition-colors duration-500 h-16 sm:h-[4.5rem] flex items-center">
      {/* Background Image Layer - 10% opacity */}
      <div
        className="absolute inset-0 opacity-5 bg-cover bg-center"
        style={{ backgroundImage: "url('/web-background-image.jpg')" }}
      />

      {/* Content Layer - Full opacity */}
      <div className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between w-full gap-2 sm:gap-4 relative">

            {/* LEFT SECTION: Logo + Branding */}
            <div className="flex-1 flex justify-start min-w-0">
              <Link href="/" className="flex items-center gap-1.5 sm:gap-3 md:hover:opacity-90 transition-opacity cursor-pointer">
                {/* Logos */}
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <img
                    src="/bfp logo.png"
                    alt="Bureau of Fire Protection Logo"
                    width={48}
                    height={48}
                    className="rounded-full bg-white p-0.5 object-contain shadow-md w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12"
                  />
                  <img
                    src="/berong-official-logo.jpg"
                    alt="Berong E-Learning Logo"
                    width={48}
                    height={48}
                    className="rounded-full object-cover shadow-md w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 border-2 border-yellow-400/50"
                  />
                </div>

                {/* Branding - Compact on mobile */}
                <div className="min-w-0 max-w-[170px] sm:max-w-none shrink">
                  <p className="text-white font-bold text-xs leading-none sm:text-sm truncate">Berong E-Learning</p>
                  <h1 className="text-yellow-400 font-bold leading-tight text-[0.625rem] xl:text-xs hidden sm:block truncate">
                    Fire Safety Education Platform
                  </h1>
                  <p className="text-white text-[0.5625rem] xl:text-[0.625rem] hidden sm:block opacity-90 uppercase tracking-widest mt-0.5 truncate">
                    <span className="hidden xl:inline">BUREAU OF FIRE PROTECTION STA CRUZ LAGUNA</span>
                    <span className="xl:hidden">BFP Sta. Cruz</span>
                  </p>
                </div>
              </Link>
            </div>

            {/* CENTER SECTION: Navigation Links - Desktop */}
            <div className="hidden lg:flex flex-none items-center justify-center gap-2 xl:gap-6 px-2">
              <Link 
                href="/" 
                className={isDashboard 
                  ? "font-extrabold text-sm tracking-wide uppercase px-4 xl:px-5 py-1.5 rounded-full border-[3px] border-white dark:border-slate-200 bg-yellow-400 text-black shadow-[0_4px_0_#b45309] md:hover:-translate-y-0.5 md:hover:shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-none transition-none"
                  : "font-extrabold text-sm tracking-wide uppercase text-white md:hover:text-yellow-200 transition-none drop-shadow-sm py-1.5 px-2 xl:px-3 whitespace-nowrap"
                }
              >
                DASHBOARD
              </Link>
              
              {isAuthenticated && accessibleItems.length === 1 ? (
                <Link
                  href={accessibleItems[0].href}
                  className={accessibleItems[0].active
                    ? "font-extrabold text-sm tracking-wide uppercase px-4 xl:px-5 py-1.5 rounded-full border-[3px] border-white dark:border-slate-200 bg-yellow-400 text-black shadow-[0_4px_0_#b45309] md:hover:-translate-y-0.5 md:hover:shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-none transition-none flex items-center gap-1.5 whitespace-nowrap outline-none" 
                    : "font-extrabold text-sm tracking-wide uppercase text-white md:hover:text-yellow-200 transition-none drop-shadow-sm py-1.5 px-2 xl:px-3 flex items-center gap-1.5 whitespace-nowrap outline-none cursor-pointer"
                  }
                >
                  {accessibleItems[0].name}
                </Link>
              ) : isAuthenticated && accessibleItems.length > 1 && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger 
                    className={(!isDashboard && url !== '/login' && url !== '/register' && url !== '/about' && url !== '/profile')
                      ? "font-extrabold text-sm tracking-wide uppercase px-4 xl:px-5 py-1.5 rounded-full border-[3px] border-white dark:border-slate-200 bg-yellow-400 text-black shadow-[0_4px_0_#b45309] data-[state=closed]:md:hover:-translate-y-0.5 data-[state=closed]:md:hover:shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-none data-[state=open]:translate-y-1 data-[state=open]:shadow-none transition-all duration-200 flex items-center gap-1.5 group outline-none cursor-pointer" 
                      : "font-extrabold text-sm tracking-wide uppercase text-white md:hover:text-yellow-200 data-[state=open]:text-yellow-400 data-[state=open]:translate-y-0.5 transition-all duration-200 drop-shadow-sm py-1.5 px-2 xl:px-3 flex items-center gap-1.5 whitespace-nowrap outline-none cursor-pointer"
                    }
                  >
                    {url.startsWith('/professional') ? 'PROFESSIONAL' :
                     url.startsWith('/adult') ? 'ADULTS' :
                     url.startsWith('/kids') ? 'KIDS' :
                     url.startsWith('/admin') ? 'ADMIN' : 'MENU'}
                    <ChevronDown className={(!isDashboard && url !== '/login' && url !== '/register' && url !== '/about' && url !== '/profile') ? "h-4 w-4 text-black font-bold transition-transform group-data-[state=open]:rotate-180" : "h-4 w-4 text-white font-bold transition-transform group-data-[state=open]:rotate-180"} strokeWidth={3} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl rounded-[14px] p-1.5 z-[100] transition-colors" sideOffset={12}>
                    {user?.permissions.accessProfessional && (
                      <Link href="/professional" className="block w-full">
                        <DropdownMenuItem className="cursor-pointer font-bold rounded-lg py-2.5 px-3 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors">
                          <span className={url.startsWith('/professional') ? "text-yellow-600" : "text-slate-700 dark:text-slate-300"}>PROFESSIONAL</span>
                          {url.startsWith('/professional') && <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-sm" />}
                        </DropdownMenuItem>
                      </Link>
                    )}
                    {user?.permissions.accessAdult && (
                      <Link href="/adult" className="block w-full">
                        <DropdownMenuItem className="cursor-pointer font-bold rounded-lg py-2.5 px-3 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors">
                          <span className={url.startsWith('/adult') ? "text-yellow-600" : "text-slate-700 dark:text-slate-300"}>ADULTS</span>
                          {url.startsWith('/adult') && <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-sm" />}
                        </DropdownMenuItem>
                      </Link>
                    )}
                    {user?.permissions.accessKids && (
                      <Link href="/kids" className="block w-full">
                        <DropdownMenuItem className="cursor-pointer font-bold rounded-lg py-2.5 px-3 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors">
                          <span className={url.startsWith('/kids') ? "text-yellow-600" : "text-slate-700 dark:text-slate-300"}>KIDS</span>
                          {url.startsWith('/kids') && <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-sm" />}
                        </DropdownMenuItem>
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link href="/admin" className="block w-full">
                        <DropdownMenuItem className="cursor-pointer font-bold rounded-lg py-2.5 px-3 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors">
                          <span className={url.startsWith('/admin') ? "text-yellow-600" : "text-slate-700 dark:text-slate-300"}>ADMIN PANEL</span>
                          {url.startsWith('/admin') && <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-sm" />}
                        </DropdownMenuItem>
                      </Link>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* RIGHT SECTION: Time + User Info + Icon Buttons */}
            <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3">
              {/* Time + User Info Column - Now Stacked Vertical */}
              <div className="hidden xl:flex flex-col items-end justify-center min-w-0">
                <TimeDisplay />
                {isAuthenticated && (
                  <div className="flex flex-col items-end whitespace-nowrap mt-0.5">
                    <p className="text-white font-extrabold text-sm leading-none drop-shadow-sm">{user?.name || 'Admin User'}</p>
                    <p className="text-yellow-300 text-[0.625rem] font-bold uppercase tracking-widest leading-tight mt-1 drop-shadow-sm opacity-90">{user?.role || 'Admin'}</p>
                  </div>
                )}
              </div>

              {/* Notification Bell - visible on sm+ (tablet and desktop) */}
              {isAuthenticated && (
                <div className="hidden sm:flex relative group items-center">
                  <NotificationPopover />
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[9999] pointer-events-none">
                    Notifications
                  </span>
                </div>
              )}

              {/* Profile & Settings - Only visible on desktop (lg+) */}
              {isAuthenticated ? (
                <div className="hidden lg:flex items-center gap-3">
                  <div className="relative group flex items-center">
                    <Link href="/profile" className="flex items-center justify-center p-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#facc15] border-[3px] border-white text-white shadow-[0_4px_0_#ca8a04] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#ca8a04] active:translate-y-1 active:shadow-none transition-all duration-200 active:duration-75 outline-none cursor-pointer">
                      <User className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
                    </Link>
                    <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[9999] pointer-events-none">
                      Profile
                    </span>
                  </div>

                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger
                      className="flex items-center justify-center p-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#e11d48] border-[3px] border-white text-white shadow-[0_4px_0_#9f1239] data-[state=closed]:md:hover:-translate-y-0.5 data-[state=closed]:md:hover:shadow-[0_6px_0_#9f1239] active:translate-y-1 active:shadow-none data-[state=open]:translate-y-1 data-[state=open]:shadow-none dark:data-[state=open]:shadow-none transition-all duration-200 active:duration-75 outline-none cursor-pointer"
                    >
                      <Settings className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent className="w-56 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl rounded-[14px] p-1.5 z-[100] mt-2 mr-2 transition-colors" align="end" sideOffset={8}>
                      <div className="px-2 py-1.5 mb-1 border-b border-slate-100 dark:border-slate-800 transition-colors">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white transition-colors">Menu Options</p>
                      </div>

                      {/* Accessibility Settings Modal Trigger */}
                      <DropdownMenuItem 
                        onClick={(e) => { e.preventDefault(); setShowAccessibilityModal(true); }}
                        className="cursor-pointer font-bold rounded-lg py-2.5 px-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800 transition-colors group"
                      >
                        <span className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <Sliders className="h-4 w-4 text-emerald-500 group-hover:text-emerald-600 transition-colors" strokeWidth={2.5} />
                          Accessibility Center
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </DropdownMenuItem>
                      
                      <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1 transition-colors" />

                      {/* About Link */}
                      <Link href="/about" className="block w-full outline-none">
                        <DropdownMenuItem className="cursor-pointer font-bold rounded-lg py-2.5 px-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800 transition-colors group">
                          <span className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <Info className="h-4 w-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
                            About Platform
                          </span>
                        </DropdownMenuItem>
                      </Link>

                      <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1 transition-colors" />

                      {/* Logout Button */}
                      <DropdownMenuItem 
                        onClick={(e) => { e.preventDefault(); setShowLogoutConfirm(true); }}
                        className="cursor-pointer font-bold rounded-lg py-2.5 px-3 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-50 dark:focus:bg-red-950/30 transition-colors group"
                      >
                        <span className="flex items-center gap-2 text-sm text-red-600 font-bold">
                          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" strokeWidth={2.5} />
                          Log Out
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-3">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger
                      className="p-2 flex items-center justify-center rounded-full bg-[#e11d48] border-[3px] border-white text-white shadow-[0_4px_0_#9f1239] data-[state=closed]:md:hover:-translate-y-0.5 data-[state=closed]:md:hover:shadow-[0_6px_0_#9f1239] active:translate-y-1 active:shadow-none data-[state=open]:translate-y-1 data-[state=open]:shadow-none dark:data-[state=open]:shadow-none transition-all duration-200 active:duration-75 outline-none cursor-pointer"
                    >
                      <Settings className="h-5 w-5" strokeWidth={2.5} />
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent className="w-56 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl rounded-[14px] p-1.5 z-[100] mt-2 mr-2 transition-colors" align="end" sideOffset={8}>
                      <div className="px-2 py-1.5 mb-1 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white transition-colors">Menu Options</p>
                      </div>

                      {/* Accessibility Settings Modal Trigger */}
                      <DropdownMenuItem 
                        onClick={(e) => { e.preventDefault(); setShowAccessibilityModal(true); }}
                        className="cursor-pointer font-bold rounded-lg py-2.5 px-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800 transition-colors group"
                      >
                        <span className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <Sliders className="h-4 w-4 text-emerald-500 group-hover:text-emerald-600 transition-colors" strokeWidth={2.5} />
                          Accessibility Center
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </DropdownMenuItem>

                      <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1 transition-colors" />

                      {/* About Link */}
                      <Link href="/about" className="block w-full outline-none">
                        <DropdownMenuItem className="cursor-pointer font-bold rounded-lg py-2.5 px-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800 transition-colors group">
                          <span className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <Info className="h-4 w-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
                            About Platform
                          </span>
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Link href="/login" className="bg-yellow-400 border-[3px] border-white text-red-600 font-extrabold px-6 py-1.5 rounded-full shadow-[0_4px_0_#b45309] md:hover:-translate-y-0.5 md:hover:shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-none transition-all duration-200 active:duration-75 text-sm tracking-wide">
                    Sign In
                  </Link>
                </div>
              )}

              {/* Notification bell for small mobile only (below sm) */}
              {isAuthenticated && (
                <div className="sm:hidden relative flex items-center justify-center">
                  <NotificationPopover />
                </div>
              )}

              {/* Mobile Sign In Button - visible when not authenticated */}
              {!isAuthenticated && (
                <Link href="/login" className="sm:hidden bg-yellow-400 border-[3px] border-white text-red-600 font-extrabold px-4 py-1.5 rounded-full shadow-[0_4px_0_#b45309] md:hover:-translate-y-0.5 md:hover:shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-none transition-all duration-200 active:duration-75 text-[0.6875rem] tracking-wide shrink-0 whitespace-nowrap">
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Button - More prominent */}
              <button
                type="button"
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-menu"
                className={`lg:hidden flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-[14px] shrink-0 transition-all duration-200 outline-none bg-yellow-400 border-[3px] border-white text-white ${
                  mobileMenuOpen 
                    ? "translate-y-1 shadow-[0_0px_0_#b45309]" 
                    : "shadow-[0_4px_0_#b45309] md:hover:-translate-y-0.5 md:hover:shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-[0_0px_0_#b45309]"
                }`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={3} /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu Overlay Card */}
        <div
          id="mobile-nav-menu"
          className={`lg:hidden absolute top-[calc(100%+8px)] left-4 right-4 bg-[#334155] rounded-[1.25rem] shadow-2xl transition-all duration-300 ease-in-out origin-top-right z-[100] border-2 border-[#1e293b]/50 ${
            mobileMenuOpen ? "opacity-100 visible scale-100 translate-y-0" : "opacity-0 invisible scale-95 -translate-y-4"
          }`}
        >
          {/* Caret pointing up to the hamburger */}
          <div className="absolute -top-2.5 right-[18px] w-6 h-6 bg-[#334155] rotate-45 rounded-[3px] z-[-1] border-l-2 border-t-2 border-[#1e293b]/50"></div>
          
          <div className="max-h-[calc(100vh-120px)] overflow-y-auto py-3 flex flex-col scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
            <Link
              href="/"
              className={`flex items-center gap-4 px-6 py-3.5 font-bold text-[0.9375rem] transition-colors ${url === '/' ? 'text-yellow-400 bg-white/5' : 'text-white hover:bg-white/5'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="h-5 w-5 shrink-0" strokeWidth={2.5} />
              <span className="flex-1">Dashboard</span>
              {url === '/' && <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" />}
            </Link>

            <Link
              href="/about"
              className={`flex items-center gap-4 px-6 py-3.5 font-bold text-[15px] transition-colors ${url === '/about' ? 'text-yellow-400 bg-white/5' : 'text-white hover:bg-white/5'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Info className="h-5 w-5 shrink-0" strokeWidth={2.5} />
              <span className="flex-1">About</span>
              {url === '/about' && <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" />}
            </Link>

            {isAuthenticated && user?.permissions.accessProfessional && (
              <Link
                href="/professional"
                className={`flex items-center gap-4 px-6 py-3.5 font-bold text-[15px] transition-colors ${url.startsWith('/professional') ? 'text-yellow-400 bg-white/5' : 'text-white hover:bg-white/5'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Briefcase className="h-5 w-5 shrink-0" strokeWidth={2.5} />
                <span className="flex-1">Professional</span>
                {url.startsWith('/professional') && <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" />}
              </Link>
            )}

            {isAuthenticated && user?.permissions.accessAdult && (
              <Link
                href="/adult"
                className={`flex items-center gap-4 px-6 py-3.5 font-bold text-[15px] transition-colors ${url.startsWith('/adult') ? 'text-yellow-400 bg-white/5' : 'text-white hover:bg-white/5'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-5 w-5 shrink-0" strokeWidth={2.5} />
                <span className="flex-1">Adults</span>
                {url.startsWith('/adult') && <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" />}
              </Link>
            )}

            {isAuthenticated && user?.permissions.accessKids && (
              <Link
                href="/kids"
                className={`flex items-center gap-4 px-6 py-3.5 font-bold text-[15px] transition-colors ${url.startsWith('/kids') ? 'text-yellow-400 bg-white/5' : 'text-white hover:bg-white/5'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Baby className="h-5 w-5 shrink-0" strokeWidth={2.5} />
                <span className="flex-1">Kids</span>
                {url.startsWith('/kids') && <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" />}
              </Link>
            )}

            {isAuthenticated && user?.role === "admin" && (
              <Link
                href="/admin"
                className={`flex items-center gap-4 px-6 py-3.5 font-bold text-[0.9375rem] transition-colors ${url.startsWith('/admin') ? 'text-yellow-400 bg-white/5' : 'text-white hover:bg-white/5'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield className="h-5 w-5 shrink-0" strokeWidth={2.5} />
                <span className="flex-1">Admin</span>
                {url.startsWith('/admin') && <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" />}
              </Link>
            )}

            {/* DateTime Divider */}
            <div className="h-[1px] bg-slate-800/60 w-full my-2"></div>
            
            <div className="px-6 py-2">
              <TimeDisplay mobile />
            </div>

            {/* Accessibility Settings link for all mobile users */}
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                setShowAccessibilityModal(true)
              }}
              className="flex items-center gap-4 px-6 py-3.5 font-bold text-[0.9375rem] text-white hover:bg-white/5 transition-colors w-full text-left outline-none"
            >
              <Sliders className="h-5 w-5 text-emerald-400 shrink-0" strokeWidth={2.5} />
              <span className="flex-1">Accessibility Settings</span>
              <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
            </button>

            {/* Mobile User Info */}
            {isAuthenticated && (
              <>
                <div className="h-[1px] bg-slate-800/60 w-full my-2"></div>
                
                <div className="flex items-center justify-between px-6 py-3 pb-2">
                  <div className="flex items-center gap-2.5">
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="outline-none">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-yellow-400 border-[3px] border-white flex items-center justify-center shadow-[0_3px_0_#b45309] md:hover:-translate-y-0.5 md:hover:shadow-[0_4px_0_#b45309] active:translate-y-0.5 active:shadow-[0_0px_0_#b45309] transition-all cursor-pointer shrink-0">
                        <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2.5} />
                      </div>
                    </Link>
                    
                    {/* Dark Badge for role */}
                    <div className="bg-[#1e293b] rounded-lg px-3 py-1.5 flex flex-col justify-center border border-slate-700/50 shadow-inner">
                      <p className="text-white font-bold text-[0.6875rem] sm:text-xs leading-tight drop-shadow-sm truncate max-w-[80px] sm:max-w-[100px]">{user?.name || "User"}</p>
                      <p className="text-yellow-400 font-semibold text-[0.625rem] sm:text-xs leading-tight capitalize drop-shadow-sm truncate">{user?.role || "Role"}</p>
                    </div>
                  </div>

                  {/* Red Logout Button */}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setShowLogoutConfirm(true)
                    }}
                    className="rounded-full bg-[#e11d48] border-[2px] border-white text-white md:hover:bg-rose-700 h-9 sm:h-10 px-3 sm:px-4 font-bold text-xs sm:text-sm shadow-[0_3px_0_#9f1239] md:hover:-translate-y-0.5 md:hover:shadow-[0_4px_0_#9f1239] active:translate-y-1 active:shadow-[0_0px_0_#9f1239] transition-all shrink-0 outline-none flex items-center justify-center"
                  >
                    <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" strokeWidth={2.5} />
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent aria-describedby={undefined} className="max-w-[90vw] sm:max-w-md bg-white dark:bg-slate-900 border-none rounded-[2rem] p-0 overflow-hidden shadow-2xl transition-colors duration-500">
          <div className="bg-primary p-6 text-center border-b-[6px] border-white/20">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl transform rotate-3 overflow-hidden p-1">
              <img src="/berong_logout.png" alt="Logout" className="w-full h-full object-contain" />
            </div>
            <DialogTitle className="text-2xl font-black text-white uppercase tracking-tight italic drop-shadow-md">Logging out?</DialogTitle>
          </div>
          <div className="p-8 text-center">
            <DialogDescription className="text-slate-500 dark:text-slate-400 font-bold text-lg leading-relaxed mb-8 transition-colors">
              Are you sure you want to take a break, Hero? We'll miss you!
            </DialogDescription>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm"
              >
                Stay
              </button>
              <button 
                onClick={() => {
                  setShowLogoutConfirm(false)
                  logout()
                }}
                className="flex-1 bg-[#ff4b3e] hover:bg-red-600 text-white font-black py-4 rounded-2xl shadow-[0_4px_0_#b91c1c] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Immersive Accessibility Settings Modal */}
      <Dialog open={showAccessibilityModal} onOpenChange={setShowAccessibilityModal}>
        <DialogContent
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement)?.focus();
          }}
          tabIndex={-1}
          aria-describedby={undefined}
          className="max-w-[95vw] sm:max-w-lg bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-0 overflow-hidden shadow-2xl transition-colors duration-500 focus:outline-none"
        >
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3.5 sm:p-4.5 text-left border-b-[6px] border-white/20 flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center shadow-inner shrink-0">
              <Sliders className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col min-w-0 pr-6 sm:pr-8">
              <DialogTitle className="text-sm sm:text-xl font-black text-white uppercase tracking-tight italic drop-shadow-md text-left leading-tight">Accessibility Center</DialogTitle>
              <p className="text-emerald-100 text-[10px] sm:text-xs font-semibold leading-tight mt-0.5 text-left">Customize your learning and dashboard environments</p>
            </div>
          </div>

          <div className="p-3 sm:p-5 pt-3 sm:pt-4 max-h-[55vh] sm:max-h-[65vh] overflow-y-auto space-y-2.5 sm:space-y-4 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Visual Assists */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800/80 space-y-3 sm:space-y-4 transition-colors">
              <h3 className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Visual Assists</h3>
              
              {/* Dark Mode */}
              <div
                onClick={() => toggleDarkMode()}
                className="flex items-center justify-between cursor-pointer py-1"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-bold text-slate-800 dark:text-white">
                    {isDarkMode ? <Sun className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-yellow-500 shrink-0" /> : <Moon className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-indigo-500 dark:text-indigo-400 shrink-0" />}
                    Dark Mode
                  </span>
                  <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-normal mt-1">Switch between light and dark visual themes</span>
                </div>
                <div className={`relative w-10 h-6 shrink-0 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-yellow-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* Color Blindness Segmented Filter */}
              <div className="pt-1">
                <div className="flex flex-col mb-1.5">
                  <span className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-bold text-slate-800 dark:text-white">
                    <Eye className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-emerald-500 dark:text-emerald-450 shrink-0" />
                    Color Deficiency Filter
                  </span>
                  <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-normal mt-1">Enhance contrast and adjust color spaces for vision correction</span>
                </div>
                <div className="mt-2">
                  <Select
                    value={colorBlindness}
                    onValueChange={(val) => setColorBlindness(val as any)}
                  >
                    <SelectTrigger className="w-full h-10 sm:h-11 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold text-slate-700 dark:text-slate-300 focus:ring-emerald-400 focus:border-emerald-400 transition-all hover:border-slate-300 dark:hover:border-slate-700">
                      <SelectValue placeholder="Select color filter" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-xl p-1 z-[1000]">
                      <SelectItem value="none" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-emerald-50 dark:focus:bg-slate-800 focus:text-emerald-600 dark:focus:text-emerald-400 transition-colors cursor-pointer py-2 sm:py-2.5">
                        None (Default)
                      </SelectItem>
                      <SelectItem value="protanopia" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-emerald-50 dark:focus:bg-slate-800 focus:text-emerald-600 dark:focus:text-emerald-400 transition-colors cursor-pointer py-2 sm:py-2.5">
                        Protanopia (Red-blind)
                      </SelectItem>
                      <SelectItem value="deuteranopia" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-emerald-50 dark:focus:bg-slate-800 focus:text-emerald-600 dark:focus:text-emerald-400 transition-colors cursor-pointer py-2 sm:py-2.5">
                        Deuteranopia (Green-blind)
                      </SelectItem>
                      <SelectItem value="tritanopia" className="rounded-lg font-bold text-slate-700 dark:text-slate-300 focus:bg-emerald-50 dark:focus:bg-slate-800 focus:text-emerald-600 dark:focus:text-emerald-400 transition-colors cursor-pointer py-2 sm:py-2.5">
                        Tritanopia (Blue-blind)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Cognitive Assists */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800/85 space-y-3 sm:space-y-4 transition-colors">
              <h3 className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Cognitive & Reading Aids</h3>

              {/* Dyslexia Font */}
              <div
                onClick={() => toggleDyslexiaFont()}
                className="flex items-center justify-between cursor-pointer py-1"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-bold text-slate-800 dark:text-white">
                    <BookOpen className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    Dyslexia Font
                  </span>
                  <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-normal mt-1">Use specialized lettering designed to facilitate reading</span>
                </div>
                <div className={`relative w-10 h-6 shrink-0 rounded-full transition-colors duration-200 ${dyslexiaFont ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${dyslexiaFont ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* Hover Reader */}
              <div
                onClick={() => toggleMagnifyingMouse()}
                className="hidden md:flex items-center justify-between cursor-pointer py-1"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-bold text-slate-800 dark:text-white">
                    <ZoomIn className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    Hover Reader
                  </span>
                  <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-normal mt-1">Magnify text on hover for easier reading</span>
                </div>
                <div className={`relative w-10 h-6 shrink-0 rounded-full transition-colors duration-200 ${magnifyingMouse ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${magnifyingMouse ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* ADHD Focus Mode */}
              <div
                onClick={() => toggleFocusMode()}
                className="flex items-center justify-between cursor-pointer py-1"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-bold text-slate-800 dark:text-white">
                    <Focus className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    Focus Mode
                  </span>
                  <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-normal mt-1">Dim peripheral areas to reduce visual distractions</span>
                </div>
                <div className={`relative w-10 h-6 shrink-0 rounded-full transition-colors duration-200 ${focusMode ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${focusMode ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>

            {/* Typography & Motion */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800/80 space-y-3 sm:space-y-4 transition-colors">
              <h3 className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Sizing & Performance</h3>

              {/* Text Size Control */}
              <div className="pt-1">
                <div className="flex flex-col mb-1.5">
                  <span className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-bold text-slate-800 dark:text-white">
                    <Type className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-blue-600 dark:text-blue-455 shrink-0" />
                    Text Scaling
                  </span>
                  <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-normal mt-1">Adjust the scale of interface fonts for optimal reading comfort</span>
                </div>
                <div className="flex bg-slate-200/50 dark:bg-slate-950 rounded-lg p-1 border border-slate-300/40 dark:border-slate-800/60 transition-colors">
                  {(['normal', 'large', 'xlarge'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setTextSize(size)}
                      className={`flex-1 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-bold transition-all capitalize ${textSize === size ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-900'}`}
                    >
                      {size === 'xlarge' ? 'Extra Large' : size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reduce Motion */}
              <div
                onClick={() => toggleReduceMotion()}
                className="flex items-center justify-between cursor-pointer py-1"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-bold text-slate-800 dark:text-white">
                    <Zap className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-blue-600 dark:text-blue-455 shrink-0" />
                    Performance Mode
                  </span>
                  <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-normal mt-1">Reduce decorative motion and animations to speed up performance</span>
                </div>
                <div className={`relative w-10 h-6 shrink-0 rounded-full transition-colors duration-200 ${reduceMotion ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${reduceMotion ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  )
}
