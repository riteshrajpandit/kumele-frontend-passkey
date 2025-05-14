"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, verifyEmail } from "@/lib/api";
import { Mail, User, Calendar, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirm_password: "",
    name: "",
    gender: "",
    date_of_birth: "",
    above_legal_age: false,
    terms_and_conditions: false,
    subscribe_to_newsletter: false
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"registration" | "verification">("registration");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    // Confirm password
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }
    
    // Date of birth validation
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
    }
    
    // Legal age confirmation
    if (!formData.above_legal_age) {
      newErrors.above_legal_age = "You must confirm you are above the legal age";
    }
    
    // Terms and conditions
    if (!formData.terms_and_conditions) {
      newErrors.terms_and_conditions = "You must accept the terms and conditions";
    }
    
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
      await signUp(formData);
      
      toast({
        title: "Registration successful",
        description: "Please check your email for the verification code.",
        variant: "success",
      });
      
      setStep("verification");
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Handle API error responses
      if (error.response?.data) {
        const apiErrors: {[key: string]: string[]} = error.response.data;
        const formattedErrors: {[key: string]: string} = {};
        
        // Convert API error format to our format
        Object.keys(apiErrors).forEach(key => {
          formattedErrors[key] = Array.isArray(apiErrors[key]) 
            ? apiErrors[key].join(", ") 
            : String(apiErrors[key]);
        });
        
        setErrors(formattedErrors);
      } else {
        setErrors({
          submit: error.message || "Registration failed. Please try again."
        });
        
        toast({
          title: "Registration Failed",
          description: error.message || "Registration failed. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError("");
    setVerificationLoading(true);
    
    if (!verificationCode) {
      setVerificationError("Verification code is required");
      setVerificationLoading(false);
      return;
    }
    
    try {
      const response = await verifyEmail({
        email: formData.email,
        code: verificationCode
      });
      
      // Save auth data
      login(response);
      
      toast({
        title: "Verification successful",
        description: "Your account has been verified successfully!",
        variant: "success",
      });
      
      // Route based on next step
      if (response.next_step === "hobbies") {
        router.push("/hobbies");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      setVerificationError(error.message || "Verification failed. Please try again.");
      
      toast({
        title: "Verification Failed",
        description: error.message || "Verification failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerificationLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-lg dark:bg-neutral-800 dark:border dark:border-neutral-700">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {step === "registration" ? "Create your account" : "Verify your email"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {step === "registration" 
            ? "Fill in the form to get started" 
            : `We've sent a verification code to ${formData.email}`}
        </p>
      </div>

      {step === "registration" ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
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

          {/* Name field */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full pl-10 py-3 px-4 border ${
                  errors.name ? "border-red-500 dark:border-red-700" : "border-gray-300 dark:border-gray-700"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900 dark:text-gray-100`}
                aria-invalid={errors.name ? "true" : "false"}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Gender selection */}
          <div>
            <select
              name="gender"
              id="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full py-3 px-4 border ${
                errors.gender ? "border-red-500 dark:border-red-700" : "border-gray-300 dark:border-gray-700"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900 dark:text-gray-100`}
              aria-invalid={errors.gender ? "true" : "false"}
            >
              <option value="" disabled>Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gender}</p>
            )}
          </div>

          {/* Date of birth */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                name="date_of_birth"
                id="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className={`w-full pl-10 py-3 px-4 border ${
                  errors.date_of_birth ? "border-red-500 dark:border-red-700" : "border-gray-300 dark:border-gray-700"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900 dark:text-gray-100`}
                aria-invalid={errors.date_of_birth ? "true" : "false"}
              />
            </div>
            {errors.date_of_birth && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date_of_birth}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Password (min 8 characters)"
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

          {/* Confirm password field */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="confirm_password"
                id="confirm_password"
                placeholder="Confirm password"
                value={formData.confirm_password}
                onChange={handleChange}
                className={`w-full pl-10 py-3 px-4 border ${
                  errors.confirm_password ? "border-red-500 dark:border-red-700" : "border-gray-300 dark:border-gray-700"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900 dark:text-gray-100`}
                aria-invalid={errors.confirm_password ? "true" : "false"}
              />
            </div>
            {errors.confirm_password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirm_password}</p>
            )}
          </div>

          {/* Checkboxes for terms and legal age */}
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="above_legal_age"
                  name="above_legal_age"
                  type="checkbox"
                  checked={formData.above_legal_age}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-700 dark:bg-neutral-800"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="above_legal_age" className="font-medium text-gray-700 dark:text-gray-300">
                  I confirm that I am above the legal age
                </label>
                {errors.above_legal_age && (
                  <p className="text-red-600 dark:text-red-400">{errors.above_legal_age}</p>
                )}
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms_and_conditions"
                  name="terms_and_conditions"
                  type="checkbox"
                  checked={formData.terms_and_conditions}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-700 dark:bg-neutral-800"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms_and_conditions" className="font-medium text-gray-700 dark:text-gray-300">
                  I agree to the <a href="#" className="text-blue-600 hover:underline dark:text-blue-400">Terms and Conditions</a>
                </label>
                {errors.terms_and_conditions && (
                  <p className="text-red-600 dark:text-red-400">{errors.terms_and_conditions}</p>
                )}
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="subscribe_to_newsletter"
                  name="subscribe_to_newsletter"
                  type="checkbox"
                  checked={formData.subscribe_to_newsletter}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-700 dark:bg-neutral-800"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="subscribe_to_newsletter" className="font-medium text-gray-700 dark:text-gray-300">
                  Subscribe to newsletter
                </label>
              </div>
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
                Creating account...
              </span>
            ) : (
              "Create account"
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerificationSubmit} className="space-y-5">
          <div>
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-500 mb-4">
                <Mail className="h-8 w-8" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Enter the 6-digit code sent to your email
              </p>
            </div>
            
            <input
              type="text"
              name="verificationCode"
              id="verificationCode"
              placeholder="Verification code"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value);
                if (verificationError) setVerificationError("");
              }}
              className={`w-full py-3 px-4 border ${
                verificationError ? "border-red-500 dark:border-red-700" : "border-gray-300 dark:border-gray-700"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900 dark:text-gray-100 text-center tracking-widest text-lg`}
              aria-invalid={verificationError ? "true" : "false"}
              maxLength={6}
            />
            
            {verificationError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">{verificationError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={verificationLoading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {verificationLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify email"
            )}
          </button>
          
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Didn't receive the code?{" "}
            <button
              type="button"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              onClick={() => {
                toast({
                  title: "Resend code requested",
                  description: "Please check your email for a new verification code.",
                  variant: "default",
                });
              }}
            >
              Resend
            </button>
          </p>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        {step === "registration" ? (
          <>
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Sign in
            </a>
          </>
        ) : (
          <>
            <button
              type="button"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              onClick={() => setStep("registration")}
            >
              Back to registration
            </button>
          </>
        )}
      </p>
    </div>
  );
}