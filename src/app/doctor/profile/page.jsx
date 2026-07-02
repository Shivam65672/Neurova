"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Pencil, Plus, Trash2, Save, X } from "lucide-react";
import DocNav from '@/components/DocNav';
import DocFooter from '@/components/DocFooter';

export default function DoctorProfile() {
  const { user, isLoaded } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    age: "",
    degree: "",
    experienceYears: "",
    currentHospital: "",
    hospitalExperience: [],
    specialization: "",
    licenseNumber: "",
    contactNumber: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  // ✅ Scroll to top with delay to ensure content is loaded
  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    if (!loading) {
      window.scrollTo(0, 0);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchDoctorProfile();
    }
  }, [user, isLoaded]);

  const fetchDoctorProfile = async () => {
    try {
      const res = await fetch(`/api/doctor/profile?clerkUserId=${user.id}`);
      const data = await res.json();

      if (data.success && data.profile) {
        // Set form data with all fields from profile
        setFormData({
          name: data.profile.name || user.fullName || "",
          email: user.emailAddresses?.[0]?.emailAddress || data.profile.email || "",
          gender: data.profile.gender || "",
          age: data.profile.age || "",
          degree: data.profile.degree || "",
          experienceYears: data.profile.experienceYears || "",
          currentHospital: data.profile.currentHospital || "",
          hospitalExperience: data.profile.hospitalExperience || [],
          specialization: data.profile.specialization || "",
          licenseNumber: data.profile.licenseNumber || "",
          contactNumber: data.profile.contactNumber || "",
        });
        console.log("Form data set:", data.profile); // Debug log
      } else {
        // Create default profile
        const defaultProfile = {
          clerkUserId: user.id,
          name: user.fullName || "",
          email: user.emailAddresses?.[0]?.emailAddress || "",
          gender: "",
          age: "",
          degree: "",
          experienceYears: "",
          currentHospital: "",
          hospitalExperience: [],
          specialization: "",
          licenseNumber: "",
          contactNumber: "",
        };

        const createRes = await fetch("/api/doctor/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(defaultProfile),
        });

        const createData = await createRes.json();
        if (createData.success) {
          setFormData({
            ...defaultProfile,
            ...createData.profile,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching doctor profile:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleHospitalChange = (index, field, value) => {
    const newExp = [...formData.hospitalExperience];
    newExp[index] = { ...newExp[index], [field]: value };
    setFormData({ ...formData, hospitalExperience: newExp });
  };

  const addHospital = () => {
    setFormData({
      ...formData,
      hospitalExperience: [
        ...formData.hospitalExperience,
        { hospitalName: "", yearsWorked: "", position: "", department: "" },
      ],
    });
  };

  const removeHospital = (index) => {
    const newExp = formData.hospitalExperience.filter((_, i) => i !== index);
    setFormData({ ...formData, hospitalExperience: newExp });
    setShowDeleteConfirm(false);
    setDeleteIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/doctor/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          clerkUserId: user.id,
          email: user.emailAddresses?.[0]?.emailAddress || formData.email,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Profile saved successfully!");
        setIsEditing(false);
        // Refresh the profile data
        await fetchDoctorProfile();
      } else {
        alert(data.error || "Failed to save profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while saving your profile");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (label, value, isRequired = false) => (
    <div>
      <p className="text-sm text-gray-500">
        {label} {isRequired && <span className="text-red-400">*</span>}
      </p>
      <p className="text-white font-medium">{value || "Not specified"}</p>
    </div>
  );

  if (!isLoaded) {
    return (
      <>
        <DocNav />
        <div className="min-h-screen bg-black text-white flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading profile...</p>
          </div>
        </div>
        <DocFooter />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <DocNav />
        <div className="min-h-screen bg-black text-white flex justify-center items-center">
          <p className="text-gray-400">Please sign in to view your profile.</p>
        </div>
        <DocFooter />
      </>
    );
  }

  return (
    <>
      <DocNav />
      <div className="min-h-screen bg-black text-white flex justify-center p-4 sm:p-6">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-cyan-400">Doctor Profile</h1>
              <p className="text-gray-400 text-sm">
                Manage your personal and professional details.
              </p>
            </div>
            <button
              onClick={() => {
                if (isEditing) {
                  fetchDoctorProfile();
                }
                setIsEditing(!isEditing);
              }}
              className="cursor-pointer flex items-center gap-2 border border-cyan-400 text-cyan-400 px-4 py-2 rounded-md hover:bg-cyan-400 hover:text-black transition"
            >
              {isEditing ? <X size={16} /> : <Pencil size={16} />}
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {/* Profile Content */}
          <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-gray-800 shadow-md">
            {!isEditing ? (
              // View Mode
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h2 className="text-lg font-semibold text-cyan-300 mb-4">
                    👤 Personal Information
                  </h2>
                  <div className="grid grid-cols-1 gap-y-4 text-gray-300 sm:grid-cols-2">
                    {renderField("Full Name", "Dr. " + formData.name, true)}
                    {renderField("Email", formData.email)}
                    {renderField("Gender", formData.gender)}
                    {renderField("Age", formData.age)}
                    {renderField("Contact Number", formData.contactNumber)}
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h2 className="text-lg font-semibold text-cyan-300 mb-4">
                    🏥 Professional Information
                  </h2>
                  <div className="grid grid-cols-1 gap-y-4 text-gray-300 sm:grid-cols-2">
                    {renderField("Degree", formData.degree, true)}
                    {renderField("Specialization", formData.specialization)}
                    {renderField("License Number", formData.licenseNumber)}
                    {renderField("Experience (Years)", formData.experienceYears, true)}
                    {renderField("Current Hospital", formData.currentHospital)}
                  </div>
                </div>

                {/* Hospital Experience */}
                {formData.hospitalExperience?.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-cyan-300 mb-4">
                      🏥 Hospital Experience
                    </h2>
                    <div className="space-y-3">
                      {formData.hospitalExperience.map((exp, index) => (
                        <div
                          key={index}
                          className="bg-gray-900 p-4 rounded-lg border border-gray-800"
                        >
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <div>
                              <p className="text-sm text-gray-500">Hospital</p>
                              <p className="text-white font-medium">
                                {exp.hospitalName || "Not specified"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Years Worked</p>
                              <p className="text-white font-medium">
                                {exp.yearsWorked || "0"} years
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Position</p>
                              <p className="text-white font-medium">
                                {exp.position || "Not specified"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h2 className="text-lg font-semibold text-cyan-300 mb-3">
                    👤 Personal Information
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Email
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md text-gray-400 cursor-not-allowed"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Age
                      </label>
                      <input
                        name="age"
                        type="number"
                        placeholder="Age"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Contact Number
                      </label>
                      <input
                        name="contactNumber"
                        type="tel"
                        placeholder="Contact Number"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h2 className="text-lg font-semibold text-cyan-300 mb-3">
                    🏥 Professional Information
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Degree <span className="text-red-400">*</span>
                      </label>
                      <input
                        name="degree"
                        placeholder="Degree (e.g., MBBS, MD)"
                        value={formData.degree}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Specialization
                      </label>
                      <input
                        name="specialization"
                        placeholder="Specialization (e.g., Cardiology)"
                        value={formData.specialization}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        License Number
                      </label>
                      <input
                        name="licenseNumber"
                        placeholder="License Number"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Experience (Years) <span className="text-red-400">*</span>
                      </label>
                      <input
                        name="experienceYears"
                        type="number"
                        placeholder="Experience (Years)"
                        value={formData.experienceYears}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-gray-400 mb-1">
                        Current Hospital
                      </label>
                      <input
                        name="currentHospital"
                        placeholder="Current Hospital"
                        value={formData.currentHospital}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Hospital Experience */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold text-cyan-300">
                      🏥 Hospital Experience
                    </h2>
                    <button
                      type="button"
                      onClick={addHospital}
                      className="cursor-pointer flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition text-sm"
                    >
                      <Plus size={16} /> Add Hospital
                    </button>
                  </div>

                  {formData.hospitalExperience.map((exp, index) => (
                    <div
                      key={index}
                      className="bg-gray-900 p-4 rounded-lg border border-gray-800 mb-3 relative"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteIndex(index);
                          setShowDeleteConfirm(true);
                        }}
                        className="cursor-pointer absolute top-2 right-2 text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">
                            Hospital Name
                          </label>
                          <input
                            placeholder="Hospital Name"
                            value={exp.hospitalName || ""}
                            onChange={(e) =>
                              handleHospitalChange(index, "hospitalName", e.target.value)
                            }
                            className="w-full p-2 bg-black border border-gray-700 rounded-md text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">
                            Years Worked
                          </label>
                          <input
                            type="number"
                            placeholder="Years"
                            value={exp.yearsWorked || ""}
                            onChange={(e) =>
                              handleHospitalChange(index, "yearsWorked", e.target.value)
                            }
                            className="w-full p-2 bg-black border border-gray-700 rounded-md text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">
                            Position
                          </label>
                          <input
                            placeholder="Position (e.g., Senior Doctor)"
                            value={exp.position || ""}
                            onChange={(e) =>
                              handleHospitalChange(index, "position", e.target.value)
                            }
                            className="w-full p-2 bg-black border border-gray-700 rounded-md text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">
                            Department
                          </label>
                          <input
                            placeholder="Department"
                            value={exp.department || ""}
                            onChange={(e) =>
                              handleHospitalChange(index, "department", e.target.value)
                            }
                            className="w-full p-2 bg-black border border-gray-700 rounded-md text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-800">
                  <button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer flex-1 bg-cyan-500 text-black font-semibold py-2 rounded-md hover:bg-cyan-400 transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} /> Save Profile
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      fetchDoctorProfile();
                      setIsEditing(false);
                    }}
                    className="cursor-pointer flex-1 bg-gray-800 text-gray-300 font-semibold py-2 rounded-md hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg max-w-sm w-full border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2">Remove Hospital Experience?</h3>
            <p className="text-gray-400 text-sm mb-4">
              This will permanently remove this hospital experience from your profile.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteIndex(null);
                }}
                className="flex-1 bg-gray-700 text-white py-2 rounded-md hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => removeHospital(deleteIndex)}
                className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <DocFooter />
    </>
  );
}