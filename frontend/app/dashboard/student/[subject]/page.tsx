'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function SubjectPage() {
    const params = useParams();
    const subject = params.subject as string;
    const [chapters, setChapters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChapters = async () => {
            try {
                const token = localStorage.getItem('token');
                // Fetch chapters for this subject
                const res = await fetch(`/api/curriculum?subject=${subject}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.status === 401) {
                    // Handle unauthorized (maybe redirect to login)
                    console.error('Unauthorized');
                    return;
                }
                const data = await res.json();
                setChapters(data);
            } catch (err) {
                console.error('Failed to fetch chapters', err);
            } finally {
                setLoading(false);
            }
        };

        if (subject) {
            fetchChapters();
        }
    }, [subject]);

    if (loading) return <div className="p-8">Loading chapters...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <Link href="/dashboard/student" className="text-gray-500 hover:text-gray-700 text-sm mb-4 inline-block">← Back to Dashboard</Link>
                    <h1 className="text-3xl font-bold text-gray-900 capitalize">{subject} Curriculum</h1>
                </header>

                <div className="grid gap-6">
                    {chapters.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-500">
                            No chapters found for {subject}.
                        </div>
                    ) : (
                        chapters.map((chapter) => (
                            <Link
                                key={chapter.id}
                                href={`/dashboard/student/${subject}/${chapter.id}`}
                                className="block bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="text-sm font-medium text-blue-600 mb-1 block">Chapter {chapter.chapter_number}</span>
                                        <h2 className="text-xl font-bold text-gray-900">{chapter.chapter_title}</h2>
                                        <p className="text-gray-600 mt-1">{chapter.grade}th Grade</p>
                                    </div>
                                    <div className="text-gray-400">→</div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
