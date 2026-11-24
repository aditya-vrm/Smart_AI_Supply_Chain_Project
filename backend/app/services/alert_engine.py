from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.forecast import Forecast
from app.models.alert import SmartAlert

def evaluate_smart_alerts(
    db: Session,
    product_id: Optional[int] = None
) -> List[SmartAlert]:
    """
    Evaluates stock health against predicted demand.
    - If current_stock < predicted_demand:
        LOW_STOCK alert with recommended_qty = predicted_demand - current_stock
    - If current_stock > predicted_demand * 2:
        OVERSTOCK alert with recommended_qty = 0
    - Otherwise:
        OPTIMAL alert status or resolve existing alerts.
    """
    query = db.query(Product)
    if product_id:
        query = query.filter(Product.product_id == product_id)
    products = query.all()

    generated_alerts = []

    for product in products:
        inv = db.query(Inventory).filter(Inventory.product_id == product.product_id).first()
        if not inv:
            continue

        # Look for latest 30-day forecast, or fallback to any latest forecast
        latest_forecast = db.query(Forecast).filter(
            Forecast.product_id == product.product_id,
            Forecast.horizon_days == 30
        ).order_by(Forecast.created_at.desc()).first()

        if not latest_forecast:
            latest_forecast = db.query(Forecast).filter(
                Forecast.product_id == product.product_id
            ).order_by(Forecast.created_at.desc()).first()

        current_stock = inv.current_stock

        if latest_forecast:
            predicted_demand = latest_forecast.predicted_qty
        else:
            # Fallback estimation based on reorder level if no ML forecast run yet
            predicted_demand = float(inv.reorder_level * 1.5)

        # Rule evaluation
        if current_stock < predicted_demand:
            alert_type = "LOW_STOCK"
            recommended_qty = int(max(0, round(predicted_demand - current_stock)))
            msg = (
                f"Low stock detected for '{product.product_name}'. "
                f"Current stock ({current_stock} units) is below projected demand ({int(predicted_demand)} units). "
                f"Recommended reorder quantity: {recommended_qty} units."
            )
        elif current_stock > (predicted_demand * 2.0):
            alert_type = "OVERSTOCK"
            recommended_qty = 0
            msg = (
                f"Overstock warning for '{product.product_name}'. "
                f"Current stock ({current_stock} units) exceeds 2x projected demand ({int(predicted_demand)} units). "
                f"Potential capital lockup and excess holding cost."
            )
        else:
            alert_type = "OPTIMAL"
            recommended_qty = 0
            msg = f"Stock level ({current_stock} units) is healthy and optimal for projected demand."

        # Check existing active alert for this product
        existing_alert = db.query(SmartAlert).filter(
            SmartAlert.product_id == product.product_id,
            SmartAlert.status == "ACTIVE"
        ).first()

        if alert_type in ["LOW_STOCK", "OVERSTOCK"]:
            if existing_alert:
                existing_alert.alert_type = alert_type
                existing_alert.recommended_qty = recommended_qty
                existing_alert.message = msg
                existing_alert.created_at = datetime.utcnow()
                generated_alerts.append(existing_alert)
            else:
                new_alert = SmartAlert(
                    product_id=product.product_id,
                    alert_type=alert_type,
                    recommended_qty=recommended_qty,
                    message=msg,
                    status="ACTIVE",
                    created_at=datetime.utcnow()
                )
                db.add(new_alert)
                generated_alerts.append(new_alert)
        else:
            # If stock is now optimal, mark active alert as resolved
            if existing_alert:
                existing_alert.status = "RESOLVED"

    db.commit()
    return generated_alerts
