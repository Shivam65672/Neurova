"use client";
import { ClerkProvider, SignUp } from "@clerk/nextjs";

export default function DoctorSignUp() {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DOCTOR}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <SignUp
          path="/doctor-sign-up"
          routing="path"
          signInUrl="/doctor-sign-in"
          afterSignUpUrl="/doctor/dashboard"
        />
      </div>
    </ClerkProvider>
  );
}
