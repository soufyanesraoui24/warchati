import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header'; // Import new Header
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

import { cn } from '../utils.ts'; // Import cn

export function AppLayout({ children }) {
    const { alerts, dismissAlert } = useNotification();
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans antialiased" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            
            {/* Sidebar with mobile props */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content Wrapper - dynamically adjusted margin based on direction */}
            <main className={cn(
                "min-h-screen transition-all duration-300 flex flex-col",
                isRTL ? "md:mr-64" : "md:ml-64"
            )}>
                {/* Header (Desktop & Mobile) */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

                <div className="flex-1 pb-20 p-4 md:p-8">
                    {/* Global Alerts Feed */}
                    {alerts && alerts.length > 0 && (
                        <div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-3 mb-6 animate-in slide-in-from-top-2">
                            <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap custom-scrollbar">
                                <span className="font-bold text-xs text-orange-800 bg-orange-200 px-2 py-0.5 rounded-full shrink-0">{alerts.length} تنبيهات</span>
                                {alerts.map(alert => (
                                    <div key={alert.id} className="flex items-center gap-1 text-xs font-medium text-orange-700 bg-white/50 px-2 py-1 rounded border border-orange-100/50 group shrink-0">
                                        <alert.icon className="w-3 h-3" />
                                        <span>{alert.message}</span>
                                        <button
                                            onClick={() => dismissAlert(alert.id)}
                                            className="mx-1 text-orange-400 hover:text-orange-900 opacity-60 hover:opacity-100 transition-opacity"
                                            title="تجاهل"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="container mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}


