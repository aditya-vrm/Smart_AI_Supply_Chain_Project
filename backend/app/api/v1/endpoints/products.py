from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.deps import get_db, get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.supplier import Supplier
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter()

@router.get("", response_model=List[ProductResponse])
def get_products(
    search: Optional[str] = Query(None, description="Search by product name or SKU"),
    category: Optional[str] = Query(None, description="Filter by category"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve products with optional keyword search and category filtering.
    """
    query = db.query(Product)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Product.product_name.ilike(search_filter),
                Product.sku_code.ilike(search_filter)
            )
        )
    if category and category != "All":
        query = query.filter(Product.category == category)
    
    products = query.order_by(Product.product_id.desc()).offset(skip).limit(limit).all()
    return products

@router.get("/categories", response_model=List[str])
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get all distinct product categories.
    """
    results = db.query(Product.category).distinct().order_by(Product.category).all()
    return [r[0] for r in results if r[0]]

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get single product details by ID.
    """
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found."
        )
    return product

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new product with unique SKU and initialized inventory.
    """
    # Check SKU uniqueness
    existing_sku = db.query(Product).filter(Product.sku_code == product_in.sku_code).first()
    if existing_sku:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU '{product_in.sku_code}' already exists."
        )
    
    # Check supplier if provided
    if product_in.supplier_id:
        supplier = db.query(Supplier).filter(Supplier.supplier_id == product_in.supplier_id).first()
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Supplier with id {product_in.supplier_id} does not exist."
            )
    
    product = Product(
        sku_code=product_in.sku_code.strip().upper(),
        product_name=product_in.product_name.strip(),
        category=product_in.category.strip(),
        unit_price=product_in.unit_price,
        supplier_id=product_in.supplier_id
    )
    db.add(product)
    db.flush()

    # Automatically create initial inventory record
    inventory = Inventory(
        product_id=product.product_id,
        current_stock=product_in.initial_stock or 0,
        reorder_level=product_in.reorder_level or 20,
        max_stock=product_in.max_stock or 200
    )
    db.add(inventory)
    db.commit()
    db.refresh(product)
    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update product details.
    """
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found."
        )
    
    if product_in.sku_code and product_in.sku_code.strip().upper() != product.sku_code:
        existing = db.query(Product).filter(Product.sku_code == product_in.sku_code.strip().upper()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"SKU '{product_in.sku_code}' is already used by another product."
            )
        product.sku_code = product_in.sku_code.strip().upper()

    if product_in.product_name is not None:
        product.product_name = product_in.product_name.strip()
    if product_in.category is not None:
        product.category = product_in.category.strip()
    if product_in.unit_price is not None:
        product.unit_price = product_in.unit_price
    if product_in.supplier_id is not None:
        if product_in.supplier_id > 0:
            supp = db.query(Supplier).filter(Supplier.supplier_id == product_in.supplier_id).first()
            if not supp:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Supplier id {product_in.supplier_id} not found."
                )
            product.supplier_id = product_in.supplier_id
        else:
            product.supplier_id = None

    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a product and all cascade records (inventory, sales, forecasts, alerts).
    """
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found."
        )
    db.delete(product)
    db.commit()
    return None
