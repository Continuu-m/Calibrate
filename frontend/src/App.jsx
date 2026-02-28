import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import DailyDashboard from './pages/DailyDashboard'
import WeeklyCapacity from './pages/WeeklyCapacity'
import Completed from './pages/Completed'
import Insights from './pages/Insights'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'
import { AuthProvider, useAuth } from './context/AuthContext'

function ProtectedRoute({ children }) {
    const { token, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="text-secondary tracking-widest uppercase text-xs font-bold animate-pulse">Calibrating...</div>
            </div>
        );
    }

    if (!token || (!user && !loading)) {
        return <Navigate to="/login" />;
    }

    // New logic: if logged in but not onboarded, force them to onboarding
    if (user && !user.preferences?.onboarded) {
        return <Navigate to="/onboarding" />;
    }

    return children;
}

function OnboardingRoute({ children }) {
    const { token, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="text-secondary tracking-widest uppercase text-xs font-bold animate-pulse">Calibrating...</div>
            </div>
        );
    }

    if (!token) return <Navigate to="/login" />;

    if (user && user.preferences?.onboarded) {
        return <Navigate to="/" />; // Already onboarded
    }

    return children;
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-background-light dark:bg-background-dark text-stone-900 dark:text-stone-100 flex flex-col relative">
                    <div className="paper-texture"></div>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/onboarding" element={
                            <OnboardingRoute>
                                <Onboarding />
                            </OnboardingRoute>
                        } />

                        <Route path="/" element={
                            <ProtectedRoute>
                                <DailyDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/weekly" element={
                            <ProtectedRoute>
                                <WeeklyCapacity />
                            </ProtectedRoute>
                        } />
                        <Route path="/completed" element={
                            <ProtectedRoute>
                                <Completed />
                            </ProtectedRoute>
                        } />
                        <Route path="/insights" element={
                            <ProtectedRoute>
                                <Insights />
                            </ProtectedRoute>
                        } />
                        <Route path="/settings" element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    )
}

export default App
