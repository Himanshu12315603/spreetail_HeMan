# AI_USAGE.md — AI Tool Usage Log

## Tools Used

| Tool | Role |
|---|---|
| **Antigravity (Google DeepMind)** | Primary development assistant — scaffolding, component generation, CSS authoring, data modelling |
| **ChatGPT (OpenAI GPT-4o)** | Secondary reference — cross-checking financial algorithm logic |

---

## Key Prompts

### Prompt 1 — Initial React migration

> *"Convert this vanilla HTML/CSS/JS expense-splitting webapp to React. The app has four tabs (Balances, Expenses, Import report, Settle up), modals, and business logic for calculating group balances and minimum settlements."*

This kicked off the full project scaffold: Vite setup, component decomposition, CSS design system, and all four tab components in a single session.

---

### Prompt 2 — Data separation

> *"Separate the raw expense data and anomaly metadata from the business logic (calcBalances, calcShares, minimizeTransactions) and from the React components. I want three clear layers: data, utils, UI."*

This produced `src/data/constants.js` and `src/utils/finance.js` as pure JS modules with no React imports, keeping the logic independently testable.

---

### Prompt 3 — Documentation suite

> *"Generate README.md, SCOPE.md (anomaly log + database schema), DECISIONS.md (decision log), and AI_USAGE.md for this project. Be specific — use the actual anomaly IDs, decisions, and data from the codebase."*

---

## Three Concrete Cases Where AI Was Wrong

### Case 1 — Incorrect balance direction for settlements

**What AI produced:**
```js
// AI's original settlement logic
bal[s.from] += s.amount;   // ← WRONG
bal[s.to]   -= s.amount;   // ← WRONG
```

The AI flipped the direction. It added money to the *payer's* balance (as if they received it) and subtracted from the *receiver's* balance.

**How I caught it:**  
After running the app, Rohan's balance *improved* by ₹5,000 when it should have *worsened* (he paid money out). Aisha's balance *fell* when she should have received it. The numbers moved in the wrong direction.

**What I changed:**
```js
// Corrected logic
bal[s.from] -= s.amount;   // payer's balance decreases (they gave money)
bal[s.to]   += s.amount;   // receiver's balance increases (they got money)
```

---

### Case 2 — Percentage normalisation applied to wrong denominator

**What AI produced for PCT_NOT_100 handling:**
```js
// AI normalised by dividing by 100, not by the actual total
exp.members.forEach(m => {
  r[m] = (exp.shares[m] / 100) * amtINR;  // ← assumes sum is always 100
});
```

For "Pizza Friday" and "Weekend brunch", the percentages summed to **110**, not 100. Dividing by 100 still allocated 110% of the expense, overstating the total charged.

**How I caught it:**  
Spot-checking: Pizza Friday is ₹1,440. With the AI's code, the four members' shares summed to ₹1,584 (110% of ₹1,440) — ₹144 more than the actual expense.

**What I changed:**
```js
// Correct: divide by the actual sum, not assumed 100
const total = Object.values(exp.shares).reduce((a, b) => a + b, 0);
exp.members.forEach(m => {
  r[m] = ((exp.shares[m] ?? 0) / total) * amtINR;
});
```
This correctly normalises any total (110, 97, etc.) to always distribute exactly `amtINR`.

---

### Case 3 — `DUPLICATE` expenses appearing in the Expenses tab

**What AI produced:**  
The Expenses tab filter was:
```js
RAW_EXPENSES.filter(e => e.anomalies.length === 0)
```

This excluded *all* anomalous rows — including rows like "Electricity Feb" (which has `COMMA_AMOUNT` but is perfectly valid to display) and "Parasailing" (which has `USD` and `GUEST_MEMBER` but is a real expense).

**How I caught it:**  
The Expenses tab showed only 17 of 41 rows. Many legitimate expenses (the entire Goa trip, several flagged but valid February expenses) were invisible.

**What I changed:**  
The filter was changed to only exclude rows where the *primary* anomaly is `DUPLICATE` — i.e. rows that are truly redundant duplicates of another kept row:
```js
RAW_EXPENSES.filter(e => !e.anomalies.includes('DUPLICATE'))
```
Flagged-but-valid expenses now appear in the list with a `⚠` badge, letting users see and click into them to review the anomaly detail.

---

## General Observations

- The AI was excellent at boilerplate (Vite config, CSS reset, component shells) but made semantic mistakes in financial logic that required careful numerical verification.
- Every financial output (per-person balance, settlement amounts, individual expense shares) was cross-checked manually against hand calculations before the code was accepted.
- The AI tended to write overly defensive code in some places (unnecessary null-checks) while missing actual edge cases (negative amounts, zero amounts, settlement direction).
