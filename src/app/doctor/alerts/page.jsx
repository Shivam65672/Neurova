'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import DocNav from '@/components/DocNav';
import DocFooter from '@/components/DocFooter';

export default function PatientAlertsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0, medium: 0, low: 0 });

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
    if (isLoaded && user) {
      fetchAlerts();
      const interval = setInterval(fetchAlerts, 120000);
      return () => clearInterval(interval);
    }
  }, [isLoaded, user]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/doctor/alerts?doctorClerkId=${user.id}`);
      const data = await res.json();

      console.log("📊 Alerts response:", data);

      if (data.success) {
        if (data.alerts && data.alerts.length > 0) {
          setAlerts(data.alerts);
          setStats({
            total: data.totalAlerts || data.alerts.length,
            critical: data.criticalCount || data.alerts.filter(a => a.severity === 'critical').length,
            high: data.highCount || data.alerts.filter(a => a.severity === 'high').length,
            medium: data.mediumCount || data.alerts.filter(a => a.severity === 'medium').length,
            low: data.lowCount || data.alerts.filter(a => a.severity === 'low').length,
          });
        } else {
          setAlerts([]);
          setStats({ total: 0, critical: 0, high: 0, medium: 0, low: 0 });
        }
      } else {
        console.error('Failed to fetch alerts:', data.message);
        setAlerts([]);
        setStats({ total: 0, critical: 0, high: 0, medium: 0, low: 0 });
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts([]);
      setStats({ total: 0, critical: 0, high: 0, medium: 0, low: 0 });
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.severity === filter;
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'from-red-500 to-orange-500';
      case 'high':
        return 'from-orange-500 to-yellow-500';
      case 'medium':
        return 'from-yellow-500 to-amber-500';
      case 'low':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getSeverityBadgeColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 ring-red-500/30';
      case 'high':
        return 'bg-orange-500/10 text-orange-400 ring-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/30';
      case 'low':
        return 'bg-blue-500/10 text-blue-400 ring-blue-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 ring-gray-500/30';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'critical_high':
        return '🚨';
      case 'rapidly_increasing':
        return '📈';
      case 'consistently_high':
        return '⚠️';
      case 'unstable':
        return '📊';
      case 'sudden_spike':
        return '⚡';
      case 'no_improvement':
        return '⏸️';
      default:
        return '📍';
    }
  };

  const handleViewPatient = (alert) => {
    if (alert.prescriptionId) {
      router.push(`/doctor/patients/${alert.prescriptionId}`);
    } else {
      router.push(`/doctor/patients`);
    }
  };

  if (!isLoaded || loading) {
    return (
      <>
        <DocNav />
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
            <p className="text-lg text-zinc-400">Loading alerts...</p>
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
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">Patient Deterioration Alerts</h1>
              <p className="mt-1 text-sm text-zinc-400 sm:text-base">
                Real-time monitoring and early warning system for patient health deterioration
              </p>
            </div>
            <button
              onClick={fetchAlerts}
              className="flex items-center justify-center gap-2 rounded-lg bg-teal-500/10 px-4 py-2 text-sm font-medium text-teal-400 ring-1 ring-teal-500/20 transition-all hover:bg-teal-500/20 sm:w-auto"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400 sm:text-sm">Total Alerts</p>
                  <p className="mt-1 text-2xl font-bold text-white sm:text-3xl">{stats.total}</p>
                </div>
                <div className="rounded-lg bg-linear-to-br from-teal-500 to-emerald-500 p-2 sm:p-3">
                  <svg className="h-5 w-5 text-white sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-red-900/50 bg-red-900/20 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-400 sm:text-sm">Critical</p>
                  <p className="mt-1 text-2xl font-bold text-white sm:text-3xl">{stats.critical}</p>
                </div>
                <div className="rounded-lg bg-linear-to-br from-red-500 to-orange-500 p-2 sm:p-3">
                  <svg className="h-5 w-5 text-white sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-orange-900/50 bg-orange-900/20 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-400 sm:text-sm">High</p>
                  <p className="mt-1 text-2xl font-bold text-white sm:text-3xl">{stats.high}</p>
                </div>
                <div className="rounded-lg bg-linear-to-br from-orange-500 to-yellow-500 p-2 sm:p-3">
                  <svg className="h-5 w-5 text-white sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-yellow-900/50 bg-yellow-900/20 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-yellow-400 sm:text-sm">Medium</p>
                  <p className="mt-1 text-2xl font-bold text-white sm:text-3xl">{stats.medium}</p>
                </div>
                <div className="rounded-lg bg-linear-to-br from-yellow-500 to-amber-500 p-2 sm:p-3">
                  <svg className="h-5 w-5 text-white sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-900/50 bg-blue-900/20 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-400 sm:text-sm">Low</p>
                  <p className="mt-1 text-2xl font-bold text-white sm:text-3xl">{stats.low}</p>
                </div>
                <div className="rounded-lg bg-linear-to-br from-blue-500 to-cyan-500 p-2 sm:p-3">
                  <svg className="h-5 w-5 text-white sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex flex-wrap gap-1.5 sm:gap-2">
            {['all', 'critical', 'high', 'medium', 'low'].map((filterType) => {
              const filterLabels = {
                all: `All (${stats.total})`,
                critical: `Critical (${stats.critical})`,
                high: `High (${stats.high})`,
                medium: `Medium (${stats.medium})`,
                low: `Low (${stats.low})`
              };

              const colorClasses = {
                all: filter === 'all' ? 'bg-teal-500/20 text-teal-400 ring-teal-500/30' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white',
                critical: filter === 'critical' ? 'bg-red-500/20 text-red-400 ring-red-500/30' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white',
                high: filter === 'high' ? 'bg-orange-500/20 text-orange-400 ring-orange-500/30' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white',
                medium: filter === 'medium' ? 'bg-yellow-500/20 text-yellow-400 ring-yellow-500/30' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white',
                low: filter === 'low' ? 'bg-blue-500/20 text-blue-400 ring-blue-500/30' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
              };

              return (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:px-4 sm:py-2 sm:text-sm ${colorClasses[filterType]}`}
                >
                  {filterLabels[filterType]}
                </button>
              );
            })}
          </div>

          {/* Alerts List */}
          {filteredAlerts.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center sm:p-12">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/10 sm:h-20 sm:w-20">
                <svg className="h-8 w-8 text-teal-400 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white sm:text-xl">No Alerts</h3>
              <p className="mt-1 text-sm text-zinc-400 sm:text-base">
                {filter === 'all'
                  ? 'All patients are showing stable readings.'
                  : `No ${filter} severity alerts at this time.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredAlerts.map((alert, index) => (
                <div
                  key={index}
                  className={`group relative overflow-hidden rounded-xl border bg-zinc-900/50 p-4 transition-all hover:scale-[1.01] sm:p-6 ${alert.severity === 'critical'
                    ? 'border-red-900/50 bg-red-900/10'
                    : alert.severity === 'high'
                      ? 'border-orange-900/50 bg-orange-900/10'
                      : alert.severity === 'medium'
                        ? 'border-yellow-900/50 bg-yellow-900/10'
                        : alert.severity === 'low'
                          ? 'border-blue-900/50 bg-blue-900/10'
                          : 'border-zinc-800'
                    }`}
                >
                  {/* Severity Indicator Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b ${getSeverityColor(alert.severity)}`}></div>

                  <div className="ml-2 sm:ml-4">
                    {/* Header */}
                    <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-emerald-500 text-lg font-bold text-white sm:h-14 sm:w-14 sm:text-xl">
                          {alert.patientName?.charAt(0) || 'P'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-bold text-white sm:text-xl">{alert.patientName || 'Unknown Patient'}</h3>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-zinc-400 sm:mt-1 sm:gap-2 sm:text-sm">
                            {alert.age && <span>{alert.age} years</span>}
                            {alert.age && alert.currentStage && <span className="hidden sm:inline">•</span>}
                            {alert.currentStage && <span className="text-xs font-medium text-cyan-400 sm:text-sm">
                              {alert.currentStage.charAt(0).toUpperCase() + alert.currentStage.slice(1)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ring-1 sm:px-3 sm:py-1 sm:text-xs ${getSeverityBadgeColor(alert.severity)}`}>
                          {alert.severity || 'unknown'}
                        </span>
                        <span className="text-lg sm:text-2xl">{getTrendIcon(alert.trend)}</span>
                      </div>
                    </div>

                    {/* Alert Type & Message */}
                    <div className="mb-3 rounded-lg bg-black/30 p-3 sm:mb-4 sm:p-4">
                      <div className="mb-1 flex items-center gap-1.5 sm:mb-2 sm:gap-2">
                        <svg className="h-4 w-4 text-teal-400 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="text-sm font-semibold text-white sm:text-base">{alert.alertType || 'Alert'}</h4>
                      </div>
                      <p className="text-xs leading-relaxed text-zinc-300 sm:text-sm">{alert.message || 'No message provided'}</p>
                    </div>

                    {/* Latest Reading */}
                    {alert.latestReading && (
                      <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg bg-black/30 p-3 sm:mb-4 sm:gap-6 sm:p-4">
                        <div>
                          <p className="text-[10px] text-zinc-500 sm:text-xs">Latest BP Reading</p>
                          <p className="mt-0.5 text-lg font-bold text-white sm:mt-1 sm:text-2xl">
                            {alert.latestReading.systolic || 0}/{alert.latestReading.diastolic || 0}
                            <span className="ml-1 text-[10px] font-normal text-zinc-400 sm:ml-2 sm:text-sm">mmHg</span>
                          </p>
                        </div>
                        <div className="hidden h-8 w-px bg-zinc-700 sm:block sm:h-12"></div>
                        <div>
                          <p className="text-[10px] text-zinc-500 sm:text-xs">Recorded</p>
                          <p className="mt-0.5 text-xs font-medium text-zinc-300 sm:mt-1 sm:text-sm">
                            {alert.latestReading.timestamp ?
                              new Date(alert.latestReading.timestamp).toLocaleString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) :
                              'N/A'
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Prescription Status */}
                    {alert.prescriptionStatus && (
                      <div className="mb-3 sm:mb-4">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${alert.prescriptionStatus === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : alert.prescriptionStatus === 'approved'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                          }`}>
                          Status: {alert.prescriptionStatus.charAt(0).toUpperCase() + alert.prescriptionStatus.slice(1)}
                        </span>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => handleViewPatient(alert)}
                      className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-teal-500 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition-all hover:scale-[1.02] hover:shadow-teal-500/40 sm:py-3"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>View Patient Details & Take Action</span>
                    </button>
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