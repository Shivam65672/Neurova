'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DocNav from '@/components/DocNav';
import DocFooter from '@/components/DocFooter';
import useDoctorProfile from '@/hooks/useDoctorProfile';
import { useUser } from '@clerk/nextjs';

export default function DoctorHome() {
  const { user } = useUser();
  const { profile, loading } = useDoctorProfile();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alertStats, setAlertStats] = useState({ total: 0, critical: 0, high: 0, medium: 0, low: 0 });
  const [prescriptionStats, setPrescriptionStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [patientsCount, setPatientsCount] = useState(0);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [topMedications, setTopMedications] = useState([]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    if (user) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 120000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const alertsRes = await fetch(`/api/doctor/alerts?doctorClerkId=${user.id}`);
      const alertsData = await alertsRes.json();
      
      const prescriptionsRes = await fetch('/api/get-all-prescription', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const prescriptionsData = await prescriptionsRes.json();
      
      if (alertsData.success) {
        setAlertStats({
          total: alertsData.totalAlerts || 0,
          critical: alertsData.criticalCount || 0,
          high: alertsData.highCount || 0,
          medium: alertsData.mediumCount || 0,
          low: alertsData.lowCount || 0,
        });
        setRecentAlerts((alertsData.alerts || []).slice(0, 3));
      }
      
      if (prescriptionsData.success) {
        const prescriptions = prescriptionsData.data || [];
        
        const pending = prescriptions.filter(p => p.prescriptionStatus === 'pending').length;
        const approved = prescriptions.filter(p => p.prescriptionStatus === 'approved').length;
        const rejected = prescriptions.filter(p => p.prescriptionStatus === 'rejected').length;
        
        setPrescriptionStats({
          pending,
          approved,
          rejected,
          total: prescriptions.length,
        });
        
        const uniquePatients = new Set(prescriptions.map(p => p.clerkId));
        setPatientsCount(uniquePatients.size);
        
        const recent = prescriptions
          .sort((a, b) => new Date(b.datePredicted) - new Date(a.datePredicted))
          .slice(0, 3)
          .map(p => ({
            id: p._id || p.id,
            patientName: p.patientName,
            stage: p.stage,
            status: p.prescriptionStatus,
            date: new Date(p.datePredicted).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
          }));
        setRecentPrescriptions(recent);
        
        const medicationCount = {};
        prescriptions.forEach(p => {
          if (p.medications && Array.isArray(p.medications)) {
            p.medications.forEach(med => {
              medicationCount[med] = (medicationCount[med] || 0) + 1;
            });
          }
        });
        
        const topMeds = Object.entries(medicationCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([med, count]) => ({ medication: med, count }));
        setTopMedications(topMeds);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Stats with navigation links
  const todayStats = [
    {
      label: 'Total Patients',
      value: patientsCount,
      change: `+${patientsCount > 0 ? Math.round(patientsCount * 0.12) : 0}%`,
      trend: 'up',
      href: '/doctor/patients',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      gradient: 'from-cyan-500 to-teal-500',
    },
    {
      label: 'Total Prescriptions',
      value: prescriptionStats.total,
      change: `+${prescriptionStats.total > 0 ? Math.round(prescriptionStats.total * 0.08) : 0}`,
      trend: 'up',
      href: '/doctor/prescriptions',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: 'from-teal-500 to-emerald-500',
    },
    {
      label: 'Pending Reviews',
      value: prescriptionStats.pending,
      change: prescriptionStats.pending > 0 ? `-${prescriptionStats.pending}` : '0',
      trend: prescriptionStats.pending > 0 ? 'down' : 'neutral',
      href: '/doctor/prescriptions',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-green-500',
    },
    {
      label: 'Active Alerts',
      value: alertStats.total,
      change: alertStats.critical > 0 ? `${alertStats.critical} critical` : '0',
      trend: alertStats.critical > 0 ? 'up' : 'neutral',
      href: '/doctor/alerts',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      gradient: 'from-red-500 to-orange-500',
    },
  ];

  // Real upcoming appointments - using recent prescriptions
  const upcomingAppointments = recentPrescriptions.map((p, index) => ({
    id: p.id || index,
    patient: p.patientName || 'Unknown Patient',
    time: p.date || 'Today',
    type: p.stage || 'Check-up',
    status: p.status || 'pending',
    avatar: p.patientName?.charAt(0).toUpperCase() || 'P',
  }));

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
      name: 'Alerts',
      href: '/doctor/alerts',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      gradient: 'from-green-500 to-lime-500',
    },
  ];

  // Recent activities from real data
  const recentActivities = recentAlerts.slice(0, 3).map((alert, idx) => ({
    id: idx,
    action: alert.alertType || 'Alert triggered',
    patient: alert.patientName || 'Unknown',
    time: alert.latestReading?.timestamp ? new Date(alert.latestReading.timestamp).toLocaleString() : 'Recently',
    icon: alert.severity === 'critical' ? '🚨' : alert.severity === 'high' ? '⚠️' : '📊',
  }));

  return (
    <>
      <DocNav />
      <div className="min-h-screen bg-black">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-linear-to-br from-black via-zinc-900 to-black border-b border-zinc-800/50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.1),transparent_50%)]"></div>
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
                  {getGreeting()}, <span className="bg-linear-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                    {loading ? 'Doctor' : `${profile?.name || 'Doctor'}`}!
                  </span>
                </h1>
                <p className="mt-2 text-base text-zinc-400 sm:text-lg">
                  You have {prescriptionStats.pending} prescription{prescriptionStats.pending > 1 ? 's' : ''} pending review. Keep up the great work! 🩺
                </p>
                <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1.5 sm:px-4 sm:py-2 ring-1 ring-teal-500/20">
                    <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></div>
                    <span className="text-xs sm:text-sm font-medium text-teal-400">Available</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-zinc-800/50 px-3 py-1.5 sm:px-4 sm:py-2 ring-1 ring-zinc-700/50">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium text-zinc-400">
                      {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions - Desktop */}
              <div className="mt-6 lg:mt-0 lg:ml-8">
                <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4 lg:grid-cols-2">
                  {quickActions.map((action) => (
                    <Link
                      key={action.name}
                      href={action.href}
                      className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-zinc-900/50 p-3 sm:p-4 backdrop-blur-sm ring-1 ring-zinc-800/50 transition-all hover:scale-105 hover:ring-teal-500/50"
                    >
                      <div className={`absolute inset-0 bg-linear-to-br ${action.gradient} opacity-0 transition-opacity group-hover:opacity-10`}></div>
                      <div className={`mb-1 sm:mb-2 inline-flex rounded-lg sm:rounded-xl bg-linear-to-br ${action.gradient} p-1.5 sm:p-2 text-white shadow-lg`}>
                        {action.icon}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-white">{action.name}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section - Clickable Cards */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:px-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {todayStats.map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-zinc-900/50 p-4 sm:p-6 backdrop-blur-sm ring-1 ring-zinc-800/50 transition-all hover:scale-105 hover:ring-teal-500/50 cursor-pointer"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${stat.gradient} opacity-0 transition-opacity group-hover:opacity-5`}></div>
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className={`rounded-lg sm:rounded-xl bg-linear-to-br ${stat.gradient} p-2 sm:p-3 text-white shadow-lg`}>
                      {stat.icon}
                    </div>
                    <div className={`flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-semibold ${
                      stat.trend === 'up' ? 'text-emerald-400' : stat.trend === 'down' ? 'text-red-400' : 'text-zinc-500'
                    }`}>
                      {stat.trend === 'up' && (
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      )}
                      {stat.trend === 'down' && (
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-4">
                    <p className="text-xl sm:text-3xl font-bold text-white">{stat.value}</p>
                    <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-zinc-400">{stat.label}</p>
                  </div>
                  <div className="mt-2 text-[10px] sm:text-xs text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to view →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-8 sm:pb-12 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column - Appointments & Activity */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Appointments */}
              <div className="rounded-xl sm:rounded-2xl bg-zinc-900/50 p-4 sm:p-6 backdrop-blur-sm ring-1 ring-zinc-800/50">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Recent Prescriptions</h2>
                  <Link
                    href="/doctor/prescriptions"
                    className="text-xs sm:text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    View all →
                  </Link>
                </div>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {upcomingAppointments.slice(0, 3).map((appointment) => (
                      <div
                        key={appointment.id}
                        className="group relative overflow-hidden rounded-lg sm:rounded-xl bg-black/50 p-3 sm:p-4 ring-1 ring-zinc-800/50 transition-all hover:ring-teal-500/50"
                      >
                        <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:gap-4">
                          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-emerald-500 text-sm font-bold text-white shadow-lg">
                            {appointment.avatar}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                              <p className="text-sm sm:text-base font-semibold text-white">{appointment.patient}</p>
                              <span className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium ${
                                appointment.status === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/30'
                                  : appointment.status === 'approved'
                                  ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                                  : 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
                              }`}>
                                {appointment.status}
                              </span>
                            </div>
                            <div className="mt-0.5 sm:mt-1 flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-zinc-400">
                              <span className="flex items-center gap-0.5 sm:gap-1">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {appointment.time}
                              </span>
                              <span>•</span>
                              <span>{appointment.type}</span>
                            </div>
                          </div>
                          <Link 
                            href={`/doctor/patients/${appointment.id}`}
                            className="w-full sm:w-auto rounded-lg bg-teal-500/10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-teal-400 ring-1 ring-teal-500/20 transition-all hover:bg-teal-500/20 text-center"
                          >
                            Review
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-sm text-zinc-500">No recent prescriptions</div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="rounded-xl sm:rounded-2xl bg-zinc-900/50 p-4 sm:p-6 backdrop-blur-sm ring-1 ring-zinc-800/50">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Recent Activity</h2>
                {recentActivities.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 sm:gap-4">
                        <div className="text-xl sm:text-2xl">{activity.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base text-white">
                            <span className="font-semibold">{activity.action}</span> for{' '}
                            <span className="text-teal-400">{activity.patient}</span>
                          </p>
                          <p className="mt-0.5 sm:mt-1 text-xs text-zinc-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-sm text-zinc-500">No recent activity</div>
                )}
              </div>
            </div>

            {/* Right Column - Profile, Stats, Notifications */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-linear-to-br from-teal-500 to-emerald-600 p-4 sm:p-6 shadow-xl shadow-teal-500/20">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="relative">
                  <div className="mb-3 sm:mb-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-4 ring-white/30 text-xl sm:text-2xl font-bold text-white">
                    {loading ? '...' : (profile?.name?.charAt(4)?.toUpperCase() || 'D')}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {loading ? 'Loading...' : `${profile?.name || 'Doctor'}`}
                  </h3>
                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-teal-50">
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
                    className="mt-3 sm:mt-4 inline-flex items-center gap-2 rounded-lg bg-white/20 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white backdrop-blur-sm ring-1 ring-white/30 transition-all hover:bg-white/30"
                  >
                    View Profile
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="rounded-xl sm:rounded-2xl bg-zinc-900/50 p-4 sm:p-6 backdrop-blur-sm ring-1 ring-zinc-800/50">
                <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Practice Metrics</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <span className="text-xs sm:text-sm text-zinc-400">Approval Rate</span>
                      <span className="text-xs sm:text-sm font-semibold text-white">
                        {prescriptionStats.total > 0 ? Math.round((prescriptionStats.approved / prescriptionStats.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="h-1.5 sm:h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div className={`h-full rounded-full bg-linear-to-r ${prescriptionStats.total > 0 && (prescriptionStats.approved / prescriptionStats.total) > 0.5 ? 'from-teal-500 to-emerald-500' : 'from-yellow-500 to-orange-500'}`} 
                        style={{ width: `${prescriptionStats.total > 0 ? Math.round((prescriptionStats.approved / prescriptionStats.total) * 100) : 0}%` }}>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <span className="text-xs sm:text-sm text-zinc-400">Active Patients</span>
                      <span className="text-xs sm:text-sm font-semibold text-white">{patientsCount}</span>
                    </div>
                    <div className="h-1.5 sm:h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div className="h-full rounded-full bg-linear-to-r from-cyan-500 to-teal-500" style={{ width: `${Math.min(100, patientsCount)}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <span className="text-xs sm:text-sm text-zinc-400">Alerts</span>
                      <span className="text-xs sm:text-sm font-semibold text-white">{alertStats.total}</span>
                    </div>
                    <div className="h-1.5 sm:h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div className={`h-full rounded-full bg-linear-to-r ${alertStats.critical > 0 ? 'from-red-500 to-orange-500' : 'from-green-500 to-emerald-500'}`} 
                        style={{ width: `${Math.min(100, alertStats.total * 20)}%` }}>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Medications */}
              <div className="rounded-xl sm:rounded-2xl bg-zinc-900/50 p-4 sm:p-6 backdrop-blur-sm ring-1 ring-zinc-800/50">
                <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">💊 Top Medications</h3>
                {topMedications.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {topMedications.slice(0, 4).map((med, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-white truncate flex-1 mr-2">{med.medication}</span>
                        <span className="text-xs sm:text-sm font-semibold text-teal-400">{med.count}×</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">No medication data</p>
                )}
              </div>

              {/* Notifications */}
              <div className="rounded-xl sm:rounded-2xl bg-zinc-900/50 p-4 sm:p-6 backdrop-blur-sm ring-1 ring-zinc-800/50">
                <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Notifications</h3>
                <div className="space-y-2 sm:space-y-3">
                  {alertStats.critical > 0 && (
                    <div className="flex gap-2 sm:gap-3 rounded-lg bg-red-500/10 p-2.5 sm:p-3 ring-1 ring-red-500/20">
                      <div className="text-red-400 text-base sm:text-lg">🚨</div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-white">{alertStats.critical} critical alert{alertStats.critical > 1 ? 's' : ''}</p>
                        <p className="text-[10px] sm:text-xs text-zinc-400">Requires immediate attention</p>
                      </div>
                    </div>
                  )}
                  {prescriptionStats.pending > 0 && (
                    <div className="flex gap-2 sm:gap-3 rounded-lg bg-yellow-500/10 p-2.5 sm:p-3 ring-1 ring-yellow-500/20">
                      <div className="text-yellow-400 text-base sm:text-lg">⏳</div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-white">{prescriptionStats.pending} pending prescription{prescriptionStats.pending > 1 ? 's' : ''}</p>
                        <p className="text-[10px] sm:text-xs text-zinc-400">Ready for review</p>
                      </div>
                    </div>
                  )}
                  {patientsCount > 0 && (
                    <div className="flex gap-2 sm:gap-3 rounded-lg bg-teal-500/10 p-2.5 sm:p-3 ring-1 ring-teal-500/20">
                      <div className="text-teal-400 text-base sm:text-lg">👥</div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-white">{patientsCount} active patients</p>
                        <p className="text-[10px] sm:text-xs text-zinc-400">Under your care</p>
                      </div>
                    </div>
                  )}
                  {alertStats.total === 0 && prescriptionStats.pending === 0 && (
                    <div className="flex gap-2 sm:gap-3 rounded-lg bg-green-500/10 p-2.5 sm:p-3 ring-1 ring-green-500/20">
                      <div className="text-green-400 text-base sm:text-lg">✅</div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-white">All caught up!</p>
                        <p className="text-[10px] sm:text-xs text-zinc-400">No pending items</p>
                      </div>
                    </div>
                  )}
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