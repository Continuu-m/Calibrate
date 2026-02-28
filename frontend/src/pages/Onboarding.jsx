import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Onboarding() {
    const { user, updatePreferences } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // Form state
    const [workHours, setWorkHours] = useState(user?.preferences?.work_hours_per_day || 8);
    const [bufferPercent, setBufferPercent] = useState(user?.preferences?.buffer_percent || 20);
    const [alertCautionThreshold, setAlertCautionThreshold] = useState(user?.preferences?.alert_caution_threshold || 80);
    const [timezone, setTimezone] = useState(user?.preferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
    const [notificationsEnabled, setNotificationsEnabled] = useState(user?.preferences?.notifications_enabled ?? true);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleNext = () => {
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleFinish = async () => {
        setIsSubmitting(true);
        setError('');
        try {
            await updatePreferences({
                work_hours_per_day: parseFloat(workHours),
                buffer_percent: parseInt(bufferPercent, 10),
                alert_caution_threshold: parseInt(alertCautionThreshold, 10),
                timezone: timezone,
                notifications_enabled: notificationsEnabled,
                onboarded: true
            });
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to save settings');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-2xl overflow-hidden relative">
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 text-xs border-b border-red-100 dark:border-red-900/40 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">error</span>
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <div className="p-8 sm:p-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-sm">
                            <span className="material-symbols-outlined text-primary text-2xl">tune</span>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl sm:text-3xl font-serif">Welcome to Calibrate</h1>
                            <p className="text-secondary text-sm leading-relaxed">
                                Calibrate is your Reality Checker. It helps you accurately estimate tasks and prevents you from overcommitting. Let's get set up.
                            </p>
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full bg-primary hover:bg-red-700 text-white font-bold uppercase text-xs sm:text-sm tracking-widest py-3 sm:py-4 transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                        >
                            GET STARTED <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="p-8 sm:p-10 space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="space-y-2">
                            <h1 className="text-2xl sm:text-3xl font-serif">Capacity & Buffer</h1>
                            <p className="text-secondary text-sm leading-relaxed">
                                How many hours do you realistically want to commit to focused work today? And how much buffer time should we leave for unexpected tasks?
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">Focus Hours</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="24"
                                    value={workHours}
                                    onChange={(e) => setWorkHours(e.target.value)}
                                    className="w-full bg-stone-50/50 dark:bg-stone-900/50 border border-border-light dark:border-border-dark p-4 text-center text-2xl font-sans focus:ring-primary focus:border-primary disabled:opacity-50"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">Buffer %</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={bufferPercent}
                                    onChange={(e) => setBufferPercent(e.target.value)}
                                    className="w-full bg-stone-50/50 dark:bg-stone-900/50 border border-border-light dark:border-border-dark p-4 text-center text-2xl font-sans focus:ring-primary focus:border-primary disabled:opacity-50"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleBack}
                                disabled={isSubmitting}
                                className="w-1/3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold uppercase text-xs sm:text-sm tracking-widest py-3 sm:py-4 transition-colors disabled:opacity-50"
                            >
                                BACK
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={isSubmitting}
                                className="w-2/3 bg-primary hover:bg-red-700 text-white font-bold uppercase text-xs sm:text-sm tracking-widest py-3 sm:py-4 transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] disabled:opacity-50"
                            >
                                NEXT <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="p-8 sm:p-10 space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="space-y-2">
                            <h1 className="text-2xl sm:text-3xl font-serif">Alerts & Notifications</h1>
                            <p className="text-secondary text-sm leading-relaxed">
                                Calibrate warns you when you're overcommitting. Let's finish your personalization.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">Warn me at capacity %</label>
                                <input
                                    type="number"
                                    min="50"
                                    max="100"
                                    step="5"
                                    value={alertCautionThreshold}
                                    onChange={(e) => setAlertCautionThreshold(e.target.value)}
                                    className="w-full bg-stone-50/50 dark:bg-stone-900/50 border border-border-light dark:border-border-dark p-3 text-sm focus:ring-primary focus:border-primary disabled:opacity-50"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">Timezone</label>
                                <input
                                    type="text"
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="w-full bg-stone-50/50 dark:bg-stone-900/50 border border-border-light dark:border-border-dark p-3 text-sm focus:ring-primary focus:border-primary disabled:opacity-50"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <label className="flex items-center gap-3 p-4 border border-border-light dark:border-border-dark cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={notificationsEnabled}
                                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                                    disabled={isSubmitting}
                                    className="w-5 h-5 accent-primary border-border-light dark:border-border-dark"
                                />
                                <div className="space-y-1 select-none">
                                    <p className="text-sm font-bold">Daily Review Email</p>
                                    <p className="text-[10px] text-secondary">Get a digest of your completed and rolled over tasks.</p>
                                </div>
                            </label>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleBack}
                                disabled={isSubmitting}
                                className="w-1/3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold uppercase text-xs sm:text-sm tracking-widest py-3 sm:py-4 transition-colors disabled:opacity-50"
                            >
                                BACK
                            </button>
                            <button
                                onClick={handleFinish}
                                disabled={isSubmitting}
                                className="w-2/3 bg-primary hover:bg-red-700 text-white font-bold uppercase text-xs sm:text-sm tracking-widest py-3 sm:py-4 transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] disabled:opacity-50"
                            >
                                {isSubmitting ? 'SAVING...' : 'FINISH SETUP'} <span className="material-symbols-outlined text-sm">check</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
