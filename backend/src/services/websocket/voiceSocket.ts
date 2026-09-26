// src/services/websocket/voiceSocket.ts
import { Server as HttpServer } from "http";
import WebSocket, { WebSocketServer } from "ws";
import { getSpeechProvider } from "../speech";
import { getAIResponse } from "../ai";
import { getAudioForText } from "../tts";
import { config } from "../../config";

/**
 * Initialize the voice WebSocket pipeline.
 * Attach to the existing HTTP server so the same port works for both HTTP and WS.
 *
 * Protocol (JSON messages):
 *   { type: "audio_chunk", data: "<base64>" }   // client streams base64 audio chunks
 *   { type: "audio_end", conversationId: string, userId: string }
 *   // Server will respond with a sequence of events:
 *   { type: "transcript", text: string }
 *   { type: "assistant_reply", text: string }
 *   { type: "tts", audioUrl: string }
 */
export function initVoiceWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: "/ws/voice" });

  wss.on("connection", (ws: WebSocket) => {
    let audioBuffers: Buffer[] = [];
    let conversationId: string | undefined;
    let userId: string | undefined;

    ws.on("message", async (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        if (data.type === "audio_chunk" && typeof data.data === "string") {
          audioBuffers.push(Buffer.from(data.data, "base64"));
        } else if (data.type === "audio_end") {
          conversationId = data.conversationId;
          userId = data.userId;
          // 1️⃣ Transcribe accumulated audio
          const fullAudio = Buffer.concat(audioBuffers);
          const transcript = await getSpeechProvider().transcribe(fullAudio);
          ws.send(JSON.stringify({ type: "transcript", text: transcript }));

          // 2️⃣ Get AI response
          if (!userId) throw new Error("userId missing for AI request");
          const aiReply = await getAIResponse(userId, transcript);
          ws.send(JSON.stringify({ type: "assistant_reply", text: aiReply }));

          // 3️⃣ Synthesize speech (TTS)
          const audioUrl = await getAudioForText(aiReply);
          ws.send(JSON.stringify({ type: "tts", audioUrl }));

          // Reset buffers for next round
          audioBuffers = [];
        }
      } catch (err: any) {
        console.error("WebSocket processing error:", err);
        ws.send(JSON.stringify({ type: "error", message: err.message }));
      }
    });

    ws.on("close", () => {
      audioBuffers = [];
    });
  });

  console.log("🚀 Voice WebSocket initialized at /ws/voice");
}
