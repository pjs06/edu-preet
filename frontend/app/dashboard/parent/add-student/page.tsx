'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddStudentPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        studentName: '',
        grade: '4',
        language: 'English',
        email: '',
        password: ''
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            router.push('/login');
        }
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!user || !user.parentId) {
            setError('Parent session invalid. Please login again.');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5001/api/students/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    parentId: user.parentId,
                    ...formData
                }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/dashboard/parent');
            } else {
                setError(data.error || 'Failed to create student');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">Loading...</div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[var(--secondary)] rounded-full blur-[100px] opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] opacity-30 translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-md w-full bg-[var(--card-bg)] rounded-[2rem] shadow-2xl shadow-orange-100/50 border border-[var(--card-border)] p-8 md:p-10 relative z-10 animate-fade-in-up">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Add a Student</h2>
                    <p className="text-gray-500">Create a profile for your child</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Student Name</label>
                            <input
                                name="studentName"
                                type="text"
                                required
                                value={formData.studentName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition duration-200"
                                placeholder="Child's Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Grade</label>
                            <select
                                name="grade"
                                value={formData.grade}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition duration-200 appearance-none"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                                    <option key={g} value={g}>Class {g}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Language</label>
                            <select
                                name="language"
                                value={formData.language}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition duration-200 appearance-none"
                            >
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Marathi">Marathi</option>
                                <option value="Tamil">Tamil</option>
                            </select>
                        </div>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold tracking-wider">Login Credentials (Optional)</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <div className="text-sm text-gray-500 text-center">
                            Create credentials if you want your child to login on their own device.
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Student Email</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition duration-200"
                                placeholder="student@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Student Password</label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition duration-200"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex gap-4 pt-2">
                            <Link href="/dashboard/parent" className="flex-1 py-3.5 px-4 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition duration-200 text-center">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-orange-200 text-sm font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:-translate-y-0.5 duration-200"
                            >
                                {loading ? 'Creating...' : 'Create Profile'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
