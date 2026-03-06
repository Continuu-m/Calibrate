import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TaskService from '../services/TaskService';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

export default function Insights() {
    const { token } = useAuth();
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const data = await TaskService.getInsights(token);
                setInsights(data);
            } catch (err) {
                console.error('Failed to fetch insights:', err);
                setError('Failed to load productivity metrics.');
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchInsights();
    }, [token]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Analysing your patterns...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 p-12">
                <div className="bg-red-50 text-red-600 p-4 font-bold text-sm border border-red-100 flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </div>
            </div>
        );
    }

    // Convert daily history dict to array for Recharts
    const chartData = Object.entries(insights.daily_accuracy_history || {})
        .map(([date, value]) => ({
            date: date.split('-').slice(1).join('/'), // MM/DD
            accuracy: value
        }))
        .reverse();

    return (
        <div className="flex-1 p-4 sm:p-12 max-w-5xl mx-auto w-full pb-24 space-y-12">
            <header className="space-y-4">
                <h1 className="text-3xl sm:text-5xl font-serif">Personal Insights</h1>
                <p className="text-secondary text-sm max-w-2xl">
                    Calibrate analyzes your performance patterns to help you build more realistic schedules.
                </p>
            </header>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <MetricCard
                    label="Overall Accuracy"
                    value={`${insights.overall_accuracy_percent}%`}
                    subtext="How often you meet estimates"
                    icon="target"
                    color="text-primary"
                />
                <MetricCard
                    label="Completed Tasks"
                    value={insights.total_completed_tasks}
                    subtext="Total wins this period"
                    icon="check_circle"
                    color="text-emerald-600"
                />
                <MetricCard
                    label="Total Focus"
                    value={`${Math.round(insights.total_focus_time_mins / 60)}h`}
                    subtext="Actual time invested"
                    icon="schedule_run"
                    color="text-stone-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Accuracy Chart */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-secondary border-b border-border-light dark:border-border-dark pb-2 mb-6">
                            7-Day Accuracy Trend
                        </h2>
                        <div className="h-64 w-full bg-white dark:bg-stone-900/50 border border-border-light dark:border-border-dark p-4 rounded-sm shadow-sm">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#6b7280' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#6b7280' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                fontSize: '10px',
                                                fontWeight: 'bold',
                                                border: 'none',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="accuracy"
                                            stroke="#ef4444"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorAcc)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center flex-col gap-2 text-secondary">
                                    <span className="material-symbols-outlined text-3xl">query_stats</span>
                                    <p className="text-[10px] font-bold uppercase">Not enough data yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Patterns Section */}
                <div className="space-y-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-secondary border-b border-border-light dark:border-border-dark pb-2 mb-6">
                        Systematic Biases
                    </h2>

                    <div className="space-y-4">
                        {insights.patterns && insights.patterns.length > 0 ? (
                            insights.patterns.map((pattern, idx) => (
                                <div key={idx} className="bg-red-50/50 dark:bg-red-900/10 border-l-4 border-primary p-4 flex gap-4 animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="w-8 h-8 bg-primary/10 flex items-center justify-center text-primary shrink-0 rounded-sm">
                                        <span className="material-symbols-outlined text-sm">
                                            {pattern.bias_percent > 0 ? 'trending_up' : 'trending_down'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                                            {pattern.category} PATTERN
                                        </p>
                                        <p className="text-xs text-stone-700 dark:text-stone-300 mt-1 leading-relaxed">
                                            {pattern.message}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-stone-50 dark:bg-stone-900/50 border border-dashed border-stone-200 dark:border-stone-800 p-12 text-center rounded-sm">
                                <span className="material-symbols-outlined text-stone-300 text-4xl mb-2">fingerprint</span>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                                    Complete more tasks to reveal patterns
                                </p>
                            </div>
                        )}

                        <div className="p-4 bg-stone-50 dark:bg-stone-900/50 text-[10px] text-secondary leading-relaxed border border-stone-100 dark:border-stone-800">
                            <strong>Note:</strong> Calibrate adjusts future AI estimates automatically based on these systematic biases to keep your schedule realistic.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, subtext, icon, color }) {
    return (
        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12 group-hover:scale-[2] transition-transform ${color}`}>
                <span className="material-symbols-outlined text-6xl">{icon}</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-2">{label}</p>
            <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-serif ${color}`}>{value}</span>
                <span className="material-symbols-outlined text-base opacity-20">{icon}</span>
            </div>
            <p className="text-[10px] text-stone-400 mt-2">{subtext}</p>
        </div>
    );
}
