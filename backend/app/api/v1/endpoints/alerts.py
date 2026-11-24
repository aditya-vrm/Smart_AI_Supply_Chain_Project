from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.deps import get_db, get_current_user
from app.models.user import User
from app.models.alert import SmartAlert
from app.schemas.alert import AlertResponse, AlertUpdate
from app.services.alert_engine import evaluate_smart_alerts

router = APIRouter()

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    status: Optional[str] = Query("ACTIVE", description="Filter by status (ACTIVE, RESOLVED, ALL)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    List stock alerts with status filtering.
    """
    query = db.query(SmartAlert)
    if status and status != "ALL":
        query = query.filter(SmartAlert.status == status)
    return query.order_by(SmartAlert.created_at.desc()).all()

@router.put("/{alert_id}/resolve", response_model=AlertResponse)
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Mark a smart alert as RESOLVED.
    """
    alert = db.query(SmartAlert).filter(SmartAlert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with id {alert_id} not found."
        )
    alert.status = "RESOLVED"
    db.commit()
    db.refresh(alert)
    return alert

@router.post("/evaluate", response_model=List[AlertResponse])
def trigger_alert_evaluation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Manually trigger evaluation of all products against forecasted demand.
    """
    alerts = evaluate_smart_alerts(db)
    return alerts
