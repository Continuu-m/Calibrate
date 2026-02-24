import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DailyDashboard from './pages/DailyDashboard'
import WeeklyCapacity from './pages/WeeklyCapacity'
import Completed from './pages/Completed'
import Insights from './pages/Insights'
import Settings from './pages/Settings'

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-background-light dark:bg-background-dark text-stone-900 dark:text-stone-100 flex flex-col relative">
                <div className="paper-texture"></div>
                <Routes>
                    <Route path="/" element={<DailyDashboard />} />
                    <Route path="/weekly" element={<WeeklyCapacity />} />
                    <Route path="/completed" element={<Completed />} />
                    <Route path="/insights" element={<Insights />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App
