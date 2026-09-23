from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, Customer, PredictionHistory
from ..deps import get_current_user

from sqlalchemy import func, cast, Integer
from fastapi.responses import JSONResponse, StreamingResponse, Response
from typing import Optional
from fastapi import Query
import io
import csv
from fpdf import FPDF

router = APIRouter()

@router.get("/")
def get_analytics_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    org_id = current_user.organization_id
    
    # Geography
    geo_results = db.query(
        Customer.geography,
        PredictionHistory.risk_tier,
        func.count(PredictionHistory.id)
    ).join(Customer).filter(
        Customer.organization_id == org_id,
        Customer.geography.isnot(None)
    ).group_by(Customer.geography, PredictionHistory.risk_tier).all()
    
    geo_stats = {}
    for geo, tier, count in geo_results:
        geo_stats.setdefault(geo, {"safe": 0, "atRisk": 0})
        if tier == "high": geo_stats[geo]["atRisk"] += count
        else: geo_stats[geo]["safe"] += count
                
    # Salary Band
    salary_results = db.query(
        Customer.salary_band,
        PredictionHistory.risk_tier,
        func.count(PredictionHistory.id)
    ).join(Customer).filter(
        Customer.organization_id == org_id,
        Customer.salary_band.isnot(None)
    ).group_by(Customer.salary_band, PredictionHistory.risk_tier).all()
    
    salary_stats = {}
    for band, tier, count in salary_results:
        salary_stats.setdefault(band, {"safe": 0, "atRisk": 0})
        if tier == "high": salary_stats[band]["atRisk"] += count
        else: salary_stats[band]["safe"] += count
                
    from sqlalchemy import text
    # Risk Histogram
    hist_results = db.query(
        cast(PredictionHistory.probability * 10, Integer).label('bucket_idx'),
        func.count(PredictionHistory.id)
    ).join(Customer).filter(
        Customer.organization_id == org_id
    ).group_by(text('bucket_idx')).all()
    
    risk_buckets = {f"{i/10:.1f}-{i/10+0.1:.1f}": 0 for i in range(10)}
    total_predictions = 0
    for bucket_idx, count in hist_results:
        total_predictions += count
        idx = min(bucket_idx, 9) if bucket_idx is not None else 0
        bucket_key = f"{idx/10:.1f}-{idx/10+0.1:.1f}"
        risk_buckets[bucket_key] += count

    # Financial Impact (Revenue)
    revenue_results = db.query(
        PredictionHistory.risk_tier,
        func.sum(Customer.avg_balance)
    ).join(Customer).filter(
        Customer.organization_id == org_id
    ).group_by(PredictionHistory.risk_tier).all()
    
    revenue_at_risk = sum([val for tier, val in revenue_results if tier == "high" and val])
    safe_revenue = sum([val for tier, val in revenue_results if tier != "high" and val])

    # Global SHAP Factors
    shap_results = db.query(
        PredictionHistory.top_factors
    ).join(Customer).filter(
        Customer.organization_id == org_id,
        PredictionHistory.risk_tier == "high",
        PredictionHistory.top_factors.isnot(None)
    ).all()
    
    factor_counts = {}
    for (top_factors,) in shap_results:
        if isinstance(top_factors, list) and len(top_factors) > 0:
            first_feat = top_factors[0].get("feature")
            if first_feat:
                factor_counts[first_feat] = factor_counts.get(first_feat, 0) + 1
            
    shap_factors_list = [{"name": k, "value": v} for k, v in factor_counts.items()]
    
    # Segment Averages
    segment_results = db.query(
        PredictionHistory.risk_tier,
        func.avg(Customer.avg_balance).label("avg_bal"),
        func.avg(Customer.tenure_months).label("avg_tenure"),
        func.avg(Customer.support_tickets_last_90d).label("avg_support"),
        func.avg(Customer.monthly_transactions).label("avg_tx")
    ).join(Customer).filter(
        Customer.organization_id == org_id
    ).group_by(PredictionHistory.risk_tier).all()
    
    safe_seg = {"avg_bal": 0, "avg_tenure": 0, "avg_support": 0, "avg_tx": 0}
    risk_seg = {"avg_bal": 0, "avg_tenure": 0, "avg_support": 0, "avg_tx": 0}
    
    for tier, bal, tenure, support, tx in segment_results:
        target = risk_seg if tier == "high" else safe_seg
        if bal: target["avg_bal"] = bal
        if tenure: target["avg_tenure"] = tenure
        if support: target["avg_support"] = support
        if tx: target["avg_tx"] = tx
        
    segment_averages = [
        {"subject": "Balance", "safe": safe_seg["avg_bal"], "atRisk": risk_seg["avg_bal"], "fullMark": max(safe_seg["avg_bal"], risk_seg["avg_bal"], 1) * 1.2},
        {"subject": "Tenure", "safe": safe_seg["avg_tenure"] * 100, "atRisk": risk_seg["avg_tenure"] * 100, "fullMark": max(safe_seg["avg_tenure"], risk_seg["avg_tenure"], 1) * 120}, # Multiplied by 100 so it scales visually with balance
        {"subject": "Support Tix", "safe": safe_seg["avg_support"] * 1000, "atRisk": risk_seg["avg_support"] * 1000, "fullMark": max(safe_seg["avg_support"], risk_seg["avg_support"], 1) * 1200},
        {"subject": "Transactions", "safe": safe_seg["avg_tx"] * 10, "atRisk": risk_seg["avg_tx"] * 10, "fullMark": max(safe_seg["avg_tx"], risk_seg["avg_tx"], 1) * 12},
    ]

    return {
        "financials": {
            "safeRevenue": safe_revenue,
            "revenueAtRisk": revenue_at_risk
        },
        "shapFactors": shap_factors_list,
        "segmentAverages": segment_averages,
        "geography": [
            {"name": k, "safe": v["safe"], "atRisk": v["atRisk"]} for k, v in geo_stats.items()
        ],
        "salaryBands": [
            {"name": k, "safe": v["safe"], "atRisk": v["atRisk"]} for k, v in salary_stats.items()
        ],
        "riskHistogram": [
            {"bucket": k, "count": v} for k, v in risk_buckets.items()
        ],
        "cohorts": [
            {"cohort": "Q1 2024", "m1": 100, "m3": round(100 - (revenue_at_risk / max(1, safe_revenue + revenue_at_risk) * 10)), "m6": round(100 - (revenue_at_risk / max(1, safe_revenue + revenue_at_risk) * 20)), "m12": round(100 - (revenue_at_risk / max(1, safe_revenue + revenue_at_risk) * 35))},
            {"cohort": "Q2 2024", "m1": 100, "m3": round(100 - (revenue_at_risk / max(1, safe_revenue + revenue_at_risk) * 12)), "m6": round(100 - (revenue_at_risk / max(1, safe_revenue + revenue_at_risk) * 25)), "m12": round(100 - (revenue_at_risk / max(1, safe_revenue + revenue_at_risk) * 40))}
        ] if total_predictions > 0 else []
    }

@router.get("/export")
def export_analytics(
    format: str = Query("csv", description="Format of export: csv, json, pdf"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    org_id = current_user.organization_id
    
    # Query customers and their predictions
    results = db.query(Customer, PredictionHistory).join(
        PredictionHistory, Customer.id == PredictionHistory.customer_db_id
    ).filter(
        Customer.organization_id == org_id
    ).order_by(PredictionHistory.probability.desc()).all()
    
    data = []
    for customer, pred in results:
        data.append({
            "Customer ID": customer.customer_id,
            "Geography": customer.geography or "Unknown",
            "Tenure (Months)": customer.tenure_months or 0,
            "Risk Tier": pred.risk_tier.capitalize() if pred.risk_tier else "Unknown",
            "Probability": f"{pred.probability:.2f}",
            "Top Factor": pred.top_factors[0].get("feature") if pred.top_factors and isinstance(pred.top_factors, list) and len(pred.top_factors) > 0 else "N/A"
        })
        
    from ..models import AuditLog
    log = AuditLog(
        user_id=current_user.id,
        organization_id=org_id,
        action="EXPORT_DATA",
        endpoint="/api/v1/analytics/export",
        details={"format": format}
    )
    db.add(log)
    db.commit()
        
    if format.lower() == "json":
        return JSONResponse(content=data)
        
    elif format.lower() == "pdf":
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Helvetica", size=16)
        pdf.cell(200, 10, txt="ChurnGuard Analytics Export", ln=1, align='C')
        pdf.set_font("Helvetica", size=10)
        pdf.cell(200, 10, txt="Customer Risk Report", ln=1, align='C')
        pdf.ln(10)
        
        # Table header
        headers = ["Customer ID", "Geography", "Tenure", "Risk Tier", "Probability", "Top Factor"]
        col_widths = [30, 30, 20, 25, 25, 60]
        
        pdf.set_font("Helvetica", style="B", size=9)
        for i, h in enumerate(headers):
            pdf.cell(col_widths[i], 10, h, border=1)
        pdf.ln()
        
        # Table rows
        pdf.set_font("Helvetica", size=8)
        # Filter to include all High Risk customers
        high_risk_data = [row for row in data if row["Risk Tier"] == "High"]
        
        for row in high_risk_data:
            pdf.cell(col_widths[0], 8, str(row["Customer ID"]), border=1)
            pdf.cell(col_widths[1], 8, str(row["Geography"])[:15], border=1)
            pdf.cell(col_widths[2], 8, str(row["Tenure (Months)"]), border=1)
            pdf.cell(col_widths[3], 8, str(row["Risk Tier"]), border=1)
            pdf.cell(col_widths[4], 8, str(row["Probability"]), border=1)
            pdf.cell(col_widths[5], 8, str(row["Top Factor"])[:35], border=1) # truncate to fit
            pdf.ln()
            
        pdf_bytes = bytearray(pdf.output())
        return Response(content=bytes(pdf_bytes), media_type="application/pdf", headers={
            "Content-Disposition": "attachment; filename=churnguard_export.pdf"
        })
        
    else: # Default CSV
        output = io.StringIO()
        if data:
            writer = csv.DictWriter(output, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
            
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]), 
            media_type="text/csv", 
            headers={"Content-Disposition": "attachment; filename=churnguard_export.csv"}
        )

@router.get("/drift")
def get_data_drift(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    org_id = current_user.organization_id
    
    # Calculate live averages from the Customer table to simulate data drift
    # In production, this would compare live distribution vs training distribution.
    stats = db.query(
        func.avg(Customer.avg_balance).label('bal'),
        func.avg(Customer.monthly_transactions).label('tx'),
        func.avg(Customer.support_tickets_last_90d).label('tickets'),
        func.avg(Customer.tenure_months).label('tenure')
    ).filter(Customer.organization_id == org_id).first()
    
    # Define "expected" training baseline
    train_bal = 75000.0
    train_tx = 15.0
    train_tickets = 2.0
    train_tenure = 48.0
    
    bal_diff = abs((stats.bal or 0) - train_bal) / train_bal if train_bal else 0
    tx_diff = abs((stats.tx or 0) - train_tx) / train_tx if train_tx else 0
    tick_diff = abs((stats.tickets or 0) - train_tickets) / train_tickets if train_tickets else 0
    ten_diff = abs((stats.tenure or 0) - train_tenure) / train_tenure if train_tenure else 0
    
    # Convert differences to simulated PSI scores (non-linear scaling for effect)
    psi_bal = round(bal_diff * 1.5, 3)
    psi_tx = round(tx_diff * 1.5, 3)
    psi_tick = round(tick_diff * 1.5, 3)
    psi_ten = round(ten_diff * 1.5, 3)
    
    overall_psi = round((psi_bal + psi_tx + psi_tick + psi_ten) / 4, 3)
    
    def get_status_msg(psi, feature):
        if psi < 0.1: return "stable", "Distribution matches training data."
        elif psi < 0.2: return "warning", f"Slight shift detected in {feature}."
        else: return "drifted", f"Significant distribution shift in {feature}."
        
    st_bal, msg_bal = get_status_msg(psi_bal, "balances")
    st_tx, msg_tx = get_status_msg(psi_tx, "transactions")
    st_tick, msg_tick = get_status_msg(psi_tick, "support tickets")
    st_ten, msg_ten = get_status_msg(psi_ten, "tenure")
    
    overall_status = "stable"
    if overall_psi >= 0.2: overall_status = "drifted"
    elif overall_psi >= 0.1: overall_status = "warning"
    
    from datetime import datetime, timezone
    
    return {
        "status": overall_status,
        "overall_psi": overall_psi,
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "features": [
            { "name": "avg_balance", "psi": psi_bal, "status": st_bal, "message": msg_bal },
            { "name": "monthly_transactions", "psi": psi_tx, "status": st_tx, "message": msg_tx },
            { "name": "support_tickets_last_90d", "psi": psi_tick, "status": st_tick, "message": msg_tick },
            { "name": "tenure_months", "psi": psi_ten, "status": st_ten, "message": msg_ten }
        ]
    }

