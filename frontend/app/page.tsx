import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <main className="text-center px-4">
        <h1 className="text-5xl font-bold text-blue-900 mb-6">
          Welcome to EduPlatform
        </h1>
        <p className="text-xl text-gray-800 mb-12 max-w-2xl mx-auto font-medium">
          Your personalized adaptive learning journey starts here. Master concepts at your own pace with AI-powered guidance.
        </p>

        <div className="flex gap-6 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-blue-700 text-white rounded-lg font-bold hover:bg-blue-800 transition shadow-lg focus:ring-4 focus:ring-blue-300"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-8 py-3 bg-white text-blue-800 border-2 border-blue-700 rounded-lg font-bold hover:bg-blue-50 transition shadow-md focus:ring-4 focus:ring-blue-300"
          >
            Sign Up
          </Link>
        </div>
      </main>

      <footer className="absolute bottom-8 text-gray-700 text-sm font-medium">
        © 2024 EduPlatform. All rights reserved.
      </footer>
    </div>
  );
}
