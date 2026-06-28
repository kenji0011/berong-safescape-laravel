/**
 * Centralized audio utility that respects the volume settings
 * stored in localStorage by the SettingsContext.
 * 
 * Categories:
 * - general: UI sounds (clicks, taps, navigation)
 * - games: Game sound effects (win, lose, match, wrong, combo)
 * - music: Background music loops
 * - notification: Notification and alert sounds (finish, rank up)
 */

export type AudioCategory = 'general' | 'games' | 'music' | 'notification';

const VOLUME_KEYS: Record<AudioCategory, string> = {
  general: 'safescape-general-volume',
  games: 'safescape-games-volume',
  music: 'safescape-music-volume',
  notification: 'safescape-notification-volume',
};

/**
 * Get the volume for a given category (0–1 scale).
 * Reads directly from localStorage so it always gets the latest value,
 * even outside of React components.
 */
function getVolume(category: AudioCategory): number {
  const raw = localStorage.getItem(VOLUME_KEYS[category]);
  const percent = raw !== null ? parseInt(raw, 10) : 100;
  // Also apply general volume as a master multiplier
  const generalRaw = localStorage.getItem(VOLUME_KEYS.general);
  const generalPercent = generalRaw !== null ? parseInt(generalRaw, 10) : 100;
  
  if (category === 'general') {
    return Math.max(0, Math.min(1, percent / 100));
  }
  // For other categories, multiply by general (master) volume
  return Math.max(0, Math.min(1, (percent / 100) * (generalPercent / 100)));
}

/**
 * Play a sound file with the appropriate volume for its category.
 * Drop-in replacement for: new Audio(src).play()
 * 
 * Usage:
 *   playSound('/sounds/click.mp3', 'general');
 *   playSound('/sounds/win.mp3', 'games');
 */
export function playSound(src: string, category: AudioCategory = 'general'): void {
  try {
    const volume = getVolume(category);
    if (volume <= 0) return; // Don't even create the Audio object if muted
    
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => {});
  } catch {
    // Silently fail - audio is non-critical
  }
}

/**
 * Create an Audio element with volume pre-set for its category.
 * Useful when you need to keep a reference (e.g., for music loops).
 * 
 * Usage:
 *   const music = createAudio('/sounds/game_music.mp3', 'music');
 *   music.loop = true;
 *   music.play();
 */
export function createAudio(src: string, category: AudioCategory = 'general'): HTMLAudioElement {
  const audio = new Audio(src);
  audio.volume = getVolume(category);
  return audio;
}

/**
 * Update the volume of an existing Audio element based on its category.
 * Call this when settings change to update already-playing audio.
 */
export function updateAudioVolume(audio: HTMLAudioElement | null, category: AudioCategory): void {
  if (!audio) return;
  audio.volume = getVolume(category);
}
