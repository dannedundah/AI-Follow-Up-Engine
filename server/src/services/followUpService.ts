import { MessageLog, Prisma, Rule } from '@prisma/client';
import { prisma } from '../prisma.js';
import { sendEmail } from './emailService.js';
import { generateEmailContent } from './aiService.js';
import { getDueLeadRulePairs } from '../utils/due.js';

const logMessage = async (data: Prisma.MessageLogUncheckedCreateInput) => {
  return prisma.messageLog.create({ data });
};

export const fetchRecentMessagesForLead = async (leadId: string): Promise<MessageLog[]> => {
  return prisma.messageLog.findMany({
    where: { lead_id: leadId },
    orderBy: { created_at: 'desc' },
    take: 3,
  });
};

export const findDueLeads = async () => {
  const [leads, rules, logs] = await Promise.all([
    prisma.lead.findMany(),
    prisma.rule.findMany({ where: { enabled: true } }),
    prisma.messageLog.findMany({
      where: { created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
  ]);

  return getDueLeadRulePairs(leads, rules as Rule[], logs);
};

export const processDueFollowUps = async () => {
  const duePairs = await findDueLeads();

  for (const { lead, rule } of duePairs) {
    if (!lead.email) continue;

    const recentMessages = await fetchRecentMessagesForLead(lead.id);
    const { subject, body } = await generateEmailContent(rule, lead, recentMessages);

    try {
      const providerResponse = await sendEmail(lead.email, subject, body);
      await logMessage({
        lead_id: lead.id,
        rule_id: rule.id,
        channel: 'email',
        to_email: lead.email,
        subject,
        body,
        send_status: 'sent',
        provider_response: JSON.stringify({ messageId: providerResponse.messageId }),
      });

      await prisma.lead.update({
        where: { id: lead.id },
        data: { last_contact_at: new Date() },
      });
    } catch (error) {
      await logMessage({
        lead_id: lead.id,
        rule_id: rule.id,
        channel: 'email',
        to_email: lead.email,
        subject,
        body,
        send_status: 'failed',
        provider_response: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return duePairs.length;
};
