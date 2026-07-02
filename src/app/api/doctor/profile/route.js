import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DoctorProfile from "@/model/doctorModel";

// Helper function to ensure all fields exist
const ensureCompleteProfile = (profileData) => {
  return {
    clerkUserId: profileData.clerkUserId || "",
    name: profileData.name || "",
    email: profileData.email || "",
    gender: profileData.gender || "",
    age: profileData.age || 0,
    degree: profileData.degree || "",
    specialization: profileData.specialization || "",
    licenseNumber: profileData.licenseNumber || "",
    contactNumber: profileData.contactNumber || "",
    experienceYears: profileData.experienceYears || 0,
    currentHospital: profileData.currentHospital || "",
    hospitalExperience: Array.isArray(profileData.hospitalExperience) 
      ? profileData.hospitalExperience 
      : [],
  };
};

export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const clerkUserId = searchParams.get("clerkUserId");

    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: "Missing clerkUserId" },
        { status: 400 }
      );
    }

    const profile = await DoctorProfile.findOne({ clerkUserId });
    
    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      );
    }

    const profileObj = profile.toObject ? profile.toObject() : profile;
    const completeProfile = ensureCompleteProfile(profileObj);

    return NextResponse.json(
      { success: true, profile: completeProfile },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/doctor/profile Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    const { clerkUserId } = data;

    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: "Missing clerkUserId" },
        { status: 400 }
      );
    }

    // Prepare data with all fields
    const preparedData = {
      clerkUserId,
      name: data.name || "",
      email: data.email || "",
      gender: data.gender || "",
      age: Number(data.age) || 0,
      degree: data.degree || "",
      specialization: data.specialization || "",
      licenseNumber: data.licenseNumber || "",
      contactNumber: data.contactNumber || "",
      experienceYears: Number(data.experienceYears) || 0,
      currentHospital: data.currentHospital || "",
      hospitalExperience: Array.isArray(data.hospitalExperience) 
        ? data.hospitalExperience 
        : [],
    };

    // Upsert
    let profile = await DoctorProfile.findOne({ clerkUserId });
    
    if (profile) {
      Object.assign(profile, preparedData);
      await profile.save();
    } else {
      profile = await DoctorProfile.create(preparedData);
    }

    const profileObj = profile.toObject ? profile.toObject() : profile;
    const completeProfile = ensureCompleteProfile(profileObj);

    return NextResponse.json(
      { 
        success: true, 
        profile: completeProfile,
        message: profile ? "Profile updated successfully" : "Profile created successfully"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/doctor/profile Error:", error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Profile already exists for this user" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}