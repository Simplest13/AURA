/**
 * Backend response normalization
 * PostgreSQL rows arrive in snake_case; the in-memory fallback uses camelCase.
 * Normalize everything to the mobile app's camelCase domain types.
 */

import { StudyTask, Reminder } from "../types/study";
import { Message } from "../types/chat";

const num = (v: any): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const str = (v: any, fallback = ""): string =>
  typeof v === "string" ? v : v == null ? fallback : String(v);

export function normalizeTask(raw: any): StudyTask {
  return {
    id: str(raw.id),
    subjectName: str(raw.subjectName ?? raw.subject_name, "General"),
    title: str(raw.title),
    deadline: str(raw.deadline ?? raw.dueDate ?? raw.due_date, "No deadline"),
    priority: (raw.priority as StudyTask["priority"]) || "medium",
    completed: Boolean(raw.completed),
    createdAt: num(raw.createdAt ?? raw.created_at) ?? Date.now(),
  };
}

export function normalizeReminder(raw: any): Reminder {
  return {
    id: str(raw.id),
    title: str(raw.title),
    dueTime: str(raw.dueTime ?? raw.due_time, "Soon"),
    completed: Boolean(raw.completed),
    tag: raw.tag ? str(raw.tag) : undefined,
  };
}

export function normalizeMessage(raw: any): Message {
  const sender = str(raw.sender);
  return {
    id: str(raw.id),
    conversationId: str(raw.conversationId ?? raw.conversation_id),
    sender: sender === "user" ? "user" : "aura",
    text: str(raw.text ?? raw.content),
    timestamp: num(raw.timestamp ?? raw.created_at) ?? Date.now(),
    memoryReferences: Array.isArray(raw.memoryReferences)
      ? raw.memoryReferences
      : Array.isArray(raw.memory_references)
      ? raw.memory_references
      : undefined,
  };
}
