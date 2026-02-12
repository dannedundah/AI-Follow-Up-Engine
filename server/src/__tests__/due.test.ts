import { Lead, MessageLog, Rule } from '@prisma/client';
import { getDueLeadRulePairs, isLeadInactiveForRule, wasRecentlyContactedByRule } from '../utils/due.js';

const makeLead = (overrides: Partial<Lead> = {}): Lead => ({
  id: 'lead-1',
  name: 'Acme',
  email: 'lead@test.com',
  phone: null,
  status: 'lead',
  last_contact_at: new Date('2025-01-01T00:00:00.000Z'),
  notes: null,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

const makeRule = (overrides: Partial<Rule> = {}): Rule => ({
  id: 1,
  applies_to_status: 'lead',
  inactive_days_threshold: 3,
  channel: 'email',
  enabled: true,
  tone: 'neutral',
  subject_template: 'Hej {{lead_name}}',
  prompt_template: 'Template',
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

const makeLog = (overrides: Partial<MessageLog> = {}): MessageLog => ({
  id: 1,
  lead_id: 'lead-1',
  rule_id: 1,
  channel: 'email',
  to_email: 'lead@test.com',
  subject: 's',
  body: 'b',
  send_status: 'sent',
  provider_response: null,
  created_at: new Date('2025-01-10T00:00:00.000Z'),
  ...overrides,
});

describe('due logic', () => {
  it('marks lead as inactive when over threshold', () => {
    const lead = makeLead({ last_contact_at: new Date('2025-01-01T00:00:00.000Z') });
    const rule = makeRule({ inactive_days_threshold: 3 });
    const now = new Date('2025-01-05T00:00:00.000Z');

    expect(isLeadInactiveForRule(lead, rule, now)).toBe(true);
  });

  it('prevents send when already contacted in last 24h', () => {
    const now = new Date('2025-01-11T00:00:00.000Z');
    const logs = [makeLog({ created_at: new Date('2025-01-10T12:00:00.000Z') })];
    expect(wasRecentlyContactedByRule(logs, 'lead-1', 1, now)).toBe(true);
  });

  it('returns due pairs only when anti-spam allows', () => {
    const now = new Date('2025-01-11T00:00:00.000Z');
    const lead = makeLead({ last_contact_at: new Date('2025-01-01T00:00:00.000Z') });
    const rule = makeRule();
    const logs = [makeLog({ created_at: new Date('2025-01-08T00:00:00.000Z') })];

    const pairs = getDueLeadRulePairs([lead], [rule], logs, now);
    expect(pairs).toHaveLength(1);
    expect(pairs[0].lead.id).toBe('lead-1');
  });
});
