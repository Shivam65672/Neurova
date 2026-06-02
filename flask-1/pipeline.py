import time
import pandas as pd
import numpy as np
from catboost import CatBoostClassifier, Pool
import joblib
from models.trend_model import apply_feedback_and_predict

def run_trend_then_classification(
    patient_id,
    new_date,
    new_sys,
    new_dia,
    df_full,
    trend_model,
    classifier_model,
    cat_label_encoder=None,
):
    """
    1) Run trend model on last 7 readings
    2) Use trend outputs + demographics as features for CatBoost classifier
    3) Predict BP stage
    """

    # --- Ensure column names ---
    rename_map = {
        "PatientID": "patient_id",
        "Date": "date",
        "Systolic BP": "systolic",
        "Diastolic BP": "diastolic",
    }
    df_full = df_full.rename(columns={k: v for k, v in rename_map.items() if k in df_full.columns})
    df_full["date"] = pd.to_datetime(df_full["date"])

    # --- Add new reading ---
    new_row = pd.DataFrame([{
        "patient_id": patient_id,
        "date": pd.to_datetime(new_date),
        "systolic": new_sys,
        "diastolic": new_dia
    }])
    df_full = pd.concat([df_full, new_row], ignore_index=True)
    df_full = df_full.sort_values(["patient_id", "date"])

    # --- Last 7 readings ---
    g = df_full[df_full["patient_id"] == patient_id].sort_values("date")
    seq = g.tail(7)[["systolic", "diastolic"]].values

    if len(seq) < 7:
        return {
            "status": "insufficient_data",
            "message": f"Need {7 - len(seq)} more readings to analyze trend."
        }, df_full

    # --- Trend features ---
    trend_features = apply_feedback_and_predict(trend_model, seq)

    # --- Get patient demographics from the dataframe ---
    patient_data = df_full[df_full["patient_id"] == patient_id].iloc[-1]
    
    # Extract demographics (use original column names if they exist)
    gender = patient_data.get("Gender", patient_data.get("gender", "Male"))
    diabetic = patient_data.get("Diabetes", patient_data.get("diabetic", 0))
    bmi = patient_data.get("BMI", 25.0)
    age = patient_data.get("Age", patient_data.get("age", 40))
    cholesterol = patient_data.get("Cholesterol", 200)
    height = patient_data.get("Height (cm)", 170.0)
    weight = patient_data.get("Weight (kg)", 70.0)

    # --- Build classifier features (match training columns exactly) ---
    feature_row = {
        "systolic": new_sys,
        "diastolic": new_dia,
        "Cholesterol": cholesterol,
        "Height (cm)": height,
        "Weight (kg)": weight,
        "BMI": bmi,
        "gender": gender,
        "diabetic": diabetic,
        "age": age,
        "trend_direction": trend_features["trend_direction"],
        "trend_confidence": trend_features["trend_confidence"],
        "trend_strength": trend_features["trend_strength"],
        "trend_slope_sys": trend_features["trend_slope_sys"],
        "trend_slope_dia": trend_features["trend_slope_dia"],
        "avg_sys_7day": trend_features["avg_sys_7day"],
        "avg_dia_7day": trend_features["avg_dia_7day"],
        "bp_variability": trend_features["bp_variability"],
        "MAP": trend_features["MAP"],
        "pulse_pressure": trend_features["pulse_pressure"],
    }

    feature_df = pd.DataFrame([feature_row])

    # --- Preprocess features same as training ---
    # Encode gender to numeric
    if "gender" in feature_df.columns:
        feature_df["gender"] = feature_df["gender"].map({
            "Male": 0, "Female": 1, 
            "male": 0, "female": 1,
            "M": 0, "F": 1
        })
        feature_df["gender"] = feature_df["gender"].fillna(0).astype(int)
    
    # Encode diabetic to int
    if "diabetic" in feature_df.columns:
        # Handle boolean or int values
        if feature_df["diabetic"].dtype == bool:
            feature_df["diabetic"] = feature_df["diabetic"].astype(int)
        else:
            feature_df["diabetic"] = pd.to_numeric(feature_df["diabetic"], errors='coerce').fillna(0).astype(int)
    
    # Encode trend_direction as string (categorical)
    if "trend_direction" in feature_df.columns:
        feature_df["trend_direction"] = feature_df["trend_direction"].astype(str)
    
    # Ensure age is int
    if "age" in feature_df.columns:
        feature_df["age"] = pd.to_numeric(feature_df["age"], errors='coerce').fillna(40).astype(int)

    print("\nPrediction feature dtypes:")
    print(feature_df.dtypes)
    print("\nPrediction features:")
    print(feature_df)

    # --- Create Pool with categorical features for prediction ---
    categorical_cols = ["diabetic", "trend_direction"]
    cat_feature_indices = [
        feature_df.columns.get_loc(c) 
        for c in categorical_cols 
        if c in feature_df.columns
    ]
    
    print(f"\nCategorical indices for prediction: {cat_feature_indices}")
    
    pred_pool = Pool(
        feature_df,
        cat_features=cat_feature_indices
    )

    # --- Predict BP stage ---
    pred_code = classifier_model.predict(pred_pool)[0]
    bp_stage = cat_label_encoder.inverse_transform([int(pred_code)])[0] if cat_label_encoder else pred_code

    return {
        "status": "prediction_complete",
        "patient_id": patient_id,
        "current_bp": {
            "systolic": new_sys,
            "diastolic": new_dia,
            "bp_stage": bp_stage
        },
        "trend_features": trend_features,
        "timestamp": time.time()
    }, df_full