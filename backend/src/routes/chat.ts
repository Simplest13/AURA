// src/routes/chat.ts
import { Router } from "express";
import { authenticate, AuthenticatedRequest } from "../middleware/authenticate";
import { db } from "../database/repository";
import { getAIResponse, getAIChatResponse } from "../services/ai";
import { signToken } from "../services/auth";
import { v4 as uuidv4 } from "uuid";

const router = Router();

/**
 * POST /api/chat/demo-login
 * Issues a real JWT for the built-in demo account so the app can use
 * authenticated routes (tasks, reminders, documents, conversations)
 * without a real account. The account exists in the same users table
 * (created on demand, bcrypt-hashed placeholder password never used for login).
 */
router.post("/demo-login", async (req, res) => {
  try {
    const email = "shivam@alignsoul.co";

    let user = await db.findUserByEmail(email);
    if (!user) {
      user = await db.createUser({
        id: "usr-01",
        name: "Shivam",
        email,
        password_hash: "demo-oauth-placeholder",
        preferred_tone: "concise",
        created_at: new Date(),
      });
    }
    const token = signToken(user.id);
    const { password_hash, ...userWithoutHash } = user;
    res.json({ token, user: userWithoutHash });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Demo login failed" });
  }
});

router.post("/", async (req, res) => {
  const { message, text } = req.body ?? {};
  const prompt = typeof message === "string" ? message : typeof text === "string" ? text : "";

  if (!prompt.trim()) {
    return res.status(400).json({ error: "message or text is required" });
  }

  try {
    const reply = await getAIResponse("demo-user", prompt.trim());
    return res.json({ reply });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "AI request failed" });
  }
});

router.post("/ask", async (req, res) => {
  const { message, text } = req.body ?? {};
  const prompt = typeof message === "string" ? message : typeof text === "string" ? text : "";

  if (!prompt.trim()) {
    return res.status(400).json({ error: "message or text is required" });
  }

  try {
    const reply = await getAIResponse("demo-user", prompt.trim());
    return res.json({ reply });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "AI request failed" });
  }
});

// Create a new conversation
router.post("/conversations", authenticate, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId!;
  const { title, isPinned } = req.body;
  try {
    const conv = await db.createConversation({
      id: uuidv4(),
      userId,
      title: title ?? "Untitled",
      isPinned: Boolean(isPinned),
    });
    res.status(201).json(conv);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  }
});

// List conversations for the user (with message counts)
router.get("/conversations", authenticate, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId!;
  try {
    const convs = (await db.getConversations(userId)) as any[];
    const result = await Promise.all(
      convs.map(async (c) => {
        const msgs = (await db.getMessages(c.id)) as any[];
        return {
          id: c.id,
          title: c.title,
          isPinned: Boolean(c.is_pinned ?? c.isPinned),
          createdAt: c.created_at ?? Date.now(),
          updatedAt: c.updated_at ?? c.created_at ?? Date.now(),
          messageCount: msgs.length,
        };
      })
    );
    res.json(result);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  }
});

// Get one conversation with full messages (ownership verified)
router.get("/conversations/:id", authenticate, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId!;
  const { id } = req.params;
  try {
    const conv = await db.getConversationForUser(id as string, userId);
    if (!conv) return res.status(404).json({ error: "Conversation not found" });
    const msgs = (await db.getMessages(id as string)) as any[];
    res.json(msgs);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  }
});

// Post a user message and get AI reply (persisted)
router.post("/messages", authenticate, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId!;
  const { conversationId, text } = req.body;
  if (!conversationId || !text) {
    return res.status(400).json({ error: "conversationId and text are required" });
  }
  try {
    // Ownership check: the conversation must belong to the authenticated user
    const conversation = await db.getConversationForUser(conversationId, userId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const userMsg = await db.createMessage({
      id: uuidv4(),
      conversationId,
      sender: "user",
      text,
      memoryReferences: [],
      created_at: new Date(),
    });

    // Retrieve relevant memories for context injection
    const memories = (await db.getMemories(userId)) as any[];
    const memoryTexts = memories.map((m: any) => m.content).join("\n");

    // Build a real multi-turn conversation from recent history
    const history = (await db.getMessages(conversationId)) as any[];
    const turns = history
      .filter((m: any) => m.id !== userMsg.id)
      .slice(-12)
      .map((m: any) => ({
        role: (m.sender === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.text,
      }));

    const systemMemory = memoryTexts
      ? `Context about the student from long-term memory (use it when relevant):\n${memoryTexts}`
      : "";

    let aiText: string;
    try {
      aiText = await getAIChatResponse([
        ...(systemMemory ? [{ role: "system" as const, content: systemMemory }] : []),
        ...turns,
        { role: "user" as const, content: text },
      ]);
    } catch {
      aiText = await getAIResponse(userId, text);
    }
    const aiMsg = await db.createMessage({
      id: uuidv4(),
      conversationId,
      sender: "assistant",
      text: aiText,
      memoryReferences: memories.length ? ["Referenced memories"] : [],
      created_at: new Date(),
    });

    res.json({ userMessage: userMsg, aiMessage: aiMsg });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  }
});

// Delete a conversation and its messages (ownership verified)
router.delete("/conversations/:id", authenticate, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId!;
  const { id } = req.params;
  try {
    const deleted = await db.deleteConversation(id as string, userId);
    if (!deleted) return res.status(404).json({ error: "Conversation not found" });
    res.json({ deleted: true });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  }
});

// Get all messages for a conversation (ownership verified)
router.get("/conversations/:id/messages", authenticate, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId!;
  const { id } = req.params;
  try {
    const conv = await db.getConversationForUser(id as string, userId);
    if (!conv) return res.status(404).json({ error: "Conversation not found" });
    const msgs = await db.getMessages(id as string);
    res.json(msgs);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  }
});

export default router;
