import React from 'react';

const VARIANT_MAP = {
  warn:    { bg: 'var(--color-background-warning)', color: 'var(--color-text-warning)' },
  error:   { bg: 'var(--color-background-danger)',  color: 'var(--color-text-danger)'  },
  success: { bg: 'var(--color-background-success)', color: 'var(--color-text-success)' },
  info:    { bg: 'var(--color-background-info)',    color: 'var(--color-text-info)'    },
};

export default function Badge({ variant = 'info', children, style }) {
  const { bg, color } = VARIANT_MAP[variant] || VARIANT_MAP.info;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 'var(--border-radius-md)',
        fontSize: 11,
        fontWeight: 500,
        background: bg,
        color,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
