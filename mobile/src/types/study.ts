/**
 * Study System Domain Types: Planner, Reminders, Lectures, Documents
 */

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
}

export type TaskPriority = "high" | "medium" | "low";

export interface StudyTask {
  id: string;
  subjectId?: string;
  subjectName: string;
  title: string;
  deadline: string; // ISO date string or formatted label
  priority: TaskPriority;
  completed: boolean;
  createdAt: number;
}

export interface Reminder {
  id: string;
  title: string;
  dueTime: string; // e.g. "Today, 7:00 PM"
  completed: boolean;
  tag?: string;
}

export interface LectureNote {
  id: string;
  title: string;
  subject: string;
  durationSeconds: number;
  audioUri?: string;
  transcript: string;
  summary: string;
  keyTakeaways: string[];
  /** Structured study notes (markdown bullets/headings) generated from the transcript */
  notes?: string;
  createdAt: number;
}

export interface DocumentSummary {
  id: string;
  fileName: string;
  fileSizeMb: number;
  totalPages: number;
  status: "ready" | "processing" | "failed";
  summary: string;
  keySections: { title: string; pages: string; snippet: string }[];
  uploadedAt: number;
}
