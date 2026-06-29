// API used:
// - api/patient/bp-readings.js to fetch and save blood pressure readings
// - api/patient/profile.js to get patient profile details

'use client';

import { useState, useEffect } from 'react';
import BPTrendChart from '@/components/BPTrendChart';
import UserNav from '@/components/UserNav';
import UserFooter from '@/components/UserFooter';
import { useUser } from "@clerk/nextjs";

export default function BPTracker() {
  const { user, isLoaded } = useUser();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    systolic: '',
    diastolic: '',
    pulse: '',
    notes: '',
  });

  const [readings, setReadings] = useState([]);

  // Fetch CSV data on component mount
  useEffect(() => {
    if (!isLoaded || !user?.id) return;

    const fetchReadings = async () => {
      try {
        const res = await fetch(`/api/patient/bp-readings?clerkId=${user.id}`);
        const data = await res.json();

        if (data.success) {
          setReadings(data.readings);
        } else {
          console.error("Failed to load BP readings:", data.error);
        }
      } catch (err) {
        console.error("Error fetching BP readings:", err);
      }
    };

    fetchReadings();
  }, [isLoaded, user?.id]);

  // Chart data: reverse to show oldest → newest
  const chartData = [...readings]
    .map((r) => {
      const d = new Date(r.timestamp);

      return {
        // unique x-axis key
        x: r.timestamp,

        // x-axis label (dd-mm)
        date:
          String(d.getDate()).padStart(2, "0") +
          "-" +
          String(d.getMonth() + 1).padStart(2, "0"),

        // tooltip date (dd-mm-yyyy)
        fullDate:
          String(d.getDate()).padStart(2, "0") +
          "-" +
          String(d.getMonth() + 1).padStart(2, "0") +
          "-" +
          d.getFullYear(),

        // tooltip time (hh:mm AM/PM)
        time: d.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),

        systolic: r.systolic,
        diastolic: r.diastolic,
      };
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'elevated':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const profileRes = await fetch(`/api/patient/profile?clerkUserId=${user.id}`);
      const userProfile = await profileRes.json();

      if (!userProfile || !userProfile.clerkUserId) return;

      const bpPayload = {
        clerkId: userProfile.clerkUserId,
        Name: userProfile.name || userProfile.firstName,
        Age: userProfile.age,
        Gender: userProfile.gender || "Male",
        "Height (cm)": userProfile.height || 170,
        "Weight (kg)": userProfile.weight || 70,
        BMI: userProfile.BMI || 24.2,
        Smoker: userProfile.smoker || false,
        Diabetes: userProfile.diabetic || false,
        Health: userProfile.health || "Fair",
        systolic: formData.systolic,
        diastolic: formData.diastolic,
        pulse: formData.pulse,
        notes: formData.notes,
        date: new Date().toISOString().split("T")[0],
      };

      // Save BP
      await fetch("/api/patient/bp-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bpPayload),
      });

      // Reset form & reload readings
      // Reset form
      setShowAddForm(false);
      setFormData({
        systolic: "",
        diastolic: "",
        pulse: "",
        notes: "",
      });

      // Reload readings from bp-readings API
      const updatedRes = await fetch(
        `/api/patient/bp-readings?clerkId=${user.id}`
      );

      const updatedData = await updatedRes.json();

      if (updatedData.success) {
        setReadings(updatedData.readings);
      }


    } catch (err) {
      console.error("Error saving or predicting BP:", err);
    }
  };

  return (
    <>
      <UserNav />
      <div className="min-h-screen bg-black">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Blood Pressure Tracker</h1>
              <p className="mt-2 text-zinc-400">Monitor and record your blood pressure readings</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center cursor-pointer space-x-2 rounded-lg bg-linear-to-r from-cyan-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:from-cyan-600 hover:to-teal-700 transition-all"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Reading</span>
            </button>
          </div>

          {/* Add Reading Form */}
          {showAddForm && (
            <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-4 text-xl font-bold text-white">New BP Reading</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300">Systolic (mmHg)</label>
                    <input
                      type="number"
                      required
                      value={formData.systolic}
                      onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      placeholder="120"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300">Diastolic (mmHg)</label>
                    <input
                      type="number"
                      required
                      value={formData.diastolic}
                      onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      placeholder="80"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300">Pulse (bpm)</label>
                    <input
                      type="number"
                      value={formData.pulse}
                      onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      placeholder="72"
                    />
                  </div>
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-zinc-300">Notes (optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="How are you feeling?"
                  />
                </div> */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="cursor-pointer rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cursor-pointer rounded-lg bg-linear-to-r from-cyan-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white hover:from-cyan-600 hover:to-teal-700 transition-all"
                  >
                    Save Reading
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* BP Trends Chart */}
          <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">BP Trends (Last 7 Days)</h2>
            <div className="h-80 rounded-lg border border-zinc-800 bg-black/50 p-4">
              <BPTrendChart data={chartData} />
            </div>
            <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-cyan-500"></div>
                <span className="text-zinc-400">Systolic</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-teal-500"></div>
                <span className="text-zinc-400">Diastolic</span>
              </div>
            </div>
          </div>

          {/* Readings History */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
            <div className="border-b border-zinc-800 p-6">
              <h2 className="text-xl font-bold text-white">Reading History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-800 bg-black/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">BP Reading</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Pulse</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Status</th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Notes</th> */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {[...readings]
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((reading, index) => (
                      <tr key={index} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm text-white">
                            {new Date(reading.timestamp).toLocaleDateString("en-GB").replace(/\//g, "-")}
                          </div>

                          <div className="text-xs text-zinc-400">
                            {new Date(reading.timestamp).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-semibold text-white">
                            {reading.systolic}/{reading.diastolic} mmHg
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm text-white">
                            {reading.pulse || "—"} bpm
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusColor(
                              reading.status
                            )}`}
                          >
                            {reading.status
                              ? reading.status.charAt(0).toUpperCase() + reading.status.slice(1)
                              : "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <UserFooter />
    </>
  );
}
