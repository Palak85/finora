import React, { useState, useEffect } from 'react'
import { Bell, CheckCircle2, Trash2, Filter, RefreshCw } from 'lucide-react'
import { notificationService } from '../services/api'
import { formatDate } from '../utils/formatters'
import { useNotification } from '../context/NotificationContext'

export const Notifications = () => {
  const { notifications, unreadCount, markAllAsRead, deleteNotification, refreshNotifications } = useNotification()
  const [filterType, setFilterType] = useState('ALL')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshNotifications()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'Salary':
        return '💰'
      case 'Transaction':
        return '💳'
      case 'Investment':
        return '📈'
      case 'Budget Alert':
        return '🚨'
      case 'Goal':
        return '🎯'
      case 'Security':
        return '🛡️'
      case 'Account':
        return '🏦'
      case 'Bill Reminder':
        return '📅'
      default:
        return '🔔'
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'ALL') return true
    if (filterType === 'UNREAD') return !n.is_read
    return n.notification_type === filterType
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">
              Live Activity & Audit Feed
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-[#A9A59A] mt-1">
            Real-time feed tracking transactions, security logins, budget thresholds, accounts & investments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            title="Refresh Feed"
            className="p-2.5 bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/40 text-[#A9A59A] hover:text-[#D4AF37] rounded-xl transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#D4AF37]' : ''}`} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#171714] border border-[#2B2A24] text-[#D4AF37] hover:bg-[#2B2A24] text-xs font-bold rounded-xl transition-all"
            >
              <CheckCircle2 className="w-4 h-4" /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        {['ALL', 'UNREAD', 'Transaction', 'Budget Alert', 'Security', 'Investment', 'Account', 'Goal'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterType(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
              filterType === cat
                ? 'bg-[#D4AF37] text-[#0B0B0A] font-bold shadow-md shadow-[#D4AF37]/20'
                : 'bg-[#171714] border border-[#2B2A24] text-[#A9A59A] hover:text-[#F5F1E6]'
            }`}
          >
            {cat === 'ALL' ? 'All Activities' : cat === 'UNREAD' ? `Unread (${unreadCount})` : cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl overflow-hidden divide-y divide-[#2B2A24]">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Bell className="w-8 h-8 text-[#A9A59A] mx-auto opacity-40" />
            <p className="text-sm font-semibold text-[#F5F1E6]">No notifications found</p>
            <p className="text-xs text-[#A9A59A]">Every transaction, account update or security login will appear here live.</p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                !n.is_read ? 'bg-[#D4AF37]/5 border-l-4 border-l-[#D4AF37]' : 'hover:bg-[#21201B]/40'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#0B0B0A] border border-[#2B2A24] flex items-center justify-center text-lg shrink-0 shadow-inner">
                  {getNotificationIcon(n.notification_type)}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-[#D4AF37] tracking-wide uppercase">
                      {n.notification_type}
                    </span>
                    <span className="text-[10px] text-[#A9A59A]">
                      {formatDate(n.created_at)} • {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-[#F5F1E6] truncate">{n.title}</h4>
                  <p className="text-xs text-[#A9A59A] leading-relaxed break-words">{n.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => deleteNotification(n.id)}
                  title="Delete notification"
                  className="p-2 text-[#A9A59A] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
