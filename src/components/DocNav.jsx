'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDoctorProfile } from '@/hooks/useDoctorProfile';
import { useUser } from '@clerk/nextjs';

export default function DocNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { profile, loading } = useDoctorProfile();
  const { user } = useUser();
  const [alertCount, setAlertCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchAlertCounts();
      const interval = setInterval(fetchAlertCounts, 120000); // Refresh every 2 minutes
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchAlertCounts = async () => {
    try {
      const res = await fetch(`/api/doctor/alerts?doctorClerkId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        // If no real alerts, show demo counts for presentation
        if (data.totalAlerts === 0) {
          setAlertCount(2);
          setCriticalCount(1);
        } else {
          setAlertCount(data.totalAlerts);
          setCriticalCount(data.criticalCount);
        }
      }
    } catch (error) {
      console.error('Error fetching alert counts:', error);
    }
  };

  const doctorLinks = [
    { name: 'Dashboard', href: '/doctor/dashboard' },
    { name: 'Patients', href: '/doctor/patients' },
    { name: 'Alerts', href: '/doctor/alerts', badge: alertCount, isCritical: criticalCount > 0 },
    { name: 'Prescriptions', href: '/doctor/prescriptions' },
    { name: 'Analytics', href: '/doctor/analytics' },
    { name: 'Profile', href: '/doctor/profile' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-black/80 backdrop-blur-xl supports-backdrop-filter:bg-black/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-3 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/25 transition-all group-hover:shadow-teal-500/40 group-hover:scale-105">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">Synapse</span>
                <span className="ml-2 rounded-full bg-teal-500/20 px-2.5 py-0.5 text-xs font-medium text-teal-400 ring-1 ring-teal-500/30">
                  Doctor Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              {doctorLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`group relative rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-linear-to-r from-teal-500/20 to-emerald-500/20 text-teal-400 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/20'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                    }`}
                  >
                    {link.name}
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className={`absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white ring-2 ring-black ${
                        link.isCritical ? 'bg-red-500 animate-pulse' : 'bg-orange-500'
                      }`}>
                        {link.badge > 99 ? '99+' : link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - Profile & Notifications */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            <Link href="/doctor/profile" className="flex items-center space-x-3 rounded-xl px-3 py-2 transition-all hover:bg-zinc-800/50">
              <div className="h-9 w-9 rounded-full bg-linear-to-br from-teal-500 to-emerald-600 ring-2 ring-teal-500/20 flex items-center justify-center text-white font-semibold text-sm">
                {loading ? '...' : profile?.name ? profile.name.charAt(0).toUpperCase() : 'D'}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">
                  {loading ? 'Loading...' : profile?.name ? `Dr. ${profile.name}` : 'Doctor'}
                </p>
                <p className="text-xs text-zinc-500">
                  {loading ? '...' : profile?.degree || 'Medical Professional'}
                </p>
              </div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2.5 text-zinc-400 transition-all hover:bg-zinc-800/50 hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-800/50 bg-black/95 backdrop-blur-xl md:hidden">
          <div className="space-y-1 px-3 pb-4 pt-3">
            {/* Mobile Profile Section */}
            <Link 
              href="/doctor/profile" 
              className="flex items-center space-x-3 rounded-xl bg-zinc-800/30 px-4 py-3 mb-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="h-10 w-10 rounded-full bg-linear-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-semibold">
                {loading ? '...' : profile?.name ? profile.name.charAt(0).toUpperCase() : 'D'}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">
                  {loading ? 'Loading...' : profile?.name ? `Dr. ${profile.name}` : 'Doctor'}
                </p>
                <p className="text-xs text-zinc-500">
                  {loading ? '...' : profile?.degree || 'Medical Professional'}
                </p>
              </div>
            </Link>

            {doctorLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-all ${
                    isActive
                      ? 'bg-linear-to-r from-teal-500/20 to-emerald-500/20 text-teal-400 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/20'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{link.name}</span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className={`ml-2 flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold text-white ${
                      link.isCritical ? 'bg-red-500 animate-pulse' : 'bg-orange-500'
                    }`}>
                      {link.badge > 99 ? '99+' : link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
