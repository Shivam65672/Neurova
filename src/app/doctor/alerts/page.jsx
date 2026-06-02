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
  const [filter, setFilter] = useState('all'); // all, critical, high, medium
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0 });

  useEffect(() => {
    if (isLoaded && user) {
      fetchAlerts();
      // Auto-refresh every 2 minutes
      const interval = setInterval(fetchAlerts, 120000);
      return () => clearInterval(interval);
    }
  }, [isLoaded, user]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`/api/doctor/alerts?doctorClerkId=${user.id}`);
      const data = await res.json();
      
      if (data.success) {
        // If no real alerts, show demo alerts for presentation
        if (data.alerts.length === 0) {
          const demoAlerts = [
            {
              patientName: 'Robert Wilson',
              patientClerkId: 'demo_patient_1',
              age: 68,
              gender: 'Male',
              currentStage: 'Stage 3 Hypertensive Crisis',
              alertType: 'Hypertensive Crisis Detected',
              severity: 'critical',
              message: 'URGENT: Patient showing hypertensive crisis readings (188/124 mmHg). Immediate medical attention required.',
              latestReading: {
                systolic: 188,
                diastolic: 124,
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
              },
              trend: 'critical_high',
              recommendations: [
                'Emergency consultation required - Contact patient immediately',
                'Consider hospitalization for acute BP management',
                'Assess for target organ damage (heart, kidneys, brain)',
                'Review current medications and adjust dosage urgently',
                'Check for medication compliance issues'
              ],
              prescriptionId: 'demo_prescription_1'
            },
            {
              patientName: 'Jennifer Martinez',
              patientClerkId: 'demo_patient_2',
              age: 55,
              gender: 'Female',
              currentStage: 'Stage 2 Hypertension',
              alertType: 'Rapid Blood Pressure Escalation',
              severity: 'high',
              message: 'Patient BP increased by 40 mmHg over last 5 readings. Shows rapid deterioration pattern.',
              latestReading: {
                systolic: 168,
                diastolic: 105,
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
              },
              trend: 'rapidly_increasing',
              recommendations: [
                'Schedule urgent follow-up appointment within 48 hours',
                'Review medication effectiveness and compliance',
                'Assess recent lifestyle changes or stressors',
                'Consider increasing current medication dosage',
                'Order laboratory tests to rule out secondary causes'
              ],
              prescriptionId: 'demo_prescription_2'
            }
          ];
          
          setAlerts(demoAlerts);
          setStats({
            total: 2,
            critical: 1,
            high: 1,
          });
        } else {
          setAlerts(data.alerts);
          setStats({
            total: data.totalAlerts,
            critical: data.criticalCount,
            high: data.highCount,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
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
      default:
        return 'from-blue-500 to-cyan-500';
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
      default:
        return 'bg-blue-500/10 text-blue-400 ring-blue-500/30';
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
    // For demo alerts, show a modal or redirect to a demo patient view
    if (alert.prescriptionId.startsWith('demo_')) {
      // Store demo patient data in sessionStorage for the demo view
      sessionStorage.setItem('demoPatient', JSON.stringify({
        name: alert.patientName,
        age: alert.age,
        gender: alert.gender,
        stage: alert.currentStage,
        alertType: alert.alertType,
        severity: alert.severity,
        latestBP: alert.latestReading,
        recommendations: alert.recommendations,
        message: alert.message,
        trend: alert.trend
      }));
      router.push(`/doctor/patient/demo-${alert.patientClerkId}`);
    } else {
      router.push(`/doctor/patients/${alert.prescriptionId}`);
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
      <div className="min-h-screen bg-black py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white">Patient Deterioration Alerts</h1>
                <p className="mt-2 text-lg text-zinc-400">
                  Real-time monitoring and early warning system for patient health deterioration
                </p>
              </div>
              <button
                onClick={fetchAlerts}
                className="rounded-lg bg-teal-500/10 px-4 py-2 text-sm font-medium text-teal-400 ring-1 ring-teal-500/20 transition-all hover:bg-teal-500/20"
              >
                <svg className="inline-block mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Total Alerts</p>
                  <p className="mt-2 text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="rounded-xl bg-linear-to-br from-teal-500 to-emerald-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-red-900/50 bg-red-900/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-400">Critical Alerts</p>
                  <p className="mt-2 text-3xl font-bold text-white">{stats.critical}</p>
                </div>
                <div className="rounded-xl bg-linear-to-br from-red-500 to-orange-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-900/50 bg-orange-900/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-400">High Priority</p>
                  <p className="mt-2 text-3xl font-bold text-white">{stats.high}</p>
                </div>
                <div className="rounded-xl bg-linear-to-br from-orange-500 to-yellow-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-teal-500/20 text-teal-400 ring-1 ring-teal-500/30'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filter === 'critical'
                  ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              Critical ({stats.critical})
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filter === 'high'
                  ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              High ({stats.high})
            </button>
            <button
              onClick={() => setFilter('medium')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filter === 'medium'
                  ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/30'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              Medium
            </button>
          </div>

          {/* Alerts List */}
          {filteredAlerts.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-500/10">
                <svg className="h-10 w-10 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">No Alerts</h3>
              <p className="mt-2 text-zinc-400">
                {filter === 'all' 
                  ? 'All patients are showing stable readings.' 
                  : `No ${filter} severity alerts at this time.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert, index) => (
                <div
                  key={index}
                  className={`group relative overflow-hidden rounded-2xl border bg-zinc-900/50 p-6 transition-all hover:scale-[1.01] ${
                    alert.severity === 'critical' 
                      ? 'border-red-900/50 bg-red-900/10' 
                      : alert.severity === 'high'
                      ? 'border-orange-900/50 bg-orange-900/10'
                      : 'border-zinc-800'
                  }`}
                >
                  {/* Severity Indicator Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b ${getSeverityColor(alert.severity)}`}></div>

                  <div className="ml-4">
                    {/* Header */}
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-emerald-500 text-xl font-bold text-white">
                          {alert.patientName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{alert.patientName}</h3>
                          <div className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
                            <span>{alert.age} years</span>
                            <span>•</span>
                            <span>{alert.gender}</span>
                            <span>•</span>
                            <span className="font-medium text-cyan-400">{alert.currentStage}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ring-1 ${getSeverityBadgeColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className="text-2xl">{getTrendIcon(alert.trend)}</span>
                      </div>
                    </div>

                    {/* Alert Type & Message */}
                    <div className="mb-4 rounded-xl bg-black/30 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <svg className="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="font-semibold text-white">{alert.alertType}</h4>
                      </div>
                      <p className="text-sm leading-relaxed text-zinc-300">{alert.message}</p>
                    </div>

                    {/* Latest Reading */}
                    <div className="mb-4 flex items-center gap-6 rounded-xl bg-black/30 p-4">
                      <div>
                        <p className="text-xs text-zinc-500">Latest BP Reading</p>
                        <p className="mt-1 text-2xl font-bold text-white">
                          {alert.latestReading.systolic}/{alert.latestReading.diastolic}
                          <span className="ml-2 text-sm font-normal text-zinc-400">mmHg</span>
                        </p>
                      </div>
                      <div className="h-12 w-px bg-zinc-700"></div>
                      <div>
                        <p className="text-xs text-zinc-500">Recorded</p>
                        <p className="mt-1 text-sm font-medium text-zinc-300">
                          {new Date(alert.latestReading.timestamp).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="mb-4">
                      <h5 className="mb-2 text-sm font-semibold text-white">Recommended Actions:</h5>
                      <ul className="space-y-1.5">
                        {alert.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-zinc-400">
                            <svg className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleViewPatient(alert)}
                      className="w-full rounded-lg bg-linear-to-r from-teal-500 to-emerald-500 px-4 py-3 font-semibold text-white shadow-lg shadow-teal-500/30 transition-all hover:scale-[1.02] hover:shadow-teal-500/40"
                    >
                      <svg className="mr-2 inline-block h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Patient Details & Take Action
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
