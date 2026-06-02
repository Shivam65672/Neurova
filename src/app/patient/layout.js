import { ClerkProvider } from "@clerk/nextjs";

export default function PatientLayout({ children }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_USER}>
      <div className="min-h-screen bg-black text-white">
        {children}
      </div>
    </ClerkProvider>
  );
}
