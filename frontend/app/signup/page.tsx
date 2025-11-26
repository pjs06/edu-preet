'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:5001/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, phone, password, role }),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                router.push('/dashboard');
            } else {
                setError(data.error || 'Signup failed');
            }
        } catch (err) {
            setError('Something went wrong');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md border border-gray-200">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Sign Up</h2>
                {error && <p className="text-red-700 bg-red-100 p-3 rounded mb-4 text-center font-medium">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block mb-2 font-semibold text-gray-800">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border-2 border-gray-400 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold text-gray-800">Phone</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full border-2 border-gray-400 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold text-gray-800">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border-2 border-gray-400 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold text-gray-800">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full border-2 border-gray-400 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        >
                            <option value="student">Student</option>
                            <option value="parent">Parent</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-700 text-white py-3 rounded font-bold hover:bg-blue-800 transition focus:ring-4 focus:ring-blue-300"
                    >
                        Sign Up
                    </button>
                </form>
                <p className="mt-6 text-center text-gray-800">
                    Already have an account? <Link href="/login" className="text-blue-800 font-bold hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}
