"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TaskCard, Priority, SubTask } from "@/types";
import { X, Calendar, Plus, Trash2, CheckSquare, Tag, AlignLeft, Hash, User } from "lucide-react";

interface CardModalProps {
  card: TaskCard | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCard: TaskCard) => void;
  onDelete: (cardId: string, columnId: string) => void;
  localRole?: "editor" | "viewer";
  viewers?: string[];
}

export default function CardModal({
  card,
  isOpen,
  onClose,
  onSave,
  onDelete,
  localRole = "editor",
  viewers = [],
}: CardModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("LOW");
  const [dueDate, setDueDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [storyPoints, setStoryPoints] = useState<number | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState("");
  const [assignee, setAssignee] = useState("");

  const toDateTimeLocalString = (val: string | null | undefined): string => {
    if (!val) return "";
    if (val.includes("T")) return val;
    return `${val}T00:00`;
  };

  // Sync state with card prop
  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || "");
      setPriority(card.priority);
      setDueDate(toDateTimeLocalString(card.dueDate));
      setStartDate(toDateTimeLocalString(card.startDate));
      setStoryPoints(card.storyPoints);
      setTags(card.tags || []);
      setTagsInput(card.tags ? card.tags.join(", ") : "");
      setSubTasks(card.subTasks || []);
      setAssignee(card.assignee || "");
    }
  }, [card]);

  if (!card) return null;

  const handleSaveAndClose = () => {
    if (localRole === "viewer") {
      onClose();
      return;
    }

    // Parse tags input
    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const updatedCard: TaskCard = {
      ...card,
      title: title.trim() || "Untitled Mission",
      description: description.trim(),
      priority,
      dueDate: dueDate || null,
      startDate: startDate || null,
      storyPoints: storyPoints === null || isNaN(storyPoints) ? null : Number(storyPoints),
      tags: parsedTags,
      subTasks,
      assignee: assignee.trim() || null,
    };

    onSave(updatedCard);
    onClose();
  };

  const handleAddSubTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (localRole === "viewer") return;
    if (!newSubTaskTitle.trim()) return;

    const newSub: SubTask = {
      id: crypto.randomUUID(),
      title: newSubTaskTitle.trim(),
      completed: false,
    };

    setSubTasks([...subTasks, newSub]);
    setNewSubTaskTitle("");
  };

  const toggleSubTask = (subId: string) => {
    if (localRole === "viewer") return;
    const updated = subTasks.map((st) =>
      st.id === subId ? { ...st, completed: !st.completed } : st
    );
    setSubTasks(updated);
  };

  const deleteSubTask = (subId: string) => {
    if (localRole === "viewer") return;
    const updated = subTasks.filter((st) => st.id !== subId);
    setSubTasks(updated);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSaveAndClose}
            className="absolute inset-0 bg-[#020105]/80 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative w-full max-w-2xl bg-brand-card border border-brand-accent/30 rounded-xs shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Tactical Frame Top Accent */}
            <div className="h-1 bg-gradient-to-r from-brand-accent via-purple-600 to-brand-accent"></div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-accent/20">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="tactical-label text-[11px] text-brand-accent font-bold tracking-widest">
                  CARD FILES // {card.code}
                </span>
                {viewers.length > 0 && (
                  <div className="flex gap-1.5 items-center bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-xs text-[9px] text-cyan-400 font-mono uppercase tracking-wider animate-pulse">
                    <User size={10} />
                    <span>VIEWING: {viewers.join(", ")}</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleSaveAndClose}
                className="p-1 hover:text-brand-accent text-slate-400 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Mission Title Input */}
              <div className="space-y-1">
                <label className="tactical-label text-slate-500 text-[10px]">
                  MISSION DESCRIPTION / TITLE
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={localRole === "viewer"}
                  className="w-full bg-brand-bg/60 text-slate-100 text-lg font-bold px-3 py-2 border border-brand-accent/20 rounded-xs focus:outline-hidden focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                  placeholder="Mission title..."
                />
              </div>

              {/* Grid Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Priority Selection */}
                <div className="space-y-1">
                  <label className="tactical-label text-slate-500 text-[10px]">
                    PRIORITY LEVEL
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(["LOW", "MEDIUM", "HIGH"] as Priority[]).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => {
                          if (localRole !== "viewer") setPriority(level);
                        }}
                        disabled={localRole === "viewer"}
                        className={`py-1.5 text-xs font-bold rounded-xs border transition-all ${
                          localRole === "viewer" ? "cursor-not-allowed" : "cursor-pointer"
                        } ${
                          priority === level
                            ? level === "HIGH"
                              ? "bg-brand-destructive border-brand-destructive text-white shadow-xs shadow-brand-destructive/20"
                              : level === "MEDIUM"
                              ? "bg-amber-500 border-amber-500 text-slate-900"
                              : "bg-emerald-500 border-emerald-500 text-slate-900"
                            : "bg-brand-bg/40 border-brand-accent/10 hover:border-brand-accent/40 text-slate-400"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Story Points */}
                <div className="space-y-1">
                  <label className="tactical-label text-slate-500 text-[10px] flex items-center gap-1">
                    <Hash size={11} /> STORY POINTS
                  </label>
                  <input
                    type="number"
                    value={storyPoints === null ? "" : storyPoints}
                    onChange={(e) =>
                      setStoryPoints(e.target.value === "" ? null : Number(e.target.value))
                    }
                    disabled={localRole === "viewer"}
                    className="w-full bg-brand-bg/60 text-slate-100 text-sm px-3 py-1.5 border border-brand-accent/20 rounded-xs focus:outline-hidden focus:border-brand-accent transition-all font-mono disabled:opacity-75 disabled:cursor-not-allowed"
                    placeholder="e.g. 5"
                    min="0"
                  />
                </div>

                {/* Start Date */}
                <div className="space-y-1">
                  <label className="tactical-label text-slate-500 text-[10px] flex items-center gap-1">
                    <Calendar size={11} /> START DATE & TIME
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={localRole === "viewer"}
                    className="w-full bg-brand-bg/60 text-slate-100 text-sm px-3 py-1.5 border border-brand-accent/20 rounded-xs focus:outline-hidden focus:border-brand-accent transition-all font-mono disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Due Date */}
                <div className="space-y-1">
                  <label className="tactical-label text-slate-500 text-[10px] flex items-center gap-1">
                    <Calendar size={11} /> DUE DATE & TIME
                  </label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    disabled={localRole === "viewer"}
                    className="w-full bg-brand-bg/60 text-slate-100 text-sm px-3 py-1.5 border border-brand-accent/20 rounded-xs focus:outline-hidden focus:border-brand-accent transition-all font-mono disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Custom Tags */}
                <div className="space-y-1">
                  <label className="tactical-label text-slate-500 text-[10px] flex items-center gap-1">
                    <Tag size={11} /> LABELS / TAGS (COMMA SEPARATED)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    disabled={localRole === "viewer"}
                    className="w-full bg-brand-bg/60 text-slate-100 text-sm px-3 py-1.5 border border-brand-accent/20 rounded-xs focus:outline-hidden focus:border-brand-accent transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                    placeholder="e.g. feature, backend, ui"
                  />
                </div>

                {/* Assignee */}
                <div className="space-y-1">
                  <label className="tactical-label text-slate-500 text-[10px] flex items-center gap-1">
                    <User size={11} /> ASSIGNEE
                  </label>
                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    disabled={localRole === "viewer"}
                    className="w-full bg-brand-bg/60 text-slate-100 text-sm px-3 py-1.5 border border-brand-accent/20 rounded-xs focus:outline-hidden focus:border-brand-accent transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                    placeholder="Assignee name..."
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="tactical-label text-slate-500 text-[10px] flex items-center gap-1">
                  <AlignLeft size={11} /> OPERATION DOSSIER / DESCRIPTION
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={localRole === "viewer"}
                  rows={4}
                  className="w-full bg-brand-bg/60 text-slate-100 text-sm px-3 py-2 border border-brand-accent/20 rounded-xs focus:outline-hidden focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all resize-y disabled:opacity-75 disabled:cursor-not-allowed"
                  placeholder="Detail the operational details..."
                />
              </div>

              {/* Subtask Checklist */}
              <div className="space-y-2">
                <label className="tactical-label text-slate-500 text-[10px] flex items-center gap-1">
                  <CheckSquare size={11} /> SUBTASK DEPLOYMENTS
                </label>

                {/* Checklist items */}
                <div className="space-y-2">
                  {subTasks.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-2.5 bg-brand-bg/40 border border-brand-accent/10 rounded-xs hover:border-brand-accent/20 transition-all"
                    >
                      <label className={`flex items-center gap-3 flex-1 mr-4 ${localRole === "viewer" ? "cursor-default" : "cursor-pointer"}`}>
                        <input
                          type="checkbox"
                          checked={sub.completed}
                          onChange={() => {
                            if (localRole !== "viewer") toggleSubTask(sub.id);
                          }}
                          disabled={localRole === "viewer"}
                          className="w-4 h-4 accent-brand-accent cursor-pointer rounded-xs disabled:cursor-not-allowed"
                        />
                        <span
                          className={`text-sm ${
                            sub.completed ? "line-through text-slate-500" : "text-slate-300"
                          }`}
                        >
                          {sub.title}
                        </span>
                      </label>
                      {localRole !== "viewer" && (
                        <button
                          type="button"
                          onClick={() => deleteSubTask(sub.id)}
                          className="text-slate-500 hover:text-brand-destructive transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Checklist Item Form */}
                {localRole !== "viewer" && (
                  <form onSubmit={handleAddSubTask} className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newSubTaskTitle}
                      onChange={(e) => setNewSubTaskTitle(e.target.value)}
                      placeholder="Add subtask deployment..."
                      className="flex-1 bg-brand-bg/60 text-slate-100 text-sm px-3 py-1.5 border border-brand-accent/20 rounded-xs focus:outline-hidden focus:border-brand-accent transition-all"
                    />
                    <button
                      type="submit"
                      className="px-3 bg-brand-accent/20 hover:bg-brand-accent text-brand-accent hover:text-slate-100 border border-brand-accent/40 rounded-xs transition-all flex items-center justify-center cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-brand-accent/20 bg-brand-bg/40 flex items-center justify-between">
              {localRole !== "viewer" ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Delete Card: Are you sure you want to terminate this card deployment?")) {
                        onDelete(card.id, card.columnId);
                        onClose();
                      }
                    }}
                    className="px-3 py-1.5 border border-brand-destructive/30 hover:border-brand-destructive text-brand-destructive/80 hover:text-brand-destructive bg-brand-destructive/5 hover:bg-brand-destructive/10 rounded-xs text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    TERMINATE
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveAndClose}
                      className="px-4 py-2 bg-brand-accent hover:bg-purple-600 text-white rounded-xs text-xs font-bold uppercase tracking-wider transition-all shadow-xs hover:shadow-brand-accent/20 cursor-pointer"
                    >
                      SAVE DEPLOYMENT
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex justify-end w-full">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-750 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 text-slate-200 rounded-xs text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    CLOSE
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
