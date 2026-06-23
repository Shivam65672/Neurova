"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Pencil } from "lucide-react";

export default function DoctorProfile() {
  const { user, isLoaded } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    age: "",
    degree: "",
    experienceYears: "",
    currentHospital: "",
    hospitalExperience: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch profile once Clerk user is ready
  useEffect(() => {
    if (isLoaded && user) {
      fetchDoctorProfile();
    }
  }, [user, isLoaded]);

  const fetchDoctorProfile = async () => {
    try {
      const res = await fetch(`/api/doctor/profile?clerkUserId=${user.id}`);
      const data = await res.json();

      // If profile exists, set it
      if (data.success && data.profile) {
        setFormData(data.profile);
      } else {
        // If no profile, create one with default + clerk data
        const defaultProfile = {
          clerkUserId: user.id,
          name: user.fullName || "Doctor Name",
          gender: "Other",
          age: 30,
          degree: "MBBS",
          experienceYears: 0,
          currentHospital: "Not specified",
          hospitalExperience: [],
        };

        // Save to backend (auto-create)
        const createRes = await fetch("/api/doctor/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(defaultProfile),
        });

        const createData = await createRes.json();
        if (createData.success) {
          setFormData(defaultProfile);
          console.log("Default profile created for doctor.");
        }
      }
    } catch (err) {
      console.error("Error fetching doctor profile:", err);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleHospitalChange = (index, e) => {
    const newExp = [...formData.hospitalExperience];
    newExp[index][e.target.name] = e.target.value;
    setFormData({ ...formData, hospitalExperience: newExp });
  };

  const addHospital = () => {
    setFormData({
      ...formData,
      hospitalExperience: [
        ...formData.hospitalExperience,
        { hospitalName: "", yearsWorked: "" },
      ],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/doctor/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, clerkUserId: user.id }),
    });
    const data = await res.json();
    alert(data.message);
    setIsEditing(false);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400">Doctor Profile</h1>
            <p className="text-gray-400 text-sm">
              Manage your personal and professional details.
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 border border-cyan-400 text-cyan-400 px-4 py-2 rounded-md hover:bg-cyan-400 hover:text-black transition"
          >
            <Pencil size={16} /> {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-gray-800 shadow-md">
          {!isEditing ? (
            <>
              <h2 className="text-lg font-semibold text-cyan-300 mb-4">
                👨‍⚕️ Professional Information
              </h2>
              <div className="grid grid-cols-1 gap-y-3 text-gray-300 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-white font-medium">{formData.name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-white font-medium">{formData.gender || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="text-white font-medium">{formData.age || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Degree</p>
                  <p className="text-white font-medium">{formData.degree || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experience (Years)</p>
                  <p className="text-white font-medium">
                    {formData.experienceYears || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Hospital</p>
                  <p className="text-white font-medium">
                    {formData.currentHospital || "—"}
                  </p>
                </div>
              </div>

              {formData.hospitalExperience?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold text-cyan-300 mb-2">
                    🏥 Hospital Experience
                  </h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {formData.hospitalExperience.map((exp, i) => (
                      <li key={i}>
                        {exp.hospitalName || "Unnamed"} — {exp.yearsWorked || 0} years
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="p-2 bg-transparent border border-gray-700 rounded-md text-white"
                  required
                />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="p-2 bg-transparent border border-gray-700 rounded-md text-white"
                  required
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
                <input
                  name="age"
                  type="number"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleChange}
                  className="p-2 bg-transparent border border-gray-700 rounded-md text-white"
                  required
                />
                <input
                  name="degree"
                  placeholder="Degree (e.g. MBBS, MD)"
                  value={formData.degree}
                  onChange={handleChange}
                  className="p-2 bg-transparent border border-gray-700 rounded-md text-white"
                  required
                />
                <input
                  name="experienceYears"
                  type="number"
                  placeholder="Experience (Years)"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  className="p-2 bg-transparent border border-gray-700 rounded-md text-white"
                  required
                />
                <input
                  name="currentHospital"
                  placeholder="Current Hospital"
                  value={formData.currentHospital}
                  onChange={handleChange}
                  className="p-2 bg-transparent border border-gray-700 rounded-md text-white"
                />
              </div>

              <div>
                <h3 className="font-semibold text-cyan-300 mb-2">
                  🏥 Hospital Experience
                </h3>
                {formData.hospitalExperience.map((exp, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      name="hospitalName"
                      placeholder="Hospital Name"
                      value={exp.hospitalName}
                      onChange={(e) => handleHospitalChange(index, e)}
                      className="p-2 flex-1 bg-transparent border border-gray-700 rounded-md text-white"
                    />
                    <input
                      name="yearsWorked"
                      type="number"
                      placeholder="Years"
                      value={exp.yearsWorked}
                      onChange={(e) => handleHospitalChange(index, e)}
                      className="p-2 w-24 bg-transparent border border-gray-700 rounded-md text-white"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addHospital}
                  className="text-cyan-400 hover:underline text-sm mt-2"
                >
                  + Add Hospital
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 text-black font-semibold py-2 rounded-md hover:bg-cyan-400 transition"
              >
                {loading ? "Saving..." : "Save Profile"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
