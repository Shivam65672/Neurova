import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Bidirectional, LSTM, Dense, Dropout

SEQ_LEN = 7

def build_trend_model(seq_len=SEQ_LEN, n_features=2):
    inp = Input(shape=(seq_len, n_features), name="bp_seq_in")
    x = Bidirectional(LSTM(64, return_sequences=False))(inp)
    x = Dropout(0.2)(x)
    x = Dense(32, activation="relu")(x)
    out = Dense(3, activation="softmax", name="trend_out")(x)
    model = Model(inputs=inp, outputs=out)
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    return model

def apply_feedback_and_predict(trend_model, seq):
    # seq is shape (7,2) -> [systolic, diastolic]

    # Predict trend probabilities
    final_probs = trend_model.predict(seq[np.newaxis, ...], verbose=0)[0]
    direction_idx = int(np.argmax(final_probs))
    dir_map = {0:"Falling", 1:"Stable", 2:"Rising"}

    # Compute features directly from the sequence
    sys_vals = seq[:,0]
    dia_vals = seq[:,1]
    slope_sys = float(np.polyfit(np.arange(len(sys_vals)), sys_vals, 1)[0])
    slope_dia = float(np.polyfit(np.arange(len(dia_vals)), dia_vals, 1)[0])
    avg_sys = float(np.mean(sys_vals))
    avg_dia = float(np.mean(dia_vals))
    variability = float(np.std(sys_vals))
    MAP = float((2*avg_dia + avg_sys) / 3.0)
    pulse_pressure = float(avg_sys - avg_dia)

    return {
        "trend_direction": dir_map[direction_idx],
        "trend_confidence": float(np.max(final_probs)),
        "trend_strength": abs(slope_sys),
        "trend_slope_sys": slope_sys,
        "trend_slope_dia": slope_dia,
        "avg_sys_7day": avg_sys,
        "avg_dia_7day": avg_dia,
        "bp_variability": variability,
        "MAP": MAP,
        "pulse_pressure": pulse_pressure
    }
