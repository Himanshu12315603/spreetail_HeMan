# 🏠 Flatmates — Group Expense Splitter

A clean, production-quality web app for tracking shared flat expenses, detecting data anomalies in imported CSVs, calculating net balances, and generating minimum-payment settlement plans.

---

## Live Demo

> [https://spreetail.vercel.app](https://spreetail.vercel.app) *(replace with your deployed URL)*

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 (via Vite 6) |
| Styling | Vanilla CSS with CSS custom properties (design tokens) |
| Build tool | Vite |
| Font | Inter (Google Fonts) |
| Deployment | Vercel |

No UI component library was used. Every component (`Avatar`, `Badge`, `Modal`, tabs) was written from scratch.

---

## Local Setup

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/spreetail.git
cd spreetail

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app will be available at **http://localhost:5173**.

### Build for production

```bash
npm run build       # outputs to dist/
npm run preview     # preview the production build locally
```

---

## Project Structure

```
src/
├── data/
│   └── constants.js          # All raw data: MEMBERS, RAW_EXPENSES, ANOMALIES
├── utils/
│   └── finance.js            # Pure JS: calcBalances, calcShares, minimizeTransactions
├── components/
│   ├── Avatar.jsx            # Coloured member avatar
│   ├── Badge.jsx             # Severity badge (error / warn / info / success)
│   ├── Modal.jsx             # Generic modal shell
│   └── AddExpenseModal.jsx   # Add-expense form modal
├── tabs/
│   ├── BalancesTab.jsx       # Net balance + simplified settlement view
│   ├── ExpensesTab.jsx       # Monthly expense list with detail modal
│   ├── ImportTab.jsx         # Anomaly report (errors + warnings)
│   └── SettleTab.jsx         # Minimum payment plan + Mark Paid
├── App.jsx                   # Root: navigation, topbar, modal state
└── App.css                   # Full design system (tokens, layout, animations)
```

---

## AI Tools Used

See [AI_USAGE.md](./AI_USAGE.md) for a detailed account of all AI assistance, key prompts, and cases where AI output was wrong and had to be corrected.

The primary AI tool used was **Antigravity (Google DeepMind)** — an agentic coding assistant — which was used for scaffolding, component generation, and CSS authoring.
