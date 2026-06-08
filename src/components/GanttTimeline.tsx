"use client";

import React, { useState, useEffect, useRef } from "react";
import { BoardState, TaskCard } from "@/types";
import { Calendar, Layers, Sliders, ChevronRight, Play, X, User } from "lucide-react";

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

interface GanttTimelineProps {
  state: BoardState;
  onStateChange: (newState: BoardState) => void;
  onEditCard: (card: TaskCard) => void;
}

type ZoomMode = "DAYS" | "WEEKS" | "MONTHS";

export default function GanttTimeline({ state, onStateChange, onEditCard }: GanttTimelineProps) {
  const [zoomMode, setZoomMode] = useState<ZoomMode>("WEEKS");
  const [isUnscheduledOpen, setIsUnscheduledOpen] = useState(true);
  
  // Dragging/Resizing State
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragType, setDragType] = useState<"move" | "resize-start" | "resize-end" | null>(null);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [cardOriginalStart, setCardOriginalStart] = useState<string | null>(null);
  const [cardOriginalDue, setCardOriginalDue] = useState<string | null>(null);
  
  // local temporary dates for rendering during drag (to avoid broadcasting jitter)
  const [dragCardState, setDragCardState] = useState<{ id: string; start: string | null; due: string | null } | null>(null);

  // Timeline Range: We default to starting 2 weeks ago and extending to the end of the current year
  const [startDateRange, setStartDateRange] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14); // start 2 weeks ago
    return d;
  });
  
  const [endDateRange, setEndDateRange] = useState<Date>(() => {
    const d = new Date();
    // Extend to December 31st of the current year
    return new Date(d.getFullYear(), 11, 31);
  });

  const timelineRef = useRef<HTMLDivElement>(null);

  // List of all scheduled cards (have at least start or due date, but for Gantt we need both or we fall back to auto-completing the other if one exists)
  const allCards = Object.values(state.cards);
  
  const scheduledCards = allCards.filter(card => card.startDate || card.dueDate);
  const unscheduledCards = allCards.filter(card => !card.startDate && !card.dueDate);

  // Date list based on zoom mode
  const getTimelineHeaders = () => {
    const headers: { label: string; date: Date; width: number }[] = [];
    let current = new Date(startDateRange);
    
    if (zoomMode === "DAYS") {
      while (current <= endDateRange) {
        headers.push({
          label: current.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          date: new Date(current),
          width: 60,
        });
        current.setDate(current.getDate() + 1);
      }
    } else if (zoomMode === "WEEKS") {
      // Align to starting monday
      const day = current.getDay();
      const diff = current.getDate() - day + (day === 0 ? -6 : 1);
      current.setDate(diff);

      while (current <= endDateRange) {
        headers.push({
          label: `W/O ${current.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })}`,
          date: new Date(current),
          width: 120,
        });
        current.setDate(current.getDate() + 7);
      }
    } else { // MONTHS
      current.setDate(1); // align to start of month
      while (current <= endDateRange) {
        headers.push({
          label: current.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          date: new Date(current),
          width: 200,
        });
        current.setMonth(current.getMonth() + 1);
      }
    }
    return headers;
  };

  const headers = getTimelineHeaders();
  const columnWidth = zoomMode === "DAYS" ? 60 : zoomMode === "WEEKS" ? 120 : 200;
  const totalWidth = headers.length * columnWidth;

  // Helper: Get X coordinate for a date
  const getXFromDate = (dateStr: string | null): number => {
    if (!dateStr) return 0;
    const date = new Date(dateStr);
    const startMs = startDateRange.getTime();
    const endMs = endDateRange.getTime();
    const dateMs = date.getTime();
    
    if (dateMs < startMs) return 0;
    if (dateMs > endMs) return totalWidth;
    
    const percentage = (dateMs - startMs) / (endMs - startMs);
    return percentage * totalWidth;
  };

  // Helper: Get Date from X coordinate
  const getDateFromX = (x: number): Date => {
    const percentage = Math.max(0, Math.min(1, x / totalWidth));
    const startMs = startDateRange.getTime();
    const endMs = endDateRange.getTime();
    return new Date(startMs + percentage * (endMs - startMs));
  };

  // Format Date to YYYY-MM-DD, preserving original time component if present
  const formatDateString = (date: Date, originalStr?: string | null): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const datePart = `${year}-${month}-${day}`;
    if (originalStr && originalStr.includes("T")) {
      const timePart = originalStr.split("T")[1];
      return `${datePart}T${timePart}`;
    }
    return datePart;
  };

  // Handle Drag / Resize Mouse Events
  const handleMouseDown = (
    e: React.MouseEvent,
    card: TaskCard,
    type: "move" | "resize-start" | "resize-end"
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingCardId(card.id);
    setDragType(type);
    setDragStartX(e.clientX);
    
    // Default start date to due date if missing, or vice versa
    const currentStart = card.startDate || card.dueDate || formatDateString(new Date());
    const currentDue = card.dueDate || card.startDate || formatDateString(new Date());

    setCardOriginalStart(currentStart);
    setCardOriginalDue(currentDue);
    setDragCardState({ id: card.id, start: currentStart, due: currentDue });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingCardId || !dragType || !dragCardState || !cardOriginalStart || !cardOriginalDue) return;
      
      const deltaX = e.clientX - dragStartX;
      const daysDelta = Math.round(deltaX / (columnWidth / (zoomMode === "DAYS" ? 1 : zoomMode === "WEEKS" ? 7 : 30)));

      let newStart = new Date(cardOriginalStart);
      let newDue = new Date(cardOriginalDue);

      if (dragType === "move") {
        newStart.setDate(newStart.getDate() + daysDelta);
        newDue.setDate(newDue.getDate() + daysDelta);
      } else if (dragType === "resize-start") {
        newStart.setDate(newStart.getDate() + daysDelta);
        if (newStart > newDue) {
          newStart = new Date(newDue); // cap at due date
        }
      } else if (dragType === "resize-end") {
        newDue.setDate(newDue.getDate() + daysDelta);
        if (newDue < newStart) {
          newDue = new Date(newStart); // floor at start date
        }
      }

      setDragCardState({
        id: draggingCardId,
        start: formatDateString(newStart, cardOriginalStart),
        due: formatDateString(newDue, cardOriginalDue),
      });
    };

    const handleMouseUp = () => {
      if (draggingCardId && dragCardState) {
        // Save the changes locally and trigger collaboration broadcast
        const updatedCards = { ...state.cards };
        updatedCards[draggingCardId] = {
          ...updatedCards[draggingCardId],
          startDate: dragCardState.start,
          dueDate: dragCardState.due,
        };

        onStateChange({
          ...state,
          cards: updatedCards,
        });
      }

      setDraggingCardId(null);
      setDragType(null);
      setDragCardState(null);
    };

    if (draggingCardId) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingCardId, dragType, dragCardState, cardOriginalStart, cardOriginalDue, columnWidth, zoomMode, state, onStateChange]);

  // Handle Drop of Unscheduled Card to Gantt Timeline
  const handleScheduleCard = (card: TaskCard, dropX: number) => {
    // Determine the start date based on the mouse drop X position
    const start = getDateFromX(dropX);
    const due = new Date(start);
    due.setDate(due.getDate() + 3); // Default to a 3-day window
    console.log("GanttTimeline: handleScheduleCard computed dates", {
      start: formatDateString(start),
      due: formatDateString(due)
    });

    const updatedCards = { ...state.cards };
    updatedCards[card.id] = {
      ...card,
      startDate: formatDateString(start),
      dueDate: formatDateString(due),
    };

    onStateChange({
      ...state,
      cards: updatedCards,
    });
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-brand-bg font-mono select-none">
      
      {/* Left panel: Unscheduled Tasks sidebar drawer */}
      <div 
        className={`bg-brand-card/90 border-r border-brand-accent/20 flex flex-col transition-all duration-300 ${
          isUnscheduledOpen ? "w-80" : "w-12"
        }`}
      >
        <div className="p-4 border-b border-brand-accent/20 flex items-center justify-between">
          {isUnscheduledOpen ? (
            <>
              <span className="text-xs font-bold text-brand-accent tracking-wider flex items-center gap-1.5">
                <Layers size={14} /> UNSCHEDULED MISSIONS
              </span>
              <button 
                onClick={() => setIsUnscheduledOpen(false)}
                className="p-1 hover:bg-brand-accent/15 rounded-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsUnscheduledOpen(true)}
              className="mx-auto p-1 hover:bg-brand-accent/15 rounded-xs text-brand-accent cursor-pointer"
              title="Open Unscheduled Missions"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        {isUnscheduledOpen && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {unscheduledCards.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs uppercase border border-dashed border-slate-700/50 p-4 rounded-xs">
                All tasks scheduled.
              </div>
            ) : (
              unscheduledCards.map(card => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", card.id);
                  }}
                  onClick={() => onEditCard(card)}
                  className="p-3 bg-brand-bg/50 border border-brand-accent/10 hover:border-brand-accent/40 rounded-xs transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden"
                >
                  {/* Priority Tag Accent */}
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    card.priority === "HIGH" ? "bg-brand-destructive" : card.priority === "MEDIUM" ? "bg-amber-500" : "bg-emerald-500"
                  }`} />
                  
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>{card.code}</span>
                    <span className="text-brand-accent/80 font-bold uppercase">{card.priority}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-brand-accent transition-colors line-clamp-1">
                    {card.title}
                  </h4>
                  {card.storyPoints && (
                    <span className="inline-block mt-2 text-[9px] bg-brand-accent/10 text-brand-accent border border-brand-accent/20 px-1 py-0.5 rounded-xs">
                      {card.storyPoints} SP
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Main Gantt Timeline Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Zoom controls */}
        <div className="p-4 border-b border-brand-accent/20 bg-brand-card/50 flex items-center justify-between">
          <div className="flex gap-2">
            {(["DAYS", "WEEKS", "MONTHS"] as ZoomMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setZoomMode(mode)}
                className={`px-3 py-1 border rounded-xs text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
                  zoomMode === mode
                    ? "bg-brand-accent border-brand-accent text-white"
                    : "border-brand-accent/20 hover:border-brand-accent/50 text-slate-400 hover:text-slate-200"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="text-[10px] text-slate-500 uppercase">
            GANTT PLOTTER // DRAG BARS TO RESCHEDULE, RESIZE SIDES TO CHANGE DURATION
          </div>
        </div>

        {/* Timeline Grid */}
        <div 
          ref={timelineRef}
          className="flex-1 overflow-auto relative bg-[#040209]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const cardId = e.dataTransfer.getData("text/plain");
            console.log("GanttTimeline: onDrop triggered", { cardId });
            if (!cardId || !timelineRef.current) return;
            
            const rect = timelineRef.current.getBoundingClientRect();
            const dropX = e.clientX - rect.left + timelineRef.current.scrollLeft;
            console.log("GanttTimeline: drop details", { clientX: e.clientX, rectLeft: rect.left, scrollLeft: timelineRef.current.scrollLeft, dropX });
            const targetCard = state.cards[cardId];
            if (targetCard) {
              console.log("GanttTimeline: Scheduling card", targetCard);
              handleScheduleCard(targetCard, dropX);
            }
          }}
        >
          {/* Timeline Grid Width Ruler */}
          <div style={{ width: totalWidth }} className="h-full relative min-h-[500px]">
            
            {/* Header dates row */}
            <div className="flex border-b border-brand-accent/20 bg-brand-card/90 sticky top-0 z-10">
              {headers.map((h, i) => (
                <div
                  key={i}
                  style={{ width: columnWidth }}
                  className="shrink-0 border-r border-brand-accent/10 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-brand-card/90"
                >
                  {h.label}
                </div>
              ))}
            </div>

            {/* Vertical grid lines */}
            <div className="absolute inset-0 pointer-events-none flex">
              {headers.map((_, i) => (
                <div
                  key={i}
                  style={{ width: columnWidth }}
                  className="shrink-0 h-full border-r border-brand-accent/5"
                />
              ))}
            </div>

            {/* Render Task Gantt Bars */}
            <div className="py-6 space-y-4 relative z-0">
              {scheduledCards.map((card) => {
                const isDraggingThis = draggingCardId === card.id;
                const activeStart = isDraggingThis && dragCardState ? dragCardState.start : card.startDate;
                const activeDue = isDraggingThis && dragCardState ? dragCardState.due : card.dueDate;

                // Compute coordinates
                const x1 = getXFromDate(activeStart);
                const x2 = getXFromDate(activeDue);
                const width = Math.max(40, x2 - x1);

                return (
                  <div
                    key={card.id}
                    className="relative h-12 flex items-center group"
                  >
                    {/* Bar Container */}
                    <div
                      style={{
                        left: x1,
                        width: width,
                        position: "absolute",
                      }}
                      title={`MISSION: ${card.title}\nSTART: ${formatTacticalDateTime(activeStart) || "NOT SET"}\nDUE: ${formatTacticalDateTime(activeDue) || "NOT SET"}`}
                      className={`h-9 bg-brand-card/90 border rounded-xs flex items-center justify-between px-3 text-xs font-bold text-slate-200 transition-shadow ${
                        isDraggingThis
                          ? "border-brand-accent shadow-md shadow-brand-accent/30 cursor-grabbing"
                          : "border-brand-accent/30 hover:border-brand-accent shadow-xs"
                      }`}
                    >
                      {/* Resize Start Handle */}
                      <div
                        onMouseDown={(e) => handleMouseDown(e, card, "resize-start")}
                        className="absolute left-0 top-0 bottom-0 w-2 hover:bg-brand-accent bg-transparent cursor-ew-resize transition-all rounded-l-xs"
                      />

                      {/* Content click trigger and drag zone */}
                      <div
                        onMouseDown={(e) => handleMouseDown(e, card, "move")}
                        onClick={() => onEditCard(card)}
                        className="flex-1 h-full flex items-center justify-between select-none cursor-grab active:cursor-grabbing px-1 overflow-hidden"
                      >
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <span className="text-[10px] text-brand-accent font-mono truncate">{card.code}</span>
                          <span className="truncate text-slate-200 group-hover:text-brand-accent transition-colors">{card.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {card.storyPoints && (
                            <span className="text-[9px] bg-brand-accent/15 border border-brand-accent/20 px-1 py-0.5 rounded-xs text-brand-accent font-mono">
                              {card.storyPoints}
                            </span>
                          )}
                          <span className="text-[9px] text-slate-400 font-mono hidden md:inline mr-1">
                            {formatTacticalDateTime(activeStart)} - {formatTacticalDateTime(activeDue)}
                          </span>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            card.priority === "HIGH" ? "bg-brand-destructive" : card.priority === "MEDIUM" ? "bg-amber-500" : "bg-emerald-500"
                          }`} />
                        </div>
                      </div>

                      {/* Resize End Handle */}
                      <div
                        onMouseDown={(e) => handleMouseDown(e, card, "resize-end")}
                        className="absolute right-0 top-0 bottom-0 w-2 hover:bg-brand-accent bg-transparent cursor-ew-resize transition-all rounded-r-xs"
                      />
                    </div>
                  </div>
                );
              })}

              {scheduledCards.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-slate-600 uppercase text-xs border border-dashed border-slate-800 p-8 rounded-xs bg-brand-bg/50">
                    No scheduled missions. Drag items from the sidebar to set timeline.
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
