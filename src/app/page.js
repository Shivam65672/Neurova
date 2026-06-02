'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handlePatientPortalClick = () => {
    router.push('/sign-in/user');
  };

  const handleDoctorPortalClick = () => {
    router.push('/sign-in/doctor');
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col">
      {/* Subtle Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>
      
      {/* Minimal accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-500/20 to-transparent"></div>

      {/* Main Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-24">
        {/* Logo/Brand Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 ring-1 ring-zinc-800">
              <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight mb-4">
            Synapse
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 font-light tracking-wide">
            Intelligent Healthcare Management
          </p>
        </div>

        {/* Portal Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <button
            onClick={handlePatientPortalClick}
            className="group relative px-8 py-4 bg-white text-black font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20"
          >
            <span className="relative z-10">Patient Portal</span>
            <div className="absolute inset-0 bg-linear-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <button
            onClick={handleDoctorPortalClick}
            className="group relative px-8 py-4 bg-zinc-900 text-white font-semibold rounded-lg ring-1 ring-zinc-800 overflow-hidden transition-all duration-300 hover:scale-105 hover:ring-zinc-700"
          >
            <span className="relative z-10">Doctor Portal</span>
            <div className="absolute inset-0 bg-linear-to-r from-zinc-800/0 via-zinc-800/50 to-zinc-800/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Key Features - Minimalist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full mb-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-zinc-900 ring-1 ring-zinc-800 mb-4">
              <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">BP Monitoring</h3>
            <p className="text-sm text-zinc-500">Continuous tracking & insights</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-zinc-900 ring-1 ring-zinc-800 mb-4">
              <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">AI Recommendations</h3>
            <p className="text-sm text-zinc-500">Personalized medication plans</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-zinc-900 ring-1 ring-zinc-800 mb-4">
              <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Doctor Verified</h3>
            <p className="text-sm text-zinc-500">Professional supervision</p>
          </div>
        </div>
      </div>

      {/* Footer Credits */}
      <div className="relative border-t border-zinc-900 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-zinc-500 text-sm mb-1">Built at</p>
              <p className="text-white text-lg font-semibold tracking-wide">
                CodeUtsava <span className="text-cyan-400">9.0</span>
              </p>
            </div>
            <div className="h-px w-12 bg-zinc-800 hidden md:block"></div>
            <div className="text-center md:text-right">
              <p className="text-zinc-500 text-sm mb-1">Created by</p>
              <p className="text-white text-lg font-semibold">Team <span className="text-cyan-400">Always Last</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-500/20 to-transparent"></div>
    </div>
  );
}
