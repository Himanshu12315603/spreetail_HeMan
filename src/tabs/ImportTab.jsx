import React from 'react';
import { ANOMALIES, RAW_EXPENSES } from '../data/constants';

function AnomalyItem({ a }) {
  const isError = a.severity === 'error';
  return (
    <div
      style={{
        padding: '10px 12px',
        borderLeft: `3px solid ${isError ? 'var(--color-border-danger)' : 'var(--color-border-warning)'}`,
        background: isError ? 'var(--color-background-danger)' : 'var(--color-background-warning)',
        borderRadius: '0 var(--border-radius-md) var(--border-radius-md) 0',
        marginBottom: 8,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 2,
          color: isError ? 'var(--color-text-danger)' : 'var(--color-text-warning)',
        }}
      >
        {a.title}
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{a.desc}</div>
      <div
        style={{
          fontSize: 11,
          marginTop: 4,
          color: isError ? 'var(--color-text-danger)' : 'var(--color-text-warning)',
        }}
      >
        Action: {a.action}
      </div>
    </div>
  );
}

export default function ImportTab() {
  const errors = ANOMALIES.filter(a => a.severity === 'error');
  const warns  = ANOMALIES.filter(a => a.severity === 'warn');
  const total  = RAW_EXPENSES.length + 2; // two extra rows in original CSV

  return (
    <>
      <div className="metric-row">
        <div className="metric">
          <div className="metric-label">Total rows</div>
          <div className="metric-value">43</div>
        </div>
        <div className="metric">
          <div className="metric-label">Errors</div>
          <div className="metric-value" style={{ color: 'var(--color-text-danger)' }}>{errors.length}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Warnings</div>
          <div className="metric-value" style={{ color: 'var(--color-text-warning)' }}>{warns.length}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Imported</div>
          <div className="metric-value" style={{ color: 'var(--color-text-success)' }}>41</div>
        </div>
      </div>

      <div className="section-title">Errors — require action</div>
      {errors.map(a => <AnomalyItem key={a.id} a={a} />)}

      <div className="section-title" style={{ marginTop: 16 }}>Warnings — auto-resolved</div>
      {warns.map(a => <AnomalyItem key={a.id} a={a} />)}
    </>
  );
}
