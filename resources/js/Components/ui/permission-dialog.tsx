"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShieldAlert } from "lucide-react";

interface PermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  title?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export function PermissionDialog({ isOpen, onClose, message, title = "Permission Required", actionButton }: PermissionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
          {actionButton && (
            <Button type="button" onClick={actionButton.onClick} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white">
              {actionButton.label}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
