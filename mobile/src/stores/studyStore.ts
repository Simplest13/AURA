import { create } from "zustand";
import { StudyTask, Reminder, LectureNote, DocumentSummary, TaskPriority } from "../types/study";
import { MOCK_TASKS, MOCK_REMINDERS, MOCK_LECTURES, MOCK_DOCUMENTS } from "../utils/mockData";
import { ApiClient } from "../services/api/ApiClient";
import { normalizeTask, normalizeReminder } from "../utils/normalize";
import { StorageService } from "../services/storage/StorageService";
import { useAuthStore } from "./authStore";

/** Per-user cache key: study data never leaks across accounts. */
const studyStorageKey = (userId: string | null | undefined) => `aura:user:${userId ?? "anon"}:study`;

interface StudyStoreState {
  tasks: StudyTask[];
  reminders: Reminder[];
  lectures: LectureNote[];
  documents: DocumentSummary[];
  isSyncing: boolean;
  backendOffline: boolean;

  hydrate: () => Promise<void>;
  syncWithBackend: () => Promise<void>;

  // Task Actions
  addTask: (title: string, subjectName: string, deadline: string, priority?: TaskPriority) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Reminder Actions
  addReminder: (title: string, dueTime: string, tag?: string) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;

  // Lecture Actions
  addLecture: (lecture: Omit<LectureNote, "id" | "createdAt">) => Promise<LectureNote>;

  // Document Actions
  addDocument: (doc: Omit<DocumentSummary, "id" | "uploadedAt">) => Promise<DocumentSummary>;

  /** Clear local study data (called on logout so accounts never share data). */
  reset: () => void;
}

function persist(state: StudyStoreState) {
  void StorageService.setItem(studyStorageKey(useAuthStore.getState().user?.id), {
    tasks: state.tasks,
    reminders: state.reminders,
    lectures: state.lectures,
    documents: state.documents,
  });
}

export const useStudyStore = create<StudyStoreState>((set, get) => ({
  tasks: MOCK_TASKS,
  reminders: MOCK_REMINDERS,
  lectures: MOCK_LECTURES,
  documents: MOCK_DOCUMENTS,
  isSyncing: false,
  backendOffline: false,

  hydrate: async () => {
    try {
      const cached = await StorageService.getItem<{
        tasks: StudyTask[];
        reminders: Reminder[];
        lectures: LectureNote[];
        documents: DocumentSummary[];
      }>(studyStorageKey(useAuthStore.getState().user?.id));
      if (cached && Array.isArray(cached.tasks)) {
        set({
          tasks: cached.tasks,
          reminders: cached.reminders ?? [],
          lectures: cached.lectures ?? [],
          documents: cached.documents ?? [],
        });
      }
    } catch {
      // ignore; defaults stand
    }
    // Then try to refresh from backend
    void get().syncWithBackend();
  },

  syncWithBackend: async () => {
    set({ isSyncing: true });
    try {
      await ApiClient.ensureSession();
      const [rawTasks, rawReminders] = await Promise.all([
        ApiClient.get<any[]>("/api/study/tasks"),
        ApiClient.get<any[]>("/api/reminders"),
      ]);

      const tasks = Array.isArray(rawTasks) ? rawTasks.map(normalizeTask) : [];
      const reminders = Array.isArray(rawReminders) ? rawReminders.map(normalizeReminder) : [];

      // Keep optimistic local items that are pending (not yet on backend) —
      // simplest reliable approach: replace with backend truth.
      set({ tasks, reminders, backendOffline: false, isSyncing: false });
      persist(get());
    } catch (err) {
      console.warn("[studyStore] Backend sync unavailable, using local data:", err);
      set({ backendOffline: true, isSyncing: false });
    }
  },

  addTask: async (title, subjectName, deadline, priority = "medium") => {
    const tempId = `task-local-${Date.now()}`;
    const newTask: StudyTask = {
      id: tempId,
      title,
      subjectName,
      deadline,
      priority,
      completed: false,
      createdAt: Date.now(),
    };
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
    persist(get());

    try {
      await ApiClient.ensureSession();
      const created = await ApiClient.post<any>("/api/study/tasks", {
        title,
        subjectName,
        deadline,
        priority,
      });
      const normalized = normalizeTask(created);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === tempId ? normalized : t)),
      }));
      persist(get());
    } catch (err) {
      console.warn("[studyStore] Task create not synced:", err);
      set({ backendOffline: true });
    }
  },

  toggleTask: async (id) => {
    let next: StudyTask | undefined;
    set((state) => {
      const tasks = state.tasks.map((t) => {
        if (t.id !== id) return t;
        next = { ...t, completed: !t.completed };
        return next;
      });
      return { tasks };
    });
    persist(get());

    if (!id.startsWith("task-local-")) {
      try {
        await ApiClient.ensureSession();
        await ApiClient.put(`/api/study/tasks/${id}`, { completed: next?.completed ?? false });
      } catch (err) {
        console.warn("[studyStore] Task toggle not synced:", err);
        set({ backendOffline: true });
      }
    }
  },

  deleteTask: async (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    persist(get());

    if (!id.startsWith("task-local-")) {
      try {
        await ApiClient.ensureSession();
        await ApiClient.delete(`/api/study/tasks/${id}`);
      } catch (err) {
        console.warn("[studyStore] Task delete not synced:", err);
        set({ backendOffline: true });
      }
    }
  },

  addReminder: async (title, dueTime, tag = "Study") => {
    const tempId = `rem-local-${Date.now()}`;
    const newRem: Reminder = { id: tempId, title, dueTime, completed: false, tag };
    set((state) => ({ reminders: [newRem, ...state.reminders] }));
    persist(get());

    try {
      await ApiClient.ensureSession();
      const created = await ApiClient.post<any>("/api/reminders", { title, dueTime, tag });
      const normalized = normalizeReminder(created);
      set((state) => ({
        reminders: state.reminders.map((r) => (r.id === tempId ? normalized : r)),
      }));
      persist(get());
    } catch (err) {
      console.warn("[studyStore] Reminder create not synced:", err);
      set({ backendOffline: true });
    }
  },

  toggleReminder: async (id) => {
    let next: Reminder | undefined;
    set((state) => {
      const reminders = state.reminders.map((r) => {
        if (r.id !== id) return r;
        next = { ...r, completed: !r.completed };
        return next;
      });
      return { reminders };
    });
    persist(get());

    if (!id.startsWith("rem-local-")) {
      try {
        await ApiClient.ensureSession();
        await ApiClient.put(`/api/reminders/${id}`, { completed: next?.completed ?? false });
      } catch (err) {
        console.warn("[studyStore] Reminder toggle not synced:", err);
        set({ backendOffline: true });
      }
    }
  },

  deleteReminder: async (id) => {
    set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) }));
    persist(get());

    if (!id.startsWith("rem-local-")) {
      try {
        await ApiClient.ensureSession();
        await ApiClient.delete(`/api/reminders/${id}`);
      } catch (err) {
        console.warn("[studyStore] Reminder delete not synced:", err);
        set({ backendOffline: true });
      }
    }
  },

  addLecture: async (lecture) => {
    const newLec: LectureNote = {
      ...lecture,
      id: `lec-${Date.now()}`,
      createdAt: Date.now(),
    };
    set((state) => ({ lectures: [newLec, ...state.lectures] }));
    persist(get());

    // Best-effort backend record
    try {
      await ApiClient.ensureSession();
      await ApiClient.post("/api/lectures/lectures", {
        title: newLec.title,
        audioUrl: `local://${newLec.id}`,
      });
    } catch {
      // lectures are primarily local-first; ignore failures
    }
    return newLec;
  },

  addDocument: async (doc) => {
    const newDoc: DocumentSummary = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadedAt: Date.now(),
    };
    set((state) => ({ documents: [newDoc, ...state.documents] }));
    persist(get());
    return newDoc;
  },

  reset: () => {
    set({
      tasks: MOCK_TASKS,
      reminders: MOCK_REMINDERS,
      lectures: MOCK_LECTURES,
      documents: MOCK_DOCUMENTS,
      isSyncing: false,
      backendOffline: false,
    });
  },
}));
