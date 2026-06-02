"use client";
import { ClerkProvider, SignIn } from "@clerk/nextjs";

export default function UserSignIn() {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_USER}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <SignIn
          path="/user-sign-in"
          routing="path"
          signUpUrl="/user-sign-up"
          afterSignInUrl="/user/home"
          afterSignUpUrl="/user/home"
        />
      </div>
    </ClerkProvider>
  );
}
