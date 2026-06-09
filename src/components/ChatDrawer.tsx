"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Terminal, MessageSquare, AlertCircle } from "lucide-react";
import { ChatMessage } from "@/hooks/useCollaboration";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string | null;
  isConnected: boolean;
  chatMessages: ChatMessage[];
  localUserId: string;
  sendChatMessage: (text: string) => void;
}

// Simple hash function to generate consistent color classes for peer names
function getPeerColorClass(senderId: string): string {
  const colors = [
    "text-cyan-400",
    "text-amber-400",
    "text-emerald-400",
    "text-pink-400",
    "text-orange-400",
    "text-indigo-400",
    "text-teal-400",
  ];
  let hash = 0;
  for (let i = 0; i < senderId.length; i++) {
    hash = senderId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// Component to render text with automatic link detection
function MessageContent({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <span className="break-all whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-accent hover:underline break-all inline-flex items-center gap-0.5"
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </span>
  );
}

export default function ChatDrawer({
  isOpen,
  onClose,
  roomId,
  isConnected,
  chatMessages,
  localUserId,
  sendChatMessage,
}: ChatDrawerProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow transition/DOM update
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, chatMessages.length]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    sendChatMessage(trimmed);
    setInputText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40 md:hidden"
          />

          {/* Chat Panel Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[360px] bg-brand-bg border-l border-brand-accent/20 z-40 flex flex-col font-mono shadow-2xl backdrop-blur-md"
          >
            {/* Header */}
            <div className="p-4 border-b border-brand-accent/25 flex items-center justify-between bg-brand-card/50">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-brand-accent animate-pulse" />
                <span className="text-[12px] font-bold tracking-wider uppercase text-slate-100">
                  COMMS LINK // {roomId ? `ROOM: ${roomId}` : "OFFLINE"}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-brand-accent/10 border border-transparent hover:border-brand-accent/20 text-slate-400 hover:text-slate-100 rounded-xs transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col min-h-0 bg-brand-bg/95">
              {!isConnected || !roomId ? (
                /* Offline Error State */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <AlertCircle size={28} className="text-brand-destructive animate-pulse" />
                  <span className="text-[11px] font-bold text-brand-destructive uppercase tracking-widest leading-normal">
                    LINK OFFLINE
                  </span>
                  <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                    Connect to a collaborative room to initialize chat capabilities.
                  </p>
                </div>
              ) : chatMessages.length === 0 ? (
                /* Empty State */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <MessageSquare size={28} className="text-brand-accent/40" />
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                    DATA LINK SECURE
                  </span>
                  <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                    Room channel established. Type a message below to broadcast to linked operators.
                  </p>
                </div>
              ) : (
                /* Message Feed */
                chatMessages.map((msg) => {
                  if (msg.isSystem) {
                    /* System Event Log Layout */
                    return (
                      <div
                        key={msg.id}
                        className="py-1 px-2.5 bg-brand-card/30 border border-brand-accent/10 rounded-xs text-[10px] text-slate-400 flex items-center gap-1.5 font-mono select-none"
                      >
                        <span className="text-brand-accent font-bold">&gt;&gt;</span>
                        <span className="tracking-wider uppercase">
                          [SYSTEM: {msg.text}]
                        </span>
                        <span className="ml-auto text-[9px] opacity-60">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                          })}
                        </span>
                      </div>
                    );
                  }

                  const isOwn = msg.senderId === localUserId;
                  const peerColorClass = getPeerColorClass(msg.senderId);

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${
                        isOwn ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      {/* Name / Callsign header */}
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span
                          className={`text-[10px] font-bold ${
                            isOwn ? "text-brand-accent" : peerColorClass
                          }`}
                          title={`User ID: ${msg.senderId}`}
                        >
                          {msg.senderName}
                        </span>
                        <span className="text-[8px] text-slate-500 font-mono">
                          [{msg.senderId.slice(0, 8)}]
                        </span>
                        <span className="text-[9px] text-slate-500" title={new Date(msg.timestamp).toLocaleString()}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                          })}
                        </span>
                      </div>

                      {/* Chat Bubble container */}
                      <div
                        className={`py-2 px-3 text-[12px] leading-relaxed rounded-xs border transition-all ${
                          isOwn
                            ? "bg-brand-card border-brand-accent/30 text-slate-100 shadow-sm shadow-brand-accent/5 rounded-tr-none"
                            : "bg-brand-bg/40 border-slate-700/60 text-slate-300 rounded-tl-none"
                        }`}
                      >
                        <MessageContent text={msg.text} />
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            {isConnected && roomId && (
              <div className="p-3 border-t border-brand-accent/25 bg-brand-card/50 flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Broadcast payload..."
                  className="flex-1 bg-brand-bg/90 border border-brand-accent/20 rounded-xs px-3 py-1.5 text-[12px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/50 transition-all font-mono"
                />
                <button
                  onClick={handleSend}
                  title="Send message"
                  className="p-1.5 bg-brand-accent/15 hover:bg-brand-accent/25 border border-brand-accent/30 hover:border-brand-accent/50 text-brand-accent rounded-xs transition-all cursor-pointer flex items-center justify-center"
                >
                  <Send size={14} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
