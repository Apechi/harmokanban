"use client";

import { useEffect, useState, useRef } from "react";
import { BoardState, TaskCard, BoardColumn } from "@/types";
import { loadBoardState, saveBoardState } from "@/lib/db";
import Board from "@/components/Board";
import CardModal from "@/components/CardModal";
import CollaborateDrawer from "@/components/CollaborateDrawer";
import { useCollaboration } from "@/hooks/useCollaboration";
import { Plus, LayoutGrid, AlertCircle, RefreshCw, Radio } from "lucide-react";

// Default seed data if IndexedDB is empty
const DEFAULT_STATE: BoardState = {
  columns: {
    "col-todo": {
      id: "col-todo",
      title: "TODO",
      cardIds: ["card-welcome", "card-persistent"],
    },
    "col-progress": {
      id: "col-progress",
      title: "IN PROGRESS",
      cardIds: ["card-style"],
    },
    "col-review": {
      id: "col-review",
      title: "REVIEW",
      cardIds: [],
    },
    "col-done": {
      id: "col-done",
      title: "DONE",
      cardIds: [],
    },
  },
  columnOrder: ["col-todo", "col-progress", "col-review", "col-done"],
  cards: {
    "card-welcome": {
      id: "card-welcome",
      columnId: "col-todo",
      title: "Welcome to KanbanHarmo",
      description: "This is a tactical sci-fi Kanban board designed for rapid startup planning. Double-click or click this card to open details.",
      priority: "LOW",
      tags: ["tutorial", "board"],
      dueDate: "2026-06-30",
      storyPoints: 1,
      subTasks: [
        { id: "sub-1", title: "Read the card description", completed: true },
        { id: "sub-2", title: "Drag this card to IN PROGRESS", completed: false },
      ],
      code: "OP-101",
      createdAt: Date.now(),
    },
    "card-persistent": {
      id: "card-persistent",
      columnId: "col-todo",
      title: "Verify IndexedDB Persistence",
      description: "Any changes you make to columns or cards are automatically stored in the browser's IndexedDB. Try refreshing the page after making a change!",
      priority: "MEDIUM",
      tags: ["storage", "offline"],
      dueDate: null,
      storyPoints: 3,
      subTasks: [
        { id: "sub-3", title: "Create a new column", completed: false },
        { id: "sub-4", title: "Rename 'TODO' to 'INCOMING'", completed: false },
      ],
      code: "OP-102",
      createdAt: Date.now() + 10,
    },
    "card-style": {
      id: "card-style",
      columnId: "col-progress",
      title: "Implement Arknights Tactical Theme",
      description: "Achieve premium dark neon aesthetics: deep violet background, corner bracket borders, Share Tech Mono fonts, and graffiti badges.",
      priority: "HIGH",
      tags: ["design", "ui"],
      dueDate: "2026-06-15",
      storyPoints: 5,
      subTasks: [
        { id: "sub-5", title: "Set dominant color #0a0512", completed: true },
        { id: "sub-6", title: "Add corner bracket effects", completed: true },
        { id: "sub-7", title: "Inject graffiti stickers", completed: true },
      ],
      code: "OP-103",
      createdAt: Date.now() + 20,
    },
  },
};

export default function Home() {
  const [boardState, setBoardState] = useState<BoardState | null>(null);
  const [activeCard, setActiveCard] = useState<TaskCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCollabOpen, setIsCollabOpen] = useState(false);

  // Initialize collaboration hook
  const {
    roomId,
    isConnected,
    peerCount,
    peers,
    localCallsign,
    updateCallsign,
    connectToRoom,
    disconnectFromRoom,
    setEditingCard,
    broadcastBoardState,
  } = useCollaboration(boardState, setBoardState);

  // Load state on mount
  useEffect(() => {
    async function initBoard() {
      const saved = await loadBoardState();
      if (saved) {
        if (saved.columns && saved.columnOrder && saved.cards) {
          setBoardState(saved);
        } else {
          setBoardState(DEFAULT_STATE);
        }
      } else {
        setBoardState(DEFAULT_STATE);
        await saveBoardState(DEFAULT_STATE);
      }
    }
    initBoard();
  }, []);

  // Handle auto-join from URL parameter
  const autoJoinCheckedRef = useRef(false);
  useEffect(() => {
    if (boardState && !autoJoinCheckedRef.current) {
      autoJoinCheckedRef.current = true;
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get("room");
      if (roomParam) {
        connectToRoom(roomParam, boardState);
      }
    }
  }, [boardState, connectToRoom]);

  // Save board state helper with local state updates
  const updateBoardState = async (newState: BoardState) => {
    setBoardState(newState);
    setIsSaving(true);
    await saveBoardState(newState);
    broadcastBoardState(newState);
    setIsSaving(false);
  };

  // Add a card
  const handleAddCard = (columnId: string) => {
    if (!boardState) return;

    const codeNum = Object.keys(boardState.cards).length + 101;
    const newCard: TaskCard = {
      id: crypto.randomUUID(),
      columnId,
      title: "New Task Deployment",
      description: "",
      priority: "LOW",
      tags: [],
      dueDate: null,
      storyPoints: null,
      subTasks: [],
      code: `OP-${codeNum}`,
      createdAt: Date.now(),
    };

    const updatedCards = {
      ...boardState.cards,
      [newCard.id]: newCard,
    };

    const targetColumn = boardState.columns[columnId];
    const updatedColumns = {
      ...boardState.columns,
      [columnId]: {
        ...targetColumn,
        cardIds: [...targetColumn.cardIds, newCard.id],
      },
    };

    updateBoardState({
      ...boardState,
      columns: updatedColumns,
      cards: updatedCards,
    });
  };

  // Edit card trigger
  const handleEditCard = (card: TaskCard) => {
    setActiveCard(card);
    setIsModalOpen(true);
    setEditingCard(card.id);
  };

  // Save edited card
  const handleSaveCard = (updatedCard: TaskCard) => {
    if (!boardState) return;

    const updatedCards = {
      ...boardState.cards,
      [updatedCard.id]: updatedCard,
    };

    updateBoardState({
      ...boardState,
      cards: updatedCards,
    });
  };

  // Delete card
  const handleDeleteCard = (cardId: string, columnId: string) => {
    if (!boardState) return;

    const updatedCards = { ...boardState.cards };
    delete updatedCards[cardId];

    const targetColumn = boardState.columns[columnId];
    const updatedColumns = {
      ...boardState.columns,
      [columnId]: {
        ...targetColumn,
        cardIds: targetColumn.cardIds.filter((id) => id !== cardId),
      },
    };

    updateBoardState({
      ...boardState,
      columns: updatedColumns,
      cards: updatedCards,
    });
  };

  // Add column
  const handleAddColumn = () => {
    if (!boardState) return;

    const colId = `col-${crypto.randomUUID().slice(0, 8)}`;
    const newColumn: BoardColumn = {
      id: colId,
      title: "NEW SQUAD",
      cardIds: [],
    };

    const updatedColumns = {
      ...boardState.columns,
      [colId]: newColumn,
    };

    updateBoardState({
      ...boardState,
      columns: updatedColumns,
      columnOrder: [...boardState.columnOrder, colId],
    });
  };

  // Update column title
  const handleUpdateColumnTitle = (columnId: string, newTitle: string) => {
    if (!boardState) return;

    const updatedColumns = {
      ...boardState.columns,
      [columnId]: {
        ...boardState.columns[columnId],
        title: newTitle,
      },
    };

    updateBoardState({
      ...boardState,
      columns: updatedColumns,
    });
  };

  // Delete column
  const handleDeleteColumn = (columnId: string) => {
    if (!boardState) return;

    const column = boardState.columns[columnId];
    const updatedColumns = { ...boardState.columns };
    delete updatedColumns[columnId];

    const updatedCards = { ...boardState.cards };
    column.cardIds.forEach((id) => {
      delete updatedCards[id];
    });

    const updatedColumnOrder = boardState.columnOrder.filter((id) => id !== columnId);

    updateBoardState({
      ...boardState,
      columns: updatedColumns,
      cards: updatedCards,
      columnOrder: updatedColumnOrder,
    });
  };

  // Calculate remote viewers map
  const activeCardViewers = peers.reduce((acc, peer) => {
    if (peer.activeCardId) {
      if (!acc[peer.activeCardId]) {
        acc[peer.activeCardId] = [];
      }
      acc[peer.activeCardId].push(peer.name);
    }
    return acc;
  }, {} as { [cardId: string]: string[] });

  if (!boardState) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-brand-bg text-slate-100 font-mono">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-brand-accent" size={32} />
          <span className="text-sm tracking-widest uppercase">INITIALIZING TACTICAL DATA LINKS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      {/* Top Banner Navigation */}
      <header className="border-b border-brand-accent/25 bg-brand-card/90 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-accent/15 border border-brand-accent/30 rounded-xs text-brand-accent">
            <LayoutGrid size={20} />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-wider text-slate-100 flex items-center gap-2">
              KANBANHARMO
              <span className="text-[10px] bg-brand-accent/20 text-brand-accent px-1.5 py-0.5 rounded-full font-mono uppercase tracking-normal">
                v1.1-Collab
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-0.5">
              STATUS: {isConnected ? `CONNECTED TO [${roomId}]` : "LOCAL DATABASE ACTIVE"} // TARGETS PERSISTED
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-end md:self-auto font-mono">
          {isSaving && (
            <span className="text-[10px] text-brand-accent/80 animate-pulse flex items-center gap-1">
              <RefreshCw size={11} className="animate-spin" /> SYNCING...
            </span>
          )}

          {/* Collaborate Button */}
          <button
            onClick={() => setIsCollabOpen(true)}
            className={`px-4 py-2 border rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              isConnected
                ? "border-cyan-400/50 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 shadow-sm shadow-cyan-400/10"
                : "border-brand-accent/50 bg-brand-accent/5 hover:bg-brand-accent/15 text-brand-accent"
            }`}
          >
            <Radio size={14} className={isConnected ? "animate-pulse" : ""} />
            {isConnected ? `SQUAD LINKED (${peerCount + 1})` : "COLLABORATE"}
          </button>

          <button
            onClick={handleAddColumn}
            className="px-4 py-2 border border-brand-accent hover:border-brand-accent/80 bg-brand-accent/10 hover:bg-brand-accent/20 text-slate-100 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus size={14} />
            ADD SQUAD COLUMN
          </button>
        </div>
      </header>

      {/* Main Kanban Workspace Container */}
      <main className="flex-1 bg-brand-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(168,85,247,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,85,247,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <Board
          state={boardState}
          onStateChange={updateBoardState}
          onEditCard={handleEditCard}
          onAddCard={handleAddCard}
          onUpdateColumnTitle={handleUpdateColumnTitle}
          onDeleteColumn={handleDeleteColumn}
          activeCardViewers={activeCardViewers}
        />
      </main>

      {/* Card Details Modal Drawer */}
      <CardModal
        card={activeCard}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setActiveCard(null);
          setEditingCard(null);
        }}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
      />

      {/* Collaborate side drawer overlay */}
      <CollaborateDrawer
        isOpen={isCollabOpen}
        onClose={() => setIsCollabOpen(false)}
        roomId={roomId}
        isConnected={isConnected}
        peerCount={peerCount}
        peers={peers}
        localCallsign={localCallsign}
        onUpdateCallsign={updateCallsign}
        onConnect={(code) => {
          if (boardState) connectToRoom(code, boardState);
        }}
        onDisconnect={disconnectFromRoom}
      />
    </div>
  );
}

