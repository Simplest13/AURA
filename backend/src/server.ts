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


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
app.use('/api/reminders', remindersRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/pdf', pdfRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

const server = app.listen(config.port, () => {
  console.log(`🚀 AURA backend listening on http://localhost:${config.port}`);
});

// Initialize WebSocket voice pipeline
import { initVoiceWebSocket } from './services/websocket/voiceSocket';
initVoiceWebSocket(server);

export default app;
