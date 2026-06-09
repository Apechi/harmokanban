"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, MessageSquare, LayoutGrid, Folder, Trash2, ShieldAlert } from "lucide-react";
import { NotificationItem } from "@/types";

interface NotificationFeedProps {
  notifications: NotificationItem[];
  onClearAll: () => void;
  onReadNotification: (id: string) => void;
  onClickNotification: (notification: NotificationItem) => void;
}

export default function NotificationFeed({
  notifications,
  onClearAll,
  onReadNotification,
  onClickNotification,
}: NotificationFeedProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [now, setNow] = useState(() => Date.now());

  const formatTime = (timestamp: number) => {
    const diff = now - timestamp;
    if (diff < 60000) return "JUST NOW";
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}M AGO`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}H AGO`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getCategoryDetails = (type: "chat" | "card" | "project") => {
    switch (type) {
      case "chat":
        return {
          icon: <MessageSquare size={14} className="text-purple-400" />,
          label: "COMM",
          bg: "bg-purple-500/10",
        };
      case "card":
        return {
          icon: <LayoutGrid size={14} className="text-cyan-400" />,
          label: "NODE",
          bg: "bg-cyan-500/10",
        };
      case "project":
      default:
        return {
          icon: <Folder size={14} className="text-amber-400" />,
          label: "SECT",
          bg: "bg-amber-500/10",
        };
    }
  };

  return (
    <div className="relative font-mono" ref={dropdownRef}>
      {/* Feed Toggle Trigger Button */}
      <button
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          if (next) {
            setNow(Date.now());
          }
        }}
        className={`relative p-2 border rounded-xs transition-all cursor-pointer ${
          isOpen
            ? "bg-brand-accent text-white border-brand-accent"
            : "border-brand-accent/50 bg-brand-accent/5 hover:bg-brand-accent/15 text-brand-accent"
        }`}
        title="Collaboration Feed"
      >
        <Bell size={14} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-destructive text-[8px] font-bold items-center justify-center text-white">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Popover Dropdown overlay */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 border border-brand-accent/35 bg-brand-card/98 shadow-2xl backdrop-blur-md z-50 flex flex-col max-h-[420px] overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-brand-accent/20 flex items-center justify-between bg-brand-bg/40">
            <span className="text-[10px] font-black tracking-widest text-slate-100 flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-brand-accent" />
              TACTICAL ALERTS FEED
            </span>
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  onClearAll();
                  setIsOpen(false);
                }}
                className="text-[9px] font-bold text-slate-400 hover:text-brand-destructive flex items-center gap-1 cursor-pointer transition-colors uppercase"
              >
                <Trash2 size={10} />
                PURGE LOGS
              </button>
            )}
          </div>

          {/* List content */}
          <div className="flex-1 overflow-y-auto divide-y divide-brand-accent/10">
            {notifications.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center gap-2">
                <span className="text-[10px] text-slate-500 tracking-widest uppercase">
                  NO ACTIVE SIGNALS DETECTED
                </span>
                <span className="text-[9px] text-slate-650">
                  MONITORING SECURE CHANNELS...
                </span>
              </div>
            ) : (
              notifications.map((notification) => {
                const details = getCategoryDetails(notification.type);
                return (
                  <div
                    key={notification.id}
                    onClick={() => {
                      onReadNotification(notification.id);
                      onClickNotification(notification);
                      setIsOpen(false);
                    }}
                    className={`p-3 flex gap-3 cursor-pointer transition-colors hover:bg-brand-accent/5 relative ${
                      !notification.read ? "bg-brand-accent/3" : ""
                    }`}
                  >
                    {/* Unread marker bar */}
                    {!notification.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-accent" />
                    )}

                    {/* Icon indicator */}
                    <div className={`p-1.5 rounded-xs h-fit ${details.bg}`}>
                      {details.icon}
                    </div>

                    {/* Message Body */}
                    <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                          [{details.label}]
                        </span>
                        <span className="text-[8px] text-slate-500">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      <h4 className={`text-xs font-bold truncate ${!notification.read ? "text-slate-100" : "text-slate-300"}`}>
                        {notification.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-normal">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
