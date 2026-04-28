import React, { createContext, useContext, useEffect, useState } from "react";

export type TextSize = 'normal' | 'large' | 'xlarge';

interface SettingsContextType {
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;
  toggleReduceMotion: () => void;
  textSize: TextSize;
  setTextSize: (value: TextSize) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  toggleDarkMode: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [reduceMotion, setReduceMotionState] = useState<boolean>(false);
  const [textSize, setTextSizeState] = useState<TextSize>('normal');
  const [isDarkMode, setIsDarkModeState] = useState<boolean>(false);

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedMotion = localStorage.getItem("safescape-reduce-motion");
    if (savedMotion !== null) {
      setReduceMotionState(savedMotion === "true");
    } else {
      // Fallback to OS preference
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setReduceMotionState(prefersReduced);
    }

    const savedTextSize = localStorage.getItem("safescape-text-size") as TextSize | null;
    if (savedTextSize && ['normal', 'large', 'xlarge'].includes(savedTextSize)) {
      setTextSizeState(savedTextSize);
    }

    const savedDarkMode = localStorage.getItem("safescape-dark-mode");
    if (savedDarkMode !== null) {
      setIsDarkModeState(savedDarkMode === "true");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkModeState(prefersDark);
    }
  }, []);

  const setReduceMotion = React.useCallback((value: boolean) => {
    setReduceMotionState(value);
    // Non-blocking storage update
    setTimeout(() => localStorage.setItem("safescape-reduce-motion", String(value)), 0);
  }, []);

  const toggleReduceMotion = React.useCallback(() => {
    setReduceMotionState(prev => {
      const newValue = !prev;
      setTimeout(() => localStorage.setItem("safescape-reduce-motion", String(newValue)), 0);
      return newValue;
    });
  }, []);

  const setTextSize = React.useCallback((value: TextSize) => {
    setTextSizeState(value);
    setTimeout(() => localStorage.setItem("safescape-text-size", value), 0);
  }, []);

  const setIsDarkMode = React.useCallback((value: boolean) => {
    setIsDarkModeState(value);
    setTimeout(() => localStorage.setItem("safescape-dark-mode", String(value)), 0);
  }, []);

  const toggleDarkMode = React.useCallback(() => {
    setIsDarkModeState(prev => {
      const newValue = !prev;
      setTimeout(() => localStorage.setItem("safescape-dark-mode", String(newValue)), 0);
      return newValue;
    });
  }, []);

  // Sync the CSS class on <html> for global CSS animation kill-switch
  useEffect(() => {
    const root = document.documentElement;
    if (reduceMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }
  }, [reduceMotion]);

  // Sync dark mode class
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Sync text-size class on <html> for global CSS scaling
  useEffect(() => {
    // Use requestAnimationFrame to let React finish the button state update first
    const frame = requestAnimationFrame(() => {
      const root = document.documentElement;
      
      // Update classes
      root.classList.remove("text-size-normal", "text-size-large", "text-size-xlarge");
      root.classList.add(`text-size-${textSize}`);
      
      // Update inline style for legacy/fallback
      if (textSize === 'xlarge') {
        root.style.fontSize = '20px';
      } else if (textSize === 'large') {
        root.style.fontSize = '18px';
      } else {
        root.style.fontSize = '';
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [textSize]);

  const value = React.useMemo(() => ({
    reduceMotion,
    setReduceMotion,
    toggleReduceMotion,
    textSize,
    setTextSize,
    isDarkMode,
    setIsDarkMode,
    toggleDarkMode
  }), [reduceMotion, setReduceMotion, toggleReduceMotion, textSize, setTextSize, isDarkMode, setIsDarkMode, toggleDarkMode]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
