// src/routes/transcription.ts
import { Router } from "express";
import { getSpeechProvider } from "../services/speech";

const router = Router();

/**
 * Expects JSON body: { audio: "<base64 string>" }
 * Returns: { transcript: string }
 */
router.post("/", async (req, res) => {
  const { audio } = req.body;
  if (!audio) {
    return res.status(400).json({ error: "Missing 'audio' field (base64 string)" });
  }
  try {
    const buffer = Buffer.from(audio, "base64");
    const transcript = await getSpeechProvider().transcribe(buffer);
    res.json({ transcript });
  } catch (err: any) {
    console.error("Transcription error:", err);
    res.status(500).json({ error: err.message || "Transcription failed" });
  }
});

export default router;
