import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    age: {
      type: Number,
      required: true,
      min: 0,
      max: 120,
    },

    height: {
      type: Number, // cm
      required: true,
      min: 0,
      max: 250,
    },

    weight: {
      type: Number, // kg
      required: true,
      min: 0,
      max: 300,
    },

    bmi: {
      type: Number,
      min: 0,
    },

    smoker: {
      type: String,
      enum: ["Yes", "No"],
      default: "No",
    },

    alcohol: {
      type: String,
      enum: ["Yes", "No"],
      default: "No",
    },

    diabetes: {
      type: String,
      enum: ["No", "Type 1", "Type 2"],
      default: "No",
    },

    cholesterol: {
      type: String,
      enum: ["Normal", "Borderline High", "High", "Unknown"],
      default: "Unknown",
    },

    familyHistory: {
      type: String,
      enum: ["Yes", "No"],
      default: "No",
    },

    activityLevel: {
      type: String,
      enum: ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"],
      default: "Sedentary",
    },

    dietType: {
      type: String,
      enum: ["Vegetarian", "Non-Vegetarian", "Vegan", "Mixed"],
      default: "Mixed",
    },

    stressLevel: {
      type: String,
      enum: ["Low", "Moderate", "High"],
      default: "Moderate",
    },

    sleepHours: {
      type: Number,
      min: 0,
      max: 24,
      default: 7,
    },

    currentMedication: {
      type: [String],
      default: [],
    },

    previousMedication: {
      type: [String],
      default: [],
    },

    allergies: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.UserProfile ||
  mongoose.model("UserProfile", userProfileSchema);
