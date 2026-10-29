import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { notificationService } from '../services/api'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

// Subtle Web Audio Chime synthesizer for live alert popups
const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    const audioCtx = new AudioContextClass()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime) // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12) // A5
    
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35)

    osc.connect(gain)
    gain.connect(audioCtx.destination)

    osc.start()
    osc.stop(audioCtx.currentTime + 0.35)
  } catch (e) {
    // Audio autoplay restrictions before first user gesture
  }
}

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
        const currentUnread = res.data.unread_count ?? fetched.filter(n => !n.is_read).length

        // Check for newly arrived notifications to trigger real-time toast
        if (!isFirstLoadRef.current && !isManual) {
          const newItems = fetched.filter(n => !previousIdsRef.current.has(n.id) && !n.is_read)
          if (newItems.length > 0) {
            setLatestToast(newItems[0])
            playNotificationChime()
            // Auto dismiss toast after 6s
            setTimeout(() => {
              setLatestToast(current => (current?.id === newItems[0].id ? null : current))
            }, 6000)
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

  // Live background polling every 3.5 seconds + on window focus
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
    }, 3500)

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
      if (latestToast?.id === id) {
        setLatestToast(null)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
      setLatestToast(null)
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

      {/* Live Activity Floating Alert Toast */}
      {latestToast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#171714]/95 backdrop-blur-md border border-[#D4AF37]/80 rounded-2xl p-4 shadow-2xl shadow-[#D4AF37]/15 transition-all duration-300 ease-out"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center shrink-0 text-base shadow-sm">
              {getNotificationIcon(latestToast.notification_type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase text-[#D4AF37] tracking-wider truncate">
                  Live Activity • {latestToast.notification_type}
                </span>
                <span className="text-[9px] text-[#A9A59A] shrink-0">Just now</span>
              </div>
              <h4 className="text-xs font-bold text-[#F5F1E6] mt-0.5 truncate">{latestToast.title}</h4>
              <p className="text-[11px] text-[#A9A59A] mt-1 leading-snug line-clamp-2">
                {latestToast.message}
              </p>
              <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-[#2B2A24]">
                <button
                  type="button"
                  onClick={() => markAsRead(latestToast.id)}
                  className="text-[10px] font-bold text-[#D4AF37] hover:underline"
                >
                  Mark as read
                </button>
                <a
                  href="/notifications"
                  className="text-[10px] font-semibold text-[#A9A59A] hover:text-[#F5F1E6]"
                >
                  View audit ledger →
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLatestToast(null)}
              className="text-[#A9A59A] hover:text-[#F5F1E6] text-xs font-bold p-1 rounded-lg hover:bg-[#2B2A24] transition-colors"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </aside>
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
