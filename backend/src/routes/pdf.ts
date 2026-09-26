// src/routes/pdf.ts
import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate';
import { db } from '../database/repository';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Upload a PDF (store content as string) and get a document ID
router.post('/documents', authenticate, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId!;
  const { name, content } = req.body; // content should be base64 or plain text for simplicity
  if (!name || !content) {
    return res.status(400).json({ error: 'name and content required' });
  }
  try {
    const doc = await db.createDocument({
      id: uuidv4(),
      userId,
      name,
      content,
    });
    res.status(201).json(doc);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
});

// Simple summarization placeholder – returns first 200 characters
router.post('/summarize', authenticate, async (req, res) => {
  const { documentId } = req.body;
  if (!documentId) return res.status(400).json({ error: 'documentId required' });
  try {
    const docs = await db.getDocuments((req as AuthenticatedRequest).userId!);
    const doc = docs.find((d: any) => d.id === documentId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    const summary = doc.content.slice(0, 200) + (doc.content.length > 200 ? '...' : '');
    res.json({ summary });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
});

export default router;
