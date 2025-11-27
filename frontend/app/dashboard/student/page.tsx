'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProfileDropdown from '../../../components/ProfileDropdown';
import styles from '../../../styles/StudentDashboard.module.css';

export default function StudentDashboard() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    if (!user) return <div className="p-8">Loading...</div>;

    return (
        <div className={styles.container}>
            {/* Top Navigation */}
            <nav className={styles.nav}>
                <div className={styles.logo}>EduPlatform</div>
                <div className={styles.navLinks}>
                    <Link href="/dashboard/student" className={styles.navLinkActive}>Home</Link>
                    <Link href="#" className={styles.navLink}>My Progress</Link>
                    <ProfileDropdown user={user} colorClass="bg-purple-100 text-purple-700 border-2 border-purple-200" />
                </div>
            </nav>

            <main className={styles.main}>
                {/* Welcome Banner */}
                <header className={styles.welcomeBanner}>
                    <div className={styles.bannerContent}>
                        <h1 className={styles.bannerTitle}>Welcome back, {user.name || 'Student'}! 🎉</h1>
                        <p className={styles.bannerSubtitle}>Ready to learn something new today?</p>
                        <div className={styles.statsContainer}>
                            <div className={styles.statBox}>
                                <span className={styles.statValue}>5</span>
                                <span className={styles.statLabel}>Day Streak 🔥</span>
                            </div>
                            <div className={styles.statBox}>
                                <span className={styles.statValue}>12</span>
                                <span className={styles.statLabel}>Concepts Mastered 🏆</span>
                            </div>
                        </div>
                    </div>
                    {/* Decorative circles */}
                    <div className={styles.decorativeCircle1}></div>
                    <div className={styles.decorativeCircle2}></div>
                </header>

                {/* Continue Learning Card */}
                <section className={styles.continueLearningSection}>
                    <h2 className={styles.sectionTitle}>Continue Learning</h2>
                    <div className={`${styles.continueCard} group`}>
                        <div className={styles.continueCardContent}>
                            <div className={styles.subjectTag}>Math • Class 4</div>
                            <h3 className={styles.topicTitle}>Fractions and Decimals</h3>
                            <p className={styles.nextTopic}>Next: Comparing Fractions</p>
                        </div>
                        <Link
                            href="/learn?sessionId=new"
                            className={styles.continueBtn}
                        >
                            Continue →
                        </Link>
                    </div>
                </section>

                {/* Subject Selection */}
                <section className={styles.continueLearningSection}>
                    <h2 className={styles.sectionTitle}>Your Subjects</h2>
                    <div className={styles.subjectsGrid}>
                        {/* Math */}
                        <div className={styles.subjectCard}>
                            <div className={`${styles.subjectIcon} ${styles.iconMath}`}>📐</div>
                            <h3 className={styles.subjectName}>Math</h3>
                            <div className={styles.progressBarContainer}>
                                <div className={`${styles.progressBar} ${styles.progressMath}`} style={{ width: '60%' }}></div>
                            </div>
                            <button className={`${styles.startBtn} ${styles.btnMath}`}>
                                Start
                            </button>
                        </div>
                        {/* Science */}
                        <div className={styles.subjectCard}>
                            <div className={`${styles.subjectIcon} ${styles.iconScience}`}>🔬</div>
                            <h3 className={styles.subjectName}>Science</h3>
                            <div className={styles.progressBarContainer}>
                                <div className={`${styles.progressBar} ${styles.progressScience}`} style={{ width: '30%' }}></div>
                            </div>
                            <button className={`${styles.startBtn} ${styles.btnScience}`}>
                                Start
                            </button>
                        </div>
                        {/* Hindi */}
                        <div className={styles.subjectCard}>
                            <div className={`${styles.subjectIcon} ${styles.iconHindi}`}>📚</div>
                            <h3 className={styles.subjectName}>Hindi</h3>
                            <div className={styles.progressBarContainer}>
                                <div className={`${styles.progressBar} ${styles.progressHindi}`} style={{ width: '90%' }}></div>
                            </div>
                            <button className={`${styles.startBtn} ${styles.btnHindi}`}>
                                Start
                            </button>
                        </div>
                    </div>
                </section>

                {/* Achievements */}
                <section>
                    <h2 className={styles.sectionTitle}>Recent Achievements</h2>
                    <div className={styles.achievementsContainer}>
                        <div className={`${styles.achievementCard} ${styles.cardYellow}`}>
                            <div className={styles.achievementIcon}>🏆</div>
                            <div>
                                <p className={`${styles.achievementTitle} ${styles.textYellow}`}>First Concept</p>
                                <p className={`${styles.achievementDesc} ${styles.descYellow}`}>Completed!</p>
                            </div>
                        </div>
                        <div className={`${styles.achievementCard} ${styles.cardPurple}`}>
                            <div className={styles.achievementIcon}>⚡</div>
                            <div>
                                <p className={`${styles.achievementTitle} ${styles.textPurple}`}>Speed Learner</p>
                                <p className={`${styles.achievementDesc} ${styles.descPurple}`}>3 concepts in 15m</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
