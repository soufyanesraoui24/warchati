// NotificationContext only manages state. 
// We will create a separate component to trigger the checks to avoid circular dependencies.

import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export function useNotification() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [alerts, setAlerts] = useState([]); // Persistent alerts (Low Stock, Debt)

    const addNotification = React.useCallback((message, type = 'info') => { // Toast style
        const id = Date.now();
        setNotifications(prev => [{ id, message, type, isRead: false }, ...prev]);
        setTimeout(() => removeNotification(id), 5000);
    }, []);

    const removeNotification = React.useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const [dismissedIds, setDismissedIds] = useState(() => {
        try { return JSON.parse(localStorage.getItem('dismissedAlerts') || '[]'); } catch { return []; }
    });

    const dismissAlert = (id) => {
        setDismissedIds(prev => {
            const next = [...prev, id];
            localStorage.setItem('dismissedAlerts', JSON.stringify(next));
            return next;
        });
        // Immediate UI update
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    // For persistent dashboard alerts
    const setPersistentAlerts = React.useCallback((newAlerts) => {
        setAlerts(prev => {
            // Simple deep compare to avoid unnecessary re-renders loop
            if (JSON.stringify(prev) === JSON.stringify(newAlerts)) return prev;
            return newAlerts;
        });
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, alerts, setPersistentAlerts, dismissAlert, dismissedIds }}>
            {children}
        </NotificationContext.Provider>
    );
}
