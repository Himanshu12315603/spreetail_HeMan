import React, { useState } from 'react';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { RAW_EXPENSES, ANOMALIES } from '../data/constants';
import { getAmountINR, calcShares, fmt, getInitials } from '../utils/finance';

const MONTH_LABELS = {
  '2026-02': 'February 2026',
  '2026-03': 'March 2026',
  '2026-04': 'April 2026',
  '2026-05': 'May 2026',
};

function ExpenseDetailModal({ exp, onClose }) {
  const amtINR  = getAmountINR(exp);
  const shares  = calcShares(exp);
  const hasAnom = exp.anomalies.filter(a => a !== 'DUPLICATE').length > 0;

  return (
    <Modal onClose={onClose} title={exp.desc}>
      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ color: 'var(--color-text-secondary)', padding: '5px 0' }}>Date</td>
            <td style={{ textAlign: 'right' }}>{exp.date}</td>
          </tr>
          <tr>
            <td style={{ color: 'var(--color-text-secondary)', padding: '5px 0' }}>Paid by</td>
            <td style={{ textAlign: 'right' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                <Avatar name={exp.paid_by || '?'} size={20} />
                {exp.paid_by || 'unknown'}
              </span>
            </td>
          </tr>
          <tr>
            <td style={{ color: 'var(--color-text-secondary)', padding: '5px 0' }}>Amount</td>
            <td style={{ textAlign: 'right' }}>
              {exp.currency === 'USD' ? `$${exp.amount} → ${fmt(amtINR)} @ ₹84` : fmt(amtINR)}
            </td>
          </tr>
          <tr>
            <td style={{ color: 'var(--color-text-secondary)', padding: '5px 0' }}>Split type</td>
            <td style={{ textAlign: 'right' }}>{exp.split_type}</td>
          </tr>
        </tbody>
      </table>

      {hasAnom && (
        <div
          style={{
            margin: '12px 0',
            padding: '8px 12px',
            background: 'var(--color-background-warning)',
            borderRadius: 'var(--border-radius-md)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-warning)', marginBottom: 4 }}>
            ⚠ Anomalies detected
          </div>
          {exp.anomalies
            .filter(a => a !== 'DUPLICATE')
            .map(a => {
              const an = ANOMALIES.find(x => x.id === a);
              return an ? (
                <div key={a} style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  {an.title}
                </div>
              ) : null;
            })}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <div className="section-title" style={{ marginBottom: 8 }}>Per-person breakdown</div>
        {Object.entries(shares).map(([p, s]) => {
          const paid = exp.paid_by === p;
          return (
            <div
              key={p}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 0',
                borderBottom: '0.5px solid var(--color-border-tertiary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={p} size={22} />
                <span style={{ fontSize: 13 }}>{p}</span>
                {paid && <Badge variant="info" style={{ fontSize: 10 }}>paid</Badge>}
              </div>
              <span style={{ fontSize: 13 }}>
                {fmt(s)}{' '}
                {paid && (
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                    ({fmt(amtINR - s)} net owed back)
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

function ExpenseRow({ exp, onClick }) {
  const amtINR  = getAmountINR(exp);
  const hasAnom = exp.anomalies.filter(a => a !== 'DUPLICATE').length > 0;

  return (
    <div className="expense-row" onClick={() => onClick(exp)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{exp.desc}</span>
          {hasAnom && (
            <Badge variant="warn" style={{ marginLeft: 6, fontSize: 10 }}>⚠</Badge>
          )}
          {exp.split_type === 'settlement' && (
            <Badge variant="info" style={{ marginLeft: 6, fontSize: 10 }}>settlement</Badge>
          )}
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', marginLeft: 8 }}>
          {exp.currency === 'USD' ? `$${Math.abs(exp.amount)} (${fmt(amtINR)})` : fmt(amtINR)}
        </span>
      </div>
      <div
        style={{
          fontSize: 12,
          color: 'var(--color-text-secondary)',
          marginTop: 3,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <span>paid by {exp.paid_by || '<unknown>'}</span>
        <span>·</span>
        <span>{exp.split_type}</span>
        <span>·</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {exp.members.map(m => (
            <span
              key={m}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                borderRadius: 20,
                fontSize: 12,
                background: 'var(--color-background-secondary)',
              }}
            >
              {getInitials(m)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ExpensesTab() {
  const [selectedExp, setSelectedExp] = useState(null);

  // Group by month (exclude duplicates)
  const grouped = {};
  RAW_EXPENSES.filter(e => !e.anomalies.includes('DUPLICATE')).forEach(e => {
    const mo = e.date.slice(0, 7);
    if (!grouped[mo]) grouped[mo] = [];
    grouped[mo].push(e);
  });

  return (
    <>
      {Object.entries(grouped).map(([mo, exps]) => (
        <div key={mo}>
          <div className="section-title" style={{ marginTop: 12 }}>
            {MONTH_LABELS[mo] || mo}
          </div>
          <div className="card" style={{ padding: '0 16px' }}>
            {exps.map(exp => (
              <ExpenseRow key={exp.id} exp={exp} onClick={setSelectedExp} />
            ))}
          </div>
        </div>
      ))}

      {selectedExp && (
        <ExpenseDetailModal exp={selectedExp} onClose={() => setSelectedExp(null)} />
      )}
    </>
  );
}
