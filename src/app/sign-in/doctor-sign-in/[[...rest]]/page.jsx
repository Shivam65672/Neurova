"use client";
import { ClerkProvider, SignIn } from "@clerk/nextjs";

export default function DoctorSignIn() {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DOCTOR}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <SignIn
          path="/doctor-sign-in"
          routing="path"
          signUpUrl="/doctor-sign-up"
          afterSignInUrl="/doctor/dashboard"
          afterSignUpUrl="/doctor/dashboard"
        />
      </div>
    </ClerkProvider>
  );
}
