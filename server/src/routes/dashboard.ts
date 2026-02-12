import { Router } from 'express';
import { getDashboardData } from '../services/dashboardService.js';

export const dashboardRouter = Router();

dashboardRouter.get('/', async (_req, res) => {
  const data = await getDashboardData();
  res.json(data);
});
