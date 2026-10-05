import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Search, User, Shield, LogOut, Sparkles, ChevronDown, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { notificationService } from '../services/api'

export const Header = ({ onOpenQuickAdd }) => {
  const { user, logout } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  const fetchNotifs = async () => {
    try {
      const res = await notificationService.getNotifications()
      if (res.data?.success) {
        setNotifications(res.data.data)
        setUnreadCount(res.data.unread_count || 0)
      }
    } catch (e) {
      // Ignore
    }
  }

  useEffect(() => {
    fetchNotifs()
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead()
      fetchNotifs()
    } catch (e) {}
  }

  return (
    <header className="sticky top-0 z-20 bg-[#171714]/90 backdrop-blur-md border-b border-[#2B2A24] px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#A9A59A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search accounts, transactions, investments..."
            className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs lg:text-sm text-[#F5F1E6] placeholder-[#A9A59A] rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-[#D4AF37] transition-all"
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Quick Action Button */}
        <button
          onClick={onOpenQuickAdd}
          className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4" /> Quick Action
        </button>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setNotifDrawerOpen(!notifDrawerOpen)}
            className="p-2.5 rounded-xl bg-[#0B0B0A] border border-[#2B2A24] text-[#A9A59A] hover:text-[#D4AF37] hover:border-[#D4AF37]/40 relative transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D4AF37] text-[#0B0B0A] font-extrabold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {notifDrawerOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#171714] border border-[#2B2A24] rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="p-4 border-b border-[#2B2A24] flex items-center justify-between bg-[#0B0B0A]">
                <h3 className="text-sm font-bold text-[#F5F1E6] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#D4AF37]" /> Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#2B2A24]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#A9A59A]">No recent notifications.</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 text-xs transition-colors ${
                        !n.is_read ? 'bg-[#D4AF37]/5 border-l-2 border-[#D4AF37]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-[#D4AF37]">{n.notification_type}</span>
                        <span className="text-[10px] text-[#A9A59A]">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="font-medium text-[#F5F1E6] mb-0.5">{n.title}</p>
                      <p className="text-[#A9A59A] text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 text-center border-t border-[#2B2A24] bg-[#0B0B0A]">
                <Link
                  to="/notifications"
                  onClick={() => setNotifDrawerOpen(false)}
                  className="text-xs font-semibold text-[#D4AF37] hover:underline"
                >
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl bg-[#0B0B0A] border border-[#2B2A24] hover:border-[#D4AF37]/40 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center font-bold text-xs text-[#D4AF37]">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-[#F5F1E6] leading-tight truncate max-w-[110px]">
                {user?.full_name || 'Finora User'}
              </p>
              <p className="text-[10px] text-[#D4AF37] font-semibold">{user?.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#A9A59A]" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-[#171714] border border-[#2B2A24] rounded-2xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-[#2B2A24]">
                <p className="text-xs font-bold text-[#F5F1E6] truncate">{user?.full_name}</p>
                <p className="text-[11px] text-[#A9A59A] truncate">{user?.email}</p>
              </div>

              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#A9A59A] hover:text-[#F5F1E6] hover:bg-[#21201B]"
              >
                <User className="w-4 h-4 text-[#D4AF37]" /> Account Profile
              </Link>
              <Link
                to="/financial-health"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#A9A59A] hover:text-[#F5F1E6] hover:bg-[#21201B]"
              >
                <Shield className="w-4 h-4 text-[#D4AF37]" /> Financial Health & Security
              </Link>

              <div className="border-t border-[#2B2A24] mt-1 pt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 text-left font-semibold"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
