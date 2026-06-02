'use client';

import { useState } from 'react';
import Link from 'next/link';
import BPTrendChart from '@/components/BPTrendChart';
import UserNav from '@/components/UserNav';
import UserFooter from '@/components/UserFooter';

export default function PatientDashboard() {
  // Mock data for demo
  const [bpData] = useState({
    current: { systolic: 128, diastolic: 82, timestamp: '2 hours ago' },
    average: { systolic: 125, diastolic: 80 },
    trend: 'stable',
  });

  const [recentReadings] = useState([
    { id: 1, systolic: 128, diastolic: 82, date: '2025-11-06', time: '09:30 AM', status: 'normal' },
    { id: 2, systolic: 135, diastolic: 88, date: '2025-11-05', time: '08:15 AM', status: 'elevated' },
    { id: 3, systolic: 122, diastolic: 78, date: '2025-11-04', time: '07:45 AM', status: 'normal' },
    { id: 4, systolic: 140, diastolic: 92, date: '2025-11-03', time: '09:00 AM', status: 'high' },
  ]);

  // Chart data
  const chartData = [...recentReadings].reverse().map(r => ({
    date: r.date.slice(5),
    systolic: r.systolic,
    diastolic: r.diastolic,
  }));

  const [pendingMedications] = useState([
    { id: 1, name: 'Amlodipine 5mg', status: 'pending', doctor: 'Dr. Sarah Johnson' },
    { id: 2, name: 'Losartan 50mg', status: 'approved', doctor: 'Dr. Sarah Johnson' },
  ]);

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

  return (
    <>
      <UserNav />
      <div className="min-h-screen bg-black">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-zinc-400">Welcome back, John! Here's your health overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Current BP */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Current BP</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {bpData.current.systolic}/{bpData.current.diastolic}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{bpData.current.timestamp}</p>
              </div>
              <div className="rounded-lg bg-cyan-500/10 p-3">
                <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* 7-Day Average */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">7-Day Average</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {bpData.average.systolic}/{bpData.average.diastolic}
                </p>
                <p className="mt-1 flex items-center text-xs text-green-400">
                  <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Stable
                </p>
              </div>
              <div className="rounded-lg bg-teal-500/10 p-3">
                <svg className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Medications */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Active Medications</p>
                <p className="mt-2 text-3xl font-bold text-white">3</p>
                <p className="mt-1 text-xs text-zinc-500">1 pending approval</p>
              </div>
              <div className="rounded-lg bg-purple-500/10 p-3">
                <svg className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Next Appointment */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Next Appointment</p>
                <p className="mt-2 text-xl font-bold text-white">Nov 12</p>
                <p className="mt-1 text-xs text-zinc-500">Dr. Sarah Johnson</p>
              </div>
              <div className="rounded-lg bg-orange-500/10 p-3">
                <svg className="h-8 w-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Readings & Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mini Chart */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-4 text-xl font-bold text-white">7-Day Trend</h2>
              <div className="h-64 rounded-lg border border-zinc-800 bg-black/50 p-4">
                <BPTrendChart data={chartData} />
              </div>
            </div>

            {/* Recent Readings */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="border-b border-zinc-800 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Recent BP Readings</h2>
                  <Link
                    href="/patient/bp-tracker"
                    className="text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    View All →
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentReadings.map((reading) => (
                    <div
                      key={reading.id}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/50 p-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="rounded-lg bg-zinc-800 p-3">
                          <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-white">
                            {reading.systolic}/{reading.diastolic} mmHg
                          </p>
                          <p className="text-sm text-zinc-400">
                            {reading.date} at {reading.time}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                          reading.status
                        )}`}
                      >
                        {reading.status.charAt(0).toUpperCase() + reading.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Medications */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-4 text-xl font-bold text-white">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/patient/bp-tracker"
                  className="flex items-center space-x-3 rounded-lg border border-zinc-800 bg-black/50 p-3 transition-colors hover:border-cyan-500/50 hover:bg-zinc-800"
                >
                  <div className="rounded-lg bg-cyan-500/10 p-2">
                    <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-white">Add BP Reading</span>
                </Link>
                <Link
                  href="/patient/chat"
                  className="flex items-center space-x-3 rounded-lg border border-zinc-800 bg-black/50 p-3 transition-colors hover:border-teal-500/50 hover:bg-zinc-800"
                >
                  <div className="rounded-lg bg-teal-500/10 p-2">
                    <svg className="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-white">Chat with AI</span>
                </Link>
                <Link
                  href="/patient/medical-history"
                  className="flex items-center space-x-3 rounded-lg border border-zinc-800 bg-black/50 p-3 transition-colors hover:border-purple-500/50 hover:bg-zinc-800"
                >
                  <div className="rounded-lg bg-purple-500/10 p-2">
                    <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-white">View Medical History</span>
                </Link>
              </div>
            </div>

            {/* Pending Medications */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-4 text-xl font-bold text-white">Medications</h2>
              <div className="space-y-3">
                {pendingMedications.map((med) => (
                  <div key={med.id} className="rounded-lg border border-zinc-800 bg-black/50 p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-white">{med.name}</p>
                        <p className="text-xs text-zinc-400">{med.doctor}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          med.status === 'approved'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}
                      >
                        {med.status}
                      </span>
                    </div>
                  </div>
                ))}
                <Link
                  href="/patient/medications"
                  className="mt-3 block text-center text-sm text-cyan-400 hover:text-cyan-300"
                >
                  View All Medications →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      <UserFooter />
    </>
  );
}
