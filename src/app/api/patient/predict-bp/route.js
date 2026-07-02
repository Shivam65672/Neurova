import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BPPrediction from "@/model/prescriptionModel";
import userModel from "@/model/userModel";
import MedicalHistory from "@/model/MedicalHistory";
import mongoose from "mongoose";

import fs from "fs";
import path from "path";
import { CohereClient } from "cohere-ai";
import Papa from "papaparse";

const SymptomSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true, unique: true },
  symptoms: { type: [String], default: [] },
});

const SymptomModel =
  mongoose.models.Symptom || mongoose.model("Symptom", SymptomSchema);

const ALLOWED_STAGES = [
  "normal",
  "elevated",
  "hypertension stage 1",
  "hypertension stage 2",
  "hypertensive crisis",
];

function normalizeTextValue(value, fallback = "") {
  if (value == null) return fallback;

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || fallback;
  }

  if (Array.isArray(value)) {
    const flattened = value
      .map((item) => normalizeTextValue(item, ""))
      .filter(Boolean);
    return flattened.join("\n") || fallback;
  }

  if (typeof value === "object") {
    if (Array.isArray(value.recommendations)) {
      return normalizeTextValue(value.recommendations, fallback);
    }
    if (Array.isArray(value.instructions)) {
      return normalizeTextValue(value.instructions, fallback);
    }
    if (typeof value.summary === "string") {
      return value.summary.trim() || fallback;
    }
    if (typeof value.details === "string") {
      return value.details.trim() || fallback;
    }

    const entries = Object.entries(value)
      .map(([key, entryValue]) => {
        const normalizedEntry = normalizeTextValue(entryValue, "");
        return normalizedEntry ? `${key}: ${normalizedEntry}` : "";
      })
      .filter(Boolean);

    return entries.join("\n") || fallback;
  }

  return String(value).trim() || fallback;
}

function normalizeMedications(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeTextValue(item, "").replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  if (typeof value === "string") {
    return value
      .split(/[|,]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  return [];
}

function normalizePredictionResponse(prediction) {
  const stage = normalizeTextValue(prediction?.stage, "").toLowerCase();

  return {
    stage: ALLOWED_STAGES.includes(stage) ? stage : "elevated",
    top3_medications: normalizeMedications(prediction?.top3_medications),
    diet: normalizeTextValue(prediction?.diet),
    dosage: normalizeTextValue(prediction?.dosage),
    usage: normalizeTextValue(prediction?.usage),
    exercise: normalizeTextValue(prediction?.exercise),
  };
}

function getLast7DaysReadings(clerkId) {
  const filePath = path.join(process.cwd(), "bp_readings.csv");
  if (!fs.existsSync(filePath)) return [];

  const fileContent = fs.readFileSync(filePath, "utf8");
  const parsed = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    quoteChar: '"',
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  return parsed.data
    .filter((row) => String(row.patient_id) === String(clerkId))
    .filter((row) => {
      const readingDate = new Date(row.timestamp || row.date);
      return !Number.isNaN(readingDate.getTime()) && readingDate >= sevenDaysAgo;
    })
    .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));
}

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

export async function POST(req) {
  try {
    const isConnected = await connectDB();
    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: "Database is currently unavailable. Please try again later." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { clerkId, symptoms: clientSymptoms } = body;

    if (!clerkId) {
      return NextResponse.json(
        { error: "clerkId is required" },
        { status: 400 }
      );
    }

    const profile = await userModel.findOne({ clerkUserId: clerkId }).lean();
    if (!profile) {
      return NextResponse.json(
        { error: "Patient profile not found. Please complete your profile first." },
        { status: 404 }
      );
    }

    const medicalHistory = await MedicalHistory.findOne({ clerkId }).lean();
    const symptomDoc = await SymptomModel.findOne({ clerkUserId: clerkId }).lean();
    const symptoms =
      clientSymptoms?.length > 0
        ? clientSymptoms
        : symptomDoc?.symptoms || [];

    const last7DaysBP = getLast7DaysReadings(clerkId);
    if (last7DaysBP.length === 0) {
      return NextResponse.json(
        {
          error:
            "No blood pressure readings found in the last 7 days. Please add readings in BP Tracker first.",
        },
        { status: 400 }
      );
    }

    const personalDetails = {
      name: profile.name,
      gender: profile.gender,
      age: profile.age,
      height: profile.height,
      weight: profile.weight,
      bmi: profile.bmi,
    };

    const lifestyle = {
      smoker: profile.smoker,
      alcohol: profile.alcohol,
      activityLevel: profile.activityLevel,
      dietType: profile.dietType,
      stressLevel: profile.stressLevel,
      sleepHours: profile.sleepHours,
    };

    const medicalDetails = {
      diabetes: profile.diabetes,
      cholesterol: profile.cholesterol,
      familyHistory: profile.familyHistory,
      currentMedication: profile.currentMedication,
      previousMedication: profile.previousMedication,
      allergies: profile.allergies,
    };

    const prompt = `
You are a medical AI assistant specializing in hypertension assessment and intervention.

You are provided with comprehensive patient data including:
- Personal details (name, age, gender, height, weight, BMI)
- Lifestyle factors (smoking, alcohol, activity, diet, stress, sleep)
- Medical profile (diabetes, cholesterol, family history, medications, allergies)
- Complete medical history records
- Current reported symptoms
- Blood pressure readings from the last 7 days

From the **most recent BP reading**, infer:
- BMI category: underweight / normal / overweight / obese
- Heart stress indication based on pulse (if available)

Analyze the **overall trend** across the last 7 days of readings:
- Increasing / Decreasing / Fluctuating / Stable

Consider reported symptoms when assessing severity and recommendations.

Determine the **BP Stage** strictly choosing ONE from:
- "normal"
- "elevated"
- "hypertension stage 1"
- "hypertension stage 2"
- "hypertensive crisis"

Then provide recommendations that:
- Are personalized based on age, BMI, lifestyle, medical conditions, symptoms, and pulse
- Account for current/previous medications and allergies
- Avoid unsafe medication combinations
- Are clinically realistic

Also provide:
- Top 3 recommended medications
- Diet recommendations (include Indian food context)
- Appropriate dosage guidance in plain language
- Clear usage instructions
- Exercise suggestions safe for the patient's condition

Personal Details:
${JSON.stringify(personalDetails, null, 2)}

Lifestyle:
${JSON.stringify(lifestyle, null, 2)}

Medical Details:
${JSON.stringify(medicalDetails, null, 2)}

Medical History:
${JSON.stringify(medicalHistory || {}, null, 2)}

Current Symptoms:
${JSON.stringify(symptoms, null, 2)}

Last 7 Days Blood Pressure Readings:
${JSON.stringify(last7DaysBP, null, 2)}

Respond **ONLY** in the following EXACT JSON format:

{
  "stage": "one of the allowed stages",
  "top3_medications": ["med1", "med2", "med3"],
  "diet": "diet info",
  "dosage": "dosage info",
  "usage": "usage info",
  "exercise": "exercise info"
}
`;



    const response = await cohere.chat({
      model: "command-a-03-2025",
      message: prompt,
      temperature: 0.3,
    });

    const botText = response.text || "";

    let prediction;
    try {
      const jsonMatch = botText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error("No JSON returned by AI");
      }

      prediction = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json(
        { error: "AI response parsing failed", raw: botText },
        { status: 500 }
      );
    }

    const normalizedPrediction = normalizePredictionResponse(prediction);

    await BPPrediction.updateMany(
      { clerkId },
      { isActive: false }
    );

    const savedPrediction = await BPPrediction.create({
      clerkId,
      patientName: profile.name,
      patientAge: profile.age,

      stage: normalizedPrediction.stage,
      medications: normalizedPrediction.top3_medications.length
        ? normalizedPrediction.top3_medications
        : ["Consult your doctor"],
      diet: normalizedPrediction.diet || "Lifestyle guidance will be shared by your doctor.",
      dosage: normalizedPrediction.dosage || "Follow your doctor’s guidance.",
      usage: normalizedPrediction.usage || "Take medications as directed by your doctor.",
      exercise: normalizedPrediction.exercise || "Follow a light activity plan as advised by your doctor.",

      prescriptionStatus: "pending",

      doctorName: null,
      approvedAt: null,

      isActive: true,
    });

    return NextResponse.json({ success: true, data: savedPrediction });
  } catch (error) {
    console.error("FULL ERROR:", error);

    if (error.response) {
      console.error(error.response.data);
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}