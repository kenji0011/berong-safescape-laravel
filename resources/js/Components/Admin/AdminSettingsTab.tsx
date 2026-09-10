import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Label } from "@/Components/ui/label"
import { Input } from "@/Components/ui/input"
import { Textarea } from "@/Components/ui/textarea"
import { Button } from "@/Components/ui/button"
import { AlertCircle, CheckCircle, ShieldAlert, Loader2, Save, Power, Megaphone } from "lucide-react"
import { apiFetch } from "@/lib/api-fetch"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/Components/ui/alert-dialog"

export const AdminSettingsTab: React.FC = () => {
  const [maintenance, setMaintenance] = useState({
    is_active: false,
    message: "",
    warning_active: false,
    warning_message: "",
    scheduled_at: null as string | null,
    duration_minutes: 15,
    maintenance_duration_minutes: 30,
    maintenance_until: null as string | null
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tabError, setTabError] = useState("")
  const [tabSuccess, setTabSuccess] = useState("")
  
  // Password Confirmation Dialog
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const fetchSettings = async () => {
    setLoading(true)
    setTabError("")
    try {
      const response = await apiFetch("/api/admin/settings/maintenance")
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.settings) {
          setMaintenance({
            is_active: !!data.settings.is_active,
            message: data.settings.message || "",
            warning_active: !!data.settings.warning_active,
            warning_message: data.settings.warning_message || "",
            scheduled_at: data.settings.scheduled_at || null,
            duration_minutes: data.settings.duration_minutes || 15,
            maintenance_duration_minutes: data.settings.maintenance_duration_minutes || 30,
            maintenance_until: data.settings.maintenance_until || null
          })
        }
      } else {
        setTabError("Failed to load maintenance configurations.")
      }
    } catch (err) {
      console.error("Error fetching settings:", err)
      setTabError("Failed to connect to system settings API.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleToggleWarning = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setTabError("")
    setTabSuccess("")

    const nextWarningActive = !maintenance.warning_active;
    const duration = parseInt(maintenance.duration_minutes as any, 10) || 15;
    const scheduledAt = nextWarningActive 
      ? new Date(Date.now() + duration * 60 * 1000).toISOString()
      : null;

    try {
      const response = await apiFetch("/api/admin/settings/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_active: maintenance.is_active,
          message: maintenance.message,
          warning_active: nextWarningActive,
          warning_message: maintenance.warning_message,
          scheduled_at: scheduledAt,
          duration_minutes: duration,
          maintenance_duration_minutes: maintenance.maintenance_duration_minutes,
          maintenance_until: maintenance.maintenance_until
        })
      })

      const data = await response.json()
      if (response.ok && data.success) {
        setMaintenance({
          is_active: !!data.settings.is_active,
          message: data.settings.message || "",
          warning_active: !!data.settings.warning_active,
          warning_message: data.settings.warning_message || "",
          scheduled_at: data.settings.scheduled_at || null,
          duration_minutes: data.settings.duration_minutes || 15,
          maintenance_duration_minutes: data.settings.maintenance_duration_minutes || 30,
          maintenance_until: data.settings.maintenance_until || null
        })
        setTabSuccess(data.settings.warning_active ? "Warning banner enabled successfully." : "Warning banner disabled successfully.")
      } else {
        setTabError(data.errors?.warning_message?.[0] || data.message || "Failed to update alert configurations.")
      }
    } catch (err) {
      console.error("Error updating settings:", err)
      setTabError("Network error occurred.")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveWarningText = async () => {
    setSaving(true)
    setTabError("")
    setTabSuccess("")

    try {
      const response = await apiFetch("/api/admin/settings/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_active: maintenance.is_active,
          message: maintenance.message,
          warning_active: maintenance.warning_active,
          warning_message: maintenance.warning_message,
          scheduled_at: maintenance.scheduled_at,
          duration_minutes: parseInt(maintenance.duration_minutes as any, 10) || 15,
          maintenance_duration_minutes: maintenance.maintenance_duration_minutes,
          maintenance_until: maintenance.maintenance_until
        })
      })

      const data = await response.json()
      if (response.ok && data.success) {
        setMaintenance({
          is_active: !!data.settings.is_active,
          message: data.settings.message || "",
          warning_active: !!data.settings.warning_active,
          warning_message: data.settings.warning_message || "",
          scheduled_at: data.settings.scheduled_at || null,
          duration_minutes: data.settings.duration_minutes || 15,
          maintenance_duration_minutes: data.settings.maintenance_duration_minutes || 30,
          maintenance_until: data.settings.maintenance_until || null
        })
        setTabSuccess("Warning message content saved successfully.")
      } else {
        setTabError(data.errors?.warning_message?.[0] || data.message || "Failed to save alert content.")
      }
    } catch (err) {
      console.error("Error saving warning text:", err)
      setTabError("Network error occurred.")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleMaintenanceClick = () => {
    setTabError("")
    setTabSuccess("")
    
    // If enabling maintenance mode, prompt for password confirmation
    if (!maintenance.is_active) {
      setAdminPassword("")
      setPasswordError("")
      setShowPasswordDialog(true)
    } else {
      // Disabling maintenance mode can be saved immediately
      saveMaintenanceMode(false)
    }
  }

  const handleConfirmMaintenanceMode = async () => {
    if (!adminPassword) {
      setPasswordError("Please enter your password.")
      return
    }

    setPasswordError("")
    saveMaintenanceMode(true)
  }

  const saveMaintenanceMode = async (isActive: boolean) => {
    setSaving(true)
    
    try {
      const nextMaintenanceUntil = isActive 
        ? new Date(Date.now() + (parseInt(maintenance.maintenance_duration_minutes as any, 10) || 30) * 60 * 1000).toISOString()
        : null;

      const payload: any = {
        is_active: isActive,
        message: maintenance.message,
        // Make the warning banner automatically disappear when the system lockout is activated
        warning_active: isActive ? false : maintenance.warning_active,
        warning_message: maintenance.warning_message,
        scheduled_at: isActive ? null : maintenance.scheduled_at,
        duration_minutes: parseInt(maintenance.duration_minutes as any, 10) || 15,
        maintenance_duration_minutes: parseInt(maintenance.maintenance_duration_minutes as any, 10) || 30,
        maintenance_until: nextMaintenanceUntil
      }

      if (isActive) {
        payload.password = adminPassword
      }

      const response = await apiFetch("/api/admin/settings/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      if (response.ok && data.success) {
        setMaintenance({
          is_active: !!data.settings.is_active,
          message: data.settings.message || "",
          warning_active: !!data.settings.warning_active,
          warning_message: data.settings.warning_message || "",
          scheduled_at: data.settings.scheduled_at || null,
          duration_minutes: data.settings.duration_minutes || 15,
          maintenance_duration_minutes: data.settings.maintenance_duration_minutes || 30,
          maintenance_until: data.settings.maintenance_until || null
        })
        setTabSuccess(isActive ? "System is now in MAINTENANCE MODE." : "System is now ONLINE.")
        setShowPasswordDialog(false)
      } else {
        if (isActive && data.errors?.password) {
          setPasswordError(data.errors.password[0])
        } else {
          setTabError(data.message || "Failed to update maintenance settings.")
          setShowPasswordDialog(false)
        }
      }
    } catch (err) {
      console.error("Error setting maintenance status:", err)
      setTabError("Network error occurred.")
      setShowPasswordDialog(false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 animate-pulse">
        <Loader2 className="h-10 w-10 text-[#d60000] animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold">Fetching Maintenance settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      
      {/* Alert Feedbacks */}
      {tabSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{tabSuccess}</span>
        </div>
      )}

      {tabError && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 flex items-center gap-3 text-rose-600 dark:text-rose-400 font-bold text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{tabError}</span>
        </div>
      )}

      {/* Grid containing Warning Alert Control & Maintenance Control */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 1: Warning Alerts Settings */}
        <div className="rounded-[1.75rem] sm:rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] overflow-hidden bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md transition-all p-6 sm:p-7 md:p-8 flex flex-col gap-5 sm:gap-6">
          {/* Header Row */}
          <div className="flex items-center gap-3">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 p-2 sm:p-2.5 rounded-xl shadow-sm shrink-0">
              <Megaphone className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Warning Banner</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">Alert active users before shutdown</p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 flex flex-col justify-between gap-4">
            <div className="bg-amber-500/10 dark:bg-amber-950/30 border-2 border-amber-500/20 dark:border-amber-900/40 rounded-xl p-3.5 sm:p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Banner Notice Status</span>
                <button
                  onClick={handleToggleWarning}
                  disabled={saving}
                  className={`px-3.5 py-1.5 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer ${
                    maintenance.warning_active 
                      ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_2px_0_#b45309]" 
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 shadow-[0_2px_0_#94a3b8]"
                  }`}
                >
                  {maintenance.warning_active ? "Enabled" : "Disabled"}
                </button>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                When enabled, all users browsing SafeScape will see a warning header at the bottom of the page in real-time.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <Label htmlFor="warning-duration" className="font-bold text-slate-700 dark:text-slate-300">Countdown Duration (Minutes)</Label>
              <Input
                id="warning-duration"
                type="number"
                min={1}
                max={1440}
                value={(maintenance.duration_minutes as any) === "" ? "" : (maintenance.duration_minutes || 15)}
                onChange={(e) => {
                  const val = e.target.value;
                  setMaintenance({ 
                    ...maintenance, 
                    duration_minutes: val === "" ? "" as any : parseInt(val, 10) 
                  });
                }}
                placeholder="15"
                className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white rounded-xl focus-visible:ring-amber-500 font-bold h-11"
              />
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 leading-tight">
                Sets the countdown timer displayed in the live warning banner before the lockout undergoes.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <Label htmlFor="warning-message-text" className="font-bold text-slate-700 dark:text-slate-300">Warning Alert Text</Label>
              <Textarea
                id="warning-message-text"
                rows={3}
                value={maintenance.warning_message}
                onChange={(e) => setMaintenance({ ...maintenance, warning_message: e.target.value })}
                placeholder="Alert message details..."
                className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white rounded-xl focus-visible:ring-amber-500 font-medium resize-none"
              />
            </div>

            <div className="pt-2 mt-auto">
              <button
                onClick={handleSaveWarningText}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider text-xs cursor-pointer"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" strokeWidth={2.5} />}
                Save Alert Notice
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: Maintenance Mode settings */}
        <div className={`rounded-[1.75rem] sm:rounded-[2rem] border-[3px] shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] transition-all duration-300 bg-slate-50 dark:bg-slate-800/50 overflow-hidden p-6 sm:p-7 md:p-8 flex flex-col gap-5 sm:gap-6 ${
          maintenance.is_active 
            ? "border-red-500/50 shadow-red-500/10 dark:border-red-500/30" 
            : "border-slate-200 dark:border-slate-700"
        }`}>
          {/* Header Row */}
          <div className="flex items-center gap-3">
            <div className={`border-2 backdrop-blur-sm p-2 sm:p-2.5 rounded-xl shadow-sm shrink-0 ${
              maintenance.is_active 
                ? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800/50" 
                : "bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700"
            }`}>
              <ShieldAlert className={`h-5 w-5 sm:h-6 sm:w-6 ${maintenance.is_active ? "text-red-500" : "text-slate-500 dark:text-slate-400"}`} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Maintenance Mode</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">Toggle live user platform lockout</p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 flex flex-col justify-between gap-4">
            <div className={`border-2 rounded-xl p-3.5 sm:p-4 space-y-2.5 ${
              maintenance.is_active 
                ? "bg-red-500/10 border-red-500/20" 
                : "bg-slate-100/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/80"
            }`}>
              <div className="flex items-center justify-between gap-3">
                <span className={`text-xs font-black uppercase tracking-wider ${
                  maintenance.is_active ? "text-red-500" : "text-slate-700 dark:text-slate-300"
                }`}>System Lockout Status</span>
                <button
                  onClick={handleToggleMaintenanceClick}
                  disabled={saving}
                  className={`px-3.5 py-1.5 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer ${
                    maintenance.is_active 
                      ? "bg-red-600 hover:bg-red-500 text-white shadow-[0_2px_0_#991b1b]" 
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 shadow-[0_2px_0_#94a3b8]"
                  }`}
                >
                  {maintenance.is_active ? "Active" : "Offline"}
                </button>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                When active, all non-admin users will immediately be blocked and redirected to the Maintenance message.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <Label htmlFor="maintenance-duration" className="font-bold text-slate-700 dark:text-slate-300">Estimated Duration (Minutes)</Label>
              <Input
                id="maintenance-duration"
                type="number"
                min={1}
                max={1440}
                value={(maintenance.maintenance_duration_minutes as any) === "" ? "" : (maintenance.maintenance_duration_minutes || 30)}
                onChange={(e) => {
                  const val = e.target.value;
                  setMaintenance({ 
                    ...maintenance, 
                    maintenance_duration_minutes: val === "" ? "" as any : parseInt(val, 10) 
                  });
                }}
                placeholder="30"
                className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white rounded-xl focus-visible:ring-red-500 font-bold h-11"
              />
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 leading-tight">
                Sets the countdown timer displayed on the live Maintenance screen for locked out users.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <Label htmlFor="maintenance-message-text" className="font-bold text-slate-700 dark:text-slate-300">Lockout Page Display Message</Label>
              <Textarea
                id="maintenance-message-text"
                rows={3}
                value={maintenance.message}
                onChange={(e) => setMaintenance({ ...maintenance, message: e.target.value })}
                placeholder="Lockout message details..."
                className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white rounded-xl focus-visible:ring-red-500 font-medium resize-none"
              />
            </div>

            <div className="pt-2 mt-auto">
              <button
                onClick={handleToggleMaintenanceClick}
                disabled={saving}
                className={`w-full inline-flex items-center justify-center gap-2 font-black py-3 rounded-xl hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider text-xs cursor-pointer ${
                  maintenance.is_active 
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_0_#047857]" 
                    : "bg-[#d60000] hover:bg-red-500 text-white shadow-[0_4px_0_#991b1b]"
                }`}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : maintenance.is_active ? (
                  <>
                    <Power className="h-4 w-4" strokeWidth={2.5} />
                    Set System Online
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4" strokeWidth={2.5} />
                    Enable Maintenance Mode
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Verification Password Confirmation Dialog */}
      <AlertDialog open={showPasswordDialog} onOpenChange={(open) => { if (!open && !saving) setShowPasswordDialog(false) }}>
        <AlertDialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-[3px] border-red-500/30 rounded-[2rem] shadow-2xl max-w-md w-full">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-red-600 dark:text-red-500 tracking-tight flex items-center gap-2">
              <ShieldAlert className="h-6 w-6" />
              CONFIRM SYSTEM LOCKOUT
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400 font-bold text-sm mt-2">
              You are about to put the platform into **Maintenance Mode**. All active users will be locked out and unable to use the site. 
              <br/><br/>
              To prevent accidental downtime, please verify your **Administrator Password**:
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Label htmlFor="maint-admin-password" className="font-bold text-slate-700 dark:text-slate-300 text-sm">Admin Password</Label>
            <Input
              id="maint-admin-password"
              type="password"
              placeholder="Confirm password"
              value={adminPassword}
              autoComplete="new-password"
              onChange={(e) => {
                setAdminPassword(e.target.value)
                setPasswordError("")
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmMaintenanceMode() }}
              autoFocus
              className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus-visible:ring-red-500 rounded-xl mt-1.5"
            />
            {passwordError && (
              <p className="text-xs font-black text-red-600 dark:text-red-400 mt-2 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {passwordError}
              </p>
            )}
          </div>
          
          <AlertDialogFooter className="gap-3 mt-2">
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => setShowPasswordDialog(false)}
              className="rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all h-11"
            >
              Cancel
            </Button>
            <button
              onClick={handleConfirmMaintenanceMode}
              disabled={saving || !adminPassword}
              className="rounded-xl font-black h-11 px-6 transition-all shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-none bg-red-600 text-white hover:bg-red-500 border-none disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Enable Lockout"}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
