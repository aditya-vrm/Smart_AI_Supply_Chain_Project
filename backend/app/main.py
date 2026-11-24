from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import Base, engine
from app.api.v1.endpoints import (
    auth,
    dashboard,
    products,
    suppliers,
    sales,
    inventory,
    forecasting,
    alerts,
    reports,
)

# Ensure tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# Set up CORS middleware
origins = [str(origin) for origin in settings.BACKEND_CORS_ORIGINS]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["Dashboard"])
app.include_router(products.router, prefix=f"{settings.API_V1_STR}/products", tags=["Products"])
app.include_router(suppliers.router, prefix=f"{settings.API_V1_STR}/suppliers", tags=["Suppliers"])
app.include_router(sales.router, prefix=f"{settings.API_V1_STR}/sales", tags=["Sales"])
app.include_router(inventory.router, prefix=f"{settings.API_V1_STR}/inventory", tags=["Inventory"])
app.include_router(forecasting.router, prefix=f"{settings.API_V1_STR}/forecasting", tags=["AI Demand Forecasting"])
app.include_router(alerts.router, prefix=f"{settings.API_V1_STR}/alerts", tags=["Smart Alerts & Reorder"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["Reports & Analytics"])

@app.get("/")
def root():
    return {
        "message": "Welcome to Smart AI Supply Chain & Demand Forecasting API",
        "docs": f"{settings.API_V1_STR}/docs",
        "version": "1.0.0"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
