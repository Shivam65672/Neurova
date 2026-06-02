
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BPPrediction from "@/model/prescriptionModel";

import fs from "fs";
import path from "path";
import axios from "axios";
import * as XLSX from "xlsx";
import Papa from "papaparse";


export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { clerkId, Name, Age } = body;

    if (!clerkId || !Name || !Age) {
      return NextResponse.json(
        { error: "clerkId, name, and age are required" },
        { status: 400 }
      );
    }
    // ✅ Load XLSX CCB Medicine Data
    // const xlsxPath = path.join(process.cwd(), "public", "new_medicine.xlsx");
    // if (!fs.existsSync(xlsxPath)) {
    //   return NextResponse.json(
    //     { error: "Medicine DB file missing" },
    //     { status: 404 }
    //   );
    // }
    // const workbook = XLSX.readFile(xlsxPath, { cellDates: true });
    // const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // const ccbDataRaw = XLSX.utils.sheet_to_json(sheet);

    // const ccbData = {};
    // ccbDataRaw.forEach((row) => {
    //   const molecule = row.molecule?.trim();
    //   const brand = row.brand?.trim();
    //   if (!molecule || !brand) return;
    //   if (!ccbData[molecule]) ccbData[molecule] = [];
    //   ccbData[molecule].push(brand);
    // });

    // ✅ Parse CSV Safely
    const filePath = path.join(process.cwd(), "bp_readings.csv");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "No BP readings found" },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(filePath, "utf8");

    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      quoteChar: '"',
    });

    const last50 = parsed.data
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 50);

    // ✅ Updated Prompt (forces Gemini to use your medication dataset)
    const prompt = `
You are a medical AI assistant specializing in hypertension assessment and intervention.

You are provided with up to the last 50 blood pressure readings from a single patient.
Each row contains:
patient_id, Name, Gender, Age, systolic, diastolic, Height (cm), Weight (kg), BMI, Smoker, Diabetes, Health, date, pulse

From the **most recent row** (last50[0]), infer:
- Age and Gender
- BMI category: underweight / normal / overweight / obese
- Smoking status (Yes/No)
- Diabetes status (Yes/No)
- Heart stress indication based on pulse

Analyze the **overall trend** across the last 50 readings:
- Increasing / Decreasing / Fluctuating / Stable

Determine the **BP Stage** strictly choosing ONE from:
- "normal"
- "elevated"
- "hypertension stage 1"
- "hypertension stage 2"
- "hypertensive crisis"

Then provide recommendations that:
- Are personalized based on age, BMI, smoker, diabetic condition, and pulse
- Avoid unsafe medication combinations
- Are clinically realistic

Also provide:
- Top 3 recommended medications
- Diet recommendations (include Indian food context)
- Appropriate dosage guidance in plain language
- Clear usage instructions
- Exercise suggestions safe for the patient’s condition

Blood Pressure Readings:
${JSON.stringify(last50, null, 2)}

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

    // ✅ Call Gemini API
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { "Content-Type": "application/json" } }
    );

    const botText =
      geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // ✅ Safe JSON extraction
    let prediction;
    try {
      prediction = JSON.parse(botText.match(/\{[\s\S]*\}/)[0]);
    } catch {
      return NextResponse.json(
        { error: "AI response parsing failed", raw: botText },
        { status: 500 }
      );
    }

    // ✅ Save to DB
    const savedPrediction = await BPPrediction.create({
      clerkId,
      patientName: Name,
      patientAge: Age,
      stage: prediction.stage,
      medications: prediction.top3_medications,
      diet: prediction.diet,
      dosage: prediction.dosage,
      usage: prediction.usage,
      exercise: prediction.exercise,
      prescriptionStatus: "pending",
    });

    return NextResponse.json({ success: true, data: savedPrediction });
  } catch (error) {
    console.error("Error saving BP prediction:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
