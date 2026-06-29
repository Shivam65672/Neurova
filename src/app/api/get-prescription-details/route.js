// /app/api/get-prescription-details/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BPPrediction from "@/model/prescriptionModel";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: "Prescription ID is required" }, { status: 400 });
    }

    // Fetch single prescription by ID
    const prescription = await BPPrediction.findById(id).lean();

    if (!prescription) {
      return NextResponse.json({ success: false, error: "Prescription not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: prescription });
  } catch (err) {
    console.error("Error fetching prescription details:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { prescriptionId } = body; // Expect the ID in the request body

    if (!prescriptionId) {
      return NextResponse.json(
        { success: false, error: "Missing prescriptionId in request body" },
        { status: 400 }
      );
    }

    const prescription = await BPPrediction.findById(prescriptionId).lean();

    if (!prescription) {
      return NextResponse.json(
        { success: false, error: "Prescription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: prescription });
  } catch (err) {
    console.error("Error fetching prescription:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}