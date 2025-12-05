'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AssessmentPage() {
    const router = useRouter();
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [responses, setResponses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [startTime, setStartTime] = useState<number>(Date.now());

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/assessment/questions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401) {
                // Handle unauthorized (e.g., redirect to login)
                router.push('/login');
                return;
            }
            const data = await res.json();
            setQuestions(data);
            setStartTime(Date.now());
        } catch (err) {
            console.error('Failed to fetch questions', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (optionIndex: number) => {
        const currentQuestion = questions[currentIndex];

        // Save response
        const newResponses = [...responses];
        // Check if we already answered this one (if user went back)
        const existingIndex = newResponses.findIndex(r => r.questionId === currentQuestion.id);

        if (existingIndex >= 0) {
            newResponses[existingIndex] = { questionId: currentQuestion.id, answer: optionIndex };
        } else {
            newResponses.push({ questionId: currentQuestion.id, answer: optionIndex });
        }

        setResponses(newResponses);

        // Move to next question or submit
        if (currentIndex < questions.length - 1) {
            setTimeout(() => setCurrentIndex(currentIndex + 1), 300); // Small delay for visual feedback
        } else {
            submitAssessment(newResponses);
        }
    };

    const submitAssessment = async (finalResponses: any[]) => {
        setSubmitting(true);
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) throw new Error('No user found');
            const user = JSON.parse(userStr);
            const studentId = user.role === 'student' ? (user.studentId || user.id) : user.id;

            const timeTakenMinutes = Math.round((Date.now() - startTime) / 60000);

            const token = localStorage.getItem('token');
            const res = await fetch('/api/assessment/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId,
                    responses: finalResponses,
                    timeTakenMinutes: timeTakenMinutes || 1
                })
            });

            const data = await res.json();
            if (res.ok) {
                setProfile(data.profile);
                setCompleted(true);
            } else {
                console.error('Submission failed', data);
            }
        } catch (err) {
            console.error('Error submitting assessment', err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    if (completed && profile) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-white rounded-[2rem] shadow-xl p-8 md:p-12 text-center animate-fade-in-up">
                    <div className="text-6xl mb-6">🎉</div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Unlocked!</h1>
                    <p className="text-xl text-gray-600 mb-8">
                        We've discovered your unique learning superpower:
                    </p>

                    <div className="bg-blue-50 rounded-2xl p-8 mb-8 border border-blue-100">
                        <h2 className="text-2xl font-bold text-blue-700 capitalize mb-2">
                            {profile.primaryStyle.replace('_', ' & ')} Learner
                        </h2>
                        <p className="text-blue-600">
                            {profile.mindsetType === 'strong_growth' ? 'With a Super Growth Mindset! 🚀' : 'With a Growing Mindset! 🌱'}
                        </p>
                    </div>

                    <Link
                        href="/dashboard/student"
                        className="inline-block px-8 py-4 bg-[var(--primary)] text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-[var(--primary-hover)] transition transform hover:-translate-y-1"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="text-center">
                    <p className="text-xl text-gray-600 mb-4">No questions found.</p>
                    <Link href="/dashboard/student" className="text-[var(--primary)] font-bold hover:underline">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return null; // Safety guard

    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col">
            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-100">
                <div
                    className="h-full bg-[var(--primary)] transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <main className="flex-grow flex items-center justify-center p-4 md:p-8">
                <div className="max-w-3xl w-full">
                    {/* Question Card */}
                    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden relative min-h-[400px] flex flex-col">

                        {/* Header */}
                        <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                                Question {currentIndex + 1} of {questions.length}
                            </span>
                            <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                                {currentQuestion.question_category.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="p-8 md:p-12 flex-grow flex flex-col justify-center">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 leading-tight">
                                {currentQuestion.question_text}
                            </h2>

                            <div className="grid gap-4">
                                {currentQuestion.options.map((option: any, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        className="w-full text-left p-6 rounded-xl border-2 border-gray-100 hover:border-[var(--primary)] hover:bg-orange-50 transition-all duration-200 group flex items-center gap-4"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-sm group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className="text-lg text-gray-700 font-medium group-hover:text-gray-900">
                                            {option.text}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Hint */}
                    <div className="text-center mt-6 text-gray-400 text-sm">
                        Select an option to continue automatically
                    </div>
                </div>
            </main>
        </div>
    );
}
