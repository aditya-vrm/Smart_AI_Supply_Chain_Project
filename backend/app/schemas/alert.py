from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.product import ProductResponse

class AlertBase(BaseModel):
    product_id: int
    alert_type: str  # "LOW_STOCK", "OVERSTOCK", "OPTIMAL"
    recommended_qty: int
    message: str
    status: str = "ACTIVE"

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    status: str  # "ACTIVE" or "RESOLVED"

class AlertResponse(AlertBase):
    alert_id: int
    created_at: datetime
    product: Optional[ProductResponse] = None

    model_config = ConfigDict(from_attributes=True)
