import mongoose from "mongoose";

const familyMemberSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    relationship: {
      type: String,
      required: true,
    },

    email: String,

    phone: String,

    photo: String,

    isEmergencyContact: {
      type: Boolean,
      default: true,
    },

    canViewVitals: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.FamilyMember ||
mongoose.model("FamilyMember", familyMemberSchema);