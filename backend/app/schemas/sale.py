from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.product import ProductResponse

class SaleBase(BaseModel):
    product_id: int
    sale_date: datetime
    quantity_sold: int
    total_amount: Optional[float] = None
    region: Optional[str] = "North"

class SaleCreate(BaseModel):
    product_id: int
    sale_date: Optional[datetime] = None
    quantity_sold: int
    total_amount: Optional[float] = None
    region: Optional[str] = "North"

class SaleResponse(BaseModel):
    sale_id: int
    product_id: int
    sale_date: datetime
    quantity_sold: int
    total_amount: float
    region: str
    product: Optional[ProductResponse] = None

    model_config = ConfigDict(from_attributes=True)

class SaleCSVUploadResponse(BaseModel):
    total_rows: int
    successful_rows: int
    failed_rows: int
    errors: list[str] = []
