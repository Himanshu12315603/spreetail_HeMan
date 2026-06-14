import React from 'react';
import Avatar from '../components/Avatar';
import { MEMBERS, RAW_EXPENSES } from '../data/constants';
import { calcBalances, minimizeTransactions, fmt } from '../utils/finance';

export default function SettleTab() {
  const bal  = calcBalances();
  const txns = minimizeTransactions(bal);

  function recordSettlement(from, to, amount) {
    alert(`Recorded: ${from} paid ${to} ₹${amount.toLocaleString('en-IN')}.\nIn a full app this would create a settlement record.`);
  }

  return (
    <>
      <div className="card">
        <div className="section-title">Minimum payments to settle all debts</div>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 14 }}>
          {txns.length === 0
            ? 'Nothing to do — everyone is square.'
            : `These ${txns.length} transfer${txns.length !== 1 ? 's' : ''} clear all balances.`}
        </p>

        {txns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-secondary)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
            All debts are settled!
          </div>
        ) : (
          txns.map((t, i) => (
            <div className="row" key={i}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar name={t.from} size={24} />
                  <strong>{t.from}</strong>
                  <span style={{ color: 'var(--color-text-secondary)' }}>pays</span>
                  <Avatar name={t.to} size={24} />
                  <strong>{t.to}</strong>
                </div>
                <div className="detail-line">Tap to record this payment</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-danger)' }}>
                  {fmt(t.amount)}
                </div>
                <button
                  className="secondary"
                  style={{ fontSize: 11, padding: '4px 10px', marginTop: 4 }}
                  onClick={() => recordSettlement(t.from, t.to, t.amount)}
                >
                  Mark paid
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <div className="section-title">Breakdown by person</div>
        {Object.entries(bal)
          .filter(([p]) => MEMBERS[p])
          .map(([person, b]) => {
            const rounded = Math.round(b);
            const relevant = RAW_EXPENSES.filter(
              e =>
                !e.anomalies.includes('DUPLICATE') &&
                e.split_type !== 'settlement' &&
                e.amount > 0 &&
                (e.paid_by === person || e.members.includes(person)),
            );
            return (
              <div className="row" key={person}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar name={person} size={24} />
                    <span>{person}</span>
                  </div>
                  <div className="detail-line">{relevant.length} expenses</div>
                </div>
                <span className={rounded >= 0 ? 'owe-pos' : 'owe-neg'}>
                  {rounded >= 0 ? '+' : ''}{fmt(rounded)}
                </span>
              </div>
            );
          })}
      </div>
    </>
  );
}
