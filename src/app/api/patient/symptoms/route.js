import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
// import connectDB from "@/lib/db";

// 🧠 Define a schema if not already defined
const SymptomSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true, unique: true },
  symptoms: { type: [String], default: [] },
});

// Prevent model overwrite error during dev
const SymptomModel =
  mongoose.models.Symptom || mongoose.model("Symptom", SymptomSchema);

// ✅ POST → Save or update symptoms
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { clerkUserId, symptoms } = body;

    if (!clerkUserId) {
      return NextResponse.json({ error: "Missing clerkUserId" }, { status: 400 });
    }

    const updated = await SymptomModel.findOneAndUpdate(
      { clerkUserId },
      { symptoms },
      { upsert: true, new: true }
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error saving symptoms:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

// ✅ GET → Fetch saved symptoms
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const clerkUserId = searchParams.get("clerkUserId");

    if (!clerkUserId)
      return NextResponse.json({ error: "Missing clerkUserId" }, { status: 400 });

    const data = await SymptomModel.findOne({ clerkUserId });
    return NextResponse.json(data || {}, { status: 200 });
  } catch (error) {
    console.error("Error fetching symptoms:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}