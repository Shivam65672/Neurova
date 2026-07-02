import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import userModel from "@/model/userModel";

// ✅ GET: Fetch profile by Clerk ID
export async function GET(req) {
  try {
    const isConnected = await connectDB();
    if (!isConnected) {
      return NextResponse.json(null, { status: 200 });
    }

    const { searchParams } = new URL(req.url);
    const clerkUserId = searchParams.get("clerkUserId");

    if (!clerkUserId)
      return NextResponse.json({ error: "Missing clerkUserId" }, { status: 400 });

    const profile = await userModel.findOne({ clerkUserId });
    if (!profile)
      return NextResponse.json({ message: "Profile not found" }, { status: 404 });

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error("GET /api/user/profile Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ POST: Create or Update Profile
export async function POST(req) {
  try {
    const isConnected = await connectDB();
    if (!isConnected) {
      return NextResponse.json({ error: "Database is currently unavailable." }, { status: 503 });
    }

    const data = await req.json();
    const { clerkUserId } = data;

    if (!clerkUserId)
      return NextResponse.json({ error: "Missing clerkUserId" }, { status: 400 });

    // ✅ Auto-calculate BMI
    if (data.height && data.weight) {
      const h = data.height / 100;
      data.bmi = Number((data.weight / (h * h)).toFixed(2));
    }

    // ✅ Normalize "Yes/No" fields
    const yesNoFields = ["smoker", "alcohol", "familyHistory"];
    yesNoFields.forEach((f) => {
      if (data[f] && typeof data[f] === "string") {
        data[f] = data[f] === "Yes" ? "Yes" : "No";
      }
    });

    // ✅ Normalize array fields
    const arrayFields = ["currentMedication", "previousMedication", "allergies"];
    arrayFields.forEach((f) => {
      if (typeof data[f] === "string") {
        data[f] = data[f]
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
      } else if (!Array.isArray(data[f])) {
        data[f] = [];
      }
    });

    // ✅ Upsert
    let profile = await userModel.findOne({ clerkUserId });
    if (profile) {
      Object.assign(profile, data);
      await profile.save();
    } else {
      profile = await userModel.create(data);
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error("POST /api/user/profile Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}