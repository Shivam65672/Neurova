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
      rejectionReason,
      doctorId,
      ...updateData
    } = body;

    console.log("📝 Received update request:", { 
      id, 
      prescriptionStatus, 
      doctorName, 
      rejectionReason,
      doctorId 
    });

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
    if (prescriptionStatus && prescriptionStatus.toLowerCase() === "approved") {
      updateObject.prescriptionStatus = "approved";
      updateObject.doctorName = doctorName || "Verified Doctor";
      updateObject.doctorId = doctorId || "";
      updateObject.approvedAt = new Date();
      
      // Remove rejection fields if any
      updateObject.rejectionReason = "";
      updateObject.rejectedAt = null;
    }

    // Doctor rejected prescription
    else if (prescriptionStatus && prescriptionStatus.toLowerCase() === "rejected") {
      updateObject.prescriptionStatus = "rejected";
      updateObject.doctorName = doctorName || "Verified Doctor"; // This is critical!
      updateObject.doctorId = doctorId || "";
      updateObject.rejectedAt = new Date();
      updateObject.rejectionReason = rejectionReason || "No reason provided";
      
      // Remove approval fields if any
      updateObject.approvedAt = null;
    }

    console.log("📦 Update object being saved:", updateObject);

    const updatedPrescription = await BPPrediction.findByIdAndUpdate(
      id,
      { $set: updateObject },
      {
        new: true,
        runValidators: true,
      }
    );

    console.log("✅ Updated prescription:", {
      id: updatedPrescription._id,
      prescriptionStatus: updatedPrescription.prescriptionStatus,
      doctorName: updatedPrescription.doctorName,
      rejectionReason: updatedPrescription.rejectionReason,
      rejectedAt: updatedPrescription.rejectedAt,
    });

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
    console.error("❌ Error updating prescription:", err);

    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}