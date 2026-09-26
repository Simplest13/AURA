// src/routes/study.ts
import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate';
import { db } from '../database/repository';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Create a new study task
router.post('/tasks', authenticate, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId!;
  const { title, description, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  try {
    const task = await db.createTask({
      id: uuidv4(),
      userId,
      subjectName: title, // using title as subject for demo
      title,
      deadline: dueDate ?? null,
      priority: 'medium',
      completed: false,
    });
    // Note: adjust as needed for real schema

    res.status(201).json(task);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
});

// Get all tasks for user
router.get('/tasks', authenticate, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId!;
  try {
    const tasks = await db.getTasks(userId);
    res.json(tasks);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
});

export default router;
