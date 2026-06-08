import { BoardState, TaskCard, Priority } from "@/types";

export interface AutomationRule {
  id: string;
  trigger: "SUBTASKS_COMPLETED" | "DUE_DATE_NEARING";
  action: "MOVE_TO_COLUMN" | "SET_PRIORITY";
  actionValue: string; // e.g. "col-done" or "HIGH"
  enabled: boolean;
}

// Default system automations if none configured
export const DEFAULT_RULES: AutomationRule[] = [
  {
    id: "rule-auto-done",
    trigger: "SUBTASKS_COMPLETED",
    action: "MOVE_TO_COLUMN",
    actionValue: "col-done",
    enabled: true,
  },
  {
    id: "rule-auto-high-priority",
    trigger: "DUE_DATE_NEARING",
    action: "SET_PRIORITY",
    actionValue: "HIGH",
    enabled: true,
  }
];

// Simple mutex/flag to prevent recursion
let isExecutingAutomations = false;

export function runAutomations(
  state: BoardState,
  rules: AutomationRule[],
  onUpdate: (newState: BoardState) => void
): boolean {
  if (isExecutingAutomations) return false;
  
  isExecutingAutomations = true;
  let stateChanged = false;
  const updatedCards = { ...state.cards };
  const updatedColumns = { ...state.columns };

  const activeRules = rules.filter(r => r.enabled);
  const now = Date.now();

  for (const cardId of Object.keys(updatedCards)) {
    const card = updatedCards[cardId];
    let cardModified = false;
    let newCard = { ...card };

    for (const rule of activeRules) {
      // 1. Evaluate Trigger
      let isTriggered = false;

      if (rule.trigger === "SUBTASKS_COMPLETED") {
        const hasSubtasks = card.subTasks && card.subTasks.length > 0;
        const allCompleted = hasSubtasks && card.subTasks.every(st => st.completed);
        isTriggered = allCompleted;
      } else if (rule.trigger === "DUE_DATE_NEARING") {
        if (card.dueDate) {
          const dueTime = new Date(card.dueDate).getTime();
          const msToDue = dueTime - now;
          // Trigger if within 24 hours (86,400,000 ms) and not already past due or met target
          isTriggered = msToDue > 0 && msToDue <= 86400000;
        }
      }

      // 2. Perform Action if Triggered
      if (isTriggered) {
        if (rule.action === "SET_PRIORITY") {
          const targetPriority = rule.actionValue as Priority;
          if (newCard.priority !== targetPriority) {
            newCard.priority = targetPriority;
            cardModified = true;
          }
        } else if (rule.action === "MOVE_TO_COLUMN") {
          const targetColId = rule.actionValue;
          if (newCard.columnId !== targetColId && updatedColumns[targetColId]) {
            const oldColId = newCard.columnId;
            
            // Remove from old column list
            if (updatedColumns[oldColId]) {
              updatedColumns[oldColId] = {
                ...updatedColumns[oldColId],
                cardIds: updatedColumns[oldColId].cardIds.filter(id => id !== cardId),
              };
            }

            // Add to new column list
            updatedColumns[targetColId] = {
              ...updatedColumns[targetColId],
              cardIds: [...updatedColumns[targetColId].cardIds.filter(id => id !== cardId), cardId],
            };

            newCard.columnId = targetColId;
            cardModified = true;
          }
        }
      }
    }

    if (cardModified) {
      updatedCards[cardId] = newCard;
      stateChanged = true;
    }
  }

  if (stateChanged) {
    onUpdate({
      ...state,
      columns: updatedColumns,
      cards: updatedCards,
    });
  }

  isExecutingAutomations = false;
  return stateChanged;
}
