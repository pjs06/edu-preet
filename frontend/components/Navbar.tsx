import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="text-2xl">🌱</div>
                    <Link href="/" className="text-xl font-bold text-gray-800 tracking-tight">EduPlatform</Link>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
                    <Link href="/" className="hover:text-[var(--primary)] transition duration-300">Home</Link>
                    <Link href="/features" className="hover:text-[var(--primary)] transition duration-300">Features</Link>
                    <Link href="/pricing" className="hover:text-[var(--primary)] transition duration-300">Pricing</Link>
                    <Link href="/contact" className="hover:text-[var(--primary)] transition duration-300">Contact</Link>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="px-6 py-2.5 rounded-full text-sm font-semibold text-gray-600 hover:text-[var(--primary)] hover:bg-[var(--secondary)]/30 transition duration-300"
                    >
                        Log in
                    </Link>
                    <Link
                        href="/signup"
                        className="px-6 py-2.5 rounded-full bg-[var(--primary)] text-white text-sm font-semibold hover:bg-[var(--primary-hover)] shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition transform hover:-translate-y-0.5 duration-300"
                    >
                        Start Free Trial
                    </Link>
                </div>
            </div>
        </nav>
    );
}
