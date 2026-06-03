import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Changed to Link and useLocation
import { NAV_ITEMS } from '../nav.js';
import { cn } from '../utils.ts';
import { useAuth, ROLES } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { LogOut, Bot, Truck } from 'lucide-react';

export function Sidebar({ isOpen, onClose }) { // props added
    const { pathname } = useLocation();
    const { user, logout } = useAuth();
    const { language, t } = useLanguage();
    const isRTL = language === 'ar';

    if (!user) return null;

    // Assuming NAV_ITEMS is an array defined in '../../config/nav'
    // ... (comments kept theoretically, but removing for brevity in replacement)

    const filteredNavItems = NAV_ITEMS.filter(item =>
        item.allowedRoles.includes(user.role)
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed top-0 h-screen bg-card z-50 transition-transform duration-300 w-64 flex flex-col shadow-2xl md:shadow-none",
                // Directional Positioning
                isRTL ? "right-0 border-l border-border" : "left-0 border-r border-border",
                // Mobile Slide Logic (md:translate-x-0 is always reset for desktop)
                "md:translate-x-0",
                isOpen
                    ? "translate-x-0"
                    : (isRTL ? "translate-x-full" : "-translate-x-full")
            )}>
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src="/imgs/ai_social_mind.png" alt="ai-SocilaMind" className="h-10 w-10 rounded-lg object-cover" />
                        <div>
                            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                {t('brandName')}
                            </h1>
                            <p className="text-xs text-muted-foreground">{t('brandSubtitle')}</p>
                        </div>
                    </div>
                    {/* Close Button for Mobile */}
                    <button onClick={onClose} className="md:hidden text-muted-foreground hover:text-foreground">
                        <LogOut className="w-5 h-5 rotate-180" /> {/* Reusing Icon or X */}
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Render Groups */}
                    {[
                        { id: 'main', label: null },
                        { id: 'sales', label: 'المبيعات والطلبات' },
                        { id: 'marketing', label: 'التسويق' },
                        { id: 'settings', label: 'الإعدادات' }
                    ].map(group => {
                        const groupItems = filteredNavItems.filter(item => item.category === group.id || (!item.category && group.id === 'main'));
                        if (groupItems.length === 0) return null;

                        return (
                            <div key={group.id} className="space-y-1">
                                {group.label && (
                                    <h3 className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        {group.label}
                                    </h3>
                                )}
                                {groupItems.map((item) => {
                                    const isActive = pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => onClose && onClose()}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium",
                                                isActive
                                                    ? "bg-primary/10 text-primary font-bold shadow-sm"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border mt-auto">
                    <p className="text-xs text-center text-muted-foreground opacity-50">v1.0.0</p>
                </div>
            </aside>
        </>
    );
}
