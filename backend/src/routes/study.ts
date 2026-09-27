// src/routes/study.ts
import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate';
import { db } from '../database/repository';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Create a new study task
router.post('/tasks', authenticate, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId!;
  const { title, subjectName, deadline, priority } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  try {
    const task = await db.createTask({
      id: uuidv4(),
      userId,
      subjectName: subjectName || 'General',
      title,
      deadline: deadline ?? null,
      priority: priority || 'medium',
      completed: false,
    });
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

// Update a task (toggle completed, edit fields) — scoped to the authenticated user
router.put('/tasks/:id', authenticate, async (req, res) => {
  const id = (req.params as any).id as string;
  const userId = (req as AuthenticatedRequest).userId!;
  const { completed, title, subjectName, deadline, priority } = req.body || {};
  try {
    const updated = await db.updateTask(id, userId, {
      ...(completed !== undefined ? { completed } : {}),
      ...(title !== undefined ? { title } : {}),
      ...(subjectName !== undefined ? { subjectName } : {}),
      ...(deadline !== undefined ? { deadline } : {}),
      ...(priority !== undefined ? { priority } : {}),
    });
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
});

// Delete a task — scoped to the authenticated user
router.delete('/tasks/:id', authenticate, async (req, res) => {
  const id = (req.params as any).id as string;
  const userId = (req as AuthenticatedRequest).userId!;
  try {
    const deleted = await db.deleteTask(id, userId);
    if (!deleted) return res.status(404).json({ error: 'Task not found' });
    res.status(204).send();
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
});

export default router;
