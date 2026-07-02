"use client";
import { ClerkProvider, SignIn } from "@clerk/nextjs";

export default function DoctorSignInPage() {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DOCTOR}>
      <div className="flex justify-center items-center min-h-screen">
        <SignIn afterSignInUrl="/doctor/dashboard" />
      </div>
    </ClerkProvider>
  );
}
