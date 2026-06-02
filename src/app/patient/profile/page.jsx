"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function UserProfilePage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isLoaded && user) fetchProfile();
  }, [user, isLoaded]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/user/profile?clerkUserId=${user.id}`);
      if (res.status === 404) {
        await createDefaultProfile();
      } else {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultProfile = async () => {
    const defaultData = {
      clerkUserId: user.id,
      name: user?.fullName || "",
      gender: "Other",
      age: 0,
      height: 0,
      weight: 0,
      bmi: 0,
      smoker: "No",
      alcohol: "No",
      diabetes: "No",
      cholesterol: "Unknown",
      familyHistory: "No",
      activityLevel: "Sedentary",
      dietType: "Mixed",
      stressLevel: "Moderate",
      sleepHours: 7,
      currentMedication: [],
      previousMedication: [],
      allergies: [],
    };
    const res = await fetch("/api/user/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(defaultData),
    });
    const data = await res.json();
    setProfile(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convert number fields
    const numFields = ["age", "height", "weight", "bmi", "sleepHours"];
    if (numFields.includes(name)) {
      setForm({ ...form, [name]: Number(value) });
    } else if (["currentMedication", "previousMedication", "allergies"].includes(name)) {
      // Convert comma-separated string to array
      setForm({ ...form, [name]: value.split(",").map((v) => v.trim()) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { age, height, weight, sleepHours } = { ...profile, ...form };

    if (!form.name && !profile.name) newErrors.name = "Name is required";
    if (age < 1 || age > 120) newErrors.age = "Age must be between 1 and 120";
    if (height < 30 || height > 250) newErrors.height = "Height must be between 30–250 cm";
    if (weight < 1 || weight > 300) newErrors.weight = "Weight must be between 1–300 kg";
    if (sleepHours < 0 || sleepHours > 24)
      newErrors.sleepHours = "Sleep hours must be between 0–24";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const payload = { ...profile, ...form, clerkUserId: user.id };
    const res = await fetch("/api/user/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setProfile(data);
    setEditing(false);
    setMessage("✅ Profile updated successfully!");
    setForm({});
  };

  if (loading)
    return <div className="text-center text-cyan-400 mt-10">Loading profile...</div>;

  if (!profile) return null;

  const renderField = (key, label, type = "text", options = null) => (
    <div key={key}>
      <p className="text-sm text-zinc-400">{label}</p>
      {editing ? (
        options ? (
          <select
            name={key}
            defaultValue={profile[key] || ""}
            onChange={handleChange}
            className="mt-1 w-full rounded bg-zinc-800/50 border border-zinc-700 p-2 text-white"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={key}
            defaultValue={
              Array.isArray(profile[key]) ? profile[key].join(", ") : profile[key] || ""
            }
            onChange={handleChange}
            className="mt-1 w-full rounded bg-zinc-800/50 border border-zinc-700 p-2 text-white"
            min={type === "number" ? "0" : undefined}
          />
        )
      ) : (
        <p className="mt-1 text-lg font-medium text-white">
          {Array.isArray(profile[key])
            ? profile[key].join(", ")
            : profile[key]?.toString() || "—"}
        </p>
      )}
      {errors[key] && (
        <p className="text-red-400 text-sm mt-1">{errors[key]}</p>
      )}
    </div>
  );

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
              Patient Profile
            </h1>
            <p className="mt-2 text-zinc-400 text-sm">
              Manage your personal and medical details.
            </p>
          </div>
          <button
            onClick={() => (editing ? handleSave() : setEditing(true))}
            className={`rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium transition-all ${
              editing
                ? "text-green-400 hover:bg-green-500/20"
                : "text-cyan-400 hover:bg-cyan-500/20"
            }`}
          >
            {editing ? "💾 Save" : "✏️ Edit Profile"}
          </button>
        </div>

        {/* Sections */}
        <div className="rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900/60 to-zinc-950/60 p-8 shadow-[0_0_25px_-5px_rgba(6,182,212,0.15)] hover:shadow-[0_0_35px_-5px_rgba(20,184,166,0.25)] transition-all duration-300">
          {/* Personal Info */}
          <h2 className="text-lg font-semibold text-cyan-400 mb-4">🧍 Personal Information</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              ["name", "Full Name"],
              ["gender", "Gender", "select", ["Male", "Female", "Other"]],
              ["age", "Age", "number"],
              ["height", "Height (cm)", "number"],
              ["weight", "Weight (kg)", "number"],
              ["bmi", "BMI", "number"],
            ].map((f) => renderField(...f))}
          </div>

          {/* Lifestyle Info */}
          <h2 className="text-lg font-semibold text-cyan-400 mt-10 mb-4">💪 Lifestyle</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              ["smoker", "Smoker", "select", ["Yes", "No"]],
              ["alcohol", "Alcohol Consumption", "select", ["Yes", "No"]],
              ["activityLevel", "Activity Level", "select", ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"]],
              ["dietType", "Diet Type", "select", ["Vegetarian", "Non-Vegetarian", "Vegan", "Mixed"]],
              ["stressLevel", "Stress Level", "select", ["Low", "Moderate", "High"]],
              ["sleepHours", "Sleep Hours", "number"],
            ].map((f) => renderField(...f))}
          </div>

          {/* Medical Info */}
          <h2 className="text-lg font-semibold text-cyan-400 mt-10 mb-4">🩺 Medical Details</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              ["diabetes", "Diabetes", "select", ["No", "Type 1", "Type 2"]],
              ["cholesterol", "Cholesterol", "select", ["Normal", "Borderline High", "High", "Unknown"]],
              ["familyHistory", "Family History of BP", "select", ["Yes", "No"]],
              ["currentMedication", "Current Medication (comma separated)"],
              ["previousMedication", "Previous Medication (comma separated)"],
              ["allergies", "Allergies (comma separated)"],
            ].map((f) => renderField(...f))}
          </div>

          {message && <p className="mt-6 text-cyan-400">{message}</p>}
        </div>
      </div>
    </div>
  );
}
