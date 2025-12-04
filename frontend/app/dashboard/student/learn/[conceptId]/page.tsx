'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LearningSessionPage({ params }: { params: { conceptId: string } }) {
    const router = useRouter();
    const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
    const [answers, setAnswers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [remedialContent, setRemedialContent] = useState<string | null>(null);

    // Mock Questions (In real app, fetch from API based on params.conceptId)
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
            const sessionId = localStorage.getItem('sessionId'); // Assuming we stored this on login

            if (!user || !user.studentId) {
                alert('Please login as a student first');
                return;
            }

            const payload = {
                studentId: user.studentId,
                sessionId: sessionId,
                conceptId: params.conceptId,
                currentPathType: 'main',
                totalTimeTaken: timeTaken,
                answers: userAnswers.map((ans, index) => ({
                    questionId: questions[index].id,
                    isCorrect: ans === questions[index].correct,
                    timeTaken: 60 // Mock time per question
                }))
            };

            const res = await fetch('/api/adaptive/evaluate-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            const res = await fetch(`/api/curriculum/content/${params.conceptId}/${pathType}`);
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
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Learning Session: {params.conceptId}</h1>

                {step === 'intro' && (
                    <div className="text-center">
                        <p className="text-gray-600 mb-8">
                            You have completed the video lesson. Now let's check your understanding with a short quiz.
                        </p>
                        <button
                            onClick={handleStartQuiz}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            Start Quiz
                        </button>
                    </div>
                )}

                {step === 'quiz' && (
                    <QuizComponent questions={questions} onSubmit={handleSubmitQuiz} loading={loading} />
                )}

                {step === 'result' && result && (
                    <div className="space-y-6">
                        <div className={`p-6 rounded-lg border ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <h2 className={`text-xl font-bold mb-2 ${result.passed ? 'text-green-800' : 'text-red-800'}`}>
                                {result.decision.message}
                            </h2>
                            <p className="text-gray-700">Score: {result.score.toFixed(0)}%</p>
                            <p className="text-gray-500 text-sm mt-2">Scenario: {result.decision.scenario}</p>
                        </div>

                        {result.decision.nextStep === 'next_concept' && (
                            <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">
                                Continue to Next Concept →
                            </button>
                        )}

                        {result.decision.nextStep === 'choice' && (
                            <div className="grid grid-cols-2 gap-4">
                                {result.decision.options.map((opt: any) => (
                                    <button
                                        key={opt.type}
                                        onClick={() => opt.type === 'review' ? handleFetchRemedial(opt.pathType) : alert('Continuing...')}
                                        className={`py-3 rounded-lg font-semibold border ${opt.type === 'review' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}
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
                                    className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 mb-4"
                                >
                                    Start Remedial Lesson ({result.decision.pathType})
                                </button>
                            </div>
                        )}

                        {remedialContent && (
                            <div className="mt-8 p-6 bg-gray-100 rounded-lg border border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">Remedial Content Preview</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{remedialContent}</p>
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
                            <label key={opt} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                                <input
                                    type="radio"
                                    name={q.id}
                                    value={opt}
                                    checked={currentAnswers[index] === opt}
                                    onChange={() => handleOptionSelect(index, opt)}
                                    className="h-4 w-4 text-blue-600"
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
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Submitting...' : 'Submit Answers'}
            </button>
        </div>
    );
}
