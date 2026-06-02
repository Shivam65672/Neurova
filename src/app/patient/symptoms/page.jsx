"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function SymptomsPage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [message, setMessage] = useState("");

  const symptomOptions = [
    "Headache",
    "Dizziness",
    "Blurred Vision",
    "Chest Pain",
    "Fatigue",
    "Shortness of Breath",
    "Nausea",
    "Anxiety",
    "Nosebleed",
    "Irregular Heartbeat",
    "Swelling in Legs or Feet",
    "Confusion",
  ];

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfile();

      // ✅ Load symptoms from localStorage on mount
      const savedSymptoms = localStorage.getItem(`symptoms_${user.id}`);
      if (savedSymptoms) {
        setSelectedSymptoms(JSON.parse(savedSymptoms));
      }
    }
  }, [user, isLoaded]);

  // ✅ Whenever selectedSymptoms change, save them to localStorage
  useEffect(() => {
    if (user && selectedSymptoms.length >= 0) {
      localStorage.setItem(`symptoms_${user.id}`, JSON.stringify(selectedSymptoms));
    }
  }, [selectedSymptoms, user]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/user/profile?clerkUserId=${user.id}`);
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSymptomChange = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = async () => {
    try {
      const payload = {
        clerkUserId: user.id,
        symptoms: selectedSymptoms,
      };

      const res = await fetch("/api/user-symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) setMessage("✅ Symptoms saved successfully!");
      else setMessage("❌ Failed to save symptoms.");
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Error saving symptoms.");
    }
  };

  if (loading)
    return <div className="text-center text-cyan-400 mt-10">Loading...</div>;

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Glowing Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/3 top-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute right-1/4 top-1/2 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold bg-linear-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              🩺 Symptom Assessment
            </h1>
            <p className="mt-2 text-zinc-400 text-sm">
              Select all symptoms you’re currently experiencing.
            </p>
          </div>
          <button
            onClick={handleSave}
            className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20 transition-all"
          >
            💾 Save Symptoms
          </button>
        </div>

        {/* Symptoms Section */}
        <div className="rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900/60 to-zinc-950/60 p-8 shadow-[0_0_25px_-5px_rgba(6,182,212,0.15)] hover:shadow-[0_0_35px_-5px_rgba(20,184,166,0.25)] transition-all duration-300">
          <h2 className="text-lg font-semibold text-cyan-400 mb-4">🧾 Symptoms</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {symptomOptions.map((symptom) => (
              <label
                key={symptom}
                className="flex items-center space-x-3 rounded-lg bg-zinc-900/50 p-3 border border-zinc-700 hover:border-cyan-400/40 transition-all cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedSymptoms.includes(symptom)}
                  onChange={() => handleSymptomChange(symptom)}
                  className="accent-cyan-500 h-4 w-4"
                />
                <span>{symptom}</span>
              </label>
            ))}
          </div>

          {message && <p className="mt-6 text-cyan-400">{message}</p>}
        </div>

        {/* Lifestyle Info */}
        {profile && (
          <div className="rounded-2xl mt-10 border border-zinc-800 bg-linear-to-br from-zinc-900/60 to-zinc-950/60 p-8 shadow-[0_0_25px_-5px_rgba(6,182,212,0.15)]">
            <h2 className="text-lg font-semibold text-cyan-400 mb-4">💪 Lifestyle Summary</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                ["smoker", "Smoker"],
                ["alcohol", "Alcohol Consumption"],
                ["activityLevel", "Activity Level"],
                ["dietType", "Diet Type"],
                ["stressLevel", "Stress Level"],
                ["sleepHours", "Sleep Hours"],
              ].map(([key, label]) => (
                <div key={key}>
                  <p className="text-sm text-zinc-400">{label}</p>
                  <p className="mt-1 text-lg font-medium text-white">
                    {profile[key]?.toString() || "—"}
                  </p>
                </div>
              ))}
            </div>

            {/* Medical Info */}
            <h2 className="text-lg font-semibold text-cyan-400 mt-10 mb-4">🧬 Medical Summary</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                ["diabetes", "Diabetes"],
                ["cholesterol", "Cholesterol"],
                ["familyHistory", "Family History of BP"],
                ["currentMedication", "Current Medication"],
                ["previousMedication", "Previous Medication"],
                ["allergies", "Allergies"],
              ].map(([key, label]) => (
                <div key={key}>
                  <p className="text-sm text-zinc-400">{label}</p>
                  <p className="mt-1 text-lg font-medium text-white">
                    {Array.isArray(profile[key])
                      ? profile[key].join(", ")
                      : profile[key]?.toString() || "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}