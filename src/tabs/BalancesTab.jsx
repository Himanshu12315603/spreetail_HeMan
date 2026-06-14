import React from 'react';
import Avatar from '../components/Avatar';
import { MEMBERS } from '../data/constants';
import { calcBalances, minimizeTransactions, fmt, totalGroupSpend } from '../utils/finance';
import { USD_TO_INR } from '../data/constants';

export default function BalancesTab() {
  const bal = calcBalances();
  const txns = minimizeTransactions(bal);

  return (
    <>
      {/* Metrics */}
      <div className="metric-row">
        <div className="metric">
          <div className="metric-label">Total group spend</div>
          <div className="metric-value">{fmt(totalGroupSpend())}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Transactions to settle</div>
          <div className="metric-value">{txns.length}</div>
        </div>
        <div className="metric">
          <div className="metric-label">USD converted at</div>
          <div className="metric-value" style={{ fontSize: 18 }}>₹{USD_TO_INR}/USD</div>
        </div>
      </div>

      {/* Net balance per person */}
      <div className="card">
        <div className="section-title">Net balance per person</div>
        {Object.entries(bal)
          .filter(([p]) => MEMBERS[p])
          .map(([person, b]) => {
            const rounded = Math.round(b);
            return (
              <div className="row" key={person}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={person} />
                  <span style={{ fontSize: 14 }}>{person}</span>
                </div>
                <div>
                  <span className={rounded >= 0 ? 'owe-pos' : 'owe-neg'}>
                    {rounded >= 0 ? '+' : '-'}{fmt(rounded)}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginLeft: 6 }}>
                    {rounded >= 0 ? 'gets back' : 'owes'}
                  </span>
                </div>
              </div>
            );
          })}
      </div>

      {/* Simplified settlements */}
      <div className="card">
        <div className="section-title">Who pays whom (simplified)</div>
        {txns.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>All settled up! 🎉</p>
        ) : (
          txns.map((t, i) => (
            <div className="row" key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={t.from} size={24} />
                <span style={{ fontSize: 13 }}>{t.from}</span>
                <span className="settlement-arrow">→</span>
                <Avatar name={t.to} size={24} />
                <span style={{ fontSize: 13 }}>{t.to}</span>
              </div>
              <strong style={{ color: 'var(--color-text-danger)' }}>{fmt(t.amount)}</strong>
            </div>
          ))
        )}
      </div>
    </>
  );
}
