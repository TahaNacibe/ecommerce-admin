"use client"
import { Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NotFoundPage() {
  const route = usePathname();
  const formattedRoute = route.replace("/", "");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Content Section */}
          <div className="space-y-6 md:order-1 order-2">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gray-900">
                404 - Page Not Found
              </h1>
              <p className="text-xl text-gray-600">
                Oops! We couldn't find what you're looking for.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-600">
                The page named{" "}
                <code className="bg-gray-100 px-2 py-1 rounded text-pink-600">
                  {formattedRoute}
                </code>{" "}
                doesn't exist.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
              <button 
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </button>
            </div>
          </div>

          {/* Illustration Section */}
          <div className="md:order-2 order-1">
            <img
              src="/404_error.svg"
              alt="404 Error Illustration"
              className="w-full max-w-md mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}