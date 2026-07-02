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
      enum: [
        "pending",
        "approved",
        "rejected"
      ],
      default: "pending",
    },

    datePredicted: {
      type: Date,
      default: Date.now,
    },
    doctorName: {
      type: String,
      default: '',
    },
    doctorId: {
      type: String,
      default: '',
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      default: '',
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.BPPrediction ||
  mongoose.model("BPPrediction", BPPredictionSchema);
