import pytest
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from app.db.database import SessionLocal
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.sale import Sale
from app.models.forecast import Forecast
from app.services.ml_forecaster import generate_features, calculate_safe_mape, run_demand_forecast
from app.services.alert_engine import evaluate_smart_alerts
from app.services.report_exporter import generate_excel_report, generate_pdf_report

def test_feature_generation():
    """Verify calendar and lag feature engineering produces continuous and non-empty columns."""
    dates = [datetime(2026, 1, 1) + timedelta(days=i) for i in range(40)]
    quantities = [10 + (i % 5) * 2 for i in range(40)]
    df = pd.DataFrame({"date": dates, "quantity": quantities})

    feat_df = generate_features(df)
    assert "dayofweek" in feat_df.columns
    assert "month" in feat_df.columns
    assert "lag_7" in feat_df.columns
    assert "lag_30" in feat_df.columns
    assert "rolling_mean_7" in feat_df.columns
    assert len(feat_df) == 40
    assert not feat_df["lag_7"].isnull().any()

def test_safe_mape_calculation():
    """Verify safe MAPE handles zero ground truth without division by zero errors."""
    y_true = np.array([0, 10, 20, 0, 5])
    y_pred = np.array([2, 12, 18, 1, 5])
    mape = calculate_safe_mape(y_true, y_pred)
    assert isinstance(mape, float)
    assert mape >= 0.0

def test_ml_forecaster_execution():
    """Verify Random Forest and XGBoost model training and multi-horizon projection."""
    db = SessionLocal()
    try:
        product = db.query(Product).first()
        assert product is not None, "Product must exist in seeded DB"

        # Test 7-day forecast
        res_7 = run_demand_forecast(product.product_id, horizon_days=7, db=db, save_to_db=False)
        assert res_7["horizon_days"] == 7
        assert len(res_7["models"]) == 2
        rf_m = res_7["models"][0]
        xgb_m = res_7["models"][1]
        assert rf_m["mae"] >= 0.0
        assert xgb_m["rmse"] >= 0.0
        assert res_7["recommended_model"] in ["Random Forest", "XGBoost"]
        assert len(res_7["chart_data"]) > 0

        # Test 30-day forecast
        res_30 = run_demand_forecast(product.product_id, horizon_days=30, db=db, save_to_db=True)
        assert res_30["horizon_days"] == 30
        assert res_30["forecast_id"] is not None
    finally:
        db.close()

def test_alert_engine_logic():
    """Verify alert generation rules: LOW_STOCK, OVERSTOCK, and OPTIMAL."""
    db = SessionLocal()
    try:
        alerts = evaluate_smart_alerts(db)
        assert isinstance(alerts, list)
        for a in alerts:
            assert a.alert_type in ["LOW_STOCK", "OVERSTOCK", "OPTIMAL"]
            if a.alert_type == "LOW_STOCK":
                assert a.recommended_qty >= 0
    finally:
        db.close()

def test_report_exporters():
    """Verify PDF and Excel generation return non-empty byte streams."""
    db = SessionLocal()
    try:
        excel_buf = generate_excel_report(db)
        assert excel_buf.getbuffer().nbytes > 1000

        pdf_buf = generate_pdf_report(db)
        assert pdf_buf.getbuffer().nbytes > 1000
    finally:
        db.close()
