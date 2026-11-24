from typing import Any, Dict
from fastapi import APIRouter, Depends, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.deps import get_db, get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.sale import Sale
from app.models.inventory import Inventory
from app.models.forecast import Forecast
from app.models.alert import SmartAlert
from app.services.report_exporter import generate_excel_report, generate_pdf_report

router = APIRouter()

@router.get("/summary")
def get_reports_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Provides aggregated reporting metrics for the analytics tab.
    """
    total_products = db.query(func.count(Product.product_id)).scalar() or 0
    total_sales_rev = db.query(func.sum(Sale.total_amount)).scalar() or 0.0
    total_units_sold = db.query(func.sum(Sale.quantity_sold)).scalar() or 0

    inv_items = db.query(Inventory).all()
    total_valuation = sum(
        (inv.current_stock * (inv.product.unit_price if inv.product else 0))
        for inv in inv_items
    )

    # Average forecast metrics across recent records
    recent_forecasts = db.query(Forecast).order_by(Forecast.created_at.desc()).limit(20).all()
    avg_mae = round(float(sum(f.mae for f in recent_forecasts) / len(recent_forecasts)), 2) if recent_forecasts else 0.0
    avg_mape = round(float(sum(f.mape for f in recent_forecasts) / len(recent_forecasts)), 2) if recent_forecasts else 0.0

    return {
        "total_products": total_products,
        "total_valuation": round(float(total_valuation), 2),
        "total_sales_revenue": round(float(total_sales_rev), 2),
        "total_units_sold": int(total_units_sold),
        "forecast_accuracy": {
            "avg_mae": avg_mae,
            "avg_mape": avg_mape,
            "total_evaluations": len(recent_forecasts)
        }
    }

@router.get("/export/excel")
def export_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Stream a comprehensive multi-sheet Excel spreadsheet report.
    """
    excel_buf = generate_excel_report(db)
    return Response(
        content=excel_buf.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=Supply_Chain_Executive_Report.xlsx"
        }
    )

@router.get("/export/pdf")
def export_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Stream a formatted PDF executive operations report.
    """
    pdf_buf = generate_pdf_report(db)
    return Response(
        content=pdf_buf.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=Supply_Chain_Executive_Report.pdf"
        }
    )
