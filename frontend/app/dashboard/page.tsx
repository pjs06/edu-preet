'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
        } else {
            const user = JSON.parse(storedUser);
            if (user.role === 'student') {
                router.push('/dashboard/student');
            } else {
                router.push('/dashboard/parent');
            }
        }
    }, [router]);

    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
}
