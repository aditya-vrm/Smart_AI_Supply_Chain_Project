from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.supplier import SupplierResponse

class ProductBase(BaseModel):
    sku_code: str
    product_name: str
    category: str
    unit_price: float
    supplier_id: Optional[int] = None

class ProductCreate(ProductBase):
    initial_stock: Optional[int] = 0
    reorder_level: Optional[int] = 20
    max_stock: Optional[int] = 200

class ProductUpdate(BaseModel):
    sku_code: Optional[str] = None
    product_name: Optional[str] = None
    category: Optional[str] = None
    unit_price: Optional[float] = None
    supplier_id: Optional[int] = None

class ProductResponse(ProductBase):
    product_id: int
    supplier: Optional[SupplierResponse] = None

    model_config = ConfigDict(from_attributes=True)
