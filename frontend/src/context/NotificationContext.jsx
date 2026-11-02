import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';
import { getSocket } from '../services/socket';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeToast, setActiveToast] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err.message);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time socket event listener
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Trigger floating live toast
      setActiveToast({
        id: notification._id || Date.now(),
        title: notification.title,
        message: notification.message,
        type: notification.type,
      });

      // Auto dismiss toast after 6 seconds
      setTimeout(() => {
        setActiveToast(null);
      }, 6000);
    };

    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [isAuthenticated, user]);

  const markAsRead = async (id) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await api.put('/notifications/read-all');
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all read:', err.message);
    }
  };

  const dismissToast = () => setActiveToast(null);

  const value = {
    notifications,
    unreadCount,
    activeToast,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    dismissToast,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Real-time Toast Component Displayed Globally */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-white border border-indigo-200 rounded-xl shadow-2xl p-4 flex items-start space-x-3 animate-bounce">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
            🎯
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-900">{activeToast.title}</h4>
            <p className="text-xs text-slate-600 mt-1">{activeToast.message}</p>
          </div>
          <button
            onClick={dismissToast}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm"
          >
            ×
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
