from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.deps import get_db, get_current_user
from app.models.user import User
from app.models.supplier import Supplier
from app.schemas.supplier import SupplierCreate, SupplierUpdate, SupplierResponse

router = APIRouter()

@router.get("", response_model=List[SupplierResponse])
def get_suppliers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    List all suppliers ordered by name.
    """
    return db.query(Supplier).order_by(Supplier.supplier_name).all()

@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a single supplier by ID.
    """
    supplier = db.query(Supplier).filter(Supplier.supplier_id == supplier_id).first()
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Supplier {supplier_id} not found."
        )
    return supplier

@router.post("", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
def create_supplier(
    supplier_in: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new supplier.
    """
    supplier = Supplier(
        supplier_name=supplier_in.supplier_name.strip(),
        contact_person=supplier_in.contact_person.strip() if supplier_in.contact_person else None,
        phone=supplier_in.phone.strip() if supplier_in.phone else None,
        email=supplier_in.email.strip() if supplier_in.email else None,
        lead_time_days=supplier_in.lead_time_days
    )
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier

@router.put("/{supplier_id}", response_model=SupplierResponse)
def update_supplier(
    supplier_id: int,
    supplier_in: SupplierUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update supplier information.
    """
    supplier = db.query(Supplier).filter(Supplier.supplier_id == supplier_id).first()
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Supplier {supplier_id} not found."
        )
    
    if supplier_in.supplier_name is not None:
        supplier.supplier_name = supplier_in.supplier_name.strip()
    if supplier_in.contact_person is not None:
        supplier.contact_person = supplier_in.contact_person.strip()
    if supplier_in.phone is not None:
        supplier.phone = supplier_in.phone.strip()
    if supplier_in.email is not None:
        supplier.email = supplier_in.email.strip()
    if supplier_in.lead_time_days is not None:
        supplier.lead_time_days = supplier_in.lead_time_days

    db.commit()
    db.refresh(supplier)
    return supplier

@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a supplier.
    """
    supplier = db.query(Supplier).filter(Supplier.supplier_id == supplier_id).first()
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Supplier {supplier_id} not found."
        )
    db.delete(supplier)
    db.commit()
    return None
