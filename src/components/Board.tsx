"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { BoardState, TaskCard, BoardColumn } from "@/types";
import Column from "./Column";

interface BoardProps {
  state: BoardState;
  onStateChange: (newState: BoardState) => void;
  onEditCard: (card: TaskCard) => void;
  onAddCard: (columnId: string) => void;
  onUpdateColumnTitle: (columnId: string, newTitle: string) => void;
  onDeleteColumn: (columnId: string) => void;
  activeCardViewers?: { [cardId: string]: string[] };
}

export default function Board({
  state,
  onStateChange,
  onEditCard,
  onAddCard,
  onUpdateColumnTitle,
  onDeleteColumn,
  activeCardViewers = {},
}: BoardProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Avoid hydration mismatch with client-side drag-and-drop
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex gap-6 p-6 overflow-x-auto min-h-[500px]">
        {state.columnOrder.map((colId) => {
          const column = state.columns[colId];
          return (
            <div
              key={colId}
              className="w-80 shrink-0 bg-brand-card/50 border border-brand-accent/10 rounded-sm p-4 h-[600px] animate-pulse"
            >
              <div className="h-6 w-32 bg-brand-accent/20 rounded-xs mb-4"></div>
              <div className="space-y-3">
                <div className="h-24 bg-brand-bg/40 rounded-xs"></div>
                <div className="h-24 bg-brand-bg/40 rounded-xs"></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Handle column reordering
    if (type === "COLUMN") {
      const newColumnOrder = Array.from(state.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      onStateChange({
        ...state,
        columnOrder: newColumnOrder,
      });
      return;
    }

    // Handle card reordering
    const startCol = state.columns[source.droppableId];
    const endCol = state.columns[destination.droppableId];

    if (!startCol || !endCol) return;

    if (startCol.id === endCol.id) {
      // Reorder cards in same column
      const newCardIds = Array.from(startCol.cardIds);
      newCardIds.splice(source.index, 1);
      newCardIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startCol,
        cardIds: newCardIds,
      };

      onStateChange({
        ...state,
        columns: {
          ...state.columns,
          [newColumn.id]: newColumn,
        },
      });
    } else {
      // Move card to another column
      const startCardIds = Array.from(startCol.cardIds);
      startCardIds.splice(source.index, 1);
      const newStartCol = {
        ...startCol,
        cardIds: startCardIds,
      };

      const endCardIds = Array.from(endCol.cardIds);
      endCardIds.splice(destination.index, 0, draggableId);
      const newEndCol = {
        ...endCol,
        cardIds: endCardIds,
      };

      // Also update card's columnId
      const updatedCard = {
        ...state.cards[draggableId],
        columnId: endCol.id,
      };

      onStateChange({
        ...state,
        columns: {
          ...state.columns,
          [newStartCol.id]: newStartCol,
          [newEndCol.id]: newEndCol,
        },
        cards: {
          ...state.cards,
          [draggableId]: updatedCard,
        },
      });
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex gap-6 p-6 overflow-x-auto min-h-[calc(100vh-180px)] items-start select-none"
          >
            {state.columnOrder.map((columnId, index) => {
              const column = state.columns[columnId];
              if (!column) return null;
              const columnCards = column.cardIds
                .map((cardId) => state.cards[cardId])
                .filter(Boolean);

              return (
                <Column
                  key={column.id}
                  column={column}
                  cards={columnCards}
                  index={index}
                  onEditCard={onEditCard}
                  onAddCard={onAddCard}
                  onUpdateTitle={onUpdateColumnTitle}
                  onDelete={onDeleteColumn}
                  activeCardViewers={activeCardViewers}
                />
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
