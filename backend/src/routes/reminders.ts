// src/routes/reminders.ts
import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate';
import { db } from '../database/repository';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Create a new reminder
router.post('/reminders', authenticate, async (req, res) => {
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
router.get('/reminders', authenticate, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId!;
  try {
    const reminders = await db.getReminders(userId);
    res.json(reminders);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
});

  // Update a reminder (e.g., mark completed)
  router.put('/reminders/:id', authenticate, async (req, res) => {
    const id = (req.params as any).id as string;
    const updates = req.body;
    try {
      const updated = await db.updateReminder(id, updates);
      if (!updated) return res.status(404).json({ error: 'Reminder not found' });
      res.json(updated);
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || 'Server error' });
    }
  });

  // Delete a reminder
  router.delete('/reminders/:id', authenticate, async (req, res) => {
    const id = (req.params as any).id as string;
    try {
      await db.deleteReminder(id);
      res.status(204).send();
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || 'Server error' });
    }
  });

export default router;
