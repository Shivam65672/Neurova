'use client';

import { useState } from 'react';
import UserNav from '@/components/UserNav';
import UserFooter from '@/components/UserFooter';
import { usePatientProfile } from '@/hooks/usePatientProfile';

export default function MedicalHistory() {
  const { profile, loading } = usePatientProfile();
  const [activeTab, setActiveTab] = useState('conditions');

  const [medicalConditions] = useState([
    { id: 1, condition: 'Hypertension', diagnosedDate: '2023-05-15', status: 'Active', severity: 'Moderate' },
    { id: 2, condition: 'Type 2 Diabetes', diagnosedDate: '2022-11-20', status: 'Active', severity: 'Mild' },
    { id: 3, condition: 'High Cholesterol', diagnosedDate: '2023-01-10', status: 'Controlled', severity: 'Mild' },
  ]);

  const [allergies] = useState([
    { id: 1, allergen: 'Penicillin', reaction: 'Skin rash', severity: 'Moderate', diagnosedDate: '2020-03-12' },
    { id: 2, allergen: 'Peanuts', reaction: 'Anaphylaxis', severity: 'Severe', diagnosedDate: '2015-08-05' },
  ]);

  const [surgeries] = useState([
    { id: 1, procedure: 'Appendectomy', date: '2018-06-15', hospital: 'City General Hospital', notes: 'Laparoscopic procedure' },
    { id: 2, procedure: 'Cataract Surgery', date: '2021-09-22', hospital: 'Vision Care Center', notes: 'Right eye' },
  ]);

  const [familyHistory] = useState([
    { id: 1, relation: 'Father', condition: 'Heart Disease', ageOfOnset: 55 },
    { id: 2, relation: 'Mother', condition: 'Type 2 Diabetes', ageOfOnset: 48 },
    { id: 3, relation: 'Sibling', condition: 'Hypertension', ageOfOnset: 42 },
  ]);

  const [labResults] = useState([
    { id: 1, test: 'HbA1c', result: '6.2%', normalRange: '< 5.7%', date: '2025-10-15', status: 'elevated' },
    { id: 2, test: 'Total Cholesterol', result: '195 mg/dL', normalRange: '< 200 mg/dL', date: '2025-10-15', status: 'normal' },
    { id: 3, test: 'LDL Cholesterol', result: '115 mg/dL', normalRange: '< 100 mg/dL', date: '2025-10-15', status: 'elevated' },
    { id: 4, test: 'Blood Glucose (Fasting)', result: '105 mg/dL', normalRange: '70-100 mg/dL', date: '2025-10-15', status: 'elevated' },
  ]);

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'moderate':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'mild':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      default:
        return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'controlled':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'normal':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'elevated':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const tabs = [
    { id: 'conditions', name: 'Medical Conditions', icon: '🏥' },
    { id: 'allergies', name: 'Allergies', icon: '⚠️' },
    { id: 'surgeries', name: 'Surgeries', icon: '🔬' },
    { id: 'family', name: 'Family History', icon: '👨‍👩‍👧‍👦' },
    { id: 'labs', name: 'Lab Results', icon: '📋' },
  ];

  return (
    <>
      <UserNav />
      <div className="min-h-screen bg-black">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Medical History</h1>
          <p className="mt-2 text-zinc-400">Your complete health records and medical information</p>
        </div>

        {/* Patient Info Card */}
        <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="h-16 w-16 rounded-full bg-linear-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
                {loading ? '...' : profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {loading ? 'Loading...' : profile?.name || 'User'}
                </h2>
                <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                  <div className="text-zinc-400">
                    <span className="text-zinc-500">Age:</span> {loading ? '...' : profile?.age ? `${profile.age} years` : 'N/A'}
                  </div>
                  <div className="text-zinc-400">
                    <span className="text-zinc-500">Gender:</span> {loading ? '...' : profile?.gender || 'N/A'}
                  </div>
                  <div className="text-zinc-400">
                    <span className="text-zinc-500">Height:</span> {loading ? '...' : profile?.height ? `${profile.height} cm` : 'N/A'}
                  </div>
                  <div className="text-zinc-400">
                    <span className="text-zinc-500">Weight:</span> {loading ? '...' : profile?.weight ? `${profile.weight} kg` : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
            <button className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors">
              Download Records
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-zinc-800">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
          {/* Medical Conditions */}
          {activeTab === 'conditions' && (
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Medical Conditions</h3>
                <button className="text-sm text-cyan-400 hover:text-cyan-300">+ Add Condition</button>
              </div>
              <div className="space-y-4">
                {medicalConditions.map((condition) => (
                  <div key={condition.id} className="rounded-lg border border-zinc-800 bg-black/50 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white">{condition.condition}</h4>
                        <p className="mt-1 text-sm text-zinc-400">Diagnosed: {condition.diagnosedDate}</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(condition.status)}`}>
                          {condition.status}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getSeverityColor(condition.severity)}`}>
                          {condition.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Allergies */}
          {activeTab === 'allergies' && (
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Allergies</h3>
                <button className="text-sm text-cyan-400 hover:text-cyan-300">+ Add Allergy</button>
              </div>
              <div className="space-y-4">
                {allergies.map((allergy) => (
                  <div key={allergy.id} className="rounded-lg border border-zinc-800 bg-black/50 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white">{allergy.allergen}</h4>
                        <p className="mt-1 text-sm text-zinc-400">Reaction: {allergy.reaction}</p>
                        <p className="text-sm text-zinc-500">Diagnosed: {allergy.diagnosedDate}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getSeverityColor(allergy.severity)}`}>
                        {allergy.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Surgeries */}
          {activeTab === 'surgeries' && (
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Past Surgeries</h3>
                <button className="text-sm text-cyan-400 hover:text-cyan-300">+ Add Surgery</button>
              </div>
              <div className="space-y-4">
                {surgeries.map((surgery) => (
                  <div key={surgery.id} className="rounded-lg border border-zinc-800 bg-black/50 p-4">
                    <h4 className="text-lg font-semibold text-white">{surgery.procedure}</h4>
                    <p className="mt-1 text-sm text-zinc-400">Date: {surgery.date}</p>
                    <p className="text-sm text-zinc-400">Hospital: {surgery.hospital}</p>
                    {surgery.notes && (
                      <p className="mt-2 text-sm text-zinc-500">Notes: {surgery.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Family History */}
          {activeTab === 'family' && (
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Family Medical History</h3>
                <button className="text-sm text-cyan-400 hover:text-cyan-300">+ Add Record</button>
              </div>
              <div className="space-y-4">
                {familyHistory.map((record) => (
                  <div key={record.id} className="rounded-lg border border-zinc-800 bg-black/50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{record.relation}</h4>
                        <p className="mt-1 text-sm text-zinc-400">{record.condition}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-zinc-500">Age of Onset</p>
                        <p className="text-lg font-semibold text-white">{record.ageOfOnset} yrs</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lab Results */}
          {activeTab === 'labs' && (
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Recent Lab Results</h3>
                <button className="text-sm text-cyan-400 hover:text-cyan-300">View All Results</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                        Test Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                        Result
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                        Normal Range
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {labResults.map((lab) => (
                      <tr key={lab.id} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="px-4 py-4 text-sm font-medium text-white">{lab.test}</td>
                        <td className="px-4 py-4 text-sm text-white">{lab.result}</td>
                        <td className="px-4 py-4 text-sm text-zinc-400">{lab.normalRange}</td>
                        <td className="px-4 py-4 text-sm text-zinc-400">{lab.date}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusColor(lab.status)}`}>
                            {lab.status.charAt(0).toUpperCase() + lab.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      <UserFooter />
    </>
  );
}
