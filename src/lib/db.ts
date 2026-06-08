import { openDB, IDBPDatabase } from 'idb';
import { BoardState, Project } from '@/types';

const DB_NAME = 'kanban-harmo-db';
const STORE_NAME = 'board-store';
const OLD_STATE_KEY = 'current-board';
const PROJECTS_LIST_KEY = 'projects-list';

export const DEFAULT_PROJECT_ID = 'default-project';

export async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

// Projects list storage
export async function saveProjectsList(projects: Project[]): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, projects, PROJECTS_LIST_KEY);
  } catch (error) {
    console.error('Failed to save projects list:', error);
  }
}

export async function loadProjectsList(): Promise<Project[] | null> {
  try {
    const db = await getDB();
    const projects = await db.get(STORE_NAME, PROJECTS_LIST_KEY);
    return projects || null;
  } catch (error) {
    console.error('Failed to load projects list:', error);
    return null;
  }
}

// Project specific board state storage
export async function saveBoardState(state: BoardState, projectId: string = DEFAULT_PROJECT_ID): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, state, `board-state-${projectId}`);
  } catch (error) {
    console.error(`Failed to save board state for project ${projectId} to IndexedDB:`, error);
  }
}

export async function loadBoardState(projectId: string = DEFAULT_PROJECT_ID): Promise<BoardState | null> {
  try {
    const db = await getDB();
    
    // Check if we need to migrate from the old 'current-board' structure
    if (projectId === DEFAULT_PROJECT_ID) {
      const oldState = await db.get(STORE_NAME, OLD_STATE_KEY);
      if (oldState) {
        console.log('Migrating legacy board state to default project...');
        await db.put(STORE_NAME, oldState, `board-state-${DEFAULT_PROJECT_ID}`);
        await db.delete(STORE_NAME, OLD_STATE_KEY);
        return oldState;
      }
    }
    
    const state = await db.get(STORE_NAME, `board-state-${projectId}`);
    return state || null;
  } catch (error) {
    console.error(`Failed to load board state for project ${projectId} from IndexedDB:`, error);
    return null;
  }
}

