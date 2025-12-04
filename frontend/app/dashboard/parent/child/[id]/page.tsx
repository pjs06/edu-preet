'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ChildDetailsPage({ params }: { params: { id: string } }) {
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudentDetails();
    }, [params.id]);

    const fetchStudentDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5001/api/students/${params.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setStudent(data.student);
            }
        } catch (err) {
            console.error("Failed to fetch student details", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading student details...</div>;
    if (!student) return <div className="p-8">Student not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Top Navigation */}
            <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="text-2xl font-bold text-blue-700">EduPlatform</div>
                <div className="flex items-center space-x-6">
                    <Link href="/dashboard/parent" className="text-gray-600 hover:text-blue-600 font-medium">Home</Link>
                    <Link href="#" className="text-blue-600 font-medium">My Children</Link>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">P</div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-8">
                {/* Header */}
                <header className="mb-8">
                    <Link href="/dashboard/parent" className="text-gray-500 hover:text-gray-700 text-sm mb-4 inline-block">← Back to Dashboard</Link>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{student.name}'s Progress</h1>
                            <p className="text-gray-600">Class {student.grade} • {student.language}</p>
                        </div>
                        <select className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>All Time</option>
                        </select>
                    </div>
                </header>

                {/* Performance Overview */}
                <section className="grid md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Concepts Completed</p>
                        <p className="text-4xl font-extrabold text-blue-600 mt-2">0</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Avg Time / Concept</p>
                        <p className="text-4xl font-extrabold text-purple-600 mt-2">- <span className="text-lg text-gray-400 font-normal">mins</span></p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Success Rate</p>
                        <p className="text-4xl font-extrabold text-green-600 mt-2">-</p>
                    </div>
                </section>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Main Content - Learning Journey */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Subject Breakdown */}
                        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Subject Performance</h2>
                            <div className="space-y-6">
                                <div className="text-center text-gray-500 py-4">
                                    No activity recorded yet.
                                </div>
                            </div>
                        </section>

                        {/* Recent Journey */}
                        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Learning Journey</h2>
                            <div className="text-center text-gray-500 py-4">
                                Start a session to see progress here.
                            </div>
                        </section>
                    </div>

                    {/* Sidebar - Action Items */}
                    <div className="space-y-6">
                        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Parent Action Items</h2>
                            <p className="text-gray-600 text-sm mb-4">
                                Encourage {student.name} to start their first lesson!
                            </p>
                            <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm shadow-md">
                                Start Learning Session
                            </button>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
