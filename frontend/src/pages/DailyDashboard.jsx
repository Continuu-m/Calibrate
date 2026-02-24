import { useState } from 'react'
import { Link } from 'react-router-dom'
import { userData } from '../data/mockData'
import AddTaskModal from '../components/AddTaskModal'
import TaskReflectionPanel from '../components/TaskReflectionPanel'

export default function DailyDashboard() {
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [isReflectionOpen, setIsReflectionOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden">
            <AddTaskModal isOpen={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} />
            <TaskReflectionPanel isOpen={isReflectionOpen} onClose={() => setIsReflectionOpen(false)} />

            {/* Sidebar Placeholder */}
            <aside className="w-64 border-r border-border-light dark:border-border-dark flex flex-col bg-surface-light dark:bg-surface-dark">
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
                            className="w-10 h-10 bg-center bg-no-repeat bg-cover rounded-full border border-border-light dark:border-border-dark"
                            style={{ backgroundImage: `url(${userData.avatar})` }}
                        ></div>
                        <div>
                            <p className="text-sm font-bold">{userData.name}</p>
                            <p className="text-[10px] text-secondary">{userData.plan}</p>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-y-auto">
                <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-6 py-2 text-xs flex justify-between items-center border-b border-red-200 dark:border-red-800/50">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        <span>You're close to your limit. Consider deferring <span className="underline">Update personal portfolio</span> to tomorrow.</span>
                    </div>
                    <button className="material-symbols-outlined text-sm">close</button>
                </div>

                <div className="px-12 py-8 max-w-4xl mx-auto w-full space-y-8">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs font-bold uppercase text-secondary tracking-widest">Tuesday, Oct 24</p>
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
                            <span className="text-primary text-xs font-bold uppercase flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">bolt</span> Cutting it close
                            </span>
                        </div>

                        <div className="h-4 bg-stone-100 dark:bg-stone-800 w-full relative">
                            <div className="absolute top-0 left-0 h-full bg-primary" style={{ width: '87%' }}></div>
                            <div className="absolute top-0 right-0 h-full w-[13%] bg-stone-200/50 flex" style={{ background: 'repeating-linear-gradient(45deg, #e5e5e5, #e5e5e5 10px, #f2f2f2 10px, #f2f2f2 20px)' }}></div>
                            <span className="absolute top-full mt-1 right-[13%] text-[10px] font-bold text-white bg-primary px-1">87%</span>
                        </div>

                        <div className="grid grid-cols-3 gap-8 pt-4">
                            <Stat label="Available" value="5h 20min" />
                            <Stat label="Planned" value="4h 38min" />
                            <Stat label="Buffer" value="42min" highlight />
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
                            <div onClick={() => setIsReflectionOpen(true)} className="cursor-pointer">
                                <TaskItem
                                    title="Finalize investor pitch deck"
                                    duration="2h 00min"
                                    priority="URGENT"
                                    subtasks={3}
                                    category="Fundraising"
                                    color="border-l-primary"
                                />
                            </div>
                            <TaskItem
                                title="Review backend PR"
                                duration="45min"
                                priority="HIGH"
                                subtasks={2}
                                category="Development"
                                color="border-l-orange-400"
                            />
                            <TaskItem
                                title="Weekly team sync notes"
                                duration="30min"
                                priority="MEDIUM"
                                subtasks={0}
                                category="Admin"
                                color="border-l-blue-400"
                            />
                            <TaskItem
                                title="Update personal portfolio"
                                duration="1h 15min"
                                priority="LOW"
                                subtasks={0}
                                category="Personal"
                                color="border-l-stone-400"
                                suggested
                            />
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
                <div className="w-5 h-5 border-2 border-stone-200 dark:border-stone-700 rounded-full"></div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${priority === 'URGENT' ? 'bg-red-50 text-red-600' : 'bg-stone-50 text-stone-500'}`}>
                            {priority}
                        </span>
                        <p className={`text-sm font-bold ${suggested ? 'text-stone-400 line-through' : ''}`}>{title}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-secondary">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">account_tree</span> {subtasks} subtasks</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">folder</span> {category}</span>
                        {suggested && <span className="text-primary font-bold">● Suggested deferral</span>}
                    </div>
                </div>
            </div>
            <div className="text-stone-400 text-xs font-bold bg-stone-50 dark:bg-stone-800 px-3 py-1 border border-stone-100 dark:border-stone-700">
                {duration}
            </div>
        </div>
    )
}
