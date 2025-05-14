import Link from 'next/link';
import { Fingerprint, Shield, KeyRound } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with navigation */}
      <header className="w-full py-4 px-6 bg-white shadow-sm dark:bg-neutral-800 dark:border-b dark:border-neutral-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <KeyRound size={24} className="text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">SecureAuth</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Login
            </Link>
            <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero section */}
      <section className="flex-grow flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24 md:px-12 lg:px-16 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              Modern Authentication for the Modern Web
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Experience the future of authentication with passkeys, OAuth, and traditional login methods all in one secure platform.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/signup" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-base font-medium transition-colors">
                Get Started
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg text-base font-medium transition-colors dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-700">
                Sign In
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 lg:pl-12">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden dark:bg-neutral-800">
              {/* Mock login form image or illustration */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="flex justify-center">
                  <Shield size={64} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="mt-6 space-y-4">
                  <div className="h-10 bg-white rounded-md shadow-sm dark:bg-neutral-700"></div>
                  <div className="h-10 bg-white rounded-md shadow-sm dark:bg-neutral-700"></div>
                  <div className="h-12 bg-blue-600 rounded-md shadow-sm"></div>
                  <div className="flex justify-center">
                    <div className="h-10 w-10 bg-white rounded-full shadow-sm dark:bg-neutral-700 flex items-center justify-center">
                      <Fingerprint size={24} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="bg-gray-100 dark:bg-neutral-800 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Modern Authentication Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md dark:bg-neutral-700">
              <Fingerprint size={32} className="mb-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Passkey Support</h3>
              <p className="text-gray-600 dark:text-gray-300">Authenticate securely using your device's biometrics or PIN without passwords.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md dark:bg-neutral-700">
              <svg className="w-8 h-8 mb-4 text-blue-600" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">OAuth Integration</h3>
              <p className="text-gray-600 dark:text-gray-300">Sign in quickly and securely with your existing Google account.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md dark:bg-neutral-700">
              <Shield size={32} className="mb-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Enhanced Security</h3>
              <p className="text-gray-600 dark:text-gray-300">Multiple authentication options with comprehensive error handling and debugging tools.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-neutral-800 dark:border-t dark:border-neutral-700 py-8">
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