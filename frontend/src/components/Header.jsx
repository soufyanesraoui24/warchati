import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import LanguageSwitcher from './LanguageSwitcher';
import { Bell, Search, Menu, LogOut } from 'lucide-react';

export function Header({ onMenuClick }) {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const { alerts } = useNotification();

    return (
        <header className="h-16 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-md">

            {/* Left: Mobile Menu & Search */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="hidden md:flex items-center bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 w-64 focus-within:ring-2 ring-primary/50 transition-all">
                    <Search className="w-4 h-4 text-slate-400 ml-2" />
                    <input
                        type="text"
                        placeholder={t('search')}
                        className="bg-transparent border-none focus:ring-0 text-sm w-full p-0 text-white placeholder-slate-500"
                    />
                </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-2 md:gap-4">
                <LanguageSwitcher className="hidden md:flex bg-slate-800 text-white border border-slate-700 rounded-lg px-2 py-1" />

                {/* Notifications */}
                <button className="relative p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors">
                    <Bell className="w-5 h-5" />
                    {alerts.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
                    )}
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-2 border-r border-slate-800 pr-4">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-white leading-none">{user?.username || user?.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">{user?.role}</p>
                    </div>
                    <div className="w-9 h-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold border-2 border-slate-700 shadow-sm">
                        {user?.avatar || user?.name?.charAt(0)}
                    </div>

                    <button
                        onClick={logout}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors ml-2"
                        title={t('logout')}
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
