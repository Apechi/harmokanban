"use client";

import React, { useState } from "react";
import { Folder, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Radio, ShieldAlert } from "lucide-react";
import { Project } from "@/types";

interface ProjectSidebarProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  onDeleteProject: (id: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export default function ProjectSidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  isOpen,
  onToggleOpen,
}: ProjectSidebarProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onCreateProject(newProjectName.trim());
    setNewProjectName("");
    setIsCreating(false);
  };

  const handleRenameSubmit = (id: string) => {
    if (!editingName.trim()) return;
    onRenameProject(id, editingName.trim());
    setEditingId(null);
  };

  const activeProjects = projects.filter((p) => !p.archived);

  return (
    <div
      className={`relative h-[calc(100vh-80px)] border-r border-brand-accent/20 bg-brand-card/95 flex flex-col transition-all duration-300 z-30 select-none font-mono ${
        isOpen ? "w-64" : "w-12"
      }`}
    >
      {/* Header / Collapse Trigger */}
      <div className="p-3 border-b border-brand-accent/20 flex items-center justify-between overflow-hidden h-14">
        {isOpen ? (
          <>
            <span className="text-xs font-black text-brand-accent tracking-widest flex items-center gap-2">
              <Folder size={15} /> DEPLOYED OPERATIONS
            </span>
            <button
              onClick={onToggleOpen}
              className="p-1 hover:bg-brand-accent/15 rounded-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
          </>
        ) : (
          <button
            onClick={onToggleOpen}
            className="mx-auto p-1 hover:bg-brand-accent/15 rounded-xs text-brand-accent cursor-pointer"
            title="Expand Sidebar"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 mt-2">
        {isOpen ? (
          <>
            {activeProjects.map((project) => {
              const isActive = project.id === activeProjectId;
              const isEditing = project.id === editingId;

              return (
                <div
                  key={project.id}
                  className={`group relative p-2.5 rounded-xs border transition-all cursor-pointer flex flex-col gap-1 ${
                    isActive
                      ? "bg-brand-accent/10 border-brand-accent shadow-xs shadow-brand-accent/10"
                      : "bg-brand-bg/30 border-brand-accent/5 hover:border-brand-accent/30"
                  }`}
                  onClick={() => !isEditing && onSelectProject(project.id)}
                >
                  {/* Left Active Glow bar */}
                  {isActive && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent" />
                  )}

                  <div className="flex items-center justify-between">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleRenameSubmit(project.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameSubmit(project.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                        className="bg-brand-bg text-slate-100 text-xs px-2 py-0.5 border border-brand-accent/40 rounded-xs focus:outline-hidden w-full mr-2"
                      />
                    ) : (
                      <span
                        className={`text-xs font-bold truncate pr-2 ${
                          isActive ? "text-brand-accent" : "text-slate-300 group-hover:text-slate-100"
                        }`}
                      >
                        {project.name}
                      </span>
                    )}

                    {/* Actions */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(project.id);
                            setEditingName(project.name);
                          }}
                          className="p-0.5 text-slate-400 hover:text-brand-accent rounded-xs cursor-pointer"
                          title="Rename Operation"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Archive ${project.name}? This operation files will be hidden.`)) {
                              onDeleteProject(project.id);
                            }
                          }}
                          className="p-0.5 text-slate-400 hover:text-brand-destructive rounded-xs cursor-pointer"
                          title="Archive Operation"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Room sync status */}
                  <div className="flex items-center gap-1 text-[9px] text-slate-500 font-mono mt-1">
                    {project.roomId ? (
                      <span className="text-cyan-400 flex items-center gap-0.5">
                        <Radio size={9} className="animate-pulse" />
                        LINKED: {project.roomId}
                      </span>
                    ) : (
                      <span className="text-slate-600">OFFLINE OPERATION</span>
                    )}
                  </div>
                </div>
              );
            })}

            {isCreating ? (
              <form onSubmit={handleCreate} className="p-2 border border-dashed border-brand-accent/30 rounded-xs space-y-2">
                <input
                  type="text"
                  placeholder="Operation Name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  autoFocus
                  className="w-full bg-brand-bg text-slate-100 text-xs px-2 py-1 border border-brand-accent/20 rounded-xs focus:outline-hidden focus:border-brand-accent"
                />
                <div className="flex gap-1">
                  <button
                    type="submit"
                    className="flex-1 py-1 bg-brand-accent hover:bg-purple-600 text-white rounded-xs text-[10px] font-bold uppercase"
                  >
                    DEPLOY
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-2 py-1 bg-brand-bg/80 hover:bg-brand-bg text-slate-400 rounded-xs text-[10px] font-bold uppercase"
                  >
                    X
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full p-2 border border-dashed border-brand-accent/40 hover:border-brand-accent bg-brand-accent/5 hover:bg-brand-accent/10 text-brand-accent rounded-xs text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus size={14} />
                NEW OPERATION
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {activeProjects.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className={`w-8 h-8 rounded-xs border flex items-center justify-center font-bold text-xs uppercase transition-all cursor-pointer ${
                  p.id === activeProjectId
                    ? "bg-brand-accent border-brand-accent text-white"
                    : "bg-brand-card border-brand-accent/10 hover:border-brand-accent/40 text-slate-400 hover:text-slate-200"
                }`}
                title={p.name}
              >
                {p.name.slice(0, 2)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Collapsed/Expanded Indicator at Bottom */}
      {isOpen && (
        <div className="p-3 border-t border-brand-accent/10 bg-brand-bg/40 text-[9px] text-slate-600 uppercase font-mono">
          SECTOR: SE-28 // PR-MODE
        </div>
      )}
    </div>
  );
}
