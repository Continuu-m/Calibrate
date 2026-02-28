import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TaskService from '../services/TaskService';
import { useAuth } from '../context/AuthContext';
import AddTaskModal from '../components/AddTaskModal';

export default function WeeklyCapacity() {
    const { user, token, logout } = useAuth();
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    const [tasks, setTasks] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dragError, setDragError] = useState('');

    useEffect(() => {
        if (token) {
            fetchTasks();
        }
    }, [token]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const data = await TaskService.getTasks(token);
            setTasks(data.tasks || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loading) {
            generateWeeklyData();
        }
    }, [tasks, loading, user]);

    const generateWeeklyData = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysOptions = { weekday: 'short' };
        const dateOptions = { day: 'numeric' };

        const generatedDays = [];
        const baseCapacityMins = user?.preferences?.work_hours_per_day ? user.preferences.work_hours_per_day * 60 : 8 * 60;

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);

            const dayStart = new Date(currentDate);
            dayStart.setHours(0, 0, 0, 0);

            const dayEnd = new Date(currentDate);
            dayEnd.setDate(dayEnd.getDate() + 1);
            dayEnd.setHours(0, 0, 0, 0);

            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

            const dayTasks = tasks.filter(t => {
                if (!t.scheduled_date && !t.deadline) {
                    return i === 0 && t.status !== 'completed';
                }

                const taskDateStr = t.scheduled_date || t.deadline;
                if (!taskDateStr && i === 0) return true;
                if (!taskDateStr) return false;

                const tDate = new Date(taskDateStr + (taskDateStr.endsWith('Z') ? '' : 'Z'));
                return tDate >= dayStart && tDate < dayEnd;
            }).map(t => ({
                id: t.id,
                title: t.title,
                time: t.estimated_time ? `${Math.floor(t.estimated_time / 60) > 0 ? Math.floor(t.estimated_time / 60) + ' ' + (Math.floor(t.estimated_time / 60) === 1 ? 'hr' : 'hrs') : ''} ${t.estimated_time % 60 > 0 ? (t.estimated_time % 60) + ' min' : ''}`.trim() : null,
                type: t.task_type || 'work',
                originalMins: t.estimated_time || 0
            }));

            const totalMins = dayTasks.reduce((sum, task) => sum + task.originalMins, 0);
            const capacityPercent = Math.min(100, Math.round((totalMins / baseCapacityMins) * 100));

            generatedDays.push({
                day: currentDate.toLocaleDateString('en-US', daysOptions),
                date: currentDate.toLocaleDateString('en-US', dateOptions),
                fullDate: currentDate,
                isoDate: currentDate.toISOString(),
                capacity: capacityPercent,
                tasks: dayTasks,
                overloaded: capacityPercent > (user?.preferences?.alert_caution_threshold || 80),
                weekend: isWeekend
            });
        }

        setWeeklyData(generatedDays);
    };

    const handleDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        // Dropped outside any column
        if (!destination) return;

        // Dropped in same position
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const taskId = parseInt(draggableId, 10);
        const destDayData = weeklyData.find(d => d.isoDate === destination.droppableId);
        if (!destDayData) return;

        // Build the new scheduled_date as noon UTC on the destination day (avoids timezone off-by-one)
        const destDate = new Date(destDayData.fullDate);
        destDate.setHours(12, 0, 0, 0);
        const newScheduledDate = destDate.toISOString();

        // Optimistic UI update: Move task in weeklyData
        setWeeklyData(prev => {
            const next = prev.map(day => ({ ...day, tasks: [...day.tasks] }));

            // Remove from source
            const srcDay = next.find(d => d.isoDate === source.droppableId);
            const movedTask = srcDay?.tasks.splice(source.index, 1)[0];
            if (!movedTask) return prev;

            // Insert into destination
            const dstDay = next.find(d => d.isoDate === destination.droppableId);
            dstDay?.tasks.splice(destination.index, 0, movedTask);

            // Recalculate capacity for affected days
            const baseCapacityMins = user?.preferences?.work_hours_per_day ? user.preferences.work_hours_per_day * 60 : 8 * 60;
            return next.map(day => {
                const totalMins = day.tasks.reduce((sum, t) => sum + t.originalMins, 0);
                const capacityPercent = Math.min(100, Math.round((totalMins / baseCapacityMins) * 100));
                return {
                    ...day,
                    capacity: capacityPercent,
                    overloaded: capacityPercent > (user?.preferences?.alert_caution_threshold || 80)
                };
            });
        });

        // Persist to backend
        try {
            setDragError('');
            await TaskService.updateTask(token, taskId, { scheduled_date: newScheduledDate });
        } catch (err) {
            setDragError('Failed to save task move. Please refresh.');
            // Revert by re-fetching
            fetchTasks();
        }
    };

    const totalWeeklyMins = weeklyData.reduce((sum, day) => sum + day.tasks.reduce((tsum, t) => tsum + t.originalMins, 0), 0);
    const weeklyBaseCapacityMins = (user?.preferences?.work_hours_per_day || 8) * 60 * 5;
    const balanceMins = weeklyBaseCapacityMins - totalWeeklyMins;
    const formatMinsToHours = (mins) => `${Math.round(mins / 60)} hrs`;

    return (
        <div className="flex-1 flex flex-col">
            <AddTaskModal isOpen={isAddTaskOpen} onClose={() => { setIsAddTaskOpen(false); fetchTasks(); }} />

            <header className="w-full border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-50">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 sm:gap-3 text-stone-900 dark:text-stone-100">
                        <div className="size-5 sm:size-6 text-primary">
                            <span className="material-symbols-outlined text-2xl sm:text-3xl">tune</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl tracking-tight font-serif">Calibrate</h1>
                    </Link>
                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/" className="text-stone-600 dark:text-stone-300 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors">Dashboard</Link>
                        <Link to="/weekly" className="text-primary font-bold text-sm border-b-2 border-primary pb-0.5">Weekly View</Link>
                        <Link to="/settings" className="text-stone-600 dark:text-stone-300 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors">Settings</Link>
                    </nav>
                    <div className="flex items-center gap-3 sm:gap-6">
                        <button
                            onClick={() => setIsAddTaskOpen(true)}
                            className="flex items-center justify-center h-8 sm:h-10 px-3 sm:px-6 bg-primary hover:bg-red-700 text-white text-[10px] sm:text-sm font-bold uppercase tracking-wide transition-colors shadow-sm"
                        >
                            <span className="sm:hidden material-symbols-outlined text-sm">add</span>
                            <span className="hidden sm:inline">Add Task</span>
                        </button>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="bg-center bg-no-repeat bg-cover rounded-full size-8 sm:size-10 border border-border-light dark:border-border-dark bg-stone-200 flex items-center justify-center text-stone-500 font-bold" style={{ backgroundImage: user?.avatar ? `url(${user.avatar})` : 'none' }}>
                                {!user?.avatar && user?.full_name?.charAt(0)}
                            </div>
                            <button onClick={logout} className="text-secondary hover:text-primary transition-colors" title="Logout">
                                <span className="material-symbols-outlined text-lg">logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-[1400px] mx-auto w-full flex flex-col gap-6 sm:gap-8">
                {dragError && (
                    <div className="bg-red-50 text-red-600 border border-red-200 p-3 text-xs font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">error</span>
                        {dragError}
                    </div>
                )}

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border-light dark:border-border-dark pb-6">
                    <div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl text-stone-900 dark:text-stone-100 mb-2">Weekly Capacity</h2>
                        <p className="text-secondary dark:text-stone-400 font-sans text-base sm:text-lg">
                            {weeklyData.length > 0 ? `${weeklyData[0].date} ${weeklyData[0].fullDate.toLocaleString('default', { month: 'long' })} — ${weeklyData[6].date} ${weeklyData[6].fullDate.toLocaleString('default', { month: 'long' })}` : 'Loading...'}
                        </p>
                        <p className="text-[10px] text-secondary mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">drag_indicator</span>
                            Drag tasks between days to reschedule
                        </p>
                    </div>
                    <div className="flex gap-6 sm:gap-8">
                        <div className="flex flex-col items-start md:items-end">
                            <span className="text-[10px] sm:text-xs font-bold uppercase text-secondary dark:text-stone-400 tracking-wider">Total Load</span>
                            <span className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">{formatMinsToHours(totalWeeklyMins)}</span>
                        </div>
                        <div className="flex flex-col items-start md:items-end">
                            <span className="text-[10px] sm:text-xs font-bold uppercase text-secondary dark:text-stone-400 tracking-wider">Balance</span>
                            <span className={`text-xl sm:text-2xl font-bold font-serif ${balanceMins < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                {balanceMins < 0 ? '' : '+'}{formatMinsToHours(balanceMins)}
                            </span>
                        </div>
                    </div>
                </div>

                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 md:gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark overflow-x-auto">
                        {weeklyData.map((day, idx) => (
                            <div key={idx} className={`${day.weekend ? 'bg-stone-100 dark:bg-[#1a0f0d] opacity-80' : day.overloaded ? 'bg-red-50/30 dark:bg-red-900/10 border-t-2 sm:border-t-4 md:border-t-0 md:border-b-4 border-primary' : 'bg-surface-light dark:bg-surface-dark'} min-h-0 sm:min-h-[500px] p-3 flex flex-col gap-3 group hover:bg-stone-50 dark:hover:bg-[#33201c] transition-colors relative md:min-w-0 min-w-full`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className={`block text-xs font-bold uppercase ${day.overloaded ? 'text-primary' : 'text-secondary dark:text-stone-400'}`}>{day.day}</span>
                                        <span className={`block text-xl font-serif font-bold ${day.weekend ? 'text-stone-500' : 'text-stone-900 dark:text-stone-100'}`}>{day.date}</span>
                                    </div>
                                    <span className={`text-xs font-bold px-1.5 py-0.5 border ${day.overloaded ? 'bg-primary text-white border-primary' : day.capacity > 75 ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 border-amber-100' : day.weekend ? 'text-stone-400 bg-white dark:bg-stone-800 border-stone-200' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>
                                        {day.capacity}%
                                    </span>
                                </div>

                                {/* Compact capacity mini-bar — fixed height so tasks aren't pushed down */}
                                <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 relative hidden md:block flex-none">
                                    <div className={`absolute top-0 left-0 h-full transition-all duration-700 ${day.overloaded ? 'bg-primary' : day.capacity > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(day.capacity, 100)}%` }}></div>
                                    {day.overloaded && <div className="absolute -top-1 right-0 size-2.5 bg-primary rounded-full border-2 border-white dark:border-stone-900 z-10 animate-pulse"></div>}
                                </div>

                                <Droppable droppableId={day.isoDate}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`flex flex-col gap-2 flex-1 min-h-[60px] transition-colors rounded-sm ${snapshot.isDraggingOver ? 'bg-primary/5 ring-1 ring-primary/30 ring-inset' : ''}`}
                                        >
                                            {day.tasks.length === 0 && !snapshot.isDraggingOver ? (
                                                <div className="border-2 border-dashed border-stone-200 dark:border-stone-700 h-16 flex items-center justify-center opacity-50">
                                                    <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">Free</span>
                                                </div>
                                            ) : (
                                                day.tasks.map((task, tIdx) => (
                                                    <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={tIdx}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`bg-white dark:bg-stone-800 border-l-4 ${day.overloaded ? 'border-primary' : day.capacity > 75 ? 'border-amber-500' : 'border-emerald-500'} p-2 shadow-sm hover:shadow-md transition-all select-none ${snapshot.isDragging ? 'shadow-xl rotate-1 opacity-95 ring-2 ring-primary/40 scale-105' : ''}`}
                                                            >
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="material-symbols-outlined text-[14px] text-stone-300 dark:text-stone-600 shrink-0">drag_indicator</span>
                                                                    <div className="min-w-0">
                                                                        <p className={`text-xs font-bold text-stone-900 dark:text-stone-100 truncate`} title={task.title}>{task.title}</p>
                                                                        {task.time && <p className="text-[10px] text-secondary dark:text-stone-400">{task.time}</p>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))
                                            )}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>

                {weeklyData.some(d => d.overloaded) && !isDismissed && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[800px] px-6 z-50 animate-in slide-in-from-bottom-8">
                        <div className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-primary">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-yellow-400 dark:text-yellow-600 mt-0.5">lightbulb</span>
                                <div>
                                    <p className="font-bold text-sm sm:text-base">You have overloaded days this week.</p>
                                    <p className="text-stone-400 dark:text-stone-600 text-xs sm:text-sm">Drag tasks to lighter days to balance your load.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setIsDismissed(true)}
                                    className="flex-1 sm:flex-none text-stone-300 dark:text-stone-500 text-xs font-bold uppercase hover:text-white dark:hover:text-black transition-colors px-2"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
