'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserNav from '@/components/UserNav';
import UserFooter from '@/components/UserFooter';
import { useUser } from '@clerk/nextjs';

export default function FamilyCirclePage() {
  const { user } = useUser();
  const router = useRouter();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relationship: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    // Load family members from localStorage (demo)
    const stored = localStorage.getItem('familyCircle');
    if (stored) {
      setFamilyMembers(JSON.parse(stored));
    } else {
      // Demo family members
      const demoFamily = [
        {
          id: '1',
          name: 'Sarah Wilson',
          relationship: 'Spouse',
          email: 'sarah.w@email.com',
          phone: '+1 (555) 123-4567',
          photo: '👩',
          isEmergencyContact: true,
          canViewVitals: true,
          addedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
        },
        {
          id: '2',
          name: 'Michael Wilson',
          relationship: 'Son',
          email: 'michael.w@email.com',
          phone: '+1 (555) 234-5678',
          photo: '👨',
          isEmergencyContact: true,
          canViewVitals: true,
          addedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toLocaleDateString()
        },
        {
          id: '3',
          name: 'Dr. Emily Chen',
          relationship: 'Primary Doctor',
          email: 'dr.chen@hospital.com',
          phone: '+1 (555) 345-6789',
          photo: '👩‍⚕️',
          isEmergencyContact: true,
          canViewVitals: true,
          addedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toLocaleDateString()
        }
      ];
      setFamilyMembers(demoFamily);
      localStorage.setItem('familyCircle', JSON.stringify(demoFamily));
    }
  }, []);

  const handleAddMember = () => {
    if (!newMember.name || !newMember.relationship) {
      alert('Please fill in required fields');
      return;
    }

    const member = {
      id: Date.now().toString(),
      ...newMember,
      photo: getEmojiForRelationship(newMember.relationship),
      isEmergencyContact: true,
      canViewVitals: true,
      addedDate: new Date().toLocaleDateString()
    };

    const updated = [...familyMembers, member];
    setFamilyMembers(updated);
    localStorage.setItem('familyCircle', JSON.stringify(updated));
    
    setShowAddModal(false);
    setNewMember({ name: '', relationship: '', email: '', phone: '' });
  };

  const getEmojiForRelationship = (relationship) => {
    const map = {
      'Spouse': '💑',
      'Son': '👨',
      'Daughter': '👩',
      'Father': '👨‍🦳',
      'Mother': '👩‍🦳',
      'Brother': '👨‍🦱',
      'Sister': '👩‍🦱',
      'Doctor': '👨‍⚕️',
      'Caregiver': '👨‍⚕️',
      'Friend': '👤'
    };
    return map[relationship] || '👤';
  };

  const removeMember = (id) => {
    if (confirm('Remove this member from your Family Circle?')) {
      const updated = familyMembers.filter(m => m.id !== id);
      setFamilyMembers(updated);
      localStorage.setItem('familyCircle', JSON.stringify(updated));
    }
  };

  const toggleEmergencyContact = (id) => {
    const updated = familyMembers.map(m => 
      m.id === id ? { ...m, isEmergencyContact: !m.isEmergencyContact } : m
    );
    setFamilyMembers(updated);
    localStorage.setItem('familyCircle', JSON.stringify(updated));
  };

  return (
    <>
      <UserNav />
      <div className="min-h-screen bg-black py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white">👨‍👩‍👧‍👦 Family Circle</h1>
                <p className="mt-2 text-lg text-zinc-400">
                  Connect with loved ones who care about your health journey
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="rounded-lg bg-linear-to-r from-teal-500 to-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-teal-500/30 transition-all hover:scale-105"
              >
                <svg className="mr-2 inline-block h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Member
              </button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-teal-500/20 p-3">
                  <svg className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Total Members</p>
                  <p className="text-2xl font-bold text-white">{familyMembers.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-500/20 p-3">
                  <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Emergency Contacts</p>
                  <p className="text-2xl font-bold text-white">
                    {familyMembers.filter(m => m.isEmergencyContact).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-500/20 p-3">
                  <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Protection Active</p>
                  <p className="text-2xl font-bold text-emerald-400">24/7</p>
                </div>
              </div>
            </div>
          </div>

          {/* Family Members Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10"
              >
                {/* Emergency Badge */}
                {member.isEmergencyContact && (
                  <div className="absolute right-4 top-4">
                    <span className="rounded-full bg-red-500/20 px-2 py-1 text-xs font-semibold text-red-400 ring-1 ring-red-500/30">
                      🚨 Emergency Contact
                    </span>
                  </div>
                )}

                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-emerald-500 text-3xl">
                    {member.photo}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{member.name}</h3>
                    <p className="text-sm text-teal-400">{member.relationship}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {member.email && (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {member.email}
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {member.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-zinc-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Added {member.addedDate}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => toggleEmergencyContact(member.id)}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      member.isEmergencyContact
                        ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30 hover:bg-red-500/30'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {member.isEmergencyContact ? '🚨 Emergency' : 'Set Emergency'}
                  </button>
                  <button
                    onClick={() => removeMember(member.id)}
                    className="rounded-lg bg-zinc-800 px-3 py-2 text-xs text-zinc-400 transition-all hover:bg-red-500/20 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Emergency SOS Button - Floating */}
          <div className="fixed bottom-8 right-8 z-50">
            <button
              onClick={() => router.push('/patient/emergency-sos')}
              className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-orange-500 text-3xl shadow-2xl shadow-red-500/50 transition-all hover:scale-110 hover:shadow-red-500/70 active:scale-95"
            >
              <span className="animate-pulse">🚨</span>
              <div className="absolute -inset-2 animate-ping rounded-full bg-red-500/50 opacity-75"></div>
            </button>
            <p className="mt-2 text-center text-xs font-semibold text-red-400">Emergency SOS</p>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-4 text-2xl font-bold text-white">Add Family Member</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Name *</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Relationship *</label>
                <select
                  value={newMember.relationship}
                  onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
                >
                  <option value="">Select relationship</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Caregiver">Caregiver</option>
                  <option value="Friend">Friend</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Email</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Phone</label>
                <input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-white transition-all hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="flex-1 rounded-lg bg-linear-to-r from-teal-500 to-emerald-500 px-4 py-2 font-semibold text-white transition-all hover:scale-105"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      <UserFooter />
    </>
  );
}
