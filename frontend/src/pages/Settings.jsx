import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Settings() {
    const { user, token, updateProfile, updatePreferences, refreshUser } = useAuth();

    // Profile State
    const [fullName, setFullName] = useState(user?.full_name || '');

    // Preferences State
    const [workHours, setWorkHours] = useState(user?.preferences?.work_hours_per_day || 8);
    const [bufferPercent, setBufferPercent] = useState(user?.preferences?.buffer_percent || 20);
    const [alertCautionThreshold, setAlertCautionThreshold] = useState(user?.preferences?.alert_caution_threshold || 80);
    const [timezone, setTimezone] = useState(user?.preferences?.timezone || 'UTC');
    const [notificationsEnabled, setNotificationsEnabled] = useState(user?.preferences?.notifications_enabled ?? true);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    // Detect redirect back from Google's OAuth flow
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('google_connected') === 'true') {
            setMessage({ type: 'success', text: 'Google Calendar connected successfully!' });
            // Clean up the URL param
            window.history.replaceState({}, '', '/settings');
            if (refreshUser) refreshUser();
        } else if (params.get('google_error')) {
            setMessage({ type: 'error', text: 'Failed to connect Google Calendar. Please try again.' });
            window.history.replaceState({}, '', '/settings');
        }
    }, []);

    const handleSave = async () => {
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            // First update profile
            await updateProfile({
                full_name: fullName
            });

            // Then update preferences
            await updatePreferences({
                work_hours_per_day: parseFloat(workHours),
                buffer_percent: parseInt(bufferPercent, 10),
                alert_caution_threshold: parseInt(alertCautionThreshold, 10),
                timezone: timezone,
                notifications_enabled: notificationsEnabled,
                onboarded: true // ensure this stays true
            });

            setMessage({ type: 'success', text: 'Settings saved successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to save settings.' });
        } finally {
            setIsSubmitting(false);

            // Clear success message after 3 seconds
            if (message.type !== 'error') {
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        }
    };

    return (
        <div className="flex-1 p-4 sm:p-12 max-w-4xl mx-auto w-full pb-24">
            <h1 className="text-3xl sm:text-5xl mb-6 sm:mb-8 font-serif">Settings</h1>

            {message.text && (
                <div className={`mb-6 p-4 text-sm font-bold flex items-center gap-2 ${message.type === 'error'
                    ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/40'
                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40'
                    }`}>
                    <span className="material-symbols-outlined text-sm">
                        {message.type === 'error' ? 'error' : 'check_circle'}
                    </span>
                    {message.text}
                </div>
            )}

            <div className="space-y-12">
                {/* Personal Information */}
                <section className="space-y-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-secondary border-b border-border-light dark:border-border-dark pb-2">Personal Information</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">Email (Read Only)</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full bg-stone-100 dark:bg-stone-800 border border-border-light dark:border-border-dark p-3 text-sm text-stone-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-stone-50/50 dark:bg-stone-900/50 border border-border-light dark:border-border-dark p-3 text-sm focus:ring-primary focus:border-primary disabled:opacity-50"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                </section>

                {/* Application Preferences */}
                <section className="space-y-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-secondary border-b border-border-light dark:border-border-dark pb-2">Application Preferences</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">Focus Hours</label>
                            <input
                                type="number"
                                min="1"
                                max="24"
                                value={workHours}
                                onChange={(e) => setWorkHours(e.target.value)}
                                className="w-full bg-stone-50/50 dark:bg-stone-900/50 border border-border-light dark:border-border-dark p-3 text-sm focus:ring-primary focus:border-primary disabled:opacity-50"
                                disabled={isSubmitting}
                            />
                            <p className="text-[10px] text-secondary">Target hours of focused work per day.</p>
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
                                className="w-full bg-stone-50/50 dark:bg-stone-900/50 border border-border-light dark:border-border-dark p-3 text-sm focus:ring-primary focus:border-primary disabled:opacity-50"
                                disabled={isSubmitting}
                            />
                            <p className="text-[10px] text-secondary">Padding for unexpected tasks (e.g. 20%).</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">Caution Threshold %</label>
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
                            <p className="text-[10px] text-secondary">Show yellow warning when capacity hits this %.</p>
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
                            <p className="text-[10px] text-secondary">Used for scheduling email digests.</p>
                        </div>
                    </div>
                </section>

                {/* Notifications & Integrations */}
                <section className="space-y-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-secondary border-b border-border-light dark:border-border-dark pb-2">Notifications & Integrations</h2>

                    <label className="flex items-center gap-3 p-4 border border-border-light dark:border-border-dark cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors bg-white dark:bg-surface-dark">
                        <input
                            type="checkbox"
                            checked={notificationsEnabled}
                            onChange={(e) => setNotificationsEnabled(e.target.checked)}
                            disabled={isSubmitting}
                            className="w-5 h-5 accent-primary border-border-light dark:border-border-dark"
                        />
                        <div className="space-y-1 select-none">
                            <p className="text-sm font-bold">Daily Review Email</p>
                            <p className="text-[10px] text-secondary">Receive an automated email digest of completed and overdue tasks every morning.</p>
                        </div>
                    </label>

                    {/* Google Calendar Integration */}
                    <div className={`border border-border-light dark:border-border-dark p-4 bg-white dark:bg-surface-dark flex justify-between items-center ${user?.google_calendar_connected ? '' : ''}`}>
                        <div className="space-y-1 select-none">
                            <p className="text-sm font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">event</span>
                                Google Calendar Integration
                            </p>
                            <p className="text-[10px] text-secondary">
                                {user?.google_calendar_connected
                                    ? 'Your calendar events are being synced to Calibrate.'
                                    : 'Connect to automatically import events as tasks.'}
                            </p>
                        </div>
                        {user?.google_calendar_connected ? (
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    CONNECTED
                                </span>
                                <button
                                    onClick={async () => {
                                        setIsDisconnecting(true);
                                        try {
                                            const res = await fetch(`${API_URL}/auth/google/disconnect`, {
                                                method: 'DELETE',
                                                headers: { Authorization: `Bearer ${token}` }
                                            });
                                            if (!res.ok) throw new Error();
                                            setMessage({ type: 'success', text: 'Google Calendar disconnected.' });
                                            if (refreshUser) refreshUser();
                                        } catch {
                                            setMessage({ type: 'error', text: 'Failed to disconnect. Try again.' });
                                        } finally {
                                            setIsDisconnecting(false);
                                        }
                                    }}
                                    disabled={isDisconnecting}
                                    className="text-xs font-bold text-stone-500 hover:text-red-600 border border-stone-200 dark:border-stone-700 px-3 py-1.5 transition-colors disabled:opacity-50"
                                >
                                    {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                                </button>
                            </div>
                        ) : (
                            <a
                                href={`${API_URL}/auth/google/connect`}
                                onClick={(e) => {
                                    // Pass the token via a custom header isn't possible with plain redirect.
                                    // Instead open as a fetch-initiated redirect with the token in headers.
                                    e.preventDefault();
                                    // We fetch the connect URL to get the redirect then follow it
                                    fetch(`${API_URL}/auth/google/connect`, {
                                        headers: { Authorization: `Bearer ${token}` },
                                        redirect: 'manual'
                                    }).then(res => {
                                        // Browser blocks access to redirect URL from manual fetch.
                                        // Best approach: open the connect endpoint URL with token appended as query param.
                                        // Backend reads it from the state, which we set to the token.
                                        window.location.href = `${API_URL}/auth/google/connect?token=${token}`;
                                    });
                                }}
                                className="text-xs font-bold bg-primary hover:bg-red-700 text-white px-4 py-2 transition-colors flex items-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-sm">add_link</span>
                                Connect
                            </a>
                        )}
                    </div>
                </section>

                <div className="pt-6 border-t border-border-light dark:border-border-dark flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="bg-primary hover:bg-red-700 text-white font-bold uppercase text-xs sm:text-sm tracking-widest px-8 py-3 transition-colors flex items-center gap-2 shadow-sm active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSubmitting ? 'SAVING...' : 'SAVE CHANGES'}
                        <span className="material-symbols-outlined text-sm">save</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
