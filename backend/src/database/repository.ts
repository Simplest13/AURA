import { Pool } from "pg";
import { config } from "../config";

/**
 * Robust Database Repository Layer
 * Connects to PostgreSQL if available, otherwise seamlessly falls back
 * to an in-memory repository for zero-dependency local development and testing.
 */

let pool: Pool | null = null;
let isPostgresAvailable = false;

// In-memory collections for fallback
const memUsers = new Map<string, any>();
const memConversations = new Map<string, any>();
const memMessages = new Map<string, any[]>();
const memMemories = new Map<string, any>();
const memTasks = new Map<string, any>();
const memReminders = new Map<string, any>();
const memLectures = new Map<string, any>();
const memDocuments = new Map<string, any>();

// Seed initial student data
memUsers.set("usr-01", {
  id: "usr-01",
  name: "Shivam",
  email: "shivam@alignsoul.co",
  password_hash: "$2a$10$abcdefghijklmnopqrstuvwxyz1234567890", // placeholder hash
  preferred_tone: "concise",
});

memMemories.set("mem-01", {
  id: "mem-01",
  user_id: "usr-01",
  content: "Prefers concise, bulleted answers over long prose",
  importance: "high",
  tags: ["Preferences"],
  created_at: new Date(),
});
memMemories.set("mem-02", {
  id: "mem-02",
  user_id: "usr-01",
  content: "Mid-terms start November 4th — exam on cryptography and thermodynamics",
  importance: "high",
  tags: ["Academics", "Pinned"],
  created_at: new Date(),
});

memTasks.set("task-01", {
  id: "task-01",
  user_id: "usr-01",
  subject_name: "Thermodynamics",
  title: "Review Carnot efficiency & entropy derivations",
  deadline: "Tomorrow, 5:00 PM",
  priority: "high",
  completed: false,
  created_at: new Date(),
});

memReminders.set("rem-01", {
  id: "rem-01",
  user_id: "usr-01",
  title: "Quiz prep session with AURA on entropy",
  due_time: "Today, 8:00 PM",
  completed: false,
  tag: "Academics",
});

export async function initDatabase(): Promise<void> {
  try {
    pool = new Pool({
      connectionString: config.databaseUrl,
      connectionTimeoutMillis: 1500,
    });
    const client = await pool.connect();
    client.release();
    isPostgresAvailable = true;
    console.log("[Database] Connected to PostgreSQL successfully");
  } catch (err) {
    isPostgresAvailable = false;
    console.log(
      "[Database] PostgreSQL server not reachable at " +
        config.databaseUrl +
        ". Using in-memory repository fallback."
    );
  }
}

export const db = {
  isPostgres: () => isPostgresAvailable,

  // Users
  findUserByEmail: async (email: string) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      return res.rows[0];
    }
    for (const u of memUsers.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return null;
  },

  createUser: async (user: any) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        "INSERT INTO users (id, name, email, password_hash, preferred_tone) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [user.id, user.name, user.email, user.passwordHash, user.preferredTone || "concise"]
      );
      return res.rows[0];
    }
    memUsers.set(user.id, user);
    return user;
  },

  // Conversations
  getConversations: async (userId: string) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        "SELECT * FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC",
        [userId]
      );
      return res.rows;
    }
    return Array.from(memConversations.values()).filter((c) => c.user_id === userId);
  },

  createConversation: async (conv: any) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        "INSERT INTO conversations (id, user_id, title, is_pinned) VALUES ($1, $2, $3, $4) RETURNING *",
        [conv.id, conv.userId, conv.title, conv.isPinned || false]
      );
      return res.rows[0];
    }
    memConversations.set(conv.id, { ...conv, user_id: conv.userId, created_at: new Date() });
    return memConversations.get(conv.id);
  },

  getMessages: async (conversationId: string) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
        [conversationId]
      );
      return res.rows;
    }
    return memMessages.get(conversationId) || [];
  },

  createMessage: async (msg: any) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        "INSERT INTO messages (id, conversation_id, sender, text, memory_references) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [msg.id, msg.conversationId, msg.sender, msg.text, JSON.stringify(msg.memoryReferences || [])]
      );
      return res.rows[0];
    }
    const msgs = memMessages.get(msg.conversationId) || [];
    msgs.push(msg);
    memMessages.set(msg.conversationId, msgs);
    return msg;
  },

  // Memories
  getMemories: async (userId: string) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        "SELECT * FROM memories WHERE user_id = $1 ORDER BY created_at DESC",
        [userId]
      );
      return res.rows;
    }
    return Array.from(memMemories.values()).filter((m) => m.user_id === userId);
  },

  createMemory: async (mem: any) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        "INSERT INTO memories (id, user_id, content, importance, tags) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [mem.id, mem.userId, mem.content, mem.importance || "medium", JSON.stringify(mem.tags || [])]
      );
      return res.rows[0];
    }
    memMemories.set(mem.id, { ...mem, user_id: mem.userId, created_at: new Date() });
    return memMemories.get(mem.id);
  },

  // Tasks
  getTasks: async (userId: string) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query("SELECT * FROM study_tasks WHERE user_id = $1", [userId]);
      return res.rows;
    }
    return Array.from(memTasks.values()).filter((t) => t.user_id === userId);
  },

  createTask: async (task: any) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        "INSERT INTO study_tasks (id, user_id, subject_name, title, deadline, priority, completed) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [task.id, task.userId, task.subjectName, task.title, task.deadline, task.priority || "medium", task.completed || false]
      );
      return res.rows[0];
    }
    memTasks.set(task.id, { ...task, user_id: task.userId, created_at: new Date() });
    return memTasks.get(task.id);
  },

  updateTask: async (id: string, updates: any) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        "UPDATE study_tasks SET completed = COALESCE($2, completed) WHERE id = $1 RETURNING *",
        [id, updates.completed]
      );
      return res.rows[0];
    }
    const existing = memTasks.get(id);
    if (existing) {
      Object.assign(existing, updates);
      return existing;
    }
    return null;
  },

  deleteTask: async (id: string) => {
    if (isPostgresAvailable && pool) {
      await pool.query("DELETE FROM study_tasks WHERE id = $1", [id]);
      return;
    }
    memTasks.delete(id);
  },

  // Reminders
  getReminders: async (userId: string) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query("SELECT * FROM reminders WHERE user_id = $1", [userId]);
      return res.rows;
    }
    return Array.from(memReminders.values()).filter((r) => r.user_id === userId);
  },

  createReminder: async (rem: any) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        "INSERT INTO reminders (id, user_id, title, due_time, completed, tag) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [rem.id, rem.userId, rem.title, rem.dueTime, rem.completed || false, rem.tag || "General"]
      );
      return res.rows[0];
    }
    memReminders.set(rem.id, { ...rem, user_id: rem.userId, created_at: new Date() });
    return memReminders.get(rem.id);
  },

  updateReminder: async (id: string, updates: any) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        "UPDATE reminders SET completed = COALESCE($2, completed) WHERE id = $1 RETURNING *",
        [id, updates.completed]
      );
      return res.rows[0];
    }
    const existing = memReminders.get(id);
    if (existing) {
      Object.assign(existing, updates);
      return existing;
    }
    return null;
  },

  deleteReminder: async (id: string) => {
    if (isPostgresAvailable && pool) {
      await pool.query("DELETE FROM reminders WHERE id = $1", [id]);
      return;
    }
    memReminders.delete(id);
  },
  // Lectures
  createLecture: async (lecture: any) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        "INSERT INTO lectures (id, user_id, title, audio_url) VALUES ($1, $2, $3, $4) RETURNING *",
        [lecture.id, lecture.userId, lecture.title, lecture.audioUrl]
      );
      return res.rows[0];
    }
    memLectures.set(lecture.id, { ...lecture, user_id: lecture.userId, created_at: new Date() });
    return memLectures.get(lecture.id);
  },
  getLectures: async (userId: string) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query("SELECT * FROM lectures WHERE user_id = $1", [userId]);
      return res.rows;
    }
    return Array.from(memLectures.values()).filter((l) => l.user_id === userId);
  },

  // Documents (PDFs)
  createDocument: async (doc: any) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        "INSERT INTO documents (id, user_id, name, content) VALUES ($1, $2, $3, $4) RETURNING *",
        [doc.id, doc.userId, doc.name, doc.content]
      );
      return res.rows[0];
    }
    memDocuments.set(doc.id, { ...doc, user_id: doc.userId, created_at: new Date() });
    return memDocuments.get(doc.id);
  },
  getDocuments: async (userId: string) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query("SELECT * FROM documents WHERE user_id = $1", [userId]);
      return res.rows;
    }
    return Array.from(memDocuments.values()).filter((d) => d.user_id === userId);
  },

};
