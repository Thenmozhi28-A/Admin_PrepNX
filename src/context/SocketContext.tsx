import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/constants';
import { useDispatch } from 'react-redux';
import { setOnlineUsers, setUserStatus } from '../store/slices/onlineStatusSlice';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isUserActive: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  isUserActive: false
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isUserActive, setIsUserActive] = useState(true);
  const dispatch = useDispatch();
  const { token } = useAuth();
  const timeoutRef = useRef<any>(null);
  const activeStateRef = useRef<boolean>(true);

  // Connection Management
  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const socket = io(SOCKET_URL, {
      query: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
      // Notify active status based on current ref state
      socket.emit('status_update', { isOnline: activeStateRef.current });
    });

    socket.on('online_users', (userIds: string[]) => {
      dispatch(setOnlineUsers(userIds));
    });

    socket.on('user_status_change', (data: { userId: string; isOnline: boolean }) => {
      dispatch(setUserStatus(data));
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [token, dispatch]);

  // Updated Inactivity Management
  useEffect(() => {
    const handleActivity = () => {
      // If we were inactive, switch to active
      if (!activeStateRef.current) {
        activeStateRef.current = true;
        setIsUserActive(true);
        if (socketRef.current?.connected) {
          socketRef.current.emit('status_update', { isOnline: true });
        }
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        activeStateRef.current = false;
        setIsUserActive(false);
        if (socketRef.current?.connected) {
          socketRef.current.emit('status_update', { isOnline: false });
        }
      }, 3000); // 3 seconds timeout
    };

    // Attach listeners once
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    // Initial timeout start
    handleActivity();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []); // Empty dependency array to prevent infinite loop

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, isUserActive }}>
      {children}
    </SocketContext.Provider>
  );
};
