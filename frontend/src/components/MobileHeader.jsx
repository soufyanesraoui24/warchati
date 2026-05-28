import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';

export function MobileHeader({ onMenuClick }) {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-40 flex items-center justify-between px-4 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
                <button
                    onClick={onMenuClick}
                    className="p-2 -mr-2 text-foreground hover:bg-secondary rounded-lg"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20 mr-2">
                    {user.avatar || user.name.charAt(0)}
                </div>
                <div>
                    <h1 className="text-sm font-bold leading-none">{user.name.split(' ')[0]}</h1>
                    <span className="text-[10px] text-muted-foreground">{user.role === 'OWNER' ? 'المالك' : user.role === 'MANAGER' ? 'شاف الورشة' : 'عامل'}</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:block">
                    ورشتي
                </h2>
                <button
                    onClick={() => {
                        if (window.confirm('تسجيل خروج؟')) logout();
                    }}
                    className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}
