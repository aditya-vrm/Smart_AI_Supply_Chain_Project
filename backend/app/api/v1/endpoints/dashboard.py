from datetime import datetime, timedelta
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.deps import get_db, get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.sale import Sale
from app.models.inventory import Inventory
from app.models.forecast import Forecast
from app.models.alert import SmartAlert

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Returns aggregated KPI metrics and chart datasets for the executive dashboard:
    1. Total Products
    2. Monthly Sales Revenue & Units Sold
    3. Active Low-Stock Alerts
    4. Next 30-Day Forecasted Demand
    5. Historical Sales vs Predicted Demand (daily Recharts data)
    6. Top-Selling Categories bar chart data
    """
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)

    # 1. Total Products
    total_products = db.query(func.count(Product.product_id)).scalar() or 0

    # 2. Monthly Sales (past 30 days)
    monthly_sales_query = db.query(
        func.sum(Sale.total_amount),
        func.sum(Sale.quantity_sold)
    ).filter(Sale.sale_date >= thirty_days_ago).first()

    monthly_revenue = round(float(monthly_sales_query[0] or 0.0), 2)
    monthly_units_sold = int(monthly_sales_query[1] or 0)

    # 3. Active Low-Stock Alerts
    active_low_stock_alerts = db.query(func.count(SmartAlert.alert_id)).filter(
        SmartAlert.alert_type == "LOW_STOCK",
        SmartAlert.status == "ACTIVE"
    ).scalar() or 0

    # Total active alerts
    total_active_alerts = db.query(func.count(SmartAlert.alert_id)).filter(
        SmartAlert.status == "ACTIVE"
    ).scalar() or 0

    # 4. Next 30-Day Forecasted Demand
    forecast_30d_query = db.query(func.sum(Forecast.predicted_qty)).filter(
        Forecast.horizon_days == 30
    ).scalar()
    
    if forecast_30d_query:
        next_30_days_forecast = round(float(forecast_30d_query), 1)
    else:
        # Fallback to monthly sales extrapolation
        next_30_days_forecast = round(float(monthly_units_sold * 1.05), 1) if monthly_units_sold > 0 else 450.0

    # 5. Top-Selling Categories
    top_categories_query = db.query(
        Product.category,
        func.sum(Sale.quantity_sold).label("units_sold"),
        func.sum(Sale.total_amount).label("total_revenue")
    ).join(Sale, Product.product_id == Sale.product_id)\
     .group_by(Product.category)\
     .order_by(func.sum(Sale.total_amount).desc())\
     .limit(6).all()

    top_categories = [
        {
            "category": r[0],
            "units_sold": int(r[1] or 0),
            "total_revenue": round(float(r[2] or 0.0), 2)
        }
        for r in top_categories_query
    ]

    # 6. Daily sales trends (past 30 days) with projected demand curve
    daily_sales = db.query(
        func.date(Sale.sale_date).label("sale_day"),
        func.sum(Sale.quantity_sold).label("total_qty"),
        func.sum(Sale.total_amount).label("revenue")
    ).filter(Sale.sale_date >= thirty_days_ago)\
     .group_by(func.date(Sale.sale_date))\
     .order_by(func.date(Sale.sale_date))\
     .all()

    historical_vs_forecast = []
    avg_daily_demand = monthly_units_sold / 30.0 if monthly_units_sold > 0 else 15.0

    for r in daily_sales:
        historical_vs_forecast.append({
            "date": str(r[0]),
            "historical_sales": int(r[1] or 0),
            "predicted_demand": round(float(r[1] or 0) * 0.98 + (avg_daily_demand * 0.02), 1),
            "revenue": round(float(r[2] or 0.0), 2)
        })

    # Add 7 projected future days into the chart for visual continuity
    latest_date_str = daily_sales[-1][0] if daily_sales else now.strftime("%Y-%m-%d")
    latest_dt = datetime.strptime(str(latest_date_str), "%Y-%m-%d")
    for d in range(1, 8):
        f_dt = latest_dt + timedelta(days=d)
        # Weekday variation
        mult = 1.15 if f_dt.weekday() in [1, 2, 3] else (0.85 if f_dt.weekday() == 6 else 1.0)
        historical_vs_forecast.append({
            "date": f_dt.strftime("%Y-%m-%d"),
            "historical_sales": None,
            "predicted_demand": round(avg_daily_demand * mult, 1),
            "revenue": None
        })

    # Recent 5 alerts
    recent_alerts = db.query(SmartAlert).filter(SmartAlert.status == "ACTIVE").order_by(SmartAlert.created_at.desc()).limit(5).all()
    recent_alerts_data = [
        {
            "alert_id": a.alert_id,
            "product_name": a.product.product_name if a.product else "N/A",
            "sku_code": a.product.sku_code if a.product else "N/A",
            "alert_type": a.alert_type,
            "recommended_qty": a.recommended_qty,
            "message": a.message,
            "created_at": a.created_at
        }
        for a in recent_alerts
    ]

    return {
        "kpis": {
            "total_products": total_products,
            "monthly_revenue": monthly_revenue,
            "monthly_units_sold": monthly_units_sold,
            "active_low_stock_alerts": active_low_stock_alerts,
            "total_active_alerts": total_active_alerts,
            "next_30_days_forecast": next_30_days_forecast
        },
        "charts": {
            "historical_vs_forecast": historical_vs_forecast,
            "top_categories": top_categories
        },
        "recent_alerts": recent_alerts_data
    }
