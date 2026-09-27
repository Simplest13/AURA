import { Pool } from "pg";
import { config } from "../config";

/**
 * Robust Database Repository Layer
 * Connects to PostgreSQL if available (bootstrapping its schema automatically),
 * otherwise falls back to an in-memory repository for zero-dependency local dev.
 *
 * Every user-owned query/filter is scoped by user_id — ownership is always
 * derived from the authenticated user, never from client input.
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

// Seed initial demo data (demo account only)
memUsers.set("usr-01", {
  id: "usr-01",
  name: "Shivam",
  email: "shivam@alignsoul.co",
  password_hash: "$2a$10$abcdefghijklmnopqrstuvwxyz1234567890", // placeholder hash
  preferred_tone: "concise",
  created_at: new Date(),
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
  created_at: new Date(),
});

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  preferred_tone TEXT DEFAULT 'concise',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL DEFAULT 'Untitled',
  is_pinned  BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id                TEXT PRIMARY KEY,
  conversation_id   TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender            TEXT NOT NULL CHECK (sender IN ('user','assistant')),
  text              TEXT NOT NULL,
  memory_references JSONB DEFAULT '[]',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

CREATE TABLE IF NOT EXISTS memories (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  importance TEXT DEFAULT 'medium',
  tags       JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS study_tasks (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_name TEXT DEFAULT 'General',
  title        TEXT NOT NULL,
  deadline     TEXT,
  priority     TEXT DEFAULT 'medium',
  completed    BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reminders (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  due_time   TEXT,
  completed  BOOLEAN DEFAULT FALSE,
  tag        TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lectures (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  audio_url  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  content    TEXT,
  summary    TEXT,
  key_sections JSONB DEFAULT '[]',
  total_pages INTEGER,
  file_size_mb NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_user ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON study_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_lectures_user ON lectures(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
`;

let initPromise: Promise<void> | null = null;

export async function initDatabase(): Promise<void> {
  // Idempotent + concurrency-safe (parallel imports / test suites)
  if (!initPromise) {
    initPromise = (async () => {
      try {
        pool = new Pool({
          connectionString: config.databaseUrl,
          connectionTimeoutMillis: 1500,
        });
        const client = await pool.connect();
        client.release();
        isPostgresAvailable = true;
        // Bootstrap schema so a fresh database works with zero manual setup
        await pool.query(SCHEMA_SQL);
        console.log("[Database] Connected to PostgreSQL (schema ensured)");
      } catch (err) {
        isPostgresAvailable = false;
        console.log(
          "[Database] PostgreSQL not reachable at " +
            config.databaseUrl +
            ". Using in-memory repository fallback."
        );
      }
    })();
  }
  return initPromise;
}

export const db = {
  isPostgres: () => isPostgresAvailable,

  // ── Users ────────────────────────────────────────────────────────────────

  findUserByEmail: async (email: string) => {
    const normalized = String(email ?? "").trim().toLowerCase();
    if (isPostgresAvailable && pool) {
      const res = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1", [normalized]);
      return res.rows[0];
    }
    for (const u of memUsers.values()) {
      if (String(u.email).toLowerCase() === normalized) return u;
    }
    return null;
  },

  findUserById: async (userId: string) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
      return res.rows[0];
    }
    return memUsers.get(userId) ?? null;
  },

  createUser: async (user: any) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        `INSERT INTO users (id, name, email, password_hash, preferred_tone, created_at)
         VALUES ($1, $2, $3, $4, $5, COALESCE($6, NOW())) RETURNING *`,
        [user.id, user.name, user.email, user.password_hash, user.preferred_tone || "concise", user.created_at ?? null]
      );
      return res.rows[0];
    }
    memUsers.set(user.id, user);
    return user;
  },

  // ── Conversations & Messages (user-scoped) ───────────────────────────────

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
        `INSERT INTO conversations (id, user_id, title, is_pinned)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [conv.id, conv.userId, conv.title, conv.isPinned || false]
      );
      return res.rows[0];
    }
    memConversations.set(conv.id, { ...conv, user_id: conv.userId, created_at: new Date() });
    return memConversations.get(conv.id);
  },

  /** Ownership check: does this conversation belong to this user? */
  getConversationForUser: async (conversationId: string, userId: string) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        "SELECT * FROM conversations WHERE id = $1 AND user_id = $2",
        [conversationId, userId]
      );
      return res.rows[0];
    }
    const conv = memConversations.get(conversationId);
    return conv && conv.user_id === userId ? conv : null;
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
        `INSERT INTO messages (id, conversation_id, sender, text, memory_references, created_at)
         VALUES ($1, $2, $3, $4, $5, COALESCE($6, NOW())) RETURNING *`,
        [msg.id, msg.conversationId, msg.sender, msg.text, JSON.stringify(msg.memoryReferences || []), msg.created_at ?? null]
      );
      return res.rows[0];
    }
    const msgs = memMessages.get(msg.conversationId) || [];
    msgs.push(msg);
    memMessages.set(msg.conversationId, msgs);
    return msg;
  },

  deleteConversation: async (conversationId: string, userId: string) => {
    if (isPostgresAvailable && pool) {
      const owned = await pool.query(
        "SELECT id FROM conversations WHERE id = $1 AND user_id = $2",
        [conversationId, userId]
      );
      if (!owned.rows[0]) return false;
      await pool.query("DELETE FROM conversations WHERE id = $1", [conversationId]);
      return true;
    }
    const conv = memConversations.get(conversationId);
    if (!conv || conv.user_id !== userId) return false;
    memConversations.delete(conversationId);
    memMessages.delete(conversationId);
    return true;
  },

  // ── Memories (user-scoped) ───────────────────────────────────────────────

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
        `INSERT INTO memories (id, user_id, content, importance, tags)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [mem.id, mem.userId, mem.content, mem.importance || "medium", JSON.stringify(mem.tags || [])]
      );
      return res.rows[0];
    }
    memMemories.set(mem.id, { ...mem, user_id: mem.userId, created_at: new Date() });
    return memMemories.get(mem.id);
  },

  // ── Study Tasks (user-scoped reads AND writes) ───────────────────────────

  getTasks: async (userId: string) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        "SELECT * FROM study_tasks WHERE user_id = $1 ORDER BY created_at DESC",
        [userId]
      );
      return res.rows;
    }
    return Array.from(memTasks.values()).filter((t) => t.user_id === userId);
  },

  createTask: async (task: any) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        `INSERT INTO study_tasks (id, user_id, subject_name, title, deadline, priority, completed)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [task.id, task.userId, task.subjectName, task.title, task.deadline, task.priority || "medium", task.completed || false]
      );
      return res.rows[0];
    }
    memTasks.set(task.id, { ...task, user_id: task.userId, created_at: new Date() });
    return memTasks.get(task.id);
  },

  updateTask: async (id: string, userId: string, updates: any) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        `UPDATE study_tasks SET
           completed   = COALESCE($3, completed),
           title       = COALESCE($4, title),
           subject_name= COALESCE($5, subject_name),
           deadline    = COALESCE($6, deadline),
           priority    = COALESCE($7, priority),
           updated_at  = NOW()
         WHERE id = $1 AND user_id = $2 RETURNING *`,
        [id, userId, updates.completed ?? null, updates.title ?? null, updates.subjectName ?? null, updates.deadline ?? null, updates.priority ?? null]
      );
      return res.rows[0];
    }
    const existing = memTasks.get(id);
    if (!existing || existing.user_id !== userId) return null;
    Object.assign(existing, updates);
    return existing;
  },

  deleteTask: async (id: string, userId: string) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        "DELETE FROM study_tasks WHERE id = $1 AND user_id = $2",
        [id, userId]
      );
      return (res.rowCount ?? 0) > 0;
    }
    const existing = memTasks.get(id);
    if (!existing || existing.user_id !== userId) return false;
    memTasks.delete(id);
    return true;
  },

  // ── Reminders (user-scoped reads AND writes) ─────────────────────────────

  getReminders: async (userId: string) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        "SELECT * FROM reminders WHERE user_id = $1 ORDER BY created_at DESC",
        [userId]
      );
      return res.rows;
    }
    return Array.from(memReminders.values()).filter((r) => r.user_id === userId);
  },

  createReminder: async (rem: any) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        `INSERT INTO reminders (id, user_id, title, due_time, completed, tag)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [rem.id, rem.userId, rem.title, rem.dueTime, rem.completed || false, rem.tag || "General"]
      );
      return res.rows[0];
    }
    memReminders.set(rem.id, { ...rem, user_id: rem.userId, created_at: new Date() });
    return memReminders.get(rem.id);
  },

  updateReminder: async (id: string, userId: string, updates: any) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        `UPDATE reminders SET
           completed = COALESCE($3, completed),
           title     = COALESCE($4, title),
           due_time  = COALESCE($5, due_time),
           tag       = COALESCE($6, tag),
           updated_at = NOW()
         WHERE id = $1 AND user_id = $2 RETURNING *`,
        [id, userId, updates.completed ?? null, updates.title ?? null, updates.dueTime ?? null, updates.tag ?? null]
      );
      return res.rows[0];
    }
    const existing = memReminders.get(id);
    if (!existing || existing.user_id !== userId) return null;
    Object.assign(existing, updates);
    return existing;
  },

  deleteReminder: async (id: string, userId: string) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        "DELETE FROM reminders WHERE id = $1 AND user_id = $2",
        [id, userId]
      );
      return (res.rowCount ?? 0) > 0;
    }
    const existing = memReminders.get(id);
    if (!existing || existing.user_id !== userId) return false;
    memReminders.delete(id);
    return true;
  },

  // ── Lectures (user-scoped) ───────────────────────────────────────────────

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

  // ── Documents / PDFs (user-scoped) ───────────────────────────────────────

  createDocument: async (doc: any) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        `INSERT INTO documents (id, user_id, name, content, summary, key_sections, total_pages, file_size_mb)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [doc.id, doc.userId, doc.name, doc.content, doc.summary ?? null, JSON.stringify(doc.keySections ?? []), doc.totalPages ?? null, doc.fileSizeMb ?? null]
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
