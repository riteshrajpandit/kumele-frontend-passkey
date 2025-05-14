"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Settings, LogOut, Search, Users, User, KeyRound, Fingerprint } from "lucide-react";
import PasskeyRegistration from "@/components/PasskeyRegistration";
import { searchUsers, followUser } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchError, setSearchError] = useState("");
  const [followingStatus, setFollowingStatus] = useState<{[key: string]: string}>({});
  const [showPasskeyRegistration, setShowPasskeyRegistration] = useState(false);

  // If not logged in, redirect to login
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSearchError("");
    setSearchResults([]);

    if (query.length > 0) {
      try {
        const results = await searchUsers(query, user?.user_token || "");
        setSearchResults(results);
      } catch (error: any) {
        setSearchError(error.message || "Failed to fetch search results");
      }
    }
  };

  const handleFollow = async (username: string) => {
    try {
      if (!user?.user_token) {
        throw new Error("You must be logged in to follow users");
      }
      
      await followUser(username, user.user_token);
      
      setFollowingStatus((prev) => ({
        ...prev,
        [username]: "Following",
      }));
      
      toast({
        title: "Success",
        description: `You are now following ${username}`,
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Follow Failed",
        description: error.message || "Failed to follow user",
        variant: "destructive",
      });
    }
  };

  const togglePasskeyRegistration = () => {
    setShowPasskeyRegistration(!showPasskeyRegistration);
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

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
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <button
              onClick={() => logout()}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <LogOut size={20} />
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          {/* Search results */}
          {searchQuery && (
            <div className="mb-8 bg-white rounded-lg shadow-md p-4 dark:bg-neutral-800">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Search Results</h2>
              {searchError ? (
                <p className="text-red-500 dark:text-red-400">{searchError}</p>
              ) : searchResults.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No users found</p>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <div key={user.display_name} className="flex items-center justify-between border-b pb-3 border-gray-200 dark:border-neutral-700">
                      <div className="flex items-center">
                        <img
                          src={user.picture_url || "https://via.placeholder.com/40"}
                          alt={user.display_name}
                          className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.display_name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                        </div>
                      </div>
                      <button
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          followingStatus[user.display_name] === "Following"
                            ? "bg-gray-200 text-gray-800 dark:bg-neutral-700 dark:text-gray-300"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                        onClick={() => handleFollow(user.display_name)}
                        disabled={followingStatus[user.display_name] === "Following"}
                      >
                        {followingStatus[user.display_name] === "Following" ? "Following" : "Follow"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* User profile section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-neutral-800">
            <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <div className="px-6 py-4 sm:px-8 sm:py-6">
              <div className="flex flex-col sm:flex-row sm:items-end -mt-16">
                <div className="inline-block h-24 w-24 rounded-full ring-4 ring-white overflow-hidden dark:ring-neutral-800">
                  <img
                    src={user.picture_url || "https://via.placeholder.com/96"}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-4 flex-grow">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                  <p className="text-gray-600 dark:text-gray-400">@{user.username || "username"}</p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <button
                    onClick={togglePasskeyRegistration}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-neutral-700 dark:text-white dark:border-neutral-600 dark:hover:bg-neutral-600"
                  >
                    <Fingerprint size={16} className="mr-2" />
                    {showPasskeyRegistration ? "Hide Passkey Setup" : "Add Passkey"}
                  </button>
                </div>
              </div>

              {/* User details */}
              <div className="mt-6 border-t border-gray-200 pt-6 dark:border-neutral-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h2>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-gray-900 dark:text-white">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                        <p className="text-gray-900 dark:text-white">{user.dob || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                        <p className="text-gray-900 dark:text-white">{user.gender || "Not provided"}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connections</h2>
                    <div className="flex space-x-4 mb-4">
                      <Link href="/followers" className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-neutral-700 dark:text-white dark:border-neutral-600 dark:hover:bg-neutral-600">
                        <Users size={16} className="mr-2" />
                        View Followers/Following
                      </Link>
                    </div>
                    
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Referral</h2>
                    <div className="bg-gray-50 p-3 rounded-md dark:bg-neutral-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Your Referral Code</p>
                      <div className="flex items-center mt-1">
                        <span className="font-mono text-lg text-gray-900 dark:text-white">{user.referral_code}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(user.referral_code);
                            toast({
                              title: "Copied!",
                              description: "Referral code copied to clipboard",
                            });
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Passkey registration section */}
              {showPasskeyRegistration && (
                <div className="mt-6 border-t border-gray-200 pt-6 dark:border-neutral-700">
                  <PasskeyRegistration 
                    email={user.email} 
                    userToken={user.user_token} 
                    onSuccess={() => setShowPasskeyRegistration(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-neutral-800 dark:border-t dark:border-neutral-700 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <KeyRound size={20} className="text-blue-600 dark:text-blue-400" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">SecureAuth</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} SecureAuth. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}