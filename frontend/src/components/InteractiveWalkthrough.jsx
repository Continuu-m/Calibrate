import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useWalkthrough } from '../context/WalkthroughContext';

export default function InteractiveWalkthrough() {
    const { active, currentStep, steps, nextStep, skipWalkthrough } = useWalkthrough();
    const [anchorRect, setAnchorRect] = useState(null);

    const updateAnchor = useCallback(() => {
        if (!active) return;
        const step = steps[currentStep];
        const element = document.querySelector(`[data-walkthrough="${step.target}"]`);
        if (element) {
            setAnchorRect(element.getBoundingClientRect());
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            setAnchorRect(null);
        }
    }, [active, currentStep, steps]);

    useEffect(() => {
        updateAnchor();
        window.addEventListener('resize', updateAnchor);
        window.addEventListener('scroll', updateAnchor);
        return () => {
            window.removeEventListener('resize', updateAnchor);
            window.removeEventListener('scroll', updateAnchor);
        };
    }, [updateAnchor]);

    if (!active || !anchorRect) return null;

    const step = steps[currentStep];

    return createPortal(
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Backdrop with Spotlight */}
            <div
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] transition-all duration-500"
                style={{
                    clipPath: `polygon(
                        0% 0%, 
                        0% 100%, 
                        ${anchorRect.left - 10}px 100%, 
                        ${anchorRect.left - 10}px ${anchorRect.top - 10}px, 
                        ${anchorRect.right + 10}px ${anchorRect.top - 10}px, 
                        ${anchorRect.right + 10}px ${anchorRect.bottom + 10}px, 
                        ${anchorRect.left - 10}px ${anchorRect.bottom + 10}px, 
                        ${anchorRect.left - 10}px 100%, 
                        100% 100%, 
                        100% 0%
                    )`
                }}
            />

            {/* Tooltip */}
            <div
                className="absolute bg-white dark:bg-surface-dark border border-stone-200 dark:border-stone-800 p-6 shadow-2xl pointer-events-auto transition-all duration-500 max-w-sm animate-in fade-in zoom-in-95 duration-300"
                style={{
                    top: step.position === 'bottom' ? anchorRect.bottom + 24 : step.position === 'top' ? 'auto' : anchorRect.top,
                    bottom: step.position === 'top' ? (window.innerHeight - anchorRect.top) + 24 : 'auto',
                    left: step.position === 'right' ? anchorRect.right + 24 : step.position === 'left' ? 'auto' : anchorRect.left,
                    right: step.position === 'left' ? (window.innerWidth - anchorRect.left) + 24 : 'auto',
                }}
            >
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-primary">
                        Step {currentStep + 1} of {steps.length}
                    </span>
                    <button
                        onClick={skipWalkthrough}
                        className="text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                    >
                        Skip
                    </button>
                </div>

                <h3 className="text-xl font-serif mb-2">{step.title}</h3>
                <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-6">
                    {step.content}
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={nextStep}
                        className="bg-primary hover:bg-red-700 text-white font-bold uppercase text-[10px] tracking-widest px-6 py-3 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        {currentStep === steps.length - 1 ? 'Finish' : 'Got it'}
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>

                {/* Carrot/Arrow */}
                <div
                    className="absolute w-4 h-4 bg-white dark:bg-surface-dark border-l border-t border-stone-200 dark:border-stone-800 transform rotate-45"
                    style={{
                        top: step.position === 'bottom' ? -8 : 'auto',
                        bottom: step.position === 'top' ? -8 : 'auto',
                        left: step.position === 'right' ? -8 : 'auto',
                        right: step.position === 'left' ? -8 : 'auto',
                        marginLeft: step.position === 'bottom' || step.position === 'top' ? 20 : 0,
                        marginTop: step.position === 'left' || step.position === 'right' ? 20 : 0,
                    }}
                />
            </div>
        </div>,
        document.body
    );
}
