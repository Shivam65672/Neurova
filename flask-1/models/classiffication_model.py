import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from catboost import CatBoostClassifier, Pool


def train_catboost_classifier(
    df_features, categorical_cols=["diabetic", "trend_direction"]
):
    df = df_features.copy()
    
    # Encode target variable
    if df["bp_stage"].dtype == object:
        le = LabelEncoder()
        df["bp_stage_code"] = le.fit_transform(df["bp_stage"])
    else:
        df["bp_stage_code"] = df["bp_stage"]
        le = None

    # Drop unnecessary columns - including duplicate Gender/Age/Diabetes columns
    cols_to_drop = [
        "bp_stage", "bp_stage_code", "patient_id", "Name", "Health",
        "Gender",  # Drop original Gender column
        "Age",     # Drop original Age column (we use lowercase 'age')
        "Diabetes", # Drop original Diabetes column (we use 'diabetic')
        "Smoker",  # Drop if not needed
        "date"     # Drop date column
    ]
    X = df.drop([col for col in cols_to_drop if col in df.columns], axis=1)
    y = df["bp_stage_code"]
    
    # --- CLEAN AND ENCODE features ---
    X = X.copy()
    
    # Handle gender column (use lowercase 'gender')
    if "gender" in X.columns:
        # Map to numeric
        X["gender"] = X["gender"].map({"Male": 0, "Female": 1, "male": 0, "female": 1})
        X["gender"] = X["gender"].fillna(0).astype(int)
    
    # Handle diabetic column
    if "diabetic" in X.columns:
        # Convert to int (it's showing as object)
        X["diabetic"] = pd.to_numeric(X["diabetic"], errors='coerce').fillna(0).astype(int)
    
    # Encode trend_direction as string (categorical)
    if "trend_direction" in X.columns:
        X["trend_direction"] = X["trend_direction"].astype(str)
    
    # Ensure age is numeric
    if "age" in X.columns:
        X["age"] = pd.to_numeric(X["age"], errors='coerce').fillna(0).astype(int)
    
    # Debug: Print dtypes to verify encoding
    print("\nFinal column dtypes after cleaning:")
    print(X.dtypes)
    print(f"\nFinal columns: {X.columns.tolist()}")
    print(f"\nShape: {X.shape}")
    
    # Check for any remaining object columns (except categorical ones)
    object_cols = X.select_dtypes(include=['object']).columns.tolist()
    non_cat_objects = [col for col in object_cols if col not in categorical_cols]
    if non_cat_objects:
        print(f"\nWARNING: Non-categorical object columns found: {non_cat_objects}")
    # ----

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    # Get categorical feature indices
    cat_feature_indices = [X.columns.get_loc(c) for c in categorical_cols if c in X.columns]
    
    print(f"\nCategorical feature indices: {cat_feature_indices}")
    print(f"Categorical columns: {[c for c in categorical_cols if c in X.columns]}")

    pool_train = Pool(X_train, y_train, cat_features=cat_feature_indices)
    pool_test = Pool(X_test, y_test, cat_features=cat_feature_indices)

    model = CatBoostClassifier(
        iterations=800, learning_rate=0.05, depth=6, verbose=100, eval_metric="Accuracy"
    )
    model.fit(pool_train, eval_set=pool_test, use_best_model=True)

    model.save_model("classifier.cbm")
    if le is not None:
        import joblib
        joblib.dump(le, "label_encoder.pkl")
    return model, le, X.columns