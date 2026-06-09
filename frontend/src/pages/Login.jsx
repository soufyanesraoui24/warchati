import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Chrome, Loader2 } from 'lucide-react';

export default function Login() {
    const [searchParams] = useSearchParams();
    const { login: authLogin, mockLogin: authMockLogin, MOCK_USERS } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('access_token', token);
            const userParam = searchParams.get('user');
            if (userParam) {
                try { localStorage.setItem('user', decodeURIComponent(userParam)); } catch {}
            }
            if (window.opener) {
                window.opener.postMessage({ type: 'GOOGLE_LOGIN', token, user: userParam }, '*');
                window.close();
            } else {
                window.location.href = '/';
            }
        }
        const errorParam = searchParams.get('error');
        if (errorParam === 'google_failed') {
            setError('Google login failed. Please try again.');
        }
    }, [searchParams]);

    useEffect(() => {
        const handleGoogleMessage = (e) => {
            if (e.data?.type === 'GOOGLE_LOGIN' && e.data?.token) {
                localStorage.setItem('access_token', e.data.token);
                if (e.data?.user) {
                    try { localStorage.setItem('user', decodeURIComponent(e.data.user)); } catch {}
                }
                window.location.reload();
            }
        };
        window.addEventListener('message', handleGoogleMessage);
        return () => window.removeEventListener('message', handleGoogleMessage);
    }, []);

    const handleManualLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const result = await authLogin(form.email, form.password);
            if (result) navigate('/');
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Login failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleLogin = () => {
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
        window.open(url, 'google-login', 'width=600,height=700,menubar=no,toolbar=no,location=yes,status=yes');
    };

    const handleMockLogin = async (userId) => {
        await authMockLogin(userId);
        const user = MOCK_USERS.find(u => u.id === userId);
        if (user?.role === 'CLIENT') {
            navigate('/portal');
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-6">
                <div className="text-center">
                    <img src="/imgs/ai_social_mind.png" alt="ai-SocilaMind" className="h-16 mx-auto mb-2" />
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                        ai-SocilaMind
                    </h1>
                    <p className="text-muted-foreground">Smart Messaging Platform</p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-600 dark:text-red-400 text-center">
                        {error}
                    </div>
                )}

                <p className="text-center text-muted-foreground text-sm">تسجيل الدخول للوحة التحكم</p>

                {/* Login Form */}
                <form onSubmit={handleManualLogin} className="space-y-4 bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <div className="relative">
                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                                placeholder="Email"
                                className="w-full bg-background border border-border rounded-xl pr-10 pl-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                                placeholder="Password"
                                className="w-full bg-background border border-border rounded-xl pr-10 pl-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <button
                            type="submit" disabled={submitting}
                            className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Sign In
                        </button>
                    </form>



                {/* Divider */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <div className="flex-1 h-px bg-border" />
                </div>

                {/* Google Login */}
                <button
                    onClick={handleGoogleLogin}
                    className="w-full bg-card border border-border rounded-xl py-3 font-bold text-sm hover:bg-secondary/50 transition-colors flex items-center justify-center gap-3"
                >
                    <Chrome className="w-5 h-5" />
                    Continue with Google
                </button>

                {/* Mock Users (Dev Mode) */}
                <div className="bg-card/50 border border-border rounded-2xl p-5">
                    <p className="text-xs text-muted-foreground text-center mb-3 font-medium uppercase tracking-wider">
                        Quick Access (Demo)
                    </p>
                    <div className="grid gap-2">
                        {MOCK_USERS.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => handleMockLogin(user.id)}
                                className="bg-card hover:bg-secondary/50 border border-border p-3 rounded-xl flex items-center gap-3 transition-all group text-right"
                            >
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold group-hover:scale-110 transition-transform">
                                    {user.avatar}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-sm">{user.name}</h3>
                                    <p className="text-xs text-muted-foreground">{user.role}</p>
                                </div>
                                <UserCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
