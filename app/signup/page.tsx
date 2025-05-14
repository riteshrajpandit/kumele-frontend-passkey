"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RegistrationForm from "@/components/RegistrationForm";
import GoogleOAuthButton from "@/components/GoogleOAuthButton";
import { useAuth } from "@/context/AuthContext";
import { KeyRound } from "lucide-react";

export default function SignupPage() {
  const { user } = useAuth();
  const router = useRouter();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-6 bg-white shadow-sm dark:bg-neutral-800 dark:border-b dark:border-neutral-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <KeyRound size={24} className="text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">SecureAuth</span>
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <RegistrationForm />
          
          <div className="mt-6">
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
              <span className="flex-shrink mx-3 text-gray-500 dark:text-gray-400 text-sm">or sign up with</span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            
            <GoogleOAuthButton onSuccess={(response) => {
              // If we need additional info like DOB, gender, etc., redirect to capture
              if (
                response.dob === "" ||
                response.gender === "" ||
                response.above_legal_age === false ||
                response.terms_and_conditions === false
              ) {
                router.push("/additional-details");
              } else if (response.next_step === "hobbies") {
                router.push("/hobbies");
              } else {
                router.push("/dashboard");
              }
            }} />
          </div>
        </div>
      </main>
    </div>
  );
}