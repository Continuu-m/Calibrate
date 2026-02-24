import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [full_name, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(email, password, full_name);
            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } catch (err) {
            setError(err.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
            <div className="w-full max-w-md bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark p-8 shadow-sm space-y-6 relative overflow-hidden">
                {/* Decorative element matching the app style */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full blur-3xl"></div>

                <div className="text-center">
                    <h1 className="text-4xl text-primary font-serif flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-3xl">tune</span> Calibrate
                    </h1>
                    <p className="text-xs text-secondary mt-2 tracking-widest uppercase font-bold">Reality Checker</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-serif">Create Account</h2>
                    <p className="text-sm text-secondary">Start calibrating your tasks and time.</p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 text-xs border border-red-100 dark:border-red-900/40 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">error</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-secondary tracking-widest" htmlFor="full_name">Full Name</label>
                        <input
                            id="full_name"
                            type="text"
                            required
                            className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 focus:border-primary outline-none transition-colors text-sm"
                            placeholder="John Doe"
                            value={full_name}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-secondary tracking-widest" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 focus:border-primary outline-none transition-colors text-sm"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-secondary tracking-widest" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            required
                            className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 focus:border-primary outline-none transition-colors text-sm"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 py-3 text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-90 disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div className="text-center pt-2">
                    <p className="text-xs text-stone-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-bold hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
