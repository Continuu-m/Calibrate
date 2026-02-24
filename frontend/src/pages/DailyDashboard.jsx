import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AddTaskModal from '../components/AddTaskModal'
import TaskReflectionPanel from '../components/TaskReflectionPanel'
import TaskService from '../services/TaskService'
// Remove mock data import: import userData  from '../data/mockData'

export default function DailyDashboard() {
    const { user, token, logout } = useAuth();
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [isReflectionOpen, setIsReflectionOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) {
            fetchTasks();
        }
    }, [token]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const data = await TaskService.getTasks(token, 'planned'); // Could also fetch all and filter client-side
            setTasks(data.tasks || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Calculate dynamic stats
    const totalCurrentCapacityMins = user?.preferences?.work_hours_per_day ? user.preferences.work_hours_per_day * 60 : 8 * 60; // default 8h
    const plannedMins = tasks.reduce((total, task) => total + (task.estimated_time || 0), 0);
    const bufferMins = Math.max(0, totalCurrentCapacityMins - plannedMins);

    const capacityPercent = Math.min(100, Math.round((plannedMins / totalCurrentCapacityMins) * 100)) || 0;

    // Format minutes to "Xh Ymin"
    const formatTime = (mins) => {
        if (!mins) return '0min';
        const h = Math.floor(mins / 60);
        const m = Math.round(mins % 60);
        return `${h > 0 ? h + 'h ' : ''}${m}min`;
    };

    // Helper to map backend priority to color
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'border-l-primary';
            case 'high': return 'border-l-orange-400';
            case 'medium': return 'border-l-blue-400';
            case 'low':
            default:
                return 'border-l-stone-400';
        }
    };

    return (
        <div className="flex h-screen overflow-hidden relative">
            <AddTaskModal isOpen={isAddTaskOpen} onClose={() => { setIsAddTaskOpen(false); fetchTasks(); }} />
            <TaskReflectionPanel isOpen={isReflectionOpen} onClose={() => setIsReflectionOpen(false)} />

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
                <button
                    onClick={() => setIsAddTaskOpen(true)}
                    className="bg-primary text-white p-2 rounded-sm flex items-center justify-center shadow-sm"
                >
                    <span className="material-symbols-outlined">add</span>
                </button>
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
                    <Link to="/" onClick={() => setIsSidebarOpen(false)}><NavItem icon="calendar_today" label="Today" active /></Link>
                    <Link to="/weekly" onClick={() => setIsSidebarOpen(false)}><NavItem icon="calendar_month" label="This Week" /></Link>
                    <Link to="/completed" onClick={() => setIsSidebarOpen(false)}><NavItem icon="check_circle" label="Completed" /></Link>
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
                {capacityPercent > (user?.preferences?.alert_caution_threshold || 80) && (
                    <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-6 py-2 text-xs flex justify-between items-center border-b border-red-200 dark:border-red-800/50">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            <span>You're close to your limit. Consider deferring your lowest priority tasks to tomorrow.</span>
                        </div>
                        <button className="material-symbols-outlined text-sm">close</button>
                    </div>
                )}

                <div className="px-4 sm:px-12 py-8 max-w-4xl mx-auto w-full space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                        <div>
                            <p className="text-[10px] sm:text-xs font-bold uppercase text-secondary tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                            <h2 className="text-3xl sm:text-5xl">Today's Focus</h2>
                        </div>
                        <button
                            onClick={() => setIsAddTaskOpen(true)}
                            className="hidden sm:flex bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-4 py-2 text-xs font-bold uppercase tracking-wider items-center gap-2 shadow-md active:scale-95 transition-transform"
                        >
                            <span className="material-symbols-outlined text-sm">add</span> Add Task
                        </button>
                    </div>

                    <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark p-4 sm:p-8 space-y-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="flex justify-between items-center relative z-10">
                            <h3 className="text-lg sm:text-xl">Today's Capacity</h3>
                            {capacityPercent >= 80 && (
                                <span className="text-primary text-[10px] sm:text-xs font-bold uppercase flex items-center gap-1">
                                    <span className="material-symbols-outlined text-base sm:text-sm">bolt</span> <span className="hidden xs:inline">Cutting it close</span>
                                </span>
                            )}
                        </div>

                        <div className="h-4 bg-stone-100 dark:bg-stone-800 w-full relative z-10">
                            <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-500" style={{ width: `${capacityPercent}%` }}></div>
                            <div className="absolute top-0 right-0 h-full bg-stone-200/50 flex transition-all duration-500" style={{ width: `${100 - capacityPercent}%`, background: 'repeating-linear-gradient(45deg, #e5e5e5, #e5e5e5 10px, #f2f2f2 10px, #f2f2f2 20px)' }}></div>
                            <span className="absolute top-full mt-1 text-[10px] font-bold text-white bg-primary px-1 transition-all duration-500" style={{ left: `max(0%, min(calc(100% - 30px), calc(${capacityPercent}% - 15px)))` }}>{capacityPercent}%</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 pt-4 relative z-10">
                            <Stat label="Available" value={formatTime(totalCurrentCapacityMins)} />
                            <Stat label="Planned" value={formatTime(plannedMins)} />
                            <Stat label="Buffer" value={formatTime(bufferMins)} highlight={bufferMins < 60} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-serif">Queue</h3>
                            <div className="flex gap-4 text-[10px] font-bold uppercase text-stone-400">
                                <span>Priority</span>
                                <span>Duration</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {loading ? (
                                <div className="text-center py-8 text-stone-500 text-sm">Loading tasks...</div>
                            ) : error ? (
                                <div className="text-center py-8 text-red-500 text-sm">{error}</div>
                            ) : tasks.length === 0 ? (
                                <div className="text-center py-12 border border-dashed border-stone-200 dark:border-stone-800">
                                    <p className="text-stone-500 text-sm">No tasks planned for today.</p>
                                    <button
                                        onClick={() => setIsAddTaskOpen(true)}
                                        className="mt-4 text-xs font-bold text-primary uppercase"
                                    >
                                        Add your first task
                                    </button>
                                </div>
                            ) : (
                                tasks.map((task) => (
                                    <div key={task.id} onClick={() => setIsReflectionOpen(true)} className="cursor-pointer">
                                        <TaskItem
                                            title={task.title}
                                            duration={formatTime(task.estimated_time)}
                                            priority={(task.priority || 'medium').toUpperCase()}
                                            subtasks={task.subtasks?.length || 0}
                                            category={task.task_type || 'Task'}
                                            color={getPriorityColor(task.priority)}
                                            suggested={false} // Would require more complex logic to determine suggested deferral
                                        />
                                    </div>
                                ))
                            )}
                        </div>
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

function Stat({ label, value, highlight }) {
    return (
        <div className="border-l border-border-light dark:border-border-dark pl-4 py-1 sm:py-0">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase text-secondary tracking-widest">{label}</p>
            <p className={`text-lg sm:text-xl font-sans mt-0 sm:mt-1 ${highlight ? 'text-primary' : ''}`}>{value}</p>
        </div>
    )
}

function TaskItem({ title, duration, priority, subtasks, category, color, suggested }) {
    return (
        <div className={`bg-white dark:bg-surface-dark border border-border-white dark:border-border-dark border-l-4 ${color} p-3 sm:p-4 shadow-sm flex items-center justify-between gap-3`}>
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-5 h-5 border-2 border-stone-200 dark:border-stone-700 rounded-full shrink-0"></div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${priority === 'URGENT' ? 'bg-red-50 text-red-600' : 'bg-stone-50 text-stone-500'}`}>
                            {priority}
                        </span>
                        <p className={`text-xs sm:text-sm font-bold truncate ${suggested ? 'text-stone-400 line-through' : ''}`}>{title}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 mt-1 text-[9px] sm:text-[10px] text-secondary flex-wrap">
                        <span className="flex items-center gap-1 whitespace-nowrap"><span className="material-symbols-outlined text-[10px] sm:text-[12px]">account_tree</span> {subtasks} <span className="hidden xs:inline">subtasks</span></span>
                        <span className="flex items-center gap-1 whitespace-nowrap"><span className="material-symbols-outlined text-[10px] sm:text-[12px]">folder</span> {category.replace('_', ' ')}</span>
                        {suggested && <span className="text-primary font-bold">● Suggested <span className="hidden xs:inline">deferral</span></span>}
                    </div>
                </div>
            </div>
            <div className="text-stone-400 text-[10px] sm:text-xs font-bold bg-stone-50 dark:bg-stone-800 px-2 sm:px-3 py-1 border border-stone-100 dark:border-stone-700 shrink-0">
                {duration}
            </div>
        </div>
    )
}
