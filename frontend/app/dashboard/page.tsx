'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
        } else {
            setUser(JSON.parse(storedUser));
        }
    }, [router]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Welcome, {user.email}</h1>
            <p className="mb-4 text-lg text-gray-800">Role: <span className="font-semibold">{user.role}</span></p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded shadow border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">Your Progress</h2>
                    <p className="text-gray-700">No data available yet.</p>
                </div>
                <div className="bg-white p-6 rounded shadow border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">Recommended Learning</h2>
                    <p className="text-gray-700">Start a new session to see recommendations.</p>
                </div>
            </div>
        </div>
    );
}
