import cron from 'node-cron';
import { processDueFollowUps } from '../services/followUpService.js';

export const startScheduler = () => {
  cron.schedule('*/15 * * * *', async () => {
    await processDueFollowUps();
  });
};
