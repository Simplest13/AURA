// src/routes/transcription.ts
import { Router, Request, Response } from "express";
import multer from "multer";
import { getSpeechProvider } from "../services/speech";
import { config } from "../config";

const router = Router();

// Accept audio uploads up to 25MB (Groq Whisper limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

/**
 * POST /api/transcription
 * Primary: multipart/form-data with field "audio" (preferred — no base64 overhead)
 * Fallback: JSON { audio: "<base64>" }
 * Returns: { transcript, provider }
 */
router.post("/", upload.single("audio"), async (req: Request, res: Response) => {
  try {
    let buffer: Buffer | null = null;
    let mimeType = "audio/webm";

    if (req.file) {
      buffer = req.file.buffer;
      mimeType = req.file.mimetype || mimeType;
    } else if (typeof (req.body as any)?.audio === "string") {
      buffer = Buffer.from((req.body as any).audio, "base64");
    }

    if (!buffer || buffer.length === 0) {
      return res
        .status(400)
        .json({ error: "No audio received. Send multipart/form-data with an 'audio' field, or JSON { audio: base64 }." });
    }

    const provider = getSpeechProvider();
    const transcript = await provider.transcribe(buffer, mimeType);

    if (!transcript.trim()) {
      return res.status(422).json({
        error:
          "No speech detected in the recording. Speak clearly and record for at least a few seconds.",
        provider: provider.name,
      });
    }

    res.json({ transcript, provider: provider.name, mock: config.useMockAI });
  } catch (err: any) {
    console.error("Transcription error:", err);
    res.status(502).json({
      error: err?.message || "Transcription failed",
      hint: "Check that GROQ_API_KEY (or DEEPGRAM_API_KEY) is configured on the backend.",
    });
  }
});

/** GET /api/transcription/status — lets the app show which STT engine is live. */
router.get("/status", (_req: Request, res: Response) => {
  const provider = getSpeechProvider();
  res.json({
    provider: provider.name,
    configured: provider.name !== "Mock (no STT key)",
    mock: config.useMockAI,
  });
});

export default router;
