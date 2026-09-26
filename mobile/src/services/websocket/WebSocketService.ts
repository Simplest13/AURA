/**
 * AURA Real-Time WebSocket Voice Service
 * Connects to /ws/voice to stream audio chunks and receive real-time transcripts,
 * AI tokens, and speech playback events.
 */

import { WEBSOCKET_URL } from "../../config/env";

export type WebSocketEventType =
  | "AUDIO_START"
  | "AUDIO_CHUNK"
  | "AUDIO_END"
  | "TRANSCRIPT_PARTIAL"
  | "TRANSCRIPT_FINAL"
  | "AI_THINKING"
  | "AI_RESPONSE"
  | "TTS_START"
  | "TTS_END"
  | "ERROR";

export interface WebSocketMessage {
  type: WebSocketEventType | string;
  data?: any;
  text?: string;
  chunk?: string;
  message?: string;
}

export type WebSocketHandler = (event: WebSocketMessage) => void;

export class WebSocketService {
  private socket: WebSocket | null = null;
  private handlers: Set<WebSocketHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private isConnecting = false;

  connect(url = WEBSOCKET_URL): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log("[WebSocketService] Connected to real-time voice pipeline:", url);
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      };

      this.socket.onmessage = (event) => {
        try {
          const payload = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          this.handlers.forEach((h) => h(payload));
        } catch (e) {
          console.error("[WebSocketService] Failed to parse message:", e);
        }
      };

      this.socket.onerror = (err) => {
        console.warn("[WebSocketService] Socket error, fallback to REST/mock:", err);
      };

      this.socket.onclose = () => {
        console.log("[WebSocketService] Disconnected");
        this.isConnecting = false;
        this.socket = null;
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.connect(url), 2000);
        }
      };
    } catch (e) {
      this.isConnecting = false;
      console.warn("[WebSocketService] Socket init exception:", e);
    }
  }

  send(message: WebSocketMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  onEvent(handler: WebSocketHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService();
