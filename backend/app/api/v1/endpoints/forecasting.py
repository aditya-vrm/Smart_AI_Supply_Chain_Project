from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.deps import get_db, get_current_user
from app.models.user import User
from app.models.forecast import Forecast
from app.schemas.forecast import ForecastRequest, ForecastResponse, ForecastRecordResponse
from app.services.ml_forecaster import run_demand_forecast
from app.services.alert_engine import evaluate_smart_alerts

router = APIRouter()

@router.post("/predict", response_model=ForecastResponse)
def generate_forecast(
    req: ForecastRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Trains Random Forest vs XGBoost on 80/20 train-test split,
    returns MAE/RMSE/MAPE accuracy metrics and multi-horizon demand projection (7, 30, 90 days),
    and updates smart alert recommendations.
    """
    if req.horizon_days not in [7, 30, 90]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Forecast horizon must be either 7, 30, or 90 days."
        )

    try:
        result = run_demand_forecast(
            product_id=req.product_id,
            horizon_days=req.horizon_days,
            db=db,
            save_to_db=True
        )

        # Trigger smart alert evaluation with the newly produced forecast
        evaluate_smart_alerts(db, product_id=req.product_id)

        return result
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Forecast execution failed: {str(e)}"
        )

@router.get("/history", response_model=List[ForecastRecordResponse])
def get_forecast_history(
    product_id: int = Query(None, description="Optional product filter"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve historical forecast execution logs and accuracy metrics.
    """
    query = db.query(Forecast)
    if product_id:
        query = query.filter(Forecast.product_id == product_id)
    return query.order_by(Forecast.created_at.desc()).limit(limit).all()
