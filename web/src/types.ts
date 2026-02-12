export type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: 'lead' | 'quote_sent' | 'won' | 'lost';
  last_contact_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Rule = {
  id: number;
  applies_to_status: 'lead' | 'quote_sent';
  inactive_days_threshold: number;
  channel: 'email';
  enabled: boolean;
  tone: 'neutral' | 'friendly' | 'direct';
  subject_template: string;
  prompt_template: string;
};

export type MessageLog = {
  id: number;
  lead_id: string;
  rule_id: number | null;
  channel: 'email';
  to_email: string;
  subject: string;
  body: string;
  send_status: 'queued' | 'sent' | 'failed';
  provider_response: string | null;
  created_at: string;
};
