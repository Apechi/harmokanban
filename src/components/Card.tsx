"use client";

import { Draggable } from "@hello-pangea/dnd";
import { TaskCard } from "@/types";
import { Calendar, CheckSquare } from "lucide-react";

export function formatTacticalDateTime(dateTimeStr: string | null): string {
  if (!dateTimeStr) return "";
  if (dateTimeStr.includes("T")) {
    const [datePart, timePart] = dateTimeStr.split("T");
    const [year, month, day] = datePart.split("-");
    const [hour, minute] = timePart.split(":");
    return `${month}/${day} ${hour}:${minute}`;
  }
  const parts = dateTimeStr.split("-");
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`;
  }
  return dateTimeStr;
}

interface CardProps {
  card: TaskCard;
  index: number;
  onClick: () => void;
  viewers?: string[];
}

export default function Card({ card, index, onClick, viewers = [] }: CardProps) {
  const completedSubTasks = card.subTasks.filter((t) => t.completed).length;
  const totalSubTasks = card.subTasks.length;

  const hasViewers = viewers.length > 0;

  const priorityColor =
    card.priority === "HIGH"
      ? "bg-brand-destructive text-white"
      : card.priority === "MEDIUM"
      ? "bg-amber-500 text-slate-900"
      : "bg-emerald-500 text-slate-900";

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`tacticool-card p-3 rounded-xs flex flex-col gap-2 cursor-pointer transition-all ${
            hasViewers ? "border-cyan-400/50 bg-cyan-950/10 shadow-sm shadow-cyan-400/10" : ""
          } ${
            snapshot.isDragging
              ? "border-brand-accent/70 shadow-lg shadow-brand-accent/20 bg-brand-card/90"
              : ""
          }`}
        >
          {/* Card Header: Tactical Code & Priority Tag */}
          <div className="flex items-center justify-between">
            <span className="tactical-label text-brand-accent text-[10px] font-bold">
              {card.code}
            </span>
            <div className="flex items-center gap-1.5">
              {hasViewers && (
                <div className="flex gap-1 items-center mr-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span 
                    className="text-[8px] text-cyan-400 font-mono tracking-tighter uppercase font-bold max-w-[80px] truncate"
                    title={viewers.join(", ")}
                  >
                    {viewers[0]}{viewers.length > 1 ? ` +${viewers.length - 1}` : ""}
                  </span>
                </div>
              )}
              <span
                className={`graffiti-tag px-2 py-0.5 text-[9px] font-black rounded-xs uppercase tracking-wider ${priorityColor}`}
              >
                {card.priority}
              </span>
            </div>
          </div>

          {/* Card Title */}
          <h4 className="text-sm font-bold text-slate-200 tracking-wide line-clamp-2">
            {card.title}
          </h4>

          {/* Card Description */}
          {card.description && (
            <p className="text-xs text-slate-400 line-clamp-2 font-normal leading-relaxed">
              {card.description}
            </p>
          )}

          {/* Custom Tags */}
          {card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 text-[9px] bg-slate-800 text-slate-300 rounded-xs border border-slate-700 uppercase font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer Metadata */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-accent/10 text-[11px] text-slate-500 font-mono">
            {/* Subtasks Progress */}
            <div className="flex items-center gap-1">
              {totalSubTasks > 0 ? (
                <span className="flex items-center gap-1 text-slate-400">
                  <CheckSquare size={12} />
                  <span>
                    {completedSubTasks}/{totalSubTasks}
                  </span>
                </span>
              ) : (
                <span className="text-slate-600">—</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Story Points */}
              {card.storyPoints !== null && (
                <span className="bg-brand-accent/10 border border-brand-accent/20 text-brand-accent px-1 py-0.5 rounded-xs text-[10px] font-bold">
                  {card.storyPoints} SP
                </span>
              )}

              {/* Due Date */}
              {card.dueDate && (
                <span className="flex items-center gap-0.5 text-brand-accent/70">
                  <Calendar size={11} />
                  <span>
                    {formatTacticalDateTime(card.dueDate)}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
