'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DocNav from '@/components/DocNav';
import DocFooter from '@/components/DocFooter';

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    thisWeek: 0,
  });
  const [topMedications, setTopMedications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const router = useRouter();

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
    const fetchPrescriptions = async () => {
      try {
        const res = await fetch('/api/get-all-prescription', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();

        if (data.success) {
          setPrescriptions(data.data);

          // Calculate stats
          const total = data.data.length;
          const pending = data.data.filter(p => p.prescriptionStatus === 'pending').length;
          const approved = data.data.filter(p => p.prescriptionStatus === 'approved').length;
          const rejected = data.data.filter(p => p.prescriptionStatus === 'rejected').length;

          // Calculate this week's prescriptions
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          const thisWeek = data.data.filter(p => new Date(p.datePredicted) >= oneWeekAgo).length;

          setStats({ total, pending, approved, rejected, thisWeek });

          // Calculate top medications
          const medicationCount = {};
          data.data.forEach(p => {
            p.medications.forEach(med => {
              medicationCount[med] = (medicationCount[med] || 0) + 1;
            });
          });

          const topMeds = Object.entries(medicationCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([med, count]) => ({ medication: med, count }));

          setTopMedications(topMeds);

          // Get recent activity (last 5 prescriptions)
          const recent = data.data
            .sort((a, b) => new Date(b.datePredicted) - new Date(a.datePredicted))
            .slice(0, 5)
            .map(p => ({
              id: p.id,
              patientName: p.patientName,
              status: p.prescriptionStatus,
              date: new Date(p.datePredicted).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              stage: p.stage,
            }));

          setRecentActivity(recent);
        }
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'approved':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'rejected':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getStageColor = (stage) => {
    switch (stage?.toLowerCase()) {
      case 'normal':
        return 'text-green-400';
      case 'elevated':
        return 'text-yellow-400';
      case 'hypertension stage 1':
        return 'text-orange-400';
      case 'hypertension stage 2':
        return 'text-red-400';
      case 'hypertensive crisis':
        return 'text-red-600';
      default:
        return 'text-zinc-400';
    }
  };

  if (loading) {
    return (
      <>
        <DocNav />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent mb-4"></div>
            <p className="text-white text-lg">Loading prescription analytics...</p>
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
            <h1 className="text-3xl font-bold text-white">Prescription Analytics</h1>
            <p className="mt-2 text-zinc-400">Overview of all prescription activities and trends</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="rounded-xl border border-zinc-800 bg-linear-to-br from-zinc-900/50 to-zinc-800/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-sm text-zinc-400">Total Prescriptions</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-linear-to-br from-yellow-900/20 to-zinc-800/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">⏳</span>
              </div>
              <p className="text-sm text-zinc-400">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-400 mt-1">{stats.pending}</p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-linear-to-br from-green-900/20 to-zinc-800/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">✅</span>
              </div>
              <p className="text-sm text-zinc-400">Approved</p>
              <p className="text-3xl font-bold text-green-400 mt-1">{stats.approved}</p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-linear-to-br from-blue-900/20 to-zinc-800/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">💊</span>
              </div>
              <p className="text-sm text-zinc-400">Rejected</p>
              <p className="text-3xl font-bold text-red-400 mt-1">{stats.rejected}</p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-linear-to-br from-cyan-900/20 to-zinc-800/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-sm text-zinc-400">This Week</p>
              <p className="text-3xl font-bold text-cyan-400 mt-1">{stats.thisWeek}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
              <div className="bg-zinc-800/50 px-6 py-4 border-b border-zinc-800">
                <h3 className="text-lg font-semibold text-white">Recent Prescription Activity</h3>
              </div>
              <div className="p-6">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-2 block">📭</span>
                    <p className="text-zinc-400">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex flex-col gap-3 p-4 rounded-lg border border-zinc-800 bg-black/50 hover:border-cyan-500/30 transition-colors cursor-pointer sm:flex-row sm:items-center sm:justify-between"
                        onClick={() => router.push(`/doctor/patients/${activity.id}`)}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-white">{activity.patientName}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs font-medium ${getStageColor(activity.stage)}`}>
                              {activity.stage.charAt(0).toUpperCase() + activity.stage.slice(1)}
                            </span>
                            <span className="text-xs text-zinc-500">•</span>
                            <span className="text-xs text-zinc-400">{activity.date}</span>
                          </div>
                        </div>
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => router.push('/doctor/patients')}
                    className="cursor-pointer w-full text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    View All Prescriptions →
                  </button>
                </div>
              </div>
            </div>

            {/* Top Medications */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
              <div className="bg-zinc-800/50 px-6 py-4 border-b border-zinc-800">
                <h3 className="text-lg font-semibold text-white">Most Prescribed Medications</h3>
              </div>
              <div className="p-6">
                {topMedications.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-2 block">💊</span>
                    <p className="text-zinc-400">No medications data</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topMedications.map((med, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 font-semibold text-sm">
                              {idx + 1}
                            </div>
                            <p className="text-white font-medium">{med.medication}</p>
                          </div>
                          <span className="text-sm font-semibold text-cyan-400">{med.count}×</span>
                        </div>
                        <div className="ml-11 bg-zinc-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-cyan-500 to-teal-500"
                            style={{ width: `${(med.count / Math.max(...topMedications.map(m => m.count))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/doctor/patients')}
                className="cursor-pointer flex items-center space-x-4 p-4 rounded-lg border border-zinc-800 bg-black/50 hover:border-cyan-500/50 hover:bg-zinc-800/50 transition-all duration-200 text-left"
              >
                <div className="h-12 w-12 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <p className="font-semibold text-white">View All Patients</p>
                  <p className="text-sm text-zinc-400">Manage patient prescriptions</p>
                </div>
              </button>

              <button
                onClick={() => {
                  const pendingPrescription = prescriptions.find(p => p.prescriptionStatus === 'pending');
                  if (pendingPrescription) {
                    router.push(`/doctor/patients/${pendingPrescription.id}`);
                  } else {
                    alert('No pending prescriptions to review');
                  }
                }}
                className="cursor-pointer flex items-center space-x-4 p-4 rounded-lg border border-zinc-800 bg-black/50 hover:border-yellow-500/50 hover:bg-zinc-800/50 transition-all duration-200 text-left"
              >
                <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <p className="font-semibold text-white">Review Pending</p>
                  <p className="text-sm text-zinc-400">{stats.pending} waiting for review</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/doctor/analytics')}
                className="cursor-pointer flex items-center space-x-4 p-4 rounded-lg border border-zinc-800 bg-black/50 hover:border-teal-500/50 hover:bg-zinc-800/50 transition-all duration-200 text-left"
              >
                <div className="h-12 w-12 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <p className="font-semibold text-white">View Analytics</p>
                  <p className="text-sm text-zinc-400">Patient health insights</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <DocFooter />
    </>
  );
}
