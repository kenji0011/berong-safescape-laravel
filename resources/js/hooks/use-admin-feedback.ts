import { useState, useCallback } from "react"

/**
 * Hook to manage success/error feedback messages with auto-dismiss.
 * Consolidates the repeated success/error/setTimeout pattern used
 * across all admin CRUD operations.
 */
export function useAdminFeedback() {
  const [success, setSuccessRaw] = useState("")
  const [error, setError] = useState("")

  const setSuccess = useCallback((msg: string, duration = 3000) => {
    setSuccessRaw(msg)
    if (msg) {
      setTimeout(() => setSuccessRaw(""), duration)
    }
  }, [])

  const clearFeedback = useCallback(() => {
    setSuccessRaw("")
    setError("")
  }, [])

  return { success, error, setSuccess, setError, clearFeedback }
}
