import React, { useState, useEffect } from 'react'
import { Bell, CheckCircle2, Trash2 } from 'lucide-react'
import { notificationService } from '../services/api'
import { formatDate } from '../utils/formatters'

export const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifs = async () => {
    setLoading(true)
    try {
      const res = await notificationService.getNotifications()
      if (res.data?.success) setNotifications(res.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifs()
  }, [])

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead()
    fetchNotifs()
  }

  const handleDelete = async (id) => {
    await notificationService.deleteNotification(id)
    fetchNotifs()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#2B2A24] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">System Alerts & Notifications</h1>
          <p className="text-xs text-[#A9A59A] mt-1">Audit trail of security, budget and transaction alerts</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#171714] border border-[#2B2A24] text-[#D4AF37] text-xs font-bold rounded-xl"
        >
          <CheckCircle2 className="w-4 h-4" /> Mark All Read
        </button>
      </div>

      <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl overflow-hidden divide-y divide-[#2B2A24]">
        {notifications.map((n) => (
          <div key={n.id} className="p-5 flex items-start justify-between hover:bg-[#21201B]/50 transition-all">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#D4AF37]">{n.notification_type}</span>
                <span className="text-[10px] text-[#A9A59A]">{formatDate(n.created_at)}</span>
              </div>
              <h4 className="text-sm font-bold text-[#F5F1E6]">{n.title}</h4>
              <p className="text-xs text-[#A9A59A] leading-relaxed">{n.message}</p>
            </div>

            <button onClick={() => handleDelete(n.id)} className="p-1.5 text-[#A9A59A] hover:text-red-400">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
