import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';

export const leadsRouter = Router();

const leadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.enum(['lead', 'quote_sent', 'won', 'lost']),
  notes: z.string().optional().nullable(),
  last_contact_at: z.string().datetime().optional().nullable(),
});

leadsRouter.get('/', async (req, res) => {
  const status = req.query.status as string | undefined;
  const leads = await prisma.lead.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { created_at: 'desc' },
  });
  res.json(leads);
});

leadsRouter.post('/', async (req, res) => {
  const parsed = leadSchema.parse(req.body);
  const lead = await prisma.lead.create({
    data: {
      ...parsed,
      last_contact_at: parsed.last_contact_at ? new Date(parsed.last_contact_at) : null,
    },
  });
  res.status(201).json(lead);
});

leadsRouter.put('/:id', async (req, res) => {
  const parsed = leadSchema.partial().parse(req.body);
  const lead = await prisma.lead.update({
    where: { id: req.params.id },
    data: {
      ...parsed,
      last_contact_at: parsed.last_contact_at ? new Date(parsed.last_contact_at) : parsed.last_contact_at ?? undefined,
    },
  });
  res.json(lead);
});

leadsRouter.post('/:id/mark-contacted', async (req, res) => {
  const lead = await prisma.lead.update({
    where: { id: req.params.id },
    data: { last_contact_at: new Date() },
  });

  res.json(lead);
});
