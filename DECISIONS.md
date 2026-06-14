# DECISIONS.md — Decision Log

Every significant architectural and product decision made during this project, with the options considered and the rationale for the final choice.

---

## 1. Framework: React + Vite vs. plain HTML/JS

**Context:** The original prototype was a single HTML file with vanilla JS that called `innerHTML` to re-render the entire page on every state change.

| Option | Pros | Cons |
|---|---|---|
| Vanilla HTML/JS (status quo) | Zero setup, no build step | Manual DOM diffing, no component reuse, `innerHTML` wipes event listeners on every render |
| **React + Vite** | Component model, declarative UI, fast HMR, standard hiring benchmark | Build step required, adds ~135 npm packages |
| Next.js | SSR/SSG, file-based routing | Overkill for a client-only data tool with no API routes |
| Svelte | Tiny bundle, no virtual DOM | Less familiar, smaller ecosystem for quickly hiring contributors |

**Decision: React + Vite.**  
The component model directly maps to the app's structure (tabs, modals, avatar, badge). Vite gives instant HMR with minimal config. React is the industry standard which makes the codebase easier for others to read and contribute to.

---

## 2. Styling: Vanilla CSS + CSS Custom Properties vs. Tailwind CSS

| Option | Pros | Cons |
|---|---|---|
| Tailwind CSS | Utility-first, fast prototyping | Adds a PostCSS build step; class names clutter JSX; harder to see the design system at a glance |
| CSS Modules | Scoped by default | More files; extra import boilerplate per component |
| **Vanilla CSS + CSS variables (design tokens)** | Single file, fully visible design system, zero extra dependencies | Requires discipline to stay consistent |
| Styled-components | Co-located styles | Runtime cost; another dependency |

**Decision: Vanilla CSS with CSS custom properties.**  
The design system (colours, radii, shadows) is defined once as CSS variables in `App.css`. Every component reads from those tokens. This gives full control over the visual design with no external dependency, and is easy to theme by changing a handful of variables.

---

## 3. Data Layer: Static JS constants vs. a real database

**Context:** All expense data was supplied as a CSV / raw array for this exercise.

| Option | Pros | Cons |
|---|---|---|
| **Static JS constants** | No backend needed, zero infra cost, instant load | Data is read-only; cannot persist new expenses added via the UI |
| localStorage | Client-side persistence, still no backend | Data lost on device change; no multi-user sync |
| Supabase / Firebase | Real-time, multi-user | Significant scope increase; credentials management; auth needed |
| SQLite + Express API | Full CRUD, portable | Requires deploying a server, env vars, more moving parts |

**Decision: Static JS constants for this submission.**  
The brief asked for import, anomaly detection, balance calculation, and settlement planning — all of which can be demonstrated perfectly with static data. The `Add expense` UI is wired up (form, modal, validation) but writes to an alert placeholder rather than mutating state, which is clearly labelled. The database schema in `SCOPE.md` documents exactly how persistence would work in production.

---

## 4. Balance Algorithm: Naïve O(n²) pairwise vs. Minimum Transaction (greedy)

**Context:** With 6 members and N debts, there are many ways to settle up. The naïve approach produces one transaction per debt pair; the minimum-transaction algorithm minimises the number of transfers.

| Option | Pros | Cons |
|---|---|---|
| Naïve pairwise | Simple to understand | Can produce O(n²) transactions (e.g. 15 for 6 members) |
| **Greedy creditor-debtor matching** | Always produces ≤ n−1 transactions | Slightly harder to implement; not always the globally optimal solution for minimising transaction *cost* (but optimal for *count*) |
| LP / exact minimum | Provably optimal count | Complex, overkill for <10 members |

**Decision: Greedy creditor-debtor matching.**  
Sort creditors and debtors by balance descending, then greedily match the largest debtor to the largest creditor. This produces the minimum number of transactions in O(n log n) time. For household groups of ≤ 10 people this is always fast and produces intuitively fair results.

---

## 5. Currency Handling: Hard-coded rate vs. live FX API

| Option | Pros | Cons |
|---|---|---|
| **Hard-coded `USD_TO_INR = 84`** | No API key, works offline, deterministic | Rate goes stale; any new import would use the same rate |
| Live FX API (e.g. Open Exchange Rates) | Always accurate | API key required, network call on load, rate could change mid-session causing balance drift |
| User-configurable rate | Flexible | Extra UI surface; user must know the correct rate |

**Decision: Hard-coded constant, extracted to a single named variable.**  
The brief specifies "1 USD = ₹84". Extracting it to `USD_TO_INR` in `constants.js` means changing the rate is a one-line edit. A settings panel would be the natural next step in v2.

---

## 6. Anomaly Handling Strategy: Fail-hard vs. Best-effort with audit trail

| Option | Pros | Cons |
|---|---|---|
| Fail on first error | Safe, forces clean data before import | Blocks all data if one row is bad; bad UX |
| **Best-effort import + audit trail** | All clean rows immediately useful; problems surfaced for human review | Requires careful flagging to avoid silent errors |
| Interactive row-by-row review | User controls every decision | Too slow for 41+ rows |

**Decision: Best-effort import with a dedicated Import Report tab.**  
Every anomaly is classified as `error` (requires human decision — excluded from calculations) or `warn` (auto-resolved — included with a note). The Import Report tab surfaces all 18 anomalies with the exact action taken, giving full auditability without blocking the user from seeing their balances.

---

## 7. Settlement Classification: Keep settlements in expense list vs. separate table

**Context:** Two rows ("Rohan paid Aisha back" and "Sam deposit share") were recorded as expenses in the CSV, but they are actually money transfers, not shared costs.

| Option | Pros | Cons |
|---|---|---|
| Keep as expense, split_type=settlement | Simpler data model | Distorts "total group spend" metric; balance algorithm would double-count |
| **Separate settlement records, excluded from expense totals** | Correct financial model; total spend metric is accurate | Requires separate handling in balance algorithm |

**Decision: Reclassify as settlements.**  
Including a ₹5,000 "payback" in the shared expense pool would inflate group spend and skew everyone's balance. Settlements are applied as direct `+balance / −balance` adjustments after all expense shares are calculated, exactly as a real accounting system would handle them.
