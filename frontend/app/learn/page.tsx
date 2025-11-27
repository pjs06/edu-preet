'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../styles/Learn.module.css';

type SessionState = 'INTRODUCTION' | 'CHECKPOINT' | 'FEEDBACK' | 'COMPLETED';

function LearnContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('sessionId');

    const [state, setState] = useState<SessionState>('INTRODUCTION');
    const [loading, setLoading] = useState(true);

    // Mock Data
    const [concept, setConcept] = useState<any>(null);
    const [timer, setTimer] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    useEffect(() => {
        // Simulate fetching session data
        setTimeout(() => {
            setConcept({
                title: 'Introduction to Fractions',
                explanation: "Imagine you have a pizza. If you cut it into 4 equal slices and eat 1 slice, you have eaten 1/4 of the pizza. The bottom number (4) is the total parts, and the top number (1) is how many parts we are talking about.",
                visual: "🍕",
                question: "If you divide a chocolate bar into 4 equal parts and give 1 part to a friend, what fraction did you give?",
                options: [
                    { id: 'A', text: '1/2' },
                    { id: 'B', text: '1/4' },
                    { id: 'C', text: '1/3' },
                    { id: 'D', text: '2/4' }
                ],
                correctAnswer: 'B',
                correctFeedback: "Excellent! You got it right! 1/4 means 1 part out of 4 equal parts.",
                incorrectFeedback: "Not quite. Remember, the bottom number represents the TOTAL number of pieces. Since there are 4 pieces in total, the bottom number should be 4."
            });
            setLoading(false);
        }, 1000);
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (state === 'CHECKPOINT') {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [state]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartCheckpoint = () => {
        setState('CHECKPOINT');
        setTimer(0);
    };

    const handleSubmitAnswer = () => {
        if (!selectedOption) return;

        const correct = selectedOption === concept.correctAnswer;
        setIsCorrect(correct);
        setState('FEEDBACK');
    };

    const handleNext = () => {
        if (isCorrect) {
            setState('COMPLETED');
        } else {
            // Remedial path - for now just restart intro with same content but could be different
            setState('INTRODUCTION');
            setSelectedOption(null);
            setIsCorrect(null);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading learning session...</div>;

    return (
        <div className={styles.container}>
            {/* Top Bar */}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>{concept.title}</h1>
                    <div className={styles.progressBarContainer}>
                        <div className={styles.progressBar} style={{ width: '30%' }}></div>
                    </div>
                </div>
                <div className={styles.controls}>
                    {state === 'CHECKPOINT' && (
                        <div className={styles.timer}>
                            ⏱ {formatTime(timer)}
                        </div>
                    )}
                    <button className={styles.controlBtn}>⏸</button>
                    <Link href="/dashboard/student" className={styles.closeBtn}>✕</Link>
                </div>
            </header>

            <main className={styles.main}>

                {/* STATE 1: INTRODUCTION */}
                {state === 'INTRODUCTION' && (
                    <div className={styles.introCard}>
                        <div className={styles.introContent}>
                            <div className={styles.visual}>{concept.visual}</div>
                            <h2 className={styles.conceptTitle}>Concept Explanation</h2>
                            <p className={styles.explanation}>
                                {concept.explanation}
                            </p>

                            {/* Audio Player Mock */}
                            <div className={styles.audioPlayer}>
                                <span className="text-blue-600 text-xl">🔊</span>
                                <span className="text-gray-700 font-medium">Play Audio Explanation</span>
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={handleStartCheckpoint}
                                    className={styles.primaryBtn}
                                >
                                    I Understand, Next →
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STATE 2: CHECKPOINT */}
                {state === 'CHECKPOINT' && (
                    <div className={styles.checkpointCard}>
                        <div className={styles.checkpointHeader}>
                            <h2 className={styles.checkpointTitle}>
                                <span className="mr-2">✅</span> Quick Check!
                            </h2>
                        </div>
                        <div className={styles.checkpointContent}>
                            <p className={styles.question}>
                                {concept.question}
                            </p>

                            <div className={styles.optionsContainer}>
                                {concept.options.map((option: any) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setSelectedOption(option.id)}
                                        className={`${styles.optionBtn} ${selectedOption === option.id
                                            ? styles.optionBtnSelected
                                            : styles.optionBtnDefault
                                            }`}
                                    >
                                        <span className={`${styles.optionLetter} ${selectedOption === option.id ? styles.optionLetterSelected : styles.optionLetterDefault
                                            }`}>
                                            {option.id}
                                        </span>
                                        <span className="text-lg">{option.text}</span>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleSubmitAnswer}
                                disabled={!selectedOption}
                                className={styles.submitBtn}
                            >
                                Submit Answer
                            </button>
                        </div>
                    </div>
                )}

                {/* STATE 3: FEEDBACK */}
                {state === 'FEEDBACK' && (
                    <div className={styles.feedbackCard}>
                        <div className={`${styles.feedbackHeader} ${isCorrect ? styles.feedbackHeaderCorrect : styles.feedbackHeaderIncorrect}`}>
                            <h2 className={`${styles.feedbackTitle} ${isCorrect ? styles.feedbackTitleCorrect : styles.feedbackTitleIncorrect}`}>
                                <span className="mr-3 text-3xl">{isCorrect ? '🎉' : '😊'}</span>
                                {isCorrect ? 'Excellent! You got it right!' : 'Not quite right, but that\'s okay!'}
                            </h2>
                        </div>
                        <div className={styles.feedbackContent}>
                            <p className={styles.feedbackText}>
                                {isCorrect ? concept.correctFeedback : concept.incorrectFeedback}
                            </p>

                            <button
                                onClick={handleNext}
                                className={`${styles.continueBtn} ${isCorrect ? styles.continueBtnCorrect : styles.continueBtnIncorrect
                                    }`}
                            >
                                {isCorrect ? 'Continue to Next Concept →' : 'Let\'s Review This Concept ↺'}
                            </button>
                        </div>
                    </div>
                )}

                {/* STATE 4: COMPLETED */}
                {state === 'COMPLETED' && (
                    <div className={styles.completedCard}>
                        <div className="text-6xl mb-6">⭐</div>
                        <h2 className={styles.completedTitle}>Concept Mastered!</h2>
                        <p className={styles.completedSubtitle}>You completed: "{concept.title}"</p>

                        <div className={styles.statsGrid}>
                            <div className={styles.statItem}>
                                <p className={styles.statLabel}>Time</p>
                                <p className={styles.statValue}>2m 15s</p>
                            </div>
                            <div className={styles.statItem}>
                                <p className={styles.statLabel}>Accuracy</p>
                                <p className={`${styles.statValue} ${styles.statValueGreen}`}>100%</p>
                            </div>
                            <div className={styles.statItem}>
                                <p className={styles.statLabel}>XP Earned</p>
                                <p className={`${styles.statValue} ${styles.statValuePurple}`}>+10 XP</p>
                            </div>
                        </div>

                        <div className={styles.actionButtons}>
                            <Link
                                href="/dashboard/student"
                                className={styles.secondaryBtn}
                            >
                                Take a Break ☕
                            </Link>
                            <button
                                onClick={() => alert("Next concept would load here!")}
                                className={styles.nextConceptBtn}
                            >
                                Next Concept →
                            </button>
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
