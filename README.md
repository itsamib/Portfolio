# Portfolio Performance Tracker

A Next.js 14 + Flask app for tracking portfolio equity, daily/cumulative
profit, and ROI across multiple accounts. All calculations run in a Python
serverless function; all data lives in the browser's `localStorage` — there
is no database and no separate backend to host.

## Stack

- **Frontend:** Next.js 14 (App Router, TypeScript), Tailwind CSS, Recharts, lucide-react
- **Backend:** Python (Flask) serverless function at `api/index.py`, using pandas for calculations
- **Storage:** Browser `localStorage` (accounts + records), synced via React Context
- **Hosting:** Vercel (single deployment, no separate server)

## Project structure

```
app/                       Next.js App Router pages
  page.tsx                 Master dashboard
  data-entry/page.tsx      Add/delete records
  accounts/page.tsx        Manage accounts
  accounts/[id]/page.tsx   Per-account dashboard
components/                Sidebar, MetricCard, DataTable, charts/
context/DataContext.tsx    localStorage-backed state (accounts, records)
lib/                       Shared types + API helper
api/index.py               Flask calculation endpoint (POST /api/calculate)
api/requirements.txt       flask, pandas, numpy
vercel.json                Combines the Next.js build with the Python function
```

## Calculation logic (`api/index.py`)

Given an array of `{ date, account_id, portfolio_value, cash_balance, net_cash_flow }`:

1. `total_equity = portfolio_value + cash_balance`
2. Sort by `account_id`, then `date`
3. `daily_profit = (today's equity - yesterday's equity) - today's net_cash_flow` (0 for each account's first entry)
4. `cumulative_profit` = running sum of `daily_profit`, per account
5. `total_net_flow` = sum of `net_cash_flow`, per account
6. `roi = cumulative_profit / total_net_flow` (null if `total_net_flow` is 0)

Response shape:

```json
{
  "records": [ { "date": "...", "account_id": "...", "portfolio_value": 0, "cash_balance": 0, "net_cash_flow": 0, "total_equity": 0, "daily_profit": 0, "cumulative_profit": 0 } ],
  "summary": [ { "account_id": "...", "total_equity": 0, "cumulative_profit": 0, "total_net_flow": 0, "roi": 0 } ]
}
```

## Local development

You'll need Node.js 18+ and Python 3.9+.

```bash
# 1. Install frontend dependencies
npm install

# 2. Install Python dependencies (in a virtualenv is recommended)
pip install -r api/requirements.txt

# 3. Run the Next.js dev server
npm run dev
```

The Next.js dev server only serves the frontend — it does **not** run the
Flask function locally. To exercise `/api/calculate` while developing, use
the Vercel CLI instead, which emulates the full deployment (Next.js + Python
function) in one process:

```bash
npm i -g vercel
vercel dev
```

Then open the printed local URL (typically `http://localhost:3000`).

## Deploying to Vercel

1. Push this repository to GitHub (or your Git provider of choice).
2. Import the repository in the Vercel dashboard, or run `vercel` from this
   directory.
3. Vercel reads `vercel.json`, which builds the Next.js app and the Python
   function together — no additional configuration is required.

## Data & privacy

Accounts and records are stored only in your browser's `localStorage`, under
the keys `ppt_accounts` and `ppt_records`. Clearing your browser storage (or
switching browsers/devices) will remove them — there is no server-side
persistence or account system by design.
