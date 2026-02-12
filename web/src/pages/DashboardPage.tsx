import { useEffect, useState } from 'react';
import { api } from '../api';

export function DashboardPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getDashboard>> | null>(null);

  const load = async () => setData(await api.getDashboard());

  useEffect(() => {
    load();
  }, []);

  if (!data) return <p>Laddar dashboard...</p>;

  return (
    <section>
      <h2>Dashboard</h2>
      <div className="grid">
        <div className="card">
          <h3>Due now</h3>
          {data.dueNow.map((item) => (
            <p key={item.lead.id}>{item.lead.name} ({item.matchingRules.length} rules)</p>
          ))}
          {data.dueNow.length === 0 && <p>Inga due leads.</p>}
        </div>
        <div className="card">
          <h3>Recently sent (24h)</h3>
          {data.recentlySent.map((m) => (
            <p key={m.id}>{m.to_email} — {m.send_status}</p>
          ))}
          {data.recentlySent.length === 0 && <p>Inga skickade meddelanden.</p>}
        </div>
        <div className="card">
          <h3>Failed</h3>
          {data.failed.map((m) => (
            <p key={m.id}>{m.to_email} — {m.provider_response ?? 'failed'}</p>
          ))}
          {data.failed.length === 0 && <p>Inga failures.</p>}
        </div>
      </div>
    </section>
  );
}
