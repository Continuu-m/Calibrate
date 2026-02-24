import { useState } from 'react'
import { Link } from 'react-router-dom';
import { weeklyData } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import AddTaskModal from '../components/AddTaskModal';

export default function WeeklyCapacity() {
    const { user, logout } = useAuth();
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

    return (
        <div className="flex-1 flex flex-col">
            <AddTaskModal isOpen={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} />

            <header className="w-full border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-6 py-4 sticky top-0 z-50">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 text-stone-900 dark:text-stone-100">
                        <div className="size-6 text-primary">
                            <span className="material-symbols-outlined text-3xl">tune</span>
                        </div>
                        <h1 className="text-2xl tracking-tight">Calibrate</h1>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/" className="text-stone-600 dark:text-stone-300 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors">Dashboard</Link>
                        <Link to="/weekly" className="text-primary font-bold text-sm border-b-2 border-primary pb-0.5">Weekly View</Link>
                        <a className="text-stone-600 dark:text-stone-300 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="#">Settings</a>
                    </nav>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsAddTaskOpen(true)}
                            className="flex items-center justify-center h-10 px-6 bg-primary hover:bg-red-700 text-white text-sm font-bold uppercase tracking-wide transition-colors"
                        >
                            Add Task
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 border border-border-light dark:border-border-dark" style={{ backgroundImage: `url(${user?.avatar || 'https://via.placeholder.com/40'})` }}></div>
                            <button
                                onClick={logout}
                                className="text-secondary hover:text-primary transition-colors"
                                title="Logout"
                            >
                                <span className="material-symbols-outlined text-lg">logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-6 py-8 max-w-[1400px] mx-auto w-full flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border-light dark:border-border-dark pb-6">
                    <div>
                        <h2 className="text-4xl md:text-5xl text-stone-900 dark:text-stone-100 mb-2">Weekly Capacity</h2>
                        <p className="text-secondary dark:text-stone-400 font-sans text-lg">October 24 — October 30</p>
                    </div>
                    <div className="flex gap-8">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold uppercase text-secondary dark:text-stone-400 tracking-wider">Total Load</span>
                            <span className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">42 hrs</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold uppercase text-secondary dark:text-stone-400 tracking-wider">Balance</span>
                            <span className="text-2xl font-bold font-serif text-red-600">-5 hrs</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-4 md:gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark">
                    {weeklyData.map((day, idx) => (
                        <div key={idx} className={`${day.weekend ? 'bg-stone-100 dark:bg-[#1a0f0d] opacity-80' : day.overloaded ? 'bg-red-50/30 dark:bg-red-900/10 border-t-4 md:border-t-0 md:border-b-4 border-primary' : 'bg-surface-light dark:bg-surface-dark'} min-h-[500px] p-3 flex flex-col gap-3 group hover:bg-stone-50 dark:hover:bg-[#33201c] transition-colors relative`}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className={`block text-xs font-bold uppercase ${day.overloaded ? 'text-primary' : 'text-secondary dark:text-stone-400'}`}>{day.day}</span>
                                    <span className={`block text-xl font-serif font-bold ${day.weekend ? 'text-stone-500' : 'text-stone-900 dark:text-stone-100'}`}>{day.date}</span>
                                </div>
                                <span className={`text-xs font-bold px-1.5 py-0.5 border ${day.overloaded ? 'bg-primary text-white border-primary' : day.capacity > 75 ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 border-amber-100' : day.weekend ? 'text-stone-400 bg-white dark:bg-stone-800 border-stone-200' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>
                                    {day.capacity}%
                                </span>
                            </div>

                            <div className="w-1.5 h-full bg-stone-100 dark:bg-stone-800 relative mx-auto mb-4 hidden md:block">
                                <div className={`absolute bottom-0 left-0 w-full ${day.overloaded ? 'bg-primary' : day.capacity > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ height: `${Math.min(day.capacity, 100)}%` }}></div>
                                {day.overloaded && <div className="absolute -top-1 -left-1 size-3.5 bg-primary rounded-full border-2 border-white dark:border-stone-900 z-10"></div>}
                            </div>

                            <div className="flex flex-col gap-2">
                                {day.tasks.map((task, tIdx) => (
                                    task.type === 'empty' ? (
                                        <div key={tIdx} className="border-2 border-dashed border-stone-200 dark:border-stone-700 h-16 flex items-center justify-center">
                                            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">Free Slot</span>
                                        </div>
                                    ) : (
                                        <div key={tIdx} className={`${day.overloaded && task.warning ? 'bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800 border-l-primary relative' : 'bg-white dark:bg-stone-800'} border-l-4 ${task.type === 'personal' ? 'border-stone-300' : day.overloaded ? 'border-primary' : day.capacity > 75 ? 'border-amber-500' : 'border-emerald-500'} p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow`}>
                                            {task.warning && (
                                                <div className="absolute -right-1 -top-1 text-primary bg-white dark:bg-stone-800 rounded-full">
                                                    <span className="material-symbols-outlined text-[16px]">warning</span>
                                                </div>
                                            )}
                                            <p className={`text-xs font-bold ${day.weekend ? 'text-stone-500' : 'text-stone-900 dark:text-stone-100'} truncate`}>{task.title}</p>
                                            {task.time && <p className="text-[10px] text-secondary dark:text-stone-400">{task.time}</p>}
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[800px] px-6 z-50">
                    <div className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-primary">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-yellow-400 dark:text-yellow-600 mt-0.5">lightbulb</span>
                            <div>
                                <p className="font-bold text-sm sm:text-base">Wednesday looks overloaded.</p>
                                <p className="text-stone-400 dark:text-stone-600 text-xs sm:text-sm">Move "Write Report" to Thursday to balance your load?</p>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button className="flex-1 sm:flex-none text-stone-300 dark:text-stone-500 text-xs font-bold uppercase hover:text-white dark:hover:text-black transition-colors px-2">
                                Ignore
                            </button>
                            <button className="flex-1 sm:flex-none bg-primary hover:bg-red-700 text-white px-5 py-2 text-xs font-bold uppercase tracking-wide transition-colors">
                                Move It
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
