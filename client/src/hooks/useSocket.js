import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
export const useSocket = (namespace = '/rooms') => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io(`${SOCKET_URL}${namespace}`, { transports: ['websocket', 'polling'] });
    socketRef.current.on('connect', () => setIsConnected(true));
    socketRef.current.on('disconnect', () => setIsConnected(false));
    return () => socketRef.current?.disconnect();
  }, [namespace]);

  return {
    socket: socketRef.current,
    isConnected,
    emit: (event, data) => socketRef.current?.emit(event, data),
    on: (event, handler) => socketRef.current?.on(event, handler),
    off: (event, handler) => socketRef.current?.off(event, handler),
  };
};

