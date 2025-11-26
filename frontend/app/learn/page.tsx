'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LearnContent() {
    const [concept, setConcept] = useState<any>(null);
    const [explanation, setExplanation] = useState('');
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('sessionId');

    useEffect(() => {
        if (sessionId) {
            // Fetch current concept and explanation
            // For now, mocking the fetch
            setLoading(false);
            setConcept({ title: 'Introduction to Fractions', id: 'fractions-intro' });
            setExplanation('Fractions represent parts of a whole. For example, if you cut a pizza into 4 slices and eat 1, you have eaten 1/4 of the pizza.');
        } else {
            setLoading(false); // Stop loading if no session ID
        }
    }, [sessionId]);

    const handleNext = () => {
        // Logic to move to next concept
        alert('Moving to next concept...');
    };

    if (loading) return <div className="p-8 text-center">Loading learning session...</div>;
    if (!concept) return <div className="p-8 text-center">No active session found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow p-4 flex justify-between items-center border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">Learning Session</h1>
                <div className="text-sm font-medium text-gray-700">Session ID: {sessionId}</div>
            </header>

            <main className="flex-grow p-8 max-w-4xl mx-auto w-full">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-3xl font-bold text-gray-900">{concept.title}</h2>
                    </div>

                    <div className="p-6">
                        <div className="prose max-w-none mb-8">
                            <p className="text-xl leading-relaxed text-gray-800">{explanation}</p>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-md border-l-4 border-blue-600 mb-8">
                            <h3 className="font-bold text-blue-900 mb-2 text-lg">AI Explanation</h3>
                            <p className="text-blue-900 text-lg">
                                Imagine you have a chocolate bar with 4 pieces. If you give 1 piece to your friend, you gave them 1/4 of the chocolate bar.
                            </p>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button className="px-6 py-3 border-2 border-gray-400 rounded-lg text-gray-800 font-bold hover:bg-gray-100 focus:ring-4 focus:ring-gray-200">
                                I'm Stuck
                            </button>
                            <button
                                onClick={handleNext}
                                className="px-8 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 font-bold shadow-md focus:ring-4 focus:ring-green-300"
                            >
                                Next Concept
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function LearnPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <LearnContent />
        </Suspense>
    );
}
