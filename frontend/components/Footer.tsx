import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-white py-12 px-6 border-t border-gray-50">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition">
                    <span className="text-2xl">🌱</span>
                    <span className="text-lg font-bold text-gray-900">EduPlatform</span>
                </div>
                <div className="flex gap-8 text-gray-400 text-sm font-medium">
                    <Link href="#" className="hover:text-gray-900 transition">Privacy</Link>
                    <Link href="#" className="hover:text-gray-900 transition">Terms</Link>
                    <Link href="#" className="hover:text-gray-900 transition">Support</Link>
                </div>
                <div className="text-gray-300 text-sm">
                    © 2024 EduPlatform Inc.
                </div>
            </div>
        </footer>
    );
}
