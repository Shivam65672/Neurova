import mongoose from "mongoose";

const doctorProfileSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  degree: {
    type: String,
    required: true,
  },
  experienceYears: {
    type: Number,
    required: true,
  },
  hospitalExperience: [
    {
      hospitalName: { type: String },
      yearsWorked: { type: Number },
    },
  ],
  currentHospital: {
    type: String,
  },
}, { timestamps: true });

export default mongoose.models.DoctorProfile ||
  mongoose.model("DoctorProfile", doctorProfileSchema);
