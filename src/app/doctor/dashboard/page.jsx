'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import DocNav from '@/components/DocNav';
import DocFooter from '@/components/DocFooter';

export default function DoctorDashboard() {
  const { user } = useUser();
  const [alertStats, setAlertStats] = useState({ total: 0, critical: 0, high: 0 });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user]);

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
              message: 'URGENT: Patient showing hypertensive crisis readings.',
              latestReading: {
                systolic: 188,
                diastolic: 124,
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
              },
              trend: 'critical_high',
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
              message: 'Patient BP increased by 40 mmHg over last 5 readings.',
              latestReading: {
                systolic: 168,
                diastolic: 105,
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
              },
              trend: 'rapidly_increasing',
              prescriptionId: 'demo_prescription_2'
            }
          ];
          
          setAlertStats({
            total: 2,
            critical: 1,
            high: 1,
          });
          setRecentAlerts(demoAlerts);
        } else {
          setAlertStats({
            total: data.totalAlerts,
            critical: data.criticalCount,
            high: data.highCount,
          });
          setRecentAlerts(data.alerts.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    activePatients: 124,
    pendingPrescriptions: 6,
    alertsToday: alertStats.total,
  };

  return (
    <>
      <DocNav />
      <div className="min-h-screen bg-black">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Doctor Dashboard</h1>
            <p className="mt-2 text-zinc-400">Review AI suggestions, approve prescriptions, and monitor patients.</p>
          </div>
          <div className="space-x-3">
            <button className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-white hover:bg-zinc-800">Profile</button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <p className="text-sm text-zinc-400">Active Patients</p>
            <p className="mt-2 text-2xl font-bold text-white">{stats.activePatients}</p>
            <Link href="/doctor/patients" className="mt-3 inline-block text-sm text-cyan-400">Manage Patients →</Link>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <p className="text-sm text-zinc-400">Pending Prescriptions</p>
            <p className="mt-2 text-2xl font-bold text-white">{stats.pendingPrescriptions}</p>
            <Link href="/doctor/prescriptions" className="mt-3 inline-block text-sm text-cyan-400">Review →</Link>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <p className="text-sm text-zinc-400">Patient Alerts</p>
            <p className="mt-2 text-2xl font-bold text-white">{loading ? '...' : stats.alertsToday}</p>
            {alertStats.critical > 0 && (
              <p className="mt-1 text-xs font-semibold text-red-400">{alertStats.critical} Critical</p>
            )}
            <Link href="/doctor/alerts" className="mt-3 inline-block text-sm text-cyan-400">View Alerts →</Link>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {/* Patient Deterioration Alerts */}
          {alertStats.total > 0 && (
            <div className="rounded-xl border border-red-900/50 bg-red-900/10 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">🚨 Patient Deterioration Alerts</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    {alertStats.critical > 0 
                      ? `${alertStats.critical} critical alert${alertStats.critical > 1 ? 's' : ''} require immediate attention`
                      : 'Patients showing concerning BP trends'}
                  </p>
                </div>
                <Link 
                  href="/doctor/alerts" 
                  className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 ring-1 ring-red-500/30 transition-all hover:bg-red-500/30"
                >
                  View All Alerts
                </Link>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
                  </div>
                ) : recentAlerts.length > 0 ? (
                  recentAlerts.map((alert, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/50 p-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {alert.severity === 'critical' ? '🚨' : alert.severity === 'high' ? '⚠️' : '📊'}
                        </div>
                        <div>
                          <p className="font-medium text-white">{alert.patientName}</p>
                          <p className="text-sm text-zinc-400">{alert.alertType}</p>
                          <p className="text-xs text-zinc-500 mt-1">
                            BP: {alert.latestReading.systolic}/{alert.latestReading.diastolic} mmHg
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                          alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {alert.severity}
                        </span>
                        <Link 
                          href={`/doctor/patients/${alert.prescriptionId}`}
                          className="rounded-md bg-cyan-600 px-3 py-1 text-sm text-white hover:bg-cyan-700"
                        >
                          Take Action
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-zinc-500">No recent alerts</div>
                )}
              </div>
            </div>
          )}

          {/* Recent AI Suggestions */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-xl font-semibold text-white">Recent AI Suggestions</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/50 p-4">
                <div>
                  <p className="font-medium text-white">John Doe — Amlodipine 5mg</p>
                  <p className="text-sm text-zinc-400">Suggested by AI • Elevated BP trend</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link href="/doctor/prescriptions/1" className="rounded-md bg-cyan-600 px-3 py-1 text-sm text-white">Review</Link>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/50 p-4">
                <div>
                  <p className="font-medium text-white">Mary Smith — Losartan 50mg</p>
                  <p className="text-sm text-zinc-400">Doctor-approved</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link href="/doctor/prescriptions/2" className="rounded-md border border-zinc-700 px-3 py-1 text-sm text-white">View</Link>
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
