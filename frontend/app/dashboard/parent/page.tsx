'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProfileDropdown from '../../../components/ProfileDropdown';
import styles from '../../../styles/ParentDashboard.module.css';

export default function ParentDashboard() {
    const [user, setUser] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchStudents(parsedUser.parentId);
        }
    }, []);

    const fetchStudents = async (parentId: string) => {
        try {
            const res = await fetch(`http://localhost:5001/api/students/${parentId}/list`);
            const data = await res.json();
            if (res.ok) {
                setStudents(data.students);
            }
        } catch (err) {
            console.error("Failed to fetch students", err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="p-8">Loading...</div>;

    return (
        <div className={styles.container}>
            {/* Top Navigation */}
            <nav className={styles.nav}>
                <div className={styles.logo}>EduPlatform</div>
                <div className={styles.navLinks}>
                    <Link href="/dashboard/parent" className={styles.navLinkActive}>Home</Link>
                    <Link href="#" className={styles.navLink}>My Children</Link>
                    <Link href="#" className={styles.navLink}>Subscription</Link>
                    <ProfileDropdown user={user} />
                </div>
            </nav>

            <main className={styles.main}>
                {/* Welcome Section */}
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.welcomeTitle}>Hello, {user.name || 'Parent'}! 👋</h1>
                        <p className={styles.welcomeSubtitle}>Here's how your children are doing today.</p>
                    </div>
                    <div className={styles.subscriptionBadge}>
                        Subscription Active • Expires Dec 15, 2025
                    </div>
                </header>

                {/* Children Cards */}
                <section className={styles.childrenGrid}>
                    {loading ? (
                        <p>Loading students...</p>
                    ) : students.length === 0 ? (
                        <div className="col-span-full text-center py-10">
                            <p className="text-gray-500 mb-4">You haven't added any students yet.</p>
                            <Link href="/dashboard/parent/add-student" className={styles.startSessionBtn}>
                                Add Your First Child
                            </Link>
                        </div>
                    ) : (
                        students.map((student) => (
                            <div key={student.id} className={styles.childCard}>
                                <div className={styles.childCardHeader}>
                                    <div className={styles.childInfo}>
                                        <div className={`${styles.childAvatar} ${styles.childAvatarYellow}`}>
                                            {student.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className={styles.childName}>{student.name}</h3>
                                            <p className={styles.childDetails}>Class {student.grade} • {student.language}</p>
                                        </div>
                                    </div>
                                    <Link href={`/dashboard/parent/child/${student.id}`} className={styles.viewDetailsLink}>View Details →</Link>
                                </div>
                                <div className={styles.childCardBody}>
                                    <div className={styles.progressRow}>
                                        <span className={styles.progressLabel}>This week</span>
                                        <span className={styles.progressValue}>0 concepts completed</span>
                                    </div>
                                    <div className={styles.statusBox}>
                                        <span className={styles.statusSuccess}>🌟 Ready to learn</span>
                                    </div>
                                    <button className={styles.startSessionBtn}>
                                        Start Learning Session
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </section>

                {/* Quick Actions & Activity Feed */}
                <div className={styles.dashboardGrid}>
                    {/* Quick Actions */}
                    <section className={styles.quickActionsSection}>
                        <h2 className={styles.sectionTitle}>Quick Actions</h2>
                        <Link href="/dashboard/parent/add-student" className={styles.actionBtn}>
                            <span className={styles.actionIcon}>➕</span> Add Another Child
                        </Link>
                        <button className={styles.actionBtn}>
                            <span className={styles.actionIcon}>💳</span> Manage Subscription
                        </button>
                        <button className={styles.actionBtn}>
                            <span className={styles.actionIcon}>📄</span> Download Reports
                        </button>
                    </section>

                    {/* Activity Feed */}
                    <section className={styles.activityFeedSection}>
                        <h2 className={styles.sectionTitle}>Recent Activity</h2>
                        <div className={styles.activityFeed}>
                            <div className={styles.activityItem}>
                                <div className={`${styles.activityDot} ${styles.dotBlue}`}></div>
                                <div>
                                    <p className={styles.activityText}><span className={styles.activityHighlight}>System</span>: Welcome to EduPlatform!</p>
                                    <p className={styles.activityTime}>Just now</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
