export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TaskCard {
  id: string;
  columnId: string;
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  dueDate: string | null;
  storyPoints: number | null;
  subTasks: SubTask[];
  code: string; // tactical monospace code e.g. OP-101
  createdAt: number;
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
