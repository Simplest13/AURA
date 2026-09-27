// src/routes/reminders.ts
import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate';
import { db } from '../database/repository';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Create a new reminder
router.post('/', authenticate, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId!;
  const { title, dueTime, tag } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  try {
    const reminder = await db.createReminder({
      id: uuidv4(),
      userId,
      title,
      dueTime: dueTime ?? null,
      completed: false,
      tag: tag ?? 'General',
    });
    res.status(201).json(reminder);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
});

// Get all reminders for user
router.get('/', authenticate, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId!;
  try {
    const reminders = await db.getReminders(userId);
    res.json(reminders);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
});

  // Update a reminder (e.g., mark completed) — scoped to the authenticated user
  router.put('/:id', authenticate, async (req, res) => {
    const id = (req.params as any).id as string;
    const userId = (req as AuthenticatedRequest).userId!;
    const updates = req.body;
    try {
      const updated = await db.updateReminder(id, userId, updates);
      if (!updated) return res.status(404).json({ error: 'Reminder not found' });
      res.json(updated);
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || 'Server error' });
    }
  });

  // Delete a reminder — scoped to the authenticated user
  router.delete('/:id', authenticate, async (req, res) => {
    const id = (req.params as any).id as string;
    const userId = (req as AuthenticatedRequest).userId!;
    try {
      const deleted = await db.deleteReminder(id, userId);
      if (!deleted) return res.status(404).json({ error: 'Reminder not found' });
      res.status(204).send();
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || 'Server error' });
    }
  });

export default router;
