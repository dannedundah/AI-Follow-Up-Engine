import { prisma } from '../prisma.js';
import { findDueLeads } from './followUpService.js';

export const getDashboardData = async () => {
  const [duePairs, recentlySent, failed] = await Promise.all([
    findDueLeads(),
    prisma.messageLog.findMany({
      where: { created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      orderBy: { created_at: 'desc' },
      take: 30,
    }),
    prisma.messageLog.findMany({
      where: { send_status: 'failed' },
      orderBy: { created_at: 'desc' },
      take: 30,
    }),
  ]);

  const dueMap = new Map<string, { lead: (typeof duePairs)[number]['lead']; matchingRules: (typeof duePairs)[number]['rule'][] }>();

  for (const pair of duePairs) {
    const existing = dueMap.get(pair.lead.id);
    if (existing) {
      existing.matchingRules.push(pair.rule);
    } else {
      dueMap.set(pair.lead.id, { lead: pair.lead, matchingRules: [pair.rule] });
    }
  }

  return {
    dueNow: Array.from(dueMap.values()),
    recentlySent,
    failed,
  };
};
