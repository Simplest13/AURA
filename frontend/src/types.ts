// src/types.ts
export interface Reminder {
  id: string;
  userId: string;
  title: string;
  dueTime?: string | null;
  completed: boolean;
  tag?: string;
}

export interface Lecture {
  id: string;
  title: string;
  audioUrl: string;
}

export interface Document {
  id: string;
  name: string;
  content?: string; // base64 or plain text placeholder
}
