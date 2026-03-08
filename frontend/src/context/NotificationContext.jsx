import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import TaskService from '../services/TaskService';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [lastSeverity, setLastSeverity] = useState(null);
    const pollInterval = useRef(null);

    const checkCapacity = async () => {
        if (!token) return;

        try {
            const data = await TaskService.getCapacity(token);

            // If the backend says an alert is pending, show it
            if (data.alert_pending) {
                toast((t) => (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 font-bold text-red-600">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            <span>Overcommitment Alert</span>
                        </div>
                        <p className="text-[10px] text-stone-600 leading-relaxed">
                            {data.alert_message || "A new calendar event has pushed you over capacity."}
                        </p>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="text-[10px] font-bold uppercase tracking-widest text-secondary mt-2 text-right hover:text-primary transition-colors"
                        >
                            Dismiss
                        </button>
                    </div>
                ), {
                    duration: 6000,
                    position: 'top-right',
                    style: {
                        borderRadius: '0px',
                        background: '#fff',
                        color: '#1c1917',
                        border: '1px solid #e7e5e4',
                        boxShadow: '4px 4px 0px rgba(0,0,0,0.05)',
                        padding: '16px',
                        minWidth: '300px'
                    },
                });
            }

            setLastSeverity(data.severity);
        } catch (error) {
            console.error('Failed to poll capacity for notifications:', error);
        }
    };

    useEffect(() => {
        const isConnected = user?.google_calendar_connected || user?.outlook_calendar_connected;
        if (token && isConnected) {
            // Start polling every 2 minutes
            checkCapacity(); // Initial check
            pollInterval.current = setInterval(checkCapacity, 120000);
        } else {
            if (pollInterval.current) {
                clearInterval(pollInterval.current);
            }
        }

        return () => {
            if (pollInterval.current) {
                clearInterval(pollInterval.current);
            }
        };
    }, [token, user?.google_calendar_connected, user?.outlook_calendar_connected]);

    return (
        <NotificationContext.Provider value={{ checkCapacity }}>
            {children}
        </NotificationContext.Provider>
    );
};
