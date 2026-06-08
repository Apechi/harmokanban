import { useEffect, useState, useRef } from "react";
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
  localRole?: "editor" | "viewer";
  peers?: any[];
  onUpdateCursor?: (cursor: { x: number; y: number } | null) => void;
}

export default function Board({
  state,
  onStateChange,
  onEditCard,
  onAddCard,
  onUpdateColumnTitle,
  onDeleteColumn,
  activeCardViewers = {},
  localRole = "editor",
  peers = [],
  onUpdateCursor = () => {},
}: BoardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const lastUpdateRef = useRef(0);

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
    if (localRole === "viewer") return;

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left + container.scrollLeft) / container.scrollWidth) * 100;
    const y = ((e.clientY - rect.top + container.scrollTop) / container.scrollHeight) * 100;

    const now = Date.now();
    if (now - lastUpdateRef.current > 80) {
      onUpdateCursor({ x, y });
      lastUpdateRef.current = now;
    }
  };

  const handleMouseLeave = () => {
    onUpdateCursor(null);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN" isDropDisabled={localRole === "viewer"}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="flex gap-6 p-6 overflow-x-auto min-h-[calc(100vh-180px)] items-start select-none relative"
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
                  localRole={localRole}
                />
              );
            })}
            {provided.placeholder}

            {/* Render remote cursors */}
            {peers.map((peer) => {
              if (!peer.cursor) return null;

              const colors = [
                "#06b6d4", "#a855f7", "#f97316", "#10b981", "#ec4899", 
                "#3b82f6", "#eab308", "#ef4444", "#8b5cf6", "#14b8a6"
              ];
              const colorIdx = Math.abs(peer.id) % colors.length;
              const color = colors[colorIdx];

              return (
                <div
                  key={peer.id}
                  className="absolute pointer-events-none z-50 transition-all duration-75 ease-out"
                  style={{
                    left: `${peer.cursor.x}%`,
                    top: `${peer.cursor.y}%`,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ transform: "rotate(-15deg)" }}
                  >
                    <path
                      d="M1 1V11.5L4.5 8L8.5 15.5L11 14L7 6.5L12 6L1 1Z"
                      fill={color}
                      stroke="white"
                      strokeWidth="1"
                    />
                  </svg>
                  <div
                    className="mt-1 ml-3 px-1.5 py-0.5 rounded-xs text-[8px] font-mono text-white font-semibold uppercase tracking-wider whitespace-nowrap shadow-md border"
                    style={{
                      backgroundColor: color,
                      borderColor: "rgba(255, 255, 255, 0.2)"
                    }}
                  >
                    {peer.name}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
