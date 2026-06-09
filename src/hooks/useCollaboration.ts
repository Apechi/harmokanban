"use client";

import { useEffect, useState, useRef } from "react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { IndexeddbPersistence } from "y-indexeddb";
import { BoardState } from "@/types";
import {
  syncBoardStateToYjs,
  syncYjsToBoardState,
  getRandomOperatorCallsign,
  saveBackupBoardState,
} from "@/lib/collaboration";
import { saveBoardState } from "@/lib/db";

export interface PeerInfo {
  id: number;
  userId: string;
  name: string;
  activeCardId: string | null;
  role: "editor" | "viewer";
  cursor: { x: number; y: number } | null;
}

function getRandomMaxConns() {
  return 20 + Math.floor(Math.random() * 15);
}

export function useCollaboration(
  initialLocalState: BoardState | null,
  setLocalState: (state: BoardState) => void
) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [peerCount, setPeerCount] = useState(0);
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [localCallsign, setLocalCallsign] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("squad-operator-callsign") || getRandomOperatorCallsign();
    }
    return "";
  });
  
  // Persistent local user ID
  const [localUserId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("squad-operator-id");
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("squad-operator-id", id);
      }
      return id;
    }
    return "";
  });

  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [localRole, setLocalRole] = useState<"editor" | "viewer">("editor");

  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebrtcProvider | null>(null);
  const persistenceRef = useRef<IndexeddbPersistence | null>(null);
  const isSyncingFromYjsRef = useRef(false);
  const ownerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync callsign to localStorage if generated
  useEffect(() => {
    if (localCallsign) {
      const saved = localStorage.getItem("squad-operator-callsign");
      if (!saved) {
        localStorage.setItem("squad-operator-callsign", localCallsign);
      }
    }
  }, [localCallsign]);

  // Synchronize local user presence to Yjs awareness when fields change
  useEffect(() => {
    if (providerRef.current) {
      const currentPresence = providerRef.current.awareness.getLocalState()?.user || {};
      providerRef.current.awareness.setLocalStateField("user", {
        ...currentPresence,
        userId: localUserId,
        name: localCallsign || "Operator",
        role: localRole,
      });
    }
  }, [localCallsign, localRole, localUserId, isConnected]);

  // Update callsign function
  const updateCallsign = (newCallsign: string) => {
    const trimmed = newCallsign.trim();
    if (!trimmed) return;
    setLocalCallsign(trimmed);
    localStorage.setItem("squad-operator-callsign", trimmed);
  };

  // Change remote peer role (invoked by owner)
  const changePeerRole = (peerUserId: string, role: "editor" | "viewer") => {
    if (!ydocRef.current) return;
    const yMetaMap = ydocRef.current.getMap("room-metadata");
    const currentOwner = yMetaMap.get("ownerId") as string | undefined;
    if (currentOwner !== localUserId) return; // Only owner can change roles

    const yRolesMap = ydocRef.current.getMap("room-roles");
    yRolesMap.set(peerUserId, role);
  };

  // Update local role function (internal / fallback)
  const updateLocalRole = (role: "editor" | "viewer") => {
    setLocalRole(role);
  };

  // Update cursor position function
  const updateCursor = (cursor: { x: number; y: number } | null) => {
    if (providerRef.current) {
      const currentPresence = providerRef.current.awareness.getLocalState()?.user || {};
      providerRef.current.awareness.setLocalStateField("user", {
        ...currentPresence,
        cursor,
      });
    }
  };

  // Connect to a collaborative room
  const connectToRoom = async (roomCode: string, currentBoard: BoardState) => {
    const cleanRoomCode = roomCode.trim().toUpperCase();
    if (!cleanRoomCode) return;

    // Disconnect from existing room first
    disconnectFromRoom();

    setRoomId(cleanRoomCode);
    setIsConnected(true);

    const doc = new Y.Doc();
    ydocRef.current = doc;

    const yRootMap = doc.getMap("board-root");
    const yMetaMap = doc.getMap("room-metadata");
    const yRolesMap = doc.getMap("room-roles");

    // 1. Setup offline persistence for the room document
    const persistence = new IndexeddbPersistence(cleanRoomCode, doc);
    persistenceRef.current = persistence;

    // 2. Setup WebRTC Provider
    const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
    const signalingHost = typeof window !== "undefined" ? window.location.hostname : "localhost";
    const prodSignaling = process.env.NEXT_PUBLIC_SIGNALING_URL || "wss://signaling.yjs.dev";
    const signalingServers = isSecure
      ? [prodSignaling]
      : [`ws://${signalingHost}:4444`, prodSignaling];

    let provider: WebrtcProvider;
    try {
      provider = new WebrtcProvider(cleanRoomCode, doc, {
        signaling: signalingServers,
        filterBcConns: true,
        maxConns: getRandomMaxConns(),
      });
    } catch (err) {
      console.warn("[Collab] WebRTC provider init failed, local-only mode:", err);
      setIsConnected(false);
      return;
    }
    providerRef.current = provider;

    // Track peer connection events to update status
    provider.on("peers", () => {
      const connected = provider.connected;
      setIsConnected(connected);
    });

    // Set local presence immediately
    provider.awareness.setLocalStateField("user", {
      userId: localUserId,
      name: localCallsign || "Operator",
      activeCardId: null,
      role: localRole,
      cursor: null,
    });

    // Determine initial owner and roles
    const setupRoomOwnershipAndRoles = () => {
      const currentOwnerId = yMetaMap.get("ownerId") as string | undefined;
      if (currentOwnerId) {
        setOwnerId(currentOwnerId);
        if (localUserId === currentOwnerId) {
          setLocalRole("editor");
        } else {
          const assignedRole = yRolesMap.get(localUserId) as "editor" | "viewer" | undefined;
          setLocalRole(assignedRole || "viewer");
        }
      } else {
        // No owner found in local persistence/state.
        // Wait to see if we sync with an existing owner over the network.
        if (ownerTimerRef.current) {
          clearTimeout(ownerTimerRef.current);
        }
        ownerTimerRef.current = setTimeout(() => {
          if (!ydocRef.current) return;
          const currentMeta = ydocRef.current.getMap("room-metadata");
          if (!currentMeta.has("ownerId")) {
            console.log("[Collab] No existing owner detected after delay. Claiming ownership.");
            currentMeta.set("ownerId", localUserId);
            setOwnerId(localUserId);
            setLocalRole("editor");
          }
          ownerTimerRef.current = null;
        }, 1500);
      }
    };

    // Observe changes on room metadata and roles
    yMetaMap.observe(() => {
      const currentOwnerId = yMetaMap.get("ownerId") as string | undefined;
      if (currentOwnerId) {
        if (ownerTimerRef.current) {
          clearTimeout(ownerTimerRef.current);
          ownerTimerRef.current = null;
        }
        setOwnerId(currentOwnerId);
        if (localUserId === currentOwnerId) {
          setLocalRole("editor");
        } else {
          const assignedRole = yRolesMap.get(localUserId) as "editor" | "viewer" | undefined;
          setLocalRole(assignedRole || "viewer");
        }
      }
    });

    yRolesMap.observe(() => {
      const currentOwnerId = yMetaMap.get("ownerId") as string | undefined;
      if (localUserId !== currentOwnerId) {
        const assignedRole = yRolesMap.get(localUserId) as "editor" | "viewer" | undefined;
        setLocalRole(assignedRole || "viewer");
      }
    });

    // 3. Handle awareness / presence updates
    const handleAwarenessChange = () => {
      const states = provider.awareness.getStates();
      const newPeers: PeerInfo[] = [];
      states.forEach((state: unknown, clientID) => {
        const presence = state as { user?: { userId?: string; name: string; activeCardId?: string | null; role?: "editor" | "viewer"; cursor?: { x: number; y: number } | null } };
        if (clientID !== doc.clientID && presence.user) {
          newPeers.push({
            id: clientID,
            userId: presence.user.userId || "",
            name: presence.user.name,
            activeCardId: presence.user.activeCardId || null,
            role: presence.user.role || "viewer",
            cursor: presence.user.cursor || null,
          });
        }
      });
      setPeers(newPeers);
      setPeerCount(newPeers.length);
    };

    provider.awareness.on("change", handleAwarenessChange);

    // Wait for local IndexedDB updates to load
    persistence.once("synced", async () => {
      setupRoomOwnershipAndRoles();

      // Check if room board map is empty
      const hasData = yRootMap.has("columnOrder");

      if (!hasData) {
        // Seeding empty room with current board state
        console.log(`Room ${cleanRoomCode} is empty. Seeding with current board state...`);
        syncBoardStateToYjs(currentBoard, yRootMap);
      } else {
        // Room has data. Overwrite local board but make a backup first
        console.log(`Room ${cleanRoomCode} has data. Overwriting local state with backup...`);
        await saveBackupBoardState(currentBoard);
        const syncedState = syncYjsToBoardState(yRootMap);
        if (syncedState) {
          setLocalState(syncedState);
          await saveBoardState(syncedState, cleanRoomCode);
        }
      }
    });

    // Observe changes from Yjs Map to update react state
    yRootMap.observeDeep((events, transaction) => {
      // Avoid infinite loop if updates are local
      if (transaction.local) return;

      isSyncingFromYjsRef.current = true;
      const updatedState = syncYjsToBoardState(yRootMap);
      if (updatedState) {
        setLocalState(updatedState);
        saveBoardState(updatedState, cleanRoomCode);
      }
      isSyncingFromYjsRef.current = false;
    });
  };

  // Disconnect from the current collaborative room
  const disconnectFromRoom = () => {
    if (ownerTimerRef.current) {
      clearTimeout(ownerTimerRef.current);
      ownerTimerRef.current = null;
    }
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
    if (persistenceRef.current) {
      persistenceRef.current.destroy();
      persistenceRef.current = null;
    }
    if (ydocRef.current) {
      ydocRef.current.destroy();
      ydocRef.current = null;
    }

    setRoomId(null);
    setIsConnected(false);
    setPeerCount(0);
    setPeers([]);
    setOwnerId(null);
    setLocalRole("editor");
  };

  // Broadcast card editing presence info
  const setEditingCard = (cardId: string | null) => {
    if (providerRef.current) {
      const userState = providerRef.current.awareness.getLocalState()?.user || {};
      providerRef.current.awareness.setLocalStateField("user", {
        ...userState,
        activeCardId: cardId,
      });
    }
  };

  // Sync React board changes back to Yjs shared Map
  const broadcastBoardState = (newState: BoardState, origin?: string) => {
    if (!ydocRef.current || isSyncingFromYjsRef.current) return;

    const yRootMap = ydocRef.current.getMap("board-root");
    syncBoardStateToYjs(newState, yRootMap, origin);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectFromRoom();
    };
  }, []);

  return {
    roomId,
    isConnected,
    peerCount,
    peers,
    localCallsign,
    localUserId,
    ownerId,
    isOwner: localUserId === ownerId,
    localRole,
    updateLocalRole,
    changePeerRole,
    updateCallsign,
    connectToRoom,
    disconnectFromRoom,
    setEditingCard,
    updateCursor,
    broadcastBoardState,
  };
}
