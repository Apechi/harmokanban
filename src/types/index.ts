export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface StatusTransition {
  columnId: string;
  timestamp: number;
}

export interface CardComment {
  id: string;
  senderId: string;
  senderCallsign: string;
  content: string;
  timestamp: number;
}

export interface TaskCard {
  id: string;
  columnId: string;
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  dueDate: string | null;
  startDate: string | null;
  storyPoints: number | null;
  subTasks: SubTask[];
  code: string; // tactical monospace code e.g. OP-101
  createdAt: number;
  assignee?: string | null;
  statusHistory?: StatusTransition[];
  comments?: CardComment[];
}


export interface BoardColumn {
  id: string;
  title: string;
  cardIds: string[];
}

export interface BoardState {
  columns: { [id: string]: BoardColumn };
  columnOrder: string[];
  cards: { [id: string]: TaskCard };
}

export interface AutomationRule {
  id: string;
  trigger: "SUBTASKS_COMPLETED" | "DUE_DATE_NEARING";
  action: "MOVE_TO_COLUMN" | "SET_PRIORITY";
  actionValue: string;
  enabled: boolean;
}

export interface Project {
  id: string;
  name: string;
  roomId: string | null; // Room ID if syncing via WebRTC, otherwise null (local-only)
  isOnline: boolean;
  archived: boolean;
  createdAt: number;
}


