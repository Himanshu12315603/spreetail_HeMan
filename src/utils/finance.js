import { MEMBERS, RAW_EXPENSES, USD_TO_INR } from '../data/constants';

export function getAmountINR(exp) {
  if (exp.currency === 'USD') return exp.amountINR ?? exp.amount * USD_TO_INR;
  return exp.amount;
}

export function calcShares(exp) {
  const amtINR = getAmountINR(exp);
  if (exp.split_type === 'settlement') return {};
  if (exp.split_type === 'equal') {
    const share = amtINR / exp.members.length;
    return Object.fromEntries(exp.members.map(m => [m, share]));
  }
  if (exp.split_type === 'unequal' || exp.split_type === 'share') {
    const total = Object.values(exp.shares || {}).reduce((a, b) => a + b, 0);
    return Object.fromEntries(exp.members.map(m => [m, ((exp.shares?.[m] ?? 0) / total) * amtINR]));
  }
  if (exp.split_type === 'percentage') {
    const total = Object.values(exp.shares || {}).reduce((a, b) => a + b, 0);
    return Object.fromEntries(exp.members.map(m => [m, ((exp.shares?.[m] ?? 0) / total) * amtINR]));
  }
  return {};
}

export function calcBalances() {
  const bal = {};
  Object.keys(MEMBERS).forEach(m => (bal[m] = 0));
  bal['Kabir'] = 0;

  const valid = RAW_EXPENSES.filter(
    e =>
      !e.anomalies.includes('DUPLICATE') &&
      e.amount !== 0 &&
      e.paid_by !== null &&
      e.split_type !== 'settlement',
  );

  valid.forEach(exp => {
    const shares = calcShares(exp);
    const payer = exp.paid_by;
    const amtINR = getAmountINR(exp);
    if (bal[payer] === undefined) bal[payer] = 0;
    bal[payer] += amtINR;
    Object.entries(shares).forEach(([person, share]) => {
      if (bal[person] === undefined) bal[person] = 0;
      bal[person] -= share;
    });
  });

  // Apply settlements
  const settlements = [
    { from: 'Rohan', to: 'Aisha', amount: 5000 },
    { from: 'Sam',   to: 'Aisha', amount: 15000 },
  ];
  settlements.forEach(s => {
    bal[s.from] -= s.amount;
    bal[s.to]   += s.amount;
  });

  return bal;
}

export function minimizeTransactions(bal) {
  const creditors = [];
  const debtors = [];
  Object.entries(bal).forEach(([p, b]) => {
    if (b > 0.5) creditors.push({ p, b });
    else if (b < -0.5) debtors.push({ p, b: -b });
  });
  creditors.sort((a, b) => b.b - a.b);
  debtors.sort((a, b) => b.b - a.b);

  const txns = [];
  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const amt = Math.min(creditors[i].b, debtors[j].b);
    txns.push({ from: debtors[j].p, to: creditors[i].p, amount: Math.round(amt) });
    creditors[i].b -= amt;
    debtors[j].b   -= amt;
    if (creditors[i].b < 0.5) i++;
    if (debtors[j].b  < 0.5) j++;
  }
  return txns;
}

export function fmt(n) {
  return '₹' + Math.abs(Math.round(n)).toLocaleString('en-IN');
}

export function getInitials(name) {
  return (name || '?').slice(0, 2).toUpperCase();
}

export function totalGroupSpend() {
  return RAW_EXPENSES.filter(
    e => !e.anomalies.includes('DUPLICATE') && e.split_type !== 'settlement' && e.amount > 0,
  ).reduce((a, e) => a + getAmountINR(e), 0);
}
