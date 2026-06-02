import { NextResponse } from "next/server";
import doctorModel from "@/model/doctorModel";
import connectDB from "@/lib/db";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const existingProfile = await doctorModel.findOne({
      clerkUserId: body.clerkUserId,
    });

    if (existingProfile) {
      await doctorModel.updateOne({ clerkUserId: body.clerkUserId }, body);
      return NextResponse.json({
        success: true,
        message: "Profile updated successfully",
      });
    }

    const profile = new doctorModel(body);
    await profile.save();

    return NextResponse.json({
      success: true,
      message: "Profile created successfully",
    });
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const clerkUserId = searchParams.get("clerkUserId");

    const profile = await doctorModel.findOne({ clerkUserId });
    console.log("Fetched profile:", profile);

    if (!profile) {
      return NextResponse.json({ success: false, message: "Profile not found" });
    }
    return NextResponse.json({ success: true, profile });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" });
  }
}
