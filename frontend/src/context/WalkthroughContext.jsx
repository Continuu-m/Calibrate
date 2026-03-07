import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WalkthroughContext = createContext();

export const useWalkthrough = () => useContext(WalkthroughContext);

export const WalkthroughProvider = ({ children }) => {
    const { user, updatePreferences } = useAuth();
    const [active, setActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            target: 'sidebar',
            title: 'Welcome to Calibrate!',
            content: 'This sidebar helps you navigate between your Daily Dashboard, Weekly Planning, and Insights.',
            position: 'right'
        },
        {
            target: 'capacity-stats',
            title: 'Know Your Limits',
            content: 'The Capacity bar shows how much focus time you have left. We automatically account for context switching and meetings.',
            position: 'bottom'
        },
        {
            target: 'add-task',
            title: 'Add a Reality Check',
            content: 'Add your tasks here. Calibrate will break them down into realistic steps and estimate the actual time required.',
            position: 'bottom'
        },
        {
            target: 'task-list',
            title: 'Your Focus Queue',
            content: 'Track your progress here. Reflect on tasks when they′re done to help Calibrate learn your patterns.',
            position: 'top'
        },
        {
            target: 'redistribution-toggle',
            title: 'Avoid Burnout',
            content: 'On the weekly view, use this toggle to see AI-suggested redistributions when you overbook a specific day.',
            position: 'left'
        }
    ];

    useEffect(() => {
        // Trigger walkthrough if user is onboarded but hasn't completed the walkthrough
        if (user && user.preferences?.onboarded && !user.preferences?.walkthrough_completed) {
            setActive(true);
        }
    }, [user]);

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            finishWalkthrough();
        }
    };

    const skipWalkthrough = () => {
        finishWalkthrough();
    };

    const finishWalkthrough = async () => {
        setActive(false);
        try {
            await updatePreferences({ walkthrough_completed: true });
        } catch (error) {
            console.error('Failed to save walkthrough status:', error);
        }
    };

    return (
        <WalkthroughContext.Provider value={{
            active,
            currentStep,
            steps,
            nextStep,
            skipWalkthrough,
            finishWalkthrough
        }}>
            {children}
        </WalkthroughContext.Provider>
    );
};
