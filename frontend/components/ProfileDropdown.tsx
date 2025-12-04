'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../styles/ProfileDropdown.module.css';

interface ProfileDropdownProps {
    user: {
        email: string;
        name?: string;
        role?: string;
    };
    colorClass?: string; // e.g. "bg-blue-100 text-blue-700"
}

export default function ProfileDropdown({ user, colorClass = "bg-blue-100 text-blue-700" }: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleLogout = async () => {
        try {
            // Call backend logout (optional but good practice)
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login
            router.push('/login');
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className={`${styles.button} ${colorClass}`}
            >
                {(user.name || user.email)[0].toUpperCase()}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.userInfo}>
                        <p className={styles.userName}>{user.name || 'User'}</p>
                        <p className={styles.userEmail}>{user.email}</p>
                    </div>
                    <Link
                        href="/settings"
                        className={styles.link}
                        onClick={() => setIsOpen(false)}
                    >
                        Settings
                    </Link>
                    <button
                        onClick={handleLogout}
                        className={styles.logoutBtn}
                    >
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
}
