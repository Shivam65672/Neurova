'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import DocNav from '@/components/DocNav';
import DocFooter from '@/components/DocFooter';
import AnalyticsBarChart from '@/components/AnalyticsBarChart';

export default function DoctorAnalytics() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    totalPatients: 0,
    uncontrolledBP: 0,
    avgSystolic: 0,
    avgDiastolic: 0,
    alertsToday: 0,
    criticalPatients: 0,
    highPatients: 0,
    mediumPatients: 0,
    lowPatients: 0,
    normalPatients: 0,
    approvalRate: 0,
    totalPrescriptions: 0,
    pendingPrescriptions: 0,
    approvedPrescriptions: 0,
    rejectedPrescriptions: 0,
    thisWeek: 0,
    newPatientsThisWeek: 0,
  });

  const [patientDistribution, setPatientDistribution] = useState([
    { name: 'Normal', count: 0, color: '#22c55e' },
    { name: 'Elevated', count: 0, color: '#eab308' },
    { name: 'Stage 1', count: 0, color: '#f97316' },
    { name: 'Stage 2', count: 0, color: '#ef4444' },
    { name: 'Crisis', count: 0, color: '#dc2626' },
  ]);

  const [weeklyTrends, setWeeklyTrends] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [medicationData, setMedicationData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [stageTrends, setStageTrends] = useState([]);

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
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      const res = await fetch('/api/get-all-prescription', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (data.success) {
        const prescriptionsData = data.data || [];

        const total = prescriptionsData.length;
        const uniquePatients = new Set(prescriptionsData.map(p => p.clerkId));
        const totalPatients = uniquePatients.size;

        const stages = {
          normal: 0,
          elevated: 0,
          'hypertension stage 1': 0,
          'hypertension stage 2': 0,
          'hypertensive crisis': 0,
        };

        let totalSystolic = 0;
        let systolicCount = 0;

        prescriptionsData.forEach(p => {
          const stage = p.stage?.toLowerCase() || '';
          if (stages[stage] !== undefined) stages[stage]++;

          let bpValue = 0;
          switch (stage) {
            case 'normal': bpValue = 115; break;
            case 'elevated': bpValue = 125; break;
            case 'hypertension stage 1': bpValue = 135; break;
            case 'hypertension stage 2': bpValue = 155; break;
            case 'hypertensive crisis': bpValue = 180; break;
            default: bpValue = 120;
          }

          totalSystolic += bpValue;
          systolicCount++;
        });

        const uncontrolledBP = stages['hypertension stage 1'] + stages['hypertension stage 2'] + stages['hypertensive crisis'];
        const avgSystolic = systolicCount > 0 ? Math.round(totalSystolic / systolicCount) : 120;

        const pending = prescriptionsData.filter(p => p.prescriptionStatus === 'pending').length;
        const approved = prescriptionsData.filter(p => p.prescriptionStatus === 'approved').length;
        const rejected = prescriptionsData.filter(p => p.prescriptionStatus === 'rejected').length;
        const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

        // Count unique patients this week
        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const thisWeekPatients = new Set();
        prescriptionsData.forEach(p => {
          const date = new Date(p.datePredicted);
          if (date >= oneWeekAgo) {
            thisWeekPatients.add(p.clerkId);
          }
        });
        const thisWeekCount = thisWeekPatients.size;

        // Calculate new patients this week
        const previousPatients = new Set();
        prescriptionsData.forEach(p => {
          const date = new Date(p.datePredicted);
          if (date < oneWeekAgo) {
            previousPatients.add(p.clerkId);
          }
        });

        const newPatientsThisWeek = thisWeekCount - previousPatients.size;

        setAnalyticsData({
          totalPatients,
          uncontrolledBP,
          avgSystolic,
          avgDiastolic: Math.round(avgSystolic * 0.68),
          alertsToday: stages['hypertensive crisis'] + stages['hypertension stage 2'],
          criticalPatients: stages['hypertensive crisis'],
          highPatients: stages['hypertension stage 2'],
          mediumPatients: stages['hypertension stage 1'],
          lowPatients: stages['elevated'],
          normalPatients: stages['normal'],
          approvalRate,
          totalPrescriptions: total,
          pendingPrescriptions: pending,
          approvedPrescriptions: approved,
          rejectedPrescriptions: rejected,
          thisWeek: thisWeekCount,
          newPatientsThisWeek: newPatientsThisWeek,
        });

        setPatientDistribution([
          { name: 'Normal', count: stages['normal'], color: '#22c55e' },
          { name: 'Elevated', count: stages['elevated'], color: '#eab308' },
          { name: 'Stage 1', count: stages['hypertension stage 1'], color: '#f97316' },
          { name: 'Stage 2', count: stages['hypertension stage 2'], color: '#ef4444' },
          { name: 'Crisis', count: stages['hypertensive crisis'], color: '#dc2626' },
        ]);

        // Weekly trends
        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weekData = weekDays.map((day, index) => {
          const dayPrescriptions = prescriptionsData.filter(p => {
            const date = new Date(p.datePredicted);
            const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1;
            return dayOfWeek === index;
          });

          let totalBP = 0;
          let count = 0;

          if (dayPrescriptions.length > 0) {
            dayPrescriptions.forEach(p => {
              const stage = p.stage?.toLowerCase() || '';
              let bpValue = 0;
              switch (stage) {
                case 'normal': bpValue = 115; break;
                case 'elevated': bpValue = 125; break;
                case 'hypertension stage 1': bpValue = 135; break;
                case 'hypertension stage 2': bpValue = 155; break;
                case 'hypertensive crisis': bpValue = 180; break;
                default: bpValue = 120;
              }
              totalBP += bpValue;
              count++;
            });
          }

          const avgBP = count > 0 ? Math.round(totalBP / count) : 0;

          return {
            name: day,
            avgSystolic: avgBP,
            count: dayPrescriptions.length || 0
          };
        });

        setWeeklyTrends(weekData);

        // Monthly data
        const months = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const monthData = months.map((month, idx) => {
          const weekPrescriptions = prescriptionsData.filter(p => {
            const date = new Date(p.datePredicted);
            const weekNum = Math.floor((date.getDate() - 1) / 7);
            return weekNum === idx;
          });

          let totalBP = 0;
          let count = 0;

          if (weekPrescriptions.length > 0) {
            weekPrescriptions.forEach(p => {
              const stage = p.stage?.toLowerCase() || '';
              let bpValue = 0;
              switch (stage) {
                case 'normal': bpValue = 115; break;
                case 'elevated': bpValue = 125; break;
                case 'hypertension stage 1': bpValue = 135; break;
                case 'hypertension stage 2': bpValue = 155; break;
                case 'hypertensive crisis': bpValue = 180; break;
                default: bpValue = 120;
              }
              totalBP += bpValue;
              count++;
            });
          }

          const avgBP = count > 0 ? Math.round(totalBP / count) : 0;

          return {
            name: month,
            avgSystolic: avgBP,
            count: weekPrescriptions.length || 0
          };
        });

        setMonthlyData(monthData);

        // Stage trends - showing how stages distribute across weeks
        const stageTrendData = months.map((month, idx) => {
          const weekPrescriptions = prescriptionsData.filter(p => {
            const date = new Date(p.datePredicted);
            const weekNum = Math.floor((date.getDate() - 1) / 7);
            return weekNum === idx;
          });

          let normal = 0, elevated = 0, stage1 = 0, stage2 = 0, crisis = 0;

          weekPrescriptions.forEach(p => {
            const stage = p.stage?.toLowerCase() || '';
            switch (stage) {
              case 'normal': normal++; break;
              case 'elevated': elevated++; break;
              case 'hypertension stage 1': stage1++; break;
              case 'hypertension stage 2': stage2++; break;
              case 'hypertensive crisis': crisis++; break;
            }
          });

          return {
            name: month,
            normal,
            elevated,
            stage1,
            stage2,
            crisis
          };
        });

        setStageTrends(stageTrendData);

        // Top medications
        const medicationCount = {};
        prescriptionsData.forEach(p => {
          if (p.medications && Array.isArray(p.medications)) {
            p.medications.forEach(med => {
              medicationCount[med] = (medicationCount[med] || 0) + 1;
            });
          }
        });

        const topMeds = Object.entries(medicationCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, count]) => ({ name, count }));

        setMedicationData(topMeds);

        // Weekly prescription counts
        const weeklyCounts = weekDays.map((day, index) => {
          const dayPrescriptions = prescriptionsData.filter(p => {
            const date = new Date(p.datePredicted);
            const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1;
            return dayOfWeek === index;
          });
          return { name: day, count: dayPrescriptions.length || 0 };
        });

        setWeeklyData(weeklyCounts);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <DocNav />
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
            <p className="mt-4 text-zinc-400">Loading analytics...</p>
          </div>
        </div>
        <DocFooter />
      </>
    );
  }

  return (
    <>
      <DocNav />
      <div className="min-h-screen bg-black py-4 sm:py-8">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
          {/* Header */}
          <div className="mb-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-linear-to-br from-teal-500 to-emerald-500 p-3 shadow-lg shadow-teal-500/20">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
                    <p className="mt-1 text-sm text-zinc-400">Population insights and patient health trends</p>
                  </div>
                </div>
              </div>
              <button
                onClick={fetchAnalyticsData}
                className="flex items-center gap-2 rounded-xl bg-teal-500/10 px-5 py-2.5 text-sm font-medium text-teal-400 ring-1 ring-teal-500/20 transition-all hover:bg-teal-500/20"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </button>
            </div>
          </div>

          {/* Top Row: Prescription Status (4/10), Approval Rate (3/10), Total Patients (3/10) */}
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-10 sm:gap-6">
            {/* Prescription Status - 4/10 */}
            <div className="sm:col-span-4 rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-800/30 p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white sm:text-lg">Prescription Status</h3>
                </div>
              </div>
              <div className="flex items-center justify-around gap-2 py-1">
                <div className="flex flex-col items-center">
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                    <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle className="stroke-zinc-800" strokeWidth="8" fill="transparent" r="42" cx="50" cy="50" />
                      <circle
                        className="stroke-yellow-500 transition-all duration-1000"
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="transparent"
                        r="42"
                        cx="50"
                        cy="50"
                        strokeDasharray={`${(analyticsData.totalPrescriptions > 0 ? (analyticsData.pendingPrescriptions / analyticsData.totalPrescriptions) * 100 : 0) * 2.64} 264`}
                        strokeDashoffset="0"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-base font-bold text-yellow-400 sm:text-lg">{analyticsData.pendingPrescriptions}</span>
                      <span className="text-[6px] text-zinc-500 sm:text-[8px]">Pending</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                    <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle className="stroke-zinc-800" strokeWidth="8" fill="transparent" r="42" cx="50" cy="50" />
                      <circle
                        className="stroke-green-500 transition-all duration-1000"
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="transparent"
                        r="42"
                        cx="50"
                        cy="50"
                        strokeDasharray={`${(analyticsData.totalPrescriptions > 0 ? (analyticsData.approvedPrescriptions / analyticsData.totalPrescriptions) * 100 : 0) * 2.64} 264`}
                        strokeDashoffset="0"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-base font-bold text-green-400 sm:text-lg">{analyticsData.approvedPrescriptions}</span>
                      <span className="text-[6px] text-zinc-500 sm:text-[8px]">Approved</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                    <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle className="stroke-zinc-800" strokeWidth="8" fill="transparent" r="42" cx="50" cy="50" />
                      <circle
                        className="stroke-red-500 transition-all duration-1000"
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="transparent"
                        r="42"
                        cx="50"
                        cy="50"
                        strokeDasharray={`${(analyticsData.totalPrescriptions > 0 ? (analyticsData.rejectedPrescriptions / analyticsData.totalPrescriptions) * 100 : 0) * 2.64} 264`}
                        strokeDashoffset="0"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-base font-bold text-red-400 sm:text-lg">{analyticsData.rejectedPrescriptions}</span>
                      <span className="text-[6px] text-zinc-500 sm:text-[8px]">Rejected</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-zinc-800 text-center">
                <span className="text-sm text-zinc-400">Total: </span>
                <span className="text-sm font-semibold text-white">{analyticsData.totalPrescriptions}</span>
              </div>
            </div>

            {/* Approval Rate - 3/10 */}
            <div className="sm:col-span-3 group relative overflow-hidden rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-800/30 p-5 transition-all hover:border-green-500/30 hover:shadow-xl hover:shadow-green-500/5">
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-green-500/5 blur-2xl transition-all group-hover:bg-green-500/10"></div>

              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white sm:text-lg">Approval Rate</h3>
                  </div>
                  <div className="rounded-xl bg-green-500/10 p-3">
                    <span className="text-xl">✅</span>
                  </div>
                </div>

                <div className="mt-5 flex flex-1 flex-col items-center justify-center">
                  <div className="relative h-10 w-32">
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-green-400">
                        {analyticsData.approvalRate}%
                      </span>
                      <span className="text-xs text-zinc-500">
                        Approved
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <div className="rounded-lg bg-black/30 px-3 py-2 text-center">
                      <p className="text-xs text-zinc-500">Approved</p>
                      <p className="font-semibold text-green-400">
                        {analyticsData.approvedPrescriptions}
                      </p>
                    </div>
                    <div className="rounded-lg bg-black/30 px-3 py-2 text-center">
                      <p className="text-xs text-zinc-500">Total</p>
                      <p className="font-semibold text-white">
                        {analyticsData.totalPrescriptions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Patients - 3/10 */}
            <div className="sm:col-span-3 group relative overflow-hidden rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-800/30 p-5 transition-all hover:border-teal-500/30 hover:shadow-xl hover:shadow-teal-500/5">
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-teal-500/5 blur-2xl transition-all group-hover:bg-teal-500/10"></div>

              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white sm:text-lg">Total Patients</h3>
                  </div>
                  <div className="rounded-xl bg-teal-500/10 p-3">
                    <span className="text-xl">👥</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-1 flex-col items-center justify-center">
                  <div className="-mt-4 text-center">
                    <p className="text-4xl font-bold text-green-500">
                      {analyticsData.totalPatients}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Registered Patients
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-2">
                    {analyticsData.newPatientsThisWeek > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/20 px-2 py-0.5 text-sm text-teal-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
                        +{analyticsData.newPatientsThisWeek} new this week
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-500/20 px-2 py-0.5 text-sm text-zinc-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400"></span>
                        No new patients this week
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="mb-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-teal-500/20 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Weekly BP Trend</h3>
                  <p className="text-xs text-zinc-400">Average systolic readings over 7 days</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                  <span className="text-xs text-zinc-400">Systolic</span>
                </div>
              </div>
              <div className="h-64 rounded-xl border border-zinc-800 bg-black/50 p-3 sm:h-72">
                <AnalyticsBarChart data={weeklyTrends} dataKey="avgSystolic" barColor="#14b8a6" />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-cyan-500/20 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Weekly Activity</h3>
                  <p className="text-xs text-zinc-400">Prescriptions by day</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
                  <span className="text-xs text-zinc-400">Count</span>
                </div>
              </div>
              <div className="h-64 rounded-xl border border-zinc-800 bg-black/50 p-3">
                <AnalyticsBarChart data={weeklyData} dataKey="count" barColor="#06b6d4" />
              </div>
            </div>
          </div>

          {/* Second Row of Charts */}
          <div className="mb-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-purple-500/20 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Patient Distribution</h3>
                  <p className="text-xs text-zinc-400">By hypertension stage</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                  <span className="text-xs text-zinc-400">Patients</span>
                </div>
              </div>
              <div className="h-64 rounded-xl border border-zinc-800 bg-black/50 p-3">
                <AnalyticsBarChart data={patientDistribution} dataKey="count" barColor="#8b5cf6" />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-indigo-500/20 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Monthly Trend</h3>
                  <p className="text-xs text-zinc-400">4-week average systolic</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                  <span className="text-xs text-zinc-400">Systolic</span>
                </div>
              </div>
              <div className="h-64 rounded-xl border border-zinc-800 bg-black/50 p-3">
                <AnalyticsBarChart data={monthlyData} dataKey="avgSystolic" barColor="#6366f1" />
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-10 flex justify-center">
            <div className="grid w-full lg:w-4/5 gap-6 lg:grid-cols-2">

              {/* Top Medications */}
              <div className="rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-800/30 p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">💊 Top Medications</h3>
                    <p className="text-xs text-zinc-400">Most prescribed medications</p>
                  </div>
                </div>

                {medicationData.length > 0 ? (
                  <div className="space-y-2">
                    {medicationData.map((med, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-xl bg-black/30 p-2.5 transition-all hover:bg-black/50"
                      >
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${idx === 0
                            ? 'bg-yellow-500'
                            : idx === 1
                              ? 'bg-zinc-400'
                              : idx === 2
                                ? 'bg-orange-600'
                                : 'bg-zinc-700'
                            }`}
                        >
                          {idx + 1}
                        </div>

                        <span className="flex-1 truncate text-sm text-white">
                          {med.name}
                        </span>

                        <span className="text-sm font-semibold text-teal-400">
                          {med.count}×
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">No medication data</p>
                )}
              </div>

              {/* Practice Summary */}
              <div className="rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-800/30 p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">📋 Practice Summary</h3>
                    <p className="text-xs text-zinc-400">Key metrics at a glance</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-black/30 p-3 text-center transition-all hover:bg-black/50">
                    <p className="text-xs text-zinc-500">Patients</p>
                    <p className="text-lg font-bold text-white">
                      {analyticsData.totalPatients}
                    </p>
                  </div>

                  <div className="rounded-xl bg-black/30 p-3 text-center transition-all hover:bg-black/50">
                    <p className="text-xs text-zinc-500">Rx</p>
                    <p className="text-lg font-bold text-white">
                      {analyticsData.totalPrescriptions}
                    </p>
                  </div>

                  <div className="rounded-xl bg-black/30 p-3 text-center transition-all hover:bg-black/50">
                    <p className="text-xs text-zinc-500">Alerts</p>
                    <p className="text-lg font-bold text-orange-400">
                      {analyticsData.alertsToday}
                    </p>
                  </div>

                  <div className="rounded-xl bg-black/30 p-3 text-center transition-all hover:bg-black/50">
                    <p className="text-xs text-zinc-500">This Week</p>
                    <p className="text-lg font-bold text-teal-400">
                      {analyticsData.thisWeek}
                    </p>
                  </div>

                  <div className="col-span-2 rounded-xl bg-black/30 p-3 text-center transition-all hover:bg-black/50">
                    <p className="text-xs text-zinc-500">Approval Rate</p>
                    <p className="text-lg font-bold text-green-400">
                      {analyticsData.approvalRate}%
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <DocFooter />
    </>
  );
}