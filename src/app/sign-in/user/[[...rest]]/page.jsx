"use client";
import { ClerkProvider, SignIn } from "@clerk/nextjs";

export default function UserSignInPage() {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_USER}>
      <div className="flex justify-center items-center min-h-screen">
        <SignIn afterSignInUrl="/patient/dashboard" />
      </div>
    </ClerkProvider>
  );
}
