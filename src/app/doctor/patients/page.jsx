'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DocNav from '@/components/DocNav';
import DocFooter from '@/components/DocFooter';

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch('/api/get-all-prescription', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        console.log("data", data.data)
        if (data.success) {
          const mappedPatients = data.data.map((p, index) => ({
            id: p.id, // Use the actual MongoDB _id
            clerkId: p.clerkId,
            name: p.patientName,
            age: p.patientAge,
            lastReading: new Date(p.datePredicted).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            stage: p.stage,
            medications: p.medications,
            diet: p.diet,
            dosage: p.dosage,
            usage: p.usage,
            exercise: p.exercise,
            prescriptionStatus: p.prescriptionStatus,
          }));
          console.log("mapped", mappedPatients)
          setPatients(mappedPatients);
        }
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'approved':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'dispensed':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getStageColor = (stage) => {
    switch (stage.toLowerCase()) {
      case 'normal':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'elevated':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'hypertension stage 1':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'hypertension stage 2':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'hypertensive crisis':
        return 'text-red-600 bg-red-600/10 border-red-600/20 animate-pulse';
      default:
        return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const filteredPatients = patients.filter(p => {
    if (filter === 'all') return true;
    return p.prescriptionStatus === filter;
  });

  const handleReview = (prescriptionId) => {
    router.push(`/doctor/patients/${prescriptionId}`);
  };

  if (loading) {
    return (
      <>
        <DocNav />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent mb-4"></div>
            <p className="text-white text-lg">Loading prescriptions...</p>
          </div>
        </div>
        <DocFooter />
      </>
    );
  }

  return (
    <>
      <DocNav />
      <div className="min-h-screen bg-black">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Patient Prescriptions</h1>
            <p className="mt-2 text-zinc-400">Review and manage AI-generated prescriptions for your patients</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-xl border border-zinc-800 bg-linear-to-br from-zinc-900/50 to-zinc-800/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Total Prescriptions</p>
                  <p className="text-3xl font-bold text-white mt-1">{patients.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-linear-to-br from-yellow-900/20 to-zinc-800/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Pending Review</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-1">
                    {patients.filter(p => p.prescriptionStatus === 'pending').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-linear-to-br from-green-900/20 to-zinc-800/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Approved</p>
                  <p className="text-3xl font-bold text-green-400 mt-1">
                    {patients.filter(p => p.prescriptionStatus === 'approved').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-linear-to-br from-blue-900/20 to-zinc-800/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Dispensed</p>
                  <p className="text-3xl font-bold text-blue-400 mt-1">
                    {patients.filter(p => p.prescriptionStatus === 'dispensed').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <span className="text-2xl">💊</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 border-b border-zinc-800">
            <nav className="-mb-px flex space-x-8">
              {['all', 'pending', 'approved', 'dispensed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors capitalize ${
                    filter === status
                      ? 'border-cyan-500 text-cyan-400'
                      : 'border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  {status} {status !== 'all' && `(${patients.filter(p => p.prescriptionStatus === status).length})`}
                </button>
              ))}
            </nav>
          </div>

          {/* Prescription Cards */}
          {filteredPatients.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
              <span className="text-6xl mb-4 block">📭</span>
              <h3 className="text-xl font-semibold text-white mb-2">No prescriptions found</h3>
              <p className="text-zinc-400">There are no {filter !== 'all' ? filter : ''} prescriptions at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="group rounded-xl border border-zinc-800 bg-linear-to-br from-zinc-900/50 to-zinc-800/30 p-6 hover:border-cyan-500/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    {/* Left Section - Patient Info */}
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="h-14 w-14 rounded-full bg-linear-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">{patient.name}</h3>
                          <span className="text-sm text-zinc-500">•</span>
                          <span className="text-sm text-zinc-400">{patient.age} years</span>
                          <span className={`inline-flex rounded-full border px-3 py-0.5 text-xs font-medium ${getStageColor(patient.stage)}`}>
                            {patient.stage.charAt(0).toUpperCase() + patient.stage.slice(1)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          {/* Medications Summary */}
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Medications</p>
                            <p className="text-sm text-white font-medium line-clamp-2">
                              {patient.medications.slice(0, 2).join(', ')}
                              {patient.medications.length > 2 && (
                                <span className="text-cyan-400"> +{patient.medications.length - 2} more</span>
                              )}
                            </p>
                          </div>

                          {/* Dosage Summary */}
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Dosage</p>
                            <p className="text-sm text-zinc-300 line-clamp-2">{patient.dosage}</p>
                          </div>

                          {/* Date */}
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Predicted On</p>
                            <p className="text-sm text-zinc-300">{patient.lastReading}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Status & Action */}
                    <div className="flex flex-col items-end space-y-3 ml-6">
                      <span className={`inline-flex rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider ${getStatusColor(patient.prescriptionStatus)}`}>
                        {patient.prescriptionStatus}
                      </span>
                      
                      <button
                        onClick={() => handleReview(patient.id)}
                        className="inline-flex items-center space-x-2 rounded-lg bg-linear-to-r from-cyan-600 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-200"
                      >
                        <span>Review Details</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <DocFooter />
    </>
  );
}
