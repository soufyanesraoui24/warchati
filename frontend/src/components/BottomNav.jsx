import React from 'react';
import { NAV_ITEMS } from '../nav.js';
import { cn } from '../utils.ts';

export function BottomNav() {
    const currentPath = window.location.pathname;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-lg border-t border-border z-50 flex items-center justify-around px-2 pb-safe">
            {NAV_ITEMS.map((item) => {
                const isActive = currentPath === item.path;
                return (
                    <a
                        key={item.path}
                        href={item.path}
                        className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200",
                            isActive ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <div className={cn(
                            "p-1.5 rounded-full transition-all",
                            isActive ? "bg-primary/10" : "bg-transparent"
                        )}>
                            <item.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
                    </a>
                );
            })}
        </nav>
    );
}
