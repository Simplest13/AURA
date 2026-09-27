// src/server.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import transcriptionRoutes from './routes/transcription';
import ttsRoutes from './routes/tts';
import studyRoutes from './routes/study';
import lectureRoutes from './routes/lectures';
import pdfRoutes from './routes/pdf';
import remindersRoutes from './routes/reminders';
import { initDatabase } from './database/repository';


const app = express();

// Middleware
app.use(cors());
// Large JSON bodies (base64 audio fallback) — 30MB headroom for long recordings
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

// Simple health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/transcription', transcriptionRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/study', studyRoutes);
// Canonical client-facing mounts (mobile app calls /api/reminders, /api/study, /api/pdf)
app.use('/api/reminders', remindersRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/pdf', pdfRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

// Only auto-listen when run directly (ts-node src/server.ts / node dist/server.js),
// not when imported by the test suite which creates its own ephemeral server.
// Handles both POSIX (…/src/server.ts) and Windows (…\src\server.ts) separators.
const scriptPath = (process.argv[1] ?? '').replace(/\\/g, '/');
const isDirectRun = /server\.(ts|js)$/.test(scriptPath);
export let server: any = null;
if (isDirectRun) {
  // Connect to PostgreSQL and ensure the schema (users/conversations/messages/
  // memories/study_tasks/reminders/lectures/documents) before accepting traffic.
  void initDatabase();

  server = app.listen(config.port, () => {
    console.log(`🚀 AURA backend listening on http://localhost:${config.port}`);
  });

  // Initialize WebSocket voice pipeline (needs the running HTTP server)
  import('./services/websocket/voiceSocket').then(({ initVoiceWebSocket }) =>
    initVoiceWebSocket(server)
  );
}

export default app;
export { app };
