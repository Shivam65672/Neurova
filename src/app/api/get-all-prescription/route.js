// /app/api/prescriptions/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BPPrediction from "@/model/prescriptionModel";

export async function GET(req) {
  try {
    await connectDB();

    // Fetch all prescriptions, sorted by creation date (latest first)
    const prescriptions = await BPPrediction.find()
      .sort({ createdAt: -1 })
      .lean(); // lean() returns plain JS objects instead of Mongoose documents

    if (!prescriptions.length) {
      return NextResponse.json({ success: true, data: [], message: "No prescriptions found" });
    }

    // Format response (optional: select only needed fields)
    const formatted = prescriptions.map((p) => ({
      id: p._id,
      clerkId: p.clerkId,
      patientName: p.patientName,
      patientAge: p.patientAge,
      stage: p.stage,
      medications: p.medications,
      diet: p.diet,
      dosage: p.dosage,
      usage: p.usage,
      exercise: p.exercise,
      prescriptionStatus: p.prescriptionStatus,
      datePredicted:p.datePredicted,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err) {
    console.error("Error fetching prescriptions:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
