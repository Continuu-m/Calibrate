export default function AddTaskModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-xl bg-white dark:bg-surface-dark h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <header className="px-8 py-6 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                    <h2 className="text-sm font-bold uppercase tracking-widest">New Task</h2>
                    <button onClick={onClose} className="material-symbols-outlined text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">close</button>
                </header>

                <div className="flex-1 overflow-y-auto px-8 py-10 space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl text-stone-300 dark:text-stone-700">What needs to get done?</h1>
                        <input type="text" placeholder="Type task name..." className="w-full text-4xl bg-transparent border-none p-0 focus:ring-0 placeholder-stone-200 dark:placeholder-stone-800" />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">Due Date</label>
                            <div className="flex items-center gap-2 border border-border-light dark:border-border-dark p-3 bg-stone-50/50 dark:bg-stone-900/50">
                                <span className="material-symbols-outlined text-stone-400 text-sm">calendar_today</span>
                                <span className="text-sm">Today, Oct 24</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">My Estimate</label>
                            <div className="flex items-center gap-2 border border-border-light dark:border-border-dark p-3 bg-stone-50/50 dark:bg-stone-900/50">
                                <input type="text" defaultValue="45" className="w-10 bg-transparent border-none p-0 text-sm focus:ring-0 text-center" />
                                <span className="text-stone-300">|</span>
                                <select className="bg-transparent border-none text-sm p-0 focus:ring-0">
                                    <option>min</option>
                                    <option>hr</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">Priority</label>
                        <div className="flex gap-2">
                            {['Low', 'Medium', 'High', 'Urgent'].map(p => (
                                <button key={p} className={`flex-1 py-2 text-xs font-bold border ${p === 'Medium' ? 'bg-red-50 text-primary border-primary' : 'bg-white dark:bg-stone-900 text-stone-400 border-border-light dark:border-border-dark'}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">Description</label>
                        <textarea placeholder="Add details, links, or context..." className="w-full min-h-[120px] bg-stone-50/50 dark:bg-stone-900/50 border border-border-light dark:border-border-dark p-4 text-sm focus:ring-primary focus:border-primary resize-none"></textarea>
                    </div>

                    <div className="bg-stone-50/50 dark:bg-stone-900/50 border border-border-light dark:border-border-dark p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-red-600">
                                <span className="material-symbols-outlined text-lg">temp_preferences_custom</span>
                                <span className="text-xs font-bold uppercase tracking-widest">AI Breakdown</span>
                            </div>
                            <button className="text-[10px] font-bold uppercase text-primary flex items-center gap-1">REGENERATE <span className="material-symbols-outlined text-xs">refresh</span></button>
                        </div>

                        <div className="bg-white dark:bg-surface-dark border border-red-100 dark:border-red-900/50 p-4 flex items-center gap-4">
                            <span className="material-symbols-outlined text-red-600">bolt</span>
                            <div>
                                <p className="text-xs font-medium">Realistic estimate: <span className="text-red-600 font-bold">2h 20min</span></p>
                                <p className="text-[10px] text-stone-400">Optimistic: 1h 40min | Worst case: 3h 00min</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 border-2 border-primary bg-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-[12px]">check</span>
                            </div>
                            <span className="text-xs">Research competitor examples</span>
                            <span className="ml-auto text-[10px] text-stone-400 tabular-nums">25 min</span>
                        </div>
                    </div>
                </div>

                <footer className="p-8 border-t border-border-light dark:border-border-dark bg-stone-50/30 dark:bg-stone-900/30 grid grid-cols-1 gap-3">
                    <button className="w-full bg-primary hover:bg-red-700 text-white font-bold uppercase text-sm tracking-widest py-4 transition-colors">
                        Add to Today
                    </button>
                    <button className="w-full bg-transparent border border-border-light dark:border-border-dark hover:bg-white dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold uppercase text-sm tracking-widest py-4 transition-colors">
                        Schedule for Later
                    </button>
                </footer>
            </div>
        </div>
    )
}
