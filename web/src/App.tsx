import { useState } from 'react';
import { LeadsPage } from './pages/LeadsPage';
import { RulesPage } from './pages/RulesPage';
import { DashboardPage } from './pages/DashboardPage';

type Tab = 'leads' | 'rules' | 'dashboard';

export function App() {
  const [tab, setTab] = useState<Tab>('dashboard');

  return (
    <div className="container">
      <header>
        <h1>AI Follow-Up Engine</h1>
        <nav>
          {(['dashboard', 'leads', 'rules'] as Tab[]).map((t) => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>
      </header>
      <main>{tab === 'leads' ? <LeadsPage /> : tab === 'rules' ? <RulesPage /> : <DashboardPage />}</main>
    </div>
  );
}
