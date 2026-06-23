'use client';

import AnalyticsBarChart from '@/components/AnalyticsBarChart';
import DocNav from '@/components/DocNav';
import DocFooter from '@/components/DocFooter';

export default function DoctorAnalytics() {
  // Demo data for patient distribution chart
  const patientDistribution = [
    { name: 'Normal', count: 45 },
    { name: 'Elevated', count: 37 },
    { name: 'High', count: 28 },
    { name: 'Critical', count: 14 },
  ];

  // Demo data for weekly trends
  const weeklyTrends = [
    { name: 'Mon', avgSystolic: 125 },
    { name: 'Tue', avgSystolic: 128 },
    { name: 'Wed', avgSystolic: 132 },
    { name: 'Thu', avgSystolic: 127 },
    { name: 'Fri', avgSystolic: 130 },
    { name: 'Sat', avgSystolic: 126 },
    { name: 'Sun', avgSystolic: 124 },
  ];

  return (
    <>
      <DocNav />
      <div className="min-h-screen bg-black">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="mt-2 text-zinc-400">Population insights and patient trends</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <p className="text-sm text-zinc-400">Patients with uncontrolled BP</p>
            <p className="mt-2 text-2xl font-bold text-white">42</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <p className="text-sm text-zinc-400">Avg Systolic (7d)</p>
            <p className="mt-2 text-2xl font-bold text-white">128 mmHg</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <p className="text-sm text-zinc-400">Alerts triggered today</p>
            <p className="mt-2 text-2xl font-bold text-white">3</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Patient Distribution */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">Patient BP Distribution</h2>
            <div className="h-64 rounded-lg border border-zinc-800 bg-black/50 p-4 sm:h-80">
              <AnalyticsBarChart data={patientDistribution} dataKey="count" barColor="#06b6d4" />
            </div>
          </div>

          {/* Weekly Trends */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">Weekly Avg Systolic BP</h2>
            <div className="h-64 rounded-lg border border-zinc-800 bg-black/50 p-4 sm:h-80">
              <AnalyticsBarChart data={weeklyTrends} dataKey="avgSystolic" barColor="#14b8a6" />
            </div>
          </div>
        </div>
      </div>
      </div>
      <DocFooter />
    </>
  );
}
