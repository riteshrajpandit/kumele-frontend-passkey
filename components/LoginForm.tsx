"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, getPasskeyLoginOptions, verifyPasskeyLogin } from "@/lib/api";
import { base64UrlToBuffer, bufferToBase64Url, isWebAuthnSupported } from "@/lib/passkeyUtils";
import { Fingerprint, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    submit?: string;
    passkey?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeySupport, setPasskeySupport] = useState(false);
  
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Check if WebAuthn is supported in the current browser
    setPasskeySupport(isWebAuthnSupported());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
    } = {};
    
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    
    if (!formData.password) newErrors.password = "Password is required";
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await login({
        email: formData.email,
        password: formData.password
      });

      // Store user data in auth context
      authLogin(response);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.name}!`,
        variant: "success",
      });
      
      // Redirect based on next_step
      if (response.next_step === "welcome") {
        router.push("/dashboard");
      } else if (response.next_step === "hobbies") {
        router.push("/hobbies");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Login failed. Please check your credentials.";
      setErrors({ submit: errorMessage });
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setPasskeyLoading(true);
    setErrors({});
    
    try {
      // Step 1: Get authentication options
      const options = await getPasskeyLoginOptions();
      
      // Store the challenge_id for verification later
      const challengeId = options.challenge_id;
      
      // Convert base64url to ArrayBuffer for WebAuthn API
      const publicKeyOptions = {
        ...options,
        challenge: base64UrlToBuffer(options.challenge)
      };
      
      // Convert allowed credentials if any
      if (publicKeyOptions.allowCredentials && publicKeyOptions.allowCredentials.length > 0) {
        publicKeyOptions.allowCredentials = publicKeyOptions.allowCredentials.map((cred: any) => ({
          ...cred,
          id: base64UrlToBuffer(cred.id)
        }));
      }
      
      // Step 2: Get credential with browser WebAuthn API
      const credential = await navigator.credentials.get({
        publicKey: publicKeyOptions
      }) as PublicKeyCredential;
      
      // Step 3: Prepare for sending to server
      const assertionResponse = {
        id: credential.id,
        rawId: bufferToBase64Url(credential.rawId),
        response: {
          clientDataJSON: bufferToBase64Url(credential.response.clientDataJSON),
          authenticatorData: bufferToBase64Url(
            // @ts-ignore - TypeScript doesn't know about these properties
            credential.response.authenticatorData
          ),
          signature: bufferToBase64Url(
            // @ts-ignore
            credential.response.signature
          ),
          userHandle: credential.response.userHandle ?
            // @ts-ignore
            bufferToBase64Url(credential.response.userHandle) : null
        },
        type: credential.type
      };
      
      // Step 4: Verify with server
      const response = await verifyPasskeyLogin({
        assertion: assertionResponse,
        challenge_id: challengeId
      });
      
      // Store user data in auth context
      authLogin(response);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.name}!`,
        variant: "success",
      });
      
      // Navigate based on next step
      if (response.next_step === "welcome") {
        router.push("/dashboard");
      } else if (response.next_step === "hobbies") {
        router.push("/hobbies");
      } else {
        router.push("/dashboard");
      }
      
    } catch (error: any) {
      console.error("Passkey login error:", error);
      
      const errorMessage = error.message || "Passkey authentication failed. Please try again.";
      setErrors({
        passkey: errorMessage
      });
      
      toast({
        title: "Passkey Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setPasskeyLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-lg dark:bg-neutral-800 dark:border dark:border-neutral-700">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to your account</p>
      </div>

      {passkeySupport && (
        <button
          type="button"
          onClick={handlePasskeyLogin}
          disabled={passkeyLoading}
          className="flex items-center justify-center w-full mb-6 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {passkeyLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Authenticating...
            </span>
          ) : (
            <>
              <Fingerprint className="mr-2 h-5 w-5" />
              Sign in with Passkey
            </>
          )}
        </button>
      )}
      
      {errors.passkey && (
        <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-start">
          <AlertCircle size={18} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-red-700 dark:text-red-400 text-sm">{errors.passkey}</div>
        </div>
      )}

      <div className="relative flex py-4 items-center">
        <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
        <span className="flex-shrink mx-3 text-gray-500 dark:text-gray-400 text-sm">or continue with email</span>
        <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-10 py-3 px-4 border ${
                errors.email ? "border-red-500 dark:border-red-700" : "border-gray-300 dark:border-gray-700"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900 dark:text-gray-100`}
              aria-invalid={errors.email ? "true" : "false"}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-10 py-3 px-4 border ${
                errors.password ? "border-red-500 dark:border-red-700" : "border-gray-300 dark:border-gray-700"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900 dark:text-gray-100`}
              aria-invalid={errors.password ? "true" : "false"}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-700 dark:bg-neutral-800"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Forgot your password?
            </a>
          </div>
        </div>

        {errors.submit && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-start">
            <AlertCircle size={18} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-red-700 dark:text-red-400 text-sm">{errors.submit}</div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{" "}
        <a
          href="/signup"
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          Sign up
        </a>
      </p>
    </div>
  );
}