import sys
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
from sklearn.metrics import accuracy_score, roc_auc_score, f1_score, precision_score, recall_score
from sklearn.base import BaseEstimator, TransformerMixin

class RatioFeatureEngineer(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self
    
    def transform(self, X):
        X = X.copy()
        eps = 1e-6
        X['Trans_Amt_to_Limit_Ratio'] = X['Total_Trans_Amt'] / (X['Credit_Limit'] + eps)
        X['Open_To_Buy_Ratio'] = X['Avg_Open_To_Buy'] / (X['Credit_Limit'] + eps)
        
        cols_to_drop = ['Credit_Limit', 'Total_Trans_Amt', 'Total_Revolving_Bal', 'Avg_Open_To_Buy']
        return X.drop(columns=cols_to_drop)

ROOT = Path(__file__).resolve().parents[2]
DATA_PROC = ROOT / "data" / "processed"
MODEL_DIR = ROOT / "saved_models"

def evaluate(model, X, y, scenario_name):
    print(f"--- Scenario: {scenario_name} ---")
    preds = model.predict(X)
    probs = model.predict_proba(X)[:, 1]
    
    acc = accuracy_score(y, preds)
    auc = roc_auc_score(y, probs)
    f1 = f1_score(y, preds)
    prec = precision_score(y, preds)
    rec = recall_score(y, preds)
    
    print(f"Accuracy:  {acc:.4f}")
    print(f"ROC AUC:   {auc:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"Samples:   {len(y)}\n")
    
    return {"Scenario": scenario_name, "Accuracy": acc, "ROC AUC": auc, "F1": f1, "Precision": prec, "Recall": rec}

def main():
    print("Loading Test Set and Model...")
    test_df = pd.read_csv(DATA_PROC / "bank_churners_test.csv")
    model = joblib.load(MODEL_DIR / "bank_churners_pipeline.joblib")
    
    y = test_df["churn"]
    X = test_df.drop(columns=["churn"])
    
    results = []
    
    # 1. Baseline
    res = evaluate(model, X, y, "Baseline")
    results.append(res)
    
    # 2. Covariate Shift (Macroeconomic Change)
    # Doubling Credit_Limit and Total_Trans_Amt
    X_shift = X.copy()
    X_shift['Credit_Limit'] = X_shift['Credit_Limit'] * 2.0
    X_shift['Total_Trans_Amt'] = X_shift['Total_Trans_Amt'] * 2.0
    res = evaluate(model, X_shift, y, "Covariate Shift (2x Limit, 2x Spend)")
    results.append(res)
    
    # 3. Data Sparsity (Missing values in critical behavior features)
    X_sparse = X.copy()
    np.random.seed(42)
    for col in ['Total_Trans_Ct', 'Months_Inactive_12_mon', 'Total_Relationship_Count']:
        mask = np.random.rand(len(X_sparse)) < 0.15
        X_sparse.loc[mask, col] = np.nan
    res = evaluate(model, X_sparse, y, "Data Sparsity (15% Missing Values)")
    results.append(res)
    
    # 4. Adversarial Subpopulation (Low Engagement Elderly)
    mask = (X['Customer_Age'] >= 60) & (X['Total_Relationship_Count'] < 3)
    X_adv = X[mask].copy()
    y_adv = y[mask].copy()
    if len(y_adv) > 0:
        res = evaluate(model, X_adv, y_adv, "Adversarial Edge Case (Age >= 60, Rel < 3)")
        results.append(res)
    else:
        print("No samples found for Adversarial Edge Case.\n")
        
    print("Stress Testing Complete!")
    
    df_res = pd.DataFrame(results)
    df_res.to_markdown(ROOT / "ml" / "reports" / "stress_test_metrics.md", index=False)

if __name__ == "__main__":
    main()
