"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { googleSignIn } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Mock for the Google OAuth API to avoid including a client library
// In production, you would load the real Google library
interface GoogleAuth {
  signIn: () => Promise<{ credential: string }>;
}

interface GoogleButtonProps {
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
}

export default function GoogleOAuthButton({ onSuccess, onError }: GoogleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  // In a real implementation, you would load the Google script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // This is a mock implementation
      // In production, you would use the actual Google OAuth API
      const response = { credential: "mock_credential" }; 
      
      // Send the credential to your backend
      const authResponse = await googleSignIn({
        auth_token: response.credential,
      });
      
      // Save user data
      login(authResponse);
      
      toast({
        title: "Google Sign-In successful",
        description: `Welcome, ${authResponse.name}!`,
        variant: "success",
      });
      
      // If onSuccess callback is provided, call it
      if (onSuccess) {
        onSuccess(authResponse);
      } else {
        // Otherwise, navigate based on next_step
        if (authResponse.next_step === "welcome") {
          router.push("/dashboard");
        } else if (authResponse.next_step === "hobbies") {
          router.push("/hobbies");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Google Sign-In error:", error);
      
      toast({
        title: "Sign-In Failed",
        description: error.message || "Google Sign-In failed. Please try again.",
        variant: "destructive",
      });
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isLoading || !isScriptLoaded}
      className="flex items-center justify-center w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium transition-colors hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Signing in...
        </span>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          Continue with Google
        </>
      )}
    </button>
  );
}