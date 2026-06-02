'use client';
import { ClerkProvider } from '@clerk/nextjs';

export default function DoctorLayout({ children }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DOCTOR}>
      <div className="min-h-screen bg-black text-white">
        {children}
      </div>
    </ClerkProvider>
  );
}
