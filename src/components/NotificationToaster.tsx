"use client";

import React, { useEffect } from "react";
import { X, MessageSquare, LayoutGrid, Folder } from "lucide-react";
import { NotificationItem } from "@/types";

interface NotificationToasterProps {
  toasts: NotificationItem[];
  onDismiss: (id: string) => void;
  onClickToast: (toast: NotificationItem) => void;
}

export default function NotificationToaster({
  toasts,
  onDismiss,
  onClickToast,
}: NotificationToasterProps) {
  return (
    <div className="fixed bottom-6 right-6 z-55 flex flex-col gap-3 max-w-sm w-full font-mono select-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          onClickToast={onClickToast}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: NotificationItem;
  onDismiss: (id: string) => void;
  onClickToast: (toast: NotificationItem) => void;
}

function ToastItem({ toast, onDismiss, onClickToast }: ToastItemProps) {
  const duration = 5000; // 5 seconds

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getCategoryTheme = () => {
    switch (toast.type) {
      case "chat":
        return {
          icon: <MessageSquare size={16} />,
          border: "border-purple-500/50",
          text: "text-purple-400",
          bg: "bg-purple-950/20",
          accentBg: "bg-purple-500",
          label: "COMM LINK",
        };
      case "card":
        return {
          icon: <LayoutGrid size={16} />,
          border: "border-cyan-500/50",
          text: "text-cyan-400",
          bg: "bg-cyan-950/20",
          accentBg: "bg-cyan-500",
          label: "DATA NODE",
        };
      case "project":
      default:
        return {
          icon: <Folder size={16} />,
          border: "border-amber-500/50",
          text: "text-amber-400",
          bg: "bg-amber-950/20",
          accentBg: "bg-amber-500",
          label: "SECTOR UPDATE",
        };
    }
  };

  const theme = getCategoryTheme();

  return (
    <div
      onClick={() => onClickToast(toast)}
      className={`relative p-4 border ${theme.border} bg-brand-card/95 text-slate-100 shadow-lg backdrop-blur-md flex flex-col gap-1 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden`}
    >
      {/* Decaying timeline animation indicator */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-brand-accent animate-toast-decay" style={{ animationDuration: `${duration}ms` }} />

      {/* Header */}
      <div className="flex items-center justify-between text-[10px] font-black tracking-widest">
        <span className={`flex items-center gap-1.5 ${theme.text}`}>
          {theme.icon}
          {theme.label}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(toast.id);
          }}
          className="p-0.5 text-slate-400 hover:text-slate-200 cursor-pointer"
        >
          <X size={12} />
        </button>
      </div>

      {/* Content */}
      <div className="mt-1">
        <h4 className="text-xs font-bold truncate">{toast.title}</h4>
        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
          {toast.message}
        </p>
      </div>
    </div>
  );
}
