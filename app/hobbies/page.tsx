"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchHobbies, selectHobbies } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Loader2 } from "lucide-react";

interface Hobby {
  id: number;
  name: string;
  icon: string;
}

export default function HobbiesPage() {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Fetch hobbies on component mount
  useEffect(() => {
    const getHobbies = async () => {
      try {
        const hobbiesData = await fetchHobbies();
        setHobbies(hobbiesData);
      } catch (error: any) {
        setError(error.message || "Failed to fetch hobbies");
      } finally {
        setIsLoading(false);
      }
    };

    getHobbies();
  }, []);

  const toggleHobby = (hobbyId: number) => {
    setSelectedHobbies((prev) => {
      if (prev.includes(hobbyId)) {
        return prev.filter((id) => id !== hobbyId);
      } else {
        return [...prev, hobbyId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedHobbies.length === 0) {
      toast({
        title: "Selection required",
        description: "Please select at least one hobby",
        variant: "destructive",
      });
      return;
    }
    
    if (!user?.user_token) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      const response = await selectHobbies({ hobby_ids: selectedHobbies }, user.user_token);
      
      // Update user with new hobby data
      updateUser({
        hobbies: response.hobbies,
        next_step: "welcome",
      });
      
      toast({
        title: "Hobbies saved",
        description: "Your preferences have been saved successfully",
        variant: "success",
      });
      
      router.push("/dashboard");
    } catch (error: any) {
      setError(error.message || "Failed to save hobbies");
      toast({
        title: "Error",
        description: error.message || "Failed to save hobbies",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-6 bg-white shadow-sm dark:bg-neutral-800 dark:border-b dark:border-neutral-700">
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="flex items-center space-x-2">
            <KeyRound size={24} className="text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">SecureAuth</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 dark:bg-neutral-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select Your Interests</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Choose hobbies and interests to help us personalize your experience.
          </p>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                {hobbies.map((hobby) => (
                  <div
                    key={hobby.id}
                    className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-colors ${
                      selectedHobbies.includes(hobby.id)
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600"
                        : "border-gray-200 hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-700"
                    }`}
                    onClick={() => toggleHobby(hobby.id)}
                  >
                    <div
                      className={`w-12 h-12 flex items-center justify-center rounded-full mb-2 ${
                        selectedHobbies.includes(hobby.id)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-500 dark:bg-neutral-700 dark:text-gray-300"
                      }`}
                    >
                      {/* Simple emoji representation - in a real app, you'd use proper icons */}
                      {hobby.icon || "🏄‍♂️"}
                    </div>
                    <span className={`text-sm font-medium ${
                      selectedHobbies.includes(hobby.id)
                        ? "text-blue-700 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}>
                      {hobby.name}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || selectedHobbies.length === 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Saving...
                    </span>
                  ) : (
                    "Save Interests"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}