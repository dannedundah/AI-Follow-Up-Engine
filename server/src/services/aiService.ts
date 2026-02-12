import OpenAI from 'openai';
import { Lead, MessageLog, Rule } from '@prisma/client';
import { renderPrompt, renderTemplate } from '../utils/prompt.js';

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export const fallbackContent = (rule: Rule, lead: Lead) => {
  const subject = renderTemplate(rule.subject_template, {
    lead_name: lead.name,
    lead_status: lead.status,
  });

  const body = `Hej ${lead.name},\n\nVi följer upp kring din status "${lead.status}". Återkom gärna med ett kort svar så hjälper vi dig vidare.\n\nVänligen,\nTeamet`;
  return { subject, body };
};

export const generateEmailContent = async (rule: Rule, lead: Lead, recentMessages: MessageLog[]) => {
  if (!client) return fallbackContent(rule, lead);

  try {
    const prompt = renderPrompt(rule, lead, recentMessages);
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return fallbackContent(rule, lead);

    const parsed = JSON.parse(content) as { subject?: string; body?: string };
    if (!parsed.subject || !parsed.body) return fallbackContent(rule, lead);

    return { subject: parsed.subject.trim(), body: parsed.body.trim() };
  } catch {
    return fallbackContent(rule, lead);
  }
};
