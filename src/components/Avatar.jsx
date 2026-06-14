import React from 'react';
import { MEMBERS } from '../data/constants';
import { getInitials } from '../utils/finance';

export default function Avatar({ name, size = 28 }) {
  const m = MEMBERS[name] || { color: '#888', bg: '#eee' };
  const fontSize = size < 30 ? 11 : 13;
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        fontWeight: 500,
        flexShrink: 0,
        background: m.bg,
        color: m.color,
        userSelect: 'none',
      }}
    >
      {getInitials(name)}
    </span>
  );
}
