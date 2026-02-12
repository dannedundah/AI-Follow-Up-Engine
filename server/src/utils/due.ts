import { Lead, MessageLog, Rule } from '@prisma/client';

const MS_PER_DAY = 86_400_000;

export const isLeadInactiveForRule = (lead: Lead, rule: Rule, now = new Date()): boolean => {
  if (!lead.email || !rule.enabled || lead.status !== rule.applies_to_status) {
    return false;
  }

  if (!lead.last_contact_at) {
    return true;
  }

  const inactiveDays = (now.getTime() - lead.last_contact_at.getTime()) / MS_PER_DAY;
  return inactiveDays >= rule.inactive_days_threshold;
};

export const wasRecentlyContactedByRule = (
  logs: MessageLog[],
  leadId: string,
  ruleId: number,
  now = new Date(),
): boolean => {
  const cutoff = now.getTime() - 24 * 60 * 60 * 1000;
  return logs.some(
    (log) =>
      log.lead_id === leadId &&
      log.rule_id === ruleId &&
      new Date(log.created_at).getTime() >= cutoff &&
      (log.send_status === 'sent' || log.send_status === 'queued'),
  );
};

export const getDueLeadRulePairs = (
  leads: Lead[],
  rules: Rule[],
  logs: MessageLog[],
  now = new Date(),
): Array<{ lead: Lead; rule: Rule }> => {
  const due: Array<{ lead: Lead; rule: Rule }> = [];

  for (const lead of leads) {
    for (const rule of rules) {
      if (!isLeadInactiveForRule(lead, rule, now)) continue;
      if (wasRecentlyContactedByRule(logs, lead.id, rule.id, now)) continue;
      due.push({ lead, rule });
    }
  }

  return due;
};
