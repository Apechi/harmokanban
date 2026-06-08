"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BoardState, AutomationRule } from "@/types";
import { X, Play, Sliders, ToggleLeft, ToggleRight, Trash2, Plus, Terminal } from "lucide-react";

interface AutomationConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  state: BoardState;
  rules: AutomationRule[];
  onRulesChange: (newRules: AutomationRule[]) => void;
}

export default function AutomationConsole({
  isOpen,
  onClose,
  state,
  rules,
  onRulesChange,
}: AutomationConsoleProps) {
  const [trigger, setTrigger] = useState<"SUBTASKS_COMPLETED" | "DUE_DATE_NEARING">("SUBTASKS_COMPLETED");
  const [action, setAction] = useState<"MOVE_TO_COLUMN" | "SET_PRIORITY">("MOVE_TO_COLUMN");
  const [actionValue, setActionValue] = useState("");

  const handleToggleRule = (ruleId: string) => {
    const updated = rules.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
    onRulesChange(updated);
  };

  const handleDeleteRule = (ruleId: string) => {
    const updated = rules.filter((r) => r.id !== ruleId);
    onRulesChange(updated);
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Choose default value if empty
    let val = actionValue;
    if (!val) {
      if (action === "MOVE_TO_COLUMN") {
        val = state.columnOrder[0] || "";
      } else {
        val = "HIGH";
      }
    }

    const newRule: AutomationRule = {
      id: `rule-${crypto.randomUUID().slice(0, 8)}`,
      trigger,
      action,
      actionValue: val,
      enabled: true,
    };

    onRulesChange([...rules, newRule]);
    setActionValue("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-mono">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#020105]/70 backdrop-blur-xs"
          />

          {/* Drawer container */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="w-screen max-w-md bg-brand-card/95 border-l border-brand-accent/30 shadow-2xl flex flex-col h-full text-slate-100"
            >
              {/* Tactical Header */}
              <div className="px-6 py-5 border-b border-brand-accent/20 flex items-center justify-between bg-brand-bg/40">
                <div className="flex items-center gap-2">
                  <Terminal className="text-brand-accent animate-pulse" size={18} />
                  <span className="text-sm font-bold tracking-widest text-brand-accent uppercase">
                    AUTOMATIONS CONSOLE
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-brand-accent/15 rounded-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Console Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Active Rules List */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      ACTIVE AUTOMATION TRIGGERS
                    </span>
                    <span className="text-[9px] bg-brand-accent/10 border border-brand-accent/20 px-1.5 py-0.5 text-brand-accent uppercase">
                      SYSTEM ONLINE
                    </span>
                  </div>

                  <div className="space-y-3">
                    {rules.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 p-4 rounded-xs uppercase">
                        No active automations found. Configure one below.
                      </div>
                    ) : (
                      rules.map((rule) => {
                        const colName = state.columns[rule.actionValue]?.title || rule.actionValue;
                        return (
                          <div
                            key={rule.id}
                            className={`p-3 bg-brand-bg/50 border rounded-xs flex items-center justify-between transition-all ${
                              rule.enabled ? "border-brand-accent/20" : "border-slate-800 opacity-60"
                            }`}
                          >
                            <div className="flex-1 mr-4">
                              <div className="text-[10px] text-brand-accent font-bold tracking-wider mb-1 uppercase">
                                TRIGGER: {rule.trigger.replace("_", " ")}
                              </div>
                              <div className="text-xs text-slate-300 font-bold uppercase">
                                ACTION: {rule.action.replace(/_/g, " ")} ➜{" "}
                                <span className="text-cyan-400">{colName}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleRule(rule.id)}
                                className="text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
                              >
                                {rule.enabled ? (
                                  <ToggleRight size={26} className="text-brand-accent" />
                                ) : (
                                  <ToggleLeft size={26} className="text-slate-600" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteRule(rule.id)}
                                className="p-1 hover:text-brand-destructive text-slate-600 transition-colors cursor-pointer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Create Rule Form */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    CONFIGURE NEW TACTICAL TRIGGER
                  </span>

                  <form onSubmit={handleAddRule} className="space-y-4">
                    
                    {/* Trigger Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase">1. CHOOSE TRIGGER CONDITION</label>
                      <select
                        value={trigger}
                        onChange={(e) => setTrigger(e.target.value as any)}
                        className="w-full bg-brand-bg text-slate-100 text-xs px-3 py-2 border border-brand-accent/20 rounded-xs focus:outline-hidden focus:border-brand-accent font-bold uppercase"
                      >
                        <option value="SUBTASKS_COMPLETED">All subtasks completed</option>
                        <option value="DUE_DATE_NEARING">Due date within 24 hours</option>
                      </select>
                    </div>

                    {/* Action Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase">2. EXECUTE TARGET ACTION</label>
                      <select
                        value={action}
                        onChange={(e) => {
                          const act = e.target.value as any;
                          setAction(act);
                          // Reset default action value
                          if (act === "MOVE_TO_COLUMN") {
                            setActionValue(state.columnOrder[0] || "");
                          } else {
                            setActionValue("HIGH");
                          }
                        }}
                        className="w-full bg-brand-bg text-slate-100 text-xs px-3 py-2 border border-brand-accent/20 rounded-xs focus:outline-hidden focus:border-brand-accent font-bold uppercase"
                      >
                        <option value="MOVE_TO_COLUMN">Move card to column</option>
                        <option value="SET_PRIORITY">Set card priority</option>
                      </select>
                    </div>

                    {/* Action Value Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase">3. ACTION VALUE / TARGET</label>
                      {action === "MOVE_TO_COLUMN" ? (
                        <select
                          value={actionValue}
                          onChange={(e) => setActionValue(e.target.value)}
                          className="w-full bg-brand-bg text-slate-100 text-xs px-3 py-2 border border-brand-accent/20 rounded-xs focus:outline-hidden focus:border-brand-accent font-bold uppercase"
                        >
                          {state.columnOrder.map((colId) => (
                            <option key={colId} value={colId}>
                              Column: {state.columns[colId]?.title || colId}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <select
                          value={actionValue}
                          onChange={(e) => setActionValue(e.target.value)}
                          className="w-full bg-brand-bg text-slate-100 text-xs px-3 py-2 border border-brand-accent/20 rounded-xs focus:outline-hidden focus:border-brand-accent font-bold uppercase"
                        >
                          <option value="LOW">LOW PRIORITY</option>
                          <option value="MEDIUM">MEDIUM PRIORITY</option>
                          <option value="HIGH">HIGH PRIORITY</option>
                        </select>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-2 bg-brand-accent hover:bg-purple-600 text-white border border-brand-accent/40 rounded-xs text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-brand-accent/20"
                    >
                      <Plus size={14} />
                      DEPLOY TACTICAL RULE
                    </button>
                  </form>
                </div>
              </div>

              {/* Console Footer */}
              <div className="p-4 border-t border-brand-accent/20 bg-brand-bg/40 text-[10px] text-slate-500 text-center uppercase">
                Tagging active transactions with origin: automation
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
