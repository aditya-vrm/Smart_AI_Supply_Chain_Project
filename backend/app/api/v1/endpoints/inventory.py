from datetime import datetime
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.deps import get_db, get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.inventory import Inventory
from app.schemas.inventory import InventoryResponse, InventoryUpdate, RestockRequest

router = APIRouter()

def compute_health_status(current_stock: int, reorder_level: int, max_stock: int) -> str:
    if current_stock <= reorder_level:
        return "LOW_STOCK"
    elif current_stock > max_stock:
        return "OVERSTOCK"
    return "OPTIMAL"

@router.get("", response_model=List[InventoryResponse])
def get_inventory(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve real-time inventory records with calculated health status badges.
    """
    items = db.query(Inventory).all()
    results = []
    for item in items:
        status_val = compute_health_status(item.current_stock, item.reorder_level, item.max_stock)
        item_dict = {
            "inventory_id": item.inventory_id,
            "product_id": item.product_id,
            "current_stock": item.current_stock,
            "reorder_level": item.reorder_level,
            "max_stock": item.max_stock,
            "last_updated": item.last_updated,
            "product": item.product,
            "health_status": status_val
        }
        results.append(item_dict)
    return results

@router.get("/{product_id}/product", response_model=InventoryResponse)
def get_inventory_by_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get inventory record for a specific product.
    """
    item = db.query(Inventory).filter(Inventory.product_id == product_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inventory for product {product_id} not found."
        )
    return {
        "inventory_id": item.inventory_id,
        "product_id": item.product_id,
        "current_stock": item.current_stock,
        "reorder_level": item.reorder_level,
        "max_stock": item.max_stock,
        "last_updated": item.last_updated,
        "product": item.product,
        "health_status": compute_health_status(item.current_stock, item.reorder_level, item.max_stock)
    }

@router.put("/{inventory_id}", response_model=InventoryResponse)
def update_inventory(
    inventory_id: int,
    inv_in: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update inventory thresholds or stock level directly.
    """
    item = db.query(Inventory).filter(Inventory.inventory_id == inventory_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inventory record {inventory_id} not found."
        )
    
    if inv_in.current_stock is not None:
        item.current_stock = max(0, inv_in.current_stock)
    if inv_in.reorder_level is not None:
        item.reorder_level = max(0, inv_in.reorder_level)
    if inv_in.max_stock is not None:
        item.max_stock = max(item.reorder_level, inv_in.max_stock)
    
    item.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(item)

    return {
        "inventory_id": item.inventory_id,
        "product_id": item.product_id,
        "current_stock": item.current_stock,
        "reorder_level": item.reorder_level,
        "max_stock": item.max_stock,
        "last_updated": item.last_updated,
        "product": item.product,
        "health_status": compute_health_status(item.current_stock, item.reorder_level, item.max_stock)
    }

@router.post("/{inventory_id}/restock", response_model=InventoryResponse)
def restock_inventory(
    inventory_id: int,
    restock_in: RestockRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Quick restock modal action: adds units to current_stock.
    """
    if restock_in.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Restock quantity must be greater than zero."
        )

    item = db.query(Inventory).filter(Inventory.inventory_id == inventory_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inventory record {inventory_id} not found."
        )
    
    item.current_stock += restock_in.quantity
    item.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(item)

    return {
        "inventory_id": item.inventory_id,
        "product_id": item.product_id,
        "current_stock": item.current_stock,
        "reorder_level": item.reorder_level,
        "max_stock": item.max_stock,
        "last_updated": item.last_updated,
        "product": item.product,
        "health_status": compute_health_status(item.current_stock, item.reorder_level, item.max_stock)
    }
