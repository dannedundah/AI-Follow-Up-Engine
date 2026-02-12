import { Lead, MessageLog, Rule } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  getLeads: (status?: string) => request<Lead[]>(`/leads${status ? `?status=${status}` : ''}`),
  createLead: (lead: Partial<Lead>) => request<Lead>('/leads', { method: 'POST', body: JSON.stringify(lead) }),
  updateLead: (id: string, lead: Partial<Lead>) =>
    request<Lead>(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(lead) }),
  markContacted: (id: string) => request<Lead>(`/leads/${id}/mark-contacted`, { method: 'POST' }),
  getRules: () => request<Rule[]>('/rules'),
  createRule: (rule: Partial<Rule>) => request<Rule>('/rules', { method: 'POST', body: JSON.stringify(rule) }),
  updateRule: (id: number, rule: Partial<Rule>) =>
    request<Rule>(`/rules/${id}`, { method: 'PUT', body: JSON.stringify(rule) }),
  toggleRule: (id: number, enabled: boolean) => request<Rule>(`/rules/${id}/toggle`, { method: 'POST', body: JSON.stringify({ enabled }) }),
  getDashboard: () =>
    request<{ dueNow: { lead: Lead; matchingRules: Rule[] }[]; recentlySent: MessageLog[]; failed: MessageLog[] }>('/dashboard'),
};
