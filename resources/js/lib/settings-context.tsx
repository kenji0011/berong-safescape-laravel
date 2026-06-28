import React, { createContext, useContext, useEffect, useState } from "react";

export type TextSize = 'normal' | 'large' | 'xlarge';
export type ColorBlindness = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

interface SettingsContextType {
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;
  toggleReduceMotion: () => void;
  textSize: TextSize;
  setTextSize: (value: TextSize) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  toggleDarkMode: () => void;
  dyslexiaFont: boolean;
  setDyslexiaFont: (value: boolean) => void;
  toggleDyslexiaFont: () => void;
  focusMode: boolean;
  setFocusMode: (value: boolean) => void;
  toggleFocusMode: () => void;
  colorBlindness: ColorBlindness;
  setColorBlindness: (value: ColorBlindness) => void;
  magnifyingMouse: boolean;
  setMagnifyingMouse: (value: boolean) => void;
  toggleMagnifyingMouse: () => void;
  generalVolume: number;
  setGeneralVolume: (value: number) => void;
  gamesVolume: number;
  setGamesVolume: (value: number) => void;
  musicVolume: number;
  setMusicVolume: (value: number) => void;
  notificationVolume: number;
  setNotificationVolume: (value: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [reduceMotion, setReduceMotionState] = useState<boolean>(false);
  const [textSize, setTextSizeState] = useState<TextSize>('normal');
  const [isDarkMode, setIsDarkModeState] = useState<boolean>(false);
  const [dyslexiaFont, setDyslexiaFontState] = useState<boolean>(false);
  const [focusMode, setFocusModeState] = useState<boolean>(false);
  const [colorBlindness, setColorBlindnessState] = useState<ColorBlindness>('none');
  const [magnifyingMouse, setMagnifyingMouseState] = useState<boolean>(false);

  const [generalVolume, setGeneralVolumeState] = useState<number>(100);
  const [gamesVolume, setGamesVolumeState] = useState<number>(100);
  const [musicVolume, setMusicVolumeState] = useState<number>(100);
  const [notificationVolume, setNotificationVolumeState] = useState<number>(100);

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
    
    const savedDyslexia = localStorage.getItem("safescape-dyslexia-font");
    if (savedDyslexia !== null) {
      setDyslexiaFontState(savedDyslexia === "true");
    }

    const savedFocus = localStorage.getItem("safescape-focus-mode");
    if (savedFocus !== null) {
      setFocusModeState(savedFocus === "true");
    }

    const savedColorBlindness = localStorage.getItem("safescape-color-blindness") as ColorBlindness | null;
    if (savedColorBlindness && ['none', 'protanopia', 'deuteranopia', 'tritanopia'].includes(savedColorBlindness)) {
      setColorBlindnessState(savedColorBlindness);
    }

    const savedMagnifyingMouse = localStorage.getItem("safescape-magnifying-mouse");
    if (savedMagnifyingMouse !== null) {
      setMagnifyingMouseState(savedMagnifyingMouse === "true");
    }

    const savedGeneral = localStorage.getItem("safescape-general-volume");
    if (savedGeneral !== null) setGeneralVolumeState(parseInt(savedGeneral, 10));

    const savedGames = localStorage.getItem("safescape-games-volume");
    if (savedGames !== null) setGamesVolumeState(parseInt(savedGames, 10));

    const savedMusic = localStorage.getItem("safescape-music-volume");
    if (savedMusic !== null) setMusicVolumeState(parseInt(savedMusic, 10));

    const savedNotification = localStorage.getItem("safescape-notification-volume");
    if (savedNotification !== null) setNotificationVolumeState(parseInt(savedNotification, 10));
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

  const setDyslexiaFont = React.useCallback((value: boolean) => {
    setDyslexiaFontState(value);
    setTimeout(() => localStorage.setItem("safescape-dyslexia-font", String(value)), 0);
  }, []);

  const toggleDyslexiaFont = React.useCallback(() => {
    setDyslexiaFontState(prev => {
      const newValue = !prev;
      setTimeout(() => localStorage.setItem("safescape-dyslexia-font", String(newValue)), 0);
      return newValue;
    });
  }, []);

  const setFocusMode = React.useCallback((value: boolean) => {
    setFocusModeState(value);
    setTimeout(() => localStorage.setItem("safescape-focus-mode", String(value)), 0);
  }, []);

  const toggleFocusMode = React.useCallback(() => {
    setFocusModeState(prev => {
      const newValue = !prev;
      setTimeout(() => localStorage.setItem("safescape-focus-mode", String(newValue)), 0);
      return newValue;
    });
  }, []);

  const setColorBlindness = React.useCallback((value: ColorBlindness) => {
    setColorBlindnessState(value);
    setTimeout(() => localStorage.setItem("safescape-color-blindness", value), 0);
  }, []);

  const setMagnifyingMouse = React.useCallback((value: boolean) => {
    setMagnifyingMouseState(value);
    setTimeout(() => localStorage.setItem("safescape-magnifying-mouse", String(value)), 0);
  }, []);

  const toggleMagnifyingMouse = React.useCallback(() => {
    setMagnifyingMouseState(prev => {
      const newValue = !prev;
      setTimeout(() => localStorage.setItem("safescape-magnifying-mouse", String(newValue)), 0);
      return newValue;
    });
  }, []);

  const setGeneralVolume = React.useCallback((value: number) => {
    setGeneralVolumeState(value);
    setTimeout(() => localStorage.setItem("safescape-general-volume", String(value)), 0);
  }, []);

  const setGamesVolume = React.useCallback((value: number) => {
    setGamesVolumeState(value);
    setTimeout(() => localStorage.setItem("safescape-games-volume", String(value)), 0);
  }, []);

  const setMusicVolume = React.useCallback((value: number) => {
    setMusicVolumeState(value);
    setTimeout(() => localStorage.setItem("safescape-music-volume", String(value)), 0);
  }, []);

  const setNotificationVolume = React.useCallback((value: number) => {
    setNotificationVolumeState(value);
    setTimeout(() => localStorage.setItem("safescape-notification-volume", String(value)), 0);
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

  // Sync dyslexia font class
  useEffect(() => {
    const root = document.documentElement;
    if (dyslexiaFont) {
      root.classList.add("dyslexia-mode");
    } else {
      root.classList.remove("dyslexia-mode");
    }
  }, [dyslexiaFont]);

  // Sync focus mode class
  useEffect(() => {
    const root = document.documentElement;
    if (focusMode) {
      root.classList.add("focus-mode");
    } else {
      root.classList.remove("focus-mode");
    }
  }, [focusMode]);

  // Sync color blindness filter classes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("color-filter-protanopia", "color-filter-deuteranopia", "color-filter-tritanopia");
    if (colorBlindness !== 'none') {
      root.classList.add(`color-filter-${colorBlindness}`);
    }
  }, [colorBlindness]);



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
    toggleDarkMode,
    dyslexiaFont,
    setDyslexiaFont,
    toggleDyslexiaFont,
    focusMode,
    setFocusMode,
    toggleFocusMode,
    colorBlindness,
    setColorBlindness,
    magnifyingMouse,
    setMagnifyingMouse,
    toggleMagnifyingMouse,
    generalVolume,
    setGeneralVolume,
    gamesVolume,
    setGamesVolume,
    musicVolume,
    setMusicVolume,
    notificationVolume,
    setNotificationVolume
  }), [reduceMotion, setReduceMotion, toggleReduceMotion, textSize, setTextSize, isDarkMode, setIsDarkMode, toggleDarkMode, dyslexiaFont, setDyslexiaFont, toggleDyslexiaFont, focusMode, setFocusMode, toggleFocusMode, colorBlindness, setColorBlindness, magnifyingMouse, setMagnifyingMouse, toggleMagnifyingMouse, generalVolume, setGeneralVolume, gamesVolume, setGamesVolume, musicVolume, setMusicVolume, notificationVolume, setNotificationVolume]);

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
