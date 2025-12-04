import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-[var(--secondary)] selection:text-[var(--primary)]">
            <Navbar />

            <main className="pt-32 pb-24">
                {/* Hero Section */}
                <section className="px-6 mb-24 text-center">
                    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-bold tracking-wide uppercase">
                            Platform Features
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
                            Everything you need to <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">master any subject.</span>
                        </h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                            Our platform combines advanced AI with proven pedagogical methods to create a learning experience that truly works.
                        </p>
                    </div>
                </section>

                {/* Feature 1: Adaptive Learning */}
                <section className="px-6 py-12">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1 space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-3xl">
                                🧠
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900">AI-Powered Adaptive Learning</h2>
                            <p className="text-lg text-gray-500 leading-relaxed">
                                No two students learn the same way. Our AI analyzes your child's performance in real-time to adjust the difficulty and style of questions.
                            </p>
                            <ul className="space-y-3">
                                {['Real-time difficulty adjustment', 'Personalized learning paths', 'Gap analysis and remediation'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                                        <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xs">✓</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="order-1 md:order-2 bg-blue-50 rounded-[3rem] h-[400px] w-full animate-float">
                            {/* Placeholder for image */}
                            <div className="w-full h-full flex items-center justify-center text-blue-200 text-9xl font-bold opacity-20">AI</div>
                        </div>
                    </div>
                </section>

                {/* Feature 2: Gamification */}
                <section className="px-6 py-24 bg-white">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                        <div className="bg-orange-50 rounded-[3rem] h-[400px] w-full animate-float-delayed">
                            {/* Placeholder for image */}
                            <div className="w-full h-full flex items-center justify-center text-orange-200 text-9xl font-bold opacity-20">XP</div>
                        </div>
                        <div className="space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-3xl">
                                🏆
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900">Gamified Progress</h2>
                            <p className="text-lg text-gray-500 leading-relaxed">
                                Learning shouldn't be boring. We use game mechanics to keep students motivated and engaged with their studies.
                            </p>
                            <ul className="space-y-3">
                                {['Earn XP and badges', 'Daily streaks and challenges', 'Leaderboards (optional)'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                                        <span className="w-6 h-6 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center text-xs">✓</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Feature 3: Parent Dashboard */}
                <section className="px-6 py-12">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1 space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center text-3xl">
                                📊
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900">Insightful Parent Dashboard</h2>
                            <p className="text-lg text-gray-500 leading-relaxed">
                                Stay in the loop without hovering. Get detailed reports on your child's progress, strengths, and areas for improvement.
                            </p>
                            <ul className="space-y-3">
                                {['Weekly progress reports', 'Time spent tracking', 'Curriculum coverage analysis'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                                        <span className="w-6 h-6 rounded-full bg-green-50 text-green-500 flex items-center justify-center text-xs">✓</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="order-1 md:order-2 bg-green-50 rounded-[3rem] h-[400px] w-full animate-float">
                            {/* Placeholder for image */}
                            <div className="w-full h-full flex items-center justify-center text-green-200 text-9xl font-bold opacity-20">📊</div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="px-6 py-24">
                    <div className="max-w-4xl mx-auto bg-[var(--primary)] rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl shadow-orange-200 relative overflow-hidden">
                        <div className="relative z-10 space-y-8">
                            <h2 className="text-4xl font-bold">Ready to see it in action?</h2>
                            <p className="text-orange-100 text-lg">Join thousands of happy parents and students today.</p>
                            <Link href="/signup" className="inline-block px-10 py-4 bg-white text-[var(--primary)] font-bold rounded-full hover:bg-gray-50 transition transform hover:-translate-y-1 shadow-lg">
                                Start Free Trial
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
