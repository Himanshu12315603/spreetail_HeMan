import React, { useState } from 'react';
import BalancesTab from './tabs/BalancesTab';
import ExpensesTab from './tabs/ExpensesTab';
import ImportTab   from './tabs/ImportTab';
import SettleTab   from './tabs/SettleTab';
import AddExpenseModal from './components/AddExpenseModal';
import { ANOMALIES } from './data/constants';
import './App.css';

const TABS = [
  { id: 'balances',  label: 'Balances' },
  { id: 'expenses',  label: 'Expenses' },
  { id: 'import',    label: 'Import report' },
  { id: 'settle',    label: 'Settle up' },
];

export default function App() {
  const [activeTab, setActiveTab]         = useState('balances');
  const [showAddExpense, setShowAddExpense] = useState(false);

  const errorCount = ANOMALIES.length;

  const tabContent = {
    balances: <BalancesTab />,
    expenses: <ExpensesTab />,
    import:   <ImportTab />,
    settle:   <SettleTab />,
  };

  return (
    <div className="app" style={{ position: 'relative' }}>
      {/* Top bar */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🏠</span>
          <h1 style={{ fontSize: 16, fontWeight: 500 }}>Flatmates</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>4 members active</span>
          <button
            className="secondary"
            style={{ fontSize: 12, padding: '5px 10px' }}
            onClick={() => setShowAddExpense(true)}
          >
            + Add expense
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
            {t.id === 'import' && (
              <span
                style={{
                  display: 'inline-block',
                  padding: '1px 7px',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: 10,
                  fontWeight: 600,
                  background: 'var(--color-background-danger)',
                  color: 'var(--color-text-danger)',
                  marginLeft: 5,
                }}
              >
                {errorCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Page content */}
      <div className="content">{tabContent[activeTab]}</div>

      {/* Add expense modal */}
      {showAddExpense && <AddExpenseModal onClose={() => setShowAddExpense(false)} />}
    </div>
  );
}
