// app/api/doctor/profile/route.js
import connectDB from "@/lib/db";
import DoctorProfile from "@/model/doctorModel";
import { NextResponse } from "next/server";

// Helper function to ensure all fields exist with defaults
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
      ? profileData.hospitalExperience.map(exp => ({
          hospitalName: exp.hospitalName || "",
          yearsWorked: exp.yearsWorked || 0,
          position: exp.position || "",
          department: exp.department || "",
        }))
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

    let profile = await DoctorProfile.findOne({ clerkUserId });
    
    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      );
    }

    // Convert to plain object and ensure all fields exist
    const profileObj = profile.toObject ? profile.toObject() : profile;
    const completeProfile = ensureCompleteProfile(profileObj);

    console.log("Fetched profile:", completeProfile); // Debug log

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
        ? data.hospitalExperience.map(exp => ({
            hospitalName: exp.hospitalName || "",
            yearsWorked: Number(exp.yearsWorked) || 0,
            position: exp.position || "",
            department: exp.department || "",
          }))
        : [],
    };

    // Upsert
    let profile = await DoctorProfile.findOne({ clerkUserId });
    
    if (profile) {
      // Update existing profile
      Object.assign(profile, preparedData);
      await profile.save();
      console.log("Updated profile:", profile); // Debug log
    } else {
      // Create new profile
      profile = await DoctorProfile.create(preparedData);
      console.log("Created profile:", profile); // Debug log
    }

    // Return complete profile
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