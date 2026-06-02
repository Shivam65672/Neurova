"use client";
import { ClerkProvider, SignUp } from "@clerk/nextjs";

export default function UserSignUp() {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_USER}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <SignUp
          path="/user-sign-up"
          routing="path"
          signInUrl="/user-sign-in"
          afterSignUpUrl="/user/home"
        />
      </div>
    </ClerkProvider>
  );
}
