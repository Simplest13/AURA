import { create } from "zustand";
import { StudyTask, Reminder, LectureNote, DocumentSummary, TaskPriority } from "../types/study";
import { MOCK_TASKS, MOCK_REMINDERS, MOCK_LECTURES, MOCK_DOCUMENTS } from "../utils/mockData";

interface StudyStoreState {
  tasks: StudyTask[];
  reminders: Reminder[];
  lectures: LectureNote[];
  documents: DocumentSummary[];

  // Task Actions
  addTask: (title: string, subjectName: string, deadline: string, priority?: TaskPriority) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  // Reminder Actions
  addReminder: (title: string, dueTime: string, tag?: string) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;

  // Lecture Actions
  addLecture: (lecture: Omit<LectureNote, "id" | "createdAt">) => void;

  // Document Actions
  addDocument: (doc: Omit<DocumentSummary, "id" | "uploadedAt">) => void;
}

export const useStudyStore = create<StudyStoreState>((set) => ({
  tasks: MOCK_TASKS,
  reminders: MOCK_REMINDERS,
  lectures: MOCK_LECTURES,
  documents: MOCK_DOCUMENTS,

  addTask: (title, subjectName, deadline, priority = "medium") => {
    const newTask: StudyTask = {
      id: `task-${Date.now()}`,
      title,
      subjectName,
      deadline,
      priority,
      completed: false,
      createdAt: Date.now(),
    };
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
  },

  toggleTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    }));
  },

  deleteTask: (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },

  addReminder: (title, dueTime, tag = "Study") => {
    const newRem: Reminder = {
      id: `rem-${Date.now()}`,
      title,
      dueTime,
      completed: false,
      tag,
    };
    set((state) => ({ reminders: [newRem, ...state.reminders] }));
  },

  toggleReminder: (id) => {
    set((state) => ({
      reminders: state.reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)),
    }));
  },

  deleteReminder: (id) => {
    set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) }));
  },

  addLecture: (lecture) => {
    const newLec: LectureNote = {
      ...lecture,
      id: `lec-${Date.now()}`,
      createdAt: Date.now(),
    };
    set((state) => ({ lectures: [newLec, ...state.lectures] }));
  },

  addDocument: (doc) => {
    const newDoc: DocumentSummary = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadedAt: Date.now(),
    };
    set((state) => ({ documents: [newDoc, ...state.documents] }));
  },
}));
