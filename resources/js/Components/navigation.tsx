"use client"

import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { Button } from "@/components/ui/button"
import { LogOut, User, Menu, X, Home, Users, Briefcase, Baby, Shield, Info, Settings, ChevronDown, Zap } from "lucide-react"
import { NotificationPopover } from "@/components/ui/notification-popover"
import GooeyNav from "@/components/ui/gooey-nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth()
  const { reduceMotion, toggleReduceMotion } = useSettings()
  const { url } = usePage();
  const isDashboard = url === '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>("")

  // Update time every minute
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
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
        setCurrentTime(`${dateStr} at ${timeStr}`)
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <nav className="bg-gradient-to-r from-[#ff3b3b] to-[#ff7b00] sticky top-0 z-[80] shadow-md relative">
      {/* Background Image Layer - 10% opacity */}
      <div
        className="absolute inset-0 opacity-5 bg-cover bg-center"
        style={{ backgroundImage: "url('/web-background-image.jpg')" }}
      />

      {/* Content Layer - Full opacity */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between w-full gap-2 sm:gap-4 relative">

            {/* LEFT SECTION: Logo + Branding */}
            <div className="flex-1 flex justify-start min-w-0">
              <Link href="/" className="flex items-center gap-1.5 sm:gap-3 hover:opacity-90 transition-opacity cursor-pointer">
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
                  <p className="text-white font-bold text-[12px] leading-none sm:text-sm truncate">Berong E-Learning</p>
                  <h1 className="text-yellow-400 font-bold leading-tight text-[10px] xl:text-xs hidden sm:block truncate">
                    Fire Safety Education Platform
                  </h1>
                  <p className="text-white text-[9px] xl:text-[10px] hidden sm:block opacity-90 uppercase tracking-widest mt-0.5 truncate">
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
                  ? "font-extrabold text-sm tracking-wide uppercase px-4 xl:px-5 py-1.5 rounded-full border-[3px] border-white bg-yellow-400 text-black shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-none transition-all duration-200 active:duration-75"
                  : "font-extrabold text-sm tracking-wide uppercase text-white hover:text-yellow-200 transition-colors drop-shadow-sm py-1.5 px-2 xl:px-3 whitespace-nowrap"
                }
              >
                DASHBOARD
              </Link>
              
              {isAuthenticated && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger 
                    className={(!isDashboard && url !== '/login' && url !== '/register' && url !== '/about' && url !== '/profile')
                      ? "font-extrabold text-sm tracking-wide uppercase px-4 xl:px-5 py-1.5 rounded-full border-[3px] border-white bg-yellow-400 text-black shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-none data-[state=open]:translate-y-1 data-[state=open]:shadow-none transition-all duration-200 active:duration-75 flex items-center gap-1.5 group outline-none cursor-pointer" 
                      : "font-extrabold text-sm tracking-wide uppercase text-white hover:text-yellow-200 transition-colors drop-shadow-sm py-1.5 px-2 xl:px-3 flex items-center gap-1.5 whitespace-nowrap outline-none cursor-pointer"
                    }
                  >
                    {url.startsWith('/professional') ? 'PROFESSIONAL' :
                     url.startsWith('/adult') ? 'ADULTS' :
                     url.startsWith('/kids') ? 'KIDS' :
                     url.startsWith('/admin') ? 'ADMIN' : 'MENU'}
                    <ChevronDown className={(!isDashboard && url !== '/login' && url !== '/register' && url !== '/about' && url !== '/profile') ? "h-4 w-4 text-black font-bold transition-transform group-data-[state=open]:rotate-180" : "h-4 w-4 text-white font-bold transition-transform group-data-[state=open]:rotate-180"} strokeWidth={3} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white border-2 border-slate-200 shadow-xl rounded-[14px] p-1.5 z-[100]" sideOffset={12}>
                    {user?.permissions.accessProfessional && (
                      <Link href="/professional" className="block w-full">
                        <DropdownMenuItem className="cursor-pointer font-bold rounded-lg py-2.5 px-3 flex items-center justify-between hover:bg-slate-100 focus:bg-slate-100 transition-colors">
                          <span className={url.startsWith('/professional') ? "text-yellow-600" : "text-slate-700"}>PROFESSIONAL</span>
                          {url.startsWith('/professional') && <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-sm" />}
                        </DropdownMenuItem>
                      </Link>
                    )}
                    {user?.permissions.accessAdult && (
                      <Link href="/adult" className="block w-full">
                        <DropdownMenuItem className="cursor-pointer font-bold rounded-lg py-2.5 px-3 flex items-center justify-between hover:bg-slate-100 focus:bg-slate-100 transition-colors">
                          <span className={url.startsWith('/adult') ? "text-yellow-600" : "text-slate-700"}>ADULTS</span>
                          {url.startsWith('/adult') && <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-sm" />}
                        </DropdownMenuItem>
                      </Link>
                    )}
                    {user?.permissions.accessKids && (
                      <Link href="/kids" className="block w-full">
                        <DropdownMenuItem className="cursor-pointer font-bold rounded-lg py-2.5 px-3 flex items-center justify-between hover:bg-slate-100 focus:bg-slate-100 transition-colors">
                          <span className={url.startsWith('/kids') ? "text-yellow-600" : "text-slate-700"}>KIDS</span>
                          {url.startsWith('/kids') && <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-sm" />}
                        </DropdownMenuItem>
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link href="/admin" className="block w-full">
                        <DropdownMenuItem className="cursor-pointer font-bold rounded-lg py-2.5 px-3 flex items-center justify-between hover:bg-slate-100 focus:bg-slate-100 transition-colors">
                          <span className={url.startsWith('/admin') ? "text-yellow-600" : "text-slate-700"}>ADMIN PANEL</span>
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
              {/* Time + User Info Column */}
              <div className="text-right hidden xl:block mr-2 tracking-wide">
                <p className="text-white text-xs whitespace-nowrap font-medium drop-shadow-sm">
                  {currentTime}
                </p>
                {isAuthenticated && (
                  <div className="flex flex-col items-end mt-0.5 whitespace-nowrap">
                    <p className="text-white font-bold text-sm leading-none drop-shadow-sm">{user?.name || 'Admin User'}</p>
                    <p className="text-yellow-300 text-xs capitalize leading-tight mt-0.5 drop-shadow-sm">{user?.role || 'Admin'}</p>
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
                <div className="hidden lg:flex items-center gap-2">
                  <div className="relative group flex items-center">
                    <Link href="/profile" className="flex items-center justify-center p-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#facc15] border-[3px] border-white text-white shadow-[0_4px_0_#ca8a04] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#ca8a04] active:translate-y-1 active:shadow-none transition-all duration-200 active:duration-75">
                      <User className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
                    </Link>
                    <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[9999] pointer-events-none">
                      Profile
                    </span>
                  </div>

                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger
                      className="flex items-center justify-center p-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#e11d48] border-[3px] border-white text-white shadow-[0_4px_0_#9f1239] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#9f1239] active:translate-y-1 active:shadow-none data-[state=open]:translate-y-1 data-[state=open]:shadow-none transition-all duration-200 active:duration-75 outline-none cursor-pointer"
                    >
                      <Settings className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent className="w-56 bg-white border-2 border-slate-200 shadow-xl rounded-[14px] p-1.5 z-[100] mt-2 mr-2" align="end" sideOffset={8}>
                      <div className="px-2 py-1.5 mb-1 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-800">Settings</p>
                      </div>

                      {/* Reduce Animations Toggle */}
                      <div
                        onClick={(e) => { e.preventDefault(); toggleReduceMotion(); }}
                        className="flex items-center justify-between rounded-lg cursor-pointer py-2 px-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <Zap className="h-4 w-4 text-amber-500" />
                          Reduce Animations
                        </span>
                        <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${reduceMotion ? 'bg-red-500' : 'bg-slate-300'}`}>
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${reduceMotion ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </div>

                      <div className="h-[1px] bg-slate-100 my-1" />

                      <DropdownMenuItem 
                        onClick={logout} 
                        className="focus:bg-red-50 focus:text-red-700 rounded-lg cursor-pointer py-2 px-2.5 transition-colors group flex items-center justify-between text-sm font-bold tracking-wide text-red-600 mt-1"
                      >
                        <span className="flex items-center gap-2">
                          <LogOut className="h-4 w-4 text-red-500 group-hover:text-red-700 transition-colors" />
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
                      className="p-2 flex items-center justify-center rounded-full bg-[#e11d48] border-[3px] border-white text-white shadow-[0_4px_0_#9f1239] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#9f1239] active:translate-y-1 active:shadow-none data-[state=open]:translate-y-1 data-[state=open]:shadow-none transition-all duration-200 active:duration-75 outline-none cursor-pointer"
                    >
                      <Settings className="h-5 w-5" strokeWidth={2.5} />
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent className="w-56 bg-white border-2 border-slate-200 shadow-xl rounded-[14px] p-1.5 z-[100] mt-2 mr-2" align="end" sideOffset={8}>
                      <div className="px-2 py-1.5 mb-1 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-800">Settings</p>
                      </div>

                      {/* About Link */}
                      <Link href="/about" className="block w-full outline-none">
                        <DropdownMenuItem className="cursor-pointer font-bold rounded-lg py-2.5 px-3 flex items-center justify-between hover:bg-slate-50 focus:bg-slate-50 transition-colors group">
                          <span className="flex items-center gap-2 text-sm text-slate-700">
                            <Info className="h-4 w-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
                            About Platform
                          </span>
                        </DropdownMenuItem>
                      </Link>

                      <div className="h-[1px] bg-slate-100 my-1" />

                      {/* Reduce Animations Toggle */}
                      <div
                        onClick={(e) => { e.preventDefault(); toggleReduceMotion(); }}
                        className="flex items-center justify-between rounded-lg cursor-pointer py-2.5 px-3 hover:bg-slate-50 transition-colors"
                      >
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <Zap className="h-4 w-4 text-amber-500" />
                          Reduce Animations
                        </span>
                        <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${reduceMotion ? 'bg-red-500' : 'bg-slate-300'}`}>
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${reduceMotion ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Link href="/login" className="bg-yellow-400 border-[3px] border-white text-red-600 font-extrabold px-6 py-1.5 rounded-full shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-none transition-all duration-200 active:duration-75 text-sm tracking-wide">
                    Sign In
                  </Link>
                </div>
              )}

              {/* Notification bell for small mobile only (below sm) */}
              {isAuthenticated && (
                <div className="sm:hidden">
                  <NotificationPopover />
                </div>
              )}

              {/* Mobile Sign In Button - visible when not authenticated */}
              {!isAuthenticated && (
                <Link href="/login" className="sm:hidden bg-yellow-400 border-[3px] border-white text-red-600 font-extrabold px-4 py-1.5 rounded-full shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-none transition-all duration-200 active:duration-75 text-[11px] tracking-wide shrink-0 whitespace-nowrap">
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
                    : "shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-[0_0px_0_#b45309]"
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
          
          <div className="py-3 flex flex-col">
            <Link
              href="/"
              className={`flex items-center gap-4 px-6 py-3.5 font-bold text-[15px] transition-colors ${url === '/' ? 'text-yellow-400 bg-white/5' : 'text-white hover:bg-white/5'}`}
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
                className={`flex items-center gap-4 px-6 py-3.5 font-bold text-[15px] transition-colors ${url.startsWith('/admin') ? 'text-yellow-400 bg-white/5' : 'text-white hover:bg-white/5'}`}
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
              <p className="text-slate-200 text-[11px] leading-relaxed drop-shadow-sm font-medium">
                {currentTime.split(' at ')[0] || 'Loading date...'} at <br/> {currentTime.split(' at ')[1] || '...'}
              </p>
            </div>

            {/* Reduce Animations Toggle (Mobile) */}
            <div className="h-[1px] bg-slate-800/60 w-full my-2"></div>
            <div
              onClick={toggleReduceMotion}
              className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-white/5 transition-colors"
            >
              <span className="flex items-center gap-3 text-[15px] font-bold text-white">
                <Zap className="h-5 w-5 text-amber-400 shrink-0" strokeWidth={2.5} />
                Reduce Animations
              </span>
              <div className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${reduceMotion ? 'bg-red-500' : 'bg-slate-600'}`}>
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${reduceMotion ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </div>

            {/* Mobile User Info */}
            {isAuthenticated && (
              <>
                <div className="h-[1px] bg-slate-800/60 w-full my-2"></div>
                
                <div className="flex items-center justify-between px-6 py-3 pb-2">
                  <div className="flex items-center gap-2.5">
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="outline-none">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-yellow-400 border-[3px] border-white flex items-center justify-center shadow-[0_3px_0_#b45309] hover:-translate-y-0.5 hover:shadow-[0_4px_0_#b45309] active:translate-y-0.5 active:shadow-[0_0px_0_#b45309] transition-all cursor-pointer shrink-0">
                        <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2.5} />
                      </div>
                    </Link>
                    
                    {/* Dark Badge for role */}
                    <div className="bg-[#1e293b] rounded-lg px-3 py-1.5 flex flex-col justify-center border border-slate-700/50 shadow-inner">
                      <p className="text-white font-bold text-[11px] sm:text-xs leading-tight drop-shadow-sm truncate max-w-[80px] sm:max-w-[100px]">{user?.name || "User"}</p>
                      <p className="text-yellow-400 font-semibold text-[10px] sm:text-xs leading-tight capitalize drop-shadow-sm truncate">{user?.role || "Role"}</p>
                    </div>
                  </div>

                  {/* Red Logout Button */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      logout()
                    }}
                    className="rounded-full bg-[#e11d48] border-[2px] border-white text-white hover:bg-rose-700 hover:text-white h-9 sm:h-10 px-3 sm:px-4 font-bold text-xs sm:text-sm shadow-[0_3px_0_#9f1239] hover:-translate-y-0.5 hover:shadow-[0_4px_0_#9f1239] active:translate-y-1 active:shadow-[0_0px_0_#9f1239] transition-all shrink-0 outline-none"
                  >
                    <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" strokeWidth={2.5} />
                    Log out
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
