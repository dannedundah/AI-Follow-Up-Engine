import dotenv from 'dotenv';
import { app } from './app.js';
import { startScheduler } from './jobs/scheduler.js';

dotenv.config();

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

startScheduler();
