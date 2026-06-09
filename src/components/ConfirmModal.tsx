"use client";

import React, { createContext, useContext, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, AlertOctagon, ShieldAlert } from "lucide-react";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: "warning" | "danger" | "info";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context.confirm;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setIsOpen(true);
      resolveRef.current = resolve;
    });
  };

  const handleClose = (value: boolean) => {
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(value);
    }
  };

  const title = options?.title || "Operational Confirmation Required";
  const message = options?.message || "Please confirm this request.";
  const confirmText = options?.confirmText || "PROCEED";
  const cancelText = options?.cancelText || "ABORT";
  const severity = options?.severity || "warning";

  const getSeverityColors = () => {
    switch (severity) {
      case "danger":
        return {
          border: "border-brand-destructive/40 focus:border-brand-destructive",
          accent: "text-brand-destructive",
          bg: "bg-brand-destructive/5 hover:bg-brand-destructive/15",
          btn: "bg-brand-destructive hover:bg-red-750 text-white border border-brand-destructive/50",
          glow: "shadow-brand-destructive/10",
        };
      case "info":
        return {
          border: "border-cyan-500/40 focus:border-cyan-500",
          accent: "text-cyan-400",
          bg: "bg-cyan-500/5 hover:bg-cyan-500/15",
          btn: "bg-cyan-500 hover:bg-cyan-600 text-white border border-cyan-500/50",
          glow: "shadow-cyan-500/10",
        };
      default: // warning
        return {
          border: "border-brand-accent/40 focus:border-brand-accent",
          accent: "text-brand-accent",
          bg: "bg-brand-accent/5 hover:bg-brand-accent/15",
          btn: "bg-brand-accent hover:bg-purple-600 text-white border border-brand-accent/50",
          glow: "shadow-brand-accent/10",
        };
    }
  };

  const colors = getSeverityColors();

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleClose(false)}
              className="absolute inset-0 bg-[#020105]/85 backdrop-blur-xs"
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", duration: 0.25 }}
              className={`relative w-full max-w-md bg-brand-card border ${colors.border} rounded-xs shadow-2xl overflow-hidden flex flex-col font-mono z-50`}
            >
              {/* Top accent line */}
              <div className={`h-1 bg-gradient-to-r from-transparent via-${severity === "danger" ? "red-500" : severity === "info" ? "cyan-500" : "brand-accent"} to-transparent`} />

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-brand-bg border ${colors.border} rounded-xs ${colors.accent}`}>
                    {severity === "danger" ? (
                      <AlertOctagon size={20} />
                    ) : severity === "info" ? (
                      <ShieldAlert size={20} />
                    ) : (
                      <AlertTriangle size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-black tracking-widest text-slate-100 uppercase">
                      {title}
                    </h3>
                    <p className="text-[9px] text-slate-500 tracking-wider font-bold">
                      SECURITY DEPLOYMENT PROTOCOL
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed border-l-2 border-brand-accent/30 pl-3 py-1 bg-brand-bg/20">
                  {message}
                </p>

                <div className="flex justify-end gap-3 pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleClose(false)}
                    className="px-4 py-2 bg-brand-bg border border-brand-accent/20 hover:border-brand-accent/40 text-slate-400 hover:text-slate-200 transition-all rounded-xs cursor-pointer uppercase tracking-wider font-bold"
                  >
                    {cancelText}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClose(true)}
                    className={`px-4 py-2 ${colors.btn} transition-all rounded-xs cursor-pointer uppercase tracking-wider font-bold shadow-xs`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}
