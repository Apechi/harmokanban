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
  loadLatestBackupBoardState,
  clearAllBackups,
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

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

function getRandomMaxConns() {
  return 20 + Math.floor(Math.random() * 15);
}

export function useCollaboration(
  initialLocalState: BoardState | null,
  setLocalState: (state: BoardState) => void,
  onRemoteUpdate?: (
    type: "chat" | "card" | "project",
    title: string,
    message: string,
    metadata?: Record<string, unknown>
  ) => void,
  activeProjectId?: string
) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [peerCount, setPeerCount] = useState(0);
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  // Tracks the latest project name synced from the room owner so page.tsx
  // can update the local projects list when a remote rename happens.
  const [remoteProjectName, setRemoteProjectName] = useState<string | null>(null);
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
  const prevPeersRef = useRef<PeerInfo[]>([]);
  // Suppress notifications until initial room sync is complete to avoid
  // spamming the user with all historical changes that happened before joining.
  const isInitialSyncDoneRef = useRef(false);

  const offlineBoardBackupRef = useRef<BoardState | null>(null);

  // Ref to track the current board state for delta detection
  const boardStateRef = useRef<BoardState | null>(initialLocalState);
  useEffect(() => {
    boardStateRef.current = initialLocalState;
  }, [initialLocalState]);

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

    // Disconnect from existing room first and get the restored backup if any
    const restoredBackup = await disconnectFromRoom();
    const boardToUse = restoredBackup || currentBoard;

    // Save backup of the offline state before connecting to the room
    await saveBackupBoardState(boardToUse);
    offlineBoardBackupRef.current = boardToUse;

    setRoomId(cleanRoomCode);
    setIsConnected(true);

    // Fetch TURN server credentials dynamically first
    let iceServers: any[] = [{ urls: "stun:stun.l.google.com:19302" }];
    try {
      const response = await fetch("https://kanbanharmo.metered.live/api/v1/turn/credentials?apiKey=78e427c2f9a7bdc69c3ade446f09dbe781a3");
      if (response.ok) {
        const fetchedServers = await response.json();
        if (Array.isArray(fetchedServers)) {
          iceServers = fetchedServers;
        }
      }
    } catch (err) {
      console.warn("[Collab] Failed to fetch TURN credentials, using fallback STUN:", err);
    }

    const doc = new Y.Doc();
    ydocRef.current = doc;

    const yRootMap = doc.getMap("board-root");
    const yMetaMap = doc.getMap("room-metadata");
    const yRolesMap = doc.getMap("room-roles");
    const yChatArray = doc.getArray<ChatMessage>("chat-messages");

    // 1. Setup offline persistence for the room document
    const persistence = new IndexeddbPersistence(cleanRoomCode, doc);
    persistenceRef.current = persistence;

    // Observe changes on chat messages array
    const handleChatMessagesChange = (event: Y.YArrayEvent<ChatMessage>) => {
      setChatMessages(yChatArray.toArray());
      
      // Trigger notifications for new remote messages
      // Guard: skip until initial sync is complete to avoid replaying history.
      if (event.transaction.local || !isInitialSyncDoneRef.current) return;
      
      event.delta.forEach((d) => {
        if (d.insert) {
          const inserted = d.insert as ChatMessage[];
          inserted.forEach((msg) => {
            if (msg.senderId !== localUserId && !msg.isSystem && onRemoteUpdate) {
              onRemoteUpdate("chat", `COMMS LINK: ${msg.senderName}`, msg.text, {
                chatMessageId: msg.id,
              });
            }
          });
        }
      });
    };
    yChatArray.observe(handleChatMessagesChange);
    // Initial load
    setChatMessages(yChatArray.toArray());

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
        peerOpts: {
          config: {
            iceServers,
          },
        },
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
            // Get all connected peer user IDs from the current awareness states
            const states = providerRef.current ? Array.from(providerRef.current.awareness.getStates().values()) : [];
            const peerUserIds = states
              .map((s: any) => s.user?.userId)
              .filter((id): id is string => typeof id === "string" && id !== localUserId);
            
            const allIds = [localUserId, ...peerUserIds].sort();
            const shouldClaim = allIds[0] === localUserId;

            if (shouldClaim) {
              console.log("[Collab] No existing owner detected. Claiming ownership deterministically.");
              currentMeta.set("ownerId", localUserId);
              setOwnerId(localUserId);
              setLocalRole("editor");
              
              // Seed the empty room with our current board state since we are the owner
              if (!yRootMap.has("columnOrder")) {
                console.log(`Room ${cleanRoomCode} is empty on ownership claim. Seeding with current board state...`);
                syncBoardStateToYjs(boardToUse, yRootMap);
              }
            } else {
              console.log("[Collab] No existing owner detected, but another peer has priority. Waiting for sync.");
            }
          }
          ownerTimerRef.current = null;
        }, 5000); // 5 seconds delay to allow WebRTC connection and sync
      }
    };

    // Observe changes on room metadata and roles
    yMetaMap.observe((event) => {
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

      // Handle project renaming — always update local state so Peer B's UI stays
      // in sync, then fire a notification only after initial sync is complete.
      if (!event.transaction.local && event.keysChanged.has("projectName")) {
        const renamedProject = yMetaMap.get("projectName") as string | undefined;
        if (renamedProject) {
          // Always sync the name into React state regardless of sync phase.
          setRemoteProjectName(renamedProject);
          // Only show the toast notification after initial sync is done.
          if (isInitialSyncDoneRef.current && onRemoteUpdate) {
            onRemoteUpdate("project", "Sector Renamed", `Operational sector renamed to: ${renamedProject}`, {
              projectId: cleanRoomCode,
            });
          }
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

      // Handle peer departures (write system logs)
      const currentOwnerId = yMetaMap.get("ownerId") as string | undefined;
      const amIOwner = localUserId === currentOwnerId;
      const departedPeers = prevPeersRef.current.filter(
        (prev) => !newPeers.some((curr) => curr.userId === prev.userId)
      );

      if (departedPeers.length > 0 && amIOwner) {
        const chatArray = doc.getArray<ChatMessage>("chat-messages");
        doc.transact(() => {
          departedPeers.forEach((peer) => {
            chatArray.push([
              {
                id: crypto.randomUUID(),
                senderId: "system",
                senderName: "SYSTEM",
                text: `${peer.name} LEFT THE CHANNEL`,
                timestamp: Date.now(),
                isSystem: true,
              },
            ]);
          });
          if (chatArray.length > 100) {
            chatArray.delete(0, chatArray.length - 100);
          }
        });
      }

      prevPeersRef.current = newPeers;
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
        // Do NOT seed here if we are just joining. Seeding will be handled inside the ownership claim timeout
        // if we turn out to be the owner.
        console.log(`Room ${cleanRoomCode} is empty locally. Waiting for network sync or ownership check...`);
      } else {
        // Room has data. Overwrite local board
        console.log(`Room ${cleanRoomCode} has data. Overwriting local state...`);
        const syncedState = syncYjsToBoardState(yRootMap);
        if (syncedState) {
          setLocalState(syncedState);
          await saveBoardState(syncedState, activeProjectId || cleanRoomCode);
        }
      }

      // Add a system event for join sync
      const chatArray = doc.getArray<ChatMessage>("chat-messages");
      doc.transact(() => {
        chatArray.push([
          {
            id: crypto.randomUUID(),
            senderId: "system",
            senderName: "SYSTEM",
            text: `${localCallsign || "Operator"} JOINED THE CHANNEL`,
            timestamp: Date.now(),
            isSystem: true,
          },
        ]);
        if (chatArray.length > 100) {
          chatArray.delete(0, chatArray.length - 100);
        }
      });

      // Mark initial sync as complete — notifications are now live.
      isInitialSyncDoneRef.current = true;
    });

    // Observe changes from Yjs Map to update react state
    yRootMap.observeDeep((events, transaction) => {
      // Avoid infinite loop if updates are local
      if (transaction.local) return;

      isSyncingFromYjsRef.current = true;
      const updatedState = syncYjsToBoardState(yRootMap);
      if (updatedState) {
        // Only fire notifications after initial sync — prevents spamming the user
        // with every historical change that happened before they joined the room.
        if (isInitialSyncDoneRef.current && boardStateRef.current && onRemoteUpdate) {
          const oldState = boardStateRef.current;

          // Cards added / moved / updated
          Object.keys(updatedState.cards).forEach((id) => {
            const newCard = updatedState.cards[id];
            const oldCard = oldState.cards[id];

            if (!oldCard) {
              onRemoteUpdate("card", "Task Deployed", `Task ${newCard.code} (${newCard.title}) was deployed.`, {
                cardId: newCard.id,
              });
            } else if (newCard.columnId !== oldCard.columnId) {
              const colTitle = updatedState.columns[newCard.columnId]?.title || "another column";
              onRemoteUpdate("card", "Task Relocated", `Task ${newCard.code} (${newCard.title}) moved to ${colTitle}.`, {
                cardId: newCard.id,
              });
            } else if (JSON.stringify(newCard) !== JSON.stringify(oldCard)) {
              onRemoteUpdate("card", "Task Details Updated", `Task ${newCard.code} (${newCard.title}) details were modified.`, {
                cardId: newCard.id,
              });
            }
          });

          // Cards deleted — only existed in old state
          Object.keys(oldState.cards).forEach((id) => {
            if (!updatedState.cards[id]) {
              const removed = oldState.cards[id];
              onRemoteUpdate("card", "Task Eliminated", `Task ${removed.code} (${removed.title}) was removed.`, {});
            }
          });

          // Columns added
          Object.keys(updatedState.columns).forEach((id) => {
            if (!oldState.columns[id]) {
              const col = updatedState.columns[id];
              onRemoteUpdate("card", "Squad Column Added", `New column "${col.title}" was added to the board.`, {});
            }
          });

          // Columns deleted
          Object.keys(oldState.columns).forEach((id) => {
            if (!updatedState.columns[id]) {
              const col = oldState.columns[id];
              onRemoteUpdate("card", "Squad Column Removed", `Column "${col.title}" was removed from the board.`, {});
            }
          });
        }
        setLocalState(updatedState);
        saveBoardState(updatedState, activeProjectId || cleanRoomCode);
      }
      isSyncingFromYjsRef.current = false;
    });
  };

  // Disconnect from the current collaborative room
  const disconnectFromRoom = async (restoreBackup = true): Promise<BoardState | null> => {
    const currentRoomId = roomId;
    // Reset sync flag so the next room join starts suppressed again.
    isInitialSyncDoneRef.current = false;
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
    setChatMessages([]);
    setOwnerId(null);
    setLocalRole("editor");
    setRemoteProjectName(null);
    prevPeersRef.current = [];

    let restored: BoardState | null = null;
    if (restoreBackup) {
      let backup = offlineBoardBackupRef.current;
      if (!backup) {
        backup = await loadLatestBackupBoardState();
      }
      if (backup) {
        restored = backup;
        setLocalState(backup);
        await saveBoardState(backup, activeProjectId || currentRoomId || "");
        await clearAllBackups();
      }
      offlineBoardBackupRef.current = null;
    } else {
      offlineBoardBackupRef.current = null;
      // Do NOT clear backups here, just reset the in-memory ref
    }
    return restored;
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

  // Update project name in room metadata.
  // Guard: skip the write if the value is already the same to avoid dirtying
  // the CRDT and firing yMetaMap observers on all peers unnecessarily.
  const updateProjectName = (name: string) => {
    if (ydocRef.current && roomId) {
      const yMetaMap = ydocRef.current.getMap("room-metadata");
      if (yMetaMap.get("projectName") !== name) {
        yMetaMap.set("projectName", name);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectFromRoom();
    };
  }, []);

  // Send chat message
  const sendChatMessage = (text: string) => {
    if (!ydocRef.current || !roomId) return;
    const yChatArray = ydocRef.current.getArray<ChatMessage>("chat-messages");
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: localUserId,
      senderName: localCallsign || "Operator",
      text: text.trim(),
      timestamp: Date.now(),
    };
    ydocRef.current.transact(() => {
      yChatArray.push([newMessage]);
      if (yChatArray.length > 100) {
        yChatArray.delete(0, yChatArray.length - 100);
      }
    });
  };

  return {
    roomId,
    isConnected,
    peerCount,
    peers,
    chatMessages,
    localCallsign,
    localUserId,
    ownerId,
    isOwner: localUserId === ownerId,
    localRole,
    remoteProjectName,
    updateLocalRole,
    changePeerRole,
    updateCallsign,
    connectToRoom,
    disconnectFromRoom,
    setEditingCard,
    updateCursor,
    broadcastBoardState,
    sendChatMessage,
    updateProjectName,
  };
}
