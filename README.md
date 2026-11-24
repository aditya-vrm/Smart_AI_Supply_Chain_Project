# Smart AI-Based Supply Chain and Demand Forecasting System

A production-ready full-stack SaaS web application designed to help businesses optimize inventory levels, forecast future product demand, manage suppliers, and automatically detect stock risks using Machine Learning.

---

## 🌟 Key Features

1. **Authentication & Admin Dashboard**:
   - Secure JWT token authentication with bcrypt password hashing.
   - Interactive KPI cards for Total Products, Monthly Sales, Active Stock Alerts, and 30-Day Demand Forecast.
   - Recharts visual analytics showing historical sales vs. forecasted demand and top categories.

2. **Product & Supplier Management**:
   - Complete CRUD operations with unique SKU code validation and supplier linkage.
   - Supplier directory tracking contact information, lead times, and purchase order statuses.

3. **Sales Management & Bulk CSV Upload**:
   - Manual sale entry that automatically deducts stock from real-time inventory.
   - Bulk CSV/Excel sales upload powered by Pandas with schema validation and error feedback.
   - Built-in downloadable sample CSV template.

4. **AI Demand Forecasting Engine**:
   - Predict product demand for **7, 30, and 90-day** horizons.
   - Machine Learning comparison of **Random Forest** vs. **XGBoost** with calendar and rolling lag features (`month`, `dayofweek`, `lag_7`, `lag_30`).
   - Detailed accuracy metrics: **MAE**, **RMSE**, and **MAPE**.
   - Chronological train-test validation and forecast persistence.

5. **Inventory Health & Smart Alert Reorder Engine**:
   - Real-time stock health badges: Optimal, Low Stock Alert, and Overstock Alert.
   - Automatic reorder quantity recommendations based on ML forecast demand vs. current stock.
   - Quick restock workflow and alert resolution.

6. **Reports & Data Export**:
   - Instant downloadable Excel (`.xlsx`) reports via OpenPyXL.
   - Clean, professional PDF (`.pdf`) executive summary reports via ReportLab.

---

## 🏗️ Architecture & Tech Stack

### Backend
- **Framework:** FastAPI + Uvicorn (Python 3.11+)
- **Database & ORM:** SQLite 3 + SQLAlchemy 2.0 + Pydantic v2
- **Auth:** JWT Bearer Tokens (`python-jose` / `PyJWT`) + `passlib[bcrypt]`
- **ML & Data:** Scikit-learn, XGBoost, Pandas, NumPy
- **Reporting:** OpenPyXL, ReportLab

### Frontend
- **Framework:** React 18+ (bootstrapped with Vite)
- **Styling:** Tailwind CSS (Minimalist Light Mode, Linear/Stripe inspired)
- **Navigation & State:** React Router v6 + React Context
- **Visuals:** Recharts + Lucide React

---

## 🚀 Quickstart Guide

### 1. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Seed the database with demo admin & sample historical data
python seed_data.py

# Start FastAPI dev server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at `http://localhost:8000/docs`.

**Default Admin Credentials:**
- Email: `admin@sbu.edu`
- Password: `admin123`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📊 Database Schema

1. `users` - System credentials and roles.
2. `suppliers` - Supplier profiles and lead times.
3. `products` - Catalog items with SKU codes and linked suppliers.
4. `sales` - Historical transactions and regional sales figures.
5. `inventory` - Real-time stock counts, reorder thresholds, and health states.
6. `forecasts` - Model predictions, metrics (MAE/RMSE/MAPE), and forecast horizons.
7. `smart_alerts` - Generated alerts and calculated reorder quantities.

---

## 📄 License
MIT License.
