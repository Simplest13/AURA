// src/routes/chat.ts
import { Router } from "express";
import { authenticate, AuthenticatedRequest } from "../middleware/authenticate";
import { db } from "../database/repository";
import { getAIResponse } from "../services/ai";
import { v4 as uuidv4 } from "uuid";

const router = Router();

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

// Create a new conversation (optional helper)
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

// Post a user message and get AI reply
router.post("/messages", authenticate, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId!;
  const { conversationId, text } = req.body;
  if (!conversationId || !text) {
    return res.status(400).json({ error: "conversationId and text are required" });
  }
  try {
    // Store user message
    const userMsg = await db.createMessage({
      id: uuidv4(),
      conversationId,
      sender: "user",
      text,
      memoryReferences: [],
    });

    // Retrieve relevant memories (simple fetch all for demo)
    const memories = await db.getMemories(userId);
    const memoryTexts = memories.map((m: any) => m.content).join(" ");
    const prompt = `${memoryTexts}\nUser: ${text}`;

    // Get AI response
    const aiText = await getAIResponse(userId, prompt);
    const aiMsg = await db.createMessage({
      id: uuidv4(),
      conversationId,
      sender: "assistant",
      text: aiText,
      memoryReferences: [],
    });

    res.json({ userMessage: userMsg, aiMessage: aiMsg });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  }
});

// Get all messages for a conversation
router.get("/conversations/:id/messages", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const msgs = await db.getMessages(id as string);
    res.json(msgs);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  }
});

export default router;
