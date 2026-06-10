"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserNav from "@/components/UserNav";
import UserFooter from "@/components/UserFooter";
import usePatientProfile from "@/hooks/usePatientProfile";

export default function ReportPage() {
  const router = useRouter();
  const { profile: patientProfile, loading: profileLoading } = usePatientProfile();
  const [showPreview, setShowPreview] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [PDFComponents, setPDFComponents] = useState(null);
  const [PrescriptionDoc, setPrescriptionDoc] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState(null);

  useEffect(() => {
    setIsClient(true);
    
    // Import PDF components only on client side
    import("@react-pdf/renderer").then((mod) => {
      setPDFComponents({
        PDFDownloadLink: mod.PDFDownloadLink,
        PDFViewer: mod.PDFViewer,
      });
    });

    import("./PrescriptionDocument").then((mod) => {
      setPrescriptionDoc(() => mod.default);
    });

    // Get prescription data from sessionStorage
    const storedData = sessionStorage.getItem('prescriptionData');
    if (storedData) {
      const prescription = JSON.parse(storedData);
      
      // Transform prescription data to match PDF format
      const transformedData = {
        doctor: {
          name: prescription.doctorName || "Doctor Name",
          qualification: "MBBS, MD",
          regNumber: "MCI-12345678",
          specialization: "General Physician",
          hospital: "Neurova Healthcare Center",
          address: "Healthcare Plaza, India",
          phone: "+91 98765 43210",
          email: "doctor@neurova.health",
        },
        patient: {
          name: patientProfile?.name || "Patient",
          age: patientProfile?.age || 0,
          gender: patientProfile?.gender || "N/A",
          patientId: prescription._id?.slice(-8) || "P12345",
          phone: patientProfile?.phone || "N/A",
          address: "Patient Address",
          weight: patientProfile?.weight ? `${patientProfile.weight} kg` : "N/A",
          height: patientProfile?.height ? `${patientProfile.height} cm` : "N/A",
          bloodGroup: "O+",
        },
        vitals: {
          bp: `${prescription.systolic}/${prescription.diastolic} mmHg` || "N/A",
          pulse: "N/A",
          temp: "98.6°F",
          spo2: "98%",
          weight: patientProfile?.weight ? `${patientProfile.weight} kg` : "N/A",
        },
        diagnosis: [
          `${prescription.stage} Hypertension`,
        ],
        medications: prescription.medications.map(med => ({
          name: med,
          dosage: prescription.dosage || "As prescribed",
          frequency: prescription.usage || "As directed",
          duration: "30 days",
          timing: "After meals",
          instructions: "Take with plenty of water",
        })),
        tests: [],
        advice: [
          prescription.diet,
          prescription.exercise,
          "Monitor BP regularly",
          "Follow-up visit recommended",
        ].filter(Boolean),
        date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
        nextVisit: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
        prescriptionId: `RX-${prescription._id?.slice(-8)}`,
      };
      
      setPrescriptionData(transformedData);
    } else {
      // If no data, redirect back to medications page
      router.push('/patient/medications');
    }
  }, [router, patientProfile, profileLoading]);

  if (!prescriptionData || profileLoading) {
    return (
      <>
        <UserNav />
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            <p className="text-lg text-zinc-400">Loading prescription data...</p>
          </div>
        </div>
        <UserFooter />
      </>
    );
  }

  return (
    <>
      <UserNav />
      <div className="min-h-screen bg-black pt-8 pb-16">
        {/* Header Section */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-cyan-500 to-teal-600 mb-6 shadow-lg shadow-cyan-500/30 animate-in zoom-in duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 animate-in slide-in-from-bottom-4 duration-500">
              Medical Prescription Report
            </h1>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed animate-in slide-in-from-bottom-6 duration-700">
              Generate, preview, and download your medical prescription in professional PDF format
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-zinc-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Your prescription data is secure and encrypted</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Prescription Info Card */}
          <div className="rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm p-10 mb-8 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Prescription Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="group rounded-xl bg-linear-to-br from-cyan-500/10 to-cyan-600/5 p-6 border border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Prescription ID
                  </h3>
                </div>
                <p className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">{prescriptionData.prescriptionId}</p>
              </div>
              <div className="group rounded-xl bg-linear-to-br from-teal-500/10 to-teal-600/5 p-6 border border-teal-500/30 hover:border-teal-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-teal-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                    Date Issued
                  </h3>
                </div>
                <p className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">{prescriptionData.date}</p>
              </div>
              <div className="group rounded-xl bg-linear-to-br from-purple-500/10 to-purple-600/5 p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    Doctor
                  </h3>
                </div>
                <p className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">{prescriptionData.doctor.name}</p>
                <p className="text-xs text-purple-400/70 mt-1">{prescriptionData.doctor.specialization}</p>
              </div>
              <div className="group rounded-xl bg-linear-to-br from-green-500/10 to-green-600/5 p-6 border border-green-500/30 hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider">
                    Patient
                  </h3>
                </div>
                <p className="text-xl font-bold text-white group-hover:text-green-300 transition-colors">{prescriptionData.patient.name}</p>
                <p className="text-xs text-green-400/70 mt-1">{prescriptionData.patient.age} Years, {prescriptionData.patient.gender}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="group relative overflow-hidden bg-linear-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white font-bold py-5 px-8 rounded-xl shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/25 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="flex items-center justify-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="block text-lg font-bold">{showPreview ? 'Hide Preview' : 'Preview Prescription'}</span>
                    <span className="block text-xs text-purple-100">{showPreview ? 'Close PDF viewer' : 'View in browser'}</span>
                  </div>
                </div>
              </button>

              {isClient && PDFComponents && PrescriptionDoc ? (
                <PDFComponents.PDFDownloadLink
                  document={<PrescriptionDoc data={prescriptionData} />}
                  fileName={`prescription_${prescriptionData.patient.name.replace(/\s/g, '_')}_${prescriptionData.date}.pdf`}
                  className="w-full"
                >
                  {({ loading }) => (
                    <button
                      disabled={loading}
                      className="group relative w-full overflow-hidden bg-linear-to-r from-cyan-500 via-teal-500 to-green-500 hover:from-cyan-600 hover:via-teal-600 hover:to-green-600 text-white font-bold py-5 px-8 rounded-xl shadow-xl shadow-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/25 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <div className="flex items-center justify-center gap-3 relative z-10">
                        {loading ? (
                          <>
                            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="text-lg">Generating PDF...</span>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="text-left">
                              <span className="block text-lg font-bold">Download Prescription</span>
                              <span className="block text-xs text-cyan-100">Save as PDF document</span>
                            </div>
                          </>
                        )}
                      </div>
                    </button>
                  )}
                </PDFComponents.PDFDownloadLink>
              ) : (
                <button
                  disabled
                  className="w-full relative group overflow-hidden bg-linear-to-r from-cyan-500 to-teal-600 text-white font-bold py-5 px-8 rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-300 opacity-50 cursor-not-allowed"
                >
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-lg">Loading PDF Generator...</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* PDF Preview */}
          {showPreview && isClient && PDFComponents && PrescriptionDoc && (
            <div className="rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm p-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Live PDF Preview</h2>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                >
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="w-full rounded-xl overflow-hidden border-2 border-zinc-700 shadow-inner" style={{ height: '80vh' }}>
                <PDFComponents.PDFViewer width="100%" height="100%" className="rounded-xl">
                  <PrescriptionDoc data={prescriptionData} />
                </PDFComponents.PDFViewer>
              </div>
            </div>
          )}

          {/* Prescription Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Medications */}
            <div className="rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm p-8 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Prescribed Medications</h3>
              </div>
              <div className="space-y-3">
                {prescriptionData.medications.map((med, idx) => (
                  <div key={idx} className="group rounded-xl bg-linear-to-br from-black/50 to-zinc-900/50 p-5 border border-zinc-800 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                          {idx + 1}
                        </div>
                        <h4 className="text-xl font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">{med.name}</h4>
                      </div>
                      <span className="px-3 py-1 rounded-lg bg-teal-500/20 border border-teal-500/30 text-sm font-semibold text-teal-400">{med.dosage}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{med.frequency}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{med.timing}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{med.duration}</span>
                      </div>
                      <div className="col-span-2 flex items-start gap-2 text-zinc-500 mt-2 pt-2 border-t border-zinc-800">
                        <svg className="w-4 h-4 text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs leading-relaxed">{med.instructions}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnosis & Advice */}
            <div className="space-y-5">
              {/* Diagnosis */}
              <div className="rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm p-8 shadow-2xl hover:shadow-purple-500/10 transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Clinical Diagnosis</h3>
                </div>
                <ul className="space-y-3">
                  {prescriptionData.diagnosis.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                        <span className="w-2.5 h-2.5 bg-purple-400 rounded-full"></span>
                      </div>
                      <span className="text-zinc-200 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Advice */}
              <div className="rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm p-8 shadow-2xl hover:shadow-green-500/10 transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Medical Advice</h3>
                </div>
                <ul className="space-y-3">
                  {prescriptionData.advice.slice(0, 4).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-colors">
                      <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-zinc-300 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tests */}
              <div className="rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm p-8 shadow-2xl hover:shadow-pink-500/10 transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                    <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Recommended Tests</h3>
                </div>
                <ul className="space-y-3">
                  {prescriptionData.tests.map((test, idx) => (
                    <li key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-pink-500/5 border border-pink-500/20 hover:border-pink-500/40 transition-colors">
                      <div className="w-6 h-6 rounded bg-pink-500/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-pink-400">{idx + 1}</span>
                      </div>
                      <span className="text-sm text-zinc-300 font-medium">{test}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UserFooter />
    </>
  );
}
