import React, { createContext, useContext, useEffect, useState } from "react";

export type TextSize = 'normal' | 'large' | 'xlarge';

interface SettingsContextType {
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;
  toggleReduceMotion: () => void;
  textSize: TextSize;
  setTextSize: (value: TextSize) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [reduceMotion, setReduceMotionState] = useState<boolean>(false);
  const [textSize, setTextSizeState] = useState<TextSize>('normal');

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
  }, []);

  // Sync the CSS class on <html> for global CSS animation kill-switch
  useEffect(() => {
    if (reduceMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
  }, [reduceMotion]);

  // Sync text-size class on <html> for global CSS scaling
  useEffect(() => {
    document.documentElement.classList.remove("text-size-normal", "text-size-large", "text-size-xlarge");
    document.documentElement.classList.add(`text-size-${textSize}`);
    // Also set inline style as immediate fallback
    if (textSize === 'xlarge') {
      document.documentElement.style.fontSize = '20px';
    } else if (textSize === 'large') {
      document.documentElement.style.fontSize = '18px';
    } else {
      document.documentElement.style.fontSize = '';
    }
  }, [textSize]);

  const setReduceMotion = (value: boolean) => {
    setReduceMotionState(value);
    localStorage.setItem("safescape-reduce-motion", String(value));
  };

  const toggleReduceMotion = () => {
    setReduceMotion(!reduceMotion);
  };

  const setTextSize = (value: TextSize) => {
    setTextSizeState(value);
    localStorage.setItem("safescape-text-size", value);
  };

  return (
    <SettingsContext.Provider value={{ reduceMotion, setReduceMotion, toggleReduceMotion, textSize, setTextSize }}>
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
