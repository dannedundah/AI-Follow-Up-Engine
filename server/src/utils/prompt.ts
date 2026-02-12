import { Lead, MessageLog, Rule } from '@prisma/client';

export const renderTemplate = (template: string, data: Record<string, string>): string => {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key: string) => data[key] ?? '');
};

export const renderPrompt = (rule: Rule, lead: Lead, recentMessages: MessageLog[]): string => {
  const history = recentMessages
    .map(
      (m) => `- ${m.created_at.toISOString()} [${m.send_status}] Subject: ${m.subject}\n  Body: ${m.body.slice(0, 180)}`,
    )
    .join('\n');

  const base = renderTemplate(rule.prompt_template, {
    lead_name: lead.name,
    lead_status: lead.status,
    lead_notes: lead.notes ?? '',
    last_contact_at: lead.last_contact_at?.toISOString() ?? 'unknown',
    app_base_url: process.env.APP_BASE_URL ?? '',
  });

  return `${base}

You are writing a follow-up email in Swedish.
Tone: ${rule.tone}.
Constraints:
- Max 120 words.
- Clear CTA.
- Do not invent details.
- Keep it actionable and concise.
Recent messages (latest 3):
${history || '- No previous messages'}
Return JSON with keys: subject, body.`;
};
