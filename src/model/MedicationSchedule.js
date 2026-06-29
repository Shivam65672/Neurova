import mongoose from "mongoose";

const MedicationScheduleSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
    },

    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BPPrediction",
      required: true,
    },

    medicationName: {
      type: String,
      required: true,
    },

    schedule: [
      {
        date: String,
        period: String,
        time: String,
        taken: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.MedicationSchedule ||
mongoose.model("MedicationSchedule", MedicationScheduleSchema);