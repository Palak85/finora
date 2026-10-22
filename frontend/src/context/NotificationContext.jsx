import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { notificationService } from '../services/api'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [latestToast, setLatestToast] = useState(null)
  const previousIdsRef = useRef(new Set())
  const isFirstLoadRef = useRef(true)

  const fetchNotifications = async (isManual = false) => {
    if (!isAuthenticated) return
    try {
      const res = await notificationService.getNotifications()
      if (res.data?.success) {
        const fetched = res.data.data || []
        const currentUnread = res.data.unread_count || fetched.filter(n => !n.is_read).length

        // Check for newly arrived notifications to trigger real-time toast
        if (!isFirstLoadRef.current && !isManual) {
          const newItems = fetched.filter(n => !previousIdsRef.current.has(n.id) && !n.is_read)
          if (newItems.length > 0) {
            setLatestToast(newItems[0])
            // Auto dismiss toast after 5s
            setTimeout(() => setLatestToast(null), 5000)
          }
        }

        previousIdsRef.current = new Set(fetched.map(n => n.id))
        isFirstLoadRef.current = false
        setNotifications(fetched)
        setUnreadCount(currentUnread)
      }
    } catch (e) {
      // Ignore network errors during background polling
    }
  }

  // Live background polling every 6 seconds + on window focus
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([])
      setUnreadCount(0)
      isFirstLoadRef.current = true
      return
    }

    fetchNotifications()

    const interval = setInterval(() => {
      fetchNotifications()
    }, 6000)

    const handleFocus = () => fetchNotifications()
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [isAuthenticated])

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (e) {
      console.error(e)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (e) {
      console.error(e)
    }
  }

  const deleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        latestToast,
        dismissToast: () => setLatestToast(null),
        refreshNotifications: () => fetchNotifications(true),
        markAsRead,
        markAllAsRead,
        deleteNotification
      }}
    >
      {children}
      {/* Real-time floating alert toast */}
      {latestToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#171714] border-2 border-[#D4AF37] rounded-2xl p-4 shadow-2xl animate-bounce flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
            🔔
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase text-[#D4AF37] tracking-wider">
              Real-Time Alert • {latestToast.notification_type}
            </span>
            <h4 className="text-xs font-bold text-[#F5F1E6] mt-0.5">{latestToast.title}</h4>
            <p className="text-[11px] text-[#A9A59A] mt-1 line-clamp-2">{latestToast.message}</p>
          </div>
          <button
            onClick={() => setLatestToast(null)}
            className="text-[#A9A59A] hover:text-[#F5F1E6] text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}
