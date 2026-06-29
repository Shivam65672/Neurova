// /app/api/update-prescription/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BPPrediction from "@/model/prescriptionModel";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      id,
      doctorName,
      prescriptionStatus,
      ...updateData
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Prescription ID is required",
        },
        { status: 400 }
      );
    }

    const updateObject = {
      ...updateData,
    };

    // Doctor approved prescription
    if (
      prescriptionStatus &&
      prescriptionStatus.toLowerCase() === "approved"
    ) {
      updateObject.prescriptionStatus = "approved";

      updateObject.doctorName = doctorName;

      updateObject.approvedAt = new Date();
    }

    // Doctor rejected prescription
    else if (
      prescriptionStatus &&
      prescriptionStatus.toLowerCase() === "rejected"
    ) {
      updateObject.prescriptionStatus = "rejected";
    }

    const updatedPrescription =
      await BPPrediction.findByIdAndUpdate(
        id,
        { $set: updateObject },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedPrescription) {
      return NextResponse.json(
        {
          success: false,
          error: "Prescription not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedPrescription,
      message: "Prescription updated successfully",
    });
  } catch (err) {
    console.error(
      "Error updating prescription:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}