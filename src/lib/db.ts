import { openDB, IDBPDatabase } from 'idb';
import { BoardState } from '@/types';

const DB_NAME = 'kanban-harmo-db';
const STORE_NAME = 'board-store';
const STATE_KEY = 'current-board';

export async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function saveBoardState(state: BoardState): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, state, STATE_KEY);
  } catch (error) {
    console.error('Failed to save board state to IndexedDB:', error);
  }
}

export async function loadBoardState(): Promise<BoardState | null> {
  try {
    const db = await getDB();
    const state = await db.get(STORE_NAME, STATE_KEY);
    return state || null;
  } catch (error) {
    console.error('Failed to load board state from IndexedDB:', error);
    return null;
  }
}
