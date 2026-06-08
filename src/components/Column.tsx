"use client";

import { useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { BoardColumn, TaskCard } from "@/types";
import Card from "./Card";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

interface ColumnProps {
  column: BoardColumn;
  cards: TaskCard[];
  index: number;
  onEditCard: (card: TaskCard) => void;
  onAddCard: (columnId: string) => void;
  onUpdateTitle: (columnId: string, newTitle: string) => void;
  onDelete: (columnId: string) => void;
  activeCardViewers?: { [cardId: string]: string[] };
}

export default function Column({
  column,
  cards,
  index,
  onEditCard,
  onAddCard,
  onUpdateTitle,
  onDelete,
  activeCardViewers = {},
}: ColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(column.title);

  const handleSave = () => {
    if (editedTitle.trim()) {
      onUpdateTitle(column.id, editedTitle.trim());
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditedTitle(column.title);
      setIsEditing(false);
    }
  };

  const handleDeleteColumn = () => {
    if (
      confirm(
        `Retire Column: Retiring this column will delete all nested cards. Proceed?`
      )
    ) {
      onDelete(column.id);
    }
  };

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`w-80 shrink-0 bg-brand-card/75 border border-brand-accent/15 rounded-xs p-4 flex flex-col max-h-[calc(100vh-200px)] transition-all ${
            snapshot.isDragging
              ? "border-brand-accent/50 shadow-lg shadow-brand-accent/10"
              : ""
          }`}
        >
          {/* Column Header */}
          <div
            {...provided.dragHandleProps}
            className="flex items-center justify-between pb-3 mb-3 border-b border-brand-accent/20 cursor-grab active:cursor-grabbing"
          >
            {isEditing ? (
              <div className="flex items-center gap-1 w-full mr-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-brand-bg text-slate-100 text-sm font-bold px-2 py-1 border border-brand-accent/50 rounded-xs focus:outline-hidden focus:ring-1 focus:ring-brand-accent w-full"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  className="p-1 hover:text-green-400 text-slate-400 cursor-pointer"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => {
                    setEditedTitle(column.title);
                    setIsEditing(false);
                  }}
                  className="p-1 hover:text-brand-destructive text-slate-400 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-wider text-slate-200 uppercase">
                    {column.title}
                  </h3>
                  <span className="tactical-label bg-brand-accent/10 text-brand-accent px-1.5 py-0.5 rounded-xs">
                    {cards.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 hover:text-brand-accent text-slate-400 transition-colors cursor-pointer"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={handleDeleteColumn}
                    className="p-1 hover:text-brand-destructive text-slate-400 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Droppable Card List */}
          <Droppable droppableId={column.id} type="CARD">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 overflow-y-auto space-y-3 min-h-[150px] pr-1 py-1 transition-colors rounded-xs ${
                  snapshot.isDraggingOver ? "bg-brand-accent/5" : ""
                }`}
              >
                {cards.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center border border-dashed border-brand-accent/10 rounded-xs text-center p-4">
                    <p className="tactical-label text-slate-500 font-bold mb-1">
                      NO OPERATIONS DEPLOYED
                    </p>
                    <p className="text-xs text-slate-600">
                      Establish a new column to begin task deployment.
                    </p>
                  </div>
                ) : (
                  cards.map((card, cardIndex) => (
                    <Card
                      key={card.id}
                      card={card}
                      index={cardIndex}
                      onClick={() => onEditCard(card)}
                      viewers={activeCardViewers[card.id] || []}
                    />
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Column Action Footer */}
          <button
            onClick={() => onAddCard(column.id)}
            className="mt-3 w-full py-2 border border-dashed border-brand-accent/20 hover:border-brand-accent/60 bg-brand-bg/40 hover:bg-brand-accent/5 text-slate-300 hover:text-slate-100 rounded-xs flex items-center justify-center gap-1.5 transition-all text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            <Plus size={14} />
            CREATE CARD
          </button>
        </div>
      )}
    </Draggable>
  );
}
