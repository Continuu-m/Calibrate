export default function TaskReflectionPanel({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-xl bg-white dark:bg-surface-dark h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <header className="px-8 py-6 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                    <button onClick={onClose} className="material-symbols-outlined text-stone-400 hover:text-stone-900 dark:hover:text-white">close</button>
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">REFLECTION PANEL</h2>
                </header>

                <div className="flex-1 overflow-y-auto px-8 py-10 space-y-8">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">TASK COMPLETE</span>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl">Finalize investor pitch deck</h1>
                        <div className="flex items-center gap-2 text-stone-400 text-sm">
                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                            <span>Today, Oct 24</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-px bg-border-light dark:bg-border-dark pt-4 border-t border-border-light dark:border-border-dark">
                        <div className="bg-white dark:bg-surface-dark pr-4">
                            <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">ESTIMATED</label>
                            <p className="text-xl text-stone-300 font-sans mt-2">2h 00min</p>
                        </div>
                        <div className="bg-white dark:bg-surface-dark pl-4 border-l border-border-light dark:border-border-dark relative">
                            <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">ACTUAL TIME</label>
                            <p className="text-xl font-sans mt-2 border-b-2 border-primary inline-block">3h 15min</p>
                            <button className="material-symbols-outlined text-primary text-sm absolute right-0 bottom-1">edit</button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-medium">What made it take longer?</label>
                        <div className="grid grid-cols-2 gap-3">
                            <Option label="Interruptions" />
                            <Option label="Scope grew" active />
                            <Option label="Underestimated" />
                            <Option label="Other" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <textarea placeholder="Add a note..." className="w-full min-h-[140px] bg-stone-50/50 dark:bg-stone-900/50 border border-border-light dark:border-border-dark p-4 text-sm focus:ring-primary focus:border-primary resize-none"></textarea>
                    </div>

                    <div className="bg-red-50/50 dark:bg-red-900/10 border-l-4 border-primary p-6 flex gap-4">
                        <div className="w-8 h-8 bg-primary flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-sm">bar_chart</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">PATTERN DETECTED</p>
                            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                                You tend to underestimate design tasks by <span className="font-bold">~35%</span>. Calibrate has adjusted future estimates.
                            </p>
                        </div>
                    </div>
                </div>

                <footer className="p-8 border-t border-border-light dark:border-border-dark">
                    <button className="w-full bg-primary hover:bg-red-700 text-white font-bold uppercase text-sm tracking-widest py-4 transition-colors flex items-center justify-center gap-2">
                        SAVE REFLECTION <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </footer>
            </div>
        </div>
    )
}

function Option({ label, active }) {
    return (
        <div className={`border p-4 flex items-center gap-3 cursor-pointer ${active ? 'border-primary bg-red-50/30' : 'border-border-light dark:border-border-dark bg-white dark:bg-stone-900'}`}>
            <div className={`w-4 h-4 border ${active ? 'bg-primary border-primary' : 'border-stone-200'} flex items-center justify-center`}>
                {active && <span className="material-symbols-outlined text-white text-[12px]">check</span>}
            </div>
            <span className={`text-xs ${active ? 'font-bold' : ''}`}>{label}</span>
        </div>
    )
}
