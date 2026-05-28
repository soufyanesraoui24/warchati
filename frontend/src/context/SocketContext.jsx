import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        // لا نتصل إلا إذا كان المستخدم مسجلاً
        if (!user) return;

        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });

        newSocket.on('connect', () => {
            console.log('[Socket.IO] ✅ متصل بالخادم');
            setIsConnected(true);
            // الانضمام تلقائياً لغرفة المراقبة
            newSocket.emit('join_monitor');
        });

        newSocket.on('disconnect', () => {
            console.log('[Socket.IO] ❌ انقطع الاتصال');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.error('[Socket.IO] خطأ في الاتصال:', err.message);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
