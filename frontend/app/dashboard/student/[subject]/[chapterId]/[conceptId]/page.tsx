'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function LearningSessionPage() {
    const params = useParams();
    const { subject, chapterId, conceptId } = params;
    const router = useRouter();
    const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [remedialContent, setRemedialContent] = useState<string | null>(null);

    const [learningSessionId, setLearningSessionId] = useState<string | null>(null);

    useEffect(() => {
        const startSession = async () => {
            try {
                const userStr = localStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;
                const token = localStorage.getItem('token');

                if (!user || !token) return;

                // Determine studentId (handle both student login and parent-as-student)
                const studentId = user.role === 'student' ? (user.studentId || user.id) : user.id;

                const res = await fetch('http://localhost:5001/api/learning/start', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        studentId,
                        subject,
                        grade: user.grade || '4', // Default or from user profile
                        chapterId,
                        conceptId
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    setLearningSessionId(data.learningSessionId);
                    console.log('Learning Session Started:', data.learningSessionId);
                }
            } catch (err) {
                console.error('Failed to start learning session', err);
            }
        };

        startSession();
    }, [subject, chapterId, conceptId]);

    // Mock Questions (In real app, fetch from API based on conceptId)
    const questions = [
        { id: 'q1', text: 'What is the primary gas released during photosynthesis?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], correct: 'Oxygen' },
        { id: 'q2', text: 'Which part of the plant conducts photosynthesis?', options: ['Roots', 'Stem', 'Leaves', 'Flowers'], correct: 'Leaves' },
        { id: 'q3', text: 'What energy source is required?', options: ['Wind', 'Sunlight', 'Geothermal', 'Nuclear'], correct: 'Sunlight' }
    ];

    const handleStartQuiz = () => {
        setStep('quiz');
    };

    const handleSubmitQuiz = async (userAnswers: any[]) => {
        setLoading(true);
        try {
            // Simulate time taken (random between 2-5 mins for demo)
            const timeTaken = Math.floor(Math.random() * (300 - 120 + 1) + 120);

            // Get studentId and sessionId from localStorage (stored during login)
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const sessionId = localStorage.getItem('sessionId');

            if (!user || user.role !== 'student') {
                alert('Please login as a student first');
                return;
            }

            const payload = {
                studentId: user.studentId || user.id, // Ensure correct ID usage
                sessionId: sessionId,
                learningSessionId: learningSessionId, // Pass the learning session ID
                conceptId: conceptId,
                currentPathType: 'main',
                totalTimeTaken: timeTaken,
                answers: userAnswers.map((ans, index) => ({
                    questionId: questions[index].id,
                    isCorrect: ans === questions[index].correct,
                    timeTaken: 60 // Mock time per question
                }))
            };

            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5001/api/adaptive/evaluate-test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            setResult(data);
            setStep('result');

        } catch (err) {
            console.error('Error submitting quiz:', err);
            alert('Failed to submit quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleFetchRemedial = async (pathType: string) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5001/api/curriculum/content/${conceptId}/${pathType}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            setRemedialContent(data.prompt || data.content); // Display prompt or content
        } catch (err) {
            console.error('Error fetching remedial content:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
                <header className="mb-6 border-b pb-4">
                    <Link href={`/dashboard/student/${subject}/${chapterId}`} className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-block">← Back to Chapter</Link>
                    <h1 className="text-2xl font-bold text-gray-900">Learning Session: {conceptId}</h1>
                </header>

                {step === 'intro' && (
                    <div className="text-center py-8">
                        <div className="bg-blue-50 p-6 rounded-lg mb-8 inline-block">
                            <span className="text-6xl">📺</span>
                        </div>
                        <h2 className="text-xl font-bold mb-4">Video Lesson Completed</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            You have watched the main lesson video. Now let's check your understanding with a short adaptive quiz.
                        </p>
                        <button
                            onClick={handleStartQuiz}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                        >
                            Start Quiz
                        </button>
                    </div>
                )}

                {step === 'quiz' && (
                    <QuizComponent questions={questions} onSubmit={handleSubmitQuiz} loading={loading} />
                )}

                {step === 'result' && result && (
                    <div className="space-y-6 animate-fade-in">
                        <div className={`p-6 rounded-lg border ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <h2 className={`text-xl font-bold mb-2 ${result.passed ? 'text-green-800' : 'text-red-800'}`}>
                                {result.decision.message}
                            </h2>
                            <div className="flex items-center gap-4 mt-4">
                                <div className="text-3xl font-bold text-gray-900">{result.score.toFixed(0)}%</div>
                                <div className="text-sm text-gray-500">Score</div>
                            </div>
                            <p className="text-gray-500 text-sm mt-2">Scenario: {result.decision.scenario}</p>
                        </div>

                        {result.decision.nextStep === 'next_concept' && (
                            <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
                                Continue to Next Concept →
                            </button>
                        )}

                        {result.decision.nextStep === 'choice' && (
                            <div className="grid grid-cols-2 gap-4">
                                {result.decision.options.map((opt: any) => (
                                    <button
                                        key={opt.type}
                                        onClick={() => opt.type === 'review' ? handleFetchRemedial(opt.pathType) : alert('Continuing...')}
                                        className={`py-3 rounded-lg font-semibold border transition ${opt.type === 'review' ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {result.decision.nextStep === 'remediation' && (
                            <div>
                                <button
                                    onClick={() => handleFetchRemedial(result.decision.pathType)}
                                    className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 mb-4 transition"
                                >
                                    Start Remedial Lesson ({result.decision.pathType})
                                </button>
                            </div>
                        )}

                        {remedialContent && (
                            <div className="mt-8 p-6 bg-gray-100 rounded-lg border border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">Remedial Content Preview</h3>
                                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                                    {remedialContent}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function QuizComponent({ questions, onSubmit, loading }: any) {
    const [currentAnswers, setCurrentAnswers] = useState<string[]>(new Array(questions.length).fill(''));

    const handleOptionSelect = (qIndex: number, option: string) => {
        const newAnswers = [...currentAnswers];
        newAnswers[qIndex] = option;
        setCurrentAnswers(newAnswers);
    };

    return (
        <div className="space-y-8">
            {questions.map((q: any, index: number) => (
                <div key={q.id} className="border-b border-gray-100 pb-6 last:border-0">
                    <p className="font-medium text-gray-900 mb-4">{index + 1}. {q.text}</p>
                    <div className="space-y-2">
                        {q.options.map((opt: string) => (
                            <label key={opt} className="flex items-center space-x-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition border border-transparent hover:border-gray-200">
                                <input
                                    type="radio"
                                    name={q.id}
                                    value={opt}
                                    checked={currentAnswers[index] === opt}
                                    onChange={() => handleOptionSelect(index, opt)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700">{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}
            <button
                onClick={() => onSubmit(currentAnswers)}
                disabled={loading || currentAnswers.some(a => a === '')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
            >
                {loading ? 'Submitting...' : 'Submit Answers'}
            </button>
        </div>
    );
}
