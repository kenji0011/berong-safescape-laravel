'use client';
import { useState, useEffect } from "react";
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { router } from '@inertiajs/react';
import { Badge } from "@/components/ui/badge";
import { Bell, Check, MoreHorizontal, Trash2, ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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

export function NotificationPopover() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
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
      } else if (notification.type === 'blog' || notification.category === 'adult') {
        router.get('/adult');
      } else {
        router.get(`/${notification.category}`);
      }
    }
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "urgent": return <Bell className="h-4 w-4 text-destructive" />;
      case "warning": return <Bell className="h-4 w-4 text-yellow-500" />;
      case "success": return <Bell className="h-4 w-4 text-green-500" />;
      case "blog": return <Bell className="h-4 w-4 text-primary" />;
      case "video": return <Bell className="h-4 w-4 text-secondary" />;
      default: return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "urgent": return "bg-destructive";
      case "warning": return "bg-yellow-500";
      case "success": return "bg-green-500";
      case "blog": return "bg-primary";
      case "video": return "bg-secondary";
      default: return "bg-primary";
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#0ea5e9] border-[3px] border-white text-white shadow-[0_4px_0_#0284c7] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#0284c7] active:translate-y-1 active:shadow-none transition-all outline-none">
          <Bell className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 border-2 border-white rounded-full p-0 flex items-center justify-center text-[9px] sm:text-[10px] bg-red-500 hover:bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="z-[90] w-[calc(100vw-2rem)] sm:w-96 p-0 rounded-[1.25rem] border-2 border-slate-200/60 shadow-2xl overflow-hidden" align="end" sideOffset={12} collisionPadding={16}>
        <div className="flex items-center justify-between p-4 lg:px-5 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm">
          <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="h-auto py-1.5 px-3 text-xs rounded-full font-bold shadow-[0_3px_0_#e2e8f0] hover:-translate-y-0.5 hover:shadow-[0_4px_0_#e2e8f0] active:translate-y-0.5 active:shadow-[0_1px_0_#e2e8f0] border-2 transition-all outline-none">
              <Check className="h-3.5 w-3.5 mr-1" strokeWidth={3} />
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[450px]">
          <div className="p-3">
            {loading ? (
              <div className="p-6 text-center text-sm text-slate-500 font-medium">Loading notifications...</div>
            ) : error ? (
              <div className="p-6 text-center text-sm text-red-500 font-medium">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500 font-medium">No notifications yet</div>
            ) : (
              <div className="space-y-2 pb-32">
                <AnimatePresence initial={false} mode="popLayout">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50, scale: 0.95 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className={`p-3.5 rounded-xl transition-all group relative border-2 ${openDropdownId === notification.id ? "z-[50]" : "z-10"} ${!notification.isRead
                        ? "bg-blue-50/50 border-blue-200/50 hover:bg-blue-50/80 hover:-translate-y-0.5 hover:shadow-sm"
                        : "bg-white border-transparent hover:border-slate-100 hover:bg-slate-50/80 hover:-translate-y-0.5 hover:shadow-sm"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${getNotificationBadge(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0 pr-8">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-800 line-clamp-2">{notification.title}</h4>
                            {!notification.isRead && (
                              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-blue-100 text-blue-700 font-black">NEW</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2 font-medium">{notification.message}</p>
                          <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">{formatDate(notification.createdAt)}</p>
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
                          className="h-7 w-7 rounded-full text-slate-400 bg-transparent hover:bg-white border-2 border-transparent hover:border-slate-200 hover:text-slate-600 shadow-none hover:shadow-[0_2px_0_#e2e8f0] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all outline-none"
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
                              className="absolute top-full right-0 mt-1 w-48 bg-white border-2 border-slate-200 shadow-xl rounded-[14px] p-1.5 z-[200] origin-top-right overflow-hidden"
                            >
                              <button onClick={() => { handleGo(notification); setOpenDropdownId(null); }} className="w-full text-left px-3 py-2 bg-transparent outline-none text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center transition-colors">
                                <ArrowRight className="mr-2 h-4 w-4" /> Go
                              </button>
                              <button onClick={() => { toggleReadStatus(notification.id, !notification.isRead); setOpenDropdownId(null); }} className="w-full text-left px-3 py-2 bg-transparent outline-none text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center transition-colors mt-1">
                                {!notification.isRead ? <Check className="mr-2 h-4 w-4" /> : <Bell className="mr-2 h-4 w-4" />}
                                {!notification.isRead ? "Mark as Read" : "Mark as Unread"}
                              </button>
                              <div className="h-[1px] bg-slate-100 my-1" />
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
      </PopoverContent>
    </Popover >
  );
}
