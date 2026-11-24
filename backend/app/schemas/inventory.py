from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.product import ProductResponse

class InventoryBase(BaseModel):
    product_id: int
    current_stock: int
    reorder_level: int = 20
    max_stock: int = 200

class InventoryUpdate(BaseModel):
    current_stock: Optional[int] = None
    reorder_level: Optional[int] = None
    max_stock: Optional[int] = None

class RestockRequest(BaseModel):
    quantity: int

class InventoryResponse(InventoryBase):
    inventory_id: int
    last_updated: datetime
    product: Optional[ProductResponse] = None
    health_status: Optional[str] = None  # "OPTIMAL", "LOW_STOCK", "OVERSTOCK"

    model_config = ConfigDict(from_attributes=True)
