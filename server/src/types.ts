import { Lead, MessageLog, Rule } from '@prisma/client';

export type LeadWithMessages = Lead & { messages: MessageLog[] };
export type DashboardData = {
  dueNow: Array<{ lead: Lead; matchingRules: Rule[] }>;
  recentlySent: MessageLog[];
  failed: MessageLog[];
};
