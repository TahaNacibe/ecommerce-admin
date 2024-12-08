"use client"
import { useRouter } from 'next/navigation';
import { ArrowRight, LogIn } from 'lucide-react';

const UnauthenticatedPage = () => {
  const router = useRouter();

  const handleRedirect = () => {
    router.push('/');
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl bg-white p-8 md:p-12 rounded-2xl shadow-xl">
        {/* Illustration */}
        <div className="flex justify-center items-center">
          <img
            src="/server_down.svg"
            alt="Unauthenticated Illustration"
            className="max-w-xs w-full"
          />
        </div>

        {/* Content */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Oops! Unauthorized Access</h1>
            <p className="text-xl text-gray-700 mt-2">
              It looks like you're not authorized to access this page.
            </p>
          </div>
          <p className="text-gray-600">
            Please log in to continue. Once you're authenticated, you'll be able to access all the
            features and content on our platform.
          </p>
          <button
            onClick={handleRedirect}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center transition-colors duration-200"
          >
            <LogIn className="w-5 h-5 mr-2" />
            <span>Go to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthenticatedPage;