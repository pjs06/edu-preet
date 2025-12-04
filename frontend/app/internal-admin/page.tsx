'use client';

import { useState, useEffect } from 'react';

export default function InternalAdminPage() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [adminKey, setAdminKey] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authError, setAuthError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchMetrics = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/admin/metrics', {
                    headers: { 'x-admin-key': adminKey }
                });
                if (res.status === 401) {
                    setIsAuthenticated(false);
                    setAuthError('Invalid Admin Key');
                    return;
                }
                const data = await res.json();
                setMetrics(data);
            } catch (err) {
                console.error('Failed to fetch metrics', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();


    }, [refreshKey, isAuthenticated, adminKey]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminKey) {
            setIsAuthenticated(true);
            setAuthError('');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center font-mono">
                <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-lg border border-gray-700 w-96">
                    <h1 className="text-xl font-bold text-green-400 mb-6 text-center">Admin Access</h1>
                    {authError && <p className="text-red-400 text-sm mb-4 text-center">{authError}</p>}
                    <input
                        type="password"
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        placeholder="Enter Admin Key"
                        className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded mb-4 focus:outline-none focus:border-green-500"
                    />
                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded font-bold transition">
                        Unlock Dashboard
                    </button>
                </form>
            </div>
        );
    }

    if (loading) return <div className="p-8 text-center">Loading System Metrics...</div>;
    if (!metrics) return <div className="p-8 text-center text-red-500">Failed to load metrics</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-mono">
            <header className="mb-8 flex justify-between items-center border-b border-gray-700 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-green-400">System Internals</h1>
                    <p className="text-gray-400 text-sm">Real-time Database Metrics</p>
                </div>
                <button
                    onClick={() => setRefreshKey(k => k + 1)}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded border border-gray-600"
                >
                    Refresh Now
                </button>
            </header>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard label="Total Users" value={metrics.counts.total_users} icon="👥" />
                <StatCard label="Students" value={metrics.counts.total_students} icon="🎓" />
                <StatCard label="Parents" value={metrics.counts.total_parents} icon="👨‍👩‍👧‍👦" />
                <StatCard label="Active Sessions" value={metrics.sessions.active_sessions || 0} icon="🟢" color="text-green-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Recent Activity Log */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    <div className="bg-gray-750 p-4 border-b border-gray-700 flex justify-between">
                        <h2 className="font-bold text-lg">Live Activity Feed</h2>
                        <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">Last 50 Events</span>
                    </div>
                    <div className="h-96 overflow-y-auto p-4 space-y-3">
                        {metrics.activity.map((log: any, i: number) => (
                            <div key={i} className="text-sm border-l-2 border-blue-500 pl-3 py-1">
                                <div className="flex justify-between text-gray-400 text-xs mb-1">
                                    <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                                    <span>{log.email}</span>
                                </div>
                                <div className="text-white">
                                    <span className="font-bold text-blue-300">{log.event_type}</span>: {log.event_action}
                                </div>
                                {log.metadata && (
                                    <pre className="text-xs text-gray-500 mt-1 overflow-x-auto">
                                        {JSON.stringify(log.metadata, null, 2)}
                                    </pre>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Performance & Features */}
                <div className="space-y-8">

                    {/* Feature Usage */}
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                        <h2 className="font-bold text-lg mb-4">Feature Usage Stats</h2>
                        <div className="space-y-4">
                            {metrics.features.map((feat: any, i: number) => (
                                <div key={i} className="flex items-center justify-between border-b border-gray-700 pb-2">
                                    <div>
                                        <p className="font-bold text-purple-300">{feat.feature_name}</p>
                                        <p className="text-xs text-gray-400">Success Rate: {((feat.success_count / feat.total_uses) * 100).toFixed(1)}%</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">{feat.total_uses}</p>
                                        <p className="text-xs text-gray-500">Uses</p>
                                    </div>
                                </div>
                            ))}
                            {metrics.features.length === 0 && <p className="text-gray-500">No feature usage recorded yet.</p>}
                        </div>
                    </div>

                    {/* Recent Learning Sessions */}
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                        <h2 className="font-bold text-lg mb-4">Recent Learning Sessions</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-gray-400 border-b border-gray-700">
                                    <tr>
                                        <th className="pb-2">Student</th>
                                        <th className="pb-2">Subject</th>
                                        <th className="pb-2">Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {metrics.performance.map((sess: any, i: number) => (
                                        <tr key={i}>
                                            <td className="py-2">{sess.student_name}</td>
                                            <td className="py-2">
                                                {sess.subject}
                                                <div className="text-xs text-gray-500">{sess.current_concept_id}</div>
                                            </td>
                                            <td className="py-2">
                                                <span className={sess.checkpoints_passed > 0 ? 'text-green-400' : 'text-gray-400'}>
                                                    {sess.checkpoints_passed}/{sess.checkpoints_attempted}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color = 'text-white' }: any) {
    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex items-center space-x-4">
            <div className="text-3xl">{icon}</div>
            <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
        </div>
    );
}
