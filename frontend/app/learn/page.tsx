'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../styles/Learn.module.css';
import { ContentPath, Question } from './data';
import ReactMarkdown from 'react-markdown';

type SessionState = 'LOADING' | 'VIDEO' | 'LESSON' | 'TEST' | 'RESULT' | 'REMEDIAL_SELECTION' | 'COMPLETED' | 'ERROR';

function LearnContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [studentId, setStudentId] = useState<string | null>(null);
    const conceptId = searchParams.get('conceptId') || 'module_001';

    // State
    const [state, setState] = useState<SessionState>('LOADING');
    const [contentData, setContentData] = useState<Record<string, ContentPath> | null>(null);
    const [currentPath, setCurrentPath] = useState<ContentPath | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> answerId
    const [score, setScore] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);

    // Fetch Student ID first
    useEffect(() => {
        const fetchStudentId = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                // Fetch user profile to get student ID
                // Assuming /api/auth/me or similar returns the user and linked student info
                // Or we can fetch from a dedicated student endpoint
                const res = await fetch('/api/assessment/status', { // Re-using this endpoint as it returns student info
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.studentId) {
                        setStudentId(data.studentId);
                    } else {
                        console.error('No student ID found');
                        setState('ERROR');
                    }
                } else {
                    console.error('Failed to fetch student info');
                    setState('ERROR');
                }
            } catch (err) {
                console.error('Error fetching student ID', err);
                setState('ERROR');
            }
        };

        fetchStudentId();
    }, [router]);

    // Fetch Content & Start Session (Only after studentId is available)
    useEffect(() => {
        if (!studentId) return;

        const initSession = async () => {
            try {
                // 1. Fetch Content
                const token = localStorage.getItem('token');
                const contentRes = await fetch(`/api/learning/content/${encodeURIComponent(conceptId)}?studentId=${studentId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!contentRes.ok) throw new Error('Failed to load content');
                const data = await contentRes.json();
                setContentData(data);
                setCurrentPath(data.MAIN);

                // 2. Start Session (Backend Tracking)
                const startRes = await fetch('/api/learning/start', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        studentId,
                        subject: 'Science',
                        grade: 9, // Defaulting to 9 for now as per curriculum
                        chapterId: searchParams.get('chapterId') || null, // Use URL param or null
                        conceptId
                    })
                });
                const startData = await startRes.json();
                setSessionId(startData.learningSessionId);

                setState('LESSON'); // Text-first learning
            } catch (err) {
                console.error(err);
                setState('ERROR');
            }
        };

        initSession();
    }, [conceptId, studentId]);

    const handleVideoComplete = async () => {
        // Track video completion
        if (sessionId && currentPath) {
            await fetch('/api/learning/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    sessionId,
                    studentId,
                    type: 'video_complete',
                    data: { duration: 300 } // Mock duration
                })
            });
        }

        setState('TEST');
        setCurrentQuestionIndex(0);
        setAnswers({});
        setScore(0);
        setShowFeedback(false);
    };

    const handleAnswerSelect = (optionId: string) => {
        if (showFeedback || !currentPath) return;

        const currentQuestion = currentPath.questions[currentQuestionIndex];
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
    };

    const handleSubmitAnswer = () => {
        setShowFeedback(true);
    };

    const handleNextQuestion = () => {
        if (!currentPath) return;
        const currentQuestion = currentPath.questions[currentQuestionIndex];
        const selectedAnswer = answers[currentQuestion.id];

        // Update score if correct
        if (selectedAnswer === currentQuestion.correctAnswer) {
            setScore(prev => prev + 1);
        }

        setShowFeedback(false);

        if (currentQuestionIndex < currentPath.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // End of test - calculate final result
            // We need to include the last question in the score calculation if we haven't already
            // Actually, the score update above happens before this check, but state updates are async.
            // Better to calculate score from answers map at the end.
            finishTest();
        }
    };

    const finishTest = async () => {
        if (!currentPath) return;

        // Calculate final score based on all answers
        let finalScore = 0;
        currentPath.questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) {
                finalScore++;
            }
        });
        setScore(finalScore);

        const passed = finalScore >= 2; // Pass threshold

        // Track test attempt
        if (sessionId) {
            await fetch('/api/learning/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    sessionId,
                    studentId,
                    type: 'test_attempt',
                    data: {
                        conceptId,
                        pathType: currentPath.type,
                        passed,
                        timeTaken: 120, // Mock time
                        answers
                    }
                })
            });
        }

        setState('RESULT');
    };

    const handleRemedialSelection = (type: 'STORY' | 'ANALOGY') => {
        if (contentData) {
            setCurrentPath(contentData[type]);
            setState('VIDEO');
        }
    };

    const handleRetryMain = () => {
        if (contentData) {
            setCurrentPath(contentData.MAIN);
            setState('VIDEO');
        }
    }

    const handleCompleteLesson = async () => {
        if (sessionId) {
            await fetch('/api/learning/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    sessionId,
                    studentId,
                    conceptId,
                    mastered: true
                })
            });
        }
        setState('COMPLETED');
    };

    // Render Helpers
    if (state === 'LOADING') return <div className="min-h-screen flex items-center justify-center text-xl">Loading learning session...</div>;
    if (state === 'ERROR') return <div className="min-h-screen flex items-center justify-center text-xl text-red-600">Error loading content. Please ensure backend is running and seeded.</div>;
    if (!currentPath) return null;

    const currentQuestion = currentPath.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === currentPath.questions.length - 1;
    const passed = score >= 2;

    return (
        <div className={styles.container}>
            {/* Top Bar */}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>{currentPath.title}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className={`px-2 py-0.5 rounded ${currentPath.type === 'MAIN' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                            {currentPath.type === 'MAIN' ? 'Main Lesson' : currentPath.type === 'STORY' ? 'Story Mode' : 'Analogy Mode'}
                        </span>
                    </div>
                </div>
                <div className={styles.controls}>
                    <Link href="/dashboard/student" className={styles.closeBtn}>✕</Link>
                </div>
            </header>

            <main className={styles.main}>

                {/* STATE: LESSON (Text First) */}
                {(state === 'VIDEO' || state === 'LESSON') && (
                    <div className="max-w-4xl mx-auto w-full">
                        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 md:p-12 mb-8 animate-fade-in-up">
                            <div className="prose prose-lg max-w-none">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">{currentPath.title}</h2>
                                <div className="bg-blue-50 rounded-xl p-6 mb-8 text-blue-800 font-medium">
                                    <ReactMarkdown>
                                        {currentPath.textContent || "Loading lesson content..."}
                                    </ReactMarkdown>
                                </div>
                                <p className="text-gray-600 italic">
                                    Read through the lesson above. When you're ready, take the quiz to test your knowledge!
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end items-center">
                            <button
                                onClick={handleVideoComplete}
                                className={`${styles.primaryBtn} text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition`}
                            >
                                I'm Ready for the Quiz →
                            </button>
                        </div>
                    </div>
                )}

                {/* STATE: TEST */}
                {state === 'TEST' && (
                    <div className={styles.checkpointCard}>
                        <div className={styles.checkpointHeader}>
                            <h2 className={styles.checkpointTitle}>
                                <span className="mr-2">📝</span> Question {currentQuestionIndex + 1} of {currentPath.questions.length}
                            </h2>
                            <div className="text-sm font-medium text-gray-500">
                                Score: {Object.keys(answers).filter(qid => answers[qid] === currentPath.questions.find(q => q.id === qid)?.correctAnswer).length}
                            </div>
                        </div>

                        <div className={styles.checkpointContent}>
                            <p className={styles.question}>{currentQuestion.text}</p>

                            <div className={styles.optionsContainer}>
                                {currentQuestion.options.map((option) => {
                                    const isSelected = answers[currentQuestion.id] === option.id;
                                    const isCorrect = option.id === currentQuestion.correctAnswer;

                                    let btnClass = styles.optionBtnDefault;
                                    if (showFeedback) {
                                        if (isSelected && isCorrect) btnClass = styles.optionBtnCorrect;
                                        else if (isSelected && !isCorrect) btnClass = styles.optionBtnIncorrect;
                                        else if (!isSelected && isCorrect) btnClass = styles.optionBtnCorrect; // Show correct answer
                                    } else if (isSelected) {
                                        btnClass = styles.optionBtnSelected;
                                    }

                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => handleAnswerSelect(option.id)}
                                            disabled={showFeedback}
                                            className={`${styles.optionBtn} ${btnClass}`}
                                        >
                                            <span className={styles.optionLetter}>{option.id}</span>
                                            <span className="text-lg">{option.text}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Feedback Area */}
                            {showFeedback && (
                                <div className={`mt-4 p-4 rounded-lg ${answers[currentQuestion.id] === currentQuestion.correctAnswer ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                    <p className={`font-bold ${answers[currentQuestion.id] === currentQuestion.correctAnswer ? 'text-green-800' : 'text-red-800'}`}>
                                        {answers[currentQuestion.id] === currentQuestion.correctAnswer ? 'Correct!' : 'Not quite.'}
                                    </p>
                                    <p className="text-gray-700 mt-1">{currentQuestion.rationale}</p>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                {!showFeedback ? (
                                    <button
                                        onClick={handleSubmitAnswer}
                                        disabled={!answers[currentQuestion.id]}
                                        className={styles.submitBtn}
                                    >
                                        Submit Answer
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleNextQuestion}
                                        className={styles.primaryBtn}
                                    >
                                        {isLastQuestion ? 'See Results' : 'Next Question →'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* STATE: RESULT */}
                {state === 'RESULT' && (
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                            <div className="text-6xl mb-4">{passed ? '🎉' : '🤔'}</div>
                            <h2 className="text-3xl font-bold mb-2">{passed ? 'Great Job!' : 'Keep Going!'}</h2>
                            <p className="text-xl text-gray-600 mb-6">
                                You scored <span className={`font-bold ${passed ? 'text-green-600' : 'text-orange-500'}`}>{score}/{currentPath.questions.length}</span>
                            </p>

                            {passed ? (
                                <div>
                                    <p className="mb-8 text-gray-600">You've mastered this concept! You're ready to move on.</p>
                                    <div className="flex justify-center gap-4">
                                        <Link href="/dashboard/student" className={styles.secondaryBtn}>Back to Dashboard</Link>
                                        <button onClick={handleCompleteLesson} className={styles.primaryBtn}>Complete Lesson</button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-8 text-gray-600">It looks like you missed a few key points. Let's try learning this in a different way!</p>
                                    <button
                                        onClick={() => setState('REMEDIAL_SELECTION')}
                                        className={styles.primaryBtn}
                                    >
                                        See Other Ways to Learn →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STATE: REMEDIAL SELECTION */}
                {state === 'REMEDIAL_SELECTION' && (
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-8">Choose Your Path</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Story Option */}
                            <div
                                onClick={() => handleRemedialSelection('STORY')}
                                className="bg-white p-6 rounded-xl shadow-md border-2 border-transparent hover:border-purple-500 cursor-pointer transition-all hover:shadow-xl group"
                            >
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📖</div>
                                <h3 className="text-xl font-bold mb-2">Story Mode</h3>
                                <p className="text-gray-600 mb-4">Learn through a story about Rohan and his grandma's garden.</p>
                                <span className="text-purple-600 font-medium group-hover:underline">Start Story →</span>
                            </div>

                            {/* Analogy Option */}
                            <div
                                onClick={() => handleRemedialSelection('ANALOGY')}
                                className="bg-white p-6 rounded-xl shadow-md border-2 border-transparent hover:border-blue-500 cursor-pointer transition-all hover:shadow-xl group"
                            >
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🏭</div>
                                <h3 className="text-xl font-bold mb-2">Analogy Mode</h3>
                                <p className="text-gray-600 mb-4">Understand how a leaf is like a solar-powered factory.</p>
                                <span className="text-blue-600 font-medium group-hover:underline">Start Analogy →</span>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <button onClick={handleRetryMain} className="text-gray-500 hover:text-gray-800 underline">
                                Retry Main Lesson
                            </button>
                        </div>
                    </div>
                )}

                {/* STATE: COMPLETED */}
                {state === 'COMPLETED' && (
                    <div className={styles.completedCard}>
                        <div className="text-6xl mb-6">⭐</div>
                        <h2 className={styles.completedTitle}>Concept Mastered!</h2>
                        <p className={styles.completedSubtitle}>You completed: "{contentData?.MAIN.title}"</p>

                        <div className={styles.statsGrid}>
                            <div className={styles.statItem}>
                                <p className={styles.statLabel}>Total XP</p>
                                <p className={`${styles.statValue} ${styles.statValuePurple}`}>+50 XP</p>
                            </div>
                            <div className={styles.statItem}>
                                <p className={styles.statLabel}>Status</p>
                                <p className={`${styles.statValue} ${styles.statValueGreen}`}>Passed</p>
                            </div>
                        </div>

                        <div className={styles.actionButtons}>
                            <Link
                                href="/dashboard/student"
                                className={styles.primaryBtn}
                            >
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

export default function LearnPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <LearnContent />
        </Suspense>
    );
}
