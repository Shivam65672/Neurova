'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import DocNav from '@/components/DocNav';
import DocFooter from '@/components/DocFooter';
import BPTrendChart from '@/components/BPTrendChart';

export default function DoctorPatientDetail({ params }) {
  const { id } = use(params);
  const [patient, setPatient] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Check if this is a demo patient from alerts
    if (id && id.startsWith('demo-')) {
      setIsDemo(true);
      const demoData = sessionStorage.getItem('demoPatient');
      if (demoData) {
        const patientData = JSON.parse(demoData);
        
        // Generate demo BP history
        const bpHistory = generateDemoBPHistory(patientData);
        
        setPatient({
          id,
          ...patientData,
          bpHistory,
          medications: [
            { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days', usage: 'Take in the morning with water' },
            { name: 'Metoprolol', dosage: '25mg', frequency: 'Twice daily', duration: '30 days', usage: 'Take with meals' }
          ],
          diet: 'Low sodium diet (< 2000mg/day), DASH diet, increase fruits and vegetables, limit processed foods, reduce saturated fats',
          exercise: '30 minutes of moderate walking daily, light cardio exercises, avoid heavy lifting during crisis period',
          allergies: ['Penicillin'],
          medicalHistory: ['Type 2 Diabetes', 'High Cholesterol'],
          lastVisit: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          nextAppointment: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()
        });
      }
    } else {
      // Regular patient data
      setPatient({
        id,
        name: 'John Doe',
        age: 40,
        lastReading: '2025-11-06',
        bp: '128/82',
        notes: 'Demo patient for UI'
      });
    }
  }, [id]);

  const generateDemoBPHistory = (patientData) => {
    const history = [];
    const today = new Date();
    
    if (patientData.severity === 'critical') {
      // Hypertensive Crisis - escalating pattern
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        history.push({
          date: date.toLocaleDateString(),
          systolic: 145 + (6 - i) * 7,
          diastolic: 92 + (6 - i) * 5,
          time: '10:00 AM'
        });
      }
    } else if (patientData.severity === 'high') {
      // Rapid Escalation
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        history.push({
          date: date.toLocaleDateString(),
          systolic: 128 + (6 - i) * 6,
          diastolic: 82 + (6 - i) * 3,
          time: '09:00 AM'
        });
      }
    }
    
    return history;
  };

  if (!patient) {
    return (
      <>
        <DocNav />
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
            <p className="text-lg text-zinc-400">Loading patient details...</p>
          </div>
        </div>
        <DocFooter />
      </>
    );
  }

  return (
    <>
      <DocNav />
      <div className="min-h-screen bg-black py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <Link 
              href={isDemo ? "/doctor/alerts" : "/doctor/patients"}
              className="mb-4 flex items-center text-sm text-zinc-400 transition-colors hover:text-white"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {isDemo ? 'Back to Alerts' : 'Back to Patients'}
            </Link>
            
            {/* Alert Banner for Demo Patients */}
            {isDemo && patient.severity && (
              <div className={`mb-6 rounded-2xl border p-6 ${
                patient.severity === 'critical' 
                  ? 'border-red-900/50 bg-red-900/20' 
                  : 'border-orange-900/50 bg-orange-900/20'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {patient.severity === 'critical' ? '🚨' : '⚠️'}
                      </span>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{patient.alertType}</h2>
                        <p className={`mt-1 text-sm ${
                          patient.severity === 'critical' ? 'text-red-400' : 'text-orange-400'
                        }`}>
                          {patient.message}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className={`rounded-full px-4 py-2 text-sm font-semibold uppercase ${
                    patient.severity === 'critical' 
                      ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30' 
                      : 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30'
                  }`}>
                    {patient.severity}
                  </span>
                </div>
              </div>
            )}

            {/* Patient Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-emerald-500 text-3xl font-bold text-white">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">{patient.name}</h1>
                  <div className="mt-2 flex items-center gap-4 text-zinc-400">
                    <span>{patient.age} years</span>
                    <span>•</span>
                    <span>{patient.gender || 'Male'}</span>
                    {patient.stage && (
                      <>
                        <span>•</span>
                        <span className="font-medium text-orange-400">{patient.stage}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations for Demo Patients */}
          {isDemo && patient.recommendations && (
            <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-4 text-xl font-bold text-white">🎯 Immediate Action Required</h3>
              <ul className="space-y-3">
                {patient.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-400">
                      {idx + 1}
                    </span>
                    <span className="text-zinc-300">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Latest Vitals */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-4 text-xl font-bold text-white">📊 Latest Vitals</h3>
              <div className="space-y-4">
                <div className="rounded-xl bg-black/30 p-4">
                  <p className="text-sm text-zinc-400">Blood Pressure</p>
                  {isDemo && patient.latestBP ? (
                    <>
                      <p className={`mt-1 text-3xl font-bold ${
                        patient.latestBP.systolic >= 180 ? 'text-red-400' :
                        patient.latestBP.systolic >= 140 ? 'text-orange-400' :
                        'text-green-400'
                      }`}>
                        {patient.latestBP.systolic}/{patient.latestBP.diastolic}
                        <span className="ml-2 text-sm font-normal text-zinc-400">mmHg</span>
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Recorded {new Date(patient.latestBP.timestamp).toLocaleString()}
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 text-3xl font-bold text-green-400">
                      {patient.bp}
                      <span className="ml-2 text-sm font-normal text-zinc-400">mmHg</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-4 text-xl font-bold text-white">👤 Patient Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Last Visit</span>
                  <span className="font-medium text-white">{patient.lastVisit || patient.lastReading}</span>
                </div>
                {patient.nextAppointment && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Next Appointment</span>
                    <span className="font-medium text-teal-400">{patient.nextAppointment}</span>
                  </div>
                )}
                {patient.allergies && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Allergies</span>
                    <span className="font-medium text-red-400">{patient.allergies.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BP Trend Chart for Demo Patients */}
          {isDemo && patient.bpHistory && patient.bpHistory.length > 0 && (
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-4 text-xl font-bold text-white">📈 Blood Pressure Trend (Last 7 Days)</h3>
              <BPTrendChart data={patient.bpHistory} />
            </div>
          )}

          {/* Current Medications */}
          {patient.medications && (
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-4 text-xl font-bold text-white">💊 Current Medications</h3>
              <div className="space-y-3">
                {patient.medications.map((med, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl bg-black/30 p-4">
                    <div>
                      <p className="font-semibold text-white">{med.name}</p>
                      <p className="text-sm text-zinc-400">{med.dosage} • {med.frequency}</p>
                      {med.usage && <p className="mt-1 text-xs text-zinc-500">{med.usage}</p>}
                    </div>
                    <span className="rounded-full bg-teal-500/20 px-3 py-1 text-xs font-medium text-teal-400">
                      {med.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lifestyle Recommendations */}
          {patient.diet && patient.exercise && (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="mb-4 text-xl font-bold text-white">🥗 Diet Plan</h3>
                <p className="text-sm leading-relaxed text-zinc-300">{patient.diet}</p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="mb-4 text-xl font-bold text-white">🏃 Exercise Plan</h3>
                <p className="text-sm leading-relaxed text-zinc-300">{patient.exercise}</p>
              </div>
            </div>
          )}

          {/* AI Suggestions for Non-Demo Patients */}
          {!isDemo && (
            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h4 className="text-lg font-semibold text-white">Recent AI Suggestions</h4>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/50 p-3">
                  <div>
                    <p className="font-medium text-white">Amlodipine 5mg</p>
                    <p className="text-sm text-zinc-400">Suggested due to elevated trend</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-md bg-cyan-600 px-3 py-1 text-sm text-white hover:bg-cyan-700">Approve</button>
                    <button className="rounded-md border border-zinc-700 px-3 py-1 text-sm text-white hover:bg-zinc-800">Modify</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-4">
            <button className="flex-1 rounded-xl bg-linear-to-r from-teal-500 to-emerald-500 px-6 py-4 font-semibold text-white shadow-lg shadow-teal-500/30 transition-all hover:scale-[1.02] hover:shadow-teal-500/40">
              📞 Contact Patient
            </button>
            <button className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/50 px-6 py-4 font-semibold text-white transition-all hover:bg-zinc-800">
              📝 Update Prescription
            </button>
            <button className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/50 px-6 py-4 font-semibold text-white transition-all hover:bg-zinc-800">
              📅 Schedule Appointment
            </button>
          </div>
        </div>
      </div>
      <DocFooter />
    </>
  );
}
