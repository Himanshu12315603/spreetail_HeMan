import React, { useState } from 'react';
import Modal from './Modal';
import { MEMBERS } from '../data/constants';

export default function AddExpenseModal({ onClose }) {
  const [form, setForm] = useState({
    desc: '',
    amount: '',
    currency: 'INR',
    paid_by: Object.keys(MEMBERS)[0],
    split_type: 'equal',
  });

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSave() {
    // In a full app this would mutate state / call an API
    alert(`Expense saved!\n\n"${form.desc}" – ${form.currency} ${form.amount}\nPaid by ${form.paid_by}, split ${form.split_type}`);
    onClose();
  }

  return (
    <Modal onClose={onClose} title="Add expense">
      <div className="form-row">
        <label>Description</label>
        <input
          type="text"
          name="desc"
          placeholder="e.g. Groceries"
          value={form.desc}
          onChange={handleChange}
        />
      </div>
      <div className="form-row">
        <label>Amount</label>
        <input
          type="number"
          name="amount"
          placeholder="0"
          value={form.amount}
          onChange={handleChange}
        />
      </div>
      <div className="form-row">
        <label>Currency</label>
        <select name="currency" value={form.currency} onChange={handleChange}>
          <option value="INR">INR</option>
          <option value="USD">USD</option>
        </select>
      </div>
      <div className="form-row">
        <label>Paid by</label>
        <select name="paid_by" value={form.paid_by} onChange={handleChange}>
          {Object.keys(MEMBERS).map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label>Split type</label>
        <select name="split_type" value={form.split_type} onChange={handleChange}>
          <option value="equal">equal</option>
          <option value="unequal">unequal</option>
          <option value="percentage">percentage</option>
          <option value="share">share</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button className="primary" onClick={handleSave}>Save expense</button>
        <button className="secondary" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}
