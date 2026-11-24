from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Sale(Base):
    __tablename__ = "sales"

    sale_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False, index=True)
    sale_date = Column(DateTime, nullable=False, index=True)
    quantity_sold = Column(Integer, nullable=False)
    total_amount = Column(Float, nullable=False)
    region = Column(String(100), default="North", nullable=False)

    product = relationship("Product", back_populates="sales")
