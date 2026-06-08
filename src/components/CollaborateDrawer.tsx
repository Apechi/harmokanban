"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  X, Copy, Check, Users, ShieldAlert, RefreshCw, LogOut, Radio, UserPlus
} from "lucide-react";
import { getRandomOperatorCallsign } from "@/lib/collaboration";

interface PeerInfo {
  id: number;
  name: string;
  activeCardId: string | null;
}

interface CollaborateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string | null;
  isConnected: boolean;
  peerCount: number;
  peers: PeerInfo[];
  localCallsign: string;
  onUpdateCallsign: (newCallsign: string) => void;
  onConnect: (roomId: string) => void;
  onDisconnect: () => void;
}

export default function CollaborateDrawer({
  isOpen,
  onClose,
  roomId,
  isConnected,
  peerCount,
  peers,
  localCallsign,
  onUpdateCallsign,
  onConnect,
  onDisconnect,
}: CollaborateDrawerProps) {
  const [joinCode, setJoinCode] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [callsignInput, setCallsignInput] = useState(localCallsign);
  const [isEditingCallsign, setIsEditingCallsign] = useState(false);

  const handleCopyLink = () => {
    if (!roomId) return;
    const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(inviteUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const generateRandomCode = () => {
    const prefixes = ["OPERATION", "MISSION", "TACTICAL", "STRATEGY", "SQUAD"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(100 + Math.random() * 900);
    setJoinCode(`${prefix}-${number}`);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      onConnect(joinCode.trim());
      setJoinCode("");
    }
  };

  const saveCallsign = () => {
    if (callsignInput.trim()) {
      onUpdateCallsign(callsignInput.trim());
      setIsEditingCallsign(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 backdrop-blur-xs cursor-pointer"
          />

          {/* Sliding Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-brand-card/95 border-l border-brand-accent/30 z-50 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-md font-mono text-slate-100"
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between border-b border-brand-accent/20 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Radio className={`h-5 w-5 ${isConnected ? "text-cyan-400 animate-pulse" : "text-brand-destructive"}`} />
                  <h2 className="text-sm font-bold tracking-widest uppercase">
                    Tactical Net Link
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:text-brand-accent transition-colors rounded-sm border border-transparent hover:border-brand-accent/20 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Connection Status Section */}
              <div className="bg-brand-bg/60 border border-brand-accent/20 p-4 rounded-xs mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-full blur-xl -z-10" />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                    SYSTEM STATUS
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isConnected
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                        : "bg-brand-destructive/10 text-brand-destructive border border-brand-destructive/30"
                    }`}
                  >
                    {isConnected ? "ONLINE" : "STANDBY (LOCAL)"}
                  </span>
                </div>

                {isConnected && roomId ? (
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                        ACTIVE NETWORK ROOM
                      </div>
                      <div className="text-md font-bold text-slate-200 tracking-wider">
                        {roomId}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyLink}
                        className="flex-1 py-1.5 px-3 bg-brand-accent/15 border border-brand-accent/30 hover:bg-brand-accent/25 text-slate-200 rounded-xs text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <Check size={12} className="text-green-400" />
                            <span className="text-green-400">COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>COPY INVITE LINK</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={onDisconnect}
                        className="py-1.5 px-3 bg-brand-destructive/10 border border-brand-destructive/30 hover:bg-brand-destructive/20 text-brand-destructive rounded-xs text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <LogOut size={12} />
                        <span>DISCONNECT</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 leading-relaxed">
                    Collaborate with squad peers in real-time. Link to a tactical operations network below or host a new one.
                  </div>
                )}
              </div>

              {/* Operator Callsign Settings */}
              <div className="border border-brand-accent/15 bg-brand-bg/30 p-4 rounded-xs mb-6">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">
                  OPERATOR IDENTIFICATION
                </div>
                {isEditingCallsign ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={callsignInput}
                      onChange={(e) => setCallsignInput(e.target.value)}
                      placeholder="Enter callsing..."
                      className="flex-1 bg-brand-bg text-slate-200 text-xs px-2.5 py-1.5 border border-brand-accent/50 rounded-xs focus:outline-hidden focus:ring-1 focus:ring-brand-accent"
                      maxLength={18}
                      autoFocus
                    />
                    <button
                      onClick={saveCallsign}
                      className="px-3 py-1 bg-brand-accent/20 border border-brand-accent/40 text-slate-200 hover:bg-brand-accent/30 rounded-xs text-xs font-bold uppercase cursor-pointer"
                    >
                      SAVE
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        {localCallsign || "UNKNOWN OPERATOR"}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setCallsignInput(localCallsign);
                        setIsEditingCallsign(true);
                      }}
                      className="text-[10px] text-brand-accent hover:underline uppercase tracking-wider cursor-pointer"
                    >
                      [CHANGE CALLSIGN]
                    </button>
                  </div>
                )}
              </div>

              {/* Join / Host Room Form */}
              {!isConnected && (
                <form onSubmit={handleJoin} className="space-y-4">
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest">
                    INITIALIZE LINK
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="ENTER ROOM CODE (e.g. SQUAD-101)"
                      className="flex-1 bg-brand-bg text-slate-200 text-xs px-3 py-2 border border-brand-accent/20 rounded-xs focus:outline-hidden focus:border-brand-accent focus:ring-1 focus:ring-brand-accent placeholder-slate-600"
                    />
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      title="Generate tactical code"
                      className="p-2 border border-brand-accent/30 bg-brand-accent/5 hover:bg-brand-accent/15 rounded-xs text-brand-accent transition-colors cursor-pointer"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!joinCode.trim()}
                    className="w-full py-2.5 bg-brand-accent hover:bg-brand-accent/90 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-transparent text-white font-bold uppercase tracking-wider text-xs rounded-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-brand-accent/50"
                  >
                    <UserPlus size={14} />
                    ESTABLISH LINK
                  </button>
                </form>
              )}

              {/* Squad List Presence */}
              {isConnected && (
                <div className="mt-6">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-widest border-b border-brand-accent/10 pb-2 mb-3">
                    <Users size={12} className="text-cyan-400" />
                    <span>ACTIVE SQUAD OPERATORS ({peerCount + 1})</span>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {/* Local Operator */}
                    <div className="flex items-center justify-between py-1 px-2.5 bg-brand-accent/5 border border-brand-accent/10 rounded-xs text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-ping" />
                        <span className="font-semibold text-slate-200">{localCallsign}</span>
                      </div>
                      <span className="text-[9px] bg-brand-accent/20 text-brand-accent px-1.5 py-0.5 rounded-xs tracking-wider uppercase">
                        YOU
                      </span>
                    </div>

                    {/* Remote Operators */}
                    {peers.map((peer) => (
                      <div
                        key={peer.id}
                        className="flex items-center justify-between py-1 px-2.5 bg-brand-bg/40 border border-slate-800 rounded-xs text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span className="font-semibold text-slate-300">{peer.name}</span>
                        </div>
                        {peer.activeCardId && (
                          <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded-xs tracking-wider uppercase animate-pulse">
                            VIEWING DEPLOYMENT
                          </span>
                        )}
                      </div>
                    ))}

                    {peers.length === 0 && (
                      <div className="py-6 text-center text-xs text-slate-600 border border-dashed border-slate-800 rounded-xs">
                        NO OTHER OPERATORS LINKED
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Notice */}
            <div className="mt-8 border-t border-brand-accent/10 pt-4 flex items-start gap-2 text-[9px] text-slate-500 leading-normal">
              <ShieldAlert size={14} className="shrink-0 text-brand-accent/50 mt-0.5" />
              <span>
                P2P SIGNALING CHANNEL VIA WEBRTC. STATE AUTOSYNCED LOCALLY. DISCONNECTING RESTORES PRIVATE LOCAL OFFLINE DATA MODE.
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
