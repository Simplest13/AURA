// src/routes/tts.ts
import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { getAudioForText } from '../services/tts/index';

const router = Router();

/**
 * POST /api/tts
 * Body: { text: string }
 * Returns: { audioUrl: string }
 * Protected route – requires valid JWT.
 */
router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body as { text?: string };
    if (!text) {
      return res.status(400).json({ error: 'Missing text in request body' });
    }
    const audioUrl = await getAudioForText(text);
    return res.json({ audioUrl });
  } catch (err) {
    next(err);
  }
});

export default router;
