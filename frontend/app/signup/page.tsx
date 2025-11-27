'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../styles/Signup.module.css';

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        role: 'parent',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        name: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.password) {
                setError("Password is required");
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match");
                return;
            }
            if (!formData.email) {
                setError("Email is required");
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                setError("Please enter a valid email address");
                return;
            }

            if (formData.phone) {
                const phoneDigits = formData.phone.replace(/\D/g, '');
                if (phoneDigits.length !== 10) {
                    setError("Phone number must be exactly 10 digits");
                    return;
                }
                if (!/^\d+$/.test(formData.phone)) {
                    setError("Phone number must contain only numbers");
                    return;
                }
            }
        }
        setError('');
        setStep(step + 1);
    };

    const handleBack = () => {
        setError('');
        setStep(step - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5001/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    role: 'parent',
                    name: formData.name
                }),
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
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>

                {/* Progress Bar */}
                <div className={styles.progressBarContainer}>
                    <div className={styles.progressBarFill} style={{ width: `${(step / 2) * 100}%` }}></div>
                </div>

                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {step === 1 && "Create Parent Account"}
                        {step === 2 && "Setup Profile"}
                    </h2>
                    <p className={styles.subtitle}>
                        Step {step} of 2
                    </p>
                </div>

                {error && (
                    <div className={styles.errorBox}>
                        <p className={styles.errorText}>{error}</p>
                    </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>

                    {/* STEP 1: Basic Info */}
                    {step === 1 && (
                        <div className={styles.inputGroup}>
                            <div>
                                <label className={styles.label}>Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div className={styles.divider}>
                                <div className={styles.dividerLine}></div>
                                <span className={styles.dividerText}>OR</span>
                                <div className={styles.dividerLine}></div>
                            </div>

                            <div>
                                <label className={styles.label}>Phone Number</label>
                                <input
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="9876543210"
                                />
                            </div>

                            <div>
                                <label className={styles.label}>Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className={styles.label}>Confirm Password</label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className={styles.loginLinkContainer}>
                                <p className={styles.loginLinkText}>
                                    Already have an account? <Link href="/login" className={styles.loginLink}>Log in</Link>
                                </p>
                            </div>

                            <div className={styles.buttonGroup}>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className={styles.nextButton}
                                >
                                    Next Step
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Profile Setup */}
                    {step === 2 && (
                        <div className={styles.inputGroup}>
                            <div>
                                <label className={styles.label}>Your Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="Full Name"
                                />
                            </div>

                            <div className={styles.infoBox}>
                                <p>You'll be able to add your child's details after creating your account.</p>
                            </div>

                            <div className={styles.termsContainer}>
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    required
                                    className={styles.checkbox}
                                />
                                <label htmlFor="terms" className={styles.termsLabel}>
                                    I agree to the <a href="#" className={styles.termsLink}>Terms</a> and <a href="#" className={styles.termsLink}>Privacy Policy</a>
                                </label>
                            </div>

                            <div className={styles.buttonGroup}>
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className={styles.backButton}
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={styles.submitButton}
                                >
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
