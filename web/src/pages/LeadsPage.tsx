import { useEffect, useState } from 'react';
import { api } from '../api';
import { Lead } from '../types';

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [form, setForm] = useState({ name: '', email: '', status: 'lead' });

  const load = async () => {
    const data = await api.getLeads(statusFilter === 'all' ? undefined : statusFilter);
    setLeads(data);
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const createLead = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createLead({ ...form, email: form.email || null, phone: null, notes: null });
    setForm({ name: '', email: '', status: 'lead' });
    load();
  };

  return (
    <section>
      <h2>Leads</h2>
      <div className="row">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Alla statusar</option>
          <option value="lead">Lead</option>
          <option value="quote_sent">Quote sent</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      <form className="card" onSubmit={createLead}>
        <h3>Skapa lead</h3>
        <input value={form.name} placeholder="Namn" onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input value={form.email} placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="lead">Lead</option>
          <option value="quote_sent">Quote sent</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
        <button type="submit">Spara</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Namn</th><th>Email</th><th>Status</th><th>Senast kontakt</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>{lead.name}</td>
              <td>{lead.email ?? '-'}</td>
              <td>
                <select value={lead.status} onChange={async (e) => { await api.updateLead(lead.id, { status: e.target.value as Lead['status'] }); load(); }}>
                  <option value="lead">lead</option>
                  <option value="quote_sent">quote_sent</option>
                  <option value="won">won</option>
                  <option value="lost">lost</option>
                </select>
              </td>
              <td>{lead.last_contact_at ? new Date(lead.last_contact_at).toLocaleString() : '-'}</td>
              <td><button onClick={async () => { await api.markContacted(lead.id); load(); }}>Mark contacted</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
