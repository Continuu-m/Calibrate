import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import TaskService from '../services/TaskService';

export default function AddTaskModal({ isOpen, onClose }) {
    const { token } = useAuth();

    // Form State
    const [title, setTitle] = useState('');
    const [estimate, setEstimate] = useState('45');
    const [estimateUnit, setEstimateUnit] = useState('min');
    const [priority, setPriority] = useState('Medium');
    const [description, setDescription] = useState('');

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const priorities = ['Low', 'Medium', 'High', 'Urgent'];

    // Map UI priorities to Backend ENUM
    const priorityMap = {
        'Low': 'low',
        'Medium': 'medium',
        'High': 'high',
        'Urgent': 'urgent'
    };

    if (!isOpen) return null;

    const handleClose = () => {
        // Reset state on close
        setTitle('');
        setEstimate('45');
        setEstimateUnit('min');
        setPriority('Medium');
        setDescription('');
        setError('');
        setIsSubmitting(false);
        onClose();
    };

    const handleSubmit = async (scheduleForLater = false) => {
        if (!title.trim()) {
            setError('Task name is required');
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            // Calculate total minutes
            const estimateNum = parseFloat(estimate) || 0;
            const estimatedMins = estimateUnit === 'hr' ? Math.round(estimateNum * 60) : Math.round(estimateNum);

            const payload = {
                title: title.trim(),
                description: description.trim() || undefined,
                priority: priorityMap[priority],
                estimated_time: estimatedMins,
                task_type: 'unknown', // Default for now
                subtasks: [] // The AI breakdown feature would populate this
            };

            // If "Add to Today", explicitly set scheduled_date and deadline to current date
            if (!scheduleForLater) {
                const today = new Date();
                payload.scheduled_date = today.toISOString();
                payload.deadline = today.toISOString();
            }

            await TaskService.createTask(token, payload);
            handleClose(); // Success! Close modal and refresh parent
        } catch (err) {
            setError(err.message || 'Failed to create task');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={handleClose}></div>
            <div className="relative w-full max-w-xl bg-white dark:bg-surface-dark h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <header className="px-4 sm:px-8 py-4 sm:py-6 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-white dark:bg-surface-dark z-10 sticky top-0">
                    <h2 className="text-[10px] sm:text-sm font-bold uppercase tracking-widest text-secondary">New Task</h2>
                    <button onClick={handleClose} disabled={isSubmitting} className="material-symbols-outlined text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors disabled:opacity-50">close</button>
                </header>

                <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 text-xs border border-red-100 dark:border-red-900/40 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <h1 className="text-2xl sm:text-4xl text-stone-300 dark:text-stone-700">What needs to get done?</h1>
                        <input
                            type="text"
                            placeholder="Type task name..."
                            className="w-full text-2xl sm:text-4xl bg-transparent border-none p-0 focus:ring-0 placeholder-stone-200 dark:placeholder-stone-800"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isSubmitting}
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">Date Context</label>
                            <div className="flex items-center gap-2 border border-border-light dark:border-border-dark p-3 bg-stone-50/50 dark:bg-stone-900/50 text-stone-500">
                                <span className="material-symbols-outlined text-stone-400 text-sm">calendar_today</span>
                                <span className="text-sm">Determined by action</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">My Estimate</label>
                            <div className="flex items-center gap-2 border border-border-light dark:border-border-dark p-3 bg-stone-50/50 dark:bg-stone-900/50">
                                <input
                                    type="number"
                                    value={estimate}
                                    onChange={(e) => setEstimate(e.target.value)}
                                    disabled={isSubmitting}
                                    min="1"
                                    className="w-12 bg-transparent border-none p-0 text-sm focus:ring-0 text-center"
                                />
                                <span className="text-stone-300">|</span>
                                <select
                                    value={estimateUnit}
                                    onChange={(e) => setEstimateUnit(e.target.value)}
                                    disabled={isSubmitting}
                                    className="bg-transparent border-none text-sm p-0 focus:ring-0"
                                >
                                    <option value="min">min</option>
                                    <option value="hr">hr</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">Priority</label>
                        <div className="flex gap-2">
                            {priorities.map(p => (
                                <button
                                    key={p}
                                    disabled={isSubmitting}
                                    onClick={() => setPriority(p)}
                                    type="button"
                                    className={`flex-1 py-2 text-xs font-bold border transition-colors ${priority === p ? 'bg-red-50 text-primary border-primary dark:bg-primary/10' : 'bg-white dark:bg-stone-900 text-stone-400 border-border-light dark:border-border-dark hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-50'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">Description</label>
                        <textarea
                            placeholder="Add details, links, or context..."
                            className="w-full min-h-[120px] bg-stone-50/50 dark:bg-stone-900/50 border border-border-light dark:border-border-dark p-4 text-sm focus:ring-primary focus:border-primary resize-none disabled:opacity-50"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isSubmitting}
                        ></textarea>
                    </div>

                    {/* AI Preview - Visual only for now as requested by user context */}
                    <div className="bg-stone-50/50 dark:bg-stone-900/50 border border-border-light dark:border-border-dark p-6 space-y-4 opacity-50 grayscale pointer-events-none">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-red-600">
                                <span className="material-symbols-outlined text-lg">temp_preferences_custom</span>
                                <span className="text-xs font-bold uppercase tracking-widest">AI Breakdown (Coming Soon)</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-surface-dark border border-red-100 dark:border-red-900/50 p-4 flex items-center gap-4">
                            <span className="material-symbols-outlined text-red-600">bolt</span>
                            <div>
                                <p className="text-xs font-medium">Realistic estimate: <span className="text-red-600 font-bold">--</span></p>
                                <p className="text-[10px] text-stone-400">Optimistic: -- | Worst case: --</p>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="p-4 sm:p-8 border-t border-border-light dark:border-border-dark bg-stone-50/30 dark:bg-stone-900/30 grid grid-cols-1 gap-3 sticky bottom-0">
                    <button
                        onClick={() => handleSubmit(false)}
                        disabled={isSubmitting || !title.trim()}
                        className="w-full bg-primary hover:bg-red-700 text-white font-bold uppercase text-xs sm:text-sm tracking-widest py-3 sm:py-4 transition-colors disabled:opacity-50 disabled:hover:bg-primary shadow-sm active:scale-[0.98]"
                    >
                        {isSubmitting ? 'Saving...' : 'Add to Today'}
                    </button>
                    <button
                        onClick={() => handleSubmit(true)}
                        disabled={isSubmitting || !title.trim()}
                        className="w-full bg-transparent border border-border-light dark:border-border-dark hover:bg-white dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold uppercase text-xs sm:text-sm tracking-widest py-3 sm:py-4 transition-colors disabled:opacity-50 active:scale-[0.98]"
                    >
                        Schedule for Later
                    </button>
                </footer>
            </div>
        </div>
    )
}
