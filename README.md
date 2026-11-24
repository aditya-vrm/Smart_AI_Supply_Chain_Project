# Smart AI-Based Supply Chain and Demand Forecasting System (Full-Stack SaaS)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4+-F7931E?style=flat&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0+-EB5424?style=flat&logo=xgboost&logoColor=white)](https://xgboost.ai/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

A production-ready full-stack web application engineered to optimize supply chain inventory levels, predict future product demand (7, 30, and 90-day horizons) using Machine Learning (Random Forest & XGBoost), automatically detect stock anomalies (low-stock and overstock), recommend exact reorder quantities, and export comprehensive executive reports in Excel (`.xlsx`) and PDF (`.pdf`).

---

## 📸 Key Functional Modules

1. **Authentication & Admin Dashboard**:
   - Secure JWT token authentication with bcrypt password hashing.
   - 4 Interactive KPI cards: Total Products, Monthly Revenue/Units Sold, Active Low-Stock Alerts, and Next 30-Day Forecasted Demand.
   - Dual interactive Recharts visualizations: Historical Sales vs. Predicted Demand line chart and Top-Selling Categories bar chart.
   - Recent active alerts preview with direct drill-down links.

2. **Product Management**:
   - Complete CRUD operations (Add, Edit, Delete, Search, Category Filter) with unique SKU validation.
   - Dynamic supplier linkage and automatic inventory initialization upon product creation.

3. **Sales Management & Bulk CSV/Excel Importer**:
   - Single manual sale entry that validates and automatically deducts sold units from real-time inventory.
   - Robust bulk CSV and Excel (`.xlsx`) file upload engine powered by Pandas with row-by-row error validation.
   - Downloadable sample CSV upload template with 1-click access.

4. **AI Demand Forecasting Engine**:
   - Select any catalog product and forecast horizon (**7, 30, or 90 days**).
   - Trains and compares **Random Forest** vs. **XGBoost** on an 80/20 chronological train-test split.
   - Feature engineering with calendar components (`dayofweek`, `month`, `day`, `is_weekend`) and rolling lag features (`lag_1`, `lag_7`, `lag_14`, `lag_30`, `rolling_mean_7`, `rolling_mean_14`).
   - Detailed accuracy metrics returned and displayed: **MAE** (Mean Absolute Error), **RMSE** (Root Mean Squared Error), and **MAPE** (Mean Absolute Percentage Error).
   - Interactive Recharts visualization mapping continuous historical actuals against future model projections.
   - Persistent forecast logging in the `forecasts` database table.

5. **Inventory Management**:
   - Live inventory health table displaying SKU, Product Name, Current Stock, Reorder Level, and Max Capacity.
   - Real-time stock health badges (`OPTIMAL`, `LOW_STOCK`, `OVERSTOCK`).
   - Quick "Restock" modal for rapid warehouse stock intake and threshold adjustment modal.

6. **Supplier Management**:
   - Full CRUD for suppliers (name, contact person, phone, email, and procurement lead times in days).
   - Purchase order partnership tracking.

7. **Smart Alerts & Reorder Engine**:
   - Automatic heuristic rules comparing `current_stock` against `predicted_demand`:
     - **Low Stock Alert**: Triggered when `current_stock < predicted_demand`. Calculates `recommended_qty = predicted_demand - current_stock`.
     - **Overstock Alert**: Triggered when `current_stock > predicted_demand * 2`. Warns against excess holding costs and capital lockup.
     - **Optimal Stock**: Stock is balanced. Resolves existing active alerts.
   - Manual one-click "Evaluate All Inventory" trigger and alert resolution workflow.

8. **Reports & Analytics Export**:
   - Aggregated KPIs for total inventory valuation, historical sales revenue, and forecast accuracy.
   - **Download Excel (.xlsx)**: Formatted multi-tab workbook generated via `OpenPyXL` (Executive Summary, Inventory Valuation, and Smart Alerts & Reorders).
   - **Download PDF (.pdf)**: Clean, executive-ready operations document generated via `ReportLab`.

---

## 📐 Architecture & Tech Stack

```text
Smart_AI_Supply_Chain_Project/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/  # auth, dashboard, products, sales, inventory, forecasting, alerts, reports
│   │   ├── core/              # settings, security (JWT & bcrypt)
│   │   ├── db/                # SQLAlchemy database engine & dependencies
│   │   ├── models/            # 7 SQLAlchemy models (users, suppliers, products, sales, inventory, forecasts, alerts)
│   │   ├── schemas/           # Pydantic v2 request/response schemas
│   │   ├── services/          # ml_forecaster, alert_engine, csv_importer, report_exporter
│   │   └── main.py            # FastAPI entry point & CORS configuration
│   ├── tests/                 # pytest test suite
│   ├── seed_data.py           # Database seeder (admin, 5 suppliers, 10 products, 1300+ sales)
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/               # Axios instance with JWT interceptor
    │   ├── context/           # React AuthContext
    │   ├── layouts/           # Fixed 240px sidebar layout (Linear / Stripe inspired)
    │   ├── components/        # KPICard, StatusBadge, Modal
    │   └── pages/             # Dashboard, Products, Sales, Inventory, Forecasting, Alerts, Suppliers, Reports, Auth
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🎨 UI/UX Design System (Linear / Stripe Inspired Light Mode)

- **Page Background:** `#F8FAFC` (`bg-slate-50`)
- **Card / Surface:** `#FFFFFF` (`bg-white`)
- **Borders & Dividers:** `#E2E8F0` (`border-slate-200`, 1px subtle borders, zero heavy drop shadows)
- **Primary Text:** `#0F172A` (`text-slate-900`)
- **Secondary / Muted Text:** `#64748B` (`text-slate-500`)
- **Primary Accent:** `#2563EB` (`bg-blue-600`, hover `bg-blue-700`)
- **Typography:** `Inter` font family with `tabular-nums` for all figures, currency, and metrics.
- **Status Badges:**
  - Optimal Stock: `bg-emerald-50 text-emerald-700 border border-emerald-200`
  - Low Stock Alert: `bg-rose-50 text-rose-700 border border-rose-200`
  - Overstock Alert: `bg-amber-50 text-amber-700 border border-amber-200`

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm 9+
- Git

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with demo admin, suppliers, products, and 1,300+ historical sales records
python seed_data.py

# Run unit tests to verify ML pipeline & report exporters
pytest tests/test_ml_pipeline.py -v

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

- API Base URL: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/api/v1/docs`

#### Default Credentials:
- **Email:** `admin@sbu.edu`
- **Password:** `admin123`

---

### 2. Frontend Setup

```bash
cd frontend

# Install node packages
npm install

# Build production bundle
npm run build

# Start Vite development server
npm run dev
```

- Application Web App: `http://localhost:5173`

---

## 🤖 Machine Learning Pipeline Details

1. **Aggregation & Normalization:**
   Historical sales transactions are grouped daily and indexed over a continuous daily date range (zero-filled for non-trading days).

2. **Feature Engineering:**
   - Calendar attributes: `dayofweek`, `month`, `day`, `is_weekend`.
   - Lag variables: `lag_1`, `lag_7`, `lag_14`, `lag_30`.
   - Moving statistics: 7-day and 14-day rolling means (`rolling_mean_7`, `rolling_mean_14`).

3. **Train-Test Chronological Validation:**
   An 80/20 chronological split is applied to prevent lookahead bias. Models train on older history and are scored against the latest 20% unseen test window.

4. **Multi-Horizon Projection:**
   An iterative projection loop calculates future feature vectors and rolls predictions forward across 7, 30, or 90 days.

5. **Evaluation Metrics:**
   - **MAE:** $\text{MAE} = \frac{1}{n} \sum_{i=1}^n |y_i - \hat{y}_i|$
   - **RMSE:** $\text{RMSE} = \sqrt{\frac{1}{n} \sum_{i=1}^n (y_i - \hat{y}_i)^2}$
   - **MAPE:** $\text{MAPE} = \frac{100\%}{n} \sum_{i=1}^n \left|\frac{y_i - \hat{y}_i}{\max(y_i, 1)}\right|$

---

## 📑 Database Schema (7 Tables)

1. `users`: Credentials, hashed passwords (`bcrypt`), and user roles.
2. `suppliers`: Vendor name, contacts, and lead times in days.
3. `products`: Catalog items, SKU codes (unique), categories, unit prices, and linked supplier IDs.
4. `sales`: Transactions, timestamps, quantities sold, revenue, and geographical regions.
5. `inventory`: Real-time stock counts, reorder thresholds, max capacities, and update timestamps.
6. `forecasts`: Historical AI forecast runs, horizon days, models used, and MAE/RMSE/MAPE error scores.
7. `smart_alerts`: Generated stock alerts, recommended reorder quantities, and statuses (`ACTIVE`/`RESOLVED`).

---

## 🛡️ License
MIT License.
