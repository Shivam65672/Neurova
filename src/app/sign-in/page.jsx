"use client";
import { useRouter } from "next/navigation";

export default function SignInSelect() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-semibold mb-8">Sign in as</h1>
      <div className="flex gap-6">
        <button
          onClick={() => router.push("/sign-in/user")}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
        >
          User
        </button>
        <button
          onClick={() => router.push("/sign-in/doctor")}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
        >
          Doctor
        </button>
      </div>
    </div>
  );
}
