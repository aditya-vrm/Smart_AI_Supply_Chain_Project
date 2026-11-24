import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from sklearn.ensemble import RandomForestRegressor
try:
    from xgboost import XGBRegressor
except Exception:
    from sklearn.ensemble import GradientBoostingRegressor
    class XGBRegressor(GradientBoostingRegressor):
        def __init__(self, n_estimators=100, learning_rate=0.05, max_depth=5, random_state=42, **kwargs):
            super().__init__(n_estimators=n_estimators, learning_rate=learning_rate, max_depth=max_depth, random_state=random_state)
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, mean_absolute_percentage_error
from app.models.sale import Sale
from app.models.product import Product
from app.models.forecast import Forecast

def calculate_safe_mape(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """
    Computes MAPE safely handling zero values in y_true.
    """
    y_true = np.array(y_true, dtype=float)
    y_pred = np.array(y_pred, dtype=float)
    
    # Avoid zero division by replacing zeros with 1.0 in denominator
    denom = np.where(y_true == 0, 1.0, np.abs(y_true))
    mape = np.mean(np.abs((y_true - y_pred) / denom)) * 100.0
    return round(float(mape), 2)

def generate_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Creates calendar and rolling lag features for demand forecasting.
    """
    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").reset_index(drop=True)
    
    # Calendar features
    df["dayofweek"] = df["date"].dt.dayofweek
    df["month"] = df["date"].dt.month
    df["day"] = df["date"].dt.day
    df["is_weekend"] = df["dayofweek"].isin([5, 6]).astype(int)

    # Rolling & lag features
    df["lag_1"] = df["quantity"].shift(1)
    df["lag_7"] = df["quantity"].shift(7)
    df["lag_14"] = df["quantity"].shift(14)
    df["lag_30"] = df["quantity"].shift(30)
    df["rolling_mean_7"] = df["quantity"].shift(1).rolling(window=7, min_periods=1).mean()
    df["rolling_mean_14"] = df["quantity"].shift(1).rolling(window=14, min_periods=1).mean()

    # Backfill earlier rows for lag features so we retain maximum training data
    df["lag_1"] = df["lag_1"].bfill().fillna(df["quantity"].mean())
    df["lag_7"] = df["lag_7"].bfill().fillna(df["quantity"].mean())
    df["lag_14"] = df["lag_14"].bfill().fillna(df["quantity"].mean())
    df["lag_30"] = df["lag_30"].bfill().fillna(df["quantity"].mean())
    df["rolling_mean_7"] = df["rolling_mean_7"].bfill().fillna(df["quantity"].mean())
    df["rolling_mean_14"] = df["rolling_mean_14"].bfill().fillna(df["quantity"].mean())

    return df

FEATURE_COLS = ["dayofweek", "month", "day", "is_weekend", "lag_1", "lag_7", "lag_14", "lag_30", "rolling_mean_7", "rolling_mean_14"]

def run_demand_forecast(
    product_id: int,
    horizon_days: int,
    db: Session,
    save_to_db: bool = True
) -> Dict[str, Any]:
    """
    Trains Random Forest and XGBoost models on historical sales,
    evaluates on chronological 80/20 test split, produces future predictions,
    and returns metrics, chart comparison, and recommendation.
    """
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise ValueError(f"Product with id {product_id} not found.")

    sales = db.query(Sale).filter(Sale.product_id == product_id).order_by(Sale.sale_date).all()
    if not sales or len(sales) < 14:
        raise ValueError(f"Insufficient sales history ({len(sales)} records). At least 14 days of data required for ML training.")

    # Convert to daily aggregate time series
    sales_records = [{"date": s.sale_date.strftime("%Y-%m-%d"), "quantity": s.quantity_sold} for s in sales]
    raw_df = pd.DataFrame(sales_records)
    daily_df = raw_df.groupby("date")["quantity"].sum().reset_index()
    daily_df["date"] = pd.to_datetime(daily_df["date"])

    # Continuous daily date range
    min_date = daily_df["date"].min()
    max_date = daily_df["date"].max()
    full_idx = pd.date_range(min_date, max_date, freq="D")
    daily_df = daily_df.set_index("date").reindex(full_idx, fill_value=0).reset_index()
    daily_df.rename(columns={"index": "date"}, inplace=True)

    # Feature engineering
    feat_df = generate_features(daily_df)

    # Chronological 80/20 train/test split
    n = len(feat_df)
    train_size = max(int(n * 0.8), 7)
    train_df = feat_df.iloc[:train_size]
    test_df = feat_df.iloc[train_size:]

    X_train = train_df[FEATURE_COLS]
    y_train = train_df["quantity"].values

    if len(test_df) == 0:
        test_df = train_df.iloc[-7:]
    
    X_test = test_df[FEATURE_COLS]
    y_test = test_df["quantity"].values

    # 1. Train Random Forest
    rf_model = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
    rf_model.fit(X_train, y_train)
    rf_test_preds = np.clip(rf_model.predict(X_test), 0, None)

    rf_mae = round(float(mean_absolute_error(y_test, rf_test_preds)), 2)
    rf_rmse = round(float(root_mean_squared_error(y_test, rf_test_preds)), 2)
    rf_mape = calculate_safe_mape(y_test, rf_test_preds)

    # 2. Train XGBoost
    xgb_model = XGBRegressor(n_estimators=100, learning_rate=0.05, max_depth=5, random_state=42)
    xgb_model.fit(X_train, y_train)
    xgb_test_preds = np.clip(xgb_model.predict(X_test), 0, None)

    xgb_mae = round(float(mean_absolute_error(y_test, xgb_test_preds)), 2)
    xgb_rmse = round(float(root_mean_squared_error(y_test, xgb_test_preds)), 2)
    xgb_mape = calculate_safe_mape(y_test, xgb_test_preds)

    # Multi-step future forecasting
    future_dates = [max_date + timedelta(days=i) for i in range(1, horizon_days + 1)]
    future_rf_preds = []
    future_xgb_preds = []

    # Working copies for rolling projection
    rf_history = list(feat_df["quantity"].values)
    xgb_history = list(feat_df["quantity"].values)

    for f_date in future_dates:
        # RF next step features
        rf_lag_1 = rf_history[-1]
        rf_lag_7 = rf_history[-7] if len(rf_history) >= 7 else rf_history[-1]
        rf_lag_14 = rf_history[-14] if len(rf_history) >= 14 else rf_history[-1]
        rf_lag_30 = rf_history[-30] if len(rf_history) >= 30 else rf_history[-1]
        rf_roll_7 = np.mean(rf_history[-7:])
        rf_roll_14 = np.mean(rf_history[-14:])

        row_rf = pd.DataFrame([{
            "dayofweek": f_date.dayofweek,
            "month": f_date.month,
            "day": f_date.day,
            "is_weekend": 1 if f_date.dayofweek in [5, 6] else 0,
            "lag_1": rf_lag_1,
            "lag_7": rf_lag_7,
            "lag_14": rf_lag_14,
            "lag_30": rf_lag_30,
            "rolling_mean_7": rf_roll_7,
            "rolling_mean_14": rf_roll_14,
        }])[FEATURE_COLS]

        p_rf = max(0.0, float(rf_model.predict(row_rf)[0]))
        future_rf_preds.append(round(p_rf, 1))
        rf_history.append(p_rf)

        # XGB next step features
        xgb_lag_1 = xgb_history[-1]
        xgb_lag_7 = xgb_history[-7] if len(xgb_history) >= 7 else xgb_history[-1]
        xgb_lag_14 = xgb_history[-14] if len(xgb_history) >= 14 else xgb_history[-1]
        xgb_lag_30 = xgb_history[-30] if len(xgb_history) >= 30 else xgb_history[-1]
        xgb_roll_7 = np.mean(xgb_history[-7:])
        xgb_roll_14 = np.mean(xgb_history[-14:])

        row_xgb = pd.DataFrame([{
            "dayofweek": f_date.dayofweek,
            "month": f_date.month,
            "day": f_date.day,
            "is_weekend": 1 if f_date.dayofweek in [5, 6] else 0,
            "lag_1": xgb_lag_1,
            "lag_7": xgb_lag_7,
            "lag_14": xgb_lag_14,
            "lag_30": xgb_lag_30,
            "rolling_mean_7": xgb_roll_7,
            "rolling_mean_14": xgb_roll_14,
        }])[FEATURE_COLS]

        p_xgb = max(0.0, float(xgb_model.predict(row_xgb)[0]))
        future_xgb_preds.append(round(p_xgb, 1))
        xgb_history.append(p_xgb)

    total_rf_predicted = round(float(sum(future_rf_preds)), 1)
    total_xgb_predicted = round(float(sum(future_xgb_preds)), 1)

    # Determine recommended model (lower MAE, or lower RMSE)
    if rf_mae <= xgb_mae:
        recommended_model = "Random Forest"
        best_predicted_qty = total_rf_predicted
        best_mae = rf_mae
        best_rmse = rf_rmse
        best_mape = rf_mape
    else:
        recommended_model = "XGBoost"
        best_predicted_qty = total_xgb_predicted
        best_mae = xgb_mae
        best_rmse = xgb_rmse
        best_mape = xgb_mape

    # Save to database
    forecast_record = None
    if save_to_db:
        forecast_record = Forecast(
            product_id=product_id,
            horizon_days=horizon_days,
            predicted_qty=best_predicted_qty,
            model_used=recommended_model,
            mae=best_mae,
            rmse=best_rmse,
            mape=best_mape,
            created_at=datetime.utcnow()
        )
        db.add(forecast_record)
        db.commit()
        db.refresh(forecast_record)

    # Build chart data: recent historical (last 30 days) + future predictions
    chart_points: List[Dict[str, Any]] = []
    recent_history = feat_df.tail(30)
    for _, row in recent_history.iterrows():
        d_str = row["date"].strftime("%Y-%m-%d")
        chart_points.append({
            "date": d_str,
            "actual": float(row["quantity"]),
            "rf_predicted": None,
            "xgb_predicted": None,
        })

    for d, rf_p, xgb_p in zip(future_dates, future_rf_preds, future_xgb_preds):
        d_str = d.strftime("%Y-%m-%d")
        chart_points.append({
            "date": d_str,
            "actual": None,
            "rf_predicted": rf_p,
            "xgb_predicted": xgb_p,
        })

    return {
        "forecast_id": forecast_record.forecast_id if forecast_record else None,
        "product_id": product.product_id,
        "product_name": product.product_name,
        "horizon_days": horizon_days,
        "models": [
            {
                "model_name": "Random Forest",
                "mae": rf_mae,
                "rmse": rf_rmse,
                "mape": rf_mape,
                "predicted_qty": total_rf_predicted
            },
            {
                "model_name": "XGBoost",
                "mae": xgb_mae,
                "rmse": xgb_rmse,
                "mape": xgb_mape,
                "predicted_qty": total_xgb_predicted
            }
        ],
        "chart_data": chart_points,
        "recommended_model": recommended_model,
        "created_at": datetime.utcnow()
    }
