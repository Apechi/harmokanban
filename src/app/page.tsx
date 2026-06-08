"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, LayoutGrid, AlertCircle, RefreshCw, Radio, Calendar, Sliders, BarChart2 } from "lucide-react";
import { BoardState, TaskCard, BoardColumn, Project } from "@/types";
import { loadBoardState, saveBoardState, loadProjectsList, saveProjectsList, DEFAULT_PROJECT_ID } from "@/lib/db";
import Board from "@/components/Board";
import CardModal from "@/components/CardModal";
import CollaborateDrawer from "@/components/CollaborateDrawer";
import { useCollaboration } from "@/hooks/useCollaboration";
import GanttTimeline from "@/components/GanttTimeline";
import AutomationConsole from "@/components/AutomationConsole";
import { runAutomations, DEFAULT_RULES, AutomationRule } from "@/lib/automations";
import ProjectSidebar from "@/components/ProjectSidebar";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

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
      startDate: null,
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
      startDate: null,
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
      startDate: null,
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

// Helper to initialize status history on old cards
function initializeStatusHistory(state: BoardState): BoardState {
  if (!state.cards) return state;
  const updatedCards = { ...state.cards };
  let changed = false;
  Object.keys(updatedCards).forEach((cardId) => {
    const card = updatedCards[cardId];
    if (!card.statusHistory || card.statusHistory.length === 0) {
      updatedCards[cardId] = {
        ...card,
        statusHistory: [{ columnId: card.columnId, timestamp: card.createdAt || Date.now() }],
      };
      changed = true;
    }
  });
  return changed ? { ...state, cards: updatedCards } : state;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>(DEFAULT_PROJECT_ID);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [boardState, setBoardState] = useState<BoardState | null>(null);
  const [activeCard, setActiveCard] = useState<TaskCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCollabOpen, setIsCollabOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "gantt" | "analytics">("kanban");
  const [isAutomationOpen, setIsAutomationOpen] = useState(false);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);

  // Initialize collaboration hook
  const {
    roomId,
    isConnected,
    peerCount,
    peers,
    localCallsign,
    localUserId,
    isOwner,
    localRole,
    updateLocalRole,
    changePeerRole,
    updateCallsign,
    connectToRoom,
    disconnectFromRoom,
    setEditingCard,
    updateCursor,
    broadcastBoardState,
  } = useCollaboration(boardState, setBoardState);

  // Initialize projects and active board state
  useEffect(() => {
    async function initProjectsAndBoard() {
      // 1. Load projects list
      let loadedProjects = await loadProjectsList();
      const defaultProj: Project = {
        id: DEFAULT_PROJECT_ID,
        name: "Main Operations",
        roomId: null,
        isOnline: false,
        archived: false,
        createdAt: Date.now(),
      };

      if (!loadedProjects || loadedProjects.length === 0) {
        loadedProjects = [defaultProj];
        await saveProjectsList(loadedProjects);
      }
      setProjects(loadedProjects);

      // Determine active project
      const activeProj = loadedProjects.find((p) => !p.archived) || defaultProj;
      setActiveProjectId(activeProj.id);

      // 2. Load board state for active project
      const savedBoard = await loadBoardState(activeProj.id);
      if (savedBoard && savedBoard.columns && savedBoard.columnOrder && savedBoard.cards) {
        const initialized = initializeStatusHistory(savedBoard);
        setBoardState(initialized);
        if (JSON.stringify(initialized) !== JSON.stringify(savedBoard)) {
          await saveBoardState(initialized, activeProj.id);
        }
      } else {
        const initialized = initializeStatusHistory(DEFAULT_STATE);
        setBoardState(initialized);
        await saveBoardState(initialized, activeProj.id);
      }
    }
    initProjectsAndBoard();
  }, []);

  // Sync collaboration connection state back to the projects list
  useEffect(() => {
    if (projects.length === 0) return;
    const updated = projects.map((p) => {
      if (p.id === activeProjectId) {
        return {
          ...p,
          roomId: roomId,
          isOnline: isConnected,
        };
      }
      return p;
    });
    // Only update if changed
    if (JSON.stringify(updated) !== JSON.stringify(projects)) {
      setProjects(updated);
      saveProjectsList(updated);
    }
  }, [roomId, isConnected, activeProjectId, projects]);

  // Handle switching projects
  const handleSelectProject = async (id: string) => {
    if (id === activeProjectId) return;

    // Disconnect old room connection first
    disconnectFromRoom();

    setActiveProjectId(id);

    const savedBoard = await loadBoardState(id);
    let currentBoard = savedBoard;

    if (!savedBoard || !savedBoard.columns || !savedBoard.columnOrder || !savedBoard.cards) {
      // Create clean board state for new project
      const cleanState: BoardState = {
        columns: {
          "col-todo": { id: "col-todo", title: "TODO", cardIds: [] },
          "col-progress": { id: "col-progress", title: "IN PROGRESS", cardIds: [] },
          "col-review": { id: "col-review", title: "REVIEW", cardIds: [] },
          "col-done": { id: "col-done", title: "DONE", cardIds: [] },
        },
        columnOrder: ["col-todo", "col-progress", "col-review", "col-done"],
        cards: {},
      };
      currentBoard = cleanState;
      setBoardState(cleanState);
      await saveBoardState(cleanState, id);
    } else {
      const initialized = initializeStatusHistory(savedBoard);
      currentBoard = initialized;
      setBoardState(initialized);
      if (JSON.stringify(initialized) !== JSON.stringify(savedBoard)) {
        await saveBoardState(initialized, id);
      }
    }

    // Connect to room if the project is configured with a room
    const targetProject = projects.find((p) => p.id === id);
    if (targetProject && targetProject.roomId && currentBoard) {
      connectToRoom(targetProject.roomId, currentBoard);
    }
  };

  // Create project
  const handleCreateProject = async (name: string) => {
    const newId = crypto.randomUUID();
    const newProj: Project = {
      id: newId,
      name,
      roomId: null,
      isOnline: false,
      archived: false,
      createdAt: Date.now(),
    };

    const updatedProjects = [...projects, newProj];
    setProjects(updatedProjects);
    await saveProjectsList(updatedProjects);

    // Seed empty board state
    const cleanState: BoardState = {
      columns: {
        "col-todo": { id: "col-todo", title: "TODO", cardIds: [] },
        "col-progress": { id: "col-progress", title: "IN PROGRESS", cardIds: [] },
        "col-review": { id: "col-review", title: "REVIEW", cardIds: [] },
        "col-done": { id: "col-done", title: "DONE", cardIds: [] },
      },
      columnOrder: ["col-todo", "col-progress", "col-review", "col-done"],
      cards: {},
    };

    setBoardState(cleanState);
    await saveBoardState(cleanState, newId);
    setActiveProjectId(newId);
  };

  // Rename project
  const handleRenameProject = async (id: string, newName: string) => {
    const updated = projects.map((p) => (p.id === id ? { ...p, name: newName } : p));
    setProjects(updated);
    await saveProjectsList(updated);
  };

  // Archive/delete project
  const handleDeleteProject = async (id: string) => {
    const updated = projects.map((p) => (p.id === id ? { ...p, archived: true } : p));
    
    const remaining = updated.filter((p) => !p.archived);
    if (remaining.length === 0) {
      // If no projects remain, automatically create a new default project
      const defaultProj: Project = {
        id: DEFAULT_PROJECT_ID,
        name: "Main Operations",
        roomId: null,
        isOnline: false,
        archived: false,
        createdAt: Date.now(),
      };
      updated.push(defaultProj);
      remaining.push(defaultProj);
    }

    setProjects(updated);
    await saveProjectsList(updated);

    if (activeProjectId === id) {
      handleSelectProject(remaining[0].id);
    }
  };

  // Load automation rules on mount
  useEffect(() => {
    const savedRules = localStorage.getItem("kanban-automations");
    if (savedRules) {
      try {
        setAutomationRules(JSON.parse(savedRules));
      } catch (e) {
        setAutomationRules(DEFAULT_RULES);
      }
    } else {
      setAutomationRules(DEFAULT_RULES);
      localStorage.setItem("kanban-automations", JSON.stringify(DEFAULT_RULES));
    }
  }, []);

  // Periodically execute automations (e.g. for time-based triggers like due dates)
  useEffect(() => {
    if (!boardState || automationRules.length === 0 || localRole === "viewer") return;

    // Check once when board state is loaded
    runAutomations(boardState, automationRules, (updatedState) => {
      updateBoardState(updatedState, "automation");
    });

    const interval = setInterval(() => {
      runAutomations(boardState, automationRules, (updatedState) => {
        updateBoardState(updatedState, "automation");
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [boardState, automationRules, localRole]);

  const handleRulesChange = (newRules: AutomationRule[]) => {
    setAutomationRules(newRules);
    localStorage.setItem("kanban-automations", JSON.stringify(newRules));
  };

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
  const updateBoardState = async (newState: BoardState, origin?: string) => {
    if (localRole === "viewer") return;

    let finalState = newState;

    if (origin !== "automation") {
      runAutomations(newState, automationRules, (automatedState) => {
        finalState = automatedState;
        origin = "automation";
      });
    }

    // Record status transitions dynamically
    if (boardState && boardState.cards) {
      const updatedCards = { ...finalState.cards };
      let changed = false;
      Object.keys(updatedCards).forEach((cardId) => {
        const newCard = updatedCards[cardId];
        const oldCard = boardState.cards[cardId];
        
        const currentHistory = newCard.statusHistory || [];
        
        if (!oldCard || currentHistory.length === 0) {
          updatedCards[cardId] = {
            ...newCard,
            statusHistory: [{ columnId: newCard.columnId, timestamp: Date.now() }],
          };
          changed = true;
        } else if (newCard.columnId !== oldCard.columnId) {
          const lastTransition = currentHistory[currentHistory.length - 1];
          if (!lastTransition || lastTransition.columnId !== newCard.columnId) {
            updatedCards[cardId] = {
              ...newCard,
              statusHistory: [...currentHistory, { columnId: newCard.columnId, timestamp: Date.now() }],
            };
            changed = true;
          }
        }
      });
      if (changed) {
        finalState = {
          ...finalState,
          cards: updatedCards,
        };
      }
    }

    setBoardState(finalState);
    setIsSaving(true);
    await saveBoardState(finalState, activeProjectId);
    broadcastBoardState(finalState, origin);
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
      startDate: null,
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

          {/* View Mode Segmented Switcher */}
          <div className="flex bg-brand-bg/60 p-0.5 border border-brand-accent/20 rounded-xs">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "kanban"
                  ? "bg-brand-accent text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutGrid size={11} />
              Kanban
            </button>
            <button
              onClick={() => setViewMode("gantt")}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "gantt"
                  ? "bg-brand-accent text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Calendar size={11} />
              Gantt
            </button>
            <button
              onClick={() => setViewMode("analytics")}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "analytics"
                  ? "bg-brand-accent text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart2 size={11} />
              Analytics
            </button>
          </div>

          {/* Automations Console Button */}
          <button
            onClick={() => setIsAutomationOpen(true)}
            className="px-4 py-2 border border-brand-accent/50 bg-brand-accent/5 hover:bg-brand-accent/15 text-brand-accent rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sliders size={14} />
            AUTOMATIONS
          </button>

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

      {/* Sidebar + Main Workspace layout container */}
      <div className="flex flex-1 overflow-hidden">
        <ProjectSidebar
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onRenameProject={handleRenameProject}
          onDeleteProject={handleDeleteProject}
          isOpen={isSidebarOpen}
          onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Main Kanban Workspace Container */}
        <main className="flex-1 bg-brand-bg relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(168,85,247,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,85,247,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

          {viewMode === "kanban" ? (
            <Board
              state={boardState}
              onStateChange={updateBoardState}
              onEditCard={handleEditCard}
              onAddCard={handleAddCard}
              onUpdateColumnTitle={handleUpdateColumnTitle}
              onDeleteColumn={handleDeleteColumn}
              activeCardViewers={activeCardViewers}
              localRole={localRole}
              peers={peers}
              onUpdateCursor={updateCursor}
            />
          ) : viewMode === "gantt" ? (
            <GanttTimeline
              state={boardState}
              onStateChange={updateBoardState}
              onEditCard={handleEditCard}
              localRole={localRole}
              peers={peers}
              onUpdateCursor={updateCursor}
            />
          ) : (
            <AnalyticsDashboard state={boardState} />
          )}
        </main>
      </div>

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
        localRole={localRole}
        viewers={activeCard ? (activeCardViewers[activeCard.id] || []) : []}
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
        localUserId={localUserId}
        isOwner={isOwner}
        localRole={localRole}
        onUpdateCallsign={updateCallsign}
        onUpdateRole={updateLocalRole}
        onChangePeerRole={changePeerRole}
        onConnect={(code) => {
          if (boardState) connectToRoom(code, boardState);
        }}
        onDisconnect={disconnectFromRoom}
      />

      {/* Automations Console sidebar drawer overlay */}
      <AutomationConsole
        isOpen={isAutomationOpen}
        onClose={() => setIsAutomationOpen(false)}
        state={boardState}
        rules={automationRules}
        onRulesChange={handleRulesChange}
      />
    </div>
  );
}

