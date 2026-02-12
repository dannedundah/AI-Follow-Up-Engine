import express from 'express';
import cors from 'cors';
import { leadsRouter } from './routes/leads.js';
import { rulesRouter } from './routes/rules.js';
import { dashboardRouter } from './routes/dashboard.js';
import { messagesRouter } from './routes/messages.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/leads', leadsRouter);
app.use('/api/rules', rulesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/messages', messagesRouter);
