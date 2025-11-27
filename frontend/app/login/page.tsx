'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../styles/Login.module.css';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'parent' // Default role
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                router.push('/dashboard');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Welcome Back</h2>
                    <p className={styles.subtitle}>Sign in to continue learning</p>
                </div>

                {error && (
                    <div className={styles.errorBox}>
                        <p className={styles.errorText}>{error}</p>
                    </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>

                    {/* Role Selection */}
                    <div className="flex justify-center mb-6 bg-gray-100 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'parent' })}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${formData.role === 'parent'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Parent
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'student' })}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${formData.role === 'student'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Student
                        </button>
                    </div>

                    <div className={styles.inputGroup}>
                        <div>
                            <label htmlFor="email" className={styles.label}>Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className={styles.label}>Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className={styles.optionsContainer}>
                        <div className={styles.rememberMeContainer}>
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className={styles.checkbox}
                            />
                            <label htmlFor="remember-me" className={styles.rememberMeLabel}>
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className={styles.forgotPasswordLink}>
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.submitButton}
                        >
                            {loading ? 'Signing in...' : `Sign in as ${formData.role === 'parent' ? 'Parent' : 'Student'}`}
                        </button>
                    </div>

                    <div className={styles.signupLinkContainer}>
                        <p className={styles.signupLinkText}>
                            Don't have an account? <Link href="/signup" className={styles.signupLink}>Sign up</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
