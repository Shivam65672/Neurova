"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import UserNav from "@/components/UserNav";
import UserFooter from "@/components/UserFooter";

export default function SymptomsPage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
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
      fetchSavedSymptoms();

      const savedSymptoms = localStorage.getItem(`symptoms_${user.id}`);
      if (savedSymptoms) {
        setSelectedSymptoms(JSON.parse(savedSymptoms));
      }
    }
  }, [user, isLoaded]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        `symptoms_${user.id}`,
        JSON.stringify(selectedSymptoms)
      );
    }
  }, [selectedSymptoms, user]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/patient/profile?clerkUserId=${user.id}`);
      const data = await res.json();
      if (res.ok) setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedSymptoms = async () => {
    try {
      const res = await fetch(
        `/api/patient/symptoms?clerkUserId=${user.id}`
      );
      const data = await res.json();
      if (data?.symptoms?.length) {
        setSelectedSymptoms(data.symptoms);
      }
    } catch (err) {
      console.error("Error fetching symptoms:", err);
    }
  };

  const handleSymptomChange = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const saveSymptoms = async () => {
    const res = await fetch("/api/patient/symptoms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerkUserId: user.id,
        symptoms: selectedSymptoms,
      }),
    });
    return res.ok;
  };

  const handleSave = async () => {
    try {
      if (await saveSymptoms()) {
        setMessage("✅ Symptoms saved successfully!");
      } else {
        setMessage("❌ Failed to save symptoms.");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Error saving symptoms.");
    }
  };

  const handleGeneratePrescription = async () => {
    setGenerating(true);
    setMessage("");

    try {
      await saveSymptoms();

      const res = await fetch("/api/patient/predict-bp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: user.id,
          symptoms: selectedSymptoms,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(
          "✅ Prescription generated successfully! It is pending doctor approval. View status under Medications."
        );
      } else {
        setMessage(`❌ ${data.error || "Failed to generate prescription."}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Error generating prescription.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <>
        <UserNav />
        <div className="text-center text-cyan-400 mt-10">Loading...</div>
        <UserFooter />
      </>
    );
  }

  return (
    <>
      <UserNav />
      <div className="relative min-h-screen overflow-hidden bg-black text-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/3 top-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl animate-pulse"></div>
          <div className="absolute right-1/4 top-1/2 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="mb-10 flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold bg-linear-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent sm:text-4xl">
                🩺 Symptom Assessment
              </h1>
              <p className="mt-2 text-zinc-400 text-sm">
                Select symptoms, then generate your AI prescription using your
                profile, medical history, and last 7 days of BP readings.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                onClick={handleSave}
                className="cursor-pointer rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20 transition-all"
              >
                💾 Save Symptoms
              </button>
              <button
                onClick={handleGeneratePrescription}
                disabled={generating}
                className="cursor-pointer rounded-lg border border-teal-500/40 bg-linear-to-r from-cyan-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white hover:from-cyan-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? "⏳ Generating..." : "💊 Generate Prescription"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900/60 to-zinc-950/60 p-6 sm:p-8 shadow-[0_0_25px_-5px_rgba(6,182,212,0.15)] hover:shadow-[0_0_35px_-5px_rgba(20,184,166,0.25)] transition-all duration-300">
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

            {message && (
              <div className="mt-6 space-y-2">
                <p className="text-cyan-400">{message}</p>
                {message.includes("successfully") && (
                  <Link
                    href="/patient/medications"
                    className="inline-block text-sm text-teal-400 hover:text-teal-300 underline"
                  >
                    View Medications →
                  </Link>
                )}
              </div>
            )}
          </div>

          {profile && (
            <div className="rounded-2xl mt-10 border border-zinc-800 bg-linear-to-br from-zinc-900/60 to-zinc-950/60 p-6 sm:p-8 shadow-[0_0_25px_-5px_rgba(6,182,212,0.15)]">
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

              <h2 className="text-lg font-semibold text-cyan-400 mt-10 mb-4">🧬 Medical Summary</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  ["diabetes", "Diabetes"],
                  ["cholesterol", "Cholesterol"],
                  ["familyHistory", "Family History of BP"],
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
      <UserFooter />
    </>
  );
}