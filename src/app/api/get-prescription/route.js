// /app/api/prescriptions/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BPPrediction from "@/model/prescriptionModel";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { clerkId } = body;

    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "Missing clerkId in request body" },
        { status: 400 }
      );
    }

    // Fetch prescriptions for the specific clerkId
    const prescriptions = await BPPrediction.find({ clerkId })
      .sort({ createdAt: -1 })
      .lean();

    if (!prescriptions.length) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No prescriptions found for this user",
      });
    }

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
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err) {
    console.error("Error fetching prescriptions:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
