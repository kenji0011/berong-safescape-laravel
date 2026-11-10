'use client';
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from 'axios';
import { Button } from "@/Components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { router } from '@inertiajs/react';
import { Badge } from "@/Components/ui/badge";
import { Bell, Check, MoreHorizontal, Trash2, ArrowRight, Trophy, X, ChevronDown, Shield, BookOpen, Play } from "lucide-react";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from 'motion/react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  category: string;
  isRead: boolean;
  createdAt: string;
  resourceId?: number | null;
}

interface NotificationPopoverProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function NotificationPopover({
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange
}: NotificationPopoverProps = {}) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'video' | 'blog' | 'achievement' | 'system'>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const filterLabels = {
    all: 'All Notifications',
    video: 'Videos',
    blog: 'Articles',
    achievement: 'Badges',
    system: 'Alerts'
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'all') return true;
    if (filter === 'video') return notif.type === 'video';
    if (filter === 'blog') return notif.type === 'blog';
    if (filter === 'achievement') return notif.type === 'achievement';
    if (filter === 'system') return ['urgent', 'warning', 'success'].includes(notif.type) || !['video', 'blog', 'achievement'].includes(notif.type);
    return true;
  });
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = externalIsOpen !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;

  const setIsOpen = (openState: boolean | ((prev: boolean) => boolean)) => {
    const nextOpen = typeof openState === 'function' ? openState(isOpen) : openState;
    if (externalOnOpenChange) {
      externalOnOpenChange(nextOpen);
    }
    if (!isControlled) {
      setInternalIsOpen(nextOpen);
    }
  };

  const [previewNotification, setPreviewNotification] = useState<Notification | null>(null);
  const [welcomeNotification, setWelcomeNotification] = useState<Notification | null>(null);
  const [mounted, setMounted] = useState(false);
  const prevNotificationsRef = useRef<Notification[]>([]);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstFetchRef = useRef(true);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data);
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        // Silently ignore 401 Unauthorized errors (expected when logged out)
        return;
      }
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Detect new unread notifications for preview
    if (notifications.length > 0) {
      if (isFirstFetchRef.current) {
        isFirstFetchRef.current = false;
        prevNotificationsRef.current = notifications;
        return;
      }
      const prevIds = prevNotificationsRef.current.map(n => n.id);
      const newUnread = notifications.find(n => !n.isRead && !prevIds.includes(n.id));

      if (newUnread) {
        setPreviewNotification(newUnread);
        if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
        previewTimerRef.current = setTimeout(() => {
          setPreviewNotification(null);
        }, 8000); // Show for 8 seconds
      }
      prevNotificationsRef.current = notifications;
    }
  }, [notifications]);

  useEffect(() => {
    // Detect BFP welcome notification
    if (notifications.length > 0) {
      const welcome = notifications.find(n => !n.isRead && n.category === 'professional' && n.title === 'Welcome BFP Personnel!');
      if (welcome) {
        setWelcomeNotification(welcome);
      }
    }
  }, [notifications]);

  // Polling for new notifications every 10 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = () => {
      // Only trigger a state update if something is actually open
      setOpenDropdownId(currentId => currentId === null ? null : null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleReadStatus = async (id: number, isRead: boolean) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, isRead } : n
    ));
    try {
      if (isRead) {
        await axios.patch(`/api/notifications/${id}/read`);
      }
    } catch (e) { console.error(e); }
  };

  const deleteNotification = async (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
    try {
      await axios.delete(`/api/notifications/${id}`);
    } catch (e) { console.error(e); }
  };

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    try {
      await axios.post('/api/notifications/read-all');
    } catch (e) { console.error(e); }
  };

  const handleDismissWelcome = async () => {
    if (!welcomeNotification) return;
    const welcomeId = welcomeNotification.id;
    setNotifications(prev => prev.map(n => n.id === welcomeId ? { ...n, isRead: true } : n));
    setWelcomeNotification(null);
    try {
      await axios.patch(`/api/notifications/${welcomeId}/read`);
    } catch (e) {
      console.error('Failed to mark welcome notification as read:', e);
    }
  };

  const handleEnterDashboard = async () => {
    if (welcomeNotification) {
      const welcomeId = welcomeNotification.id;
      // Clear modal immediately so it visually disappears
      setWelcomeNotification(null);
      setNotifications(prev => prev.map(n => n.id === welcomeId ? { ...n, isRead: true } : n));
      // Wait for the API to confirm read status before navigating,
      // so the new page's fetch won't find it unread and reopen the modal
      try {
        await axios.patch(`/api/notifications/${welcomeId}/read`);
      } catch (e) {
        console.error('Failed to mark welcome notification as read:', e);
      }
    }
    router.get('/professional');
  };

  const handleGo = (notification: Notification) => {
    if (!notification.isRead) {
      toggleReadStatus(notification.id, true);
    }

    if (notification.resourceId) {
      if (notification.type === 'blog') {
        router.get(`/adult/blog/${notification.resourceId}`);
      } else {
        router.get(`/${notification.category}`);
      }
    } else {
      if (notification.category === 'professional') {
        router.get('/professional');
      } else if (notification.category === 'assessment') {
        router.get('/assessment/pre-test');
      } else if (notification.type === 'video' && notification.category === 'kids') {
        router.get('/kids/videos');
      } else if (notification.type === 'video' && notification.category === 'adult') {
        router.get('/adult#videos-section');
      } else if (notification.type === 'blog' || notification.category === 'adult') {
        router.get('/adult');
      } else if (notification.category === 'kids/rank') {
        router.get('/kids?rankGuide=true');
      } else if (notification.type === 'achievement' || notification.title.toLowerCase().includes('badge')) {
        let badgeParam = '';
        const badgeNameMatch = notification.message.match(/earned the (.*?) badge/i);
        const rankMatch = notification.message.match(/ranked up to (.*?)!/i);
        
        if (badgeNameMatch && badgeNameMatch[1]) {
           badgeParam = `?highlight=${encodeURIComponent(badgeNameMatch[1])}`;
        } else if (rankMatch && rankMatch[1]) {
           badgeParam = `?highlight=${encodeURIComponent(rankMatch[1])}`;
        }
        router.get(`/kids/badges${badgeParam}`);
      } else {
        router.get(`/${notification.category}`);
      }
    }
    setIsOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getNotificationIcon = (type: string, isSmall: boolean = false) => {
    const sizeClasses = isSmall ? "h-3.5 w-3.5" : "h-5 w-5";
    switch (type) {
      case "urgent": return <Bell className={`${sizeClasses} text-white`} />;
      case "warning": return <Bell className={`${sizeClasses} text-white`} />;
      case "success": return <Check className={`${sizeClasses} text-white`} />;
      case "blog": return <Bell className={`${sizeClasses} text-white`} />;
      case "video": return <Bell className={`${sizeClasses} text-white`} />;
      case "achievement": return <Trophy className={`${sizeClasses} text-white`} />;
      default: return <Bell className={`${sizeClasses} text-white`} />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "urgent": return "bg-red-500";
      case "warning": return "bg-yellow-500";
      case "success": return "bg-green-500";
      case "blog": return "bg-blue-500";
      case "video": return "bg-purple-500";
      case "achievement": return "bg-orange-500";
      default: return "bg-blue-500";
    }
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#0ea5e9] border-[3px] border-white text-white shadow-[0_4px_0_#0284c7] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#0284c7] active:translate-y-1 active:scale-90 active:shadow-none data-[state=open]:translate-y-1 data-[state=open]:shadow-none transition-all duration-200 active:duration-75 outline-none cursor-pointer">
          <Bell className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 border-2 border-white rounded-full p-0 flex items-center justify-center text-[9px] sm:text-[10px] bg-red-500 hover:bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>

      {/* Notification Preview Card - Appears below bell when new notification arrives */}
      <AnimatePresence>
        {previewNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full mt-4 right-0 w-80 bg-white dark:bg-slate-900 rounded-2xl border-[3px] border-blue-500 dark:border-blue-600 shadow-[0_10px_40px_-10px_rgba(59,130,246,0.5)] dark:shadow-[0_10px_40px_-10px_rgba(37,99,235,0.5)] z-[100] cursor-pointer group"
            onClick={() => {
              handleGo(previewNotification);
              setPreviewNotification(null);
            }}
          >
            {/* Arrow pointing up to the bell */}
            <div className="absolute -top-[10px] right-3 sm:right-4 w-4 h-4 bg-white dark:bg-slate-900 border-t-[3px] border-l-[3px] border-blue-500 dark:border-blue-600 rotate-45 rounded-tl-[2px] z-0 transition-colors" />
            
            <div className="relative z-10 p-4 rounded-[13px] overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-inner border-[3px] border-white/20 ${getNotificationBadge(previewNotification.type)}`}>
                      {getNotificationIcon(previewNotification.type, false)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest leading-none mb-1">New Alert</span>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">{formatDate(previewNotification.createdAt)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPreviewNotification(null); }}
                    className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600 outline-none"
                  >
                    <X className="h-4 w-4" strokeWidth={3} />
                  </button>
                </div>
                <h5 className="text-base font-black text-slate-800 dark:text-white line-clamp-1 mb-1.5">{previewNotification.title}</h5>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{previewNotification.message}</p>
                
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse delay-75" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse delay-150" />
                  </div>
                  <div className="text-xs font-black text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    View Details <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PopoverContent className="z-[90] w-[calc(100vw-2rem)] sm:w-96 p-0 rounded-[1.5rem] border-2 border-slate-200/80 dark:border-slate-800 shadow-[0_16px_50px_rgba(0,0,0,0.16)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.5)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl transition-colors relative animate-ios-popover-bell !overflow-visible" align="end" sideOffset={12} collisionPadding={16}>
        {/* Caret pointing up to the bell icon */}
        <div className="absolute -top-[10px] right-[70px] sm:right-4 w-4 h-4 bg-white/95 dark:bg-slate-900/95 border-t-2 border-l-2 border-slate-200/80 dark:border-slate-800 rotate-45 rounded-tl-[2px] z-[1] transition-colors pointer-events-none"></div>
        
        {/* Inner wrapper to contain scroll area and header within rounded corners */}
        <div className="rounded-[calc(1.5rem-2px)] overflow-hidden w-full h-full relative z-10 bg-transparent">
          <div className="flex items-center justify-between p-4 lg:px-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm transition-colors">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-lg tracking-tight transition-colors">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="h-auto py-1.5 px-3 text-xs rounded-full font-bold shadow-[0_3px_0_#e2e8f0] dark:shadow-[0_3px_0_#1e293b] hover:-translate-y-0.5 hover:shadow-[0_4px_0_#e2e8f0] dark:hover:shadow-[0_4px_0_#1e293b] active:translate-y-0.5 active:shadow-[0_1px_0_#e2e8f0] dark:active:shadow-none border-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 transition-all outline-none">
              <Check className="h-3.5 w-3.5 mr-1" strokeWidth={3} />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Category Selector Dropdown Row */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 z-[110] relative">
          <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Filter</span>
          <div className="relative">
             <button
               onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
               className="flex items-center gap-2 px-3 py-1.5 text-xs font-extrabold rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 shadow-[0_2px_0_#e2e8f0] dark:shadow-[0_2px_0_#0f172a] active:translate-y-[1px] active:shadow-none transition-all outline-none select-none cursor-pointer"
             >
               {filterLabels[filter]}
               <ChevronDown className={`h-3.5 w-3.5 text-slate-450 transition-transform duration-200 shrink-0 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
             </button>

             <AnimatePresence>
               {isFilterDropdownOpen && (
                 <>
                   {/* Transparent click-to-dismiss overlay */}
                   <div className="fixed inset-0 z-[115]" onClick={() => setIsFilterDropdownOpen(false)} />
                   
                   <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: -4 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: -4 }}
                     transition={{ duration: 0.15 }}
                     className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl rounded-[14px] p-1.5 z-[120] origin-top-right overflow-hidden transition-colors"
                   >
                     {[
                       { id: 'all', label: 'All Notifications' },
                       { id: 'video', label: 'Videos' },
                       { id: 'blog', label: 'Articles' },
                       { id: 'achievement', label: 'Badges' },
                       { id: 'system', label: 'Alerts' },
                     ].map((option) => {
                       const count = option.id === 'all' 
                         ? notifications.length 
                         : notifications.filter(n => {
                             if (option.id === 'video') return n.type === 'video';
                             if (option.id === 'blog') return n.type === 'blog';
                             if (option.id === 'achievement') return n.type === 'achievement';
                             return ['urgent', 'warning', 'success'].includes(n.type) || !['video', 'blog', 'achievement'].includes(n.type);
                           }).length;

                       return (
                         <button
                           key={option.id}
                           onClick={() => {
                             setFilter(option.id as any);
                             setIsFilterDropdownOpen(false);
                           }}
                           className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center justify-between transition-colors cursor-pointer select-none ${
                             filter === option.id
                               ? "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400"
                               : "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                           }`}
                         >
                           {option.label}
                           <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                             filter === option.id
                               ? "bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400"
                               : "bg-slate-100 text-slate-500 dark:bg-slate-850 dark:text-slate-400"
                           }`}>
                             {count}
                           </span>
                         </button>
                       );
                     })}
                   </motion.div>
                 </>
               )}
             </AnimatePresence>
          </div>
        </div>

        <ScrollArea className="h-[450px]">
          <div className="p-3">
            {loading ? (
              <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">Loading notifications...</div>
            ) : error ? (
              <div className="p-6 text-center text-sm text-red-500 font-medium">{error}</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">No notifications in this category</div>
            ) : (
              <div className="space-y-2 pb-32">
                <AnimatePresence initial={false}>
                  {filteredNotifications.slice(0, 50).map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 1, height: "auto", paddingTop: "0.875rem", paddingBottom: "0.875rem" }}
                      exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, borderTopWidth: 0, borderBottomWidth: 0, overflow: "hidden", scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`p-3.5 rounded-xl transition-all group relative border-2 ${openDropdownId === notification.id ? "z-[50]" : "z-10"} ${!notification.isRead
                        ? "bg-blue-50/50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-800/30 hover:bg-blue-50/80 dark:hover:bg-blue-900/30 hover:-translate-y-0.5 hover:shadow-sm"
                        : "bg-white dark:bg-slate-800/40 border-transparent dark:border-slate-700/50 hover:border-slate-100 dark:hover:border-slate-600 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 hover:-translate-y-0.5 hover:shadow-sm"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full shadow-inner ${getNotificationBadge(notification.type)}`}>
                          {getNotificationIcon(notification.type, true)}
                        </div>
                        <div className="flex-1 min-w-0 pr-8">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-2 transition-colors">{notification.title}</h4>
                            {!notification.isRead && (
                              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-black border-none">NEW</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 font-medium transition-colors">{notification.message}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-bold uppercase tracking-wider transition-colors">{formatDate(notification.createdAt)}</p>
                        </div>
                      </div>
                      <div className="absolute top-2.5 right-2.5 z-[100]">
                         <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === notification.id ? null : notification.id);
                          }}
                          className="h-7 w-7 rounded-full text-slate-400 dark:text-slate-500 bg-transparent hover:bg-white dark:hover:bg-slate-700 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:text-slate-600 dark:hover:text-white shadow-none hover:shadow-[0_2px_0_#e2e8f0] dark:hover:shadow-[0_2px_0_#0f172a] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all outline-none"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        
                        <AnimatePresence>
                          {openDropdownId === notification.id && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -10 }}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl rounded-[14px] p-1.5 z-[200] origin-top-right overflow-hidden transition-colors"
                            >
                               <button onClick={() => { handleGo(notification); setOpenDropdownId(null); }} className="w-full text-left px-3 py-2 bg-transparent outline-none text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center transition-colors">
                                <ArrowRight className="mr-2 h-4 w-4" /> Go
                              </button>
                              <button onClick={() => { toggleReadStatus(notification.id, !notification.isRead); setOpenDropdownId(null); }} className="w-full text-left px-3 py-2 bg-transparent outline-none text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center transition-colors mt-1">
                                {!notification.isRead ? <Check className="mr-2 h-4 w-4" /> : <Bell className="mr-2 h-4 w-4" />}
                                {!notification.isRead ? "Mark as Read" : "Mark as Unread"}
                              </button>
                              <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1 transition-colors" />
                              <button onClick={() => { deleteNotification(notification.id); setOpenDropdownId(null); }} className="w-full text-left px-3 py-2 bg-transparent outline-none text-sm font-bold text-red-600 hover:bg-red-600 hover:text-white rounded-lg flex items-center transition-all group">
                                <Trash2 className="mr-2 h-4 w-4 group-hover:text-white" /> Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </ScrollArea>
        </div>
      </PopoverContent>
    </Popover >

    {mounted && typeof document !== 'undefined' && createPortal(
      <AnimatePresence>
        {welcomeNotification && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="relative bg-slate-900 border-[6px] border-red-500 rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full text-center overflow-y-auto max-h-[95vh] shadow-[0_20px_50px_rgba(220,38,38,0.3)]"
            >
              {/* Mascot Avatar / BFP Badge */}
              <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-red-500 overflow-hidden transform hover:scale-105 transition-transform duration-300 shrink-0">
                <img 
                  src="/badges/badge_hall.webp?v=2" 
                  alt="BFP Badge" 
                  className="w-[85%] h-[85%] object-contain"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-red-500 uppercase tracking-tighter mb-2">
                Welcome BFP Personnel!
              </h3>
              
              <p className="text-slate-300 font-bold text-xs sm:text-sm leading-relaxed mb-6">
                Congratulations! You have been granted BFP Professional access. Here are your new tools:
              </p>

              {/* Features list */}
              <div className="grid grid-cols-1 gap-3 mb-6 text-left">
                <div className="flex gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                    <Play className="h-4.5 w-4.5 text-red-500 fill-current" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-xs uppercase tracking-wide">Training Videos</h4>
                    <p className="text-slate-400 text-[10px] sm:text-xs font-semibold leading-relaxed mt-0.5">Watch specialized instructional videos for BFP training.</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <BookOpen className="h-4.5 w-4.5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-xs uppercase tracking-wide">Training Manuals</h4>
                    <p className="text-slate-400 text-[10px] sm:text-xs font-semibold leading-relaxed mt-0.5">Read fire safety codes, guidelines, and manuals.</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Shield className="h-4.5 w-4.5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-xs uppercase tracking-wide">The Right Call</h4>
                    <p className="text-slate-400 text-[10px] sm:text-xs font-semibold leading-relaxed mt-0.5">Explore the interactive emergency dispatch simulation.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleEnterDashboard}
                  className="flex-1 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-red-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-100 flex items-center justify-center gap-2"
                >
                  <span>Enter Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDismissWelcome}
                  className="px-5 py-3 rounded-2xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors duration-100"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
}
