'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePatientProfile } from '@/hooks/usePatientProfile';

export default function UserNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { profile, loading } = usePatientProfile();

  const patientLinks = [
    { name: 'Dashboard', href: '/patient/dashboard' },
    { name: 'BP Tracker', href: '/patient/bp-tracker' },
    { name: 'Medical History', href: '/patient/medical-history' },
    { name: 'Medications', href: '/patient/medications' },
    { name: 'Family Circle', href: '/patient/family-circle' },
    { name: 'OCR Scan', href: '/patient/ocr' },
    { name: 'Profile', href: '/patient/profile' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-black/80 backdrop-blur-xl supports-backdrop-filter:bg-black/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-3 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-teal-600 shadow-lg shadow-cyan-500/25 transition-all group-hover:shadow-cyan-500/40 group-hover:scale-105">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">Neurova</span>
                <span className="ml-2 rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-medium text-cyan-400 ring-1 ring-cyan-500/30">
                  Patient Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              {patientLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`group rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-linear-to-r from-cyan-500/20 to-teal-500/20 text-cyan-400 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/20'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - Profile & Notifications */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            <Link href="/patient/profile" className="flex items-center space-x-3 rounded-xl px-3 py-2 transition-all hover:bg-zinc-800/50">
              <div className="h-9 w-9 rounded-full bg-linear-to-br from-cyan-500 to-teal-600 ring-2 ring-cyan-500/20 flex items-center justify-center text-white font-semibold text-sm">
                {loading ? '...' : profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">
                  {loading ? 'Loading...' : profile?.name || 'User'}
                </p>
                <p className="text-xs text-zinc-500">Patient</p>
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
              href="/patient/profile" 
              className="flex items-center space-x-3 rounded-xl bg-zinc-800/30 px-4 py-3 mb-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="h-10 w-10 rounded-full bg-linear-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white font-semibold">
                {loading ? '...' : profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">
                  {loading ? 'Loading...' : profile?.name || 'User'}
                </p>
                <p className="text-xs text-zinc-500">Patient</p>
              </div>
            </Link>

            {patientLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center rounded-xl px-4 py-3 text-base font-medium transition-all ${
                    isActive
                      ? 'bg-linear-to-r from-cyan-500/20 to-teal-500/20 text-cyan-400 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/20'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
