"""
ChurnGuard - Advanced Feature Engineering Pipeline
------------------------------------------------------------
Uses scikit-learn Pipelines and ColumnTransformer to build
a robust, leak-free preprocessing workflow.
"""
import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

class FintechFeatureEngineer(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()
        
        # Protect against div by zero
        X["Balance_to_Salary_Ratio"] = X["Balance"] / (X["EstimatedSalary"] + 1e-6)
        X["Tenure_to_Age_Ratio"] = X["Tenure"] / (X["Age"] + 1e-6)
        X["Credit_Utilization_Proxy"] = X["Balance"] / (X["CreditScore"] * X["EstimatedSalary"] + 1e-6)
        
        multi_product = (X["NumOfProducts"] >= 2).astype(int)
        X["Engagement_Score"] = X["IsActiveMember"] + X["HasCrCard"] + multi_product

        return X

def get_preprocessing_pipeline() -> Pipeline:
    numeric_features = [
        "CreditScore", "Age", "Tenure", "Balance", "NumOfProducts",
        "HasCrCard", "IsActiveMember", "EstimatedSalary",
        "Balance_to_Salary_Ratio", "Tenure_to_Age_Ratio", 
        "Credit_Utilization_Proxy", "Engagement_Score"
    ]
    
    categorical_features = ["Geography", "Gender"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
        ],
        remainder="drop" 
    )

    pipeline = Pipeline(steps=[
        ("feature_engineering", FintechFeatureEngineer()),
        ("preprocessor", preprocessor)
    ])

    return pipeline

def get_feature_names(pipeline: Pipeline) -> list:
    """Extracts feature names from fitted pipeline."""
    preprocessor = pipeline.named_steps["preprocessor"]
    
    numeric_features = [
        "CreditScore", "Age", "Tenure", "Balance", "NumOfProducts",
        "HasCrCard", "IsActiveMember", "EstimatedSalary",
        "Balance_to_Salary_Ratio", "Tenure_to_Age_Ratio", 
        "Credit_Utilization_Proxy", "Engagement_Score"
    ]
    
    cat_encoder = preprocessor.named_transformers_["cat"]
    cat_features = list(cat_encoder.get_feature_names_out(["Geography", "Gender"]))
    
    return numeric_features + cat_features
