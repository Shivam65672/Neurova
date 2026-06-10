# import os
# import pandas as pd
# from catboost import CatBoostClassifier  # Add this import
# import joblib
# from models.trend_model import build_trend_model, apply_feedback_and_predict
# from pipeline import run_trend_then_classification
# import os
# import json
# import google.generativeai as genai
# import json
# from geopy.distance import geodesic

# with open(
#     "C:\\Users\\ujjwa\\OneDrive\\Desktop\\CodeUtsav\\neurova\\flask-1\\inventory\\medicines.json",
#     "r",
# ) as f:
#     medicines_db = json.load(f)

# with open(
#     "C:\\Users\\ujjwa\\OneDrive\\Desktop\\CodeUtsav\\neurova\\flask-1\\inventory\\stores_raipur.json",
#     "r",
# ) as f:
#     stores_db = json.load(f)


# # Helper: lookup store by storeId
# store_lookup = {store["storeId"]: store for store in stores_db}
# print("store lookup", store_lookup)
# # Helper: lookup medicine by name
# medicine_lookup = {med["name"].lower(): med for med in medicines_db}
# print("medicine lookup", medicine_lookup)
# # Load BP dataset
# df = pd.read_csv("data2.csv")
# genai.configure(api_key="AIzaSyC3dENT5hPrhF3VgN5xnyz-0PdcJ5MKzLs")
# gemini_model = genai.GenerativeModel(model_name="models/gemini-2.0-flash")
# # Standardize column names
# df = df.rename(
#     columns={
#         "PatientID": "patient_id",
#         "Date": "date",
#         "Systolic BP": "systolic",
#         "Diastolic BP": "diastolic",
#     }
# )
# df["date"] = pd.to_datetime(df["date"])


# # ---- Compute BP stage for all rows (needed for classifier) ----
# def get_bp_stage(row):
#     sys = row["systolic"]
#     dia = row["diastolic"]
#     if sys < 120 and dia < 80:
#         return "Normal"
#     elif 120 <= sys < 130 and dia < 80:
#         return "Elevated"
#     elif 130 <= sys < 140 or 80 <= dia < 90:
#         return "Stage 1"
#     elif sys >= 140 or dia >= 90:
#         return "Stage 2"
#     elif sys > 180 or dia > 120:
#         return "Hypertensive Crisis"
#     else:
#         return "Unknown"


# df["bp_stage"] = df.apply(get_bp_stage, axis=1)

# # ---- Fill missing demographics (to avoid CatBoost errors) ----
# # Check what columns exist in your data first
# print("Columns in dataset:", df.columns.tolist())

# if "gender" not in df.columns:
#     df["gender"] = "Male"  # Use consistent default
# if "diabetic" not in df.columns:
#     df["diabetic"] = 0
# if "BMI" not in df.columns:
#     df["BMI"] = 25.0  # Use realistic default
# if "age" not in df.columns:
#     df["age"] = 40  # Use realistic default

# # Ensure correct data types
# df["diabetic"] = df["diabetic"].astype(int)
# df["gender"] = df["gender"].astype(str)

# # Build trend model
# trend_model = build_trend_model()

# # ---- Train or load classifier ----
# from models.classiffication_model import train_catboost_classifier

# if not os.path.exists("classifier.cbm") or not os.path.exists("label_encoder.pkl"):
#     print("Training new classifier...")

#     # Generate trend features for all patients
#     trend_features_list = []
#     for pid in df["patient_id"].unique():
#         g = df[df["patient_id"] == pid].sort_values("date")
#         seq = g[["systolic", "diastolic"]].tail(7).values
#         if len(seq) == 7:
#             features = apply_feedback_and_predict(trend_model, seq)
#             features["patient_id"] = pid
#             trend_features_list.append(features)

#     df_trend = pd.DataFrame(trend_features_list)

#     # Merge with latest patient demographics and BP stage
#     # Get the most recent record for each patient
#     df_latest = df.sort_values("date").groupby("patient_id").last().reset_index()
#     df_train = df_latest.merge(df_trend, on="patient_id", how="inner")

#     print(f"Training data shape: {df_train.shape}")
#     print(f"Columns in training data: {df_train.columns.tolist()}")
#     print(f"BP stage distribution:\n{df_train['bp_stage'].value_counts()}")

#     # Check for any remaining string columns that should be numeric
#     print("\nData types before training:")
#     print(df_train.dtypes)

#     # Train classifier
#     classifier_model, label_encoder, feature_cols = train_catboost_classifier(df_train)
#     print(f"\nClassifier trained successfully!")
#     print(f"Feature columns used: {feature_cols.tolist()}")
# else:
#     print("Loading existing classifier...")
#     classifier_model = CatBoostClassifier()
#     classifier_model.load_model("classifier.cbm")
#     label_encoder = joblib.load("label_encoder.pkl")
#     print("Classifier loaded successfully!")

# # ---- Run inference on a new reading ----
# print("\n" + "=" * 50)
# print("Running inference on new patient reading...")
# print("=" * 50)

# try:
#     packet, df_updated = run_trend_then_classification(
#         patient_id=75,
#         new_date="2025-11-05",
#         new_sys=152,
#         new_dia=98,
#         df_full=df,
#         trend_model=trend_model,
#         classifier_model=classifier_model,
#         cat_label_encoder=label_encoder,
#     )

#     print("\n=== Trend + Classification Result ===")
#     print(packet)

#     # ---- Prepare Gemini prompt ----
#     patient_details = df_updated[df_updated["patient_id"] == 75].iloc[-1]
#     bp_stage = packet["current_bp"]["bp_stage"]
#     print("BP Stage:", bp_stage)
#     previous_medications = patient_details.get("previous_medications", [])
#     current_medications = patient_details.get("current_medications", [])

#     prompt = f"""
# You are an expert medical assistant.
# A patient has the following details:
# - Age: {patient_details.get("age", 40)}
# - Gender: {patient_details.get("gender", "Male")}
# - BP Stage: {bp_stage}
# - Previous Medications: {', '.join(previous_medications) if previous_medications else 'None'}
# - Current Medications: {', '.join(current_medications) if current_medications else 'None'}

# Suggest the most suitable 5 blood pressure medications considering the patient's current BP stage,
# age, gender, and previous medications. Explain briefly why each medication is suitable.
# Avoid recommending medications that may conflict with the current or previous medications.
# also give the diets that are helpful to improve the bp condition to the normal range based on the user details provided.
# also give the excerises that are very useful to improve the condition based on the user details provided

# Return only a JSON array with objects:
# [
#     {{
#         "medicine_name": "...",
#         "dosage": "...",
#         "usage_instructions": "..."
#         "diets" : ["..." ,"..."]
#         "excerise" : ["..." , "..."]
#     }}
# ]
# """

#     # ---- Call Gemini ----
#     response = gemini_model.generate_content(prompt)
#     gemini_output = response.text.strip()
#     gemini_cleaned = gemini_output.replace("```json", "").replace("```", "")
#     medications = json.loads(gemini_cleaned)

#     print("\n=== Gemini Medication Recommendation ===")
#     print(json.dumps(medications, indent=2))

# except Exception as e:
#     print(f"\nError during inference or Gemini call: {str(e)}")
#     import traceback

#     traceback.print_exc()


# def find_medicines_near_user(
#     medicine_names,
#     user_lat,
#     user_lon,
#     target_count=3,
#     start_radius_km=1,
#     increment_km=1,
#     max_radius_km=20,
# ):
#     """
#     Finds which medicines (from a list) are available near the user.
#     medicine_names: list of medicine names to search for
#     user_lat, user_lon: user's location
#     Returns medicines with store availability and sorted by lowest cost.
#     """
#     radius = start_radius_km
#     available_meds = []

#     # Normalize medicine names to lowercase for matching
#     medicine_names = [name.lower() for name in medicine_names]

#     while radius <= max_radius_km:
#         available_meds = []
#         for med_name in medicine_names:
#             med = medicine_lookup.get(med_name)
#             if not med:
#                 continue  # medicine not found in DB

#             med_available_stores = []
#             for s in med["stores"]:
#                 if not s["available"]:
#                     continue
#                 store_info = store_lookup.get(s["storeId"])
#                 if not store_info:
#                     continue
#                 store_coords = store_info["location"]["coordinates"]  # [lon, lat]
#                 store_lat, store_lon = store_coords[1], store_coords[0]
#                 distance = geodesic((user_lat, user_lon), (store_lat, store_lon)).km
#                 if distance <= radius:
#                     med_available_stores.append(
#                         {
#                             "storeId": s["storeId"],
#                             "store_name": store_info["name"],
#                             "distance_km": round(distance, 2),
#                             "cost": s["cost"],
#                         }
#                     )

#             if med_available_stores:
#                 # sort stores by cost
#                 med_available_stores.sort(key=lambda x: x["cost"])
#                 available_meds.append(
#                     {"medicine_name": med["name"], "stores": med_available_stores}
#                 )

#         if len(available_meds) >= target_count:
#             break  # enough medicines found
#         radius += increment_km

#     # Sort medicines by lowest available cost
#     for med in available_meds:
#         med["lowest_cost"] = med["stores"][0]["cost"] if med["stores"] else float("inf")
#     available_meds.sort(key=lambda x: x["lowest_cost"])

#     return available_meds


# def select_medicines_single_store(meds_nearby, bp_stage):
#     """
#     Selects all medicines from a single store based on BP severity.
#     - For serious BP (Stage 2 or Hypertensive Crisis): pick closest store.
#     - For normal/elevated: pick store with lowest total cost.
#     Returns list of medicines with store info.
#     """
#     if not meds_nearby:
#         return []

#     # Pick a store based on BP severity
#     if bp_stage in ["Stage 2", "Hypertensive Crisis"]:
#         # Pick the store closest to user among all medicines
#         store_id = min(
#             [s["storeId"] for med in meds_nearby for s in med["stores"]],
#             key=lambda sid: next(
#                 s["distance_km"]
#                 for med in meds_nearby
#                 for s in med["stores"]
#                 if s["storeId"] == sid
#             ),
#         )
#     else:
#         # Pick the store with lowest total cost
#         store_costs = {}
#         for med in meds_nearby:
#             for s in med["stores"]:
#                 store_costs[s["storeId"]] = store_costs.get(s["storeId"], 0) + s["cost"]
#         store_id = min(store_costs, key=store_costs.get)

#     # Filter medicines to only include the chosen store
#     final_meds = []
#     for med in meds_nearby:
#         for s in med["stores"]:
#             if s["storeId"] == store_id:
#                 final_meds.append(
#                     {
#                         "medicine_name": med["medicine_name"],
#                         "store_name": s["store_name"],
#                         "cost": s["cost"],
#                         "distance_km": s["distance_km"],
#                     }
#                 )
#                 break  # Only one store per medicine
#     return final_meds


# gemini_med_names = [med["medicine_name"] for med in medications]
# user_lat = 21.2335772
# user_lon = 81.5959583
# meds_nearby = find_medicines_near_user(gemini_med_names, user_lat, user_lon)

# # Select medicines from a single store based on BP severity
# final_meds_single_store = select_medicines_single_store(meds_nearby, bp_stage)

# print("\n=== Medicines from a Single Store ===")
# for m in final_meds_single_store:
#     print(
#         f"{m['medicine_name']} - Store: {m['store_name']} - Cost: {m['cost']} - Distance: {m['distance_km']} km"
#     )
# if medications:
#     patient_diets = medications[0].get("diets", [])
#     patient_exercises = medications[0].get("excerise", [])
# else:
#     patient_diets = []
#     patient_exercises = []
# # ---- Prepare JSON to send to doctor (with type casting) ----
# patient_json = {
#     "patient_id": int(patient_details.get("patient_id")),
#     "name": patient_details.get("name", "Unknown"),  # if you have patient name
#     "age": int(patient_details.get("age")),
#     "gender": patient_details.get("gender"),
#     "current_bp": {
#         "systolic": int(patient_details.get("systolic")),
#         "diastolic": int(patient_details.get("diastolic")),
#         "bp_stage": bp_stage,
#     },
#     "prescribed_medicines": [],
# }

# # Combine medicine + store info + optional diets/exercises
# for med in final_meds_single_store:
#     # Find original medicine details from Gemini output
#     gemini_med_detail = next(
#         (
#             m
#             for m in medications
#             if m["medicine_name"].lower() == med["medicine_name"].lower()
#         ),
#         {},
#     )
#     patient_json["prescribed_medicines"].append(
#         {
#             "medicine_name": med["medicine_name"],
#             "store_name": med["store_name"],
#             "cost": float(med["cost"]),  # cast to float
#             "distance_km": float(med["distance_km"]),  # cast to float
#             "dosage": gemini_med_detail.get("dosage", ""),
#             "usage_instructions": gemini_med_detail.get("usage_instructions", ""),
#             "diets": gemini_med_detail.get("diets", []),
#             "exercises": gemini_med_detail.get("excerise", []),
#         }
#     )

# # ---- Print JSON ----
# import json

# print("\n=== JSON Payload to send to doctor ===")
# print(json.dumps(patient_json, indent=2))

from flask import Flask, request, jsonify
import os
import pandas as pd
import numpy as np
from catboost import CatBoostClassifier
import joblib
import json
from geopy.distance import geodesic
import google.generativeai as genai
from flask_cors import CORS
from models.trend_model import build_trend_model, apply_feedback_and_predict
from models.classiffication_model import train_catboost_classifier
from pipeline import run_trend_then_classification

# Initialize Flask app
app = Flask(__name__)
CORS(app)
# Load medicines and stores
with open(
    "C:\\Users\\ujjwa\\OneDrive\\Desktop\\CodeUtsav\\neurova\\flask-1\\inventory\\medicines.json",
    "r",
) as f:
    medicines_db = json.load(f)

with open(
    "C:\\Users\\ujjwa\\OneDrive\\Desktop\\CodeUtsav\\neurova\\flask-1\\inventory\\stores_raipur.json",
    "r",
) as f:
    stores_db = json.load(f)

store_lookup = {store["storeId"]: store for store in stores_db}
medicine_lookup = {med["name"].lower(): med for med in medicines_db}

# Load BP dataset
df = pd.read_csv("data2.csv")
df = df.rename(
    columns={
        "PatientID": "patient_id",
        "Date": "date",
        "Systolic BP": "systolic",
        "Diastolic BP": "diastolic",
    }
)
df["date"] = pd.to_datetime(df["date"])

# Fill missing demographics
# Fill missing demographics
for col, default in [("gender", "Male"), ("diabetic", 0), ("BMI", 25.0), ("age", 40)]:
    if col not in df.columns:
        df[col] = default

# Handle NaN values BEFORE converting to int
if "diabetic" in df.columns:
    df["diabetic"] = (
        pd.to_numeric(df["diabetic"], errors="coerce").fillna(0).astype(int)
    )

if "gender" in df.columns:
    df["gender"] = df["gender"].fillna("Male").astype(str)

if "age" in df.columns:
    df["age"] = pd.to_numeric(df["age"], errors="coerce").fillna(40).astype(int)

if "BMI" in df.columns:
    df["BMI"] = pd.to_numeric(df["BMI"], errors="coerce").fillna(25.0).astype(float)

# Build trend model
trend_model = build_trend_model()

# Load or train classifier
if not os.path.exists("classifier.cbm") or not os.path.exists("label_encoder.pkl"):
    trend_features_list = []
    for pid in df["patient_id"].unique():
        g = df[df["patient_id"] == pid].sort_values("date")
        seq = g[["systolic", "diastolic"]].tail(7).values
        if len(seq) >= 7:
            features = apply_feedback_and_predict(trend_model, seq)
            features["patient_id"] = pid
            trend_features_list.append(features)

    df_trend = pd.DataFrame(trend_features_list)
    df_latest = df.sort_values("date").groupby("patient_id").last().reset_index()
    df_train = df_latest.merge(df_trend, on="patient_id", how="inner")
    classifier_model, label_encoder, feature_cols = train_catboost_classifier(df_train)
else:
    classifier_model = CatBoostClassifier()
    classifier_model.load_model("classifier.cbm")
    label_encoder = joblib.load("label_encoder.pkl")

# Configure Gemini
genai.configure(api_key="AIzaSyA8dd6HIq64OGNPezix3W-2-FdopoUaqBM")
gemini_model = genai.GenerativeModel(model_name="models/gemini-2.0-flash")


# --- Helper functions for medicine selection ---
def find_medicines_near_user(
    medicine_names,
    user_lat,
    user_lon,
    target_count=3,
    start_radius_km=1,
    increment_km=1,
    max_radius_km=20,
):
    radius = start_radius_km
    available_meds = []
    medicine_names = [name.lower() for name in medicine_names]

    while radius <= max_radius_km:
        available_meds = []
        for med_name in medicine_names:
            med = medicine_lookup.get(med_name)
            if not med:
                continue
            med_available_stores = []
            for s in med["stores"]:
                if not s["available"]:
                    continue
                store_info = store_lookup.get(s["storeId"])
                if not store_info:
                    continue
                store_coords = store_info["location"]["coordinates"]
                store_lat, store_lon = store_coords[1], store_coords[0]
                distance = geodesic((user_lat, user_lon), (store_lat, store_lon)).km
                if distance <= radius:
                    med_available_stores.append(
                        {
                            "storeId": s["storeId"],
                            "store_name": store_info["name"],
                            "distance_km": round(distance, 2),
                            "cost": s["cost"],
                        }
                    )
            if med_available_stores:
                med_available_stores.sort(key=lambda x: x["cost"])
                available_meds.append(
                    {"medicine_name": med["name"], "stores": med_available_stores}
                )
        if len(available_meds) >= target_count:
            break
        radius += increment_km

    for med in available_meds:
        med["lowest_cost"] = med["stores"][0]["cost"] if med["stores"] else float("inf")
    available_meds.sort(key=lambda x: x["lowest_cost"])
    return available_meds


def select_medicines_single_store(meds_nearby, bp_stage):
    if not meds_nearby:
        return []
    if bp_stage in ["Stage 2", "Hypertensive Crisis"]:
        store_id = min(
            [s["storeId"] for med in meds_nearby for s in med["stores"]],
            key=lambda sid: next(
                s["distance_km"]
                for med in meds_nearby
                for s in med["stores"]
                if s["storeId"] == sid
            ),
        )
    else:
        store_costs = {}
        for med in meds_nearby:
            for s in med["stores"]:
                store_costs[s["storeId"]] = store_costs.get(s["storeId"], 0) + s["cost"]
        store_id = min(store_costs, key=store_costs.get)
    final_meds = []
    for med in meds_nearby:
        for s in med["stores"]:
            if s["storeId"] == store_id:
                final_meds.append(
                    {
                        "medicine_name": med["medicine_name"],
                        "store_name": s["store_name"],
                        "cost": s["cost"],
                        "distance_km": s["distance_km"],
                    }
                )
                break
    return final_meds


def safe_int(val, default=0):
    try:
        if val is None or (isinstance(val, float) and np.isnan(val)):
            return default
        return int(val)
    except:
        return default


def safe_float(val, default=0.0):
    try:
        if val is None or (isinstance(val, float) and np.isnan(val)):
            return default
        return float(val)
    except:
        return default


def safe_str(val, default="Unknown"):
    try:
        if val is None or (isinstance(val, float) and np.isnan(val)):
            return default
        return str(val)
    except:
        return default


def safe_list(val):
    if val is None:
        return []
    if isinstance(val, list):
        return val
    return [val]


@app.route("/add_bp", methods=["POST"])
def add_bp():
    data = request.json
    try:
        global df

        # Extract all fields with safe defaults
        new_row = {
            "patient_id": safe_int(data.get("patient_id"), 1),
            "Name": safe_str(data.get("name")),
            "Gender": safe_str(data.get("gender"), "Male"),
            "Age": safe_int(data.get("age"), 40),
            "systolic": safe_int(data.get("systolic"), 120),
            "diastolic": safe_int(data.get("diastolic"), 80),
            "Cholesterol": safe_int(data.get("Cholesterol"), 200),
            "Height (cm)": safe_float(data.get("Height (cm)"), 170.0),
            "Weight (kg)": safe_float(data.get("Weight (kg)"), 70.0),
            "BMI": safe_float(data.get("BMI"), 25.0),
            "Smoker": bool(data.get("Smoker", False)),
            "Diabetes": safe_int(data.get("Diabetes"), 0),
            "Health": safe_str(data.get("Health"), "Good"),
            "date": pd.to_datetime(data.get("date", pd.Timestamp.now())),
            # duplicate fields
            "gender": safe_str(data.get("gender"), "Male"),
            "diabetic": safe_int(data.get("Diabetes"), 0),
            "age": safe_int(data.get("age"), 40),
            "name": safe_str(data.get("name")),
        }

        # Append new row
        df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)

        # Ensure numeric columns are properly filled
        for col in [
            "Age",
            "age",
            "systolic",
            "diastolic",
            "Cholesterol",
            "Diabetes",
            "diabetic",
            "patient_id",
        ]:
            df[col] = df[col].apply(lambda x: safe_int(x, 0))
        for col in ["Height (cm)", "Weight (kg)", "BMI"]:
            df[col] = df[col].apply(lambda x: safe_float(x, 0.0))
        for col in ["Name", "name", "Gender", "gender", "Health"]:
            df[col] = df[col].apply(lambda x: safe_str(x))
        if "Smoker" in df.columns:
            df["Smoker"] = df["Smoker"].fillna(False).astype(bool)

        df.to_csv("data2.csv", index=False)

        return jsonify(
            {
                "status": "success",
                "patient_id": new_row["patient_id"],
                "message": "BP data added successfully",
            }
        )

    except Exception as e:
        import traceback

        print(traceback.format_exc())
        return (
            jsonify(
                {
                    "status": "error",
                    "message": str(e),
                    "traceback": traceback.format_exc(),
                }
            ),
            500,
        )


@app.route("/")
def home():
    return jsonify(
        {"status": "API is running", "message": "BP prediction API is live."}
    )

@app.route("/predict_bp", methods=["POST"])
def predict_bp():
    data = request.json
    try:
        global df

        # Extract input safely
        patient_id = safe_int(data.get("patient_id"), 0)
        name = safe_str(data.get("name"))
        age = safe_int(data.get("age"), 40)
        gender = safe_str(data.get("gender"), "Male")
        systolic = safe_int(data.get("systolic"), 120)
        diastolic = safe_int(data.get("diastolic"), 80)
        diabetic = safe_int(data.get("diabetic"), 0)
        BMI = safe_float(data.get("BMI"), 25.0)
        date = pd.to_datetime(data.get("date", pd.Timestamp.now()))
        user_lat = safe_float(data.get("latitude"), 21.2335772)
        user_lon = safe_float(data.get("longitude"), 81.5959583)

        # Check patient exists
        if patient_id not in df["patient_id"].values:
            return jsonify({"status": "error", "message": "Patient not found. Please add BP data first."}), 400

        # Run trend + classification
        packet, df_updated = run_trend_then_classification(
            patient_id=patient_id,
            new_date=date,
            new_sys=systolic,
            new_dia=diastolic,
            df_full=df,
            trend_model=trend_model,
            classifier_model=classifier_model,
            cat_label_encoder=label_encoder,
        )

        patient_details = df_updated[df_updated["patient_id"] == patient_id].iloc[-1]
        bp_stage = packet["current_bp"]["bp_stage"]

        previous_medications = safe_list(patient_details.get("previous_medications"))
        current_medications = safe_list(patient_details.get("current_medications"))

        # Gemini prompt
        prompt = f"""
You are an expert medical assistant.
A patient has the following details:
- Age: {safe_int(patient_details.get('age'), 40)}
- Gender: {safe_str(patient_details.get('gender'), 'Male')}
- BP Stage: {bp_stage}
- Previous Medications: {', '.join(previous_medications) if previous_medications else 'None'}
- Current Medications: {', '.join(current_medications) if current_medications else 'None'}

Suggest the most suitable 5 blood pressure medications considering the patient's current BP stage,
age, gender, and previous medications. Explain briefly why each medication is suitable.
Avoid recommending medications that may conflict with the current or previous medications.
also give the diets that are helpful to improve the bp condition to the normal range based on the user details provided.
also give the excerises that are very useful to improve the condition based on the user details provided

Return only a JSON array with objects:
[
     {{

        "medicine_name": "...",
        "dosage": "...",
        "usage_instructions": "...",
        "diets": ["...", "..."],
        "excerise": ["...", "..."]
    }}
]
"""

        response = gemini_model.generate_content(prompt)
        gemini_output = response.text.strip().replace("```json", "").replace("```", "")
        medications = json.loads(gemini_output)

        gemini_med_names = [med["medicine_name"] for med in medications]
        meds_nearby = find_medicines_near_user(gemini_med_names, user_lat, user_lon)
        final_meds_single_store = select_medicines_single_store(meds_nearby, bp_stage)

        # Prepare JSON
        patient_json = {
            "patient_id": safe_int(patient_details.get("patient_id"), 0),
            "name": safe_str(patient_details.get("name")),
            "age": safe_int(patient_details.get("age"), 40),
            "gender": safe_str(patient_details.get("gender")),
            "current_bp": {
                "systolic": safe_int(patient_details.get("systolic"), 120),
                "diastolic": safe_int(patient_details.get("diastolic"), 80),
                "bp_stage": bp_stage,
            },
            "prescribed_medicines": [],
        }

        for med in final_meds_single_store:
            gemini_med_detail = next(
                (m for m in medications if m["medicine_name"].lower() == med["medicine_name"].lower()),
                {},
            )
            patient_json["prescribed_medicines"].append(
                {
                    "medicine_name": safe_str(med["medicine_name"]),
                    "store_name": safe_str(med["store_name"]),
                    "cost": safe_float(med.get("cost"), 0),
                    "distance_km": safe_float(med.get("distance_km"), 0),
                    "dosage": safe_str(gemini_med_detail.get("dosage")),
                    "usage_instructions": safe_str(gemini_med_detail.get("usage_instructions")),
                    "diets": safe_list(gemini_med_detail.get("diets")),
                    "exercises": safe_list(gemini_med_detail.get("excerise")),
                }
            )

        patient_json = convert_numpy(patient_json)
        return jsonify(patient_json)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app.route("/bp_count", methods=["GET"])
def bp_count():
    try:
        patient_id = request.args.get("patient_id", type=int)
        if patient_id is None:
            return (
                jsonify({"status": "error", "message": "patient_id is required"}),
                400,
            )

        global df
        count = df[df["patient_id"] == patient_id].shape[0]

        return jsonify(
            {"status": "success", "patient_id": patient_id, "bp_record_count": count}
        )

    except Exception as e:
        import traceback

        print("Error in /bp_count:")
        print(traceback.format_exc())
        return jsonify({"status": "error", "message": str(e)}), 500


# --- Flask endpoint ---
# --- Helper function ---
def convert_numpy(obj):
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        if np.isnan(obj):
            return 0  # replace NaN with 0
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return [convert_numpy(i) for i in obj.tolist()]
    elif isinstance(obj, dict):
        return {k: convert_numpy(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy(i) for i in obj]
    elif obj is None:
        return 0
    return obj


if __name__ == "__main__":
    app.run(debug=True)
