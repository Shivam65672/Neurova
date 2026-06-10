'use client';
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserNav from '@/components/UserNav';
import UserFooter from '@/components/UserFooter';
import usePatientProfile from '@/hooks/usePatientProfile';

export default function EmergencySOSPage() {
  const router = useRouter();
  const { profile } = usePatientProfile();
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showCancelButton, setShowCancelButton] = useState(true);
  const { user } = useUser();

const [emergencyContacts,setEmergencyContacts] = useState([]);

 useEffect(()=>{

    if(!user?.id) return;

    const loadContacts=async()=>{

        const res=await fetch(
            `/api/family-members?clerkId=${user.id}`
        );

        const data=await res.json();

        if(data.success){

            setEmergencyContacts(
                data.members.filter(
                    m=>m.isEmergencyContact
                )
            );

        }

    }

    loadContacts();

},[user]);

  useEffect(() => {
    if (sosActive && countdown > 0 && showCancelButton) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (sosActive && countdown === 0) {
      sendEmergencyAlert();
      setShowCancelButton(false);
    }
  }, [sosActive, countdown, showCancelButton]);

  const activateSOS = () => {
    setSosActive(true);
    setCountdown(5);
    setShowCancelButton(true);
  };

  const cancelSOS = () => {
    setSosActive(false);
    setCountdown(5);
    setShowCancelButton(true);
  };

  const sendEmergencyAlert = async () => {

    const latestVitals = {
        bp: "185/122",
        heartRate: "112 bpm",
        timestamp: new Date().toLocaleTimeString()
    };

    try {

        const response = await fetch("/api/emergency-alert", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({

                patientId: user.id,

                contacts: emergencyContacts,

                location,

                vitals: latestVitals,

                timestamp: new Date()

            })
        });

        const data = await response.json();

        console.log(data);

    } catch (err) {
        console.log(err);
    }
};

  const getMapUrl = () => {
    if (!location) return '';
    return `https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`;
  };

  return (
    <>
      <UserNav />
      <div className="min-h-screen bg-black py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {!sosActive ? (
            <>
              {/* Initial SOS Screen */}
              <div className="text-center">
                <div className="mb-8">
                  <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-orange-500 text-6xl shadow-2xl shadow-red-500/50 animate-pulse">
                    🚨
                  </div>
                  <h1 className="text-4xl font-bold text-white">Emergency SOS</h1>
                  <p className="mt-2 text-lg text-zinc-400">
                    Instantly alert your family circle and doctor
                  </p>
                </div>

                {/* What Happens */}
                <div className="mb-8 rounded-2xl border border-red-900/50 bg-red-900/20 p-6 text-left">
                  <h2 className="mb-4 text-xl font-bold text-white">When you activate SOS:</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-zinc-300">
                      <span className="mt-1 text-xl">📍</span>
                      <div>
                        <p className="font-semibold text-white">Your location is shared</p>
                        <p className="text-sm text-zinc-400">Real-time GPS coordinates sent to emergency contacts</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-300">
                      <span className="mt-1 text-xl">💓</span>
                      <div>
                        <p className="font-semibold text-white">Latest vitals transmitted</p>
                        <p className="text-sm text-zinc-400">Blood pressure, heart rate, and medical history</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-300">
                      <span className="mt-1 text-xl">📞</span>
                      <div>
                        <p className="font-semibold text-white">Alerts sent immediately</p>
                        <p className="text-sm text-zinc-400">SMS, email, and app notifications to all emergency contacts</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-300">
                      <span className="mt-1 text-xl">🏥</span>
                      <div>
                        <p className="font-semibold text-white">Doctor notified</p>
                        <p className="text-sm text-zinc-400">Your primary doctor receives critical alert with full details</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Emergency Contacts Preview */}
                <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <h3 className="mb-4 text-lg font-bold text-white">Will notify {emergencyContacts.length} Emergency Contacts:</h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    {emergencyContacts.map(member=> (
                        <div key={member._id} className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2">
                          <span className="text-2xl">{member.photo}</span>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-white">{member.name}</p>
                            <p className="text-xs text-zinc-400">{member.relationship}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                  {emergencyContacts.filter(m => m.isEmergencyContact).length === 0 && (
                    <p className="text-sm text-zinc-500">
                      No emergency contacts set. <button onClick={() => router.push('/patient/family-circle')} className="text-teal-400 hover:underline">Add family members</button>
                    </p>
                  )}
                </div>

                {/* Activate Button */}
                <button
                  onClick={activateSOS}
                  disabled={loadingLocation}
                  className="group relative mx-auto flex h-48 w-48 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-orange-500 text-6xl shadow-2xl shadow-red-500/50 transition-all hover:scale-110 hover:shadow-red-500/70 active:scale-95 disabled:opacity-50"
                >
                  <span className="relative z-10">🆘</span>
                  <div className="absolute inset-0 animate-ping rounded-full bg-red-500/50 opacity-75"></div>
                </button>
                <p className="mt-6 text-xl font-bold text-red-400">
                  {loadingLocation ? 'Getting location...' : 'Press to Activate Emergency SOS'}
                </p>
                <p className="mt-2 text-sm text-zinc-500">You'll have 5 seconds to cancel</p>
              </div>
            </>
          ) : (
            <>
              {/* SOS Activated Screen */}
              <div className="text-center">
                {countdown > 0 ? (
                  <>
                    {/* Countdown */}
                    <div className="mb-8">
                      <div className="mx-auto mb-4 flex h-48 w-48 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-orange-500 text-8xl font-bold text-white shadow-2xl shadow-red-500/50 animate-pulse">
                        {countdown}
                      </div>
                      <h1 className="text-4xl font-bold text-red-400">Emergency Alert Activating...</h1>
                      <p className="mt-2 text-lg text-zinc-400">
                        Cancel within {countdown} seconds
                      </p>
                    </div>

                    {/* Cancel Button */}
                    <button
                      onClick={cancelSOS}
                      className="rounded-xl border-2 border-zinc-700 bg-zinc-800 px-12 py-4 text-xl font-semibold text-white transition-all hover:bg-zinc-700"
                    >
                      ✕ Cancel Emergency SOS
                    </button>
                  </>
                ) : (
                  <>
                    {/* Alert Sent */}
                    <div className="mb-8">
                      <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-emerald-500 text-6xl shadow-2xl shadow-emerald-500/50">
                        ✅
                      </div>
                      <h1 className="text-4xl font-bold text-emerald-400">Emergency Alert Sent!</h1>
                      <p className="mt-2 text-lg text-zinc-400">
                        Your family circle has been notified
                      </p>
                    </div>

                    {/* Alert Details */}
                    <div className="space-y-4 text-left">
                      {/* Location */}
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
                          <span>📍</span> Location Shared
                        </h3>
                        {location && (
                          <div className="overflow-hidden rounded-lg">
                            <iframe
                              width="100%"
                              height="200"
                              style={{ border: 0 }}
                              loading="lazy"
                              src={getMapUrl()}
                              title="Location Map"
                            ></iframe>
                            <p className="mt-2 text-sm text-zinc-400">
                              Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Vitals */}
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
                          <span>💓</span> Vitals Transmitted
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg bg-red-500/20 p-4">
                            <p className="text-sm text-zinc-400">Blood Pressure</p>
                            <p className="text-2xl font-bold text-red-400">185/122 mmHg</p>
                            <p className="text-xs text-red-400">CRITICAL</p>
                          </div>
                          <div className="rounded-lg bg-orange-500/20 p-4">
                            <p className="text-sm text-zinc-400">Heart Rate</p>
                            <p className="text-2xl font-bold text-orange-400">112 bpm</p>
                            <p className="text-xs text-orange-400">ELEVATED</p>
                          </div>
                        </div>
                      </div>

                      {/* Notified Contacts */}
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
                          <span>📞</span> Notified Contacts
                        </h3>
                        <div className="space-y-2">
                          {emergencyContacts
                            .filter(m => m.isEmergencyContact)
                            .map((member) => (
                              <div key={member._id} className="flex items-center justify-between rounded-lg bg-zinc-800 p-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{member.photo}</span>
                                  <div>
                                    <p className="font-semibold text-white">{member.name}</p>
                                    <p className="text-xs text-zinc-400">{member.relationship}</p>
                                  </div>
                                </div>
                                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                                  ✓ Notified
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex gap-4">
                      <button
                        onClick={() => router.push('/patient/dashboard')}
                        className="flex-1 rounded-xl border border-zinc-700 px-6 py-4 font-semibold text-white transition-all hover:bg-zinc-800"
                      >
                        Return to Dashboard
                      </button>
                      <button
                        onClick={() => router.push('/patient/family-circle')}
                        className="flex-1 rounded-xl bg-teal-500 px-6 py-4 font-semibold text-white transition-all hover:bg-teal-600"
                      >
                        View Family Circle
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <UserFooter />
    </>
  );
}
