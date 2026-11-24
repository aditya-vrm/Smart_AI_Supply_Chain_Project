import random
from datetime import datetime, timedelta
from app.db.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.supplier import Supplier
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.sale import Sale
from app.models.forecast import Forecast
from app.models.alert import SmartAlert
from app.core.security import get_password_hash

def seed_database():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if already seeded
        existing_user = db.query(User).filter(User.email == "admin@sbu.edu").first()
        if existing_user:
            print("Database already seeded with admin user.")
            return

        print("Seeding admin user...")
        admin = User(
            username="Admin",
            email="admin@sbu.edu",
            password_hash=get_password_hash("admin123"),
            role="admin",
            created_at=datetime.utcnow()
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        print("Seeding 5 suppliers...")
        suppliers_data = [
            {
                "supplier_name": "Apex Global Logistics & Parts",
                "contact_person": "Marcus Vance",
                "phone": "+1 (555) 234-5678",
                "email": "mvance@apexlogistics.com",
                "lead_time_days": 7
            },
            {
                "supplier_name": "Nexus Microelectronics Corp",
                "contact_person": "Elena Rostova",
                "phone": "+1 (555) 876-5432",
                "email": "erostova@nexusmicro.io",
                "lead_time_days": 14
            },
            {
                "supplier_name": "Vanguard Precision Polymers",
                "contact_person": "Kenji Sato",
                "phone": "+1 (555) 345-6789",
                "email": "ksato@vanguardpolymers.com",
                "lead_time_days": 10
            },
            {
                "supplier_name": "OmniPackaging Solutions",
                "contact_person": "Sarah Jenkins",
                "phone": "+1 (555) 987-6543",
                "email": "sjenkins@omnipackaging.com",
                "lead_time_days": 5
            },
            {
                "supplier_name": "Titan Industrial Hardware",
                "contact_person": "David Miller",
                "phone": "+1 (555) 456-7890",
                "email": "dmiller@titanindustrial.com",
                "lead_time_days": 21
            }
        ]

        supplier_objects = []
        for s in suppliers_data:
            supplier = Supplier(**s)
            db.add(supplier)
            supplier_objects.append(supplier)
        db.commit()
        for s in supplier_objects:
            db.refresh(s)

        print("Seeding 10 products & inventory records...")
        products_data = [
            {
                "sku_code": "SKU-ELEC-101",
                "product_name": "ARM Cortex-M4 IoT Controller Board",
                "category": "Electronics",
                "unit_price": 45.50,
                "supplier_id": supplier_objects[1].supplier_id,
                "current_stock": 18,     # Low stock (reorder is 30)
                "reorder_level": 30,
                "max_stock": 250
            },
            {
                "sku_code": "SKU-ELEC-102",
                "product_name": "Precision Ultrasonic Distance Sensor",
                "category": "Electronics",
                "unit_price": 18.75,
                "supplier_id": supplier_objects[1].supplier_id,
                "current_stock": 145,    # Optimal
                "reorder_level": 40,
                "max_stock": 300
            },
            {
                "sku_code": "SKU-ELEC-103",
                "product_name": "High-Density LiPo Battery Pack 5000mAh",
                "category": "Electronics",
                "unit_price": 32.00,
                "supplier_id": supplier_objects[1].supplier_id,
                "current_stock": 550,    # Overstock (max 400)
                "reorder_level": 50,
                "max_stock": 400
            },
            {
                "sku_code": "SKU-IND-201",
                "product_name": "Heavy-Duty Stainless Steel Flange 4-Inch",
                "category": "Industrial Hardware",
                "unit_price": 84.00,
                "supplier_id": supplier_objects[4].supplier_id,
                "current_stock": 12,     # Low stock (reorder is 25)
                "reorder_level": 25,
                "max_stock": 150
            },
            {
                "sku_code": "SKU-IND-202",
                "product_name": "High-Torque Planetary Gear Motor 24V",
                "category": "Industrial Hardware",
                "unit_price": 125.00,
                "supplier_id": supplier_objects[4].supplier_id,
                "current_stock": 65,     # Optimal
                "reorder_level": 20,
                "max_stock": 120
            },
            {
                "sku_code": "SKU-POLY-301",
                "product_name": "Reinforced Fluoropolymer O-Ring Kit",
                "category": "Raw Materials",
                "unit_price": 14.20,
                "supplier_id": supplier_objects[2].supplier_id,
                "current_stock": 210,    # Optimal
                "reorder_level": 60,
                "max_stock": 400
            },
            {
                "sku_code": "SKU-POLY-302",
                "product_name": "Industrial Anti-Static Polyethylene Film",
                "category": "Raw Materials",
                "unit_price": 28.50,
                "supplier_id": supplier_objects[2].supplier_id,
                "current_stock": 15,     # Low stock (reorder is 35)
                "reorder_level": 35,
                "max_stock": 200
            },
            {
                "sku_code": "SKU-LOG-401",
                "product_name": "Pallet High-Strength Stretch Wrap (6-Roll)",
                "category": "Packaging",
                "unit_price": 54.00,
                "supplier_id": supplier_objects[3].supplier_id,
                "current_stock": 80,     # Optimal
                "reorder_level": 30,
                "max_stock": 180
            },
            {
                "sku_code": "SKU-LOG-402",
                "product_name": "Heavy Wall Double Corrugated Carton Boxes",
                "category": "Packaging",
                "unit_price": 3.75,
                "supplier_id": supplier_objects[3].supplier_id,
                "current_stock": 1200,   # Overstock (max 800)
                "reorder_level": 200,
                "max_stock": 800
            },
            {
                "sku_code": "SKU-LOG-403",
                "product_name": "Smart RFID Logistics Asset Tags (Pack of 100)",
                "category": "Logistics Supplies",
                "unit_price": 95.00,
                "supplier_id": supplier_objects[0].supplier_id,
                "current_stock": 45,     # Optimal
                "reorder_level": 15,
                "max_stock": 100
            }
        ]

        product_objects = []
        for p in products_data:
            prod = Product(
                sku_code=p["sku_code"],
                product_name=p["product_name"],
                category=p["category"],
                unit_price=p["unit_price"],
                supplier_id=p["supplier_id"]
            )
            db.add(prod)
            db.flush()  # to get prod.product_id

            inv = Inventory(
                product_id=prod.product_id,
                current_stock=p["current_stock"],
                reorder_level=p["reorder_level"],
                max_stock=p["max_stock"],
                last_updated=datetime.utcnow()
            )
            db.add(inv)
            product_objects.append((prod, p))

        db.commit()

        print("Seeding 550+ historical sales records across 180 days...")
        regions = ["North", "South", "East", "West", "Central"]
        now = datetime.utcnow()
        sales_count = 0

        # Generate realistic time series data
        for prod, p_meta in product_objects:
            base_sales = random.randint(3, 12)
            for day_offset in range(180, 0, -1):
                sale_date = (now - timedelta(days=day_offset)).replace(
                    hour=random.randint(9, 18),
                    minute=random.randint(0, 59),
                    second=0
                )
                
                # Introduce slight weekly seasonality (higher on weekdays, lower on weekends)
                weekday = sale_date.weekday()
                multiplier = 1.2 if weekday in [1, 2, 3] else (0.7 if weekday == 6 else 1.0)
                
                # Introduce occasional promotional spikes or quiet days
                if random.random() < 0.75:  # 75% chance of sale on that day
                    qty = max(1, int(random.gauss(base_sales * multiplier, 2)))
                    amount = round(qty * prod.unit_price, 2)
                    region = random.choice(regions)

                    sale = Sale(
                        product_id=prod.product_id,
                        sale_date=sale_date,
                        quantity_sold=qty,
                        total_amount=amount,
                        region=region
                    )
                    db.add(sale)
                    sales_count += 1

        db.commit()
        print(f"Successfully seeded {sales_count} sales transactions.")

        print("Seeding initial smart alerts...")
        alerts_data = [
            {
                "product_id": product_objects[0][0].product_id,
                "alert_type": "LOW_STOCK",
                "recommended_qty": 65,
                "message": "Stock (18 units) fell below 30-day forecast demand (83 units). Recommended reorder: 65 units.",
                "status": "ACTIVE"
            },
            {
                "product_id": product_objects[2][0].product_id,
                "alert_type": "OVERSTOCK",
                "recommended_qty": 0,
                "message": "Current stock (550 units) exceeds double the forecasted demand (210 units). Risk of holding costs.",
                "status": "ACTIVE"
            },
            {
                "product_id": product_objects[3][0].product_id,
                "alert_type": "LOW_STOCK",
                "recommended_qty": 45,
                "message": "Stock (12 units) is critically below reorder threshold (25 units). Recommended reorder: 45 units.",
                "status": "ACTIVE"
            },
            {
                "product_id": product_objects[8][0].product_id,
                "alert_type": "OVERSTOCK",
                "recommended_qty": 0,
                "message": "Current stock (1200 units) significantly exceeds max warehouse capacity (800 units).",
                "status": "ACTIVE"
            }
        ]

        for a in alerts_data:
            alert = SmartAlert(
                product_id=a["product_id"],
                alert_type=a["alert_type"],
                recommended_qty=a["recommended_qty"],
                message=a["message"],
                status=a["status"],
                created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 24))
            )
            db.add(alert)
        db.commit()

        print("Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
