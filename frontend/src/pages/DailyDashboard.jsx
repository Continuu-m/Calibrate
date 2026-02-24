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
        <div className="flex h-screen overflow-hidden">
            <AddTaskModal isOpen={isAddTaskOpen} onClose={() => { setIsAddTaskOpen(false); fetchTasks(); }} />
            <TaskReflectionPanel isOpen={isReflectionOpen} onClose={() => setIsReflectionOpen(false)} />

            {/* Sidebar */}
            <aside className="w-64 border-r border-border-light dark:border-border-dark flex flex-col bg-surface-light dark:bg-surface-dark shrink-0">
                <div className="p-6">
                    <h1 className="text-2xl text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined">tune</span> Calibrate
                    </h1>
                    <p className="text-xs text-secondary mt-1 tracking-tight">Reality Checker</p>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-1">
                    <Link to="/"><NavItem icon="calendar_today" label="Today" active /></Link>
                    <Link to="/weekly"><NavItem icon="calendar_month" label="This Week" /></Link>
                    <Link to="/completed"><NavItem icon="check_circle" label="Completed" /></Link>
                    <Link to="/insights"><NavItem icon="bar_chart" label="Insights" /></Link>
                    <Link to="/settings"><NavItem icon="settings" label="Settings" /></Link>
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

            <main className="flex-1 flex flex-col overflow-y-auto">
                {capacityPercent > (user?.preferences?.alert_caution_threshold || 80) && (
                    <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-6 py-2 text-xs flex justify-between items-center border-b border-red-200 dark:border-red-800/50">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            <span>You're close to your limit. Consider deferring your lowest priority tasks to tomorrow.</span>
                        </div>
                        <button className="material-symbols-outlined text-sm">close</button>
                    </div>
                )}

                <div className="px-12 py-8 max-w-4xl mx-auto w-full space-y-8">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs font-bold uppercase text-secondary tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                            <h2 className="text-5xl">Today's Focus</h2>
                        </div>
                        <button
                            onClick={() => setIsAddTaskOpen(true)}
                            className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">add</span> Add Task
                        </button>
                    </div>

                    <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark p-8 space-y-6 shadow-sm">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl">Today's Capacity</h3>
                            {capacityPercent >= 80 && (
                                <span className="text-primary text-xs font-bold uppercase flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">bolt</span> Cutting it close
                                </span>
                            )}
                        </div>

                        <div className="h-4 bg-stone-100 dark:bg-stone-800 w-full relative">
                            <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-500" style={{ width: `${capacityPercent}%` }}></div>
                            <div className="absolute top-0 right-0 h-full bg-stone-200/50 flex transition-all duration-500" style={{ width: `${100 - capacityPercent}%`, background: 'repeating-linear-gradient(45deg, #e5e5e5, #e5e5e5 10px, #f2f2f2 10px, #f2f2f2 20px)' }}></div>
                            <span className="absolute top-full mt-1 right-0 sm:right-auto text-[10px] font-bold text-white bg-primary px-1 transition-all duration-500" style={{ left: `max(0%, calc(${capacityPercent}% - 30px))` }}>{capacityPercent}%</span>
                        </div>

                        <div className="grid grid-cols-3 gap-8 pt-4">
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
        <div className="border-l border-border-light dark:border-border-dark pl-4">
            <p className="text-[10px] font-bold uppercase text-secondary tracking-widest">{label}</p>
            <p className={`text-xl font-sans mt-1 ${highlight ? 'text-primary' : ''}`}>{value}</p>
        </div>
    )
}

function TaskItem({ title, duration, priority, subtasks, category, color, suggested }) {
    return (
        <div className={`bg-white dark:bg-surface-dark border border-border-white dark:border-border-dark border-l-4 ${color} p-4 shadow-sm flex items-center justify-between`}>
            <div className="flex items-center gap-4">
                <div className="w-5 h-5 border-2 border-stone-200 dark:border-stone-700 rounded-full shrink-0"></div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${priority === 'URGENT' ? 'bg-red-50 text-red-600' : 'bg-stone-50 text-stone-500'}`}>
                            {priority}
                        </span>
                        <p className={`text-sm font-bold truncate ${suggested ? 'text-stone-400 line-through' : ''}`}>{title}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-secondary flex-wrap">
                        <span className="flex items-center gap-1 whitespace-nowrap"><span className="material-symbols-outlined text-[12px]">account_tree</span> {subtasks} subtasks</span>
                        <span className="flex items-center gap-1 whitespace-nowrap"><span className="material-symbols-outlined text-[12px]">folder</span> {category.replace('_', ' ')}</span>
                        {suggested && <span className="text-primary font-bold">● Suggested deferral</span>}
                    </div>
                </div>
            </div>
            <div className="text-stone-400 text-xs font-bold bg-stone-50 dark:bg-stone-800 px-3 py-1 border border-stone-100 dark:border-stone-700 shrink-0 ml-2">
                {duration}
            </div>
        </div>
    )
}
