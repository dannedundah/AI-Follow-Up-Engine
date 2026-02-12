import { Router } from 'express';
import { prisma } from '../prisma.js';

export const messagesRouter = Router();

messagesRouter.get('/', async (_req, res) => {
  const messages = await prisma.messageLog.findMany({
    orderBy: { created_at: 'desc' },
    take: 100,
  });

  res.json(messages);
});
