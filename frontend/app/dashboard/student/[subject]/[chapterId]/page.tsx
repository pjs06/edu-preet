'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ChapterPage() {
    const params = useParams();
    const { subject, chapterId } = params;
    const [concepts, setConcepts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConcepts = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/curriculum/${chapterId}/concepts`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await res.json();
                // Ensure data is an array (it might be null or undefined if JSONB is empty)
                setConcepts(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to fetch concepts', err);
            } finally {
                setLoading(false);
            }
        };

        if (chapterId) {
            fetchConcepts();
        }
    }, [chapterId]);

    if (loading) return <div className="p-8">Loading concepts...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <Link href={`/dashboard/student/${subject}`} className="text-gray-500 hover:text-gray-700 text-sm mb-4 inline-block">← Back to Chapters</Link>
                    <h1 className="text-3xl font-bold text-gray-900">Chapter Concepts</h1>
                </header>

                <div className="space-y-4">
                    {concepts.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-500">
                            No concepts found in this chapter.
                        </div>
                    ) : (
                        concepts.map((concept, index) => (
                            <Link
                                key={index}
                                // For demo purposes, we link directly to the adaptive learn page
                                // In a real app, we would use the actual concept.id
                                href={`/learn?conceptId=module_001&sessionId=demo_${Date.now()}`}
                                className="block bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group"
                            >
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-4 group-hover:bg-blue-600 group-hover:text-white transition">
                                        {index + 1}
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">{concept.title || concept.name}</h3>
                                        <p className="text-gray-600 text-sm mt-1">{concept.description}</p>
                                    </div>
                                    <div className="flex-shrink-0 self-center">
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Start Learning</span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
