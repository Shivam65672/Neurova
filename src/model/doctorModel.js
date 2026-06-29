// model/doctorModel.js
import mongoose from "mongoose";

const hospitalExperienceSchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    default: "",
  },
  yearsWorked: {
    type: Number,
    default: 0,
  },
  position: {
    type: String,
    default: "",
  },
  department: {
    type: String,
    default: "",
  },
}, { _id: true });

const doctorProfileSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    default: "",
  },
  email: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other", ""],
    default: "",
  },
  age: {
    type: Number,
    default: 0,
  },
  degree: {
    type: String,
    required: true,
    default: "",
  },
  specialization: {
    type: String,
    default: "",
  },
  licenseNumber: {
    type: String,
    default: "",
  },
  contactNumber: {
    type: String,
    default: "",
  },
  experienceYears: {
    type: Number,
    required: true,
    default: 0,
  },
  currentHospital: {
    type: String,
    default: "",
  },
  hospitalExperience: {
    type: [hospitalExperienceSchema],
    default: [],
  },
}, { 
  timestamps: true,
  versionKey: false,
});

// Add indexes for better query performance
doctorProfileSchema.index({ clerkUserId: 1 }, { unique: true });
doctorProfileSchema.index({ email: 1 });

// Prevent model recompilation in development
const DoctorProfile = mongoose.models.DoctorProfile || 
  mongoose.model("DoctorProfile", doctorProfileSchema);

export default DoctorProfile;