# SCOPE.md — Anomaly Log & Database Schema

## 1. Anomaly Log

Every data problem found in the raw CSV (41 expense rows) and how it was handled.

---

### 🔴 Errors — Required Manual Decision

| # | Anomaly ID | Affected Row(s) | Description | Resolution |
|---|---|---|---|---|
| 1 | `DUPLICATE` | Row 4 (Marina Bites, Feb 8) | Two identical rows: same date, payer (Dev), amount (₹3,200), description. | Kept first occurrence (row 4). Flagged second as duplicate; excluded from balance calculations and expense list. Awaiting group approval to delete permanently. |
| 2 | `UNKNOWN_PAYER` | Row 9 (Groceries DMart, Feb 18) | `paid_by` field contains "Priya S" — not a recognised member name. | Fuzzy-matched to "Priya" (only member whose name starts with "Priya"). Flagged for confirmation. Included in balances as Priya. |
| 3 | `MISSING_PAYER` | Row 11 (House cleaning supplies, Feb 22) | `paid_by` field is blank. Cannot determine creditor. | Imported with `paid_by = null`. Excluded from all balance calculations until resolved. Shows as `<unknown>` in the UI. |
| 4 | `SETTLEMENT_AS_EXPENSE` | Row 12 (Rohan paid Aisha back) & Row 35 (Sam deposit share) | Payments between members logged as group expenses instead of settlements. Treating them as expenses would double-count the money. | Re-classified as settlement transactions. Applied directly to balances: Rohan −₹5,000 / Aisha +₹5,000 and Sam −₹15,000 / Aisha +₹15,000. Not included in the expense list totals. |
| 5 | `DUPLICATE_CONFLICT` | Rows 22 & 23 (Thalassa dinner, Mar 11) | Two entries for the same dinner: Aisha paid ₹2,400 vs. Rohan paid ₹2,450 — different amounts *and* payers. Cannot auto-resolve. | Kept Rohan's entry (₹2,450) based on note in the data row. Flagged Aisha's as a conflicting duplicate. Excluded Aisha's entry from calculations. |

---

### 🟡 Warnings — Auto-Resolved

| # | Anomaly ID | Affected Row(s) | Description | Resolution |
|---|---|---|---|---|
| 6 | `COMMA_AMOUNT` | Row 5 (Electricity Feb) | Amount stored as `"1,200"` — a string with a thousands separator, not a number. Some parsers treat this as 1 or throw an error. | Stripped the comma programmatically; parsed as number `1200`. |
| 7 | `CASE_NAME` | Row 7 (Movie night snacks) | `paid_by = "priya"` (lowercase) does not match canonical `"Priya"`. | Case-insensitive lookup matched to "Priya". |
| 8 | `EXCESS_PRECISION` | Row 8 (Cylinder refill) | Amount `899.995` — sub-paisa precision (≈ 3 decimal places). Indian currency has no sub-paisa denomination. | Rounded to ₹900 using `Math.round()`. |
| 9 | `PCT_NOT_100` | Rows 13 & 30 (Pizza Friday, Weekend brunch) | Percentage splits sum to 110%, not 100% (30+30+30+20 = 110). | Normalised: each share divided by the total (110) then multiplied by 100 to produce valid percentages. Proportional intent preserved. |
| 10 | `USD` | Rows 18, 19, 21, 24 (Goa trip) | Amounts in USD. INR-only parser would silently misread these as INR, overstating costs by ×84. | Converted at hardcoded rate ₹84 / USD (specified in the dataset). Rate is a named constant `USD_TO_INR` so it can be changed in one place. |
| 11 | `GUEST_MEMBER` | Row 21 (Parasailing) | "Kabir" (Dev's friend) appears in the split but is not a flat member. | Kabir's share reassigned to Dev (who invited the guest). Kabir not shown in member balances. |
| 12 | `NEGATIVE` | Row 24 (Parasailing refund, −$30) | Negative amount. Could be a data-entry error or a legitimate refund. | Treated as a refund: negative expense reduces each member's share proportionally, correctly reducing the net amount owed. |
| 13 | `DATE_FORMAT` | Row 25 (Airport cab) | Date stored as `"Mar-14"` — no year, non-ISO format. | Parsed as `2026-03-14` (year inferred from surrounding rows; month-day pattern applied). |
| 14 | `MISSING_CURRENCY` | Row 26 (Groceries DMart, Mar 15) | Currency field blank. | Defaulted to `INR`. Flag retained for visibility. |
| 15 | `ZERO_AMOUNT` | Row 29 (Dinner order Swiggy) | Amount is ₹0. Note indicates it was "counted twice earlier" — a voiding entry. | Imported but excluded from balance calculations (zero financial impact). |
| 16 | `STALE_MEMBER` | Row 33 (Groceries BigBasket, Apr 2) | Meera listed in an April split after she moved out at end of March. | Removed Meera from the split. Her share redistributed equally among the remaining April members (Aisha, Rohan, Priya). |
| 17 | `AMBIGUOUS_DATE` | Row 41 (Deep cleaning service) | Date `"04-05-2026"` is ambiguous: could be April 5 (MM-DD) or May 4 (DD-MM). | Treated as **May 4, 2026** (DD-MM convention, consistent with rest of file). Sam excluded from split as he was not a resident in May. |
| 18 | `CONFLICTING_SPLIT` | Row 39 (Furniture for common room) | `split_type = "equal"` but explicit per-member shares are also provided (all `1`). Contradictory metadata. | Equal split applied (4 members, ₹3,000 each). Share values happen to imply the same result, so no material difference. Documented for auditability. |

---

## 2. Database Schema

The schema below describes how this data would be persisted in a relational database (PostgreSQL).

```sql
-- Members of the flat
CREATE TABLE members (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,          -- canonical name, e.g. "Aisha"
  color       CHAR(7) NOT NULL,              -- hex colour for avatar
  bg_color    CHAR(7) NOT NULL,
  joined_at   DATE NOT NULL,
  left_at     DATE                           -- NULL = still active
);

-- Every expense or settlement row
CREATE TABLE expenses (
  id              SERIAL PRIMARY KEY,
  date            DATE NOT NULL,
  description     TEXT NOT NULL,
  paid_by         INT REFERENCES members(id), -- NULL if payer unknown
  amount_raw      NUMERIC(12, 4) NOT NULL,    -- original amount (may be negative)
  amount_inr      NUMERIC(12, 2) NOT NULL,    -- normalised to INR
  currency        CHAR(3) NOT NULL DEFAULT 'INR',
  split_type      TEXT NOT NULL               -- equal | unequal | percentage | share | settlement
                  CHECK (split_type IN ('equal','unequal','percentage','share','settlement')),
  is_excluded     BOOLEAN NOT NULL DEFAULT FALSE,  -- TRUE for zero-amount, duplicate, etc.
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Per-person share of each expense
CREATE TABLE expense_shares (
  id          SERIAL PRIMARY KEY,
  expense_id  INT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  member_id   INT NOT NULL REFERENCES members(id),
  share_value NUMERIC(12, 2) NOT NULL,     -- INR amount owed by this member
  UNIQUE (expense_id, member_id)
);

-- Anomalies detected during import
CREATE TABLE import_anomalies (
  id          SERIAL PRIMARY KEY,
  expense_id  INT REFERENCES expenses(id) ON DELETE CASCADE,
  anomaly_type TEXT NOT NULL,              -- e.g. 'DUPLICATE', 'MISSING_PAYER'
  severity    TEXT NOT NULL CHECK (severity IN ('error', 'warn')),
  description TEXT NOT NULL,
  resolution  TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recorded settlements (money transferred between members)
CREATE TABLE settlements (
  id          SERIAL PRIMARY KEY,
  from_member INT NOT NULL REFERENCES members(id),
  to_member   INT NOT NULL REFERENCES members(id),
  amount_inr  NUMERIC(12, 2) NOT NULL,
  settled_at  DATE NOT NULL,
  note        TEXT,
  CHECK (from_member <> to_member)
);
```

### Design Notes

- `amount_raw` stores the original value (useful for audit); `amount_inr` stores the normalised working value.
- `is_excluded = TRUE` flags rows that are imported but have zero financial impact (zero amounts, unresolved missing-payer rows).
- `import_anomalies` is separate from `expenses` so one expense can carry multiple anomaly tags.
- Settlements are a first-class table, not mixed into expenses, because they affect balances differently (direct transfer, no split calculation needed).
