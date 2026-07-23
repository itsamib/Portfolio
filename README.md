# 📊 Portfolio Performance Tracker

A Streamlit web application for tracking and analyzing portfolio performance across multiple accounts. The app calculates daily profit/loss adjusted for cash flows and provides detailed visualizations of portfolio metrics.

## Overview

This application processes daily portfolio snapshots and computes:
- **Total Equity**: Portfolio value + cash balance
- **Daily Profit**: Market gains/losses adjusted for cash flows
- **Cumulative Profit**: Running total of profits over time
- **ROI**: Return on investment based on cumulative profits and net deposits

## Features

- 📈 Upload CSV or Excel files with portfolio data
- 💰 Multi-account support with filtering
- 📅 Date range selection
- 📊 Interactive charts (equity curve, daily profit, cumulative profit)
- 📋 Detailed account summary with ROI metrics
- 🔍 Processed data viewer

## Installation

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio-tracker
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

## Usage

To run the application:

```bash
streamlit run app.py
```

The app will open in your default browser at `http://localhost:8501`.

### Data Format

Your CSV or Excel file must contain the following columns:

| Column | Type | Description |
|--------|------|-------------|
| `Date` | datetime | Date of the portfolio snapshot (e.g., 2024-01-15) |
| `Account_ID` | string | Unique account identifier (e.g., ACC001) |
| `Portfolio_Value` | numeric | Total value of invested securities |
| `Cash_Balance` | numeric | Cash held in the account |
| `Net_Cash_Flow` | numeric | Net cash deposit (+) or withdrawal (-) on that day |

### Example Data

See `sample_data.csv` for a sample dataset with two accounts over 5 days.

## Core Formula

The daily profit calculation adjusts market performance for cash flows:

```
Daily Profit = (Today's Total Equity - Yesterday's Total Equity) - Today's Net Cash Flow
```

**Interpretation:**
- **Positive value**: Market gains exceeded deposits
- **Negative value**: Market losses or net deposits (expected)
- **Cumulative Profit**: Sum of all daily profits, showing net market performance

**Example:**
```
Day 1: Total Equity = $10,500 (no prior day, Daily Profit = 0)
Day 2: Total Equity = $10,900, Net Cash Flow = $0
       Daily Profit = ($10,900 - $10,500) - $0 = $400 (market gain)

Day 3: Total Equity = $11,200, Net Cash Flow = $200 (deposit)
       Daily Profit = ($11,200 - $10,900) - $200 = $100 (market gain after deposit)
```

## Project Structure

```
portfolio-tracker/
├── app.py                      # Main Streamlit application
├── src/
│   ├── __init__.py            # Package initializer
│   ├── data_loader.py         # Data loading and validation
│   └── calculations.py        # Metric calculations
├── requirements.txt           # Python dependencies
├── sample_data.csv           # Example dataset
├── README.md                 # This file
└── .gitignore               # Git ignore rules
```

## Dependencies

- **streamlit**: Web app framework
- **pandas**: Data processing and analysis
- **plotly**: Interactive visualizations
- **openpyxl**: Excel file support

## Development

### Adding New Features

1. Data processing logic → `src/calculations.py`
2. Data loading logic → `src/data_loader.py`
3. UI changes → `app.py`

### Running Tests

(Add testing framework and instructions as needed)

## Troubleshooting

### File upload fails
- Ensure file is in CSV or Excel format (.csv, .xls, .xlsx)
- Check that all required columns are present and correctly named

### "Missing columns" error
- Verify your file contains exactly: Date, Account_ID, Portfolio_Value, Cash_Balance, Net_Cash_Flow
- Column names are case-sensitive

### Charts not displaying
- Ensure date column is properly formatted
- Check that data spans multiple days (at least 2 dates per account)

## License

Specify your license here (e.g., MIT, Apache 2.0)

## Support

For issues or questions, please create an issue in the repository.
