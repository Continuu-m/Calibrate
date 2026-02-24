export default function Insights() {
    return (
        <div className="flex-1 p-4 sm:p-12 max-w-4xl mx-auto w-full">
            <h1 className="text-3xl sm:text-5xl mb-6 sm:mb-8 font-serif">Personal Insights</h1>
            <div className="bg-red-50/50 dark:bg-red-900/10 border-l-4 border-primary p-4 sm:p-6 flex gap-3 sm:gap-4 max-w-2xl">
                <div className="w-8 h-8 bg-primary flex items-center justify-center text-white shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-sm">bar_chart</span>
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">PATTERN DETECTED</p>
                    <p className="text-[11px] sm:text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                        You tend to underestimate design tasks by <span className="font-bold">~35%</span>. Calibrate has adjusted future estimates.
                    </p>
                </div>
            </div>
        </div>
    )
}
