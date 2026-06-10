import mongoose from "mongoose";

const medicalHistorySchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
    },

    medicalConditions: [
      {
        condition: {
          type: String,
          required: true,
        },

        diagnosedDate: {
          type: Date,
        },

        status: {
          type: String,
          enum: ["Active", "Controlled", "Recovered"],
          default: "Active",
        },

        severity: {
          type: String,
          enum: ["Mild", "Moderate", "Severe"],
        },
      },
    ],

    allergies: [
      {
        allergen: {
          type: String,
          required: true,
        },

        reaction: String,

        severity: {
          type: String,
          enum: ["Mild", "Moderate", "Severe"],
        },

        diagnosedDate: Date,
      },
    ],

    surgeries: [
      {
        procedure: {
          type: String,
          required: true,
        },

        hospital: String,

        date: Date,

        notes: String,
      },
    ],

    familyHistory: [
      {
        relation: String,

        condition: String,

        ageOfOnset: Number,
      },
    ],

    labResults: [
      {
        test: String,

        result: String,

        normalRange: String,

        date: Date,

        status: {
          type: String,
          enum: ["Normal", "Elevated", "Low"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.MedicalHistory ||
  mongoose.model("MedicalHistory", medicalHistorySchema);