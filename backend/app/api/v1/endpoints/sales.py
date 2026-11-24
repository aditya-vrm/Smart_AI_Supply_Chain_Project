from datetime import datetime
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Response, status
from sqlalchemy.orm import Session
from app.db.deps import get_db, get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.sale import Sale
from app.models.inventory import Inventory
from app.schemas.sale import SaleCreate, SaleResponse, SaleCSVUploadResponse
from app.services.csv_importer import import_sales_data

router = APIRouter()

@router.get("", response_model=List[SaleResponse])
def get_sales(
    product_id: Optional[int] = Query(None, description="Filter by product ID"),
    region: Optional[str] = Query(None, description="Filter by region"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    List sales transactions ordered by most recent sale date.
    """
    query = db.query(Sale)
    if product_id:
        query = query.filter(Sale.product_id == product_id)
    if region and region != "All":
        query = query.filter(Sale.region == region)
    
    sales = query.order_by(Sale.sale_date.desc()).offset(skip).limit(limit).all()
    return sales

@router.post("", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
def create_sale(
    sale_in: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Record a single manual sale and automatically deduct sold units from product inventory.
    """
    product = db.query(Product).filter(Product.product_id == sale_in.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {sale_in.product_id} not found."
        )

    if sale_in.quantity_sold <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity sold must be a positive integer."
        )

    total_amount = sale_in.total_amount
    if total_amount is None:
        total_amount = round(sale_in.quantity_sold * product.unit_price, 2)

    sale_date = sale_in.sale_date or datetime.utcnow()

    sale = Sale(
        product_id=product.product_id,
        sale_date=sale_date,
        quantity_sold=sale_in.quantity_sold,
        total_amount=total_amount,
        region=sale_in.region or "North"
    )
    db.add(sale)

    # Deduct quantity from inventory
    inv = db.query(Inventory).filter(Inventory.product_id == product.product_id).first()
    if inv:
        inv.current_stock = max(0, inv.current_stock - sale_in.quantity_sold)
        inv.last_updated = datetime.utcnow()

    db.commit()
    db.refresh(sale)
    return sale

@router.post("/upload", response_model=SaleCSVUploadResponse)
async def upload_bulk_sales(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Bulk import sales transactions via CSV or Excel (.xlsx) file using Pandas.
    """
    if not file.filename.lower().endswith((".csv", ".xlsx", ".xls")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a CSV or Excel file (.csv, .xlsx)."
        )

    content = await file.read()
    total_rows, successful_rows, failed_rows, errors = import_sales_data(
        file_bytes=content,
        filename=file.filename.lower(),
        db=db
    )

    return {
        "total_rows": total_rows,
        "successful_rows": successful_rows,
        "failed_rows": failed_rows,
        "errors": errors
    }

@router.get("/template/csv")
def download_csv_template():
    """
    Download a sample CSV file template for bulk sales uploads.
    """
    csv_content = (
        "sku_code,sale_date,quantity_sold,total_amount,region\n"
        "SKU-ELEC-101,2026-03-01,15,682.50,North\n"
        "SKU-ELEC-102,2026-03-01,22,412.50,East\n"
        "SKU-IND-201,2026-03-02,5,420.00,South\n"
        "SKU-LOG-401,2026-03-02,12,648.00,West\n"
    )
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=sales_upload_template.csv"
        }
    )
