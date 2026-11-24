import io
from datetime import datetime
from typing import Tuple, List
import pandas as pd
from sqlalchemy.orm import Session
from app.models.product import Product
from app.models.sale import Sale
from app.models.inventory import Inventory

def import_sales_data(
    file_bytes: bytes,
    filename: str,
    db: Session
) -> Tuple[int, int, int, List[str]]:
    """
    Parses CSV or Excel sales data, validates rows, saves Sales, and updates Inventory.
    Returns: (total_rows, successful_rows, failed_rows, errors)
    """
    errors: List[str] = []
    try:
        if filename.endswith(".xlsx") or filename.endswith(".xls"):
            df = pd.read_excel(io.BytesIO(file_bytes))
        else:
            df = pd.read_csv(io.BytesIO(file_bytes))
    except Exception as e:
        return 0, 0, 0, [f"Failed to parse file: {str(e)}"]

    # Normalize column names: lowercase, strip whitespace, replace spaces with underscores
    df.columns = [str(col).strip().lower().replace(" ", "_") for col in df.columns]

    required_candidates = [
        {"sku_code", "quantity_sold"},
        {"product_id", "quantity_sold"}
    ]
    has_valid_columns = any(cand.issubset(df.columns) for cand in required_candidates)
    if not has_valid_columns:
        return len(df), 0, len(df), [
            "Missing required columns. File must contain ('sku_code' OR 'product_id') and 'quantity_sold'."
        ]

    total_rows = len(df)
    successful_rows = 0
    failed_rows = 0

    # Cache products for fast lookup
    products_by_sku = {p.sku_code.upper(): p for p in db.query(Product).all()}
    products_by_id = {p.product_id: p for p in db.query(Product).all()}

    sales_to_insert = []
    inventory_updates = {}

    for index, row in df.iterrows():
        row_num = index + 2  # 1-indexed header + 1
        try:
            # Resolve product
            product = None
            if "sku_code" in df.columns and pd.notna(row["sku_code"]):
                sku = str(row["sku_code"]).strip().upper()
                product = products_by_sku.get(sku)
            elif "product_id" in df.columns and pd.notna(row["product_id"]):
                pid = int(row["product_id"])
                product = products_by_id.get(pid)

            if not product:
                errors.append(f"Row {row_num}: Product not found.")
                failed_rows += 1
                continue

            # Validate quantity
            try:
                qty = int(row["quantity_sold"])
                if qty <= 0:
                    errors.append(f"Row {row_num}: Quantity sold must be greater than 0.")
                    failed_rows += 1
                    continue
            except (ValueError, TypeError):
                errors.append(f"Row {row_num}: Invalid quantity '{row.get('quantity_sold')}'.")
                failed_rows += 1
                continue

            # Parse sale date
            sale_date = datetime.utcnow()
            if "sale_date" in df.columns and pd.notna(row["sale_date"]):
                try:
                    parsed_date = pd.to_datetime(row["sale_date"])
                    sale_date = parsed_date.to_pydatetime()
                except Exception:
                    pass

            # Calculate total amount
            if "total_amount" in df.columns and pd.notna(row["total_amount"]):
                try:
                    total_amt = float(row["total_amount"])
                except Exception:
                    total_amt = round(qty * product.unit_price, 2)
            else:
                total_amt = round(qty * product.unit_price, 2)

            # Region
            region = "North"
            if "region" in df.columns and pd.notna(row["region"]):
                region = str(row["region"]).strip()

            sale = Sale(
                product_id=product.product_id,
                sale_date=sale_date,
                quantity_sold=qty,
                total_amount=total_amt,
                region=region
            )
            sales_to_insert.append(sale)

            # Update inventory cache
            inventory_updates[product.product_id] = inventory_updates.get(product.product_id, 0) + qty
            successful_rows += 1

        except Exception as ex:
            errors.append(f"Row {row_num}: Unexpected error: {str(ex)}")
            failed_rows += 1

    if sales_to_insert:
        db.add_all(sales_to_insert)

        # Deduct stock in inventory
        for pid, total_sold in inventory_updates.items():
            inv = db.query(Inventory).filter(Inventory.product_id == pid).first()
            if inv:
                inv.current_stock = max(0, inv.current_stock - total_sold)
                inv.last_updated = datetime.utcnow()

        db.commit()

    return total_rows, successful_rows, failed_rows, errors[:25]
