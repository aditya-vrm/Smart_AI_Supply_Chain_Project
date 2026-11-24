import io
from datetime import datetime
from sqlalchemy.orm import Session
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.sale import Sale
from app.models.forecast import Forecast
from app.models.alert import SmartAlert

def generate_excel_report(db: Session) -> io.BytesIO:
    """
    Generates a multi-sheet formatted Excel workbook (.xlsx).
    """
    wb = Workbook()
    ws_exec = wb.active
    ws_exec.title = "Executive Summary"

    # Styling helpers
    header_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    title_font = Font(name="Calibri", size=16, bold=True, color="0F172A")
    subtitle_font = Font(name="Calibri", size=11, italic=True, color="64748B")
    data_font = Font(name="Calibri", size=10)
    bold_font = Font(name="Calibri", size=10, bold=True)
    border_thin = Border(
        left=Side(style='thin', color='E2E8F0'),
        right=Side(style='thin', color='E2E8F0'),
        top=Side(style='thin', color='E2E8F0'),
        bottom=Side(style='thin', color='E2E8F0')
    )

    # 1. Executive Summary Sheet
    ws_exec["A1"] = "Smart AI Supply Chain & Demand Forecasting Report"
    ws_exec["A1"].font = title_font
    ws_exec["A2"] = f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}"
    ws_exec["A2"].font = subtitle_font

    products = db.query(Product).all()
    inventory_items = db.query(Inventory).all()
    sales = db.query(Sale).all()
    alerts = db.query(SmartAlert).filter(SmartAlert.status == "ACTIVE").all()

    total_products = len(products)
    total_inventory_value = sum(
        (inv.current_stock * (inv.product.unit_price if inv.product else 0))
        for inv in inventory_items
    )
    total_sales_revenue = sum(s.total_amount for s in sales)
    total_units_sold = sum(s.quantity_sold for s in sales)
    active_alerts_count = len(alerts)

    kpi_rows = [
        ("Total Managed Products", total_products),
        ("Total Current Inventory Value ($)", f"${total_inventory_value:,.2f}"),
        ("Total Historical Sales Revenue ($)", f"${total_sales_revenue:,.2f}"),
        ("Total Units Sold Across History", f"{total_units_sold:,}"),
        ("Active Stock Alerts", active_alerts_count),
    ]

    ws_exec.append([])
    ws_exec.append(["Key Performance Indicator", "Value"])
    for cell in ws_exec[4]:
        cell.fill = header_fill
        cell.font = header_font

    for label, val in kpi_rows:
        ws_exec.append([label, val])
        for cell in ws_exec[ws_exec.max_row]:
            cell.font = data_font
            cell.border = border_thin

    # 2. Inventory Valuation Sheet
    ws_inv = wb.create_sheet(title="Inventory Valuation")
    ws_inv.append(["SKU Code", "Product Name", "Category", "Unit Price ($)", "Current Stock", "Total Value ($)", "Reorder Level", "Max Stock", "Health Status"])
    for cell in ws_inv[1]:
        cell.fill = header_fill
        cell.font = header_font

    for inv in inventory_items:
        prod = inv.product
        price = prod.unit_price if prod else 0.0
        val = inv.current_stock * price
        status = "OPTIMAL"
        if inv.current_stock <= inv.reorder_level:
            status = "LOW_STOCK"
        elif inv.current_stock > inv.max_stock:
            status = "OVERSTOCK"

        ws_inv.append([
            prod.sku_code if prod else "N/A",
            prod.product_name if prod else "N/A",
            prod.category if prod else "N/A",
            price,
            inv.current_stock,
            val,
            inv.reorder_level,
            inv.max_stock,
            status
        ])
        for cell in ws_inv[ws_inv.max_row]:
            cell.font = data_font
            cell.border = border_thin

    # 3. Active Alerts & Reorder Sheet
    ws_alerts = wb.create_sheet(title="Smart Alerts & Reorder")
    ws_alerts.append(["Product SKU", "Product Name", "Alert Type", "Current Stock", "Recommended Reorder Qty", "Status", "Alert Message"])
    for cell in ws_alerts[1]:
        cell.fill = header_fill
        cell.font = header_font

    for a in alerts:
        prod = a.product
        inv = prod.inventory if prod else None
        c_stock = inv.current_stock if inv else 0
        ws_alerts.append([
            prod.sku_code if prod else "N/A",
            prod.product_name if prod else "N/A",
            a.alert_type,
            c_stock,
            a.recommended_qty,
            a.status,
            a.message
        ])
        for cell in ws_alerts[ws_alerts.max_row]:
            cell.font = data_font
            cell.border = border_thin

    # Auto-adjust column widths on all sheets
    for ws in wb.worksheets:
        for col in ws.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = col[0].column_letter
            ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return buf

def generate_pdf_report(db: Session) -> io.BytesIO:
    """
    Generates a clean, professional PDF executive report using ReportLab.
    """
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A')
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B')
    )
    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#1E3A8A'),
        spaceBefore=14,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'TableBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#0F172A')
    )
    bold_body_style = ParagraphStyle(
        'TableBodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#0F172A')
    )

    elements = []

    # Title & Metadata
    elements.append(Paragraph("Smart AI Supply Chain & Demand Forecasting", title_style))
    elements.append(Paragraph(f"Executive Operations Report &bull; Generated: {datetime.utcnow().strftime('%B %d, %Y %H:%M UTC')}", subtitle_style))
    elements.append(Spacer(1, 14))

    # Aggregates
    products = db.query(Product).all()
    inventory_items = db.query(Inventory).all()
    sales = db.query(Sale).all()
    alerts = db.query(SmartAlert).filter(SmartAlert.status == "ACTIVE").all()

    total_products = len(products)
    total_val = sum((inv.current_stock * (inv.product.unit_price if inv.product else 0)) for inv in inventory_items)
    total_revenue = sum(s.total_amount for s in sales)
    active_alerts_cnt = len(alerts)

    # 1. KPI Summary Block
    elements.append(Paragraph("1. Executive Summary & KPIs", section_style))
    kpi_data = [
        [Paragraph("<b>Metric</b>", bold_body_style), Paragraph("<b>Current Figure</b>", bold_body_style)],
        [Paragraph("Total Active Products", body_style), Paragraph(f"{total_products}", body_style)],
        [Paragraph("Total Inventory Valuation", body_style), Paragraph(f"${total_val:,.2f}", body_style)],
        [Paragraph("Total Historical Sales Revenue", body_style), Paragraph(f"${total_revenue:,.2f}", body_style)],
        [Paragraph("Active Stock Alerts", body_style), Paragraph(f"{active_alerts_cnt} alert(s)", body_style)],
    ]
    kpi_table = Table(kpi_data, colWidths=[270, 270])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#0F172A')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
    ]))
    elements.append(kpi_table)
    elements.append(Spacer(1, 14))

    # 2. Critical Smart Alerts & Reorders
    elements.append(Paragraph("2. Active Stock Alerts & Reorder Recommendations", section_style))
    alert_rows = [
        [
            Paragraph("<b>Product SKU</b>", bold_body_style),
            Paragraph("<b>Product Name</b>", bold_body_style),
            Paragraph("<b>Type</b>", bold_body_style),
            Paragraph("<b>Stock</b>", bold_body_style),
            Paragraph("<b>Recommended Qty</b>", bold_body_style)
        ]
    ]

    for a in alerts[:6]:
        prod = a.product
        inv = prod.inventory if prod else None
        stock_cnt = inv.current_stock if inv else 0
        alert_rows.append([
            Paragraph(prod.sku_code if prod else "N/A", body_style),
            Paragraph(prod.product_name[:30] if prod else "N/A", body_style),
            Paragraph(a.alert_type, bold_body_style),
            Paragraph(str(stock_cnt), body_style),
            Paragraph(str(a.recommended_qty), bold_body_style)
        ])

    if len(alerts) == 0:
        alert_rows.append([Paragraph("No active alerts. All stock optimal.", body_style), Paragraph("", body_style), Paragraph("", body_style), Paragraph("", body_style), Paragraph("", body_style)])

    alert_table = Table(alert_rows, colWidths=[90, 180, 90, 70, 110])
    alert_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3A8A')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    elements.append(alert_table)
    elements.append(Spacer(1, 14))

    # 3. Product Catalog & Inventory Health Snapshot
    elements.append(Paragraph("3. Product Inventory Valuation Snapshot", section_style))
    prod_rows = [
        [
            Paragraph("<b>SKU</b>", bold_body_style),
            Paragraph("<b>Category</b>", bold_body_style),
            Paragraph("<b>Unit Price</b>", bold_body_style),
            Paragraph("<b>Current Stock</b>", bold_body_style),
            Paragraph("<b>Valuation</b>", bold_body_style)
        ]
    ]
    for inv in inventory_items[:8]:
        prod = inv.product
        price = prod.unit_price if prod else 0.0
        val = inv.current_stock * price
        prod_rows.append([
            Paragraph(prod.sku_code if prod else "N/A", body_style),
            Paragraph(prod.category if prod else "N/A", body_style),
            Paragraph(f"${price:.2f}", body_style),
            Paragraph(str(inv.current_stock), body_style),
            Paragraph(f"${val:,.2f}", body_style)
        ])

    prod_table = Table(prod_rows, colWidths=[90, 140, 100, 100, 110])
    prod_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    elements.append(prod_table)

    doc.build(elements)
    buf.seek(0)
    return buf
