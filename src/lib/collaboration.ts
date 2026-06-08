import * as Y from 'yjs';
import { BoardState, TaskCard, BoardColumn } from '@/types';
import { getDB } from './db';

const STORE_NAME = 'board-store';

// Backup user's local board state to IndexedDB before overwriting
export async function saveBackupBoardState(state: BoardState): Promise<string> {
  try {
    const db = await getDB();
    const timestamp = new Date().toISOString();
    const key = `backup-${timestamp}`;
    await db.put(STORE_NAME, state, key);
    return timestamp;
  } catch (error) {
    console.error('Failed to save backup board state:', error);
    return '';
  }
}

// Random Arknights Operator Callsigns
const CALLSIGNS = [
  'Doctor', 'Amiya', 'Kal\'tsit', 'Texas', 'Exusiai', 'Ch\'en', 'SilverAsh', 
  'Blaze', 'Hoshiguma', 'Specter', 'Saria', 'Bagpipe', 'W', 'Rosmontis', 
  'Nearl', 'Mudrock', 'Mostima', 'Liskarm', 'Nightingale', 'Shining', 
  'Ptilopsis', 'Platinum', 'Blue Poison', 'Goldenglow', 'Mlynar', 
  'Yato', 'Noir Corne', 'Lava', 'Kroos', 'Fang'
];

export function getRandomOperatorCallsign(): string {
  const name = CALLSIGNS[Math.floor(Math.random() * CALLSIGNS.length)];
  const suffix = Math.floor(100 + Math.random() * 900); // e.g. Doctor-451
  return `${name}-${suffix}`;
}

// Convert Yjs shared Map data structure to standard BoardState
export function syncYjsToBoardState(yRootMap: Y.Map<any>): BoardState | null {
  const columnOrder = yRootMap.get('columnOrder') as Y.Array<string> | undefined;
  const columns = yRootMap.get('columns') as Y.Map<any> | undefined;
  const cards = yRootMap.get('cards') as Y.Map<any> | undefined;

  if (!columnOrder || !columns || !cards) {
    return null;
  }

  const resultColumnOrder = columnOrder.toArray();
  
  const resultColumns: { [id: string]: BoardColumn } = {};
  columns.forEach((val, key) => {
    // val is a Y.Map representing a column
    if (val instanceof Y.Map) {
      const cardIdsArr = val.get('cardIds') as Y.Array<string> | undefined;
      resultColumns[key] = {
        id: val.get('id') as string,
        title: val.get('title') as string,
        cardIds: cardIdsArr ? cardIdsArr.toArray() : [],
      };
    }
  });

  const resultCards: { [id: string]: TaskCard } = {};
  cards.forEach((val, key) => {
    if (val instanceof Y.Map) {
      const tagsArr = val.get('tags') as Y.Array<string> | undefined;
      const subTasksArr = val.get('subTasks') as Y.Array<any> | undefined;
      
      const statusHistoryArr = val.get('statusHistory') as Y.Array<any> | undefined;
      
      resultCards[key] = {
        id: val.get('id') as string,
        columnId: val.get('columnId') as string,
        title: val.get('title') as string,
        description: val.get('description') as string,
        priority: val.get('priority') as any,
        tags: tagsArr ? tagsArr.toArray() : [],
        dueDate: val.get('dueDate') as string | null,
        startDate: val.get('startDate') as string | null,
        storyPoints: val.get('storyPoints') as number | null,
        subTasks: subTasksArr ? subTasksArr.toArray() : [],
        code: val.get('code') as string,
        createdAt: val.get('createdAt') as number,
        assignee: val.get('assignee') as string | null,
        statusHistory: statusHistoryArr ? statusHistoryArr.toArray() : [],
      };
    }
  });

  return {
    columns: resultColumns,
    columnOrder: resultColumnOrder,
    cards: resultCards,
  };
}

// Write React state board values into Yjs shared Map structure in a deep merge manner
export function syncBoardStateToYjs(state: BoardState, yRootMap: Y.Map<any>, origin?: any): void {
  const doc = yRootMap.doc;
  if (!doc) return;

  doc.transact(() => {
    // 1. Sync columnOrder
    let yColumnOrder = yRootMap.get('columnOrder') as Y.Array<string> | undefined;
    if (!yColumnOrder) {
      yColumnOrder = new Y.Array<string>();
      yRootMap.set('columnOrder', yColumnOrder);
    }
    
    // Check if changed
    const currentOrder = yColumnOrder.toArray();
    if (JSON.stringify(currentOrder) !== JSON.stringify(state.columnOrder)) {
      yColumnOrder.delete(0, yColumnOrder.length);
      yColumnOrder.insert(0, state.columnOrder);
    }

    // 2. Sync columns Map
    let yColumns = yRootMap.get('columns') as Y.Map<any> | undefined;
    if (!yColumns) {
      yColumns = new Y.Map<any>();
      yRootMap.set('columns', yColumns);
    }

    // Remove columns that don't exist in new state
    yColumns.forEach((_, key) => {
      if (!state.columns[key]) {
        yColumns?.delete(key);
      }
    });

    // Add or update columns
    Object.keys(state.columns).forEach((colId) => {
      const col = state.columns[colId];
      let yCol = yColumns?.get(colId) as Y.Map<any> | undefined;
      if (!yCol) {
        yCol = new Y.Map<any>();
        yColumns?.set(colId, yCol);
      }

      yCol.set('id', col.id);
      yCol.set('title', col.title);

      let yCardIds = yCol.get('cardIds') as Y.Array<string> | undefined;
      if (!yCardIds) {
        yCardIds = new Y.Array<string>();
        yCol.set('cardIds', yCardIds);
      }
      
      const currentCardIds = yCardIds.toArray();
      if (JSON.stringify(currentCardIds) !== JSON.stringify(col.cardIds)) {
        yCardIds.delete(0, yCardIds.length);
        yCardIds.insert(0, col.cardIds);
      }
    });

    // 3. Sync cards Map
    let yCards = yRootMap.get('cards') as Y.Map<any> | undefined;
    if (!yCards) {
      yCards = new Y.Map<any>();
      yRootMap.set('cards', yCards);
    }

    // Remove deleted cards
    yCards.forEach((_, key) => {
      if (!state.cards[key]) {
        yCards?.delete(key);
      }
    });

    // Add or update cards
    Object.keys(state.cards).forEach((cardId) => {
      const card = state.cards[cardId];
      let yCard = yCards?.get(cardId) as Y.Map<any> | undefined;
      if (!yCard) {
        yCard = new Y.Map<any>();
        yCards?.set(cardId, yCard);
      }

      yCard.set('id', card.id);
      yCard.set('columnId', card.columnId);
      yCard.set('title', card.title);
      yCard.set('description', card.description);
      yCard.set('priority', card.priority);
      yCard.set('dueDate', card.dueDate);
      yCard.set('startDate', card.startDate || null);
      yCard.set('storyPoints', card.storyPoints);
      yCard.set('code', card.code);
      yCard.set('createdAt', card.createdAt);
      yCard.set('assignee', card.assignee || null);

      // Sync statusHistory
      let yStatusHistory = yCard.get('statusHistory') as Y.Array<any> | undefined;
      if (!yStatusHistory) {
        yStatusHistory = new Y.Array<any>();
        yCard.set('statusHistory', yStatusHistory);
      }
      const currentHistory = yStatusHistory.toArray();
      if (JSON.stringify(currentHistory) !== JSON.stringify(card.statusHistory || [])) {
        yStatusHistory.delete(0, yStatusHistory.length);
        yStatusHistory.insert(0, card.statusHistory || []);
      }

      // Sync tags
      let yTags = yCard.get('tags') as Y.Array<string> | undefined;
      if (!yTags) {
        yTags = new Y.Array<string>();
        yCard.set('tags', yTags);
      }
      const currentTags = yTags.toArray();
      if (JSON.stringify(currentTags) !== JSON.stringify(card.tags)) {
        yTags.delete(0, yTags.length);
        yTags.insert(0, card.tags);
      }

      // Sync subTasks
      let ySubTasks = yCard.get('subTasks') as Y.Array<any> | undefined;
      if (!ySubTasks) {
        ySubTasks = new Y.Array<any>();
        yCard.set('subTasks', ySubTasks);
      }
      const currentSubTasks = ySubTasks.toArray();
      if (JSON.stringify(currentSubTasks) !== JSON.stringify(card.subTasks)) {
        ySubTasks.delete(0, ySubTasks.length);
        ySubTasks.insert(0, card.subTasks);
      }
    });
  }, origin);
}
