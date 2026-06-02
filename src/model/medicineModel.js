import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
  storeId: { type: String, required: true },
  available: { type: Boolean, default: false },
  cost: { type: Number, required: true },
});

const medicineSchema = new mongoose.Schema({
  medicineId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  defaultCost: { type: Number, required: true },
  stores: [storeSchema],
});

export default mongoose.models.Medicine || mongoose.model("Medicine", medicineSchema);
