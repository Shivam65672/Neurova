import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.json();

    // 1️⃣ Ensure we have clerkId
    let clerkId = formData.clerkId;
    let userProfile = {};

    if (!clerkId) {
      try {
        // Fetch profile from backend using a hardcoded base URL
        const HARD_CODED_BASE_URL = "http://localhost:3000"; // <-- Replace with your backend URL
        const profileRes = await fetch(
          `${HARD_CODED_BASE_URL}/api/user/profile?clerkUserId=${formData.clerkUserId || ""
          }`
        );

        if (profileRes.ok) {
          userProfile = await profileRes.json();
          clerkId = userProfile.clerkId;
        } else {
          console.warn("Profile not found or fetch failed");
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    }

    // 2️⃣ Build patient record combining formData + profile
    const patientRecord = {
      patient_id: clerkId || Math.floor(Math.random() * 1000),
      Name:
        formData.Name ||
        userProfile.name ||
        userProfile.firstName ||
        "John Doe",
      Gender: formData.Gender || userProfile.gender || "Male",
      Age: formData.Age || userProfile.age || 30,
      systolic: formData.systolic || 120,
      diastolic: formData.diastolic || 80,
      "Height (cm)": formData["Height (cm)"] || userProfile.height || 170,
      "Weight (kg)": formData["Weight (kg)"] || userProfile.weight || 70,
      BMI: formData.BMI || userProfile.BMI || 24.2,
      Smoker: formData.Smoker ?? userProfile.smoker ?? false,
      Diabetes: formData.Diabetes ?? userProfile.diabetic ?? false,
      Health: formData.Health || userProfile.health || "Fair",
      date: formData.date || new Date().toISOString().split("T")[0],
      timestamp: new Date().toISOString(),
      pulse: formData.pulse || 72,
    };

    // 3️⃣ Prepare CSV file
    const filePath = path.join(process.cwd(), "bp_readings.csv");
    const headers = Object.keys(patientRecord).join(",");
    const row = Object.values(patientRecord).join(",");

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, headers + "\n", "utf8");
    }

    fs.appendFileSync(filePath, row + "\n", "utf8");

    return new Response(
      JSON.stringify({ status: "success", data: patientRecord }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("POST /api/save-bp Error:", error);
    return new Response(
      JSON.stringify({ status: "error", message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerkId");

    const filePath = path.join(process.cwd(), "bp_readings.csv");

    if (!fs.existsSync(filePath)) {
      return new Response(
        JSON.stringify({
          success: true,
          readings: [],
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const file = fs.readFileSync(filePath, "utf8");

    const lines = file.trim().split("\n");

    if (lines.length <= 1) {
      return new Response(
        JSON.stringify({
          success: true,
          readings: [],
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const headers = lines[0].split(",");

    const readings = lines
      .slice(1)
      .map((line, index) => {
        const values = line.split(",");

        const obj = {};

        headers.forEach((header, i) => {
          obj[header] = values[i];
        });

        return {
          id: index + 1,
          clerkId: obj.patient_id,
          systolic: Number(obj.systolic),
          diastolic: Number(obj.diastolic),
          date: obj.date,
          timestamp: obj.timestamp,
          pulse: Number(obj.pulse),
          status:
            Number(obj.systolic) >= 140 || Number(obj.diastolic) >= 90
              ? "high"
              : Number(obj.systolic) >= 120 || Number(obj.diastolic) >= 80
                ? "elevated"
                : "normal",
        };
      })
      .filter((reading) =>
        clerkId ? reading.clerkId === clerkId : true
      );
    
    return new Response(
      JSON.stringify({
        success: true,
        readings,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}