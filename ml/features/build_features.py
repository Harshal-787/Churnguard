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
from sklearn.compose import ColumnTransformer, make_column_selector
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer

class FintechFeatureEngineer(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()
        
        # Safely attempt domain-specific features if columns exist
        if "Balance" in X.columns and "EstimatedSalary" in X.columns:
            X["Balance_to_Salary_Ratio"] = X["Balance"] / (X["EstimatedSalary"] + 1e-6)
            
        if "Tenure" in X.columns and "Age" in X.columns:
            X["Tenure_to_Age_Ratio"] = X["Tenure"] / (X["Age"] + 1e-6)
            
        if "Balance" in X.columns and "CreditScore" in X.columns and "EstimatedSalary" in X.columns:
            X["Credit_Utilization_Proxy"] = X["Balance"] / (X["CreditScore"] * X["EstimatedSalary"] + 1e-6)
            
        if "NumOfProducts" in X.columns and "IsActiveMember" in X.columns and "HasCrCard" in X.columns:
            multi_product = (X["NumOfProducts"] >= 2).astype(int)
            X["Engagement_Score"] = X["IsActiveMember"] + X["HasCrCard"] + multi_product

        return X

def get_preprocessing_pipeline() -> Pipeline:
    # Dynamic column selection for AutoML capability
    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, make_column_selector(dtype_include=np.number)),
            ("cat", categorical_transformer, make_column_selector(dtype_exclude=np.number))
        ],
        remainder="drop" 
    )

    pipeline = Pipeline(steps=[
        ("feature_engineering", FintechFeatureEngineer()),
        ("preprocessor", preprocessor)
    ])

    return pipeline

def get_feature_names(pipeline: Pipeline, original_columns=None) -> list:
    """Extracts feature names dynamically from fitted pipeline."""
    preprocessor = pipeline.named_steps["preprocessor"]
    
    # We must construct a dummy DataFrame to get the feature names out of make_column_selector
    # However, sklearn 1.0+ ColumnTransformer provides get_feature_names_out directly!
    return list(preprocessor.get_feature_names_out())
