# Portfolio Performance Tracker

A modern, production-ready web application for tracking and analyzing portfolio performance across multiple trading accounts. Built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **FastAPI/Streamlit backends**.

## Features

✨ **Modern UI**
- Dark theme with glassmorphism design
- Interactive charts (Recharts for Next.js, Plotly for Streamlit)
- Responsive layout (desktop and mobile)
- Real-time metric calculations

📊 **Portfolio Analytics**
- Daily profit calculation adjusted for cash flows
- Multi-account support with master dashboard
- Individual account dashboards with detailed metrics
- ROI calculations and performance tracking
- Interactive charts: equity curves, daily profit/loss, cumulative profit

📝 **Data Management**
- Manual data entry for portfolio snapshots
- Account creation and management
- Editable data tables with delete functionality
- Data persistence (localStorage for frontend, JSON for backend)

🚀 **Deployment Ready**
- Frontend deployable to Vercel
- Backend deployable to Railway, Render, or Heroku
- Standalone Streamlit version for quick deployment on Streamlit Cloud

## Core Formula

The application calculates **daily profit adjusted for cash flows**:

```
Daily Profit = (Today's Total Equity - Yesterday's Total Equity) - Today's Net Cash Flow
```

Where:
- **Total Equity** = Portfolio Value + Cash Balance
- **Cumulative Profit** = Sum of all daily profits for an account
- **ROI** = Cumulative Profit / Total Net Cash Flow

### Example
```
Day 1:
  Portfolio Value = $10,000, Cash Balance = $500
  Total Equity = $10,500
  Daily Profit = 0 (first day, no prior data)

Day 2:
  Portfolio Value = $10,500, Cash Balance = $400, Net Cash Flow = $0
  Total Equity = $10,900
  Daily Profit = ($10,900 - $10,500) - $0 = $400 (market gain)

Day 3:
  Portfolio Value = $10,800, Cash Balance = $600, Net Cash Flow = $200 (deposit)
  Total Equity = $11,400
  Daily Profit = ($11,400 - $10,900) - $200 = $300 (market gain after deposit)
```

## Project Structure

### Three Versions

#### 1. Full Stack (Next.js + FastAPI)
Complete modern stack with separate frontend and backend.
- **Frontend**: `frontend/` (Next.js 14, TypeScript, Tailwind CSS)
- **Backend**: `backend/` (FastAPI, pandas, in-memory storage)
- **Best for**: Production deployments, team collaboration

#### 2. Serverless (Next.js + Flask)
Next.js frontend with Python serverless function (compatible with Vercel).
- **Frontend**: `frontend/` with Python API handler
- **Backend**: `api/` (Flask serverless function)
- **Best for**: Simple deployment on Vercel

#### 3. Standalone (Streamlit)
Single-file Streamlit application, everything in Python.
- **App**: `streamlit_app/app.py`
- **Best for**: Quick prototyping, instant Streamlit Cloud deployment

## Setup Instructions

### Prerequisites
- Node.js 18+ (for Next.js frontend)
- Python 3.9+ (for backend/Streamlit)
- npm or yarn (for JavaScript dependencies)
- pip (for Python dependencies)

---

## Version 1: Full Stack (Next.js + FastAPI)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server**
   ```bash
   python main.py
   ```
   or
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   Server runs at: `http://localhost:8000`
   API docs: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env.local**
   ```bash
   echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

   App runs at: `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

---

## Version 2: Standalone Streamlit

### Setup

1. **Navigate to streamlit_app directory**
   ```bash
   cd streamlit_app
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the app**
   ```bash
   streamlit run app.py
   ```

   App runs at: `http://localhost:8501`

### Deploy to Streamlit Cloud

1. Push your repository to GitHub
2. Go to [share.streamlit.io](https://share.streamlit.io)
3. Click "New app"
4. Select your repository and point to `streamlit_app/app.py`
5. Click "Deploy"

---

## Deployment Guide

### Deploy Backend to Railway

1. **Create Railway account** at [railway.app](https://railway.app)
2. **Connect GitHub repository**
3. **Create new project** and select your repo
4. **Configure environment**:
   - Set `PYTHON_VERSION` to `3.11`
   - Add start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. **Deploy** – Railway will automatically build and deploy

### Deploy Frontend to Vercel

1. **Create Vercel account** at [vercel.com](https://vercel.com)
2. **Import Git repository**
3. **Configure project**:
   - Set "Root Directory" to `frontend/`
   - Add environment variable: `NEXT_PUBLIC_API_URL=https://your-railway-backend-url.com`
4. **Deploy** – automatic on every push to main branch

### Deploy Streamlit to Streamlit Cloud

1. **Push to GitHub**
2. Go to [share.streamlit.io](https://share.streamlit.io)
3. Click "New app"
4. Select repository: `itsamib/Portfolio`
5. Main file path: `streamlit_app/app.py`
6. Click "Deploy"

---

## API Endpoints (Backend)

### Calculate Metrics
```http
POST /api/calculate
Content-Type: application/json

[
  {
    "date": "2024-01-01",
    "account_id": "ACC001",
    "portfolio_value": 10000,
    "cash_balance": 500,
    "net_cash_flow": 500
  }
]
```

**Response**:
```json
{
  "enriched_data": [...],
  "summary": [...],
  "total_equity": 10500,
  "total_profit": 0,
  "overall_roi": null
}
```

### Get Accounts
```http
GET /api/accounts
```

**Response**:
```json
{
  "accounts": ["ACC001", "ACC002"]
}
```

### Add Record
```http
POST /api/records
Content-Type: application/json

{
  "date": "2024-01-01",
  "account_id": "ACC001",
  "portfolio_value": 10000,
  "cash_balance": 500,
  "net_cash_flow": 500
}
```

### Get Records
```http
GET /api/records
```

### Delete Record
```http
DELETE /api/records/{record_id}
```

### Create Account
```http
POST /api/accounts
Content-Type: application/json

{
  "name": "Trading Account 1"
}
```

### Delete Account
```http
DELETE /api/accounts/{account_id}
```

---

## Features by Page

### Master Dashboard
- Total equity across all accounts
- Total net profit (cumulative profit sum)
- Overall ROI (weighted average)
- Summary table with color-coded ROI
- Daily profit bar chart (grouped by account)
- Equity line chart (all accounts)
- Recent records table

### Data Entry
- Date picker (defaults to today)
- Account selector (dropdown)
- Three input fields (Portfolio Value, Cash Balance, Net Cash Flow)
- Submit button with validation
- Editable table with delete functionality
- Real-time feedback messages

### Account Management
- List all accounts
- Create new account (with name)
- Delete account (confirms before deletion)
- Visual cards for each account

### Individual Account Dashboard
- Account-specific metrics (equity, profit, ROI)
- Equity curve (line chart)
- Daily profit bar chart
- Cumulative profit area chart
- All metrics updated in real-time

---

## Technology Stack

### Frontend
- **Next.js 14** – React framework with App Router
- **TypeScript** – Type safety
- **Tailwind CSS** – Utility-first styling
- **Recharts** – Interactive charts
- **lucide-react** – Icons
- **Axios** – HTTP client (optional, also uses fetch)

### Backend
- **FastAPI** – Modern Python web framework
- **pandas** – Data manipulation and calculations
- **numpy** – Numerical computing
- **Uvicorn** – ASGI server

### Streamlit
- **Streamlit** – Python web app framework
- **pandas** – Data manipulation
- **Plotly** – Interactive charts
- **numpy** – Numerical computing

---

## Data Persistence

### Frontend
- **localStorage** – Persists records and accounts in browser
- Automatically saved on every change
- Survives page refresh

### Backend
- **JSON file** (`data.json`) – Persists records and accounts on disk
- In-memory storage with file sync
- Survives server restart

### Streamlit
- **session_state** – Session-level state (lost on refresh)
- Optional: Add `@st.cache_data` for persistence

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is already in use
lsof -i :8000
# Kill process if needed
kill -9 <PID>
```

### Frontend can't connect to backend
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend is running on correct port
- Check CORS settings in backend (`main.py`)

### Streamlit app is slow
- Reduce data size
- Use `@st.cache_data` for expensive computations
- Optimize chart rendering

### Data not persisting
- **Frontend**: Check browser localStorage (DevTools > Application > Storage)
- **Backend**: Verify `data.json` exists and has write permissions
- **Streamlit**: Use `st.cache_data` to persist across sessions

---

## Sample Data

The app comes with sample data pre-loaded:

```
Account: ACC001
- 2024-01-01: Portfolio $10,000 + Cash $500, Flow +$500
- 2024-01-02: Portfolio $10,500 + Cash $400, Flow $0 (Profit: $400)
- 2024-01-03: Portfolio $10,800 + Cash $600, Flow -$100 (Profit: $100)

Account: ACC002
- 2024-01-01: Portfolio $50,000 + Cash $2,000, Flow +$2,000
- 2024-01-02: Portfolio $51,200 + Cash $1,800, Flow $0 (Profit: $1,200)
- 2024-01-03: Portfolio $51,800 + Cash $2,200, Flow +$500 (Profit: $1,300)
```

---

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

---

## License

MIT License – See LICENSE file for details

---

## Support

For issues, questions, or feature requests, please create an issue in the GitHub repository.

---

## Roadmap

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication
- [ ] Multi-user support
- [ ] Export to CSV/PDF
- [ ] Mobile app (React Native)
- [ ] Advanced analytics (Sharpe ratio, Sortino ratio, etc.)
- [ ] Performance benchmarking
- [ ] Real-time market data integration

---

**Last Updated**: July 2024
**Version**: 1.0.0
