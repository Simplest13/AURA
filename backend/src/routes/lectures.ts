// src/routes/lectures.ts
import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate';
import { db } from '../database/repository';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Create a lecture record (title + audio URL)
router.post('/lectures', authenticate, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId!;
  const { title, audioUrl } = req.body;
  if (!title || !audioUrl) {
    return res.status(400).json({ error: 'title and audioUrl required' });
  }
  try {
    const lecture = await db.createLecture({
      id: uuidv4(),
      userId,
      title,
      audioUrl,
    });
    res.status(201).json(lecture);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
});

// List all lectures for the authenticated user
router.get('/lectures', authenticate, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId!;
  try {
    const lectures = await db.getLectures(userId);
    res.json(lectures);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
});

export default router;
