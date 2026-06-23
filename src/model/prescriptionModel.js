// models/BPPrediction.js
import mongoose from "mongoose";

const BPPredictionSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    patientAge: {
      type: Number,
      required: true,
    },
    stage: {
      type: String,
      enum: ["normal", "elevated", "hypertension stage 1", "hypertension stage 2", "hypertensive crisis"],
      required: true,
    },
    medications: {
      type: [String], // top 3 recommended medications
      required: true,
    },
    diet: {
      type: String,
      required: true,
    },
    dosage: {
      type: String,
      required: true,
    },
    usage: {
      type: String,
      required: true,
    },
    exercise: {
      type: String,
      required: true,
    },
    prescriptionStatus: {
      type: String,
      enum: ["pending", "approved", "dispensed"],
      default: "pending",
    },
    datePredicted: {
      type: Date,
      default: Date.now,
    },
    doctorName: {
      type: String,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.BPPrediction ||
  mongoose.model("BPPrediction", BPPredictionSchema);
