export default function Settings() {
    return (
        <div className="flex-1 p-12 max-w-4xl mx-auto w-full">
            <h1 className="text-5xl mb-8">Settings</h1>
            <div className="space-y-8">
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-secondary mb-4">Integrations</h2>
                    <div className="border border-border-light dark:border-border-dark p-4 bg-white dark:bg-surface-dark flex justify-between items-center">
                        <span>Google Calendar</span>
                        <span className="text-xs font-bold text-emerald-500">CONNECTED</span>
                    </div>
                </section>
            </div>
        </div>
    )
}
