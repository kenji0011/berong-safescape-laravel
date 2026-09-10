import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts YouTube video ID from various URL formats or returns the trimmed ID if already valid.
 */
export function getYouTubeId(urlOrId: string): string {
  if (!urlOrId) return ''
  const trimmed = urlOrId.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/|live\/)([^#\&\?]*).*/
  const match = trimmed.match(regExp)
  if (match && match[2] && match[2].length === 11) {
    return match[2]
  }
  try {
    const parsed = new URL(trimmed)
    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtube-nocookie.com')) {
      const v = parsed.searchParams.get('v')
      if (v && v.length === 11) return v
      const paths = parsed.pathname.split('/')
      const lastPath = paths[paths.length - 1]
      if (lastPath && lastPath.length === 11) return lastPath
    } else if (parsed.hostname.includes('youtu.be')) {
      const path = parsed.pathname.substring(1)
      if (path && path.length === 11) return path
    }
  } catch {
    // Ignore URL parsing errors
  }
  return trimmed
}

/**
 * Formats a date string into a human-readable relative time string (e.g. "5m ago", "2h ago", "3d ago").
 */
export function formatTimeAgo(dateStr?: string | null): string {
  if (!dateStr) return 'Recently added'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Recently added'

    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`
    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) return `${diffInMonths}mo ago`
    const diffInYears = Math.floor(diffInDays / 365)
    return `${diffInYears}y ago`
  } catch {
    return 'Recently added'
  }
}

/**
 * Formats a date string into standard localized date format.
 */
export function formatDate(dateString?: string | null, options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return ''
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('en-US', options ?? {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}
