import { useState } from 'react'
import TaskReflectionPanel from '../components/TaskReflectionPanel'

export default function Completed() {
    const [isReflectionOpen, setIsReflectionOpen] = useState(false);

    return (
        <div className="flex-1 p-12 max-w-4xl mx-auto w-full">
            <TaskReflectionPanel isOpen={isReflectionOpen} onClose={() => setIsReflectionOpen(false)} />
            <h1 className="text-5xl mb-8">Completed Tasks</h1>
            <div className="space-y-4">
                <div
                    onClick={() => setIsReflectionOpen(true)}
                    className="p-4 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark flex justify-between items-center cursor-pointer hover:shadow-md transition-shadow"
                >
                    <div>
                        <p className="font-bold line-through">Finalize investor pitch deck</p>
                        <p className="text-[10px] text-secondary">Completed today at 10:30 AM</p>
                    </div>
                    <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                </div>
            </div>
        </div>
    )
}
