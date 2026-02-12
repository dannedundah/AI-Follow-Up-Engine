import { useEffect, useState } from 'react';
import { api } from '../api';
import { Rule } from '../types';

const defaultRule: Omit<Rule, 'id'> = {
  applies_to_status: 'lead',
  inactive_days_threshold: 3,
  channel: 'email',
  enabled: true,
  tone: 'neutral',
  subject_template: 'Hej {{lead_name}}',
  prompt_template: 'Skriv ett uppföljningsmail till {{lead_name}}.',
};

export function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [form, setForm] = useState(defaultRule);

  const load = async () => setRules(await api.getRules());
  useEffect(() => {
    load();
  }, []);

  return (
    <section>
      <h2>Rules</h2>
      <form
        className="card"
        onSubmit={async (e) => {
          e.preventDefault();
          await api.createRule(form);
          setForm(defaultRule);
          load();
        }}
      >
        <h3>Skapa regel</h3>
        <select value={form.applies_to_status} onChange={(e) => setForm({ ...form, applies_to_status: e.target.value as Rule['applies_to_status'] })}>
          <option value="lead">lead</option>
          <option value="quote_sent">quote_sent</option>
        </select>
        <input
          type="number"
          value={form.inactive_days_threshold}
          onChange={(e) => setForm({ ...form, inactive_days_threshold: Number(e.target.value) })}
        />
        <select value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value as Rule['tone'] })}>
          <option value="neutral">neutral</option>
          <option value="friendly">friendly</option>
          <option value="direct">direct</option>
        </select>
        <input
          value={form.subject_template}
          onChange={(e) => setForm({ ...form, subject_template: e.target.value })}
        />
        <textarea
          value={form.prompt_template}
          onChange={(e) => setForm({ ...form, prompt_template: e.target.value })}
        />
        <button type="submit">Spara regel</button>
      </form>

      {rules.map((rule) => (
        <div className="card" key={rule.id}>
          <strong>Rule #{rule.id}</strong>
          <p>Status: {rule.applies_to_status} • Dagar: {rule.inactive_days_threshold} • Tone: {rule.tone}</p>
          <label>
            Enabled
            <input
              type="checkbox"
              checked={rule.enabled}
              onChange={async (e) => {
                await api.toggleRule(rule.id, e.target.checked);
                load();
              }}
            />
          </label>
        </div>
      ))}
    </section>
  );
}
