import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';

export const rulesRouter = Router();

const ruleSchema = z.object({
  applies_to_status: z.enum(['lead', 'quote_sent']),
  inactive_days_threshold: z.number().int().nonnegative(),
  channel: z.literal('email'),
  enabled: z.boolean(),
  tone: z.enum(['neutral', 'friendly', 'direct']),
  subject_template: z.string().min(1),
  prompt_template: z.string().min(1),
});

rulesRouter.get('/', async (_req, res) => {
  const rules = await prisma.rule.findMany({ orderBy: { id: 'asc' } });
  res.json(rules);
});

rulesRouter.post('/', async (req, res) => {
  const parsed = ruleSchema.parse(req.body);
  const rule = await prisma.rule.create({ data: parsed });
  res.status(201).json(rule);
});

rulesRouter.put('/:id', async (req, res) => {
  const parsed = ruleSchema.partial().parse(req.body);
  const rule = await prisma.rule.update({
    where: { id: Number(req.params.id) },
    data: parsed,
  });
  res.json(rule);
});

rulesRouter.post('/:id/toggle', async (req, res) => {
  const parsed = z.object({ enabled: z.boolean() }).parse(req.body);
  const rule = await prisma.rule.update({
    where: { id: Number(req.params.id) },
    data: { enabled: parsed.enabled },
  });
  res.json(rule);
});
