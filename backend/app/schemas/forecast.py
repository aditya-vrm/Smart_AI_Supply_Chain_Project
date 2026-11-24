from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.product import ProductResponse

class ForecastRequest(BaseModel):
    product_id: int
    horizon_days: int = 30  # 7, 30, 90
    model_type: Optional[str] = "both"  # "rf", "xgb", or "both"

class ModelMetrics(BaseModel):
    model_name: str
    mae: float
    rmse: float
    mape: float
    predicted_qty: float

class ForecastChartPoint(BaseModel):
    date: str
    actual: Optional[float] = None
    rf_predicted: Optional[float] = None
    xgb_predicted: Optional[float] = None

class ForecastResponse(BaseModel):
    forecast_id: Optional[int] = None
    product_id: int
    product_name: str
    horizon_days: int
    models: List[ModelMetrics]
    chart_data: List[ForecastChartPoint]
    recommended_model: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ForecastRecordResponse(BaseModel):
    forecast_id: int
    product_id: int
    horizon_days: int
    predicted_qty: float
    model_used: str
    mae: float
    rmse: float
    mape: float
    created_at: datetime
    product: Optional[ProductResponse] = None

    model_config = ConfigDict(from_attributes=True)
