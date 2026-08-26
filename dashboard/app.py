"""
ChurnGuard - Analyst Dashboard
------------------------------------------------------------
Internal tool for a FinTech retention team: view at-risk
customers, drill into individual SHAP explanations, and check
model performance.

Run:
    streamlit run dashboard/app.py
"""

import sys
from pathlib import Path

import pandas as pd
import plotly.express as px
import streamlit as st

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from src.models.explain import explain_batch
from src.models.inference import ChurnPredictor

st.set_page_config(page_title="ChurnGuard", page_icon="🛡️", layout="wide")

DATA_PATH = ROOT / "data" / "raw" / "churnguard_customers.csv"
METADATA_PATH = ROOT / "models" / "metadata.json"


@st.cache_resource
def load_predictor():
    return ChurnPredictor()


@st.cache_data
def load_data():
    return pd.read_csv(DATA_PATH)


@st.cache_data
def score_customers(_predictor, df):
    return _predictor.predict(df)


def risk_tier(p):
    if p >= 0.6:
        return "High"
    if p >= 0.3:
        return "Medium"
    return "Low"


# ---------------- Sidebar ----------------
st.sidebar.title("🛡️ ChurnGuard")
st.sidebar.caption("Predictive customer churn detection — FinTech")
page = st.sidebar.radio("Navigate", ["Risk Overview", "Customer Detail", "Model Performance"])

predictor = load_predictor()
raw_df = load_data()
scored_df = score_customers(predictor, raw_df)
scored_df["risk_tier"] = scored_df["churn_probability"].apply(risk_tier)

# ---------------- Page: Risk Overview ----------------
if page == "Risk Overview":
    st.title("Customer Churn Risk Overview")
    st.caption("All customers scored by ChurnGuard, sorted by churn risk.")

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Customers", f"{len(scored_df):,}")
    col2.metric("High Risk", f"{(scored_df['risk_tier'] == 'High').sum():,}")
    col3.metric("Medium Risk", f"{(scored_df['risk_tier'] == 'Medium').sum():,}")
    col4.metric("Avg Churn Probability", f"{scored_df['churn_probability'].mean():.1%}")

    st.markdown("---")

    seg_col = st.selectbox("Segment by", ["salary_band", "channel", "num_products"])
    fig = px.histogram(
        scored_df, x="churn_probability", color=seg_col, nbins=30,
        title=f"Churn Probability Distribution by {seg_col}",
        barmode="overlay", opacity=0.7,
    )
    st.plotly_chart(fig, use_container_width=True)

    st.markdown("### At-Risk Customer List")
    tier_filter = st.multiselect("Filter by risk tier", ["High", "Medium", "Low"], default=["High", "Medium"])
    display_cols = [
        "customer_id", "churn_probability", "risk_tier", "tenure_months",
        "num_products", "is_active_member", "days_since_last_login", "avg_balance",
    ]
    filtered = scored_df[scored_df["risk_tier"].isin(tier_filter)].sort_values(
        "churn_probability", ascending=False
    )
    st.dataframe(filtered[display_cols], use_container_width=True, height=420)
    st.download_button(
        "Download filtered list as CSV",
        filtered[display_cols].to_csv(index=False),
        file_name="churnguard_at_risk_customers.csv",
    )

# ---------------- Page: Customer Detail ----------------
elif page == "Customer Detail":
    st.title("Customer Detail & Explanation")

    customer_id = st.selectbox(
        "Select a customer",
        scored_df.sort_values("churn_probability", ascending=False)["customer_id"].tolist(),
    )
    row = raw_df[raw_df["customer_id"] == customer_id]
    scored_row = scored_df[scored_df["customer_id"] == customer_id].iloc[0]

    col1, col2 = st.columns([1, 2])
    with col1:
        st.metric("Churn Probability", f"{scored_row['churn_probability']:.1%}")
        st.metric("Risk Tier", scored_row["risk_tier"])
        st.markdown("#### Profile")
        st.write(row[[
            "age", "tenure_months", "num_products", "avg_balance",
            "monthly_transactions", "support_tickets_last_90d",
            "days_since_last_login", "salary_band", "channel",
        ]].T.rename(columns={row.index[0]: "value"}))

    with col2:
        st.markdown("#### Why is this customer at risk? (SHAP explanation)")
        with st.spinner("Computing explanation..."):
            explanation = explain_batch(row, top_n=8)[0]
        factors_df = pd.DataFrame(explanation["top_factors"])
        factors_df["abs_impact"] = factors_df["impact"].abs()
        fig = px.bar(
            factors_df.sort_values("abs_impact"),
            x="impact", y="feature", orientation="h",
            color="direction",
            color_discrete_map={"increases risk": "#d62728", "decreases risk": "#2ca02c"},
            title="Top factors driving this prediction",
        )
        st.plotly_chart(fig, use_container_width=True)

# ---------------- Page: Model Performance ----------------
else:
    st.title("Model Performance")

    if not METADATA_PATH.exists():
        st.warning("No model metadata found. Run `python src/models/train.py` first.")
    else:
        import json

        with open(METADATA_PATH) as f:
            meta = json.load(f)

        best = meta["best_model"]
        res = meta["results"][best]

        st.markdown(f"**Selected model:** `{best}`")
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("AUC-ROC", res["auc_roc"])
        col2.metric("Precision", res["precision"])
        col3.metric("Recall", res["recall"])
        col4.metric("Precision @ Top 20%", res["precision_at_top20pct"])

        st.markdown("### Model Comparison")
        comp_df = pd.DataFrame(meta["results"]).T[["auc_roc", "precision", "recall", "f1"]]
        st.dataframe(comp_df, use_container_width=True)

        cm = res["confusion_matrix"]
        cm_df = pd.DataFrame(cm, index=["Actual: No Churn", "Actual: Churn"], columns=["Pred: No Churn", "Pred: Churn"])
        st.markdown("### Confusion Matrix")
        st.dataframe(cm_df, use_container_width=True)

        importance_path = ROOT / "models" / "feature_importance.json"
        if importance_path.exists():
            st.markdown("### Top Global Feature Importance")
            imp = pd.read_json(importance_path, typ="series").sort_values()
            fig = px.bar(x=imp.values, y=imp.index, orientation="h", title="XGBoost Feature Importance")
            st.plotly_chart(fig, use_container_width=True)

        st.markdown("### Model Card")
        model_card_path = ROOT / "docs" / "model_card.md"
        if model_card_path.exists():
            with st.expander("View full Model Card"):
                st.markdown(model_card_path.read_text())
