/**
 * Shared Transcription + Summarization pipeline.
 * Uploads real audio (multipart/form-data) to the backend /api/transcription
 * — served by Groq Whisper — and asks the AI for structured notes + summary.
 */

import { Platform } from "react-native";
import { ApiClient } from "../api/ApiClient";
import { AIService } from "./AIService";

export interface TranscriptionResult {
  transcript: string;
  provider: string;
}

export interface LectureStudyNotes {
  summary: string;
  keyTakeaways: string[];
  notes: string;
  title: string;
}

/** Which STT engine the backend will use (for status surfaces). */
export async function getTranscriptionStatus(): Promise<{
  provider: string;
  configured: boolean;
} | null> {
  try {
    return await ApiClient.get<{ provider: string; configured: boolean }>(
      "/api/transcription/status",
      8000
    );
  } catch {
    return null;
  }
}

/** Transcribe a recorded audio blob/file via the backend speech provider. */
export async function transcribeAudioBlob(blob: Blob): Promise<TranscriptionResult> {
  if (blob.size === 0) {
    throw new Error("The recording is empty. Try again and speak for a few seconds.");
  }
  if (blob.size > 24 * 1024 * 1024) {
    throw new Error("Recording too long (over 24MB). Keep lectures under ~90 minutes per clip.");
  }

  let response: { transcript: string; provider: string };

  if (Platform.OS === "web") {
    // Preferred path: multipart upload — no base64 overhead, no body-limit errors
    const form = new FormData();
    const ext = blob.type.includes("wav")
      ? "wav"
      : blob.type.includes("ogg")
      ? "ogg"
      : blob.type.includes("mp4") || blob.type.includes("m4a")
      ? "m4a"
      : blob.type.includes("mpeg")
      ? "mp3"
      : "webm";
    form.append("audio", blob, `recording.${ext}`);
    response = await ApiClient.post<{ transcript: string; provider: string }>(
      "/api/transcription",
      form,
      120000
    );
  } else {
    // Native fallback: base64 JSON (body limit raised server-side)
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(
        null,
        Array.from(bytes.subarray(i, i + chunkSize)) as unknown as number[]
      );
    }
    response = await ApiClient.post<{ transcript: string; provider: string }>(
      "/api/transcription",
      { audio: btoa(binary) },
      120000
    );
  }

  const text = response?.transcript ?? "";
  if (!text.trim()) {
    throw new Error(
      "No speech was detected in the recording. Speak clearly and try recording a bit longer."
    );
  }
  return { transcript: text, provider: response.provider ?? "speech-to-text" };
}

/**
 * Turn a transcript into structured study material:
 * a suggested title, a summary paragraph, key takeaways, and detailed notes.
 */
export async function generateLectureNotes(
  transcript: string,
  subjectHint?: string
): Promise<LectureStudyNotes> {
  const prompt = `You are AURA, a study assistant. A student recorded a lecture${
    subjectHint ? ` for ${subjectHint}` : ""
  }. Below is the auto-transcript (it may contain small speech-recognition errors — silently fix obvious ones).

Respond in EXACTLY this markdown structure:

TITLE: <a short descriptive lecture title, max 8 words>

SUMMARY: <2-4 sentence overview of what the lecture covered>

TAKEAWAYS:
- <most important point 1>
- <point 2>
- <point 3>
(3-6 bullets total)

NOTES:
## Key Concepts
<bulleted explanations of each concept taught>
## Definitions
<any terms defined, with meanings>
## Examples
<examples or worked problems mentioned>

TRANSCRIPT:
${transcript.slice(0, 12000)}`;

  const reply = await AIService.query(prompt);

  const titleMatch = reply.match(/TITLE:\s*(.+)/i);
  const summaryMatch = reply.match(/SUMMARY:\s*([\s\S]*?)(?=\nTAKEAWAYS:|$)/i);
  const takeawayMatch = reply.match(/TAKEAWAYS:\s*([\s\S]*?)(?=\nNOTES:|$)/i);
  const notesMatch = reply.match(/NOTES:\s*([\s\S]*)$/i);

  const keyTakeaways = (takeawayMatch?.[1] ?? "")
    .split("\n")
    .map((l) => l.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 6);

  const summary = (summaryMatch?.[1] ?? "").replace(/\n+/g, " ").trim();

  const notes = (notesMatch?.[1] ?? "").trim() || reply.trim();

  return {
    title: (titleMatch?.[1] ?? "Recorded Lecture").trim().slice(0, 60),
    summary: summary || transcript.slice(0, 280),
    keyTakeaways: keyTakeaways.length
      ? keyTakeaways
      : ["Review the full transcript below"],
    notes,
  };
}
