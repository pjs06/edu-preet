'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../../../styles/Signup.module.css'; // Reusing signup styles for consistency

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
            const res = await fetch('http://localhost:5001/api/students/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    if (!user) return <div className="p-8">Loading...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Add a Student</h2>
                    <p className={styles.subtitle}>Create a profile for your child</p>
                </div>

                {error && (
                    <div className={styles.errorBox}>
                        <p className={styles.errorText}>{error}</p>
                    </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <div>
                            <label className={styles.label}>Student Name</label>
                            <input
                                name="studentName"
                                type="text"
                                required
                                value={formData.studentName}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Child's Name"
                            />
                        </div>

                        <div>
                            <label className={styles.label}>Current Grade</label>
                            <select
                                name="grade"
                                value={formData.grade}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                                    <option key={g} value={g}>Class {g}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={styles.label}>Preferred Language</label>
                            <select
                                name="language"
                                value={formData.language}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Marathi">Marathi</option>
                                <option value="Tamil">Tamil</option>
                            </select>
                        </div>

                        <div className={styles.divider}>
                            <div className={styles.dividerLine}></div>
                            <span className={styles.dividerText}>Login Credentials (Optional)</span>
                            <div className={styles.dividerLine}></div>
                        </div>

                        <div className="mb-4 text-sm text-gray-600">
                            Create credentials if you want your child to login on their own device.
                        </div>

                        <div>
                            <label className={styles.label}>Student Email</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="student@example.com"
                            />
                        </div>

                        <div>
                            <label className={styles.label}>Student Password</label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="••••••••"
                            />
                        </div>

                        <div className={styles.buttonGroup}>
                            <Link href="/dashboard/parent" className={styles.backButton}>
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className={styles.submitButton}
                            >
                                {loading ? 'Creating Profile...' : 'Create Profile'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
