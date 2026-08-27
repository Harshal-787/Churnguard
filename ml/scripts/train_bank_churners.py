import os
import sys
from pathlib import Path

import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import RobustScaler, OneHotEncoder, OrdinalEncoder
from sklearn.impute import SimpleImputer
from sklearn.base import BaseEstimator, TransformerMixin
from xgboost import XGBClassifier

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
DATA_RAW = ROOT / "data" / "raw"
DATA_PROC = ROOT / "data" / "processed"
MODEL_DIR = ROOT / "saved_models"

def main():
    print("Loading Bank Churners dataset...")
    df = pd.read_csv(DATA_RAW / "BankChurners.csv")
    
    # 1. Clean columns (Drop leaks and IDs)
    cols_to_drop = ["CLIENTNUM"] + [col for col in df.columns if "Naive_Bayes" in col]
    df = df.drop(columns=cols_to_drop)
    
    # 2. Target Variable mapping
    # Attrition_Flag: Existing Customer -> 0, Attrited Customer -> 1
    df["churn"] = (df["Attrition_Flag"] == "Attrited Customer").astype(int)
    y = df["churn"]
    X = df.drop(columns=["Attrition_Flag", "churn"])
    
    print(f"Data shape: {X.shape}")
    print(f"Churn rate: {y.mean():.2%}")
    
    # Calculate scale_pos_weight for imbalance
    # negative class (0) / positive class (1)
    neg_count = (y == 0).sum()
    pos_count = (y == 1).sum()
    spw = neg_count / pos_count
    print(f"Calculated scale_pos_weight: {spw:.2f}")

    # 3. Define feature groups
    num_cols = [
        "Customer_Age", "Dependent_count", "Months_on_book", 
        "Total_Relationship_Count", "Months_Inactive_12_mon", 
        "Contacts_Count_12_mon", "Total_Amt_Chng_Q4_Q1", 
        "Total_Trans_Ct", "Total_Ct_Chng_Q4_Q1", "Avg_Utilization_Ratio",
        "Trans_Amt_to_Limit_Ratio", "Open_To_Buy_Ratio"
    ]
    
    nominal_cols = ["Gender", "Marital_Status"]
    
    # Ordinal categories (in correct hierarchical order)
    edu_cats = [['Unknown', 'Uneducated', 'High School', 'College', 'Graduate', 'Post-Graduate', 'Doctorate']]
    inc_cats = [['Unknown', 'Less than $40K', '$40K - $60K', '$60K - $80K', '$80K - $120K', '$120K +']]
    card_cats = [['Blue', 'Silver', 'Gold', 'Platinum']]
    
    num_transformer = Pipeline([('imputer', SimpleImputer(strategy='median')), ('scaler', RobustScaler())])
    nom_transformer = Pipeline([('imputer', SimpleImputer(strategy='most_frequent')), ('encoder', OneHotEncoder(drop='first', sparse_output=False))])
    edu_transformer = Pipeline([('imputer', SimpleImputer(strategy='most_frequent')), ('encoder', OrdinalEncoder(categories=edu_cats))])
    inc_transformer = Pipeline([('imputer', SimpleImputer(strategy='most_frequent')), ('encoder', OrdinalEncoder(categories=inc_cats))])
    card_transformer = Pipeline([('imputer', SimpleImputer(strategy='most_frequent')), ('encoder', OrdinalEncoder(categories=card_cats))])
    
    # 4. Build Preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_transformer, num_cols),
            ('nom', nom_transformer, nominal_cols),
            ('edu', edu_transformer, ['Education_Level']),
            ('inc', inc_transformer, ['Income_Category']),
            ('card', card_transformer, ['Card_Category'])
        ],
        remainder='passthrough'
    )
    
    # 5. Build Pipeline
    pipeline = Pipeline(steps=[
        ('ratio_features', RatioFeatureEngineer()),
        ('preprocessor', preprocessor),
        ('classifier', XGBClassifier(
            scale_pos_weight=spw,
            eval_metric="logloss",
            random_state=42,
            n_estimators=100,
            max_depth=4,
            learning_rate=0.1
        ))
    ])
    
    # 6. Train-Test Split
    print("Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # 7. Train Model
    print("Training XGBoost Pipeline...")
    pipeline.fit(X_train, y_train)
    
    # Evaluate baseline on test set
    train_acc = pipeline.score(X_train, y_train)
    test_acc = pipeline.score(X_test, y_test)
    print(f"Train Accuracy: {train_acc:.4f}")
    print(f"Test Accuracy: {test_acc:.4f}")
    
    # 8. Save artifacts
    print("Saving pipeline and test set...")
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    DATA_PROC.mkdir(parents=True, exist_ok=True)
    
    joblib.dump(pipeline, MODEL_DIR / "bank_churners_pipeline.joblib")
    
    # Save test dataset (X_test + y_test) for stress testing
    df_test = X_test.copy()
    df_test["churn"] = y_test
    df_test.to_csv(DATA_PROC / "bank_churners_test.csv", index=False)
    print("Done!")

if __name__ == "__main__":
    main()
