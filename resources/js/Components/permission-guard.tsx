'use client';

import { useAuth } from '@/lib/auth-context';
import { PermissionDialog } from '@/components/ui/permission-dialog';
import { useState, ReactNode, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Flame, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PermissionGuardProps {
  requiredPermission: 'accessKids' | 'accessAdult' | 'accessProfessional' | 'isAdmin';
  children: ReactNode;
  targetPath?: string;
  fallbackPath?: string;
}

export function PermissionGuard({
  requiredPermission,
  children,
  targetPath = '',
  fallbackPath = '/'
}: PermissionGuardProps) {
  const { user, isAuthenticated } = useAuth();
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const isGuest = !isAuthenticated;
  const pathName = requiredPermission.replace('access', '');

  // Function to check if user has permission (admin has all permissions)
  const hasRequiredPermission = (): boolean => {
    if (!isAuthenticated || !user) {
      return false;
    }
    return user.role === 'admin' || user.permissions[requiredPermission];
  };

  // Handler for clicks on guarded elements
  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (!hasRequiredPermission()) {
      e.preventDefault();
      e.stopPropagation();

      if (isGuest) {
        setIsRedirecting(true);
        // Modern redirect delay
        setTimeout(() => {
          router.visit('/login');
        }, 2000);
      } else {
        setShowPermissionDialog(true);
      }
    }
  };

  const handleDialogClose = () => {
    setShowPermissionDialog(false);
  };

  const dialogTitle = "Permission Required";
  const dialogMessage = `You don't have permission to access this section. Please contact an administrator to request ${pathName.toLowerCase()} access.`;

  return (
    <>
      <div className="w-full h-full" onClick={handleClick} onKeyDown={handleClick}>
        {children}
      </div>
      
      {/* Fallback Dialog for Authenticated but Unauthorized Users */}
      <PermissionDialog
        isOpen={showPermissionDialog}
        onClose={handleDialogClose}
        title={dialogTitle}
        message={dialogMessage}
      />

      {/* Modern Full-Screen Redirect Overlay */}
      <AnimatePresence>
        {isRedirecting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-2xl"
          >
            {/* Glowing background blob */}
            <motion.div 
              className="absolute w-96 h-96 bg-red-600/20 rounded-full blur-[100px]"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <div className="relative flex flex-col items-center z-10">
              <motion.div 
                className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 shadow-[0_0_50px_rgba(220,38,38,0.3)] mb-8 relative"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
              >
                {/* Spinning border ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-t-2 border-r-2 border-red-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                
                <Flame className="w-10 h-10 sm:w-14 sm:h-14 text-red-500 animate-pulse" strokeWidth={2} />
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl font-black text-white tracking-[0.15em] uppercase mb-3 text-center"
              >
                Accessing Path
              </motion.h2>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 text-slate-400 font-medium text-sm sm:text-base"
              >
                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                Redirecting to Secure Sign In...
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
