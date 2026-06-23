'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import UserNav from '@/components/UserNav';
import UserFooter from '@/components/UserFooter';

export default function MedicationsPage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState({});

  useEffect(() => {
    if (!isSignedIn || !user) return;

    const fetchMedications = async () => {
      try {
        const clerkId = user.id;
        const res = await fetch('/api/get-prescription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clerkId }),
        });

        const data = await res.json();
        if (data.success) {
          const activePrescription = data.data.find(
            p =>
              p.prescriptionStatus?.toLowerCase() ===
              "approved" &&
              p.isActive === true
          );

          setMedications(
            activePrescription
              ? [activePrescription]
              : []
          );
        }
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, [isSignedIn, user]);

  // ✅ Create 7-day medication schedule (with localStorage persistence)
  const createSchedule = (medicationName) => {
    const plan = [];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);

      const morning = {
        date: date.toDateString(),
        time: '8:30 AM',
        period: 'Morning',
        taken: false,
      };
      const evening = {
        date: date.toDateString(),
        time: '8:30 PM',
        period: 'Evening',
        taken: false,
      };

      plan.push(morning, evening);
    }

    const updatedSchedules = {
      ...schedules,
      [medicationName]: plan,
    };

    setSchedules(updatedSchedules);
    localStorage.setItem('medicationSchedules', JSON.stringify(updatedSchedules));

    alert(`✅ 7-day schedule set for ${medicationName}`);
  };

  // ✅ Toggle medicine taken checkbox (and save to localStorage)
  const toggleTaken = (medicationName, index) => {
    setSchedules((prev) => {
      const updated = { ...prev };
      updated[medicationName][index].taken = !updated[medicationName][index].taken;

      localStorage.setItem('medicationSchedules', JSON.stringify(updated));
      return updated;
    });
  };

  // ✅ Load from localStorage on page load
  useEffect(() => {
    const stored = localStorage.getItem('medicationSchedules');
    if (stored) {
      setSchedules(JSON.parse(stored));
    }
  }, []);

  // ✅ Handle prescription PDF redirect
  const handleGetPrescription = (prescription) => {
    sessionStorage.setItem('prescriptionData', JSON.stringify(prescription));
    router.push('/patient/report');
  };

  if (!isSignedIn)
    return <div className="text-white p-4">Please sign in to view your medications.</div>;
  if (loading)
    return <div className="text-white p-4">Loading medications...</div>;

  return (
    <>
      <UserNav />

      <div className="min-h-screen bg-black">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white">Your Medications</h1>
            <p className="mt-3 text-lg text-zinc-400">
              View your approved prescriptions with medication schedules, dosage, diet, and exercise plans.
            </p>
          </div>

          <div className="space-y-6">
            {medications.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/10">
                  <svg className="h-10 w-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">No Approved Prescriptions</h3>
                <p className="mt-2 text-zinc-400">
                  You don&apos;t have any approved prescriptions yet. Generate one from the{" "}
                  <a href="/patient/symptoms" className="text-cyan-400 hover:text-cyan-300 underline">
                    Symptoms
                  </a>{" "}
                  page and wait for your doctor to approve it.
                </p>
              </div>
            ) : (
              medications.map((prescription) => (
                <div
                  key={prescription.id}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10"
                >
                  {/* Header */}
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-white">Prescription Details</h2>
                        <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400 ring-1 ring-green-500/20">
                          {prescription.prescriptionStatus.charAt(0).toUpperCase() + prescription.prescriptionStatus.slice(1)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">
                        Stage: <span className="font-semibold text-cyan-400">{prescription.stage}</span>
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">
                        Doctor:
                        <span className="ml-2 font-semibold text-white">
                          {prescription.doctorName || "Awaiting Doctor Approval"}
                        </span>
                      </p>

                      <p className="mt-1 text-sm text-zinc-400">
                        Prescription Date:
                        <span className="ml-2 font-semibold text-white">
                          {prescription.approvedAt
                            ? new Date(
                              prescription.approvedAt
                            ).toLocaleDateString()
                            : "Pending Approval"}
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleGetPrescription(prescription)}
                      className="group/btn relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/40"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 -translate-x-full transition-transform duration-700 group-hover/btn:translate-x-full"></div>
                      <div className="relative flex items-center gap-2">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Get Prescription PDF</span>
                      </div>
                    </button>
                  </div>

                  {/* Medications Section */}
                  <div className="rounded-xl border border-zinc-800 bg-black/30 p-5 mb-6">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="rounded-lg bg-cyan-500/10 p-2">
                        <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-white">💊 Medications</h3>
                    </div>

                    {prescription.medications.map((med, idx) => (
                      <div key={`${med}-${idx}`} className="mb-3 rounded-lg bg-zinc-900/50 p-3">
                        <p className="font-medium text-white flex items-center justify-between">
                          {med}
                          <button
                            onClick={() => createSchedule(med)}
                            className="ml-3 rounded-lg bg-cyan-600 px-3 py-1 text-xs font-semibold text-white hover:bg-cyan-700 transition"
                          >
                            Set 7-Day Schedule
                          </button>
                        </p>

                        {/* Schedule display */}
                        {schedules[med] && (
                          <div className="mt-3 rounded-lg bg-zinc-800/40 p-3">
                            <div className="grid grid-cols-2 gap-4">
                              {/* Morning Column */}
                              <div>
                                <h4 className="text-cyan-400 font-semibold mb-1">🌅 Morning</h4>
                                {schedules[med]
                                  .filter((slot) => slot.period === 'Morning')
                                  .map((slot, i) => (
                                    <label
                                      key={i}
                                      className="flex items-center gap-2 text-sm text-zinc-300 mb-1 cursor-pointer select-none"
                                    >
                                      <div className="relative flex items-center justify-center w-7 h-7 bg-white rounded border-2 border-cyan-400">
                                        <input
                                          type="checkbox"
                                          checked={slot.taken}
                                          onChange={() =>
                                            toggleTaken(med, schedules[med].indexOf(slot))
                                          }
                                          className="w-5 h-5 cursor-pointer accent-green-500"
                                        />
                                      </div>
                                      {slot.date} — {slot.time}
                                    </label>
                                  ))}
                              </div>


                              {/* Evening Column */}
                              <div>
                                <h4 className="text-teal-400 font-semibold mb-1">🌇 Evening</h4>
                                {schedules[med]
                                  .filter((slot) => slot.period === 'Evening')
                                  .map((slot, i) => (
                                    <label
                                      key={i}
                                      className="flex items-center gap-2 text-sm text-zinc-300 mb-1 cursor-pointer select-none"
                                    >
                                      <div className="relative flex items-center justify-center w-7 h-7 bg-white rounded border-2 border-teal-400">
                                        <input
                                          type="checkbox"
                                          checked={slot.taken}
                                          onChange={() =>
                                            toggleTaken(med, schedules[med].indexOf(slot))
                                          }
                                          className="w-5 h-5 cursor-pointer accent-green-500"
                                        />
                                      </div>
                                      {slot.date} — {slot.time}
                                    </label>
                                  ))}
                              </div>
                            </div>
                          </div>
                        )}


                        {/* ✅ Dosage & Usage restored */}
                        {prescription.dosage && (
                          <p className="mt-2 text-sm text-zinc-400">
                            <span className="font-semibold">Dosage:</span> {prescription.dosage}
                          </p>
                        )}
                        {prescription.usage && (
                          <p className="mt-1 text-sm text-zinc-400">
                            <span className="font-semibold">Usage:</span> {prescription.usage}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Exercise Section */}
                  <div className="rounded-xl border border-zinc-800 bg-black/30 p-5 mb-6">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="rounded-lg bg-purple-500/10 p-2">
                        <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-white">🏃 Exercise Recommendations</h3>
                    </div>
                    <div className="rounded-lg bg-purple-500/5 p-4 ring-1 ring-purple-500/20">
                      <p className="text-sm leading-relaxed text-zinc-300">{prescription.exercise}</p>
                    </div>
                  </div>

                  {/* Diet Section */}
                  <div className="rounded-xl border border-zinc-800 bg-black/30 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="rounded-lg bg-green-500/10 p-2">
                        <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-white">🥗 Diet Plan</h3>
                    </div>
                    <div className="rounded-lg bg-green-500/5 p-4 ring-1 ring-green-500/20">
                      <p className="text-sm leading-relaxed text-zinc-300">{prescription.diet}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-4 text-sm text-zinc-500">
                    <div>
                      <span className="font-semibold">Prescription ID:</span> {prescription.id}
                    </div>
                    <div>Click "Get Prescription PDF" to download your complete prescription</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <UserFooter />
    </>
  );
}