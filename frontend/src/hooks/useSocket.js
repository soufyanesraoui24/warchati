import { useContext, useCallback } from 'react';
import { SocketContext } from '../context/SocketContext';

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  const { socket, isConnected } = context;

  const emit = useCallback((event, data) => {
    if (socket) socket.emit(event, data);
  }, [socket]);

  const on = useCallback((event, handler) => {
    if (socket) socket.on(event, handler);
    return () => socket?.off(event, handler);
  }, [socket]);

  const off = useCallback((event, handler) => {
    if (socket) socket.off(event, handler);
  }, [socket]);

  return { socket, isConnected, emit, on, off };
}
