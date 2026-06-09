"use client"

import { useSettings } from "@/lib/settings-context"
import { Moon, Sun, Zap, Type, BookOpen, Focus, Eye, ZoomIn } from "lucide-react"

/**
 * Reusable settings panel for the navigation component.
 * Renders dark mode toggle, performance mode toggle, and text size controls.
 * Used in both desktop dropdown and mobile menu to eliminate duplication.
 */

interface SettingsPanelProps {
  /** Render variant: 'dropdown' for desktop dropdown menus, 'mobile' for mobile slide-out menu */
  variant: 'dropdown' | 'mobile'
}

export function SettingsPanel({ variant }: SettingsPanelProps) {
  const { reduceMotion, toggleReduceMotion, textSize, setTextSize, isDarkMode, toggleDarkMode, dyslexiaFont, toggleDyslexiaFont, focusMode, toggleFocusMode, colorBlindness, setColorBlindness, magnifyingMouse, toggleMagnifyingMouse } = useSettings()

  if (variant === 'mobile') {
    return (
      <>
        {/* Dark Mode Toggle (Mobile) */}
        <div
          onClick={toggleDarkMode}
          className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-white/5 transition-colors"
        >
          <span className="flex items-center gap-3 text-[0.9375rem] font-bold text-white">
            {isDarkMode ? <Sun className="h-5 w-5 text-yellow-400 shrink-0" strokeWidth={2.5} /> : <Moon className="h-5 w-5 text-indigo-400 shrink-0" strokeWidth={2.5} />}
            Dark Mode
          </span>
          <div className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-indigo-500' : 'bg-slate-600'}`}>
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </div>

        {/* Reduce Animations Toggle (Mobile) */}
        <div
          onClick={toggleReduceMotion}
          className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-white/5 transition-colors"
        >
          <span className="flex items-center gap-3 text-[0.9375rem] font-bold text-white">
            <Zap className="h-5 w-5 text-amber-400 shrink-0" strokeWidth={2.5} />
            Performance Mode
          </span>
          <div className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${reduceMotion ? 'bg-red-500' : 'bg-slate-600'}`}>
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${reduceMotion ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </div>

        {/* Dyslexia Font Toggle (Mobile) */}
        <div
          onClick={toggleDyslexiaFont}
          className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-white/5 transition-colors"
        >
          <span className="flex items-center gap-3 text-[0.9375rem] font-bold text-white">
            <BookOpen className="h-5 w-5 text-emerald-400 shrink-0" strokeWidth={2.5} />
            Dyslexia Font
          </span>
          <div className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${dyslexiaFont ? 'bg-emerald-500' : 'bg-slate-600'}`}>
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${dyslexiaFont ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </div>

        {/* Focus Mode Toggle (Mobile) */}
        <div
          onClick={toggleFocusMode}
          className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-white/5 transition-colors"
        >
          <span className="flex items-center gap-3 text-[0.9375rem] font-bold text-white">
            <Focus className="h-5 w-5 text-teal-400 shrink-0" strokeWidth={2.5} />
            Focus Mode
          </span>
          <div className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${focusMode ? 'bg-teal-500' : 'bg-slate-600'}`}>
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${focusMode ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </div>

        {/* Magnifying Mouse Toggle (Mobile) */}
        <div
          onClick={toggleMagnifyingMouse}
          className="hidden md:flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-white/5 transition-colors"
        >
          <span className="flex items-center gap-3 text-[0.9375rem] font-bold text-white">
            <ZoomIn className="h-5 w-5 text-cyan-400 shrink-0" strokeWidth={2.5} />
            Hover Reader
          </span>
          <div className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${magnifyingMouse ? 'bg-cyan-500' : 'bg-slate-600'}`}>
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${magnifyingMouse ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </div>

        {/* Color Blindness Filter (Mobile) */}
        <div className="px-6 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Eye className="h-5 w-5 text-emerald-400 shrink-0" strokeWidth={2.5} />
            <span className="text-[0.9375rem] font-bold text-white">Color Filter</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 bg-[#1e293b] rounded-lg p-1 border border-slate-700/50">
            <button
              onClick={() => setColorBlindness('none')}
              className={`py-2 rounded-md text-xs font-bold transition-all ${colorBlindness === 'none' ? 'bg-yellow-400 text-black shadow-xs' : 'text-slate-300 hover:text-white'}`}
            >
              Default (None)
            </button>
            <button
              onClick={() => setColorBlindness('protanopia')}
              className={`py-2 rounded-md text-xs font-bold transition-all ${colorBlindness === 'protanopia' ? 'bg-yellow-400 text-black shadow-xs' : 'text-slate-300 hover:text-white'}`}
            >
              Protan (Red-blind)
            </button>
            <button
              onClick={() => setColorBlindness('deuteranopia')}
              className={`py-2 rounded-md text-xs font-bold transition-all ${colorBlindness === 'deuteranopia' ? 'bg-yellow-400 text-black shadow-xs' : 'text-slate-300 hover:text-white'}`}
            >
              Deutan (Green-blind)
            </button>
            <button
              onClick={() => setColorBlindness('tritanopia')}
              className={`py-2 rounded-md text-xs font-bold transition-all ${colorBlindness === 'tritanopia' ? 'bg-yellow-400 text-black shadow-xs' : 'text-slate-300 hover:text-white'}`}
            >
              Tritan (Blue-blind)
            </button>
          </div>
        </div>



        {/* Font Size Control (Mobile) */}
        <div className="px-6 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Type className="h-5 w-5 text-blue-400 shrink-0" strokeWidth={2.5} />
            <span className="text-[0.9375rem] font-bold text-white">Text Size</span>
          </div>
          <div className="flex bg-[#1e293b] rounded-lg p-1 border border-slate-700/50">
            <button
              onClick={() => setTextSize('normal')}
              className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${textSize === 'normal' ? 'bg-yellow-400 text-black shadow-sm' : 'text-slate-300 hover:text-white'}`}
            >
              Aa
            </button>
            <button
              onClick={() => setTextSize('large')}
              className={`flex-1 py-2 rounded-md text-base font-bold transition-all ${textSize === 'large' ? 'bg-yellow-400 text-black shadow-sm' : 'text-slate-300 hover:text-white'}`}
            >
              Aa
            </button>
            <button
              onClick={() => setTextSize('xlarge')}
              className={`flex-1 py-2 rounded-md text-lg font-bold transition-all ${textSize === 'xlarge' ? 'bg-yellow-400 text-black shadow-sm' : 'text-slate-300 hover:text-white'}`}
            >
              Aa
            </button>
          </div>
        </div>
      </>
    )
  }

  // Desktop dropdown variant
  return (
    <>
      {/* Dark Mode Toggle */}
      <div
        onClick={(e) => { e.preventDefault(); toggleDarkMode(); }}
        className="flex items-center justify-between rounded-lg cursor-pointer py-2.5 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          {isDarkMode ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
          Dark Mode
        </span>
        <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
      </div>

      <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1 transition-colors" />

      {/* Reduce Animations Toggle */}
      <div
        onClick={(e) => { e.preventDefault(); toggleReduceMotion(); }}
        className="flex items-center justify-between rounded-lg cursor-pointer py-2.5 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Zap className="h-4 w-4 text-amber-500" />
          Performance Mode
        </span>
        <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${reduceMotion ? 'bg-red-500' : 'bg-slate-300'}`}>
          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${reduceMotion ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
      </div>

      <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1 transition-colors" />

      {/* Dyslexia Font Toggle */}
      <div
        onClick={(e) => { e.preventDefault(); toggleDyslexiaFont(); }}
        className="flex items-center justify-between rounded-lg cursor-pointer py-2.5 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <BookOpen className="h-4 w-4 text-emerald-500" />
          Dyslexia Font
        </span>
        <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${dyslexiaFont ? 'bg-emerald-500' : 'bg-slate-300'}`}>
          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${dyslexiaFont ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
      </div>

      <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1 transition-colors" />

      {/* Focus Mode Toggle */}
      <div
        onClick={(e) => { e.preventDefault(); toggleFocusMode(); }}
        className="flex items-center justify-between rounded-lg cursor-pointer py-2.5 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Focus className="h-4 w-4 text-teal-500" />
          Focus Mode
        </span>
        <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${focusMode ? 'bg-teal-500' : 'bg-slate-300'}`}>
          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${focusMode ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
      </div>

      <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1 transition-colors" />

      {/* Magnifying Mouse Toggle */}
      <div
        onClick={(e) => { e.preventDefault(); toggleMagnifyingMouse(); }}
        className="hidden md:flex items-center justify-between rounded-lg cursor-pointer py-2.5 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <ZoomIn className="h-4 w-4 text-cyan-500" />
          Hover Reader
        </span>
        <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${magnifyingMouse ? 'bg-cyan-500' : 'bg-slate-300'}`}>
          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${magnifyingMouse ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
      </div>

      <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1 transition-colors hidden md:block" />

      {/* Color Blindness Filter */}
      <div className="py-2.5 px-3">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
          <Eye className="h-4 w-4 text-emerald-500" />
          Color Filter
        </span>
        <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 transition-colors">
          <button
            onClick={(e) => { e.preventDefault(); setColorBlindness('none'); }}
            className={`py-1.5 px-2 rounded-md text-xs font-bold transition-all ${colorBlindness === 'none' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            None
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setColorBlindness('protanopia'); }}
            className={`py-1.5 px-2 rounded-md text-xs font-bold transition-all ${colorBlindness === 'protanopia' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            Protan
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setColorBlindness('deuteranopia'); }}
            className={`py-1.5 px-2 rounded-md text-xs font-bold transition-all ${colorBlindness === 'deuteranopia' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            Deutan
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setColorBlindness('tritanopia'); }}
            className={`py-1.5 px-2 rounded-md text-xs font-bold transition-all ${colorBlindness === 'tritanopia' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            Tritan
          </button>
        </div>
      </div>

      <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1 transition-colors" />

      {/* Text Size Control */}
      <div className="py-2.5 px-3">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
          <Type className="h-4 w-4 text-blue-500" />
          Text Size
        </span>
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-md p-1 border border-slate-200 dark:border-slate-700 transition-colors">
          <button onClick={(e) => { e.preventDefault(); setTextSize('normal'); }} className={`flex-1 py-1 rounded text-xs font-bold transition-all ${textSize === 'normal' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>A</button>
          <button onClick={(e) => { e.preventDefault(); setTextSize('large'); }} className={`flex-1 py-1 rounded text-sm font-bold transition-all ${textSize === 'large' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>A</button>
          <button onClick={(e) => { e.preventDefault(); setTextSize('xlarge'); }} className={`flex-1 py-1 rounded text-base font-bold transition-all ${textSize === 'xlarge' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>A</button>
        </div>
      </div>
    </>
  )
}
