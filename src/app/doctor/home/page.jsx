'use client';

import { useState } from 'react';
import Link from 'next/link';
import DocNav from '@/components/DocNav';
import DocFooter from '@/components/DocFooter';
import useDoctorProfile from '@/hooks/useDoctorProfile';

export default function DoctorHome() {
  const { profile, loading } = useDoctorProfile();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useState(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayStats = [
    {
      label: 'Total Patients',
      value: '142',
      change: '+12%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      gradient: 'from-cyan-500 to-teal-500',
    },
    {
      label: 'Today\'s Appointments',
      value: '18',
      change: '+3',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-teal-500 to-emerald-500',
    },
    {
      label: 'Pending Prescriptions',
      value: '5',
      change: '-2',
      trend: 'down',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-green-500',
    },
    {
      label: 'Critical Cases',
      value: '2',
      change: '0',
      trend: 'neutral',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      gradient: 'from-red-500 to-orange-500',
    },
  ];

  const upcomingAppointments = [
    {
      id: 1,
      patient: 'John Anderson',
      time: '09:30 AM',
      type: 'Follow-up',
      status: 'confirmed',
      avatar: 'JA',
    },
    {
      id: 2,
      patient: 'Emily Chen',
      time: '10:15 AM',
      type: 'New Consultation',
      status: 'confirmed',
      avatar: 'EC',
    },
    {
      id: 3,
      patient: 'Michael Brown',
      time: '11:00 AM',
      type: 'Emergency',
      status: 'urgent',
      avatar: 'MB',
    },
    {
      id: 4,
      patient: 'Sarah Wilson',
      time: '02:00 PM',
      type: 'Check-up',
      status: 'pending',
      avatar: 'SW',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'Prescribed medication',
      patient: 'David Miller',
      time: '15 mins ago',
      icon: '💊',
    },
    {
      id: 2,
      action: 'Completed consultation',
      patient: 'Lisa Garcia',
      time: '1 hour ago',
      icon: '✅',
    },
    {
      id: 3,
      action: 'Lab results reviewed',
      patient: 'Robert Taylor',
      time: '2 hours ago',
      icon: '🔬',
    },
    {
      id: 4,
      action: 'Appointment scheduled',
      patient: 'Jennifer Lee',
      time: '3 hours ago',
      icon: '📅',
    },
  ];

  const quickActions = [
    {
      name: 'New Prescription',
      href: '/doctor/prescriptions',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: 'from-cyan-500 to-teal-500',
    },
    {
      name: 'View Patients',
      href: '/doctor/patients',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: 'from-teal-500 to-emerald-500',
    },
    {
      name: 'Analytics',
      href: '/doctor/analytics',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-green-500',
    },
    {
      name: 'My Schedule',
      href: '/doctor/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-green-500 to-lime-500',
    },
  ];

  return (
    <>
      <DocNav />
      <div className="min-h-screen bg-black">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-linear-to-br from-black via-zinc-900 to-black border-b border-zinc-800/50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.1),transparent_50%)]"></div>
          
          <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {getGreeting()}, <span className="bg-linear-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                    {loading ? 'Doctor' : `Dr. ${profile?.name || 'Doctor'}`}!
                  </span>
                </h1>
                <p className="mt-4 text-lg text-zinc-400">
                  You have {upcomingAppointments.length} appointments scheduled for today. Keep up the great work! 🩺
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-full bg-teal-500/10 px-4 py-2 ring-1 ring-teal-500/20">
                    <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-teal-400">Available</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-zinc-800/50 px-4 py-2 ring-1 ring-zinc-700/50">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-zinc-400">
                      {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions - Desktop */}
              <div className="mt-8 lg:mt-0 lg:ml-8">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                  {quickActions.map((action) => (
                    <Link
                      key={action.name}
                      href={action.href}
                      className="group relative overflow-hidden rounded-2xl bg-zinc-900/50 p-4 backdrop-blur-sm ring-1 ring-zinc-800/50 transition-all hover:scale-105 hover:ring-teal-500/50"
                    >
                      <div className={`absolute inset-0 bg-linear-to-br ${action.gradient} opacity-0 transition-opacity group-hover:opacity-10`}></div>
                      <div className={`mb-2 inline-flex rounded-xl bg-linear-to-br ${action.gradient} p-2 text-white shadow-lg`}>
                        {action.icon}
                      </div>
                      <p className="text-sm font-semibold text-white">{action.name}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {todayStats.map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl bg-zinc-900/50 p-6 backdrop-blur-sm ring-1 ring-zinc-800/50 transition-all hover:scale-105 hover:ring-teal-500/50"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${stat.gradient} opacity-0 transition-opacity group-hover:opacity-5`}></div>
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className={`rounded-xl bg-linear-to-br ${stat.gradient} p-3 text-white shadow-lg`}>
                      {stat.icon}
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                      stat.trend === 'up' ? 'text-emerald-400' : stat.trend === 'down' ? 'text-red-400' : 'text-zinc-500'
                    }`}>
                      {stat.trend === 'up' && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      )}
                      {stat.trend === 'down' && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="mt-1 text-sm text-zinc-400">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mx-auto max-w-7xl px-6 pb-12 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Upcoming Appointments */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-zinc-900/50 p-6 backdrop-blur-sm ring-1 ring-zinc-800/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Today's Appointments</h2>
                  <Link
                    href="/doctor/dashboard"
                    className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    View all →
                  </Link>
                </div>
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="group relative overflow-hidden rounded-xl bg-black/50 p-4 ring-1 ring-zinc-800/50 transition-all hover:ring-teal-500/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-emerald-500 text-sm font-bold text-white shadow-lg">
                          {appointment.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{appointment.patient}</p>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              appointment.status === 'urgent'
                                ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
                                : appointment.status === 'confirmed'
                                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/30'
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-sm text-zinc-400">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {appointment.time}
                            </span>
                            <span>•</span>
                            <span>{appointment.type}</span>
                          </div>
                        </div>
                        <button className="rounded-lg bg-teal-500/10 px-4 py-2 text-sm font-medium text-teal-400 ring-1 ring-teal-500/20 transition-all hover:bg-teal-500/20">
                          Start
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mt-6 rounded-2xl bg-zinc-900/50 p-6 backdrop-blur-sm ring-1 ring-zinc-800/50">
                <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4">
                      <div className="text-2xl">{activity.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm text-white">
                          <span className="font-semibold">{activity.action}</span> for{' '}
                          <span className="text-teal-400">{activity.patient}</span>
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-teal-500 to-emerald-600 p-6 shadow-xl shadow-teal-500/20">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="relative">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-4 ring-white/30 text-2xl font-bold text-white">
                    {loading ? '...' : (profile?.name?.charAt(0) || 'D')}
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {loading ? 'Loading...' : `Dr. ${profile?.name || 'Doctor'}`}
                  </h3>
                  <p className="mt-1 text-sm text-teal-50">
                    {loading ? '...' : (profile?.degree || 'Medical Professional')}
                  </p>
                  <div className="mt-2 space-y-1">
                    {!loading && profile?.currentHospital && (
                      <p className="text-xs text-teal-100">🏥 {profile.currentHospital}</p>
                    )}
                    {!loading && profile?.experienceYears && (
                      <p className="text-xs text-teal-100">📅 {profile.experienceYears} years experience</p>
                    )}
                  </div>
                  <Link
                    href="/doctor/profile"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm ring-1 ring-white/30 transition-all hover:bg-white/30"
                  >
                    View Profile
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="rounded-2xl bg-zinc-900/50 p-6 backdrop-blur-sm ring-1 ring-zinc-800/50">
                <h3 className="text-lg font-bold text-white mb-4">This Week</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-400">Consultations</span>
                      <span className="text-sm font-semibold text-white">87/100</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div className="h-full w-[87%] rounded-full bg-linear-to-r from-teal-500 to-emerald-500"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-400">Prescriptions</span>
                      <span className="text-sm font-semibold text-white">64/80</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div className="h-full w-[80%] rounded-full bg-linear-to-r from-emerald-500 to-green-500"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-400">Follow-ups</span>
                      <span className="text-sm font-semibold text-white">45/60</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div className="h-full w-[75%] rounded-full bg-linear-to-r from-green-500 to-lime-500"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="rounded-2xl bg-zinc-900/50 p-6 backdrop-blur-sm ring-1 ring-zinc-800/50">
                <h3 className="text-lg font-bold text-white mb-4">Notifications</h3>
                <div className="space-y-3">
                  <div className="flex gap-3 rounded-lg bg-red-500/10 p-3 ring-1 ring-red-500/20">
                    <div className="text-red-400">�</div>
                    <div>
                      <p className="text-sm font-medium text-white">Emergency case</p>
                      <p className="text-xs text-zinc-400">Michael Brown needs immediate attention</p>
                    </div>
                  </div>
                  <div className="flex gap-3 rounded-lg bg-teal-500/10 p-3 ring-1 ring-teal-500/20">
                    <div className="text-teal-400">📋</div>
                    <div>
                      <p className="text-sm font-medium text-white">Lab results ready</p>
                      <p className="text-xs text-zinc-400">3 patient reports are ready for review</p>
                    </div>
                  </div>
                  <div className="flex gap-3 rounded-lg bg-yellow-500/10 p-3 ring-1 ring-yellow-500/20">
                    <div className="text-yellow-400">⏰</div>
                    <div>
                      <p className="text-sm font-medium text-white">Meeting reminder</p>
                      <p className="text-xs text-zinc-400">Team meeting in 30 minutes</p>
                    </div>
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
