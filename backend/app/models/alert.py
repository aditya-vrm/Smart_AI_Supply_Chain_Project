from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class SmartAlert(Base):
    __tablename__ = "smart_alerts"

    alert_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False, index=True)
    alert_type = Column(String(50), nullable=False)  # "LOW_STOCK", "OVERSTOCK", "OPTIMAL"
    recommended_qty = Column(Integer, default=0, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(50), default="ACTIVE", nullable=False)  # "ACTIVE", "RESOLVED"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    product = relationship("Product", back_populates="alerts")
