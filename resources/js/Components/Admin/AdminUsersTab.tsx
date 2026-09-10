import React, { useState, useMemo, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Search, Users as UsersIcon, Trash2, ChevronLeft, ChevronRight, Filter, ChevronDown, X, Check } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/Components/ui/popover"
import { UserListSkeleton } from "@/Components/dashboard-skeletons"
import type { UsersTabProps } from "@/types/admin"

const USERS_PER_PAGE = 20

const PERMISSION_OPTIONS = [
  {
    id: "accessKids",
    label: "Kid Access",
    badgeClass: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700/50",
  },
  {
    id: "accessAdult",
    label: "Adult Access",
    badgeClass: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-400 border-teal-300 dark:border-teal-700/50",
  },
  {
    id: "accessProfessional",
    label: "Professional Access",
    badgeClass: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border-red-300 dark:border-red-700/50",
  },
  {
    id: "isAdmin",
    label: "Admin",
    badgeClass: "bg-slate-900 text-white dark:bg-slate-800 border-slate-700",
  },
] as const

export const AdminUsersTab: React.FC<UsersTabProps> = ({
  loading,
  users,
  filteredUsers,
  userSearchQuery,
  setUserSearchQuery,
  promptRoleChange
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const cardRef = useRef<HTMLDivElement>(null)

  const scrollToTop = () => {
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Count users per permission across filtered users
  const permissionCounts = useMemo(() => {
    const counts: Record<string, number> = {
      accessKids: 0,
      accessAdult: 0,
      accessProfessional: 0,
      isAdmin: 0,
    }
    filteredUsers.forEach((u) => {
      if (u.permissions?.accessKids) counts.accessKids++
      if (u.permissions?.accessAdult) counts.accessAdult++
      if (u.permissions?.accessProfessional) counts.accessProfessional++
      if (u.permissions?.isAdmin) counts.isAdmin++
    })
    return counts
  }, [filteredUsers])

  const togglePermission = (id: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  // Traditional filter: matches any selected permission
  const permissionFilteredUsers = useMemo(() => {
    if (selectedPermissions.length === 0) return filteredUsers

    return filteredUsers.filter((u) => {
      if (!u.permissions) return false
      return selectedPermissions.some((perm) => !!(u.permissions as any)[perm])
    })
  }, [filteredUsers, selectedPermissions])

  // Reset to page 1 when search query or permission filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [userSearchQuery, selectedPermissions])

  const totalPages = Math.max(1, Math.ceil(permissionFilteredUsers.length / USERS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const startIdx = (safePage - 1) * USERS_PER_PAGE
  const paginatedUsers = permissionFilteredUsers.slice(startIdx, startIdx + USERS_PER_PAGE)

  const resetFilters = () => {
    setSelectedPermissions([])
    setUserSearchQuery("")
  }

  return (
    <div ref={cardRef} className="scroll-mt-28">
      <div className="rounded-[1.75rem] sm:rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-700 shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] overflow-hidden bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md transition-all p-6 sm:p-7 md:p-8 flex flex-col gap-5 sm:gap-6">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 p-2 sm:p-2.5 rounded-xl shadow-sm shrink-0">
              <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#d60000]" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight truncate">
                System Users
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5 line-clamp-1">
                Manage user roles and access permissions · {permissionFilteredUsers.length} user{permissionFilteredUsers.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 lg:flex lg:items-center gap-2 sm:gap-3 w-full lg:w-auto mt-1 lg:mt-0">
            {/* Traditional Permission Filter Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`inline-flex items-center justify-between gap-2 h-10 sm:h-11 px-3.5 text-xs sm:text-sm font-extrabold rounded-xl border-2 transition-all backdrop-blur-sm cursor-pointer w-full lg:w-56 shadow-2xs group ${
                    selectedPermissions.length > 0
                      ? "bg-red-50 dark:bg-red-950/30 border-red-500 text-red-600 dark:text-red-400 ring-2 ring-red-500/20"
                      : "bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Filter className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 transition-colors ${selectedPermissions.length > 0 ? "text-[#d60000]" : "text-slate-400 dark:text-slate-500"}`} />
                    <span className="truncate">
                      {selectedPermissions.length === 0
                        ? "All Permissions"
                        : selectedPermissions.length === 1
                        ? PERMISSION_OPTIONS.find((p) => p.id === selectedPermissions[0])?.label
                        : `${selectedPermissions.length} Selected`}
                    </span>
                  </div>
                  {selectedPermissions.length > 0 ? (
                    <span className="flex items-center justify-center h-4.5 px-1.5 text-[10px] font-black rounded-full bg-[#d60000] text-white shrink-0 shadow-xs">
                      {selectedPermissions.length}
                    </span>
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500 group-data-[state=open]:rotate-180 transition-transform duration-200" />
                  )}
                </button>
              </PopoverTrigger>

              <PopoverContent
                align="end"
                className="w-72 p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl space-y-2.5 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
              >
                {/* Popover Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-[#d60000]" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Filter Permissions
                    </span>
                  </div>
                  {selectedPermissions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedPermissions([])}
                      className="text-xs font-bold text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* "All Permissions" Option */}
                <div
                  onClick={() => setSelectedPermissions([])}
                  className={`flex items-center justify-between p-2 rounded-xl border-2 transition-all cursor-pointer select-none ${
                    selectedPermissions.length === 0
                      ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-2xs font-black text-slate-900 dark:text-white"
                      : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-bold"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                      selectedPermissions.length === 0
                        ? "bg-[#d60000] border-[#d60000] text-white"
                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    }`}>
                      {selectedPermissions.length === 0 && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-extrabold">All Permissions</span>
                  </div>
                  <span className="text-xs font-black text-slate-400 dark:text-slate-500">
                    {filteredUsers.length}
                  </span>
                </div>

                {/* Permission Options */}
                <div className="space-y-1">
                  {PERMISSION_OPTIONS.map((option) => {
                    const isChecked = selectedPermissions.includes(option.id)
                    const count = permissionCounts[option.id] || 0

                    return (
                      <div
                        key={option.id}
                        onClick={() => togglePermission(option.id)}
                        className={`flex items-center justify-between p-2 rounded-xl border-2 transition-all cursor-pointer select-none ${
                          isChecked
                            ? "bg-red-50/70 dark:bg-red-950/30 border-red-300 dark:border-red-800/60 shadow-2xs"
                            : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all shrink-0 ${
                              isChecked
                                ? "bg-[#d60000] border-[#d60000] text-white"
                                : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md border ${option.badgeClass}`}>
                            {option.label}
                          </span>
                        </div>
                        <span className="text-xs font-black text-slate-400 dark:text-slate-500">
                          {count}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {/* Search Bar */}
            <div className="relative group w-full lg:w-64 xl:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 group-focus-within:text-[#d60000] dark:group-focus-within:text-red-400 transition-colors" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-8 h-10 sm:h-11 text-xs sm:text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/80 backdrop-blur-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/20 font-bold transition-all hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs"
              />
              {userSearchQuery && (
                <button
                  type="button"
                  onClick={() => setUserSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md cursor-pointer"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* User List Content */}
        <div className="space-y-4">
          {loading ? (
            <UserListSkeleton count={6} />
          ) : paginatedUsers.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white/30 dark:bg-slate-900/30 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 font-bold text-base mb-2">
                No users found matching your filters.
              </p>
              {(selectedPermissions.length > 0 || userSearchQuery !== "") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all cursor-pointer"
                >
                  Reset Filters & Search
                </button>
              )}
            </div>
          ) : (
            paginatedUsers.map((u) => (
              <div key={u.id} className="group p-4 sm:p-5 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm hover:shadow-[0_4px_0_#e2e8f0] dark:hover:shadow-[0_4px_0_#0f172a] hover:-translate-y-0.5 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* User Details */}
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                      <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-300 dark:border-slate-700 text-slate-650 dark:text-slate-350 font-black text-base sm:text-lg shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        {/* Display Name */}
                        <h4 className="font-black text-slate-800 dark:text-white truncate text-base sm:text-lg leading-tight w-full mb-1">
                          {u.name}
                        </h4>
                        
                        {/* Info Row (Email, Username, Role) */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-slate-500 dark:text-slate-400">
                          {/* Email */}
                          <span className="text-xs font-semibold truncate max-w-[220px] sm:max-w-xs">{u.email}</span>
                          
                          {/* Separator (desktop only) */}
                          <span className="hidden sm:inline text-slate-305 dark:text-slate-650">•</span>
                          
                          {/* Username and Role Badge */}
                          <div className="flex items-center gap-2 mt-0.5 sm:mt-0">
                            <span className="text-xs font-semibold truncate">@{u.username}</span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-500 uppercase tracking-wider shrink-0 select-none">
                              {u.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Access Permissions Controls */}
                    <div className="w-full lg:w-auto grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => promptRoleChange(u.id, "accessKids", u.name, u.permissions.accessKids ? "remove" : "add")}
                        className={`inline-flex items-center justify-center font-extrabold px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl text-[11px] sm:text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                          u.permissions.accessKids
                            ? "bg-yellow-500 hover:bg-yellow-600 text-yellow-950 shadow-[0_3px_0_#b45309] dark:bg-yellow-600 dark:hover:bg-yellow-500 dark:text-yellow-950 dark:shadow-[0_3px_0_#78350f] active:translate-y-[3px] active:shadow-none"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-[0_3px_0_#cbd5e1] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 dark:shadow-[0_3px_0_#0f172a] active:translate-y-[3px] active:shadow-none"
                        }`}
                      >
                        <span className="truncate">Kids</span>
                        {u.permissions.accessKids && <Check className="h-3.5 w-3.5 ml-1.5 shrink-0" strokeWidth={3} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => promptRoleChange(u.id, "accessAdult", u.name, u.permissions.accessAdult ? "remove" : "add")}
                        className={`inline-flex items-center justify-center font-extrabold px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl text-[11px] sm:text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                          u.permissions.accessAdult
                            ? "bg-teal-600 hover:bg-teal-700 text-white shadow-[0_3px_0_#0f766e] dark:bg-teal-700 dark:hover:bg-teal-600 dark:text-white dark:shadow-[0_3px_0_#115e59] active:translate-y-[3px] active:shadow-none"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-[0_3px_0_#cbd5e1] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 dark:shadow-[0_3px_0_#0f172a] active:translate-y-[3px] active:shadow-none"
                        }`}
                      >
                        <span className="truncate">Adults</span>
                        {u.permissions.accessAdult && <Check className="h-3.5 w-3.5 ml-1.5 shrink-0" strokeWidth={3} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => promptRoleChange(u.id, "accessProfessional", u.name, u.permissions.accessProfessional ? "remove" : "add")}
                        className={`inline-flex items-center justify-center font-extrabold px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl text-[11px] sm:text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                          u.permissions.accessProfessional
                            ? "bg-[#d60000] hover:bg-red-700 text-white shadow-[0_3px_0_#991b1b] dark:bg-red-700 dark:hover:bg-red-600 dark:text-white dark:shadow-[0_3px_0_#7f1d1d] active:translate-y-[3px] active:shadow-none"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-[0_3px_0_#cbd5e1] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 dark:shadow-[0_3px_0_#0f172a] active:translate-y-[3px] active:shadow-none"
                        }`}
                      >
                        <span className="truncate">Pro</span>
                        {u.permissions.accessProfessional && <Check className="h-3.5 w-3.5 ml-1.5 shrink-0" strokeWidth={3} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => promptRoleChange(u.id, "isAdmin", u.name, u.permissions.isAdmin ? "remove" : "add")}
                        className={`inline-flex items-center justify-center font-extrabold px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl text-[11px] sm:text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                          u.permissions.isAdmin
                            ? "bg-slate-900 hover:bg-slate-800 text-white shadow-[0_3px_0_#020617] dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 dark:shadow-[0_3px_0_#94a3b8] active:translate-y-[3px] active:shadow-none"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-[0_3px_0_#cbd5e1] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 dark:shadow-[0_3px_0_#0f172a] active:translate-y-[3px] active:shadow-none"
                        }`}
                      >
                        <span className="truncate">Admin</span>
                        {u.permissions.isAdmin && <Check className="h-3.5 w-3.5 ml-1.5 shrink-0" strokeWidth={3} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {permissionFilteredUsers.length > USERS_PER_PAGE && (
            <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t-2 border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); setTimeout(scrollToTop, 50); }}
                disabled={safePage <= 1}
                className="inline-flex items-center gap-1.5 font-extrabold px-4 pb-2 pt-2.5 rounded-xl text-sm transition-all bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-[0_4px_0_#e2e8f0] dark:shadow-[0_4px_0_#0f172a] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#e2e8f0] dark:hover:shadow-[0_6px_0_#0f172a] active:translate-y-1 active:shadow-[0_0px_0_#e2e8f0] disabled:opacity-40 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-[0_4px_0_#e2e8f0]"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={3} />
                Previous
              </button>
              <span className="text-sm font-black text-slate-500 dark:text-slate-400 px-2">
                Page {safePage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); setTimeout(scrollToTop, 50); }}
                disabled={safePage >= totalPages}
                className="inline-flex items-center gap-1.5 font-extrabold px-4 pb-2 pt-2.5 rounded-xl text-sm transition-all bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-[0_4px_0_#e2e8f0] dark:shadow-[0_4px_0_#0f172a] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#e2e8f0] dark:hover:shadow-[0_6px_0_#0f172a] active:translate-y-1 active:shadow-[0_0px_0_#e2e8f0] disabled:opacity-40 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-[0_4px_0_#e2e8f0]"
              >
                Next
                <ChevronRight className="h-4 w-4" strokeWidth={3} />
              </button>
            </div>
          )}
      </div>
    </div>
  )
}
