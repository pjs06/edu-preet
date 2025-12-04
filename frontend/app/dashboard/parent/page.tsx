'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProfileDropdown from '../../../components/ProfileDropdown';

export default function ParentDashboard() {
    const [user, setUser] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await fetch('http://localhost:5001/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();

                if (res.ok) {
                    setUser(data.user);
                    // Update localStorage to keep it fresh
                    localStorage.setItem('user', JSON.stringify(data.user));

                    if (data.user.role === 'parent') {
                        fetchStudents(data.user.parentId);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch user session', err);
            }
        };

        fetchUser();
    }, []);

    const fetchStudents = async (parentId: string) => {
        console.log('Fetching students for parentId:', parentId);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5001/api/students/${parentId}/list`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            console.log('Students API response:', data);
            if (res.ok) {
                setStudents(data.students);
            } else {
                console.error('Failed to fetch students:', data.error);
            }
        } catch (err) {
            console.error("Failed to fetch students", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartSession = (student: any) => {
        // Create a user object that mimics the student login response
        const studentUser = {
            id: student.id, // This is the student profile ID
            name: student.name,
            role: 'student',
            grade: student.grade,
            language: student.language,
            email: student.email // From the joined query
        };

        // Backup parent session
        localStorage.setItem('parentSession', JSON.stringify(user));

        // Switch user context in localStorage
        localStorage.setItem('user', JSON.stringify(studentUser));

        // Redirect to student dashboard
        // We keep the same token (Parent's token) which is valid for API calls
        // The backend currently trusts the studentId sent in requests
        window.location.href = '/dashboard/student';
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
                    <Link href="/dashboard/parent" className="text-[var(--primary)] font-semibold">Home</Link>
                    <Link href="#" className="text-gray-500 hover:text-[var(--primary)] transition">My Children</Link>
                    <Link href="#" className="text-gray-500 hover:text-[var(--primary)] transition">Subscription</Link>
                    <ProfileDropdown user={user} />
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 md:p-8">
                {/* Welcome Section */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in-up">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Hello, {user.name || 'Parent'}! 👋</h1>
                        <p className="text-gray-500 mt-1 text-lg">Here's how your children are doing today.</p>
                    </div>
                    <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-semibold border border-green-100">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        Subscription Active • Expires Dec 15, 2025
                    </div>
                </header>

                {/* Children Cards */}
                <section className="grid md:grid-cols-2 gap-8 mb-12">
                    {loading ? (
                        <p className="text-gray-500">Loading students...</p>
                    ) : students.length === 0 ? (
                        <div className="col-span-full text-center py-16 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                            <div className="text-4xl mb-4">👶</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No children added yet</h3>
                            <p className="text-gray-500 mb-6">Add your child's profile to start their learning journey.</p>
                            <Link href="/dashboard/parent/add-student" className="inline-flex items-center px-6 py-3 bg-[var(--primary)] text-white rounded-full font-bold shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 hover:bg-[var(--primary-hover)] transition transform hover:-translate-y-0.5">
                                Add Your First Child
                            </Link>
                        </div>
                    ) : (
                        students.map((student, idx) => (
                            <div key={student.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100/50 transition duration-300 overflow-hidden group animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-2xl font-bold border-4 border-white shadow-sm">
                                            {student.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{student.name}</h3>
                                            <p className="text-sm text-gray-500 font-medium">Class {student.grade} • {student.language}</p>
                                        </div>
                                    </div>
                                    <Link href={`/dashboard/parent/child/${student.id}`} className="text-[var(--primary)] font-semibold hover:underline text-sm">View Details →</Link>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">This week</span>
                                        <span className="font-bold text-gray-900">0 concepts completed</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-[var(--primary)] h-2 rounded-full w-[5%]"></div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-lg w-fit">
                                        <span>🌟</span> Ready to learn
                                    </div>
                                    <button
                                        onClick={() => handleStartSession(student)}
                                        className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition duration-200"
                                    >
                                        Start Learning Session
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </section>

                {/* Quick Actions & Activity Feed */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Quick Actions */}
                    <section className="space-y-4 animate-fade-in-up delay-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                        <Link href="/dashboard/parent/add-student" className="flex items-center w-full p-4 bg-white border border-gray-200 rounded-2xl hover:border-[var(--primary)] hover:shadow-md transition group cursor-pointer">
                            <span className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xl mr-4 group-hover:scale-110 transition">➕</span>
                            <span className="font-semibold text-gray-700 group-hover:text-[var(--primary)]">Add Another Child</span>
                        </Link>
                        <button className="flex items-center w-full p-4 bg-white border border-gray-200 rounded-2xl hover:border-[var(--primary)] hover:shadow-md transition group cursor-pointer">
                            <span className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-xl mr-4 group-hover:scale-110 transition">💳</span>
                            <span className="font-semibold text-gray-700 group-hover:text-[var(--primary)]">Manage Subscription</span>
                        </button>
                        <button className="flex items-center w-full p-4 bg-white border border-gray-200 rounded-2xl hover:border-[var(--primary)] hover:shadow-md transition group cursor-pointer">
                            <span className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center text-xl mr-4 group-hover:scale-110 transition">📄</span>
                            <span className="font-semibold text-gray-700 group-hover:text-[var(--primary)]">Download Reports</span>
                        </button>
                    </section>

                    {/* Activity Feed */}
                    <section className="md:col-span-2 animate-fade-in-up delay-300">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                                <div>
                                    <p className="text-gray-900"><span className="font-bold">System</span>: Welcome to EduPlatform!</p>
                                    <p className="text-xs text-gray-500 mt-1">Just now</p>
                                </div>
                            </div>
                            {/* Placeholder for more activity */}
                            <div className="flex items-start gap-4 opacity-50">
                                <div className="w-2 h-2 mt-2 rounded-full bg-gray-300 flex-shrink-0"></div>
                                <div>
                                    <p className="text-gray-900">No other recent activity.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
