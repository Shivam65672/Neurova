import { NextResponse } from "next/server";
import medicineModel from "@/model/medicineModel";
import connectDB from "@/lib/db";


export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // prevent duplicate medicineId
    const exists = await medicineModel.findOne({ medicineId: body.medicineId });
    if (exists) {
      return NextResponse.json({ error: "Medicine ID already exists" }, { status: 400 });
    }

    const newMedicine = await medicineModel.create(body);
    return NextResponse.json({ success: true, data: newMedicine });
  } catch (error) {
    console.error("Error adding medicine:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
