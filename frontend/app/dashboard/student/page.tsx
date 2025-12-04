'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProfileDropdown from '../../../components/ProfileDropdown';

export default function StudentDashboard() {
    const [user, setUser] = useState<any>(null);
    const [parentSession, setParentSession] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const storedParent = localStorage.getItem('parentSession');
        if (storedParent) {
            setParentSession(JSON.parse(storedParent));
        }
    }, []);

    const handleBackToParent = () => {
        if (parentSession) {
            localStorage.setItem('user', JSON.stringify(parentSession));
            localStorage.removeItem('parentSession');
            window.location.href = '/dashboard/parent';
        }
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">Loading...</div>;

    return (
        <div className="min-h-screen bg-[var(--background)] font-sans">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="text-2xl">🌱</div>
                    <div className="text-xl font-bold text-gray-800 tracking-tight">EduPlatform</div>
                </div>
                <div className="flex items-center gap-6">
                    {parentSession && (
                        <button
                            onClick={handleBackToParent}
                            className="mr-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold hover:bg-indigo-200 transition"
                        >
                            ← Back to Parent Dashboard
                        </button>
                    )}
                    <Link href="/dashboard/student" className="text-[var(--primary)] font-semibold">Home</Link>
                    <Link href="#" className="text-gray-500 hover:text-[var(--primary)] transition">My Progress</Link>
                    <ProfileDropdown user={user} colorClass="bg-purple-100 text-purple-700 border-2 border-purple-200" />
                </div>
            </nav>

            <main className="max-w-5xl mx-auto p-6 md:p-8">
                {/* Welcome Banner */}
                <header className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-[2rem] p-8 md:p-12 text-white shadow-xl mb-10 overflow-hidden animate-fade-in-up">
                    <div className="relative z-10">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {user.name || 'Student'}! 🎉</h1>
                        <p className="text-blue-100 text-lg mb-8">Ready to learn something new today?</p>
                        <div className="flex gap-6">
                            <div className="bg-white/20 backdrop-blur-md rounded-xl px-5 py-3 border border-white/10">
                                <span className="block text-2xl font-bold">5</span>
                                <span className="text-sm text-blue-100">Day Streak 🔥</span>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md rounded-xl px-5 py-3 border border-white/10">
                                <span className="block text-2xl font-bold">12</span>
                                <span className="text-sm text-blue-100">Concepts Mastered 🏆</span>
                            </div>
                        </div>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="absolute bottom-0 right-20 w-32 h-32 bg-white/10 rounded-full -mb-10 blur-xl"></div>
                </header>

                {/* Continue Learning Card */}
                <section className="mb-12 animate-fade-in-up delay-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Continue Learning</h2>
                    <div className="group bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row justify-between items-center hover:shadow-xl hover:shadow-blue-100/50 transition duration-300 cursor-pointer">
                        <div className="mb-6 md:mb-0">
                            <div className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-1">Math • Class 4</div>
                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition">Fractions and Decimals</h3>
                            <p className="text-gray-500 mt-1">Next: Comparing Fractions</p>
                        </div>
                        <Link
                            href="/learn?sessionId=new"
                            className="px-8 py-3 bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-600 hover:shadow-xl hover:shadow-green-300 transition transform group-hover:scale-105"
                        >
                            Continue →
                        </Link>
                    </div>
                </section>

                {/* Subject Selection */}
                <section className="mb-12 animate-fade-in-up delay-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Your Subjects</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Math */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:shadow-blue-100/50 transition duration-300 group">
                            <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">📐</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Math</h3>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                            <Link href="/dashboard/student/math" className="block w-full py-2 text-center border-2 border-blue-100 text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition">
                                Start
                            </Link>
                        </div>
                        {/* Science */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:shadow-green-100/50 transition duration-300 group">
                            <div className="w-14 h-14 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">🔬</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Science</h3>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                            </div>
                            <Link href="/dashboard/student/science" className="block w-full py-2 text-center border-2 border-green-100 text-green-600 rounded-lg font-bold hover:bg-green-50 transition">
                                Start
                            </Link>
                        </div>
                        {/* Hindi */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:shadow-orange-100/50 transition duration-300 group">
                            <div className="w-14 h-14 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">📚</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Hindi</h3>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                            </div>
                            <Link href="/dashboard/student/hindi" className="block w-full py-2 text-center border-2 border-orange-100 text-orange-600 rounded-lg font-bold hover:bg-orange-50 transition">
                                Start
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Achievements */}
                <section className="animate-fade-in-up delay-300">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Achievements</h2>
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        <div className="flex-shrink-0 w-64 bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex items-center gap-3">
                            <div className="text-3xl">🏆</div>
                            <div>
                                <p className="font-bold text-yellow-900">First Concept</p>
                                <p className="text-xs text-yellow-700">Completed!</p>
                            </div>
                        </div>
                        <div className="flex-shrink-0 w-64 bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-center gap-3">
                            <div className="text-3xl">⚡</div>
                            <div>
                                <p className="font-bold text-purple-900">Speed Learner</p>
                                <p className="text-xs text-purple-700">3 concepts in 15m</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
