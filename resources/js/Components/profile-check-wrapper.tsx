"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useAuth } from "@/lib/auth-context"
import { trackDailyLogin } from "@/lib/engagement-tracker"

const ProfileCompletionModal = React.lazy(() =>
  import("@/Components/Modals/profile-completion-modal").then((m) => ({ default: m.ProfileCompletionModal }))
)

interface ProfileCheckWrapperProps {
  children: React.ReactNode
}

export function ProfileCheckWrapper({ children }: ProfileCheckWrapperProps) {
  const { user, isLoading } = useAuth()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Check if user needs to complete profile
    if (!isLoading && user && !user?.permissions?.isAdmin) {
      // Check profileCompleted flag
      if (user.profileCompleted === false) {
        setShowModal(true)
      }
      
      // Track daily login at most once per calendar day per user (persisted across reloads)
      const todayKey = `safescape_daily_login_${user.id}_${new Date().toISOString().slice(0, 10)}`
      try {
        if (!localStorage.getItem(todayKey)) {
          localStorage.setItem(todayKey, "1")
          trackDailyLogin().catch(() => {
            try { localStorage.removeItem(todayKey) } catch {}
          })
        }
      } catch {
        trackDailyLogin()
      }
    }
  }, [user, isLoading])

  const handleProfileComplete = () => {
    setShowModal(false)
    // Refresh page to update user data
    window.location.reload()
  }

  if (isLoading) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      {showModal && user && (
        <Suspense fallback={null}>
          <ProfileCompletionModal
            isOpen={showModal}
            onComplete={handleProfileComplete}
          />
        </Suspense>
      )}
    </>
  )
}
