import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Check,
  ExternalLink,
  Trash2,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import useNotifications from '../hooks/useNotifications';

const NotificationPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const navigate = useNavigate();

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Notification Inbox
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time price drop notifications, target met milestones and updates
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filter === 'unread'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="font-bold text-sm text-slate-700">No notifications in this view</h3>
            <p className="text-xs text-slate-400">
              When product prices update or hit your target, you'll see alerts here in real time.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-2xl border p-4 shadow-sm transition-all flex items-start justify-between gap-4 ${
                !item.isRead ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start space-x-3.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${
                    item.type === 'target_reached' ? 'bg-emerald-100' : 'bg-indigo-100'
                  }`}
                >
                  {item.type === 'target_reached' ? '🎯' : '📉'}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">{item.title}</h4>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                {item.data?.productId && (
                  <button
                    onClick={() => {
                      markAsRead(item._id);
                      navigate(`/compare/${item.data.productId}`);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <span>View Deal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                {!item.isRead && (
                  <button
                    onClick={() => markAsRead(item._id)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
