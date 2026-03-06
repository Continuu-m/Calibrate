import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TaskReflectionPanel from '../components/TaskReflectionPanel'
import TaskService from '../services/TaskService'

export default function Completed() {
    const { user, token, logout } = useAuth();
    const [isReflectionOpen, setIsReflectionOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) {
            fetchCompletedTasks();
        }
    }, [token]);

    const fetchCompletedTasks = async () => {
        try {
            setLoading(true);
            const data = await TaskService.getTasks(token, 'completed');
            setTasks(data.tasks || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Group tasks by date
    const groupedTasks = tasks.reduce((groups, task) => {
        const date = task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'Unknown';
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(task);
        return groups;
    }, {});

    const formatDateHeader = (dateStr) => {
        if (dateStr === 'Unknown') return 'Recently Completed';
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    };

    const formatTime = (mins) => {
        if (!mins) return '0min';
        const h = Math.floor(mins / 60);
        const m = Math.round(mins % 60);
        return `${h > 0 ? h + 'h ' : ''}${m}min`;
    };

    return (
        <div className="flex h-screen overflow-hidden relative">
            <TaskReflectionPanel
                isOpen={isReflectionOpen}
                onClose={() => { setIsReflectionOpen(false); setSelectedTask(null); }}
                task={selectedTask}
                onTaskUpdated={fetchCompletedTasks}
            />

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark flex items-center justify-between px-4 z-40">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="material-symbols-outlined text-secondary hover:text-primary transition-colors"
                    >
                        menu
                    </button>
                    <h1 className="text-xl text-primary flex items-center gap-1 font-serif">
                        <span className="material-symbols-outlined text-2xl">tune</span> Calibrate
                    </h1>
                </div>
            </header>

            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:relative inset-y-0 left-0 z-50 w-64 border-r border-border-light dark:border-border-dark flex flex-col bg-surface-light dark:bg-surface-dark shrink-0 transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl text-primary flex items-center gap-2">
                            <span className="material-symbols-outlined">tune</span> Calibrate
                        </h1>
                        <p className="text-xs text-secondary mt-1 tracking-tight">Reality Checker</p>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden material-symbols-outlined text-stone-400 hover:text-stone-900 dark:hover:text-white"
                    >
                        close
                    </button>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-1">
                    <Link to="/" onClick={() => setIsSidebarOpen(false)}><NavItem icon="calendar_today" label="Today" /></Link>
                    <Link to="/weekly" onClick={() => setIsSidebarOpen(false)}><NavItem icon="calendar_month" label="This Week" /></Link>
                    <Link to="/completed" onClick={() => setIsSidebarOpen(false)}><NavItem icon="check_circle" label="Completed" active /></Link>
                    <Link to="/insights" onClick={() => setIsSidebarOpen(false)}><NavItem icon="bar_chart" label="Insights" /></Link>
                    <Link to="/settings" onClick={() => setIsSidebarOpen(false)}><NavItem icon="settings" label="Settings" /></Link>
                </nav>
                <div className="p-4 border-t border-border-light dark:border-border-dark">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 bg-center bg-no-repeat bg-cover rounded-full border border-border-light dark:border-border-dark bg-stone-200 flex items-center justify-center text-stone-500 font-bold"
                            style={{ backgroundImage: user?.avatar ? `url(${user.avatar})` : 'none' }}
                        >
                            {!user?.avatar && user?.full_name?.charAt(0)}
                        </div>
                        <div className="min-w-0 pr-2">
                            <p className="text-sm font-bold truncate">{user?.full_name || 'User'}</p>
                            <p className="text-[10px] text-secondary truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="ml-auto text-secondary hover:text-primary transition-colors shrink-0"
                            title="Logout"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-y-auto pt-16 lg:pt-0">
                <div className="px-4 sm:px-12 py-8 max-w-4xl mx-auto w-full space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                        <div>
                            <p className="text-[10px] sm:text-xs font-bold uppercase text-secondary tracking-widest">History</p>
                            <h2 className="text-3xl sm:text-5xl">Completed Tasks</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark p-6 shadow-sm">
                            <p className="text-[10px] font-bold uppercase text-secondary tracking-widest">Total Completed</p>
                            <p className="text-3xl font-serif mt-2">{tasks.length}</p>
                        </div>
                        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark p-6 shadow-sm">
                            <p className="text-[10px] font-bold uppercase text-secondary tracking-widest">Accuracy</p>
                            <p className="text-3xl font-serif mt-2">84%</p>
                            <p className="text-[10px] text-emerald-500 font-bold mt-1">Improving</p>
                        </div>
                        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark p-6 shadow-sm">
                            <p className="text-[10px] font-bold uppercase text-secondary tracking-widest">Focus Time</p>
                            <p className="text-3xl font-serif mt-2">{formatTime(tasks.reduce((acc, t) => acc + (t.actual_time || 0), 0))}</p>
                        </div>
                    </div>

                    <div className="space-y-12">
                        {loading ? (
                            <div className="text-center py-8 text-stone-500 text-sm animate-pulse">Loading history...</div>
                        ) : error ? (
                            <div className="text-center py-8 text-red-500 text-sm border border-red-100 bg-red-50 p-4">{error}</div>
                        ) : tasks.length === 0 ? (
                            <div className="text-center py-20 border border-dashed border-stone-200 dark:border-stone-800">
                                <p className="text-stone-500 text-sm italic">"The journey of a thousand tasks begins with one completion."</p>
                                <Link to="/" className="mt-4 inline-block text-xs font-bold text-primary uppercase hover:underline">Go finish some tasks</Link>
                            </div>
                        ) : (
                            Object.entries(groupedTasks).map(([date, tasksInGroup]) => (
                                <div key={date} className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-xs font-bold uppercase text-stone-400 tracking-widest whitespace-nowrap">{formatDateHeader(date)}</h3>
                                        <div className="h-px bg-stone-100 dark:bg-stone-800 w-full"></div>
                                    </div>
                                    <div className="space-y-3">
                                        {tasksInGroup.map((task) => (
                                            <div key={task.id} onClick={() => { setSelectedTask(task); setIsReflectionOpen(true); }} className="cursor-pointer group">
                                                <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark p-4 shadow-sm flex items-center justify-between gap-4 transition-all hover:border-emerald-200 dark:hover:border-emerald-900/50 hover:shadow-md">
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center rounded-full shrink-0">
                                                            <span className="material-symbols-outlined text-lg">check_circle</span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-stone-400 line-through truncate group-hover:text-stone-600 dark:group-hover:text-stone-200 transition-colors">{task.title}</p>
                                                            <div className="flex items-center gap-3 mt-1 text-[10px] text-secondary">
                                                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">schedule</span> Took {formatTime(task.actual_time)}</span>
                                                                <span className="text-stone-200">|</span>
                                                                <span className={task.actual_time > task.estimated_time ? 'text-orange-500' : 'text-emerald-500'}>
                                                                    {task.actual_time > task.estimated_time ? `+${task.actual_time - task.estimated_time}m over` : `-${task.estimated_time - task.actual_time}m under`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-[10px] font-bold uppercase text-stone-300 group-hover:text-stone-500 transition-colors">Review</p>
                                                        <span className="material-symbols-outlined text-sm text-stone-300 group-hover:text-primary transition-colors">arrow_forward_ios</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

function NavItem({ icon, label, active }) {
    return (
        <div className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${active ? 'bg-stone-100 dark:bg-stone-800 text-primary border-l-2 border-primary' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900'}`}>
            <span className="material-symbols-outlined text-xl">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
        </div>
    )
}
